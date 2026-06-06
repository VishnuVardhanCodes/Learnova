"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useMeetingActions } from "@/hooks/useMeetings";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TeacherAvailability() {
  const { loadAvailability, saveSchedule, busy } = useMeetingActions();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadAvailability();
      setSchedule(data.schedule?.length ? data.schedule : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadAvailability]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const addDay = (day) => {
    if (schedule.find((d) => d.day === day)) {
      toast.error(`${day} already added`);
      return;
    }
    setSchedule([
      ...schedule,
      { day, slots: [{ startTime: "09:00", endTime: "12:00" }] },
    ]);
  };

  const removeDay = (day) => {
    setSchedule(schedule.filter((d) => d.day !== day));
  };

  const addSlot = (day) => {
    setSchedule(
      schedule.map((d) =>
        d.day === day
          ? { ...d, slots: [...d.slots, { startTime: "14:00", endTime: "17:00" }] }
          : d
      )
    );
  };

  const updateSlot = (day, index, field, value) => {
    setSchedule(
      schedule.map((d) =>
        d.day === day
          ? {
              ...d,
              slots: d.slots.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
              ),
            }
          : d
      )
    );
  };

  const removeSlot = (day, index) => {
    setSchedule(
      schedule.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
          : d
      )
    );
  };

  const handleSave = async () => {
    try {
      await saveSchedule(schedule);
      toast.success("Availability saved");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-48 animate-pulse bg-white/5 rounded-2xl border border-white/10" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Teacher Availability</h3>
            <p className="text-xs text-slate-400">Manage your weekly meeting schedule</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchSchedule}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Schedule
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => addDay(day)}
            disabled={schedule.some((d) => d.day === day)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            {day}
          </button>
        ))}
      </div>

      {schedule.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          Add days above to set your availability
        </p>
      ) : (
        <div className="space-y-4">
          {schedule.map((dayEntry) => (
            <div
              key={dayEntry.day}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{dayEntry.day}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addSlot(dayEntry.day)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    + Add slot
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDay(dayEntry.day)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {dayEntry.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(dayEntry.day, idx, "startTime", e.target.value)
                      }
                      className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(dayEntry.day, idx, "endTime", e.target.value)
                      }
                      className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(dayEntry.day, idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
