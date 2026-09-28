// ========================================
// موتور برگهٔ امتحانی تعاملی آیلتس (v1.0.3.5)
//
// «داخل خود برگهٔ امتحان جواب بده» — به‌جای نمایش PDF در یک ستون و
// پاسخ‌برگ در ستون دیگر (که در موبایل به درد نمی‌خورد)، متن صفحات
// همان تست/مهارت از PDF کتاب استخراج و به ساختار سوال تبدیل می‌شود:
//
//   SECTION 1 / READING PASSAGE 1 / WRITING TASK 1  ← بخش‌ها
//   Questions 1–5 + دستور + بانک گزینه               ← دسته‌ها
//   1  The tour costs £ .........                     ← سوال با ورودی خطی
//   A  harbour / B  castle / C  market                ← گزینه‌های چهارگزینه‌ای
//   TRUE / FALSE / NOT GIVEN                          ← دکمه‌های تشخیصی
//
// قواعد قراردادی آیلتس که تجزیه بر آنها استوار است:
//  - هر «جای خالی» دقیقاً یک شمارهٔ سوال دارد؛ عدد سوال کنار جای
//    خالی خودش می‌آید (ابتدای خط یا داخل خطِ جدول/فرم)
//  - سوال‌ها داخل هر دسته صعودی و پیوسته‌اند (۱، ۲، ۳ …)
//  - گزینه‌های چهارگزینه‌ای پس از صورت سوال، با حروف ترتیبی A..E
//  - بانک مچینگ (تیتر/ویژگی) پیش از سوال‌ها می‌آید
//
// خروجی کاملاً با پاسخ‌برگ قبلی سازگار است: مقادیر در
// r1..r40 / l1..l40 ذخیره می‌شوند (حرف / TRUE / متن آزاد).
//
// اگر متن PDF قابل تجزیه نبود (کتاب اسکن‌شده و…) → ok=false و
// کلاینت به چیدمان قبلی v1.0.3.4 برمی‌گردد (آزمون هرگز متوقف نمی‌شود).
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractTextItems, getDocumentProxy } from "unpdf";
import type { StructuredTextItem } from "unpdf";
import { getBookLayout, loadBookPdf } from "@/lib/ielts/exam-paper";
import type { PageRange, PaperSkill, PdfSource } from "@/lib/ielts/exam-paper";
import type {
  InteractivePaper,
  PaperGroup,
  PaperInputKind,
  PaperOption,
  PaperQuestionUnit,
  PaperSection,
} from "@/types/ielts";

// ---------- ثابت‌ها ----------

const LINES_TTL_MS = 10 * 60 * 1000; // خطوط صفحات: ۱۰ دقیقه (هماهنگ با بقیهٔ کش‌ها)
const PAPER_MEM_TTL_MS = 10 * 60 * 1000;
/** با تغییر منطق پارسر این را عوض کن تا کش‌های دیسک بی‌اعتبار شوند */
const PARSER_VERSION = "ip2";

/** حداقل پوشش شماره‌های سوال برای قبولی برگهٔ تعاملی */
const MIN_COVERAGE = 0.7;
/** حداقل مطلق شمارهٔ سوال پیداشده */
const MIN_FOUND = 8;
/** بیشینهٔ پرش رو به جلوی شمارهٔ سوال (مقاومت در برابر سوال جاافتاده) */
const MAX_SKIP = 2;
/** بیشینهٔ طول متن یک گزینهٔ چهارگزینه‌ای */
const MAX_OPTION_LEN = 90;

// ---------- کش‌ها ----------

const linesCache = new Map<number, { key: string; pages: string[][]; at: number }>();
const paperCache = new Map<string, { paper: InteractivePaper; at: number }>();

// ============================================================
// ۱) خطوط صفحات — گروه‌بندی آیتم‌های متنی بر اساس مختصات y
// ============================================================

type RowItem = { x: number; endX: number; str: string };

/**
 * تبدیل آیتم‌های متنی یک صفحه به خطوط خوانا.
 * فاصلهٔ بزرگ بین آیتم‌ها (ستون جدول/برچسب پاراگراف) با دو فاصله
 * حفظ می‌شود تا الگوهای «A  متن پاراگراف» قابل تشخیص بمانند.
 */
