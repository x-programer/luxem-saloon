"use client";

import { cn } from "@/lib/utils";

type Theme = 'minimal_zen' | 'dark_luxury' | 'medical_clean';

interface ThemeWrapperProps {
    theme: Theme;
    children: React.ReactNode;
    className?: string;
}

const themeStyles: Record<Theme, string> = {
    minimal_zen: "bg-[#F9F9F7] text-gray-800 font-sans selection:bg-stone-200",
    dark_luxury: "bg-[#0F0F12] text-gray-100 font-serif selection:bg-gold-500",
    medical_clean: "bg-white text-slate-700 font-sans selection:bg-blue-100",
};

export function ThemeWrapper({ theme, children, className }: ThemeWrapperProps) {
    return (
        <div
            className={cn("min-h-screen transition-colors duration-500", themeStyles[theme], className)}
            data-theme={theme}
        >
            {children}
        </div>
    );
}
