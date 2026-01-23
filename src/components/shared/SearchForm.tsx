"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SearchFormProps {
    variant?: "hero" | "compact";
    className?: string;
}

export function SearchForm({ variant = "hero", className }: SearchFormProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic sanitization
        const sanitizedQuery = query.trim().replace(/[<>]/g, "");
        const sanitizedCity = city.trim().replace(/[<>]/g, "");

        if (!sanitizedQuery && !sanitizedCity) return;

        setLoading(true);

        // Construct query params
        const params = new URLSearchParams();
        if (sanitizedQuery) params.append("q", sanitizedQuery);
        if (sanitizedCity) params.append("city", sanitizedCity);

        // Provide immediate feedback to user before push
        // Use a small timeout to allow the loading state to be visible if the transition is instant
        // But mainly just push.
        router.push(`/explore?${params.toString()}`);

        // We don't verify loading state set false because navigation will happen.
    };

    const isHero = variant === "hero";

    return (
        <motion.form
            initial={isHero ? { opacity: 0, y: 20 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSearch}
            className={cn(
                "relative flex flex-col md:flex-row items-center gap-2 md:gap-0 w-full mx-auto",
                isHero
                    ? "max-w-2xl bg-white p-2 rounded-3xl shadow-xl shadow-indigo-500/10 border border-white/40 backdrop-blur-md"
                    : "max-w-full bg-white/50 p-1.5 rounded-xl border border-white/40",
                className
            )}
        >
            {/* Query Input */}
            <div className={cn(
                "relative w-full flex-1 flex items-center px-4",
                isHero ? "h-14 md:border-r border-gray-100" : "h-10"
            )}>
                <Search className={cn("text-gray-400 mr-3", isHero ? "w-5 h-5" : "w-4 h-4")} />
                <input
                    type="text"
                    placeholder="Search salons or services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base font-medium"
                />
            </div>

            {/* City Input */}
            <div className={cn(
                "relative w-full md:w-[35%] flex items-center px-4",
                isHero ? "h-14" : "h-10 border-t md:border-l md:border-t-0 border-gray-100/50 md:pl-4" // Separator logic
            )}>
                <MapPin className={cn("text-gray-400 mr-3", isHero ? "w-5 h-5" : "w-4 h-4")} />
                <input
                    type="text"
                    placeholder={isHero ? "City or Zip" : "City"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm md:text-base font-medium"
                />
            </div>

            {/* Search Button */}
            <button
                type="submit"
                disabled={loading}
                className={cn(
                    "relative flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100",
                    isHero
                        ? "w-full md:w-auto h-12 md:h-12 px-8 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
                        : "w-full md:w-auto h-9 px-4 bg-primary text-white text-sm font-semibold rounded-lg shadow-md"
                )}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    isHero ? "Search" : <Search className="w-4 h-4" />
                )}
            </button>

        </motion.form>
    );
}
