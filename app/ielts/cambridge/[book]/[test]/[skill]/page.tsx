"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Send,
  ClipboardCheck,
  Award,
  BookOpen,
  PenLine,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Zap,
  Keyboard,
  FileText,
  X,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Brain,
  Database,
  KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { startAttempt, useAttempt, submitSelfScore } from "@/app/hook/ielts/useIelts";
import { useExamPaper } from "@/app/hook/ielts/useExamPaper";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import PdfExamPanel from "@/app/components/ielts/PdfExamPanel";
import ExamPaper from "@/app/components/ielts/ExamPaper";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import PageLoading from "@/app/components/PageLoading";
import type {
  IeltsMode,
  IeltsSkill,
  IeltsSubmitResult,
  IeltsWritingPrompt,
} from "@/types/ielts";

// ========================================
// پلیر آزمون آیلتس — برگه از متن PDF (v1.0.3.6)
// /ielts/cambridge/[book]/[test]/[skill]?mode=practice|exam&full=1
//
// متن خود PDF کتاب خوانده می‌شود و «برگهٔ امتحان واقعی»
// بر اساس موضوع امتحان ساخته می‌شود:
//  - ریدینگ: پاساژها + سوال‌های ۱..۴۰ با ورودی درون‌برگ
//  - لیسنینگ: پخش صوت + برگهٔ ۴ بخش
//  - رایتینگ: صورت تسک ۱/۲ از PDF + متن‌نویسی
// پاسخ‌برگ جدا حذف شد — پاسخ‌ها داخل خود سوال‌ها ثبت می‌شوند.
// اگر برگه از PDF ساخته نشد → نمایش خود PDF + ورودی سریع.
// تصحیح: کلید دستی → پاسخ‌نامهٔ خود PDF → خودتصحیحی.
// ========================================

const SKILL_LABEL: Record<string, { fa: string; en: string }> = {
  reading: { fa: "ریدینگ", en: "Reading" },
  listening: { fa: "لیسنینگ", en: "Listening" },
  writing: { fa: "رایتینگ", en: "Writing" },
};

