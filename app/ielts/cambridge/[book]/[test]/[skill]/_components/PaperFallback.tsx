"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw, Keyboard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import PdfExamPanel from "@/app/components/ielts/PdfExamPanel";

// ========================================
// حالت جایگزین — برگه ساخته نشد (v1.0.4.2)
// هشدار + دکمهٔ ساخت دوباره با AI + خود PDF + ورودی سریع پاسخ‌ها
// (از [skill]/page.tsx جدا شد)
// ========================================

export default function PaperFallback({
  pdfUrl,
  bookTitle,
  failReason,
  aiError,
  retryable,
  onRetry,
  answerIds,
  answeredCount,
  savedAnswers,
  onAnswer,
}: {
  pdfUrl: string | null;
  bookTitle: string;
  /** دلیل ساخت‌نشدن برگه (پارسر یا AI) */
  failReason: string | null;
  /** خطای اختصاصی ساخت هوشمند */
  aiError?: string;
  /** آیا ساخت دوباره با AI ممکن است؟ */
  retryable: boolean;
  onRetry: () => void;
  answerIds: string[];
  answeredCount: number;
  savedAnswers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const { tr } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* هشدار ساخت‌نشدن + ساخت دوباره */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/10 p-3.5 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-amber-700 dark:text-amber-300">
              {tr("برگهٔ امتحان از این PDF ساخته نشد", "The exam paper could not be built from this PDF")}
            </p>
            <p className="text-[10px] leading-5 text-amber-600/90 dark:text-amber-400/80" dir="auto">
              {failReason ?? tr("ساختار فایل شناخته نشد", "File structure not recognized")}
            </p>
            {aiError && (
              <p className="text-[10px] leading-5 text-amber-600/80 dark:text-amber-400/70" dir="auto">
                {tr("ساخت هوشمند:", "Smart build:")} {aiError}
              </p>
            )}
          </div>
        </div>
        {retryable && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition active:scale-[0.99]"
          >
            <RefreshCw size={14} />
            {tr("ساخت دوبارهٔ برگه با هوش مصنوعی", "Rebuild the paper with AI")}
          </button>
        )}
      </div>

      {/* خود PDF کتاب */}
      {pdfUrl ? (
        <div className="h-[70vh] min-h-[420px]">
          <PdfExamPanel pdfUrl={pdfUrl} bookTitle={bookTitle} />
        </div>
      ) : (
        <div className="h-[60vh] min-h-[360px]">
          <PdfExamPanel pdfUrl={null} bookTitle="" />
        </div>
      )}

      {/* ورودی سریع پاسخ‌ها — جمع‌شده به‌صورت پیش‌فرض */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-start"
        >
          <span className="flex items-center gap-2 text-[11px] font-black text-slate-700 dark:text-slate-200">
            <Keyboard size={14} className="text-indigo-500" />
            {tr(
              `ورود سریع پاسخ‌ها (${answeredCount}/${answerIds.length})`,
              `Quick answer entry (${answeredCount}/${answerIds.length})`,
            )}
          </span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid sm:grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                {answerIds.map((id, i) => (
                  <div key={id} className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center"
                      dir="ltr"
                    >
                      {i + 1}
                    </span>
                    <input
                      dir="ltr"
                      value={savedAnswers[id] ?? ""}
                      onChange={(e) => onAnswer(id, e.target.value)}
                      maxLength={120}
                      placeholder="—"
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
