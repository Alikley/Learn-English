"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameStats, StreakInfo } from "@/types/game";

// ========================================
// هوک آمار و استریک بازی حافظه کلمات
// - GET  آمار بازی + استریک یادگیری
// - POST نتیجه هر جفت درست (آپدیت استریک)
// - POST پایان دور (ثبت بهترین امتیاز + اشتباهات)
// فقط در صفحه بازی‌ها استفاده می‌شود (گام ۶)
// ========================================

export function useMemoryStats() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // ---- بارگذاری آمار ----
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/game/memory/result");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats);
      setStreak(data.streak);
    } catch {
      /* آمار نمایش داده نمی‌شود — بی‌خیال */
    }
  }, []);

  useEffect(() => {
    // Avoid calling setState synchronously within an effect — defer the call
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  // ---- ثبت یک جفت درست + آپدیت استریک (گام ۷) ----
  const submitMatchResult = useCallback(async () => {
    try {
      const res = await fetch("/api/game/memory/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "match" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
      }
    } catch {
      /* بی‌خیال — بازی ادامه دارد */
    }
  }, []);

  // ---- پایان دور: ثبت بهترین امتیاز + اشتباهات ----
  const submitSession = useCallback(async (score: number, mistakes: number) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/memory/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "session", score, mistakes }),
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setIsNewRecord(Boolean(data.isNewRecord));
      }
    } catch {
      /* خطا در ثبت — نمایش داده نمی‌شود */
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    stats,
    streak,
    submitting,
    isNewRecord,
    submitMatchResult,
    submitSession,
    reload: load,
  };
}
