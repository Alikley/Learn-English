"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Wand2,
} from "lucide-react";
import type { WritingFeedback } from "@/types/training";
import { ScoreRing, Stars } from "@/app/components/practice/PracticeBits";

// ========================================
// نتیجهٔ اصلاح نوشتار: کارت امتیاز + غلط‌های املایی
// + نکته‌های گرامری + نقاط قوت + پیشنهادها
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

/** امتیاز ۰-۱۰۰ → تعداد ستاره */
export function starsOfScore(score: number) {
  return score >= 80 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
}

export default function WritingFeedbackView({
  feedback,
  onBack,
}: {
  feedback: WritingFeedback;
  onBack: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-4"
    >
      {/* کارت امتیاز */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <ScoreRing score={feedback.overallScore} />
          <div className="flex-1 max-w-sm text-center md:text-start">
            <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {feedback.onTopic
                ? tr("متن با موضوع هم‌خوانی دارد", "The text matches the topic")
                : tr("متن کمی از موضوع فاصله دارد", "The text drifts a bit from the topic")}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              {feedback.summary}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 text-[11px] font-bold text-slate-400">
              <span>{feedback.wordCount} کلمه</span>
              <span className="text-slate-200">|</span>
              <Stars count={starsOfScore(feedback.overallScore)} />
            </div>
          </div>
        </div>
        {feedback.topicNote && (
          <p className="mt-4 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-center">
            {feedback.topicNote}
          </p>
        )}
      </div>

      {/* غلط‌های املایی */}
      {feedback.spellingErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            {tr("غلط‌های املایی", "Spelling Mistakes")} ({feedback.spellingErrors.length})
          </h3>
          <div className="space-y-2">
            {feedback.spellingErrors.map((e, i) => (
              <div
                key={i}
                className="bg-red-50/70 border border-red-100 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-bold" dir="ltr">
                  <span className="text-red-500 line-through">
                    {e.original}
                  </span>
                  {" → "}
                  <span className="text-green-600">{e.correction}</span>
                </p>
                {e.note && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {e.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* خطاهای گرامری */}
      {feedback.grammarErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-amber-500" />
            {tr("نکته‌های گرامری", "Grammar Notes")} ({feedback.grammarErrors.length})
          </h3>
          <div className="space-y-2">
            {feedback.grammarErrors.map((e, i) => (
              <div
                key={i}
                className="bg-amber-50/70 border border-amber-100 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-bold" dir="ltr">
                  <span className="text-amber-600 line-through">
                    {e.original}
                  </span>
                  {" → "}
                  <span className="text-green-600">{e.correction}</span>
                </p>
                {e.note && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {e.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نقاط قوت */}
      {feedback.goodPoints.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
            {tr("نقاط قوت", "Strengths")}
          </h3>
          <ul className="space-y-2">
            {feedback.goodPoints.map((p, i) => (
              <li
                key={i}
                className="text-xs text-slate-600 leading-relaxed flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* پیشنهادها */}
      {feedback.suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-500" />
            {tr("پیشنهادهای بهتر شدن", "Suggestions for Improvement")}
          </h3>
          <ul className="space-y-2">
            {feedback.suggestions.map((s, i) => (
              <li
                key={i}
                className="text-xs text-slate-600 leading-relaxed flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* بازگشت */}
      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
        >
          {tr("بازگشت به لیست موضوعات", "Back to Topics List")}
        </button>
      </div>
    </motion.div>
  );
}
