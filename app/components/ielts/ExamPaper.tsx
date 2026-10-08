"use client";

// ========================================
// برگهٔ امتحان کاغذی آیلتس — کامپوننت اصلی (v1.0.4.2 / English 1.0.0.3)
//
// 🎨 گام ۱ (رفع دارک‌مود): همهٔ رنگ‌ها تم‌محور شدند. قبلاً متن‌ها
//    neutral تیره بودند و شبکهٔ دارک globals.css فقط slate/gray را
//    پوشش می‌داد + زمینهٔ برگه را تیره می‌کرد → متن سوال‌ها در
//    دارک‌مود سیاه روی سرمه‌ای می‌شد و گم می‌شد. اکنون هر سطح
//    dark: variant صریح دارد (روشن: کاغذ سفید / تیره: برگهٔ سرمه‌ای
//    با متن روشن — مثل PDF Reader حالت شب).
//
// 🧹 گام ۲ (کلین‌کد): از یک فایل ۵۸۰ خطی به ارکستراتور سبک
//    شکسته شد؛ رندر در paper/*:
//    - PaperHeader        → هدر رسمی + جدول مشخصات داوطلب
//    - AnswerSheetGrid    → پاسخ‌برگ شماره‌دار ۱..N
//    - SectionFrame       → کادر بخش (دستور/باکس/پاساژ/سوال‌ها)
//    - QuestionRow        → ردیف یک سوال (شاخه‌های موزاییک‌نشدنی)
//    - QuestionGap        → جای خالی خط نقطه‌چین
//    - ChoiceChips        → گزینه‌های حرفی/کامل
//    - paper-utils        → توابع خالص و تایپ‌های مشترک
//
// (API عمومی تغییری نکرده — مصرف‌کننده‌ها بدون تغییر کار می‌کنند)
// ========================================

import { useEffect, useMemo, useState } from "react";
import { CircleAlert } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsPaperSection } from "@/types/ielts";
import PaperHeader from "./paper/PaperHeader";
import AnswerSheetGrid from "./paper/AnswerSheetGrid";
import SectionFrame from "./paper/SectionFrame";
import { questionId, type OnPaperAnswer, type PaperAnswers, type QuestionPrefix } from "./paper/paper-utils";

export default function ExamPaper({
  skill,
  bookId,
  testId,
  mode,
  userName,
  userEmail,
  sections,
  totalQuestions,
  answers,
  onChange,
  disabled,
  aiGenerated,
}: {
  skill: "reading" | "listening";
  /** شمارهٔ کتاب کمبریج (۱..۸) — برای هدر برگه */
  bookId?: number;
  /** شمارهٔ تست (۱..۴) — برای هدر برگه */
  testId?: number;
  /** حالت آزمون — practice | exam */
  mode?: string;
  /** نام داوطلب (از پروفایل کاربر) */
  userName?: string;
  /** شناسهٔ داوطلب (ایمیل کاربر) */
  userEmail?: string;
  sections: IeltsPaperSection[];
  totalQuestions: number;
  answers: PaperAnswers;
  onChange: OnPaperAnswer;
  disabled?: boolean;
  /** برگه با هوش مصنوعی ساخته شده است */
  aiGenerated?: boolean;
}) {
  const { tr } = useLanguage();
  const prefix: QuestionPrefix = skill === "reading" ? "r" : "l";

  // تاریخ امروز — بعد از mount (جلوگیری از ناهماهنگی hydration)
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-GB"));
  }, []);

  const ids = useMemo(
    () => Array.from({ length: totalQuestions }, (_, i) => questionId(prefix, i + 1)),
    [prefix, totalQuestions],
  );
  const answeredCount = useMemo(
    () => ids.filter((id) => (answers[id] ?? "").trim() !== "").length,
    [ids, answers],
  );

  const skillName = skill === "reading" ? "READING" : "LISTENING";
  const timeAllowed = skill === "reading" ? "1 hour" : "40 minutes";
  const modeLabel = mode === "exam" ? "EXAMINATION" : "PRACTICE";

  return (
    <div className="exam-sheet">
      {/* برگهٔ چاپی — روشن: کاغذ سفید / تیره: برگهٔ سرمه‌ای (تم‌محور) */}
      <div
        dir="ltr"
        className="bg-white dark:bg-slate-900 text-neutral-900 dark:text-slate-100 border border-neutral-300 dark:border-neutral-700 shadow-lg rounded-md font-serif"
      >
        <PaperHeader
          bookId={bookId}
          testId={testId}
          skillName={skillName}
          timeAllowed={timeAllowed}
          modeLabel={modeLabel}
          totalQuestions={totalQuestions}
          userName={userName}
          userEmail={userEmail}
          dateStr={dateStr}
          aiGenerated={aiGenerated}
        />

        <AnswerSheetGrid
          ids={ids}
          answers={answers}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />

        {/* بخش‌های برگه */}
        <div className="p-4 sm:p-6 space-y-6">
          {sections.map((section, si) => (
            <SectionFrame
              key={`${section.title}-${si}`}
              section={section}
              prefix={prefix}
              answers={answers}
              onChange={onChange}
              disabled={disabled}
            />
          ))}

          {/* پایان برگه */}
          {sections.length > 0 && (
            <p className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400 dark:text-slate-600 pt-1">
              — End of paper —
            </p>
          )}
        </div>
      </div>

      {/* حالت خالی */}
      {sections.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 p-6 flex items-center justify-center gap-2 text-neutral-400 dark:text-slate-500 text-xs">
          <CircleAlert size={15} aria-hidden />
          {tr("بخشی از PDF خوانده نشد", "No section parsed from the PDF")}
        </div>
      )}
    </div>
  );
}
