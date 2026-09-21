"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FolderPlus, Loader2, LogIn, X, AlertTriangle } from "lucide-react";
import { useVocabularyBoxes } from "@/app/hook/useVocabularyBoxes";
import { BoxCard, EmptyBoxesHint } from "@/app/components/vocabulary/BoxCard";
import PageLoader from "@/app/components/PageLoader";
import { useLanguage } from "@/app/context/LanguageContext";

// ========================================
// صفحه لغت‌نامه (نسخه 1.0.1.9)
// جعبه‌های لغت — هر جعبه حداکثر ۱۰ کلمه
// اولین بازدید: ۲ جعبه پیش‌فرض خودکار ساخته می‌شوند
// منبع کلمه‌ها: هاور روی کلمه‌های انگلیسی سراسر سایت + افزودن دستی
// اگر سرور خطا دهد، پیام دقیق نمایش داده می‌شود (جعبه‌ها هرگز «محو» به نظر نمی‌رسند)
// لودر یکپارچهٔ سایت — v1.0.1.9
// ========================================

export default function VocabPage() {
  const { boxes, loading, authed, error, refetch, addBox, deleteBox, addWord, removeWord } =
    useVocabularyBoxes();
  const { t } = useLanguage();

  // دیالوگ ساخت جعبه
  const [showDialog, setShowDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [boxBusy, setBoxBusy] = useState(false);
  const [boxError, setBoxError] = useState<string | null>(null);

  async function handleCreateBox() {
    if (boxBusy) return;
    setBoxBusy(true);
    setBoxError(null);
    const e = await addBox(newName);
    setBoxBusy(false);
    if (e) {
      setBoxError(e);
    } else {
      setShowDialog(false);
      setNewName("");
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* هدر + افزودن جعبه */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">
            {t("vocab.title")}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t("vocab.sub")}</p>
        </div>
        <button
          onClick={() => {
            setShowDialog(true);
            setBoxError(null);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-colors shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          {t("vocab.newBox")}
        </button>
      </div>

      {/* دیالوگ نام جعبه */}
      {showDialog ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mb-6 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateBox();
                if (e.key === "Escape") setShowDialog(false);
              }}
              placeholder="نام جعبه — مثلاً: کلمات سخت"
              disabled={boxBusy}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button
              onClick={() => void handleCreateBox()}
              disabled={boxBusy || !newName.trim()}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
            >
              {boxBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              بساز
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400"
              title="بی‌خیال"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {boxError ? (
            <p className="text-[11px] text-red-500 px-1">{boxError}</p>
          ) : null}
        </motion.div>
      ) : null}

      {/* محتوا */}
      {loading && boxes.length === 0 ? (
        <PageLoader />
      ) : !authed ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <LogIn className="w-8 h-8" />
          <p className="text-sm font-bold">
            برای دیدن لغت‌نامه، وارد شوید
          </p>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-bold transition-colors"
          >
            ورود
          </a>
        </div>
      ) : error && boxes.length === 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-6 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          <p className="text-sm font-bold text-amber-700 leading-7 max-w-lg">
            {error}
          </p>
          <button
            onClick={() => void refetch()}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors"
          >
            تلاش دوباره
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {boxes.length === 0 ? (
            <EmptyBoxesHint />
          ) : (
            boxes.map((box) => (
              <BoxCard
                key={box.id}
                box={box}
                onAddWord={addWord}
                onRemoveWord={removeWord}
                onDeleteBox={deleteBox}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
