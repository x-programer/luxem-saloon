"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Booking } from "@/hooks/useCustomerBookings";

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

export function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
    if (!booking) return null;

    const dateObj = booking.date && typeof (booking.date as any).toDate === 'function'
        ? (booking.date as any).toDate()
        : new Date(booking.date as string);

    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = booking.time ? new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    }) : "--:--";

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[90] px-4"
                    >
                        <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                                <h3 className="font-bold text-xl text-white">Booking Details</h3>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 space-y-8 overflow-y-auto">

                                {/* Status Badge */}
                                <div className="flex justify-center">
                                    <div className={`
                                        px-4 py-2 rounded-full text-base font-bold flex items-center gap-2 border shadow-lg
                                        ${booking.status === 'confirmed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                            booking.status === 'cancelled' || booking.status === 'declined' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                        }
                                    `}>
                                        {booking.status === 'confirmed' ? <CheckCircle2 className="w-5 h-5" /> :
                                            booking.status === 'cancelled' || booking.status === 'declined' ? <XCircle className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />
                                        }
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Appointment</h4>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-luxe-primary/10 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-luxe-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{formattedDate}</p>
                                            <p className="text-gray-400 text-sm">{formattedTime}</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-white/5" />

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-base">Luxe Salon</p>
                                            <p className="text-gray-400 text-sm">Downtown District</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Breakdown */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Service Breakdown</h4>

                                    <div className="space-y-3">
                                        {booking.services && booking.services.length > 0 ? (
                                            booking.services.map((service: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 border-dashed">
                                                    <div>
                                                        <p className="font-medium text-gray-200">{service.name}</p>
                                                        <p className="text-xs text-gray-500">{service.duration} mins</p>
                                                    </div>
                                                    <span className="font-mono text-gray-300">{formatPrice(service.price)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            // Legacy / Single Service fallback
                                            <div className="flex justify-between items-center py-2">
                                                <p className="font-medium text-gray-200">{booking.serviceName}</p>
                                                <span className="font-mono text-gray-300">{formatPrice(booking.price)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                                        <span className="font-bold text-xl text-white">Total</span>
                                        <span className="font-black text-2xl text-luxe-primary">{formatPrice(booking.price)}</span>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="text-center pt-4">
                                    <p className="text-[10px] text-gray-600 font-mono">
                                        Booking Reference: #{booking.id}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
