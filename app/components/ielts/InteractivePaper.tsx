"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Headphones,
  Loader2,
  PenLine,
  RefreshCw,
  ScrollText,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import type {
  IeltsMode,
  IeltsSkill,
  InteractivePaper,
  PaperGroup,
  PaperOption,
  PaperQuestionUnit,
} from "@/types/ielts";

// ========================================
// برگهٔ امتحانی تعاملی (v1.0.3.5)
// «داخل خود برگهٔ امتحان جواب بده» — متن صفحات همان تست از PDF
// کتاب به ساختار سوال تبدیل شده و پاسخ‌ها «خطی» داخل خود برگه
// داده می‌شوند: جای خالی متنی، دکمه‌های A/B/C/D، اعداد رومی و
// TRUE/FALSE/NOT GIVEN — مثل تستینو و مناسب موبایل.
//
// چیدمان تک‌ستونی و ریسپانسیو است (PDF دیگر کنار پاسخ‌برگ نیست).
// اگر متن PDF قابل تجزیه نبود → چیدمان قبلی v1.0.3.4 (children).
//
// سازگار با پاسخ‌برگ قبلی: مقادیر در r1..40 / l1..40 / w1..2
// با همان ساختار ذخیرهٔ خودکار ذخیره می‌شوند.
// ========================================

type ContentState =
  | { phase: "loading" }
  | { phase: "ok"; paper: InteractivePaper }
  | { phase: "fail"; reason: string | null };

