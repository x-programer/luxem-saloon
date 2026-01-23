"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Calendar, CheckCircle2, XCircle, Clock, MoreHorizontal, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AppointmentManager() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, `users/${user.uid}/appointments`), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Helper for date display - handling both Firestore Timestamp and fallback
                dateObj: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
            }));
            setAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
        if (!user) return;
        try {
            await updateDoc(doc(db, `users/${user.uid}/appointments`, appointmentId), {
                status: newStatus
            });
            toast.success(`Appointment ${newStatus}`);
        } catch (error) {
            console.error("Error updating appointment:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'upcoming') return app.status === 'pending' || app.status === 'confirmed';
        return app.status === filter;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading appointments...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-luxe-primary" />
                    Appointments
                </h3>

                <div className="flex bg-gray-100/80 p-1 rounded-xl">
                    {(['upcoming', 'completed', 'cancelled'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No {filter} appointments found.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredAppointments.map((app) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6 hover:bg-gray-50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${app.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                            app.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        {app.dateObj.getDate()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{app.customerName}</h4>
                                        <p className="text-sm text-gray-500 mb-1">{app.serviceName}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {app.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    {app.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(app.id, 'confirmed')}
                                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(app.id, 'cancelled')}
                                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Decline
                                            </button>
                                        </>
                                    )}
                                    <div className="text-right pl-4 border-l border-gray-100 ml-2">
                                        <span className="block font-bold text-gray-900 text-sm">₹{app.price}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
