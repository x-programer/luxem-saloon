"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateCustomerProfile } from "@/app/actions/users";
import { Loader2, User, Phone, Mail, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/hooks/useUserProfile";

interface Props {
    initialData: UserProfile | null;
    onClose?: () => void;
}

export function ProfileSettings({ initialData, onClose }: Props) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || user?.displayName || "",
                phone: initialData.phone || "",
                email: initialData.email || user?.email || "",
            });
        } else if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || "",
                name: user.displayName || ""
            }));
        }
    }, [initialData, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        try {
            const res = await updateCustomerProfile({
                name: formData.name,
                phone: formData.phone
            });

            if (res.success) {
                setMsg({ type: 'success', text: "Profile updated successfully" });
                // Hide success message after 3 seconds
                setTimeout(() => setMsg(null), 3000);
            } else {
                setMsg({ type: 'error', text: res.error || "Failed to update profile" });
            }
        } catch (error) {
            setMsg({ type: 'error', text: "An error occurred" });
        } finally {
            setSaving(false);
        }
    };

    // Loading state is handled by parent or graceful fallback
    // no-op

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
        >
            <div className="bg-white dark:bg-[#111] dark:border-white/5 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 dark:text-white text-slate-900">Profile Settings</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300 text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4" /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300 text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your phone number"
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Email Input (Read-only) */}
                    <div className="space-y-2 opacity-60">
                        <label className="text-sm font-medium dark:text-gray-300 text-slate-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            disabled
                            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-transparent cursor-not-allowed dark:text-white/50 text-slate-500"
                        />
                        <p className="text-xs text-muted-foreground ml-1">Email cannot be changed</p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]",
                                saving && "opacity-70 cursor-wait"
                            )}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                    {/* Feedback Message */}
                    <AnimatePresence>
                        {msg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={cn(
                                    "p-3 rounded-lg text-sm font-medium text-center",
                                    msg.type === 'success'
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                )}
                            >
                                {msg.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </motion.div>
    );
}


