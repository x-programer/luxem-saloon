"use client";

import { Calendar, Image as ImageIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Calendar,
        title: "Smart Booking",
        description: "Automated scheduling that syncs with your calendar and reduces no-shows.",
    },
    {
        icon: ImageIcon,
        title: "Portfolio Showcase",
        description: "Display your work in high-resolution galleries that attract premium clients.",
    },
    {
        icon: BarChart3,
        title: "Business Analytics",
        description: "Track revenue, client retention, and growth with beautiful, easy-to-read charts.",
    },
];

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-textMain mb-4 tracking-tight">Everything you need to grow</h2>
                    <p className="text-textMuted/80 text-lg max-w-2xl mx-auto">
                        Powerful tools designed specifically for the beauty industry, wrapped in a beautiful interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-white/50">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-3">{feature.title}</h3>
                            <p className="text-textMain/70 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
