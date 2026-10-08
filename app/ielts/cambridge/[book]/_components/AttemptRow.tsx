"use client";

import { Award, ClipboardList, Headphones, PenLine, Send } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsAttemptSummary } from "@/types/ielts";

// ========================================
// یک ردیف تاریخچهٔ تلاش (تب نتیجه) (v1.0.4.2)
// (از [book]/page.tsx جدا شد)
// ========================================

export default function AttemptRow({ a }: { a: IeltsAttemptSummary }) {
  const { tr, lang } = useLanguage();
  const en = lang === "en";
  const date = new Date(a.submittedAt ?? a.startedAt).toLocaleDateString(
    en ? "en-US" : "fa-IR",
  );

  const skillLabel =
    a.skill === "reading"
      ? tr("ریدینگ", "Reading")
      : a.skill === "listening"
        ? tr("لیسنینگ", "Listening")
        : tr("رایتینگ", "Writing");

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
        {a.skill === "reading" ? (
          <ClipboardList size={15} />
        ) : a.skill === "listening" ? (
          <Headphones size={15} />
        ) : (
          <PenLine size={15} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200" dir="ltr">
          Cambridge {String(a.bookNumber).padStart(2, "0")} — Test {a.testNumber} · {skillLabel}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {date}
          {a.mode === "exam" ? ` · ${tr("حالت آزمون", "Exam mode")}` : ` · ${tr("تمرین", "Practice")}`}
          {a.selfScored ? ` · ${tr("خودتصحیحی", "self-scored")}` : ""}
        </p>
      </div>
      <div className="text-end shrink-0">
        {a.status === "SUBMITTED" ? (
          a.skill === "writing" ? (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Send size={11} />
              {tr("تحویل‌شده", "Submitted")}
            </span>
          ) : a.bandScore != null ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-black"
              dir="ltr"
            >
              <Award size={12} />
              {a.bandScore}
              <span className="text-[9px] font-bold opacity-70">
                {a.rawScore}/{a.totalQuestions}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">{tr("بدون نمره", "No score")}</span>
          )
        ) : (
          <span className="text-[10px] text-sky-500 font-bold">{tr("در جریان", "In progress")}</span>
        )}
      </div>
    </div>
  );
}
