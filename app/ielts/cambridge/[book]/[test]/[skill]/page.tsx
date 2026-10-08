"use client";

import { useParams } from "next/navigation";
import SkillPlayerView from "./_components/SkillPlayerView";
import type { IeltsSkill } from "@/types/ielts";

// ========================================
// پلیر آزمون آیلتس — مسیر پویا (v1.0.0.6)
// /ielts/cambridge/[book]/[test]/[skill]?mode=practice|exam&full=1
//
// 🎯 تغییر v1.0.0.6 (رفع باگ 404):
//    کل UI به _components/SkillPlayerView منتقل شد و این
//    صفحه فقط پارامترها را می‌خواند. علاوه بر این مسیر،
//    مسیرهای ایستای writing / reading / listening هم
//    همان View را رندر می‌کنند — یعنی حتی اگر پوشهٔ
//    [skill] آسیب ببیند یا پوشهٔ ایستای ناقصی آن را
//    بپوشاند، صفحهٔ آزمون همیشه بالا می‌آید.
// ========================================

export default function SkillPlayerPage() {
  const { book, test, skill } = useParams<{
    book: string;
    test: string;
    skill: string;
  }>();

  const skillKey = (skill as IeltsSkill) ?? "reading";

  return <SkillPlayerView book={book} test={test} skill={skillKey} />;
}
