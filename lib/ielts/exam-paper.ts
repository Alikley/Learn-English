// ========================================
// موتور برگهٔ امتحانی آیلتس (v1.0.3.4)
//
// «برای هر تست یک برگهٔ امتحانی» — PDF کامل کتاب کمبریج
// (باکت B2 کاربر) باز می‌شود، متنِ تک‌تک صفحات استخراج می‌شود
// و صفحات مخصوص هر تست/مهارت خودکار تشخیص داده می‌شوند:
//
//   Test 2  LISTENING   ← هدرِ بالای صفحات لیسنینگ تست ۲
//   Test 2  READING     ← هدرِ صفحات ریدینگ
//   Test 2  WRITING     ← هدرِ صفحات رایتینگ
//   Audioscripts / Answer key ← انتهای کتاب (از برگه حذف می‌شود)
//
// سپس با pdf-lib فقط همان صفحات + یک «صفحهٔ جلد امتحانی»
// به یک PDF تازه تبدیل می‌شوند — مثل دفترچهٔ آزمون واقعی.
//
// کش سه‌لایه: بایت‌های PDF (حافظه) + نقشهٔ صفحات (حافظه و دیسک
// در ‎.cache/ielts-papers‎) + PDF آمادهٔ هر برگه (دیسک).
//
// متغیر محیطی اختیاری: IELTS_LOCAL_PDF_1 .. IELTS_LOCAL_PDF_8
// (مسیر مطلق یک PDF محلی) — برای تست بدون B2.
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import { extractText, getDocumentProxy } from "unpdf";
import { scanCambridge, signedCambridgeUrl } from "@/lib/b2-cambridge";

export type PaperSkill = "listening" | "reading" | "writing";

export type PageRange = { from: number; to: number }; // ۰-مبنی؛ هر دو شامل

export type TestPages = {
  listening: PageRange | null;
  reading: PageRange | null;
  writing: PageRange | null;
};

export type BookLayout = {
  /** true = حداقل تشخیص صفحه‌ای انجام شد */
  ok: boolean;
  reason: string | null;
  totalPages: number;
  tests: Record<number, TestPages>;
};

export type PaperInfo = {
  available: boolean;
  reason: string | null;
  /** ۱-مبنی برای نمایش به کاربر */
  fromPage: number | null;
  toPage: number | null;
  totalPages: number | null;
};

// ---------- انواع داخلی ----------

// v1.0.3.5: صادرشده برای موتور برگهٔ تعاملی (interactive-paper.ts)
export type PdfSource = {
  key: string; // امضای فایل برای بی‌اعتبارکردن کش‌ها
  bytes: Uint8Array;
};

type CachedLayout = { key: string; layout: BookLayout };

// ---------- ثابت‌ها ----------

const PDF_TTL_MS = 10 * 60 * 1000; // بایت‌های PDF: ۱۰ دقیقه
const LAYOUT_TTL_MS = 10 * 60 * 1000; // نقشهٔ صفحات: ۱۰ دقیقه
const SKILLS: PaperSkill[] = ["listening", "reading", "writing"];

const SKILL_TITLE: Record<PaperSkill, { fa: string; en: string }> = {
  listening: { fa: "لیسنینگ", en: "LISTENING" },
  reading: { fa: "ریدینگ", en: "READING" },
  writing: { fa: "رایتینگ", en: "WRITING" },
};

const SKILL_SPEC: Record<
  PaperSkill,
  { minutes: string; count: string; instructions: string[] }
> = {
  listening: {
    minutes: "Time: approximately 30 minutes",
    count: "40 Questions",
    instructions: [
      "You will hear four different recordings and will have to answer",
      "questions on what you hear. You will hear each recording",
      "ONCE only — like the real test.",
      "Write your answers in the answer panel beside the exam paper.",
    ],
  },
  reading: {
    minutes: "Time: 60 minutes",
    count: "40 Questions · 3 Sections",
    instructions: [
      "You should spend about 20 minutes on each of the three sections.",
      "Answers must be entered in the answer panel beside the paper.",
      "Some questions ask you to choose the correct option; others ask",
      "for words or numbers from the passage.",
    ],
  },
  writing: {
    minutes: "Time: 60 minutes",
    count: "2 Tasks",
    instructions: [
      "You should spend about 20 minutes on Task 1 and about",
      "40 minutes on Task 2.",
      "Write at least 150 words for Task 1 and at least 250 words",
      "for Task 2, in the writing panel beside the paper.",
    ],
  },
};

