"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";

// Dynamically import AchievementsShowcase component with SSR disabled to prevent hydration mismatch
const AchievementsShowcase = dynamic(
  () => import("@/components/achievements/AchievementsShowcase"),
  { ssr: false, loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-cyan-400/80 text-sm font-semibold animate-pulse">Loading achievements showcase...</p>
    </div>
  )}
);

export default function AchievementsPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
        {/* Background glow ornaments */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <Navbar />
        
        {/* Page padding adjustment for fixed Navbar */}
        <div className="pt-16">
          <AchievementsShowcase />
        </div>
      </div>
    </ProtectedRoute>
  );
}
