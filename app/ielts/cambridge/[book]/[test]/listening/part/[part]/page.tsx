"use client";

import { useParams } from "next/navigation";
import PartPlayerView from "../../../[skill]/part/[part]/_components/PartPlayerView";

// ========================================
// پلیر آزمون ساخت‌یافته — مسیر ایستای لیسنینگ (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/listening/part/[part]
//
// 🎯 مقاوم‌سازی 404 (مثل writing/page.tsx). مسیرهای
//    part/1..4 آزمون‌های ساخت‌یافتهٔ لیسنینگ از این
//    مسیر ایستا رندر می‌شوند.
// ========================================

export default function ListeningPartPage() {
  const { book, test, part } = useParams<{ book: string; test: string; part: string }>();

  return <PartPlayerView book={book} test={test} part={part} skill="listening" />;
}
