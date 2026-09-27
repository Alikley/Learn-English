"use client";

import { useState } from "react";
import { Check, Eye, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import type {
  IeltsClientGroup,
  IeltsClientQuestion,
} from "@/types/ielts";

// ========================================
// نمایش یک گروه سوال آیلتس (v1.0.3.2)
// همهٔ انواع سوال: چهارگزینه‌ای، درست/غلط/گفته‌نشده، تطبیق عنوان/اطلاعات/
// ویژگی، تکمیل جمله/خلاصه/یادداشت/جدول/فرم، پاسخ کوتاه
// حالت تمرین: دکمهٔ «پاسخ» برای نمایش پاسخ صحیح + تحلیل
// ========================================

function letterClass(active: boolean): string {
  return active
    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500";
}

/** دکمه‌های گزینه‌ای (MCQ / TRUE-FALSE / تطبیق حروف) */
function OptionButtons({
  question,
  group,
  value,
  onChange,
}: {
  question: IeltsClientQuestion;
  group: IeltsClientGroup;
  value: string;
  onChange: (v: string) => void;
}) {
  const options =
    question.options ??
    group.options ?? [
      { label: "A", text: "A" },
      { label: "B", text: "B" },
      { label: "C", text: "C" },
      { label: "D", text: "D" },
    ];
  const isTfng = group.type === "tfng" || group.type === "ynng";
  // انواع تطبیق: متن کامل گزینه‌ها در بانک بالای گروه هست — دکمه‌ها فقط برچسب
  const isMatchCompact =
    group.type === "match-headings" || group.type === "match-info" || group.type === "match-features";
  return (
    <div className={`flex flex-wrap gap-2 ${isTfng || isMatchCompact ? "" : "flex-col"}`}>
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.label)}
          className={`
            ${
              isTfng || isMatchCompact
                ? `px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${opt.label.length > 4 ? "max-w-56 truncate" : ""}`
                : "flex items-center gap-2.5 w-fit px-3 py-2 rounded-xl border transition text-start"
            }
            ${letterClass(value === opt.label)}
          `}
        >
          {!isTfng && !isMatchCompact && (
            <span
              className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                value === opt.label ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"
              }`}
            >
              {opt.label}
            </span>
          )}
          <span className={group.type === "mcq" ? "text-sm" : "text-xs"}>
            {isMatchCompact && opt.label.length <= 4 ? opt.label : isMatchCompact ? opt.label : opt.text}
          </span>
        </button>
      ))}
    </div>
  );
}

/** ورودی متنی جای خالی (تکمیل‌ها و پاسخ کوتاه) */
function GapInput({
  question,
  value,
  onChange,
}: {
  question: IeltsClientQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      dir="ltr"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Q${question.number}`}
      maxLength={120}
      className="w-32 sm:w-40 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
    />
  );
}

