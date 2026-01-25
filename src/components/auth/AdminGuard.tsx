"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // Explicitly using useEffect for redirect
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || role !== "admin") {
                console.warn("Access denied: User is not an admin.");
                router.replace(user ? "/dashboard" : "/login");
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // If not loading and has admin role, render children
    // If not admin, the useEffect above will redirect, and we return null (or loader) in the meantime to avoid flash
    if (!user || role !== "admin") {
        return null;
    }

    return <>{children}</>;
}
