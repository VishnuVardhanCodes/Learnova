"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e"];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  fontSize: "12px",
};

export function AttendanceVsPerformanceChart({ attendanceScore, gradeScore, activityScore }) {
  const data = [
    { metric: "Attendance", score: attendanceScore || 0, fill: "#3b82f6" },
    { metric: "Grades", score: gradeScore || 0, fill: "#8b5cf6" },
    { metric: "Activities", score: activityScore || 0, fill: "#10b981" },
  ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GradeTrendChart({ subjects = [] }) {
  const data =
    subjects.length > 0
      ? subjects
      : [
          { subject: "Math", average: 0 },
          { subject: "Science", average: 0 },
        ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#8b5cf6"
            fill="url(#gradeGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskDistributionChart({ riskDistribution = {} }) {
  const data = Object.entries(riskDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  if (!data.some((d) => d.value > 0)) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-slate-400">
        No distribution data yet
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContributionPieChart({ data = [] }) {
  if (!data.length || !data.some((d) => d.contribution > 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-400">
        No contribution data
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="contribution"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastChart({ forecast }) {
  const data = [
    { period: "Current", score: forecast.current, fill: "#3b82f6" },
    { period: "30-Day", score: forecast.thirtyDay, fill: "#8b5cf6" },
    { period: "Semester", score: forecast.semesterEnd, fill: "#10b981" },
  ];

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentBarChart({ departments = [] }) {
  if (!departments.length) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-slate-400">
        No department data yet
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={departments}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
          <YAxis
            type="category"
            dataKey="department"
            stroke="#94a3b8"
            fontSize={10}
            width={80}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="averageScore" fill="#06b6d4" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PredictionScoreIndicator({ score = 0, riskLevel = "Average" }) {
  const color =
    score >= 85
      ? "#10b981"
      : score >= 70
        ? "#3b82f6"
        : score >= 50
          ? "#f59e0b"
          : "#f43f5e";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 327} 327`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-300">{riskLevel}</span>
    </div>
  );
}
