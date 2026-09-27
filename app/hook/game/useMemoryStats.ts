"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameStats, StreakInfo } from "@/types/game";

// ========================================
// هوک آمار و استریک بازی حافظه کلمات
// - GET  آمار بازی + استریک یادگیری
// - POST شروع دور (ثبت دفعات بازی — v1.0.0.6 گام ۱)
// - POST نتیجه هر جفت درست (آپدیت استریک + آمار زنده)
// - POST پایان دور (ثبت بهترین امتیاز + اشتباهات)
// فقط در صفحه بازی‌ها استفاده می‌شود (گام ۶)
// آمار به‌صورت خوش‌بینانه فوری آپدیت می‌شود و پاسخ سرور
// مقدار قطعی را جایگزین می‌کند — کارت‌ها همزمان با بازی تغییر می‌کنند.
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

  // ---- شروع دور: دفعات بازی +۱ (v1.0.0.6 — گام ۱) ----
  const submitSessionStart = useCallback(async () => {
    // آپدیت خوش‌بینانه — عدد همان لحظه تغییر می‌کند
    setStats((s) =>
      s ? { ...s, sessionsPlayed: s.sessionsPlayed + 1 } : s,
    );
    try {
      const res = await fetch("/api/game/memory/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      /* بی‌خیال — بازی ادامه دارد */
    }
  }, []);

  // ---- ثبت یک جفت درست + آپدیت استریک و آمار زنده (گام ۷) ----
  const submitMatchResult = useCallback(async () => {
    // آپدیت خوش‌بینانه — «جفت‌های درست» همان لحظه تغییر می‌کند
    setStats((s) =>
      s ? { ...s, totalWins: s.totalWins + 1 } : s,
    );
    try {
      const res = await fetch("/api/game/memory/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "match" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
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
    submitSessionStart,
    submitMatchResult,
    submitSession,
    reload: load,
  };
}
