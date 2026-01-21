"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Palette, Store, Smartphone, MapPin, Check, Loader2, Save, CheckCircle2 } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation"; // Import Router

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("details");
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Success State

    // Auth & Navigation
    const { user } = useAuth();
    const router = useRouter();

    // Real-time State
    const [salonName, setSalonName] = useState("Luxe Studio");
    const [tagline, setTagline] = useState("Experience Royalty");
    const [address, setAddress] = useState("123 Fashion Ave, NY");
    const [theme, setTheme] = useState("royal");

    // Fetch Data
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.salonName) setSalonName(data.salonName);
                    if (data.tagline) setTagline(data.tagline);
                    if (data.address) setAddress(data.address);
                    if (data.theme) setTheme(data.theme);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, [user]);

    // Save Data Handler
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                salonName,
                tagline,
                address,
                theme,
                updatedAt: new Date()
            });

            // Show Success Animation
            setShowSuccess(true);

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    // Theme Configs
    const currentTheme = {
        royal: { bg: "bg-[#6F2DBD]", text: "text-white", accent: "bg-[#A663CC]" },
        midnight: { bg: "bg-[#171123]", text: "text-white", accent: "bg-[#6F2DBD]" },
        ocean: { bg: "bg-blue-600", text: "text-white", accent: "bg-blue-400" },
    }[theme as "royal" | "midnight" | "ocean"] || { bg: "bg-[#6F2DBD]", text: "text-white", accent: "bg-[#A663CC]" };

    return (
        <div className="min-h-screen bg-luxe-surface p-4 md:p-8 flex flex-col md:flex-row gap-8 relative">

            {/* SUCCESS MODAL OVERLAY */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved!</h2>
                            <p className="text-gray-500 text-center mb-6">Your profile has been updated. Returning to dashboard...</p>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2 }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Column: Controls */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 bg-white rounded-3xl shadow-soft p-6 md:p-8 h-fit relative flex flex-col"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-luxe-dark mb-2">Salon Settings</h1>
                        <p className="text-gray-500">Customize your brand identity and theme.</p>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
                    {["details", "branding", "themes"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                ? "bg-white text-luxe-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "details" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-luxe-dark mb-1">Salon Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            value={salonName}
                                            onChange={(e) => setSalonName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxe-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-luxe-dark mb-1">Tagline</label>
                                    <input
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxe-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-luxe-dark mb-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-luxe-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "branding" && (
                            <motion.div
                                key="branding"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-luxe-primary/50 transition-colors cursor-pointer group">
                                    <div className="w-16 h-16 bg-luxe-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-luxe-primary/10 transition-colors">
                                        <Camera className="w-8 h-8 text-luxe-primary" />
                                    </div>
                                    <h3 className="font-semibold text-luxe-dark">Upload Logo</h3>
                                    <p className="text-sm text-gray-500">PNG or JPG, max 2MB</p>
                                </div>
                                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-luxe-primary/50 transition-colors cursor-pointer group">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-luxe-primary/10 transition-colors">
                                        <Palette className="w-8 h-8 text-gray-400 group-hover:text-luxe-primary" />
                                    </div>
                                    <h3 className="font-semibold text-luxe-dark">Cover Image</h3>
                                    <p className="text-sm text-gray-500">1200x600px Recommended</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "themes" && (
                            <motion.div
                                key="themes"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                {[
                                    { id: "royal", name: "Royal Velvet", color: "bg-[#6F2DBD]" },
                                    { id: "midnight", name: "Midnight Zen", color: "bg-[#171123]" },
                                    { id: "ocean", name: "Ocean Breeze", color: "bg-blue-600" },
                                ].map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${theme === t.id
                                            ? "border-luxe-primary bg-luxe-primary/5"
                                            : "border-gray-100 hover:border-gray-200"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full ${t.color} mr-4 shadow-sm`} />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-luxe-dark">{t.name}</h3>
                                        </div>
                                        {theme === t.id && (
                                            <div className="w-6 h-6 bg-luxe-primary rounded-full flex items-center justify-center text-white">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-luxe-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </motion.div>

            {/* Right Column: Live Preview */}
            <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50/50 rounded-3xl p-8 border border-white shadow-inner">
                <div className="sticky top-12">
                    {/* PHONE MOCKUP (Same as before) */}
                    <div className="relative w-[300px] h-[600px] bg-black rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-black ring-2 ring-gray-200">
                        {/* Phone Status Bar */}
                        <div className="absolute top-0 w-full h-8 bg-black z-20 flex justify-between px-6 items-center">
                            <div className="text-[10px] text-white font-medium">9:41</div>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-white rounded-full opacity-0" />
                            </div>
                        </div>

                        {/* Phone Screen Content */}
                        <div className="w-full h-full bg-white overflow-y-auto pt-8">
                            {/* Header Banner */}
                            <div className={`h-32 ${currentTheme.bg} w-full relative transition-colors duration-300`}>
                                <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                                    <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                        <span className="text-xs text-gray-500 font-bold">LOGO</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="mt-10 px-6">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{salonName || "Salon Name"}</h2>
                                <p className="text-xs text-gray-500 mt-1">{tagline || "Your catchy tagline here"}</p>

                                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    {address || "Your Address"}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 mt-6 grid grid-cols-2 gap-3">
                                <button className={`py-2 rounded-lg text-sm font-semibold shadow-md ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
                                    Book Now
                                </button>
                                <button className="py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700">
                                    Contact
                                </button>
                            </div>

                            {/* Services List Preview */}
                            <div className="px-6 mt-8 space-y-4">
                                <h3 className="font-bold text-sm text-gray-900">Popular Services</h3>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="h-3 w-2/3 bg-gray-100 rounded mb-1" />
                                            <div className="h-2 w-1/3 bg-gray-50 rounded" />
                                        </div>
                                        <div className="text-xs font-bold text-gray-900">$50</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Home Bar */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}