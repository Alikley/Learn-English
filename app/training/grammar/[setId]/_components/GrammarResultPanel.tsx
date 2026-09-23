"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { motion } from "motion/react";
import { Zap, Star, RotateCcw, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { LogItem } from "./grammarQuizUtils";
import { starsOf } from "./grammarQuizUtils";

// ========================================
// صفحهٔ نتیجهٔ کوییز گرامری: ستاره‌ها + آمار + دکمه‌ها
// + مرور کامل همهٔ سؤال‌ها
// (از صفحهٔ [setId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function GrammarResultPanel({
  topicFa,
  setXp,
  correctCount,
  totalQuestions,
  log,
  onRestart,
  onBackToList,
}: {
  topicFa: string;
  setXp: number;
  correctCount: number;
  totalQuestions: number;
  log: LogItem[];
  onRestart: () => void;
  onBackToList: () => void;
}) {
  const { tr } = useLanguage();
  const percent = Math.round((correctCount / totalQuestions) * 100);
  const stars = starsOf(percent);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 md:p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-5">
          {tr("نتیجه", "Result")} {topicFa}
        </h3>

        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + s * 0.2, type: "spring" }}
            >
              <Star
                className={`h-12 w-12 ${
                  s <= stars
                    ? "text-amber-400 fill-amber-400 drop-shadow-md"
                    : "text-slate-200"
                }`}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
          <div>
            <span className="text-slate-500">{tr("پاسخ صحیح:", "Correct answer:")} </span>
            <span className="font-bold text-slate-800">
              {correctCount}/{totalQuestions}
            </span>
          </div>
          <div className="text-slate-300">|</div>
          <div>
            <span className="text-slate-500">{tr("درصد:", "Score:")} </span>
            <span className="font-bold text-slate-800">{percent}%</span>
          </div>
          <div className="text-slate-300">|</div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-blue-600">
              +{Math.round((setXp * stars) / 3)} XP
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onRestart}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {tr("دوباره", "Again")}
          </button>
          <button
            onClick={onBackToList}
            className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
          >
            {tr("بازگشت به لیست", "Back to List")}
          </button>
        </div>
      </div>

      {/* ================= مرور سؤال‌ها ================= */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          {tr("مرور همه سؤال‌ها", "Review All Questions")}
        </h3>
        <div className="space-y-3">
          {log.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-3.5 ${
                entry.correct
                  ? "bg-green-50/60 border-green-100"
                  : "bg-red-50/60 border-red-100"
              }`}
            >
              <div className="flex items-start gap-2">
                {entry.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    {i + 1}. {entry.question}
                  </p>
                  <p className="text-[11px] text-slate-500" dir="ltr">
                    {entry.correct ? (
                      <span className="text-green-600 font-bold">
                        ✓ {entry.correctAnswer}
                      </span>
                    ) : (
                      <>
                        <span className="text-red-500 line-through">
                          {entry.userAnswer}
                        </span>
                        {" → "}
                        <span className="text-green-600 font-bold">
                          {entry.correctAnswer}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    💡 {entry.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
