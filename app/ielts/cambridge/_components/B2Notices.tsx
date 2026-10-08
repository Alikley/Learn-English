"use client";

import { AlertCircle, CloudOff } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import type { IeltsScanInfo } from "@/types/ielts";

// ========================================
// هشدارهای B2 صفحهٔ کتاب‌ها (v1.0.4.2)
// ۱) کلیدهای B2 تنظیم نشده ۲) خطای خواندن باکت
// (از cambridge/page.tsx جدا شد)
// ========================================

export default function B2Notices({
  scan,
  loading,
  rescanning,
  onRescan,
}: {
  scan: IeltsScanInfo | null;
  loading: boolean;
  rescanning: boolean;
  onRescan: () => void;
}) {
  const { tr } = useLanguage();

  if (loading) return null;

  return (
    <>
      {scan && !scan.configured && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 p-4">
          <CloudOff size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
              {tr(
                "فایل‌های کتاب‌ها هنوز وصل نشده‌اند (Backblaze B2)",
                "Book files are not connected yet (Backblaze B2)",
              )}
            </p>
            <p className="text-[11px] leading-6 text-amber-700/90 dark:text-amber-300/80">
              {tr(
                "کلیدهای B2 (B2_KEY_ID و B2_APP_KEY از نسخهٔ 1.0.2.8) را در فایل .env.local بگذار و سرور را ری‌استارت کن؛ برنامه خودش PDF و فایل‌های صوتی باکت cambridge را پیدا می‌کند. تا آن موقع آزمون‌ها با پاسخ‌برگ کار می‌کنند.",
                "Put your B2 keys (B2_KEY_ID and B2_APP_KEY from version 1.0.2.8) into .env.local and restart the server; the app will auto-discover the PDF and audio files in your cambridge bucket. Until then, exams work with the answer sheet only.",
              )}
            </p>
            <button
              onClick={onRescan}
              disabled={rescanning}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold disabled:opacity-60 transition"
            >
              {rescanning ? tr("در حال اسکن…", "Scanning…") : tr("اسکن مجدد", "Rescan")}
            </button>
          </div>
        </div>
      )}

      {scan && scan.configured && scan.error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 p-4">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-700 dark:text-red-300">
              {tr("خطا در خواندن باکت B2", "B2 bucket read error")}
            </p>
            <p className="text-[11px] text-red-600/90 dark:text-red-400/80 mt-1" dir="ltr">
              {scan.error}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
