"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Target, ArrowRight } from "lucide-react";

function PerformanceRoadmap({ roadmap }) {
  if (!roadmap) return null;

  const { currentStatus, targetStatus, actions, summary, gap } = roadmap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">AI Improvement Roadmap</h3>
      </div>

      <p className="text-sm text-slate-400 mb-6">{summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatusCard
          title="Current Status"
          score={currentStatus.predictionScore}
          riskLevel={currentStatus.riskLevel}
          details={[
            { label: "Attendance", value: `${currentStatus.attendance}%` },
            { label: "Grades", value: `${currentStatus.grades}%` },
            { label: "Activities", value: `${currentStatus.activities}%` },
          ]}
          variant="current"
        />
        <StatusCard
          title="Target Status"
          score={targetStatus.predictionScore}
          riskLevel={targetStatus.riskLevel}
          details={[
            {
              label: "Projected",
              value: `${targetStatus.projectedScore}`,
            },
            { label: "Gap", value: gap > 0 ? `+${gap} pts needed` : "On target" },
          ]}
          variant="target"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Recommended Actions</h4>
        </div>
        {actions.map((action, i) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              action.completed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : action.priority === "high"
                  ? "bg-rose-500/5 border-rose-500/20"
                  : "bg-white/5 border-white/10"
            }`}
          >
            {action.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  action.completed ? "text-emerald-300 line-through" : "text-white"
                }`}
              >
                {action.text}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span>{action.current}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-slate-300">{action.target}</span>
                {action.estimatedImpact > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    +{action.estimatedImpact} pts est.
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function StatusCard({ title, score, riskLevel, details, variant }) {
  const accent =
    variant === "target"
      ? "from-emerald-500/20 to-teal-500/10 border-emerald-500/20"
      : "from-blue-500/20 to-indigo-500/10 border-blue-500/20";

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${accent}`}>
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
        {riskLevel}
      </span>
      <div className="mt-3 space-y-1">
        {details.map((d) => (
          <div key={d.label} className="flex justify-between text-xs">
            <span className="text-slate-500">{d.label}</span>
            <span className="text-slate-300">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PerformanceRoadmap);
