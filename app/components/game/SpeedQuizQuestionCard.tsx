"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  TextQuote,
  CheckCircle2,
  XCircle,
  AlarmClock,
  Lightbulb,
} from "lucide-react";
import type { SpeedQuizQuestion } from "@/types/game";
import type { SpeedQuizFeedback } from "@/app/hook/useSpeedQuizGame";
import { SPEEDQUIZ_CATEGORY_LABELS } from "@/data/speedquiz/questions";

// ========================================
// کارت سوال کوییز سرعتی — با انیمیشن جذاب:
// ورود فنری هر سوال + بج نوع/سطح + جای خالی متحرک در جمله‌ها
// + نمایش معنی بعد از پاسخ + بنر نتیجه (درست/غلط/وقت تمام)
// ========================================

function ResultBanner({ feedback }: { feedback: SpeedQuizFeedback }) {
  if (feedback.correct) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-extrabold"
      >
        <CheckCircle2 className="w-4.5 h-4.5" />
        عالی بود! +{feedback.gained} امتیاز
      </motion.div>
    );
  }
  if (feedback.timeout) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-sm font-extrabold"
      >
        <AlarmClock className="w-4.5 h-4.5" />
        وقت تمام شد!
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-500 text-sm font-extrabold"
    >
      <XCircle className="w-4.5 h-4.5" />
      اشتباه بود — یک جان کم شد
    </motion.div>
  );
}

export default function SpeedQuizQuestionCard({
  question,
  feedback,
}: {
  question: SpeedQuizQuestion;
  feedback: SpeedQuizFeedback | null;
}) {
  const isWord = question.type === "WORD";
  const TypeIcon = isWord ? BookOpen : TextQuote;
  const typeLabel = isWord ? "کلمه" : "جمله";
  const categoryLabel =
    SPEEDQUIZ_CATEGORY_LABELS[question.category] ?? question.category;

  // ---- جمله را دور جای خالی تکه می‌کنیم ----
  const parts = question.prompt.split("___");
  const blankWord = feedback ? question.options[question.correctIndex] : null;

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col items-center text-center">
      {/* ---- بج‌ها: نوع سوال + سطح CEFR + دسته ---- */}
      <div className="flex items-center gap-2 flex-wrap justify-center mb-3 md:mb-4">
        <motion.span
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 16 }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
            isWord
              ? "bg-sky-50 border border-sky-200 text-sky-600"
              : "bg-violet-50 border border-violet-200 text-violet-600"
          }`}
        >
          <TypeIcon className="w-3.5 h-3.5" />
          {typeLabel}
        </motion.span>
        {question.cefr && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.06, type: "spring", stiffness: 350 }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-white font-bold tracking-wide"
          >
            {question.cefr}
          </motion.span>
        )}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 350 }}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold"
        >
          {categoryLabel}
        </motion.span>
      </div>

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
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 20 }}
          className="max-w-xl leading-relaxed"
          dir="ltr"
        >
          <span className="text-lg md:text-2xl font-bold text-slate-700">
            {parts[0]}
          </span>
          {blankWord ? (
            /* بعد از پاسخ: کلمه درست در جای خالی */
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className={`inline-block mx-1 px-2.5 rounded-lg font-black ${
                feedback?.correct
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {blankWord}
            </motion.span>
          ) : (
            /* جای خالی: خط‌چین تپنده */
            <motion.span
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ repeat: Infinity, duration: 1.3 }}
              className="inline-block w-16 md:w-24 mx-1 border-b-4 border-dashed border-amber-400 align-baseline"
            >
              &nbsp;
            </motion.span>
          )}
          <span className="text-lg md:text-2xl font-bold text-slate-700">
            {parts.slice(1).join("___")}
          </span>
        </motion.div>
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
          {feedback && <ResultBanner key="banner" feedback={feedback} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
