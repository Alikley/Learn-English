"use client";

// ========================================
// پاسخ‌برگ شماره‌دار ۱..N (v1.0.4.2)
// مثل IELTS Answer Sheet — کلیک روی هر خانه به همان سوال می‌پرد؛
// خانهٔ پاسخ‌داده پر می‌شود و پاسخ ثبت‌شده را نشان می‌دهد.
// 🎨 تم‌محور: پرشدگی در دارک‌مود روشن می‌شود (معکوس)
// ========================================

import type { PaperAnswers } from "./paper-utils";

export default function AnswerSheetGrid({
  ids,
  answers,
  answeredCount,
  totalQuestions,
}: {
  /** شناسهٔ سوال‌ها به‌ترتیب (r1..r40) */
  ids: string[];
  answers: PaperAnswers;
  answeredCount: number;
  totalQuestions: number;
}) {
  return (
    <div className="px-5 sm:px-8 py-4 border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/30">
      <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
        <p className="text-[9px] uppercase tracking-[0.22em] font-black text-neutral-500 dark:text-slate-400">
          Answer Sheet — click a box to jump
        </p>
        <p className="text-[10px] font-black text-neutral-700 dark:text-slate-300">
          {answeredCount} / {totalQuestions} answered
        </p>
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1" dir="ltr">
        {ids.map((id, i) => {
          const v = (answers[id] ?? "").trim();
          const filled = v !== "";
          return (
            <a
              key={id}
              href={`#q-${id}`}
              aria-label={`Question ${i + 1}${filled ? " — answered" : ""}`}
              title={filled ? v : `Question ${i + 1}`}
              className={`relative h-9 border flex items-center justify-center text-[12px] font-bold transition active:scale-95 ${
                filled
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-300 bg-neutral-50 text-neutral-300 hover:border-neutral-700 hover:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-600 dark:hover:border-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              <span className="absolute top-[1px] left-[3px] text-[6.5px] font-black opacity-80" aria-hidden>
                {i + 1}
              </span>
              {filled ? v.slice(0, 3).toUpperCase() : ""}
            </a>
          );
        })}
      </div>
    </div>
  );
}
