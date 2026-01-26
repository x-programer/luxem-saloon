"use client";

import { useState, useEffect, useRef } from "react";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { Calendar, Clock, MapPin, Star, Share2, X, ShoppingBag, Instagram, Facebook, Globe, Youtube, Twitter, Quote, ArrowRight, Check, CheckCircle2, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BookingModal } from "./BookingModal";
import { ReviewList } from "@/components/public/ReviewList";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- Types ---
interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    duration: string;
    category: string;
}

interface VendorData {
    uid: string;
    businessName: string;
    description: string;
    themePreference: string;
    themeColor: string;
    profileImage: string;
    banner?: string;
    logo?: string;
    showLogo?: boolean;
    address: string;
    gallery: string[];
    services: Service[];
    staff?: any[];
    products?: any[];
    schedule: any;
    isBookingEnabled: boolean;
    platformStatus?: 'active' | 'shadow_banned' | 'suspended' | 'pending_verification';
    externalLinks?: {
        id: string;
        platform: "instagram" | "facebook" | "twitter" | "youtube" | "website" | "shop";
        url: string;
        label: string;
    }[];
}

// --- Helpers ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : "124 58 237";
};

// --- Main Component ---
export default function PublicProfileClient({ vendor }: { vendor: VendorData }) {
    const [cart, setCart] = useState<Service[]>([]);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("about");
    const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark Mode

    // Scroll & Parallax
    const { scrollY } = useScroll();
    const bannerY = useTransform(scrollY, [0, 500], [0, 200]); // Parallax Effect
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    // Refs for Scroll Spy
    const aboutRef = useRef<HTMLElement>(null);
    const servicesRef = useRef<HTMLElement>(null);
    const reviewsRef = useRef<HTMLElement>(null);
    const galleryRef = useRef<HTMLElement>(null);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + 200; // Offset
            if (galleryRef.current && scrollPos >= galleryRef.current.offsetTop) setActiveSection("gallery");
            else if (reviewsRef.current && scrollPos >= reviewsRef.current.offsetTop) setActiveSection("reviews");
            else if (servicesRef.current && scrollPos >= servicesRef.current.offsetTop) setActiveSection("services");
            else setActiveSection("about");
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Toggle service
    const toggleService = (service: Service, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            // e.preventDefault();
        }

        console.log("🖱️ Toggling Service:", service.name);

        // Respect Vendor Settings: If disabled, do not allow adding
        if (!vendor.isBookingEnabled) {
            console.warn("🚫 Booking is disabled by the vendor.");
            // Optional: Add toast here if you have a toast library available in this scope
            return;
        }

        setCart(prev => {
            const exists = prev.find(s => s.id === service.id);
            const newCart = exists
                ? prev.filter(s => s.id !== service.id)
                : [...prev, service];

            console.log("🛒 Cart Updated. New Items:", newCart);
            return newCart;
        });
    };

    // Dynamic Style Variables
    const brandColor = vendor.themeColor || "#7C3AED";
    const styleVars = {
        "--brand": brandColor,
        "--brand-rgb": hexToRgb(brandColor),
    } as React.CSSProperties;

    // Filter Services by Category
    const categories = Array.from(new Set(vendor.services.map(s => s.category || "General")));

    return (
        <ThemeWrapper theme={vendor.themePreference as any}>
            <div
                className={cn(
                    "min-h-screen transition-colors duration-500 pb-20 md:pb-0 font-sans",
                    isDarkMode ? "bg-[#121212] text-white selection:bg-[rgb(var(--brand-rgb))]/30" : "bg-[#F9F9F7] text-gray-900 selection:bg-[rgb(var(--brand-rgb))]/20"
                )}
                style={styleVars}
            >
                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                        "fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all hover:scale-110",
                        isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                    )}
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>

                {/* 1. HERO SECTION (Parallax) */}
                <header className="relative h-[65vh] min-h-[500px] overflow-hidden">
                    <motion.div style={{ y: bannerY, opacity: opacityHero }} className="absolute inset-0 z-0">
                        <Image
                            src={vendor.banner || vendor.profileImage || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className={cn("absolute inset-0 bg-gradient-to-t transition-colors duration-500", isDarkMode ? "from-[#121212] via-[#121212]/40" : "from-[#F9F9F7] via-[#F9F9F7]/40", "to-transparent")} />
                        <div className="absolute inset-0 bg-black/20" /> {/* Dimmer */}
                    </motion.div>

                    <div className="absolute inset-0 flex items-end z-10 pb-12">
                        <div className="container mx-auto px-4 md:px-8">
                            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-4xl">
                                {/* Logo */}
                                {(vendor.showLogo !== false && vendor.logo) ? (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden bg-black/50 backdrop-blur-xl relative mb-6">
                                        <Image src={vendor.logo} alt="Logo" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-white mb-6">
                                        <span className="text-4xl font-bold">{vendor.businessName.charAt(0)}</span>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgb(var(--brand-rgb))]/20 backdrop-blur-md rounded-full text-[rgb(var(--brand-rgb))] text-xs font-bold border border-[rgb(var(--brand-rgb))]/20 uppercase tracking-widest shadow-lg">
                                        <Star className="w-3 h-3 fill-current" /> Premium Partner
                                    </span>
                                    {vendor.isBookingEnabled ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Open
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-gray-400 text-xs font-bold border border-white/10 uppercase tracking-widest">
                                            Closed
                                        </span>
                                    )}
                                </div>

                                <h1 className={cn("text-4xl md:text-7xl font-black mb-4 tracking-tight leading-none drop-shadow-lg", isDarkMode ? "text-white" : "text-gray-900")}>
                                    {vendor.businessName}
                                </h1>
                                <p className={cn("text-lg md:text-xl font-light max-w-2xl flex items-center gap-2", isDarkMode ? "text-white/80" : "text-gray-700")}>
                                    <MapPin className="w-4 h-4 text-[rgb(var(--brand-rgb))]" /> {vendor.address}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* 2. STICKY NAVIGATION */}
                <div className={cn("sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300", isDarkMode ? "bg-[#121212]/80 border-white/5" : "bg-white/80 border-gray-200")}>
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3">
                            {['about', 'services', 'reviews', 'gallery'].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => scrollTo(section)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                                        activeSection === section
                                            ? "bg-[rgb(var(--brand-rgb))] text-white shadow-lg shadow-[rgb(var(--brand-rgb))]/25"
                                            : (isDarkMode ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900")
                                    )}
                                >
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. MAIN CONTENT GRID */}
                <div className="container mx-auto px-4 md:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* LEFT COLUMN (Content) */}
                        <div className="lg:col-span-8 space-y-16">

                            {/* ABOUT */}
                            <section id="about" ref={aboutRef} className="scroll-mt-32">
                                <h2 className={cn("text-2xl font-bold mb-6 flex items-center gap-2", isDarkMode ? "text-white" : "text-gray-900")}>About Us</h2>
                                <p className={cn("text-lg leading-relaxed font-light", isDarkMode ? "text-gray-300" : "text-gray-600")}>{vendor.description}</p>
                            </section>

                            {/* SERVICES (Grid Layout) */}
                            <section id="services" ref={servicesRef} className="scroll-mt-32">
                                <h2 className={cn("text-3xl font-bold mb-8", isDarkMode ? "text-white" : "text-gray-900")}>Services</h2>

                                <div className="space-y-10">
                                    {categories.map((category) => (
                                        <div key={category}>
                                            <h3 className="text-xl font-bold text-[rgb(var(--brand-rgb))] mb-4 flex items-center gap-2">
                                                <span className="w-8 h-[2px] bg-[rgb(var(--brand-rgb))] opacity-50" /> {category}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {vendor.services.filter(s => s.category === category).map((service) => {
                                                    const isSelected = cart.some(s => s.id === service.id);
                                                    return (
                                                        <motion.div
                                                            key={service.id}
                                                            whileHover={{ y: -5 }}
                                                            className={cn(
                                                                "group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden select-none",
                                                                isSelected
                                                                    ? "bg-[rgb(var(--brand-rgb))]/10 border-[rgb(var(--brand-rgb))]/50 shadow-lg shadow-[rgb(var(--brand-rgb))]/10"
                                                                    : (isDarkMode ? "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl")
                                                            )}
                                                            onClick={(e) => toggleService(service, e)}
                                                        >
                                                            {/* Selected Indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-4 right-4 text-[rgb(var(--brand-rgb))]">
                                                                    <CheckCircle2 className="w-6 h-6 fill-[rgb(var(--brand-rgb))]/20" />
                                                                </div>
                                                            )}

                                                            <h4 className={cn("font-bold text-lg mb-1 pr-8", isSelected ? "text-[rgb(var(--brand-rgb))]" : (isDarkMode ? "text-white" : "text-gray-900"))}>{service.name}</h4>
                                                            <div className="flex items-center gap-3 text-xs font-medium text-gray-400 mb-3">
                                                                <span className={cn("px-2 py-1 rounded-md", isDarkMode ? "bg-white/5" : "bg-gray-100")}>{service.duration} mins</span>
                                                                {service.description && <span className="truncate max-w-[120px]">{service.description}</span>}
                                                            </div>

                                                            <div className="flex items-end justify-between mt-auto">
                                                                <div className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>₹{service.price}</div>
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-xl text-xs font-bold transition-colors z-20 relative",
                                                                        !vendor.isBookingEnabled ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                                                                            isSelected
                                                                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                                                : "bg-gray-100 text-gray-900 group-hover:bg-[rgb(var(--brand-rgb))] group-hover:text-white"
                                                                    )}
                                                                    disabled={!vendor.isBookingEnabled}
                                                                    onClick={(e) => toggleService(service, e)}
                                                                >
                                                                    {isSelected ? "Remove" : (!vendor.isBookingEnabled ? "Closed" : "Add")}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* REVIEWS */}
                            <section id="reviews" ref={reviewsRef} className="scroll-mt-32">
                                <ReviewList vendorId={vendor.uid} isDarkMode={isDarkMode} />
                            </section>

                            {/* GALLERY */}
                            {vendor.gallery.length > 0 && (
                                <section id="gallery" ref={galleryRef} className="scroll-mt-32">
                                    <h2 className={cn("text-2xl font-bold mb-6", isDarkMode ? "text-white" : "text-gray-900")}>Gallery</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
                                        {vendor.gallery.slice(0, 8).map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.02 }}
                                                className={cn(
                                                    "relative rounded-2xl overflow-hidden cursor-zoom-in group",
                                                    isDarkMode ? "bg-white/5" : "bg-gray-100",
                                                    idx === 0 ? "col-span-2 row-span-2" : ""
                                                )}
                                                onClick={() => setSelectedImage(img)}
                                            >
                                                <Image src={img} alt="Gallery" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" sizes="50vw" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* RIGHT COLUMN (Sticky Sidebar) */}
                        <div className="hidden lg:block lg:col-span-4 relative">
                            <div className="sticky top-24 space-y-6">

                                {/* Info Card */}
                                <div className={cn("p-6 rounded-3xl border backdrop-blur-xl", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-xl")}>
                                    <h3 className={cn("font-bold text-lg mb-4 flex items-center gap-2", isDarkMode ? "text-white" : "text-gray-900")}>
                                        <Clock className="w-5 h-5 text-[rgb(var(--brand-rgb))]" /> Hours
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                            <div key={day} className="flex justify-between text-gray-400">
                                                <span className="capitalize w-24">{day}</span>
                                                {vendor.schedule?.[day]?.isOpen ? (
                                                    <span className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{vendor.schedule[day].start} - {vendor.schedule[day].end}</span>
                                                ) : (
                                                    <span className="text-red-400/80">Closed</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex gap-2">
                                        <button className={cn("flex-1 py-3 rounded-xl font-bold text-xs transition-colors", isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900")}>
                                            Get Directions
                                        </button>
                                        <button className={cn("flex-1 py-3 rounded-xl font-bold text-xs transition-colors", isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900")}>
                                            Share Profile
                                        </button>
                                    </div>
                                </div>

                                {/* DESKTOP CART SUMMARY */}
                                <AnimatePresence>
                                    {cart.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="p-6 rounded-3xl bg-[rgb(var(--brand-rgb))]/10 border border-[rgb(var(--brand-rgb))]/20 backdrop-blur-xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--brand-rgb))]/20 rounded-full blur-3xl -z-10" />

                                            <h3 className={cn("font-bold text-lg mb-4", isDarkMode ? "text-white" : "text-gray-900")}>Your Booking</h3>
                                            <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                {cart.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className={cn("truncate", isDarkMode ? "text-gray-300" : "text-gray-600")}>{item.name}</span>
                                                        <span className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>₹{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-4 border-t border-white/10 flex justify-between items-end mb-6">
                                                <div className="text-sm text-gray-400">Total Estimate</div>
                                                <div className={cn("text-2xl font-black", isDarkMode ? "text-white" : "text-gray-900")}>₹{cart.reduce((sum, item) => sum + item.price, 0)}</div>
                                            </div>

                                            <button
                                                onClick={() => setIsBookingOpen(true)}
                                                className="w-full py-4 rounded-xl bg-[rgb(var(--brand-rgb))] text-white font-bold shadow-lg shadow-[rgb(var(--brand-rgb))]/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                Book Appointment <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. MOBILE FLOATING CART */}
                <AnimatePresence>
                    {cart.length > 0 && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden"
                        >
                            <div className={cn("rounded-2xl shadow-2xl p-4 border flex items-center justify-between", isDarkMode ? "bg-[#1a1a1a] border-white/10 ring-1 ring-white/5" : "bg-white border-gray-100")}>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{cart.length} Services</div>
                                    <div className={cn("text-xl font-black", isDarkMode ? "text-white" : "text-gray-900")}>₹{cart.reduce((sum, item) => sum + item.price, 0)}</div>
                                </div>
                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="px-8 py-3 bg-[rgb(var(--brand-rgb))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--brand-rgb))]/20 hover:scale-105 transition-transform"
                                >
                                    Review & Book
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODALS */}
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    vendorId={vendor.uid}
                    services={cart}
                    schedule={vendor.schedule}
                />

                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        >
                            <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full"><X /></button>
                            <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div >
        </ThemeWrapper >
    );
}
