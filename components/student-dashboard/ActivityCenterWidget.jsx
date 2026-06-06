"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Zap, Activity } from "lucide-react";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";

const STATUS_STYLES = {
  present: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  late: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  absent: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function ActivityCenterWidget({
  recentActivity = [],
  todayClasses = [],
  upcomingClass,
  dayName,
  participationScore = 0,
}) {
  const recent = useMemo(() => recentActivity.slice(0, 5), [recentActivity]);

  return (
    <section aria-label="Activity center" className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" aria-hidden />
        Activity Center
      </h2>

      <GlassCard className="p-5" delay={0.1}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">Participation Score</p>
          <div className="flex items-center gap-1 text-cyan-400">
            <Zap className="w-4 h-4" aria-hidden />
            <span className="text-xl font-bold">
              <AnimatedCounter value={participationScore} suffix="%" />
            </span>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${participationScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            role="progressbar"
            aria-valuenow={participationScore}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </GlassCard>

      {upcomingClass && (
        <GlassCard className="p-5 border-cyan-500/20 bg-cyan-500/5" delay={0.15}>
          <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">Up Next · {dayName}</p>
          <h3 className="font-semibold text-white">{upcomingClass.subject}</h3>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              {upcomingClass.time}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" aria-hidden />
              {upcomingClass.room} · {upcomingClass.teacher}
            </p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5" delay={0.2}>
        <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" aria-hidden />
          Today&apos;s Schedule ({todayClasses.length})
        </p>
        {todayClasses.length === 0 ? (
          <p className="text-xs text-slate-500">No classes scheduled today</p>
        ) : (
          <ul className="space-y-2">
            {todayClasses.slice(0, 4).map((cls) => (
              <li
                key={`${cls.subject}-${cls.time}`}
                className="flex items-center justify-between text-xs bg-white/5 rounded-xl px-3 py-2"
              >
                <span className="text-white font-medium">{cls.subject}</span>
                <span className="text-slate-400">{cls.time}</span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard className="p-5" delay={0.25}>
        <p className="text-sm font-medium text-white mb-4">Recent Activity</p>
        {recent.length === 0 ? (
          <p className="text-xs text-slate-500">No recent activity yet</p>
        ) : (
          <ol className="relative border-l border-white/10 ml-2 space-y-4">
            {recent.map((item, i) => (
              <motion.li
                key={`${item.date}-${item.subject}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="ml-4 relative"
              >
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#0B1120]" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-white font-medium">{item.subject || "Activity"}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                      STATUS_STYLES[item.status?.toLowerCase()] || STATUS_STYLES.present
                    }`}
                  >
                    {item.status || "present"}
                  </span>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </GlassCard>
    </section>
  );
}
