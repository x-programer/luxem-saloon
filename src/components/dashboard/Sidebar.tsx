"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Images, Settings, Scissors, CalendarCheck2, ChevronLeft, ChevronRight, ExternalLink, LogOut, Users, Star, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/dashboard/services', icon: Scissors },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck2 },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'My Team', href: '/dashboard/team', icon: Users },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Gallery', href: '/dashboard/gallery', icon: Images },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarNavContentProps {
    mobile?: boolean;
    isCollapsed: boolean;
    onMobileClose?: () => void;
    slug: string | null;
    user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    handleLogout: () => void;
    pathname: string;
    router: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const SidebarNavContent = ({
    mobile = false,
    isCollapsed,
    onMobileClose,
    slug,
    user,
    handleLogout,
    pathname,
    router
}: SidebarNavContentProps) => (
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
                        {mobile && onMobileClose && (
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

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <nav className="px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">

                {/* LIVE VIEW BUTTON */}
                {slug && (
                    <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden text-luxe-primary bg-luxe-primary/5 hover:bg-luxe-primary/10 border border-luxe-primary/20 mb-6",
                        )}
                    >
                        <div className="flex items-center justify-center min-w-[24px]">
                            <ExternalLink
                                className="h-5 w-5 transition-colors"
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
                            className="ml-3 whitespace-nowrap overflow-hidden font-bold"
                        >
                            Live Shop
                        </motion.span>
                    </a>
                )}


                {navigation.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href) && item.href !== '/dashboard' ? true : pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={mobile && onMobileClose ? onMobileClose : undefined}
                            className={cn(
                                "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive // Simplified for now
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

            {/* BOTTOM ACTIONS */}
            <div className="px-3 pb-4 space-y-2">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden text-red-500 hover:bg-red-50",
                    )}
                >
                    <div className="flex items-center justify-center min-w-[24px]">
                        <LogOut
                            className="h-5 w-5 transition-colors"
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
                        Logout
                    </motion.span>
                </button>

                <div className="p-4 border-t border-gray-100 shrink-0">
                    <div className={cn("flex items-center", (isCollapsed && !mobile) ? "justify-center" : "")}>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxe-primary to-luxe-secondary flex items-center justify-center text-white font-bold shadow-md cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
                                {user?.email?.[0].toUpperCase() || "V"}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {(!isCollapsed || mobile) && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                className="ml-3 overflow-hidden"
                            >
                                <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{user?.email?.split('@')[0] || "Vendor"}</p>
                                <p onClick={() => router.push('/dashboard/settings')} className="text-xs text-gray-500 hover:text-luxe-primary cursor-pointer transition-colors">View Settings</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
);

export function Sidebar({ className, isMobileOpen, onMobileClose }: { className?: string, isMobileOpen?: boolean, onMobileClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [slug, setSlug] = useState<string | null>(null);

    // Sidebar Integration API Calls
    useEffect(() => {
        // Desktop sidebar width: 288px (w-72)
        // Collapsed width: 80px (w-20)
        const width = isCollapsed ? 80 : 288;

        if (typeof window !== 'undefined' && (window as any).DashboardLayout) {
            // Notify layout of current state
            const layout = (window as any).DashboardLayout;

            // If we have specific open/close hooks, use them
            if (layout.onSidebarOpen) {
                layout.onSidebarOpen(width);
            }

            // Also call resize if available as a catch-all
            if (layout.onResize) {
                layout.onResize(!isCollapsed, width);
            }
        }
    }, [isCollapsed]);

    useEffect(() => {
        const fetchSlug = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().slug) {
                    setSlug(docSnap.data().slug);
                } else if (docSnap.exists()) {
                    // Fallback to uid if no slug set
                    setSlug(user.uid);
                }
            } catch (error) {
                console.error("Error fetching slug", error);
            }
        };
        fetchSlug();
    }, [user]);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            router.push('/login');
        } catch (error) {
            console.error("Logout error", error);
            toast.error("Failed to logout");
        }
    };

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
                            <SidebarNavContent
                                mobile={true}
                                isCollapsed={false} // Always expanded on mobile
                                onMobileClose={onMobileClose}
                                slug={slug}
                                user={user}
                                handleLogout={handleLogout}
                                pathname={pathname}
                                router={router}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Collapsible Sidebar */}
            <motion.div
                initial={{ width: 288 }}
                animate={{ width: isCollapsed ? 80 : 288 }}
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
                <SidebarNavContent
                    isCollapsed={isCollapsed}
                    slug={slug}
                    user={user}
                    handleLogout={handleLogout}
                    pathname={pathname}
                    router={router}
                />
            </motion.div>
        </>
    );
}
