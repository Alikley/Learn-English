"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { WritingFeedback, WritingTopic } from "@/types/training";
import { getProgress, saveProgress } from "@/lib/practice-progress";
import PromptCard from "./_components/PromptCard";
import EditorToolbar from "./_components/EditorToolbar";
import WritingFeedbackView, { starsOfScore } from "./_components/WritingFeedbackView";
import WritingHeader from "./_components/WritingHeader";
import WritingActionButtons from "./_components/WritingActionButtons";
import useWordLimitedEditor from "./_components/useWordLimitedEditor";

// ========================================
// ادیتور نوشتاری (نسخه ۱.۰.۱.۴)
// ادیتور شبیه Word با سقف سخت ۲۰۰ کلمه + اصلاح با هوش مصنوعی
// v1.0.2.7 — ریفکتوری گام ۲: صورت موضوع، نوار ابزار، نتیجهٔ اصلاح،
// هدر، دکمه‌ها و منطق سقف کلمه به _components تفکیک شدند (بدون تغییر رفتار)
// ========================================

const MIN_WORDS = 30;
const MAX_WORDS = 200;

export default function WritingEditorPage() {
  const { tr, dir } = useLanguage();
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<WritingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [bestStars, setBestStars] = useState(0);

  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ---------- ادیتور با سقف سخت کلمه ---------- */
  const {
    editorRef,
    wordCount,
    handleInput: capEditorInput,
    handleKeyDown,
    handlePaste,
    reset: resetEditor,
  } = useWordLimitedEditor(MAX_WORDS, feedback !== null);

  const handleInput = () => {
    setApiError(null);
    capEditorInput();
  };

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

  /* ---------- نوار ابزار ---------- */
  const exec = useCallback((cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd);
  }, [editorRef]);

  const clearFormatting = useCallback(() => {
    editorRef.current?.focus();
    document.execCommand("removeFormat");
  }, [editorRef]);

  /* ---------- ارسال برای اصلاح ---------- */
  const handleSubmit = async () => {
    if (!topic || !topicId || submitting) return;
    const text = editorRef.current?.innerText.trim() ?? "";
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < MIN_WORDS) {
      setApiError(
        tr(`حداقل ${MIN_WORDS} کلمه بنویس — الان ${words.length} کلمه داری`, `Write at least ${MIN_WORDS} words — you have ${words.length} now`),
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
            tr("خطای نامشخص — دوباره تلاش کن", "Unknown error — try again"),
        );
        return;
      }
      const fb = data as WritingFeedback;
      setFeedback(fb);
      const stars = starsOfScore(fb.overallScore);
      saveProgress("writing", topic.id, stars, fb.overallScore);
      setBestStars((prev) => Math.max(prev, stars));
    } catch {
      setApiError(tr("ارتباط با سرور برقرار نشد — دوباره تلاش کن", "Could not connect to the server — try again"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    resetEditor();
    setFeedback(null);
    setApiError(null);
  };

  /* ---------- رندر ---------- */
  if (loading) return <PageLoading />;

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-500">{tr("موضوع یافت نشد", "Topic not found")}</p>
        <button
          onClick={() => router.push("/training/writing")}
          className="text-emerald-600 text-sm font-bold"
        >
          {tr("بازگشت به لیست", "Back to List")}
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
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto" dir={dir}>
      {/* ================= هدر ================= */}
      <WritingHeader
        onBack={() => router.push("/training/writing")}
        titleFa={topic.titleFa}
        titleEn={topic.titleEn}
        bestStars={bestStars}
      />

      {/* ================= صورت موضوع ================= */}
      <PromptCard topic={topic} />

      {/* ================= ادیتور ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* نوار ابزار */}
        <EditorToolbar
          wordCount={wordCount}
          maxWords={MAX_WORDS}
          counterColor={counterColor}
          onExec={exec}
          onClearFormatting={clearFormatting}
        />

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
      <WritingActionButtons
        feedbackShown={feedback !== null}
        submitting={submitting}
        canSubmit={wordCount >= MIN_WORDS}
        onSubmit={handleSubmit}
        onRestart={handleRestart}
      />

      {/* ================= نتیجه اصلاح ================= */}
      <AnimatePresence>
        {feedback && (
          <WritingFeedbackView
            feedback={feedback}
            onBack={() => router.push("/training/writing")}
          />
        )}
      </AnimatePresence>

      {/* پانویس */}
      <p className="mt-6 text-center text-[10px] text-slate-300 flex items-center justify-center gap-1">
        <PenLine className="w-3 h-3" />
        {tr(`سقف متن ${MAX_WORDS} کلمه است — حداقل ${MIN_WORDS} کلمه برای ارسال لازم است`, `Text limit is ${MAX_WORDS} words — at least ${MIN_WORDS} words are needed to submit`)}
      </p>
    </div>
  );
}
