"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Menu, Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#FBFBFF] relative overflow-hidden selection:bg-purple-100">

            {/* 1. Subtle Background Gradients (The "Luxe" Glow) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[100px]" />
            </div>

            {/* 2. Sidebar */}
            <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />

            {/* 3. Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative z-10 scrollbar-hide">

                {/* Mobile Header (Glassmorphism) */}
                <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-[#6F2DBD] to-[#A663CC] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            LS
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">Luxe Salon</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Desktop Top Bar (Search & Notifications) */}
                <header className="hidden md:flex items-center justify-between px-8 py-5 mb-2">
                    <div className="relative w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#6F2DBD] transition-colors" />
                        <input
                            placeholder="Search bookings, clients..."
                            className="w-full bg-white border-none rounded-full py-2.5 pl-10 pr-4 text-sm shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-[#6F2DBD]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 bg-white rounded-full text-gray-500 hover:text-[#6F2DBD] hover:bg-purple-50 transition-all shadow-sm ring-1 ring-gray-100">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Children Container */}
                <div className="px-4 md:px-8 pb-10 min-h-full">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}