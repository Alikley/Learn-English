"use client";

// ========================================
// کانتکست زبان سایت (فارسی/RTL ↔ انگلیسی/LTR) — v1.0.1.9
//
// - زبان پیش‌فرض: فارسی (مثل همیشه)
// - انتخاب کاربر در localStorage ذخیره می‌شود — فقط هنگام کلیک
//   کاربر (نه در mount اولیه؛ وگرنه مقدار ذخیره‌شده قبل از
//   خوانده‌شدن دوباره‌نویسی می‌شد — باگ رقابت)
// - تغییر زبان: lang و dir روی <html> اعمال می‌شود،
//   عنوان تب مرورگر هم همان لحظه دوزبانه می‌شود
// - t(key): ترجمهٔ رشته‌های پوسته از دیکشنری
//
// نکتهٔ هیدریشن: رندر اول همیشه «فارسی» است تا با
// SSR یکی باشد؛ زبان ذخیره‌شده بعد از mount در یک
// تایمر صفر-میلی‌ثانیه‌ای خوانده و اعمال می‌شود
// (همان الگوی جایگزال در صفحه تمرین‌ها).
// ========================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { DICT, LANG_STORAGE_KEY, pageTitleFor, type Lang } from "@/app/i18n/dictionary";

type LanguageContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** ترجمهٔ یک کلید دیکشنری بر اساس زبان فعلی */
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fa");

  // خواندن زبان ذخیره‌شده بعد از mount (بدون خطای هیدریشن)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
        if (stored === "en" || stored === "fa") {
          setLangState((current) => (current === stored ? current : stored));
          // نکتهٔ مهم: بعد از full-load، هیدریشن React ممکن است
          // <title> سراسری (SSR فارسی) را دوباره روی عنوانِ اعمال‌شده
          // تحمیل کند. عنوان را چند بار با تاخیر دوباره اعمال می‌کنیم
          // (idempotent — اگر درست باشد تغییری ایجاد نمی‌کند)
          const reassert = () => {
            document.title = pageTitleFor(window.location.pathname, stored);
          };
          setTimeout(reassert, 400);
          setTimeout(reassert, 1500);
          setTimeout(reassert, 3000);
        }
      } catch {
        // localStorage در حالت خصوصی بعضی مرورگرها بسته است — بی‌خیال
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // اعمال lang و dir روی <html> (بدون نوشتن در localStorage —
  // ذخیره فقط با کلیک کاربر انجام می‌شود)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  // عنوان تب بر اساس مسیر + زبان (همگام با متادیتای سرور)
  const pathname = usePathname();
  useEffect(() => {
    document.title = pageTitleFor(pathname, lang);
  }, [pathname, lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    // ذخیرهٔ انتخاب کاربر — عمداً اینجا (نه در افکت) تا مقدار
    // ذخیره‌شدهٔ قبلی در mount اولیه دوباره‌نویسی نشود
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // نادیده بگیر
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next = current === "fa" ? "en" : "fa";
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        // نادیده بگیر
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = DICT[key];
      if (!entry) return key;
      return entry[lang === "fa" ? 0 : 1];
    },
    [lang],
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir: lang === "fa" ? "rtl" : "ltr",
        setLang,
        toggleLang,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage باید داخل LanguageProvider استفاده شود");
  return ctx;
}
