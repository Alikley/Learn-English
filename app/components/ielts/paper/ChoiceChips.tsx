"use client";

// ========================================
// گزینه‌های سوال (v1.0.4.2)
// - LetterChips: گروه باکسی/مچینگ → دایره‌های حرف چاپی
// - OptionButtons: چندگزینه‌ای معمولی → دکمهٔ حرف + متن
// 🎨 تم‌محور: حالت انتخاب‌شده در دارک‌مود معکوس می‌شود
//    (پرشدن روشن + حرف تیره) تا کنتراست همیشه بالا بماند
// ========================================

import { letterEquals, type PaperOption } from "./paper-utils";

/** دایره‌های حرف — گروه‌های باکسی (متن گزینه‌ها بالای بخش آمده) */
export function LetterChips({
  options,
  selected,
  onPick,
  disabled,
}: {
  options: PaperOption[];
  selected: string;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="choices" dir="ltr">
      {options.map((opt) => {
        const isSel = letterEquals(selected, opt.letter);
        return (
          <button
            key={opt.letter}
            type="button"
            role="radio"
            aria-checked={isSel}
            title={opt.text}
            onClick={() => onPick(isSel ? "" : opt.letter)}
            disabled={disabled}
            className={`w-9 h-9 rounded-full border text-[13px] font-black flex items-center justify-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSel
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-inner"
                : "bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-slate-200 border-neutral-400 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
          >
            {opt.letter}
          </button>
        );
      })}
    </div>
  );
}

/** گزینه‌های کامل — چندگزینه‌ای معمولی (حرف + متن) */
export function OptionButtons({
  options,
  selected,
  onPick,
  disabled,
}: {
  options: PaperOption[];
  selected: string;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1" role="radiogroup" aria-label="choices" dir="ltr">
      {options.map((opt) => {
        const isSel = letterEquals(selected, opt.letter);
        return (
          <button
            key={opt.letter}
            type="button"
            role="radio"
            aria-checked={isSel}
            onClick={() => onPick(isSel ? "" : opt.letter)}
            disabled={disabled}
            className={`w-full flex items-start gap-2.5 text-left px-2.5 py-1.5 border transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              isSel
                ? "border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 hover:border-neutral-600 dark:hover:border-neutral-400"
            }`}
          >
            <span
              className={`w-5 h-5 shrink-0 mt-0.5 border text-[10px] font-black flex items-center justify-center ${
                isSel
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-slate-300 border-neutral-400 dark:border-neutral-600"
              }`}
              dir="ltr"
            >
              {opt.letter}
            </span>
            <span className="text-[12.5px] leading-6 text-neutral-800 dark:text-slate-200">
              {opt.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
