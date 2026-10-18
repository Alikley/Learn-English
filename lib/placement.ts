// ========================================
// منطق تعیین سطح + توصیهٔ دوره/کتاب (v1.0.8.0 / English 1.0.2.0)
//
// دو منبع تصمیم:
//   ۱) نمرهٔ ۸ سوال تشخیصی (سخت‌پایه — بدون AI هم کار می‌کند)
//   ۲) طبقه‌بندی متن نوشتاری توسط مدل Laya (روی سرور خودت)
//      — وقتی متن نوشته شده و Laya وصل و «مطمئن» باشد
//        (confidence ≥ 0.5)، نوشتن واقعی زبان‌آموز معیتر از
//        تست چندگزینه‌ای است و جواب Laya ملاک می‌شود.
//
// خروجی همیشه «سطح + توصیه‌ها» است؛ قطعی Laya فقط یعنی
// تعیین سطح از نمرهٔ تست — سایت هرگز به سرور AI وابسته نیست.
//
// فقط سمت سرور (دیتای سوال‌ها import می‌شود) — تست‌شده در
// tests/laya.test.ts
// ========================================

import type { PlacementCefr } from "@/data/placement/questions";
import { PLACEMENT_QUESTIONS, WRITING_LEVEL_CRITERIA, WRITING_INSTRUCTIONS } from "@/data/placement/questions";
import { layaChoose, type LayaChoiceResult } from "@/lib/laya";

// ---------- نمرهٔ تست چندگزینه‌ای ----------

export type McEvaluation = {
  score: number;
  total: number;
  /** سطح تخمینی از روی نمره */
  cefr: PlacementCefr;
  /** تفکیک درست/غلط هر سطح — برای نمایش به کاربر */
  perLevel: { cefr: PlacementCefr; correct: number; total: number }[];
};

const CEFR_ORDER: PlacementCefr[] = ["A1", "A2", "B1", "B2", "C1"];

/** جدول نمره → سطح (۸ سوال) */
function scoreToCefr(score: number): PlacementCefr {
  if (score >= 8) return "C1";
  if (score >= 6) return "B2";
  if (score >= 4) return "B1";
  if (score >= 2) return "A2";
  return "A1";
}

export function evaluateMc(answers: Record<string, number>): McEvaluation {
  let score = 0;
  const perLevel = new Map<PlacementCefr, { correct: number; total: number }>();
  for (const q of PLACEMENT_QUESTIONS) {
    const bucket = perLevel.get(q.cefr) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (answers[q.id] === q.correctIndex) {
      score += 1;
      bucket.correct += 1;
    }
    perLevel.set(q.cefr, bucket);
  }
  return {
    score,
    total: PLACEMENT_QUESTIONS.length,
    cefr: scoreToCefr(score),
    perLevel: CEFR_ORDER.map((cefr) => ({ cefr, ...perLevel.get(cefr)! })),
  };
}

// ---------- طبقه‌بندی متن نوشتاری با Laya ----------

export type WritingEvaluation = {
  used: boolean;
  cefr: PlacementCefr | null;
  confidence: number | null;
  /** چرا استفاده نشد — برای شفافیت به کاربر */
  skippedReason: "no-writing" | "not-configured" | "low-confidence" | "error" | null;
};

/** آستانهٔ اطمینان Laya برای پذیرش جواب */
export const LAYA_CONFIDENCE_THRESHOLD = 0.5;

export async function evaluateWriting(
  writing: string | null,
): Promise<WritingEvaluation> {
  const text = writing?.trim() ?? "";
  // کمتر از ۲۰ حرف، متن قابل قضاوت نیست
  if (!text || text.length < 20) {
    return { used: false, cefr: null, confidence: null, skippedReason: "no-writing" };
  }

  const res: LayaChoiceResult = await layaChoose(
    text.slice(0, 4000),
    WRITING_INSTRUCTIONS,
    WRITING_LEVEL_CRITERIA,
  );

  if (!res.ok) {
    const reason: WritingEvaluation["skippedReason"] =
      res.reason === "not-configured" ? "not-configured" : "error";
    return { used: false, cefr: null, confidence: null, skippedReason: reason };
  }

  const level = CEFR_ORDER.includes(res.choice as PlacementCefr)
    ? (res.choice as PlacementCefr)
    : null;
  if (!level) {
    return { used: false, cefr: null, confidence: null, skippedReason: "error" };
  }
  if (res.confidence < LAYA_CONFIDENCE_THRESHOLD) {
    return { used: false, cefr: null, confidence: res.confidence, skippedReason: "low-confidence" };
  }

  return { used: true, cefr: level, confidence: res.confidence, skippedReason: null };
}

// ---------- سطح نهایی ----------

