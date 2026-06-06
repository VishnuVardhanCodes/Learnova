"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMeetingActions } from "@/hooks/useMeetings";

export default function BookMeetingModal({
  isOpen,
  onClose,
  instituteId,
  studentId,
  studentName,
  onSuccess,
}) {
  const { loadTeachers, loadSlots, book, busy } = useMeetingActions();
  const [teachers, setTeachers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    teacherId: "",
    teacherName: "",
    meetingDate: "",
    startTime: "",
    endTime: "",
    meetingTitle: "",
    meetingReason: "",
  });

  useEffect(() => {
    if (!isOpen || !instituteId) return;
    setLoadingTeachers(true);
    loadTeachers(instituteId)
      .then(setTeachers)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingTeachers(false));
  }, [isOpen, instituteId, loadTeachers]);

  useEffect(() => {
    if (!form.teacherId || !form.meetingDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    loadSlots(form.teacherId, form.meetingDate)
      .then((data) => setSlots(data.slots || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingSlots(false));
  }, [form.teacherId, form.meetingDate, loadSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teacherId || !form.meetingDate || !form.startTime) {
      toast.error("Please complete all required fields");
      return;
    }

    const minDate = new Date().toISOString().slice(0, 10);
    if (form.meetingDate < minDate) {
      toast.error("Cannot book meetings in the past");
      return;
    }

    try {
      await book({
        ...form,
        instituteId,
        studentId,
        studentName,
        meetingTitle: form.meetingTitle || "Parent-Teacher Meeting",
      });
      toast.success("Meeting request submitted!");
      onSuccess?.();
      onClose();
      setForm({
        teacherId: "",
        teacherName: "",
        meetingDate: "",
        startTime: "",
        endTime: "",
        meetingTitle: "",
        meetingReason: "",
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Book a Meeting</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Select Teacher
              </label>
              <select
                value={form.teacherId}
                onChange={(e) => {
                  const teacher = teachers.find((t) => t.id === e.target.value);
                  setForm({
                    ...form,
                    teacherId: e.target.value,
                    teacherName: teacher?.fullName || "",
                    startTime: "",
                    endTime: "",
                  });
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                required
              >
                <option value="">
                  {loadingTeachers ? "Loading teachers…" : "Choose a teacher"}
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.meetingDate}
                onChange={(e) =>
                  setForm({ ...form, meetingDate: e.target.value, startTime: "", endTime: "" })
                }
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Available Time Slot
              </label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading slots…
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {form.teacherId && form.meetingDate
                    ? "No available slots for this date"
                    : "Select teacher and date first"}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                        })
                      }
                      className={`px-3 py-2 rounded-lg text-xs border transition ${
                        form.startTime === slot.startTime
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {slot.startTime} – {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1">Meeting Title</label>
              <input
                type="text"
                value={form.meetingTitle}
                onChange={(e) => setForm({ ...form, meetingTitle: e.target.value })}
                placeholder="Parent-Teacher Meeting"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1">Purpose</label>
              <textarea
                value={form.meetingReason}
                onChange={(e) => setForm({ ...form, meetingReason: e.target.value })}
                placeholder="Discuss academic progress, attendance concerns…"
                rows={3}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy || !form.startTime}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Booking Request
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
