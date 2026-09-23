"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import type { GrammarQuestion } from "@/types/training";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// کارت سؤال کوییز گرامری: بج نوع + بهترین ستاره‌ها + سؤال
// + گزینه‌های MCQ/ERROR + جای خالی FILL + بازخورد
// (از صفحهٔ [setId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function GrammarQuizCard({
  question,
  selected,
  fillValue,
  answered,
  wasCorrect,
  bestStars,
  onSelect,
  onFillChange,
  onFillSubmit,
}: {
  question: GrammarQuestion;
  selected: string | null;
  fillValue: string;
  answered: boolean;
  wasCorrect: boolean;
  bestStars: number;
  onSelect: (option: string) => void;
  onFillChange: (v: string) => void;
  onFillSubmit: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="min-h-[24rem] bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7">
      {/* نوع سؤال */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            question.type === "MCQ"
              ? "bg-blue-50 text-blue-600"
              : question.type === "FILL"
                ? "bg-violet-50 text-violet-600"
                : "bg-rose-50 text-rose-600"
          }`}
        >
          {question.type === "MCQ"
            ? tr("چهارگزینه‌ای", "Multiple Choice")
            : question.type === "FILL"
              ? tr("جای خالی", "Fill in the Blank")
              : tr("جمله صحیح", "Correct Sentence")}
        </span>
        {bestStars > 0 && (
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < bestStars
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200 fill-slate-200"
                }`}
              />
            ))}
          </span>
        )}
      </div>

      <h2 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed mb-6">
        <HoverableText text={question.question} />
      </h2>

      {/* گزینه‌های MCQ / ERROR */}
      {(question.type === "MCQ" || question.type === "ERROR") && (
        <div
          className={`grid gap-3 ${
            question.type === "ERROR" ? "grid-cols-1" : "grid-cols-1"
          }`}
        >
          {question.options.map((option, i) => {
            const isSelected = selected === option;
            const isAnswer = option === question.answer;
            let cls =
              "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50";
            if (answered) {
              if (isAnswer)
                cls = "border-green-400 bg-green-50 text-green-700";
              else if (isSelected)
                cls = "border-red-400 bg-red-50 text-red-700";
              else cls = "border-slate-100 bg-slate-50 text-slate-400";
            } else if (isSelected) {
              cls = "border-blue-500 bg-blue-50";
            }
            return (
              <button
                key={i}
                onClick={() => onSelect(option)}
                disabled={answered}
                dir="ltr"
                className={`text-start flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm md:text-base font-medium ${cls} ${
                  answered ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                    answered && isAnswer
                      ? "bg-green-500 text-white"
                      : answered && isSelected
                        ? "bg-red-500 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-left leading-relaxed">
                  <HoverableText text={option} />
                </span>
                {answered && isAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                )}
                {answered && isSelected && !isAnswer && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* جای خالی FILL */}
      {question.type === "FILL" && (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={fillValue}
              onChange={(e) => onFillChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onFillSubmit();
              }}
              disabled={answered}
              dir="ltr"
              autoFocus
              placeholder={tr("جواب را اینجا بنویس...", "Type your answer here...")}
              className={`flex-1 min-w-[12rem] px-4 py-3 border-2 rounded-xl text-base font-medium outline-none transition-all text-center ${
                answered
                  ? wasCorrect
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-red-400 bg-red-50 text-red-700"
                  : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {!answered && (
              <button
                onClick={onFillSubmit}
                disabled={!fillValue.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
              >
                {tr("بررسی", "Check")}
              </button>
            )}
          </div>
          {answered && !wasCorrect && (
            <p className="mt-3 text-sm text-green-600 font-bold" dir="ltr">
              ✓ {question.answer}
            </p>
          )}
        </div>
      )}

      {/* بازخورد و توضیح */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-xl border p-4 ${
              wasCorrect
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <p
              className={`text-sm font-bold mb-2 flex items-center gap-2 ${
                wasCorrect ? "text-green-700" : "text-amber-700"
              }`}
            >
              {wasCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {tr("آفرین! درست جواب دادی", "Well done! Correct answer")}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  {tr("نادرست — جواب درست مشخص شد", "Incorrect — the correct answer is shown")}
                </>
              )}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
