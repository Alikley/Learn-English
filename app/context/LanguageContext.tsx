"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ========================================
// زمینه زبان سایت (بازسازی قابلیت v1.0.1.9)
// - فارسی (پیش‌فرض، راست‌به‌چپ) / English (چپ‌به‌راست)
// - lang و dir روی <html> تنظیم می‌شود
// - انتخاب کاربر در localStorage (flex-lang) ذخیره می‌شود
// - کل سایت با tr() به زبان انتخابی واکنش نشان می‌دهد (v1.0.2.3 — گام ۳)
// ========================================

export type SiteLang = "fa" | "en";

type LanguageContextValue = {
  lang: SiteLang;
  /** آیا کامپوننت روی کلاینت مانت شده */
  mounted: boolean;
  toggle: () => void;
  setLang: (l: SiteLang) => void;
  /** ترجمهٔ رشته بر اساس زبان فعلی سایت — tr("داشبورد", "Dashboard") */
  tr: (fa: string, en: string) => string;
  /** جهت سند بر اساس زبان فعلی — "rtl" / "ltr" (قبل از مانت: rtl) */
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("fa");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // بازیابی انتخاب قبلی کاربر — الگوی تاخیری سازگار با React Compiler
    const id = setTimeout(() => {
      try {
        const saved = localStorage.getItem("flex-lang");
        if (saved === "en" || saved === "fa") {
          setLangState(saved);
          document.documentElement.lang = saved;
          document.documentElement.dir = saved === "fa" ? "rtl" : "ltr";
        }
      } catch {
        /* بی‌خیال */
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const setLang = useCallback((l: SiteLang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
    try {
      localStorage.setItem("flex-lang", l);
    } catch {
      /* بی‌خیال */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(document.documentElement.lang === "en" ? "fa" : "en");
  }, [setLang]);

  // v1.0.2.3 — گام ۳: ترجمهٔ رشته بر اساس زبان فعلی
  // قبل از مانت lang = "fa" است → رندر سرور فارسی → بدون ناهمخوانی hydration
  const tr = useCallback(
    (fa: string, en: string) => (lang === "en" ? en : fa),
    [lang]
  );

  const dir: "rtl" | "ltr" = lang === "en" ? "ltr" : "rtl";

  return (
    <LanguageContext.Provider value={{ lang, mounted, toggle, setLang, tr, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage باید داخل LanguageProvider استفاده شود");
  return ctx;
}
