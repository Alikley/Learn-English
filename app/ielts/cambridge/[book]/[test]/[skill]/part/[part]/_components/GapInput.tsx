"use client";

// ========================================
// ورودی جای خالی (v1.0.4.2)
// شمارهٔ سوال + input با حالت‌های پاسخ‌داده/پرچم/فعال
// (از part/[part]/page.tsx جدا شد)
// ========================================

export default function GapInput({
  id,
  q,
  sub,
  value,
  answered,
  flagged,
  active,
  onChange,
  onFocus,
  center,
  width,
}: {
  id?: string;
  q: number;
  sub?: 1 | 2;
  value: string;
  answered: boolean;
  flagged: boolean;
  active: boolean;
  onChange: (v: string) => void;
  onFocus?: () => void;
  center?: boolean;
  width?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 align-middle" id={`q-${q}`}>
      <span
        className={`
          w-5 h-5 rounded text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums
          ${
            flagged
              ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }
        `}
      >
        {q}
        {sub ? `.${sub}` : ""}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        dir="ltr"
        autoComplete="off"
        className={`
          ${width ?? "w-28"} h-8 px-2 rounded-lg border text-xs font-semibold outline-none transition
          ${
            answered
              ? "border-sky-400 bg-sky-50/60 dark:bg-sky-500/10 text-slate-700 dark:text-slate-200"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          }
          focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/30
          ${active ? "ring-2 ring-sky-300 dark:ring-sky-500/40" : ""}
          ${center ? "text-center" : ""}
        `}
      />
    </span>
  );
}
