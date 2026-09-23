"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { ChevronRight, ChevronLeft } from "lucide-react";

// ========================================
// کنترل صفحهٔ ریدر: قبلی + نقاط صفحه‌ها + بعدی
// (از صفحهٔ ریدر تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function ReaderControls({
  page,
  totalPages,
  isLast,
  onPrev,
  onNext,
  onGoTo,
}: {
  page: number;
  totalPages: number;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="mt-5 md:mt-7 flex items-center justify-between gap-3">
      {/* قبلی (سمت راست در چیدمان راست‌به‌چپ) */}
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="inline-flex items-center gap-1.5 px-4 md:px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
        {tr("صفحه قبل", "Previous Page")}
      </button>

      {/* نقاط صفحه‌ها */}
      <div className="hidden md:flex items-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            aria-label={tr(`صفحه ${i + 1}`, `Page ${i + 1}`)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === page
                ? "w-7 bg-amber-600 dark:bg-amber-400"
                : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-amber-300 dark:hover:bg-amber-500/50"
            }`}
          />
        ))}
      </div>

      <span className="md:hidden text-xs text-slate-400 dark:text-slate-500 font-medium">
        {page + 1} {tr("از", "of")} {totalPages}
      </span>

      {/* بعدی (سمت چپ) */}
      <button
        onClick={onNext}
        className={`inline-flex items-center gap-1.5 px-5 md:px-7 py-3 rounded-2xl text-white text-sm font-bold shadow-md transition-all hover:scale-[1.03] active:scale-95 ${
          isLast
            ? "bg-linear-to-l from-emerald-600 to-emerald-500 shadow-emerald-600/25"
            : "bg-linear-to-l from-amber-600 to-amber-500 shadow-amber-600/25"
        }`}
      >
        {isLast ? tr("پایان کتاب", "End of Book") : tr("صفحه بعد", "Next Page")}
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
