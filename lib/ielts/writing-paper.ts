// ========================================
// برگهٔ رایتینگ — صورت سوال از خود کتاب (v1.0.4.4)
//
// 🎯 v1.0.0.4: رفع باگ «صورت سوال رایتینگ نشان داده نمی‌شد» —
//    کتاب‌های اسکن‌شده لایهٔ متنی ندارند.
//
// 🎯 v1.0.4.4 (English 1.0.0.5 → 1.0.0.8): صورت سوال برای
//    «همهٔ کتاب‌ها و هر دو تسک» به‌صورت متن جدا شده و در
//    «بالای صفحه» نمایش داده می‌شود (کاربر نمایش کل PDF را
//    رد کرد) — نقشهٔ استخراج: لایهٔ متنی + OCR صفحات اسکن‌شده.
//
// ✅ مسیرها:
//    ۱) نقشهٔ تأییدشده (lib/ielts/writing-map) — صفحات + متن
//       سوال‌های همهٔ ۲۰ کتاب موجود؛ فوری و بدون بازکردن PDF
//    ۲) تشخیص زنده از لایهٔ متنی PDF — برای فایل‌های آینده
//    ۳) هیچ‌کدام → کلاینت کتاب کامل را باز می‌کند
//
// رابط کاربری: متن سوال در بالای صفحه؛ کتاب PDF فقط بخش
// اختیاریِ «مشاهدهٔ صفحهٔ کتاب» است (نمودار تسک ۱).
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { getBookPages } from "@/lib/ielts/pdf-text";
import { locateTestsRobust } from "@/lib/ielts/ai-paper";
import { parseWritingPaper, type WritingTaskPrompt } from "@/lib/ielts/paper-parser";
import { lookupWritingPages, lookupWritingPrompts } from "@/lib/ielts/writing-map";

const RE_TASK1 = /writing\s+task\s*1\b/i;
const RE_TASK2 = /writing\s+task\s*2\b/i;

/** آیا صفحه خطِ مستقلِ «WRITING» (سرتیتر بخش) دارد؟ */
function hasStandaloneLine(page: string, name: string): boolean {
  return page.split("\n").some((l) => l.trim().toLowerCase() === name);
}

/**
 * محدودهٔ صفحات رایتینگ داخل محدودهٔ یک تست (صفحه‌محور).
 * خروجی: اندیس ۰-based؛ to شامل می‌شود.
 */
function findWritingRange(
  pages: string[],
  start: number,
  end: number,
): { from: number; to: number; t1: number; t2: number } | null {
  // صفحهٔ WRITING TASK 1
  let t1: number | null = null;
  for (let i = start; i < end; i++) {
    if (RE_TASK1.test(pages[i] ?? "")) {
      t1 = i;
      break;
    }
  }

  // شروع: صفحهٔ تسک ۱ — یا سرتیتر «WRITING» یک صفحه قبل (جلد بخش)
  let from: number | null = t1;
  if (t1 == null) {
    for (let i = start; i < end; i++) {
      if (hasStandaloneLine(pages[i] ?? "", "writing")) {
        from = i;
        break;
      }
    }
  } else if (t1 > start && hasStandaloneLine(pages[t1 - 1] ?? "", "writing")) {
    from = t1 - 1;
  }
  if (from == null) return null;

  // صفحهٔ WRITING TASK 2
  let t2: number | null = null;
  for (let i = from; i < end; i++) {
    if (RE_TASK2.test(pages[i] ?? "")) {
      t2 = i;
      break;
    }
  }

  // پایان: اولین صفحهٔ بخش بعدی (SPEAKING / Answer key / Tapescripts / تست بعدی)
  const anchor = t2 ?? from;
  let to: number | null = null;
  for (let i = anchor + 1; i < end; i++) {
    const p = pages[i] ?? "";
    const boundary =
      hasStandaloneLine(p, "speaking") ||
      p.split("\n").some((l) => {
        const t = l.trim();
        return (
          /^(?:answer\s*keys?|answers?)\s*:?\s*$/i.test(t) ||
          /^(?:tapes?cripts?|transcripts?)\b/i.test(t) ||
          /^\s*(?:practice\s+)?test\s+\d\b/i.test(t)
        );
      });
    if (boundary) {
      to = i;
      break;
    }
  }
  if (to == null) to = Math.min(anchor + 2, end - 1);
  if (to < from) to = from;

  return { from, to, t1: t1 ?? from, t2: t2 ?? anchor };
}

// ---------- خروجی عمومی ----------

/** صفحات صورت سوال رایتینگ — شمارهٔ ۱-based فایل PDF کتاب */
export type WritingQuestionPaper = {
  task1Page: number;
  task2Page: number;
  fromPage: number;
  toPage: number;
};

