"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Calendar as CalendarIcon, Loader2, Check, X, Clock,
    Search, Filter, Smartphone, MoreHorizontal, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateBookingStatus } from "@/app/actions/bookings";
import { format } from "date-fns";

// --- Types ---
interface Appointment {
    id: string;
    customerName: string;
    customerPhone?: string;
    serviceName: string;
    date: any; // Firestore Timestamp
    time: string;
    price: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
    duration?: number;
}

const TABS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
    const { user, loading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // New State

    // 1. Real-Time Data Fetching
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "appointments"),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Appointment[];

            setAppointments(data);
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error fetching appointments:", error);
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Client-Side Parsing & Safe Date
    const getSafeDate = (apt: Appointment) => {
        try {
            return apt.date?.toDate ? apt.date.toDate() : new Date(apt.date);
        } catch (e) {
            return new Date();
        }
    };

    // 3. Filtering Logic
    const filteredAppointments = appointments.filter(apt => {
        const matchesTab = activeTab === 'all' ? true :
            activeTab === 'confirmed' ? apt.status === 'confirmed' :
                activeTab === 'completed' ? apt.status === 'completed' :
                    activeTab === 'cancelled' ? (apt.status === 'cancelled' || apt.status === 'declined') :
                        apt.status === activeTab;

        const matchesSearch = apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    // 4. Action Handler
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!user) return;

        try {
            toast.promise(updateBookingStatus(id, newStatus, user.uid), {
                loading: 'Updating...',
                success: 'Status updated successfully!',
                error: 'Failed to update status'
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || isLoadingData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand" />
                <p>Loading your schedule...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings</h1>
                    <p className="text-slate-500 mt-1">Manage appointments and customer requests.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="bg-white border border-slate-200 p-1.5 rounded-xl flex items-center shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative group flex-1 md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-56 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                            activeTab === tab.id ? "text-brand border-brand/10 bg-brand/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute inset-0 bg-brand/5 rounded-lg -z-10 mix-blend-multiply"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="flex items-center gap-2">
                            {tab.label}
                            {tab.id === 'pending' && pendingCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] min-w-[18px] text-center shadow-sm">
                                    {pendingCount}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-20 flex flex-col items-center justify-center text-center text-slate-400"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600">No bookings found</h3>
                            <p className="text-sm">There are no appointments in this category.</p>
                        </motion.div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredAppointments.map((apt) => (
                                    <BookingCard
                                        key={apt.id}
                                        booking={apt}
                                        dateObj={getSafeDate(apt)}
                                        onUpdate={handleStatusUpdate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-3">Customer</div>
                                    <div className="col-span-3">Service</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2 text-right">Actions</div>
                                </div>

                                {filteredAppointments.map((apt) => (
                                    <BookingListItem
                                        key={apt.id}
                                        booking={apt}
                                        dateObj={getSafeDate(apt)}
                                        onUpdate={handleStatusUpdate}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function BookingListItem({ booking, dateObj, onUpdate }: { booking: Appointment, dateObj: Date, onUpdate: (id: string, newStatus: string) => void }) {
    const statusColors = {
        pending: "bg-yellow-50 text-yellow-700",
        confirmed: "bg-green-50 text-green-700",
        completed: "bg-slate-100 text-slate-600",
        cancelled: "bg-red-50 text-red-700",
        declined: "bg-red-50 text-red-700",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
            className="group bg-white border border-slate-100 rounded-xl p-4 md:px-6 md:py-4 shadow-sm hover:shadow-md hover:border-brand/20 transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center"
        >
            {/* Customer */}
            <div className="col-span-3">
                <div className="font-bold text-slate-900">{booking.customerName}</div>
                <div className="text-xs text-slate-400 font-medium">{booking.customerPhone || "No Phone"}</div>
            </div>

            {/* Service */}
            <div className="col-span-3">
                <div className="font-medium text-slate-900">{booking.serviceName}</div>
                <div className="text-xs text-slate-500">₹{booking.price} • {booking.duration || 30}m</div>
            </div>

            {/* Date */}
            <div className="col-span-2 flex flex-col">
                <span className="font-bold text-slate-700">{format(dateObj, "MMM d")}</span>
                <span className="text-xs text-slate-400">{booking.time}</span>
            </div>

            {/* Status */}
            <div className="col-span-2">
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide", statusColors[booking.status])}>
                    {booking.status}
                </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 w-full flex justify-end gap-2">
                {booking.status === 'pending' && (
                    <>
                        <button onClick={() => onUpdate(booking.id, 'declined')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Decline"><X className="w-4 h-4" /></button>
                        <button onClick={() => onUpdate(booking.id, 'confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Accept"><Check className="w-4 h-4" /></button>
                    </>
                )}
                {booking.status === 'confirmed' && (
                    <>
                        <button onClick={() => onUpdate(booking.id, 'cancelled')} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                        <button onClick={() => onUpdate(booking.id, 'completed')} className="p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Complete"><Check className="w-4 h-4" /></button>
                    </>
                )}
            </div>
        </motion.div>
    );
}

function BookingCard({ booking, dateObj, onUpdate }: { booking: Appointment, dateObj: Date, onUpdate: (id: string, status: string) => void }) {

    const statusColors = {
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        confirmed: "bg-green-50 text-green-700 border-green-200",
        completed: "bg-slate-100 text-slate-600 border-slate-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
        declined: "bg-red-50 text-red-700 border-red-200",
    };

    const copyPhone = (e: any) => {
        e.stopPropagation();
        if (booking.customerPhone) {
            navigator.clipboard.writeText(booking.customerPhone);
            toast.success("Phone number copied!");
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all duration-300 flex flex-col h-full"
        >
            {/* Top Row: Date & Status */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {format(dateObj, "d")}
                    </span>
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">
                        {format(dateObj, "MMM")} • {format(dateObj, "EEE")}
                    </span>
                </div>
                <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border", statusColors[booking.status])}>
                    {booking.status}
                </div>
            </div>

            {/* Middle: Info */}
            <div className="flex-1 space-y-3 mb-6">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{booking.customerName}</h3>
                    <div
                        onClick={copyPhone}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1 cursor-pointer hover:text-brand transition-colors"
                    >
                        <Smartphone className="w-3 h-3" />
                        {booking.customerPhone || "No Phone"}
                    </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-brand/5 group-hover:border-brand/10 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">{booking.serviceName}</span>
                        <span className="text-xs font-black text-slate-900">₹{booking.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {booking.time} • {booking.duration || 30} mins
                    </div>
                </div>
            </div>

            {/* Bottom: Actions */}
            <div className="mt-auto grid grid-cols-2 gap-2">
                {booking.status === 'pending' && (
                    <>
                        <button
                            onClick={() => onUpdate(booking.id, 'declined')}
                            className="py-2.5 rounded-xl border border-red-100 text-red-600 font-bold text-xs hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-3.5 h-3.5" /> Decline
                        </button>
                        <button
                            onClick={() => onUpdate(booking.id, 'confirmed')}
                            className="py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                    </>
                )}

                {booking.status === 'confirmed' && (
                    <>
                        <button
                            onClick={() => onUpdate(booking.id, 'cancelled')}
                            className="py-2.5 rounded-xl border border-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onUpdate(booking.id, 'completed')}
                            className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-3.5 h-3.5" /> Complete
                        </button>
                    </>
                )}

                {['completed', 'cancelled', 'declined'].includes(booking.status) && (
                    <div className="col-span-2 py-2 text-center text-xs text-slate-400 font-medium italic bg-slate-50/50 rounded-xl border border-transparent">
                        No actions available
                    </div>
                )}
            </div>
        </motion.div>
    );
}