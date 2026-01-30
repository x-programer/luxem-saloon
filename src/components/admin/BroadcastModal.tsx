"use client";

import { useState } from "react";

import { Loader2, Megaphone, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { sendBroadcastAlert } from "@/app/actions/admin";
import { motion } from "framer-motion";

// If shadcn components don't exist, we'll need to define a simple modal wrapper or assume standard HTML.
// I'll assume standard HTML structure inside a fixed overlay if I can't be sure about components,
// but usually "Dialog" is present in modern Next.js stacks.
// To be safe and independent, I'll build a custom Modal using Framer Motion + Tailwind, 
// which avoids dependency hell if they don't have exactly "Dialog" from shadcn installed.

interface BroadcastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BroadcastModal({ isOpen, onClose }: BroadcastModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState<'all' | 'vendor' | 'customer'>("all");
    const [type, setType] = useState<'info' | 'warning' | 'success'>("info");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await sendBroadcastAlert(title, message, target, type);
            if (result.success) {
                setSuccess(true);
                // Reset after 2s
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    setTitle("");
                    setMessage("");
                }, 2000);
            } else {
                alert("Failed: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-violet-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Megaphone className="w-5 h-5" />
                            Broadcast Alert
                        </h2>
                        <p className="text-violet-200 text-sm mt-1">Send a notification to all/specific users.</p>
                    </div>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Sent Successfully!</h3>
                        <p className="text-gray-500 mt-2">Your message has been broadcasted.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Scheduled Maintenance"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                required
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Details regarding the alert..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Target */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value as any)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    <option value="all">All Users</option>
                                    <option value="vendor">Vendors Only</option>
                                    <option value="customer">Customers Only</option>
                                </select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="success">Success (Green)</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
