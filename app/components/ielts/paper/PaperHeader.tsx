"use client";

// ========================================
// هدر برگهٔ امتحان (v1.0.4.2)
// عنوان رسمی CAMBRIDGE IELTS — TEST + متا (زمان/حالت/تعداد)
// + جدول مشخصات داوطلب مثل Answer Sheet رسمی آیلتس
// (نام و ایمیل از پروفایل کاربر، تاریخ امروز)
// 🎨 تم‌محور: همهٔ رنگ‌ها با dark: variant
// ========================================

import { Sparkles } from "lucide-react";
import { pad2 } from "./paper-utils";

/** یک خانهٔ جدول مشخصات داوطلب */
function CandidateCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 min-w-0" dir="ltr">
      <p className="text-[8.5px] uppercase tracking-[0.18em] font-black text-neutral-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-[12.5px] font-bold text-neutral-900 dark:text-slate-100 truncate">
        {value || "—"}
      </p>
    </div>
  );
}

export default function PaperHeader({
  bookId,
  testId,
  skillName,
  timeAllowed,
  modeLabel,
  totalQuestions,
  userName,
  userEmail,
  dateStr,
  aiGenerated,
}: {
  bookId?: number;
  testId?: number;
  /** READING / LISTENING */
  skillName: string;
  /** "1 hour" / "40 minutes" */
  timeAllowed: string;
  /** EXAMINATION / PRACTICE */
  modeLabel: string;
  totalQuestions: number;
  /** نام داوطلب (از پروفایل کاربر) */
  userName?: string;
  /** شناسهٔ داوطلب (ایمیل کاربر) */
  userEmail?: string;
  /** تاریخ امروز (بعد از mount محاسبه می‌شود) */
  dateStr: string;
  /** برگه با هوش مصنوعی ساخته شده است */
  aiGenerated?: boolean;
}) {
  return (
    <div className="px-5 sm:px-8 pt-6 pb-5 border-b-[3px] border-double border-neutral-900 dark:border-neutral-100">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-[9px] tracking-[0.3em] font-black text-neutral-500 dark:text-slate-400 uppercase">
            Flex English Examinations
          </p>
          <h2 className="text-lg sm:text-2xl font-black tracking-wide text-neutral-900 dark:text-slate-100 mt-0.5">
            CAMBRIDGE IELTS {bookId ? pad2(bookId) : ""} — TEST {testId ?? ""}
          </h2>
          <p className="text-[11.5px] font-bold text-neutral-600 dark:text-slate-300 mt-0.5">
            {skillName} — Academic Module
          </p>
        </div>
        <div className="text-right space-y-1 shrink-0">
          {aiGenerated && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 rounded-full px-2 py-0.5">
              <Sparkles size={10} aria-hidden />
              AI-GENERATED PAPER
            </span>
          )}
          <p className="text-[11px] text-neutral-600 dark:text-slate-300">
            Time allowed: <span className="font-bold">{timeAllowed}</span>
          </p>
          <p className="text-[11px] text-neutral-600 dark:text-slate-300">
            Mode: <span className="font-bold">{modeLabel}</span>
          </p>
          <p className="text-[11px] text-neutral-600 dark:text-slate-300">
            Questions: <span className="font-bold">1–{totalQuestions}</span>
          </p>
        </div>
      </div>

      {/* جدول مشخصات داوطلب — مثل Answer Sheet رسمی */}
      <div className="mt-5 border border-neutral-500 dark:border-neutral-600 bg-white dark:bg-slate-900">
        <div className="flex divide-x divide-neutral-400 dark:divide-neutral-700 border-b border-neutral-400 dark:border-neutral-700">
          <div className="flex-[1.6] min-w-0">
            <CandidateCell label="Candidate Name" value={userName ?? ""} />
          </div>
          <div className="flex-1 min-w-0">
            <CandidateCell label="Date" value={dateStr} />
          </div>
        </div>
        <div className="flex divide-x divide-neutral-400 dark:divide-neutral-700 border-b border-neutral-400 dark:border-neutral-700">
          <div className="flex-1 min-w-0">
            <CandidateCell label="Module" value={`${skillName} (Academic)`} />
          </div>
          <div className="flex-1 min-w-0">
            <CandidateCell label="Paper" value={`Book ${pad2(bookId ?? 0)} / Test ${testId ?? 0}`} />
          </div>
        </div>
        <CandidateCell label="Candidate ID" value={userEmail ?? ""} />
      </div>
    </div>
  );
}
