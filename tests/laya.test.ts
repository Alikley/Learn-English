import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// مدل Laya + تعیین سطح + پشتیبان چت (v1.0.8.0 / English 1.0.2.0)
//
//  - lib/laya.ts: خاموش بدون env · موفقیت/HTTP/تایم‌اوت/شبکه ·
//    circuit breaker ۶۰ثانیه‌ای · هدرهای کلید · کش وضعیت ۱۵ث
//  - lib/placement.ts: نمرهٔ ۸ سوال · آستانه‌های متن نوشتاری ·
//    ترکیب mc/laya · توصیه‌های دوره/کتاب
//  - lib/support-knowledge.ts: طبقه‌بندی موضوع → پاسخ curated ·
//    fallback کم‌اطمینانی/قطعی
//  - POST /api/placement و POST /api/support/chat و GET /api/ai-status
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("next-auth", () => {
  const fn = vi.fn();
  return { default: fn, getServerSession: fn };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const fetchMock = vi.fn(
  async (_url: string, _init?: RequestInit) =>
    ({
      ok: true,
      status: 200,
      json: async () => ({}),
    }) as unknown as Response,
);
vi.stubGlobal("fetch", fetchMock);

import {
  layaPredict,
  layaChoose,
  layaConfigured,
  layaStatus,
  resetLayaForTests,
} from "@/lib/laya";
import {
  evaluateMc,
  evaluateWriting,
  computePlacement,
  recommendFor,
} from "@/lib/placement";
import { supportReply, SUPPORT_INTENTS } from "@/lib/support-knowledge";
import { POST as placementPOST, GET as placementGET } from "@/app/api/placement/route";
import { POST as supportPOST } from "@/app/api/support/chat/route";
import { GET as aiStatusGET } from "@/app/api/ai-status/route";
import getServerSession from "next-auth";
import { NextRequest } from "next/server";
import { resetPlacementRows } from "./helpers/mock-prisma";

const USER_ID = "u-laya-1";

/** پاسخ موفق laya-serve برای یک سوال choice */
function choiceResponse(choice: string, confidence: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      answers: { q: { choice, confidence } },
    }),
  } as unknown as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(
    async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({}),
      }) as unknown as Response,
  );
  delete process.env.LAYA_BASE_URL;
  delete process.env.LAYA_API_KEY;
  delete process.env.LAYA_TIMEOUT_MS;
  delete process.env.REDIS_URL;
  delete process.env.VYCEAI_API_KEY;
  delete process.env.CODECRAFT_API_KEY;
  resetLayaForTests();
  resetPlacementRows();
  vi.mocked(getServerSession).mockReset();
});

afterEach(() => {
  delete process.env.LAYA_BASE_URL;
  delete process.env.LAYA_API_KEY;
  delete process.env.LAYA_TIMEOUT_MS;
  resetLayaForTests();
});

// ---------- lib/laya.ts ----------

