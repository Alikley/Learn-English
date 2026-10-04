"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Sparkles } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsPaperQuestion, IeltsPaperSection } from "@/types/ielts";

// ========================================
// برگهٔ امتحان کاغذی آیلتس (v1.0.4.1)
//
// 🐛 رفع باگ نسخهٔ قبل: هر سوالی که «جای خالی درون‌خطی»
//    داشت و «گزینه» هم داشت (گروه‌های باکسی/مچینگ)، دو بار
//    رندر می‌شد (شاخهٔ inlineGap + شاخهٔ options هر دو اجرا
//    می‌شدند). اکنون شاخه‌ها «موزاییک‌نشدنی» هستند و هر سوال
//    دقیقاً یک بار رندر می‌شود.
//
// 📄 ظاهر جدید — مثل برگهٔ امتحانی واقعی:
//    - برگهٔ سفید چاپی (حتی در حالت دارک) با قاب خاکستری
//    - هدر امتحان: عنوان کتاب/تست + جدول مشخصات داوطلب
//      (نام، تاریخ، ماژول، حالت، شناسه) از پروفایل کاربر
//    - پاسخ‌برگ شماره‌دار ۱..۴۰ (مثل IELTS Answer Sheet)
//      با پرش به سوال + نمایش پاسخ ثبت‌شده در خانه
//    - هر بخش در کادر رسمی با عنوان «SECTION/PART» و
//      دستور رسمی ایتالیک؛ پاساژ ریدینگ در قاب مطالعه
//    - هر سوال در ردیف کادردار با شمارهٔ چاپی در حاشیه
//    - گزینه‌ها: گروه باکسی → دایره‌های حرف (مثلدفترچه)؛
//      چندگزینه‌ای معمولی → دکمهٔ حرف+متن
//    - جای خالی: خط نقطه‌چین (مثل نوشتن روی برگه)
// ========================================

// ---------- ابزارهای کوچک ----------

/** آیا مجموعهٔ حروف گزینه‌های سوال همان باکس مشترک بخش است؟ */
function sameLetterSet(
  a: { letter: string }[] | undefined,
  b: { letter: string }[] | undefined,
): boolean {
  if (!a || !b || a.length === 0 || a.length !== b.length) return false;
  const la = a.map((x) => x.letter).sort().join(",");
  const lb = b.map((x) => x.letter).sort().join(",");
  return la === lb;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ---------- جمله با جای خالی (خط نقطه‌چین کاغذی) ----------

function QuestionGap({
  text,
  value,
  onChange,
  disabled,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const parts = text.split("{GAP}");
  return (
    <p className="text-[13.5px] leading-8 text-neutral-800" dir="ltr">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <input
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={120}
              placeholder="answer"
              aria-label="answer"
              className="mx-1.5 w-28 sm:w-36 px-1 bg-transparent border-b-[2px] border-dotted border-neutral-500 text-center text-[13px] font-bold text-neutral-900 outline-none placeholder:text-neutral-300 focus:border-solid focus:border-neutral-900 disabled:opacity-50 transition"
            />
          )}
        </span>
      ))}
    </p>
  );
}

// ---------- گزینه‌های حرفی (گروه باکسی — دایره‌های چاپی) ----------

function LetterChips({
  options,
  selected,
  onPick,
  disabled,
}: {
  options: { letter: string; text: string }[];
  selected: string;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="choices" dir="ltr">
      {options.map((opt) => {
        const isSel = selected.trim().toUpperCase() === opt.letter;
        return (
          <button
            key={opt.letter}
            type="button"
            role="radio"
            aria-checked={isSel}
            title={opt.text}
            onClick={() => onPick(isSel ? "" : opt.letter)}
            disabled={disabled}
            className={`w-9 h-9 rounded-full border text-[13px] font-black flex items-center justify-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSel
                ? "bg-neutral-900 text-white border-neutral-900 shadow-inner"
                : "bg-white text-neutral-800 border-neutral-400 hover:border-neutral-900 hover:bg-neutral-50"
            }`}
          >
            {opt.letter}
          </button>
        );
      })}
    </div>
  );
}

// ---------- گزینه‌های کامل (چندگزینه‌ای معمولی — حرف + متن) ----------

