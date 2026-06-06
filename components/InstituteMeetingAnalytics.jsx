"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Building2, RefreshCw, Trophy } from "lucide-react";
import { useMeetings } from "@/hooks/useMeetings";

const PIE_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#f43f5e", "#64748b"];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function InstituteMeetingAnalytics() {
  const { stats: instituteStats, loading, refresh } = useMeetings({
    scope: "institute",
  });

  const stats = instituteStats || {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    topTeachers: [],
  };

  const pieData = [
    { name: "Pending", value: stats.pending || 0 },
    { name: "Approved", value: stats.approved || 0 },
    { name: "Completed", value: stats.completed || 0 },
    { name: "Cancelled", value: stats.cancelled || 0 },
    { name: "Rejected", value: stats.rejected || 0 },
  ].filter((d) => d.value > 0);

  const barData = (stats.topTeachers || []).map((t) => ({
    name: t.teacherName?.split(" ")[0] || "Teacher",
    meetings: t.meetingCount,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Meeting Analytics</h3>
            <p className="text-sm text-slate-400">
              Institute-wide parent-teacher meeting insights
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Meetings", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Completed", value: stats.completed },
          { label: "Approved", value: stats.approved },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-white">{item.value || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Status Distribution</h4>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No meeting data yet</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Most Active Teachers</h4>
          </div>
          {barData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No teacher data yet</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="meetings" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
