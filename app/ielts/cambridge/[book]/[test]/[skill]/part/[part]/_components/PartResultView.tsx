"use client";

import Link from "next/link";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsMode, IeltsResultSummary, IeltsSubmitResult } from "@/types/ielts";

// ========================================
// نمای نتیجهٔ آزمون ساخت‌یافته (v1.0.4.2)
// کارت نمره + جدول ریویو سوال‌به‌سوال + دکمه‌ها
// (از part/[part]/page.tsx جدا شد)
// ========================================

/** یک ردیف ریویو (سازگار با review تلاش تحویل‌شده) */
export interface PartReviewRow {
  questionId: string;
  number?: number;
  yourAnswer: string;
  correctAnswer?: string;
  isCorrect: boolean;
}

export default function PartResultView({
  result,
  stored,
  review,
  exitHref,
  bookId,
  testId,
  isFull,
  mode,
  parts,
  onGoPart,
}: {
  result: IeltsSubmitResult | null;
  stored: IeltsResultSummary | null;
  review: PartReviewRow[];
  exitHref: string;
  bookId: number;
  testId: number;
  isFull: boolean;
  mode: IeltsMode;
  parts: number[];
  onGoPart: (n: number) => void;
}) {
  const { tr, dir } = useLanguage();
  const rawScore = result?.rawScore ?? stored?.rawScore ?? null;
  const totalQuestions = result?.totalQuestions ?? stored?.totalQuestions ?? 40;
  const bandScore = result?.bandScore ?? stored?.bandScore ?? null;
  const keySource = result?.keySource ?? null;

  return (
    <div className="space-y-4" dir={dir}>
      {/* کارت نمره */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex flex-col items-center justify-center shrink-0">
            <Award size={18} />
            <span className="text-lg font-black leading-none mt-0.5 tabular-nums">
              {bandScore ?? "—"}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
              {tr("نتیجهٔ آزمون لیسنینگ", "Listening exam result")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr("نمرهٔ خام", "Raw score")}:{" "}
              <span className="font-black text-slate-700 dark:text-slate-200 tabular-nums" dir="ltr">
                {rawScore ?? "—"} / {totalQuestions ?? 40}
              </span>
            </p>
            {(keySource === "manual" || (review.length > 0 && stored?.selfScored === false)) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                <CheckCircle2 size={11} />
                {tr(
                  "تصحیح خودکار با پاسخ‌نامهٔ رسمی کتاب",
                  "Auto-graded with the official book answer key",
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ریویو سوال‌به‌سوال */}
      {review.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-black text-slate-700 dark:text-slate-200">
            {tr("مرور پاسخ‌ها (سوال‌به‌سوال)", "Answer review (question by question)")}
          </p>
          <div className="max-h-[52vh] overflow-y-auto">
            <table className="w-full text-xs" dir="ltr">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr className="text-slate-600 dark:text-slate-300">
                  <th className="px-3 py-2 text-start font-black">#</th>
                  <th className="px-3 py-2 text-start font-black">Your answer</th>
                  <th className="px-3 py-2 text-start font-black">Correct answer</th>
                  <th className="px-3 py-2 font-black">✓</th>
                </tr>
              </thead>
              <tbody>
                {review.map((r, i) => {
                  const num = r.number ?? (Number(r.questionId.replace(/^l/, "")) || i + 1);
                  return (
                    <tr
                      key={r.questionId}
                      className={
                        r.isCorrect
                          ? "bg-emerald-50/60 dark:bg-emerald-500/10"
                          : "bg-red-50/60 dark:bg-red-500/10"
                      }
                    >
                      <td className="px-3 py-1.5 font-black text-slate-600 dark:text-slate-300 tabular-nums">
                        {num}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                        {r.yourAnswer || "—"}
                      </td>
                      <td className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200">
                        {r.correctAnswer ?? "—"}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {r.isCorrect ? (
                          <CheckCircle2 size={14} className="inline text-emerald-600" />
                        ) : (
                          <XCircle size={14} className="inline text-red-500" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* دکمه‌ها */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={exitHref}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
        >
          {tr("بازگشت به کتاب", "Back to the book")}
        </Link>
        {isFull && (
          <Link
            href={`/ielts/cambridge/${bookId}/${testId}/writing?mode=${mode}&full=1`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          >
            {tr("بخش بعدی: رایتینگ", "Next section: Writing")}
          </Link>
        )}
      </div>

      {/* مرور دوبارهٔ برگه‌ها */}
      <div className="flex gap-2 flex-wrap pt-1" dir="ltr">
        {parts.map((p) => (
          <button
            key={p}
            onClick={() => onGoPart(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/15"
          >
            Part {p}
          </button>
        ))}
      </div>
    </div>
  );
}
