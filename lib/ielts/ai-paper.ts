// ========================================
// برگه‌ساز هوشمند آزمون آیلتس (v1.0.4.0)
//
//      PDF کتاب کمبریج (B2 / پوشهٔ محلی)
//        ↓  برش صفحات همان تست + صفحات پاسخ‌نامه
//      هوش مصنوعی (CodeCraft — claude-opus)
//        ↓  JSON ساختاریافته + پاسخ‌نامهٔ رسمی
//      اعتبارسنجی و نرمال‌سازی
//        ↓
//      کش دائمی در MySQL (جدول IeltsAiPaper)
//
// 🔑 صرفه‌جویی توکن: هر آزمون (کتاب × تست × مهارت)
//    فقط «یک بار» ساخته می‌شود و برای همیشه در دیتابیس
//    ذخیره می‌ماند — بازدیدهای بعدی فوراً از کش خوانده
//    می‌شوند. قفل درون‌پردازشی + قفل دیتابیسی (ردیف
//    GENERATING) جلوی ساختِ موازی و دوباره‌کاری را می‌گیرد.
//
// 🌐 سرویس CodeCraft پشت Cloudflare است — تماس با «زنجیرهٔ
//    استراتژی» انجام می‌شود: fetch بدون UA → fetch با UA
//    مرورگر → curl با UA مرورگر (از Node خالص گاهی بلاک
//    می‌شود؛ curl تقریباً همه‌جا در دسترس است).
//
// 📐 برش صفحات تست «مقاوم» است: کتاب‌های قدیمی کمبریج
//    هدر جاری «Test N» روی همهٔ صفحات دارند و فهرست کتاب
//    هم «Test 1..4» را یکجا لیست می‌کند — الگوریتم صفحاتِ
//    فهرست را کنار می‌گذارد و مرز واقعی تست‌ها را پیدا می‌کند.
//
// این ماژول فقط سمت سرور استفاده می‌شود.
// ========================================

import { spawn } from "node:child_process";
import { prisma } from "@/prisma/Prisma client";
import { getBookPages } from "@/lib/ielts/pdf-text";
import { locateTests } from "@/lib/ielts/paper-parser";
import type { IeltsExamPaper, IeltsSkill } from "@/types/ielts";

// ---------- تنظیمات سرویس (env) ----------

const CC_API_KEY = (process.env.CODECRAFT_API_KEY ?? "").trim();
const CC_BASE_URL = (process.env.CODECRAFT_BASE_URL ?? "https://codecraftapi.com/v1").replace(/\/+$/, "");
const CC_MODEL = process.env.CODECRAFT_MODEL ?? "claude-opus-4.8";
const CC_MAX_TOKENS = Number(process.env.CODECRAFT_MAX_TOKENS ?? 24000);

/**
 * UA سفارشی (اختیاری):
 *   تعریف‌نشده → زنجیرهٔ خودکار (پیش‌فرض)
 *   ""          → بدون User-Agent
 *   "Mozilla…"  → این UA برای fetch و curl
 */
const CC_CUSTOM_UA = process.env.CODECRAFT_USER_AGENT;

/** زمان مجاز هر تماس AI — تولید برگهٔ کامل طول می‌کشد */
const REQUEST_TIMEOUT_MS = 8 * 60 * 1000;
/** ردیف GENERATING قدیمی‌تر از این مدت = فرایند مرده → قابل ادامه‌ دادن */
const STALE_MS = 10 * 60 * 1000;
/** سقف متن ورودی (کاراکتر) که به AI فرستاده می‌شود */
const MAX_INPUT_CHARS = 150_000;

/** برای curl — fetch خود Node با UA مرورگر توسط Cloudflare چالش می‌گیرد */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// ---------- انواع خام پاسخ AI ----------

type RawOption = { letter?: unknown; text?: unknown };
type RawQuestion = {
  number?: unknown;
  text?: unknown;
  options?: unknown;
  inlineGap?: unknown;
};
type RawSection = {
  title?: unknown;
  questionRange?: unknown;
  instruction?: unknown;
  optionsBox?: unknown;
  passageTitle?: unknown;
  passageBody?: unknown;
  questions?: unknown;
};
type RawWriting = { task?: unknown; prompt?: unknown; minWords?: unknown };
type RawAiPaper = {
  sections?: unknown;
  writing?: unknown;
  totalQuestions?: unknown;
  answerKey?: unknown;
};

// ---------- خطای اعتبارسنجی (برای تلاش مجدد هدفمند) ----------

class AiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiValidationError";
  }
}

// ---------- ابزار ----------

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** slug یکتای برگهٔ AI — «cambridge-01-t1-listening» */
export function aiPaperSlug(bookNumber: number, testNumber: number, skill: IeltsSkill): string {
  return `cambridge-${pad2(bookNumber)}-t${testNumber}-${skill}`;
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: unknown }).code === "P2002"
  );
}

function asString(v: unknown, max = 4000): string {
  if (typeof v !== "string") return "";
  return v.replace(/\u0000/g, "").trim().slice(0, max);
}

// ---------- برش صفحات تست از PDF (مقاوم) ----------

const RE_TEST_HEADING_LINE = /^\s*(?:practice\s+)?test\s+(\d)\b/i;
/** «Answer key» / «Answer keys» / «Answers» — به‌تنهایی در خط (بدون شمارهٔ صفحه) */
const RE_ANSWER_KEY_LINE = /^\s*(?:answer\s*keys?|answers?)\s*:?\s*$/i;
/** «Tapescripts» / «Transcripts» در ابتدای خط */
const RE_TAPESCRIPT_LINE = /^\s*(?:tapes?cripts?|transcripts?)\b/i;
/** بخش ماژول General Training (کتاب‌های ۱ و ۲) */
const RE_GENERAL_TRAINING_LINE = /^\s*general\s+training\b/i;

export type TestSlice = {
  /** متن کامل همان تست (همهٔ مهارت‌ها — برای زمینه) */
  testText: string;
  /** متن صفحات پاسخ‌نامهٔ رسمی کتاب (ممکن است خالی باشد) */
  keyText: string;
  testPageCount: number;
  keyPageCount: number;
};

