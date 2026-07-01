"use client";

import { useParams, useRouter } from "next/navigation";
import ContinueButton from "@/app/components/lesson/ContinueButton";
import ExampleCard from "@/app/components/lesson/ExampleCard";
import LessonHeader from "@/app/components/lesson/LessonHeader";
import ProgressStepper from "@/app/components/lesson/ProgressStepper";
import { useState, useEffect } from "react";

type LessonContent = {
  title: string;
  rule?: string;
  examples?: string[];
  explanation?: string;
  practice?: string;
};

export default function LessonPage() {
  const { courseId, lesson: lessonSlug } = useParams<{
    courseId: string;
    lesson: string;
  }>();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<{
    id: string;
    title: string;
    xp: number;
    content: string | null;
    type: string;
  } | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [parsedContent, setParsedContent] = useState<LessonContent | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      if (!courseId || !lessonSlug) return;

      try {
        // دریافت اطلاعات دوره برای پیدا کردن درس
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) return;

        const data = await res.json();
        setCourseTitle(data.title || "");

        const foundLesson = data.lessons?.find(
          (l: { id: string }) => l.id === lessonSlug,
        );

        if (foundLesson) {
          setLesson(foundLesson);

          // پارس کردن محتوای درس
          if (foundLesson.content) {
            try {
              const parsed = JSON.parse(foundLesson.content);
              setParsedContent(parsed);
            } catch {
              setParsedContent({
                title: foundLesson.title,
                explanation: foundLesson.content,
              });
            }
          }
        }
      } catch (e) {
        console.error("Error fetching lesson:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [courseId, lessonSlug]);

  const handleComplete = async () => {
    if (!lesson || !courseId) return;

    setCompleting(true);
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, score: 100 }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  const steps =
    parsedContent?.examples && parsedContent.examples.length > 0
      ? [
          "آموزش",
          ...parsedContent.examples.map((_, i) => `مثال ${i + 1}`),
          "تمرین",
        ]
      : ["آموزش", "تمرین"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3"
        dir="rtl"
      >
        <p className="text-slate-500">درس یافت نشد</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm"
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb]" dir="rtl">
      <LessonHeader
        title={lesson.title}
        subtitle={courseTitle}
        xp={lesson.xp}
        index={step}
      />

      {/* BODY */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Progress Stepper */}
        <ProgressStepper sections={steps} currentIndex={step} />

        {/* STEP 0 - TEACHING */}
        {step === 0 && (
          <ExampleCard
            title="آموزش"
            text={
              parsedContent?.rule ||
              parsedContent?.title ||
              "محتوای این درس در حال آماده‌سازی است."
            }
            explanation={
              parsedContent?.explanation ||
              (parsedContent?.rule
                ? `قانون: ${parsedContent.rule}`
                : undefined)
            }
          />
        )}

        {/* EXAMPLE STEPS */}
        {parsedContent?.examples &&
          parsedContent.examples.map((example, idx) => {
            if (step !== idx + 1) return null;
            return (
              <ExampleCard
                key={idx}
                title={`مثال ${idx + 1}`}
                text={example}
                explanation="این مثال را به دقت مطالعه کنید"
              />
            );
          })}

        {/* LAST STEP - PRACTICE */}
        {step === steps.length - 1 && (
          <ExampleCard
            title="تمرین"
            text={
              parsedContent?.practice ||
              "سعی کنید جملات خودتان بسازید و از قواعد استفاده کنید."
            }
            explanation="تمرین بیشتر = یادگیری بهتر"
          />
        )}

        {/* BUTTON */}
        <div className="pt-4">
          {step < steps.length - 1 ? (
            <ContinueButton
              onClick={() => setStep((s) => s + 1)}
              label="ادامه درس"
            />
          ) : (
            <ContinueButton
              loading={completing}
              onClick={handleComplete}
              label={completing ? "در حال ثبت..." : "تکمیل درس"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
