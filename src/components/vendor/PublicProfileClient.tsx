"use client";

import { useState } from "react";
import { ThemeWrapper } from "@/components/theme/ThemeWrapper";
import { Calendar, Clock, MapPin, Star, Share2, X, ShoppingBag, Instagram, Facebook, Globe, Youtube, Twitter, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingModal } from "./BookingModal";
import { ReviewList } from "@/components/public/ReviewList";
import Image from "next/image";

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
    profileImage: string; // Keep for backward compat, but prefer banner
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
    externalLinks?: {
        id: string;
        platform: "instagram" | "facebook" | "twitter" | "youtube" | "website" | "shop";
        url: string;
        label: string;
    }[];
}

export default function PublicProfileClient({ vendor }: { vendor: VendorData }) {
    const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleBookClick = (service?: Service) => {
        if (!vendor.isBookingEnabled) return;
        setSelectedService(service);
        setIsBookingOpen(true);
    };

    // Stagger animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <ThemeWrapper theme={vendor.themePreference as any}>
            <div className="min-h-screen bg-[#121212] text-white selection:bg-luxe-primary/50">
                {/* Hero Header */}
                <header className="relative h-[60vh] min-h-[500px] overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={vendor.banner || vendor.profileImage || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
                    </motion.div>

                    <div className="absolute inset-0 flex items-end">
                        <div className="container mx-auto px-6 pb-16">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                {/* Logo / Avatar Section */}
                                <div className="mb-6">
                                    {(vendor.showLogo !== false && vendor.logo) ? (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#121212] shadow-2xl overflow-hidden bg-black relative">
                                            <Image
                                                src={vendor.logo}
                                                alt="Logo"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 96px, 128px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#121212] shadow-2xl bg-white/5 backdrop-blur-md flex items-center justify-center text-white">
                                            <span className="text-4xl font-bold">{vendor.businessName.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold mb-6 border border-white/10 uppercase tracking-widest shadow-lg">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Premium Partner
                                </span>
                                <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-sm leading-none">
                                    {vendor.businessName}
                                </h1>
                                <div className="flex flex-wrap items-center text-gray-200 text-sm md:text-base gap-6 font-medium tracking-wide">
                                    <span className="flex items-center bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/5">
                                        <MapPin className="w-4 h-4 mr-2" /> {vendor.address}
                                    </span>
                                    {vendor.isBookingEnabled ? (
                                        <span className="flex items-center text-green-400 bg-green-950/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-green-500/20">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                            Bookings Available
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-gray-400 bg-gray-900/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                                            <Clock className="w-4 h-4 mr-2" /> Application Closed
                                        </span>
                                    )}
                                </div>

                                {vendor.externalLinks && vendor.externalLinks.length > 0 && (
                                    <div className="flex gap-3 mt-6">
                                        {vendor.externalLinks.map((link) => {
                                            const iconMap = {
                                                instagram: Instagram,
                                                facebook: Facebook,
                                                twitter: Twitter,
                                                youtube: Youtube,
                                                website: Globe,
                                                shop: ShoppingBag
                                            };
                                            const Icon: any = iconMap[link.platform] || Globe;
                                            return (
                                                <a
                                                    key={link.id}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-white transition-all border border-white/10 hover:scale-110 hover:border-white/30"
                                                    title={link.label}
                                                >
                                                    <Icon size={18} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 sm:px-6 py-12 -mt-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* LEFT COLUMN: Main Content */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* About Section */}
                            <motion.section
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                className="bg-[#1a1a1a]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl"
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <span className="w-8 h-1 bg-luxe-primary rounded-full inline-block shadow-[0_0_10px_currentColor]"></span> About Us
                                </h2>
                                <p className="text-lg leading-relaxed text-gray-300 font-light text-justify">
                                    {vendor.description}
                                </p>
                            </motion.section>

                            {/* Services Section */}
                            <section>
                                <div className="flex items-end justify-between mb-8 px-2">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">Service Menu</h2>
                                        <p className="text-gray-400 text-sm mt-1">Curated treatments for you</p>
                                    </div>
                                    <span className="text-xs font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-gray-300">
                                        {vendor.services.length} Services
                                    </span>
                                </div>

                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    className="grid gap-4"
                                >
                                    {vendor.services.length === 0 ? (
                                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                            <p className="text-gray-500 italic">No services listed yet.</p>
                                        </div>
                                    ) : (
                                        vendor.services.map((service, idx) => (
                                            <motion.div
                                                key={idx}
                                                variants={item}
                                                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/5 shadow-lg hover:border-luxe-primary/30 hover:bg-black/60 transition-all duration-300"
                                            >
                                                <div className="mb-4 md:mb-0 relative z-10 w-full md:w-2/3">
                                                    <h3 className="font-bold text-xl text-white group-hover:text-luxe-primary transition-colors">{service.name}</h3>
                                                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-luxe-primary" />
                                                        <span className="font-medium text-gray-300">{service.duration} mins</span>
                                                        <span className="w-1 h-1 bg-gray-500 rounded-full" />
                                                        <span className="uppercase tracking-wider text-[10px] text-gray-500">{service.category}</span>
                                                    </p>
                                                    {service.description && (
                                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 md:line-clamp-1 group-hover:text-gray-400 transition-colors">{service.description}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-5 justify-between md:justify-end relative z-10">
                                                    <div className="text-right">
                                                        {service.compareAtPrice && service.compareAtPrice > service.price && (
                                                            <span className="block text-xs line-through text-gray-600 mb-0.5">₹{service.compareAtPrice}</span>
                                                        )}
                                                        <span className="font-bold text-2xl tracking-tight text-white group-hover:text-luxe-primary transition-colors drop-shadow-lg">₹{service.price}</span>
                                                    </div>

                                                    {vendor.isBookingEnabled ? (
                                                        <button
                                                            onClick={() => handleBookClick(service)}
                                                            className="px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-luxe-primary hover:text-white transition-all shadow-lg hover:shadow-luxe-primary/30"
                                                        >
                                                            Book
                                                        </button>
                                                    ) : (
                                                        <button disabled className="px-6 py-3 rounded-xl bg-white/5 text-gray-600 text-sm font-bold cursor-not-allowed border border-white/5">
                                                            N/A
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            </section>

                            {/* Gallery Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                    Gallery <span className="text-sm font-normal text-gray-500">({vendor.gallery.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                                    {vendor.gallery.map((img: string, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            viewport={{ once: true }}
                                            className={`rounded-2xl overflow-hidden relative group cursor-zoom-in shadow-md bg-black ${idx === 0 ? 'col-span-2 row-span-2 md:row-span-2' : ''}`}
                                        >
                                            <Image
                                                src={img}
                                                alt="Gallery"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                            <div
                                                className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => setSelectedImage(img)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Staff Section */}
                            {vendor.staff && vendor.staff.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6 text-white">Meet the Team</h2>
                                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                                        {vendor.staff.map((member: any) => (
                                            <div key={member.id} className="shrink-0 text-center group">
                                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-lg mb-3 mx-auto relative group-hover:border-luxe-primary transition-colors">
                                                    <Image
                                                        src={member.photo || "https://source.unsplash.com/random/200x200/?face"}
                                                        alt={member.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-white group-hover:text-luxe-primary transition-colors">{member.name}</h4>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{member.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Products Section */}
                            {vendor.products && vendor.products.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold mb-6 text-white">Our Products</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {vendor.products.map((product: any) => (
                                            <div key={product.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm flex flex-col hover:bg-white/10 transition-colors">
                                                <div className="aspect-square rounded-xl bg-white/5 mb-3 overflow-hidden relative">
                                                    <Image
                                                        src={product.image || "https://source.unsplash.com/random/200x200/?product"}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                    />
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.brand}</div>
                                                <h4 className="font-bold text-gray-200 text-sm leading-tight mb-2 flex-1">{product.name}</h4>

                                                {product.type === 'retail' && (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="font-bold text-white">${product.price}</span>
                                                        {product.purchaseLink ? (
                                                            <a href={product.purchaseLink} target="_blank" className="p-2 bg-white text-black rounded-lg hover:bg-luxe-primary hover:text-white transition-colors">
                                                                <ShoppingBag className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">In Store</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Reviews Section */}
                            <section>
                                <ReviewList vendorId={vendor.uid} />
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Sidebar */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Sticky Box */}
                            <div className="sticky top-8 space-y-6">
                                {/* Location & Hours Card */}
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
                                >
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-white">
                                        <Clock className="w-5 h-5 text-luxe-primary" />
                                        Opening Hours
                                    </h3>

                                    <div className="space-y-4 text-sm mb-8">
                                        {vendor.schedule && Object.keys(vendor.schedule).length > 0 ? (
                                            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                <div key={day} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                                    <span className="capitalize font-medium text-gray-400 w-24">{day}</span>
                                                    {vendor.schedule[day]?.isOpen ? (
                                                        <span className="font-mono font-bold text-white tracking-wide">{vendor.schedule[day].start} - {vendor.schedule[day].end}</span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold text-xs bg-red-950/30 border border-red-500/20 px-2 py-0.5 rounded-md">Closed</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No schedule available.</p>
                                        )}
                                    </div>

                                    {vendor.isBookingEnabled ? (
                                        <button
                                            onClick={() => handleBookClick()}
                                            className="w-full py-4 rounded-xl bg-luxe-primary text-white font-bold shadow-lg shadow-luxe-primary/20 hover:bg-luxe-primary/90 hover:scale-[1.02] transition-all"
                                        >
                                            Book Appointment
                                        </button>
                                    ) : (
                                        <div className="w-full py-4 rounded-xl bg-white/5 text-gray-400 font-bold text-center text-sm border border-white/10 opacity-70">
                                            Currently Not Accepting Bookings
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-3">
                                        <button className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 font-bold text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                        <a href={`https://maps.google.com/?q=${encodeURIComponent(vendor.address)}`} target="_blank" className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 font-bold text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                            <MapPin className="w-4 h-4" /> Map
                                        </a>
                                    </div>
                                </motion.div>

                                {/* Promo Card */}
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl relative overflow-hidden group"
                                >
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />

                                    <div className="relative z-10">
                                        <span className="inline-block bg-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-md mb-3 border border-white/10">NEW CUSTOMER OFFER</span>
                                        <h3 className="font-bold text-2xl mb-2">First Time?</h3>
                                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                            Experience luxury for less. Get <span className="font-bold text-white">15% OFF</span> your first booking with us.
                                        </p>

                                        <div className="flex items-center justify-between bg-black/20 rounded-xl p-1 pl-4 border border-white/10">
                                            <code className="font-mono font-bold text-lg tracking-wider">LUXE15</code>
                                            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform shadow-lg">
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                vendorId={vendor.uid}
                service={selectedService}
                schedule={vendor.schedule}
            />


            {/* Gallery Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
                    >
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video md:aspect-auto md:h-[90vh]"
                        >
                            <Image
                                src={selectedImage}
                                alt="Gallery Fullscreen"
                                fill
                                className="object-contain"
                                sizes="100vw"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ThemeWrapper>
    );
}
