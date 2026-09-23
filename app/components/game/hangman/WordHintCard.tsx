"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_LABELS_EN, getGameLevel } from "@/types/game";
import type { HangmanWord } from "@/types/game";

// ========================================
// کارت راهنمای کلمهٔ هنگ‌من: راهنما + بج دسته + بج سطح + بج CEFR
// (از صفحهٔ هنگ‌من تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function WordHintCard({ currentWord }: { currentWord: HangmanWord }) {
  const { tr } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-100 rounded-xl p-3.5"
    >
      <p className="text-sm text-amber-800 flex items-center gap-2 flex-wrap">
        <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="font-medium">{tr("راهنما:", "Guide:")}</span>
        <span className="font-bold">{currentWord.hint}</span>
      </p>
      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
          {tr(
            CATEGORY_LABELS[currentWord.category] ?? currentWord.category,
            CATEGORY_LABELS_EN[currentWord.category] ?? currentWord.category
          )}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getGameLevel(currentWord.level).color}`}
        >
          {tr("سطح", "Level")} {tr(getGameLevel(currentWord.level).fa, getGameLevel(currentWord.level).en)}
        </span>
        {/* بج CEFR کلمه */}
        {currentWord.cefr && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold tracking-wide">
            {currentWord.cefr}
          </span>
        )}
      </div>
    </motion.div>
  );
}