export function itemsToLines(items: StructuredTextItem[]): string[] {
  const sorted = items
    .filter((it) => it.str && it.str.trim() !== "")
    .slice()
    .sort((a, b) => (Math.abs(b.y - a.y) > 2.2 ? b.y - a.y : a.x - b.x));

  const rows: { y: number; items: RowItem[] }[] = [];
  for (const it of sorted) {
    const row = rows.length > 0 ? rows[rows.length - 1] : null;
    const item: RowItem = { x: it.x, endX: it.x + (it.width ?? 0), str: it.str };
    if (row && Math.abs(row.y - it.y) <= 2.2) {
      row.items.push(item);
    } else {
      rows.push({ y: it.y, items: [item] });
    }
  }

  const lines: string[] = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    let text = "";
    let prevEnd: number | null = null;
    for (const item of row.items) {
      if (prevEnd != null) {
        const gap = item.x - prevEnd;
        if (gap > 8) text += "  ";
        else if (gap > 1.1) text += " ";
      }
      text += item.str;
      prevEnd = item.endX;
    }
    const t = text.replace(/\u00ad/g, "").replace(/[ \t]+/g, " ").trim();
    if (t) lines.push(t);
  }
  return lines;
}

/** استخراج خطوط همهٔ صفحات کتاب — با کش حافظه */
async function getBookLines(
  bookId: number,
  src: PdfSource,
): Promise<{ pages: string[][] } | { error: string }> {
  const cached = linesCache.get(bookId);
  if (cached && cached.key === src.key && Date.now() - cached.at < LINES_TTL_MS) {
    return { pages: cached.pages };
  }
  try {
    // کپی از بایت‌های کش‌شده — pdf.js بافر ورودی را detach می‌کند
    const proxy = await getDocumentProxy(new Uint8Array(src.bytes));
    const { items } = await extractTextItems(proxy);
    const pages = items.map((pageItems) => itemsToLines(pageItems));
    linesCache.set(bookId, { key: src.key, pages, at: Date.now() });
    return { pages };
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطای ناشناخته";
    return { error: `خواندن خطوط PDF ناموفق بود: ${message}` };
  }
}

// ============================================================
// ۲) پاک‌سازی خطوط داخل بازهٔ تست
// ============================================================

/** خط سرصفحهٔ چاپی مثل «Test 2   LISTENING» */
const RUNNING_HEADER_RE = /^test\s*[1-4]\s+(listening|reading|writing|speaking)\s*$/i;
/** شمارهٔ صفحهٔ تنها (شمارهٔ سوال همیشه همراه متن است) */
const BARE_NUMBER_RE = /^\d{1,3}$/;
/** پانویس‌های رایج کمبریج */
const FOOTER_RE = /^(©|\(c\))|photocopiable|turn over\s*$/i;

/** خطوط یک بازهٔ صفحه (۰-مبنی، هر دو شامل) با حذف نویز چاپی */
export function collectRangeLines(
  pages: string[][],
  range: PageRange,
): { text: string; page: number }[] {
  const out: { text: string; page: number }[] = [];
  for (let p = range.from; p <= Math.min(range.to, pages.length - 1); p++) {
    for (const raw of pages[p] ?? []) {
      const text = raw.trim();
      if (!text) continue;
      if (RUNNING_HEADER_RE.test(text)) continue;
      if (BARE_NUMBER_RE.test(text)) continue;
      if (FOOTER_RE.test(text)) continue;
      out.push({ text, page: p });
    }
  }
  return out;
}

// ============================================================
// ۳) الگوهای تشخیص
// ============================================================

const SECTION_RE = /^section\s*([1-4])\b(.*)$/i;
const PASSAGE_RE = /^reading\s+passage\s*([1-3])\b(.*)$/i;
const PART_RE = /^part\s*([1-3])\b(.*)$/i;
const WRITING_TASK_RE = /^(?:writing\s+)?task\s*([1-2])\b(.*)$/i;
const QUESTIONS_RE = /^questions?\s+(\d{1,2})\s*(?:(?:[–—-]|and|&)\s*(\d{1,2}))?\b[.:)]?\s*(.*)$/i;

