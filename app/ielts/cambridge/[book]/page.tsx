"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Headphones,
  PenLine,
  Loader2,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Award,
  Send,
  PlayCircle,
  BookOpen,
  BarChart3,
  History,
  Zap,
  CheckCircle2,
  Circle,
  Hourglass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeBook, startAttempt } from "@/app/hook/ielts/useIelts";
import { getStructuredExam } from "@/lib/ielts/structured-tests";
import PageLoading from "@/app/components/PageLoading";
import type { IeltsAttemptSummary, IeltsMode, IeltsSkill } from "@/types/ielts";

// ========================================
// صفحهٔ جزئیات کتاب کمبریج (v1.0.3.3)
// «باکس به باکس» مثل تستینو — ۴ کارت تست (Test 1..4) هرکدام با:
//  - سه ردیف مهارت (ریدینگ/لیسنینگ/رایتینگ) + وضعیت + بهترین بند
//  - انتخاب حالت (تمرین/آزمون) و شروع
//  - دکمهٔ «آزمون کامل» (ریدینگ → لیسنینگ → رایتینگ پشت سر هم)
// سه تب: آزمون / آمار / نتیجه (تاریخچهٔ تلاش‌ها)
// ========================================

type Tab = "test" | "stats" | "result";

const SKILLS: { key: IeltsSkill; fa: string; en: string; icon: typeof ClipboardList; color: string }[] = [
  { key: "reading", fa: "ریدینگ", en: "Reading", icon: ClipboardList, color: "indigo" },
  { key: "listening", fa: "لیسنینگ", en: "Listening", icon: Headphones, color: "sky" },
  { key: "writing", fa: "رایتینگ", en: "Writing", icon: PenLine, color: "emerald" },
];

