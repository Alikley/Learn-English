import { cefrColor } from "@/lib/cefr-colors";

// ========================================
// بج سطح CEFR (v1.0.2.2 / English 1.0.2.2)
//
// چیپ رنگی کوچک سطح (A1..C1) با همان پالت صفحهٔ تعیین سطح:
//  - size="sm" → چت (کنار اسم کاربر)
//  - size="md" → نوبار (کنار نام پروفایل)
//  - size="lg" → کارت‌های بزرگ (نتیجهٔ تعیین سطح)
//
// سطح null/undefined یا نامعلوم → هیچی رندر نمی‌شود (مهمان‌ها
// و کاربرهایی که هنوز تست نداده‌اند بج ندارند).
// بدون hook است → هم سرور هم کلاینت می‌توانند استفاده کنند.
// ========================================

const SIZE_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "px-1.5 py-0.5 text-[10px] rounded-md",
  md: "px-2 py-0.5 text-xs rounded-lg",
  lg: "px-3 py-1.5 text-sm rounded-xl",
};

export default function CefrBadge({
  cefr,
  size = "sm",
  className = "",
  title,
}: {
  cefr: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}) {
  if (!cefr) return null;
  return (
    <span
      dir="ltr"
      title={title}
      className={`inline-flex items-center justify-center font-black leading-none whitespace-nowrap shrink-0 ${SIZE_CLASS[size]} ${cefrColor(cefr)} ${className}`}
    >
      {cefr}
    </span>
  );
}
