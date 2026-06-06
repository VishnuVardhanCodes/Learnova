"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

function MeetingStats({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Meetings", value: stats.total || 0, icon: BarChart3, color: "text-blue-400" },
    { label: "Upcoming", value: stats.upcoming || 0, icon: Calendar, color: "text-purple-400" },
    { label: "Pending", value: stats.pending || 0, icon: Clock, color: "text-amber-400" },
    { label: "Completed", value: stats.completed || 0, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Cancelled", value: stats.cancelled || 0, icon: AlertCircle, color: "text-rose-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
        >
          <card.icon className={`w-4 h-4 ${card.color} mx-auto mb-2`} />
          <p className="text-xl font-bold text-white">{card.value}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
            {card.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(MeetingStats);
