"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gauge,
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Library,
  GraduationCap,
  Sparkles,
  RotateCcw,
  PenLine,
  Brain,
  ListChecks,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

// ========================================
// صفحهٔ تعیین سطح (v1.0.8.0 / English 1.0.2.0)
//
// جریان: ۸ سوال تشخیصی (A1→C1) + متن نوشتاری اختیاری
// → POST /api/placement → مدل Laya متن نوشتاری را طبقه‌بندی
//   می‌کند (سرور خودت) + نمرهٔ تست → سطح CEFR نهایی
// → توصیه: کدام دوره‌ها + کدام کتاب‌های کمبریج
//
// اگر Laya خاموش/قطع باشد: سطح از نمرهٔ تست می‌آید
// (همان چیپ «روش تعیین» نشان می‌دهد) — هیچ‌وقت خطا نمی‌گیرد.
// ========================================

type Question = {
  id: string;
  cefr: "A1" | "A2" | "B1" | "B2" | "C1";
  prompt: string;
  options: string[];
};

type Recommendation = {
  headline: string;
  headlineEn: string;
  subline: string;
  sublineEn: string;
  courses: {
    topicKey: string;
    topicFa: string;
    topicEn: string;
    icon: string;
    courseSlug: string;
    levelFa: string;
    levelEn: string;
  }[];
  books: {
    title: string;
    titleEn: string;
    detail: string;
    detailEn: string;
    bookRange: [number, number] | null;
    href: string;
  }[];
  storyBooks: { title: string; titleEn: string; href: string } | null;
  ieltsNote: string;
  ieltsNoteEn: string;
};

type Result = {
  cefr: string;
  method: string;
  mc: { score: number; total: number; perLevel: { cefr: string; correct: number; total: number }[] };
  writing: { used: boolean; cefr: string | null; confidence: number | null; skippedReason: string | null };
  recommendations: Recommendation;
};

