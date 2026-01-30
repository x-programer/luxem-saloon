"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    duration: string;
    category: string;
}

interface CompactServiceItemProps {
    service: Service;
    isSelected: boolean;
    isBookingEnabled: boolean;
    isDarkMode: boolean;
    onToggle: (service: Service, e?: React.MouseEvent) => void;
    brandColor: string;
}

export function CompactServiceItem({ 
    service, 
    isSelected, 
    isBookingEnabled, 
    isDarkMode, 
    onToggle,
    brandColor 
}: CompactServiceItemProps) {
    return (
        <motion.div
            onClick={(e) => onToggle(service, e)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group flex items-center justify-between py-4 border-b transition-all duration-200 cursor-pointer select-none",
                isDarkMode 
                    ? "border-white/5 hover:bg-white/5" 
                    : "border-gray-100 hover:bg-gray-50"
            )}
        >
            <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                        "font-semibold text-base transition-colors",
                         isSelected 
                            ? "text-[rgb(var(--brand-rgb))]" 
                            : (isDarkMode ? "text-gray-100" : "text-gray-900")
                    )}>
                        {service.name}
                    </h4>
                    {isSelected && (
                         <CheckCircle2 className="w-4 h-4 text-[rgb(var(--brand-rgb))]" />
                    )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        isDarkMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}>
                        {service.duration} mins
                    </span>
                    {service.description && (
                        <p className={cn(
                            "text-xs line-clamp-1",
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                        )}>
                            {service.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className={cn(
                    "font-medium text-base",
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                )}>
                    ₹{service.price}
                </div>
                
                <button
                    type="button"
                    disabled={!isBookingEnabled}
                    onClick={(e) => onToggle(service, e)}
                    className={cn(
                        "h-8 px-4 text-xs font-bold rounded-full border transition-all duration-200 min-w-[70px]",
                        !isBookingEnabled 
                            ? "opacity-50 cursor-not-allowed bg-transparent border-gray-200 text-gray-400"
                            : isSelected
                                ? "bg-transparent border-[rgb(var(--brand-rgb))] text-[rgb(var(--brand-rgb))]"
                                : (isDarkMode 
                                    ? "bg-white text-black border-transparent hover:bg-gray-200" 
                                    : "bg-black text-white border-transparent hover:bg-gray-800")
                    )}
                >
                    {isSelected ? "Added" : "Add"}
                </button>
            </div>
        </motion.div>
    );
}