// ---------- کش‌های سطح ماژول ----------

const pdfCache = new Map<number, { src: PdfSource; at: number }>();
const textCache = new Map<number, { key: string; texts: string[]; at: number }>();
let layoutCache: { bookId: number; key: string; layout: BookLayout; at: number } | null = null;

// ============================================================
// ۱) دریافت PDF کتاب — B2 یا فایل محلی (IELTS_LOCAL_PDF_n)
// ============================================================

// v1.0.3.5: صادرشده برای موتور برگهٔ تعاملی (interactive-paper.ts)
export async function loadBookPdf(bookId: number): Promise<PdfSource | { error: string }> {
  const cached = pdfCache.get(bookId);
  if (cached && Date.now() - cached.at < PDF_TTL_MS) return cached.src;

  // --- منبع محلی (اختیاری — تست بدون B2) ---
  const localPath = process.env[`IELTS_LOCAL_PDF_${bookId}`];
  if (localPath) {
    try {
      const bytes = new Uint8Array(await readFile(localPath));
      const key = `local:${createHash("sha1").update(bytes.subarray(0, 1 << 20)).digest("hex").slice(0, 16)}:${bytes.length}`;
      const src: PdfSource = { key, bytes };
      pdfCache.set(bookId, { src, at: Date.now() });
      return src;
    } catch {
      return { error: `فایل محلی IELTS_LOCAL_PDF_${bookId} خوانده نشد` };
    }
  }

  // --- منبع B2 ---
  const scan = await scanCambridge();
  if (!scan.configured) {
    return { error: "اتصال B2 تنظیم نشده است (B2_KEY_ID / B2_APP_KEY)" };
  }
  const files = scan.books[bookId];
  if (!files?.pdfPath) {
    return { error: "PDF این کتاب در باکت cambridge پیدا نشد" };
  }
  if (!scan.bucketName) {
    return { error: "باکت کمبریج یافت نشد" };
  }

  try {
    const url = await signedCambridgeUrl(scan.bucketName, files.pdfPath);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { error: `دانلود PDF از B2 ناموفق بود (${res.status})` };
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0) return { error: "PDF خالی دریافت شد" };
    const key = `b2:${files.pdfPath}:${buf.byteLength}`;
    const src: PdfSource = { key, bytes: buf };
    pdfCache.set(bookId, { src, at: Date.now() });
    return src;
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطای ناشناخته";
    return { error: `دریافت PDF کتاب ناموفق بود: ${message}` };
  }
}

// ============================================================
// ۲) متن صفحات — unpdf (استخراج متن صفحه‌به‌صفحه)
// ============================================================

async function getPageTexts(
  bookId: number,
  src: PdfSource,
): Promise<{ texts: string[] } | { error: string }> {
  const cached = textCache.get(bookId);
  if (cached && cached.key === src.key && Date.now() - cached.at < LAYOUT_TTL_MS) {
    return { texts: cached.texts };
  }

  try {
    // کپی به unpdf — pdf.js ممکن است ArrayBuffer ورودی را detach کند
    // و بایت‌های کش‌شده را از بین ببرد
    const pdf = await getDocumentProxy(new Uint8Array(src.bytes));
    const { text } = await extractText(pdf, { mergePages: false });
    const texts = Array.isArray(text) ? text : [String(text)];
    textCache.set(bookId, { key: src.key, texts, at: Date.now() });
    return { texts };
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطای ناشناخته";
    return { error: `خواندن PDF ناموفق بود: ${message}` };
  }
}

