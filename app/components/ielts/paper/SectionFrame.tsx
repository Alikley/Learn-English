"use client";

// ========================================
// کادر یک بخش برگه (v1.0.4.2)
// سربرگ رسمی SECTION/PART + دستور ایتالیک + باکس گزینه‌های
// مشترک (A–G) + قاب مطالعهٔ پاساژ + ردیف‌های سوال
// 🎨 تم‌محور — بدون رنگ ثابت
// ========================================

import type { IeltsPaperSection } from "@/types/ielts";
import QuestionRow from "./QuestionRow";
import { questionId, type OnPaperAnswer, type PaperAnswers, type QuestionPrefix } from "./paper-utils";

export default function SectionFrame({
  section,
  prefix,
  answers,
  onChange,
  disabled,
}: {
  section: IeltsPaperSection;
  prefix: QuestionPrefix;
  answers: PaperAnswers;
  onChange: OnPaperAnswer;
  disabled?: boolean;
}) {
  return (
    <section
      className="border border-neutral-400 dark:border-neutral-700 rounded-[2px] bg-white dark:bg-slate-900"
      aria-label={section.title}
    >
      {/* سربرگ رسمی بخش */}
      <header className="px-4 py-2.5 border-b-2 border-neutral-900 dark:border-neutral-100 flex items-center justify-between gap-2 flex-wrap bg-neutral-50 dark:bg-neutral-800/40">
        <h3 className="text-[13px] font-black tracking-wide text-neutral-900 dark:text-slate-100 uppercase">
          {section.title}
        </h3>
        {section.questionRange && (
          <span
            className="text-[10.5px] font-black text-neutral-800 dark:text-slate-200 border border-neutral-500 dark:border-neutral-600 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800"
            dir="ltr"
          >
            {section.questionRange}
          </span>
        )}
      </header>

      <div className="p-3.5 sm:p-5 space-y-4">
        {/* دستور رسمی بخش */}
        {section.instruction && (
          <p
            className="text-[11.5px] italic leading-6 text-neutral-700 dark:text-slate-300 border-l-[3px] border-neutral-400 dark:border-neutral-600 pl-3"
            dir="ltr"
          >
            {section.instruction}
          </p>
        )}

        {/* باکس گزینه‌های مشترک بخش (باکس تطبیق A–G) */}
        {section.optionsBox && section.optionsBox.length >= 2 && (
          <div className="border border-neutral-400 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/40 p-3.5" dir="ltr">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-neutral-500 dark:text-slate-400 mb-2">
              Boxed options
            </p>
            <div className="space-y-1">
              {section.optionsBox.map((opt) => (
                <div key={opt.letter} className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 shrink-0 border border-neutral-500 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-[10px] font-black flex items-center justify-center mt-0.5 text-neutral-900 dark:text-slate-100"
                    dir="ltr"
                  >
                    {opt.letter}
                  </span>
                  <span className="text-[12px] leading-6 text-neutral-800 dark:text-slate-200">
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* پاساژ ریدینگ — قاب مطالعه */}
        {section.passageBody && (
          <div
            className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 p-4 sm:p-5 max-h-[460px] overflow-y-auto"
            dir="ltr"
          >
            {section.passageTitle && (
              <p className="text-[13.5px] font-black text-neutral-900 dark:text-slate-100 mb-3 text-center tracking-wide">
                {section.passageTitle}
              </p>
            )}
            <p className="text-[12.5px] leading-7 text-neutral-800 dark:text-slate-200 text-justify whitespace-pre-line">
              {section.passageBody}
            </p>
          </div>
        )}

        {/* سوال‌ها — هر کدام در ردیف کادردار (فقط یک بار) */}
        <div className="space-y-2.5">
          {section.questions.map((q) => (
            <QuestionRow
              key={q.number}
              q={q}
              prefix={prefix}
              sectionBox={section.optionsBox}
              answer={answers[questionId(prefix, q.number)] ?? ""}
              onChange={onChange}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
