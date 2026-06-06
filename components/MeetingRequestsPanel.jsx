"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import MeetingCard from "./MeetingCard";
import { useMeetings, useMeetingActions } from "@/hooks/useMeetings";

export default function MeetingRequestsPanel() {
  const { history, refresh } = useMeetings();
  const { approve, reject, busy } = useMeetingActions();
  const [notes, setNotes] = useState({});

  const pending = history?.pending || [];

  const handleApprove = async (meetingId) => {
    try {
      await approve(meetingId, notes[meetingId] || "");
      toast.success("Meeting approved");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (meetingId) => {
    try {
      await reject(meetingId, notes[meetingId] || "");
      toast.success("Meeting rejected");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Inbox className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-lg font-bold text-white">Meeting Requests</h3>
          <p className="text-xs text-slate-400">
            {pending.length} pending approval{pending.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No pending meeting requests
        </p>
      ) : (
        <div className="space-y-4">
          {pending.map((meeting) => (
            <div key={meeting._id} className="space-y-2">
              <MeetingCard
                meeting={meeting}
                role="teacher"
                onApprove={handleApprove}
                onReject={handleReject}
                busy={busy}
              />
              <div className="flex items-center gap-2 px-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Add a note (optional)…"
                  value={notes[meeting._id] || ""}
                  onChange={(e) =>
                    setNotes({ ...notes, [meeting._id]: e.target.value })
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
