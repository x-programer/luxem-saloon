"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, Clock, Check, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

// Reusing the type from bookings/page.tsx for consistency
type Appointment = {
    id: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    price: number;
    date: Timestamp;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
    createdAt: Timestamp;
};

interface BookingDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onUpdateStatus: (id: string, status: Appointment['status']) => Promise<void>;
}

export function BookingDetailsSheet({ isOpen, onClose, appointment, onUpdateStatus }: BookingDetailsSheetProps) {
    if (!appointment) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col pt-6 h-full"
                    >
                        {/* Header */}
                        <div className="px-6 pb-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                        appointment.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                        appointment.status === 'confirmed' && "bg-green-100 text-green-700",
                                        appointment.status === 'completed' && "bg-[#6F2DBD]/10 text-[#6F2DBD]",
                                        (appointment.status === 'cancelled' || appointment.status === 'declined') && "bg-red-100 text-red-700"
                                    )}>
                                        {appointment.status}
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">ID: {appointment.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Customer Profile */}
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl shadow-sm">
                                    {appointment.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{appointment.customerName}</h3>
                                    <a href={`tel:${appointment.customerPhone}`} className="flex items-center gap-1.5 text-gray-500 text-sm mt-1 hover:text-[#6F2DBD] transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                        {appointment.customerPhone}
                                    </a>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                                    <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {format(appointment.date.toDate(), 'PPP')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</label>
                                    <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {format(appointment.date.toDate(), 'h:mm a')}
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service</label>
                                    <div className="flex justify-between items-center p-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
                                        <span>{appointment.serviceName}</span>
                                        <span className="font-bold text-[#6F2DBD]">${appointment.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Actions</label>

                                {appointment.status === 'pending' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                                            className="py-3 rounded-xl bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Accept
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(appointment.id, 'declined')}
                                            className="py-3 rounded-xl bg-white text-red-500 border border-red-100 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Decline
                                        </button>
                                    </div>
                                )}

                                {appointment.status === 'confirmed' && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => onUpdateStatus(appointment.id, 'completed')}
                                            className="w-full py-3 rounded-xl bg-[#6F2DBD] text-white font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5a2499] transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                                            className="w-full py-3 rounded-xl bg-gray-50 text-gray-500 font-medium text-sm hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                        >
                                            Cancel Appointment
                                        </button>
                                    </div>
                                )}

                                {['completed', 'cancelled', 'declined'].includes(appointment.status) && (
                                    <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">
                                        No further actions available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
