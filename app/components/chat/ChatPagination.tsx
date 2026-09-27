"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحه‌بندی چت کاربران (v1.0.3.0 — گام ۴)
// پیام‌ها زیاد می‌شوند → هر صفحه ۱۰ پیام ریشه
// شماره‌ها با پنجرهٔ هوشمند: ۱ … (صفحهٔ جاری ±۱) … آخرین
// ========================================

function pageWindow(
  page: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const nums = [...wanted]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

export default function ChatPagination({
  page,
  totalPages,
  onChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { tr } = useLanguage();
  if (totalPages <= 1) return null;

  const btnBase =
    "min-w-9 h-9 px-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const btnIdle =
    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
      aria-label={tr("صفحه‌بندی پیام‌ها", "Messages pagination")}
    >
      {/* قبلی */}
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        className={`${btnBase} ${btnIdle} flex items-center gap-1`}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        <span className="hidden sm:inline">{tr("قبلی", "Prev")}</span>
      </button>

      {pageWindow(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span
            key={`gap-${i}`}
            className="w-6 text-center text-sm text-slate-400 dark:text-slate-500 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            disabled={disabled}
            className={[
              btnBase,
              item === page
                ? "bg-blue-600 text-white shadow-sm"
                : btnIdle,
            ].join(" ")}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        ),
      )}

      {/* بعدی */}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className={`${btnBase} ${btnIdle} flex items-center gap-1`}
      >
        <span className="hidden sm:inline">{tr("بعدی", "Next")}</span>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}
