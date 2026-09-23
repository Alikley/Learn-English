"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// ========================================
// هدر مشترک صفحات بازی‌ها (v1.0.2.7 — ریفکتوری گام ۲)
// آیکون + عنوان + زیرعنوان + دکمهٔ بازگشت هوشمند:
// در صفحه سطح‌بندی → هاب بازی‌ها؛ وسط بازی → سطح‌بندی
// ========================================

export default function GameHeader({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  isLevelSelect,
  onBackToLevels,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  subtitle: string;
  isLevelSelect: boolean;
  onBackToLevels: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClassName}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      {/* بازگشت — در صفحه سطح‌بندی به هاب بازی‌ها، وسط بازی به سطح‌بندی */}
      {isLevelSelect ? (
        <Link
          href="/game"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm text-slate-600 text-xs font-bold transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          {tr("بازگشت", "Back")}
        </Link>
      ) : (
        <button
          onClick={onBackToLevels}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          {tr("بازی‌ها", "Games")}
        </button>
      )}
    </div>
  );
}
