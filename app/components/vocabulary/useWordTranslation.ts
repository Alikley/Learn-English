"use client";

import { useCallback, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// ترجمهٔ کلمهٔ هاورشده با کش نشست مرورگر
// (از WordPopover تفکیک شد — v1.0.2.7 ریفکتوری)
// POST /api/vocabulary/translate — محلی/کش AI
// ========================================

/** کش ترجمه‌های همین نشست مرورگر — هاور دوباره فوری است */
const translationCache = new Map<string, string>();

export function useWordTranslation(word: string) {
  const { tr } = useLanguage();
  const [translation, setTranslation] = useState<string | null>(() =>
    translationCache.get(word.toLowerCase()) ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const handleTranslate = useCallback(async () => {
    const key = word.toLowerCase();
    if (translationCache.has(key)) {
      setTranslation(translationCache.get(key) ?? null);
      return;
    }
    setTranslating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/vocabulary/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: key }),
      });
      const data = (await res.json()) as {
        translation?: string | null;
        message?: string;
      };
      if (data.translation) {
        translationCache.set(key, data.translation);
        setTranslation(data.translation);
      } else {
        setMessage(data.message ?? tr("ترجمه‌ای پیدا نشد", "No translation found"));
      }
    } catch {
      setMessage(tr("ارتباط با سرور برقرار نشد", "Could not connect to the server"));
    } finally {
      setTranslating(false);
    }
  }, [word, tr]);

  return { translation, message, translating, handleTranslate };
}
