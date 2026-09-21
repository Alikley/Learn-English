"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Zap,
  Star,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { GrammarQuestion, GrammarSet } from "@/types/training";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_COLOR,
} from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import PageLoader from "@/app/components/PageLoader";

// ========================================
// کوئیز گرامری (نسخه ۱.۰.۱.۴)
// ۱۰ سؤال MCQ / FILL / ERROR — بازخورد فوری + مرور کامل در پایان
// ========================================

type LogItem = {
  id: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  question: string;
};

/** نرمال‌سازی جواب نوشتاری */
function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u02BC\u2018]/g, "'")
    .replace(/\s+/g, " ");
}

function starsOf(percent: number) {
  if (percent >= 80) return 3;
  if (percent >= 60) return 2;
  if (percent >= 40) return 1;
  return 0;
}

export default function GrammarQuizPage() {
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

  const questions: GrammarQuestion[] = set?.questions ?? [];
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
              ? "کدام جمله کاملاً صحیح است؟"
              : question.question,
        },
      ]);
    },
    [question],
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

  // لودر یکپارچهٔ سایت — v1.0.1.9
  if (loading) {
    return <PageLoader />;
  }

  if (!set || !question) {
    if (!set) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <p className="text-slate-500">مجموعه یافت نشد</p>
          <button
            onClick={() => router.push("/training/grammar")}
            className="text-blue-600 text-sm font-bold"
          >
            بازگشت به لیست
          </button>
        </div>
      );
    }
    return null;
  }

  const correctCount = log.filter((l) => l.correct).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir="rtl">
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
                سؤال {qIndex + 1} از {questions.length}
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
            <div className="min-h-[24rem] bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7">
              {/* نوع سؤال */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    question.type === "MCQ"
                      ? "bg-blue-50 text-blue-600"
                      : question.type === "FILL"
                        ? "bg-violet-50 text-violet-600"
                        : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {question.type === "MCQ"
                    ? "چهارگزینه‌ای"
                    : question.type === "FILL"
                      ? "جای خالی"
                      : "جمله صحیح"}
                </span>
                {bestStars > 0 && (
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < bestStars
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    ))}
                  </span>
                )}
              </div>

              <h2 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed mb-6">
                <HoverableText text={question.question} />
              </h2>

              {/* گزینه‌های MCQ / ERROR */}
              {(question.type === "MCQ" || question.type === "ERROR") && (
                <div
                  className={`grid gap-3 ${
                    question.type === "ERROR" ? "grid-cols-1" : "grid-cols-1"
                  }`}
                >
                  {question.options.map((option, i) => {
                    const isSelected = selected === option;
                    const isAnswer = option === question.answer;
                    let cls =
                      "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50";
                    if (answered) {
                      if (isAnswer)
                        cls = "border-green-400 bg-green-50 text-green-700";
                      else if (isSelected)
                        cls = "border-red-400 bg-red-50 text-red-700";
                      else cls = "border-slate-100 bg-slate-50 text-slate-400";
                    } else if (isSelected) {
                      cls = "border-blue-500 bg-blue-50";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        disabled={answered}
                        dir="ltr"
                        className={`text-right flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-sm md:text-base font-medium ${cls} ${
                          answered ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span
                          className={`shrink-0 w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            answered && isAnswer
                              ? "bg-green-500 text-white"
                              : answered && isSelected
                                ? "bg-red-500 text-white"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-left leading-relaxed">
                          <HoverableText text={option} />
                        </span>
                        {answered && isAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        )}
                        {answered && isSelected && !isAnswer && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* جای خالی FILL */}
              {question.type === "FILL" && (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFillSubmit();
                      }}
                      disabled={answered}
                      dir="ltr"
                      autoFocus
                      placeholder="جواب را اینجا بنویس..."
                      className={`flex-1 min-w-[12rem] px-4 py-3 border-2 rounded-xl text-base font-medium outline-none transition-all text-center ${
                        answered
                          ? wasCorrect
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-red-400 bg-red-50 text-red-700"
                          : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                    {!answered && (
                      <button
                        onClick={handleFillSubmit}
                        disabled={!fillValue.trim()}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
                      >
                        بررسی
                      </button>
                    )}
                  </div>
                  {answered && !wasCorrect && (
                    <p className="mt-3 text-sm text-green-600 font-bold" dir="ltr">
                      ✓ {question.answer}
                    </p>
                  )}
                </div>
              )}

              {/* بازخورد و توضیح */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 rounded-xl border p-4 ${
                      wasCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold mb-2 flex items-center gap-2 ${
                        wasCorrect ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {wasCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          آفرین! درست جواب دادی
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          نادرست — جواب درست مشخص شد
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      {question.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                    {qIndex + 1 >= questions.length ? "دیدن نتیجه" : "سؤال بعدی"}
                    <ChevronLeft className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* ================= صفحه نتیجه ================= */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 md:p-8 text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-5">
                نتیجه {set.topicFa}
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
                        s <= starsOf(
                          Math.round((correctCount / questions.length) * 100),
                        )
                          ? "text-amber-400 fill-amber-400 drop-shadow-md"
                          : "text-slate-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                <div>
                  <span className="text-slate-500">پاسخ صحیح: </span>
                  <span className="font-bold text-slate-800">
                    {correctCount}/{questions.length}
                  </span>
                </div>
                <div className="text-slate-300">|</div>
                <div>
                  <span className="text-slate-500">درصد: </span>
                  <span className="font-bold text-slate-800">
                    {Math.round((correctCount / questions.length) * 100)}%
                  </span>
                </div>
                <div className="text-slate-300">|</div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-blue-600">
                    +
                    {Math.round(
                      (set.xp *
                        starsOf(
                          Math.round(
                            (correctCount / questions.length) * 100,
                          ),
                        )) /
                        3,
                    )}{" "}
                    XP
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  دوباره
                </button>
                <button
                  onClick={() => router.push("/training/grammar")}
                  className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  بازگشت به لیست
                </button>
              </div>
            </div>

            {/* ================= مرور سؤال‌ها ================= */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                مرور همه سؤال‌ها
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
        )}
      </AnimatePresence>
    </div>
  );
}
