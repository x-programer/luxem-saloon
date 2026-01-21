import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumCardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
}

export function PremiumCard({ children, className, hoverable = false }: PremiumCardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden",
                hoverable && "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]",
                className
            )}
        >
            {children}
        </div>
    );
}
