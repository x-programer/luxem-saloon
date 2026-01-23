"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data: any) => {
        setLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            await sendPasswordResetEmail(auth, data.email);
            setStatus("success");
        } catch (e: any) {
            console.error("Reset Password Error:", e);
            setStatus("error");
            if (e.code === "auth/user-not-found") {
                setErrorMessage("We couldn't find an account with that email.");
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FBFBFF] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-soft p-8 border border-white/20 relative"
            >
                <div className="absolute top-6 left-6">
                    <Link href="/login" className="text-gray-400 hover:text-[#6F2DBD] transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>

                <div className="text-center mb-8 mt-4">
                    <div className="w-16 h-16 bg-[#6F2DBD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        {status === "success" ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                            <Lock className="w-8 h-8 text-[#6F2DBD]" />
                        )}
                    </div>

                    {status === "success" ? (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                            <p className="text-gray-500 mt-2">
                                We've sent a password reset link to your email address.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                            <p className="text-gray-500 mt-2">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </>
                    )}
                </div>

                {status === "success" ? (
                    <Link
                        href="/login"
                        className="w-full bg-gray-100 text-gray-900 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
                    >
                        Back to Login
                    </Link>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    {...register("email", { required: true })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6F2DBD] focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
                                    placeholder="you@example.com"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs mt-1">Email is required</span>}
                        </div>

                        {status === "error" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center"
                            >
                                {errorMessage}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#6F2DBD] to-[#4c1d85] text-white font-semibold py-3.5 px-4 rounded-xl hover:shadow-lg hover:shadow-[#6F2DBD]/20 transition-all active:scale-[0.98] flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
