import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronLeft } from "lucide-react";
import type { Course } from "@/types/course";
import { LEVEL_COLOR, LEVEL_LABEL } from "@/types/course";

type Props = {
  course: Course;
  onEnroll: (id: string) => void;
  enrolling: string | null;
};

export default function CourseCard({ course, onEnroll, enrolling }: Props) {
  const isEnrolling = enrolling === course.id;

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(15,23,42,0.06)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all duration-300 flex flex-col">
      {/* تصویر */}
      <div className="relative aspect-[16/7] overflow-hidden bg-slate-100">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-slate-300" />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[course.level] ?? "bg-slate-100 text-slate-600"}`}
        >
          {LEVEL_LABEL[course.level] ?? course.level}
        </span>
      </div>

      {/* محتوا */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="text-xs text-slate-400 mb-3">
          {course.totalLessons} درس
        </div>

        {/* پیشرفت */}
        {course.isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{course.progress}%</span>
              <span>پیشرفت</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${course.color ?? "bg-blue-500"}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* دکمه */}
        <div className="mt-auto">
          {course.isEnrolled ? (
            <Link
              href={`/my-course/${course.id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              <ChevronLeft size={16} />
              ادامه دوره
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling}
              className="w-full flex items-center justify-center gap-1.5 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {isEnrolling ? (
                <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <>
                  <BookOpen size={15} />
                  ثبت‌نام
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
