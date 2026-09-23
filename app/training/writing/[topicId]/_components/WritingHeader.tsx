"use client";

import { ArrowRight } from "lucide-react";
import { Stars } from "@/app/components/practice/PracticeBits";
import { HoverableText } from "@/app/components/vocabulary/HoverableText";

// ========================================
// هدر ادیتور نوشتاری — عنوان + ستاره‌های بهترین رکورد
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function WritingHeader({
  onBack,
  titleFa,
  titleEn,
  bestStars,
}: {
  onBack: () => void;
  titleFa: string;
  titleEn: string;
  bestStars: number;
}) {
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
          {bestStars > 0 && <Stars count={bestStars} />}
        </div>
        <p className="text-sm text-slate-500 truncate">
          <HoverableText text={titleEn} />
        </p>
      </div>
    </div>
  );
}
