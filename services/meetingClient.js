import { apiFetch } from "@/lib/apiClient";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMeetings(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/meetings${query ? `?${query}` : ""}`, {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load meetings");
  }
  return json.data;
}

export async function fetchMeetingHistory(token) {
  const res = await apiFetch("/api/meetings/history", {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load meeting history");
  }
  return json.data;
}

export async function fetchTeachers(token, instituteId) {
  const res = await apiFetch(
    `/api/meetings/teachers?instituteId=${encodeURIComponent(instituteId)}`,
    { headers: authHeaders(token) }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load teachers");
  }
  return json.data;
}

export async function fetchAvailableSlots(token, teacherId, meetingDate) {
  const params = new URLSearchParams({ teacherId, meetingDate });
  const res = await apiFetch(`/api/meetings/availability?${params}`, {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load available slots");
  }
  return json.data;
}

export async function fetchTeacherAvailability(token) {
  const res = await apiFetch("/api/meetings/availability", {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load availability");
  }
  return json.data;
}

export async function saveAvailability(token, schedule) {
  const res = await apiFetch("/api/meetings/availability", {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ schedule }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to save availability");
  }
  return json.data;
}

export async function bookMeeting(token, payload) {
  const res = await apiFetch("/api/meetings/book", {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to book meeting");
  }
  return json.data;
}

export async function approveMeeting(token, meetingId, teacherNotes = "") {
  const res = await apiFetch("/api/meetings/approve", {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ meetingId, teacherNotes }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to approve meeting");
  }
  return json.data;
}

export async function rejectMeeting(token, meetingId, teacherNotes = "") {
  const res = await apiFetch("/api/meetings/reject", {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ meetingId, teacherNotes }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to reject meeting");
  }
  return json.data;
}

export async function cancelMeeting(token, meetingId) {
  const res = await apiFetch("/api/meetings/cancel", {
    method: "DELETE",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ meetingId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to cancel meeting");
  }
  return json.data;
}

export async function fetchInstituteMeetingStats(token) {
  const res = await apiFetch("/api/meetings?scope=institute", {
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load meeting analytics");
  }
  return json.data;
}