// ============================================================
// ۳) تشخیص چیدمان — تابع خالص (قابل تست)
//
// سیگنال‌ها:
//  - نشانگر تست: ‎TEST n‎ (۱..۴) در متن صفحه
//  - مهارت: LISTENING / READING / WRITING / SPEAKING در «بالای» صفحه
//  - سیگنال محتوا: SECTION/PART n یا Questions n یا READING PASSAGE n
//  - انتهای کتاب: AUDIOSCRIPTS / TAPESCRIPTS / ANSWER KEY / MODEL…
// قواعد:
//  - لنگر = (تست + مهارت + سیگنال محتوا) — قوی، ضد صفحات فهرست
//  - تست‌ها ترتیبی‌اند: لنگر تست بعدی باید بعد از قبلی باشد
//  - محدودهٔ هر مهارت تا لنگر بعدی همان تست؛ آخرین مهارت تا
//    تست بعدی / ابتدای انتهای کتاب / آخرین صفحه
//  - صفحات جداکنندهٔ «Test n+1» از انتهای مهارت آخر حذف می‌شوند
// ============================================================

type Anchor = { page: number; test: number; skill: PaperSkill | "speaking" };

const TOP_WINDOW = 240; // کاراکترهای ابتدای صفحه — محل هدرهای چاپی

