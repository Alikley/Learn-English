"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Headphones,
  PenLine,
  Clock,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Eye,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCambridgeTest, startAttempt } from "@/app/hook/ielts/useIelts";
import PageLoading from "@/app/components/PageLoading";
import type { IeltsMode, IeltsSkill } from "@/types/ielts";

// ========================================
// صفحهٔ جزئیات آزمون کمبریج (v1.0.3.2)
// مثل تستینو — دو تب «آزمون» و «نتیجه»:
//  - آزمون: انتخاب مهارت (ریدینگ/لیسنینگ/رایتینگ) + حالت (تمرین/آزمون) + شروع
//  - نتیجه: تاریخچهٔ تلاش‌ها + کارت مهارت با بند + ریویو سوال به سوال
// ========================================

type Tab = "test" | "result";

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tr, dir } = useLanguage();
  const { detail, loading, error, refetch } = useCambridgeTest(slug);
  const [tab, setTab] = useState<Tab>("test");
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const router = useRouter();

  const num = slug?.match(/\d+/)?.[0]?.padStart(2, "0") ?? "";

  async function begin(skill: IeltsSkill, mode: IeltsMode) {
    if (!slug) return;
    setStarting(skill + mode);
    setStartError(null);
    const r = await startAttempt(slug, skill, mode);
    setStarting(null);
    if (!r.ok) {
      setStartError(r.error);
      return;
    }
    router.push(`/ielts/cambridge/${slug}/${skill}?mode=${mode}`);
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle size={32} className="text-amber-500" />
        <p className="text-sm text-slate-600 dark:text-slate-300">{error ?? tr("آزمون یافت نشد", "Exam not found")}</p>
        <button onClick={() => void refetch()} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          {tr("تلاش دوباره", "Try again")}
        </button>
      </div>
    );
  }

  const lastBySkill = (skill: string) =>
    detail.attempts.find((a) => a.skill === skill) ?? null;
  const hasAnyResult = detail.attempts.some((a) => a.status === "SUBMITTED");

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
              Cambridge {num} — Test 1
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <GraduationCap size={12} />
              {tr("آیلتس آکادمیک — کتاب کمبریج", "IELTS Academic — Cambridge book")} {num}
            </p>
          </div>
        </div>

        {/* ================= تب‌ها ================= */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 w-fit">
          {(["test", "result"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-5 py-2 rounded-xl text-xs font-bold transition
                ${
                  tab === t
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }
              `}
            >
              {t === "test" ? tr("آزمون", "Test") : tr("نتیجه", "Result")}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ================= تب آزمون ================= */}
          {tab === "test" && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tr(
                  "یک مهارت را انتخاب کنید و با حالت دلخواه شروع کنید. در حالت تمرین پاسخ صحیح و تحلیل هر سوال در دسترس است؛ در حالت آزمون زمان‌بندی واقعی اعمال می‌شود.",
                  "Pick a skill and start in your preferred mode. Practice mode shows correct answers and analysis; exam mode applies real timing.",
                )}
              </p>

              {startError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {startError}
                </div>
              )}

              <SkillStartCard
                skill="reading"
                icon={<ClipboardList size={20} />}
                title={tr("ریدینگ", "Reading")}
                desc={tr(
                  "۳ پاساژ آکادمیک — سوالات تطبیق، درست/غلط/گفته‌نشده، چهارگزینه‌ای و تکمیل",
                  "3 academic passages — matching, T/F/NG, MCQ and completion questions",
                )}
                count={`${detail.readingQuestions} ${tr("سوال", "questions")}`}
                minutes={detail.test.readingMinutes}
                last={lastBySkill("reading")}
                starting={starting}
                onStart={(m) => void begin("reading", m)}
              />
              <SkillStartCard
                skill="listening"
                icon={<Headphones size={20} />}
                title={tr("لیسنینگ", "Listening")}
                desc={tr(
                  "۴ بخش — گفتگو و سخنرانی با پخش صوتی و کنترل سرعت در حالت تمرین",
                  "4 sections — conversations and a lecture with audio playback and speed control in practice mode",
                )}
                count={`${detail.listeningQuestions} ${tr("سوال", "questions")}`}
                minutes={detail.test.listeningMinutes}
                last={lastBySkill("listening")}
                starting={starting}
                onStart={(m) => void begin("listening", m)}
              />
              <SkillStartCard
                skill="writing"
                icon={<PenLine size={20} />}
                title={tr("رایتینگ", "Writing")}
                desc={tr(
                  "تسک ۱ (توصیف نمودار) و تسک ۲ (مقاله) با شمارش کلمه و چک‌لیست خودارزیابی",
                  "Task 1 (chart description) and Task 2 (essay) with word count and self-assessment checklist",
                )}
                count={`${detail.test.writingTasks} ${tr("تسک", "tasks")}`}
                minutes={detail.test.writingMinutes}
                last={lastBySkill("writing")}
                starting={starting}
                onStart={(m) => void begin("writing", m)}
              />
            </motion.div>
          )}

          {/* ================= تب نتیجه ================= */}
          {tab === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              {!hasAnyResult && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center space-y-2">
                  <Award size={30} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {tr("هنوز آزمونی تحویل نداده‌اید.", "You haven't submitted any exam yet.")}
                  </p>
                  <button
                    onClick={() => setTab("test")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:underline"
                  >
                    {tr("شروع اولین آزمون ←", "Start your first exam →")}
                  </button>
                </div>
              )}

              {hasAnyResult && (
                <>
                  {/* کارت‌های بند هر مهارت */}
                  <div className="grid grid-cols-3 gap-3">
                    {(["reading", "listening", "writing"] as const).map((skill) => {
                      const best = detail.attempts
                        .filter((a) => a.skill === skill && a.status === "SUBMITTED" && a.bandScore != null)
                        .reduce<number | null>((b, a) => (b == null || (a.bandScore ?? 0) > b ? a.bandScore : b), null);
                      const last = lastBySkill(skill);
                      return (
                        <ResultSkillCard
                          key={skill}
                          skill={skill}
                          best={best}
                          lastRaw={last?.rawScore ?? null}
                          lastTotal={last?.totalQuestions ?? null}
                        />
                      );
                    })}
                  </div>

                  {/* تاریخچهٔ تلاش‌ها */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {tr("تاریخچهٔ تلاش‌ها", "Attempt history")}
                      </h3>
                      <button
                        onClick={() => void refetch()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition"
                        title={tr("تازه‌سازی", "Refresh")}
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {detail.attempts
                        .filter((a) => a.status === "SUBMITTED")
                        .slice(0, 10)
                        .map((a) => (
                          <div key={a.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                              {a.skill === "reading" ? <ClipboardList size={14} /> : a.skill === "listening" ? <Headphones size={14} /> : <PenLine size={14} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {skillName(tr, a.skill)}
                                <span className="ms-2 font-normal text-slate-400">
                                  {a.mode === "exam" ? tr("آزمون", "exam") : tr("تمرین", "practice")}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400" dir="ltr">
                                {new Date(a.submittedAt ?? a.startedAt).toLocaleString("en-GB")}
                              </p>
                            </div>
                            {a.skill !== "writing" ? (
                              <div className="text-end" dir="ltr">
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                                  {a.bandScore ?? "-"}
                                  <span className="text-[10px] text-slate-400"> / 9</span>
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {a.rawScore}/{a.totalQuestions}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {tr("ذخیره شد", "saved")}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* راهنمای ریویو */}
                  <div className="rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-3 flex items-center gap-2">
                    <Eye size={15} className="text-blue-500 shrink-0" />
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                      {tr(
                        "تحلیل سوال به سوال (پاسخ شما، پاسخ صحیح و توضیح) در پایان هر آزمون داخل خود آزمون نمایش داده می‌شود.",
                        "The question-by-question review (your answer, correct answer and explanation) is shown inside each exam right after you submit.",
                      )}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function skillName(tr: (a: string, b: string) => string, skill: string) {
  return skill === "reading" ? tr("ریدینگ", "Reading") : skill === "listening" ? tr("لیسنینگ", "Listening") : tr("رایتینگ", "Writing");
}

/** کارت شروع یک مهارت — انتخاب حالت + دکمهٔ شروع (مثل تستینو) */
function SkillStartCard({
  skill,
  icon,
  title,
  desc,
  count,
  minutes,
  last,
  starting,
  onStart,
}: {
  skill: IeltsSkill;
  icon: React.ReactNode;
  title: string;
  desc: string;
  count: string;
  minutes: number;
  last: { status: string; mode: string; bandScore: number | null; rawScore: number | null; totalQuestions: number | null } | null;
  starting: string | null;
  onStart: (mode: IeltsMode) => void;
}) {
  const { tr } = useLanguage();
  const busyP = starting === `${skill}practice`;
  const busyE = starting === `${skill}exam`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1" dir="ltr">{count}</span>
            <span className="flex items-center gap-1" dir="ltr">
              <Clock size={11} />
              {minutes} min
            </span>
            {last && (
              <span className={`flex items-center gap-1 font-bold ${last.status === "IN_PROGRESS" ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {last.status === "IN_PROGRESS"
                  ? tr("ناتمام — ادامه می‌دهد", "in progress — will resume")
                  : tr(`بهترین بند: ${last.bandScore ?? "-"}`, `best band: ${last.bandScore ?? "-"}`)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* دو حالت شروع */}
      <div className="grid sm:grid-cols-2 gap-3">
        <ModeButton
          label={tr("حالت تمرین", "Practice mode")}
          hint={tr("بدون محدودیت زمان + پاسخ و تحلیل", "No time limit + answers & analysis")}
          color="blue"
          busy={busyP}
          onClick={() => onStart("practice")}
        />
        <ModeButton
          label={tr("حالت آزمون", "Exam mode")}
          hint={tr(`تایمر واقعی ${minutes} دقیقه‌ای`, `Real ${minutes}-minute timer`)}
          color="emerald"
          busy={busyE}
          onClick={() => onStart("exam")}
        />
      </div>
    </motion.div>
  );
}

function ModeButton({
  label,
  hint,
  color,
  busy,
  onClick,
}: {
  label: string;
  hint: string;
  color: "blue" | "emerald";
  busy: boolean;
  onClick: () => void;
}) {
  const { tr } = useLanguage();
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`
        rounded-2xl p-3.5 text-start border transition disabled:opacity-60
        ${
          color === "blue"
            ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/40"
            : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400/40"
        }
      `}
    >
      <p
        className={`text-xs font-bold ${
          color === "blue" ? "text-blue-700 dark:text-blue-300" : "text-emerald-700 dark:text-emerald-300"
        }`}
      >
        {label}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{hint}</p>
      <span
        className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold ${
          color === "blue" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        {busy ? tr("در حال شروع…", "Starting…") : tr("شروع", "Start")}
      </span>
    </button>
  );
}

/** کارت نتیجهٔ یک مهارت */
function ResultSkillCard({
  skill,
  best,
  lastRaw,
  lastTotal,
}: {
  skill: IeltsSkill;
  best: number | null;
  lastRaw: number | null;
  lastTotal: number | null;
}) {
  const { tr } = useLanguage();
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 text-center space-y-1.5">
      <div className="w-9 h-9 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
        {skill === "reading" ? <ClipboardList size={16} /> : skill === "listening" ? <Headphones size={16} /> : <PenLine size={16} />}
      </div>
      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{skillName(tr, skill)}</p>
      {skill !== "writing" ? (
        <>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100" dir="ltr">
            {best ?? "-"}
            <span className="text-[10px] text-slate-400"> / 9</span>
          </p>
          {lastRaw != null && (
            <p className="text-[10px] text-slate-400" dir="ltr">
              {tr("آخرین خام", "last raw")}: {lastRaw}/{lastTotal ?? 40}
            </p>
          )}
        </>
      ) : (
        <p className="text-[10px] text-slate-400 leading-relaxed px-1">
          {tr("با چک‌لیست ارزیابی کن", "assess with checklist")}
        </p>
      )}
    </div>
  );
}
