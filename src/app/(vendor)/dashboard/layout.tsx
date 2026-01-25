"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
    LayoutDashboard, Scissors, Calendar, Users, ShoppingBag,
    Star, Image as ImageIcon, Briefcase, AlertTriangle, X, LogOut, Search,
    Store, Menu, Settings
} from "lucide-react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { BookingNotificationBell } from "@/components/dashboard/BookingNotificationBell"; // 👈 IMPORT NEW COMPONENT
import { cn } from "@/lib/utils";

// --- Color Helpers ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : "124 58 237";
};

const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, href, isActive, onClick, className }: any) => (
    <Link
        href={href}
        onClick={onClick}
        className={cn(
            "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden z-10",
            isActive ? "text-white" : "text-slate-500 hover:text-slate-900",
            className
        )}
    >
        {/* ✨ Active State "Sliding Pill" Background */}
        {isActive && (
            <motion.div
                layoutId="active-sidebar-item"
                className="absolute inset-0 bg-brand rounded-xl -z-10 shadow-lg shadow-brand/20"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}

        {/* 🪄 Hover State (Subtle) */}
        {!isActive && (
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl -z-10" />
        )}

        {/* Icon Animation */}
        <motion.div
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.2 }}
        >
            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-brand")} />
        </motion.div>

        <span className="font-medium text-sm relative z-10">{label}</span>
    </Link>
);

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const impersonateId = searchParams.get('impersonate');

    // Layout State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data State
    const [viewedUser, setViewedUser] = useState<any>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);

    // --- Access Control & "God Mode" Logic (Shared in Layout) ---
    useEffect(() => {
        const initLayout = async () => {
            if (loading) return;

            if (!user) {
                // Let the page handle redirect if needed, or handle here
                return;
            }

            // 1. Setup Data Fetching (Real-time)
            let unsubscribe = () => { };

            const fetchProfile = (uid: string) => {
                const unsubscribeFn = onSnapshot(doc(db, "users", uid), (docSnap) => {
                    if (docSnap.exists()) {
                        setViewedUser({ uid: docSnap.id, ...docSnap.data() });
                    } else {
                        setViewedUser({ displayName: "Unknown User" });
                    }
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                });
                return unsubscribeFn;
            };

            // 2. Determine Request
            if (role === 'admin' && impersonateId) {
                setIsImpersonating(true);
                unsubscribe = fetchProfile(impersonateId);
            } else {
                // Normal Vendor
                unsubscribe = fetchProfile(user.uid);
            }

            return () => unsubscribe();
        };

        initLayout();
    }, [user, role, loading, impersonateId]); // IMPORTANT: Dependency array is correct

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Helper to construct links with impersonation param
    const getLink = (path: string) => {
        const base = `/dashboard${path}`;
        return impersonateId ? `${base}?impersonate=${impersonateId}` : base;
    };

    // Helper to check active state
    const isActive = (path: string) => {
        if (path === '' && pathname === '/dashboard') return true;
        if (path !== '' && pathname.startsWith(`/dashboard${path}`)) return true;
        return false;
    };

    // --- Dynamic Branding Vars ---
    const brandColor = viewedUser?.themeColor || "#7C3AED"; // Default Violet
    const brandStyles = {
        "--brand-primary": brandColor,
        "--brand-primary-soft": hexToRgb(brandColor),
        "--brand-primary-hover": adjustBrightness(brandColor, -10),
    } as React.CSSProperties;

    return (
        <div
            className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 relative selection:bg-brand/20 selection:text-brand"
            style={brandStyles}
        >
            {/* 1. Subtle Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand/5 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
            </div>

            {/* 2. MOBILE OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* 3. SIDEBAR */}
            {/* Desktop (Glassmorphism) */}
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-72 z-50 flex-col p-4">
                <div className="w-full h-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-[2.5rem] flex flex-col overflow-hidden ring-1 ring-white/60">
                    <SidebarContent
                        viewedUser={viewedUser}
                        isImpersonating={isImpersonating}
                        handleLogout={handleLogout}
                        getLink={getLink}
                        isActive={isActive}
                        closeMenu={() => setIsMobileMenuOpen(false)}
                        isMobile={false}
                    />
                </div>
            </aside>

            {/* Mobile Drawer (Spring Physics) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                        className="fixed top-0 left-0 h-screen w-[85vw] max-w-[300px] bg-white/95 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col md:hidden shadow-2xl"
                    >
                        <SidebarContent
                            viewedUser={viewedUser}
                            isImpersonating={isImpersonating}
                            handleLogout={handleLogout}
                            getLink={getLink}
                            isActive={isActive}
                            closeMenu={() => setIsMobileMenuOpen(false)}
                            isMobile={true}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* 4. MAIN CONTENT WRAPPER */}
            <main className="flex-1 md:ml-72 min-h-screen flex flex-col transition-all duration-300 relative z-10 text-slate-900">
                {/* Header (Glassy) */}
                <header className="h-20 sticky top-0 z-40 px-4 md:px-10 flex items-center justify-between">
                    {/* Glass Background for Header (Absolute to match padding) */}
                    <div className="absolute inset-x-4 md:inset-x-10 top-2 bottom-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm md:shadow-none -z-10 group-hover:shadow-md transition-shadow" />

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-white/50 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:flex relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand transition-colors" />
                        <input
                            placeholder="Search bookings, clients..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-transparent shadow-sm rounded-full text-sm focus:ring-2 focus:ring-brand/20 focus:bg-white outline-none transition-all placeholder:text-slate-400 hover:shadow-md"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 md:gap-6 ml-auto md:ml-0">
                        {/* 🔔 NEW NOTIFICATION BELL */}
                        <BookingNotificationBell />

                        {/* User Avatar (Mobile Only - Desktop is in Sidebar) */}
                        <div className="md:hidden w-9 h-9 rounded-full bg-slate-900 ring-2 ring-white text-white flex items-center justify-center text-xs font-bold shadow-lg">
                            {(viewedUser?.displayName?.[0] || 'V').toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Admin Banner */}
                {isImpersonating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-4 md:mx-10 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm"
                    >
                        <div className="flex items-center gap-2 text-amber-900 text-sm font-bold">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            Viewing Dashboard as {viewedUser?.displayName} (Admin Mode)
                        </div>
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 px-4 py-1.5 rounded-lg font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            Exit View
                        </button>
                    </motion.div>
                )}

                {/* PAGE CONTENT */}
                <div className="p-4 md:p-10 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Extracted for reusability between Desktop (Static) and Mobile (Animated) sidebars
