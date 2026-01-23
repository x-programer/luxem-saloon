"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBFBFF]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#6F2DBD]/10 rounded-full flex items-center justify-center ring-4 ring-[#6F2DBD]/5 animate-pulse">
                        <Loader2 className="w-8 h-8 text-[#6F2DBD] animate-spin" />
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
