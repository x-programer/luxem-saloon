import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DataListItemProps {
    avatar?: ReactNode;
    title: string;
    subtitle?: string | ReactNode;
    action?: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function DataList({ className, children }: { className?: string, children: ReactNode }) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {children}
        </div>
    );
}

export function DataListItem({ avatar, title, subtitle, action, className, onClick }: DataListItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100",
                className
            )}
        >
            <div className="flex items-center gap-4">
                {avatar && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {avatar}
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-[#6F2DBD] transition-colors">{title}</span>
                    {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
                </div>
            </div>

            {action && (
                <div className="text-sm text-gray-400">
                    {action}
                </div>
            )}
        </div>
    );
}
