"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BarChart3, Info } from "lucide-react";

const ContributionPieChart = dynamic(
  () =>
    import("./PredictionCharts").then((m) => ({
      default: m.ContributionPieChart,
    })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-white/5 rounded-xl" /> }
);

function ExplainableInsights({ explainable }) {
  if (!explainable) return null;

  const { predictionScore, attendance, grades, activities, breakdown } =
    explainable;

  const cards = [
    { ...attendance, color: "text-blue-400", bar: "from-blue-500 to-cyan-400" },
    { ...grades, color: "text-purple-400", bar: "from-purple-500 to-violet-400" },
    {
      ...activities,
      color: "text-emerald-400",
      bar: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        <h4 className="text-sm font-semibold text-white">Explainable AI Breakdown</h4>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Info className="w-4 h-4 text-indigo-300 shrink-0" />
        <p className="text-xs text-slate-300">
          Prediction Score: <strong className="text-white">{predictionScore}</strong>
          {" — weighted from attendance (40%), grades (40%), and activities (20%)."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              {card.label}
            </p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {card.contribution}
              <span className="text-xs text-slate-500 font-normal ml-1">pts</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Raw: {card.rawScore}% · Weight: {Math.round(card.weight * 100)}%
            </p>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${card.bar} rounded-full transition-all duration-700`}
                style={{ width: `${card.impactPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {card.impactPercent}% of total contribution
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-3">Contribution Distribution</p>
          <ContributionPieChart data={breakdown} />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-xs text-slate-400">Impact Summary</p>
          {breakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">{item.name} Impact</span>
              </div>
              <span className="text-sm font-bold text-white">
                {item.contribution} pts ({item.weight})
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ExplainableInsights);
