"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Zap, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { GrammarSet } from "@/types/training";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_COLOR,
} from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import GrammarQuizCard from "./_components/GrammarQuizCard";
import GrammarResultPanel from "./_components/GrammarResultPanel";
import { normalize, starsOf, type LogItem } from "./_components/grammarQuizUtils";

// ========================================
// کوئیز گرامری (نسخه ۱.۰.۱.۴)
// ۱۰ سؤال MCQ / FILL / ERROR — بازخورد فوری + مرور کامل در پایان
// v1.0.2.7 — ریفکتوری: کارت سؤال، پنل نتیجه و ابزارهای خالص
// به _components تفکیک شدند؛ اینجا فقط وضعیت و ناوبری.
// ========================================

export default function GrammarQuizPage() {
  const { tr, dir } = useLanguage();
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();

  const [set, setSet] = useState<GrammarSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [bestStars, setBestStars] = useState(0);

  // وضعیت بازی
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [log, setLog] = useState<LogItem[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      void (async () => {
        if (!setId) return;
        try {
          const res = await fetch(`/api/practice/grammar/${setId}`);
          if (res.ok && !cancelled) {
            const data = (await res.json()) as GrammarSet;
            setSet(data);
            setBestStars(getProgress("grammar", data.id)?.stars ?? 0);
          }
        } catch {
          /* silent */
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [setId]);

  const questions = set?.questions ?? [];
  const question = questions[qIndex] ?? null;

  const registerAnswer = useCallback(
    (userAnswer: string, correct: boolean) => {
      if (!question) return;
      setAnswered(true);
      setWasCorrect(correct);
      setLog((prev) => [
        ...prev,
        {
          id: question.id,
          correct,
          userAnswer,
          correctAnswer: question.answer,
          explanation: question.explanation,
          question:
            question.type === "ERROR"
              ? tr("کدام جمله کاملاً صحیح است؟", "Which sentence is completely correct?")
              : question.question,
        },
      ]);
    },
    [question, tr],
  );

  const handleSelect = (option: string) => {
    if (answered || !question) return;
    setSelected(option);
    registerAnswer(option, normalize(option) === normalize(question.answer));
  };

  const handleFillSubmit = () => {
    if (answered || !question || !fillValue.trim()) return;
    registerAnswer(
      fillValue,
      normalize(fillValue) === normalize(question.answer),
    );
  };

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      // پایان — محاسبه نتیجه و ذخیره
      const correct = log.filter((l) => l.correct).length;
      const percent = Math.round((correct / questions.length) * 100);
      const stars = starsOf(percent);
      if (set) {
        saveProgress("grammar", set.id, stars, percent);
        setBestStars((prev) => Math.max(prev, stars));
      }
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setFillValue("");
      setAnswered(false);
      setWasCorrect(false);
    }
  };

  const handleRestart = () => {
    setQIndex(0);
    setSelected(null);
    setFillValue("");
    setAnswered(false);
    setWasCorrect(false);
    setLog([]);
    setFinished(false);
  };

  if (loading) return <PageLoading />;

  if (!set || !question) {
    if (!set) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <p className="text-slate-500">{tr("مجموعه یافت نشد", "Set not found")}</p>
          <button
            onClick={() => router.push("/training/grammar")}
            className="text-blue-600 text-sm font-bold"
          >
            {tr("بازگشت به لیست", "Back to List")}
          </button>
        </div>
      );
    }
    return null;
  }

  const correctCount = log.filter((l) => l.correct).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training/grammar")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold text-slate-800">
              {set.topicFa}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                GRAMMAR_LEVEL_COLOR[set.level]
              }`}
            >
              {GRAMMAR_LEVEL_LABEL[set.level]}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">
            <HoverableText text={set.topicEn} />
          </p>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 rounded-full px-3 py-1.5 shrink-0">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-600">{set.xp} XP</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={`quiz-${qIndex}`}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
          >
            {/* ================= نوار پیشرفت سؤال‌ها ================= */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-500 shrink-0">
                {tr("سؤال", "Question")} {qIndex + 1} {tr("از", "of")} {questions.length}
              </span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-l from-blue-600 to-sky-400 rounded-full"
                  initial={{ width: `${(qIndex / questions.length) * 100}%` }}
                  animate={{
                    width: `${((qIndex + 1) / questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-600 shrink-0">
                {correctCount} ✓
              </span>
            </div>

            {/* ================= کارت سؤال ================= */}
            <GrammarQuizCard
              question={question}
              selected={selected}
              fillValue={fillValue}
              answered={answered}
              wasCorrect={wasCorrect}
              bestStars={bestStars}
              onSelect={handleSelect}
              onFillChange={setFillValue}
              onFillSubmit={handleFillSubmit}
            />

            {/* دکمه بعدی */}
            <div className="mt-5 flex justify-center">
              <AnimatePresence>
                {answered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleNext}
                    className="px-8 py-3 bg-linear-to-l from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    {qIndex + 1 >= questions.length ? tr("دیدن نتیجه", "See Result") : tr("سؤال بعدی", "Next Question")}
                    <ChevronLeft className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* ================= صفحه نتیجه ================= */
          <GrammarResultPanel
            topicFa={set.topicFa}
            setXp={set.xp}
            correctCount={correctCount}
            totalQuestions={questions.length}
            log={log}
            onRestart={handleRestart}
            onBackToList={() => router.push("/training/grammar")}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
