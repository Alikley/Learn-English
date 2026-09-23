"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Eraser,
} from "lucide-react";

// ========================================
// نوار ابزار ادیتور نوشتاری + شمارندهٔ کلمه
// (از صفحهٔ [topicId] تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function EditorToolbar({
  wordCount,
  maxWords,
  counterColor,
  onExec,
  onClearFormatting,
}: {
  wordCount: number;
  maxWords: number;
  counterColor: string;
  onExec: (cmd: string) => void;
  onClearFormatting: () => void;
}) {
  const { tr } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/60">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExec("bold")}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("درشت", "Bold")}
      >
        <Bold className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExec("italic")}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("مورب", "Italic")}
      >
        <Italic className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExec("underline")}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("زیرخط", "Underline")}
      >
        <Underline className="w-4 h-4 text-slate-600" />
      </button>
      <span className="w-px h-5 bg-slate-200 mx-1" />
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExec("insertUnorderedList")}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("فهرست نقطه‌ای", "Bullet List")}
      >
        <List className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onExec("insertOrderedList")}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("فهرست شماره‌دار", "Numbered List")}
      >
        <ListOrdered className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClearFormatting}
        className="p-2 rounded-lg hover:bg-white transition-colors font-black"
        title={tr("پاک کردن قالب‌بندی", "Clear Formatting")}
      >
        <Eraser className="w-4 h-4 text-slate-600" />
      </button>

      {/* شمارنده کلمه */}
      <div className="flex-1" />
      <span
        className={`text-xs font-bold ${counterColor} px-2`}
        dir="ltr"
      >
        {wordCount} / {maxWords}
      </span>
    </div>
  );
}
