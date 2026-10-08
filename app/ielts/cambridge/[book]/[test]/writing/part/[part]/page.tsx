"use client";

import { useParams } from "next/navigation";
import PartPlayerView from "../../../[skill]/part/[part]/_components/PartPlayerView";

// ========================================
// پلیر آزمون ساخت‌یافته — مسیر ایستای رایتینگ (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/writing/part/[part]
//
// 🎯 مقاوم‌سازی 404 (مثل writing/page.tsx): سگمانت ایستای
//    writing + صفحهٔ سالم → حتی اگر پوشهٔ ناقصی وجود
//    داشته باشد مسیر رندر می‌شود.
// ========================================

export default function WritingPartPage() {
  const { book, test, part } = useParams<{ book: string; test: string; part: string }>();

  return <PartPlayerView book={book} test={test} part={part} skill="writing" />;
}
