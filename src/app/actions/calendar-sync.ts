"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { google } from "googleapis";
import { cookies } from "next/headers";

// Initialize Google OAuth2 client (You typically need Client ID/Secret for purely server-side flow, 
// but passing tokens directly to the client instance works for making requests if you have valid tokens).
// Note: To refresh tokens, you MUST have Client ID and Secret configured.
// For this task, we assume the user might not have set env vars for ClientID/Secret yet, 
// so we'll try to just use the tokens. If tokens expire, it requires full server-side OAuth setup.
// We'll proceed with the provided token approach.

const getAuthClient = (accessToken: string, refreshToken?: string) => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI // Not strictly needed for just API calls if tokens are present
    );

    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return auth;
};

export async function saveCalendarTokens(tokens: { accessToken: string; refreshToken?: string }) {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decodedClaims.uid;

        // Store tokens in a private subcollection
        await adminDb.doc(`users/${uid}/secrets/calendar`).set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || null, // Only update if present, or keep existing? simple set for now
            updatedAt: new Date()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error saving tokens:", error);
        throw new Error("Failed to save calendar tokens");
    }
}

export async function syncBookingToGoogle(bookingId: string) {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error("Unauthorized");

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decodedClaims.uid;

        // 1. Get Tokens
        const tokenSnap = await adminDb.doc(`users/${uid}/secrets/calendar`).get();
        if (!tokenSnap.exists) {
            throw new Error("Calendar not connected");
        }
        const { accessToken, refreshToken } = tokenSnap.data() as { accessToken: string; refreshToken?: string };

        // 2. Get Booking Details
        const bookingSnap = await adminDb.doc(`users/${uid}/appointments/${bookingId}`).get();
        if (!bookingSnap.exists) {
            throw new Error("Booking not found");
        }
        const booking = bookingSnap.data();
        if (!booking) throw new Error("Booking data empty");

        // 3. Init Google Client
        const authClient = getAuthClient(accessToken, refreshToken);
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        // 4. Create Event Object
        // Convert Firestore Timestamp to Date
        const startDate = booking.date.toDate ? booking.date.toDate() : new Date(booking.date);
        // Default duration 1 hour if not specified
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

        const event = {
            summary: `Appointment with ${booking.customerName}`,
            description: `Service: ${booking.serviceName}\nPrice: $${booking.price}\nPhone: ${booking.customerPhone}`,
            start: {
                dateTime: startDate.toISOString(),
            },
            end: {
                dateTime: endDate.toISOString(),
            },
        };

        // 5. Insert Event
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        const googleEventId = response.data.id;

        // 6. Update Booking with Google Event ID
        await adminDb.doc(`users/${uid}/appointments/${bookingId}`).update({
            googleEventId: googleEventId,
            syncedToCalendar: true,
            lastSyncedAt: new Date()
        });

        return { success: true, googleEventId };

    } catch (error: any) {
        console.error("Sync Error:", error);
        // Important: Checking for invalid credentials to warn user
        if (error.code === 401 || error.message?.includes('invalid_grant')) {
            throw new Error("Google Calendar auth expired. Please reconnect.");
        }
        throw new Error(error.message || "Failed to sync to calendar");
    }
}
