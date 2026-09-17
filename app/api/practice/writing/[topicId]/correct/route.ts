import { requireAuth, ok, err } from "@/lib/api-helpers";
import { WRITING_TOPICS } from "@/data/training/writing-topics";
import { NextRequest } from "next/server";
import type { WritingFeedback, WritingCorrection } from "@/types/training";

// اصلاح متن نوشتاری با هوش مصنوعی (VYCEAI)
// نسخه ۱.۰.۱.۴ — کلید را در .env با نام VYCEAI_API_KEY تنظیم کنید
// بدون کلید، سرویس 401 می‌دهد؛ اینجا پیام فارسی و کد 502 برمی‌گردانیم

const VYCEAI_URL = "https://vyceai.com/v1/chat/completions";
const VYCEAI_MODEL = "agnes-3.0-flash";
const TIMEOUT_MS = 60_000;

const MIN_WORDS = 30;
const MAX_WORDS = 200;

const SYSTEM_PROMPT = `You are a friendly English writing tutor for Persian (Farsi) speaking learners.
Evaluate the student's short text about the given topic.
Respond ONLY with a single valid JSON object — no markdown, no code fences, no extra words.
JSON shape (exactly these keys):
{
  "onTopic": boolean,
  "topicNote": "one short Persian sentence about how well the text matches the topic",
  "overallScore": 0-100 integer,
  "summary": "two or three Persian sentences summarizing the quality of the writing",
  "spellingErrors": [{"original": "the misspelled word", "correction": "correct spelling", "note": "very short Persian note"}],
  "grammarErrors": [{"original": "the wrong phrase", "correction": "correct phrase", "note": "very short Persian note"}],
  "goodPoints": ["short Persian sentences about strengths"],
  "suggestions": ["short Persian sentences with one clear improvement idea each"]
}
Rules:
- Every explanation, note, summary and suggestion MUST be written in Persian (Farsi).
- "original"/"correction" values stay in English (quotes from the text).
- spellingErrors: only real misspellings, max 8 items.
- grammarErrors: only real grammar mistakes, max 8 items. If the text is clean, use an empty array.
- goodPoints and suggestions: 2 to 4 items each.
- overallScore: be fair and encouraging, but honest. Score 0-100.`;

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asCorrections(v: unknown, type: "spelling" | "grammar"): WritingCorrection[] {
  if (!Array.isArray(v)) return [];
  const out: WritingCorrection[] = [];
  for (const item of v.slice(0, 8)) {
    if (typeof item !== "object" || item === null) continue;
    const rec = item as Record<string, unknown>;
    const original = asString(rec.original).trim();
    const correction = asString(rec.correction).trim();
    if (!original || !correction) continue;
    out.push({
      type,
      original,
      correction,
      note: asString(rec.note),
    });
  }
  return out;
}

function asStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .slice(0, 6);
}

/** استخراج و اعتبارسنجی JSON از پاسخ مدل — با تبدیل نرم نوع‌ها (coerce) */
function parseFeedback(content: string, wordCount: number): WritingFeedback | null {
  // حذف code fence احتمالی و گرفتن اولین { تا آخرین }
  const cleaned = content.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const rec = parsed as Record<string, unknown>;
  let score = Number(rec.overallScore);
  if (!Number.isFinite(score)) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    onTopic: Boolean(rec.onTopic),
    topicNote: asString(rec.topicNote),
    overallScore: score,
    summary: asString(rec.summary),
    wordCount,
    spellingErrors: asCorrections(rec.spellingErrors, "spelling"),
    grammarErrors: asCorrections(rec.grammarErrors, "grammar"),
    goodPoints: asStringList(rec.goodPoints),
    suggestions: asStringList(rec.suggestions),
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { topicId } = await params;
  const topic = WRITING_TOPICS.find((t) => t.id === topicId);
  if (!topic) return err("موضوع یافت نشد", 404);

  // متن دانشجو
  let body: { text?: unknown } | null = null;
  try {
    body = (await req.json()) as { text?: unknown };
  } catch {
    return err("درخواست نامعتبر است", 400);
  }

  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < MIN_WORDS) {
    return err(
      `متن خیلی کوتاه است — حداقل ${MIN_WORDS} کلمه بنویس (الان ${words.length} کلمه داری)`,
    );
  }
  if (words.length > MAX_WORDS) {
    return err(`متن نباید بیشتر از ${MAX_WORDS} کلمه باشد`);
  }

  // کلید سرویس
  const apiKey = process.env.VYCEAI_API_KEY;
  if (!apiKey) {
    return err(
      "کلید سرویس اصلاح متن تنظیم نشده است — VYCEAI_API_KEY را در فایل .env اضافه کنید",
      502,
    );
  }

  try {
    const res = await fetch(VYCEAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VYCEAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Topic: ${topic.titleEn} — ${topic.prompt}\n\nStudent's text:\n"""${text}"""`,
          },
        ],
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.status === 401 || res.status === 403) {
      return err("کلید سرویس معتبر نیست — مقدار VYCEAI_API_KEY را بررسی کنید", 502);
    }
    if (!res.ok) {
      return err("سرویس اصلاح متن در دسترس نیست — کمی بعد دوباره تلاش کنید", 502);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return err("پاسخی از سرویس اصلاح دریافت نشد", 502);
    }

    const feedback = parseFeedback(content, words.length);
    if (!feedback) {
      return err("پاسخ سرویس قابل خواندن نبود — دوباره تلاش کنید", 502);
    }

    return ok(feedback);
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return err("پاسخ سرویس بیش از حد طول کشید — دوباره تلاش کنید", 502);
    }
    return err("خطا در ارتباط با سرویس اصلاح متن", 502);
  }
}
