"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}
