"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Timestamp;
    link?: string;
}

export async function sendNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
) {
    try {
        if (!userId) throw new Error("User ID is required");

        await adminDb
            .collection('users')
            .doc(userId)
            .collection('notifications')
            .add({
                ...notification,
                read: false,
                createdAt: Timestamp.now(),
            });

        return { success: true };
    } catch (error: any) {
        console.error("Failed to send notification:", error);
        // We generally don't want to throw here to prevent blocking the main action (like booking)
        return { success: false, error: error.message };
    }
}
