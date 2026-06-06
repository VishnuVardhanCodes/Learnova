"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { History, Calendar, CheckCircle, Ban } from "lucide-react";
import MeetingCard from "./MeetingCard";

const TABS = [
  { id: "upcoming", label: "Upcoming", icon: Calendar },
  { id: "pending", label: "Pending", icon: History },
  { id: "completed", label: "Completed", icon: CheckCircle },
  { id: "cancelled", label: "Cancelled", icon: Ban },
];

export default function MeetingHistory({ history, role, onCancel, busy }) {
  const [activeTab, setActiveTab] = useState("upcoming");

  if (!history) {
    return (
      <div className="h-32 animate-pulse bg-white/5 rounded-2xl border border-white/10" />
    );
  }

  const meetings = history[activeTab] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Meeting History</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              activeTab === tab.id
                ? "bg-cyan-600 border-cyan-500 text-white"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className="opacity-70">({history[tab.id]?.length || 0})</span>
          </button>
        ))}
      </div>

      {meetings.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No {activeTab} meetings
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              role={role}
              onCancel={onCancel}
              busy={busy}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
