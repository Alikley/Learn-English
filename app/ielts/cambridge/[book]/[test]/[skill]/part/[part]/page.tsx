"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Send, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useStructuredPartSession } from "@/app/hook/ielts/useStructuredPartSession";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import PageLoading from "@/app/components/PageLoading";
import { getStructuredExam } from "@/lib/ielts/structured-tests";
import PartGroupView from "./_components/PartGroupView";
import GapInput from "./_components/GapInput";
import PartNavigationBar from "./_components/PartNavigationBar";
import PartResultView, { type PartReviewRow } from "./_components/PartResultView";
import PartSubmitModal from "./_components/PartSubmitModal";
import type { IeltsSkill } from "@/types/ielts";

// ========================================
// پلیر آزمون ساخت‌یافته — سبک تستینو (v1.0.4.2 / English 1.0.0.3)
// /ielts/cambridge/[book]/[test]/[skill]/part/[part]
//
// برگهٔ امتحان واقعی کتاب (محتوای ساخت‌یافته) با:
//  - ناوبری Part 1..4 + چیپ‌های ۴۰ سوال (پاسخ‌داده = آبی)
//  - جدول/فرم/گزینه/تطبیق/نقشه/نمودار مثل کتاب
//  - تایمر حالت آزمون + پخش‌کنندهٔ صوت + تحویل خودکار
//  - تصحیح خودکار با کلید رسمی کتاب + ریویو سوال‌به‌سوال
//
// 🧹 کلین‌کد: نشست → useStructuredPartSession، رندرها →
//    PartGroupView / GapInput / PartNavigationBar / PartResultView /
//    PartSubmitModal (قبلاً ۱۱۲۴ خط در یک فایل)
// ========================================

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
  const exam = useMemo(() => getStructuredExam(bookId, testId, skillKey), [bookId, testId, skillKey]);
  const validPart =
    exam !== null && Number.isInteger(partNum) && partNum >= 1 && partNum <= exam.parts.length;
  const currentPart = exam?.parts.find((p) => p.part === partNum) ?? null;

  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const session = useStructuredPartSession({
    bookId,
    testId,
    skill: skillKey,
    partNum,
    exam,
    validPart,
  });

  const exitHref = `/ielts/cambridge/${bookId}`;

  // ================= رندر =================

  if (session.startError || session.error) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="text-red-500 mb-3" size={36} />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {session.startError ?? session.error}
        </p>
        <Link
          href={exitHref}
          className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          {tr("بازگشت", "Back")}
        </Link>
      </div>
    );
  }

  if (!exam || !validPart || session.loading || !session.payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const showResult = session.result ?? session.submittedView;

  return (
    <div className="min-h-full bg-[#f6f7f9] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <ExamTopBar
        title={exam.title}
        skill={skillKey}
        mode={session.payload.mode}
        remainingSec={session.payload.remainingSec}
        elapsedSec={session.initialElapsed}
        saving={session.saving}
        onExit={() => {
          void session.flush();
          router.push(exitHref);
        }}
        onSubmit={showResult ? undefined : () => setConfirmSubmit(true)}
        submitDisabled={!!showResult}
      />

      {/* ---------- محتوای آزمون (انگلیسی — LTR) ---------- */}
      <main className="max-w-3xl mx-auto px-3 md:px-5 pt-4 pb-[290px]" dir="ltr">
        {showResult ? (
          <PartResultView
            result={session.result}
            stored={session.submittedView}
            review={
              session.result?.review ??
              ((session.payload as unknown as { review?: PartReviewRow[] }).review ?? [])
            }
            exitHref={exitHref}
            bookId={bookId}
            testId={testId}
            isFull={session.isFull}
            mode={session.payload.mode}
            parts={exam.parts.map((p) => p.part)}
            onGoPart={session.goPart}
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
                gapValue={session.gapValue}
                setGap={session.setGap}
                answerValue={(q) => session.payload?.savedAnswers[`l${q}`] ?? ""}
                setAnswerFor={(q, v) => session.setGap({ q }, v)}
                gapAnswered={session.answered}
                reviewFlags={session.reviewFlags}
                activeQuestion={session.activeQuestion}
                onFocusQuestion={session.setActiveQuestion}
                renderChartGap={(q) => (
                  <GapInput
                    id={`input-q-${q}`}
                    q={q}
                    value={session.gapValue({ q })}
                    answered={session.answered(q)}
                    flagged={session.reviewFlags[q] === true}
                    active={session.activeQuestion === q}
                    onChange={(v) => session.setGap({ q }, v)}
                    onFocus={() => session.setActiveQuestion(q)}
                    center
                  />
                )}
              />
            ))}

            {/* دکمهٔ Part بعدی */}
            {partNum < exam.parts.length && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => session.goPart(partNum + 1)}
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
        <PartNavigationBar
          exam={exam}
          partNum={partNum}
          media={session.payload.media}
          examMode={session.payload.mode === "exam"}
          answered={session.answered}
          reviewFlags={session.reviewFlags}
          activeQuestion={session.activeQuestion}
          dir={dir}
          onGoPart={session.goPart}
          onScrollToQuestion={session.scrollToQuestion}
          onToggleFlag={session.toggleFlag}
        />
      )}

      {/* ---------- مودال تأیید تحویل ---------- */}
      <PartSubmitModal
        open={confirmSubmit && !showResult}
        answeredCount={session.answeredCount}
        totalCount={session.allNums.length}
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={() => void session.doSubmit()}
      />
    </div>
  );
}
