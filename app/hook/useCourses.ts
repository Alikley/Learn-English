"use client";

import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/types/course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "error");

      setCourses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const enroll = async (courseId: string) => {
    if (!courseId) return;

    setEnrolling(courseId);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      await fetchCourses();
    } finally {
      setEnrolling(null);
    }
  };

  return { courses, loading, enrolling, enroll };
}
