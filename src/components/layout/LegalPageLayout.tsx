"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

interface LegalPageLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FBFBFF] font-sans relative overflow-hidden">
            {/* Soft Background Blobs (Matches Settings Page Vibe) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl opacity-60 animate-blob" />
                <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl opacity-60 animate-blob animation-delay-4000" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#6F2DBD] transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-6 border border-purple-100/50 shadow-sm">
                            Last Updated: {lastUpdated}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
                            {title}
                        </h1>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-indigo-500/10 border border-white/60 relative overflow-hidden ring-1 ring-slate-900/5">
                        {/* Subtle top sheen */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />

                        <article className="prose prose-lg prose-slate max-w-none 
                            prose-headings:text-[#6F2DBD] prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-a:text-[#6F2DBD] prose-a:font-semibold hover:prose-a:text-purple-800 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-800 prose-strong:font-bold
                            prose-li:text-slate-600"
                        >
                            {children}
                        </article>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
