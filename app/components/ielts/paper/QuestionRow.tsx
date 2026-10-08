"use client";

// ========================================
// یک سوال — ردیف کادردار برگه (v1.0.4.2)
// ⚠️ شاخه‌های رندر «موزاییک‌نشدنی» هستند:
//    هر سوال دقیقاً یک بار رندر می‌شود (رفع باگ تکرار 1.0.0.2)
//    (الف) گزینه‌دار → متن/جای‌خالی + گزینه‌ها (چیپ یا دکمه)
//    (ب) جای‌خالی بدون گزینه → فقط خط نقطه‌چین
//    (ج) کوتاه بدون گزینه → متن + خط پاسخ
// ========================================

import type { IeltsPaperQuestion } from "@/types/ielts";
import QuestionGap from "./QuestionGap";
import { LetterChips, OptionButtons } from "./ChoiceChips";
import {
  hasOptions,
  questionId,
  sameLetterSet,
  type OnPaperAnswer,
  type PaperOption,
  type QuestionPrefix,
} from "./paper-utils";

export default function QuestionRow({
  q,
  prefix,
  sectionBox,
  answer,
  onChange,
  disabled,
}: {
  q: IeltsPaperQuestion;
  prefix: QuestionPrefix;
  /** باکس گزینه‌های مشترک بخش (اگر سوال همان حروف را دارد → فقط دایرهٔ حرف) */
  sectionBox?: PaperOption[];
  answer: string;
  onChange: OnPaperAnswer;
  disabled?: boolean;
}) {
  const id = questionId(prefix, q.number);
  const withOptions = hasOptions(q);
  const answered = answer.trim() !== "";
  // گروه باکسی؟ → متن گزینه تکرار نمی‌شود، فقط دایرهٔ حرف
  const useChips = withOptions && sameLetterSet(q.options, sectionBox);

  return (
    <div
      id={`q-${id}`}
      className="scroll-mt-40 flex border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 overflow-hidden rounded-[2px] transition-shadow hover:shadow-sm"
    >
      {/* شمارهٔ چاپی در حاشیهٔ ردیف */}
      <div className="w-10 sm:w-12 shrink-0 border-r border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 flex flex-col items-center pt-2 pb-1 gap-1.5">
        <span className="text-[13px] font-black text-neutral-900 dark:text-slate-100" dir="ltr">
          {q.number}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            answered ? "bg-neutral-900 dark:bg-neutral-100" : "bg-transparent"
          }`}
          aria-hidden
        />
      </div>

      {/* بدنهٔ سوال — دقیقاً یک ساختار بر اساس نوع */}
      <div className="flex-1 min-w-0 p-3 sm:p-3.5 space-y-2.5">
        {/* (الف) سوال با گزینه — متن (ساده یا جای‌خالی) + گزینه‌ها */}
        {withOptions && (
          <>
            {q.text && !q.inlineGap && (
              <p className="text-[13.5px] leading-7 text-neutral-800 dark:text-slate-200" dir="ltr">
                {q.text}
              </p>
            )}
            {q.inlineGap && (
              <QuestionGap
                text={q.text}
                value={answer}
                onChange={(v) => onChange(id, v)}
                disabled={disabled}
              />
            )}
            {useChips ? (
              <LetterChips
                options={q.options!}
                selected={answer}
                onPick={(v) => onChange(id, v)}
                disabled={disabled}
              />
            ) : (
              <OptionButtons
                options={q.options!}
                selected={answer}
                onPick={(v) => onChange(id, v)}
                disabled={disabled}
              />
            )}
          </>
        )}

        {/* (ب) سوال جای‌خالی بدون گزینه — فقط خط نقطه‌چین */}
        {!withOptions && q.inlineGap && (
          <QuestionGap
            text={q.text}
            value={answer}
            onChange={(v) => onChange(id, v)}
            disabled={disabled}
          />
        )}

        {/* (ج) سوال کوتاه بدون گزینه — متن + خط پاسخ */}
        {!withOptions && !q.inlineGap && q.text && (
          <>
            <p className="text-[13.5px] leading-7 text-neutral-800 dark:text-slate-200" dir="ltr">
              {q.text}
            </p>
            <div className="flex items-center gap-2.5 pt-0.5" dir="ltr">
              <span className="text-[9px] uppercase tracking-[0.18em] font-black text-neutral-400 dark:text-slate-500 shrink-0">
                Answer
              </span>
              <input
                dir="ltr"
                value={answer}
                onChange={(e) => onChange(id, e.target.value)}
                disabled={disabled}
                maxLength={120}
                placeholder="write your answer"
                aria-label="answer"
                className="flex-1 max-w-md px-1 bg-transparent border-b-[2px] border-dotted border-neutral-500 dark:border-neutral-500 text-[13px] font-bold text-neutral-900 dark:text-slate-100 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 placeholder:font-normal focus:border-solid focus:border-neutral-900 dark:focus:border-slate-200 disabled:opacity-50 transition"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
