"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import ContinueButton from "../../ContinueButton";

// ========================================
// آزمونک مکالمه — سؤال‌های چهارگزینه‌ای با توضیح
// (از ConversationView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export default function ConversationQuiz({
  quiz,
  qIndex,
  selected,
  correctCount,
  completing,
  onSelect,
  onNext,
  onBack,
}: {
  quiz: QuizQuestion[];
  qIndex: number;
  selected: number | null;
  correctCount: number;
  completing: boolean;
  onSelect: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { tr } = useLanguage();
  const currentQ = quiz[qIndex];
  if (!currentQ) return null;

  return (
    <motion.div
      key={`quiz-${qIndex}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 rounded-full px-3 py-1">
            {tr("سؤال", "Question")} {qIndex + 1} {tr("از", "of")} {quiz.length}
          </span>
          <span className="text-xs text-green-600 font-bold">
            {correctCount} {tr("درست", "correct")}
          </span>
        </div>
        <p className="font-semibold text-slate-900 mb-4 leading-7">
          {currentQ.question}
        </p>
        <div className="space-y-2">
          {currentQ.options.map((opt, i) => {
            const isCorrect = i === currentQ.correctIndex;
            const isSelected = i === selected;
            let cls =
              "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50";
            if (selected !== null) {
              if (isCorrect) cls = "border-green-400 bg-green-50";
              else if (isSelected) cls = "border-red-300 bg-red-50";
              else cls = "border-slate-100 bg-white opacity-60";
            }
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                animate={
                  selected !== null && isSelected && !isCorrect
                    ? { x: [0, -6, 6, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                onClick={() => onSelect(i)}
                disabled={selected !== null}
                className={`w-full text-start border-2 rounded-xl px-4 py-3 transition-all ${cls}`}
              >
                <span
                  dir={/[a-zA-Z]/.test(opt) ? "ltr" : "rtl"}
                  className={
                    /[a-zA-Z]/.test(opt)
                      ? "block text-left flex-1 text-slate-800 text-sm"
                      : "flex-1 text-slate-800 text-sm"
                  }
                >
                  {opt}
                </span>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-xs text-slate-600 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 leading-6">
                {currentQ.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {selected !== null && (
        <ContinueButton
          onClick={onNext}
          label={qIndex < quiz.length - 1 ? tr("سؤال بعدی", "Next Question") : tr("تکمیل درس", "Finish Lesson")}
          loading={completing && qIndex === quiz.length - 1}
        />
      )}
      {qIndex === 0 && selected === null && (
        <button
          onClick={onBack}
          className="w-full text-center text-xs text-slate-400 hover:text-teal-600 font-medium"
        >
          <RotateCcw size={12} className="inline mr-1" />
          {tr("بازگشت به مکالمه", "Back to Conversation")}
        </button>
      )}
    </motion.div>
  );
}
