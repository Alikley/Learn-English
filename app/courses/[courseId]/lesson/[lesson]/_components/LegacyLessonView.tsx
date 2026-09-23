"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { useState } from "react";
import ContinueButton from "@/app/components/lesson/ContinueButton";
import ExampleCard from "@/app/components/lesson/ExampleCard";
import LessonHeader from "@/app/components/lesson/LessonHeader";
import ProgressStepper from "@/app/components/lesson/ProgressStepper";

// ========================================
// مسیر قدیمی درس‌های عمومی (fallback) — محتوای JSON قدیمی
// (از صفحهٔ درس تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export type LegacyContent = {
  title?: string;
  rule?: string;
  examples?: string[];
  explanation?: string;
  practice?: string;
};

export default function LegacyLessonView({
  lesson,
  courseTitle,
  parsedContent,
  completing,
  onComplete,
}: {
  lesson: { id: string; title: string; xp: number };
  courseTitle: string;
  parsedContent: LegacyContent | null;
  completing: boolean;
  onComplete: () => void;
}) {
  const { tr, dir } = useLanguage();
  const [step, setStep] = useState(0);

  const steps =
    parsedContent?.examples && parsedContent.examples.length > 0
      ? [
          tr("آموزش", "Tutorial"),
          ...parsedContent.examples.map((_, i) => tr(`مثال ${i + 1}`, `Example ${i + 1}`)),
          tr("تمرین", "Practice"),
        ]
      : [tr("آموزش", "Tutorial"), tr("تمرین", "Practice")];

  return (
    <div className="min-h-screen bg-[#fbfbfb]" dir={dir}>
      <LessonHeader
        title={lesson.title}
        subtitle={courseTitle}
        xp={lesson.xp}
        index={step}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <ProgressStepper sections={steps} currentIndex={step} />

        {step === 0 && (
          <ExampleCard
            title={tr("آموزش", "Tutorial")}
            text={
              parsedContent?.rule ||
              parsedContent?.title ||
              tr("محتوای این درس در حال آماده‌سازی است.", "The content of this lesson is being prepared.")
            }
            explanation={
              parsedContent?.explanation ||
              (parsedContent?.rule
                ? tr(`قانون: ${parsedContent.rule}`, `Rule: ${parsedContent.rule}`)
                : undefined)
            }
          />
        )}

        {parsedContent?.examples &&
          parsedContent.examples.map((example, idx) => {
            if (step !== idx + 1) return null;
            return (
              <ExampleCard
                key={idx}
                title={tr(`مثال ${idx + 1}`, `Example ${idx + 1}`)}
                text={example}
                explanation={tr("این مثال را به دقت مطالعه کنید", "Read this example carefully")}
              />
            );
          })}

        {step === steps.length - 1 && (
          <ExampleCard
            title={tr("تمرین", "Practice")}
            text={
              parsedContent?.practice ||
              tr("سعی کنید جملات خودتان بسازید و از قواعد استفاده کنید.", "Try to build your own sentences using the rules.")
            }
            explanation={tr("تمرین بیشتر = یادگیری بهتر", "More practice = better learning")}
          />
        )}

        <div className="pt-4">
          {step < steps.length - 1 ? (
            <ContinueButton
              onClick={() => setStep((s) => s + 1)}
              label={tr("ادامه درس", "Continue Lesson")}
            />
          ) : (
            <ContinueButton
              loading={completing}
              onClick={onComplete}
              label={completing ? tr("در حال ثبت...", "Saving...") : tr("تکمیل درس", "Finish Lesson")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
