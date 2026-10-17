"use client";

import { DashboardData } from "@/types/dashboard";
import { useState, useEffect, useCallback } from "react";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid calling setState synchronously within an effect — defer the call
    const id = setTimeout(() => {
      void fetchDashboard();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchDashboard]);

  const updateProfile = useCallback(async (nickname: string, phone: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, phone }),
      });
      if (!res.ok) return false;
      const updated = await res.json();
      setData((prev) => (prev ? { ...prev, user: updated } : prev));
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { data, loading, saving, updateProfile, refetch: fetchDashboard };
}
