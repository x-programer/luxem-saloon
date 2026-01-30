"use client";

import { useState, useEffect, useRef } from "react";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { Calendar, Clock, MapPin, Star, Share2, X, ShoppingBag, Instagram, Facebook, Globe, Youtube, Twitter, Quote, ArrowRight, Check, CheckCircle2, Sun, Moon, Ban, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BookingModal } from "./BookingModal";
import { ReviewList } from "@/components/public/ReviewList";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CompactServiceItem } from "./CompactServiceItem";
import { ServiceCategoryNav } from "./ServiceCategoryNav";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" />
});

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
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
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
            if (galleryRef.current && scrollPos >= galleryRef.current.offsetTop) setActiveSection("gallery");
            else if (reviewsRef.current && scrollPos >= reviewsRef.current.offsetTop) setActiveSection("reviews");
            else if (servicesRef.current && scrollPos >= servicesRef.current.offsetTop) setActiveSection("services");
            else if (document.getElementById("location") && scrollPos >= document.getElementById("location")!.offsetTop) setActiveSection("location");
            else setActiveSection("about");
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            // Adjust offset for sticky headers
            const offset = 120;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    // Toggle service
    const toggleService = (service: Service, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            // e.preventDefault();
        }

        console.log("🖱️ Toggling Service:", service.name);

        // Respect Vendor Settings: If disabled or suspended, do not allow adding
        if (!vendor.isBookingEnabled || vendor.platformStatus === 'suspended' || vendor.platformStatus === 'shadow_banned') {
            console.warn("🚫 Booking is disabled or vendor is suspended.");
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
                        {/* SUSPENSION OVERLAY */}
                        {(vendor.platformStatus === 'suspended' || vendor.platformStatus === 'shadow_banned') && (
                            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="text-center p-8 border border-white/10 rounded-3xl bg-[#121212] max-w-md mx-4">
                                    <h2 className="text-3xl font-bold text-red-500 mb-4">Temporarily Closed</h2>
                                    <p className="text-gray-400 mb-6">This vendor is currently unavailable for new bookings. Please check back later.</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm font-bold uppercase tracking-wider">
                                        <Ban className="w-4 h-4" /> Account Suspended
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    {(vendor.platformStatus === 'suspended' || vendor.platformStatus === 'shadow_banned') ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full text-red-400 text-xs font-bold border border-red-500/20 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Unavailable
                                        </span>
                                    ) : vendor.isBookingEnabled ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Open
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-gray-400 text-xs font-bold border border-white/10 uppercase tracking-widest">
                                            Closed
                                        </span>
                                    )}
                                </div>

                                <h1 className={cn("text-4xl md:text-7xl font-black mb-4 tracking-tight leading-none drop-shadow-lg flex items-center gap-3", isDarkMode ? "text-white" : "text-gray-900")}>
                                    {vendor.businessName}
                                    {vendor.isVerified && (
                                        <BadgeCheck className="text-blue-500 w-8 h-8 md:w-12 md:h-12" />
                                    )}
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
                            {['about', 'location', 'services', 'reviews', 'gallery'].map((section) => (
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

                            {/* LOCATION (Map) */}
                            {vendor.latitude && vendor.longitude && (
                                <section id="location" className="scroll-mt-32">
                                    <h2 className={cn("text-2xl font-bold mb-6 flex items-center gap-2", isDarkMode ? "text-white" : "text-gray-900")}>
                                        Location & Hours
                                    </h2>
                                    <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                                        <LeafletMap lat={vendor.latitude} lng={vendor.longitude} />

                                        <div className={cn("p-6 flex flex-col md:flex-row justify-between items-center gap-4", isDarkMode ? "bg-[#1A1A1A] border-t border-white/10" : "bg-white border-t border-gray-100")}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-3 rounded-full", isDarkMode ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900")}>
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-gray-900")}>{vendor.address}</p>
                                                    <p className="text-xs text-gray-500">Get directions to the salon</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-colors", isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")}
                                            >
                                                Get Directions ↗
                                            </a>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* SERVICES (Compact List Layout) */}
                            <section id="services" ref={servicesRef} className="scroll-mt-32">
                                <h2 className={cn("text-3xl font-bold mb-6", isDarkMode ? "text-white" : "text-gray-900")}>Services</h2>

                                {/* Sticky Category Nav for Services */}
                                <ServiceCategoryNav categories={categories} isDarkMode={isDarkMode} />

                                <div className="space-y-12">
                                    {categories.map((category) => (
                                        <div key={category} id={category} className="scroll-mt-[180px]">
                                            <h3 className={cn(
                                                "text-xl font-bold mb-4 flex items-center gap-2",
                                                isDarkMode ? "text-white" : "text-gray-900"
                                            )}>
                                                {category}
                                            </h3>
                                            <div className="flex flex-col">
                                                {vendor.services.filter(s => s.category === category).map((service) => (
                                                    <CompactServiceItem
                                                        key={service.id}
                                                        service={service}
                                                        isSelected={cart.some(s => s.id === service.id)}
                                                        isBookingEnabled={vendor.isBookingEnabled}
                                                        isDarkMode={isDarkMode}
                                                        onToggle={toggleService}
                                                        brandColor={brandColor}
                                                    />
                                                ))}
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
