import { CheckCircle2, Circle, Clock, Star, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/types/course";

type Props = {
  lesson: Lesson;
  index: number;
  isEnrolled: boolean;
  courseId: string;
  completing: string | null;
  onComplete: (id: string) => void;
};

export default function LessonCard({
  lesson,
  index,
  isEnrolled,
  courseId,
  completing,
  onComplete,
}: Props) {
  const isCompleting = completing === lesson.id;
  const router = useRouter();

  const handleStart = () => {
    // هدایت به صفحه درس
    router.push(`/courses/${courseId}/lesson/${lesson.id}`);
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 ${
        lesson.isCompleted
          ? "border-green-200 shadow-[0_2px_12px_rgba(34,197,94,0.08)]"
          : "border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:border-blue-200"
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* شماره/وضعیت */}
        <div className="shrink-0">
          {lesson.isCompleted ? (
            <CheckCircle2 size={28} className="text-green-500" />
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400">
                {index + 1}
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm md:text-base leading-tight ${lesson.isCompleted ? "text-green-700" : "text-slate-800"}`}
          >
            {lesson.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            {lesson.duration && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                {lesson.duration} دقیقه
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
              <Star size={12} />
              {lesson.xp} XP
            </span>
            {lesson.score !== null && (
              <span className="text-xs text-green-600 font-medium">
                امتیاز: {lesson.score}
              </span>
            )}
          </div>
        </div>

        {/* دکمه */}
        {isEnrolled ? (
          lesson.isCompleted ? (
            <button
              onClick={handleStart}
              className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              مشاهده مجدد
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isCompleting}
              className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 shrink-0"
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
          <Circle size={20} className="text-slate-200 shrink-0" />
        )}
      </div>
    </div>
  );
}
