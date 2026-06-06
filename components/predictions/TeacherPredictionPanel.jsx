"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  RefreshCw,
  Users,
  AlertTriangle,
  Trophy,
  Filter,
} from "lucide-react";
import { useInstitutePredictions } from "@/hooks/usePerformancePrediction";
import { getRiskStyle } from "./predictionUtils";
import {
  RiskDistributionChart,
  AttendanceVsPerformanceChart,
} from "./PredictionCharts";
import TeacherInterventionPanel from "@/components/TeacherInterventionPanel";

export default function TeacherPredictionPanel() {
  const [riskFilter, setRiskFilter] = useState("all");
  const { data, loading, error, generating, refresh, generate } =
    useInstitutePredictions({
      riskLevel: riskFilter === "all" ? null : riskFilter,
    });

  const students =
    riskFilter === "all"
      ? data?.students || []
      : (data?.students || []).filter((s) => s.riskLevel === riskFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">
              Performance Prediction Panel
            </h3>
          </div>
          <p className="text-sm text-slate-400">
            AI-powered student performance insights &amp; at-risk identification
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white"
          >
            {generating ? "Generating…" : "Generate All"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-slate-400" />
        {["all", "Excellent", "Good", "Average", "At Risk"].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setRiskFilter(level)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
              riskFilter === level
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            {level === "all" ? "All" : level}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="h-48 animate-pulse bg-white/5 rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Total Students"
              value={data?.totalStudents || 0}
              color="text-blue-400"
            />
            <StatCard
              icon={Trophy}
              label="Avg Score"
              value={`${data?.averagePredictionScore || 0}%`}
              color="text-emerald-400"
            />
            <StatCard
              icon={AlertTriangle}
              label="At Risk"
              value={data?.atRiskStudents?.length || 0}
              color="text-rose-400"
            />
            <StatCard
              icon={Brain}
              label="Top Performers"
              value={data?.topPerformers?.length || 0}
              color="text-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">
                Risk Distribution
              </h4>
              <RiskDistributionChart riskDistribution={data?.riskDistribution} />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">
                Attendance Impact (Institute Avg)
              </h4>
              {data?.students?.[0] ? (
                <AttendanceVsPerformanceChart
                  attendanceScore={data.averagePredictionScore}
                  gradeScore={data.averagePredictionScore}
                  activityScore={data.averagePredictionScore}
                />
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">
                  Generate predictions to view trends
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentList
              title="Top Performers"
              students={data?.topPerformers || []}
              empty="No top performers yet"
            />
            <StudentList
              title="At-Risk Students"
              students={data?.atRiskStudents || []}
              empty="No at-risk students"
              highlightRisk
            />
          </div>

          {students.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">
                All Students ({students.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <StudentRow key={student.studentId} student={student} />
                ))}
              </div>
            </div>
          )}

          {data?.interventions && (
            <div className="mt-6">
              <TeacherInterventionPanel interventions={data.interventions} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold text-white`}>{value}</p>
    </div>
  );
}

function StudentList({ title, students, empty, highlightRisk }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      {students.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <StudentRow key={s.studentId} student={s} highlightRisk={highlightRisk} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentRow({ student, highlightRisk }) {
  const style = getRiskStyle(student.riskLevel);
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        highlightRisk && student.riskLevel === "At Risk"
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-white">
          {student.studentName || student.studentId}
        </p>
        <p className="text-xs text-slate-500">
          Attendance {student.attendanceScore}% · Grades {student.gradeScore}%
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white">{student.predictionScore}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.badge}`}>
          {student.riskLevel}
        </span>
      </div>
    </div>
  );
}
