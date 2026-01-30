"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ServiceCategoryNavProps {
    categories: string[];
    isDarkMode: boolean;
}

export function ServiceCategoryNav({ categories, isDarkMode }: ServiceCategoryNavProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "");
    const navRef = useRef<HTMLDivElement>(null);

    // Scroll Spy Logic for Categories
    useEffect(() => {
        const handleScroll = () => {
            const offset = 250; // Offset for sticky header + nav
            let current = categories[0];

            for (const category of categories) {
                const element = document.getElementById(category);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= offset) {
                        current = category;
                    }
                }
            }
            setActiveCategory(current);
        };

        window.addEventListener("scroll", handleScroll);
        // Trigger once on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    const scrollToCategory = (category: string) => {
        const element = document.getElementById(category);
        if (element) {
            const offset = 200; // Account for sticky headers
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveCategory(category);
        }
    };

    return (
        <div
            className={cn(
                "sticky top-[72px] lg:top-[80px] z-30 py-3 -mx-4 px-4 md:px-0 md:mx-0 backdrop-blur-xl border-b mb-6 transition-colors",
                isDarkMode
                    ? "bg-[#121212]/95 border-white/5"
                    : "bg-[#F9F9F7]/95 border-gray-200"
            )}
        >
            <div
                ref={navRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-x"
            >
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => scrollToCategory(category)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                            activeCategory === category
                                ? "bg-[rgb(var(--brand-rgb))] text-white border-transparent shadow-lg shadow-[rgb(var(--brand-rgb))]/20"
                                : (isDarkMode
                                    ? "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
