"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2, User, Phone, Mail, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerStats {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
    lastVisit: Date;
    totalSpent?: number; // Optional: nice to have
}

export default function CustomersPage() {
    const { user, loading } = useAuth();
    const [customers, setCustomers] = useState<CustomerStats[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch ALL appointments to aggregate on client (Standard NoSQL pattern for small-medium scale)
        // Ideally, we would have a 'customers' collection updated via Cloud Functions triggers, 
        // but for this scope, aggregation on read is acceptable.
        const q = query(
            collection(db, "users", user.uid, "appointments"),
            orderBy("date", "desc") // Get latest first for easier Loop
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customerMap = new Map<string, CustomerStats>();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const customerId = data.customerId;

                if (!customerId) return;

                if (!customerMap.has(customerId)) {
                    customerMap.set(customerId, {
                        customerId,
                        name: data.customerName || "Unknown",
                        email: data.customerEmail || "N/A",
                        phone: data.customerPhone || "N/A",
                        totalBookings: 0,
                        lastVisit: data.date?.toDate ? data.date.toDate() : new Date(data.date),
                        totalSpent: 0
                    });
                }

                const stats = customerMap.get(customerId)!;
                stats.totalBookings += 1;
                // Since we sorted by desc, the first time we see a customer is their last visit.
                // But safeguards are good:
                const docDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
                if (docDate > stats.lastVisit) {
                    stats.lastVisit = docDate;
                }
            });

            setCustomers(Array.from(customerMap.values()));
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error fetching customers:", error);
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || isLoadingData) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    Customers
                    <span className="px-3 py-1 rounded-full bg-luxe-primary/10 text-luxe-primary text-xs font-bold border border-luxe-primary/20">
                        {customers.length} Total
                    </span>
                </h1>
                <p className="text-gray-500 mt-1">View insights about your loyal clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer, idx) => (
                    <motion.div
                        key={customer.customerId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-luxe-primary/30 group-hover:bg-luxe-primary/5 transition-colors">
                                    <User className="w-6 h-6 text-gray-400 group-hover:text-luxe-primary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{customer.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium">ID: {customer.customerId.slice(0, 6)}...</p>
                                </div>
                            </div>
                            <span className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {customer.totalBookings}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2.5 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 p-2.5 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{customer.phone}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Last Visit</span>
                            <span className="flex items-center gap-1.5 font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {customer.lastVisit.toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {customers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No customers yet</h3>
                        <p className="text-gray-500 text-sm">Once people book with you, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
