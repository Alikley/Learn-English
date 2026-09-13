"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameStats, StreakInfo } from "@/types/game";

// ========================================
// هوک آمار و استریک بازی
// - GET  آمار بازی + استریک یادگیری
// - POST نتیجه هر کلمه (آپدیت استریک)
// - POST پایان دور (ثبت بهترین امتیاز)
// فقط در صفحه بازی‌ها استفاده می‌شود (گام ۶)
// ========================================

export function useGameStats() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // ---- بارگذاری آمار ----
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/game/hangman/result");
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

  // ---- ثبت نتیجه یک کلمه + آپدیت استریک (گام ۷) ----
  const submitWordResult = useCallback(async (won: boolean) => {
    try {
      const res = await fetch("/api/game/hangman/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "word", won }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
      }
    } catch {
      /* بی‌خیال — بازی ادامه دارد */
    }
  }, []);

  // ---- پایان دور: ثبت بهترین امتیاز ----
  const submitSession = useCallback(async (score: number) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/hangman/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "session", score }),
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
    submitWordResult,
    submitSession,
    reload: load,
  };
}
