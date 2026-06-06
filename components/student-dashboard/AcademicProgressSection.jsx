"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { GraduationCap, TrendingUp } from "lucide-react";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";
import { getSubjectPerformance, computeGpa } from "./utils";

export default function AcademicProgressSection({ recentActivity }) {
  const subjects = useMemo(() => getSubjectPerformance(recentActivity), [recentActivity]);
  const gpa = useMemo(() => computeGpa(subjects), [subjects]);

  const trendData = useMemo(
    () =>
      subjects.map((s, i) => ({
        name: s.subject.slice(0, 8),
        score: s.rate,
        index: i,
      })),
    [subjects]
  );

  return (
    <section aria-label="Academic progress" className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-indigo-400" aria-hidden />
        Academic Progress
      </h2>

      <div className="grid md:grid-cols-[200px_1fr] gap-4">
        <GlassCard className="p-6 text-center" delay={0.1}>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">GPA Overview</p>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            <AnimatedCounter value={gpa} decimals={1} />
          </p>
          <p className="text-xs text-slate-500 mt-2">Based on subject performance</p>
          <div className="mt-4 flex items-center justify-center gap-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            Steady progress
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6" delay={0.15}>
          <p className="text-sm text-slate-400 mb-4">Performance trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="academicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#0B1120",
                  border: "1px solid #ffffff20",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#818cf8"
                fill="url(#academicGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {subjects.map((subject, i) => (
          <GlassCard key={subject.subject} delay={0.1 + i * 0.05} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-white text-sm">{subject.subject}</p>
                <p className="text-xs text-slate-400">Grade {subject.grade}</p>
              </div>
              <span className="text-lg font-bold text-indigo-400">{subject.rate}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subject.rate}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  subject.rate >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : subject.rate >= 60
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-rose-500 to-red-400"
                }`}
                role="progressbar"
                aria-valuenow={subject.rate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
