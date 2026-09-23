"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Inbox, LogIn } from "lucide-react";
import { useVocabularyBoxes } from "@/app/hook/useVocabularyBoxes";
import { VOCAB_BOX_WORD_LIMIT } from "@/types/vocabulary";

// ========================================
// پنل انتخاب جعبه + افزودن کلمه
// (از WordPopover تفکیک شد — v1.0.2.7 ریفکتوری)
// ========================================

export default function PickerPanel({
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
