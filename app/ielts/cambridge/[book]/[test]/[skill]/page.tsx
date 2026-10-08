"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Send } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { useExamPaper } from "@/app/hook/ielts/useExamPaper";
import { useSkillExamSession } from "@/app/hook/ielts/useSkillExamSession";
import { IELTS_MAX_BOOK } from "@/lib/ielts/real-tests";
import ExamTopBar from "@/app/components/ielts/ExamTopBar";
import ExamPaper from "@/app/components/ielts/ExamPaper";
import RealAudioPlayer from "@/app/components/ielts/RealAudioPlayer";
import PageLoading from "@/app/components/PageLoading";
import AiBuildingScreen from "./_components/AiBuildingScreen";
import WritingPanel from "./_components/WritingPanel";
import ResultView from "./_components/ResultView";
import PaperLoadingCard from "./_components/PaperLoadingCard";
import PaperFallback from "./_components/PaperFallback";
import PdfDrawer from "./_components/PdfDrawer";
import SubmitConfirmModal from "./_components/SubmitConfirmModal";
import type { IeltsSkill, IeltsWritingPrompt } from "@/types/ielts";

// ========================================
// پلیر آزمون آیلتس — برگه از متن PDF (v1.0.4.4 / English 1.0.0.7)
// /ielts/cambridge/[book]/[test]/[skill]?mode=practice|exam&full=1
//
// 🔢 v1.0.0.7 — ترتیب مهارت‌ها مثل آزمون واقعی آیلتس:
//    لیسنینگ → ریدینگ → رایتینگ (قبلاً ریدینگ اول بود)
//
// ریدینگ/لیسنینگ: برگهٔ امتحانی با AI از PDF ساخته می‌شود
// (تولید یک‌بار + کش دائمی) — برگهٔ کاغذی (ExamPaper)
//
// رایتینگ (v1.0.4.4): صورت سوال = متن استخراج‌شدهٔ تسک‌ها بالای
// صفحه (نقشهٔ تأییدشدهٔ همهٔ کتاب‌ها) + صفحهٔ کتاب به‌عنوان مکمل
//
// اگر برگه ساخته نشد → خود PDF + ورودی سریع (PaperFallback)
// تصحیح: کلید دستی → AI → PDF → خودتصحیحی
// ========================================

const SKILL_LABEL: Record<string, { fa: string; en: string }> = {
  reading: { fa: "ریدینگ", en: "Reading" },
  listening: { fa: "لیسنینگ", en: "Listening" },
  writing: { fa: "رایتینگ", en: "Writing" },
};

// ترتیب آزمون واقعی: لیسنینگ → ریدینگ → رایتینگ (v1.0.0.7)
const NEXT_SKILL: Partial<Record<IeltsSkill, IeltsSkill>> = {
  listening: "reading",
  reading: "writing",
};

