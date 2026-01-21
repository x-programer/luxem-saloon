"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-secondary to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                    {/* Text Content */}
                    <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-textMain leading-tight mb-6"
                        >
                            The Operating System for <span className="text-primary">Modern Salons</span>.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-lg text-textMuted mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                        >
                            Manage bookings, showcase your portfolio, and grow your brand with a stunning profile.
                            Built for beauty professionals who demand excellence.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-soft hover:shadow-glow hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
                            >
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="#demo"
                                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-primary/20 text-primary rounded-full font-semibold hover:bg-primary/5 transition-all flex items-center justify-center"
                            >
                                View Demo
                            </Link>
                        </motion.div>
                    </div>

                    {/* Visual Content (Glassmorphism Card) */}
                    <div className="lg:col-span-6 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative mx-auto max-w-sm lg:max-w-md w-full"
                        >
                            {/* Background Blob */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                            {/* Glass Card */}
                            <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl">
                                {/* Header of fake app */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-primary font-bold">LS</div>
                                        <div>
                                            <h3 className="font-semibold text-textMain">Luxe Salon</h3>
                                            <p className="text-xs text-textMuted">Admin Dashboard</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Bell className="w-5 h-5 text-textMuted" />
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    </div>
                                </div>

                                {/* Notifications Mockup */}
                                <div className="space-y-4">
                                    <div className="bg-white/80 p-4 rounded-2xl shadow-sm border border-white/50 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">S</div>
                                        <div>
                                            <p className="text-sm font-medium text-textMain">New Booking Confirmed</p>
                                            <p className="text-xs text-textMuted mt-0.5">Sarah J. for Haircut & Style • 2:00 PM</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 p-4 rounded-2xl shadow-sm border border-white/50 flex items-start gap-3 opacity-90">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">M</div>
                                        <div>
                                            <p className="text-sm font-medium text-textMain">New Review Received</p>
                                            <p className="text-xs text-textMuted mt-0.5">"Absolutely loved the service! Best in town."</p>
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-textMain">Daily Revenue</p>
                                            <p className="text-2xl font-bold text-primary mt-1">$1,240.00</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating "New" badge */}
                                <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce duration-[2000ms]">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-primary">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-textMain">Just now</p>
                                        <p className="text-xs text-textMuted">Booking sync active</p>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
