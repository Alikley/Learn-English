"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Lightbulb, Table2, Star } from "lucide-react";
import type { GrammarLesson } from "@/data/lessons/types";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import ContinueButton from "../../ContinueButton";

// ========================================
// گام ۱: آموزش مفهومی — چرا مهم است + بخش‌های عمیق
// + قانون در یک نگاه + جدول ساختار
// (از GrammarView تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function GrammarTeachStep({
  lesson,
  onNext,
}: {
  lesson: GrammarLesson;
  onNext: () => void;
}) {
  const { tr } = useLanguage();

  return (
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
          <h3 className="font-bold text-slate-900">{tr("چرا این درس مهم است؟", "Why is this lesson important?")}</h3>
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
          <h3 className="font-bold text-amber-900">{tr("قانون در یک نگاه", "The Rule at a Glance")}</h3>
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
          <h3 className="font-bold text-slate-900">{tr("جدول ساختار", "Structure Table")}</h3>
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

      <ContinueButton onClick={onNext} label={tr("دیدن مثال‌ها", "See Examples")} />
    </motion.div>
  );
}
