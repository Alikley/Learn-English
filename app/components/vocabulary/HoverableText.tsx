"use client";

import { useWordHover } from "./WordHoverProvider";

// ========================================
// متن قابل هاور (نسخه ۱.۰.۱.۶)
// متن انگلیسی را کلمه‌به‌کلمه می‌شکند؛ هر کلمه با هاور
// پاپ‌آور «ترجمه + جعبه لغت» را باز می‌کند
// بقیهٔ متن (فارسی/علامت‌ها) دست‌نخورده می‌ماند
// اگر Provider نبود (مثلاً صفحه لاگین) → متن ساده رندر می‌شود
// ========================================

/** کلمه انگلیسی: حرف شروع + حروف/آپاستروف/خط تیره */
const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g;

export function HoverableText({
  text,
  className,
}: {
  text: string | null | undefined;
  className?: string;
}) {
  const ctx = useWordHover();

  if (!text) return null;
  if (!ctx) return <span className={className}>{text}</span>;

  const parts = text.split(WORD_RE);
  const words = text.match(WORD_RE) ?? [];

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={`p${i}`}>
          {part}
          {i < words.length ? (
            <span
              dir="ltr"
              className="underline decoration-dotted decoration-transparent hover:decoration-blue-400 underline-offset-4 hover:text-blue-700 cursor-help transition-colors"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                ctx.openFor({
                  word: words[i],
                  x: rect.left,
                  y: rect.bottom,
                  width: rect.width,
                });
              }}
              onMouseLeave={ctx.scheduleClose}
            >
              {words[i]}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
