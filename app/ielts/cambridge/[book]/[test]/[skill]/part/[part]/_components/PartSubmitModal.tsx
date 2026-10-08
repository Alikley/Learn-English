"use client";

import { ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// مودال تأیید تحویل — نسخهٔ Part (v1.0.4.2)
// (از part/[part]/page.tsx جدا شد)
// ========================================

export default function PartSubmitModal({
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full space-y-4">
        <div className="flex items-center gap-2.5">
          <ClipboardCheck size={20} className="text-emerald-500" />
          <p className="text-sm font-black text-slate-800 dark:text-slate-100">
            {tr("تحویل آزمون لیسنینگ؟", "Submit the listening exam?")}
          </p>
        </div>
        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          {tr(
            `به ${answeredCount} از ${totalCount} سوال پاسخ داده‌ای. بعد از تحویل، برگه با پاسخ‌نامهٔ رسمی کتاب تصحیح می‌شود و قابل بازگشت نیست.`,
            `You have answered ${answeredCount} of ${totalCount} questions. After submitting, your paper is graded with the official answer key and cannot be resumed.`,
          )}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {tr("بازگشت", "Back")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {tr("تحویل و مشاهدهٔ نتیجه", "Submit & see result")}
          </button>
        </div>
      </div>
    </div>
  );
}
