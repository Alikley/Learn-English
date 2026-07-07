"use client";

import { ArrowRight, BookOpen, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  subtitle?: string;
  xp?: number;
  index?: number;
};

export default function LessonHeader({ title, subtitle, xp, index }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="px-4 md:px-6 py-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-4"
        >
          <ArrowRight size={16} />
          بازگشت
        </button>

        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}

            {typeof index === "number" && (
              <div className="text-xs text-slate-400 mt-1">درس {index + 1}</div>
            )}
          </div>

          {/* XP badge */}
          {xp && (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
              <Star size={14} />
              {xp} XP
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
