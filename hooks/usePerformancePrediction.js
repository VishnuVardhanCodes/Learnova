"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchStudentPrediction,
  fetchInstitutePredictions,
  generatePredictions,
} from "@/services/predictionService";

export function useStudentPrediction(studentId, options = {}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user || !studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const result = await fetchStudentPrediction(studentId, token, options);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, studentId, options.refresh]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export function useInstitutePredictions(filters = {}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const result = await fetchInstitutePredictions(token, filters);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filters.riskLevel, filters.className, filters.department]);

  const generate = useCallback(async () => {
    if (!user) return;
    setGenerating(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      await generatePredictions(token);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [user, load]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, generating, refresh: load, generate };
}
