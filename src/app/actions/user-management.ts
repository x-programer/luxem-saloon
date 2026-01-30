"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(uid: string, newStatus: string) {
    try {
        if (!uid || !newStatus) throw new Error("Missing arguments");

        await adminDb.collection("users").doc(uid).update({
            platformStatus: newStatus
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user status:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleUserVerification(uid: string, isVerified: boolean) {
    try {
        if (!uid) throw new Error("Missing UID");

        await adminDb.collection("users").doc(uid).update({
            isVerified: isVerified
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating verification:", error);
        return { success: false, error: error.message };
    }
}
