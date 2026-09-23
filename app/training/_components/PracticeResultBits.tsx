"use client";

import { motion } from "motion/react";
import { Star, CheckCircle2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// ستاره‌های متحرک نتیجهٔ تمرین (v1.0.2.7 — ریفکتوری گام ۲)
// مشترک بین صفحهٔ تمرین [episodeId] و پلیر شنیداری [podId]
// ========================================

export function StarsResult({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((s) => (
        <motion.div
          key={s}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + s * 0.2, type: "spring" }}
        >
          <Star
            className={`h-10 w-10 ${
              s <= count
                ? "text-amber-400 fill-amber-400 drop-shadow-md"
                : "text-slate-200"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ========================================
// دکمه‌های ارسال جواب / تلاش مجدد تمرین‌ها
// ========================================

export function SubmitAnswersButton({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <button
      onClick={onSubmit}
      disabled={submitting}
      className="px-8 py-3 bg-linear-to-l from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center gap-2"
    >
      {submitting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          {tr("در حال بررسی...", "Checking...")}
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          {tr("ثبت جواب‌ها", "Submit Answers")}
        </>
      )}
    </button>
  );
}

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  const { tr } = useLanguage();
  return (
    <button
      onClick={onRetry}
      className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      {tr("تلاش مجدد", "Try Again")}
    </button>
  );
}
