"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError("");

        try {
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. 🔍 Check "Who is this?"

            // HARDCODED SUPER ADMIN CHECK (Must match auth-context.tsx)
            const ADMIN_EMAIL = "ringtoneboy1530@gmail.com";
            if (user.email === ADMIN_EMAIL) {
                console.log("Super Admin detected via email override.");
                router.push("/admin/users");
                return;
            }

            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                console.warn("User document not found in Firestore for UID:", user.uid);
                router.push("/");
                return;
            }

            const userData = userDoc.data();
            const role = userData?.role;

            console.log("Detected Role:", role); // Debugging

            // 3. 🚦 Redirect based on Role
            if (role === 'admin') {
                router.push("/admin/users"); // Super Admin Dashboard
            } else if (role === 'vendor') {
                router.push("/dashboard");   // Vendor Dashboard
            } else if (role === 'client') {
                router.push("/my-bookings"); // Client Dashboard
            } else {
                router.push("/");            // Default / Home
            }

        } catch (e: any) {
            console.error(e);
            if (
                e.code === "auth/invalid-credential" ||
                e.code === "auth/user-not-found" ||
                e.code === "auth/wrong-password"
            ) {
                setError("Invalid email or password. Please try again.");
            } else if (e.code === "auth/too-many-requests") {
                setError("Access temporarily locked due to many failed attempts.");
            } else {
                setError("Unable to sign in. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FBFBFF] p-4 relative overflow-hidden">

            {/* BACKGROUND GRID TEXTURE */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(#6F2DBD 1.5px, transparent 1.5px), linear-gradient(to right, #6F2DBD 1.5px, transparent 1.5px)",
                    backgroundSize: "40px 40px"
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-soft p-8 border border-white/50 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#6F2DBD]/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-[#6F2DBD]/5">
                        <Lock className="w-7 h-7 text-[#6F2DBD]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your salon empire.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* EMAIL INPUT */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <div className="relative group">
                            <input
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Please enter a valid email address"
                                    }
                                })}
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-[3px] focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                                placeholder="you@company.com"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#6F2DBD] transition-colors" />
                        </div>
                        {errors.email && <span className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message as string}</span>}
                    </div>

                    {/* PASSWORD INPUT */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <Link href="/forgot-password" className="text-xs text-[#6F2DBD] hover:text-[#5a2499] font-semibold hover:underline transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                {...register("password", { required: "Password is required" })}
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-[3px] focus:ring-[#6F2DBD]/20 focus:border-[#6F2DBD] bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#6F2DBD] transition-colors" />
                        </div>
                        {errors.password && <span className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password.message as string}</span>}
                    </div>

                    {/* ERROR ALERT */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-xl text-center font-medium flex items-center justify-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#6F2DBD] to-[#4c1d85] text-white font-bold py-3.5 px-4 rounded-xl hover:shadow-lg hover:shadow-[#6F2DBD]/25 hover:-translate-y-0.5 transition-all active:scale-[0.98] active:translate-y-0 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        New to LuxeSalon?{" "}
                        <Link href="/signup" className="text-[#6F2DBD] font-bold hover:underline transition-all">
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}