export type PlacementOutcome = {
  cefr: PlacementCefr;
  method: "mc+laya-writing" | "mc";
  mc: McEvaluation;
  writing: WritingEvaluation;
};

export async function computePlacement(
  answers: Record<string, number>,
  writing: string | null,
): Promise<PlacementOutcome> {
  const mc = evaluateMc(answers);
  const writingEval = await evaluateWriting(writing);

  // قانون ترکیب (مستند در CHANGES.md): جواب مطمئنِ Laya روی متنِ
  // واقعی نوشتن، معیتر از تست چندگزینه‌ای است؛ در غیر این صورت
  // نمرهٔ تست ملاک است.
  const cefr: PlacementCefr = writingEval.used && writingEval.cefr
    ? writingEval.cefr
    : mc.cefr;

  return {
    cefr,
    method: writingEval.used ? "mc+laya-writing" : "mc",
    mc,
    writing: writingEval,
  };
}

// ---------- توصیه‌ها بر اساس سطح ----------

export type CourseRecommendation = {
  /** کلید دوره در منطق سایت (TOPIC_GROUPS) */
  topicKey: string;
  topicFa: string;
  topicEn: string;
  icon: string;
  /** slug دورهٔ پیشنهادی از مانیفست درس‌ها */
  courseSlug: string;
  /** برچسب فارسی سطح — همان LEVEL_LABEL سایت */
  levelFa: string;
  levelEn: string;
};

export type BookRecommendation = {
  /** عنوان فارسی توصیه */
  title: string;
  titleEn: string;
  detail: string;
  detailEn: string;
  /** بازهٔ شمارهٔ کتاب‌های کمبریج (۱..۲۱) — null یعنی فعلاً نه */
  bookRange: [number, number] | null;
  href: string;
};

export type PlacementRecommendation = {
  headline: string;
  headlineEn: string;
  subline: string;
  sublineEn: string;
  courses: CourseRecommendation[];
  books: BookRecommendation[];
  storyBooks: { title: string; titleEn: string; href: string } | null;
  ieltsNote: string;
  ieltsNoteEn: string;
};

/** CEFR → سطح دوره در دیتابیس سایت (course_level) */
const CEFR_TO_DB_LEVEL: Record<PlacementCefr, { fa: string; en: string; manifest: string }> = {
  A1: { fa: "مبتدی", en: "Beginner", manifest: "beginner" },
  A2: { fa: "پایه", en: "Elementary", manifest: "beginner" },
  B1: { fa: "متوسط", en: "Intermediate", manifest: "intermediate" },
  B2: { fa: "متوسط رو به بالا", en: "Upper-Intermediate", manifest: "intermediate" },
  C1: { fa: "پیشرفته", en: "Advanced", manifest: "advanced" },
};

/** چهار شاخهٔ دورهٔ سایت — همان TOPIC_GROUPS */
const TOPICS: { key: string; fa: string; en: string; icon: string; slugPrefix: string }[] = [
  { key: "Grammar", fa: "گرامر", en: "Grammar", icon: "📝", slugPrefix: "grammar" },
  { key: "Conversation", fa: "مکالمه", en: "Conversation", icon: "💬", slugPrefix: "conversation" },
  { key: "Vocabulary", fa: "لغات", en: "Vocabulary", icon: "📚", slugPrefix: "vocabulary" },
  { key: "Listening", fa: "لیسنینگ", en: "Listening", icon: "🎧", slugPrefix: "listening" },
];

