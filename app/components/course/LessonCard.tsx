"use client";

import { CheckCircle2, Circle, Clock, Star, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Lesson } from "@/types/course";
import type { CourseTheme } from "@/lib/course-theme";

// ========================================
// کارت درس — حالت نردبانی (v1.0.1.0)
//
// بر اساس عکس مرجع کاربر:
//  - کارت‌ها به‌صورت پله‌پله پایین می‌روند (هر کارت
//    نسبت به بالایی کمی جابه‌جا می‌شود) و کاربر درس‌ها
//    را مثل نردبان رد می‌کند.
//  - شماره درس در حلقه‌ای رنگی، عنوان پررنگ، متادیتا
//    (XP طلایی + مدت زمان) و دکمه «شروع» رنگی.
//  - رنگ‌ها از تم بخش دوره می‌آیند (گرامر آبی،
//    مکالمه سبز، لغات بنفش، لیسنینگ نارنجی).
//
// آفست پله با متغیر CSS (--stair-step) است تا در
// موبایل کوچکتر شود؛ عرض کارت با min() محدود می‌ماند
// تا از کادر بیرون نزند. انیمیشن ورود پله‌ای است
// (هر کارت کمی دیرتر از قبلی می‌آید).
// ========================================

type Props = {
  lesson: Lesson;
  index: number;
  total: number; // تعداد کل درس‌ها برای محاسبه پله
  theme: CourseTheme;
  isEnrolled: boolean;
  courseId: string;
  completing: string | null;
  onComplete: (id: string) => void;
};

// حداکثر جابه‌جایی نردبان (پیکسل) — بعد از این، پله‌ها فشرده می‌شوند
const MAX_STAIR = 150;

export default function LessonCard({
  lesson,
  index,
  total,
  theme,
  isEnrolled,
  courseId,
  completing,
}: Props) {
  const isCompleting = completing === lesson.id;
  const router = useRouter();

  // اندازه هر پله: با ۵ درس ~34px؛ درس‌های بیشتر خودکار فشرده می‌شوند
  const step = Math.min(34, Math.floor(MAX_STAIR / Math.max(total - 1, 1)));
  const offset = index * step;

  const handleStart = () => {
    // هدایت به صفحه درس
    router.push(`/courses/${courseId}/lesson/${lesson.id}`);
  };

  return (
    <motion.div
      // پله نردبان: در RTL هر کارت از راست به چپ پایین می‌رود؛
      // عرض کارت ثابت می‌ماند (min با فضای باقی‌مانده) تا کل
      // کارت جابه‌جا شود و نردبانِ هم‌عرض شکل بگیرد.
      style={{
        marginInlineStart: `min(${offset}px, 22vw)`,
        width: `min(34rem, calc(100% - min(${offset}px, 22vw)))`,
      }}
      initial={{ opacity: 0, x: 40, y: 18 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
      }}
      className={`relative bg-white rounded-2xl border transition-all duration-200 ${
        lesson.isCompleted
          ? "border-green-200 shadow-[0_4px_16px_rgba(34,197,94,0.10)]"
          : `border-white/80 shadow-[0_4px_18px_rgba(15,23,42,0.08)] ${theme.hoverBorder} ${theme.hoverShadow}`
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* شماره/وضعیت — حلقه رنگی بخش */}
        <div className="shrink-0">
          {lesson.isCompleted ? (
            <CheckCircle2 size={30} className="text-green-500" />
          ) : (
            <div
              className={`w-9 h-9 rounded-full border-2 ${theme.ring} bg-white flex items-center justify-center shadow-sm`}
            >
              <span
                className={`text-sm font-bold ${theme.ringText}`}
              >
                {index + 1}
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm md:text-base leading-tight ${
              lesson.isCompleted ? "text-green-700" : "text-slate-800"
            }`}
          >
            {lesson.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {lesson.xp} XP
            </span>
            {lesson.duration && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={13} />
                {lesson.duration} دقیقه
              </span>
            )}
            {lesson.score !== null && (
              <span className="text-xs text-green-600 font-medium">
                امتیاز: {lesson.score}
              </span>
            )}
          </div>
        </div>

        {/* دکمه — به رنگ بخش */}
        {isEnrolled ? (
          lesson.isCompleted ? (
            <button
              onClick={handleStart}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 transition-colors ${theme.soft}`}
            >
              مشاهده مجدد
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isCompleting}
              className={`flex items-center gap-1 text-xs font-semibold text-white px-4 py-2 rounded-xl transition-all shrink-0 shadow-sm hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 ${theme.solid}`}
            >
              {isCompleting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ChevronLeft size={14} />
                  شروع
                </>
              )}
            </button>
          )
        ) : (
          <Circle size={20} className="text-slate-300 shrink-0" />
        )}
      </div>
    </motion.div>
  );
}
