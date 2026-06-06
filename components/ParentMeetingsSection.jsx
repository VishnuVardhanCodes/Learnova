"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useMeetings, useMeetingActions } from "@/hooks/useMeetings";
import MeetingStats from "./MeetingStats";
import MeetingHistory from "./MeetingHistory";
import BookMeetingModal from "./BookMeetingModal";

export default function ParentMeetingsSection({ instituteId, studentId, studentName }) {
  const { history, stats, loading, refresh } = useMeetings();
  const { cancel, busy } = useMeetingActions();
  const [showBookModal, setShowBookModal] = useState(false);

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

  if (loading && !history) {
    return (
      <div className="h-64 animate-pulse bg-white/5 rounded-2xl border border-white/10" />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Parent-Teacher Meetings</h3>
              <p className="text-xs text-slate-400">
                Book appointments and track meeting status
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowBookModal(true)}
              disabled={!instituteId}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Book New Meeting
            </button>
          </div>
        </div>

        <MeetingStats stats={stats} />

        {history?.upcoming?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-3">Upcoming Meetings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.upcoming.slice(0, 4).map((m) => (
                <div
                  key={m._id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                >
                  <p className="font-medium text-white">{m.meetingTitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {m.meetingDate} · {m.startTime} with {m.teacherName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <MeetingHistory
        history={history}
        role="parent"
        onCancel={handleCancel}
        busy={busy}
      />

      <BookMeetingModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        instituteId={instituteId}
        studentId={studentId}
        studentName={studentName}
        onSuccess={refresh}
      />
    </div>
  );
}
