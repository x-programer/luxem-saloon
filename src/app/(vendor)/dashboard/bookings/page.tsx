"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LayoutList, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BookingDetailsSheet } from "@/components/dashboard/BookingDetailsSheet";
import { BookingListView, Appointment } from "@/components/dashboard/bookings/BookingListView";
import { SmartCalendarView } from "@/components/dashboard/bookings/SmartCalendarView";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Derived State
    const viewMode = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const toggleView = (mode: 'list' | 'calendar') => {
        router.push(`/dashboard/bookings?view=${mode}`, { scroll: false });
    };

    // Data Fetching
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "appointments"),
            orderBy("date", "asc")
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
            toast.error("Failed to load bookings");
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Actions
    const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid, "appointments", id), {
                status: newStatus
            });

            const statusMessages = {
                confirmed: "Booking confirmed!",
                completed: "Marked as completed",
                cancelled: "Booking cancelled",
                declined: "Booking declined",
                pending: "Status updated"
            };

            toast.success(statusMessages[newStatus]);

            // If updated from sheet
            if (selectedAppointment && selectedAppointment.id === id) {
                if (['cancelled', 'declined', 'completed'].includes(newStatus)) {
                    setIsSheetOpen(false);
                } else {
                    // Update local selected state optimistically or wait for snapshot
                    setSelectedAppointment({ ...selectedAppointment, status: newStatus });
                }
            }

        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const handleEventSelect = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setIsSheetOpen(true);
    };

    if (loading || isLoadingData) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50/50">
            {/* Header Control Center - Fixed */}
            <div className="flex-none p-6 pb-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            Schedule
                            {pendingCount > 0 && (
                                <span className="px-3 py-1 rounded-full bg-[#6F2DBD]/10 text-[#6F2DBD] text-xs font-bold border border-[#6F2DBD]/20">
                                    {pendingCount} Pending
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your appointments and availability.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle Pill */}
                        <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200">
                            <button
                                onClick={() => toggleView('list')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    viewMode === 'list'
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <LayoutList className="w-4 h-4" />
                                List
                            </button>
                            <button
                                onClick={() => toggleView('calendar')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    viewMode === 'calendar'
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <CalendarIcon className="w-4 h-4" />
                                Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body - Scrollable Area handled internally by components */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <BookingListView
                                appointments={appointments}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto p-4 md:p-6" // Calendar handles its own scroll or container does
                        >
                            <SmartCalendarView
                                appointments={appointments}
                                onSelectEvent={handleEventSelect}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Shared Details Sheet */}
            <BookingDetailsSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                appointment={selectedAppointment}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}
