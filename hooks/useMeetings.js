"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchMeetings,
  fetchMeetingHistory,
  fetchTeachers,
  fetchAvailableSlots,
  fetchTeacherAvailability,
  saveAvailability,
  bookMeeting,
  approveMeeting,
  rejectMeeting,
  cancelMeeting,
  fetchInstituteMeetingStats,
} from "@/services/meetingClient";

export function useMeetings(options = {}) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [history, setHistory] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      if (options.scope === "institute") {
        const data = await fetchInstituteMeetingStats(token);
        setStats(data.stats);
        setMeetings(data.meetings || []);
      } else {
        const [meetingsData, historyData] = await Promise.all([
          fetchMeetings(token, options.params || {}),
          fetchMeetingHistory(token),
        ]);
        setMeetings(meetingsData);
        setHistory(historyData);
        setStats(historyData.stats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, options.scope]);

  useEffect(() => {
    load();
  }, [load]);

  return { meetings, history, stats, loading, error, refresh: load };
}

export function useMeetingActions() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const withToken = async (fn) => {
    if (!user) throw new Error("Not authenticated");
    setBusy(true);
    try {
      const token = await user.getIdToken();
      return await fn(token);
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    book: (payload) => withToken((token) => bookMeeting(token, payload)),
    approve: (id, notes) =>
      withToken((token) => approveMeeting(token, id, notes)),
    reject: (id, notes) =>
      withToken((token) => rejectMeeting(token, id, notes)),
    cancel: (id) => withToken((token) => cancelMeeting(token, id)),
    saveSchedule: (schedule) =>
      withToken((token) => saveAvailability(token, schedule)),
    loadTeachers: (instituteId) =>
      withToken((token) => fetchTeachers(token, instituteId)),
    loadSlots: (teacherId, date) =>
      withToken((token) => fetchAvailableSlots(token, teacherId, date)),
    loadAvailability: () =>
      withToken((token) => fetchTeacherAvailability(token)),
  };
}
