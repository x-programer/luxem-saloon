"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { syncBookingToGoogle } from "./calendar-sync";

interface BookingData {
    vendorId: string;
    customerId: string;
    customerEmail: string | null;
    customerName: string;
    customerPhone: string;
    serviceId: string;
    serviceName: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    price: number;
}

export async function createBooking(data: BookingData) {
    try {
        const { date, time, vendorId, customerId, customerPhone } = data;

        // 1. Parse Date & Time
        const appointmentDate = new Date(`${date}T${time}`);
        const now = new Date();

        // 2. Server-Side Validation: Prevent Past Bookings
        if (appointmentDate < now) {
            throw new Error("Cannot book appointments in the past.");
        }

        // 3. Force Status & Add Metadata
        const startTimestamp = Timestamp.fromDate(appointmentDate);

        // --- 🔒 COLLISION CHECK (Start) ---
        // Query for ANY existing booking at this exact time
        const collisionQuery = await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .where('date', '==', startTimestamp) // Exact timestamp match
            .where('status', 'in', ['confirmed', 'pending']) // Only block if active
            .get();

        if (!collisionQuery.empty) {
            throw new Error("This time slot was just taken. Please try another time.");
        }
        // --- 🔒 COLLISION CHECK (End) ---

        const bookingPayload = {
            ...data,
            date: startTimestamp, // Use the same timestamp we checked
            status: 'pending', // Force status
            createdAt: Timestamp.now(),
        };

        // 4. Update User Profile with Phone Number (if missing)
        // We do this in parallel to not block the main booking flow too much, 
        // but we await it to ensure consistency if vital.
        if (customerId && customerPhone) {
            try {
                const userRef = adminDb.collection('users').doc(customerId);
                await userRef.set({ phoneNumber: customerPhone }, { merge: true });
            } catch (err) {
                console.warn("Failed to update user phone number:", err);
                // Don't fail the booking if profile update fails
            }
        }

        // 5. Save to Firestore (Admin SDK bypasses client rules)
        // This is the CRITICAL step. If this succeeds, the booking is "Done".
        const docRef = await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .add(bookingPayload);

        // 6. Attempt Google Calendar Sync (Non-Blocking / Resilient)
        // We race against a timeout so the UI doesn't hang.
        try {
            const SYNC_TIMEOUT_MS = 8000;
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Calendar sync timed out")), SYNC_TIMEOUT_MS)
            );

            // We await the race to try and confirm status, but catch ALL errors
            // so they don't propagate to the client as a 500.
            await Promise.race([
                syncBookingToGoogle(docRef.id),
                timeoutPromise
            ]);

        } catch (syncError) {
            // Log warning but DO NOT fail the request
            console.warn("Non-fatal error: Google Calendar sync failed/skipped.", syncError);
        }

        return { success: true, id: docRef.id };

    } catch (error: any) {
        console.error("Booking Error:", error);
        throw new Error(error.message || "Failed to create booking.");

    }
}

export async function acceptBooking(bookingId: string, vendorId: string) {
    try {
        // 1. Update Status to Confirmed
        await adminDb
            .collection('users')
            .doc(vendorId)
            .collection('appointments')
            .doc(bookingId)
            .update({ status: 'confirmed' });

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

        return { success: true };
    } catch (error: any) {
        console.error("Error cancelling booking:", error);
        throw new Error(error.message || "Failed to cancel booking");
    }
}
