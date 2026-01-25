"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { cancelBooking } from "@/app/actions/bookings";
import { useCustomerBookings } from "@/hooks/useCustomerBookings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { Loader2, Calendar, Clock, MapPin, XCircle, CalendarDays, Moon, Sun, Search, LogOut, Info } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { SearchForm } from "@/components/shared/SearchForm";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/shared/NotificationBell";
import dynamic from "next/dynamic";
import { BookingDetailsModal } from "@/components/booking/BookingDetailsModal";

// 🚀 Optimization: Lazy load the Profile Modal so it doesn't slow down initial page load
const ProfileSettings = dynamic(
    () => import("@/components/customer/ProfileSettings").then((mod) => mod.ProfileSettings),
    { ssr: false }
);

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

export default function MyBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // ⚡️ Real-Time Data Hooks
    const { bookings, loading: bookingsLoading } = useCustomerBookings(user?.uid);
    // Pre-fetch profile data in background
    const { profile } = useUserProfile(user?.uid);

    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showProfile, setShowProfile] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    // Scroll progress for header effects
    const { scrollY } = useScroll();
    const headerBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(16px)"]);
    const headerBg = useTransform(scrollY, [0, 50], ["rgba(0,0,0,0)", theme === 'dark' ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"]);
    const headerBorder = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", theme === 'dark' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // 🛡️ MEMOIZATION MOVED UP (Fixes Rules of Hooks Error)
    // We calculate this BEFORE any return statements.
    const { upcomingBookings, historyBookings } = useMemo(() => {
        // Safety check: If data isn't loaded yet, return empty arrays
        if (!bookings) return { upcomingBookings: [], historyBookings: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings.filter(b => {
            const d = b.date && typeof (b.date as any).toDate === 'function' ? (b.date as any).toDate() : new Date(b.date as string);
            return d >= today && b.status !== 'cancelled' && b.status !== 'declined';
        });

        const history = bookings.filter(b => {
            const d = b.date && typeof (b.date as any).toDate === 'function' ? (b.date as any).toDate() : new Date(b.date as string);
            return d < today || ['cancelled', 'declined', 'completed'].includes(b.status);
        });

        return { upcomingBookings: upcoming, historyBookings: history };
    }, [bookings]); // Only re-run when 'bookings' changes

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleCancel = async (bookingId: string, vendorId: string) => {
        if (!user) return;
        if (!confirm("Are you sure you want to cancel this appointment?")) return;

        setCancellingId(bookingId);
        try {
            const res = await cancelBooking(bookingId, vendorId);
            if (!res.success) {
                alert("Failed to cancel booking.");
            }
        } catch (error) {
            console.error("Failed to cancel", error);
            alert("Failed to cancel booking. Please try again.");
        } finally {
            setCancellingId(null);
        }
    };

    // 🛑 Conditional Returns (Now safe because useMemo is above this)
    if (authLoading || bookingsLoading) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center transition-colors duration-500", theme === 'dark' ? "bg-black" : "bg-gray-50")}>
                <Loader2 className={cn("w-8 h-8 animate-spin", theme === 'dark' ? "text-white" : "text-primary")} />
            </div>
        );
    }

    if (!user) return null;

    const displayBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

    // Theme Classes
    const pageBg = theme === 'dark' ? "bg-[#0a0a0a]" : "bg-[#f8f9fc]";
    const textMain = theme === 'dark' ? "text-white" : "text-slate-900";
    const textMuted = theme === 'dark' ? "text-white/40" : "text-slate-500";
    const cardBg = theme === 'dark' ? "bg-[#111] hover:bg-[#161616]" : "bg-white hover:bg-white";
    const cardBorder = theme === 'dark' ? "border-white/5 group-hover:border-white/10" : "border-slate-200 group-hover:border-primary/20";
    const tabActive = theme === 'dark' ? "bg-white text-black" : "bg-slate-900 text-white";
    const tabInactive = theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-900";

    return (
        <div className={cn("min-h-screen transition-colors duration-500 font-sans selection:bg-primary/20", pageBg)}>

            {/* 🟢 Sticky Header */}
            <motion.div
                style={{ backdropFilter: headerBlur, backgroundColor: headerBg, borderBottom: `1px solid`, borderColor: headerBorder }}
                className="sticky top-0 z-50 w-full transition-all duration-300"
            >
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* Title & Toggle */}
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", theme === 'dark' ? "bg-white/10" : "bg-primary text-white")}>
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className={cn("text-xl font-bold tracking-tight", textMain)}>My Bookings</h1>
                                    <p className={cn("text-xs font-medium", textMuted)}>{upcomingBookings.length} Upcoming</p>
                                </div>
                            </motion.div>

                            {/* Mobile Actions */}
                            <div className="flex md:hidden items-center gap-2">
                                <NotificationBell />
                                <button
                                    onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                    className={cn("p-2 rounded-full transition-all", theme === 'dark' ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700")}
                                >
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setShowProfile(true)}
                                    className={cn("p-2 rounded-full transition-all", theme === 'dark' ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700")}
                                >
                                    {profile?.photoURL || user.photoURL ? (
                                        <img src={profile?.photoURL || user.photoURL || ""} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", theme === 'dark' ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                                            {(user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className={cn("p-2 rounded-full transition-all text-red-500", theme === 'dark' ? "bg-red-500/10" : "bg-red-50")}
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar (Tablet/Desktop) */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="hidden md:block flex-1 max-w-md mx-auto"
                        >
                            <div className={cn("relative group rounded-xl transition-all", theme === 'dark' ? "bg-white/5 focus-within:bg-white/10" : "bg-white border border-slate-200 shadow-sm")}>
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className={cn("w-4 h-4", textMuted)} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Jump to a booking or vendor..."
                                    className={cn("w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-0 placeholder:text-muted-foreground/50", theme === 'dark' ? "text-white placeholder:text-white/50" : "text-slate-900")}
                                />
                            </div>
                        </motion.div>

                        {/* Actions (Desktop) */}
                        <div className="hidden md:flex items-center gap-3">
                            <NotificationBell />
                            <button
                                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                className={cn("p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm", theme === 'dark' ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50")}
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={() => setShowProfile(true)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center gap-2 text-sm font-bold border",
                                    theme === 'dark'
                                        ? "bg-white/10 text-white border-white/5 hover:bg-white/20"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                )}
                                title="Profile Settings"
                            >
                                {profile?.photoURL || user.photoURL ? (
                                    <img src={profile?.photoURL || user.photoURL || ""} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", theme === 'dark' ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                                        {(user.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden lg:inline">{profile?.name || user.displayName || user.email?.split('@')[0]}</span>
                            </button>

                            <button
                                onClick={handleSignOut}
                                className={cn("p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm", theme === 'dark' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-white text-red-500 border border-slate-200 hover:bg-red-50")}
                                title="Sign Out"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search (Below Header) */}
                    <div className="md:hidden mt-4">
                        <div className={cn("relative rounded-xl", theme === 'dark' ? "bg-white/5" : "bg-white border border-slate-200")}>
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className={cn("w-4 h-4", textMuted)} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className={cn("w-full bg-transparent border-none py-2 pl-10 pr-4 text-sm font-medium focus:ring-0", textMain)}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>


            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 space-y-8">

                {/* 🌟 Call to Action / Explore Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                        "relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl",
                        theme === 'dark' ? "bg-gradient-to-br from-primary/20 via-[#111] to-[#0a0a0a] border border-white/5" : "bg-gradient-to-br from-white via-[#f0f4ff] to-white border border-white shadow-indigo-100"
                    )}
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                            <Clock className="w-3 h-3" /> New Appointment
                        </div>
                        <h2 className={cn("text-2xl md:text-3xl font-bold tracking-tight", textMain)}>Ready for your next look?</h2>
                        <p className={cn("text-sm md:text-base max-w-lg mx-auto md:mx-0", textMuted)}>
                            Discover top-rated salons and book your next appointment in seconds.
                        </p>
                    </div>

                    <div className="relative z-10 w-full md:w-auto min-w-[300px]">
                        <SearchForm variant="compact" className={cn("shadow-lg", theme === 'dark' ? "bg-black/50 border-white/10" : "bg-white border-slate-100")} />
                    </div>
                </motion.div>


                {/* Tabs */}
                <div className="flex items-center justify-center md:justify-start">
                    <div className={cn("p-1 rounded-xl border flex items-center gap-1", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm")}>
                        {(['upcoming', 'history'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2",
                                    activeTab === tab ? cn("shadow-md scale-105", tabActive) : tabInactive
                                )}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4 pb-20">
                    <AnimatePresence mode="popLayout">
                        {displayBookings.length > 0 ? (
                            displayBookings.map((booking, index) => {
                                const dateObj = booking.date && typeof (booking.date as any).toDate === 'function'
                                    ? (booking.date as any).toDate()
                                    : new Date(booking.date as string);

                                return (
                                    <motion.div
                                        key={booking.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "group relative overflow-hidden rounded-2xl border p-5 md:p-6 transition-all duration-300 hover:shadow-xl",
                                            cardBg, cardBorder,
                                            theme === 'light' ? "shadow-sm" : ""
                                        )}
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                            {/* Date Block */}
                                            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 md:w-32 md:border-r pr-4 transition-colors border-dashed" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-inner font-bold border",
                                                    theme === 'dark' ? "bg-white/5 border-white/5 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                                                )}>
                                                    <span className="text-[10px] uppercase opacity-60 leading-none mb-0.5">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                    <span className="text-xl leading-none">{dateObj.getDate()}</span>
                                                </div>
                                                <div className="text-left md:mt-1">
                                                    <p className={cn("text-lg font-bold", textMain)}>
                                                        {booking.time ? new Date(`2000-01-01T${booking.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "--:--"}
                                                    </p>
                                                    <p className={cn("text-xs font-bold uppercase tracking-wider", textMuted)}>
                                                        {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className={cn("text-xl font-bold mb-1 group-hover:text-primary transition-colors", textMain)}>{booking.serviceName}</h3>
                                                        <div className="flex items-center gap-2 text-sm font-medium opacity-80" style={{ color: theme === 'dark' ? '#aaa' : '#666' }}>
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            <span>Luxe Salon, Downtown</span> {/* Placeholder for vendor name if not in booking object directly, assumed Luxe for now */}
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm",
                                                        booking.status === 'confirmed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                            booking.status === 'cancelled' || booking.status === 'declined' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                    )}>
                                                        {booking.status === 'confirmed' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <p className={cn("text-sm font-semibold", textMuted)}>{formatPrice(booking.price)}</p>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border",
                                                                theme === 'dark'
                                                                    ? "border-white/10 text-gray-300 hover:bg-white/5"
                                                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                            Details
                                                        </button>

                                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'declined' && activeTab === 'upcoming' && (
                                                            <button
                                                                onClick={() => handleCancel(booking.id, booking.vendorId)}
                                                                disabled={cancellingId === booking.id}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border",
                                                                    theme === 'dark'
                                                                        ? "border-red-500/20 text-red-400 hover:bg-red-950/30"
                                                                        : "border-red-200 text-red-600 hover:bg-red-50"
                                                                )}
                                                            >
                                                                {cancellingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    "text-center py-24 rounded-3xl border border-dashed flex flex-col items-center justify-center",
                                    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                )}
                            >
                                <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6", theme === 'dark' ? "bg-white/5" : "bg-white shadow-md")}>
                                    <Calendar className={cn("w-10 h-10 opacity-50", textMuted)} />
                                </div>
                                <h3 className={cn("text-xl font-bold mb-2", textMain)}>No appointments found</h3>
                                <p className={cn("text-sm max-w-xs mx-auto", textMuted)}>
                                    {activeTab === 'upcoming' ? "You don't have any upcoming bookings. Time to treat yourself?" : "You haven't completed any appointments yet."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {showProfile && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfile(false)}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="w-full max-w-lg pointer-events-auto">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfile(false)}
                                        className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all pointer-events-auto"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                    <ProfileSettings initialData={profile} onClose={() => setShowProfile(false)} />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Booking Details Modal */}
            <BookingDetailsModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />
        </div>
    );
}