function joinPages(pages: string[], from: number, to: number): string {
  const chunks: string[] = [];
  for (let i = from; i < to && i < pages.length; i++) {
    const t = (pages[i] ?? "").trim();
    if (t) chunks.push(t);
  }
  return chunks.join("\n\n");
}

/**
 * مکان‌یابی مقاوم تست‌ها (دو-پاسه):
 *
 *  پاس ۱: همهٔ خطوط «Test N» + شماره‌های هر صفحه جمع می‌شود.
 *  پاس ۲:
 *   - صفحهٔ فهرست (TOC) = صفحه‌ای با ≥۳ شمارهٔ تست مختلف → کنار
 *     (خط «Tapescripts 107» و «Answer keys 130» همین‌جا هستند!)
 *   - شروع واقعی هر تست = اولین صفحهٔ آن تست «بعد از» شروع تست
 *     قبلی (کتاب‌های قدیمی «Test N» را روی همهٔ صفحات تکرار می‌کنند)
 *   - مرز پایان تست‌ها = اولین بخش Tapescripts / Answer key /
 *     General Training که بعد از ≥۳ تستِ واقعی بیاید
 *   - پاسخ‌نامه = بخش «Answer key(s)» — در کتاب‌های قدیمی بعد از
 *     tapescripts و در کتاب‌های جدید قبل از آن است؛ هر دو پشتیبانی می‌شود
 */
function locateTestsRobust(pages: string[]): {
  testPages: Record<number, number>;
  keyStart: number | null;
  answerKeyStart: number | null;
} {
  // ---------- پاس ۱: جمع‌آوری ----------
  const hits: Record<number, number[]> = {};
  const numbersPerPage: Record<number, Set<number>> = {};
  const keyLinePerPage: Record<number, "answer" | "tape" | null> = {};
  const gtPerPage: Record<number, boolean> = {};

  for (let i = 0; i < pages.length; i++) {
    let keyKind: "answer" | "tape" | null = null;
    let gt = false;
    for (const line of pages[i].split("\n")) {
      const t = line.trim();
      if (RE_ANSWER_KEY_LINE.test(t) && keyKind === null) keyKind = "answer";
      if (RE_TAPESCRIPT_LINE.test(t) && keyKind === null) keyKind = "tape";
      if (RE_GENERAL_TRAINING_LINE.test(t)) gt = true;
      const m = t.match(RE_TEST_HEADING_LINE);
      if (m) {
        const n = Number(m[1]);
        if (n >= 1 && n <= 4) {
          (hits[n] ??= []).push(i);
          (numbersPerPage[i] ??= new Set()).add(n);
        }
      }
    }
    keyLinePerPage[i] = keyKind;
    gtPerPage[i] = gt;
  }

  // صفحات فهرست (TOC) — چند شمارهٔ تست یکجا (+ خطوط Tapescripts/Answer با شمارهٔ صفحه)
  const tocPages = new Set<number>();
  for (const [p, nums] of Object.entries(numbersPerPage)) {
    if (nums.size >= 3) tocPages.add(Number(p));
  }

  // ---------- پاس ۲: مرزها ----------
  const seenReal = new Set<number>();
  let boundaryStart: number | null = null; // پایان تست‌ها (tapescripts/keys/GT)
  let answerKeyStart: number | null = null; // شروع پاسخ‌نامه

  for (let i = 0; i < pages.length; i++) {
    if (!tocPages.has(i)) {
      for (const n of numbersPerPage[i] ?? []) seenReal.add(n);
    }
    // مرز فقط بعد از دیدن ≥۳ تستِ واقعی معتبر است
    if (seenReal.size >= 3 && !tocPages.has(i)) {
      if (boundaryStart === null && (keyLinePerPage[i] !== null || gtPerPage[i])) {
        boundaryStart = i;
      }
      if (answerKeyStart === null && keyLinePerPage[i] === "answer") {
        answerKeyStart = i;
      }
    }
  }

  // ---------- انتخاب شروع تست‌ها ----------
  const testPages: Record<number, number> = {};
  let prevStart = -1;
  for (let n = 1; n <= 4; n++) {
    const list = (hits[n] ?? []).filter(
      (p) => !tocPages.has(p) && (boundaryStart == null || p < boundaryStart),
    );
    let start: number | undefined = list.find((p) => p > prevStart);
    if (start === undefined) start = list[0];
    if (start !== undefined) {
      testPages[n] = start;
      prevStart = start;
    }
  }

  // شبکهٔ ایمنی: هیچ تستی پیدا نشد → پارسر اصلی
  if (Object.keys(testPages).length === 0) {
    const fallback = locateTests(pages);
    return { testPages: fallback.testPages, keyStart: fallback.keyStart, answerKeyStart: null };
  }
  return { testPages, keyStart: boundaryStart, answerKeyStart };
}

/**
 * صفحات PDF را به «متن تست N» + «متن پاسخ‌نامه» برش می‌زند.
 */
export function sliceTestPages(pages: string[], testNumber: number): TestSlice | null {
  const { testPages, keyStart, answerKeyStart } = locateTestsRobust(pages);
  const start = testPages[testNumber];
  if (start == null) return null;

  const nextTest = testPages[testNumber + 1];
  const candidates = [nextTest, keyStart, answerKeyStart].filter(
    (x): x is number => x != null && x > start,
  );
  const end = candidates.length > 0 ? Math.min(...candidates) : pages.length;
  const testEnd = Math.max(start + 1, Math.min(end, pages.length));
  const testText = joinPages(pages, start, testEnd).slice(0, MAX_INPUT_CHARS);

  // پاسخ‌نامه: بخش «Answer key(s)» ارجح است (کتاب‌های قدیمی بعد از tapescripts است)
  let keyFrom: number | null = answerKeyStart;
  if (keyFrom == null || keyFrom >= pages.length) keyFrom = keyStart;
  let keyText = "";
  let keyPageCount = 0;
  if (keyFrom != null && keyFrom < pages.length) {
    const keyEnd = Math.min(keyFrom + 12, pages.length);
    keyText = joinPages(pages, keyFrom, keyEnd).slice(0, MAX_INPUT_CHARS);
    keyPageCount = keyEnd - keyFrom;
  }

  return {
    testText,
    keyText,
    testPageCount: testEnd - start,
    keyPageCount,
  };
}

