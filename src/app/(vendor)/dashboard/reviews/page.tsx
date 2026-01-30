"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star, MessageSquare, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { deleteReview } from "@/app/actions/review-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ReviewsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const viewAsId = searchParams.get('viewAs');
    const targetId = viewAsId || user?.uid;

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!targetId) return;

        const q = query(
            collection(db, "reviews"),
            where("vendorId", "==", targetId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, targetId]);

    const handleDelete = async (reviewId: string) => {
        if (!targetId) return;
        if (!confirm("Delete this review? This action cannot be undone.")) return;

        const result = await deleteReview(reviewId, targetId);
        if (result.success) {
            toast.success("Review removed");
        } else {
            toast.error("Failed to delete review");
        }
    };

    if (loading) return <div className="p-8">Loading reviews...</div>;

    // Stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reviews & Ratings</h1>
                <p className="text-gray-500 mt-1">Monitor client feedback and maintain your reputation.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Average Rating</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                            {averageRating}
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalReviews}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Recent Reviews</h3>
                </div>

                {reviews.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                        <p>No reviews yet. Ask your loyal customers to rate you!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                                {/* Reviewer Info */}
                                <div className="md:w-48 shrink-0">
                                    <div className="font-bold text-gray-900">{review.customerName}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                    </div>
                                    <div className="flex gap-0.5 mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="flex-1">
                                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                </div>

                                {/* Actions */}
                                <div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="md:hidden">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}