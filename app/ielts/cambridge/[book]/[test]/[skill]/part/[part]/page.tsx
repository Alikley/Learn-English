"use client";

import { useParams } from "next/navigation";
import PartPlayerView from "./_components/PartPlayerView";
import type { IeltsSkill } from "@/types/ielts";

// ========================================
// پلیر آزمون ساخت‌یافته — مسیر پویا (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/[skill]/part/[part]
//
// 🎯 تغییر v1.0.0.6 (رفع باگ 404):
//    کل UI به _components/PartPlayerView منتقل شد و این
//    صفحه فقط پارامترها را می‌خواند. مسیرهای ایستای
//    reading/listening/writing/part/[part] هم همین
//    View را رندر می‌کنند تا پوشه‌های ناقص قدیمی
//    نتوانند مسیر را 404 کنند.
// ========================================

export default function StructuredPartPage() {
  const { book, test, skill, part } = useParams<{
    book: string;
    test: string;
    skill: string;
    part: string;
  }>();

  const skillKey = (skill as IeltsSkill) ?? "listening";

  return <PartPlayerView book={book} test={test} part={part} skill={skillKey} />;
}
