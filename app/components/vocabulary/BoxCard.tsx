"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import { useState } from "react";
import { motion } from "motion/react";
import { Trash2, Plus, X, Sparkles } from "lucide-react";
import { VOCAB_BOX_WORD_LIMIT } from "@/types/vocabulary";
import type { VocabBox } from "@/types/vocabulary";

// ========================================
// کارت جعبه لغت (نسخه ۱.۰.۱.۶) — استفاده در صفحه /vocab
// حداکثر ۱۰ کلمه + فرم افزودن دستی + حذف کلمه/جعبه
// ========================================

export function BoxCard({
  box,
  onAddWord,
  onRemoveWord,
  onDeleteBox,
}: {
  box: VocabBox;
  onAddWord: (boxId: number, word: string) => Promise<string | null>;
  onRemoveWord: (wordId: number) => Promise<string | null>;
  onDeleteBox: (boxId: number) => Promise<string | null>;
}) {
  const { tr } = useLanguage();
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const isFull = box.wordCount >= VOCAB_BOX_WORD_LIMIT;

  async function handleAdd() {
    if (!word.trim() || busy) return;
    setBusy(true);
    setError(null);
    const e = await onAddWord(box.id, word);
    setBusy(false);
    if (e) {
      setError(e);
    } else {
      setWord("");
    }
  }

  async function handleRemove(wordId: number) {
    setRemovingId(wordId);
    const e = await onRemoveWord(wordId);
    setRemovingId(null);
    if (e) setError(e);
  }

  async function handleDeleteBox() {
    if (
      box.wordCount > 0 &&
      !window.confirm(
        tr(`جعبه «${box.name}» و ${box.wordCount} کلمه‌ای داخلش حذف شود؟`, `Delete box “${box.name}” and the ${box.wordCount} words inside it?`),
      )
    )
      return;
    const e = await onDeleteBox(box.id);
    if (e) setError(e);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col"
    >
      {/* سربرگ جعبه */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 text-[10px] font-black rounded-full px-2 py-1 ${
              isFull
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {box.wordCount}/{VOCAB_BOX_WORD_LIMIT}
          </span>
          <h3 className="font-black text-slate-800 truncate">{box.name}</h3>
        </div>
        <button
          onClick={() => void handleDeleteBox()}
          title={tr("حذف جعبه", "Delete Box")}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* کلمه‌ها */}
      <div className="flex-1 space-y-1.5 min-h-[3rem]">
        {box.words.length === 0 ? (
          <p className="text-[11px] text-slate-300 leading-5 py-2">
            {tr(`هنوز کلمه‌ای نیست — روی کلمه‌های انگلیسی سایت هاور کن و «جعبه لغت»
            را بزن، یا همین‌جا بنویس`, "No words yet — hover English words on the site and tap “Word Box”, or type here")}
          </p>
        ) : (
          box.words.map((w) => (
            <div
              key={w.id}
              className="group flex items-center justify-between gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <div className="flex items-baseline gap-2 min-w-0">
                <span dir="ltr" className="text-xs font-bold text-slate-800">
                  {w.word}
                </span>
                {w.translation ? (
                  <span className="text-[11px] text-slate-400 truncate">
                    {w.translation}
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => void handleRemove(w.id)}
                disabled={removingId === w.id}
                title={tr("حذف کلمه", "Delete Word")}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* فرم افزودن دستی */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        {isFull ? (
          <p className="text-[11px] text-red-400 text-center py-1.5">
            {tr("جعبه پر است — اول کلمه‌ای را حذف کن", "This box is full — remove a word first")}
          </p>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              dir="ltr"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleAdd();
              }}
              placeholder="new word..."
              disabled={busy}
              className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button
              onClick={() => void handleAdd()}
              disabled={busy || !word.trim()}
              title={tr("افزودن", "Add")}
              className="shrink-0 flex items-center justify-center w-9 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        {error ? (
          <p className="text-[11px] text-red-500 mt-1.5">{error}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

/** کارت خالی برای حالت بدون جعبه */
export function EmptyBoxesHint() {
  const { tr } = useLanguage();
  return (
    <div className="col-span-full flex flex-col items-center gap-2 py-10 text-slate-300">
      <Sparkles className="w-8 h-8" />
      <p className="text-sm font-bold">{tr("جعبه‌ای نیست — بالای صفحه جعبه بساز", "No boxes yet — create one at the top of the page")}</p>
    </div>
  );
}
