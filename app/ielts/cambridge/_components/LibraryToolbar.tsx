"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { SortKey } from "@/app/hook/ielts/useCambridgeLibrary";

// ========================================
// نوار جستجو + مرتب‌سازی کتابخانه (v1.0.4.2)
// (از cambridge/page.tsx جدا شد)
// ========================================

export default function LibraryToolbar({
  query,
  onQuery,
  sort,
  onSort,
}: {
  query: string;
  onQuery: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={tr("جستجوی کتاب… (مثلاً ۰۴)", "Search books… (e.g. 04)")}
          className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
        />
      </div>
      <div className="relative">
        <ArrowUpDown
          size={15}
          className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none"
        />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="w-full sm:w-52 appearance-none ps-9 pe-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
        >
          <option value="book">{tr("مرتب‌سازی: شمارهٔ کتاب", "Sort: Book number")}</option>
          <option value="band">{tr("مرتب‌سازی: بهترین بند", "Sort: Best band")}</option>
          <option value="activity">
            {tr("مرتب‌سازی: بیشترین تلاش", "Sort: Most attempts")}
          </option>
        </select>
      </div>
    </div>
  );
}
