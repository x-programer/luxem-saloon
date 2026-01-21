"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Images, Settings, Scissors, CalendarCheck2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
    { name: 'Services', href: '/dashboard/services', icon: Scissors },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck2 },
    { name: 'Gallery', href: '/dashboard/gallery', icon: Images },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ className, isMobileOpen, onMobileClose }: { className?: string, isMobileOpen?: boolean, onMobileClose?: () => void }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Common Navigation Content
    const NavContent = ({ mobile = false }) => (
        <>
            <div className="flex items-center justify-center h-20 border-b border-gray-100 overflow-hidden relative shrink-0">
                <AnimatePresence mode='wait'>
                    {isCollapsed && !mobile ? (
                        <motion.div
                            key="collapsed-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-2xl font-bold text-luxe-primary font-serif"
                        >
                            L
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded-logo"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                        >
                            <h1 className="text-xl font-bold tracking-wider text-gray-900 font-serif">LUXE SALON</h1>
                            {mobile && (
                                <button
                                    onClick={onMobileClose}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronLeft size={20} className="text-gray-500" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={mobile ? onMobileClose : undefined}
                            className={cn(
                                "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                                    : "text-gray-500 hover:bg-luxe-secondary/10 hover:text-luxe-primary"
                            )}
                        >
                            <div className="flex items-center justify-center min-w-[24px]">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-white" : "text-gray-400 group-hover:text-luxe-primary"
                                    )}
                                    aria-hidden="true"
                                />
                            </div>

                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{
                                    opacity: (isCollapsed && !mobile) ? 0 : 1,
                                    width: (isCollapsed && !mobile) ? 0 : "auto",
                                    display: (isCollapsed && !mobile) ? "none" : "block"
                                }}
                                transition={{ duration: 0.2 }}
                                className="ml-3 whitespace-nowrap overflow-hidden"
                            >
                                {item.name}
                            </motion.span>

                            {isActive && (!isCollapsed || mobile) && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-luxe-primary rounded-l-md"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 shrink-0">
                <div className={cn("flex items-center", (isCollapsed && !mobile) ? "justify-center" : "")}>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxe-primary to-luxe-secondary flex items-center justify-center text-white font-bold shadow-md">
                            V
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {(!isCollapsed || mobile) && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            className="ml-3 overflow-hidden"
                        >
                            <p className="text-sm font-semibold text-gray-800 truncate">Vendor</p>
                            <p className="text-xs text-gray-500 hover:text-luxe-primary cursor-pointer transition-colors">View Profile</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Overlay Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileClose}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-full bg-white z-50 md:hidden flex flex-col shadow-2xl"
                        >
                            <NavContent mobile={true} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Collapsible Sidebar */}
            <motion.div
                initial={{ width: 256 }}
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className={cn(
                    "hidden md:flex relative flex-col h-full bg-white border-r border-gray-100 shadow-xl z-20",
                    className
                )}
            >
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-50 text-gray-500 hover:text-luxe-primary"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <NavContent />
            </motion.div>
        </>
    );
}
