"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2 } from "lucide-react";

interface ServiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: any;
}

export function ServiceDetailsModal({ isOpen, onClose, service }: ServiceDetailsModalProps) {
    if (!isOpen || !service) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Header Image/Color */}
                    <div className="h-32 bg-gradient-to-r from-[#6F2DBD] to-[#A663CC] relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute -bottom-8 left-8">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold text-[#6F2DBD]">
                                {service.name.charAt(0)}
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 px-8 pb-8">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#6F2DBD] mb-2">
                                    {service.category}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-[#6F2DBD]">₹{service.price}</div>
                                {service.compareAtPrice && (
                                    <div className="text-sm text-gray-400 line-through">₹{service.compareAtPrice}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} mins</span>
                            <span>•</span>
                            <span className="capitalize">{service.targetAudience}</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {service.description || "No description provided."}
                                </p>
                            </div>

                            {service.includedSteps && service.includedSteps.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">What's Included</h3>
                                    <div className="space-y-3">
                                        {service.includedSteps.map((step: any, idx: number) => (
                                            <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                                                <div className="mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4 text-[#6F2DBD]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{step.name}</p>
                                                    <p className="text-xs text-gray-500">{step.details} • {step.duration} min</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
