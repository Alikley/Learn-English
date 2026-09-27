"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  BookOpen,
  Send,
  ClipboardCheck,
  Clock,
  Award,
  ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { startAttempt, useAttempt } from "@/app/hook/ielts/useIelts";
import { recordStreakActivity } from "@/app/hook/ui/useStreak";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import QuestionGroupView from "@/app/components/ielts/QuestionGroupView";
import ListeningPlayer from "@/app/components/ielts/ListeningPlayer";
import ChartView from "@/app/components/ielts/ChartView";
import PageLoading from "@/app/components/PageLoading";
import type { IeltsMode, IeltsSkill, IeltsAttemptPayload } from "@/types/ielts";

// ========================================
// پلیر آزمون آیلتس (v1.0.3.2)
// /ielts/cambridge/[slug]/[skill]?mode=practice|exam
// تجربهٔ شبیه آزمون واقعی: تایمر، ذخیرهٔ خودکار، ناوبری بخش‌ها،
// ریویو سوال‌ها، تحویل و نمایش نتیجهٔ کامل
// ========================================

const PART_LABEL_FA: Record<string, string> = { reading: "پاساژ", listening: "بخش" };
const PART_LABEL_EN: Record<string, string> = { reading: "Passage", listening: "Part" };

export default function SkillPlayerPage() {
  const { slug, skill } = useParams<{ slug: string; skill: string }>();
  const router = useRouter();
  const { tr, lang } = useLanguage();
  const en = lang === "en";

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [activePart, setActivePart] = useState(1);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState<{
    rawScore: number | null;
    totalQuestions: number | null;
    bandScore: number | null;
  } | null>(null);
  const [playedParts, setPlayedParts] = useState<Set<number>>(new Set());
  const elapsed0 = useRef<number>(0);
  const submittedRef = useRef(false);

  // شروع تلاش هنگام ورود — حالت از query string خوانده می‌شود (فقط کلاینت)
  // (الگوی تاخیری سایت — مطابق LanguageContext و بقیهٔ هوک‌ها)
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window === "undefined") return;
      const modeParam: IeltsMode =
        new URLSearchParams(window.location.search).get("mode") === "exam" ? "exam" : "practice";
      elapsed0.current = Date.now();
      const stored = sessionStorage.getItem(`ielts-attempt-${slug}-${skill}`);
      if (stored) {
        setAttemptId(stored);
        return;
      }
      void (async () => {
        const r = await startAttempt(slug, skill as IeltsSkill, modeParam);
        if (!r.ok) {
          setStartError(r.error);
          return;
        }
        sessionStorage.setItem(`ielts-attempt-${slug}-${skill}`, r.payload.attemptId);
        setAttemptId(r.payload.attemptId);
        // آیلتس بخشی از استریک روزانه است
        void recordStreakActivity();
      })();
    }, 0);
    return () => clearTimeout(t);
  }, [slug, skill]);

  const { payload, loading, error, saving, setAnswer, flush, submit } = useAttempt(attemptId);

  // سوال‌های گروه فعال
  const groups = useMemo(() => {
    if (!payload) return [];
    if (payload.skill === "reading" && payload.reading) return payload.reading.groups;
    if (payload.skill === "listening" && payload.listening) return payload.listening.groups;
    return [];
  }, [payload]);

  const parts = useMemo(() => {
    if (!payload) return [] as number[];
    if (payload.skill === "reading" && payload.reading) return payload.reading.passages.map((p) => p.part);
    if (payload.skill === "listening" && payload.listening) return payload.listening.sections.map((s) => s.part);
    return [];
  }, [payload]);

  const totalQuestions = useMemo(() => groups.reduce((n, g) => n + g.questions.length, 0), [groups]);
  const answeredCount = useMemo(
    () => groups.reduce((n, g) => n + g.questions.filter((q) => (payload?.savedAnswers[q.id] ?? "").trim()).length, 0),
    [groups, payload],
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
    const elapsedSec = elapsed0.current
      ? Math.floor((Date.now() - elapsed0.current) / 1000)
      : 0;
    const finalAnswers = payload?.savedAnswers ?? {};
    const r = await submit(elapsedSec, finalAnswers);
    if (r) {
      setResult({ rawScore: r.rawScore, totalQuestions: r.totalQuestions, bandScore: r.bandScore });
      setConfirmSubmit(false);
      sessionStorage.removeItem(`ielts-attempt-${slug}-${skill}`);
    } else {
      submittedRef.current = false;
    }
  }, [attemptId, flush, payload, skill, slug, submit]);

  // پایان زمان در حالت آزمون → تحویل خودکار
  useEffect(() => {
    if (payload?.mode === "exam" && payload.remainingSec === 0 && !submittedRef.current) {
      void doSubmit();
    }
  }, [payload, doSubmit]);

  // ================= رندر =================
  if (startError || error) {
    return (
      <Center>
        <AlertCircle className="text-red-500 mb-3" size={36} />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{startError ?? error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          {tr("بازگشت", "Back")}
        </button>
      </Center>
    );
  }

  if (loading || !payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const practice = payload.mode === "practice";

  // ---------- نتیجه پس از تحویل ----------
  if (result) {
    return <ResultPanel payload={payload} result={result} slug={slug} />;
  }

  // ---------- پلیر ----------
  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={en ? "ltr" : "rtl"}>
      <ExamTopBar
        title={tr(
          `کمبریج ${String(payload.slug.match(/\d+/)?.[0] ?? "").padStart(2, "0")}`,
          `Cambridge ${String(payload.slug.match(/\d+/)?.[0] ?? "").padStart(2, "0")}`,
        )}
        skill={payload.skill}
        mode={payload.mode}
        remainingSec={payload.remainingSec}
        elapsedSec={0}
        saving={saving}
        onExit={() => {
          void flush();
          router.push(`/ielts/cambridge/${slug}`);
        }}
      />

      <div className="max-w-6xl mx-auto px-3 md:px-5 py-4 md:py-6 space-y-4">
        {/* ================= ریدینگ ================= */}
        {payload.skill === "reading" && payload.reading && (() => {
          const reading = payload.reading;
          return (
          <>
            {/* ناوبری پاساژها */}
            <PartTabs
              parts={parts}
              active={activePart}
              onSelect={setActivePart}
              labelFa={PART_LABEL_FA.reading}
              labelEn={PART_LABEL_EN.reading}
              counts={parts.map(
                (p) =>
                  reading.groups
                    .filter((g) => g.part === p)
                    .reduce((n, g) => n + g.questions.length, 0),
              )}
            />
            {reading.passages
              .filter((p) => p.part === activePart)
              .map((passage) => (
                <div key={passage.part} className="grid lg:grid-cols-2 gap-4 items-start">
                  {/* متن پاساژ */}
                  <article
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 lg:sticky lg:top-20"
                    dir="ltr"
                  >
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {passage.title}
                    </h2>
                    {passage.intro && (
                      <p className="text-xs italic text-slate-400 dark:text-slate-500 mb-4">{passage.intro}</p>
                    )}
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pe-1">
                      {passage.paragraphs.map((para, i) => (
                        <p key={i} className="text-[13px] leading-7 text-slate-700 dark:text-slate-300">
                          {para.label && (
                            <span className="font-bold text-blue-600 dark:text-blue-400 me-1">{para.label}</span>
                          )}
                          {para.text}
                        </p>
                      ))}
                    </div>
                  </article>

                  {/* سوال‌های پاساژ */}
                  <div className="space-y-4">
                    {reading.groups
                      .filter((g) => g.part === passage.part)
                      .map((g) => (
                        <QuestionGroupView
                          key={g.id}
                          group={g}
                          answers={payload.savedAnswers}
                          onAnswer={setAnswer}
                          practice={practice}
                        />
                      ))}
                  </div>
                </div>
              ))}

            {/* دستورالعمل ساده بالای آزمون — مثل جزوهٔ آیلتس */}
            <ExamNotice
              icon={<Clock size={14} />}
              text={tr(
                `زمان: ${reading.minutes} دقیقه — ${totalQuestions} سوال در ۳ پاساژ`,
                `Time: ${reading.minutes} minutes — ${totalQuestions} questions in 3 passages`,
              )}
            />
          </>
          );
        })()}

        {/* ================= لیسنینگ ================= */}
        {payload.skill === "listening" && payload.listening && (() => {
          const listening = payload.listening;
          return (
          <>
            <ExamNotice
              icon={<BookOpen size={14} />}
              text={tr(
                `شما به یک گفتگو و یک سخنرانی گوش می‌دهید و همزمان به سوال‌ها پاسخ می‌دهید — ${totalQuestions} سوال در ۴ بخش`,
                `You will hear a conversation and a lecture and answer questions at the same time — ${totalQuestions} questions in 4 sections`,
              )}
            />
            {listening.sections
              .filter((s) => s.part === activePart)
              .map((section) => (
                <div key={section.part} className="space-y-4">
                  <ListeningPlayer
                    section={section as Required<typeof section>}
                    practice={practice}
                    finished={playedParts.has(section.part)}
                    onFinish={(p) => setPlayedParts((s) => new Set(s).add(p))}
                  />
                  <div className="space-y-4">
                    {listening.groups
                      .filter((g) => g.part === section.part)
                      .map((g) => (
                        <QuestionGroupView
                          key={g.id}
                          group={g}
                          answers={payload.savedAnswers}
                          onAnswer={setAnswer}
                          practice={practice}
                        />
                      ))}
                  </div>
                </div>
              ))}
            <PartTabs
              parts={parts}
              active={activePart}
              onSelect={setActivePart}
              labelFa={PART_LABEL_FA.listening}
              labelEn={PART_LABEL_EN.listening}
              counts={parts.map(
                (p) =>
                  listening.groups
                    .filter((g) => g.part === p)
                    .reduce((n, g) => n + g.questions.length, 0),
              )}
            />
          </>
          );
        })()}

        {/* ================= رایتینگ ================= */}
        {payload.skill === "writing" && payload.writing && (() => {
          const writing = payload.writing;
          return (
          <>
            <ExamNotice
              icon={<Clock size={14} />}
              text={tr(
                `زمان: ${writing.minutes} دقیقه — توصیه‌شده: ۲۰ دقیقه تسک ۱ و ۴۰ دقیقه تسک ۲`,
                `Time: ${writing.minutes} minutes — suggested: 20 minutes for Task 1 and 40 for Task 2`,
              )}
            />
            {writing.tasks.map((task) => (
              <WritingTaskCard
                key={task.id}
                task={task}
                value={payload.savedAnswers[task.id] ?? ""}
                onChange={(v) => setAnswer(task.id, v)}
                practice={practice}
              />
            ))}
          </>
          );
        })()}

        {/* ================= فوتر: ریویو + تحویل ================= */}
        {payload.skill !== "writing" && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ListChecks size={14} className="text-blue-500" />
                {tr("بازبینی پاسخ‌ها", "Review your answers")}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {tr(`${answeredCount} از ${totalQuestions} پاسخ داده شده`, `${answeredCount} of ${totalQuestions} answered`)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {groups.flatMap((g) => g.questions).map((q) => {
                const part = gPart(groups, q.id);
                const answered = (payload.savedAnswers[q.id] ?? "").trim() !== "";
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (part) {
                        setActivePart(part);
                        document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    title={`${tr("سوال", "Question")} ${q.number}`}
                    className={`
                      w-8 h-8 rounded-lg text-[11px] font-bold transition
                      ${
                        answered
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }
                      ${part === activePart ? "ring-2 ring-blue-400/60" : ""}
                    `}
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* دکمهٔ تحویل */}
        <div className="flex justify-center pb-8">
          <button
            onClick={() => setConfirmSubmit(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
          >
            <Send size={16} />
            {tr("پایان و تحویل آزمون", "Finish and submit")}
          </button>
        </div>
      </div>

      {/* مودال تأیید تحویل */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <ClipboardCheck size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {tr("تحویل آزمون؟", "Submit the exam?")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {payload.skill === "writing"
                  ? tr("متن‌های شما ذخیره و برای خودارزیابی نمایش داده می‌شوند.", "Your texts will be saved and shown for self-assessment.")
                  : tr(
                      `${answeredCount} از ${totalQuestions} سوال پاسخ داده شده — پس از تحویل، نمره و پاسخ‌های صحیح نمایش داده می‌شود.`,
                      `${answeredCount} of ${totalQuestions} questions answered — after submitting, your score and the correct answers will be shown.`,
                    )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  {tr("ادامهٔ آزمون", "Keep going")}
                </button>
                <button
                  onClick={() => void doSubmit()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
                >
                  {tr("بله، تحویل بده", "Yes, submit")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** پیدا کردن part یک سوال */
function gPart(groups: { part: number; questions: { id: string }[] }[], questionId: string): number | null {
  for (const g of groups) {
    if (g.questions.some((q) => q.id === questionId)) return g.part;
  }
  return null;
}

/** کارت تسک رایتینگ */
function WritingTaskCard({
  task,
  value,
  onChange,
  practice,
}: {
  task: {
    id: string;
    taskNumber: number;
    suggestedMinutes: number;
    minimumWords: number;
    prompt: string;
    bullets?: string[];
    chart?: import("@/types/ielts").IeltsChart;
    sampleAnswer: string;
    checklist: string[];
  };
  value: string;
  onChange: (v: string) => void;
  practice: boolean;
}) {
  const { tr } = useLanguage();
  const [showSample, setShowSample] = useState<"checklist" | "sample" | null>(null);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2" dir="ltr">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
            Task {task.taskNumber}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            ~{task.suggestedMinutes} min · min {task.minimumWords} words
          </span>
        </h3>
      </div>

      <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed" dir="ltr">
        {task.prompt}
      </p>

      {task.bullets && (
        <ul className="list-disc ps-5 space-y-1" dir="rtl">
          {task.bullets.map((b, i) => (
            <li key={i} className="text-xs text-slate-500 dark:text-slate-400">{b}</li>
          ))}
        </ul>
      )}

      {task.chart && <ChartView chart={task.chart} />}

      <textarea
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder="Write your answer here…"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 leading-7 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y"
      />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p
          className={`text-xs font-bold ${
            words >= task.minimumWords ? "text-emerald-600" : "text-amber-500"
          }`}
          dir="ltr"
        >
          {words} / {task.minimumWords} words
        </p>
        {practice && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowSample("checklist")}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
            >
              {tr("چک‌لیست", "Checklist")}
            </button>
            <button
              onClick={() => setShowSample("sample")}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
            >
              {tr("نمونهٔ پاسخ", "Sample answer")}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSample === "checklist" && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden list-disc ps-5 space-y-1.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4"
          >
            {task.checklist.map((c, i) => (
              <li key={i} className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{c}</li>
            ))}
          </motion.ul>
        )}
        {showSample === "sample" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4"
            dir="ltr"
          >
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              {tr("نمونهٔ پاسخ سطح بالا", "High-band sample answer")}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-7 whitespace-pre-wrap">
              {task.sampleAnswer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** پنل نتیجه پس از تحویل */
function ResultPanel({
  payload,
  result,
  slug,
}: {
  payload: IeltsAttemptPayload;
  result: { rawScore: number | null; totalQuestions: number | null; bandScore: number | null };
  slug: string;
}) {
  const { tr } = useLanguage();
  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-5"
      >
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white text-center space-y-3 shadow-xl shadow-indigo-600/20">
          <Award className="mx-auto" size={40} />
          <h2 className="text-xl font-bold">{tr("آزمون تحویل شد!", "Exam submitted!")}</h2>
          {payload.skill !== "writing" ? (
            <>
              <div className="flex items-end justify-center gap-6">
                <div>
                  <p className="text-4xl font-black">{result.bandScore ?? 0}</p>
                  <p className="text-[11px] opacity-80">{tr("بند آیلتس", "IELTS band")}</p>
                </div>
                <div>
                  <p className="text-4xl font-black">
                    {result.rawScore}
                    <span className="text-lg opacity-70">/{result.totalQuestions}</span>
                  </p>
                  <p className="text-[11px] opacity-80">{tr("پاسخ صحیح", "correct")}</p>
                </div>
              </div>
              <p className="text-[11px] opacity-75 leading-relaxed">
                {tr(
                  "برای دیدن تحلیل سوال به سوال، از تب «نتیجه» در صفحهٔ آزمون استفاده کنید.",
                  "See the Result tab on the exam page for the full question-by-question review.",
                )}
              </p>
            </>
          ) : (
            <p className="text-[11px] opacity-75 leading-relaxed">
              {tr(
                "متن‌های شما ذخیره شد. با چک‌لیست و نمونهٔ پاسخ (در حالت تمرین) خودتان را ارزیابی کنید.",
                "Your texts are saved. Assess yourself with the checklist and sample answers (practice mode).",
              )}
            </p>
          )}
          <Link
            href={`/ielts/cambridge/${slug}`}
            className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-sm font-bold transition"
          >
            <ArrowLeft size={15} />
            {tr("بازگشت به صفحهٔ آزمون", "Back to exam page")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/** تب‌های بخش/پاساژ */
function PartTabs({
  parts,
  active,
  onSelect,
  labelFa,
  labelEn,
  counts,
}: {
  parts: number[];
  active: number;
  onSelect: (p: number) => void;
  labelFa: string;
  labelEn: string;
  counts: number[];
}) {
  const { tr } = useLanguage();
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {parts.map((p, i) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`
            shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition
            ${
              active === p
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40"
            }
          `}
        >
          {tr(`${labelFa} ${p}`, `${labelEn} ${p}`)}
          <span className={`ms-1.5 ${active === p ? "opacity-70" : "text-slate-400"}`}>({counts[i]})</span>
        </button>
      ))}
    </div>
  );
}

function ExamNotice({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-2.5">
      <span className="text-blue-500 shrink-0">{icon}</span>
      <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">{text}</p>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}
