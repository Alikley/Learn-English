"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Lightbulb,
  Table2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  Layers,
} from "lucide-react";
import type { GrammarLesson } from "@/data/lessons/types";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../ContinueButton";
import ProgressStepper from "../ProgressStepper";

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
// ========================================

type Props = {
  lesson: GrammarLesson;
  onComplete: (score: number) => void;
  completing: boolean;
};

const STEPS = ["آموزش", "مثال‌ها", "اشتباهات رایج", "نکته‌های طلایی", "آزمونک"];

export default function GrammarView({ lesson, onComplete, completing }: Props) {
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
      <ProgressStepper sections={STEPS} currentIndex={step} />

      <AnimatePresence mode="wait">
        {/* ---------- گام ۱: آموزش مفهومی ---------- */}
        {step === 0 && (
          <motion.div
            key="teach"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* چرا این درس مهم است */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Lightbulb size={18} />
                </span>
                <h3 className="font-bold text-slate-900">چرا این درس مهم است؟</h3>
              </div>
              <p className="text-slate-600 text-sm leading-8">{lesson.intro}</p>
            </motion.div>

            {/* بخش‌های آموزشی عمیق */}
            {lesson.sections.map((sec, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + si * 0.1 }}
                className="bg-white border border-blue-100 rounded-2xl p-4 md:p-5 shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {si + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 leading-6">
                    {sec.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sec.paragraphs.map((p, pi) => (
                    <p
                      key={pi}
                      className="text-slate-700 text-sm leading-8 text-justify"
                    >
                      {p}
                    </p>
                  ))}
                </div>
                {sec.examples && sec.examples.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {sec.examples.map((ex, ei) => (
                      <motion.div
                        key={ei}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + si * 0.1 + ei * 0.08 }}
                        className="bg-blue-50/60 border border-blue-100 rounded-xl px-3.5 py-2.5"
                      >
                        <p
                          dir="ltr"
                          className="text-left text-slate-900 font-semibold text-sm leading-7"
                        >
                          <HoverableText text={ex.en} />
                        </p>
                        <p className="text-slate-400 text-xs mt-1 leading-6">
                          {ex.fa}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* قانون در یک نگاه — جعبه طلایی */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + lesson.sections.length * 0.1 }}
              className="bg-gradient-to-l from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 md:p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Star size={18} />
                </span>
                <h3 className="font-bold text-amber-900">قانون در یک نگاه</h3>
              </div>
              <p className="text-amber-950 text-sm leading-8 font-medium">
                {lesson.rule}
              </p>
            </motion.div>

            {/* جدول ساختار */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.28 + lesson.sections.length * 0.1,
              }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Table2 size={18} />
                </span>
                <h3 className="font-bold text-slate-900">جدول ساختار</h3>
              </div>
              <div className="space-y-2">
                {lesson.form.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.32 + lesson.sections.length * 0.1 + i * 0.08,
                    }}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-slate-50 rounded-xl px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-slate-500 sm:w-36 shrink-0">
                      {row.label}
                    </span>
                    <span
                      dir="ltr"
                      className="text-left text-sm font-mono text-blue-700 flex-1 break-words"
                    >
                      {row.pattern}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <ContinueButton onClick={() => setStep(1)} label="دیدن مثال‌ها" />
          </motion.div>
        )}

        {/* ---------- گام ۲: مثال‌ها ---------- */}
        {step === 1 && (
          <motion.div
            key="examples"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <BookOpen size={14} />
              {lesson.examples.length} مثال دوزبانه — هر مثال را بلند بخوانید
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
            <ContinueButton onClick={() => setStep(2)} label="اشتباهات رایج" />
          </motion.div>
        )}

        {/* ---------- گام ۳: اشتباهات رایج ---------- */}
        {step === 2 && (
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
            <ContinueButton onClick={() => setStep(3)} label="نکته‌های طلایی" />
          </motion.div>
        )}

        {/* ---------- گام ۴: نکته‌های طلایی ---------- */}
        {step === 3 && (
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
                <h3 className="font-bold text-slate-900">نکته‌های طلایی</h3>
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
            <ContinueButton onClick={() => setStep(4)} label="شروع آزمونک" />
          </motion.div>
        )}

        {/* ---------- گام ۵: آزمونک ---------- */}
        {step === 4 && currentQ && (
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
                  سؤال {qIndex + 1} از {quiz.length}
                </span>
                <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                  <Layers size={14} />
                  {correctCount} درست
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
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={`w-full text-right border-2 rounded-xl px-4 py-3 transition-all ${cls}`}
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
                onClick={nextQuestion}
                label={qIndex < quiz.length - 1 ? "سؤال بعدی" : "تکمیل درس"}
                loading={completing && qIndex === quiz.length - 1}
              />
            )}
          </motion.div>
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
            قبلی
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            بعدی
            <ArrowLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
