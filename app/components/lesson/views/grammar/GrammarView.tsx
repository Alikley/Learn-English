"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { GrammarLesson } from "@/data/lessons/types";
import ProgressStepper from "../../ProgressStepper";
import GrammarTeachStep from "./GrammarTeachStep";
import {
  GrammarExamplesStep,
  GrammarMistakesStep,
  GrammarTipsStep,
} from "./GrammarSteps";
import GrammarQuizStep from "./GrammarQuizStep";

// ========================================
// نمای درس گرامر — v1.0.1.3 (بازطراحی کامل)
//
// طبق بازخورد کاربر، درس‌های خیلی مختصر
// جای خود را به آموزش مفهومی و عمیق داده‌اند:
//  گام ۱: چرا مهم است + بخش‌های آموزشی عمیق
//         (هر بخش: تیتر + پاراگراف‌های مفهومی
//          + مثال‌های اختصاصی) + قانون در یک
//         نگاه + جدول ساختار
//  گام ۲: مثال‌های متعدد
//  گام ۳: اشتباهات رایج
//  گام ۴: نکته‌های طلایی
//  گام ۵: آزمونک
//
// v1.0.2.7 — ریفکتوری: هر گام به کامپوننت خودش
// در همین فولدر تفکیک شد.
// ========================================

type Props = {
  lesson: GrammarLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS: [string, string][] = [
  ["آموزش", "Tutorial"],
  ["مثال‌ها", "Examples"],
  ["اشتباهات رایج", "Common Mistakes"],
  ["نکته‌های طلایی", "Golden Tips"],
  ["آزمونک", "Quiz"],
];

export default function GrammarView({ lesson, onComplete, completing }: Props) {
  const { tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const quiz = lesson.quiz;
  const currentQ = quiz[qIndex];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === currentQ.correctIndex) setCorrectCount((c) => c + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    if (qIndex < quiz.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      const score = Math.round((correctCount / quiz.length) * 100);
      onComplete(score);
    }
  };

  return (
    <div className="space-y-4">
      <ProgressStepper sections={STEPS.map(([fa, en]) => tr(fa, en))} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: آموزش مفهومی ---------- */}
        {step === 0 && <GrammarTeachStep lesson={lesson} onNext={() => setStep(1)} />}

        {/* ---------- گام ۲: مثال‌ها ---------- */}
        {step === 1 && (
          <GrammarExamplesStep lesson={lesson} onNext={() => setStep(2)} />
        )}

        {/* ---------- گام ۳: اشتباهات رایج ---------- */}
        {step === 2 && (
          <GrammarMistakesStep lesson={lesson} onNext={() => setStep(3)} />
        )}

        {/* ---------- گام ۴: نکته‌های طلایی ---------- */}
        {step === 3 && (
          <GrammarTipsStep lesson={lesson} onNext={() => setStep(4)} />
        )}

        {/* ---------- گام ۵: آزمونک ---------- */}
        {step === 4 && (
          <GrammarQuizStep
            lesson={lesson}
            qIndex={qIndex}
            selected={selected}
            correctCount={correctCount}
            completing={completing}
            onSelect={handleSelect}
            onNext={nextQuestion}
          />
        )}
      </AnimatePresence>

      {/* ناوبری بین گام‌ها */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
          >
            <ArrowRight size={16} />
            {tr("قبلی", "Previous")}
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {tr("بعدی", "Next")}
            <ArrowLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