export function recommendFor(cefr: PlacementCefr): PlacementRecommendation {
  const dbLevel = CEFR_TO_DB_LEVEL[cefr];

  const courses: CourseRecommendation[] = TOPICS.map((t) => ({
    topicKey: t.key,
    topicFa: t.fa,
    topicEn: t.en,
    icon: t.icon,
    courseSlug: `${t.slugPrefix}-${dbLevel.manifest}`,
    levelFa: dbLevel.fa,
    levelEn: dbLevel.en,
  }));

  // کتاب‌های کمبریج (۲۱ کتاب آیلتس واقعی) — طبق سطح:
  const booksByLevel: Record<PlacementCefr, BookRecommendation[]> = {
    A1: [
      {
        title: "فعلاً کتاب آیلتس نه — اول داستان‌ها",
        titleEn: "No IELTS book yet — start with stories",
        detail: "کتاب‌های آیلتس کمبریج از B1 به بالا مفیدند؛ الان مسیرت دوره‌های مبتدی + داستان‌های سادهٔ کتابخانه است.",
        detailEn: "Cambridge IELTS books help from B1 up; your path now is beginner courses + easy library stories.",
        bookRange: null,
        href: "/library",
      },
    ],
    A2: [
      {
        title: "کتاب‌های ۱۹ تا ۲۱ — فقط ریدینگ و لیسنینگ سبک",
        titleEn: "Books 19-21 — light reading & listening only",
        detail: "جدیدترین کتاب‌ها؛ فعلاً فقط بخش‌های آسان ریدینگ و لیسنینگ را تمرین کن، تست کامل نه.",
        detailEn: "The newest books; for now practice only light reading/listening parts, not full tests.",
        bookRange: [19, 21],
        href: "/ielts",
      },
    ],
    B1: [
      {
        title: "کتاب‌های ۱۶ تا ۲۱ — شروع جدی آیلتس",
        titleEn: "Books 16-21 — serious IELTS start",
        detail: "با کتاب‌های جدید (فرمت فعلی آزمون) شروع کن؛ ۲-۳ تست کامل در هفته کافی است.",
        detailEn: "Start with the newer books (current exam format); 2-3 full tests a week is enough.",
        bookRange: [16, 21],
        href: "/ielts",
      },
    ],
    B2: [
      {
        title: "کتاب‌های ۱۰ تا ۱۵ — سطح استاندارد آیلتس",
        titleEn: "Books 10-15 — standard IELTS level",
        detail: "این بازه نقطهٔ تعادل چالش/یادگیری برای B2 است؛ نمرهٔ هدف ۶ تا ۷.",
        detailEn: "This range is the sweet spot of challenge/learning for B2; target band 6-7.",
        bookRange: [10, 15],
        href: "/ielts",
      },
    ],
    C1: [
      {
        title: "کتاب‌های ۱ تا ۹ + هر ۲۱ کتاب آزاد",
        titleEn: "Books 1-9 + all 21 books freely",
        detail: "برای چالش واقعی C1، کتاب‌های قدیمی‌تر (۱-۹) سخت‌تر و چابک‌ترند؛ کل مجموعه دست توست.",
        detailEn: "For real C1 challenge, older books (1-9) are tougher and sharper; the whole set is yours.",
        bookRange: [1, 9],
        href: "/ielts",
      },
    ],
  };

  const storyBooks =
    cefr === "A1" || cefr === "A2"
      ? {
          title: "داستان‌های سادهٔ کتابخانه (شاهزاده ویلیام، غرور و تعصب)",
          titleEn: "Easy library stories (Prince William, Pride & Prejudice)",
          href: "/library",
        }
      : null;

  const ieltsNotes: Record<PlacementCefr, string> = {
    A1: "هدف فعلی: رساندن خودت به A2 — هنوز برای آیلتس زود است؛ اول ۳۰ روز دورهٔ مبتدی.",
    A2: "هدف: B1 — بعد از ۲ ماه می‌توانی تست‌های سبک آیلتس را شروع کنی.",
    B1: "آیلتس قابل شروع است — نمرهٔ واقع‌بینانهٔ فعلی: ۵ تا ۵.۵.",
    B2: "شما در ناحیهٔ نمرهٔ ۶ تا ۷ آیلتس هستی — تمرین منظم تست کامل لازم داری.",
    C1: "نمرهٔ ۷+ در دسترس است — روی زمان‌بندی و مهارت‌های امتحانی تمرکز کن.",
  };
  const ieltsNotesEn: Record<PlacementCefr, string> = {
    A1: "Current goal: reach A2 — too early for IELTS; 30 days of beginner courses first.",
    A2: "Goal: B1 — after 2 months you can start light IELTS tests.",
    B1: "IELTS is startable — realistic current band: 5 to 5.5.",
    B2: "You are in the 6-7 band zone — regular full-test practice needed.",
    C1: "Band 7+ is within reach — focus on timing and exam skills.",
  };

  const headlines: Record<PlacementCefr, { fa: string; en: string }> = {
    A1: { fa: "سطح تو A1 است — مبتدی", en: "Your level is A1 — Beginner" },
    A2: { fa: "سطح تو A2 است — پایه", en: "Your level is A2 — Elementary" },
    B1: { fa: "سطح تو B1 است — متوسط", en: "Your level is B1 — Intermediate" },
    B2: { fa: "سطح تو B2 است — متوسط رو به بالا", en: "Your level is B2 — Upper-Intermediate" },
    C1: { fa: "سطح تو C1 است — پیشرفته", en: "Your level is C1 — Advanced" },
  };

  return {
    headline: headlines[cefr].fa,
    headlineEn: headlines[cefr].en,
    subline: `مسیر پیشنهادی: دوره‌های سطح ${dbLevel.fa} + کتاب‌های طبق لیبِ زیر`,
    sublineEn: `Suggested path: ${dbLevel.en} courses + the books listed below`,
    courses,
    books: booksByLevel[cefr],
    storyBooks,
    ieltsNote: ieltsNotes[cefr],
    ieltsNoteEn: ieltsNotesEn[cefr],
  };
}
