import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-foreground font-sans">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <ThemeShowcase />
      <Footer />
    </main>
  );
}
