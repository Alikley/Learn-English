"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import PageLoading from "@/app/components/PageLoading";

import { useParams, useRouter } from "next/navigation";
import LessonHeader from "@/app/components/lesson/LessonHeader";
import LessonRenderer from "@/app/components/lesson/LessonRenderer";
import { useState, useEffect } from "react";
import { getCourseTheme } from "@/lib/course-theme";
import { CEFR_LABEL, type Cefr } from "@/data/lessons/types";
import DecorativeClouds from "./_components/DecorativeClouds";
import LegacyLessonView, { type LegacyContent } from "./_components/LegacyLessonView";

// ========================================
// صفحه درس — مسیر جدید (LessonRenderer) + مسیر قدیمی (fallback)
// v1.0.2.7 — ریفکتوری: ابرهای تزئینی و مسیر قدیمی به
// _components تفکیک شدند؛ اینجا فقط دریافت + ناوبری.
// ========================================

type LessonContentMeta = {
  kind?: string;
  slug?: string;
  cefr?: string;
};

export default function LessonPage() {
  const { tr, dir } = useLanguage();
  const { courseId, lesson: lessonSlug } = useParams<{
    courseId: string;
    lesson: string;
  }>();
  const router = useRouter();

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
        // v1.0.1.3 — replace به‌جای push: درسِ تکمیل‌شده از تاریخچه حذف می‌شود
        // تا دکمه «بازگشت» دیگر کاربر را به همان درسِ تمام‌شده برنگرداند
        router.replace(`/courses/${courseId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <PageLoading />;

  if (!lesson) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-3"
        dir={dir}
      >
        <p className="text-slate-500">{tr("درس یافت نشد", "Lesson not found")}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm"
        >
          {tr("بازگشت", "Back")}
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
        dir={dir}
      >
        {/* ابرهای نرم — هماهنگ با صفحه دوره */}
        <DecorativeClouds />

        <div className="relative z-10">
          <LessonHeader
            title={lesson.title}
            subtitle={`${courseTitle}${cefrLabel ? " · " + cefrLabel : ""}`}
            xp={lesson.xp}
            cefr={cefrLabel ?? undefined}
            backHref={`/courses/${courseId}`}
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
  return (
    <LegacyLessonView
      lesson={lesson}
      courseTitle={courseTitle}
      parsedContent={parsedContent}
      completing={completing}
      onComplete={() => void handleComplete()}
    />
  );
}