/** جای خالی: نقطه‌های متوالی / سه‌نقطه / زیرخط / خط تیرهٔ تکرار */
const BLANK_SPLIT_RE = /\.{2,}|…+|_{2,}|—{2,}|–{2,}/g;
const BLANK_END_RE = /(?:\.{2,}|…+|_{2,}|—{2,}|–{2,})\s*$/;
/** عدد ابتدای خط: شمارهٔ سوال — بعد از عدد نباید رقم دیگر باشد (ضد سال‌ها) */
const LEADING_NUM_RE = /^(\d{1,2})(?!\d)\s*[.).]?\s*(.*)$/;
/** عدد داخل خط — جداکنندهٔ سوال‌های جدولی/فرمی */
const INLINE_NUM_RE = /(?:^|[\s:.])(\d{1,2})(?!\d)(?=[\s.,)]|$)/g;
/** گزینهٔ حرفی ابتدای خط (حرف + فاصله) */
const LETTER_OPT_RE = /^([A-H])[.)]?\s{1,}(.+)$/;
/** عدد رومی ابتدای خط (بانک تیترها — حروف کوچک) */
const ROMAN_OPT_RE = /^(viii|vii|vi|iv|ix|iii|v|ii|i|x)[.)]?\s{1,}(.+)$/;
/** برچسب پاراگراف پاساژ: «A  متن پاراگراف» (دو فاصله) */
const PARAGRAPH_LABEL_RE = /^([A-I])\s{2,}(.{4,})$/;

const ROMAN_VALUES = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const LETTER_VALUES = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

function letterRun(letters: string[]): string[] {
  const uniq = letters.map((l) => l.toUpperCase());
  const present = LETTER_VALUES.filter((l) => uniq.includes(l));
  return present.length > 0 ? present : ["A", "B", "C", "D"];
}

function romanRun(romans: string[]): string[] {
  const present = ROMAN_VALUES.filter((r) => romans.includes(r));
  return present.length > 0 ? present : ROMAN_VALUES.slice(0, 8);
}

/** آیا خطوط گزینه، یک رشتهٔ ترتیبی از A هستند؟ */
function isLetterRun(letters: string[]): boolean {
  return (
    letters.length >= 2 &&
    letters[0] === "A" &&
    letters.every((l, i) => l === String.fromCharCode(65 + i))
  );
}

/** آیا خطوط بانک، یک رشتهٔ ترتیبی از i هستند؟ */
function isRomanRun(romans: string[]): boolean {
  const idx = romans.map((r) => ROMAN_VALUES.indexOf(r));
  return idx.length >= 3 && idx[0] === 0 && idx.every((v, i) => v === i);
}

// ============================================================
// ۴) تشخیص نوع ورودی از دستور سوال
// ============================================================

function detectInputKind(instruction: string[]): {
  kind: PaperInputKind;
  letters?: string[];
} {
  const up = instruction.join(" ").toUpperCase();

  // TRUE/FALSE/NOT GIVEN یا YES/NO/NOT GIVEN
  if (/\bTRUE\b.*\bFALSE\b.*\bNOT\s+GIVEN\b/.test(up)) return { kind: "tfng" };
  if (/\bYES\b.*\bNO\b.*\bNOT\s+GIVEN\b/.test(up)) return { kind: "ynng" };

  // چندحرفی (choose TWO/THREE letters) → ورودی متنی آزاد
  if (/\bCHOOSE\s+(TWO|THREE|FOUR|FIVE)\s+LETTERS?\b/.test(up)) return { kind: "text" };

  // مچینگ تیتر (عدد رومی)
  if (/CORRECT\s+HEADING/.test(up)) return { kind: "roman" };

  // «paragraphs A–G» / «sections A–D» → بازهٔ حروف از خود دستور
  const range = up.match(/\b([A-I])\s*(?:[–—-]|TO)\s*([A-I])\b/);
  if (range) {
    const from = range[1].charCodeAt(0);
    const to = range[2].charCodeAt(0);
    if (to >= from && to - from <= 8) {
      const letters: string[] = [];
      for (let c = from; c <= to; c++) letters.push(String.fromCharCode(c));
      return { kind: "letters", letters };
    }
  }

  // مچینگ پاراگراف/گوینده/ویژگی → حرف
  if (
    /\bWHICH\s+(PARAGRAPH|SECTION|STUDENT|SPEAKER|PERSON)\b/.test(up) ||
    /MATCH\s+EACH\b/.test(up) ||
    /\bFROM\s+THE\s+LIST\b/.test(up)
  ) {
    return { kind: "letters" };
  }

  // چهارگزینه‌ای — حرف‌های مجاز از خود دستور («A, B or C» / «A–D»)
  if (/CORRECT\s+(LETTER|ANSWER)/.test(up)) {
    const present = new Set((up.match(/\b([A-E])\b/g) ?? []).map((s) => s.trim()));
    if (present.has("A")) {
      const max = ["A", "B", "C", "D", "E"].filter((l) => present.has(l)).pop()!;
      return {
        kind: "letters",
        letters: ["A", "B", "C", "D", "E"].slice(0, max.charCodeAt(0) - 64),
      };
    }
    return { kind: "letters", letters: ["A", "B", "C"] };
  }

  // پیش‌فرض: جای خالی متنی
  return { kind: "text" };
}

