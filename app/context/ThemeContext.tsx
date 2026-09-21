"use client";

// ========================================
// کانتکست تم سایت (روشن/تاریک) — v1.0.2.0
//
// - تم پیش‌فرض: روشن (مثل SSR — بدون خطای هیدریشن)
// - انتخاب کاربر در localStorage ذخیره می‌شود؛ فقط هنگام
//   کلیک نوشته می‌شود (همان الگوی LanguageContext)
// - یک اسکریپت کوچک در layout قبل از رنگ‌آمیزی اولیه،
//   کلاس dark را روی <html> می‌گذارد تا فلشِ سفید نبیندیم
// - اگر کاربر قبلاً انتخابی نداشته باشد، ترجیح سیستمی
//   (prefers-color-scheme) اعمال می‌شود
// - کلاس .dark متغیرهای رنگ Tailwind v4 را بازتعریف
//   می‌کند (globals.css) — کل پوسته تیره می‌شود
// ========================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const THEME_STORAGE_KEY = "flex-english-theme";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // بعد از mount: تم ذخیره‌شده (یا ترجیح سیستمی) را بخوان
  // و state را با کلاسی که اسکریپتِ head گذاشته همگام کن
  // (تایمر صفر — هم‌زمان با الگوی LanguageContext و قانون
  // set-state-in-effect)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
          setThemeState((current) => (current === stored ? current : stored));
        } else if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          setThemeState((current) => (current === "dark" ? current : "dark"));
        }
      } catch {
        // localStorage بسته است — بی‌خیال
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // اعمال کلاس dark و color-scheme روی <html> (idempotent)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // نادیده بگیر
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // نادیده بگیر
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme باید داخل ThemeProvider استفاده شود");
  return ctx;
}
