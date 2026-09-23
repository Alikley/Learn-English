"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) return;

      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCourses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchCourses]);

  const enroll = async (courseId: string) => {
    if (!courseId) return;

    setEnrolling(courseId);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
      });

      if (!res.ok) return;

      await fetchCourses();

      // 👇 بعد از ثبت‌نام موفق، مستقیم به صفحه دوره بریم
      router.push(`/courses/${courseId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(null);
    }
  };

  return { courses, loading, enrolling, enroll };
}
