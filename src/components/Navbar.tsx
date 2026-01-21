"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const { user, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                        <span className="text-2xl font-bold text-primary">LuxeSalon</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium text-textMain hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#themes" className="text-sm font-medium text-textMain hover:text-primary transition-colors">
                            Themes
                        </Link>

                        {!loading && (
                            <div className="flex items-center gap-4 ml-4">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white transition-all bg-primary rounded-full hover:bg-violet-600 shadow-soft hover:shadow-lg"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-sm font-medium text-textMain hover:text-primary transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white transition-all bg-primary rounded-full hover:bg-violet-600 shadow-soft hover:shadow-lg"
                                        >
                                            Start Free Trial
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="p-2 -mr-2 text-textMain hover:text-primary transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2 shadow-lg">
                            <Link
                                href="#features"
                                onClick={closeMenu}
                                className="block px-3 py-3 rounded-xl text-base font-medium text-textMain hover:bg-secondary hover:text-primary transition-colors"
                            >
                                Features
                            </Link>
                            <Link
                                href="#themes"
                                onClick={closeMenu}
                                className="block px-3 py-3 rounded-xl text-base font-medium text-textMain hover:bg-secondary hover:text-primary transition-colors"
                            >
                                Themes
                            </Link>

                            {!loading && (
                                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={closeMenu}
                                            className="w-full flex items-center justify-center px-5 py-3 text-base font-medium text-white transition-all bg-primary rounded-xl hover:bg-violet-600 shadow-soft"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={closeMenu}
                                                className="w-full flex items-center justify-center px-5 py-3 text-base font-medium text-textMain bg-secondary rounded-xl hover:bg-violet-100 hover:text-primary transition-colors"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={closeMenu}
                                                className="w-full flex items-center justify-center px-5 py-3 text-base font-medium text-white transition-all bg-primary rounded-xl hover:bg-violet-600 shadow-soft"
                                            >
                                                Start Free Trial
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