// ============================================================
// ۵) تجزیهٔ خطوط به ساختار برگه — تابع خالص (قابل تست)
// ============================================================

/** دستهٔ در حال ساخت — فیلدهای کمکی قبل از نهایی‌شدن */
type WipGroup = {
  label: string;
  instruction: string[];
  inputKind: PaperInputKind | null; // null = هنوز تشخیص نداده‌ایم
  letters?: string[];
  bank: PaperOption[];
  bankRaw: string[];
  optionRaw: string[];
  questions: PaperQuestionUnit[];
};

type ParseOutput = {
  sections: PaperSection[];
  questionNumbers: number[];
  maxQuestion: number;
};

/**
 * تجزیهٔ خطوطِ بازهٔ یک تست/مهارت به ساختار برگهٔ تعاملی.
 * خالص و بدون وابستگی به فایل/شبکه — مستقیماً تست می‌شود.
 *
 * وضعیت ماشین حالت روی آبجکت st نگه داشته می‌شود تا تنگ‌شدن نوع
 * (narrowing) متغیرهای بسته‌ای، تحلیل تایپ‌اسکریپت را گمراه نکند.
 */
export function parsePaperLines(
  lines: { text: string; page: number }[],
  skill: PaperSkill,
): ParseOutput {
  const sections: PaperSection[] = [];
  const questionNumbers = new Set<number>();
  const passageLetters: string[] = [];
  let maxQuestion = 0;

  const st = {
    section: null as PaperSection | null,
    group: null as WipGroup | null,
    textLines: [] as string[],
    /** بعد از اولین سوالِ دسته، این دسته در فاز سوال‌هاست */
    inQuestions: false,
    /** شماره‌ای که سوال بعدی را شروع می‌کند */
    nextExpected: null as number | null,
    /** سوال جاری در حال جمع‌آوری متن */
    current: null as { number: number; segments: string[] } | null,
  };

  // ---------- کمک‌ها ----------

  function closeTextBlock(): void {
    if (st.textLines.length > 0) {
      st.section?.blocks.push({ type: "text", lines: st.textLines });
      st.textLines = [];
    }
  }

  function appendToCurrent(text: string): void {
    if (!text) return;
    const cur = st.current;
    if (cur) {
      BLANK_SPLIT_RE.lastIndex = 0;
      const parts = text.split(BLANK_SPLIT_RE);
      const last = cur.segments.length - 1;
      cur.segments[last] = (cur.segments[last] + " " + parts[0]).trim();
      for (let i = 1; i < parts.length; i++) {
        cur.segments.push(parts[i].trim());
      }
    } else if (st.group) {
      st.group.instruction.push(text);
    } else {
      st.textLines.push(text);
    }
  }

  /**
   * تصمیم دربارهٔ خطوط کاندید گزینه (چهارگزینه‌ای):
   * فقط رشتهٔ ترتیبی A.. در دستهٔ حرفی پذیرفته می‌شود؛ در غیر این
   * صورت خطوط به متن خود سوال برمی‌گردند.
   */
  function settleOptions(): PaperOption[] | null {
    const g = st.group;
    if (!g || g.optionRaw.length === 0) return null;
    const parsed = g.optionRaw
      .map((l) => l.match(LETTER_OPT_RE))
      .filter((m): m is RegExpMatchArray => m != null);
    const letters = parsed.map((m) => m[1]);
    const kind = g.inputKind ?? detectInputKind(g.instruction).kind;
    const valid =
      kind === "letters" &&
      isLetterRun(letters) &&
      parsed.every((m) => m[2].length <= MAX_OPTION_LEN);
    if (valid) {
      const opts = parsed.map((m) => ({ letter: m[1], text: m[2] }));
      g.optionRaw = [];
      return opts;
    }
    // رد → به متن سوال جاری برگردان
    const raws = g.optionRaw;
    g.optionRaw = [];
    for (const raw of raws) appendToCurrent(raw);
    return null;
  }

  function closeQuestion(): void {
    const g = st.group;
    const cur = st.current;
    if (!g || !cur) return;
    const opts = settleOptions();
    const unit: PaperQuestionUnit = {
      numbers: [cur.number],
      segments: cur.segments,
      inputKind: g.inputKind ?? "text",
    };
    if (opts && opts.length > 0) unit.options = opts;
    g.questions.push(unit);
    questionNumbers.add(cur.number);
    st.nextExpected = cur.number + 1;
    st.current = null;
  }

  function closeGroup(): void {
    closeQuestion();
    const g = st.group;
    if (g) {
      // دستهٔ بدون سوال (مثل برچسب صفحه‌ای «SECTION 1  Questions 1-10» که
      // زیردسته‌های واقعی جایگزینش می‌شوند) → متنش به بخش برمی‌گردد
      if (g.questions.length === 0) {
        if (g.instruction.length > 0) {
          for (const line of g.instruction) st.textLines.push(line);
        }
        st.group = null;
        st.inQuestions = false;
        st.nextExpected = null;
        st.current = null;
        return;
      }

      // بانک گزینه — فقط رشتهٔ معتبر + نوع حرفی/رومی
      const detected =
        g.inputKind === null
          ? detectInputKind(g.instruction)
          : { kind: g.inputKind, letters: undefined as string[] | undefined };
      let kind: PaperInputKind = detected.kind;
      let letters = detected.letters;
      const bankParsed = g.bankRaw
        .map((l) => l.match(ROMAN_OPT_RE))
        .filter((m): m is RegExpMatchArray => m != null);
      const letterParsed = g.bankRaw
        .map((l) => l.match(LETTER_OPT_RE))
        .filter((m): m is RegExpMatchArray => m != null);

      let bank: PaperOption[] | null = null;
      if (
        (kind === "roman" || kind === "letters") &&
        isRomanRun(bankParsed.map((m) => m[1])) &&
        bankParsed.length >= letterParsed.length
      ) {
        bank = bankParsed.map((m) => ({ letter: m[1], text: m[2] }));
        kind = "roman";
      } else if (kind === "letters" && isLetterRun(letterParsed.map((m) => m[1]))) {
        bank = letterParsed.map((m) => ({ letter: m[1], text: m[2] }));
      }

      if (!bank && g.bankRaw.length > 0) {
        // بانک نامعتبر → خطوط به دستور برگردند
        const raws = g.bankRaw;
        g.bankRaw = [];
        for (const raw of raws) g.instruction.push(raw);
      }

      if (bank) {
        if (kind === "roman") letters = romanRun(bank.map((o) => o.letter));
        else letters = letterRun(bank.map((o) => o.letter));
      }
      if (kind === "letters" && (letters == null || letters.length === 0)) {
        letters = letterRun(passageLetters.length > 1 ? passageLetters : ["A", "B", "C", "D"]);
      }
      if (kind === "roman" && (letters == null || letters.length === 0)) {
        letters = ROMAN_VALUES.slice(0, 8);
      }
      // نوع نهایی تشخیص‌داده‌شده به همهٔ سوال‌های همین دسته تزریق می‌شود
      // (سوال‌ها هنگام بسته‌شدن با نوع ناشناخته ساخته شده بودند)
      for (const q of g.questions) {
        q.inputKind = kind;
      }

      const finalGroup: PaperGroup = {
        label: g.label,
        instruction: g.instruction,
        inputKind: kind,
        letters,
        bank: bank ?? undefined,
        questions: g.questions,
      };
      st.section?.blocks.push({ type: "group", group: finalGroup });
    }
    st.group = null;
    st.inQuestions = false;
    st.nextExpected = null;
    st.current = null;
  }

  function closeSection(): void {
    closeGroup();
    closeTextBlock();
    st.section = null;
  }

  function openSection(title: string): void {
    closeSection();
    st.section = { title, blocks: [] };
    sections.push(st.section);
  }

  function openGroup(label: string, firstNumber: number, rest: string): void {
    closeGroup();
    closeTextBlock();
    // بدون هدر بخش؟ (مثل شروع مستقیم با Questions) → بخش پیش‌فرض
    if (!st.section) {
      st.section = {
        title: skill === "writing" ? "Writing" : "Paper",
        blocks: [],
      };
      sections.push(st.section);
    }
    st.group = {
      label,
      instruction: [],
      inputKind: null,
      bank: [],
      bankRaw: [],
      optionRaw: [],
      questions: [],
    };
    if (rest) st.group.instruction.push(rest);
    st.inQuestions = false;
    st.nextExpected = firstNumber;
    st.current = null;
  }

  /**
   * افزودن متن به ناحیهٔ سوال‌های دسته.
   * عدد «انتظاری» کنار جای خالی، سوال جدیدی شروع می‌کند (فرمت
   * جدول/فرم/بولت)؛ در غیر این صورت متن، دستور یا ادامهٔ سوال است.
   */
  function pushQuestionText(text: string): void {
    if (!st.group) return;
    let offset = 0;
    let consumedUpTo = 0;

    for (;;) {
      const scanner = text.slice(offset);
      INLINE_NUM_RE.lastIndex = 0;
      const m = INLINE_NUM_RE.exec(scanner);
      if (m == null) break;
      const num = Number(m[1]);
      const starter = st.current ? st.current.number + 1 : st.nextExpected;
      if (starter == null || num !== starter) {
        offset += m.index + m[0].length;
        continue;
      }

      const before = text.slice(consumedUpTo, offset + m.index).trim();
      const after = text.slice(offset + m.index + m[0].length).trim();
      // عدد کنار جای خالی = برچسب سوال (جدول: «..... 2 ……» / فرم: «of 1 ……»)
      const beforeHasBlank = BLANK_END_RE.test(before + " ");
      // جای خالی باید «بلافاصله» بعد از عدد بیاید (با ارز مجاز: «6 £.....»)
      const afterHasBlank = /^(?:£|\$|€)?\s*(?:\.{2,}|…+|_{2,}|—{2,}|–{2,})/.test(after);
      const canSplit = beforeHasBlank || afterHasBlank;

      if (canSplit) {
        if (before) appendToCurrent(before);
        closeQuestion();
        st.current = { number: num, segments: [""] };
        st.inQuestions = true;
        st.nextExpected = num + 1;
        consumedUpTo = offset + m.index + m[0].length;
      }
      offset += m.index + m[0].length;
    }

    const tail = text.slice(consumedUpTo);
    if (tail) appendToCurrent(tail);
  }

  // ---------- گشودن خطوط ----------
  for (const { text } of lines) {
    let m: RegExpMatchArray | null;

    // ---- هدر بخش‌ها ----
    if ((m = text.match(SECTION_RE))) {
      const rest = (m[2] ?? "").trim();
      openSection(`Section ${m[1]}`);
      const q = rest.match(QUESTIONS_RE);
      if (q) {
        const from = Number(q[1]);
        const to = q[2] ? Number(q[2]) : from;
        if (from >= 1 && to >= from && to <= 45) {
          maxQuestion = Math.max(maxQuestion, to);
          openGroup(
            `Questions ${from}${to !== from ? `–${to}` : ""}`,
            from,
            (q[3] ?? "").trim(),
          );
        }
      } else if (rest) {
        st.textLines.push(rest);
      }
      continue;
    }
    if ((m = text.match(PASSAGE_RE)) || (skill === "reading" && (m = text.match(PART_RE)))) {
      const rest = (m[2] ?? "").trim();
      // فقط سرصفحهٔ واقعی («READING PASSAGE 1»)؛ خطِ دستوری مثل
      // «Reading Passage 1 has six paragraphs, A-F.» بخش جدید نیست
      if (rest.length <= 4) {
        openSection(`Reading Passage ${m[1]}`);
        continue;
      }
      // ادامهٔ خط بلند → مثل خط عادی پردازش می‌شود (پایین)
    }
    if (skill === "writing" && (m = text.match(WRITING_TASK_RE))) {
      const rest = (m[2] ?? "").trim();
      openSection(`Writing Task ${m[1]}`);
      if (rest) st.textLines.push(rest);
      continue;
    }

    // ---- برچسب دستهٔ سوال ----
    if ((m = text.match(QUESTIONS_RE))) {
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : from;
      const rest = (m[3] ?? "").trim();
      if (from >= 1 && to >= from && to <= 45) {
        maxQuestion = Math.max(maxQuestion, to);
        openGroup(`Questions ${from}${to !== from ? `–${to}` : ""}`, from, rest);
        continue;
      }
    }

    // ---- بانک گزینه‌ها (ناحیهٔ دستور، پیش از سوال‌ها) ----
    const g0 = st.group;
    if (g0 && !st.inQuestions) {
      const rm = text.match(ROMAN_OPT_RE);
      const lm = text.match(LETTER_OPT_RE);
      const expectedRoman = ROMAN_VALUES[g0.bankRaw.length] ?? null;
      const expectedLetter = String.fromCharCode(65 + g0.bankRaw.length);
      if (rm && rm[1] === expectedRoman) {
        g0.bankRaw.push(text);
        continue;
      }
      if (lm && lm[1] === expectedLetter) {
        g0.bankRaw.push(text);
        continue;
      }
    }

    // ---- گزینهٔ چهارگزینه‌ای (پس از شروع سوال‌ها) ----
    const g1 = st.group;
    if (g1 && st.inQuestions && st.current) {
      const lm = text.match(LETTER_OPT_RE);
      if (lm && lm[1] === String.fromCharCode(65 + g1.optionRaw.length)) {
        g1.optionRaw.push(text);
        continue;
      }
    }

    // ---- شمارهٔ سوال ابتدای خط ----
    const qm = text.match(LEADING_NUM_RE);
    const g2 = st.group;
    if (g2 && qm && st.nextExpected != null) {
      const n = Number(qm[1]);
      const starter = st.current ? st.current.number + 1 : st.nextExpected;
      if (n <= 45 && n >= starter && n <= starter + MAX_SKIP) {
        closeQuestion();
        st.current = { number: n, segments: [""] };
        st.inQuestions = true;
        st.nextExpected = n + 1;
        const rest = qm[2] ?? "";
        if (rest) pushQuestionText(rest);
        continue;
      }
    }

    // ---- خط «Example» (نمونهٔ حل‌شدهٔ کتاب) → دستور، نه سوال ----
    const g3 = st.group;
    if (g3 && st.inQuestions && st.current && /^example\b/i.test(text)) {
      closeQuestion();
      g3.instruction.push(text);
      continue;
    }

    // ---- داخل دسته: سوال یا دستور؟ pushQuestionText خودش تصمیم می‌گیرد ----
    if (st.group) {
      pushQuestionText(text);
      continue;
    }

    // ---- برچسب پاراگراف پاساژ (A  متن) ----
    const pl = text.match(PARAGRAPH_LABEL_RE);
    if (pl) {
      passageLetters.push(pl[1]);
      st.textLines.push(text);
      continue;
    }

    // ---- متن آزاد بخش (پاساژ/زمینه/صورت تسک) ----
    if (st.section) {
      st.textLines.push(text);
      continue;
    }
    // پیش از اولین بخش — عنوان مهارت/کتاب
    openSection(skill === "writing" ? "Writing" : "Paper");
    st.textLines.push(text);
  }

  closeSection();

  return {
    sections,
    questionNumbers: Array.from(questionNumbers).sort((a, b) => a - b),
    maxQuestion,
  };
}

