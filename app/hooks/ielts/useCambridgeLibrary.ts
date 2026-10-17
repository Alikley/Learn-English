"use client";

import { useMemo, useState } from "react";
import type { IeltsAttemptSummary, IeltsBookSummary } from "@/types/ielts";

// ========================================
// هوک کتابخانهٔ کمبریج (v1.0.4.2 — کلین‌کد)
// جستجو + مرتب‌سازی + آمار هر کتاب از تلاش‌ها
// (از صفحهٔ cambridge/page.tsx جدا شد)
// ========================================

export type SortKey = "book" | "band" | "activity";

export interface BookStats {
  bestBand: number | null;
  attempts: number;
  inProgress: number;
}

export function useCambridgeLibrary(
  books: IeltsBookSummary[],
  attempts: IeltsAttemptSummary[],
) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("book");

  /** آمار هر کتاب (بهترین بند / تعداد تلاش / در جریان) */
  const statsByBook = useMemo(() => {
    const map = new Map<number, BookStats>();
    for (const a of attempts) {
      const s = map.get(a.bookNumber) ?? { bestBand: null, attempts: 0, inProgress: 0 };
      if (a.status === "IN_PROGRESS") s.inProgress++;
      s.attempts++;
      if (a.status === "SUBMITTED" && a.bandScore != null) {
        if (s.bestBand == null || a.bandScore > s.bestBand) s.bestBand = a.bandScore;
      }
      map.set(a.bookNumber, s);
    }
    return map;
  }, [attempts]);

  /** نتیجهٔ جستجو + مرتب‌سازی */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books;
    if (q) {
      list = list.filter(
        (b) =>
          b.titleEn.toLowerCase().includes(q) ||
          b.titleFa.includes(q) ||
          String(b.id).includes(q) ||
          String(b.id).padStart(2, "0").includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "band") {
      sorted.sort(
        (a, b) =>
          (statsByBook.get(b.id)?.bestBand ?? -1) -
          (statsByBook.get(a.id)?.bestBand ?? -1),
      );
    } else if (sort === "activity") {
      sorted.sort(
        (a, b) =>
          (statsByBook.get(b.id)?.attempts ?? 0) -
          (statsByBook.get(a.id)?.attempts ?? 0),
      );
    }
    return sorted;
  }, [books, query, sort, statsByBook]);

  /** آیا کاربر روی این کتاب‌ها رکوردی ثبت کرده است؟ */
  const anyProgress = useMemo(
    () => Array.from(statsByBook.values()).some((s) => s.attempts > 0),
    [statsByBook],
  );

  return { query, setQuery, sort, setSort, statsByBook, filtered, anyProgress };
}
