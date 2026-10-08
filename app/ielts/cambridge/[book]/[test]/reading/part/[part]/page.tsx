"use client";

import { useParams } from "next/navigation";
import PartPlayerView from "../../../[skill]/part/[part]/_components/PartPlayerView";

// ========================================
// پلیر آزمون ساخت‌یافته — مسیر ایستای ریدینگ (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/reading/part/[part]
//
// 🎯 مقاوم‌سازی 404 (مثل writing/page.tsx).
// ========================================

export default function ReadingPartPage() {
  const { book, test, part } = useParams<{ book: string; test: string; part: string }>();

  return <PartPlayerView book={book} test={test} part={part} skill="reading" />;
}
