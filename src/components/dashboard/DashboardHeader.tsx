"use client";

import { useEffect, useState } from "react";
import { Edit2, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    salonName: string;
    profileUrl?: string | null;
    bannerUrl?: string | null;
}

export function DashboardHeader({ salonName, profileUrl, bannerUrl }: DashboardHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fallback Gradient if no banner
    const bannerStyle = bannerUrl
        ? { backgroundImage: `url(${bannerUrl})` }
        : { backgroundImage: "linear-gradient(to right bottom, #7c3aed, #6d28d9, #4c1d95)" }; // Violet to Indigo

    return (
        <>
            {/* 1. COLLAPSED STICKY HEADER (Visible only on scroll) */}
            <div
                className={cn(
                    "fixed top-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 left-0 md:left-[var(--header-left)]",
                    isScrolled ? "h-16 opacity-100 visible" : "h-0 opacity-0 invisible"
                )}
            >
                <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        {/* Mini Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-violet-100 flex items-center justify-center shrink-0">
                            {profileUrl ? (
                                <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-violet-700 font-bold text-xs">{salonName.charAt(0)}</span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{salonName}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <Link href="/dashboard/settings" className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all">
                            Manage
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. EXPANDED HERO BANNER (Hides on scroll) */}
            <div
                className={cn(
                    "relative w-full bg-cover bg-center transition-all duration-500 ease-in-out overflow-hidden origin-top",
                    // Added rounded-3xl and mx-4/md:mx-8 to create the card look with spacing
                    // Also added mt-4 to pull it away from top
                    isScrolled ? "h-0 opacity-0 mb-6" : "h-72 opacity-100 mb-0 mt-4 rounded-3xl mx-4 md:mx-8 w-auto"
                )}
                style={bannerStyle}
            >
                {/* Overlay Gradient */}
                {/* Rounded corners logic: overflow-hidden on parent handles it */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-8 px-6 md:px-8">
                    <div className="flex items-end justify-between max-w-7xl mx-auto w-full">
                        <div className="flex items-end gap-6">
                            {/* Big Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-black/20 overflow-hidden">
                                    {profileUrl ? (
                                        <img src={profileUrl} alt="Profile" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                                            {salonName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-purple-700 shadow-sm">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="mb-2 text-white">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none drop-shadow-md">{salonName}</h1>
                                <p className="text-white/80 font-medium text-sm mt-1">Premium Partner</p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3 mb-2">
                            <div className="text-right mr-4 text-white">
                                <div className="text-xs font-bold uppercase tracking-wider opacity-70">Status</div>
                                <div className="font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live
                                </div>
                            </div>
                            <Link href="/dashboard/settings" className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
