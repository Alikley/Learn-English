"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  PenLine,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Eraser,
  Send,
  RotateCcw,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Wand2,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { WritingFeedback, WritingTopic } from "@/types/training";
import { ScoreRing, Stars } from "@/app/components/practice/PracticeBits";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";
import PageLoader from "@/app/components/PageLoader";

// ========================================
// ادیتور نوشتاری (نسخه ۱.۰.۱.۴)
// ادیتور شبیه Word با سقف سخت ۲۰۰ کلمه + اصلاح با هوش مصنوعی
// ========================================

const MIN_WORDS = 30;
const MAX_WORDS = 200;

export default function WritingEditorPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<WritingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [bestStars, setBestStars] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ---------- دریافت موضوع ---------- */
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      void (async () => {
        if (!topicId) return;
        try {
          const res = await fetch(`/api/practice/writing/${topicId}`);
          if (res.ok && !cancelled) {
            const data = (await res.json()) as WritingTopic;
            setTopic(data);
            setBestStars(getProgress("writing", data.id)?.stars ?? 0);
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
  }, [topicId]);

  /* ---------- شمارش کلمه‌ها + سقف سخت ---------- */
  const recount = useCallback(() => {
    const el = editorRef.current;
    if (!el) return 0;
    const words = el.innerText.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    return words.length;
  }, []);

  const handleInput = () => {
    setApiError(null);
    const count = recount();
    // سقف سخت — اگر به هر دلیل رد شد، اضافه‌ها حذف می‌شوند
    if (count > MAX_WORDS && editorRef.current) {
      const words = editorRef.current.innerText
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, MAX_WORDS);
      editorRef.current.innerText = words.join(" ");
      setWordCount(MAX_WORDS);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (feedback) {
      e.preventDefault();
      return;
    }
    // جلوگیری از تایپ بعد از سقف — حذف و حرکت آزاد است
    const addsWord =
      e.key.length === 1 || e.key === " " || e.key === "Enter";
    if (addsWord && wordCount >= MAX_WORDS) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const remaining = MAX_WORDS - wordCount;
    const pastedWords = text.split(/\s+/).filter(Boolean);
    const fitted = pastedWords.slice(0, Math.max(0, remaining)).join(" ");
    if (fitted) {
      document.execCommand("insertText", false, fitted);
      recount();
    }
  };

  /* ---------- نوار ابزار ---------- */
  const exec = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd);
  };

  const clearFormatting = () => {
    editorRef.current?.focus();
    document.execCommand("removeFormat");
  };

  /* ---------- ارسال برای اصلاح ---------- */
  const handleSubmit = async () => {
    if (!topic || !topicId || submitting) return;
    const text = editorRef.current?.innerText.trim() ?? "";
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < MIN_WORDS) {
      setApiError(
        `حداقل ${MIN_WORDS} کلمه بنویس — الان ${words.length} کلمه داری`,
      );
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch(
        `/api/practice/writing/${topicId}/correct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setApiError(
          (data as { error?: string }).error ??
            "خطای نامشخص — دوباره تلاش کن",
        );
        return;
      }
      const fb = data as WritingFeedback;
      setFeedback(fb);
      const stars =
        fb.overallScore >= 80
          ? 3
          : fb.overallScore >= 60
            ? 2
            : fb.overallScore >= 40
              ? 1
              : 0;
      saveProgress("writing", topic.id, stars, fb.overallScore);
      setBestStars((prev) => Math.max(prev, stars));
    } catch {
      setApiError("ارتباط با سرور برقرار نشد — دوباره تلاش کن");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    if (editorRef.current) editorRef.current.innerText = "";
    setFeedback(null);
    setApiError(null);
    setWordCount(0);
  };

  /* ---------- رندر ---------- */
  // لودر یکپارچهٔ سایت — v1.0.1.9
  if (loading) {
    return <PageLoader />;
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">موضوع یافت نشد</p>
        <button
          onClick={() => router.push("/training/writing")}
          className="text-emerald-600 text-sm font-bold"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const counterColor =
    wordCount >= MAX_WORDS
      ? "text-red-500"
      : wordCount >= MAX_WORDS - 30
        ? "text-amber-500"
        : "text-slate-400";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir="rtl">
      {/* ================= هدر ================= */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/training/writing")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold text-slate-800">
              {topic.titleFa}
            </h1>
            {bestStars > 0 && <Stars count={bestStars} />}
          </div>
          <p className="text-sm text-slate-500 truncate">
            <HoverableText text={topic.titleEn} />
          </p>
        </div>
      </div>

      {/* ================= صورت موضوع ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed mb-2" dir="ltr">
              <HoverableText text={topic.prompt} />
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {topic.promptFa}
            </p>
            {/* واژه‌های کاربردی */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {topic.usefulWords.map((w) => (
                <span
                  key={w.en}
                  className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full"
                  title={w.fa}
                >
                  <span dir="ltr">
                    <HoverableText text={w.en} />
                  </span>{" "}
                  — {w.fa}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ادیتور ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* نوار ابزار */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/60">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("bold")}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="درشت"
          >
            <Bold className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("italic")}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="مورب"
          >
            <Italic className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("underline")}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="زیرخط"
          >
            <Underline className="w-4 h-4 text-slate-600" />
          </button>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertUnorderedList")}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="فهرست نقطه‌ای"
          >
            <List className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertOrderedList")}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="فهرست شماره‌دار"
          >
            <ListOrdered className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearFormatting}
            className="p-2 rounded-lg hover:bg-white transition-colors font-black"
            title="پاک کردن قالب‌بندی"
          >
            <Eraser className="w-4 h-4 text-slate-600" />
          </button>

          {/* شمارنده کلمه */}
          <div className="flex-1" />
          <span
            className={`text-xs font-bold ${counterColor} px-2`}
            dir="ltr"
          >
            {wordCount} / {MAX_WORDS}
          </span>
        </div>

        {/* ناحیه نوشتن */}
        <div
          ref={editorRef}
          contentEditable={!feedback}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          dir="ltr"
          data-placeholder="Start writing here..."
          className="min-h-[16rem] max-h-[32rem] overflow-y-auto p-5 text-[15px] leading-[1.9] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-100 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300"
        />
      </div>

      {/* خطا */}
      <AnimatePresence>
        {apiError && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
          >
            {apiError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ================= دکمه‌ها ================= */}
      <div className="mt-5 flex justify-center gap-3">
        {!feedback ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || wordCount < MIN_WORDS}
            className="px-8 py-3 bg-linear-to-l from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال اصلاح متن... (تا یک دقیقه)
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                ارسال برای اصلاح
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            نوشتن دوباره
          </button>
        )}
      </div>

      {/* ================= نتیجه اصلاح ================= */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            {/* کارت امتیاز */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                <ScoreRing score={feedback.overallScore} />
                <div className="flex-1 max-w-sm text-center md:text-right">
                  <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    {feedback.onTopic
                      ? "متن با موضوع هم‌خوانی دارد"
                      : "متن کمی از موضوع فاصله دارد"}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {feedback.summary}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-[11px] font-bold text-slate-400">
                    <span>{feedback.wordCount} کلمه</span>
                    <span className="text-slate-200">|</span>
                    <Stars
                      count={
                        feedback.overallScore >= 80
                          ? 3
                          : feedback.overallScore >= 60
                            ? 2
                            : feedback.overallScore >= 40
                              ? 1
                              : 0
                      }
                    />
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
                  غلط‌های املایی ({feedback.spellingErrors.length})
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
                  نکته‌های گرامری ({feedback.grammarErrors.length})
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
                  نقاط قوت
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
                  پیشنهادهای بهتر شدن
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
                onClick={() => router.push("/training/writing")}
                className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
              >
                بازگشت به لیست موضوعات
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* پانویس */}
      <p className="mt-6 text-center text-[10px] text-slate-300 flex items-center justify-center gap-1">
        <PenLine className="w-3 h-3" />
        سقف متن {MAX_WORDS} کلمه است — حداقل {MIN_WORDS} کلمه برای ارسال لازم است
      </p>
    </div>
  );
}
