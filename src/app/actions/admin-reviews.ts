"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export interface AdminReviewData {
    id: string;
    vendorId: string;
    vendorName?: string; // Might need to fetch separate or rely on if stored
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

// 1. Get All Reviews (Admin)
export async function getAllReviews() {
    try {
        // For a real scalable app, we'd paginate. For now, fetch latest 100.
        const snapshot = await adminDb.collection("reviews")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        // We might want to fetch Vendor Names efficiently here, but for now let's hope it's not strictly required 
        // or we can fetch them on the client side via a look-up map if needed.
        // Actually, let's fetch vendor details for better UX if possible, but that might be slow N+1.
        // Let's return raw data first.

        const reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            };
        }) as AdminReviewData[];

        // Fetch vendor names? 
        // To make the UI nice "Target: Vendor Name", we need vendor names.
        // Let's do a quick batch fetch or Promise.all if the set is small.
        // Optimization: Group by vendorId
        const vendorIds = Array.from(new Set(reviews.map(r => r.vendorId)));

        // NOTE: In a high-scale app, don't do this. 
        // Here, 100 reviews might have 10-20 vendors. It's okay.
        const vendorMap: Record<string, string> = {};
        if (vendorIds.length > 0) {
            // Firestore 'in' has limit of 10. Split or loop.
            // We'll just Promise.all getDoc for simplicity and robustness.
            await Promise.all(vendorIds.map(async (vid) => {
                const vSnap = await adminDb.collection("users").doc(vid).get();
                if (vSnap.exists) {
                    vendorMap[vid] = vSnap.data()?.businessName || "Unknown Vendor";
                }
            }));
        }

        const reviewsWithNames = reviews.map(r => ({
            ...r,
            vendorName: vendorMap[r.vendorId] || "Unknown"
        }));

        return { success: true, data: reviewsWithNames };
    } catch (error: any) {
        console.error("Error fetching admin reviews:", error);
        return { success: false, error: error.message };
    }
}

// 2. Admin Delete Review
export async function adminDeleteReview(reviewId: string, vendorId: string, ratingToRemove: number) {
    try {
        // 1. Delete the review document
        await adminDb.collection("reviews").doc(reviewId).delete();

        // 2. Recalculate Vendor Stats
        // Implementation copied & adapted from review-actions.ts for Admin context
        const vendorRef = adminDb.collection("users").doc(vendorId);

        // We use a Transaction to ensure safety
        await adminDb.runTransaction(async (t) => {
            const vendorDoc = await t.get(vendorRef);
            if (!vendorDoc.exists) return;

            const data = vendorDoc.data();
            const currentCount = data?.reviewCount || 0;
            const currentAvg = data?.averageRating || 0;

            let newCount = 0;
            let newAverage = 0;

            if (currentCount > 1) {
                const currentTotal = currentAvg * currentCount;
                const newTotal = currentTotal - ratingToRemove;
                newCount = currentCount - 1;
                newAverage = newTotal / newCount;
            }

            t.update(vendorRef, {
                reviewCount: newCount,
                averageRating: newAverage
            });
        });

        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting review:", error);
        return { success: false, error: error.message };
    }
}
