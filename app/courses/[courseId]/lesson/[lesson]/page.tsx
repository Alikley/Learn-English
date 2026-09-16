"use client";

import { useParams, useRouter } from "next/navigation";
import ContinueButton from "@/app/components/lesson/ContinueButton";
import ExampleCard from "@/app/components/lesson/ExampleCard";
import LessonHeader from "@/app/components/lesson/LessonHeader";
import LessonRenderer from "@/app/components/lesson/LessonRenderer";
import ProgressStepper from "@/app/components/lesson/ProgressStepper";
import { useState, useEffect } from "react";
import { getCourseTheme } from "@/lib/course-theme";
import { CEFR_LABEL, type Cefr } from "@/data/lessons/types";

type LessonContentMeta = {
  kind?: string;
  slug?: string;
  cefr?: string;
};

type LegacyContent = {
  title?: string;
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
  const [courseTitleEn, setCourseTitleEn] = useState<string | null>(null);
  const [parsedContent, setParsedContent] = useState<LegacyContent | null>(null);
  const [completing, setCompleting] = useState(false);

  // محتوای جدید (v1.0.1.2): {kind, slug, cefr}
  const meta: LessonContentMeta | null = (() => {
    if (!lesson?.content) return null;
    try {
      const parsed = JSON.parse(lesson.content);
      if (parsed && typeof parsed === "object" && parsed.kind && parsed.slug) {
        return parsed as LessonContentMeta;
      }
    } catch {
      return null;
    }
    return null;
  })();

  useEffect(() => {
    async function fetchLesson() {
      if (!courseId || !lessonSlug) return;

      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) return;

        const data = await res.json();
        setCourseTitle(data.title || "");
        setCourseTitleEn(data.titleEn ?? null);

        const foundLesson = data.lessons?.find(
          (l: { id: string }) => l.id === lessonSlug,
        );

        if (foundLesson) {
          setLesson(foundLesson);

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

  const handleComplete = async (score = 100) => {
    if (!lesson || !courseId) return;

    setCompleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, score }),
      });
      if (res.ok) {
        // بازگشت به صفحه دوره با پیشرفت ثبت‌شده
        router.push(`/courses/${courseId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

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

  // تم رنگی بخش (گرامر آبی / مکالمه سبز / لغات بنفش / لیسنینگ نارنجی)
  const theme = getCourseTheme(courseTitleEn);
  const cefrLabel = meta?.cefr ? CEFR_LABEL[meta.cefr as Cefr] ?? meta.cefr : null;

  // ===== مسیر جدید: محتوای واقعی درس‌ها =====
  if (meta?.kind && meta.slug) {
    return (
      <div
        className={`relative w-full min-h-full overflow-hidden ${theme.pageBg}`}
        dir="rtl"
      >
        {/* ابرهای نرم — هماهنگ با صفحه دوره */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute top-24 -left-16 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute top-[42%] right-[12%] w-40 h-40 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute bottom-[18%] -left-10 w-72 h-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-20 right-[28%] w-80 h-80 rounded-full bg-white/35 blur-3xl" />
          <div className="absolute top-[64%] left-[38%] w-24 h-24 rounded-full bg-white/20 blur-2xl" />
        </div>

        <div className="relative z-10">
          <LessonHeader
            title={lesson.title}
            subtitle={`${courseTitle}${cefrLabel ? " · " + cefrLabel : ""}`}
            xp={lesson.xp}
            cefr={cefrLabel ?? undefined}
          />

          <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
            <LessonRenderer
              key={meta.slug}
              slug={meta.slug}
              onComplete={(score) => void handleComplete(score)}
              completing={completing}
            />
          </div>
        </div>
      </div>
    );
  }

  // ===== مسیر قدیمی: درس‌های عمومی (fallback) =====
  const steps =
    parsedContent?.examples && parsedContent.examples.length > 0
      ? [
          "آموزش",
          ...parsedContent.examples.map((_, i) => `مثال ${i + 1}`),
          "تمرین",
        ]
      : ["آموزش", "تمرین"];

  return (
    <div className="min-h-screen bg-[#fbfbfb]" dir="rtl">
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

        <div className="pt-4">
          {step < steps.length - 1 ? (
            <ContinueButton
              onClick={() => setStep((s) => s + 1)}
              label="ادامه درس"
            />
          ) : (
            <ContinueButton
              loading={completing}
              onClick={() => void handleComplete()}
              label={completing ? "در حال ثبت..." : "تکمیل درس"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
