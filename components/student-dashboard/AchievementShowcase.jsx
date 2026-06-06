"use client";

import dynamic from "next/dynamic";
import { Award } from "lucide-react";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import GlassCard from "./GlassCard";

const AchievementSection = dynamic(() => import("@/components/AchievementSection"), {
  ssr: false,
  loading: () => <DashboardSkeleton />,
});

const StudentAchievementsPanel = dynamic(
  () => import("@/components/achievements/StudentAchievementsPanel"),
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

export default function AchievementShowcase({
  sectionRef,
  attendancePercentage,
  streakDays,
}) {
  return (
    <section ref={sectionRef} aria-label="Achievements and certificates" className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" aria-hidden />
        Achievement Showcase
      </h2>

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-4 sm:p-6" delay={0.1}>
          <AchievementSection
            attendancePercentage={attendancePercentage}
            streakDays={streakDays}
          />
        </GlassCard>

        <GlassCard className="p-4 sm:p-6" delay={0.15}>
          <StudentAchievementsPanel />
        </GlassCard>
      </div>
    </section>
  );
}