const TASK_MIN_WORDS: Record<number, number> = { 1: 150, 2: 250 };

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export default function InteractivePaper({
  bookId,
  testId,
  skill,
  mode,
  answers,
  onChange,
  expectedQuestions,
  audioTracks,
  audioShared,
  onSubmit,
  answeredCount,
  totalQuestions,
  children,
}: {
  bookId: number;
  testId: number;
  skill: IeltsSkill;
  mode: IeltsMode;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  /** تعداد سوال‌های مهارت از متادیتا (۴۰) */
  expectedQuestions: number;
  /** فایل‌های صوتی لیسنینگ */
  audioTracks: string[];
  audioShared: boolean;
  onSubmit: () => void;
  answeredCount: number;
  totalQuestions: number;
  /** چیدمان قبلی (پشتیبان v1.0.3.4) — اگر برگهٔ تعاملی ساخته نشد */
  children: ReactNode;
}) {
  const { tr } = useLanguage();
  const [content, setContent] = useState<ContentState>({ phase: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // واکشی برگهٔ تعاملی — با تاخیر الگوی سایت (React Compiler)
  useEffect(() => {
    const t = setTimeout(() => {
      setContent({ phase: "loading" });
      void (async () => {
        try {
          const res = await fetch(
            `/api/ielts/books/${bookId}/tests/${testId}/paper?skill=${skill}&content=1`,
          );
          if (!res.ok) throw new Error();
          const data = (await res.json()) as InteractivePaper;
          if (data.ok) {
            setContent({ phase: "ok", paper: data });
          } else {
            setContent({ phase: "fail", reason: data.reason ?? null });
          }
        } catch {
          setContent({ phase: "fail", reason: null });
        }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, [bookId, testId, skill, reloadKey]);

  // ---------- در حال آماده‌سازی ----------
  if (content.phase === "loading") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 text-center px-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <Loader2 size={30} className="text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {tr("در حال آماده‌سازی برگهٔ امتحانی…", "Preparing your exam paper…")}
          </p>
          <p className="text-[11px] text-slate-400 leading-6 max-w-sm">
            {tr(
              "بار اول چند ثانیه طول می‌کشد (خواندن صفحات کتاب) — بعد از آن کش می‌شود.",
              "The first time takes a few seconds (reading the book pages) — then it is cached.",
            )}
          </p>
        </div>
      </div>
    );
  }

  // ---------- پشتیبان: چیدمان قبلی ----------
  if (content.phase === "fail") {
    return <>{children}</>;
  }

  const paper = content.paper;
  const prefix = skill === "reading" ? "r" : skill === "listening" ? "l" : "w";
  const parsedSet = new Set(paper.questionNumbers);
  const chipTotal = Math.max(expectedQuestions, paper.maxQuestion, 1);
  const missing = Array.from({ length: chipTotal }, (_, i) => i + 1).filter(
    (n) => !parsedSet.has(n),
  );
  const isExam = mode === "exam";

  // ---------- برگهٔ تعاملی ----------
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* پخش‌کنندهٔ صدا (لیسنینگ) — چسبان بالای برگه */}
      {skill === "listening" && (
        <div className="sticky top-16 z-20 -mx-1 px-1 pt-1">
          <RealAudioPlayer tracks={audioTracks} shared={audioShared} examMode={isExam} />
        </div>
      )}

      {/* سربرگ برگه */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <ScrollText size={16} className="text-amber-500 shrink-0" />
          <p className="text-xs font-black text-slate-800 dark:text-slate-100" dir="ltr">
            {`Cambridge IELTS ${String(bookId).padStart(2, "0")} — Test ${testId}`}
          </p>
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-0.5">
            {tr("برگهٔ امتحانی تعاملی", "Interactive exam paper")}
          </span>
          <span className="flex-1" />
          <a
            href={`/api/ielts/books/${bookId}/tests/${testId}/paper?skill=${skill}`}
            target="_blank"
            rel="noopener noreferrer"
            title={tr("برگهٔ PDF اصلی این تست (نمودارها و جدول‌ها)", "Original PDF paper of this test (charts and tables)")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title={tr("بارگذاری دوباره", "Reload")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {paper.fromPage != null && paper.toPage != null && (
          <p className="mt-1 text-[10px] text-slate-400" dir="ltr">
            {`Built from pages ${paper.fromPage}–${paper.toPage} of ${paper.totalPages ?? "?"}`}
          </p>
        )}
      </motion.div>

      {/* چیپ‌های مرور — مثل تستینو */}
      <ReviewChips
        prefix={prefix}
        total={chipTotal}
        answers={answers}
        parsedSet={parsedSet}
        missing={missing.length > 0}
      />

      {/* بخش‌های برگه */}
      {paper.sections.map((sec, si) => (
        <motion.section
          key={`${sec.title}-${si}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(si * 0.05, 0.25) }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center gap-2">
            {skill === "listening" ? (
              <Headphones size={13} className="text-indigo-500 shrink-0" />
            ) : (
              <FileText size={13} className="text-indigo-500 shrink-0" />
            )}
            <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-100" dir="ltr">
              {sec.title}
            </h3>
          </div>

          <div className="p-4 space-y-5">
            {sec.blocks.map((block, bi) =>
              block.type === "text" ? (
                <TextBlock key={bi} lines={block.lines} skill={skill} muted={skill === "listening"} />
              ) : (
                <GroupBlock
                  key={bi}
                  group={block.group}
                  prefix={prefix}
                  answers={answers}
                  onChange={onChange}
                />
              ),
            )}

            {/* رایتینگ: ناحیهٔ نوشتن زیر صورت تسک */}
            {skill === "writing" && (
              <WritingArea
                taskId={(/^Writing Task (\d)/.exec(sec.title)?.[1] ?? String(si + 1)) === "2" ? 2 : 1}
                answers={answers}
                onChange={onChange}
                isExam={isExam}
              />
            )}
          </div>
        </motion.section>
      ))}

      {/* سوال‌های تشخیص‌داده‌نشده — ورودی ساده برای پوشش کامل */}
      {missing.length > 0 && (
        <div
          id="iq-missing"
          className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-4 space-y-2 scroll-mt-24"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle size={13} />
            {tr(
              `سوال‌های ${missing.length}‌گانهٔ زیر از متن PDF جدا نشدند — همین‌جا جواب بده:`,
              `These ${missing.length} questions could not be extracted from the PDF text — answer them here:`,
            )}
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {missing.map((n) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-black flex items-center justify-center">
                  {n}
                </span>
                <input
                  dir="ltr"
                  value={answers[`${prefix}${n}`] ?? ""}
                  onChange={(e) => onChange(`${prefix}${n}`, e.target.value)}
                  maxLength={120}
                  placeholder="—"
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* دکمهٔ تحویل */}
      <button
        onClick={onSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition active:scale-[0.99]"
      >
        <Send size={15} />
        {tr("تحویل آزمون", "Submit exam")}
        <span className="text-[10px] font-medium opacity-80">
          ({tr(`${answeredCount} پاسخ`, `${answeredCount} answered`)})
        </span>
      </button>

      <p className="text-[10px] leading-5 text-slate-400 dark:text-slate-500 text-center px-2">
        {tr(
          "این برگه از متن PDF کتابِ خودت ساخته شده است؛ برای نمودارها و جدول‌های تصویری از آیکون PDF بالا استفاده کن. پاسخ‌ها خودکار ذخیره می‌شوند.",
          "This paper is built from your own book PDF's text; use the PDF icon above for charts and image-based tables. Answers are saved automatically.",
        )}
        {totalQuestions > 0 && skill !== "writing" && (
          <>
            {" · "}
            {tr(`${answeredCount} از ${totalQuestions}`, `${answeredCount} of ${totalQuestions}`)}
          </>
        )}
      </p>
    </div>
  );
}

// ========================================
// چیپ‌های مرور — سبز = پاسخ داده، خاکستری = بی‌پاسخ، کهربایی = جدا نشده
// ========================================

function ReviewChips({
  prefix,
  total,
  answers,
  parsedSet,
  missing,
}: {
  prefix: string;
  total: number;
  answers: Record<string, string>;
  parsedSet: Set<number>;
  missing: boolean;
}) {
  const { tr } = useLanguage();
  const ids = Array.from({ length: total }, (_, i) => i + 1);
  const answered = ids.filter((n) => (answers[`${prefix}${n}`] ?? "").trim() !== "").length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-3.5 py-3">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
          <ClipboardList size={13} className="text-indigo-500" />
          {tr("مرور سوال‌ها", "Review questions")}
        </p>
        <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={12} />
          {answered}/{total}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((n) => {
          const filled = (answers[`${prefix}${n}`] ?? "").trim() !== "";
          const parsed = parsedSet.has(n);
          const href = parsed ? `#iq-${n}` : "#iq-missing";
          return (
            <a
              key={n}
              href={href}
              title={tr(`سوال ${n}`, `Question ${n}`)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition ${
                filled
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : parsed
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-dashed border-amber-300 dark:border-amber-500/30"
              }`}
            >
              {n}
            </a>
          );
        })}
      </div>
      {missing && (
        <p className="mt-2 text-[9px] text-amber-500 dark:text-amber-400 px-0.5">
          {tr(
            "چیپ کهربایی = سوال از متن PDF جدا نشده (پایین برگه جواب بده)",
            "Amber chip = question not extracted from PDF text (answer at the bottom of the paper)",
          )}
        </p>
      )}
    </div>
  );
}

// ========================================
// بلوک متن — پاساژ ریدینگ / زمینهٔ لیسنینگ / صورت تسک رایتینگ
// ========================================

function TextBlock({
  lines,
  skill,
  muted,
}: {
  lines: string[];
  skill: IeltsSkill;
  muted: boolean;
}) {
  return (
    <div
      dir="ltr"
      className={
        skill === "writing"
          ? "rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 p-4 space-y-2"
          : muted
            ? "text-[12px] leading-6 text-slate-500 dark:text-slate-400 space-y-1"
            : "font-serif text-[13.5px] leading-7 text-slate-700 dark:text-slate-300 space-y-2"
      }
    >
      {lines.map((line, i) => (
        <p key={i} className={skill === "writing" && i === 0 ? "font-bold text-slate-800 dark:text-slate-100" : undefined}>
          {line}
        </p>
      ))}
    </div>
  );
}

// ========================================
// بلوک دستهٔ سوال — دستور + بانک + سوال‌ها با ورودی خطی
// ========================================

function GroupBlock({
  group,
  prefix,
  answers,
  onChange,
}: {
  group: PaperGroup;
  prefix: string;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}) {
  return (
    <div className="space-y-3" dir="ltr">
      {/* دستور — مثل قالب کمبریج */}
      <div className="border-y border-slate-200 dark:border-slate-700/70 py-2.5 space-y-1">
        <p className="font-serif font-bold text-[13px] text-slate-900 dark:text-slate-100">
          {group.label}
        </p>
        <p className="font-serif italic text-[12px] leading-6 text-slate-500 dark:text-slate-400">
          {group.instruction.join(" ")}
        </p>
      </div>

      {/* بانک گزینه‌های مشترک (مچینگ/تیتر) */}
      {group.bank && group.bank.length > 0 && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 p-3 space-y-1.5">
          {group.bank.map((opt) => (
            <p key={opt.letter} className="flex gap-2 text-[12.5px] leading-6 text-slate-600 dark:text-slate-300 font-serif">
              <span className="font-bold text-indigo-600 dark:text-indigo-300 w-6 shrink-0">{opt.letter}</span>
              <span>{opt.text}</span>
            </p>
          ))}
        </div>
      )}

      {/* سوال‌ها */}
      <div className="space-y-3">
        {group.questions.map((unit, qi) => (
          <QuestionUnit
            key={`${unit.numbers[0]}-${qi}`}
            unit={unit}
            group={group}
            prefix={prefix}
            answers={answers}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

// ========================================
// یک سوال با ورودی خطی داخل خود برگه
// ========================================

function QuestionUnit({
  unit,
  group,
  prefix,
  answers,
  onChange,
}: {
  unit: PaperQuestionUnit;
  group: PaperGroup;
  prefix: string;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}) {
  const n = unit.numbers[0];
  const id = `${prefix}${n}`;
  const value = answers[id] ?? "";
  const kind = unit.inputKind;

  return (
    <div id={`iq-${n}`} className="flex gap-2.5 scroll-mt-36">
      {/* شمارهٔ سوال */}
      <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center mt-0.5">
        {n}
      </span>

      <div className="flex-1 min-w-0">
        {/* متن سوال + ورودی متنی خطی */}
        {kind === "text" ? (
          <TextFillQuestion unit={unit} id={id} value={value} onChange={onChange} />
        ) : kind === "tfng" || kind === "ynng" ? (
          <div className="space-y-2">
            <p className="font-serif text-[13.5px] leading-7 text-slate-700 dark:text-slate-200">
              {unit.segments.join(" ")}
            </p>
            <ChoiceButtons
              options={
                kind === "tfng"
                  ? ["TRUE", "FALSE", "NOT GIVEN"]
                  : ["YES", "NO", "NOT GIVEN"]
              }
              value={value}
              onChange={(v) => onChange(id, v)}
            />
          </div>
        ) : unit.options && unit.options.length > 0 ? (
          /* چهارگزینه‌ای با گزینه‌های کامل */
          <div className="space-y-2">
            <p className="font-serif text-[13.5px] leading-7 text-slate-700 dark:text-slate-200">
              {unit.segments.join(" ")}
            </p>
            <div className="grid gap-1.5">
              {unit.options.map((opt: PaperOption) => (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => onChange(id, value === opt.letter ? "" : opt.letter)}
                  className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-xl border transition ${
                    value === opt.letter
                      ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-400/40"
                      : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-400/30"
                  }`}
                >
                  <span
                    className={`w-6 h-6 shrink-0 rounded-full text-[11px] font-black flex items-center justify-center border ${
                      value === opt.letter
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-[13px] leading-6 text-slate-700 dark:text-slate-200 font-serif">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* مچینگ حرفی/رومی — دکمه‌های حرف */
          <div className="space-y-2">
            <p className="font-serif text-[13.5px] leading-7 text-slate-700 dark:text-slate-200">
              {unit.segments.join(" ")}
            </p>
            <ChoiceButtons
              options={group.letters ?? ["A", "B", "C", "D"]}
              value={value}
              onChange={(v) => onChange(id, v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** سوال تکمیل متنی — ورودی داخل جریان جمله */
function TextFillQuestion({
  unit,
  id,
  value,
  onChange,
}: {
  unit: PaperQuestionUnit;
  id: string;
  value: string;
  onChange: (questionId: string, value: string) => void;
}) {
  const hasBlank = unit.segments.length >= 2;
  const input = (
    <input
      dir="ltr"
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
      maxLength={120}
      placeholder="—"
      className="inline-block w-28 md:w-36 align-baseline mx-1 px-2 py-0.5 rounded-lg text-[13px] font-semibold text-indigo-700 dark:text-indigo-200 bg-indigo-50/60 dark:bg-indigo-500/10 border-b-2 border-indigo-300 dark:border-indigo-400/50 focus:outline-none focus:border-indigo-500 focus:bg-indigo-50 dark:focus:bg-indigo-500/20 transition placeholder:text-indigo-300/60"
    />
  );

  if (!hasBlank) {
    return (
      <p className="font-serif text-[13.5px] leading-8 text-slate-700 dark:text-slate-200">
        {unit.segments[0]} {input}
      </p>
    );
  }

  // قطعهٔ اول → ورودی → بقیه با جای‌خالی تزئینی
  const rest = unit.segments.slice(1);
  return (
    <p className="font-serif text-[13.5px] leading-8 text-slate-700 dark:text-slate-200">
      {unit.segments[0]}
      {input}
      {rest.map((seg, i) => (
        <span key={i}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600 select-none mx-1">{"· · · · ·"}</span>}
          {seg}
        </span>
      ))}
    </p>
  );
}

/** ردیف دکمه‌های انتخاب (حرف / رومی / TRUE…) */
function ChoiceButtons({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = value.toUpperCase() === opt.toUpperCase();
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(selected ? "" : opt)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition active:scale-95 ${
              selected
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-400/40"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ========================================
// ناحیهٔ نوشتن رایتینگ — زیر صورت تسک
// ========================================

function WritingArea({
  taskId,
  answers,
  onChange,
  isExam,
}: {
  taskId: 1 | 2;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  isExam: boolean;
}) {
  const { tr } = useLanguage();
  const id = `w${taskId}`;
  const text = answers[id] ?? "";
  const words = countWords(text);
  const minWords = TASK_MIN_WORDS[taskId] ?? 150;

  return (
    <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[12px] font-black text-emerald-700 dark:text-emerald-300">
          <PenLine size={13} />
          {tr(`پاسخ تسک ${taskId}`, `Your Task ${taskId} answer`)}
        </p>
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
      <textarea
        dir="ltr"
        value={text}
        onChange={(e) => onChange(id, e.target.value.slice(0, 8000))}
        rows={10}
        placeholder={isExam ? "" : "Start writing…"}
        className="w-full px-3 py-2.5 rounded-xl text-sm leading-7 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition resize-y font-serif"
      />
      <p className="flex items-center gap-1 text-[10px] text-slate-400">
        <Award size={11} />
        {tr(
          "متن خودکار ذخیره می‌شود؛ نمونه پاسخ‌ها در انتهای کتاب کمبریج است.",
          "Your text is saved automatically; model answers are at the end of the Cambridge book.",
        )}
      </p>
    </div>
  );
}
