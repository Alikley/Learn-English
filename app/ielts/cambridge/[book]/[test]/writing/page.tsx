"use client";

import { useParams } from "next/navigation";
import SkillPlayerView from "../[skill]/_components/SkillPlayerView";

// ========================================
// پلیر آزمون آیلتس — مسیر ایستای رایتینگ (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/writing?mode=practice|exam&full=1
//
// 🎯 چرا مسیر ایستا؟ رفع قطعی باگ 404:
//    اگر در پروژهٔ مقصد پوشهٔ writing قدیمی/ناقصی کنار
//    پوشهٔ پویای [skill] وجود داشته باشد (مثلاً حذف/کپی
//    ناقص فایل‌ها)، Next.js سگمانت ایستا را ملاک قرار
//    می‌دهد و مسیر پویا اصلاً بررسی نمی‌شود — نتیجه:
//    404. با این فایل، مسیر ایستا همیشه page.tsx سالم
//    دارد و صفحهٔ رایتینگ همیشه رندر می‌شود.
// ========================================

export default function WritingSkillPage() {
  const { book, test } = useParams<{ book: string; test: string }>();

  return <SkillPlayerView book={book} test={test} skill="writing" />;
}
