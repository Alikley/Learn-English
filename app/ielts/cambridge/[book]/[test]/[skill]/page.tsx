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
  ListChecks,
  PenLine,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Zap,
  Keyboard,
  ScrollText,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { startAttempt, useAttempt, submitSelfScore } from "@/app/hook/ielts/useIelts";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import PdfExamPanel from "@/app/components/ielts/PdfExamPanel";
import ExamPaperPanel from "@/app/components/ielts/ExamPaperPanel";
import AnswerSheet from "@/app/components/ielts/AnswerSheet";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import PageLoading from "@/app/components/PageLoading";
import type {
  IeltsMode,
  IeltsSkill,
  IeltsSubmitResult,
} from "@/types/ielts";

// ========================================
// پلیر آزمون آیلتس — نسخهٔ واقعی (v1.0.3.4)
// /ielts/cambridge/[book]/[test]/[skill]?mode=practice|exam&full=1
//
// محتوای واقعی: PDF کتاب کمبریج (باکت B2 کاربر) + صدای واقعی
//  - حالت آزمون: «برگهٔ امتحانی اختصاصی» فقط صفحات همین تست/مهارت
//    (صفحهٔ جلد امتحانی + صفحات L/R/W) — مثل آزمون واقعی
//  - حالت تمرین: PDF کامل کتاب (بدون تغییر)
//  - لیسنینگ: پخش‌کنندهٔ فایل واقعی + پاسخ‌برگ (حالت آزمون: بدون seek)
//  - رایتینگ: برگهٔ صورت سوال + دو textarea با شمارش کلمه
//  - تایمر + ذخیرهٔ خودکار + تحویل + خودتصحیحی از روی پاسخ‌نامهٔ کتاب
//  - full=1: زنجیرهٔ آزمون کامل (لیسنینگ → ریدینگ → رایتینگ)
//    — مثل آزمون واقعی آیلتس که با لیسنینگ شروع می‌شود
// ========================================

const SKILL_LABEL: Record<string, { fa: string; en: string }> = {
  reading: { fa: "ریدینگ", en: "Reading" },
  listening: { fa: "لیسنینگ", en: "Listening" },
  writing: { fa: "رایتینگ", en: "Writing" },
};

// زنجیرهٔ آزمون کامل — مثل آزمون واقعی: لیسنینگ → ریدینگ → رایتینگ
const NEXT_SKILL: Partial<Record<IeltsSkill, IeltsSkill>> = {
  listening: "reading",
  reading: "writing",
};

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

type MobileTab = "pdf" | "sheet";