describe("lib/laya — تنظیم نشده", () => {
  it("layaConfigured بدون env → false", () => {
    expect(layaConfigured()).toBe(false);
  });

  it("layaPredict بدون env → not-configured و هیچ تماسی زده نمی‌شود", async () => {
    const res = await layaPredict("hello", {
      q: { type: "noul", instructions: "Is this English?" },
    });
    expect(res).toEqual({ ok: false, reason: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("lib/laya — موفقیت", () => {
  it("پاسخ choice نرمال می‌شود و URL/هدر درست است", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    process.env.LAYA_API_KEY = "test-key-123";
    fetchMock.mockImplementation(async () => choiceResponse("billing", 0.94));

    const res = await layaChoose("refund please", "Which topic?", {
      billing: "refunds",
      other: "everything else",
    });
    expect(res).toEqual({ ok: true, choice: "billing", confidence: 0.94 });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://10.0.0.5:8000/v1/systemone");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-key-123");
    expect(headers["X-API-Key"]).toBe("test-key-123");
    const body = JSON.parse(init.body as string) as {
      state: string;
      questions: Record<string, unknown>;
    };
    expect(body.state).toBe("refund please");
    expect(body.questions.q).toEqual({
      type: "choice",
      instructions: "Which topic?",
      criteria: { billing: "refunds", other: "everything else" },
    });
  });

  it("نرمال‌سازی: اسلش آخر حذف می‌شود", async () => {
    process.env.LAYA_BASE_URL = "https://ai.example.ir/";
    fetchMock.mockImplementation(async () => choiceResponse("a", 1));
    await layaChoose("x", "y?", { a: "a", b: "b" });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ai.example.ir/v1/systemone");
  });

  it("بدون کلید: هیچ هدر احرازی فرستاده نمی‌شود", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("a", 1));
    await layaChoose("x", "y?", { a: "a" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });
});

describe("lib/laya — خطاها", () => {
  it("خطای HTTP (401) → reason=http و circuit باز نمی‌شود", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(
      async () => ({ ok: false, status: 401, json: async () => ({}) }) as unknown as Response,
    );
    const res = await layaChoose("x", "y?", { a: "a" });
    expect(res).toEqual({ ok: false, reason: "http" });

    fetchMock.mockImplementation(async () => choiceResponse("a", 1));
    const res2 = await layaChoose("x", "y?", { a: "a" });
    expect(res2).toEqual({ ok: true, choice: "a", confidence: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("پاسخ بدون answers → reason=empty", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(
      async () =>
        ({ ok: true, status: 200, json: async () => ({ answers: {} }) }) as unknown as Response,
    );
    const res = await layaChoose("x", "y?", { a: "a" });
    expect(res).toEqual({ ok: false, reason: "empty" });
  });

  it("تایم‌اوت → reason=timeout و circuit باز نمی‌شود", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    const timeoutError = new Error("timed out");
    timeoutError.name = "TimeoutError";
    fetchMock.mockImplementation(async () => {
      throw timeoutError;
    });
    const res = await layaChoose("x", "y?", { a: "a" });
    expect(res).toEqual({ ok: false, reason: "timeout" });

    fetchMock.mockImplementation(async () => choiceResponse("a", 1));
    const res2 = await layaChoose("x", "y?", { a: "a" });
    expect(res2).toEqual({ ok: true, choice: "a", confidence: 1 });
  });

  it("خطای شبکه → reason=network + circuit breaker ۶۰ ثانیه‌ای", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => {
      throw new TypeError("fetch failed");
    });
    const res = await layaChoose("x", "y?", { a: "a" });
    expect(res).toEqual({ ok: false, reason: "network" });

    fetchMock.mockClear();
    const res2 = await layaChoose("x", "y?", { a: "a" });
    expect(res2).toEqual({ ok: false, reason: "network" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("lib/laya — layaStatus", () => {
  it("بدون env → configured=false و بدون تماس", async () => {
    const st = await layaStatus();
    expect(st.configured).toBe(false);
    expect(st.connected).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("وصل → connected=true با latency و نتیجه ۱۵ث کش می‌شود", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("yes", 1));

    const st = await layaStatus();
    expect(st.configured).toBe(true);
    expect(st.connected).toBe(true);
    expect(st.error).toBeNull();
    expect(typeof st.latencyMs).toBe("number");

    await layaStatus();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

// ---------- lib/placement.ts ----------

describe("lib/placement — evaluateMc", () => {
  it("همه درست → C1 با نمرهٔ ۸", () => {
    const answers: Record<string, number> = {
      q1: 1, q2: 0, q3: 2, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1,
    };
    const mc = evaluateMc(answers);
    expect(mc.score).toBe(8);
    expect(mc.cefr).toBe("C1");
    expect(mc.perLevel.find((p) => p.cefr === "B2")?.correct).toBe(1);
  });

  it("همه غلط → A1 با نمرهٔ ۰", () => {
    const mc = evaluateMc({});
    expect(mc.score).toBe(0);
    expect(mc.cefr).toBe("A1");
  });

  it("۴ درست → B1", () => {
    const answers: Record<string, number> = {
      q1: 1, q2: 0, q3: 2, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0,
    };
    const mc = evaluateMc(answers);
    expect(mc.score).toBe(4);
    expect(mc.cefr).toBe("B1");
  });
});

describe("lib/placement — evaluateWriting", () => {
  it("بدون متن → no-writing", async () => {
    const w = await evaluateWriting(null);
    expect(w.used).toBe(false);
    expect(w.skippedReason).toBe("no-writing");
  });

  it("متن کوتاه (<۲۰ حرف) → no-writing", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    const w = await evaluateWriting("short text");
    expect(w.used).toBe(false);
    expect(w.skippedReason).toBe("no-writing");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Laya قطعی → skippedReason=error و سطح از تست می‌آید", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => {
      throw new TypeError("fetch failed");
    });
    const w = await evaluateWriting("I am writing a long enough English sample text for the test.");
    expect(w.used).toBe(false);
    expect(w.skippedReason).toBe("error");
  });

  it("اطمینان کم (<۰.۵) → low-confidence و استفاده نمی‌شود", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("B2", 0.3));
    const w = await evaluateWriting("I am writing a long enough English sample text for the test.");
    expect(w.used).toBe(false);
    expect(w.skippedReason).toBe("low-confidence");
  });

  it("اطمینان بالا → used=true با سطح Laya", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("B2", 0.8));
    const w = await evaluateWriting("I am writing a long enough English sample text for the test.");
    expect(w.used).toBe(true);
    expect(w.cefr).toBe("B2");
    expect(w.confidence).toBe(0.8);
  });
});

describe("lib/placement — computePlacement", () => {
  it("بدون Laya: سطح = نمرهٔ تست، method=mc", async () => {
    const outcome = await computePlacement(
      { q1: 1, q2: 0, q3: 2, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0 },
      null,
    );
    expect(outcome.cefr).toBe("B1");
    expect(outcome.method).toBe("mc");
  });

  it("با Laya مطمئن: سطح = جواب Laya، method=mc+laya-writing", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("A2", 0.9));
    const outcome = await computePlacement(
      { q1: 1, q2: 0, q3: 2, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0 },
      "I write a little English every day and I like it.",
    );
    expect(outcome.cefr).toBe("A2");
    expect(outcome.method).toBe("mc+laya-writing");
  });
});

describe("lib/placement — recommendFor", () => {
  it("B2 → دوره‌های Upper-Intermediate + کتاب‌های ۱۰ تا ۱۵", () => {
    const rec = recommendFor("B2");
    expect(rec.courses).toHaveLength(4);
    expect(rec.courses[0].courseSlug).toBe("grammar-intermediate");
    expect(rec.courses[0].levelFa).toBe("متوسط رو به بالا");
    expect(rec.books[0].bookRange).toEqual([10, 15]);
    expect(rec.storyBooks).toBeNull();
    expect(rec.ieltsNote).toContain("۶ تا ۷");
  });

  it("A1 → بدون کتاب آیلتس + داستان‌های کتابخانه", () => {
    const rec = recommendFor("A1");
    expect(rec.books[0].bookRange).toBeNull();
    expect(rec.storyBooks).not.toBeNull();
    expect(rec.courses[0].courseSlug).toBe("grammar-beginner");
  });

  it("C1 → کتاب‌های ۱ تا ۹", () => {
    const rec = recommendFor("C1");
    expect(rec.books[0].bookRange).toEqual([1, 9]);
    expect(rec.courses[2].levelFa).toBe("پیشرفته");
  });
});

// ---------- lib/support-knowledge.ts ----------

describe("lib/support-knowledge — supportReply", () => {
  it("Laya مطمئن → پاسخ همان موضوع + engine=laya", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("books", 0.9));

    const reply = await supportReply("کتاب آیلتس از کجا شروع کنم؟");
    expect(reply.topic).toBe("books");
    expect(reply.engine).toBe("laya");
    expect(reply.answer).toBe(SUPPORT_INTENTS.books.answer);
    expect(reply.actions.length).toBeGreaterThan(0);
  });

  it("اطمینان کم → fallback به پاسخ عمومی", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("ielts", 0.2));

    const reply = await supportReply("سلام");
    expect(reply.topic).toBe("other");
    expect(reply.engine).toBe("fallback");
    expect(reply.answer).toBe(SUPPORT_INTENTS.other.answer);
  });

  it("Laya خاموش → fallback بدون خطا", async () => {
    const reply = await supportReply("هر چیزی");
    expect(reply.topic).toBe("other");
    expect(reply.engine).toBe("fallback");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------- POST /api/placement ----------

async function login() {
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: USER_ID },
  } as never);
}

function placementPost(body: unknown) {
  const req = new NextRequest("http://localhost:3000/api/placement", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
  return placementPOST(req);
}

describe("POST /api/placement", () => {
  it("بدون ورود → 401", async () => {
    const res = await placementPost({ answers: {} });
    expect(res.status).toBe(401);
  });

  it("جواب کامل + Laya مطمئن → سطح Laya ذخیره و توصیه برمی‌گردد", async () => {
    await login();
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("B2", 0.85));

    const res = await placementPost({
      answers: { q1: 1, q2: 0, q3: 2, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0 },
      writing: "I am writing a long enough English sample text for the test.",
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      cefr: string;
      method: string;
      recommendations: { courses: unknown[]; books: unknown[] };
      writing: { used: boolean };
    };
    expect(data.cefr).toBe("B2");
    expect(data.method).toBe("mc+laya-writing");
    expect(data.writing.used).toBe(true);
    expect(data.recommendations.courses).toHaveLength(4);
    expect(data.recommendations.books.length).toBeGreaterThan(0);
  });

  it("بدون Laya → سطح از نمرهٔ تست (سایت نمی‌شکند)", async () => {
    await login();
    const res = await placementPost({
      answers: { q1: 1, q2: 0, q3: 2, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1 },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { cefr: string; method: string };
    expect(data.cefr).toBe("C1");
    expect(data.method).toBe("mc");
  });

  it("جواب ناقص → خطای فارسی", async () => {
    await login();
    const res = await placementPost({ answers: { q1: 1 } });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("جواب بده");
  });
});

describe("GET /api/placement", () => {
  it("بدون ورود → 401", async () => {
    const res = await placementGET();
    expect(res.status).toBe(401);
  });

  it("با ورود → سوال‌ها بدون جواب درست + آخرین نتیجه", async () => {
    await login();
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("B1", 0.8));

    // یک نتیجه بساز
    await placementPost({
      answers: { q1: 1, q2: 0, q3: 2, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0 },
    });

    const res = await placementGET();
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      questions: { id: string; options: string[]; correctIndex?: number }[];
      lastResult: { cefr: string } | null;
    };
    expect(data.questions).toHaveLength(8);
    // جواب درست هرگز فرستاده نمی‌شود
    for (const q of data.questions) {
      expect(q.correctIndex).toBeUndefined();
    }
    expect(data.lastResult?.cefr).toBe("B1");
  });
});

// ---------- POST /api/support/chat ----------

function supportPost(message: string) {
  const req = new NextRequest("http://localhost:3000/api/support/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: { "content-type": "application/json" },
  });
  return supportPOST(req);
}

describe("POST /api/support/chat", () => {
  it("عمومی است — بدون ورود هم جواب می‌دهد (fallback)", async () => {
    const res = await supportPost("سلام");
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string; engine: string };
    expect(data.engine).toBe("fallback");
    expect(data.answer).toContain("پشتیبان هوشمند");
  });

  it("با Laya مطمئن → پاسخ موضوعی", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("courses", 0.9));

    const res = await supportPost("از کجا شروع کنم؟");
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      answer: string;
      topic: string;
      engine: string;
      actions: { href: string }[];
    };
    expect(data.topic).toBe("courses");
    expect(data.engine).toBe("laya");
    expect(data.answer).toContain("تعیین سطح");
    expect(data.actions.some((a) => a.href === "/placement")).toBe(true);
  });

  it("پیام خالی → خطا", async () => {
    const res = await supportPost("");
    expect(res.status).toBe(400);
  });
});

// ---------- GET /api/ai-status ----------

describe("GET /api/ai-status", () => {
  it("بدون env → همه خاموش + hint فارسی", async () => {
    const res = await aiStatusGET();
    const data = (await res.json()) as {
      laya: { configured: boolean; connected: boolean; model: string };
      redis: { driver: string; redisConfigured: boolean };
      hint: string;
    };
    expect(res.status).toBe(200);
    expect(data.laya.configured).toBe(false);
    expect(data.laya.connected).toBe(false);
    expect(data.laya.model).toBe("convaiinnovations/laya");
    expect(data.redis.driver).toBe("memory");
    expect(data.hint).toContain("LAYA_BASE_URL تنظیم نشده");
  });

  it("با سرور روشن → laya.connected=true", async () => {
    process.env.LAYA_BASE_URL = "http://10.0.0.5:8000";
    fetchMock.mockImplementation(async () => choiceResponse("yes", 1));
    const res = await aiStatusGET();
    const data = (await res.json()) as {
      laya: { connected: boolean };
      hint: string;
    };
    expect(data.laya.connected).toBe(true);
    expect(data.hint).toContain("مدل Laya وصل است");
  });
});