export default function BookDetailPage() {
  const { book: bookParam } = useParams<{ book: string }>();
  const { tr, dir } = useLanguage();
  const bookId = Number(bookParam);
  const valid = Number.isInteger(bookId) && bookId >= 1 && bookId <= 8;
  const { detail, loading, error, refetch } = useCambridgeBook(valid ? bookId : null);
  const [tab, setTab] = useState<Tab>("test");
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const router = useRouter();

  const num = String(bookId).padStart(2, "0");

  async function begin(
    testId: number,
    skill: IeltsSkill,
    mode: IeltsMode,
    full = false,
  ) {
    if (!valid) return;
    setStarting(`${testId}-${skill}-${mode}${full ? "-full" : ""}`);
    setStartError(null);
    const r = await startAttempt(bookId, testId, skill, mode);
    setStarting(null);
    if (!r.ok) {
      setStartError(r.error);
      return;
    }
    // شروع تمرین جدید → نمای نتیجهٔ قبلی کنار برود
    try {
      sessionStorage.removeItem(`ielts-result-${bookId}-${testId}-${skill}`);
    } catch {
      /* حافظهٔ نشست پر است */
    }
    const next =
      skill === "reading" ? "listening" : skill === "listening" ? "writing" : null;
    // آزمون‌های ساخت‌یافته (مثل کمبریج ۴ تست ۱ لیسنینگ) → پلیر Part‌محور مثل تستینو
    const query = `mode=${mode}${full && next ? `&full=1` : ""}`;
    const structured = getStructuredExam(bookId, testId, skill) !== null;
    router.push(
      structured
        ? `/ielts/cambridge/${bookId}/${testId}/${skill}/part/1?${query}`
        : `/ielts/cambridge/${bookId}/${testId}/${skill}?${query}`,
    );
  }

  // ---------- تب آمار (بالای return های زودهنگام — ترتیب هوک‌ها ثابت بماند) ----------
  const stats = useMemo(() => {
    const attemptsList = detail?.attempts ?? [];
    return SKILLS.map((s) => {
      const list = attemptsList.filter((a) => a.skill === s.key && a.status === "SUBMITTED");
      const bands = list.map((a) => a.bandScore).filter((b): b is number => b != null);
      const best = bands.length > 0 ? Math.max(...bands) : null;
      const avg = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : null;
      return {
        skill: s.key,
        label: tr(s.fa, s.en),
        attempts: list.length,
        best,
        avg: avg != null ? Math.round(avg * 2) / 2 : null,
      };
    });
  }, [detail, tr]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  if (error || !detail || !valid) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle size={32} className="text-amber-500" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {error ?? tr("کتاب یافت نشد", "Book not found")}
        </p>
        <button onClick={() => void refetch()} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          {tr("تلاش دوباره", "Try again")}
        </button>
      </div>
    );
  }

  /** آخرین وضعیت هر مهارت هر تست */
  const statusFor = (testId: number, skill: string) => {
    const list = detail.attempts.filter(
      (a) => a.testNumber === testId && a.skill === skill,
    );
    const inProgress = list.find((a) => a.status === "IN_PROGRESS");
    const submitted = list.find((a) => a.status === "SUBMITTED");
    const best = list.reduce<number | null>(
      (b, a) => (a.bandScore != null && (b == null || a.bandScore > b) ? a.bandScore : b),
      null,
    );
    return {
      state: inProgress ? "progress" : submitted ? "done" : "none",
      best,
      count: list.length,
    };
  };

  const totalAttempts = detail.attempts.length;
  const submittedCount = detail.attempts.filter((a) => a.status === "SUBMITTED").length;

  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* ================= هدر ================= */}
        <div className="flex items-center gap-3">
          <Link
            href="/ielts/cambridge"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-600 transition"
            title={tr("بازگشت به فهرست", "Back to list")}
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100" dir="ltr">
              Cambridge {num}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <GraduationCap size={12} />
              {tr("آیلتس آکادمیک — ۴ تست کامل", "IELTS Academic — 4 complete tests")}
            </p>
          </div>
          <button
            onClick={() => void refetch()}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition"
            title={tr("تازه‌سازی", "Refresh")}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ================= تب‌ها ================= */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 w-fit">
          {([
            ["test", tr("آزمون", "Test"), BookOpen],
            ["stats", tr("آمار", "Statistics"), BarChart3],
            ["result", tr("نتیجه", "Result"), History],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition
                ${
                  tab === key
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {startError && (
          <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3">
            {startError}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* ================= تب آزمون — ۴ کارت تست ================= */}
          {tab === "test" && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {detail.book.tests.map((test, i) => (
                <TestBox
                  key={test.slug}
                  testId={test.id}
                  slug={test.slug}
                  index={i}
                  starting={starting}
                  statusFor={statusFor}
                  onBegin={begin}
                />
              ))}
            </motion.div>
          )}

          {/* ================= تب آمار ================= */}
          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-center">
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100" dir="ltr">
                    {totalAttempts}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{tr("کل تلاش‌ها", "Total attempts")}</p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-center">
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100" dir="ltr">
                    {submittedCount}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{tr("تحویل‌شده", "Submitted")}</p>
                </div>
              </div>

              {stats.map((s) => (
                <div
                  key={s.skill}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.label}</p>
                    <p className="text-[10px] text-slate-400">
                      {tr(`${s.attempts} تلاش`, `${s.attempts} attempts`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.skill === "reading"
                            ? "bg-indigo-500"
                            : s.skill === "listening"
                              ? "bg-sky-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${((s.best ?? 0) / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums" dir="ltr">
                      {s.best != null ? `best ${s.best}` : "—"}
                    </span>
                    {s.avg != null && (
                      <span className="text-[10px] text-slate-400 tabular-nums" dir="ltr">
                        avg {s.avg}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {totalAttempts === 0 && (
                <p className="text-center text-xs text-slate-400 py-8">
                  {tr(
                    "هنوز آزمونی از این کتاب نداده‌ای — از تب آزمون شروع کن!",
                    "You haven't taken any test from this book yet — start from the Test tab!",
                  )}
                </p>
              )}
            </motion.div>
          )}

          {/* ================= تب نتیجه ================= */}
          {tab === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {detail.attempts.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-10">
                  {tr("هنوز تلاشی ثبت نشده است.", "No attempts yet.")}
                </p>
              )}
              {detail.attempts.map((a) => (
                <AttemptRow key={a.id} a={a} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** یک کارت تست — باکس به باکس با شناسه */
function TestBox({
  testId,
  slug,
  index,
  starting,
  statusFor,
  onBegin,
}: {
  testId: number;
  slug: string;
  index: number;
  starting: string | null;
  statusFor: (testId: number, skill: string) => { state: string; best: number | null; count: number };
  onBegin: (testId: number, skill: IeltsSkill, mode: IeltsMode, full?: boolean) => Promise<void>;
}) {
  const { tr } = useLanguage();
  const [mode, setMode] = useState<IeltsMode>("exam");
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_18px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      {/* سربرگ تست */}
      <div className="relative bg-gradient-to-l from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 px-4 py-3.5 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <PlayCircle size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black" dir="ltr">
            Test {testId}
          </h3>
          <p className="text-[9px] text-white/75 font-mono" dir="ltr">
            {slug}
          </p>
        </div>
        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/15 border border-white/25">
          {tr("آکادمیک", "Academic")}
        </span>
      </div>

      {/* ردیف‌های مهارت */}
      <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
        {SKILLS.map((s) => {
          const st = statusFor(testId, s.key);
          const Icon = s.icon;
          const key = `${testId}-${s.key}-${mode}`;
          const isBusy = busy === key || starting?.startsWith(`${testId}-${s.key}-`);
          return (
            <div key={s.key} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                  s.color === "indigo"
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                    : s.color === "sky"
                      ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300"
                      : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                }`}
              >
                <Icon size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {tr(s.fa, s.en)}
                  <span className="text-[9px] text-slate-400 font-medium ms-1.5" dir="ltr">
                    {s.key === "writing" ? "2 tasks · 60′" : "40 Q · " + (s.key === "reading" ? "60′" : "30′")}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {st.state === "none" ? (
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <Circle size={9} />
                      {tr("شروع‌نشده", "not started")}
                    </span>
                  ) : st.state === "progress" ? (
                    <span className="text-[9px] text-sky-500 font-bold flex items-center gap-1">
                      <Hourglass size={9} />
                      {tr("در جریان", "in progress")}
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={9} />
                      {tr("تکمیل", "completed")}
                      {st.best != null && (
                        <span className="text-amber-500 flex items-center gap-0.5" dir="ltr">
                          <Award size={9} /> {st.best}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setBusy(key);
                  void onBegin(testId, s.key, mode).finally(() => setBusy(null));
                }}
                disabled={isBusy}
                className={`
                  shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-bold transition
                  ${
                    mode === "exam"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                  disabled:opacity-60
                `}
              >
                {isBusy ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : mode === "exam" ? (
                  tr("شروع آزمون", "Start exam")
                ) : (
                  tr("شروع تمرین", "Start practice")
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* پاورقی: انتخاب حالت + آزمون کامل */}
      <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {(["practice", "exam"] as IeltsMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                mode === m
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {m === "practice" ? tr("تمرین", "Practice") : tr("آزمون", "Exam")}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setBusy(`${testId}-full`);
            void onBegin(testId, "reading", mode, true).finally(() => setBusy(null));
          }}
          disabled={busy === `${testId}-full`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-60"
        >
          {busy === `${testId}-full` ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Zap size={12} />
          )}
          {tr("آزمون کامل (۳ مهارت پشت‌سرهم)", "Full test (3 skills in a row)")}
        </button>
      </div>
    </motion.div>
  );
}

/** یک ردیف تاریخچهٔ تلاش */
function AttemptRow({ a }: { a: IeltsAttemptSummary }) {
  const { tr, lang } = useLanguage();
  const en = lang === "en";
  const date = new Date(a.submittedAt ?? a.startedAt).toLocaleDateString(en ? "en-US" : "fa-IR");

  const skillLabel =
    a.skill === "reading" ? tr("ریدینگ", "Reading") : a.skill === "listening" ? tr("لیسنینگ", "Listening") : tr("رایتینگ", "Writing");

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
        {a.skill === "reading" ? (
          <ClipboardList size={15} />
        ) : a.skill === "listening" ? (
          <Headphones size={15} />
        ) : (
          <PenLine size={15} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200" dir="ltr">
          Cambridge {String(a.bookNumber).padStart(2, "0")} — Test {a.testNumber} · {skillLabel}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {date}
          {a.mode === "exam" ? ` · ${tr("حالت آزمون", "Exam mode")}` : ` · ${tr("تمرین", "Practice")}`}
          {a.selfScored ? ` · ${tr("خودتصحیحی", "self-scored")}` : ""}
        </p>
      </div>
      <div className="text-end shrink-0">
        {a.status === "SUBMITTED" ? (
          a.skill === "writing" ? (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Send size={11} />
              {tr("تحویل‌شده", "Submitted")}
            </span>
          ) : a.bandScore != null ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-black" dir="ltr">
              <Award size={12} />
              {a.bandScore}
              <span className="text-[9px] font-bold opacity-70">
                {a.rawScore}/{a.totalQuestions}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">{tr("بدون نمره", "No score")}</span>
          )
        ) : (
          <span className="text-[10px] text-sky-500 font-bold">{tr("در جریان", "In progress")}</span>
        )}
      </div>
    </div>
  );
}
