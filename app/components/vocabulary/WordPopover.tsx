"use client";
import { localizeMessage } from "@/lib/message-i18n";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Languages,
  FolderPlus,
  X,
  Check,
  Loader2,
  Inbox,
  LogIn,
} from "lucide-react";
import { useVocabularyBoxes } from "@/app/hook/useVocabularyBoxes";
import { VOCAB_BOX_WORD_LIMIT } from "@/types/vocabulary";
import type { WordHoverTarget } from "./WordHoverProvider";
import { useWordHover } from "./WordHoverProvider";

// ========================================
// پاپ‌آور هاور کلمه (نسخه 1.0.1.8)
// روی کلمه انگلیسی هاور → این جعبه باز می‌شود
// گزینه‌ها: «ترجمه» + «جعبه لغت» (افزودن به یکی از جعبه‌ها)
// ========================================

/** کش ترجمه‌های همین نشست مرورگر — هاور دوباره فوری است */
const translationCache = new Map<string, string>();

const POPOVER_W = 240;

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
  const [translation, setTranslation] = useState<string | null>(() =>
    translationCache.get(target.word.toLowerCase()) ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [addedBoxId, setAddedBoxId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleTranslate() {
    const key = target.word.toLowerCase();
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
  }

  if (!ctx) return null;

  // جای‌گذاری: زیر کلمه؛ اگر جا نبود، بالای آن
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = target.x + target.width / 2 - POPOVER_W / 2;
  left = Math.max(8, Math.min(left, vw - POPOVER_W - 8));
  const below = target.y + 8;
  const estimateH = 200;
  const top =
    below + estimateH < vh ? below : Math.max(8, target.y - estimateH - 24);

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

/** پنل انتخاب جعبه + افزودن */
function PickerPanel({
  word,
  translation,
  addedBoxId,
  setAddedBoxId,
  addError,
  setAddError,
}: {
  word: string;
  translation: string | null;
  addedBoxId: number | null;
  setAddedBoxId: (id: number | null) => void;
  addError: string | null;
  setAddError: (e: string | null) => void;
}) {
  const { tr } = useLanguage();
  // فقط وقتی پنل باز شد جعبه‌ها را بگیر — نه برای همهٔ صفحات
  const { boxes, loading, authed, error, refetch, addWord } =
    useVocabularyBoxes({
      auto: false,
    });
  const [busyBoxId, setBusyBoxId] = useState<number | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void refetch();
  }, [refetch]);

  async function handleAdd(boxId: number) {
    setBusyBoxId(boxId);
    setAddError(null);
    const error = await addWord(boxId, word, translation);
    setBusyBoxId(null);
    if (error) {
      setAddError(error);
    } else {
      setAddedBoxId(boxId);
    }
  }

  if (!authed) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-slate-500 leading-6 mb-2">
          {tr("برای گذاشتن کلمه در جعبه لغت، وارد شوید", "Log in to add words to your Word Box")}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          {tr("ورود", "Log In")}
        </Link>
      </div>
    );
  }

  if (loading && boxes.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-slate-400 text-xs font-bold">
        <Loader2 className="w-4 h-4 animate-spin" />
        {tr("در حال گرفتن جعبه‌ها...", "Loading boxes...")}
      </div>
    );
  }

  // خطای سرور؟ پیام دقیق نشان بده — نه «جعبه‌ای نداری» (که یعنی محو شدن جعبه‌ها)
  if (error && boxes.length === 0) {
    return (
      <div className="py-2 px-1">
        <p className="text-[11px] text-amber-600 leading-5 text-center">
          {error}
        </p>
      </div>
    );
  }

  if (boxes.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-slate-400 text-xs font-bold">
        <Inbox className="w-4 h-4" />
        {tr("هنوز جعبه‌ای نداری", "You have no boxes yet")}
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-44 overflow-y-auto space-y-1.5">
        {boxes.map((box) => {
          const isFull = box.wordCount >= VOCAB_BOX_WORD_LIMIT;
          const added = addedBoxId === box.id;
          const busy = busyBoxId === box.id;
          const already =
            !added && box.words.some((w) => w.word === word.toLowerCase());
          return (
            <button
              key={box.id}
              onClick={() => void handleAdd(box.id)}
              disabled={isFull || already || added || busy}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors ${
                added
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : isFull || already
                    ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700"
              }`}
            >
              <span className="truncate">{box.name}</span>
              {added ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : busy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <span className="text-[10px] text-slate-400 shrink-0">
                  {already ? tr("هست", "added") : `${box.wordCount}/${VOCAB_BOX_WORD_LIMIT}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {addError ? (
        <p className="text-[11px] text-red-500 mt-2 px-1">{addError}</p>
      ) : null}
    </div>
  );
}
