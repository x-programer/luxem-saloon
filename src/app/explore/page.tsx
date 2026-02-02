"use client";

import { useEffect, useState, Suspense } from "react";
import { getAllVendors, VendorPreview } from "@/app/actions/vendors";
import { Loader2, Search, MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

import { Skeleton } from "@/components/ui/Skeleton";

// Skeleton Loader Component matching the Vendor Card design
function VendorCardSkeleton() {
    return (
        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col">
            {/* Image Placeholder */}
            <div className="h-56 relative bg-white/5">
                <Skeleton className="w-full h-full bg-white/5" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
            </div>

            {/* Content Placeholder */}
            <div className="p-5 flex flex-col flex-1 space-y-4">
                {/* Tags */}
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-md bg-white/10" />
                    <Skeleton className="h-6 w-20 rounded-md bg-white/10" />
                    <Skeleton className="h-6 w-14 rounded-md bg-white/10" />
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <Skeleton className="h-5 w-12 bg-white/10" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                </div>
            </div>
        </div>
    );
}

const FILTER_TAGS = ["Hair", "Nails", "Spa", "Makeup", "Barber", "Skin"];

// 1. Create a "Wrapper" Component to handle the Search Params safely
function ExploreContent() {
    const searchParams = useSearchParams();
    // ✅ Fix 1: Initialize state FROM the URL
    // ✅ Fix 1: Initialize state FROM the URL
    const initialQuery = searchParams.get("q") || "";

    const [vendors, setVendors] = useState<VendorPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    // 1. Debounce the search query
    const debouncedSearch = useDebounce(searchQuery, 500);
    const router = useRouter();

    // 2. Fetch Vendors when Debounced Query Changes
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                // Sync URL without reloading
                const params = new URLSearchParams(searchParams);
                if (debouncedSearch) {
                    params.set("q", debouncedSearch);
                } else {
                    params.delete("q");
                }
                router.replace(`/explore?${params.toString()}`, { scroll: false });

                // Fetch from Server
                const res = await getAllVendors(debouncedSearch);
                if (res.success && res.vendors) {
                    console.log("✅ Vendors fetched:", res.vendors.length);
                    setVendors(res.vendors);
                }
            } catch (error) {
                console.error("❌ Error fetching:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]); // Only re-run when debounced value changes

    // 3. Handle Input Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setLoading(true); // Show loader immediately while user types/waits
    };

    // 4. Client-side Tag Filtering (Server does text search, we filter tags locally for speed)
    const filteredVendors = vendors.filter(vendor => {
        const matchesTag = selectedFilter
            ? vendor.services?.some(s => s.toLowerCase().includes(selectedFilter.toLowerCase()))
            : true;
        return matchesTag;
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
                            onChange={handleSearchChange}
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

                {/* Loading State: Skeleton Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <VendorCardSkeleton key={i} />
                        ))}
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
                                            src={vendor.coverImage || "/placeholder-salon.jpg"} // Fallback Image
                                            alt={vendor.businessName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-bold text-white truncate">{vendor.businessName}</h3>
                                            <div className="flex items-center gap-1.5 text-gray-300 text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{vendor.address || "No address"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {vendor.services?.slice(0, 3).map((service, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white/5 rounded-md text-xs font-medium text-gray-400 border border-white/5">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-bold text-white">4.9</span>
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
                        <p className="text-gray-500 mt-2">
                            Searching for: <span className="text-[#6F2DBD] font-mono">"{searchQuery}"</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ✅ Fix 3: Main Page MUST use Suspense (Next.js Rule for SearchParams)
export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#6F2DBD]" /></div>}>
            <ExploreContent />
        </Suspense>
    );
}