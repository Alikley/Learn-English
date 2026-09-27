"use client";

import { useMemo } from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// پاسخ‌برگ آزمون آیلتس (v1.0.3.3)
// سوال‌ها داخل PDF کتاب هستند — این برگ ۴۰ جای خالی شماره‌دار
// دارد (مثل پاسخ‌برگ واقعی آیلتس). چیپ‌های ریویو مثل تستینو:
// پر = سبز، خالی = خاکستری؛ کلیک = پرش به همان سوال.
// ========================================

export default function AnswerSheet({
  prefix, // "r" | "l"
  questions,
  answers,
  onChange,
  disabled,
  parts,
}: {
  prefix: "r" | "l";
  questions: number;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  /** تعداد بخش‌ها (ریدینگ ۳ پاساژ / لیسنینگ ۴ بخش) — جداکنندهٔ نمایشی */
  parts: number;
}) {
  const { tr, dir } = useLanguage();

  const ids = useMemo(
    () =>
      Array.from({ length: questions }, (_, i) => `${prefix}${i + 1}`),
    [prefix, questions],
  );

  const answered = useMemo(
    () => ids.filter((id) => (answers[id] ?? "").trim() !== "").length,
    [ids, answers],
  );

  // جداکننده‌های بخش — تقسیم مساوی ۴۰ سوال بین بخش‌ها
  const partSize = parts > 0 ? Math.ceil(questions / parts) : questions;

  return (
    <div className="space-y-3" dir={dir}>
      {/* ---------- چیپ‌های ریویو ---------- */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <ClipboardList size={13} className="text-indigo-500" />
            {tr("پاسخ‌برگ", "Answer sheet")}
          </p>
          <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            {answered}/{questions}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id, i) => {
            const num = i + 1;
            const filled = (answers[id] ?? "").trim() !== "";
            return (
              <a
                key={id}
                href={`#q-${id}`}
                title={tr(`سوال ${num}`, `Question ${num}`)}
                className={`
                  w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition
                  ${
                    filled
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {num}
              </a>
            );
          })}
        </div>
      </div>

      {/* ---------- جای خالی‌های شماره‌دار ---------- */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-2">
        {ids.map((id, i) => {
          const num = i + 1;
          const isPartStart = partSize > 0 && i > 0 && i % partSize === 0;
          const partNumber = partSize > 0 ? Math.floor(i / partSize) + 1 : 1;
          return (
            <div key={id}>
              {isPartStart && (
                <div className="flex items-center gap-2 my-2.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {prefix === "r"
                      ? tr(`پاساژ ${partNumber}`, `Passage ${partNumber}`)
                      : tr(`بخش ${partNumber}`, `Part ${partNumber}`)}
                  </span>
                  <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
              )}
              <div
                id={`q-${id}`}
                className="flex items-center gap-2 scroll-mt-24"
              >
                <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center">
                  {num}
                </span>
                <input
                  dir="ltr"
                  value={answers[id] ?? ""}
                  onChange={(e) => onChange(id, e.target.value)}
                  disabled={disabled}
                  maxLength={120}
                  placeholder="—"
                  className={`
                    flex-1 min-w-0 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100
                    bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700
                    focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400
                    placeholder:text-slate-300 dark:placeholder:text-slate-600
                    disabled:opacity-60 transition
                  `}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] leading-5 text-slate-400 dark:text-slate-500 px-1">
        {tr(
          "صورت سوال‌ها را از PDF کتاب بخوان و پاسخ را اینجا وارد کن (مثل پاسخ‌برگ واقعی آیلتس). برای سوال‌های چهارگزینه‌ای فقط حرف (A/B/C/D) را بنویس.",
          "Read the questions from the book PDF and type your answers here (like the real IELTS answer sheet). For multiple-choice questions just type the letter (A/B/C/D).",
        )}
      </p>
    </div>
  );
}