const CEFR_COLOR: Record<string, string> = {
  A1: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  B1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  B2: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  C1: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function PlacementPage() {
  const { tr, dir } = useLanguage();
  const en = dir === "ltr";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<{ cefr: string; createdAt: string; recommendations: Recommendation } | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [step, setStep] = useState(0); // 0..7 سوال، 8 = نوشتاری
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [writing, setWriting] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/placement");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setQuestions(data.questions ?? []);
        if (data.lastResult) setLastResult(data.lastResult);
      } catch {
        /* شبکه — دوباره تلاش می‌شود با رفرش */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goTo = useCallback((n: number) => {
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          writing: writing.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "خطا در ارزیابی — دوباره تلاش کن");
        return;
      }
      const data = await res.json();
      setResult(data);
      setLastResult(null);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("ارتباط برقرار نشد — اتصال اینترنت را چک کن");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setResult(null);
    setAnswers({});
    setWriting("");
    setStep(0);
  };

  if (loading) return <PageLoading />;

  const q = questions[step];
  const isWritingStep = step === questions.length;
  const progress = Math.round((step / (questions.length + 1)) * 100);

  return (
    <div ref={topRef} className="w-full min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] pb-12" dir={dir}>
      {/* ================= هدر ================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Gauge size={22} />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
              {tr("تعیین سطح", "Level Assessment")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {tr(
                "۸ سوال + یک متن کوتاه — چند دقیقه بیشتر طول نمی‌کشد",
                "8 questions + a short text — takes only a few minutes",
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* ================= نتیجهٔ قبلی ================= */}
        {lastResult && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${CEFR_COLOR[lastResult.cefr] ?? CEFR_COLOR.A1}`}>
                  {lastResult.cefr}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                  {tr("آخرین نتیجهٔ تو", "Your last result")}
                </p>
              </div>
              <button
                onClick={() => setLastResult(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
              >
                {tr("تست دوباره", "Retake test")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= نتیجه ================= */}
        {result && <ResultView result={result} en={en} onRestart={restart} tr={tr} />}

        {/* ================= تست ================= */}
        {!result && !lastResult && questions.length > 0 && (
          <>
            {/* نوار پیشرفت */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>
                  {isWritingStep
                    ? tr("بخش نوشتاری (اختیاری)", "Writing part (optional)")
                    : tr(`سوال ${step + 1} از ${questions.length}`, `Question ${step + 1} of ${questions.length}`)}
                </span>
                <span>{q ? `${q.cefr}` : ""}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-blue-600"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isWritingStep && q ? (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
                >
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5" dir="ltr">
                    {q.prompt}
                  </p>
                  <div className="grid gap-3">
                    {q.options.map((opt, i) => {
                      const selected = answers[q.id] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-start ${
                            selected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {selected ? <Check size={14} /> : ["A", "B", "C", "D"][i]}
                          </span>
                          <span dir="ltr" className="text-base">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="writing"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PenLine size={18} className="text-blue-600 dark:text-blue-300" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {tr("یک متن کوتاه انگلیسی بنویس (اختیاری)", "Write a short English text (optional)")}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-6">
                    {tr(
                      "مثلاً دربارهٔ روزت یا کارت — هوش مصنوعی Laya از روی نوشتارت سطح واقعی‌ات را تشخیص می‌دهد (دقیق‌تر از تست). حداقل ۲۰ حرف.",
                      "e.g. about your day or work — the Laya AI detects your real level from your writing (more accurate than the quiz). At least 20 characters.",
                    )}
                  </p>
                  <textarea
                    value={writing}
                    onChange={(e) => setWriting(e.target.value.slice(0, 4000))}
                    dir="ltr"
                    rows={5}
                    placeholder="Today I woke up early and..."
                    className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent p-4 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-end">{writing.length}/4000</p>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* ناوبری */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => goTo(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold disabled:opacity-40 hover:enabled:border-blue-300 transition-colors"
              >
                <ArrowRight size={16} className={en ? "rotate-180" : ""} />
                {tr("قبلی", "Back")}
              </button>

              {isWritingStep ? (
                <button
                  onClick={submit}
                  disabled={submitting || Object.keys(answers).length < questions.length}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-black transition-colors shadow-lg shadow-blue-600/20"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {tr("تعیین سطح نهایی", "Get my level")}
                </button>
              ) : (
                <button
                  onClick={() => goTo(step + 1)}
                  disabled={answers[q?.id ?? ""] === undefined}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-black transition-colors"
                >
                  {tr("بعدی", "Next")}
                  <ArrowLeft size={16} className={en ? "rotate-180" : ""} />
                </button>
              )}
            </div>

            {Object.keys(answers).length < questions.length && (
              <p className="text-center text-[11px] text-slate-400">
                {tr(
                  `هنوز ${questions.length - Object.keys(answers).length} سوال بی‌جواب داری`,
                  `${questions.length - Object.keys(answers).length} questions left unanswered`,
                )}
              </p>
            )}
          </>
        )}

        {/* بدون سوال (API خطا) */}
        {!result && !lastResult && questions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            {tr("سوال‌ها بارگذاری نشد — صفحه را رفرش کن", "Questions failed to load — refresh the page")}
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// نمای نتیجه + توصیه‌ها
// ========================================

function ResultView({
  result,
  en,
  onRestart,
  tr,
}: {
  result: Result;
  en: boolean;
  onRestart: () => void;
  tr: (fa: string, en: string) => string;
}) {
  const rec = result.recommendations;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* کارت سطح */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-gradient-to-l from-blue-600 to-teal-500 p-6 text-white">
          <div className="flex items-center gap-2 text-xs font-bold mb-2">
            <Brain size={14} />
            <span>{tr("نتیجهٔ تعیین سطح", "Assessment result")}</span>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-5xl font-black">{result.cefr}</span>
            <span className="text-sm opacity-90 pb-1.5">
              {en ? rec.headlineEn : rec.headline}
            </span>
          </div>
          <p className="mt-2 text-sm text-blue-50/90">{en ? rec.sublineEn : rec.subline}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-xl font-black text-blue-600 dark:text-blue-300">
              {result.mc.score}/{result.mc.total}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {tr("نمرهٔ تست", "Quiz score")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-xl font-black text-teal-600 dark:text-teal-300">
              {result.writing.used
                ? `${Math.round((result.writing.confidence ?? 0) * 100)}%`
                : "—"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {tr("اطمینان Laya از متن تو", "Laya confidence")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center col-span-2 md:col-span-1">
            <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-5">
              {result.writing.used
                ? tr("سطح از متن نوشتاری + تست", "Level from writing + quiz")
                : tr("سطح از نمرهٔ تست", "Level from quiz score")}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {tr("روش تعیین", "Method")}
            </p>
          </div>
        </div>
      </div>

      {/* تفکیک سوال‌ها */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks size={18} className="text-blue-600 dark:text-blue-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tr("عملکردت در سوال‌های هر سطح", "Your performance per level")}
          </h3>
        </div>
        <div className="space-y-2.5">
          {result.mc.perLevel.map((row) => (
            <div key={row.cefr} className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0 ${CEFR_COLOR[row.cefr]}`}>
                {row.cefr}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(row.correct / row.total) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                {row.correct}/{row.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* دوره‌های پیشنهادی */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-teal-600 dark:text-teal-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tr("دوره‌هایی که برای تو است", "Courses recommended for you")}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rec.courses.map((c) => (
            <div
              key={c.courseSlug}
              className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3"
            >
              <p className="text-xl mb-1">{c.icon}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {en ? c.topicEn : c.topicFa}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-300 font-medium mt-0.5">
                {en ? c.levelEn : c.levelFa}
              </p>
            </div>
          ))}
        </div>
        <a
          href="/courses"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
        >
          <BookOpen size={14} />
          {tr("برو به دوره‌های من", "Go to My Courses")}
        </a>
      </div>

      {/* کتاب‌های کمبریج */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tr("کتاب‌های کمبریج برای تو", "Cambridge books for you")}
          </h3>
        </div>
        {rec.books.map((b, i) => (
          <div
            key={i}
            className="rounded-xl border border-orange-100 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 p-4"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {en ? b.titleEn : b.title}
              </p>
              {b.bookRange && (
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300 text-[11px] font-black shrink-0">
                  {tr(`کتاب ${b.bookRange[0]} تا ${b.bookRange[1]}`, `Books ${b.bookRange[0]}-${b.bookRange[1]}`)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-6">
              {en ? b.detailEn : b.detail}
            </p>
            <a
              href={b.href}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-300 hover:underline"
            >
              {tr("مشاهدهٔ کتاب‌ها", "View books")}
              <ArrowLeft size={12} className={en ? "rotate-180" : ""} />
            </a>
          </div>
        ))}
        {rec.storyBooks && (
          <div className="rounded-xl border border-teal-100 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/5 p-4">
            <div className="flex items-center gap-2">
              <Library size={15} className="text-teal-600 dark:text-teal-300" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {en ? rec.storyBooks.titleEn : rec.storyBooks.title}
              </p>
            </div>
            <a
              href={rec.storyBooks.href}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-300 hover:underline"
            >
              {tr("برو به کتابخانه", "Go to Library")}
              <ArrowLeft size={12} className={en ? "rotate-180" : ""} />
            </a>
          </div>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 leading-6">
          🎯 {en ? rec.ieltsNoteEn : rec.ieltsNote}
        </p>
      </div>

      {/* دکمهٔ دوباره */}
      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <RotateCcw size={16} />
        {tr("تست دوباره", "Retake the test")}
      </button>
    </motion.div>
  );
}