const SidebarContent = ({ viewedUser, isImpersonating, handleLogout, getLink, isActive, closeMenu, isMobile }: any) => {
    return (
        <>
            {/* Logo Area */}
            <div className="h-24 flex items-center px-6 justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-900/10">
                        L
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">Luxe</span>
                        <span className="text-slate-400 text-xs font-medium tracking-widest uppercase">Salon</span>
                    </div>
                </div>
                {isMobile && (
                    <button onClick={closeMenu} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Live Shop */}
            <div className="px-4 pb-6 flex-shrink-0">
                <button
                    onClick={() => {
                        if (!viewedUser) return;
                        const hasSlug = viewedUser.slug && viewedUser.slug !== "";
                        const url = hasSlug
                            ? `${window.location.origin}/${viewedUser.slug}`
                            : `${window.location.origin}/shop/${viewedUser.uid}`;
                        window.open(url, '_blank');
                    }}
                    className="w-full group flex items-center justify-between px-4 py-3 bg-brand/5 border border-brand/10 text-brand rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-brand/10 hover:border-brand/30 transition-all duration-300"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform text-brand">
                            <Store className="w-3.5 h-3.5" />
                        </div>
                        Live Shop
                    </div>
                    <Search className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" href={getLink('')} isActive={isActive('')} onClick={closeMenu} />
                <SidebarItem icon={Scissors} label="Services" href={getLink('/services')} isActive={isActive('/services')} onClick={closeMenu} />
                <SidebarItem icon={Calendar} label="Bookings" href={getLink('/bookings')} isActive={isActive('/bookings')} onClick={closeMenu} />
                <SidebarItem icon={Users} label="Clients" href={getLink('/clients')} isActive={isActive('/clients')} onClick={closeMenu} />
                <SidebarItem icon={Briefcase} label="My Team" href={getLink('/team')} isActive={isActive('/team')} onClick={closeMenu} />
                <SidebarItem icon={ShoppingBag} label="Products" href={getLink('/products')} isActive={isActive('/products')} onClick={closeMenu} />
                <SidebarItem icon={Star} label="Reviews" href={getLink('/reviews')} isActive={isActive('/reviews')} onClick={closeMenu} />
                <SidebarItem icon={ImageIcon} label="Gallery" href={getLink('/gallery')} isActive={isActive('/gallery')} onClick={closeMenu} />
                <SidebarItem icon={Settings} label="Settings" href={getLink('/settings')} isActive={isActive('/settings')} onClick={closeMenu} />
            </div>

            {/* Profile */}
            <div className="p-4 mt-auto">
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm overflow-hidden relative group cursor-pointer">
                            {viewedUser?.logo || viewedUser?.photoURL ? (
                                <img src={viewedUser.logo || viewedUser.photoURL} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                (viewedUser?.displayName?.[0] || 'V').toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold text-slate-900 truncate">{viewedUser?.displayName || 'Vendor'}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isImpersonating ? "bg-amber-500" : "bg-green-500 animate-pulse"}`} />
                                <span className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold">
                                    {isImpersonating ? "Admin View" : "Online"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};