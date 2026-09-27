"use client";

import { useState, useEffect, useCallback } from "react";

export type StreakData = { current: number; longest: number };

/** رویداد جهانی «استریک به‌روز شد» — هر فعالیتی که استریک ثبت می‌کند آن را پخش می‌کند */
export const STREAK_UPDATED_EVENT = "flex-streak-updated";

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

    // ✅ v1.0.3.0 — گام ۳: همگام‌سازی فوری بین همهٔ نمونه‌های هوک
    // وقتی فعالیتی ثبت شد (رویداد flex-streak-updated)، سایدبار و آلارت
    // بدون رفرش صفحه همزمان عدد جدید را می‌گیرند
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<StreakData>).detail;
      if (detail) setStreak(detail);
    };
    window.addEventListener(STREAK_UPDATED_EVENT, onUpdated as EventListener);

    return () => {
      clearTimeout(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(STREAK_UPDATED_EVENT, onUpdated as EventListener);
    };
  }, [fetchStreak]);

  return { streak, loading, refetch: fetchStreak };
}

/**
 * ثبت فعالیت روزانه + اعلام فوری به کل سایت (v1.0.3.0 — گام ۲ و ۳)
 * - POST /api/streak → آپدیت روزهای متوالی (تکرار در همان روز بی‌اثر است)
 * - پخش رویداد flex-streak-updated → سایدبار و آلارت درجا به‌روز می‌شوند
 *
 * روی همهٔ بخش‌های سایدبار به‌جز چت صدا زده می‌شود؛
 * چتِ کاربران عمداً استریک ثبت نمی‌کند.
 */
export async function recordStreakActivity(): Promise<void> {
  try {
    const res = await fetch("/api/streak", { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as StreakData;
    window.dispatchEvent(new CustomEvent(STREAK_UPDATED_EVENT, { detail: data }));
  } catch {
    /* بی‌خیال — استریک حیاتی نیست */
  }
}
