"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

// ========================================
// دکمه تغییر حالت روشن/تیره (نسخه ۱.۰.۲.۰)
// در نوار بالای دسکتاپ + کشوی سایدبار موبایل
// (نسخه ۱.۰.۲.۱ — گام ۱: در موبایل داخل کشو)
// ========================================

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle, mounted } = useTheme();

  // قبل از مانت روی کلاینت، آیکون خنثی — جلوگیری از ناهمخوانی hydration
  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "حالت روشن" : "حالت تیره"}
      title={isDark ? "رفتن به حالت روشن" : "رفتن به حالت تیره"}
      className={`relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        compact
          ? "h-9 w-9 text-slate-600 hover:text-amber-500 dark:text-slate-300 dark:hover:text-amber-300"
          : "h-10 w-10 text-slate-700 hover:text-amber-500 dark:text-slate-200 dark:hover:text-amber-300"
      }`}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-500 ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-500 ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
