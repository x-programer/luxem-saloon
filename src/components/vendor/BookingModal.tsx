"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // 👈 Added for redirection
import { X, Calendar, Clock, User, Phone, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { createBooking } from "@/app/actions/bookings";
import { getDayAvailability } from "@/app/actions/availability"; // 👈 Import availability action
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    services: any[]; // 👈 Changed from 'service'
    schedule: any;
}

export function BookingModal({ isOpen, onClose, vendorId, services, schedule }: BookingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // State for "Lazy Auth"
    const [isAuthStep, setIsAuthStep] = useState(false);

    // State for Availability
    const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const { user } = useAuth();

    // 🧮 CALCULATE TOTALS
    const totalDuration = services.reduce((acc, s) => acc + (parseInt(s.duration) || 30), 0) || 30;
    const totalPrice = services.reduce((acc, s) => acc + (s.price || 0), 0);
    const serviceNames = services.map(s => s.name).join(" + ") || "General Inquiry";

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsAuthStep(false);
            setError("");
        }
    }, [isOpen]);

    // PRE-FILL User Data (only if empty)
    useEffect(() => {
        if (user && user.displayName) {
            setName((prev) => prev || user.displayName || "");
        }
    }, [user]);

    // ⚡️ FETCH AVAILABILITY when date changes
    useEffect(() => {
        if (!date || !vendorId) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setAvailableSlots([]);
            setTime(""); // Reset time selection on date change
            try {
                // Pass TOTAL duration
                const slots = await getDayAvailability(vendorId, date, totalDuration);
                setAvailableSlots(slots);
            } catch (err) {
                console.error("Failed to load slots", err);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, vendorId, totalDuration]); // 👈 Added totalDuration as dep

    const validateInputs = () => {
        if (!date || !time || !name || !phone) {
            throw new Error("Please fill in all fields.");
        }

        const dateObj = new Date(date);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[dateObj.getDay()];

        if (schedule && schedule[dayName] && !schedule[dayName].isOpen) {
            throw new Error(`We are closed on ${dayName}s. Please choose another date.`);
        }

        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (appointmentDateTime < now) {
            throw new Error("You cannot book an appointment in the past.");
        }
    };

    // ⚡️ WRAPPED IN useCallback to prevent useEffect loops
    const processBooking = useCallback(async () => {
        setIsSubmitting(true);
        setError("");

        try {
            validateInputs();

            if (!user) throw new Error("Authentication missing.");

            // Call Server Action with BUNDLE DATA
            await createBooking({
                vendorId,
                customerId: user.uid,
                customerEmail: user.email,
                customerName: name,
                customerPhone: phone,
                serviceId: services.length === 1 ? services[0].id : "bundle",
                serviceName: serviceNames,
                services: services.map(s => ({
                    id: s.id,
                    name: s.name,
                    price: s.price,
                    duration: parseInt(s.duration) || 30
                })),
                duration: totalDuration,
                date,
                time,
                price: totalPrice,
            });

            setStep(2); // Show Success View
            setIsAuthStep(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to book appointment.");
            setIsAuthStep(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [user, vendorId, services, date, time, name, phone, totalDuration, totalPrice, serviceNames]);

    // ⚡️ AUTO-RESUME: Triggers when User logs in during Auth Step
    useEffect(() => {
        if (isAuthStep && user && !isSubmitting) {
            processBooking();
        }
    }, [user, isAuthStep, processBooking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            validateInputs();

            // Check Auth
            if (!user) {
                setIsAuthStep(true); // Switch to "Just-in-Time" Login
                return;
            }

            // If logged in, process immediately
            await processBooking();

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // The useEffect above will catch the new 'user' and trigger processBooking
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user') {
                console.log("User cancelled booking login.");
                return;
            }
            console.error("Login Error:", err);
            setError("Failed to sign in. Please try again.");
        }
    };

    const handleQuickDate = (offset: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        setDate(d.toISOString().split('T')[0]);
    };

    // Navigation helper for success state
    const goToMyBookings = () => {
        onClose();
        router.push("/my-bookings");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
                    >
                        <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative min-h-[500px] flex flex-col">
                            {/* Header */}
                            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl text-white">
                                        {step === 2 ? "Booking Confirmed" : isAuthStep ? "Sign in to Finish" : "Book Appointment"}
                                    </h3>
                                    {step === 1 && !isAuthStep && (
                                        <div className="mt-1">
                                            <p className="text-sm text-white font-medium">{serviceNames}</p>
                                            <p className="text-xs text-gray-400">Total: {totalDuration} mins • ₹{totalPrice}</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 relative">
                                <AnimatePresence mode="wait">
                                    {/* STATE 1: BOOKING FORM */}
                                    {step === 1 && !isAuthStep ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            {error && (
                                                <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-200 text-sm rounded-xl flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-400" /> {error}
                                                </div>
                                            )}

                                            {/* Date Selection */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                                                <div className="flex gap-2 mb-2">
                                                    <button type="button" onClick={() => handleQuickDate(0)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors">Today</button>
                                                    <button type="button" onClick={() => handleQuickDate(1)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors">Tomorrow</button>
                                                </div>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-luxe-primary" />
                                                    <input
                                                        type="date"
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base focus:ring-2 focus:ring-luxe-primary/50 focus:border-luxe-primary outline-none transition-all placeholder:text-gray-600 dark-calendar-icon"
                                                    />
                                                </div>
                                            </div>

                                            {/* Time Selection */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</label>

                                                {!date ? (
                                                    <div className="text-sm text-gray-500 italic p-3 bg-white/5 rounded-xl border border-white/5">
                                                        Please select a date first.
                                                    </div>
                                                ) : loadingSlots ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 p-3">
                                                        <Loader2 className="w-4 h-4 animate-spin text-luxe-primary" />
                                                        Checking availability...
                                                    </div>
                                                ) : availableSlots.length === 0 ? (
                                                    <div className="text-sm text-gray-400 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-gray-500" />
                                                        No slots available on this date.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {availableSlots.map((slot) => (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                disabled={!slot.available}
                                                                onClick={() => setTime(slot.time)}
                                                                className={`
                                                                    px-2 py-2 rounded-lg text-sm font-bold border transition-all flex justify-center items-center
                                                                    ${time === slot.time
                                                                        ? "bg-luxe-primary border-luxe-primary text-white shadow-lg shadow-luxe-primary/20"
                                                                        : slot.available
                                                                            ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                                                            : "bg-transparent border-transparent text-gray-600 cursor-not-allowed opacity-50 decoration-slate-600"
                                                                    }
                                                                `}
                                                            >
                                                                {slot.time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4 pt-2">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            required
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="John Doe"
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base focus:ring-2 focus:ring-luxe-primary/50 focus:border-luxe-primary outline-none transition-all placeholder:text-gray-700"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            placeholder="+1 (555) 000-0000"
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-base focus:ring-2 focus:ring-luxe-primary/50 focus:border-luxe-primary outline-none transition-all placeholder:text-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 rounded-xl bg-luxe-primary text-white font-bold text-lg shadow-lg shadow-luxe-primary/25 hover:bg-luxe-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Confirm Booking"
                                                    )}
                                                </button>
                                            </div>
                                        </motion.form>
                                    )

                                        /* STATE 2: AUTH / LOGIN */
                                        : isAuthStep ? (
                                            <motion.div
                                                key="auth"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex flex-col items-center justify-center h-full space-y-8 py-8"
                                            >
                                                <div className="text-center space-y-2">
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                        <User className="w-8 h-8 text-luxe-primary" />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white">Almost there!</h4>
                                                    <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                                                        Please sign in to complete your booking. We'll save your details automatically.
                                                    </p>
                                                </div>

                                                <div className="w-full max-w-xs space-y-3">
                                                    <button
                                                        onClick={handleGoogleLogin}
                                                        className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                                                    >
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                        </svg>
                                                        Sign in with Google
                                                    </button>

                                                    <button
                                                        onClick={() => setIsAuthStep(false)}
                                                        className="w-full py-3 text-gray-500 text-xs font-medium hover:text-white transition-colors"
                                                    >
                                                        Go Back
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )

                                            /* STATE 3: SUCCESS */
                                            : (
                                                <motion.div
                                                    key="success"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-center py-8 space-y-6"
                                                >
                                                    <div className="w-20 h-20 bg-green-950/30 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-white">Request Sent!</h4>
                                                        <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-[260px] mx-auto">
                                                            Your appointment is pending confirmation. You can track it in your dashboard.
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <button
                                                            onClick={goToMyBookings}
                                                            className="w-full py-3 rounded-xl bg-luxe-primary text-white font-bold text-sm hover:bg-luxe-primary/90 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            View My Bookings <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={onClose}
                                                            className="w-full py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                </AnimatePresence>

                                {/* Loading Overlay */}
                                {isSubmitting && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-3xl z-50 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-luxe-primary animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}