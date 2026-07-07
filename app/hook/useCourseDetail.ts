"use client";

import { useState, useEffect, useCallback } from "react";
import type { CourseDetail } from "@/types/course";

// نوع داده‌ای که API برمیگردونه (Prisma با relation‌های تو در تو)
type ApiLesson = {
  id: string;
  title: string;
  duration: number | null;
  xp: number;
  order: number;
  content: string | null;
  type: string;
  progress: Array<{
    isCompleted: boolean;
    completedAt: string | null;
    score: number | null;
  }>;
};

type ApiCourseResponse = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  level: string;
  imageUrl: string | null;
  color: string | null;
  lessons: ApiLesson[];
  enrollments: Array<{ progress: number; enrolledAt: string | null }>;
  isEnrolled: boolean;
};

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`);

      if (!res.ok) {
        setCourse(null);
        return;
      }

      const raw: ApiCourseResponse = await res.json();

      // 👇 ترنسفورم: داده API رو به فرمتی که فرانت‌اند انتظار داره تبدیل می‌کنیم
      const transformed: CourseDetail = {
        id: raw.id,
        title: raw.title,
        titleEn: raw.titleEn,
        description: raw.description,
        level: raw.level,
        imageUrl: raw.imageUrl,
        color: raw.color,
        isEnrolled: raw.isEnrolled,
        progress: raw.enrollments[0]?.progress ?? 0,
        lessons: raw.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          xp: lesson.xp,
          order: lesson.order,
          // فلت کردن: progress تو در تو رو بیاریم بیرون
          isCompleted: lesson.progress[0]?.isCompleted ?? false,
          completedAt: lesson.progress[0]?.completedAt ?? null,
          score: lesson.progress[0]?.score ?? null,
        })),
      };

      setCourse(transformed);
    } catch (e) {
      console.error(e);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    void (async () => {
      await fetchCourse();
    })();
  }, [courseId, fetchCourse]);

  const completeLesson = async (lessonId: string) => {
    if (!course?.isEnrolled) return;

    setCompleting(lessonId);

    await fetch(`/api/courses/${courseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, score: 100 }),
    });

    await fetchCourse();
    setCompleting(null);
  };

  const stats = course
    ? {
        completedCount: course.lessons.filter((l) => l.isCompleted).length,
        earnedXp: course.lessons
          .filter((l) => l.isCompleted)
          .reduce((s, l) => s + l.xp, 0),
        totalXp: course.lessons.reduce((s, l) => s + l.xp, 0),
      }
    : null;

  return { course, loading, completing, completeLesson, stats };
}
