"use client";

import { useState, useRef, useCallback } from "react";

// ========================================
// هوک ادیتور نوشتاری با سقف سخت کلمه
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// شمارش کلمه + جلوگیری از تایپ/چسباندن بعد از سقف
// ========================================

export default function useWordLimitedEditor(maxWords: number, locked: boolean) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  /* ---------- شمارش کلمه‌ها + سقف سخت ---------- */
  const recount = useCallback(() => {
    const el = editorRef.current;
    if (!el) return 0;
    const words = el.innerText.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    return words.length;
  }, []);

  /** ورودی جدید: شمارش + اگر از سقف رد شد، اضافه‌ها حذف می‌شوند */
  const handleInput = () => {
    const count = recount();
    // سقف سخت — اگر به هر دلیل رد شد، اضافه‌ها حذف می‌شوند
    if (count > maxWords && editorRef.current) {
      const words = editorRef.current.innerText
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, maxWords);
      editorRef.current.innerText = words.join(" ");
      setWordCount(maxWords);
    }
  };

  /** جلوگیری از تایپ بعد از سقف — حذف و حرکت آزاد است */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    const addsWord =
      e.key.length === 1 || e.key === " " || e.key === "Enter";
    if (addsWord && wordCount >= maxWords) {
      e.preventDefault();
    }
  };

  /** چسباندن فقط تا پر شدن سقف */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const remaining = maxWords - wordCount;
    const pastedWords = text.split(/\s+/).filter(Boolean);
    const fitted = pastedWords.slice(0, Math.max(0, remaining)).join(" ");
    if (fitted) {
      document.execCommand("insertText", false, fitted);
      recount();
    }
  };

  /** پاک کردن متن برای نوشتن دوباره */
  const reset = () => {
    if (editorRef.current) editorRef.current.innerText = "";
    setWordCount(0);
  };

  return { editorRef, wordCount, recount, handleInput, handleKeyDown, handlePaste, reset };
}
