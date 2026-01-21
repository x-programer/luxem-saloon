"use client";

import { useState } from "react";
import { Shield, RefreshCw, Smartphone, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecoverySettingsPage() {
    const [isRevealed, setIsRevealed] = useState(false);
    const [loading, setLoading] = useState(false);
    // Mock initial state
    const [codes, setCodes] = useState<string[]>([]);
    const [remaining, setRemaining] = useState(5);

    const handleReveal = async () => {
        if (isRevealed) {
            setIsRevealed(false);
            return;
        }
        setLoading(true);
        // Mock fetch codes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCodes(["TX9-22M1", "8B2-99L3", "K7P-44X9", "M2N-55Q0", "Z1Z-33R8"]);
        setIsRevealed(true);
        setLoading(false);
    };

    const handleRegenerate = async () => {
        if (!confirm("This will invalidate your old codes. Are you sure?")) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCodes(["AAA-1111", "BBB-2222", "CCC-3333", "DDD-4444", "EEE-5555"]);
        setRemaining(5);
        setIsRevealed(true);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-textMain mb-2">Security & Recovery</h1>
            <p className="text-textMuted mb-8">Manage your two-factor authentication and emergency access.</p>

            <div className="space-y-6">
                {/* Authenticator Device Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-textMain">Authenticator App</h3>
                                <p className="text-sm text-gray-500 mt-1">Used for daily login.</p>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Active</span>
                        </div>
                        <div className="mt-4">
                            <button className="text-sm border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                Setup New Device / Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Backup Codes Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-textMain">Emergency Backup Codes</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Use these if you lose your phone. <br />
                                    <strong>{remaining} codes remaining.</strong>
                                </p>
                            </div>
                            <button
                                onClick={handleRegenerate}
                                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-violet-700 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Regenerate
                            </button>
                        </div>

                        <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-100 relative overflow-hidden">
                            <AnimatePresence>
                                {!isRevealed && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center z-10"
                                    >
                                        <button
                                            onClick={handleReveal}
                                            className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50"
                                        >
                                            <Eye className="w-4 h-4" /> Click to Reveal
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${!isRevealed ? 'filter blur-sm select-none' : ''}`}>
                                    {(codes.length > 0 ? codes : ["••••-••••", "••••-••••", "••••-••••", "••••-••••", "••••-••••"]).map((code, i) => (
                                        <div key={i} className="font-mono text-center bg-white border border-gray-200 py-2 rounded text-sm text-gray-600">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {isRevealed && (
                            <div className="mt-4 text-center">
                                <button onClick={() => setIsRevealed(false)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto">
                                    <EyeOff className="w-3 h-3" /> Hide Codes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
