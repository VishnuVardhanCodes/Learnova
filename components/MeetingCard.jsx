"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: AlertCircle,
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
};

function MeetingCard({ meeting, role, onApprove, onReject, onCancel, busy }) {
  const config = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const canApprove = role === "teacher" && meeting.status === "pending";
  const canCancel = ["pending", "approved"].includes(meeting.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-bold text-white">{meeting.meetingTitle}</h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {meeting.meetingReason || "No description provided"}
          </p>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border shrink-0 ${config.badge}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          {meeting.meetingDate}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          {meeting.startTime} – {meeting.endTime}
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          {role === "parent"
            ? `Teacher: ${meeting.teacherName}`
            : `Parent: ${meeting.parentName}`}
        </div>
      </div>

      {meeting.teacherNotes && (
        <p className="text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-2 mb-3">
          Note: {meeting.teacherNotes}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onApprove?.(meeting._id)}
              className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject?.(meeting._id)}
              className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-semibold text-white disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel?.(meeting._id)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default memo(MeetingCard);
