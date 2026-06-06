"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Calendar, Grid3X3 } from "lucide-react";
import CircularProgress from "@/components/ui/CircularProgress";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";

const AttendanceChart = dynamic(() => import("@/components/AttendanceChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const AttendanceHeatmap = dynamic(() => import("@/components/AttendanceHeatmap"), {
  ssr: false,
  loading: () => <ChartSkeleton variant="heatmap" />,
});

const AttendanceCalendar = dynamic(() => import("@/components/AttendanceCalendar"), {
  ssr: false,
  loading: () => <ChartSkeleton variant="heatmap" />,
});

export default function AttendanceProgressSection({
  sectionRef,
  stats,
  recentActivity,
  viewMode,
  onViewModeChange,
}) {
  const percentage = stats?.percentage ?? 0;

  return (
    <section ref={sectionRef} aria-label="Attendance progress" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-white">Attendance Progress</h2>
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {[
            { id: "heatmap", label: "Heatmap", icon: Grid3X3 },
            { id: "calendar", label: "Calendar", icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewModeChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === id
                  ? "bg-indigo-500/30 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              aria-pressed={viewMode === id}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-4">
        <GlassCard className="p-6 flex flex-col items-center justify-center min-w-[180px]" delay={0.1}>
          <CircularProgress value={percentage} size={120} />
          <p className="mt-4 text-sm font-semibold text-white">Overall Attendance</p>
          <p className="text-xs text-slate-400 mt-1">
            <AnimatedCounter value={stats?.present ?? 0} /> present ·{" "}
            <AnimatedCounter value={stats?.absent ?? 0} /> absent
          </p>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 min-h-[280px]" delay={0.15}>
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "heatmap" ? (
              <AttendanceHeatmap recentActivity={recentActivity} />
            ) : (
              <AttendanceCalendar recentActivity={recentActivity} />
            )}
          </motion.div>
        </GlassCard>
      </div>

      <GlassCard className="p-4 sm:p-6" delay={0.2}>
        <AttendanceChart />
      </GlassCard>
    </section>
  );
}