function OptionButtons({
  options,
  selected,
  onPick,
  disabled,
}: {
  options: { letter: string; text: string }[];
  selected: string;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1" role="radiogroup" aria-label="choices" dir="ltr">
      {options.map((opt) => {
        const isSel = selected.trim().toUpperCase() === opt.letter;
        return (
          <button
            key={opt.letter}
            type="button"
            role="radio"
            aria-checked={isSel}
            onClick={() => onPick(isSel ? "" : opt.letter)}
            disabled={disabled}
            className={`w-full flex items-start gap-2.5 text-left px-2.5 py-1.5 border transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              isSel
                ? "border-2 border-neutral-900 bg-neutral-100"
                : "border-neutral-300 bg-white hover:border-neutral-600"
            }`}
          >
            <span
              className={`w-5 h-5 shrink-0 mt-0.5 border text-[10px] font-black flex items-center justify-center ${
                isSel
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-400"
              }`}
              dir="ltr"
            >
              {opt.letter}
            </span>
            <span className="text-[12.5px] leading-6 text-neutral-800">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- یک سوال — ردیف کادردار برگه ----------
// ⚠️ شاخه‌ها موزاییک‌نشدنی‌اند: هر سوال فقط «یک بار» رندر می‌شود

function QuestionRow({
  q,
  prefix,
  sectionBox,
  answer,
  onChange,
  disabled,
}: {
  q: IeltsPaperQuestion;
  prefix: "r" | "l";
  sectionBox?: { letter: string; text: string }[];
  answer: string;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
}) {
  const questionId = `${prefix}${q.number}`;
  const hasOptions = !!q.options && q.options.length >= 2;
  const answered = answer.trim() !== "";
  // اگر گزینه‌های سوال همان باکس مشترک بخش است → فقط دایرهٔ حرف
  // (متن گزینه‌ها بالای بخش در «باکس» آمده — تکرار نمی‌شود)
  const useChips = hasOptions && sameLetterSet(q.options, sectionBox);

  return (
    <div
      id={`q-${questionId}`}
      className="scroll-mt-40 flex border border-neutral-300 bg-white overflow-hidden rounded-[2px] transition-shadow hover:shadow-sm"
    >
      {/* شمارهٔ چاپی در حاشیهٔ ردیف */}
      <div className="w-10 sm:w-12 shrink-0 border-r border-neutral-300 bg-neutral-50 flex flex-col items-center pt-2 pb-1 gap-1.5">
        <span className="text-[13px] font-black text-neutral-900" dir="ltr">
          {q.number}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            answered ? "bg-neutral-900" : "bg-transparent"
          }`}
          aria-hidden
        />
      </div>

      {/* بدنهٔ سوال — دقیقاً یک ساختار بر اساس نوع */}
      <div className="flex-1 min-w-0 p-3 sm:p-3.5 space-y-2.5">
        {/* (الف) سوال با گزینه — متن (ساده یا جای‌خالی) + گزینه‌ها */}
        {hasOptions && (
          <>
            {q.text && !q.inlineGap && (
              <p className="text-[13.5px] leading-7 text-neutral-800" dir="ltr">
                {q.text}
              </p>
            )}
            {q.inlineGap && (
              <QuestionGap
                text={q.text}
                value={answer}
                onChange={(v) => onChange(questionId, v)}
                disabled={disabled}
              />
            )}
            {useChips ? (
              <LetterChips
                options={q.options!}
                selected={answer}
                onPick={(v) => onChange(questionId, v)}
                disabled={disabled}
              />
            ) : (
              <OptionButtons
                options={q.options!}
                selected={answer}
                onPick={(v) => onChange(questionId, v)}
                disabled={disabled}
              />
            )}
          </>
        )}

        {/* (ب) سوال جای‌خالی بدون گزینه — فقط خط نقطه‌چین */}
        {!hasOptions && q.inlineGap && (
          <QuestionGap
            text={q.text}
            value={answer}
            onChange={(v) => onChange(questionId, v)}
            disabled={disabled}
          />
        )}

        {/* (ج) سوال کوتاه بدون گزینه — متن + خط پاسخ */}
        {!hasOptions && !q.inlineGap && q.text && (
          <>
            <p className="text-[13.5px] leading-7 text-neutral-800" dir="ltr">
              {q.text}
            </p>
            <div className="flex items-center gap-2.5 pt-0.5" dir="ltr">
              <span className="text-[9px] uppercase tracking-[0.18em] font-black text-neutral-400 shrink-0">
                Answer
              </span>
              <input
                dir="ltr"
                value={answer}
                onChange={(e) => onChange(questionId, e.target.value)}
                disabled={disabled}
                maxLength={120}
                placeholder="write your answer"
                aria-label="answer"
                className="flex-1 max-w-md px-1 bg-transparent border-b-[2px] border-dotted border-neutral-500 text-[13px] font-bold text-neutral-900 outline-none placeholder:text-neutral-300 placeholder:font-normal focus:border-solid focus:border-neutral-900 disabled:opacity-50 transition"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- خانهٔ جدول مشخصات داوطلب ----------

function CandidateCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-3 py-2 min-w-0" dir="ltr">
      <p className="text-[8.5px] uppercase tracking-[0.18em] font-black text-neutral-500">
        {label}
      </p>
      <p className="text-[12.5px] font-bold text-neutral-900 truncate">{value || "—"}</p>
    </div>
  );
}

// ========================================
// برگهٔ امتحان — کامپوننت اصلی
// ========================================

export default function ExamPaper({
  skill,
  bookId,
  testId,
  mode,
  userName,
  userEmail,
  sections,
  totalQuestions,
  answers,
  onChange,
  disabled,
  aiGenerated,
}: {
  skill: "reading" | "listening";
  /** شمارهٔ کتاب کمبریج (۱..۸) — برای هدر برگه */
  bookId?: number;
  /** شمارهٔ تست (۱..۴) — برای هدر برگه */
  testId?: number;
  /** حالت آزمون — practice | exam */
  mode?: string;
  /** نام داوطلب (از پروفایل کاربر) */
  userName?: string;
  /** شناسهٔ داوطلب (ایمیل کاربر) */
  userEmail?: string;
  sections: IeltsPaperSection[];
  totalQuestions: number;
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  /** v1.0.4.0 — برگه با هوش مصنوعی ساخته شده است */
  aiGenerated?: boolean;
}) {
  const { tr } = useLanguage();
  const prefix = skill === "reading" ? "r" : "l";

  // تاریخ امروز — بعد از mount (جلوگیری از ناهماهنگی hydration)
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-GB"));
  }, []);

  const ids = useMemo(
    () => Array.from({ length: totalQuestions }, (_, i) => `${prefix}${i + 1}`),
    [prefix, totalQuestions],
  );
  const answered = useMemo(
    () => ids.filter((id) => (answers[id] ?? "").trim() !== "").length,
    [ids, answers],
  );

  const skillName = skill === "reading" ? "READING" : "LISTENING";
  const timeAllowed = skill === "reading" ? "1 hour" : "40 minutes";
  const modeLabel = mode === "exam" ? "EXAMINATION" : "PRACTICE";

  return (
    <div className="exam-sheet">
      {/* ============================================
          برگهٔ سفید چاپی — همیشه روشن (مثل کاغذ)
      ============================================ */}
      <div
        dir="ltr"
        className="bg-white text-neutral-900 border border-neutral-300 shadow-lg rounded-md font-serif"
      >
        {/* ---------- هدر برگهٔ امتحان ---------- */}
        <div className="px-5 sm:px-8 pt-6 pb-5 border-b-[3px] border-double border-neutral-900">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-[9px] tracking-[0.3em] font-black text-neutral-500 uppercase">
                Flex English Examinations
              </p>
              <h2 className="text-lg sm:text-2xl font-black tracking-wide text-neutral-900 mt-0.5">
                CAMBRIDGE IELTS {bookId ? pad2(bookId) : ""} — TEST {testId ?? ""}
              </h2>
              <p className="text-[11.5px] font-bold text-neutral-600 mt-0.5">
                {skillName} — Academic Module
              </p>
            </div>
            <div className="text-right space-y-1 shrink-0">
              {aiGenerated && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5">
                  <Sparkles size={10} aria-hidden />
                  AI-GENERATED PAPER
                </span>
              )}
              <p className="text-[11px] text-neutral-600">
                Time allowed: <span className="font-bold">{timeAllowed}</span>
              </p>
              <p className="text-[11px] text-neutral-600">
                Mode: <span className="font-bold">{modeLabel}</span>
              </p>
              <p className="text-[11px] text-neutral-600">
                Questions: <span className="font-bold">1–{totalQuestions}</span>
              </p>
            </div>
          </div>

          {/* جدول مشخصات داوطلب — مثل Answer Sheet رسمی */}
          <div className="mt-5 border border-neutral-500 bg-white">
            <div className="flex divide-x divide-neutral-400 border-b border-neutral-400">
              <div className="flex-[1.6] min-w-0">
                <CandidateCell label="Candidate Name" value={userName ?? ""} />
              </div>
              <div className="flex-1 min-w-0">
                <CandidateCell label="Date" value={dateStr} />
              </div>
            </div>
            <div className="flex divide-x divide-neutral-400 border-b border-neutral-400">
              <div className="flex-1 min-w-0">
                <CandidateCell label="Module" value={`${skillName} (Academic)`} />
              </div>
              <div className="flex-1 min-w-0">
                <CandidateCell label="Paper" value={`Book ${pad2(bookId ?? 0)} / Test ${testId ?? 0}`} />
              </div>
            </div>
            <CandidateCell label="Candidate ID" value={userEmail ?? ""} />
          </div>
        </div>

        {/* ---------- پاسخ‌برگ شماره‌دار (نقشهٔ سوال‌ها) ---------- */}
        <div className="px-5 sm:px-8 py-4 border-b border-neutral-300 bg-neutral-50/60">
          <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
            <p className="text-[9px] uppercase tracking-[0.22em] font-black text-neutral-500">
              Answer Sheet — click a box to jump
            </p>
            <p className="text-[10px] font-black text-neutral-700">
              {answered} / {totalQuestions} answered
            </p>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1" dir="ltr">
            {ids.map((id, i) => {
              const v = (answers[id] ?? "").trim();
              const filled = v !== "";
              return (
                <a
                  key={id}
                  href={`#q-${id}`}
                  aria-label={`Question ${i + 1}${filled ? " — answered" : ""}`}
                  title={filled ? v : `Question ${i + 1}`}
                  className={`relative h-9 border flex items-center justify-center text-[12px] font-bold transition active:scale-95 ${
                    filled
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-300 hover:border-neutral-700 hover:text-neutral-500"
                  }`}
                >
                  <span className="absolute top-[1px] left-[3px] text-[6.5px] font-black opacity-80" aria-hidden>
                    {i + 1}
                  </span>
                  {filled ? v.slice(0, 3).toUpperCase() : ""}
                </a>
              );
            })}
          </div>
        </div>

        {/* ---------- بخش‌های برگه ---------- */}
        <div className="p-4 sm:p-6 space-y-6">
          {sections.map((section, si) => (
            <section
              key={`${section.title}-${si}`}
              className="border border-neutral-400 rounded-[2px] bg-white"
              aria-label={section.title}
            >
              {/* سربرگ رسمی بخش */}
              <header className="px-4 py-2.5 border-b-2 border-neutral-900 flex items-center justify-between gap-2 flex-wrap bg-white">
                <h3 className="text-[13px] font-black tracking-wide text-neutral-900 uppercase">
                  {section.title}
                </h3>
                {section.questionRange && (
                  <span
                    className="text-[10.5px] font-black text-neutral-800 border border-neutral-500 px-2 py-0.5 bg-neutral-50"
                    dir="ltr"
                  >
                    {section.questionRange}
                  </span>
                )}
              </header>

              <div className="p-3.5 sm:p-5 space-y-4">
                {/* دستور رسمی بخش */}
                {section.instruction && (
                  <p
                    className="text-[11.5px] italic leading-6 text-neutral-700 border-l-[3px] border-neutral-400 pl-3"
                    dir="ltr"
                  >
                    {section.instruction}
                  </p>
                )}

                {/* باکس گزینه‌های مشترک بخش (باکس تطبیق A–G) */}
                {section.optionsBox && section.optionsBox.length >= 2 && (
                  <div className="border border-neutral-400 bg-white p-3.5" dir="ltr">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-neutral-500 mb-2">
                      Boxed options
                    </p>
                    <div className="space-y-1">
                      {section.optionsBox.map((opt) => (
                        <div key={opt.letter} className="flex items-start gap-2.5">
                          <span
                            className="w-5 h-5 shrink-0 border border-neutral-500 bg-neutral-50 text-[10px] font-black flex items-center justify-center mt-0.5 text-neutral-900"
                            dir="ltr"
                          >
                            {opt.letter}
                          </span>
                          <span className="text-[12px] leading-6 text-neutral-800">
                            {opt.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* پاساژ ریدینگ — قاب مطالعه */}
                {section.passageBody && (
                  <div
                    className="border border-neutral-300 bg-white p-4 sm:p-5 max-h-[460px] overflow-y-auto"
                    dir="ltr"
                  >
                    {section.passageTitle && (
                      <p className="text-[13.5px] font-black text-neutral-900 mb-3 text-center tracking-wide">
                        {section.passageTitle}
                      </p>
                    )}
                    <p className="text-[12.5px] leading-7 text-neutral-800 text-justify whitespace-pre-line">
                      {section.passageBody}
                    </p>
                  </div>
                )}

                {/* سوال‌ها — هر کدام در ردیف کادردار */}
                <div className="space-y-2.5">
                  {section.questions.map((q) => (
                    <QuestionRow
                      key={q.number}
                      q={q}
                      prefix={prefix}
                      sectionBox={section.optionsBox}
                      answer={answers[`${prefix}${q.number}`] ?? ""}
                      onChange={onChange}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* پایان برگه */}
          {sections.length > 0 && (
            <p className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400 pt-1">
              — End of paper —
            </p>
          )}
        </div>
      </div>

      {/* ---------- حالت خالی ---------- */}
      {sections.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-neutral-300 bg-white p-6 flex items-center justify-center gap-2 text-neutral-400 text-xs">
          <CircleAlert size={15} aria-hidden />
          {tr("بخشی از PDF خوانده نشد", "No section parsed from the PDF")}
        </div>
      )}
    </div>
  );
}
