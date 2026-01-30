"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError("");

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. Update Profile Display Name
            await updateProfile(user, {
                displayName: data.fullName
            });

            // 3. Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: data.email,
                displayName: data.fullName,
                salonName: data.salonName,
                role: "vendor",
                status: "pending",
                createdAt: serverTimestamp(),
            });

            // 4. Redirect
            router.push("/dashboard");

        } catch (err: any) {
            console.error(err);
            // Specific Error Handling
            if (err.code === "auth/email-already-in-use") {
                setError("Email is already registered. Please login instead.");
            } else if (err.code === "auth/weak-password") {
                setError("Password should be at least 6 characters.");
            } else if (err.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-surface rounded-3xl shadow-soft p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-textMain">Create Account</h1>
                    <p className="text-textMuted mt-2">Join Saloon Book to manage your business</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Full Name</label>
                        <input
                            {...register("fullName", { required: "Full name is required" })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="Jane Doe"
                        />
                        {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</span>}
                    </div>

                    {/* Salon Name */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Salon Name</label>
                        <input
                            {...register("salonName", { required: "Salon name is required" })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="Saloon Studio"
                        />
                        {errors.salonName && <span className="text-red-500 text-xs mt-1">{errors.salonName.message as string}</span>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Email Address</label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="jane@example.com"
                        />
                        {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message as string}</span>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Must be at least 6 characters" }
                                })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message as string}</span>}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-textMuted">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}