// ---------- ساخت پرامپت ----------

function skillEnglishName(skill: IeltsSkill): string {
  return skill === "reading" ? "READING" : skill === "listening" ? "LISTENING" : "WRITING";
}

/** پرامپت سیستم — قرارداد خروجی JSON دقیق */
export function systemPrompt(skill: IeltsSkill): string {
  const listeningRules =
    skill === "listening"
      ? `- The Listening paper has 4 parts (PART/SECTION 1..4), each with 10 questions.
- For each part transcribe the official rubric printed above the questions into "instruction" (e.g. "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.").
- Form/note/table questions: transcribe the surrounding text and put {GAP} where each numbered blank belongs.
- If a table's row labels exist, include them in the question text before the {GAP}.`
      : "";

  const readingRules =
    skill === "reading"
      ? `- The Reading paper has 3 passages. Make one section per passage with "title" like "Reading Passage 1", the passage heading inside "passageTitle", and the FULL passage text inside "passageBody" (cleaned, keep paragraph breaks as \\n\\n). Do NOT truncate the passage.
- Question types: multiple choice, TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, matching headings, matching information ("Which paragraph contains the following information?"), sentence completion, summary completion, matching features.
- For "Which paragraph contains…" groups: attach options A..E to every question (letter = paragraph letter, text = the first ~8 words of that paragraph) so the student can click. The answer key value is the paragraph letter.
- For summary/completion tasks with a word bank box, treat the box as an options box.`
      : "";

  const writingRules =
    skill === "writing"
      ? `- "writing" must contain exactly 2 tasks: task 1 (minWords 150) and task 2 (minWords 250).
- Transcribe each official task prompt COMPLETELY: the "You should spend about 20/40 minutes on this task" line is optional, but the task description, all bullet notes, and any table/chart data printed in the text MUST be included (transcribe table rows as text lines).
- "sections" must be an empty array for writing, "totalQuestions" must be null, "answerKey" must be null.`
      : "";

  const answerKeyRules =
    skill === "writing"
      ? ""
      : `- "answerKey": read the test's key from <ANSWER_KEY_TEXT>. Keys are plain question numbers as strings ("1".."40"). Each value is an array of EVERY acceptable variant the official key lists (alternatives, "(in) about" style options, and for two-blank questions also the reversed order, e.g. ["coal, firewood", "firewood, coal"]).
- For choice/matching/TRUE-FALSE questions the key value is the letter, e.g. ["B"].
- If <ANSWER_KEY_TEXT> is empty or the key for this test is not there, set "answerKey": null.`;

  return `You are "Flex English Exam Builder" — a meticulous IELTS exam transcription engine.
You convert raw text extracted from a Cambridge IELTS practice book PDF into ONE structured JSON exam paper.

You receive:
1. <TEST_TEXT> — raw text of ONE complete practice test (all skills). Extraction artifacts are normal: broken line breaks, hyphenation, page numbers, running headers that repeat "Test N" on every page, dotted answer gaps shown as "....." or "____".
2. <ANSWER_KEY_TEXT> — the book's official Answer key pages (may be empty).

Transcribe ONLY the ${skillEnglishName(skill)} paper of this test into ONE valid JSON object with EXACTLY this shape (no extra keys):

{
  "sections": [
    {
      "title": "PART 1",
      "questionRange": "Questions 1-10",
      "instruction": "official rubric printed above the question group",
      "optionsBox": [ { "letter": "A", "text": "..." } ],
      "passageTitle": "Passage heading (reading only)",
      "passageBody": "Full passage text (reading only)",
      "questions": [
        { "number": 1, "text": "The tour starts at {GAP} .", "inlineGap": true, "options": null }
      ]
    }
  ],
  "writing": null,
  "totalQuestions": 40,
  "answerKey": { "1": ["9 am", "9.00 am"], "2": ["B"] }
}

RULES:
1. FIDELITY — copy question texts, options, instructions and passages from the source. Never invent, paraphrase, translate or shorten content. Only repair obvious extraction artifacts (rejoin hyphenated line breaks, drop page numbers, repeated running headers and running titles).
2. NUMBERING — every question 1..40 must appear exactly once, ascending, grouped into sections as printed in the book. ${skill === "writing" ? "For writing use an empty sections array." : ""}
3. GAPS — replace each dotted/underscored blank with the literal token {GAP} surrounded by single spaces. If one question has several blanks, merge them into ONE {GAP}; the official key's combined answer covers it.
4. inlineGap — true if and only if the question text contains {GAP}.
5. CHOICES — multiple-choice questions get "options": [{ "letter": "A", "text": "..." }, ...] attached to EACH question of the group (the same array on every question). The answer is the letter.
6. TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN groups — attach options A/B/C with texts "TRUE","FALSE","NOT GIVEN" (or "YES","NO","NOT GIVEN"); the key value is the letter.
7. BOXED/MATCHING groups (box of headings, endings, speakers, viewpoints…) — assign letters A,B,C,… to the box items in printed order, put the box into the section's "optionsBox", attach the same options array to every question of the group, and give key letters. For "Which paragraph contains…" see the reading rules below.
${listeningRules}
${readingRules}
${writingRules}
${answerKeyRules}
8. OUTPUT — respond with the JSON object ONLY. No markdown fences, no comments, no explanation before or after. Escape all quotes inside strings. The JSON must parse with JSON.parse directly.`;
}

/** پیام کاربر — متن PDF + پاسخ‌نامه */
export function buildUserMessage(
  bookNumber: number,
  testNumber: number,
  skill: IeltsSkill,
  testText: string,
  keyText: string,
): string {
  return `Cambridge IELTS Book ${bookNumber} — Test ${testNumber} — extract the ${skillEnglishName(skill)} paper.

<TEST_TEXT>
${testText || "(test text is empty)"}
</TEST_TEXT>

<ANSWER_KEY_TEXT>
${keyText || "(answer key pages were not found in this book's PDF — set answerKey to null)"}
</ANSWER_KEY_TEXT>`;
}

