"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { RotateCcw, XCircle } from "lucide-react";
import type { ReactNode } from "react";

// ========================================
// حالت‌های مشترک بدنهٔ کارت بازی‌ها (v1.0.2.7 — ریفکتوری گام ۲)
// GameLoading / GameError / GameScoringGuide
// accent = کلاس رنگ دکمهٔ تلاش مجدد (مثلاً bg-emerald-50 text-emerald-600)
// ========================================

export function GameLoading({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function GameError({
  onRetry,
  accent,
}: {
  onRetry: () => void;
  accent: string;
}) {
  const { tr } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <XCircle className="h-14 w-14 text-red-200" />
      <p className="text-slate-500 text-sm">
        {tr("خطا در بارگذاری بازی. دوباره تلاش کنید.", "Error loading the game. Please try again.")}
      </p>
      <button
        onClick={onRetry}
        className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${accent}`}
      >
        <RotateCcw className="h-4 w-4" />
        {tr("تلاش مجدد", "Try Again")}
      </button>
    </div>
  );
}

/**
 * راهنمای امتیازدهی پایین صفحات بازی — children = همان
 * spanهای صفحات اصلی (شامل جداکننده‌های |) تا ظاهر عیناً حفظ شود.
 */
export function GameScoringGuide({
  gapClass = "gap-4",
  children,
}: {
  gapClass?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mt-4 flex items-center justify-center ${gapClass} text-[11px] text-slate-400 flex-wrap`}>
      {children}
    </div>
  );
}
