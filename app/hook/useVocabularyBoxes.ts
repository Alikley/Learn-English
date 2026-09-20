"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VocabBox, VocabWordItem } from "@/types/vocabulary";
import { VOCAB_BOX_NAME_MAX, VOCAB_BOX_WORD_LIMIT } from "@/types/vocabulary";

// ========================================
// هوک جعبه‌های لغت‌نامه (نسخه 1.0.1.7)
// استفاده در صفحه /vocab و پاپ‌آور هاور کلمه
// auto=true  → با مانت، جعبه‌ها را می‌گیرد (صفحه لغت‌نامه)
// auto=false → فقط با فراخوانی refetch (پاپ‌آور — برای مهمان‌ها نویز نمی‌سازد)
// همهٔ تغییرات، state را درجا به‌روز می‌کنند — بدون رفرش کامل
// خطای سرور هرگز بی‌صدا نمی‌ماند → error برای نمایش صریح
// ========================================

export function useVocabularyBoxes({ auto = true }: { auto?: boolean } = {}) {
  const [boxes, setBoxes] = useState<VocabBox[]>([]);
  const [loading, setLoading] = useState(auto);
  const [authed, setAuthed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary/boxes");
      if (res.status === 401) {
        setAuthed(false);
        setBoxes([]);
        setError(null);
        return;
      }
      setAuthed(true);
      const data = (await res.json().catch(() => null)) as {
        boxes?: VocabBox[];
        error?: string;
      } | null;
      if (res.ok && data?.boxes) {
        setBoxes(data.boxes);
        setError(null);
      } else {
        // خطا را بی‌صدا قورت نده — جعبه‌ها «محو شده» به نظر نمی‌رسند
        setError(data?.error ?? "دریافت جعبه‌ها ناموفق بود");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    if (requested.current) return;
    requested.current = true;
    const id = setTimeout(() => {
      void refetch();
    }, 0);
    return () => clearTimeout(id);
  }, [auto, refetch]);

  /** ساخت جعبه جدید — پیام خطای فارسی برمی‌گرداند */
  const addBox = useCallback(
    async (name: string): Promise<string | null> => {
      const trimmed = name.trim();
      if (!trimmed) return "نام جعبه را بنویسید";
      if (trimmed.length > VOCAB_BOX_NAME_MAX)
        return `نام جعبه نباید بیشتر از ${VOCAB_BOX_NAME_MAX} حرف باشد`;

      try {
        const res = await fetch("/api/vocabulary/boxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = (await res.json()) as { box?: VocabBox; error?: string };
        if (!res.ok || !data.box) return data.error ?? "ساخت جعبه ناموفق بود";
        setBoxes((prev) => [...prev, data.box as VocabBox]);
        return null;
      } catch {
        return "ارتباط با سرور برقرار نشد";
      }
    },
    [],
  );

  /** حذف جعبه */
  const deleteBox = useCallback(async (boxId: number): Promise<string | null> => {
    try {
      const res = await fetch(`/api/vocabulary/boxes/${boxId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) return data.error ?? "حذف جعبه ناموفق بود";
      setBoxes((prev) => prev.filter((b) => b.id !== boxId));
      return null;
    } catch {
      return "ارتباط با سرور برقرار نشد";
    }
  }, []);

  /** افزودن کلمه به جعبه */
  const addWord = useCallback(
    async (
      boxId: number,
      word: string,
      translation?: string | null,
    ): Promise<string | null> => {
      const clean = word.trim().toLowerCase();
      if (!clean) return "کلمه را بنویسید";

      // چک محلی برای بازخورد فوری
      const box = boxes.find((b) => b.id === boxId);
      if (box) {
        if (box.isFull)
          return `این جعبه پر است — حداکثر ۱۰ کلمه`;
        if (box.words.some((w) => w.word === clean))
          return "این کلمه قبلاً در این جعبه هست";
      }

      try {
        const res = await fetch(`/api/vocabulary/boxes/${boxId}/words`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: clean, translation: translation ?? undefined }),
        });
        const data = (await res.json()) as { word?: VocabWordItem; error?: string };
        if (!res.ok || !data.word) return data.error ?? "افزودن کلمه ناموفق بود";

        const added = data.word;
        setBoxes((prev) =>
          prev.map((b) =>
            b.id === boxId
              ? {
                  ...b,
                  words: [...b.words, added],
                  wordCount: b.words.length + 1,
                  isFull: b.words.length + 1 >= VOCAB_BOX_WORD_LIMIT,
                }
              : b,
          ),
        );
        return null;
      } catch {
        return "ارتباط با سرور برقرار نشد";
      }
    },
    [boxes],
  );

  /** حذف کلمه از جعبه */
  const removeWord = useCallback(
    async (wordId: number): Promise<string | null> => {
      try {
        const res = await fetch(`/api/vocabulary/words/${wordId}`, {
          method: "DELETE",
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) return data.error ?? "حذف کلمه ناموفق بود";

        setBoxes((prev) =>
          prev.map((b) => {
            if (!b.words.some((w) => w.id === wordId)) return b;
            const words = b.words.filter((w) => w.id !== wordId);
            return {
              ...b,
              words,
              wordCount: words.length,
              isFull: words.length >= VOCAB_BOX_WORD_LIMIT,
            };
          }),
        );
        return null;
      } catch {
        return "ارتباط با سرور برقرار نشد";
      }
    },
    [],
  );

  return {
    boxes,
    loading,
    authed,
    error,
    refetch,
    addBox,
    deleteBox,
    addWord,
    removeWord,
  };
}
