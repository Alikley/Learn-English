"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { motion, AnimatePresence } from "motion/react";
import { BookOpen, TextQuote, Lightbulb } from "lucide-react";
import type { SpeedQuizQuestion } from "@/types/game";
import type { SpeedQuizFeedback } from "@/app/hook/game/useSpeedQuizGame";
import { SPEEDQUIZ_CATEGORY_LABELS } from "@/data/speedquiz/questions";
import QuizResultBanner from "./QuizResultBanner";
import QuizBadges from "./QuizBadges";
import BlankSentence from "./BlankSentence";

// ========================================
// کارت سوال کوییز سرعتی — با انیمیشن جذاب:
// ورود فنری هر سوال + بج نوع/سطح + جای خالی متحرک در جمله‌ها
// + نمایش معنی بعد از پاسخ + بنر نتیجه (درست/غلط/وقت تمام)
// v1.0.2.7 — ریفکتوری: QuizResultBanner + QuizBadges + BlankSentence
// به فایل‌های خودشان در همین فولدر تفکیک شدند.
// ========================================

export default function SpeedQuizQuestionCard({
  question,
  feedback,
}: {
  question: SpeedQuizQuestion;
  feedback: SpeedQuizFeedback | null;
}) {
  const { tr } = useLanguage();
  const isWord = question.type === "WORD";
  const TypeIcon = isWord ? BookOpen : TextQuote;
  const typeLabel = isWord ? tr("کلمه", "Word") : tr("جمله", "Sentence");
  const categoryLabel =
    SPEEDQUIZ_CATEGORY_LABELS[question.category] ?? question.category;

  // ---- جمله را دور جای خالی تکه می‌کنیم ----
  const parts = question.prompt.split("___");
  const blankWord = feedback ? question.options[question.correctIndex] : null;

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col items-center text-center">
      {/* ---- بج‌ها: نوع سوال + سطح CEFR + دسته ---- */}
      <QuizBadges
        isWord={isWord}
        typeIcon={TypeIcon}
        typeLabel={typeLabel}
        cefr={question.cefr}
        categoryLabel={categoryLabel}
      />

      {/* ---- خود سوال ---- */}
      {isWord ? (
        /* کلمه انگلیسی — بزرگ و پرانرژی */
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 20 }}
          className="select-none"
          dir="ltr"
        >
          <span className="text-3xl md:text-5xl font-black text-slate-800 tracking-wide break-words">
            {question.prompt}
          </span>
        </motion.div>
      ) : (
        /* جمله با جای خالی متحرک */
        <BlankSentence
          parts={parts}
          blankWord={blankWord}
          answeredCorrectly={Boolean(feedback?.correct)}
        />
      )}

      {/* ---- معنی/ترجمه — فقط بعد از پاسخ ---- */}
      <AnimatePresence>
        {feedback && question.translation && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-xs md:text-sm max-w-md leading-5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{question.translation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- بنر نتیجه ---- */}
      <div className="mt-2 md:mt-3 min-h-[2.25rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {feedback && <QuizResultBanner key="banner" feedback={feedback} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
