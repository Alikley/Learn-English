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
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const enroll = async (courseId: string) => {
    setEnrolling(courseId);
    await fetch(`/api/courses/${courseId}`, { method: "PATCH" });
    await fetchCourses();
    setEnrolling(null);
  };

  return { courses, loading, enrolling, enroll };
}
