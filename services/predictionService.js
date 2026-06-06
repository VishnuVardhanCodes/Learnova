import { apiFetch } from "@/lib/apiClient";

export async function fetchStudentPrediction(studentId, token, options = {}) {
  const refresh = options.refresh ? "?refresh=true" : "";
  const res = await apiFetch(`/api/predictions/student/${studentId}${refresh}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load prediction");
  }
  return json.data;
}

export async function fetchInstitutePredictions(token, filters = {}) {
  const params = new URLSearchParams();
  if (filters.riskLevel) params.set("riskLevel", filters.riskLevel);
  if (filters.className) params.set("class", filters.className);
  if (filters.department) params.set("department", filters.department);
  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await apiFetch(`/api/predictions/institute${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load institute predictions");
  }
  return json.data;
}

export async function generatePredictions(token) {
  const res = await apiFetch("/api/predictions/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to generate predictions");
  }
  return json.data;
}
