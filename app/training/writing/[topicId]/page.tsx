"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Bold,
  Italic,
  Underline,
  Undo2,
  Trash2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpenCheck,
  PenLine,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { PracticeIcon } from "@/lib/practice-icons";
import { saveProgress } from "@/lib/practice-progress";
import type { WritingTopic, WritingFeedback, WritingCorrection } from "@/types/training";

const MAX_WORDS = 200;
const MIN_WORDS = 10;

/* تبدیل ارقام به فارسی */
function fa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/* شمارش کلمه‌های متن ساده */
function countWordsIn(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/* شمارش انیمیشنی نمره ۰ → نمره نهایی */
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{fa(display)}</>;
}

/* حلقه نمره (SVG با انیمیشن stroke) */
function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - score / 100),
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-800">
          <CountUp value={score} />
        </span>
        <span className="text-[10px] text-slate-400">از ۱۰۰</span>
      </div>
    </div>
  );
}

/* کارت یک خطا (املایی یا گرامری) */
function ErrorCard({
  item,
  index,
  kind,
}: {
  item: WritingCorrection;
  index: number;
  kind: "spelling" | "grammar";
}) {
  const isSpelling = kind === "spelling";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
      className={`rounded-2xl border p-4 ${
        isSpelling
          ? "bg-red-50/60 border-red-100"
          : "bg-amber-50/60 border-amber-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isSpelling ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-500"
          }`}
        >
          {isSpelling ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm leading-relaxed" dir="ltr">
            <span
              className={`line-through font-medium ${
                isSpelling ? "text-red-500" : "text-amber-600"
              }`}
            >
              {item.original}
            </span>
            <span className="text-slate-400 mx-2">→</span>
            <span className="text-green-600 font-bold">{item.correction}</span>
          </p>
          {item.note && (
            <p className="text-xs text-slate-600 leading-relaxed">{item.note}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ========== صفحه اصلی ========== */
export default function WritingPracticePage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<WritingTopic | null>(null);
  const [loading, setLoading] = useState(true);

  // وضعیت ویرایشگر
  const paperRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [atLimit, setAtLimit] = useState(false);
  const [fmt, setFmt] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // وضعیت تصحیح
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [gradeError, setGradeError] = useState("");
  const [saved, setSaved] = useState(false);

  // دریافت موضوع
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!topicId) return;
      try {
        const res = await fetch(`/api/practice/writing/${topicId}`);
        if (res.ok && !cancelled) {
          setTopic(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const id = setTimeout(() => void load(), 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [topicId]);

  const recount = useCallback(() => {
    const text = paperRef.current?.textContent ?? "";
    const n = countWordsIn(text);
    setWordCount(n);
    setAtLimit(n >= MAX_WORDS);
  }, []);

  // جلوگیری از ورود کلمه‌های اضافه (سقف سخت ۲۰۰ کلمه)
  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const ev = e.nativeEvent as InputEvent;
    if (!ev.inputType.startsWith("insert")) return; // حذف همیشه آزاد است
    const current = countWordsIn(paperRef.current?.textContent ?? "");
    const data = ev.data ?? "";

    // وقتی پر است، فقط فاصله‌های بی‌اثر مجاز است
    if (current >= MAX_WORDS && data.trim() !== "") {
      ev.preventDefault();
      setAtLimit(true);
      return;
    }
    // ورود متن چندکلمه‌ای (مثل درج سریع)
    if (ev.inputType === "insertText" && data.trim() !== "") {
      const wordsInData = data.trim().split(/\s+/).filter(Boolean).length;
      if (current + wordsInData > MAX_WORDS) {
        ev.preventDefault();
        const remaining = MAX_WORDS - current;
        const fitting = data
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, Math.max(0, remaining))
          .join(" ");
        if (fitting) document.execCommand("insertText", false, fitting);
        setAtLimit(true);
      }
    }
  };

  // تور ایمنی: اگر به هر دلیلی از حد گذشت، کلمه‌های اضافه حذف می‌شوند
  const handleInput = () => {
    const el = paperRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > MAX_WORDS) {
      el.textContent = words.slice(0, MAX_WORDS).join(" ");
      // نشانگر را انتهای متن بگذار
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setAtLimit(true);
    }
    recount();
  };

  // چسباندن متن — فقط تا سقف ۲۰۰ کلمه
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const current = countWordsIn(paperRef.current?.textContent ?? "");
    const remaining = MAX_WORDS - current;
    const parts = text.trim().split(/\s+/).filter(Boolean);
    const fitting = remaining > 0 ? parts.slice(0, remaining).join(" ") : "";
    if (fitting) document.execCommand("insertText", false, fitting);
    if (parts.length > Math.max(0, remaining)) setAtLimit(true);
    recount();
  };

  // وضعیت فعال دکمه‌های قالب‌بندی
  useEffect(() => {
    const onSel = () => {
      try {
        setFmt({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
        });
      } catch {
        /* مرورگر پشتیبانی نمی‌کند */
      }
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const exec = (cmd: string) => {
    paperRef.current?.focus();
    document.execCommand(cmd);
    // به‌روزرسانی وضعیت دکمه‌ها
    try {
      setFmt({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {
      /* سکوت */
    }
  };

  const clearPaper = () => {
    if (!window.confirm("کل متن پاک شود؟")) return;
    if (paperRef.current) paperRef.current.textContent = "";
    setWordCount(0);
    setAtLimit(false);
  };

  // ارسال برای تصحیح
  const submit = async () => {
    if (!topic || grading) return;
    const text = (paperRef.current?.textContent ?? "").trim();
    if (countWordsIn(text) < MIN_WORDS) return;
    setGrading(true);
    setGradeError("");
    try {
      const res = await fetch("/api/practice/writing/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGradeError(data.error ?? "خطا در تصحیح");
      } else {
        const fb = data as WritingFeedback;
        setFeedback(fb);
        setSaved(false);
        // اسکرول نرم به نتیجه
        setTimeout(() => {
          document
            .getElementById("writing-result")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      setGradeError("تصحیح هوشمند در دسترس نیست — لطفاً دوباره تلاش کنید");
    } finally {
      setGrading(false);
    }
  };

  // ذخیره پیشرفت بعد از دریافت نتیجه
  useEffect(() => {
    if (!feedback || saved || !topicId) return;
    const id = setTimeout(() => {
      const stars =
        feedback.overallScore >= 80
          ? 3
          : feedback.overallScore >= 60
            ? 2
            : feedback.overallScore >= 40
              ? 1
              : 0;
      saveProgress("writing", topicId, stars, feedback.overallScore);
      setSaved(true);
    }, 0);
    return () => clearTimeout(id);
  }, [feedback, saved, topicId]);

  const resetAll = () => {
    if (paperRef.current) paperRef.current.textContent = "";
    setWordCount(0);
    setAtLimit(false);
    setFeedback(null);
    setGradeError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3"
        dir="rtl"
      >
        <p className="text-slate-500">موضوع یافت نشد</p>
        <button
          onClick={() => router.push("/training/writing")}
          className="text-emerald-600 text-sm"
        >
          بازگشت به موضوع‌ها
        </button>
      </div>
    );
  }

  const canSubmit = wordCount >= MIN_WORDS && !grading;
  const noErrors =
    feedback && feedback.spellingErrors.length === 0 && feedback.grammarErrors.length === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training/writing")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="بازگشت به موضوع‌ها"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <PracticeIcon name={topic.icon} className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-800">{topic.titleFa}</h1>
          <p className="text-sm text-slate-500 truncate">{topic.titleEn}</p>
        </div>
      </div>

      {/* کارت صورت موضوع */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <PenLine className="h-4 w-4 text-emerald-500" />
          موضوع نوشتار
        </h2>

        {/* صورت انگلیسی */}
        <div className="bg-slate-50 rounded-xl p-4" dir="ltr">
          <p className="text-sm text-slate-700 leading-relaxed text-left">
            {topic.prompt}
          </p>
        </div>

        {/* صورت فارسی */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {topic.promptFa}
        </p>

        {/* کلمه‌های مفید */}
        <div className="flex items-start gap-2 flex-wrap">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
          {topic.usefulWords.map((w) => (
            <span
              key={w.en}
              className="inline-flex items-baseline gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs font-medium"
              dir="ltr"
            >
              {w.en}
              <span className="text-[10px] text-blue-400" dir="rtl">
                {w.fa}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* نوار ابزار (مثل Word) */}
      <div className="sticky top-2 z-20 mt-6 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => exec("bold")}
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors ${
            fmt.bold
              ? "bg-emerald-100 text-emerald-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="درشت (Bold)"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => exec("italic")}
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors ${
            fmt.italic
              ? "bg-emerald-100 text-emerald-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="مورب (Italic)"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => exec("underline")}
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors ${
            fmt.underline
              ? "bg-emerald-100 text-emerald-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="زیرخط (Underline)"
          type="button"
        >
          <Underline className="h-4 w-4" />
        </button>
        <span className="w-px h-6 bg-slate-200 mx-1" />
        <button
          onClick={() => exec("undo")}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          title="واگرد (Undo)"
          type="button"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={clearPaper}
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          title="پاک کردن کل متن"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          پاک کردن
        </button>
      </div>

      {/* برگه سفید ویرایشگر */}
      <div className="max-w-3xl mx-auto mt-3">
        <div className="relative">
          {/* متن جای‌نگهدار وقتی خالی است */}
          {wordCount === 0 && !grading && (
            <span className="absolute top-10 right-10 md:top-14 md:right-14 text-slate-300 text-base pointer-events-none select-none font-serif">
              اینجا بنویس...
            </span>
          )}
          <div
            ref={paperRef}
            contentEditable
            suppressContentEditableWarning
            dir="ltr"
            onBeforeInput={handleBeforeInput}
            onInput={handleInput}
            onPaste={handlePaste}
            spellCheck={false}
            role="textbox"
            aria-multiline="true"
            aria-label="ویرایشگر متن انگلیسی"
            className="bg-white shadow-lg rounded-sm min-h-[420px] max-h-[70vh] overflow-y-auto p-8 md:p-12 font-serif text-left text-slate-800 text-base leading-[2] outline-none
            [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200"
          />
        </div>

        {/* شمارنده کلمه */}
        <motion.div
          animate={atLimit ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`mt-3 rounded-xl border px-4 py-2.5 flex items-center justify-between ${
            atLimit
              ? "bg-red-50 border-red-200"
              : wordCount >= MIN_WORDS
                ? "bg-emerald-50 border-emerald-100"
                : "bg-slate-50 border-slate-100"
          }`}
        >
          <span
            className={`text-sm font-medium ${
              atLimit
                ? "text-red-600"
                : wordCount >= MIN_WORDS
                  ? "text-emerald-700"
                  : "text-slate-500"
            }`}
          >
            تعداد کلمات: {fa(wordCount)} از {fa(MAX_WORDS)}
          </span>
          {atLimit ? (
            <span className="text-xs text-red-500 font-medium">
              به سقف ۲۰۰ کلمه رسیدی
            </span>
          ) : wordCount < MIN_WORDS ? (
            <span className="text-xs text-slate-400">حداقل ۱۰ کلمه</span>
          ) : (
            <span className="text-xs text-emerald-500 font-medium">
              آماده ارسال
            </span>
          )}
        </motion.div>

        {/* دکمه ارسال */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`px-8 py-3.5 rounded-xl font-medium text-sm text-white transition-all shadow-md flex items-center gap-2 ${
              canSubmit
                ? "bg-linear-to-l from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                : "opacity-50 cursor-not-allowed bg-linear-to-l from-emerald-500 to-green-500"
            }`}
          >
            <BookOpenCheck className="h-4 w-4" />
            ارسال برای تصحیح
          </button>
          {wordCount < MIN_WORDS && (
            <span className="text-xs text-slate-400">
              برای ارسال، حداقل ۱۰ کلمه بنویس
            </span>
          )}
        </div>
      </div>

      {/* حالت تصحیح (در انتظار معلم هوشمند) */}
      <AnimatePresence>
        {grading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 bg-white rounded-2xl border border-emerald-100 shadow-lg p-8 flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center"
            >
              <BookOpenCheck className="h-8 w-8 text-emerald-500" />
            </motion.div>
            <p className="text-sm font-medium text-slate-700">
              معلم هوشمند در حال بررسی متن شما...
            </p>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: d * 0.15,
                  }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              این ممکن است ۱۰ تا ۳۰ ثانیه طول بکشد
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* خطای تصحیح */}
      <AnimatePresence>
        {gradeError && !grading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">{gradeError}</p>
              <button
                onClick={submit}
                className="mt-2 text-xs text-red-600 font-medium hover:text-red-700 underline"
              >
                تلاش مجدد
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نتیجه تصحیح */}
      <AnimatePresence>
        {feedback && !grading && (
          <motion.div
            id="writing-result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-4"
          >
            {/* نمره کلی + مرتبط بودن */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={feedback.overallScore} />
                <div className="flex-1 space-y-3 text-center sm:text-right">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 justify-center sm:justify-start">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    نمره کلی
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                      feedback.onTopic
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {feedback.onTopic
                      ? "کاملاً مرتبط با موضوع"
                      : "نامرتبط با موضوع"}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feedback.topicNote}
                  </p>
                  <p className="text-xs text-slate-400">
                    تعداد کلمات: {fa(feedback.wordCount)}
                  </p>
                </div>
              </div>
            </div>

            {/* خلاصه معلم */}
            {feedback.summary && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-700 text-sm mb-2">
                  نظر معلم
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feedback.summary}
                </p>
              </div>
            )}

            {/* بدون هیچ خطا — جشن */}
            {noErrors && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex justify-center"
                >
                  <Sparkles className="h-10 w-10 text-green-500" />
                </motion.div>
                <p className="font-bold text-green-700">
                  هیچ غلطی پیدا نشد — آفرین!
                </p>
                <p className="text-xs text-green-600">
                  متن تو هم از نظر املایی و هم گرامری سالم بود. ادامه بده!
                </p>
              </motion.div>
            )}

            {/* غلط‌های املایی */}
            {feedback.spellingErrors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-red-600 text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  غلط‌های املایی ({fa(feedback.spellingErrors.length)})
                </h3>
                {feedback.spellingErrors.map((item, i) => (
                  <ErrorCard key={i} item={item} index={i} kind="spelling" />
                ))}
              </div>
            )}

            {/* اشتباه‌های گرامری */}
            {feedback.grammarErrors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-amber-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  اشتباه‌های گرامری ({fa(feedback.grammarErrors.length)})
                </h3>
                {feedback.grammarErrors.map((item, i) => (
                  <ErrorCard key={i} item={item} index={i} kind="grammar" />
                ))}
              </div>
            )}

            {/* نقاط قوت */}
            {feedback.goodPoints.length > 0 && (
              <div className="bg-green-50/70 border border-green-100 rounded-2xl p-5">
                <h3 className="font-bold text-green-700 text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  نقاط قوت
                </h3>
                <ul className="space-y-2">
                  {feedback.goodPoints.map((p, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="text-sm text-green-800 flex items-start gap-2 leading-relaxed"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {p}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* پیشنهادهای معلم */}
            {feedback.suggestions.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5">
                <h3 className="font-bold text-blue-700 text-sm mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  پیشنهادهای معلم
                </h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="text-sm text-blue-800 flex items-start gap-2 leading-relaxed"
                    >
                      <Lightbulb className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="flex items-center justify-center gap-3 flex-wrap pt-2 pb-8">
              <button
                onClick={resetAll}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <PenLine className="h-4 w-4" />
                نوشتن دوباره
              </button>
              <button
                onClick={() => router.push("/training/writing")}
                className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                بازگشت به موضوع‌ها
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
