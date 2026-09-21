"use client";

import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحه پیام‌ها — v1.0.1.9
// جای‌نگهدار تمیز و دوزبانه (بخش چت هنوز در
// حال توسعه است) — عنوان و پیام از دیکشنری
// ========================================

export default function Chat() {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t("chat.title")}</h1>
          <p className="text-sm text-slate-500">{t("chat.empty")}</p>
        </div>
      </div>
    </div>
  );
}