// ---------- تماس با CodeCraft (زنجیرهٔ استراتژی) ----------

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CodeCraftResult = { content: string; finishReason: string | null };

type HttpResult = { status: number; body: string };

/** آیا پاسخ، صفحهٔ چالش Cloudflare است؟ */
function isCloudflareChallenge(body: string): boolean {
  const t = body.trimStart().slice(0, 400).toLowerCase();
  return (
    t.includes("just a moment") ||
    t.includes("challenges.cloudflare.com") ||
    t.includes("attention required") ||
    (t.startsWith("<!doctype html") && !t.includes("{"))
  );
}

/** نتیجهٔ یک تماس chat — موفق (محتوای انباشته) یا ناموفق (کد + بدنه) */
type ChatHttpResult =
  | { ok: true; content: string; finishReason: string | null }
  | { ok: false; status: number; body: string };

/** خواندن کامل بدنهٔ پاسخ fetch به‌صورت جریانی */
async function readFetchBody(res: Response): Promise<string> {
  if (!res.body) return await res.text();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out;
}

/**
 * تفسیر متن پاسخ chat — هم SSE (استریم) هم JSON معمولی.
 * استریم ضروری است: بدون آن Cloudflare بعد از ~۱۰۰ ثانیه
 * خطای 524 می‌دهد؛ با استریم توکن‌ها جریان دارند و اتصال زنده می‌ماند.
 */
function parseChatResponseText(text: string): ChatHttpResult {
  const t = text.trimStart();
  // ---------- JSON معمولی (سرویس استریم را نپذیرفت) ----------
  if (t.startsWith("{")) {
    try {
      const data = JSON.parse(t) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      };
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) {
        return {
          ok: true,
          content,
          finishReason: data?.choices?.[0]?.finish_reason ?? null,
        };
      }
    } catch {
      /* بدنهٔ 200 غیرمنتظره */
    }
    return { ok: false, status: 200, body: t.slice(0, 500) };
  }
  // ---------- SSE: data: {...} خط به خط ----------
  let content = "";
  let finishReason: string | null = null;
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (!l.startsWith("data:")) continue;
    const dataStr = l.slice(5).trim();
    if (!dataStr || dataStr === "[DONE]") continue;
    try {
      const chunk = JSON.parse(dataStr) as {
        choices?: {
          delta?: { content?: string };
          message?: { content?: string };
          finish_reason?: string | null;
        }[];
      };
      const c = chunk.choices?.[0];
      if (typeof c?.delta?.content === "string") content += c.delta.content;
      else if (typeof c?.message?.content === "string" && !content) content += c.message.content;
      if (c?.finish_reason) finishReason = c.finish_reason;
    } catch {
      /* خط خراب SSE — رد می‌شود */
    }
  }
  if (content.trim()) return { ok: true, content, finishReason };
  return { ok: false, status: 200, body: text.slice(0, 500) };
}

/** تماس استریمی با fetch */
async function chatViaFetch(
  url: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<ChatHttpResult> {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...payload, stream: true }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (res.status !== 200) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  const text = await readFetchBody(res);
  return parseChatResponseText(text);
}

/** تماس استریمی با curl سیستم — مطمئن‌ترین راه رد شدن از Cloudflare */
function chatViaCurl(
  url: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<ChatHttpResult> {
  return new Promise<ChatHttpResult>((resolve, reject) => {
    const args: string[] = [
      "-s",
      "-S",
      "-N", // بدون بافر — استریم
      "--max-time",
      String(Math.ceil(timeoutMs / 1000)),
      "-X",
      "POST",
      "-w",
      "\n__CC_STATUS__%{http_code}",
    ];
    for (const [k, v] of Object.entries(headers)) args.push("-H", `${k}: ${v}`);
    args.push("--data-binary", "@-", url);

    // curl در ویندوز (System32)، لینوکس و مک موجود است
    const child = spawn("curl", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs + 5000);

    child.stdout.on("data", (d: Buffer) => {
      out += d.toString("utf8");
    });
    child.stderr.on("data", (d: Buffer) => {
      err += d.toString("utf8");
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e); // curl پیدا نشد
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const idx = out.lastIndexOf("__CC_STATUS__");
      if (idx === -1) {
        reject(new Error(`curl exited ${code}${err ? `: ${err.slice(0, 200)}` : ""}`));
        return;
      }
      const status = Number(out.slice(idx + "__CC_STATUS__".length).trim());
      const body = out.slice(0, idx);
      if (status !== 200) {
        resolve({ ok: false, status: Number.isFinite(status) ? status : 0, body });
        return;
      }
      resolve(parseChatResponseText(body));
    });
    child.stdin.on("error", () => {
      /* ignore */
    });
    child.stdin.end(JSON.stringify({ ...payload, stream: true }));
  });
}

/**
 * یک تماس chat/completions با سرویس CodeCraft.
 *
 * سرویس پشت Cloudflare است و دو مشکل دارد:
 *  ۱) بسته به پلتفرم/شبکه، fetch خالصِ Node ممکن است چالش بگیرد
 *     → زنجیرهٔ استراتژی: fetch بدون UA → fetch با UA مرورگر → curl
 *  ۲) تولید برگهٔ کامل بیش از ۱۰۰ ثانیه طول می‌کشد → Cloudflare
 *     پاسخ غیر استریم را با 524 می‌بُرد → همیشه stream: true
 * (با CODECRAFT_USER_AGENT می‌توان UA را دستی قفل کرد)
 */
