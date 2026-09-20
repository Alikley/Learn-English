"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WordPopover } from "./WordPopover";

// ========================================
// زمینه هاور کلمه (نسخه ۱.۰.۱.۶)
// در layout دور کل سایت پیچیده می‌شود
// هر کلمه انگلیسی (HoverableText) با هاور، پاپ‌آور
// «ترجمه + جعبه لغت» را باز می‌کند
// ========================================

export type WordHoverTarget = {
  word: string;
  /** مختصات کلمه در صفحه — برای جای‌گذاری پاپ‌آور */
  x: number;
  y: number;
  /** عرض کلمه — برای وسط‌چینی افقی */
  width: number;
};

type WordHoverContextValue = {
  /** باز کردن پاپ‌آور برای یک کلمه */
  openFor: (target: WordHoverTarget) => void;
  /** بستن پاپ‌آور (با تأخیر کوچک تا موس بتواند داخلش برود) */
  scheduleClose: () => void;
  /** لغو بستن — وقتی موس داخل پاپ‌آور است */
  cancelClose: () => void;
};

const WordHoverContext = createContext<WordHoverContextValue | null>(null);

export function useWordHover(): WordHoverContextValue | null {
  return useContext(WordHoverContext);
}

const CLOSE_DELAY_MS = 180;

export function WordHoverProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<WordHoverTarget | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openFor = useCallback(
    (next: WordHoverTarget) => {
      cancelClose();
      setTarget(next);
    },
    [cancelClose],
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setTarget(null);
    }, CLOSE_DELAY_MS);
  }, [cancelClose]);

  // پاک‌سازی تایمر در unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Escape → بستن
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target]);

  return (
    <WordHoverContext.Provider
      value={{ openFor, scheduleClose, cancelClose }}
    >
      {children}
      {target ? (
        <WordPopover
          key={target.word}
          target={target}
          onClose={() => setTarget(null)}
        />
      ) : null}
    </WordHoverContext.Provider>
  );
}
