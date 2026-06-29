"use client";

import { useState, useEffect, useCallback } from "react";
import type { CourseDetail } from "@/types/course";

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

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
