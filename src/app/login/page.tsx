"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Lock } from "lucide-react";
import Link from "next/link";
// import { signInWithCustomToken } from "firebase/auth";
// import { auth } from "@/lib/firebase/config";

// --- Mock API Login ---
const mockLogin = async (phone: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Accept valid TOTP (6 digits) or Backup Code format (XXX-XXXX)
    if (code.length === 6 && !isNaN(Number(code))) return { token: "mock-token" };
    if (code.includes("-") && code.length === 8) return { token: "mock-token" }; // Backup code format
    throw new Error("Invalid code");
}

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError("");
        try {
            await mockLogin(data.phone, data.code);
            // await signInWithCustomToken(auth, res.token);
            router.push("/dashboard");
        } catch (e) {
            setError("Invalid credentials. Please check your code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-md bg-surface rounded-2xl shadow-soft p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-textMain">Secure Login</h1>
                    <p className="text-textMuted mt-2">Enter your phone and authenticator code</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1">Phone Number</label>
                        <input
                            {...register("phone", { required: true })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                            placeholder="+1 555 000 0000"
                        />
                        {errors.phone && <span className="text-red-500 text-xs mt-1">Required</span>}
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-textMain">Security Code</label>
                            <span className="text-xs text-textMuted">TOTP or Backup Code</span>
                        </div>
                        <input
                            {...register("code", { required: true })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white font-mono text-center tracking-wider"
                            placeholder="000000  or  TX9-22M1"
                        />
                        {errors.code && <span className="text-red-500 text-xs mt-1">Required</span>}
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                            Start Free Trial
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
