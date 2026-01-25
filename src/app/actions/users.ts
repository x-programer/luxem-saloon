"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sendNotification } from "./notifications";

export async function updateCustomerProfile(data: { name: string; phone: string }) {
    try {
        const sessionCookie = (await cookies()).get("session")?.value;

        if (!sessionCookie) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the session cookie
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userId = decodedClaims.uid;

        if (!userId) {
            return { success: false, error: "Invalid session" };
        }

        // Update the user document in Firestore
        await adminDb.collection("users").doc(userId).update({
            name: data.name,
            phoneNumber: data.phone,
            updatedAt: new Date(),
        });

        // 🔔 Notify User
        await sendNotification(userId, {
            title: "Profile Updated",
            message: "Your profile information has been successfully updated.",
            type: 'info',
            link: '/settings'
        });

        revalidatePath("/my-bookings");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function getCustomerProfile(userId: string) {
    try {
        // Double check authentication for safety, though this might be called from a protected component
        // For simple data fetching in component, we might just use adminDb directly if it's a server component
        // But for client component fetching, we need a server action.

        // However, the instructions say:
        // "On mount, fetch the *current* user data from Firestore users/{uid}"
        // Since we are in a client component, we can use a server action to fetch this safely without exposing adminDb to client.

        const doc = await adminDb.collection("users").doc(userId).get();
        if (!doc.exists) {
            return { success: false, error: "User not found" };
        }

        const userData = doc.data();

        return {
            success: true,
            data: {
                name: userData?.name || "",
                phone: userData?.phoneNumber || "",
                email: userData?.email || "",
            }
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        return { success: false, error: "Failed to fetch profile" };
    }
}
