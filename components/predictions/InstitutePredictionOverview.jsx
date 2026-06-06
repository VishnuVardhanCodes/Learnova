"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Building2,
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useInstitutePredictions } from "@/hooks/usePerformancePrediction";
import {
  RiskDistributionChart,
  PredictionScoreIndicator,
} from "./PredictionCharts";
import { getRiskStyle } from "./predictionUtils";

const DepartmentBarChart = dynamic(
  () =>
    import("./PredictionCharts").then((m) => ({
      default: m.DepartmentBarChart,
    })),
  { ssr: false, loading: () => <div className="h-56 animate-pulse bg-white/5 rounded-xl" /> }
);

export default function InstitutePredictionOverview() {
  const { data, loading, error, generate, generating } = useInstitutePredictions();

  if (loading && !data) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 animate-pulse h-64" />
    );
  }

  const departments =
    data?.departmentAnalytics?.departments ||
    data?.topPerformingDepartments ||
    [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Institution Performance Analytics
            </h3>
          </div>
          <p className="text-sm text-slate-400">
            Average scores, risk distribution &amp; department insights
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white"
        >
          {generating ? "Updating…" : "Refresh Analytics"}
        </button>
      </div>

      {error && <p className="text-sm text-rose-300 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-6">
          <PredictionScoreIndicator
            score={data?.averagePredictionScore || 0}
            riskLevel="Institute Avg"
          />
          <p className="text-xs text-slate-400 mt-2">Average Prediction Score</p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniStat icon={Users} label="Total Students" value={data?.totalStudents || 0} />
          <MiniStat
            icon={BarChart3}
            label="Excellent"
            value={data?.riskDistribution?.Excellent || 0}
          />
          <MiniStat
            icon={AlertTriangle}
            label="At Risk"
            value={data?.riskDistribution?.["At Risk"] || 0}
            alert
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Risk Distribution
          </h4>
          <RiskDistributionChart riskDistribution={data?.riskDistribution} />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Top Performing Departments
          </h4>
          <DepartmentBarChart departments={departments} />
        </div>
      </div>

      {data?.topPerformingDepartments?.length > 0 && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Department Rankings</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.topPerformingDepartments.map((dept, i) => (
              <div
                key={dept.department}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-xs text-slate-500">#{i + 1} {dept.department}</p>
                <p className="text-xl font-bold text-white">{dept.averageScore}%</p>
                <p className="text-[10px] text-slate-500">
                  {dept.studentCount} students · {dept.atRiskCount} at risk
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.studentsRequiringAttention?.length > 0 && (
        <div className="mt-6 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-white">
              Students Requiring Attention
            </h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.studentsRequiringAttention.map((student) => {
              const style = getRiskStyle(student.riskLevel);
              return (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {student.studentName || student.studentId}
                    </p>
                    <p className="text-xs text-slate-500">
                      Score: {student.predictionScore} · Trend: {student.performanceTrend}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.badge}`}>
                    {student.riskLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MiniStat({ icon: Icon, label, value, alert }) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        alert
          ? "bg-rose-500/5 border-rose-500/20"
          : "bg-white/5 border-white/10"
      }`}
    >
      <Icon
        className={`w-4 h-4 mb-2 ${alert ? "text-rose-400" : "text-slate-400"}`}
      />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
