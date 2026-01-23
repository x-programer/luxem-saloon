"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchForm } from "./shared/SearchForm";

export function Hero() {
    return (
        <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Massive Hero Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(8,_112,_184,_0.05)] rounded-[3rem] p-8 md:p-12 lg:p-16 overflow-hidden max-w-6xl mx-auto"
                >
                    {/* Glass Reflection/Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />

                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                        {/* Text Content */}
                        <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0 relative z-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 border border-white/30 backdrop-blur-sm text-xs font-bold text-primary mb-6 shadow-sm"
                            >
                                <Sparkles size={12} className="fill-primary" />
                                <span>v2.0 Now Available</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-textMain leading-[1.1] mb-6 drop-shadow-sm"
                            >
                                The OS for <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-luxe-secondary">
                                    Modern Salons
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-xl text-textMuted/90 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium"
                            >
                                Manage bookings, showcase your portfolio, and grow your brand.
                                Designed for those who appreciate <span className="text-textMain font-semibold">imperceptible design</span>.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="w-full max-w-xl mx-auto lg:mx-0"
                            >
                                <SearchForm variant="hero" />

                                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-textMuted uppercase tracking-wider">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden`}>
                                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <p>Trusted by <span className="text-textMain font-bold">500+ Salons</span></p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Visual Content (Glassmorphism Inner Card) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="lg:col-span-6 relative perspective-1000"
                        >
                            {/* Floating Elements Animation Container */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                {/* Inner App Glass Card */}
                                <div className="relative bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-6 shadow-2xl ring-1 ring-white/40">

                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-luxe-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">LS</div>
                                            <div>
                                                <h3 className="font-bold text-lg text-textMain">Luxe Salon</h3>
                                                <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Dashboard</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white/50">
                                            <Bell className="w-5 h-5 text-textMain" />
                                        </div>
                                    </div>

                                    {/* Content Mockups */}
                                    <div className="space-y-4">
                                        {/* Item 1 */}
                                        <div className="bg-white/60 p-4 rounded-3xl border border-white/60 flex items-center gap-4 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">S</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-textMain">Sarah Johnson</p>
                                                <p className="text-xs text-textMuted">Haircut & Styling • 2:00 PM</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100/50 text-green-700 text-xs font-bold rounded-full border border-green-100">Confirmed</span>
                                        </div>

                                        {/* Item 2 */}
                                        <div className="bg-white/40 p-4 rounded-3xl border border-white/40 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">M</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-textMain">Mike Chen</p>
                                                <p className="text-xs text-textMuted">Consultation • 3:30 PM</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100/50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">Pending</span>
                                        </div>

                                        {/* Stat Card */}
                                        <div className="mt-6 p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                                            <p className="text-sm font-semibold text-textMuted mb-1">Total Revenue</p>
                                            <div className="flex items-end justify-between">
                                                <p className="text-3xl font-bold text-textMain tracking-tight">$3,420</p>
                                                <div className="h-8 w-24 bg-primary/20 rounded-md"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Popout */}
                                    <div className="absolute -right-8 top-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60 animate-bounce duration-[3000ms]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <p className="text-xs font-bold text-textMain">Syncd with Google Cal</p>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}
