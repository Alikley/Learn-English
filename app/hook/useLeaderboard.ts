"use client";

import { useCallback, useEffect, useState } from "react";

// ========================================
// هوک برترین امتیازهای بازی (نسخه ۱.۰.۲.۲ — گام ۲)
// GET /api/game/leaderboard?game=...
// هر بار که کاربر به صفحه انتخاب سطح برگردد،
// کامپوننت از نو مانت می‌شود و آمار تازه می‌گیرد
// ========================================

export type LeaderRow = {
  rank: number;
  userId: string;
  name: string;
  bestScore: number;
  sessionsPlayed: number;
  isYou: boolean;
};

export type LeaderboardData = {
  game: string;
  leaders: LeaderRow[];
  you: { rank: number; bestScore: number } | null;
};

export function useLeaderboard(game: string) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setUnauthorized(false);
    setFailed(false);
    try {
      const res = await fetch(
        `/api/game/leaderboard?game=${encodeURIComponent(game)}`,
      );
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    // شروع فچ با تاخیر صفر — الگوی امن StrictMode
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  return { data, loading, unauthorized, failed, reload: load };
}
