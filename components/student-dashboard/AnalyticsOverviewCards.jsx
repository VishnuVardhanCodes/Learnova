"use client";

import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Activity,
} from "lucide-react";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";

const CARDS = [
  {
    key: "percentage",
    label: "Attendance %",
    icon: TrendingUp,
    gradient: "from-emerald-500/25 to-teal-600/10",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/25",
    suffix: "%",
  },
  {
    key: "total",
    label: "Total Classes",
    icon: BookOpen,
    gradient: "from-blue-500/25 to-indigo-600/10",
    iconColor: "text-blue-400",
    border: "border-blue-500/25",
  },
  {
    key: "present",
    label: "Present Days",
    icon: CheckCircle2,
    gradient: "from-violet-500/25 to-purple-600/10",
    iconColor: "text-violet-400",
    border: "border-violet-500/25",
  },
  {
    key: "absent",
    label: "Absent Days",
    icon: XCircle,
    gradient: "from-rose-500/25 to-red-600/10",
    iconColor: "text-rose-400",
    border: "border-rose-500/25",
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: Award,
    gradient: "from-amber-500/25 to-orange-600/10",
    iconColor: "text-amber-400",
    border: "border-amber-500/25",
  },
  {
    key: "activities",
    label: "Activities",
    icon: Activity,
    gradient: "from-cyan-500/25 to-sky-600/10",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/25",
  },
];

export default function AnalyticsOverviewCards({ stats, achievementCount = 0, activitiesCount = 0 }) {
  const values = {
    percentage: stats?.percentage ?? 0,
    total: stats?.total ?? 0,
    present: (stats?.present ?? 0) + (stats?.late ?? 0),
    absent: stats?.absent ?? 0,
    achievements: achievementCount,
    activities: activitiesCount,
  };

  return (
    <section aria-label="Analytics overview">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {CARDS.map((card, index) => {
          const Icon = card.icon;
          const value = values[card.key];
          return (
            <GlassCard
              key={card.key}
              delay={0.05 + index * 0.04}
              className={`p-4 sm:p-5 bg-gradient-to-br ${card.gradient} ${card.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-black/20 ${card.iconColor}`}>
                  <Icon className="w-4 h-4" aria-hidden />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 mb-1">
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                <AnimatedCounter value={value} suffix={card.suffix || ""} />
              </p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
