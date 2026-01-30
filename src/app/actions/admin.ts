"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

interface BroadcastResult {
    success: boolean;
    count: number;
    error?: string;
}

export async function sendBroadcastAlert(
    title: string,
    message: string,
    targetAudience: 'all' | 'vendor' | 'customer',
    type: 'info' | 'warning' | 'success'
): Promise<BroadcastResult> {
    try {
        console.log(`📢 Starting broadcast: "${title}" to ${targetAudience}`);

        // 1. Query Target Users
        let query: FirebaseFirestore.Query = adminDb.collection("users");

        if (targetAudience !== 'all') {
            query = query.where("role", "==", targetAudience);
        }

        // Optimization: Only select IDs to save bandwidth? 
        // Admin SDK might fetch whole doc anyway, but let's just get the refs effectively.
        const snapshot = await query.get();

        if (snapshot.empty) {
            return { success: true, count: 0 };
        }

        console.log(`Found ${snapshot.size} users. Starting batch writes...`);

        // 2. Batch Write Logic (Chunking by 500)
        const batches: Promise<FirebaseFirestore.WriteResult[]>[] = [];
        let batch = adminDb.batch();
        let opCount = 0;
        const MAX_OPS = 500;

        for (const userDoc of snapshot.docs) {
            // Create a reference to the new notification
            const notificationRef = userDoc.ref.collection("notifications").doc();

            batch.set(notificationRef, {
                title,
                message,
                type: 'system_alert', // Special type for icons
                severity: type,       // 'info', 'warning', 'success'
                read: false,
                createdAt: FieldValue.serverTimestamp()
            });

            opCount++;

            if (opCount >= MAX_OPS) {
                batches.push(batch.commit());
                batch = adminDb.batch();
                opCount = 0;
            }
        }

        if (opCount > 0) {
            batches.push(batch.commit());
        }

        await Promise.all(batches);

        console.log(`✅ Broadcast sent to ${snapshot.size} users.`);
        return { success: true, count: snapshot.size };

    } catch (error: any) {
        console.error("❌ Broadcast failed:", error);
        return { success: false, count: 0, error: error.message };
    }
}
