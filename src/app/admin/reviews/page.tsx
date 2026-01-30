"use client";

import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Star, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import { AdminReviewData, getAllReviews, adminDeleteReview } from "@/app/actions/admin-reviews";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<AdminReviewData[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<AdminReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [starFilter, setStarFilter] = useState("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        const res = await getAllReviews();
        if (res.success && res.data) {
            setReviews(res.data);
            setFilteredReviews(res.data);
        } else {
            toast.error("Failed to fetch reviews");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (starFilter === "all") {
            setFilteredReviews(reviews);
        } else if (starFilter === "low") {
            setFilteredReviews(reviews.filter(r => r.rating <= 2)); // 1-2 Stars
        } else if (starFilter === "mid") {
            setFilteredReviews(reviews.filter(r => r.rating === 3)); // 3 Stars
        } else if (starFilter === "high") {
            setFilteredReviews(reviews.filter(r => r.rating >= 4)); // 4-5 Stars
        }
    }, [starFilter, reviews]);


    const handleDelete = async (review: AdminReviewData) => {
        setDeletingId(review.id);
        const res = await adminDeleteReview(review.id, review.vendorId, review.rating);

        if (res.success) {
            toast.success("Review deleted and stats recalculated");
            // Remove from local state
            const newReviews = reviews.filter(r => r.id !== review.id);
            setReviews(newReviews); // This will trigger filter effect
        } else {
            toast.error("Failed to delete review: " + res.error);
        }
        setDeletingId(null);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Review Moderation</h1>

                {/* FILTER */}
                <div className="w-[200px]">
                    <Select value={starFilter} onValueChange={setStarFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="low">Low (1-2 Stars)</SelectItem>
                            <SelectItem value="mid">Mid (3 Stars)</SelectItem>
                            <SelectItem value="high">High (4-5 Stars)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[100px]">Rating</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead>Target Vendor</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                </TableCell>
                            </TableRow>
                        ) : filteredReviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No reviews match your filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-bold text-gray-700">
                                            <Star className={`w-4 h-4 ${review.rating <= 2 ? "fill-red-500 text-red-500" : "fill-yellow-400 text-yellow-400"}`} />
                                            {review.rating.toFixed(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-md">
                                            <p className="text-sm line-clamp-2" title={review.comment}>"{review.comment}"</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {review.vendorName || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {review.customerName}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-400">
                                        {format(new Date(review.createdAt), "MMM d")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    disabled={deletingId === review.id}
                                                >
                                                    {deletingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5" /> Confirm Deletion
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this review?
                                                        <br /><br />
                                                        <strong>This action cannot be undone.</strong> The vendor's average rating will be automatically recalculated.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(review)} className="bg-red-600 hover:bg-red-700">
                                                        Delete Review
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