/** یک سوال به‌همراه شماره و دکمهٔ پاسخ (تمرین) */
function QuestionItem({
  question,
  group,
  value,
  onChange,
  practice,
}: {
  question: IeltsClientQuestion;
  group: IeltsClientGroup;
  value: string;
  onChange: (v: string) => void;
  practice: boolean;
}) {
  const { tr } = useLanguage();
  const [revealed, setRevealed] = useState(false);

  const isGapType =
    group.type === "sentence-completion" ||
    group.type === "summary-completion" ||
    group.type === "note-completion" ||
    group.type === "table-completion" ||
    group.type === "form-completion" ||
    group.type === "flow-completion" ||
    group.type === "short-answer";

  const hasOptions =
    group.type === "mcq" ||
    group.type === "tfng" ||
    group.type === "ynng" ||
    group.type === "match-headings" ||
    group.type === "match-info" ||
    group.type === "match-features";

  return (
    <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
          {question.number}
        </span>
        <div className="flex-1 min-w-0 space-y-2" dir="ltr">
          {/* صورت سوال / گزاره */}
          {question.text && (
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
              {question.text}
            </p>
          )}
          {/* بافت جای خالی درون جمله */}
          {isGapType && (question.before || question.after) && (
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-loose">
              {question.before}{" "}
              <span className="inline-flex items-center gap-1 align-middle">
                <GapInput question={question} value={value} onChange={onChange} />
              </span>{" "}
              {question.after}
            </p>
          )}
          {/* گزینه‌ها */}
          {hasOptions && (
            <OptionButtons question={question} group={group} value={value} onChange={onChange} />
          )}
          {!isGapType && !hasOptions && !question.text && (
            <GapInput question={question} value={value} onChange={onChange} />
          )}

          {/* پاسخ و تحلیل — فقط حالت تمرین */}
          {practice && question.answerDisplay && (
            <div>
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Eye size={12} />
                {revealed ? tr("پنهان کردن پاسخ", "Hide answer") : tr("نمایش پاسخ", "Show answer")}
              </button>
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-2.5 space-y-1">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Check size={13} />
                        {tr("پاسخ صحیح:", "Correct answer:")} {question.answerDisplay}
                      </p>
                      {question.explanation && (
                        <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 leading-relaxed">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** رندر گروه کامل */
export default function QuestionGroupView({
  group,
  answers,
  onAnswer,
  practice,
}: {
  group: IeltsClientGroup;
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  practice: boolean;
}) {
  const { tr } = useLanguage();
  return (
    <section className="rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4">
      {/* دستور گروه */}
      <div className="flex items-center gap-2 mb-1" dir="ltr">
        <span className="h-5 px-2.5 rounded-md bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-bold flex items-center">
          {group.heading}
        </span>
        {group.wordLimit && (
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
            {group.wordLimit}
          </span>
        )}
      </div>
      <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2" dir="ltr">
        {group.instruction}
      </p>

      {/* بانک گزینه‌های مشترک (عنوان‌های i-x یا ویژگی‌ها یا گزینه‌های A-H) */}
      {group.options &&
        (group.type === "match-headings" || group.type === "match-features" || group.type === "match-info") && (
          <div
            className="mb-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3 space-y-1.5"
            dir="ltr"
          >
            {group.type === "match-info" ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info size={12} />
                Paragraphs: {group.options.map((o) => o.label).join(" · ")}
              </p>
            ) : (
              group.options.map((o) => (
                <p key={o.label} className="text-xs text-slate-600 dark:text-slate-300 flex gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{o.label}</span>
                  <span>{o.text}</span>
                </p>
              ))
            )}
          </div>
        )}

      {/* زمینهٔ خلاصه (خطوط با جای خالی) */}
      {group.lines && (
        <div
          className="mb-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4 text-sm text-slate-800 dark:text-slate-100 leading-loose"
          dir="ltr"
        >
          {group.lines.map((line, i) =>
            typeof line === "string" ? (
              <span key={i}>{line} </span>
            ) : (
              (() => {
                const q = group.questions.find((x) => x.id === line.gap);
                if (!q) return null;
                return (
                  <span key={i} className="inline-flex items-center gap-1 mx-0.5 align-middle">
                    <span className="text-[10px] font-bold text-blue-500">{q.number}</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => onAnswer(q.id, e.target.value)}
                      maxLength={120}
                      className="w-28 sm:w-36 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                    />
                  </span>
                );
              })()
            ),
          )}
        </div>
      )}

      {/* زمینهٔ جدول (فرم/یادداشت/جدول با جای خالی) */}
      {group.table && (
        <div
          className="mb-3 overflow-x-auto rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700"
          dir="ltr"
        >
          <table className="w-full text-sm">
            <tbody>
              {group.table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                  {row.map((cell, ci) =>
                    typeof cell === "string" ? (
                      <td
                        key={ci}
                        className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ) : (
                      (() => {
                        const q = group.questions.find((x) => x.id === cell.gap);
                        if (!q) return <td key={ci} />;
                        return (
                          <td key={ci} className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-blue-500">{q.number}</span>
                              <input
                                type="text"
                                dir="ltr"
                                value={answers[q.id] ?? ""}
                                onChange={(e) => onAnswer(q.id, e.target.value)}
                                maxLength={120}
                                className="w-28 sm:w-36 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                              />
                            </span>
                          </td>
                        );
                      })()
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* سوال‌هایی که در lines/table رندر نشدند (mcq/tfng/...) */}
      <div>
        {group.questions.map((q) => {
          const renderedInContext =
            (group.lines || group.table) &&
            (group.type === "summary-completion" ||
              group.type === "note-completion" ||
              group.type === "table-completion" ||
              group.type === "form-completion");
          if (renderedInContext) {
            // در گروه‌های جدولی هر سوال جداگانه رندر نمی‌شود — فقط تحلیل تمرین
            return practice && q.answerDisplay ? (
              <div key={q.id} className="hidden" />
            ) : null;
          }
          return (
            <QuestionItem
              key={q.id}
              question={q}
              group={group}
              value={answers[q.id] ?? ""}
              onChange={(v) => onAnswer(q.id, v)}
              practice={practice}
            />
          );
        })}
      </div>

      {/* کلید جدول در حالت تمرین — دکمه‌های کشویی زیر جدول */}
      {practice && (group.lines || group.table) && (
        <details className="mt-2 group">
          <summary className="cursor-pointer text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 w-fit">
            <Eye size={12} />
            {tr("نمایش پاسخ‌ها", "Show answers")}
          </summary>
          <div className="mt-2 grid gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3" dir="ltr">
            {group.questions.map((q) => (
              <p key={q.id} className="text-[11px] text-emerald-700 dark:text-emerald-300 flex gap-2">
                <span className="font-bold shrink-0">{q.number}.</span>
                <span>
                  <b>{q.answerDisplay}</b>
                  {q.explanation ? ` — ${q.explanation}` : ""}
                </span>
              </p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
