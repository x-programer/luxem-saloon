"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, Clock, StickyNote, History, Mail, User, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ClientStats } from "@/app/actions/clients";

interface ClientDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    client: ClientStats | null;
    vendorUid: string;
}

export function ClientDetailsSheet({ isOpen, onClose, client, vendorUid }: ClientDetailsSheetProps) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (client) {
            setNotes("");
        }
    }, [client]);

    const handleSaveNotes = async () => {
        toast.success("Notes saved (Mock)");
    };

    const handleDeleteBooking = (bookingId: string) => {
        if (confirm("Are you sure you want to delete this booking history record?")) {
            console.log("Deleting booking:", bookingId);
            toast.success("Booking deleted (Mock)");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && client && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-white shadow-2xl z-50 flex flex-col h-full border-l border-gray-100"
                    >
                        {/* 1. Header Section */}
                        <div className="px-8 py-8 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md">
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white rounded-full text-[10px] font-bold shadow-md border border-gray-100 flex items-center gap-1">
                                        ⭐ 5.0
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{client.name}</h2>

                            <div className="flex flex-col gap-2 text-sm">
                                {client.phone && client.phone !== 'N/A' ? (
                                    <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        {client.phone}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5 text-gray-400 italic">
                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Phone className="w-3.5 h-3.5 text-gray-300" />
                                        </div>
                                        No phone number
                                    </div>
                                )}

                                {client.email && (
                                    <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        {client.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Visits</div>
                                    <div className="text-3xl font-extrabold text-gray-900">{client.visitCount}</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Lifetime Value</div>
                                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                                        ${client.totalSpend}
                                    </div>
                                </div>
                            </div>

                            {/* Visit History */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                                        <History className="w-5 h-5 text-violet-600" />
                                        Appointment History
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                        {client.history.length} Records
                                    </span>
                                </div>

                                {client.history && client.history.length > 0 ? (
                                    <div className="relative border-l-2 border-dashed border-gray-100 ml-4 space-y-8 pl-8 py-2">
                                        {client.history.map((apt: any) => (
                                            <div key={apt.id} className="relative group">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-gray-100 group-hover:border-violet-200 transition-colors" />

                                                <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-violet-100 hover:shadow-lg hover:shadow-violet-500/5 transition-all">

                                                    {/* Top Row: Service & Price */}
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-900 text-base">{apt.serviceName}</h4>
                                                        <div className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-sm border border-green-100">
                                                            ${apt.price}
                                                        </div>
                                                    </div>

                                                    {/* 👤 NEW: Specific Client Badge */}
                                                    <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium mb-3 bg-violet-50 w-fit px-2 py-1 rounded-md">
                                                        <User className="w-3 h-3" />
                                                        {apt.clientName || client.name}
                                                    </div>

                                                    {/* Bottom Row: Date, Time, Status */}
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-3 mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium">{format(new Date(apt.date), 'MMM d, yyyy')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium">{apt.time}</span>
                                                        </div>

                                                        <div className="flex-1" />

                                                        {/* Delete Action */}
                                                        <button
                                                            onClick={() => handleDeleteBooking(apt.id)}
                                                            className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm font-medium">No history recorded yet.</p>
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