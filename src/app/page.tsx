"use client";


import { Hero } from "@/components/Hero";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#f8f7ff] dark:bg-[#020617]">
      {/* Orb 1 - Soft Violet */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-violet-400/20 dark:bg-violet-400/10 dark:opacity-20 blur-[128px]"
      />

      {/* Orb 2 - Royal Purple */}
      <motion.div
        animate={{
          x: [0, -70, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-500/20 dark:bg-purple-500/10 dark:opacity-20 blur-[128px]"
      />

      {/* Orb 3 - Secondary/Blueish */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 dark:bg-indigo-300/10 dark:opacity-20 blur-[100px]"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative font-sans text-textMain selection:bg-primary/30">
      <BackgroundAtmosphere />

      {/* Content Layer */}
      <div className="relative z-10">

        <Hero />
        <FeaturesGrid />
        <ThemeShowcase />
        <Footer />
      </div>
    </main>
  );
}
