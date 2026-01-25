"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCircle, Info, AlertTriangle, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hydration fix: Only render date logic on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getBorderColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return "border-green-500/20";
            case 'warning': return "border-yellow-500/20";
            case 'error': return "border-red-500/20";
            default: return "border-blue-500/20";
        }
    };

    const handleItemClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id);
        if (n.link) setIsOpen(false); // Close if navigating
    };

    // Performance: Limit to 20 items
    const displayList = notifications.slice(0, 20);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group"
            >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                    {isMounted && unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"
                        />
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#111] rounded-2xl shadow-xl shadow-purple-500/10 dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden z-50 ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[70vh] overflow-y-auto p-2 space-y-2">
                            {displayList.length > 0 ? (
                                <AnimatePresence initial={false} mode="popLayout">
                                    {displayList.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={cn(
                                                "relative group p-3 rounded-xl border transition-all hover:shadow-sm bg-white dark:bg-[#1a1a1a]",
                                                !n.read ? "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" : "border-transparent hover:border-slate-100 dark:hover:border-white/5",
                                                getBorderColor(n.type)
                                            )}
                                        >
                                            <div className="flex gap-3 pr-6">
                                                <div className="mt-0.5 shrink-0">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div onClick={() => handleItemClick(n)} className={cn("flex-1 cursor-pointer", n.link && "hover:opacity-80")}>
                                                    {n.link ? (
                                                        <Link href={n.link} className="block">
                                                            <h4 className={cn("text-sm font-bold mb-0.5", !n.read ? "text-primary" : "text-slate-800 dark:text-white")}>
                                                                {n.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed block">{n.message}</p>
                                                        </Link>
                                                    ) : (
                                                        <div>
                                                            <h4 className={cn("text-sm font-bold mb-0.5", !n.read ? "text-primary" : "text-slate-800 dark:text-white")}>
                                                                {n.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                                        {isMounted ? (
                                                            n.createdAt?.toMillis
                                                                ? new Date(n.createdAt.toMillis()).toLocaleString()
                                                                : "Just now"
                                                        ) : (
                                                            "..."
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(n.id);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remove"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Unread Indicator Dot */}
                                            {!n.read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full md:hidden" />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600">
                                    <Bell className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
