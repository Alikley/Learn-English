"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحه‌بندی چت (v1.0.3.0 — گام ۴)
// صفحه ۱ = تازه‌ترین پیام‌ها؛ شماره بزرگ‌تر = پیام‌های قدیمی‌تر
// حداکثر ۵ شماره + اول/آخر — برای وقتی که پیام‌ها زیاد شوند
// ========================================

export default function ChatPagination({
  page,
  totalPages,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { tr, dir } = useLanguage();
  if (totalPages <= 1) return null;

  // شماره صفحه‌های قابل نمایش — پنجره حول صفحه فعلی
  const window = 2;
  const pages: number[] = [];
  for (
    let p = Math.max(1, page - window);
    p <= Math.min(totalPages, page + window);
    p++
  ) {
    pages.push(p);
  }

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const btn =
    "min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 py-2" dir={dir}>
      {/* قبلی (قدیمی‌تر در rtl) */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        title={tr("پیام‌های قدیمی‌تر", "Older messages")}
        className={`${btn} flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
      >
        <PrevIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{tr("قدیمی‌تر", "Older")}</span>
      </button>

      {/* اول */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            disabled={disabled}
            className={`${btn} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            ۱
          </button>
          {pages[0] > 2 && <span className="text-slate-400 px-0.5">…</span>}
        </>
      )}

      {/* شماره‌ها */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          disabled={disabled}
          className={`${btn} ${
            p === page
              ? "bg-blue-500 text-white shadow-md shadow-blue-200/60 dark:shadow-blue-900/40"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          aria-current={p === page ? "page" : undefined}
        >
          {p.toLocaleString("fa-IR")}
        </button>
      ))}

      {/* آخر */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-slate-400 px-0.5">…</span>
          )}
          <button
            onClick={() => onChange(totalPages)}
            disabled={disabled}
            className={`${btn} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            {totalPages.toLocaleString("fa-IR")}
          </button>
        </>
      )}

      {/* بعدی (جدیدتر) */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        title={tr("پیام‌های جدیدتر", "Newer messages")}
        className={`${btn} flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
      >
        <span className="hidden sm:inline">{tr("جدیدتر", "Newer")}</span>
        <NextIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
