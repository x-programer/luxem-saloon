"use client";

import { useEffect, useState } from "react";
import { getAllVendors, VendorPreview } from "@/app/actions/vendors";
import { Loader2, Search, MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const FILTER_TAGS = ["Hair", "Nails", "Spa", "Makeup", "Barber", "Skin"];

export default function ExplorePage() {
    const [vendors, setVendors] = useState<VendorPreview[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    useEffect(() => {
        const fetchVendors = async () => {
            const res = await getAllVendors();
            if (res.success && res.vendors) {
                setVendors(res.vendors);
            }
            setLoading(false);
        };
        fetchVendors();
    }, []);

    // Filter Logic
    const filteredVendors = vendors.filter(vendor => {
        // 1. Search Query (Name or City)
        const matchesSearch =
            vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.city.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Tag Filter
        const matchesTag = selectedFilter
            ? vendor.services.some(s => s.toLowerCase().includes(selectedFilter.toLowerCase()))
            : true;

        return matchesSearch && matchesTag;
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative h-[400px] flex flex-col items-center justify-center px-4 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-[#6F2DBD]/20 to-black pointer-events-none" />
                <div className="relative z-10 max-w-2xl w-full space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                        Find the Best Salon <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F2DBD] to-purple-400">Near You</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Discover top-rated stylists, barbers, and spas in your area.</p>

                    {/* Search Bar */}
                    <div className="relative max-w-lg mx-auto w-full">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by salon name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6F2DBD]/50 focus:bg-white/15 transition-all text-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
                {/* Filter Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    <button
                        onClick={() => setSelectedFilter(null)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${selectedFilter === null
                                ? "bg-white text-black border-white"
                                : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                            }`}
                    >
                        All
                    </button>
                    {FILTER_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedFilter(tag === selectedFilter ? null : tag)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${selectedFilter === tag
                                    ? "bg-[#6F2DBD] text-white border-[#6F2DBD] shadow-lg shadow-purple-500/20"
                                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#6F2DBD] animate-spin" />
                    </div>
                ) : (
                    /* Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVendors.map((vendor) => (
                            <Link key={vendor.id} href={`/${vendor.slug}`}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-colors group h-full flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="h-56 overflow-hidden relative">
                                        <img
                                            src={vendor.coverImage}
                                            alt={vendor.businessName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-bold text-white truncate">{vendor.businessName}</h3>
                                            <div className="flex items-center gap-1.5 text-gray-300 text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{vendor.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {vendor.services.slice(0, 3).map((service, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white/5 rounded-md text-xs font-medium text-gray-400 border border-white/5">
                                                    {service}
                                                </span>
                                            ))}
                                            {vendor.services.length > 3 && (
                                                <span className="px-2.5 py-1 bg-white/5 rounded-md text-xs font-medium text-gray-500 border border-white/5">
                                                    +{vendor.services.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-bold text-white">4.9</span>
                                                <span className="text-gray-500 text-sm">(120)</span>
                                            </div>
                                            <span className="text-[#6F2DBD] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Book Now <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredVendors.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-white">No salons found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
