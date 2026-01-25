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

    // Local state for Optimistic UI
    const [optimisticAppointments, setOptimisticAppointments] = useState(appointments);

    // Sync if props change (revalidation)
    // NOTE: This might override optimistic state if a refresh happens mid-flight, which is generally acceptable as it means source of truth updated.
    /* useEffect(() => {
         setOptimisticAppointments(appointments);
    }, [appointments]); */
    // Actually, purely relying on props change for sync is safer, but for optimistic we need intial state.
    // If we want to support Props updates overriding local state, we need a useEffect.
    // Let's add it to be safe.
    useState(() => {
        if (appointments !== optimisticAppointments) {
            setOptimisticAppointments(appointments);
        }
    });


    const sortedAppointments = [...optimisticAppointments].sort((a, b) => {
        // ... sort logic remains same ...
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        if (a.status === 'pending' && b.status === 'pending') {
            return a.date.seconds - b.date.seconds;
        }
        return b.date.seconds - a.date.seconds;
    });

    const filteredAppointments = sortedAppointments.filter(apt => {
        if (activeTab === 'all') return true;
        if (activeTab === 'cancelled') return ['cancelled', 'declined'].includes(apt.status);
        return apt.status === activeTab;
    });

    const updateLocalStatus = (id: string, status: Appointment['status']) => {
        setOptimisticAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status } : apt
        ));
    };

    const handleAccept = async (bookingId: string, vendorId: string) => {
        setProcessingId(bookingId);

        // ⚡️ Optimistic Update
        const previousAppointments = [...optimisticAppointments];
        updateLocalStatus(bookingId, 'confirmed');

        try {
            const result = await acceptBooking(bookingId, vendorId);

            if (result.success) {
                if (result.sync?.success) {
                    toast.success("Booking Accepted & Synced to Calendar ✅");
                } else {
                    toast.warning("Booking Accepted, but Calendar Sync Failed ⚠️");
                }
                // Success! No need to reload, the UI is already "Confirmed".
                // Ideally, trigger a background revalidation here if needed.
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept booking.");
            // ↩️ Rollback on error
            setOptimisticAppointments(previousAppointments);
        } finally {
            setProcessingId(null);
        }
    };

    // Also wrap the generic update status for uniformity (Decline/Cancel/Complete)
    const handleStatusUpdate = async (id: string, newStatus: Appointment['status']) => {
        const previousAppointments = [...optimisticAppointments];
        updateLocalStatus(id, newStatus);

        try {
            await onUpdateStatus(id, newStatus);
        } catch (error) {
            console.error("Status update failed", error);
            toast.error("Failed to update status");
            setOptimisticAppointments(previousAppointments);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Filter Tabs - Fixed at top of list view */}
            <div className="flex-none px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur z-10 w-full overflow-hidden">
                <div className="flex overflow-x-auto pb-1 scrollbar-none gap-2">
                    {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border select-none",
                                activeTab === tab
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-2 space-y-2">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center"
                        >
                            <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">No {activeTab} bookings</h3>
                            <p className="text-xs text-gray-500 mt-1">Your schedule is clear for now.</p>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((apt) => (
                            <motion.div
                                layout
                                key={apt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-lg border border-slate-100 p-2 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                            >
                                {/* Status Stripe - Slim & Subtle */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    apt.status === 'pending' && "bg-yellow-400",
                                    apt.status === 'confirmed' && "bg-green-500",
                                    apt.status === 'completed' && "bg-[#6F2DBD]",
                                    (apt.status === 'cancelled' || apt.status === 'declined') && "bg-red-400"
                                )} />

                                <div className="flex items-center gap-3 pl-2 w-full">

                                    {/* 1. Time (Fixed Width) */}
                                    <div className="w-[70px] flex flex-col items-center justify-center shrink-0 leading-tight">
                                        <div className="text-sm font-bold text-slate-800">
                                            {format(apt.date.toDate(), 'h:mm a')}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                            {format(apt.date.toDate(), 'MMM d')}
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                                    {/* 2. Client & Service Info (Flexible) */}
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        {/* Avatar (Tiny) */}
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 ring-1 ring-white shadow-sm">
                                            {apt.customerName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                    {apt.customerName}
                                                </h3>
                                                {/* Mobile Price */}
                                                <span className="sm:hidden text-xs font-medium text-slate-500">
                                                    • ${apt.price}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                                                <span className="truncate max-w-[120px] sm:max-w-xs">{apt.serviceName}</span>
                                                <span className="hidden sm:inline text-slate-300">•</span>
                                                <span className="hidden sm:inline font-medium text-slate-600">${apt.price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Actions (Right Aligned) */}
                                    <div className="ml-auto flex items-center gap-2 pl-2">

                                        {/* Phone Icon (Always visible) */}
                                        <a
                                            href={`tel:${apt.customerPhone}`}
                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200"
                                            title="Call Client"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                        </a>

                                        {/* Status Actions */}
                                        {apt.status === 'pending' && (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleAccept(apt.id, apt.vendorId)}
                                                    disabled={!!processingId}
                                                    className="h-7 px-3 bg-green-600 text-white rounded text-xs font-bold shadow-sm hover:bg-green-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                                >
                                                    {processingId === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                    <span className="hidden sm:inline">Accept</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'declined')}
                                                    disabled={!!processingId}
                                                    className="h-7 w-7 sm:w-auto sm:px-3 bg-white text-rose-500 border border-rose-200 rounded text-xs font-bold hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                                                    title="Decline"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {apt.status === 'confirmed' && (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                    className="h-7 px-3 bg-[#6F2DBD] text-white rounded text-xs font-bold shadow-sm hover:bg-[#5a2499] flex items-center gap-1.5 transition-all"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span className="hidden sm:inline">Done</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                    className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                                                    title="Cancel"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Read Only Status Badges */}
                                        {['completed', 'cancelled', 'declined'].includes(apt.status) && (
                                            <div className={cn(
                                                "h-7 px-3 rounded text-[10px] font-bold uppercase tracking-wider flex items-center border select-none",
                                                apt.status === 'completed' && "bg-slate-100 text-slate-600 border-slate-200",
                                                apt.status !== 'completed' && "bg-rose-50 text-rose-500 border-rose-100"
                                            )}>
                                                {apt.status}
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
