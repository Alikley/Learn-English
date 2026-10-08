"use client";

import { useParams } from "next/navigation";
import SkillPlayerView from "../[skill]/_components/SkillPlayerView";

// ========================================
// پلیر آزمون آیلتس — مسیر ایستای لیسنینگ (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/listening?mode=practice|exam&full=1
//
// همان مقاوم‌سازی 404 مسیر writing — برای یکدستی هر
// سه مهارت مسیر ایستا دارند. جزئیات: writing/page.tsx
// ========================================

export default function ListeningSkillPage() {
  const { book, test } = useParams<{ book: string; test: string }>();

  return <SkillPlayerView book={book} test={test} skill="listening" />;
}
