"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, GraduationCap } from "lucide-react";
import { getTrendLabel } from "./predictionUtils";

const ForecastChart = dynamic(
  () =>
    import("./PredictionCharts").then((m) => ({ default: m.ForecastChart })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-white/5 rounded-xl" /> }
);

function PerformanceForecast({ forecast }) {
  if (!forecast) return null;

  const items = [
    {
      label: "Current Score",
      value: forecast.current,
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "30-Day Forecast",
      value: forecast.thirtyDay,
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Semester Forecast",
      value: forecast.semesterEnd,
      icon: GraduationCap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const delta = forecast.semesterEnd - forecast.current;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Performance Forecast</h4>
        <span className="text-xs text-slate-400">
          Trend: {getTrendLabel(forecast.trend)} · {forecast.confidence} confidence
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`p-4 rounded-xl border ${item.bg} text-center`}
          >
            <item.icon className={`w-4 h-4 ${item.color} mx-auto mb-2`} />
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <ForecastChart forecast={forecast} />
        <p className="text-xs text-slate-400 text-center mt-2">
          {delta >= 0
            ? `Projected improvement of +${delta} points by semester end`
            : `Projected decline of ${delta} points — intervention recommended`}
        </p>
      </div>

      {forecast.drivers?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {forecast.drivers.map((d) => (
            <span
              key={d.factor}
              className={`text-[10px] px-2 py-1 rounded-full border ${
                d.impact === "positive"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : d.impact === "negative"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              {d.factor}: {getTrendLabel(d.trend)}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default memo(PerformanceForecast);
