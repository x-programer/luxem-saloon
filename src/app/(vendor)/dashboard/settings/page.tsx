"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Palette, Store, MapPin, Check, Loader2, Save, CheckCircle2, Clock, Calendar, AlertCircle, LayoutTemplate, Sparkles, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLinksManager } from "@/components/dashboard/ExternalLinksManager";
import { CalendarConnect } from "@/components/dashboard/CalendarConnect";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("details");
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Slug State
    const [slug, setSlug] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [originalSlug, setOriginalSlug] = useState("");

    // Auth & Navigation
    const { user } = useAuth();
    const router = useRouter();

    // Real-time State
    const [salonName, setSalonName] = useState("Luxe Studio");
    const [tagline, setTagline] = useState("Experience Royalty");
    const [logo, setLogo] = useState("");
    const [banner, setBanner] = useState("");
    const [showLogo, setShowLogo] = useState(true);
    const [address, setAddress] = useState("123 Fashion Ave, NY");
    const [theme, setTheme] = useState("royal");
    const [themeColor, setThemeColor] = useState("#7C3AED"); // Default Purple
    const [externalLinks, setExternalLinks] = useState<any[]>([]);

    // Booking State
    const [isBookingEnabled, setIsBookingEnabled] = useState(false);
    const [schedule, setSchedule] = useState<any>({
        monday: { isOpen: true, start: "09:00", end: "17:00" },
        tuesday: { isOpen: true, start: "09:00", end: "17:00" },
        wednesday: { isOpen: true, start: "09:00", end: "17:00" },
        thursday: { isOpen: true, start: "09:00", end: "17:00" },
        friday: { isOpen: true, start: "09:00", end: "17:00" },
        saturday: { isOpen: true, start: "10:00", end: "15:00" },
        sunday: { isOpen: false, start: "09:00", end: "17:00" },
    });

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.salonName) setSalonName(data.salonName);
                if (data.slug) {
                    setSlug(data.slug);
                    setOriginalSlug(data.slug);
                }
                if (data.logo) setLogo(data.logo);
                if (data.banner) setBanner(data.banner);
                if (data.showLogo !== undefined) setShowLogo(data.showLogo);
                if (data.tagline) setTagline(data.tagline);
                if (data.address) setAddress(data.address);
                if (data.theme) setTheme(data.theme);
                if (data.themeColor) setThemeColor(data.themeColor);
                if (data.isBookingEnabled !== undefined) setIsBookingEnabled(data.isBookingEnabled);
                if (data.schedule) setSchedule(data.schedule);
                if (data.externalLinks) setExternalLinks(data.externalLinks);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Check Slug Availability
    const checkSlugAvailability = async (currentSlug: string) => {
        if (!currentSlug || currentSlug === originalSlug) return true;

        setIsCheckingSlug(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("slug", "==", currentSlug));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setSlugError("This URL is already taken.");
                setIsCheckingSlug(false);
                return false;
            }

            setSlugError("");
            setIsCheckingSlug(false);
            return true;
        } catch (error) {
            console.error("Error checking slug:", error);
            setSlugError("Error verifying URL availability.");
            setIsCheckingSlug(false);
            return false;
        }
    };

    // Handle Slug Input Change
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setSlug(newSlug);
        setSlugError("");
    };

    // Save Data Handler
    const handleSave = async () => {
        if (!user) return;
        const isSlugValid = await checkSlugAvailability(slug);
        if (!isSlugValid) return;

        setIsSaving(true);
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                salonName,
                slug,
                logo,
                banner,
                showLogo,
                tagline,
                address,
                theme,
                themeColor, // Save the custom color
                isBookingEnabled,
                schedule,
                updatedAt: new Date()
            });

            setOriginalSlug(slug);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

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

    const tabs = [
        { id: "details", label: "Details", icon: Store },
        { id: "branding", label: "Branding", icon: Sparkles },
        { id: "themes", label: "Theme", icon: Palette },
        { id: "schedule", label: "Schedule", icon: Clock },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF9] p-4 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-x-hidden">

            {/* Background Gradient Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-white/50"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-50">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved!</h2>
                            <p className="text-gray-500 text-center">Your profile has been updated perfectly.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 bg-white/60 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/40 p-6 md:p-10 h-fit relative flex flex-col z-10"
            >
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-brand font-bold text-sm mb-6 w-fit transition-colors group">
                    <div className="p-1.5 rounded-lg bg-white border border-gray-100 group-hover:border-brand/30 group-hover:bg-brand/5 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Settings</h1>
                        <p className="text-gray-500 font-medium">Manage your salon's digital presence.</p>
                    </div>
                    {/* Save Button (Desktop) */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="hidden md:flex bg-brand text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-brand/20 hover:shadow-2xl hover:bg-brand-hover hover:scale-[1.02] transition-all items-center gap-2 disabled:opacity-70 active:scale-95"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>

                {/* ANIMATED TABS */}
                <div className="flex gap-2 mb-10 bg-gray-100/50 p-1.5 rounded-2xl max-w-full overflow-x-auto no-scrollbar md:w-fit backdrop-blur-sm self-start">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative px-4 py-2.5 md:px-6 md:py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 z-10 whitespace-nowrap flex-shrink-0",
                                activeTab === tab.id ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white shadow-md rounded-xl z-[-1]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "details" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 max-w-2xl"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Salon Name</label>
                                    <div className="relative group">
                                        <Store className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" />
                                        <input
                                            value={salonName}
                                            onChange={(e) => setSalonName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Profile URL</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-[17px] text-gray-400 text-sm font-mono font-medium">luxe.com/</div>
                                            <input
                                                value={slug}
                                                onChange={handleSlugChange}
                                                onBlur={() => checkSlugAvailability(slug)}
                                                placeholder="my-salon"
                                                className={cn(
                                                    "w-full pl-[90px] pr-4 py-4 rounded-2xl bg-white border text-gray-900 font-mono text-sm font-medium focus:outline-none focus:ring-4 transition-all shadow-sm",
                                                    slugError
                                                        ? "border-red-200 focus:ring-red-100 focus:border-red-400"
                                                        : "border-gray-100 focus:ring-[#6F2DBD]/10 focus:border-[#6F2DBD]"
                                                )}
                                            />
                                            {isCheckingSlug && (
                                                <div className="absolute right-4 top-4">
                                                    <Loader2 className="w-5 h-5 animate-spin text-[#6F2DBD]" />
                                                </div>
                                            )}
                                        </div>
                                        {slugError ? (
                                            <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 ml-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> {slugError}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 font-medium ml-1">Visible at: <span className="text-[#6F2DBD]">luxe.com/{slug || '...'}</span></p>
                                        )}
                                    </div>
                                    <div className="flex items-end pb-1">
                                        {slug && !slugError && slug === originalSlug ? (
                                            <a
                                                href={`/${slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-4 rounded-2xl bg-[#6F2DBD]/5 text-[#6F2DBD] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#6F2DBD]/10 transition-colors border border-[#6F2DBD]/20"
                                            >
                                                Preview Page <LayoutTemplate className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <div className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-bold text-sm flex items-center justify-center border border-gray-100 cursor-not-allowed">
                                                Preview Unavailable
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Tagline</label>
                                    <input
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-[#6F2DBD]/10 focus:border-[#6F2DBD] transition-all shadow-sm"
                                        placeholder="E.g. Where beauty meets elegance"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#6F2DBD] transition-colors" />
                                        <input
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-[#6F2DBD]/10 focus:border-[#6F2DBD] transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "branding" && (
                            <motion.div
                                key="branding"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-10 max-w-2xl"
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex flex-col items-center gap-4 bg-white/50 p-6 rounded-3xl border border-gray-100 shadow-sm w-full md:w-auto">
                                        <h3 className="font-bold text-gray-900">Logo</h3>
                                        <ImageUploader
                                            currentImage={logo}
                                            onUpload={setLogo}
                                            onRemove={() => setLogo("")}
                                            directory="logo"
                                            variant="circle"
                                            helperText="PNG/JPG"
                                        />
                                        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={showLogo}
                                                    onChange={(e) => setShowLogo(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6F2DBD]"></div>
                                            </label>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                {showLogo ? "Public" : "Hidden"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-4">
                                        <h3 className="font-bold text-gray-900 ml-2">Hero Cover Image</h3>
                                        <div className="bg-white/50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                                            <ImageUploader
                                                currentImage={banner}
                                                onUpload={setBanner}
                                                onRemove={() => setBanner("")}
                                                directory="banner"
                                                variant="rectangular"
                                                helperText="1200x600px High Quality"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Brand Color Picker */}
                                <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Brand Color</h3>
                                            <p className="text-sm text-gray-500">Pick a primary color for your dashboard and public profile.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full shadow-sm border border-gray-200"
                                                style={{ backgroundColor: themeColor }}
                                            />
                                            <input
                                                type="color"
                                                value={themeColor}
                                                onChange={(e) => setThemeColor(e.target.value)}
                                                className="w-12 h-12 p-1 bg-white rounded-xl cursor-pointer border border-gray-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['#7C3AED', '#DB2777', '#2563EB', '#059669', '#D97706', '#DC2626'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setThemeColor(c)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                                    themeColor === c ? "border-gray-900 scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-lg">External Links</h3>
                                    <p className="text-sm text-gray-500">Add links to your social media, website, or online shop.</p>
                                    <ExternalLinksManager currentLinks={externalLinks} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "themes" && (
                            <motion.div
                                key="themes"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {[
                                    { id: "royal", name: "Royal Velvet", color: "bg-[#6F2DBD]", bgFull: "bg-gradient-to-br from-[#6F2DBD] to-[#4c1d85]" },
                                    { id: "midnight", name: "Midnight Zen", color: "bg-[#171123]", bgFull: "bg-gradient-to-br from-[#171123] to-gray-900" },
                                    { id: "ocean", name: "Ocean Breeze", color: "bg-blue-600", bgFull: "bg-gradient-to-br from-blue-500 to-blue-700" },
                                ].map((t) => (
                                    <motion.div
                                        key={t.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "relative overflow-hidden rounded-3xl border-4 cursor-pointer transition-all aspect-[4/3] group shadow-lg",
                                            theme === t.id ? "border-[#6F2DBD] ring-4 ring-[#6F2DBD]/20" : "border-white hover:border-gray-200"
                                        )}
                                    >
                                        <div className={cn("absolute inset-0 transition-opacity opacity-80 group-hover:opacity-100", t.bgFull)} />

                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                                            <span className="text-white font-bold text-lg">{t.name}</span>
                                            {theme === t.id && (
                                                <div className="bg-white text-[#6F2DBD] p-1.5 rounded-full shadow-lg">
                                                    <Check className="w-4 h-4 stroke-[3px]" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === "schedule" && (
                            <motion.div
                                key="schedule"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-3 rounded-2xl transition-colors", isBookingEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Online Booking</h3>
                                            <p className="text-sm text-gray-500 font-medium">Allow customers to book appointments directly.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-125 mr-2">
                                        <input
                                            type="checkbox"
                                            checked={isBookingEnabled}
                                            onChange={(e) => setIsBookingEnabled(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6F2DBD]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Google Calendar</h3>
                                            <p className="text-sm text-gray-500 font-medium">Sync your appointments with Google Calendar.</p>
                                        </div>
                                    </div>
                                    <CalendarConnect />
                                </div>

                                <div className="space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4 ml-1">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        Weekly Hours
                                    </h3>
                                    <div className="grid gap-3">
                                        {Object.keys(schedule).map((day, idx) => (
                                            <motion.div
                                                key={day}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={cn(
                                                    "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all",
                                                    schedule[day].isOpen
                                                        ? "bg-white border-gray-100 shadow-sm"
                                                        : "bg-gray-50/50 border-transparent opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <div className="flex items-center justify-between min-w-[140px]">
                                                    <span className="capitalize font-bold text-gray-700 text-sm">{day}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule[day].isOpen}
                                                        onChange={(e) => setSchedule({
                                                            ...schedule,
                                                            [day]: { ...schedule[day], isOpen: e.target.checked }
                                                        })}
                                                        className="w-5 h-5 rounded-md border-gray-300 text-[#6F2DBD] focus:ring-[#6F2DBD] cursor-pointer"
                                                    />
                                                </div>

                                                {schedule[day].isOpen ? (
                                                    <div className="flex items-center gap-2 flex-1 animate-in fade-in zoom-in-95 duration-200">
                                                        <input
                                                            type="time"
                                                            value={schedule[day].start}
                                                            onChange={(e) => setSchedule({
                                                                ...schedule,
                                                                [day]: { ...schedule[day], start: e.target.value }
                                                            })}
                                                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border-0 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-brand/20"
                                                        />
                                                        <span className="text-gray-300 font-bold">-</span>
                                                        <input
                                                            type="time"
                                                            value={schedule[day].end}
                                                            onChange={(e) => setSchedule({
                                                                ...schedule,
                                                                [day]: { ...schedule[day], end: e.target.value }
                                                            })}
                                                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border-0 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#6F2DBD]/20"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-red-300 font-bold bg-red-50 px-3 py-1 rounded-lg w-fit">Closed</span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Save Button (Sticky Bottom) */}
                <div className="md:hidden sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 mt-6 -mx-6 -mb-6 flex justify-center">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </motion.div >

            {/* Right Column: Premium Live Preview */}
            <div className="hidden xl:flex w-[400px] items-start justify-center pt-10 sticky top-8 h-fit">
                <div className="relative w-[320px] h-[650px] bg-gray-900 rounded-[50px] shadow-2xl overflow-hidden border-[12px] border-gray-900 ring-8 ring-gray-100">
                    <div className="absolute top-0 w-full h-8 bg-black z-20 flex justify-between px-8 items-center">
                        <div className="text-[10px] text-white font-medium">9:41</div>
                        <div className="w-20 h-5 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 -top-1"></div>
                        <div className="flex gap-1.5 items-center">
                            <div className="w-4 h-2.5 bg-white rounded-[2px]" />
                        </div>
                    </div>

                    {/* Screen Content */}
                    <div className="w-full h-full bg-white overflow-y-auto overflow-x-hidden no-scrollbar pb-10">
                        <div className={`h-48 relative ${currentTheme.bg} transition-colors duration-500`}>
                            {banner ? (
                                <img src={banner} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="w-full h-full bg-black/10" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white z-10">
                                    {logo ? (
                                        <img src={logo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-300">
                                            {salonName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 px-6 text-center">
                            <h2 className="text-xl font-black text-gray-900 leading-tight">{salonName}</h2>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{tagline}</p>
                            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-bold text-gray-400 bg-gray-50 py-1 px-3 rounded-full w-fit mx-auto">
                                <MapPin className="w-3 h-3" /> {address}
                            </div>
                        </div>

                        <div className="mt-8 px-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm text-gray-900">Services</h3>
                                <span className={`text-[10px] font-bold ${currentTheme.text} uppercase tracking-wider`}>View All</span>
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="h-3 w-3/4 bg-gray-200 rounded mb-1.5" />
                                        <div className="h-2 w-1/2 bg-gray-100 rounded" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">$80</div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 mt-8">
                            <button className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl shadow-luxe-primary/20 hover:scale-[1.02] transition-all ${currentTheme.bg} text-white`}>
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
