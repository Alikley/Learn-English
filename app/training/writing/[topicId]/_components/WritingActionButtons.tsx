"use client";

import { Send, RotateCcw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// دکمه‌های ادیتور نوشتاری — ارسال برای اصلاح / نوشتن دوباره
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function WritingActionButtons({
  feedbackShown,
  submitting,
  canSubmit,
  onSubmit,
  onRestart,
}: {
  feedbackShown: boolean;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onRestart: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="mt-5 flex justify-center gap-3">
      {!feedbackShown ? (
        <button
          onClick={onSubmit}
          disabled={submitting || !canSubmit}
          className="px-8 py-3 bg-linear-to-l from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {tr("در حال اصلاح متن... (تا یک دقیقه)", "Correcting your text... (up to a minute)")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {tr("ارسال برای اصلاح", "Submit for Correction")}
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {tr("نوشتن دوباره", "Write Again")}
        </button>
      )}
    </div>
  );
}
