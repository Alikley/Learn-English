"use client";

import { ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// مودال تأیید تحویل (v1.0.4.2)
// (از [skill]/page.tsx جدا شد — نسخهٔ عمومی)
// ========================================

export default function SubmitConfirmModal({
  open,
  answeredCount,
  totalCount,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  answeredCount: number;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 text-center space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ClipboardCheck size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("تحویل نهایی آزمون؟", "Submit the exam?")}
              </p>
              <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400">
                {tr(
                  `${answeredCount} پاسخ از ${totalCount} ثبت شده است. بعد از تحویل، پاسخ‌ها قابل ویرایش نیستند.`,
                  `${answeredCount} of ${totalCount} answers are filled. After submitting, answers cannot be edited.`,
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                {tr("ادامهٔ آزمون", "Keep going")}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {tr("بله، تحویل", "Yes, submit")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
