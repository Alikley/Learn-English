"use client";

import { ArrowRight, Zap, Star } from "lucide-react";
import { getListeningLevel } from "@/types/listening";

// ========================================
// هدر صفحهٔ تمرین شنیداری — عنوان + سطح + ستاره‌ها + XP
// (از صفحهٔ [podId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function ListeningHeader({
  onBack,
  titleFa,
  title,
  level,
  xp,
  bestStars,
}: {
  onBack: () => void;
  titleFa: string;
  title: string;
  level: string;
  xp: number;
  bestStars: number;
}) {
  const levelInfo = getListeningLevel(level);

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <ArrowRight className="h-5 w-5 text-slate-600" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h1 className="text-lg font-bold text-slate-800">
            {titleFa}
          </h1>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelInfo.color}`}
          >
            {levelInfo.fa}
          </span>
          {bestStars > 0 && (
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < bestStars
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">{title}</p>
      </div>
      <div className="flex items-center gap-1 bg-orange-50 rounded-full px-3 py-1.5 shrink-0">
        <Zap className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-bold text-orange-600">{xp} XP</span>
      </div>
    </div>
  );
}
