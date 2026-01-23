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
        <section id="themes" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-primary font-bold tracking-wider text-xs uppercase mb-4">
                        Customization
                    </span>
                    <h2 className="text-4xl font-bold text-textMain mb-4">Your Brand, Your Way</h2>
                    <p className="text-textMuted/80 text-lg max-w-2xl mx-auto">
                        Choose from our professionally designed themes to match your salon's vibe perfectly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {themes.map((theme, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group cursor-default p-4 rounded-[2.5rem] bg-white/30 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Preview Card */}
                            <div className={`relative aspect-[4/5] ${theme.color} rounded-[2rem] shadow-inner overflow-hidden mb-6 border border-black/5 transition-transform group-hover:scale-[1.02] duration-500`}>

                                {/* Mock UI Elements */}
                                <div className="absolute top-6 left-6 right-6">
                                    <div className="h-2 w-1/3 bg-current opacity-10 rounded-full mb-4"></div>
                                    <div className="h-8 w-2/3 bg-current opacity-20 rounded-lg mb-3"></div>
                                    <div className="h-4 w-1/2 bg-current opacity-10 rounded-md"></div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className={`h-12 w-full ${theme.accent} rounded-xl shadow-lg opacity-90 backdrop-blur-sm`}></div>
                                </div>

                                {/* Decorative circles */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-8 border-current opacity-[0.03]"></div>
                            </div>

                            <div className="text-center pb-4">
                                <h3 className="text-xl font-bold text-textMain">{theme.name}</h3>
                                <p className="text-sm font-medium text-textMain/60 mt-1">{theme.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