// ============================================================
// ۶) اعتبارسنجی
// ============================================================

function validate(skill: PaperSkill, parsed: ParseOutput): { ok: boolean; reason: string | null } {
  if (parsed.sections.length === 0) {
    return { ok: false, reason: "هیچ بخشی در صفحات این تست پیدا نشد" };
  }
  if (skill === "writing") {
    const tasks = parsed.sections.filter((s) => /task/i.test(s.title));
    if (tasks.length < 2) {
      return { ok: false, reason: "دو تسک رایتینگ در صفحات این تست تشخیص داده نشد" };
    }
    return { ok: true, reason: null };
  }
  const expected = parsed.maxQuestion;
  if (expected < 10) {
    return { ok: false, reason: "شماره‌گذاری سوال‌ها در این PDF تشخیص داده نشد" };
  }
  const found = parsed.questionNumbers.filter((n) => n >= 1 && n <= expected).length;
  if (found < MIN_FOUND || found < MIN_COVERAGE * expected) {
    return { ok: false, reason: `فقط ${found} سوال از ${expected} در PDF قابل تشخیص بود` };
  }
  return { ok: true, reason: null };
}

// ============================================================
// ۷) کش دیسک
// ============================================================

function cacheDir(): string {
  return path.join(process.cwd(), ".cache", "ielts-papers");
}

