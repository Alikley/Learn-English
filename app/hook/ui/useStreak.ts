"use client";

import { useState, useEffect, useCallback } from "react";

export type StreakData = { current: number; longest: number };

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  // اولین بار + وقتی تب فعال میشه (کاربر از درس برگشت)
  useEffect(() => {
    // avoid calling setState synchronously within effect body
    const t = setTimeout(() => fetchStreak(), 0);

    const onFocus = () => void fetchStreak();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchStreak]);

  return { streak, loading, refetch: fetchStreak };
}
