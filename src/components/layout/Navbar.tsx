"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    User as UserIcon,
    LogOut,
    Calendar,
    ChevronDown,
    Loader2,
    Store,
    Settings,
    Briefcase,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const { user, loading: authLoadingState } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // 🆕 User Profile State
    const [userProfile, setUserProfile] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🆕 Fetch User Profile on Auth Change
    useEffect(() => {
        if (!user) {
            setUserProfile(null);
            return;
        }

        setProfileLoading(true);
        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            } else {
                // Handle case where user auth exists but firestore doc doesn't (rare)
                setUserProfile({ role: 'customer', name: user.displayName });
            }
            setProfileLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setProfileLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleGoogleLogin = async () => {
        setIsSignInOpen(false);
        try {
            setAuthLoading(true);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push("/my-bookings");
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            setIsProfileOpen(false);
            setUserProfile(null);
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isVendor = userProfile?.role === 'vendor';

    // 🛑 Hide Navbar on Dashboard Routes
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/my-bookings')) {
        return null;
    }

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "fixed top-4 inset-x-0 mx-auto z-50 max-w-5xl rounded-full transition-all duration-300",
                "bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/5 ring-1 ring-white/50",
                scrolled && "bg-white/95 shadow-2xl shadow-purple-500/10 scale-[1.01] border-white/80"
            )}
        >
            <div className="px-6 md:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group relative z-50">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
                            L
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                            Luxe<span className="text-slate-400 font-normal">Salon</span>
                        </span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">

                        {/* Start Free Trial Button */}
                        {!isVendor && (
                            <Link
                                href="/signup"
                                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-2 group"
                            >
                                <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-primary transition-colors" />
                                For Business
                            </Link>
                        )}

                        {/* Auth Zone */}
                        <div className="relative">
                            {authLoadingState || profileLoading ? (
                                <div className="w-32 h-9 bg-slate-100 rounded-full animate-pulse flex items-center justify-center gap-2 px-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                                    <div className="h-2 w-16 bg-slate-200 rounded" />
                                </div>
                            ) : user ? (
                                // LOGGED IN STATE
                                <div className="relative">
                                    {isVendor ? (
                                        // 🟢 VENDOR VIEW
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden lg:block">
                                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                                    {userProfile?.businessName || userProfile?.name || "Luxe Vendor"}
                                                </p>
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-wide">Vendor Dashboard</p>
                                            </div>

                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Store className="w-3.5 h-3.5" />
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={handleSignOut}
                                                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors"
                                                title="Sign Out"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        // 🔵 CUSTOMER VIEW
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                                onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                                                className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200/60 hover:border-primary/30 transition-all bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md group"
                                            >
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div className="text-left flex flex-col justify-center h-full">
                                                    <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate group-hover:text-primary transition-colors leading-none mb-0.5">
                                                        {userProfile?.name || user.displayName?.split(" ")[0]}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium leading-none">Customer</span>
                                                </div>

                                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ml-1", isProfileOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isProfileOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute top-full right-0 mt-3 w-60 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-purple-500/10 border border-white/60 p-2 overflow-hidden ring-1 ring-black/5"
                                                    >
                                                        <div className="px-3 py-2 mb-2 border-b border-slate-100">
                                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                                            <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Link href="/my-bookings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                                                <Calendar className="w-4 h-4" /> My Bookings
                                                            </Link>
                                                            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                                                <Settings className="w-4 h-4" /> Settings
                                                            </Link>
                                                            <div className="h-px bg-slate-100 my-1" />
                                                            <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                                <LogOut className="w-4 h-4" /> Sign Out
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // LOGGED OUT STATE
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsSignInOpen(true)}
                                    onMouseLeave={() => setIsSignInOpen(false)}
                                >
                                    <button
                                        className={cn(
                                            "px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2",
                                            isSignInOpen && "bg-primary shadow-primary/30"
                                        )}
                                    >
                                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                        <ChevronDown className={cn("w-3.5 h-3.5 ml-1 transition-transform duration-300", isSignInOpen && "rotate-180")} />
                                    </button>

                                    <AnimatePresence>
                                        {isSignInOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/60 p-2 ring-1 ring-black/5"
                                            >
                                                <div className="space-y-1">
                                                    <button
                                                        onClick={handleGoogleLogin}
                                                        disabled={authLoading}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">For Customers</p>
                                                            <p className="text-xs text-slate-500">Book appointments</p>
                                                        </div>
                                                    </button>

                                                    <Link
                                                        href="/login"
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Store className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">For Salons</p>
                                                            <p className="text-xs text-slate-500">Manage your business</p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative z-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden fixed inset-0 top-0 bg-white/95 backdrop-blur-3xl z-40 pt-28 px-6 flex flex-col"
                    >
                        <div className="flex-1 space-y-6">
                            {/* Mobile Nav Links */}
                            <div className="space-y-2">
                                <Link
                                    href="/explore"
                                    className="flex items-center gap-4 text-xl font-bold text-slate-800 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5" />
                                    </span>
                                    Explore Salons
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex items-center gap-4 text-xl font-bold text-slate-800 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5" />
                                    </span>
                                    For Business
                                </Link>
                            </div>

                            <div className="w-full h-px bg-slate-100" />

                            {/* Mobile Auth */}
                            {user ? (
                                <div className="bg-slate-50 rounded-3xl p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-14 h-14 rounded-full border-2 border-white shadow-md relative z-10" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                                {user.displayName?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">{userProfile?.businessName || userProfile?.name || user.displayName}</p>
                                            <p className="text-sm text-slate-500 capitalize">{userProfile?.role || 'Customer'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {isVendor ? (
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="col-span-2 flex items-center gap-2 p-4 bg-slate-900 text-white rounded-2xl font-bold justify-center"
                                            >
                                                <Store className="w-6 h-6" />
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/my-bookings"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-700 active:scale-95 transition-transform"
                                            >
                                                <Calendar className="w-6 h-6 text-primary" />
                                                Bookings
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleSignOut}
                                            className={cn("flex flex-col items-center justify-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 font-bold text-red-600 active:scale-95 transition-transform", isVendor ? "col-span-2" : "")}
                                        >
                                            <LogOut className="w-6 h-6" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Sign In</p>
                                    <button
                                        onClick={() => {
                                            handleGoogleLogin();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-base font-bold text-slate-900">For Customers</p>
                                            <p className="text-xs text-slate-500">Google Sign-In</p>
                                        </div>
                                    </button>

                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-base font-bold text-slate-900">For Salons</p>
                                            <p className="text-xs text-slate-500">Business Login</p>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