function paperJsonCachePath(key: string): string {
  return path.join(cacheDir(), `${key}.interactive.json`);
}

async function readPaperFromDisk(key: string): Promise<InteractivePaper | null> {
  try {
    const raw = await readFile(paperJsonCachePath(key), "utf-8");
    return JSON.parse(raw) as InteractivePaper;
  } catch {
    return null;
  }
}

async function writePaperToDisk(key: string, paper: InteractivePaper): Promise<void> {
  try {
    await mkdir(cacheDir(), { recursive: true });
    await writeFile(paperJsonCachePath(key), JSON.stringify(paper), "utf-8");
  } catch {
    /* کش دیسک اختیاری است */
  }
}

// ============================================================
// ۸) نقطهٔ ورود عمومی
// ============================================================

/** برگهٔ تعاملی یک تست/مهارت — با کش حافظه و دیسک */
export async function getInteractivePaper(
  bookId: number,
  testId: number,
  skill: PaperSkill,
): Promise<InteractivePaper> {
  const src = await loadBookPdf(bookId);
  if ("error" in src) {
    return emptyPaper(bookId, testId, skill, src.error);
  }

  const layout = await getBookLayout(bookId);
  if ("error" in layout) {
    return emptyPaper(bookId, testId, skill, layout.error);
  }
  const range = layout.tests[testId]?.[skill] ?? null;
  if (!range) {
    return emptyPaper(
      bookId,
      testId,
      skill,
      layout.ok
        ? `صفحات ${skill === "listening" ? "لیسنینگ" : skill === "reading" ? "ریدینگ" : "رایتینگ"} تست ${testId} در این PDF تشخیص داده نشد`
        : "صفحات تست‌ها در این PDF تشخیص داده نشد",
    );
  }

  const cacheKey = createHash("sha1")
    .update(`${src.key}|t${testId}|${skill}|${PARSER_VERSION}`)
    .digest("hex");

  const mem = paperCache.get(cacheKey);
  if (mem && Date.now() - mem.at < PAPER_MEM_TTL_MS) return mem.paper;

  const disk = await readPaperFromDisk(cacheKey);
  if (disk) {
    paperCache.set(cacheKey, { paper: disk, at: Date.now() });
    return disk;
  }

  const lines = await getBookLines(bookId, src);
  if ("error" in lines) {
    return emptyPaper(bookId, testId, skill, lines.error);
  }

  const rangeLines = collectRangeLines(lines.pages, range);
  const parsed = parsePaperLines(rangeLines, skill);
  const check = validate(skill, parsed);

  const paper: InteractivePaper = {
    ok: check.ok,
    reason: check.reason,
    skill,
    bookId,
    testId,
    sections: check.ok ? parsed.sections : [],
    questionNumbers: check.ok ? parsed.questionNumbers : [],
    maxQuestion: check.ok ? parsed.maxQuestion : 0,
    fromPage: range.from + 1,
    toPage: range.to + 1,
    totalPages: layout.totalPages,
  };

  paperCache.set(cacheKey, { paper, at: Date.now() });
  if (check.ok) {
    await writePaperToDisk(cacheKey, paper);
  }
  return paper;
}

function emptyPaper(
  bookId: number,
  testId: number,
  skill: PaperSkill,
  reason: string,
): InteractivePaper {
  return {
    ok: false,
    reason,
    skill,
    bookId,
    testId,
    sections: [],
    questionNumbers: [],
    maxQuestion: 0,
    fromPage: null,
    toPage: null,
    totalPages: null,
  };
}