export default function SkillPlayerPage() {
  const { book, test, skill } = useParams<{
    book: string;
    test: string;
    skill: string;
  }>();
  const router = useRouter();
  const { tr, dir } = useLanguage();
  // مشخصات داوطلب برای هدر برگهٔ امتحانی
  const { user } = useAuth();

  const bookId = Number(book);
  const testId = Number(test);
  const skillKey = (skill as IeltsSkill) ?? "reading";

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [writingTask, setWritingTask] = useState<1 | 2>(1);
  const [pdfOpen, setPdfOpen] = useState(false);

  // برگهٔ امتحان — هوش مصنوعی (کش دائمی) با جایگزین پارسر قدیمی
  const {
    paper,
    loading: paperLoading,
    generating: paperGenerating,
    error: paperError,
    refetch: refetchPaper,
  } = useExamPaper(
    Number.isInteger(bookId) && bookId >= 1 && bookId <= IELTS_MAX_BOOK ? bookId : null,
    Number.isInteger(testId) && testId >= 1 && testId <= 4 ? testId : null,
    skillKey,
  );

  // نشست تلاش — شروع فقط بعد از آماده‌شدن برگه (انصاف تایمر)
  const session = useSkillExamSession({
    bookId,
    testId,
    skill: skillKey,
    paperLoading,
    paperGenerating,
  });

  const exitHref = `/ielts/cambridge/${bookId}`;
  const title = `Cambridge ${String(bookId).padStart(2, "0")} — Test ${testId}`;

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

  // اولین بازدید — برگه با AI در حال ساخت است
  if (paperGenerating) {
    return (
      <AiBuildingScreen
        title={title}
        skillLabel={tr(SKILL_LABEL[skillKey]?.fa ?? "", SKILL_LABEL[skillKey]?.en ?? "")}
        exitHref={exitHref}
      />
    );
  }

  if (session.loading || !session.payload) {
    return (
      <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220]">
        <PageLoading minHeightClass="min-h-screen" />
      </div>
    );
  }

  const payload = session.payload;
  const isExam = payload.mode === "exam";
  const skillInfo = SKILL_LABEL[skillKey] ?? SKILL_LABEL.reading;

  // وضعیت برگهٔ امتحان
  const paperReady = !paperLoading && !paperGenerating && !paperError && paper?.ok === true;
  const paperFailed =
    !paperLoading && !paperGenerating && (paperError != null || (paper != null && paper.ok === false));
  const paperFailReason = paperError ?? (paper?.ok === false ? paper.reason : null);
  const paperAiError = paper?.ok === false ? paper.aiError : undefined;
  const paperAiGenerated = paper?.ok === true ? paper.aiGenerated === true : false;
  const isAiRetryable = !!paperAiError;
  const writingPrompts: IeltsWritingPrompt[] =
    paper?.ok === true && skillKey === "writing" ? (paper.writing ?? []) : [];
  const writingQuestionPaper =
    paper?.ok === true && skillKey === "writing" ? (paper.questionPaper ?? null) : null;

  const showResult = session.result ?? session.submittedView;

  return (
    <div className="min-h-full bg-[#fbfbfb] dark:bg-[#0b1220] transition-colors" dir={dir}>
      <ExamTopBar
        title={`${title} · ${tr(skillInfo.fa, skillInfo.en)}`}
        skill={skillKey}
        mode={payload.mode}
        remainingSec={payload.remainingSec}
        elapsedSec={0}
        saving={session.saving}
        onExit={() => {
          void session.flush();
          router.push(exitHref);
        }}
        onSubmit={showResult ? undefined : () => setConfirmSubmit(true)}
        submitDisabled={!!showResult}
      />

      <div className="max-w-3xl mx-auto px-3 md:px-5 py-4 md:py-6">
        {/* ================= نمای نتیجه ================= */}
        {showResult && (
          <ResultView
            result={session.result}
            stored={session.submittedView}
            selfScoreDone={session.selfScoreDone}
            skill={skillKey}
            bookId={bookId}
            testId={testId}
            isExam={isExam}
            selfScoreInput={session.selfScoreInput}
            setSelfScoreInput={session.setSelfScoreInput}
            doSelfScore={session.doSelfScore}
            selfScoreSaving={session.selfScoreSaving}
            selfScoreError={session.selfScoreError}
            exitHref={exitHref}
            writingPrompts={writingPrompts}
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
            {/* لیسنینگ: پخش‌کنندهٔ بالای برگه */}
            {skillKey === "listening" && (
              <RealAudioPlayer
                tracks={payload.media.audioTracks}
                shared={payload.media.audioShared}
                examMode={isExam}
              />
            )}

            {/* رایتینگ — صورت سوال = صفحهٔ واقعی کتاب (بدون AI) */}
            {skillKey === "writing" && (
              <WritingPanel
                answers={payload.savedAnswers}
                onChange={session.setAnswer}
                disabled={false}
                activeTask={writingTask}
                setActiveTask={setWritingTask}
                isExam={isExam}
                prompts={writingPrompts}
                questionPaper={writingQuestionPaper}
                pdfUrl={payload.media.pdfUrl}
                paperLoading={paperLoading}
                paperFailed={paperFailed}
              />
            )}

            {/* ریدینگ/لیسنینگ: برگهٔ امتحان (AI / پارسر) */}
            {skillKey !== "writing" && paperReady && paper?.ok === true && (
              <ExamPaper
                skill={skillKey as "reading" | "listening"}
                bookId={bookId}
                testId={testId}
                mode={payload.mode}
                userName={user?.name ?? user?.nickname ?? ""}
                userEmail={user?.email ?? ""}
                sections={paper.sections}
                totalQuestions={Math.max(paper.totalQuestions, session.meta.questions)}
                answers={payload.savedAnswers}
                onChange={session.setAnswer}
                aiGenerated={paperAiGenerated}
              />
            )}

            {/* ریدینگ/لیسنینگ: در حال ساخت/خواندن برگه */}
            {skillKey !== "writing" && paperLoading && !paperGenerating && <PaperLoadingCard />}

            {/* حالت جایگزین: برگه ساخته نشد → خود PDF + ورودی سریع */}
            {skillKey !== "writing" && paperFailed && (
              <PaperFallback
                pdfUrl={payload.media.pdfUrl}
                bookTitle={`Cambridge IELTS ${String(bookId).padStart(2, "0")} — Official Book PDF`}
                failReason={paperFailReason}
                aiError={paperAiError}
                retryable={isAiRetryable}
                onRetry={() => refetchPaper(true)}
                answerIds={session.answerIds}
                answeredCount={session.answeredCount}
                savedAnswers={payload.savedAnswers}
                onAnswer={session.setAnswer}
              />
            )}

            {/* دکمهٔ تحویل */}
            <button
              onClick={() => setConfirmSubmit(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition active:scale-[0.99]"
            >
              <Send size={15} />
              {tr("تحویل آزمون", "Submit exam")}
              <span className="text-[10px] font-medium opacity-80">
                ({tr(`${session.answeredCount} پاسخ`, `${session.answeredCount} answered`)})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* دکمهٔ شناور + پنل کشویی کتاب PDF — در هر وضعیت برگه در دسترس */}
      {!showResult && payload.media.pdfUrl && (
        <PdfDrawer
          open={pdfOpen}
          onOpen={() => setPdfOpen(true)}
          onClose={() => setPdfOpen(false)}
          pdfUrl={payload.media.pdfUrl}
          bookId={bookId}
        />
      )}

      {/* مودال تأیید تحویل */}
      <SubmitConfirmModal
        open={confirmSubmit && !showResult}
        answeredCount={session.answeredCount}
        totalCount={session.answerIds.length}
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={() => void session.doSubmit()}
      />
    </div>
  );
}
