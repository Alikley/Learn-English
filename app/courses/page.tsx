"use client";

import CourseCard from "@/app/components/course/CourseCard";
import EmptyState from "@/app/components/course/EmptyState";
import { TOPIC_GROUPS } from "@/types/course";
import { useCourses } from "../hook/useCourses";

export default function MyCoursePage() {
  const { courses, loading, enrolling, enroll } = useCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (courses.length === 0) return <EmptyState />;

  return (
    <div className="w-full min-h-full bg-[#fbfbfb] pb-12" dir="rtl">
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-5">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          دوره‌های من
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          مسیر یادگیری خود را انتخاب کن
        </p>
      </div>

      <div className="px-4 md:px-6 pt-6 space-y-10">
        {TOPIC_GROUPS.map((group) => {
          const grouped = courses.filter((c) =>
            c.titleEn?.toLowerCase().includes(group.key.toLowerCase()),
          );
          if (grouped.length === 0) return null;

          return (
            <section key={group.key}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {group.label}
                </h2>
                <span className="text-slate-400 text-sm">
                  ({grouped.length} دوره)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {grouped.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={enroll}
                    enrolling={enrolling}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