export default function SkillPlayerPage() {
  const { book, test, skill } = useParams<{
    book: string;
    test: string;
    skill: string;
  }>();
  const router = useRouter();
  const { tr, dir } = useLanguage();

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("sheet");
  const [writingTask, setWritingTask] = useState<1 | 2>(1);

  const elapsed0 = useRef(0);
  const submittedRef = useRef(false);
  const sessionKey = `ielts-attempt-${bookId}-${testId}-${skillKey}`;

  // شروع تلاش هنگام ورود — حالت از query string خوانده می‌شود (فقط کلاینت)
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
  }, [bookId, testId, skillKey]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // اگر تلاش از قبل submitted باشد (بازگشت به صفحه) → نمای نتیجه
  // (الگوی تاخیری سایت — سازگار با React Compiler)
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

  // خودتصحیحی
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

  if (loading || !payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const isExam = payload.mode === "exam";
  const skillInfo = SKILL_LABEL[skillKey] ?? SKILL_LABEL.reading;

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

      <div className="max-w-7xl mx-auto px-3 md:px-5 py-4 md:py-6">
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
            answerKeyUrl={payload.media.pdfUrl}
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
          <>
            {/* تب موبایل: برگهٔ امتحانی / پاسخ‌برگ */}
            <div className="flex lg:hidden gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 mb-3">
              {([
                ["sheet", skillKey === "writing" ? tr("نوشتن", "Writing") : tr("پاسخ‌برگ", "Answer sheet"), skillKey === "writing" ? PenLine : ClipboardCheck],
                [
                  "pdf",
                  isExam
                    ? tr("برگهٔ امتحانی", "Exam paper")
                    : tr("کتاب (PDF)", "Book (PDF)"),
                  isExam ? ScrollText : BookOpen,
                ],
              ] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setMobileTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition ${
                    mobileTab === key
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4 items-start">
              {/* ---------- برگهٔ امتحانی (آزمون) / PDF کتاب (تمرین) ---------- */}
              <div className={`${mobileTab === "pdf" ? "block" : "hidden"} lg:block lg:sticky lg:top-20 h-[calc(100vh-7rem)] min-h-[480px]`}>
                {isExam ? (
                  <ExamPaperPanel
                    bookId={bookId}
                    testId={testId}
                    skill={skillKey}
                    fallbackPdfUrl={payload.media.pdfUrl}
                  />
                ) : (
                  <PdfExamPanel
                    pdfUrl={payload.media.pdfUrl}
                    bookTitle={`Cambridge IELTS ${String(bookId).padStart(2, "0")} — ${payload.media.error ? "" : "Official Book PDF"}`}
                  />
                )}
              </div>

              {/* ---------- پنل مهارت ---------- */}
              <div className={`${mobileTab === "sheet" ? "block" : "hidden"} lg:block space-y-4`}>
                {skillKey === "listening" && (
                  <RealAudioPlayer
                    tracks={payload.media.audioTracks}
                    shared={payload.media.audioShared}
                    examMode={isExam}
                  />
                )}

                {skillKey === "writing" ? (
                  <WritingPanel
                    answers={payload.savedAnswers}
                    onChange={setAnswer}
                    disabled={false}
                    activeTask={writingTask}
                    setActiveTask={setWritingTask}
                    isExam={isExam}
                  />
                ) : (
                  <AnswerSheet
                    prefix={skillKey === "reading" ? "r" : "l"}
                    questions={meta.questions}
                    parts={skillKey === "reading" ? (payload.reading.parts ?? 3) : 4}
                    answers={payload.savedAnswers}
                    onChange={setAnswer}
                  />
                )}

                {/* دکمهٔ تحویل پایین پنل */}
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
            </div>
          </>
        )}
      </div>

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
// پنل رایتینگ — دو تسک با شمارش کلمه (مثل تسک‌شیت واقعی)
// ========================================

const TASK_MIN_WORDS: Record<number, number> = { 1: 150, 2: 250 };

function WritingPanel({
  answers,
  onChange,
  disabled,
  activeTask,
  setActiveTask,
  isExam,
}: {
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  activeTask: 1 | 2;
  setActiveTask: (t: 1 | 2) => void;
  isExam: boolean;
}) {
  const { tr } = useLanguage();
  const currentId = `w${activeTask}`;
  const text = answers[currentId] ?? "";
  const words = countWords(text);
  const minWords = TASK_MIN_WORDS[activeTask];

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
            {t === 1 ? <ListChecks size={13} /> : <PenLine size={13} />}
            {tr(`تسک ${t} (${t === 1 ? "۲۰" : "۴۰"} دقیقه)`, `Task ${t} (${t === 1 ? "20" : "40"} min)`)}
          </button>
        ))}
      </div>

      {/* ناحیهٔ نوشتن */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-2">
        <p className="text-[11px] text-slate-400 leading-6">
          {tr(
            `صورت تسک ${activeTask} را از PDF کتاب بخوان (نمودار/جدول برای تسک ۱ و موضوع مقاله برای تسک ۲).`,
            `Read Task ${activeTask} prompt from the book PDF (chart/table for Task 1, essay topic for Task 2).`,
          )}
        </p>
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
  answerKeyUrl,
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
  answerKeyUrl: string | null;
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
              {selfScored && (
                <span className="inline-block text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2.5 py-1">
                  {tr("خودتصحیحی از روی پاسخ‌نامهٔ کتاب", "Self-scored from the book's answer key")}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- خودتصحیحی ---------- */}
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
                {tr("پاسخ‌برگ تحویل شد — حالا خودت تصحیح کن", "Answer sheet submitted — now self-score")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3.5 space-y-2">
            <p className="text-[11px] leading-6 text-slate-600 dark:text-slate-300">
              {tr(
                "۱) در PDF کتاب به بخش «Answer key» انتهای کتاب برو · ۲) پاسخ‌های درستت را بشمار · ۳) عدد را اینجا وارد کن تا بندت محاسبه و ثبت شود.",
                "1) Open the “Answer key” section at the end of the book · 2) Count your correct answers · 3) Enter the number here to calculate and save your band.",
              )}
            </p>
            {answerKeyUrl && (
              <a
                href={answerKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
              >
                <ExternalLink size={12} />
                {tr("باز کردن PDF کتاب (پاسخ‌نامه در انتهای کتاب)", "Open the book PDF (answer key at the end)")}
              </a>
            )}
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
            "مثل آزمون واقعی: نمرهٔ رایتینگ آیلتس توسط ممتحن داده می‌شود؛ برای ریدینگ/لیسنینگ از پاسخ‌نامهٔ کتاب تصحیح کن.",
            "Like the real test: writing is scored by an examiner; self-score reading/listening with the book's answer key.",
          )}
        </p>
      )}
    </motion.div>
  );
}
