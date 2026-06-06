"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Brain, RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useStudentPrediction } from "@/hooks/usePerformancePrediction";
import { getRiskStyle, getTrendLabel } from "./predictionUtils";
import {
  AttendanceVsPerformanceChart,
  GradeTrendChart,
  PredictionScoreIndicator,
} from "./PredictionCharts";
import ExplainableInsights from "./ExplainableInsights";
import PerformanceForecast from "./PerformanceForecast";

const PerformanceRoadmap = dynamic(() => import("@/components/PerformanceRoadmap"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-white/5 rounded-2xl" />,
});

const TrendIcon = ({ trend }) => {
  if (trend === "improving") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (trend === "declining") return <TrendingDown className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
};

export default function StudentPerformanceCard({ studentId }) {
  const { data, loading, error, refresh } = useStudentPrediction(studentId);

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 animate-pulse h-64" />
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const style = getRiskStyle(data.riskLevel);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl ${style.glow}`}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">AI Performance Prediction</h3>
            </div>
            <p className="text-xs text-slate-400">
              Explainable insights, forecasting &amp; personalized roadmap
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
            aria-label="Refresh prediction"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center">
            <PredictionScoreIndicator
              score={data.predictionScore}
              riskLevel={data.riskLevel}
            />
            <span
              className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}
            >
              {data.riskLevel}
            </span>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <TrendIcon trend={data.performanceTrend} />
              {getTrendLabel(data.performanceTrend)}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Attendance", value: data.attendanceScore, color: "text-blue-400" },
                { label: "Grades", value: data.gradeScore, color: "text-purple-400" },
                { label: "Activities", value: data.activityScore, color: "text-emerald-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {item.label}
                  </p>
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}%</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${style.bar} rounded-full`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <AttendanceVsPerformanceChart
              attendanceScore={data.attendanceScore}
              gradeScore={data.gradeScore}
              activityScore={data.activityScore}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <ExplainableInsights explainable={data.explainable} />
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <PerformanceForecast forecast={data.forecast} />
        </div>

        <GradeTrendChart subjects={data.gradeAnalysis?.subjects} />
      </motion.div>

      <PerformanceRoadmap roadmap={data.roadmap} />
    </div>
  );
}
