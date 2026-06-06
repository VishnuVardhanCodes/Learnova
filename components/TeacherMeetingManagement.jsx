"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useMeetings, useMeetingActions } from "@/hooks/useMeetings";
import TeacherAvailability from "./TeacherAvailability";
import MeetingRequestsPanel from "./MeetingRequestsPanel";
import MeetingHistory from "./MeetingHistory";
import MeetingStats from "./MeetingStats";

export default function TeacherMeetingManagement() {
  const { history, stats, loading, refresh } = useMeetings();
  const { cancel, busy } = useMeetingActions();

  const handleCancel = async (meetingId) => {
    if (!confirm("Cancel this meeting?")) return;
    try {
      await cancel(meetingId);
      toast.success("Meeting cancelled");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground dark:text-white">
              Meeting Management
            </h2>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Manage availability, approve requests, and track meetings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      <MeetingStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeetingRequestsPanel />
        <TeacherAvailability />
      </div>

      <MeetingHistory
        history={history}
        role="teacher"
        onCancel={handleCancel}
        busy={busy}
      />
    </div>
  );
}
