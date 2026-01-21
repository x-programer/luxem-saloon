"use client";

import { Calendar, Image as ImageIcon, BarChart3 } from "lucide-react";

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
        <section id="features" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-textMain mb-4">Everything you need to grow</h2>
                    <p className="text-textMuted max-w-2xl mx-auto">
                        Powerful tools designed specifically for the beauty industry, wrapped in a beautiful interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-soft hover:shadow-lg transition-shadow group"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-textMain mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
