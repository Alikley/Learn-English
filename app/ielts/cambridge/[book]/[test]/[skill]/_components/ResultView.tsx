"use client";

import Link from "next/link";
import {
  Award,
  ArrowLeft,
  Zap,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import type {
  IeltsResultSummary,
  IeltsSkill,
  IeltsSubmitResult,
  IeltsWritingPrompt,
} from "@/types/ielts";

// ========================================
// نمای نتیجه — کارت نمره / خودتصحیحی / ریویو (v1.0.4.2)
// (از [skill]/page.tsx جدا شد)
//
// ✍️ v1.0.0.7: در بخش رایتینگ، صورت سوالِ هر تسک بالای
//    متنِ خودش نشان داده می‌شود (جدا شده از کتاب)
// ========================================

/** نشان منبع تصحیح زیر کارت نمره */
function KeySourceBadge({ source }: { source: string | null }) {
  const { tr } = useLanguage();
  if (source === "ai")
    return (
      <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
        {tr(
          "تصحیح خودکار با پاسخ‌نامهٔ استخراج‌شده توسط هوش مصنوعی",
          "Auto-marked with the AI-extracted answer key",
        )}
      </span>
    );
  if (source === "pdf")
    return (
      <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
        {tr(
          "تصحیح خودکار با پاسخ‌نامهٔ خود کتاب (PDF)",
          "Auto-marked with the book's own answer key (PDF)",
        )}
      </span>
    );
  if (source === "manual")
    return (
      <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
        {tr("تصحیح خودکار", "Auto-marked")}
      </span>
    );
  return null;
}

export default function ResultView({
  result,
  stored,
  selfScoreDone,
  skill,
  bookId,
  testId,
  isExam,
  selfScoreInput,
  setSelfScoreInput,
  doSelfScore,
  selfScoreSaving,
  selfScoreError,
  exitHref,
  fullNextHref,
  writingPrompts,
}: {
  result: IeltsSubmitResult | null;
  stored: IeltsResultSummary | null;
  selfScoreDone: { rawScore: number; bandScore: number } | null;
  skill: IeltsSkill;
  bookId: number;
  testId: number;
  isExam: boolean;
  selfScoreInput: string;
  setSelfScoreInput: (v: string) => void;
  doSelfScore: () => Promise<void>;
  selfScoreSaving: boolean;
  selfScoreError: string | null;
  exitHref: string;
  fullNextHref: string | null;
  /** صورت سوال تسک‌های رایتینگ — جدا شده از کتاب (v1.0.0.7) */
  writingPrompts?: IeltsWritingPrompt[];
}) {
  const { tr } = useLanguage();

  const rawScore = selfScoreDone?.rawScore ?? result?.rawScore ?? stored?.rawScore ?? null;
  const totalQuestions = result?.totalQuestions ?? stored?.totalQuestions ?? null;
  const bandScore = selfScoreDone?.bandScore ?? result?.bandScore ?? stored?.bandScore ?? null;
  const selfScored =
    selfScoreDone != null ? true : result == null ? (stored?.selfScored ?? false) : false;
  const needSelfScore =
    skill !== "writing" &&
    result != null &&
    result.selfScoreRequired &&
    rawScore == null &&
    !selfScoreDone;
  const isStoredOnly = result == null && stored != null;
  const autoKeySource = result?.keySource ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* ---------- کارت نمره ---------- */}
      {(bandScore != null || skill === "writing") && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Award size={26} />
          </div>
          {skill === "writing" ? (
            <>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("رایتینگ تحویل شد", "Writing submitted")}
              </p>
              <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400">
                {tr(
                  "متن هر دو تسک ذخیره شد. نمونه پاسخ‌های سطح بالا در انتهای کتاب کمبریج است — با نوشتهٔ خودت مقایسه‌شان کن.",
                  "Both task texts are saved. Model answers are at the end of the Cambridge book — compare them with yours.",
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-50 tabular-nums" dir="ltr">
                {bandScore}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr("بند آیلتس", "IELTS band")} ·{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200" dir="ltr">
                  {rawScore}/{totalQuestions}
                </span>
              </p>
              {selfScored ? (
                <span className="inline-block text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2.5 py-1">
                  {tr(
                    "خودتصحیحی از روی پاسخ‌نامهٔ کتاب",
                    "Self-scored from the book's answer key",
                  )}
                </span>
              ) : (
                <KeySourceBadge source={autoKeySource} />
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- خودتصحیحی (وقتی هیچ کلیدی نبود) ---------- */}
      {needSelfScore && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <ClipboardCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("نوبت تصحیح است!", "Time to score!")}
              </p>
              <p className="text-[10px] text-slate-400">
                {tr(
                  "پاسخ‌نامهٔ این کتاب از PDF خوانده نشد — خودت تصحیح کن",
                  "This book's answer key could not be parsed from the PDF — self-score",
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3.5 space-y-2">
            <p className="text-[11px] leading-6 text-slate-600 dark:text-slate-300">
              {tr(
                "۱) در PDF کتاب به «Answer key» انتهای کتاب برو · ۲) پاسخ‌های درستت را بشمار · ۳) عدد را اینجا وارد کن تا بندت محاسبه و ثبت شود.",
                "1) Open the “Answer key” section at the end of the book · 2) Count your correct answers · 3) Enter the number here to calculate and save your band.",
              )}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                dir="ltr"
                min={0}
                max={totalQuestions ?? 40}
                value={selfScoreInput}
                onChange={(e) => setSelfScoreInput(e.target.value)}
                placeholder={tr("تعداد پاسخ درست", "Correct answers")}
                className="w-36 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              />
              <span className="text-[11px] text-slate-400" dir="ltr">
                / {totalQuestions ?? 40}
              </span>
              <button
                onClick={() => void doSelfScore()}
                disabled={selfScoreSaving}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-60 transition"
              >
                {selfScoreSaving
                  ? tr("در حال ثبت…", "Saving…")
                  : tr("ثبت نمره و محاسبهٔ بند", "Save & calculate band")}
              </button>
            </div>
            {selfScoreError && <p className="text-[10px] font-bold text-red-500">{selfScoreError}</p>}
          </div>
        </div>
      )}

      {/* ---------- ریویو سوال به سوال (کلید موجود) ---------- */}
      {result?.review && result.review.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 px-1 pb-1">
            {tr("ریویو سوال به سوال", "Question-by-question review")}
          </p>
          <div className="grid gap-1.5 max-h-96 overflow-y-auto">
            {result.review.map((r) => (
              <div
                key={r.questionId}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${
                  r.isCorrect
                    ? "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-red-50/70 dark:bg-red-500/10 border-red-100 dark:border-red-500/20"
                }`}
              >
                {r.isCorrect ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-500 shrink-0" />
                )}
                <span className="text-[10px] font-black text-slate-500 w-6 shrink-0" dir="ltr">
                  {r.number}
                </span>
                <span
                  className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate flex-1"
                  dir="ltr"
                >
                  {r.yourAnswer || "—"}
                </span>
                {!r.isCorrect && (
                  <span
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0"
                    dir="ltr"
                  >
                    ✓ {r.correctAnswer}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- متن‌های رایتینگ + صورت سوال هر تسک (v1.0.0.7) ---------- */}
      {skill === "writing" && result?.writingSubmissions && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 px-1">
            {tr("متن‌های تو", "Your submissions")}
          </p>
          {result.writingSubmissions.map((w) => {
            const taskNo = w.questionId === "w1" ? 1 : 2;
            const q = writingPrompts?.find((p) => p.task === taskNo) ?? null;
            return (
              <div key={w.questionId} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 space-y-2">
                {/* صورت سوال — بالای متن (v1.0.0.7) */}
                {q && (
                  <div className="rounded-xl bg-white dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-500/20 p-3" dir="ltr">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-1.5">
                      WRITING TASK {taskNo} — {tr("صورت سوال", "the question")}
                    </p>
                    <p className="font-serif text-[12px] leading-7 text-slate-700 dark:text-slate-200">
                      {q.prompt}
                    </p>
                  </div>
                )}
                <p className="text-[10px] font-bold text-slate-500 mb-1.5" dir="ltr">
                  Task {taskNo} — {w.wordCount} words
                </p>
                <p
                  className="text-[11px] leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap"
                  dir="ltr"
                >
                  {w.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- دکمه‌های پایان ---------- */}
      <div className="flex flex-col sm:flex-row gap-2">
        {fullNextHref && (
          <Link
            href={fullNextHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold transition"
          >
            <Zap size={15} />
            {tr("بخش بعدی آزمون کامل", "Next section of the full test")}
          </Link>
        )}
        <Link
          href={exitHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {tr(
            `بازگشت به کتاب ${bookId} — تست ${testId}`,
            `Back to book ${bookId} — test ${testId}`,
          )}
        </Link>
      </div>

      {isExam && !isStoredOnly && (
        <p className="text-center text-[10px] text-slate-400">
          {tr(
            "مثل آزمون واقعی: نمرهٔ رایتینگ آیلتس توسط ممتحن داده می‌شود؛ برای ریدینگ/لیسنینگ اگر پاسخ‌نامهٔ کتاب از PDF خوانده نشد، از انتهای کتاب تصحیح کن.",
            "Like the real test: writing is scored by an examiner; for reading/listening, if the book's answer key was not parsed, mark it from the end of the book.",
          )}
        </p>
      )}
    </motion.div>
  );
}
