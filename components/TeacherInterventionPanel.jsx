"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  User,
  Stethoscope,
} from "lucide-react";
import { getRiskStyle } from "@/components/predictions/predictionUtils";

function TeacherInterventionPanel({ interventions }) {
  if (!interventions) return null;

  const sections = [
    {
      key: "highRisk",
      title: "High-Risk Students",
      icon: ShieldAlert,
      color: "text-rose-400",
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
      students: interventions.highRisk || [],
    },
    {
      key: "mediumRisk",
      title: "Medium-Risk Students",
      icon: AlertTriangle,
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      students: interventions.mediumRisk || [],
    },
    {
      key: "improving",
      title: "Improving Students",
      icon: TrendingUp,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      students: interventions.improving || [],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <Stethoscope className="w-5 h-5 text-rose-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Teacher Intervention Dashboard</h3>
          <p className="text-sm text-slate-400">
            Actionable insights for at-risk and improving students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`rounded-xl border ${section.border} ${section.bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-4">
              <section.icon className={`w-4 h-4 ${section.color}`} />
              <h4 className="text-sm font-semibold text-white">{section.title}</h4>
              <span className="ml-auto text-xs text-slate-500">
                {section.students.length}
              </span>
            </div>

            {section.students.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No students in this category</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {section.students.map((student) => (
                  <InterventionCard key={student.studentId} student={student} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function InterventionCard({ student }) {
  const style = getRiskStyle(student.riskLevel);

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-start gap-2 mb-2">
        <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {student.studentName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.badge}`}>
              {student.riskLevel}
            </span>
            <span className="text-xs text-slate-500">Score: {student.predictionScore}</span>
          </div>
        </div>
      </div>

      {student.reasons?.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Reason</p>
          <ul className="space-y-0.5">
            {student.reasons.slice(0, 2).map((reason, i) => (
              <li key={i} className="text-xs text-slate-300">• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          Recommended Action
        </p>
        <p className="text-xs font-medium text-indigo-300">
          {student.suggestedIntervention}
        </p>
      </div>
    </div>
  );
}

export default memo(TeacherInterventionPanel);
