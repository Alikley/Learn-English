"use client";

import { useMemo } from "react";
import { BookOpenText, CircleAlert } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsPaperQuestion, IeltsPaperSection } from "@/types/ielts";

// ========================================
// برگهٔ امتحان واقعی — از متن PDF کتاب (v1.0.3.6)
//
// جایگزین «پاسخ‌برگ» قدیمی: خودِ سوال‌ها (متن، گزینه‌ها،
// جای خالی‌ها) از PDF خوانده شده و مثل دفترچهٔ کاغذی آیلتس
// رندر می‌شوند — پاسخ‌ها درون خود برگه ثبت می‌شوند:
//   - چندگزینه‌ای: دکمه‌های حرف (A/B/C/D)
//   - جای خالی: ورودی درون‌خطی داخل جمله
//   - پاسخ کوتاه: ورودی کنار شمارهٔ سوال
// چیپ‌های شمارهٔ سوال بالای برگه = نقشهٔ پیشرفت + پرش.
// ========================================

function QuestionGap({
  text,
  value,
  onChange,
  disabled,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const parts = text.split("{GAP}");
  return (
    <p className="text-[13px] leading-8 text-slate-700 dark:text-slate-200" dir="ltr">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <input
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={120}
              placeholder="answer"
              className="mx-1 w-28 sm:w-36 px-2.5 py-1 rounded-lg text-[12px] font-bold text-center text-indigo-700 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-500/10 border-b-2 border-dotted border-indigo-400 dark:border-indigo-500 focus:outline-none focus:border-solid focus:ring-2 focus:ring-indigo-400/50 placeholder:text-indigo-300/60 dark:placeholder:text-indigo-400/40 disabled:opacity-60 transition"
            />
          )}
        </span>
      ))}
    </p>
  );
}

function QuestionRow({
  q,
  prefix,
  answer,
  onChange,
  disabled,
}: {
  q: IeltsPaperQuestion;
  prefix: "r" | "l";
  answer: string;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
}) {
  const questionId = `${prefix}${q.number}`;

  return (
    <div id={`q-${questionId}`} className="scroll-mt-36 space-y-1.5">
      {/* متن سوال (بدون گزینه و بدون جای خالی درون‌خطی) */}
      {q.text && !q.inlineGap && !q.options && (
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center" dir="ltr">
            {q.number}
          </span>
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <p className="flex-1 text-[13px] leading-7 text-slate-700 dark:text-slate-200" dir="ltr">
              {q.text}
            </p>
            <input
              dir="ltr"
              value={answer}
              onChange={(e) => onChange(questionId, e.target.value)}
              disabled={disabled}
              maxLength={120}
              placeholder="—"
              className="w-32 sm:w-40 shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-60 transition"
            />
          </div>
        </div>
      )}

      {/* جمله با جای خالی درون‌خطی */}
      {q.inlineGap && (
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center" dir="ltr">
            {q.number}
          </span>
          <div className="flex-1 min-w-0 pt-1">
            <QuestionGap
              text={q.text}
              value={answer}
              onChange={(v) => onChange(questionId, v)}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* چندگزینه‌ای — دکمه‌های حرف */}
      {q.options && q.options.length >= 2 && (
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center" dir="ltr">
            {q.number}
          </span>
          <div className="flex-1 min-w-0 space-y-1.5">
            {q.text && !q.inlineGap && (
              <p className="text-[13px] leading-7 text-slate-700 dark:text-slate-200" dir="ltr">
                {q.text.replace(/\s*\{GAP\}\s*/g, " ______ ")}
              </p>
            )}
            {q.inlineGap && (
              <QuestionGap
                text={q.text}
                value={answer}
                onChange={(v) => onChange(questionId, v)}
                disabled={disabled}
              />
            )}
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt) => {
                const selected = answer.trim().toUpperCase() === opt.letter;
                return (
                  <button
                    key={opt.letter}
                    onClick={() => onChange(questionId, selected ? "" : opt.letter)}
                    disabled={disabled}
                    title={opt.text}
                    className={`
                      flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition active:scale-[0.98] disabled:opacity-60
                      ${
                        selected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                      }
                    `}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded-md text-[10px] font-black flex items-center justify-center ${
                        selected ? "bg-white/20 text-white" : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                      }`}
                      dir="ltr"
                    >
                      {opt.letter}
                    </span>
                    <span className="text-[11px] leading-5 line-clamp-2 max-w-[220px]" dir="ltr">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPaper({
  skill,
  sections,
  totalQuestions,
  answers,
  onChange,
  disabled,
}: {
  skill: "reading" | "listening";
  sections: IeltsPaperSection[];
  totalQuestions: number;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
}) {
  const { tr } = useLanguage();
  const prefix = skill === "reading" ? "r" : "l";

  const ids = useMemo(
    () => Array.from({ length: totalQuestions }, (_, i) => `${prefix}${i + 1}`),
    [prefix, totalQuestions],
  );
  const answered = useMemo(
    () => ids.filter((id) => (answers[id] ?? "").trim() !== "").length,
    [ids, answers],
  );

  return (
    <div className="space-y-4">
      {/* ---------- نقشهٔ سوال‌ها (چیپ‌های پیشرفت) ---------- */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <BookOpenText size={13} className="text-indigo-500" />
            {tr("برگهٔ امتحان — از متن PDF کتاب", "Exam paper — from the book PDF")}
          </p>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">
            {answered}/{totalQuestions}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id, i) => {
            const filled = (answers[id] ?? "").trim() !== "";
            return (
              <a
                key={id}
                href={`#q-${id}`}
                title={tr(`سوال ${i + 1}`, `Question ${i + 1}`)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition ${
                  filled
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {i + 1}
              </a>
            );
          })}
        </div>
      </div>

      {/* ---------- بخش‌های برگه ---------- */}
      {sections.map((section, si) => (
        <div
          key={`${section.title}-${si}`}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden"
        >
          {/* سربرگ بخش */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[12px] font-black text-slate-700 dark:text-slate-200" dir="ltr">
              {section.title}
            </p>
            {section.questionRange && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 rounded-full px-2.5 py-1" dir="ltr">
                {section.questionRange}
              </span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* راهنمای رسمی بخش */}
            {section.instruction && (
              <p className="text-[11px] italic leading-6 text-slate-500 dark:text-slate-400 border-s-2 border-slate-200 dark:border-slate-700 ps-3" dir="ltr">
                {section.instruction}
              </p>
            )}

            {/* پاساژ ریدینگ */}
            {section.passageBody && (
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 p-4 max-h-72 overflow-y-auto">
                {section.passageTitle && (
                  <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 mb-2 text-center" dir="ltr">
                    {section.passageTitle}
                  </p>
                )}
                <p className="text-[12px] leading-7 text-slate-600 dark:text-slate-300 text-justify" dir="ltr">
                  {section.passageBody}
                </p>
              </div>
            )}

            {/* سوال‌ها */}
            <div className="space-y-3.5">
              {section.questions.map((q) => (
                <QuestionRow
                  key={q.number}
                  q={q}
                  prefix={prefix}
                  answer={answers[`${prefix}${q.number}`] ?? ""}
                  onChange={onChange}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <CircleAlert size={15} />
          {tr("بخشی از PDF خوانده نشد", "No section parsed from the PDF")}
        </div>
      )}
    </div>
  );
}
