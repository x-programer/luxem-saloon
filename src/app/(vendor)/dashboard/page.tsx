"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Calendar, Eye, DollarSign, TrendingUp, Users, ArrowRight, ExternalLink
} from "lucide-react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { format } from "date-fns";

// --- Components ---

const StatsCard = ({ icon: Icon, label, value, trend, colorClass, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-violet-100 transition-all duration-300 group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-colors ${colorClass.bg} group-hover:scale-110 duration-300`}>
                <Icon className={`w-6 h-6 ${colorClass.text}`} />
            </div>
            {trend && (
                <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {trend}
                </span>
            )}
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
    </motion.div>
);

export default function VendorDashboardPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const impersonateId = searchParams.get('impersonate') || searchParams.get('viewAs');

    // Data State
    const [viewedUser, setViewedUser] = useState<any>(null);
    const [dashboardStats, setDashboardStats] = useState({
        earnings: 0,
        appointments: 0,
        activeAppointments: 0,
        clients: 0,
        views: 0,
        chartData: [] as any[]
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- Access Control & Data Fetching ---
    useEffect(() => {
        const initDashboard = async () => {
            if (loading) return;

            if (!user) {
                router.push('/login');
                return;
            }

            let targetUid = user.uid;

            // Admin Impersonation Logic
            if (role === 'admin' && impersonateId) {
                targetUid = impersonateId;
            } else if (role !== 'vendor' && role !== 'admin') {
                router.push('/my-bookings');
                return;
            }

            try {
                // 1. Fetch User Profile
                const userDoc = await getDoc(doc(db, "users", targetUid));
                if (userDoc.exists()) {
                    setViewedUser({ uid: userDoc.id, ...userDoc.data() });
                } else {
                    setViewedUser({ displayName: "Unknown User", uid: targetUid });
                }

                // 2. Fetch Dashboard Stats (DATA SOURCE CHANGE to 'appointments' subcollection)
                // Note: We are fetching from the subcollection 'appointments' under the user doc.
                // We do NOT need a 'where("vendorId", "==", targetUid)' clause because we are already inside the user's document.
                const bookingsQuery = collection(db, "users", targetUid, "appointments");

                const bookingsSnap = await getDocs(bookingsQuery);
                const bookings = bookingsSnap.docs.map(d => d.data());

                // Debugging Log as needed
                // Debugging Log as needed


                // Helper for Safe Date Parsing (Handles Firestore Timestamps & Strings)
                const safeDate = (value: any) => {
                    if (!value) return new Date();
                    // Handle Firestore Timestamp (has .toDate() method)
                    if (value && typeof value.toDate === 'function') {
                        return value.toDate();
                    }
                    // Handle standard Date string/number
                    return new Date(value);
                };

                // Client-side Sorting
                const sortedBookings = bookings.sort((a: any, b: any) => {
                    const dateA = a.date ? safeDate(a.date).getTime() : 0;
                    const dateB = b.date ? safeDate(b.date).getTime() : 0;
                    return dateA - dateB;
                });

                // --- ROBUST STATS CALCULATION ---
                let totalEarnings = 0;
                let activeCount = 0;
                const uniqueClients = new Set();
                const chartMap = new Map();

                sortedBookings.forEach((b: any) => {
                    // Normalize Data
                    const status = (b.status || '').toLowerCase().trim();
                    const rawPrice = b.price ? b.price.toString() : '0';
                    const price = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;

                    // 1. Total Revenue Check (Completed/Paid)
                    if (['completed', 'done', 'paid', 'finished'].includes(status)) {
                        totalEarnings += price;

                        // Add to chart map (only revenue generating ones)
                        const dateKey = b.date ? format(safeDate(b.date), 'MMM d') : 'N/A';
                        const currentVal = chartMap.get(dateKey) || 0;
                        chartMap.set(dateKey, currentVal + price);
                    }

                    // 2. Active Bookings Check
                    if (['pending', 'confirmed', 'scheduled', 'upcoming', 'accept'].includes(status)) {
                        activeCount += 1;
                    }

                    // 3. Unique Clients Check
                    if (b.customerId) {
                        uniqueClients.add(b.customerId);
                    }
                });

                // Process Chart Data from Map
                const chartData = Array.from(chartMap.entries()).map(([date, revenue]) => ({
                    date,
                    revenue
                }));

                // Fallback for empty chart
                if (chartData.length === 0) {
                    chartData.push({ date: 'Today', revenue: 0 });
                }

                // Chart Data Sort (Ensure chart days are ordered)
                // We need to parse the 'MMM d' string back or use our original map keys if we kept them as timestamps
                // For simplicity, let's just reverse if they came out backwards, but Array.from on Map keeps insertion order 
                // and we sorted bookings first, so insertion order should be correct.

                // One missing part: bookings.slice(-10) logic? 
                // The previous code had `sortedBookings.slice(-10)`. The current logic processes ALL bookings.
                // If we want to limit to last 10 days, we should slice the chartData.
                const finalChartData = chartData.length > 7 ? chartData.slice(-7) : chartData;

                setDashboardStats({
                    earnings: totalEarnings,
                    appointments: sortedBookings.length,
                    activeAppointments: activeCount,
                    clients: uniqueClients.size,
                    views: 0,
                    chartData: finalChartData
                });

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        initDashboard();
    }, [user, role, loading, impersonateId, router]);

    if (loading || isLoadingData || !viewedUser) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl"
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${viewedUser.banner || 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80'})`
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200"
                        >
                            {viewedUser.logo || viewedUser.photoURL ? (
                                <img src={viewedUser.logo || viewedUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-violet-600 text-white text-3xl font-bold">
                                    {(viewedUser.displayName?.[0] || 'V').toUpperCase()}
                                </div>
                            )}
                        </motion.div>
                        <div className="text-white mb-2">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl md:text-4xl font-black tracking-tight"
                            >
                                {viewedUser.businessName || viewedUser.displayName}
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 text-white/80 text-sm font-medium"
                            >
                                <span>@{viewedUser.slug || viewedUser.uid?.slice(0, 8)}</span>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <span>{viewedUser.role === 'admin' ? 'Administrator' : 'Partner Vendor'}</span>
                            </motion.div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const finalUrl = viewedUser.slug
                                ? `${window.location.origin}/${viewedUser.slug}`
                                : `${window.location.origin}/shop/${viewedUser.uid}`;
                            window.open(finalUrl, '_blank');
                        }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                        Visit Storefront <ExternalLink className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${dashboardStats.earnings.toLocaleString()}`}
                    trend="+12%"
                    colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                    delay={0.1}
                />
                <StatsCard
                    icon={Calendar}
                    label="Active Bookings"
                    value={dashboardStats.activeAppointments}
                    trend={dashboardStats.appointments > 0 ? `${dashboardStats.appointments} total` : "0 total"}
                    colorClass={{ bg: 'bg-violet-50', text: 'text-violet-600' }}
                    delay={0.2}
                />
                <StatsCard
                    icon={Users}
                    label="Total Clients"
                    value={dashboardStats.clients}
                    trend="All Time"
                    colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                    delay={0.3}
                />
            </div>

            {/* Charts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
                            <p className="text-slate-500 text-sm">Income trend over time</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardStats.chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Quick Actions / Recent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-violet-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
                        <p className="text-violet-200 mb-8">Unlock advanced analytics, marketing tools, and zero commission fees.</p>

                        <button className="w-full py-4 bg-white text-violet-900 rounded-xl font-bold hover:bg-violet-50 transition-colors shadow-lg">
                            View Plans
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-violet-300" />
                            Quick Views
                        </h4>
                        <Link href="/dashboard/bookings" className="flex items-center justify-between py-3 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors group">
                            <span className="text-violet-100">Pending Bookings</span>
                            <ArrowRight className="w-4 h-4 text-violet-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/dashboard/services" className="flex items-center justify-between py-3 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors group">
                            <span className="text-violet-100">Manage Services</span>
                            <ArrowRight className="w-4 h-4 text-violet-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div >
    );
}