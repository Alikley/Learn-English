"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ========================================
// زمینه حالت روشن/تیره (نسخه ۱.۰.۲.۰)
// - کلاس .dark روی <html> را مدیریت می‌کند
// - انتخاب کاربر در localStorage (flex-theme) ذخیره می‌شود
// - پیش‌فرض: رنگ‌سیستم سیستم‌عامل
// - اسکریپت ضدفلش در layout.tsx از پرش رنگ جلوگیری می‌کند
// ========================================

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  /** آیا کامپوننت روی کلاینت مانت شده (برای آیکون بدون ناهمخوانی) */
  mounted: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // خواندن وضعیت فعلی از <html> — اسکریپت ضدفلش قبل از رنگ‌آمیزی
  // مقدار را گذاشته است؛ اینجا فقط همگام می‌کنیم
  // (الگوی تاخیری — سازگار با React Compiler)
  useEffect(() => {
    const id = setTimeout(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeState(isDark ? "dark" : "light");
      setMounted(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem("flex-theme", t);
    } catch {
      /* حافظه مرورگر در دسترس نیست — بی‌خیال */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(document.documentElement.classList.contains("dark")
      ? "light"
      : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme باید داخل ThemeProvider استفاده شود");
  return ctx;
}
