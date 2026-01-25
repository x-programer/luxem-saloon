"use client";

// Simple wrapper layout for Vendor Dashboard
// The actual Sidebar and Header are now handled in page.tsx to allow for "God Mode" data access and smoother layout control.

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FBFBFF] relative selection:bg-purple-100 font-sans text-slate-900">
            {/* 1. Subtle Background Gradients (The "Luxe" Glow) - Kept for consistency */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[100px]" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}