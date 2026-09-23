"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { BookOpen, XCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { GrammarLesson } from "@/data/lessons/types";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../../ContinueButton";

// ========================================
// گام ۲ (مثال‌های دوزبانه)، گام ۳ (اشتباهات رایج)
// و گام ۴ (نکته‌های طلایی) درس گرامر
// (از GrammarView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export function GrammarExamplesStep({
  lesson,
  onNext,
}: {
  lesson: GrammarLesson;
  onNext: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <motion.div
      key="examples"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
        <BookOpen size={14} />
        {lesson.examples.length} {tr("مثال دوزبانه — هر مثال را بلند بخوانید", "bilingual examples — read each one out loud")}
      </div>
      <div className="space-y-3">
        {lesson.examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.1, 0.8) }}
            className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold text-blue-300 bg-blue-50 rounded-full px-2 py-0.5 shrink-0 mt-1">
                {i + 1}
              </span>
              <div className="flex-1">
                <p
                  dir="ltr"
                  className="text-left text-slate-900 font-semibold text-base leading-7"
                >
                  <HoverableText text={ex.en} />
                </p>
                <p className="text-slate-400 text-xs mt-1.5 leading-6 border-t border-dashed border-slate-100 pt-1.5">
                  {ex.fa}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <ContinueButton onClick={onNext} label={tr("اشتباهات رایج", "Common Mistakes")} />
    </motion.div>
  );
}

export function GrammarMistakesStep({
  lesson,
  onNext,
}: {
  lesson: GrammarLesson;
  onNext: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <motion.div
      key="mistakes"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        {lesson.mistakes.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2"
          >
            <div className="flex items-center gap-2" dir="ltr">
              <XCircle size={18} className="text-red-400 shrink-0" />
              <span className="text-red-400 line-through decoration-red-300 text-sm">
                {m.wrong}
              </span>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <span className="text-green-700 font-semibold text-sm">
                {m.right}
              </span>
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 leading-6">
              {m.note}
            </p>
          </motion.div>
        ))}
      </div>
      <ContinueButton onClick={onNext} label={tr("نکته‌های طلایی", "Golden Tips")} />
    </motion.div>
  );
}

export function GrammarTipsStep({
  lesson,
  onNext,
}: {
  lesson: GrammarLesson;
  onNext: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <motion.div
      key="tips"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border border-amber-100 rounded-2xl p-4 md:p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sparkles size={18} />
          </span>
          <h3 className="font-bold text-slate-900">{tr("نکته‌های طلایی", "Golden Tips")}</h3>
        </div>
        {lesson.tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
            className="flex items-start gap-3 bg-gradient-to-l from-amber-50/80 to-yellow-50/50 border border-amber-100 rounded-xl px-3.5 py-3"
          >
            <span className="w-6 h-6 rounded-full bg-amber-400/90 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-slate-700 text-sm leading-7">{tip}</p>
          </motion.div>
        ))}
      </motion.div>
      <ContinueButton onClick={onNext} label={tr("شروع آزمونک", "Start Quiz")} />
    </motion.div>
  );
}
