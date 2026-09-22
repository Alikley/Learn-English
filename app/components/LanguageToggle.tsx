"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// دکمه تغییر زبان سایت (بازسازی v1.0.1.۹)
// فارسی ⇄ English — برچسب دکمه زبان فعلی است
// در نوار بالا + کشوی سایدبار موبایل
// ========================================

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, toggle, mounted } = useLanguage();

  // قبل از مانت: پیش‌فرض فارسی — جلوگیری از ناهمخوانی hydration
  const current = mounted ? lang : "fa";

  return (
    <button
      onClick={toggle}
      aria-label={current === "fa" ? "English" : "فارسی"}
      title={current === "fa" ? "Switch to English" : "تغییر به فارسی"}
      className={`flex items-center justify-center gap-1.5 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
        compact
          ? "h-9 px-3 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70"
          : "h-10 px-3.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      }`}
    >
      <Globe
        className={
          compact
            ? "h-4 w-4 text-slate-500 dark:text-slate-400"
            : "h-5 w-5 text-slate-600 dark:text-slate-300"
        }
      />
      <span
        className={`font-bold tracking-wide ${
          compact ? "text-xs" : "text-sm"
        } text-slate-700 dark:text-slate-200`}
      >
        {current === "fa" ? "فا" : "EN"}
      </span>
    </button>
  );
}
