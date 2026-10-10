import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronLeft, PlayCircle } from "lucide-react";
import type { Course } from "@/types/course";
import { LEVEL_COLOR, LEVEL_LABEL } from "@/types/course";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// کارت دوره — بازطراحی v1.0.4.4 (English 1.0.0.8)
//
// 🎨 بازخورد کاربر: «دیزاین کارت‌ها خوب نیست — واضح بشه»
//  - سلسله‌مراتب واضح: تصویر ← عنوان ← توضیح ← متا ← پیشرفت ← دکمه
//  - ناحیهٔ تصویر 16:10 با پس‌زمینهٔ رنگ دسته + بج سطح در گوشهٔ منطقی (end)
//  - ردیف متا: تعداد درس + درصد پیشرفت همیشه دیده می‌شود
//  - نوار پیشرفت ضخیم‌تر با برچسب؛ دکمهٔ تمام‌عرض مشخص‌تر
//  - دارک‌مود کامل (بج‌ها و پس‌زمینهٔ تصویر نسخهٔ تیره دارند)
//  - هاور: بالا آمدن نرم + بزرگ‌شدن تصویر + سایه
// ========================================

// 👇 نگاشت دسته‌بندی به عکس پیش‌فرض
const CATEGORY_IMAGES: Record<string, string> = {
  grammar: "/assets/grammar.svg",
  conversation: "/assets/conversation.svg",
  vocabulary: "/assets/vocabulary.svg",
  listening: "/assets/listening.svg",
};

// 👇 نگاشت دسته‌بندی به رنگ پس‌زمینه (روشن + تیره)
const CATEGORY_BG: Record<string, string> = {
  grammar: "bg-blue-50 dark:bg-blue-500/10",
  conversation: "bg-teal-50 dark:bg-teal-500/10",
  vocabulary: "bg-purple-50 dark:bg-purple-500/10",
  listening: "bg-orange-50 dark:bg-orange-500/10",
};

function getCourseImage(course: Course): string {
  if (course.imageUrl) return course.imageUrl;

  const key = course.titleEn?.toLowerCase() ?? "";
  for (const [category, image] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(category)) return image;
  }
  return "";
}

function getCourseBg(course: Course): string {
  const key = course.titleEn?.toLowerCase() ?? "";
  for (const [category, bg] of Object.entries(CATEGORY_BG)) {
    if (key.includes(category)) return bg;
  }
  return "bg-slate-50 dark:bg-slate-800";
}

type Props = {
  course: Course;
  onEnroll: (id: string) => void;
  enrolling: string | null;
};

export default function CourseCard({ course, onEnroll, enrolling }: Props) {
  const { tr } = useLanguage();
  const isEnrolling = enrolling === course.id;
  const imageSrc = getCourseImage(course);
  const bgColor = getCourseBg(course);
  const progressColor = course.color ?? "bg-blue-500";

  return (
    <div className="group h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,23,42,0.05)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.5)]">
      {/* ================= تصویر — 16:10 با بج سطح ================= */}
      <div className={`relative aspect-[16/10] overflow-hidden ${bgColor}`}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <span
          className={`absolute top-2.5 end-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur shadow-sm ${LEVEL_COLOR[course.level] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
        >
          {LEVEL_LABEL[course.level] ?? course.level}
        </span>
      </div>

      {/* ================= محتوا ================= */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* عنوان */}
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[15px] leading-snug">
          {course.title}
        </h3>

        {/* توضیح */}
        {course.description && (
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 min-h-[2.4rem]">
            {course.description}
          </p>
        )}

        {/* ردیف متا — تعداد درس + درصد پیشرفت */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.totalLessons} {tr("درس", "lessons")}
          </span>
          {course.isEnrolled && (
            <span className="font-bold tabular-nums" dir="ltr">
              {course.progress}%
            </span>
          )}
        </div>

        {/* پیشرفت — نوار ضخیم‌تر با برچسب */}
        {course.isEnrolled && (
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
              <span>{tr("پیشرفت دوره", "Course progress")}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* دکمه — تمام‌عرض و مشخص */}
        <div className="mt-auto pt-2">
          {course.isEnrolled ? (
            <Link
              href={`/courses/${course.id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors"
            >
              <PlayCircle size={15} />
              {tr("ادامه دوره", "Continue")}
              <ChevronLeft size={14} className="rtl:rotate-180 opacity-70" />
            </Link>
          ) : (
            <button
              onClick={() => course?.id && onEnroll(course.id)}
              disabled={!course?.id || isEnrolling}
              className="w-full flex items-center justify-center gap-1.5 border-2 border-blue-200 dark:border-blue-500/40 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[13px] font-bold py-2 rounded-xl transition-all disabled:opacity-60"
            >
              {isEnrolling ? (
                <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <>
                  <BookOpen size={15} />
                  {tr("ثبت‌نام رایگان", "Enroll free")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
