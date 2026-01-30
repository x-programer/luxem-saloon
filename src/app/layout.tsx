import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // [NEW] Modern Font
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";

// [UPDATED] Configure Font
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Saloon Book - The OS for Modern Salons",
  description: "Manage bookings, showcase your portfolio, and grow your brand with a stunning profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} antialiased font-sans`} // [UPDATED] Added font-sans and jakarta variable
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