function normalizeText(raw: string): string {
  return raw
    .replace(/\u00ad/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const TEST_RE = /\bTEST\s*([1-4])\b/;
const BACK_MATTER_RE = /\b(AUDIO ?SCRIPTS?|TAPE ?SCRIPTS?|ANSWER KEY|MODEL ANSWERS?|SAMPLE ANSWERS?)\b/;
const CONTENT_SIGNAL_RE =
  /\b(SECTION|PART)\s*[1-4]\b|\bQUESTIONS?\s+\d|\bREADING PASSAGE\s*[1-3]|\bWRITING TASK\s*[1-2]|\bTASK\s*[1-2]\b/;

function topOf(norm: string): string {
  return norm.slice(0, TOP_WINDOW);
}

function skillAtTop(top: string): PaperSkill | "speaking" | null {
  // اولویت: لیسنینگ → ریدینگ → رایتینگ → اسپیکینگ
  if (/\bLISTENING\b/.test(top)) return "listening";
  if (/\bREADING\b/.test(top)) return "reading";
  if (/\bWRITING\b/.test(top)) return "writing";
  if (/\bSPEAKING\b/.test(top)) return "speaking";
  return null;
}

/** تشخیص چیدمان کتاب از متن صفحات — خالص و قابل تست */
export function detectBookLayout(rawTexts: string[]): BookLayout {
  const texts = rawTexts.map(normalizeText);
  const totalPages = texts.length;
  const empty: BookLayout = {
    ok: false,
    reason: "صفحات تست‌ها در این PDF تشخیص داده نشد",
    totalPages,
    tests: emptyTests(),
  };
  if (totalPages === 0) {
    return { ...empty, reason: "PDF بدون متن قابل استخراج است (احتمالاً اسکن‌شده)" };
  }

  // ---------- مرحلهٔ ۱: لنگرهای خام ----------
  type Raw = { page: number; test: number; skill: PaperSkill | "speaking"; relaxed: boolean };
  const raws: Raw[] = [];
  const backMatterPages: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    const norm = texts[i];
    if (!norm) continue;
    const top = topOf(norm);
    if (BACK_MATTER_RE.test(top)) backMatterPages.push(i);

    const testM = norm.match(TEST_RE);
    const skill = skillAtTop(top);
    if (!testM || !skill) continue;
    const test = Number(testM[1]);
    const hasSignal = CONTENT_SIGNAL_RE.test(norm);
    raws.push({ page: i, test, skill, relaxed: !hasSignal });
  }

  if (raws.length === 0) return empty;

  // ---------- مرحلهٔ ۲: فیلتر ترتیبی ----------
  // تست‌ها باید صعودی باشند؛ لنگر بی‌ترتیب حذف می‌شود.
  function sequentialFilter(list: Raw[]): Raw[] {
    const out: Raw[] = [];
    let expected = 1;
    for (const a of list) {
      if (a.test === expected) {
        out.push(a);
      } else if (a.test === expected + 1) {
        expected = a.test;
        out.push(a);
      }
      // a.test < expected → ذکر متنی داخل تست قبلی → حذف
      // a.test > expected+1 → پرش غیرممکن → حذف (محافظه‌کارانه)
    }
    return out;
  }

  let anchors: Anchor[] = sequentialFilter(raws.filter((r) => !r.relaxed)).map(toAnchor);
  if (anchors.length === 0) {
    // گذر نرم: بدون سیگنال محتوا (کتاب‌های با چیدمان متفاوت)
    anchors = sequentialFilter(raws).map(toAnchor);
  }
  if (anchors.length === 0) return empty;

  // ---------- مرحلهٔ ۳: مرز انتهای کتاب ----------
  const firstAnchorPage = anchors[0].page;
  const backStart = backMatterPages.find((p) => p > firstAnchorPage + 1) ?? totalPages;
  anchors = anchors.filter((a) => a.page < backStart);
  if (anchors.length === 0) return empty;

  // ---------- مرحلهٔ ۴: محدودهٔ هر مهارت هر تست ----------
  // پایان هر مهارت = صفحهٔ قبل از لنگر «مهارت متفاوت» بعدی همان تست
  // (لنگرهای تکراری همان مهارت — صفحات بعدی لیسنینگ — محدوده را کوتاه نمی‌کنند)
  const tests: Record<number, TestPages> = emptyTests();
  for (let t = 1; t <= 4; t++) {
    const mine = anchors.filter((a) => a.test === t).sort((a, b) => a.page - b.page);
    if (mine.length === 0) continue;

    const nextTestFirst = anchors.find((a) => a.test === t + 1)?.page ?? null;
    const hardEnd = Math.min(
      nextTestFirst ?? totalPages - 1,
      backStart - 1,
      totalPages - 1,
    );

    for (let k = 0; k < mine.length; k++) {
      const cur = mine[k];
      if (cur.skill === "speaking") continue;

      // اولین لنگرِ «مهارت دیگر» بعد از این صفحه
      let to: number | null = null;
      for (let j = k + 1; j < mine.length; j++) {
        if (mine[j].skill !== cur.skill) {
          to = mine[j].page - 1;
          break;
        }
      }
      if (to == null) to = hardEnd; // مهارت دیگری بعدش نیست → تا مرز بعدی
      if (to < cur.page) to = cur.page;

      // حذف صفحات جداکنندهٔ تست بعدی از انتهای بازه
      while (to > cur.page) {
        const m = texts[to]?.match(TEST_RE);
        if (m && Number(m[1]) !== t) {
          to--;
          continue;
        }
        break;
      }

      const range: PageRange = { from: cur.page, to };
      const prev = tests[t][cur.skill];
      if (!prev) tests[t][cur.skill] = range;
    }
  }

  const anyRange = SKILLS.some((s) =>
    [1, 2, 3, 4].some((t) => tests[t][s] != null),
  );
  if (!anyRange) return empty;

  return { ok: true, reason: null, totalPages, tests };
}

function emptyTests(): Record<number, TestPages> {
  return {
    1: { listening: null, reading: null, writing: null },
    2: { listening: null, reading: null, writing: null },
    3: { listening: null, reading: null, writing: null },
    4: { listening: null, reading: null, writing: null },
  };
}

function toAnchor(r: { page: number; test: number; skill: PaperSkill | "speaking" }): Anchor {
  return { page: r.page, test: r.test, skill: r.skill };
}

// ============================================================
// ۴) کش دیسک نقشهٔ صفحات
// ============================================================

function cacheDir(): string {
  return path.join(process.cwd(), ".cache", "ielts-papers");
}

function layoutCachePath(key: string): string {
  return path.join(cacheDir(), `${key}.layout.json`);
}

async function readLayoutFromDisk(key: string): Promise<BookLayout | null> {
  try {
    const raw = await readFile(layoutCachePath(key), "utf-8");
    const parsed = JSON.parse(raw) as CachedLayout;
    if (parsed.key !== key) return null;
    return parsed.layout;
  } catch {
    return null;
  }
}

async function writeLayoutToDisk(key: string, layout: BookLayout): Promise<void> {
  try {
    await mkdir(cacheDir(), { recursive: true });
    const payload: CachedLayout = { key, layout };
    await writeFile(layoutCachePath(key), JSON.stringify(payload), "utf-8");
  } catch {
    /* دیسک فقط‌خواندنی یا پر — بی‌صدا رد می‌شویم */
  }
}

/** چیدمان کتاب (کش حافظه + دیسک + تشخیص تازه) */
export async function getBookLayout(
  bookId: number,
): Promise<BookLayout | { error: string }> {
  const src = await loadBookPdf(bookId);
  if ("error" in src) return { error: src.error };

  if (
    layoutCache &&
    layoutCache.bookId === bookId &&
    layoutCache.key === src.key &&
    Date.now() - layoutCache.at < LAYOUT_TTL_MS
  ) {
    return layoutCache.layout;
  }

  const fromDisk = await readLayoutFromDisk(`${bookId}:${src.key}`);
  if (fromDisk) {
    layoutCache = { bookId, key: src.key, layout: fromDisk, at: Date.now() };
    return fromDisk;
  }

  const texts = await getPageTexts(bookId, src);
  if ("error" in texts) return { error: texts.error };

  const layout = detectBookLayout(texts.texts);
  layoutCache = { bookId, key: src.key, layout, at: Date.now() };
  await writeLayoutToDisk(`${bookId}:${src.key}`, layout);
  return layout;
}

// ============================================================
// ۵) اطلاعات برگه (برای ?check=1 — بدون ساخت PDF)
// ============================================================

export async function getPaperInfo(
  bookId: number,
  testId: number,
  skill: PaperSkill,
): Promise<PaperInfo> {
  const layout = await getBookLayout(bookId);
  if ("error" in layout) {
    return { available: false, reason: layout.error, fromPage: null, toPage: null, totalPages: null };
  }
  const range = layout.tests[testId]?.[skill] ?? null;
  if (!range) {
    return {
      available: false,
      reason: layout.ok
        ? `صفحات ${SKILL_TITLE[skill].fa} تست ${testId} در این PDF تشخیص داده نشد`
        : "صفحات تست‌ها در این PDF تشخیص داده نشد",
      fromPage: null,
      toPage: null,
      totalPages: layout.totalPages,
    };
  }
  return {
    available: true,
    reason: null,
    fromPage: range.from + 1,
    toPage: range.to + 1,
    totalPages: layout.totalPages,
  };
}

// ============================================================
// ۶) صفحهٔ جلد امتحانی (pdf-lib)
// ============================================================

async function drawCoverPage(
  doc: PDFDocument,
  opts: {
    bookNumber: number;
    testNumber: number;
    skill: PaperSkill;
    fromPage: number;
    toPage: number;
    totalPages: number;
  },
): Promise<void> {
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const centerX = width / 2;
  const ink = rgb(0.09, 0.11, 0.17);
  const faint = rgb(0.45, 0.5, 0.6);
  const rule = rgb(0.78, 0.81, 0.87);

  // قاب دوتایی — مثل دفترچهٔ رسمی
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: ink,
    borderWidth: 1.2,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: rule,
    borderWidth: 0.6,
  });

  const drawCentered = (text: string, y: number, size: number, font: PDFFont, color = ink) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: centerX - w / 2, y, size, font, color });
  };

  drawCentered("FLEX ENGLISH  ·  IELTS EXAM PAPER", height - 78, 9, helvBold, faint);
  drawCentered(`Cambridge IELTS ${String(opts.bookNumber).padStart(2, "0")}`, height - 150, 34, timesBold);
  drawCentered(`TEST ${opts.testNumber}`, height - 186, 15, helvBold, faint);

  page.drawLine({
    start: { x: 150, y: height - 210 },
    end: { x: width - 150, y: height - 210 },
    thickness: 1,
    color: rule,
  });

  drawCentered(SKILL_TITLE[opts.skill].en, height - 292, 44, timesBold);
  const spec = SKILL_SPEC[opts.skill];
  drawCentered(spec.minutes, height - 322, 11, helv);
  drawCentered(spec.count, height - 340, 11, helv);

  // دستورالعمل — کادر
  const boxTop = height - 400;
  const boxH = spec.instructions.length * 16 + 34;
  page.drawRectangle({
    x: 96,
    y: boxTop - boxH,
    width: width - 192,
    height: boxH,
    borderColor: rule,
    borderWidth: 0.6,
  });
  drawCentered("INSTRUCTIONS TO CANDIDATES", boxTop - 20, 9, helvBold, faint);
  spec.instructions.forEach((line, i) => {
    drawCentered(line, boxTop - 42 - i * 16, 10, times, ink);
  });

  // خط نام داوطلب
  const cy = 190;
  page.drawText("Candidate Name:", { x: 96, y: cy, size: 10, font: helvBold, color: faint });
  page.drawLine({ start: { x: 200, y: cy - 2 }, end: { x: 380, y: cy - 2 }, thickness: 0.7, color: faint });
  page.drawText("Date:", { x: 402, y: cy, size: 10, font: helvBold, color: faint });
  page.drawLine({ start: { x: 434, y: cy - 2 }, end: { x: 500, y: cy - 2 }, thickness: 0.7, color: faint });

  drawCentered(
    `Exam paper — pages ${opts.fromPage}–${opts.toPage} of ${opts.totalPages} of your Cambridge IELTS ${String(opts.bookNumber).padStart(2, "0")} book`,
    120,
    8,
    helv,
    faint,
  );
  drawCentered("Do not open this paper until told to do so.", 104, 9, helvBold, ink);
}

