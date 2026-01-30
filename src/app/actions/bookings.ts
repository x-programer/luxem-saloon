"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { syncBookingToGoogle } from "./calendar-sync";
import { sendNotification } from "./notifications";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // 👈 Added for cache mgmt

import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";

const bookingSchema = z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    customerId: z.string().min(1, "Customer ID is required"),
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email().nullable().optional(),
    customerPhone: z.string().min(10, "Invalid phone number"),
    serviceId: z.string().min(1, "Service ID is required"),
    serviceName: z.string().min(1, "Service Name is required"),
    duration: z.number().min(1, "Duration must be positive"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    price: z.number().min(0, "Price cannot be negative"),
    services: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        duration: z.number()
    })).optional()
});

export const createBooking = createSafeAction(bookingSchema, async (data) => {
    const { date, time, vendorId, customerId, customerPhone, customerName, serviceName } = data;

    // 0. 🛡️ GATEKEEPER: Check Vendor Status
    const vendorDoc = await adminDb.collection("users").doc(vendorId).get();
    const vendorStatus = vendorDoc.data()?.platformStatus; // Using platformStatus as defined in UserData

    if (vendorStatus === 'suspended' || vendorStatus === 'shadow_banned') {
        return { success: false, error: "This vendor is currently unavailable." };
    }

    // 1. Parse Date & Time
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();

    // 2. Server-Side Validation: Prevent Past Bookings
    if (appointmentDate < now) {
        return { success: false, error: "Cannot book appointments in the past." };
    }

    // 3. Force Status & Add Metadata
    const startTimestamp = Timestamp.fromDate(appointmentDate);
    const bookingId = adminDb.collection('bookings').doc().id; // Generate ID
    const createdAt = Timestamp.now();

    // --- 🔒 COLLISION CHECK (Start) ---
    // Query for ANY existing booking at this exact time (Vendor's Subcollection is truth)
    const collisionQuery = await adminDb
        .collection('users')
        .doc(vendorId)
        .collection('appointments')
        .where('date', '==', startTimestamp)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

    if (!collisionQuery.empty) {
        return { success: false, error: "This time slot was just taken. Please try another time." };
    }
    // --- 🔒 COLLISION CHECK (End) ---

    // Construct Payload (Shared across all writes)
    const bookingPayload = {
        ...data,
        id: bookingId, // Explicit ID
        date: startTimestamp,
        status: 'pending',
        createdAt: createdAt,
    };

    const batch = adminDb.batch();

    // A. Root Master (For Customer Queries & Global Analytics)
    const rootRef = adminDb.collection('bookings').doc(bookingId);
    batch.set(rootRef, bookingPayload);

    // B. Vendor Copy (For Vendor Dashboard)
    const vendorRef = adminDb
        .collection('users')
        .doc(vendorId)
        .collection('appointments')
        .doc(bookingId);
    batch.set(vendorRef, bookingPayload);

    // C. Customer Notification
    const customerNotifRef = adminDb
        .collection('users')
        .doc(customerId)
        .collection('notifications')
        .doc();
    batch.set(customerNotifRef, {
        type: 'success',
        title: 'Booking Sent',
        message: `Your request for ${serviceName} is pending approval.`,
        read: false,
        createdAt: createdAt,
        link: '/my-bookings'
    });

    // D. Vendor Notification
    const vendorNotifRef = adminDb
        .collection('users')
        .doc(vendorId)
        .collection('notifications')
        .doc();
    batch.set(vendorNotifRef, {
        type: 'info',
        title: 'New Appointment Request',
        message: `${customerName} booked ${serviceName} for ${data.date} at ${data.time}.`,
        read: false,
        createdAt: createdAt,
        link: '/dashboard/bookings'
    });

    // 4. Update User Profile with Phone Number (if missing)
    if (customerId && customerPhone) {
        const userRef = adminDb.collection('users').doc(customerId);
        batch.set(userRef, { phoneNumber: customerPhone }, { merge: true });
    }

    // 5. Commit Batch
    await batch.commit();

    // 6. Attempt Google Calendar Sync (Non-Blocking)
    try {
        const SYNC_TIMEOUT_MS = 8000;
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Calendar sync timed out")), SYNC_TIMEOUT_MS)
        );
        await Promise.race([
            syncBookingToGoogle(rootRef.id), // Sync using Root or Vendor Ref ID (same ID)
            timeoutPromise
        ]);
    } catch (syncError) {
        console.warn("Non-fatal error: Google Calendar sync failed/skipped.", syncError);
    }

    return { success: true, data: { id: bookingId } };
});