export type WritingPaperResult =
  | {
      ok: true;
      /** متن صورت تسک‌ها — فقط وقتی لایهٔ متنی PDF موجود است */
      prompts: WritingTaskPrompt[];
      questionPaper: WritingQuestionPaper | null;
      /** map = نقشهٔ تأییدشده | text = تشخیص زنده از متن PDF */
      source: "map" | "text";
    }
  | { ok: false; reason: string };

// ---------- کش حافظه ----------

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { json: WritingPaperResult; expiresAt: number }>();

// ---------- ساخت برگهٔ رایتینگ ----------

/**
 * برگهٔ رایتینگ یک تست — بدون AI، فوری.
 *
 * force (?refresh=1): کش حافظه و نقشهٔ ثابت رد می‌شوند و
 * PDF دوباره با تشخیص زنده بررسی می‌شود؛ اگر تشخیص شکست
 * خورد، نقشهٔ تأییدشده پشتیبان می‌ماند.
 */
export async function buildWritingPaper(
  bookNumber: number,
  testNumber: number,
  force = false,
): Promise<WritingPaperResult> {
  const key = `${bookNumber}-${testNumber}`;

  if (!force) {
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiresAt) return cached.json;
  }

  // ---------- مسیر ۲ (وقتی force): تشخیص زنده از خود فایل ----------
  let detected: WritingPaperResult | null = null;
  if (force) {
    detected = await detectFromText(bookNumber, testNumber, true);
    if (detected.ok) {
      cache.set(key, { json: detected, expiresAt: Date.now() + CACHE_TTL_MS });
      return detected;
    }
  }

  // ---------- مسیر ۱: نقشهٔ تأییدشده — فوری ----------
  const entry = lookupWritingPages(bookNumber, testNumber);
  if (entry) {
    const json: WritingPaperResult = {
      ok: true,
      // v1.0.4.4: متن تسک‌ها برای همهٔ کتاب‌ها از نقشهٔ استخراج
      // (لایهٔ متنی PDF + OCR صفحات اسکن‌شده — writing-map)
      prompts: lookupWritingPrompts(bookNumber, testNumber),
      questionPaper: {
        task1Page: entry.task1Page,
        task2Page: entry.task2Page,
        fromPage: entry.task1Page,
        toPage: entry.task2Page,
      },
      source: "map",
    };
    cache.set(key, { json, expiresAt: Date.now() + CACHE_TTL_MS });
    return json;
  }

  // ---------- مسیر ۳: تشخیص زنده (فایل‌های بدون نقشه — مثلاً کتاب ۸ آینده) ----------
  if (!detected) {
    detected = await detectFromText(bookNumber, testNumber, force);
  }
  cache.set(key, { json: detected, expiresAt: Date.now() + CACHE_TTL_MS });
  return detected;
}

/** تشخیص صفحات رایتینگ از لایهٔ متنی PDF (برای فایل‌های آینده) */
async function detectFromText(
  bookNumber: number,
  testNumber: number,
  force: boolean,
): Promise<WritingPaperResult> {
  const pagesResult = await getBookPages(bookNumber, force);
  if (!pagesResult.ok) {
    return { ok: false, reason: pagesResult.error };
  }
  const pages = pagesResult.pages;

  const { testPages, keyStart, answerKeyStart } = locateTestsRobust(pages);
  const start = testPages[testNumber];
  if (start == null) {
    return {
      ok: false,
      reason: `موقعیت Test ${testNumber} در PDF کتاب ${bookNumber} شناسایی نشد — کتاب کامل باز می‌شود`,
    };
  }

  const nextTest = testPages[testNumber + 1];
  const endCandidates = [nextTest, keyStart, answerKeyStart].filter(
    (x): x is number => x != null && x > start,
  );
  const end = endCandidates.length > 0 ? Math.min(...endCandidates) : pages.length;

  const range = findWritingRange(pages, start, end);
  if (!range) {
    return {
      ok: false,
      reason: `صفحات رایتینگ Test ${testNumber} در PDF کتاب ${bookNumber} شناسایی نشد — کتاب کامل باز می‌شود`,
    };
  }

  // متن صورت تسک‌ها — از همان صفحات
  const sliceLines = pages.slice(range.from, range.to + 1).join("\n").split("\n");
  const prompts = parseWritingPaper(sliceLines);

  return {
    ok: true,
    prompts,
    questionPaper: {
      task1Page: range.t1 + 1,
      task2Page: range.t2 + 1,
      fromPage: range.from + 1,
      toPage: range.to + 1,
    },
    source: "text",
  };
}
