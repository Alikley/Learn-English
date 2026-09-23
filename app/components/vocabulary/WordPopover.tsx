"use client";
import { localizeMessage } from "@/lib/message-i18n";
import { useLanguage } from "@/app/context/LanguageContext";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Languages, FolderPlus, X, Loader2 } from "lucide-react";
import type { WordHoverTarget } from "./WordHoverProvider";
import { useWordHover } from "./WordHoverProvider";
import { useWordTranslation } from "./useWordTranslation";
import { POPOVER_W, computePopoverPosition } from "./popoverPosition";
import PickerPanel from "./PickerPanel";

// ========================================
// پاپ‌آور هاور کلمه (نسخه 1.0.1.8)
// روی کلمه انگلیسی هاور → این جعبه باز می‌شود
// گزینه‌ها: «ترجمه» + «جعبه لغت» (افزودن به یکی از جعبه‌ها)
//
// v1.0.2.7 — ریفکتوری: جای‌گذاری (popoverPosition)، ترجمه
// (useWordTranslation) و پنل جعبه‌ها (PickerPanel) تفکیک شدند.
// ========================================

export function WordPopover({
  target,
  onClose,
}: {
  target: WordHoverTarget;
  onClose: () => void;
}) {
  const { tr, dir } = useLanguage();
  const ctx = useWordHover();
  // state تازه برای هر کلمه — Provider با key={word} کامپوننت را
  // برای هر کلمهٔ جدید از نو مانت می‌کند؛ نیازی به ریست در effect نیست
  const [mode, setMode] = useState<"actions" | "picker">("actions");
  const [addedBoxId, setAddedBoxId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const { translation, message, translating, handleTranslate } =
    useWordTranslation(target.word);

  if (!ctx) return null;

  // جای‌گذاری: زیر کلمه؛ اگر جا نبود، بالای آن
  const { top, left } = computePopoverPosition(target);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.12 }}
        dir={dir}
        onMouseEnter={ctx?.cancelClose}
        onMouseLeave={ctx?.scheduleClose}
        style={{ position: "fixed", top, left, width: POPOVER_W, zIndex: 90 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-3 select-none"
      >
        {/* هدر: کلمه + بستن */}
        <div className="flex items-center justify-between mb-2">
          <span
            dir="ltr"
            className="font-black text-slate-800 text-base truncate"
          >
            {target.word}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            title={tr("بستن", "Close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ترجمه */}
        {translation ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-2.5 py-2 mb-2 text-sm font-bold">
            <Languages className="w-4 h-4 shrink-0" />
            <span className="truncate">{translation}</span>
          </div>
        ) : null}
        {message ? (
          <p className="text-[11px] text-amber-600 leading-5 mb-2 px-1">
            {localizeMessage(message)}
          </p>
        ) : null}

        {/* حالت اکشن‌ها */}
        {mode === "actions" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleTranslate()}
              disabled={translating}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl px-2 py-2 text-xs font-bold transition-colors disabled:opacity-60"
            >
              {translating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              ترجمه
            </button>
            <button
              onClick={() => {
                setMode("picker");
                setAddError(null);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-xl px-2 py-2 text-xs font-bold transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {tr("جعبه لغت", "Word Box")}
            </button>
          </div>
        ) : (
          <PickerPanel
            word={target.word}
            translation={translation}
            addedBoxId={addedBoxId}
            setAddedBoxId={setAddedBoxId}
            addError={addError}
            setAddError={setAddError}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
