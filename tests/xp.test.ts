import { describe, it, expect, vi, beforeEach } from "vitest";

// ========================================
// مسیر حیاتی ۳ — محاسبهٔ XP (v1.0.6.0 / English 1.0.1.3)
//
// POST /api/listening/[id] — ثبت جواب تمرین شنیداری:
//  - درستی جواب‌ها (trim + lowercase)
//  - ستاره: 80%→3 / 50%→2 / >0→1
//  - XP = round(episode.xp × stars ÷ 3)
//  - حفظ بهترین نتیجه (bestResult)
//  - ثبت استریک با تحویل تمرین
// ========================================

vi.mock("@/prisma/Prisma client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("next-auth", () => {
  // هم default هم named — api-helpers به‌صورت named ایمپورت می‌کند
  const fn = vi.fn();
  return { default: fn, getServerSession: fn };
});

import { POST as submitListening } from "@/app/api/listening/[id]/route";
import { mockDb, resetMockDb } from "./helpers/mock-prisma";
import getServerSession from "next-auth";
import { NextRequest } from "next/server";

const USER_ID = "u-xp-1";

function seedEpisode(id: string, xp: number, gapCount: number) {
  const gaps = Array.from({ length: gapCount }, (_, i) => ({
    id: i + 1,
    answer: `word-${i + 1}`,
  }));
  mockDb.listeningEpisodes.push({
    id,
    title: `Episode ${id}`,
    titleFa: null,
    description: null,
    audioUrl: "https://example.test/audio.mp3",
    level: "BEGINNER",
    duration: 60,
    xp,
    transcript: [],
    gaps,
  });
}

async function loginAs(userId: string) {
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: userId },
  } as never);
}

async function submit(id: string, answers: Record<number, string>) {
  const req = new NextRequest(`http://localhost:3000/api/listening/${id}`, {
    method: "POST",
    body: JSON.stringify({ answers }),
    headers: { "content-type": "application/json" },
  });
  return submitListening(req, { params: Promise.resolve({ id }) });
}

/** جواب‌های n-تایی اول درست، بقیه غلط */
function answerFirst(n: number, total: number) {
  const answers: Record<number, string> = {};
  for (let i = 1; i <= total; i++) {
    answers[i] = i <= n ? `word-${i}` : "definitely-wrong";
  }
  return answers;
}

beforeEach(() => {
  resetMockDb();
  seedEpisode("ep-10", 30, 10);
  vi.mocked(getServerSession).mockReset();
});

describe("POST /api/listening/[id] — امتیاز و ستاره", () => {
  it("۱۰۰٪ درست (۱۰/۱۰) → ۳ ستاره و XP کامل", async () => {
    await loginAs(USER_ID);
    const res = await submit("ep-10", answerFirst(10, 10));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.correct).toBe(10);
    expect(body.stars).toBe(3);
    expect(body.xpEarned).toBe(30); // round(30×3÷3)
    expect(body.percent).toBe(100);
  });

  it("۸۰٪ (۸/۱۰) → ۳ ستاره", async () => {
    await loginAs(USER_ID);
    const body = await (await submit("ep-10", answerFirst(8, 10))).json();
    expect(body.stars).toBe(3);
    expect(body.xpEarned).toBe(30);
  });

  it("۵۰٪ (۵/۱۰) → ۲ ستاره و XP دوسوم", async () => {
    await loginAs(USER_ID);
    const body = await (await submit("ep-10", answerFirst(5, 10))).json();
    expect(body.stars).toBe(2);
    expect(body.xpEarned).toBe(20); // round(30×2÷3)
  });

  it("۳۰٪ (۳/۱۰) → ۱ ستاره", async () => {
    await loginAs(USER_ID);
    const body = await (await submit("ep-10", answerFirst(3, 10))).json();
    expect(body.stars).toBe(1);
    expect(body.xpEarned).toBe(10); // round(30×1÷3)
  });

  it("۰٪ → صفر ستاره و صفر XP", async () => {
    await loginAs(USER_ID);
    const body = await (await submit("ep-10", answerFirst(0, 10))).json();
    expect(body.stars).toBe(0);
    expect(body.xpEarned).toBe(0);
  });

  it("جواب‌ها trim + lowercase می‌شوند — « WORD-1  » هم درست است", async () => {
    await loginAs(USER_ID);
    const answers: Record<number, string> = {};
    for (let i = 1; i <= 10; i++) answers[i] = `  WORD-${i}  `;
    const body = await (await submit("ep-10", answers)).json();
    expect(body.correct).toBe(10);
  });

  it("XP غیرمضرب هم گرد می‌شود: xp=25 با ۲ ستاره → 17", async () => {
    seedEpisode("ep-25", 25, 10);
    await loginAs(USER_ID);
    const body = await (await submit("ep-25", answerFirst(5, 10))).json();
    expect(body.stars).toBe(2);
    expect(body.xpEarned).toBe(17); // round(25×2÷3) = round(16.67)
  });
});

describe("POST /api/listening/[id] — ثبت و حفظ بهترین نتیجه", () => {
  it("اولین ثبت → progress ساخته می‌شود + استریک فعال (قانون ۱.۰.1.2)", async () => {
    await loginAs(USER_ID);
    await submit("ep-10", answerFirst(10, 10));

    const progress = mockDb.listeningProgress.find(
      (p) => p.userId === USER_ID && p.episodeId === "ep-10",
    );
    expect(progress).toBeTruthy();
    expect(progress!.stars).toBe(3);
    expect(progress!.score).toBe(100);
    expect(progress!.xpEarned).toBe(30);

    // استریک با «تحویلِ کامل» تمرین فعال شد
    const streak = mockDb.streaks.find((s) => s.userId === USER_ID);
    expect(streak).toBeTruthy();
    expect(streak!.current).toBe(1);
  });

  it("نتیجهٔ ضعیف‌تر از قبلی → bestResult:true و اعداد قبلی برمی‌گردند", async () => {
    await loginAs(USER_ID);
    await submit("ep-10", answerFirst(10, 10)); // ستارهٔ ۳

    const res = await submit("ep-10", answerFirst(3, 10)); // تلاش ضعیف‌تر

    const body = await res.json();
    expect(body.bestResult).toBe(true);
    expect(body.stars).toBe(3); // بهترین قبلی
    expect(body.xpEarned).toBe(30);

    // progress دست نخورده
    const progress = mockDb.listeningProgress[0];
    expect(progress.stars).toBe(3);
    expect(progress.xpEarned).toBe(30);
  });

  it("نتیجهٔ بهتر → آپدیت progress با اعداد جدید", async () => {
    await loginAs(USER_ID);
    await submit("ep-10", answerFirst(3, 10)); // ۱ ستاره
    const body = await (await submit("ep-10", answerFirst(8, 10))).json();

    expect(body.bestResult).toBe(false);
    expect(body.stars).toBe(3);

    const progress = mockDb.listeningProgress[0];
    expect(progress.stars).toBe(3);
    expect(progress.xpEarned).toBe(30);
  });

  it("قسمت موجود نیست → 404", async () => {
    await loginAs(USER_ID);
    const res = await submit("ep-404", {});
    expect(res.status).toBe(404);
  });

  it("بدون نشست → 401 (requireAuth)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await submit("ep-10", answerFirst(10, 10));
    expect(res.status).toBe(401);
  });
});