// ============================================================
// ۷) ساخت PDF برگهٔ امتحانی (کش دیسک)
// ============================================================

function paperCachePath(key: string): string {
  return path.join(cacheDir(), `${key}.pdf`);
}

async function readPaperFromDisk(key: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await readFile(paperCachePath(key)));
  } catch {
    return null;
  }
}

async function writePaperToDisk(key: string, bytes: Uint8Array): Promise<void> {
  try {
    await mkdir(cacheDir(), { recursive: true });
    await writeFile(paperCachePath(key), bytes);
  } catch {
    /* کش دیسک اختیاری است */
  }
}

export type PaperBuildResult =
  | { bytes: Uint8Array; filename: string }
  | { error: string };

/** ساخت برگهٔ امتحانی یک تست/مهارت — با صفحهٔ جلد */
export async function buildExamPaper(
  bookId: number,
  testId: number,
  skill: PaperSkill,
): Promise<PaperBuildResult> {
  const info = await getPaperInfo(bookId, testId, skill);
  if (!info.available || info.fromPage == null || info.toPage == null) {
    return { error: info.reason ?? "برگهٔ امتحانی در دسترس نیست" };
  }

  const src = await loadBookPdf(bookId);
  if ("error" in src) return { error: src.error };

  const cacheKey = createHash("sha1")
    .update(`${src.key}|t${testId}|${skill}`)
    .digest("hex");

  const cached = await readPaperFromDisk(cacheKey);
  if (cached && cached.byteLength > 0) {
    return {
      bytes: cached,
      filename: paperFilename(bookId, testId, skill),
    };
  }

  try {
    const from = info.fromPage - 1; // ۰-مبنی
    const to = info.toPage - 1;

    const source = await PDFDocument.load(src.bytes, {
      ignoreEncryption: true,
    });
    const out = await PDFDocument.create();

    await drawCoverPage(out, {
      bookNumber: bookId,
      testNumber: testId,
      skill,
      fromPage: info.fromPage,
      toPage: info.toPage,
      totalPages: info.totalPages ?? to + 1,
    });

    const pageIndices: number[] = [];
    for (let i = from; i <= to; i++) pageIndices.push(i);
    const copied = await out.copyPages(source, pageIndices);
    for (const p of copied) out.addPage(p);

    const bytes = await out.save({ useObjectStreams: true });
    await writePaperToDisk(cacheKey, bytes);
    return { bytes, filename: paperFilename(bookId, testId, skill) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطای ناشناخته";
    return { error: `ساخت برگهٔ امتحانی ناموفق بود: ${message}` };
  }
}

export function paperFilename(bookId: number, testId: number, skill: PaperSkill): string {
  return `cambridge-${String(bookId).padStart(2, "0")}-t${testId}-${skill}.pdf`;
}
