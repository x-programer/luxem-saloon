"use client";

import { motion } from "framer-motion";

const themes = [
    {
        name: "Minimal Zen",
        color: "bg-stone-50",
        accent: "bg-stone-900",
        description: "Clean lines and ample whitespace.",
    },
    {
        name: "Dark Luxury",
        color: "bg-slate-900",
        accent: "bg-amber-400",
        description: "Bold, elegant, and mysterious.",
    },
    {
        name: "Medical Clean",
        color: "bg-teal-50",
        accent: "bg-teal-600",
        description: "Trustworthy and professional.",
    },
];

export function ThemeShowcase() {
    return (
        <section id="themes" className="py-24 bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-semibold tracking-wider text-sm uppercase">Customization</span>
                    <h2 className="text-3xl font-bold text-textMain mt-2 mb-4">Your Brand, Your Way</h2>
                    <p className="text-textMuted max-w-2xl mx-auto">
                        Choose from our professionally designed themes to match your salon's vibe perfectly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {themes.map((theme, index) => (
                        <div key={index} className="group cursor-default">
                            {/* Preview Card */}
                            <div className={`relative aspect-[4/5] ${theme.color} rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-200/50 transition-transform group-hover:-translate-y-2 duration-300`}>

                                {/* Mock UI Elements */}
                                <div className="absolute top-6 left-6 right-6">
                                    <div className="h-2 w-1/3 bg-current opacity-10 rounded-full mb-4"></div>
                                    <div className="h-8 w-2/3 bg-current opacity-20 rounded mb-2"></div>
                                    <div className="h-4 w-1/2 bg-current opacity-10 rounded"></div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className={`h-10 w-full ${theme.accent} rounded-lg shadow-sm opacity-90`}></div>
                                </div>

                                {/* Decorative circles */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-current opacity-5"></div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-textMain">{theme.name}</h3>
                                <p className="text-sm text-textMuted">{theme.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
