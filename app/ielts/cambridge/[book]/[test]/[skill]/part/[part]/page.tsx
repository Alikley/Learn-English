"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  XCircle,
  Send,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { startAttempt, useAttempt } from "@/app/hook/ielts/useIelts";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import PageLoading from "@/app/components/PageLoading";
import {
  getStructuredExam,
  partQuestionNumbers,
  type StructBlock,
  type StructGap,
  type StructGroup,
} from "@/lib/ielts/structured-tests";
import { RiversideVillagePlan, ReasonsMovingChart } from "@/app/components/ielts/part/Diagrams";
import type { IeltsMode, IeltsSkill, IeltsSubmitResult } from "@/types/ielts";

// ========================================
// پلیر آزمون ساخت‌یافته — سبک تستینو (v1.0.3.7)
// /ielts/cambridge/[book]/[test]/[skill]/part/[part]
//
// برگهٔ امتحان واقعی کتاب (محتوای ساخت‌یافته) با:
//  - ناوبری Part 1..4 + چیپ‌های ۴۰ سوال (پاسخ‌داده = آبی)
//  - جدول/فرم/گزینه/تطبیق/نقشه/نمودار مثل کتاب
//  - تایمر حالت آزمون + پخش‌کنندهٔ صوت + تحویل خودکار
//  - تصحیح خودکار با کلید رسمی کتاب + ریویو سوال‌به‌سوال
// ========================================

/** ذخیرهٔ محلی پرچم‌های «مرور بعدی» سوال‌ها */
function loadReviewFlags(key: string): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "{}") as Record<number, boolean>;
  } catch {
    return {};
  }
}

