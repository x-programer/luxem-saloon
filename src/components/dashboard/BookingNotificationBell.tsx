"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Calendar, Check, Trash2, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BookingNotificationBell() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Optimistic UI state: IDs that are currently being marked as read
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Listen for Pending Bookings
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Only show 'pending' bookings that haven't been marked as read/seen
        // Note: We filter 'notificationRead' client-side below to avoid complex indices
        const q = query(
            collection(db, "users", user.uid, "appointments"),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newBookings = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
                }))
                // Filter out notifications that are marked as read
                .filter((b: any) => !b.notificationRead);

            // Sort: Newest first
            newBookings.sort((a: any, b: any) => b.createdAt - a.createdAt);

            setBookings(newBookings);
            setLoading(false);
        }, (error) => {
            console.error("🔔 NotificationBell Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. Filter out items currently being processed (Optimistic Update)
    const visibleBookings = bookings.filter(b => !processingIds.includes(b.id));
    const unreadCount = visibleBookings.length;

    // 4. Persistence Handlers
    const handleDismiss = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!user) return;

        // Optimistic update: Hide immediately
        setProcessingIds(prev => [...prev, id]);

        try {
            const bookingRef = doc(db, "users", user.uid, "appointments", id);
            await updateDoc(bookingRef, { notificationRead: true });
        } catch (error) {
            console.error("Failed to dismiss notification:", error);
            // Revert optimistic update if failed
            setProcessingIds(prev => prev.filter(pid => pid !== id));
        }
    };

    const handleClearAll = async () => {
        if (!user || unreadCount === 0) return;

        // Optimistic update
        const idsToClear = visibleBookings.map(b => b.id);
        setProcessingIds(prev => [...prev, ...idsToClear]);

        try {
            const batch = writeBatch(db);
            idsToClear.forEach(id => {
                const ref = doc(db, "users", user.uid, "appointments", id);
                batch.update(ref, { notificationRead: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Failed to clear notifications:", error);
            setProcessingIds(prev => prev.filter(id => !idsToClear.includes(id)));
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900 group"
            >
                {/* 🔔 Animated Bell */}
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3, duration: 0.5 }}
                >
                    <Bell className={cn("w-5 h-5", unreadCount > 0 && "text-slate-900")} />
                </motion.div>

                {/* 🔴 Badge with Pulse */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-10"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75 -z-10" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* 📦 Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-slate-100 overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-sm text-slate-800">New Bookings</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                            {loading ? (
                                <div className="py-8 flex justify-center text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            ) : unreadCount === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <Check className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-medium">All caught up!</p>
                                    <p className="text-xs opacity-70">No pending bookings.</p>
                                </div>
                            ) : (
                                visibleBookings.map((booking) => (
                                    <div key={booking.id} className="relative group">
                                        <Link
                                            href="/dashboard/bookings"
                                            onClick={() => setIsOpen(false)}
                                            className="block"
                                        >
                                            <div className="p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">
                                                        {booking.customerName?.[0]?.toUpperCase() || <Calendar className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate pr-6">{booking.customerName || "New Customer"}</h4>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(booking.createdAt, { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                            {booking.serviceName || "Service"} • {booking.time}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md border border-yellow-200/50">
                                                                PENDING
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                Tap to review
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Dismiss Button - Absolute and outside the Link to prevent navigation */}
                                        <button
                                            onClick={(e) => handleDismiss(e, booking.id)}
                                            className="absolute top-2 right-2 p-1.5 rounded-full text-slate-300 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                            title="Mark as read"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                            <Link
                                href="/dashboard/bookings"
                                onClick={() => setIsOpen(false)}
                                className="block w-full py-2 text-center text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                View All Bookings
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