export async function acceptBooking(bookingId: string, vendorId: string) {
    try {
        // 1. Update Status to Confirmed
        await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .doc(bookingId)
            .update({ status: 'confirmed' });

        // 🔔 Notify Customer
        try {
            // Fetch booking details to get customer ID and Service Name
            const bookingRef = await adminDb
                .collection('users')
                .doc(vendorId)
                .collection('appointments')
                .doc(bookingId)
                .get();

            if (bookingRef.exists) {
                const bookingData = bookingRef.data();
                if (bookingData?.customerId) {
                    await sendNotification(bookingData.customerId, {
                        title: "Booking Confirmed! 🎉",
                        message: `Your appointment for ${bookingData.serviceName} has been confirmed.`,
                        type: 'success',
                        link: '/my-bookings'
                    });
                }
            }
        } catch (notifError) {
            console.warn("Failed to send notification:", notifError);
        }

        // 2. 🚀 TRIGGER GOOGLE SYNC (Server-Side)
        let syncResult = { success: false, error: "Unknown error" };

        try {
            // syncBookingToGoogle takes only bookingId and infers user from session
            const res = await syncBookingToGoogle(bookingId);
            syncResult = { success: true, error: "" };
            console.log("✅ Calendar Sync Successful");
        } catch (err: any) {
            console.warn("⚠️ Calendar Sync Skipped/Failed:", err.message);
            syncResult = { success: false, error: err.message };
        }

        return { success: true, sync: syncResult };

    } catch (error: any) {
        console.error("Accept Booking Error:", error);
        throw new Error("Failed to accept booking.");
    }
}

export async function getUserBookings(userId: string) {
    try {
        if (!userId) throw new Error("User ID is required");

        // using collectionGroup to find all appointments for this customer across all vendors
        const snapshot = await adminDb
            .collectionGroup('appointments')
            .where('customerId', '==', userId)
            .orderBy('date', 'desc')
            .get();

        const bookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamps to serializable dates for client components
                date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
                // Simplify date for sorting/display
                formattedDate: data.date instanceof Timestamp
                    ? data.date.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : "Invalid Date"
            };
        });

        return { success: true, bookings };
    } catch (error: any) {
        console.error("Error fetching user bookings:", error);
        return { success: false, error: error.message };
    }
}

export async function cancelBooking(bookingId: string, vendorId: string) {
    try {
        if (!bookingId || !vendorId) throw new Error("Missing Booking or Vendor ID");

        // We need vendorId to construct the path because appointments are subcollections
        await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .doc(bookingId)
            .update({ status: 'cancelled' });

        // 🔔 Notify Customer
        // Fetch to get customer ID
        const bookingRef = await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .doc(bookingId)
            .get();

        if (bookingRef.exists) {
            const bookingData = bookingRef.data();

            // Determine who is cancelling to notify the OTHER party
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get("session")?.value || "";
            let currentUserId = "";
            try {
                if (sessionCookie) {
                    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
                    currentUserId = decoded.uid;
                }
            } catch (e) {
                console.warn("Could not verify session for cancellation notification logic", e);
            }

            const isVendor = currentUserId === vendorId;
            // If Vendor blocked/cancelled -> Notify Customer
            // If Customer cancelled -> Notify Vendor
            const targetId = isVendor ? bookingData?.customerId : vendorId;
            const notificationTitle = isVendor ? "Appointment Cancelled by Vendor" : "Appointment Cancelled by Customer";

            if (targetId) {
                await sendNotification(targetId, {
                    title: notificationTitle,
                    message: `The appointment for ${bookingData?.serviceName || 'Service'} has been cancelled.`,
                    type: 'error',
                    link: isVendor ? '/my-bookings' : '/dashboard/bookings'
                });
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error cancelling booking:", error);
        throw new Error(error.message || "Failed to cancel booking");
    }
}

// 🆕 NEW: Generic Status Update (for any status change)
export async function updateBookingStatus(bookingId: string, status: string, vendorId: string) {
    try {
        if (!bookingId || !vendorId) throw new Error("Missing ID");

        await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .doc(bookingId)
            .update({ status });

        revalidatePath('/dashboard/bookings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating booking status:", error);
        throw new Error("Failed to update status");
    }
}