export async function callCodeCraft(
  messages: ChatMessage[],
  maxTokens = CC_MAX_TOKENS,
): Promise<CodeCraftResult> {
  if (!CC_API_KEY) throw new Error("کلید سرویس AI (CODECRAFT_API_KEY) تنظیم نشده است");

  const url = `${CC_BASE_URL}/chat/completions`;
  const payload: Record<string, unknown> = {
    model: CC_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature: 0,
  };
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${CC_API_KEY}`,
  };

  const attempts: (() => Promise<ChatHttpResult>)[] = [];
  if (CC_CUSTOM_UA === undefined) {
    attempts.push(() => chatViaFetch(url, { ...baseHeaders }, payload, REQUEST_TIMEOUT_MS));
    attempts.push(() =>
      chatViaFetch(url, { ...baseHeaders, "User-Agent": BROWSER_UA }, payload, REQUEST_TIMEOUT_MS),
    );
    attempts.push(() =>
      chatViaCurl(url, { ...baseHeaders, "User-Agent": BROWSER_UA }, payload, REQUEST_TIMEOUT_MS),
    );
  } else if (CC_CUSTOM_UA === "") {
    attempts.push(() => chatViaFetch(url, { ...baseHeaders }, payload, REQUEST_TIMEOUT_MS));
  } else {
    attempts.push(() =>
      chatViaFetch(url, { ...baseHeaders, "User-Agent": CC_CUSTOM_UA }, payload, REQUEST_TIMEOUT_MS),
    );
    attempts.push(() =>
      chatViaCurl(url, { ...baseHeaders, "User-Agent": CC_CUSTOM_UA }, payload, REQUEST_TIMEOUT_MS),
    );
  }

  let sawChallenge = false;
  let lastNetworkError: string | null = null;

  for (const attempt of attempts) {
    let r: ChatHttpResult;
    try {
      r = await attempt();
    } catch (e) {
      lastNetworkError = e instanceof Error ? e.message : String(e);
      continue; // این استراتژی ناموفق → بعدی
    }

    if (r.ok) {
      return { content: r.content, finishReason: r.finishReason };
    }
    if (r.status === 401) {
      throw new Error("کلید سرویس CodeCraft معتبر نیست — CODECRAFT_API_KEY را بررسی کنید");
    }
    if (r.status === 403) {
      if (isCloudflareChallenge(r.body)) {
        sawChallenge = true;
        continue; // چالش Cloudflare → استراتژی بعدی
      }
      throw new Error("دسترسی به سرویس CodeCraft ممنوع شد (403)");
    }
    if (r.status === 429) {
      throw new Error("سرویس CodeCraft شلوغ است — کمی بعد دوباره تلاش کنید");
    }
    if (r.status === 524) {
      throw new Error(
        "پاسخ سرویس بیش از حد طول کشید (تایم‌اوت Cloudflare) — دوباره تلاش کنید",
      );
    }
    if (r.status === 200) {
      continue; // بدنهٔ 200 غیرقابل تفسیر → استراتژی بعدی
    }
    throw new Error(`سرویس CodeCraft پاسخ ${r.status} داد`);
  }

  if (sawChallenge) {
    throw new Error(
      "دسترسی به سرویس CodeCraft توسط Cloudflare بلاک شد — CODECRAFT_USER_AGENT را در .env تنظیم کنید (یا شبکهٔ سرور را بررسی کنید)",
    );
  }
  throw new Error(
    `ارتباط با سرویس CodeCraft برقرار نشد${lastNetworkError ? ` — ${lastNetworkError.slice(0, 200)}` : ""}`,
  );
}

/** استخراج اولین آبجکت JSON از متن پاسخ (حذف code fence احتمالی) */
export function extractJsonObject(content: string): unknown {
  const cleaned = content.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new AiValidationError("JSON object not found in the AI response");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new AiValidationError(`AI response is not valid JSON: ${detail}`);
  }
}

// ---------- اعتبارسنجی و نرمال‌سازی ----------

function normalizeOptions(v: unknown): { letter: string; text: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { letter: string; text: string }[] = [];
  for (const item of v.slice(0, 10)) {
    if (typeof item !== "object" || item === null) continue;
    const rec = item as RawOption;
    const letter = asString(rec.letter, 3).toUpperCase().replace(/[^A-Z]/g, "");
    const text = asString(rec.text, 300);
    if (letter && text) out.push({ letter, text });
  }
  return out.slice(0, 8);
}

function normalizeQuestions(
  v: unknown,
  seen: Set<number>,
): {
  number: number;
  text: string;
  options?: { letter: string; text: string }[];
  inlineGap: boolean;
}[] {
  if (!Array.isArray(v)) return [];
  const out: {
    number: number;
    text: string;
    options?: { letter: string; text: string }[];
    inlineGap: boolean;
  }[] = [];

  for (const item of v) {
    if (typeof item !== "object" || item === null) continue;
    const q = item as RawQuestion;
    const n = Number(q.number);
    if (!Number.isInteger(n) || n < 1 || n > 40) continue;
    if (seen.has(n)) continue;
    seen.add(n);

    let text = asString(q.text, 4000);
    // نشانه‌گذاری فاصله‌ها → {GAP} استاندارد
    text = text
      .replace(/\.{4,}/g, " {GAP} ")
      .replace(/…+/g, " {GAP} ")
      .replace(/_{3,}/g, " {GAP} ")
      .replace(/\s+/g, " ")
      .trim();

    let options = normalizeOptions(q.options);
    if (options.length < 2) options = [];
    const inlineGap = text.includes("{GAP}");
    // سوال بدون متن و بدون گزینه بی‌فایده است
    if (!text && options.length === 0) continue;

    out.push({
      number: n,
      text,
      ...(options.length >= 2 ? { options } : {}),
      inlineGap,
    });
  }
  return out;
}

export type NormalizedAiPaper = {
  paper: IeltsExamPaper;
  /** کلید پاسخ با پیشوند r/l — یا null */
  key: Record<string, string[]> | null;
  /** شماره سوال‌های غایب در کلید (برای تعمیر) */
  keyMissing: number[];
};

/**
 * پاسخ خام AI → IeltsExamPaper معتبر + کلید پاسخ.
 * خطاها AiValidationError هستند و پیامشان برای تلاش مجدد استفاده می‌شود.
 */
export function normalizeAiPaper(
  raw: unknown,
  skill: IeltsSkill,
  testNumber: number,
): NormalizedAiPaper {
  if (typeof raw !== "object" || raw === null) {
    throw new AiValidationError("AI response root is not an object");
  }
  const rec = raw as RawAiPaper;

  // ---------- writing ----------
  if (skill === "writing") {
    const writing: { task: 1 | 2; prompt: string; minWords: number }[] = [];
    if (Array.isArray(rec.writing)) {
      for (const item of rec.writing.slice(0, 2)) {
        if (typeof item !== "object" || item === null) continue;
        const w = item as RawWriting;
        const taskNum = Number(w.task);
        const task: 1 | 2 = taskNum === 1 ? 1 : 2;
        const prompt = asString(w.prompt, 8000);
        if (prompt.length < 60) continue;
        const mw = Number(w.minWords);
        const minWords = task === 1 ? 150 : 250;
        writing.push({
          task,
          prompt,
          minWords: Number.isInteger(mw) && mw >= 50 && mw <= 400 ? mw : minWords,
        });
      }
    }
    // هر دو تسک باید باشد
    const has1 = writing.some((w) => w.task === 1);
    const has2 = writing.some((w) => w.task === 2);
    if (!has1 || !has2) {
      throw new AiValidationError(
        `writing tasks incomplete (task1: ${has1}, task2: ${has2}) — both tasks are required`,
      );
    }
    const paper: IeltsExamPaper = {
      ok: true,
      skill,
      testNumber,
      sections: [],
      writing,
      totalQuestions: 2,
    };
    return { paper, key: null, keyMissing: [] };
  }

  // ---------- reading / listening ----------
  if (!Array.isArray(rec.sections) || rec.sections.length === 0) {
    throw new AiValidationError("sections array is missing or empty");
  }

  const seen = new Set<number>();
  const sections: {
    title: string;
    questionRange: string | null;
    instruction: string;
    optionsBox?: { letter: string; text: string }[];
    passageTitle?: string;
    passageBody?: string;
    questions: {
      number: number;
      text: string;
      options?: { letter: string; text: string }[];
      inlineGap: boolean;
    }[];
  }[] = [];

  for (const item of rec.sections.slice(0, 8)) {
    if (typeof item !== "object" || item === null) continue;
    const s = item as RawSection;
    const questions = normalizeQuestions(s.questions, seen);
    if (questions.length === 0) continue;

    const title = asString(s.title, 120) || "Section";
    const questionRange = asString(s.questionRange, 60) || null;
    const instruction = asString(s.instruction, 1200);
    const optionsBox = normalizeOptions(s.optionsBox);
    const passageTitle = asString(s.passageTitle, 200) || undefined;
    const passageBody = asString(s.passageBody, 30000) || undefined;

    // اگر بخش باکس گزینه دارد و سوال‌ها گزینه ندارند → گزینه‌ها به سوال‌ها هم کپی می‌شود
    let questions2 = questions;
    if (optionsBox.length >= 2) {
      questions2 = questions.map((q) =>
        q.options && q.options.length >= 2 ? q : { ...q, options: optionsBox },
      );
    }

    sections.push({
      title,
      questionRange,
      instruction,
      ...(optionsBox.length >= 2 ? { optionsBox } : {}),
      ...(passageTitle ? { passageTitle } : {}),
      ...(passageBody ? { passageBody } : {}),
      questions: questions2,
    });
  }

  if (sections.length === 0) {
    throw new AiValidationError("no usable sections in the AI response");
  }

  // پوشش کامل ۱..۴۰ الزامی است
  const missing: number[] = [];
  for (let n = 1; n <= 40; n++) {
    if (!seen.has(n)) missing.push(n);
  }
  if (missing.length > 0) {
    throw new AiValidationError(
      `questions missing from the paper: ${missing.join(", ")} — all 40 questions are required`,
    );
  }

  const totalQuestions = 40;

  // ---------- کلید پاسخ ----------
  const prefix = skill === "reading" ? "r" : "l";
  const key: Record<string, string[]> = {};
  let keyMissing: number[] = [];
  if (rec.answerKey && typeof rec.answerKey === "object" && !Array.isArray(rec.answerKey)) {
    for (const [k, v] of Object.entries(rec.answerKey as Record<string, unknown>)) {
      // کلید ممکن است «3» یا «r3»/«l3» باشد
      const m = k.match(/^([rl]?)(\d{1,2})$/i);
      if (!m) continue;
      const n = Number(m[2]);
      if (!Number.isInteger(n) || n < 1 || n > 40) continue;

      const variants: string[] = [];
      const push = (x: unknown) => {
        if (typeof x === "string") {
          const t = x.trim().slice(0, 120);
          if (t) variants.push(t);
        }
      };
      if (Array.isArray(v)) v.slice(0, 8).forEach(push);
      else push(v);

      if (variants.length > 0) key[`${prefix}${n}`] = Array.from(new Set(variants)).slice(0, 6);
    }
    keyMissing = [];
    for (let n = 1; n <= 40; n++) {
      if (!key[`${prefix}${n}`]) keyMissing.push(n);
    }
  } else {
    keyMissing = Array.from({ length: 40 }, (_, i) => i + 1);
  }

  const paper: IeltsExamPaper = {
    ok: true,
    skill,
    testNumber,
    sections,
    totalQuestions,
  };

  return { paper, key: Object.keys(key).length > 0 ? key : null, keyMissing };
}

// ---------- تعمیر کلید ناقص (تماس کوچک و ارزان) ----------

/**
 * اگر کلید پاسخ ناقص درآمد، فقط شماره‌های غایب در یک تماس
 * کوچک از AI پرسیده می‌شود (خروجی چند صد توکن).
 */
export async function repairAnswerKey(
  bookNumber: number,
  testNumber: number,
  skill: "reading" | "listening",
  keyText: string,
  missing: number[],
): Promise<Record<string, string[]> | null> {
  const prefix = skill === "reading" ? "r" : "l";
  const system = `You read an official Cambridge IELTS answer key. Return ONLY a valid JSON object mapping question numbers to arrays of accepted answers, for the question numbers you are asked about. Include every variant the key lists (alternatives, reversed order for two-blank answers, letters for choice questions). No markdown fences, no commentary.`;
  const user = `Cambridge IELTS Book ${bookNumber} — Test ${testNumber} — ${skillEnglishName(skill)}.
From the answer key text below, extract the answers for EXACTLY these question numbers: ${missing.join(", ")}.

<ANSWER_KEY_TEXT>
${keyText.slice(0, MAX_INPUT_CHARS) || "(not available)"}
</ANSWER_KEY_TEXT>

Return the JSON object now (keys = plain numbers as strings).`;

  const res = await callCodeCraft(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    2000,
  );

  const raw = extractJsonObject(res.content);
  if (typeof raw !== "object" || raw === null) return null;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const m = k.match(/^(\d{1,2})$/);
    if (!m) continue;
    const n = Number(m[1]);
    if (!missing.includes(n)) continue;
    const variants: string[] = [];
    const push = (x: unknown) => {
      if (typeof x === "string") {
        const t = x.trim().slice(0, 120);
        if (t) variants.push(t);
      }
    };
    if (Array.isArray(v)) v.slice(0, 8).forEach(push);
    else push(v);
    if (variants.length > 0) out[`${prefix}${n}`] = Array.from(new Set(variants)).slice(0, 6);
  }
  return Object.keys(out).length > 0 ? out : null;
}

// ---------- تولید کامل یک برگه (با یک تلاش مجدد هدفمند) ----------

export type GenerateParams = {
  bookNumber: number;
  testNumber: number;
  skill: IeltsSkill;
  testText: string;
  keyText: string;
};

/**
 * تولید برگه با AI:
 *  ۱) تماس اصلی → اعتبارسنجی
 *  ۲) اگر اعتبارسنجی شکست → «یک» تلاش مجدد با پیام خطا (باندلِ توکن)
 *  ۳) اگر کلید ناقص بود → تماس تعمیر کوچک
 */
export async function generateAiPaper(params: GenerateParams): Promise<NormalizedAiPaper> {
  const { bookNumber, testNumber, skill, testText, keyText } = params;
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(skill) },
    {
      role: "user",
      content: buildUserMessage(bookNumber, testNumber, skill, testText, keyText),
    },
  ];

  // ---- تلاش ۱ ----
  const first = await callCodeCraft(messages);
  if (first.finishReason === "length") {
    throw new Error(
      "خروجی AI ناقص بود (سقف توکن) — CODECRAFT_MAX_TOKENS را در .env افزایش دهید",
    );
  }

  let normalized: NormalizedAiPaper;
  try {
    normalized = normalizeAiPaper(extractJsonObject(first.content), skill, testNumber);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "the JSON did not match the contract";
    // ---- تلاش ۲: اصلاح همان مکالمه ----
    const second = await callCodeCraft([
      ...messages,
      { role: "assistant", content: first.content.slice(0, 4000) },
      {
        role: "user",
        content: `Your previous answer was rejected: ${errMsg}. Return the COMPLETE corrected JSON object now — same contract, all 40 questions exactly once, nothing else.`,
      },
    ]);
    if (second.finishReason === "length") {
      throw new Error(
        "خروجی AI ناقص بود (سقف توکن) — CODECRAFT_MAX_TOKENS را در .env افزایش دهید",
      );
    }
    try {
      normalized = normalizeAiPaper(extractJsonObject(second.content), skill, testNumber);
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2);
      throw new Error(`AI نتوانست برگهٔ معتبر بسازد — ${msg}`);
    }
  }

  // ---- تعمیر کلید ناقص ----
  if (
    skill !== "writing" &&
    normalized.key &&
    normalized.keyMissing.length > 0 &&
    normalized.keyMissing.length <= 12 &&
    keyText
  ) {
    try {
      const repaired = await repairAnswerKey(
        bookNumber,
        testNumber,
        skill,
        keyText,
        normalized.keyMissing,
      );
      if (repaired) {
        const merged: Record<string, string[]> = { ...(normalized.key ?? {}) };
        for (const [k, v] of Object.entries(repaired)) {
          if (!merged[k]) merged[k] = v;
        }
        normalized.key = merged;
        normalized.keyMissing = normalized.keyMissing.filter(
          (n) => !merged[`${skill === "reading" ? "r" : "l"}${n}`],
        );
      }
    } catch {
      /* تعمیر کلید اختیاری است — برگه بدون کلید کامل هم معتبر است */
    }
  }

  // کلید خیلی ناقص → اصلاً کلید نداریم (خودتصحیحی)
  if (normalized.key) {
    const filled = Object.keys(normalized.key).length;
    if (filled < 30) normalized.key = null;
  }

  return normalized;
}

// ---------- کش DB + قفل تولید ----------

export type AiPaperState =
  | { status: "READY"; paper: IeltsExamPaper; key: Record<string, string[]> | null }
  | { status: "GENERATING" }
  | { status: "FAILED"; error: string }
  | { status: "STARTED"; run: () => Promise<void> };

/** آیا سرویس AI پیکربندی شده است؟ */
export function isAiExamConfigured(): boolean {
  return CC_API_KEY.length > 0;
}

/** قفل درون‌پردازشی — جلوگیری از تولید موازی همان slug */
const running = new Map<string, Promise<void>>();
/** کش حافظهٔ برگه‌های READY (بعد از restart از DB خوانده می‌شود) */
const readyCache = new Map<
  string,
  { paper: IeltsExamPaper; key: Record<string, string[]> | null }
>();

/**
 * وضعیت/تحصیل برگهٔ AI برای یک آزمون:
 *  - READY → از کش حافظه یا DB
 *  - GENERATING → فرایند دیگری در حال ساخت است (یا ردیف تازه)
 *  - STARTED → این درخواست باید run() را زمان‌بندی کند (after)
 *  - FAILED → ساخت قبلی شکست خورده (بدون retry خودکار — صرفه‌جویی توکن)
 */
export async function acquireAiPaper(
  bookNumber: number,
  testNumber: number,
  skill: IeltsSkill,
  force = false,
): Promise<AiPaperState> {
  if (!isAiExamConfigured()) {
    return { status: "FAILED", error: "سرویس AI پیکربندی نشده است (CODECRAFT_API_KEY)" };
  }
  const slug = aiPaperSlug(bookNumber, testNumber, skill);

  // کش حافظه
  if (!force) {
    const cached = readyCache.get(slug);
    if (cached) return { status: "READY", ...cached };
  }

  let row: {
    status: string;
    paperJson: string | null;
    keyJson: string | null;
    errorMessage: string | null;
    updatedAt: Date;
  } | null = null;
  try {
    row = await prisma.ieltsAiPaper.findUnique({ where: { slug } });
  } catch {
    return { status: "FAILED", error: "خطای دیتابیس در خواندن وضعیت برگهٔ AI" };
  }

  // بازتولید دستی (?refresh=1)
  if (force) {
    if (running.has(slug)) return { status: "GENERATING" };
    try {
      await prisma.ieltsAiPaper.upsert({
        where: { slug },
        create: { slug, bookNumber, testNumber, skill, status: "GENERATING" },
        update: {
          status: "GENERATING",
          paperJson: null,
          keyJson: null,
          errorMessage: null,
        },
      });
    } catch {
      return { status: "FAILED", error: "خطای دیتابیس در شروع بازتولید برگه" };
    }
    readyCache.delete(slug);
    return { status: "STARTED", run: () => runGeneration(slug, bookNumber, testNumber, skill) };
  }

  if (row) {
    // آماده → تحویل فوری
    if (row.status === "READY" && row.paperJson) {
      try {
        const paper = JSON.parse(row.paperJson) as IeltsExamPaper;
        const key = row.keyJson ? (JSON.parse(row.keyJson) as Record<string, string[]>) : null;
        readyCache.set(slug, { paper, key });
        return { status: "READY", paper, key };
      } catch {
        // JSON خراب → بازسازی (در مسیر STARTED ادامه می‌یابد)
      }
    } else if (row.status === "GENERATING") {
      const fresh = Date.now() - row.updatedAt.getTime() < STALE_MS;
      if (fresh) return { status: "GENERATING" };
      // فرایند مرده → همین‌جا ادامه می‌دهیم
      try {
        await prisma.ieltsAiPaper.update({
          where: { slug },
          data: { updatedAt: new Date() },
        });
        return {
          status: "STARTED",
          run: () => runGeneration(slug, bookNumber, testNumber, skill),
        };
      } catch {
        /* ادامه به مسیر شروع تازه */
      }
    } else if (row.status === "FAILED") {
      return {
        status: "FAILED",
        error: row.errorMessage ?? "ساخت برگه با هوش مصنوعی ناموفق بود",
      };
    }
  }

  // شروع تازه — رزرو ردیف (قفل بین‌پردازشی)
  try {
    await prisma.ieltsAiPaper.create({
      data: { slug, bookNumber, testNumber, skill, status: "GENERATING" },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { status: "GENERATING" };
    return { status: "FAILED", error: "خطای دیتابیس در رزرو ساخت برگه" };
  }
  return { status: "STARTED", run: () => runGeneration(slug, bookNumber, testNumber, skill) };
}

/** اجرای واقعی تولید — با قفل درون‌پردازشی */
async function runGeneration(
  slug: string,
  bookNumber: number,
  testNumber: number,
  skill: IeltsSkill,
): Promise<void> {
  const existing = running.get(slug);
  if (existing) return existing;

  const job = (async () => {
    try {
      // ۱) متن PDF کتاب (B2 یا پوشهٔ محلی — با کش خودش)
      const pagesResult = await getBookPages(bookNumber);
      if (!pagesResult.ok) throw new Error(pagesResult.error);

      // ۲) برش صفحات همین تست + پاسخ‌نامه
      const slice = sliceTestPages(pagesResult.pages, testNumber);
      if (!slice || !slice.testText) {
        throw new Error(`موقعیت Test ${testNumber} در PDF کتاب ${bookNumber} شناسایی نشد`);
      }

      // ۳) تولید با AI
      const normalized = await generateAiPaper({
        bookNumber,
        testNumber,
        skill,
        testText: slice.testText,
        keyText: slice.keyText,
      });

      // ۴) ذخیرهٔ دائمی
      await prisma.ieltsAiPaper.update({
        where: { slug },
        data: {
          status: "READY",
          paperJson: JSON.stringify(normalized.paper),
          keyJson: normalized.key ? JSON.stringify(normalized.key) : null,
          errorMessage: null,
          model: CC_MODEL,
          generatedAt: new Date(),
        },
      });
      readyCache.set(slug, { paper: normalized.paper, key: normalized.key });
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)).slice(0, 500);
      await prisma.ieltsAiPaper
        .update({ where: { slug }, data: { status: "FAILED", errorMessage: msg } })
        .catch(() => {
          /* حتی اگر آپدیت شکست خورد، خطا در کنسول هست */
        });
    }
  })().finally(() => {
    running.delete(slug);
  });

  running.set(slug, job);
  return job;
}

// ---------- کلید AI برای تصحیح خودکار ----------

/**
 * کلید پاسخِ AI برای یک مهارت — خروجی submit با اولویت
 * manual → ai → pdf از آن استفاده می‌کند.
 * کلیدهای کمتر از ۳۰ مدخل قابل اعتماد نیستند → null.
 */
export async function getAiAnswerKey(
  bookNumber: number,
  testNumber: number,
  skill: "reading" | "listening",
): Promise<Record<string, string[]> | null> {
  const slug = aiPaperSlug(bookNumber, testNumber, skill);
  const prefix = skill === "reading" ? "r" : "l";

  const cached = readyCache.get(slug);
  if (cached?.key) return cached.key;

  try {
    const row = await prisma.ieltsAiPaper.findUnique({ where: { slug } });
    if (row?.status !== "READY" || !row.keyJson) return null;
    const key = JSON.parse(row.keyJson) as Record<string, string[]>;
    if (!key || typeof key !== "object") return null;
    const filled = Object.keys(key).filter((k) => k.startsWith(prefix)).length;
    if (filled < 30) return null;
    return key;
  } catch {
    return null;
  }
}
