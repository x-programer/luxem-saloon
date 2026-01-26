"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { addReview, deleteReview, getVendorReviews } from "@/app/actions/review-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ReviewListProps {
    vendorId: string;
    isDarkMode?: boolean;
}

export function ReviewList({ vendorId, isDarkMode = false }: ReviewListProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!vendorId) return;

        const fetchReviews = async () => {
            try {
                const fetchedReviews = await getVendorReviews(vendorId);
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [vendorId]);

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to leave a review");
            return;
        }

        setIsSubmitting(true);
        const result = await addReview({
            vendorId,
            customerId: user.uid,
            customerName: user.email?.split('@')[0] || "Customer",
            rating,
            comment
        });

        if (result.success) {
            toast.success("Review posted!");
            setComment("");
            setRating(5);
            // Refresh reviews manually
            const newReviews = await getVendorReviews(vendorId);
            setReviews(newReviews);
        } else {
            toast.error(result.error || "Failed to post review");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (reviewId: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete this review?")) return;

        const result = await deleteReview(reviewId, user.uid);
        if (result.success) {
            toast.success("Review deleted");
            // Refresh reviews manually
            const newReviews = await getVendorReviews(vendorId);
            setReviews(newReviews);
        } else {
            toast.error(result.error || "Delete failed");
        }
    };

    return (
        <div className="space-y-10">
            {/* Add Review Form */}
            {user && (
                <div className={`p-6 rounded-3xl border transition-colors ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                    <h3 className={`font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Write a Review</h3>
                    <form onSubmit={handleAddReview} className="space-y-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : (isDarkMode ? "text-gray-600" : "text-gray-300")}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            required
                            className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-[#6F2DBD] focus:border-transparent outline-none min-h-[100px] ${isDarkMode ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-900"}`}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#6F2DBD] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#5a2499] disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? "Posting..." : "Post Review"}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                <h3 className={`font-bold text-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Client Reviews <span className={`text-lg font-normal ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>({reviews.length})</span>
                </h3>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`} />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={`flex gap-4 p-6 border rounded-3xl shadow-sm hover:shadow-md transition-all relative group ${isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-white border-gray-100"}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${isDarkMode ? "bg-white/10 text-gray-300" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500"}`}>
                                {review.customerName?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{review.customerName}</h4>
                                        <div className="text-xs text-gray-400 flex items-center gap-2">
                                            {/* Date Parse Logic Updated for ISO String */}
                                            {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : 'Just now'}
                                        </div>
                                    </div>
                                    {user && (user.uid === review.customerId || user.uid === vendorId) && (
                                        <button onClick={() => handleDelete(review.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : (isDarkMode ? "text-gray-600" : "text-gray-200")}`} />
                                    ))}
                                </div>
                                <p className={`leading-relaxed text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{review.comment}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}