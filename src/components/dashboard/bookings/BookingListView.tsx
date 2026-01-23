"use client";

import { Calendar, Phone, Check, X, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { acceptBooking } from "@/app/actions/bookings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Shared Type
export type Appointment = {
    id: string;
    vendorId: string; // 👈 Added vendorId
    customerName: string;
    customerPhone: string;
    serviceName: string;
    price: number;
    date: Timestamp;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
    createdAt: Timestamp;
};

interface BookingListViewProps {
    appointments: Appointment[];
    onUpdateStatus: (id: string, newStatus: Appointment['status']) => Promise<void>;
}

export function BookingListView({ appointments, onUpdateStatus }: BookingListViewProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 1. Sort: Pending First, then Ascending Date (Soonest first), then Descending Date for past
    const sortedAppointments = [...appointments].sort((a, b) => {
        // Priority to Pending
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;

        // If both pending, sort by date ASC (Soonest first)
        if (a.status === 'pending' && b.status === 'pending') {
            return a.date.seconds - b.date.seconds;
        }

        // Default: Sort by date DESC (Newest first)
        return b.date.seconds - a.date.seconds;
    });

    // 2. Filter
    const filteredAppointments = sortedAppointments.filter(apt => {
        if (activeTab === 'all') return true;
        if (activeTab === 'cancelled') return ['cancelled', 'declined'].includes(apt.status);
        return apt.status === activeTab;
    });

    const handleAccept = async (bookingId: string, vendorId: string) => {
        setProcessingId(bookingId);
        try {
            const result = await acceptBooking(bookingId, vendorId);

            if (result.success) {
                if (result.sync?.success) {
                    toast.success("Booking Accepted & Synced to Calendar ✅");
                } else {
                    toast.warning("Booking Accepted, but Calendar Sync Failed ⚠️");
                }
                // Refresh logic - assuming onUpdateStatus might trigger a refresh, or we rely on router
                // Since we bypassed onUpdateStatus, we should probably manually trigger the parent's refresh or use router.refresh() if this is a server component child.
                // For now, let's call onUpdateStatus ('confirmed') just to trigger any parent side effects (like state update), IF the parent logic handles 'confirmed' similarly (just db update). 
                // BUT wait, if parent does DB update too, we double write.
                // Ideally we just call router.refresh().
                window.location.reload(); // Simple brute force or use router.refresh() if imported. 
                // Better: rely on the fact that onUpdateStatus likely re-fetches. 
                // I'll leave revalidation for now or add useRouter.
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept booking.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* ... tabs ... */}
            {/* Lists code is largely same, just button change below */}
            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                            activeTab === tab
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                        )}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center"
                        >
                            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">No {activeTab} bookings</h3>
                            <p className="text-gray-500 mt-1">Your schedule is clear for now.</p>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((apt) => (
                            <motion.div
                                layout
                                key={apt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                {/* Status Stripe */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5",
                                    apt.status === 'pending' && "bg-yellow-400",
                                    apt.status === 'confirmed' && "bg-green-500",
                                    apt.status === 'completed' && "bg-[#6F2DBD]",
                                    (apt.status === 'cancelled' || apt.status === 'declined') && "bg-red-400"
                                )} />

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pl-2">

                                    {/* Section 1: Time & Date */}
                                    <div className="min-w-[100px] text-center md:text-left">
                                        <div className="text-2xl font-black text-gray-900 tracking-tight">
                                            {format(apt.date.toDate(), 'h:mm a')}
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 font-medium text-sm mt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(apt.date.toDate(), 'MMM d')}
                                        </div>
                                    </div>

                                    {/* Section 2: Customer Profile (Middle) */}
                                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0 border-2 border-white shadow-sm">
                                            {apt.customerName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-bold text-gray-900 text-lg leading-none">{apt.customerName}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                                <span className="text-[#6F2DBD] font-semibold">{apt.serviceName}</span>
                                                <span className="text-gray-300 hidden sm:inline">•</span>
                                                <span className="text-gray-600 font-medium">${apt.price}</span>
                                            </div>
                                        </div>

                                        {/* Contact Button */}
                                        <a
                                            href={`tel:${apt.customerPhone}`}
                                            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-green-200"
                                        >
                                            <Phone className="w-4 h-4" />
                                            <span className="hidden sm:inline">Call Client</span>
                                        </a>
                                    </div>

                                    {/* Section 3: Action Buttons */}
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                                        {apt.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAccept(apt.id, apt.vendorId)}
                                                    disabled={!!processingId}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === apt.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    {processingId === apt.id ? "Syncing..." : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => onUpdateStatus(apt.id, 'declined')}
                                                    disabled={!!processingId}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 font-bold text-sm transition-all disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4" /> Decline
                                                </button>
                                            </>
                                        )}

                                        {apt.status === 'confirmed' && (
                                            <>
                                                <button
                                                    onClick={() => onUpdateStatus(apt.id, 'completed')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#6F2DBD] text-white rounded-xl hover:bg-[#5a2499] font-bold text-sm shadow-lg shadow-purple-200 transition-all"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Complete
                                                </button>
                                                <button
                                                    onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 font-medium text-sm transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {['completed'].includes(apt.status) && (
                                            <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold border border-gray-200 flex items-center gap-2 cursor-default">
                                                <CheckCircle2 className="w-4 h-4" /> Completed
                                            </div>
                                        )}

                                        {['cancelled', 'declined'].includes(apt.status) && (
                                            <div className="px-4 py-2 bg-red-50 text-red-400 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 cursor-default">
                                                <XCircle className="w-4 h-4" /> {apt.status === 'declined' ? 'Declined' : 'Cancelled'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
