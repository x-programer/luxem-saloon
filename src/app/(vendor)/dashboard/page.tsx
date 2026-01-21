"use client";

import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Edit2, TrendingUp, Users, Calendar, ArrowUpRight, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const { user } = useAuth();
    const [salonData, setSalonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setSalonData(doc.data());
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Theme Helpers
    const theme = salonData?.theme || "royal";
    const themeColors = {
        royal: { bg: "from-[#6F2DBD] to-[#4c1d85]", text: "text-[#6F2DBD]" },
        midnight: { bg: "from-[#171123] to-gray-900", text: "text-[#171123]" },
        ocean: { bg: "from-blue-600 to-blue-800", text: "text-blue-600" },
    }[theme as "royal" | "midnight" | "ocean"] || { bg: "from-[#6F2DBD] to-[#4c1d85]", text: "text-[#6F2DBD]" };

    if (loading) return <div className="p-8">Loading...</div>;

    const salonName = salonData?.salonName || "Luxe Salon";
    const tagline = salonData?.tagline || "Your Premium Beauty Destination";

    return (
        <div className="space-y-8 pb-10">

            {/* 1. Brand Header - STICKY & RESPONSIVE ALIGNMENT FIX */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-4 z-10 relative w-full rounded-3xl overflow-hidden shadow-soft bg-white border border-gray-100/50 backdrop-blur-sm"
            >
                {/* Banner Background */}
                <div className={`h-40 w-full bg-gradient-to-r ${themeColors.bg} relative`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <Link href="/dashboard/settings" className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-lg">
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                    </Link>
                </div>

                {/* Profile Section */}
                {/* FIX APPLIED: 'items-center' for mobile (centers logo), 'md:items-end' for desktop */}
                <div className="px-4 md:px-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 md:-mt-10 relative">

                    {/* Logo Circle */}
                    <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-xl glassmorphism-ring shrink-0">
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 overflow-hidden relative">
                            {/* Show First Letter if no logo */}
                            {salonName.charAt(0)}
                        </div>
                    </div>

                    {/* Text Info - Centered on Mobile, Left on Desktop */}
                    <div className="flex-1 mb-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{salonName}</h1>
                        <p className="text-gray-500 font-medium text-sm md:text-base">{tagline}</p>
                    </div>

                    {/* Quick Stats Summary - Hidden on Mobile to save space */}
                    <div className="hidden md:flex gap-6 mb-1 bg-gray-50/80 p-3 rounded-2xl backdrop-blur-sm border border-gray-100">
                        <div className="text-right px-2">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Today</div>
                            <div className="font-bold text-gray-900 text-lg leading-none mt-1">8 Bookings</div>
                        </div>
                        <div className="w-px bg-gray-200 my-1"></div>
                        <div className="text-right px-2">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Revenue</div>
                            <div className={`font-bold text-lg leading-none mt-1 ${themeColors.text}`}>$1,240</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Command Center (Stats Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
                {/* Revenue Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">$24,500</h3>
                        <div className="flex items-center gap-1 text-green-600 text-sm mt-2 font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.5%</span>
                            <span className="text-gray-400 font-normal ml-1">vs last month</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${themeColors.text} bg-opacity-10 bg-current`}>
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </motion.div>

                {/* Clients Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Active Clients</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">1,204</h3>
                        <div className="flex items-center gap-1 text-green-600 text-sm mt-2 font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+3.2%</span>
                            <span className="text-gray-400 font-normal ml-1">vs last month</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${themeColors.text} bg-opacity-10 bg-current`}>
                        <Users className="w-6 h-6" />
                    </div>
                </motion.div>

                {/* Bookings Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">842</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-sm mt-2 font-medium">
                            <span>Stable</span>
                            <span className="font-normal ml-1">vs last month</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${themeColors.text} bg-opacity-10 bg-current`}>
                        <Calendar className="w-6 h-6" />
                    </div>
                </motion.div>
            </div>

            {/* 3. Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden relative z-0"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Appointments</h3>
                    <button className={`text-sm font-semibold ${themeColors.text} hover:opacity-80`}>View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    JD
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Jane Doe</p>
                                    <p className="text-xs text-gray-500">Haircut & Styling • 2h</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                                        <Clock className="w-3 h-3" />
                                        10:00 AM
                                    </div>
                                </div>
                                <div className={`font-bold text-sm ${themeColors.text}`}>$120.00</div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}