const NEXT_SKILL: Partial<Record<IeltsSkill, IeltsSkill>> = {
  reading: "listening",
  listening: "writing",
};

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export default function SkillPlayerPage() {
  const { book, test, skill } = useParams<{
    book: string;
    test: string;
    skill: string;
  }>();
  const router = useRouter();
  const { tr, dir } = useLanguage();
  // v1.0.4.1 — مشخصات داوطلب برای هدر برگهٔ امتحانی کاغذی
  const { user } = useAuth();

  const bookId = Number(book);
  const testId = Number(test);
  const skillKey = (skill as IeltsSkill) ?? "reading";

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState<IeltsSubmitResult | null>(null);
  const [submittedView, setSubmittedView] = useState<{
    rawScore: number | null;
    totalQuestions: number | null;
    bandScore: number | null;
    selfScored: boolean | null;
  } | null>(null);
  const [writingTask, setWritingTask] = useState<1 | 2>(1);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const elapsed0 = useRef(0);
  const submittedRef = useRef(false);
  const sessionKey = `ielts-attempt-${bookId}-${testId}-${skillKey}`;

  // برگهٔ امتحان — هوش مصنوعی (کش دائمی) با جایگزین پارسر قدیمی
  // v1.0.4.0: قبل از effect شروع تلاش صدا زده می‌شود چون شروع تلاش
  // به «آماده‌شدن برگه» وابسته است
  const {
    paper,
    loading: paperLoading,
    generating: paperGenerating,
    error: paperError,
    refetch: refetchPaper,
  } = useExamPaper(
    Number.isInteger(bookId) && bookId >= 1 && bookId <= 8 ? bookId : null,
    Number.isInteger(testId) && testId >= 1 && testId <= 4 ? testId : null,
    skillKey,
  );

  // شروع تلاش هنگام ورود — حالت از query string خوانده می‌شود (فقط کلاینت)
  // v1.0.4.0: تلاش فقط بعد از «آماده‌شدن برگه» شروع می‌شود — تا در حالت
  // آزمون، زمان ساخت برگه (فقط دفعهٔ اول) از تایمر کاربر کم نشود
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      if (
        !Number.isInteger(bookId) ||
        bookId < 1 ||
        bookId > 8 ||
        !Number.isInteger(testId) ||
        testId < 1 ||
        testId > 4 ||
        !["reading", "listening", "writing"].includes(skillKey)
      ) {
        setStartError(tr("آزمون یافت نشد (کتاب ۱..۸، تست ۱..۴)", "Test not found (book 1..8, test 1..4)"));
        return;
      }
      // برگه هنوز در حال ساخت/بارگذاری است → صبر کنیم
      if (paperLoading || paperGenerating) return;
      const modeParam: IeltsMode =
        new URLSearchParams(window.location.search).get("mode") === "exam" ? "exam" : "practice";
      elapsed0.current = Date.now();
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        setAttemptId(stored);
        return;
      }
      void (async () => {
        const r = await startAttempt(bookId, testId, skillKey, modeParam);
        if (!r.ok) {
          setStartError(r.error);
          return;
        }
        sessionStorage.setItem(sessionKey, r.payload.attemptId);
        setAttemptId(r.payload.attemptId);
        // آیلتس بخشی از استریک روزانه است
        void recordStreakActivity();
      })();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, testId, skillKey, paperLoading, paperGenerating]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // اگر تلاش از قبل submitted باشد (بازگشت به صفحه) → نمای نتیجه
  useEffect(() => {
    if (payload?.status !== "SUBMITTED" || result) return;
    const t = setTimeout(() => {
      const p = payload as unknown as {
        rawScore?: number | null;
        totalQuestions?: number | null;
        bandScore?: number | null;
        selfScored?: boolean | null;
      };
      setSubmittedView({
        rawScore: p.rawScore ?? null,
        totalQuestions: p.totalQuestions ?? null,
        bandScore: p.bandScore ?? null,
        selfScored: p.selfScored ?? null,
      });
    }, 0);
    return () => clearTimeout(t);
  }, [payload, result]);

  const meta = useMemo(() => {
    if (!payload) {
      return { questions: 40, minutes: 60, parts: skillKey === "listening" ? 4 : 3 };
    }
    if (skillKey === "reading") return { ...payload.reading };
    if (skillKey === "listening") return { ...payload.listening };
    return { ...payload.writing, questions: 2 };
  }, [payload, skillKey]);

  const answerIds = useMemo(() => {
    if (skillKey === "writing") return ["w1", "w2"];
    const prefix = skillKey === "reading" ? "r" : "l";
    return Array.from({ length: meta.questions }, (_, i) => `${prefix}${i + 1}`);
  }, [skillKey, meta.questions]);

  const answeredCount = useMemo(
    () => answerIds.filter((id) => (payload?.savedAnswers[id] ?? "").trim() !== "").length,
    [answerIds, payload],
  );

  // ارسال خودکار زمان صرف‌شده هنگام خروج (بدون تحویل)
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    await flush();
    const elapsedSec = elapsed0.current ? Math.floor((Date.now() - elapsed0.current) / 1000) : 0;
    const finalAnswers = payload?.savedAnswers ?? {};
    const r = await submit(elapsedSec, finalAnswers);
    if (r) {
      setResult(r);
      setConfirmSubmit(false);
      setSubmittedView(null);
      sessionStorage.removeItem(sessionKey);
    } else {
      submittedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, flush, payload, submit]);

  // پایان زمان در حالت آزمون → تحویل خودکار
  useEffect(() => {
    if (payload?.mode === "exam" && payload.remainingSec === 0 && !submittedRef.current && !result) {
      void doSubmit();
    }
  }, [payload, doSubmit, result]);

  const exitHref = `/ielts/cambridge/${bookId}`;
  const title = `Cambridge ${String(bookId).padStart(2, "0")} — Test ${testId}`;

  // خودتصحیحی (وقتی هیچ کلیدی نبود)
  const [selfScoreInput, setSelfScoreInput] = useState("");
  const [selfScoreSaving, setSelfScoreSaving] = useState(false);
  const [selfScoreError, setSelfScoreError] = useState<string | null>(null);
  const [selfScoreDone, setSelfScoreDone] = useState<{
    rawScore: number;
    bandScore: number;
  } | null>(null);

  const doSelfScore = useCallback(async () => {
    if (!attemptId) return;
    const n = Number(selfScoreInput);
    if (!Number.isInteger(n) || n < 0 || n > (result?.totalQuestions ?? 40)) {
      setSelfScoreError(tr("عدد بین ۰ تا تعداد سوال وارد کن", "Enter a number between 0 and the question count"));
      return;
    }
    setSelfScoreSaving(true);
    setSelfScoreError(null);
    const r = await submitSelfScore(attemptId, n);
    setSelfScoreSaving(false);
    if (!r) {
      setSelfScoreError(tr("ثبت نمره ناموفق بود — دوباره تلاش کن", "Saving failed — try again"));
      return;
    }
    setSelfScoreDone({ rawScore: r.rawScore, bandScore: r.bandScore });
  }, [attemptId, selfScoreInput, result, tr]);

  // ================= رندر =================

  if (startError || error) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="text-red-500 mb-3" size={36} />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{startError ?? error}</p>
        <Link
          href={exitHref}
          className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          {tr("بازگشت", "Back")}
        </Link>
      </div>
    );
  }

  // ---------- v1.0.4.0: اولین بازدید — برگه با AI در حال ساخت است ----------
  // این صفحه مستقل از تلاش رندر می‌شود چون تلاش هنوز شروع نشده است
  if (paperGenerating) {
    return (
      <AiBuildingScreen
        title={title}
        skillLabel={tr(SKILL_LABEL[skillKey]?.fa ?? "", SKILL_LABEL[skillKey]?.en ?? "")}
        exitHref={exitHref}
      />
    );
  }

  if (loading || !payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const isExam = payload.mode === "exam";
  const skillInfo = SKILL_LABEL[skillKey] ?? SKILL_LABEL.reading;

  // وضعیت برگهٔ امتحان
  const paperReady = !paperLoading && !paperGenerating && !paperError && paper?.ok === true;
  const paperFailed =
    !paperLoading &&
    !paperGenerating &&
    (paperError != null || (paper != null && paper.ok === false));
  const paperFailReason = paperError ?? (paper?.ok === false ? paper.reason : null);
  const paperAiError = paper?.ok === false ? paper.aiError : undefined;
  const paperAiGenerated = paper?.ok === true ? paper.aiGenerated === true : false;
  const isAiRetryable = !!paperAiError;
  const writingPrompts: IeltsWritingPrompt[] =
    paper?.ok === true && skillKey === "writing" ? (paper.writing ?? []) : [];

  // ---------- نمای نتیجه ----------
  const showResult = result ?? submittedView;

  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <ExamTopBar
        title={`${title} · ${tr(skillInfo.fa, skillInfo.en)}`}
        skill={skillKey}
        mode={payload.mode}
        remainingSec={payload.remainingSec}
        elapsedSec={0}
        saving={saving}
        onExit={() => {
          void flush();
          router.push(exitHref);
        }}
        onSubmit={showResult ? undefined : () => setConfirmSubmit(true)}
        submitDisabled={!!showResult}
      />

      <div className="max-w-3xl mx-auto px-3 md:px-5 py-4 md:py-6">
        {/* ================= نمای نتیجه ================= */}
        {showResult && (
          <ResultView
            result={result}
            stored={submittedView}
            selfScoreDone={selfScoreDone}
            skill={skillKey}
            bookId={bookId}
            testId={testId}
            isExam={isExam}
            selfScoreInput={selfScoreInput}
            setSelfScoreInput={setSelfScoreInput}
            doSelfScore={doSelfScore}
            selfScoreSaving={selfScoreSaving}
            selfScoreError={selfScoreError}
            exitHref={exitHref}
            fullNextHref={
              NEXT_SKILL[skillKey]
                ? `/ielts/cambridge/${bookId}/${testId}/${NEXT_SKILL[skillKey]}?mode=${payload.mode}&full=1`
                : null
            }
          />
        )}

        {/* ================= نمای آزمون ================= */}
        {!showResult && (
          <div className="space-y-4">
            {/* ---------- لیسنینگ: پخش‌کنندهٔ بالای برگه ---------- */}
            {skillKey === "listening" && (
              <RealAudioPlayer
                tracks={payload.media.audioTracks}
                shared={payload.media.audioShared}
                examMode={isExam}
              />
            )}

            {/* ---------- رایتینگ ---------- */}
            {skillKey === "writing" && (
              <WritingPanel
                answers={payload.savedAnswers}
                onChange={setAnswer}
                disabled={false}
                activeTask={writingTask}
                setActiveTask={setWritingTask}
                isExam={isExam}
                prompts={writingPrompts}
                paperFailed={paperFailed}
              />
            )}

            {/* ---------- ریدینگ/لیسنینگ: برگهٔ امتحان (AI / پارسر) ---------- */}
            {skillKey !== "writing" && paperReady && paper?.ok === true && (
              <ExamPaper
                skill={skillKey as "reading" | "listening"}
                bookId={bookId}
                testId={testId}
                mode={payload.mode}
                userName={user?.name ?? user?.nickname ?? ""}
                userEmail={user?.email ?? ""}
                sections={paper.sections}
                totalQuestions={Math.max(paper.totalQuestions, meta.questions)}
                answers={payload.savedAnswers}
                onChange={setAnswer}
                aiGenerated={paperAiGenerated}
              />
            )}

            {/* ---------- ریدینگ/لیسنینگ: در حال ساخت برگه ---------- */}
            {skillKey !== "writing" && paperLoading && !paperGenerating && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="animate-pulse" />
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                      {tr("در حال خواندن PDF و ساخت برگهٔ امتحان…", "Reading the PDF and building your exam paper…")}
                    </p>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full w-1/3 rounded-full bg-indigo-400"
                        animate={{ x: ["-100%", "300%"] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-2.5 w-full rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-2.5 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------- حالت جایگزین: برگه ساخته نشد → خود PDF + ورودی سریع ---------- */}
            {skillKey !== "writing" && paperFailed && (
              <>
                <div className="rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/10 p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black text-amber-700 dark:text-amber-300">
                        {tr("برگهٔ امتحان از این PDF ساخته نشد", "The exam paper could not be built from this PDF")}
                      </p>
                      <p className="text-[10px] leading-5 text-amber-600/90 dark:text-amber-400/80" dir="auto">
                        {paperFailReason ?? tr("ساختار فایل شناخته نشد", "File structure not recognized")}
                      </p>
                      {paperAiError && (
                        <p className="text-[10px] leading-5 text-amber-600/80 dark:text-amber-400/70" dir="auto">
                          {tr("ساخت هوشمند:", "Smart build:")} {paperAiError}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAiRetryable && (
                    <button
                      onClick={() => refetchPaper(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition active:scale-[0.99]"
                    >
                      <RefreshCw size={14} />
                      {tr("ساخت دوبارهٔ برگه با هوش مصنوعی", "Rebuild the paper with AI")}
                    </button>
                  )}
                </div>

                {payload.media.pdfUrl ? (
                  <div className="h-[70vh] min-h-[420px]">
                    <PdfExamPanel
                      pdfUrl={payload.media.pdfUrl}
                      bookTitle={`Cambridge IELTS ${String(bookId).padStart(2, "0")} — Official Book PDF`}
                    />
                  </div>
                ) : (
                  <div className="h-[60vh] min-h-[360px]">
                    <PdfExamPanel pdfUrl={null} bookTitle="" />
                  </div>
                )}

                {/* ورودی سریع پاسخ‌ها — جمع‌شده به‌صورت پیش‌فرض */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => setFallbackOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-start"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-black text-slate-700 dark:text-slate-200">
                      <Keyboard size={14} className="text-indigo-500" />
                      {tr(
                        `ورود سریع پاسخ‌ها (${answeredCount}/${answerIds.length})`,
                        `Quick answer entry (${answeredCount}/${answerIds.length})`,
                      )}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${fallbackOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {fallbackOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {answerIds.map((id, i) => (
                            <div key={id} className="flex items-center gap-2">
                              <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center" dir="ltr">
                                {i + 1}
                              </span>
                              <input
                                dir="ltr"
                                value={payload.savedAnswers[id] ?? ""}
                                onChange={(e) => setAnswer(id, e.target.value)}
                                maxLength={120}
                                placeholder="—"
                                className="flex-1 min-w-0 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* ---------- دکمهٔ تحویل ---------- */}
            <button
              onClick={() => setConfirmSubmit(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition active:scale-[0.99]"
            >
              <Send size={15} />
              {tr("تحویل آزمون", "Submit exam")}
              <span className="text-[10px] font-medium opacity-80">
                ({tr(`${answeredCount} پاسخ`, `${answeredCount} answered`)})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ================= دکمهٔ شناور کتاب PDF ================= */}
      {!showResult && paperReady && payload.media.pdfUrl && (
        <button
          onClick={() => setPdfOpen(true)}
          className="fixed bottom-5 end-5 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold shadow-xl backdrop-blur hover:scale-[1.03] transition"
        >
          <BookOpen size={15} />
          {tr("کتاب PDF", "Book PDF")}
        </button>
      )}

      {/* ================= پنل شناور PDF ================= */}
      <AnimatePresence>
        {pdfOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
            onClick={() => setPdfOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[560px] h-full bg-[#fbfbfb] dark:bg-[#0b1220] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                  <FileText size={14} className="text-indigo-500" />
                  {tr(`کتاب Cambridge ${String(bookId).padStart(2, "0")}`, `Cambridge ${String(bookId).padStart(2, "0")} book`)}
                </p>
                <button
                  onClick={() => setPdfOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-3">
                <PdfExamPanel
                  pdfUrl={payload.media.pdfUrl}
                  bookTitle="Official Book PDF"
                  compact
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= مودال تأیید تحویل ================= */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <ClipboardCheck size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {tr("تحویل نهایی آزمون؟", "Submit the exam?")}
                </p>
                <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400">
                  {tr(
                    `${answeredCount} پاسخ از ${answerIds.length} ثبت شده است. بعد از تحویل، پاسخ‌ها قابل ویرایش نیستند.`,
                    `${answeredCount} of ${answerIds.length} answers are filled. After submitting, answers cannot be edited.`,
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  {tr("ادامهٔ آزمون", "Keep going")}
                </button>
                <button
                  onClick={() => void doSubmit()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  {tr("بله، تحویل", "Yes, submit")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================
// v1.0.4.0 — صفحهٔ «ساخت برگه با هوش مصنوعی»
// اولین بازدید هر آزمون: PDF خوانده می‌شود، سوال‌ها و
// پاسخ‌نامهٔ رسمی با AI به برگهٔ امتحانی تبدیل می‌شوند و
// برای همیشه ذخیره می‌گردند — بازدیدهای بعدی فوری‌اند.
// ========================================

function AiBuildingScreen({
  title,
  skillLabel,
  exitHref,
}: {
  title: string;
  skillLabel: string;
  exitHref: string;
}) {
  const { tr, dir } = useLanguage();

  const steps = [
    {
      icon: BookOpen,
      fa: "خواندن PDF کتاب از Backblaze",
      en: "Reading the book PDF from Backblaze",
    },
    {
      icon: FileText,
      fa: "استخراج متن این تست از کتاب",
      en: "Extracting this test's text",
    },
    {
      icon: Brain,
      fa: "ساخت سوال‌ها و گزینه‌ها با هوش مصنوعی",
      en: "Building questions with AI",
    },
    {
      icon: KeyRound,
      fa: "استخراج پاسخ‌نامهٔ رسمی برای تصحیح خودکار",
      en: "Extracting the official answer key",
    },
    {
      icon: Database,
      fa: "ذخیرهٔ دائمی برگه برای بازدیدهای بعدی",
      en: "Saving the paper for future visits",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      {/* هدر باریک */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <p className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate" dir="ltr">
            {title} · {skillLabel}
          </p>
          <Link
            href={exitHref}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {tr("بازگشت", "Back")}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 space-y-6"
        >
          {/* آیکون + عنوان */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"
            >
              <Brain size={28} />
            </motion.div>
            <div className="space-y-1">
              <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100">
                {tr(
                  "در حال ساخت برگهٔ امتحان با هوش مصنوعی",
                  "Building your exam paper with AI",
                )}
              </p>
              <p className="text-[11px] md:text-xs leading-6 text-slate-500 dark:text-slate-400">
                {tr(
                  "سوال‌های واقعی همین تست از PDF کتاب خوانده و به برگهٔ امتحانی تعاملی تبدیل می‌شوند.",
                  "The real questions of this test are read from the book PDF and turned into an interactive exam paper.",
                )}
              </p>
            </div>
          </div>

          {/* نوار پیشرفت متحرک */}
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-l from-amber-400 to-orange-500"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            />
          </div>

          {/* مراحل */}
          <div className="space-y-2.5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 px-3.5 py-2.5"
                >
                  <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={15} />
                  </span>
                  <p className="flex-1 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                    {tr(s.fa, s.en)}
                  </p>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 * i }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* نکتهٔ صرفه‌جویی توکن */}
          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3 flex items-start gap-2.5">
            <Database size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-6 text-emerald-700 dark:text-emerald-300">
              {tr(
                "این کار فقط «یک بار» برای این آزمون انجام می‌شود و نتیجه برای همیشه ذخیره می‌گردد — دفعه‌های بعدی این برگه فوری آماده خواهد بود (حدود ۱ تا ۳ دقیقه طول می‌کشد؛ این صفحه را باز نگه دار).",
                "This happens only ONCE for this exam and the result is saved forever — next visits load instantly (it takes about 1–3 minutes; keep this page open).",
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ========================================
// پنل رایتینگ — صورت تسک از PDF + متن‌نویسی
// ========================================

function WritingPanel({
  answers,
  onChange,
  disabled,
  activeTask,
  setActiveTask,
  isExam,
  prompts,
  paperFailed,
}: {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  activeTask: 1 | 2;
  setActiveTask: (t: 1 | 2) => void;
  isExam: boolean;
  prompts: IeltsWritingPrompt[];
  paperFailed: boolean;
}) {
  const { tr } = useLanguage();
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const prompt = prompts.find((p) => p.task === activeTask) ?? null;
  const minWords = prompt?.minWords ?? (activeTask === 1 ? 150 : 250);

  return (
    <div className="space-y-3">
      {/* تب تسک */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70">
        {([1, 2] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTask(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTask === t
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t === 1 ? <BookOpen size={13} /> : <PenLine size={13} />}
            {tr(`تسک ${t} (${t === 1 ? "۲۰" : "۴۰"} دقیقه)`, `Task ${t} (${t === 1 ? "20" : "40"} min)`)}
          </button>
        ))}
      </div>

      {/* صورت تسک — از متن PDF */}
      {prompt ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <Sparkles size={12} />
            {tr("صورت تسک — خوانده‌شده از PDF کتاب", "Task prompt — read from the book PDF")}
          </p>
          <p className="text-[13px] leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-wrap" dir="ltr">
            {prompt.prompt}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 leading-6 px-1">
          {paperFailed
            ? tr(
                "صورت تسک از PDF خوانده نشد — از دکمهٔ «کتاب PDF» صورت تسک را ببین.",
                "Task prompt could not be parsed — use the “Book PDF” button to read the prompt.",
              )
            : tr(
                `در حال خواندن صورت تسک ${activeTask} از PDF…`,
                `Reading Task ${activeTask} prompt from the PDF…`,
              )}
        </p>
      )}

      {/* ناحیهٔ نوشتن */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-2">
        <textarea
          dir="ltr"
          value={text}
          onChange={(e) => onChange(currentId, e.target.value.slice(0, 8000))}
          disabled={disabled}
          rows={12}
          placeholder={isExam ? "" : "Start writing…"}
          className="w-full px-3 py-2.5 rounded-xl text-sm leading-7 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-60 transition resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Keyboard size={11} />
            {tr("ذخیرهٔ خودکار فعال است", "Autosave is on")}
          </span>
          <span
            className={`text-[11px] font-bold tabular-nums ${
              words >= minWords
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
            dir="ltr"
          >
            {words} / {minWords}+
          </span>
        </div>
      </div>
    </div>
  );
}

// ========================================
// نمای نتیجه — کارت نمره / خودتصحیحی / ریویو
// ========================================

function ResultView({
  result,
  stored,
  selfScoreDone,
  skill,
  bookId,
  testId,
  isExam,
  selfScoreInput,
  setSelfScoreInput,
  doSelfScore,
  selfScoreSaving,
  selfScoreError,
  exitHref,
  fullNextHref,
}: {
  result: IeltsSubmitResult | null;
  stored: { rawScore: number | null; totalQuestions: number | null; bandScore: number | null; selfScored: boolean | null } | null;
  selfScoreDone: { rawScore: number; bandScore: number } | null;
  skill: IeltsSkill;
  bookId: number;
  testId: number;
  isExam: boolean;
  selfScoreInput: string;
  setSelfScoreInput: (v: string) => void;
  doSelfScore: () => Promise<void>;
  selfScoreSaving: boolean;
  selfScoreError: string | null;
  exitHref: string;
  fullNextHref: string | null;
}) {
  const { tr } = useLanguage();

  const rawScore = selfScoreDone?.rawScore ?? result?.rawScore ?? stored?.rawScore ?? null;
  const totalQuestions = result?.totalQuestions ?? stored?.totalQuestions ?? null;
  const bandScore = selfScoreDone?.bandScore ?? result?.bandScore ?? stored?.bandScore ?? null;
  const selfScored =
    selfScoreDone != null
      ? true
      : result == null
        ? (stored?.selfScored ?? false)
        : false;
  const needSelfScore =
    skill !== "writing" &&
    result != null &&
    result.selfScoreRequired &&
    rawScore == null &&
    !selfScoreDone;
  const isStoredOnly = result == null && stored != null;
  const autoKeySource = result?.keySource ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* ---------- کارت نمره ---------- */}
      {(bandScore != null || skill === "writing") && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Award size={26} />
          </div>
          {skill === "writing" ? (
            <>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("رایتینگ تحویل شد", "Writing submitted")}
              </p>
              <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400">
                {tr(
                  "متن هر دو تسک ذخیره شد. نمونه پاسخ‌های سطح بالا در انتهای کتاب کمبریج است — با نوشتهٔ خودت مقایسه‌شان کن.",
                  "Both task texts are saved. Model answers are at the end of the Cambridge book — compare them with yours.",
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-50 tabular-nums" dir="ltr">
                {bandScore}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr("بند آیلتس", "IELTS band")} ·{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200" dir="ltr">
                  {rawScore}/{totalQuestions}
                </span>
              </p>
              {selfScored ? (
                <span className="inline-block text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2.5 py-1">
                  {tr("خودتصحیحی از روی پاسخ‌نامهٔ کتاب", "Self-scored from the book's answer key")}
                </span>
              ) : autoKeySource === "ai" ? (
                <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
                  {tr("تصحیح خودکار با پاسخ‌نامهٔ استخراج‌شده توسط هوش مصنوعی", "Auto-marked with the AI-extracted answer key")}
                </span>
              ) : autoKeySource === "pdf" ? (
                <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
                  {tr("تصحیح خودکار با پاسخ‌نامهٔ خود کتاب (PDF)", "Auto-marked with the book's own answer key (PDF)")}
                </span>
              ) : autoKeySource === "manual" ? (
                <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-2.5 py-1">
                  {tr("تصحیح خودکار", "Auto-marked")}
                </span>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* ---------- خودتصحیحی (وقتی هیچ کلیدی نبود) ---------- */}
      {needSelfScore && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <ClipboardCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("نوبت تصحیح است!", "Time to score!")}
              </p>
              <p className="text-[10px] text-slate-400">
                {tr("پاسخ‌نامهٔ این کتاب از PDF خوانده نشد — خودت تصحیح کن", "This book's answer key could not be parsed from the PDF — self-score")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3.5 space-y-2">
            <p className="text-[11px] leading-6 text-slate-600 dark:text-slate-300">
              {tr(
                "۱) در PDF کتاب به «Answer key» انتهای کتاب برو · ۲) پاسخ‌های درستت را بشمار · ۳) عدد را اینجا وارد کن تا بندت محاسبه و ثبت شود.",
                "1) Open the “Answer key” section at the end of the book · 2) Count your correct answers · 3) Enter the number here to calculate and save your band.",
              )}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                dir="ltr"
                min={0}
                max={totalQuestions ?? 40}
                value={selfScoreInput}
                onChange={(e) => setSelfScoreInput(e.target.value)}
                placeholder={tr("تعداد پاسخ درست", "Correct answers")}
                className="w-36 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              />
              <span className="text-[11px] text-slate-400" dir="ltr">
                / {totalQuestions ?? 40}
              </span>
              <button
                onClick={() => void doSelfScore()}
                disabled={selfScoreSaving}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-60 transition"
              >
                {selfScoreSaving ? tr("در حال ثبت…", "Saving…") : tr("ثبت نمره و محاسبهٔ بند", "Save & calculate band")}
              </button>
            </div>
            {selfScoreError && (
              <p className="text-[10px] font-bold text-red-500">{selfScoreError}</p>
            )}
          </div>
        </div>
      )}

      {/* ---------- ریویو سوال به سوال (کلید موجود) ---------- */}
      {result?.review && result.review.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 px-1 pb-1">
            {tr("ریویو سوال به سوال", "Question-by-question review")}
          </p>
          <div className="grid gap-1.5 max-h-96 overflow-y-auto">
            {result.review.map((r) => (
              <div
                key={r.questionId}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${
                  r.isCorrect
                    ? "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-red-50/70 dark:bg-red-500/10 border-red-100 dark:border-red-500/20"
                }`}
              >
                {r.isCorrect ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-500 shrink-0" />
                )}
                <span className="text-[10px] font-black text-slate-500 w-6 shrink-0" dir="ltr">
                  {r.number}
                </span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate flex-1" dir="ltr">
                  {r.yourAnswer || "—"}
                </span>
                {!r.isCorrect && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0" dir="ltr">
                    ✓ {r.correctAnswer}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- متن‌های رایتینگ ---------- */}
      {skill === "writing" && result?.writingSubmissions && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 px-1">
            {tr("متن‌های تو", "Your submissions")}
          </p>
          {result.writingSubmissions.map((w) => (
            <div key={w.questionId} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
              <p className="text-[10px] font-bold text-slate-500 mb-1.5" dir="ltr">
                Task {w.questionId === "w1" ? "1" : "2"} — {w.wordCount} words
              </p>
              <p className="text-[11px] leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap" dir="ltr">
                {w.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---------- دکمه‌های پایان ---------- */}
      <div className="flex flex-col sm:flex-row gap-2">
        {fullNextHref && (
          <Link
            href={fullNextHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold transition"
          >
            <Zap size={15} />
            {tr("بخش بعدی آزمون کامل", "Next section of the full test")}
          </Link>
        )}
        <Link
          href={exitHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {tr(`بازگشت به کتاب ${bookId} — تست ${testId}`, `Back to book ${bookId} — test ${testId}`)}
        </Link>
      </div>

      {isExam && !isStoredOnly && (
        <p className="text-center text-[10px] text-slate-400">
          {tr(
            "مثل آزمون واقعی: نمرهٔ رایتینگ آیلتس توسط ممتحن داده می‌شود؛ برای ریدینگ/لیسنینگ اگر پاسخ‌نامهٔ کتاب از PDF خوانده نشد، از انتهای کتاب تصحیح کن.",
            "Like the real test: writing is scored by an examiner; for reading/listening, if the book's answer key was not parsed, mark it from the end of the book.",
          )}
        </p>
      )}
    </motion.div>
  );
}