export default function StructuredPartPage() {
  const { book, test, skill, part } = useParams<{
    book: string;
    test: string;
    skill: string;
    part: string;
  }>();
  const router = useRouter();
  const { tr, dir } = useLanguage();

  const bookId = Number(book);
  const testId = Number(test);
  const skillKey = (skill as IeltsSkill) ?? "listening";
  const partNum = Number(part);

  // آزمون ساخت‌یافته — اگر نبود به پلیر عمومی برگرد
  const exam = useMemo(
    () => getStructuredExam(bookId, testId, skillKey),
    [bookId, testId, skillKey],
  );

  const validPart =
    exam !== null && Number.isInteger(partNum) && partNum >= 1 && partNum <= exam.parts.length;
  const currentPart = exam?.parts.find((p) => p.part === partNum) ?? null;

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
  const [mode, setMode] = useState<IeltsMode>("practice");
  const [isFull, setIsFull] = useState(false);
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [initialElapsed, setInitialElapsed] = useState(0);

  const elapsed0 = useRef(0);
  const submittedRef = useRef(false);
  const sessionKey = `ielts-attempt-${bookId}-${testId}-${skillKey}`;
  const flagsKey = `ielts-review-flags-${bookId}-${testId}-${skillKey}`;
  const timerKey = `ielts-timer-${bookId}-${testId}-${skillKey}`;
  const resultKey = `ielts-result-${bookId}-${testId}-${skillKey}`;

  // شروع/ادامهٔ تلاش + خواندن حالت از query string
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      setMode(params.get("mode") === "exam" ? "exam" : "practice");
      setIsFull(params.get("full") === "1");
      setReviewFlags(loadReviewFlags(flagsKey));

      if (!exam) {
        // برگهٔ ساخت‌یافته‌ای نیست → پلیر عمومی (PDF)
        router.replace(`/ielts/cambridge/${bookId}/${testId}/${skillKey}`);
        return;
      }
      if (!validPart) {
        router.replace(`/ielts/cambridge/${bookId}/${testId}/${skillKey}/part/1`);
        return;
      }
      elapsed0.current = Date.now();
      // مبنای تایمر مشترک بین Partها — اولین ورود به آزمون ثبت می‌شود
      let base = Number(sessionStorage.getItem(timerKey) || 0);
      if (!Number.isFinite(base) || base <= 0) {
        base = Date.now();
        try {
          sessionStorage.setItem(timerKey, String(base));
        } catch {
          /* حافظهٔ نشست پر است */
        }
      }
      setInitialElapsed(Math.max(0, Math.floor((Date.now() - base) / 1000)));
      // اگر همین آزمون قبلاً تحویل شده → نمای نتیجه (نه شروع مجدد)
      const resultAttempt = sessionStorage.getItem(resultKey);
      if (resultAttempt) {
        setAttemptId(resultAttempt);
        return;
      }
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        setAttemptId(stored);
        return;
      }
      void (async () => {
        const modeParam: IeltsMode = params.get("mode") === "exam" ? "exam" : "practice";
        const r = await startAttempt(bookId, testId, skillKey, modeParam);
        if (!r.ok) {
          setStartError(r.error);
          return;
        }
        sessionStorage.setItem(sessionKey, r.payload.attemptId);
        setAttemptId(r.payload.attemptId);
        setMode(r.payload.mode);
        void recordStreakActivity();
      })();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, testId, skillKey, partNum]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // اگر تلاش قبلاً submitted باشد → نمای نتیجه
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

  const allNums = useMemo(
    () =>
      exam
        ? exam.parts
            .flatMap((p) => partQuestionNumbers(exam, p.part))
            .sort((a, b) => a - b)
        : [],
    [exam],
  );

  /** آیا سوال q پاسخ داده شده؟ (سوال ۱۱ دو جای خالی دارد) */
  const answered = useCallback(
    (q: number) => {
      if (!payload) return false;
      if (q === 11) {
        return Boolean(
          (payload.savedAnswers["l11-1"] ?? "").trim() &&
            (payload.savedAnswers["l11-2"] ?? "").trim(),
        );
      }
      return (payload.savedAnswers[`l${q}`] ?? "").trim() !== "";
    },
    [payload],
  );

  const answeredCount = useMemo(
    () => allNums.filter((q) => answered(q)).length,
    [allNums, answered],
  );

  // پاسخ یک جای خالی — سوال ۱۱ دو تکه دارد که ترکیب می‌شود
  const setGap = useCallback(
    (gap: StructGap, value: string) => {
      if (gap.q === 11 && gap.sub) {
        setAnswer(`l11-${gap.sub}`, value);
        const other = gap.sub === 1 ? payload?.savedAnswers["l11-2"] ?? "" : payload?.savedAnswers["l11-1"] ?? "";
        const v1 = gap.sub === 1 ? value : other;
        const v2 = gap.sub === 2 ? value : other;
        setAnswer("l11", `${v1} ${v2}`.trim());
        return;
      }
      setAnswer(`l${gap.q}`, value);
    },
    [setAnswer, payload],
  );

  const gapValue = useCallback(
    (gap: StructGap): string => {
      if (gap.q === 11 && gap.sub) return payload?.savedAnswers[`l11-${gap.sub}`] ?? "";
      return payload?.savedAnswers[`l${gap.q}`] ?? "";
    },
    [payload],
  );

  const toggleFlag = useCallback(
    (q: number | null) => {
      if (q === null) return;
      setReviewFlags((prev) => {
        const next = { ...prev, [q]: !prev[q] };
        try {
          sessionStorage.setItem(flagsKey, JSON.stringify(next));
        } catch {
          /* حافظهٔ نشست پر است */
        }
        return next;
      });
    },
    [flagsKey],
  );

  // ارسال زمان صرف‌شده هنگام خروج
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
      sessionStorage.removeItem(timerKey);
      // نگه‌داشتن نشانهٔ نتیجه — بازگشت به Partها نتیجه را نشان می‌دهد
      try {
        sessionStorage.setItem(resultKey, attemptId);
      } catch {
        /* حافظهٔ نشست پر است */
      }
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

  const goPart = useCallback(
    (n: number) => {
      if (!exam || n < 1 || n > exam.parts.length || n === partNum) return;
      void flush();
      const q = new URLSearchParams();
      if (mode === "exam") q.set("mode", "exam");
      if (isFull) q.set("full", "1");
      router.push(`/ielts/cambridge/${bookId}/${testId}/${skillKey}/part/${n}${q.toString() ? `?${q}` : ""}`);
    },
    [exam, partNum, flush, mode, isFull, router, bookId, testId, skillKey],
  );

  const scrollToQuestion = useCallback((q: number) => {
    setActiveQuestion(q);
    document.getElementById(`q-${q}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      document.getElementById(`input-q-${q}`)?.focus();
    }, 350);
  }, []);

  const exitHref = `/ielts/cambridge/${bookId}`;

  // ================= رندر =================

  if (startError || error) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="text-red-500 mb-3" size={36} />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{startError ?? error}</p>
        <Link href={exitHref} className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
          {tr("بازگشت", "Back")}
        </Link>
      </div>
    );
  }

  if (!exam || !validPart || loading || !payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const showResult = result ?? submittedView;

  return (
    <div className="min-h-full bg-[#f6f7f9] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <ExamTopBar
        title={exam.title}
        skill={skillKey}
        mode={payload.mode}
        remainingSec={payload.remainingSec}
        elapsedSec={initialElapsed}
        saving={saving}
        onExit={() => {
          void flush();
          router.push(exitHref);
        }}
        onSubmit={showResult ? undefined : () => setConfirmSubmit(true)}
        submitDisabled={!!showResult}
      />

      {/* ---------- محتوای آزمون (انگلیسی — LTR) ---------- */}
      <main className="max-w-3xl mx-auto px-3 md:px-5 pt-4 pb-[290px]" dir="ltr">
        {showResult ? (
          <PartResultView
            result={result}
            stored={submittedView}
            review={
              result?.review ??
              ((payload as Partial<IeltsSubmitResult>).review ?? [])
            }
            exitHref={exitHref}
            bookId={bookId}
            testId={testId}
            isFull={isFull}
            mode={payload.mode}
            parts={exam.parts.map((p) => p.part)}
            onGoPart={goPart}
          />
        ) : (
          <>
            {/* سربرگ Part — مثل تستینو */}
            <div className="rounded-xl bg-slate-200/70 dark:bg-slate-800/70 px-5 py-4 mb-4">
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">Part {partNum}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentPart?.subtitle}</p>
            </div>

            {/* گروه‌های سوال */}
            {currentPart?.groups.map((grp, gi) => (
              <PartGroupView
                key={gi}
                group={grp}
                gapValue={gapValue}
                setGap={setGap}
                answerValue={(q) => payload.savedAnswers[`l${q}`] ?? ""}
                setAnswerFor={(q, v) => setGap({ q }, v)}
                gapAnswered={answered}
                reviewFlags={reviewFlags}
                activeQuestion={activeQuestion}
                onFocusQuestion={setActiveQuestion}
                renderChartGap={(q) => (
                  <GapInput
                    id={`input-q-${q}`}
                    q={q}
                    value={gapValue({ q })}
                    answered={answered(q)}
                    flagged={reviewFlags[q] === true}
                    active={activeQuestion === q}
                    onChange={(v) => setGap({ q }, v)}
                    onFocus={() => setActiveQuestion(q)}
                    center
                  />
                )}
              />
            ))}

            {/* دکمهٔ Part بعدی */}
            {partNum < exam.parts.length && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => goPart(partNum + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition active:scale-95"
                >
                  Part {partNum + 1}
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
            {partNum === exam.parts.length && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setConfirmSubmit(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition active:scale-95"
                >
                  <Send size={14} />
                  {tr("تحویل آزمون لیسنینگ", "Submit the listening exam")}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ---------- نوار پایین ثابت: صوت + ناوبری Part ---------- */}
      {!showResult && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-3 md:px-5 py-2.5 space-y-2">
            <RealAudioPlayer
              tracks={payload.media.audioTracks}
              shared={payload.media.audioShared}
              examMode={payload.mode === "exam"}
            />
            <div className="flex items-center gap-2 flex-wrap" dir={dir}>
              {/* چک‌باکس Review — سوال فعال را برای مرور پرچم می‌زند */}
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  className="accent-amber-500 w-3.5 h-3.5"
                  checked={activeQuestion !== null && reviewFlags[activeQuestion] === true}
                  disabled={activeQuestion === null}
                  onChange={() => toggleFlag(activeQuestion)}
                />
                {tr("مرور", "Review")}
              </label>

              {exam.parts.map((p) => {
                const nums = partQuestionNumbers(exam, p.part);
                const done = nums.filter((q) => answered(q)).length;
                const isCurrent = p.part === partNum;
                return (
                  <div key={p.part} className="min-w-0">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 shrink-0">
                          Part {p.part}
                        </span>
                        {nums.map((q) => (
                          <button
                            key={q}
                            onClick={() => scrollToQuestion(q)}
                            title={
                              reviewFlags[q]
                                ? tr(`سوال ${q} — برای مرور`, `Question ${q} — flagged for review`)
                                : tr(`رفتن به سوال ${q}`, `Go to question ${q}`)
                            }
                            className={`
                              w-7 h-7 rounded-md text-[11px] font-black transition tabular-nums
                              ${
                                reviewFlags[q]
                                  ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-2 border-amber-400"
                                  : answered(q)
                                    ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-2 border-sky-500"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-sky-400"
                              }
                              ${activeQuestion === q ? "ring-2 ring-sky-400 ring-offset-1 dark:ring-offset-slate-900" : ""}
                            `}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => goPart(p.part)}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition
                          ${
                            p.part < partNum
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/15"
                          }
                        `}
                      >
                        <span>Part {p.part}</span>
                        <span className="text-slate-400 tabular-nums" dir="ltr">
                          {done} / {nums.length}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- مودال تأیید تحویل ---------- */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5">
              <ClipboardCheck size={20} className="text-emerald-500" />
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                {tr("تحویل آزمون لیسنینگ؟", "Submit the listening exam?")}
              </p>
            </div>
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
              {tr(
                `به ${answeredCount} از ${allNums.length} سوال پاسخ داده‌ای. بعد از تحویل، برگه با پاسخ‌نامهٔ رسمی کتاب تصحیح می‌شود و قابل بازگشت نیست.`,
                `You have answered ${answeredCount} of ${allNums.length} questions. After submitting, your paper is graded with the official answer key and cannot be resumed.`,
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {tr("بازگشت", "Back")}
              </button>
              <button
                onClick={() => void doSubmit()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {tr("تحویل و مشاهدهٔ نتیجه", "Submit & see result")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ورودی جای خالی ----------

function GapInput({
  id,
  q,
  sub,
  value,
  answered,
  flagged,
  active,
  onChange,
  onFocus,
  center,
  width,
}: {
  id?: string;
  q: number;
  sub?: 1 | 2;
  value: string;
  answered: boolean;
  flagged: boolean;
  active: boolean;
  onChange: (v: string) => void;
  onFocus?: () => void;
  center?: boolean;
  width?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 align-middle" id={`q-${q}`}>
      <span
        className={`
          w-5 h-5 rounded text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums
          ${
            flagged
              ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }
        `}
      >
        {q}
        {sub ? `.${sub}` : ""}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        dir="ltr"
        autoComplete="off"
        className={`
          ${width ?? "w-28"} h-8 px-2 rounded-lg border text-xs font-semibold outline-none transition
          ${
            answered
              ? "border-sky-400 bg-sky-50/60 dark:bg-sky-500/10 text-slate-700 dark:text-slate-200"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          }
          focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/30
          ${active ? "ring-2 ring-sky-300 dark:ring-sky-500/40" : ""}
          ${center ? "text-center" : ""}
        `}
      />
    </span>
  );
}

// ---------- رندر یک گروه سوال ----------

function PartGroupView({
  group,
  gapValue,
  setGap,
  answerValue,
  setAnswerFor,
  gapAnswered,
  reviewFlags,
  activeQuestion,
  onFocusQuestion,
  renderChartGap,
}: {
  group: StructGroup;
  gapValue: (gap: StructGap) => string;
  setGap: (gap: StructGap, v: string) => void;
  answerValue: (q: number) => string;
  setAnswerFor: (q: number, v: string) => void;
  gapAnswered: (q: number) => boolean;
  reviewFlags: Record<number, boolean>;
  activeQuestion: number | null;
  onFocusQuestion: (q: number) => void;
  renderChartGap: (q: number) => React.ReactNode;
}) {
  const gapNode = (gap: StructGap) => (
    <GapInput
      id={`input-q-${gap.q}${gap.sub ? `-${gap.sub}` : ""}`}
      q={gap.q}
      sub={gap.sub}
      value={gapValue(gap)}
      answered={gapAnswered(gap.q)}
      flagged={reviewFlags[gap.q] === true}
      active={activeQuestion === gap.q}
      onChange={(v) => setGap(gap, v)}
      onFocus={() => onFocusQuestion(gap.q)}
    />
  );

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 md:p-6 mb-4 shadow-sm">
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{group.heading}</h3>
      <div className="mt-1.5 mb-4 space-y-0.5">
        {group.instruction.map((line, i) => (
          <p key={i} className="text-xs leading-6 text-slate-600 dark:text-slate-400">
            {i === group.instruction.length - 1 && group.instruction.length > 1 ? (
              <strong className="font-bold text-slate-700 dark:text-slate-300">{line}</strong>
            ) : (
              line
            )}
          </p>
        ))}
      </div>
      <BlockView
        block={group.block}
        gapNode={gapNode}
        renderChartGap={renderChartGap}
        answerValue={answerValue}
        setAnswerFor={setAnswerFor}
        reviewFlags={reviewFlags}
        onFocusQuestion={onFocusQuestion}
      />
    </section>
  );
}

function BlockView({
  block,
  gapNode,
  renderChartGap,
  answerValue,
  setAnswerFor,
  reviewFlags,
  onFocusQuestion,
}: {
  block: StructBlock;
  gapNode: (gap: StructGap) => React.ReactNode;
  renderChartGap: (q: number) => React.ReactNode;
  answerValue: (q: number) => string;
  setAnswerFor: (q: number, v: string) => void;
  reviewFlags: Record<number, boolean>;
  onFocusQuestion: (q: number) => void;
}) {
  switch (block.kind) {
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs" dir="ltr">
            <tbody>
              {block.title && (
                <tr>
                  <th
                    colSpan={4}
                    className="border border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide px-3 py-2.5 text-center"
                  >
                    {block.title}
                  </th>
                </tr>
              )}
              {block.rows.map((row, ri) => {
                const span = row.cells.reduce((s, c) => s + (c.wide ? row.cells.length : 1), 0);
                return (
                  <tr key={ri}>
                    {row.cells.map((cell, ci) => (
                      <td
                        key={ci}
                        colSpan={cell.wide ? Math.max(2, 4 - span + 1) : undefined}
                        className={`
                          border border-slate-400 dark:border-slate-600 px-3 py-2.5 align-top leading-7
                          ${cell.header ? "bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200" : "text-slate-700 dark:text-slate-300"}
                        `}
                      >
                        <span className="whitespace-pre-line">
                          {cell.parts.map((p, pi) =>
                            typeof p === "string" ? (
                              <span key={pi}>{p}</span>
                            ) : (
                              <span key={pi} className="inline-block align-middle mx-0.5">
                                {gapNode(p)}
                              </span>
                            ),
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case "list":
      return (
        <div dir="ltr">
          {block.title && (
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">
              {block.title}
            </p>
          )}
          <ul className="space-y-2.5">
            {block.items.map((item, i) =>
              "h" in item ? (
                <li key={i} className="text-xs font-black text-slate-700 dark:text-slate-200 pt-2">
                  {item.h}
                </li>
              ) : (
                <li key={i} className="flex gap-2 text-xs leading-7 text-slate-700 dark:text-slate-300">
                  <span className="text-sky-500 shrink-0 mt-0.5">•</span>
                  <span className="whitespace-pre-line">
                    {item.parts.map((p, pi) =>
                      typeof p === "string" ? (
                        <span key={pi}>{p}</span>
                      ) : (
                        <span key={pi} className="inline-block align-middle mx-0.5">
                          {gapNode(p)}
                        </span>
                      ),
                    )}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      );

    case "mcq":
      return (
        <div dir="ltr" className="space-y-5">
          {block.example && (
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">
                Example
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">{block.example.stem}</p>
              <div className="space-y-1.5">
                {block.example.options.map((o) => (
                  <p
                    key={o.letter}
                    className={`
                      text-xs leading-6 px-2 py-1 rounded-lg
                      ${
                        o.letter === block.example?.answer
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      }
                    `}
                  >
                    <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                    {o.letter === block.example?.answer && (
                      <CheckCircle2 size={13} className="inline ml-1.5 -mt-0.5 text-emerald-600" />
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
          {block.items.map((item) => (
            <div key={item.q} id={`q-${item.q}`} className="space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-6">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-black mr-2 tabular-nums
                    ${
                      reviewFlags[item.q]
                        ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
                        : "bg-sky-600 text-white"
                    }
                  `}
                >
                  {item.q}
                </span>
                {item.stem}
              </p>
              <div className="space-y-1.5 ps-4">
                {item.options.map((o) => (
                  <label
                    key={o.letter}
                    className="flex items-start gap-2.5 text-xs leading-6 text-slate-700 dark:text-slate-300 cursor-pointer rounded-lg px-2.5 py-1.5 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition"
                  >
                    <input
                      type="radio"
                      name={`mcq-${item.q}`}
                      checked={answerValue(item.q) === o.letter}
                      onChange={() => {
                        setAnswerFor(item.q, o.letter);
                        onFocusQuestion(item.q);
                      }}
                      className="mt-1 accent-sky-600"
                    />
                    <span>
                      <strong className="font-black text-slate-800 dark:text-slate-100">{o.letter}</strong>
                      &nbsp; {o.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "matching":
      return (
        <div dir="ltr" className="space-y-4">
          {block.prompt && <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">{block.prompt}</p>}
          <div className="space-y-2">
            {block.example && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase w-16">Example</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{block.example.label}:</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black border-2 border-emerald-400">
                  {block.example.answer}
                </span>
              </div>
            )}
            {block.items.map((item) => (
              <div key={item.q} id={`q-${item.q}`} className="flex items-center gap-3 text-xs">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-black tabular-nums shrink-0
                    ${
                      reviewFlags[item.q]
                        ? "bg-amber-100 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }
                  `}
                >
                  {item.q}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200 min-w-[110px]">{item.label}:</span>
                <select
                  value={answerValue(item.q)}
                  onChange={(e) => {
                    setAnswerFor(item.q, e.target.value);
                    onFocusQuestion(item.q);
                  }}
                  dir="ltr"
                  className="
                    h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                    text-xs font-black text-slate-700 dark:text-slate-200 outline-none
                    focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/30
                  "
                >
                  <option value="">—</option>
                  {block.options.map((o) => (
                    <option key={o.letter} value={o.letter}>
                      {o.letter} — {o.text}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {/* جعبهٔ گزینه‌ها */}
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">
              Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {block.options.map((o) => (
                <p key={o.letter} className="text-xs leading-6 text-slate-700 dark:text-slate-300">
                  <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      );

    case "plan":
      return (
        <div dir="ltr" className="space-y-4">
          <RiversideVillagePlan />
          <div className="space-y-2 max-w-md">
            {block.labels.map((l, i) => (
              <p key={i} className="text-xs leading-8 text-slate-700 dark:text-slate-300">
                {l.parts.map((p, pi) =>
                  typeof p === "string" ? (
                    <span key={pi}>{p}</span>
                  ) : (
                    <span key={pi} className="inline-block align-middle mx-0.5">
                      {gapNode(p)}
                    </span>
                  ),
                )}
              </p>
            ))}
          </div>
        </div>
      );

    case "chart":
      return (
        <div dir="ltr" className="space-y-4">
          <ReasonsMovingChart bars={block.bars} renderGap={renderChartGap} />
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {block.options.map((o) => (
                <p key={o.letter} className="text-xs leading-6 text-slate-700 dark:text-slate-300">
                  <strong className="font-black">{o.letter}</strong> &nbsp;{o.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
  }
}

// ---------- نمای نتیجه ----------

function PartResultView({
  result,
  stored,
  review,
  exitHref,
  bookId,
  testId,
  isFull,
  mode,
  parts,
  onGoPart,
}: {
  result: IeltsSubmitResult | null;
  stored: {
    rawScore: number | null;
    totalQuestions: number | null;
    bandScore: number | null;
    selfScored: boolean | null;
  } | null;
  review: {
    questionId: string;
    number?: number;
    yourAnswer: string;
    correctAnswer?: string;
    isCorrect: boolean;
  }[];
  exitHref: string;
  bookId: number;
  testId: number;
  isFull: boolean;
  mode: IeltsMode;
  parts: number[];
  onGoPart: (n: number) => void;
}) {
  const { tr, dir } = useLanguage();
  const rawScore = result?.rawScore ?? stored?.rawScore ?? null;
  const totalQuestions = result?.totalQuestions ?? stored?.totalQuestions ?? 40;
  const bandScore = result?.bandScore ?? stored?.bandScore ?? null;
  const keySource = result?.keySource ?? null;

  return (
    <div className="space-y-4" dir={dir}>
      {/* کارت نمره */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex flex-col items-center justify-center shrink-0">
            <Award size={18} />
            <span className="text-lg font-black leading-none mt-0.5 tabular-nums">{bandScore ?? "—"}</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
              {tr("نتیجهٔ آزمون لیسنینگ", "Listening exam result")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr("نمرهٔ خام", "Raw score")}:{" "}
              <span className="font-black text-slate-700 dark:text-slate-200 tabular-nums" dir="ltr">
                {rawScore ?? "—"} / {totalQuestions ?? 40}
              </span>
            </p>
            {(keySource === "manual" ||
              (review.length > 0 && stored?.selfScored === false)) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                <CheckCircle2 size={11} />
                {tr("تصحیح خودکار با پاسخ‌نامهٔ رسمی کتاب", "Auto-graded with the official book answer key")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ریویو سوال‌به‌سوال */}
      {review.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-black text-slate-700 dark:text-slate-200">
            {tr("مرور پاسخ‌ها (سوال‌به‌سوال)", "Answer review (question by question)")}
          </p>
          <div className="max-h-[52vh] overflow-y-auto">
            <table className="w-full text-xs" dir="ltr">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr className="text-slate-600 dark:text-slate-300">
                  <th className="px-3 py-2 text-start font-black">#</th>
                  <th className="px-3 py-2 text-start font-black">Your answer</th>
                  <th className="px-3 py-2 text-start font-black">Correct answer</th>
                  <th className="px-3 py-2 font-black">✓</th>
                </tr>
              </thead>
              <tbody>
                {review.map((r, i) => {
                  const num = r.number ?? (Number(r.questionId.replace(/^l/, "")) || i + 1);
                  return (
                    <tr
                      key={r.questionId}
                      className={
                        r.isCorrect
                          ? "bg-emerald-50/60 dark:bg-emerald-500/10"
                          : "bg-red-50/60 dark:bg-red-500/10"
                      }
                    >
                      <td className="px-3 py-1.5 font-black text-slate-600 dark:text-slate-300 tabular-nums">{num}</td>
                      <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">{r.yourAnswer || "—"}</td>
                      <td className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200">{r.correctAnswer ?? "—"}</td>
                      <td className="px-3 py-1.5 text-center">
                        {r.isCorrect ? (
                          <CheckCircle2 size={14} className="inline text-emerald-600" />
                        ) : (
                          <XCircle size={14} className="inline text-red-500" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* دکمه‌ها */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={exitHref}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
        >
          {tr("بازگشت به کتاب", "Back to the book")}
        </Link>
        {isFull && (
          <Link
            href={`/ielts/cambridge/${bookId}/${testId}/writing?mode=${mode}&full=1`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          >
            {tr("بخش بعدی: رایتینگ", "Next section: Writing")}
          </Link>
        )}
      </div>

      {/* مرور دوبارهٔ برگه‌ها */}
      <div className="flex gap-2 flex-wrap pt-1" dir="ltr">
        {parts.map((p) => (
          <button
            key={p}
            onClick={() => onGoPart(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/15"
          >
            Part {p}
          </button>
        ))}
      </div>
    </div>
  );
}
