"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Heart, BookOpen, Calendar, Lightbulb, MessageCircleHeart } from "lucide-react";
import { useStudentPrediction } from "@/hooks/usePerformancePrediction";
import { getRiskStyle } from "./predictionUtils";
import { PredictionScoreIndicator } from "./PredictionCharts";
import PerformanceForecast from "./PerformanceForecast";

const PerformanceRoadmap = dynamic(() => import("@/components/PerformanceRoadmap"), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-white/5 rounded-2xl" />,
});

export default function ParentPredictionView({ studentId, childName }) {
  const { data, loading, error } = useStudentPrediction(studentId);

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 animate-pulse h-48" />
    );
  }

  if (error || !data) {
    return null;
  }

  const style = getRiskStyle(data.riskLevel);
  const guidance = data.parentGuidance;
  const friendlyRisk =
    data.riskLevel === "At Risk"
      ? "Needs Support"
      : data.riskLevel === "Average"
        ? "On Track"
        : data.riskLevel;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-bold text-white">
            {childName ? `${childName}'s` : "Child's"} Learning Outlook
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <PredictionScoreIndicator
              score={data.predictionScore}
              riskLevel={friendlyRisk}
            />
            <span
              className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}
            >
              {friendlyRisk}
            </span>
          </div>

          <div className="md:col-span-2 space-y-3">
            <InsightRow
              icon={Calendar}
              label="Attendance"
              value={`${data.attendanceAnalysis?.rate ?? data.attendanceScore}%`}
              hint={
                data.attendanceScore < 75
                  ? "Attendance could improve — regular presence helps learning."
                  : "Good attendance supports steady progress."
              }
            />
            <InsightRow
              icon={BookOpen}
              label="Grades"
              value={`${data.gradeAnalysis?.average ?? data.gradeScore}% average`}
              hint={
                data.gradeScore < 70
                  ? "Extra study support may help boost grades."
                  : "Academic performance looks healthy."
              }
            />
            <InsightRow
              icon={Lightbulb}
              label="Activities"
              value={`${data.activityAnalysis?.participationCount ?? 0} activities`}
              hint={
                data.activityScore < 50
                  ? "Try encouraging more participation in school activities."
                  : "Active participation supports well-rounded growth."
              }
            />
          </div>
        </div>

        {guidance && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircleHeart className="w-4 h-4 text-pink-400" />
              <h4 className="text-sm font-semibold text-white">Parent Guidance</h4>
            </div>
            <p className="text-sm text-slate-300 mb-2">{guidance.headline}</p>
            <p className="text-xs text-slate-400 mb-4">{guidance.tone}</p>
            <ul className="space-y-2">
              {guidance.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex gap-2"
                >
                  <span className="text-pink-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10">
          <PerformanceForecast forecast={data.forecast} />
        </div>
      </motion.div>

      <PerformanceRoadmap roadmap={data.roadmap} />
    </div>
  );
}

function InsightRow({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
