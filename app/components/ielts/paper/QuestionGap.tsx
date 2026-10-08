"use client";

// ========================================
// جمله با جای خالی — خط نقطه‌چین کاغذی (v1.0.4.2)
// 🎨 تم‌محور: در دارک‌مود متن روشن و خط تیرهٔ خوانا
//    (رفع باگ نسخهٔ قبل: متن سیاه روی برگهٔ تیره گم می‌شد)
// ========================================

export default function QuestionGap({
  text,
  value,
  onChange,
  disabled,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const parts = text.split("{GAP}");
  return (
    <p className="text-[13.5px] leading-8 text-neutral-800 dark:text-slate-200" dir="ltr">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <input
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={120}
              placeholder="answer"
              aria-label="answer"
              className="mx-1.5 w-28 sm:w-36 px-1 bg-transparent border-b-[2px] border-dotted border-neutral-500 dark:border-neutral-500 text-center text-[13px] font-bold text-neutral-900 dark:text-slate-100 outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-solid focus:border-neutral-900 dark:focus:border-slate-200 disabled:opacity-50 transition"
            />
          )}
        </span>
      ))}
    </p>
  );
}
