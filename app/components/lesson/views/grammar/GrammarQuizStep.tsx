"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Layers } from "lucide-react";
import type { GrammarLesson } from "@/data/lessons/types";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../../ContinueButton";

// ========================================
// گام ۵: آزمونک گرامر — سؤال با بازخورد فوری
// (از GrammarView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function GrammarQuizStep({
  lesson,
  qIndex,
  selected,
  correctCount,
  completing,
  onSelect,
  onNext,
}: {
  lesson: GrammarLesson;
  qIndex: number;
  selected: number | null;
  correctCount: number;
  completing: boolean;
  onSelect: (i: number) => void;
  onNext: () => void;
}) {
  const { tr } = useLanguage();
  const quiz = lesson.quiz;
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
      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-3 py-1">
            {tr("سؤال", "Question")} {qIndex + 1} {tr("از", "of")} {quiz.length}
          </span>
          <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
            <Layers size={14} />
            {correctCount} {tr("درست", "correct")}
          </span>
        </div>
        <p className="font-semibold text-slate-900 mb-4 leading-7">
          <HoverableText text={currentQ.question} />
        </p>
        <div className="space-y-2">
          {currentQ.options.map((opt, i) => {
            const isCorrect = i === currentQ.correctIndex;
            const isSelected = i === selected;
            let cls =
              "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50";
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
                <span className="flex items-center gap-2">
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
                  {selected !== null && isCorrect && (
                    <CheckCircle2 size={18} className="text-green-500" />
                  )}
                  {selected !== null && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-red-400" />
                  )}
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
              <p className="mt-3 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 leading-6">
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
    </motion.div>
  );
}
