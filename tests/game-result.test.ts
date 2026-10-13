import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// مسیر حیاتی ۴ — ثبت نتیجهٔ بازی (v1.0.6.0 / English 1.0.1.3)
//
// POST /api/game/{hangman,memory,speedquiz}/result
//  - 401 بدون نشست
//  - action=start → دفعات بازی +۱ (اولین بار: create)
//  - action=word/match/answer → آمار + استریک
//  - action=session → بهترین امتیاز + رکورد جدید
//  - امتیاز غلط → 400
//  - clamp اشتباهات روی 999
//  - خطای DB → 500 + گزارش Sentry
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

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { POST as hangmanPOST } from "@/app/api/game/hangman/result/route";
import { POST as memoryPOST } from "@/app/api/game/memory/result/route";
import { POST as speedquizPOST } from "@/app/api/game/speedquiz/result/route";
import { prismaMock, mockDb, resetMockDb } from "./helpers/mock-prisma";
import getServerSession from "next-auth";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";

const USER_ID = "u-game-1";

async function loginAs(userId: string) {
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: userId },
  } as never);
}

function post(
  route: (req: NextRequest) => Promise<Response>,
  path: string,
  body: unknown,
) {
  const req = new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
  return route(req);
}

const SENTRY_DSN_TEST = "https://test-dsn@sentry.example.test/1";

beforeEach(() => {
  resetMockDb();
  vi.mocked(getServerSession).mockReset();
  vi.mocked(Sentry.captureException).mockClear();
  delete process.env.SENTRY_DSN;
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
});

afterEach(() => {
  delete process.env.SENTRY_DSN;
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
});

describe("POST /api/game/hangman/result", () => {
  it("بدون نشست → 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await post(hangmanPOST, "/api/game/hangman/result", {
      action: "start",
    });
    expect(res.status).toBe(401);
  });

  it("start اول → رکورد تازه با sessionsPlayed=1", async () => {
    await loginAs(USER_ID);
    const res = await post(hangmanPOST, "/api/game/hangman/result", {
      action: "start",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stats.sessionsPlayed).toBe(1);
    expect(body.stats.bestScore).toBe(0);
  });

  it("start دوم → sessionsPlayed=2 (create دوباره نه)", async () => {
    await loginAs(USER_ID);
    await post(hangmanPOST, "/api/game/hangman/result", { action: "start" });
    const body = await (
      await post(hangmanPOST, "/api/game/hangman/result", { action: "start" })
    ).json();

    expect(body.stats.sessionsPlayed).toBe(2);
    expect(
      mockDb.gameScores.filter(
        (g) => g.userId === USER_ID && g.game === "hangman",
      ),
    ).toHaveLength(1);
  });

  it("بردن یک کلمه → totalWins+1 و استریک فعال", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(hangmanPOST, "/api/game/hangman/result", {
        action: "word",
        won: true,
      })
    ).json();

    expect(body.stats.totalWins).toBe(1);
    expect(body.streak.current).toBe(1);

    const streak = mockDb.streaks.find((s) => s.userId === USER_ID);
    expect(streak?.current).toBe(1);
  });

  it("باختن کلمه → totalLosses+1", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(hangmanPOST, "/api/game/hangman/result", {
        action: "word",
        won: false,
      })
    ).json();
    expect(body.stats.totalLosses).toBe(1);
    expect(body.stats.totalWins).toBe(0);
  });

  it("session با امتیاز 500 → رکورد جدید؛ 200 دوباره → بدون رکورد", async () => {
    await loginAs(USER_ID);

    const first = await (
      await post(hangmanPOST, "/api/game/hangman/result", {
        action: "session",
        score: 500,
      })
    ).json();
    expect(first.isNewRecord).toBe(true);
    expect(first.stats.bestScore).toBe(500);

    const second = await (
      await post(hangmanPOST, "/api/game/hangman/result", {
        action: "session",
        score: 200,
      })
    ).json();
    expect(second.isNewRecord).toBe(false);
    expect(second.stats.bestScore).toBe(500); // بهترین حفظ شد
  });

  it("امتیاز منفی → 400", async () => {
    await loginAs(USER_ID);
    const res = await post(hangmanPOST, "/api/game/hangman/result", {
      action: "session",
      score: -5,
    });
    expect(res.status).toBe(400);
  });

  it("action نامعتبر → 400", async () => {
    await loginAs(USER_ID);
    const res = await post(hangmanPOST, "/api/game/hangman/result", {
      action: "teleport",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/game/memory/result", () => {
  it("جفت درست → totalWins+1 + استریک در پاسخ", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(memoryPOST, "/api/game/memory/result", { action: "match" })
    ).json();

    expect(body.stats.totalWins).toBe(1);
    expect(body.streak.current).toBe(1);
  });

  it("پایان دور: بهترین امتیاز و clamp اشتباهات روی 999", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(memoryPOST, "/api/game/memory/result", {
        action: "session",
        score: 160,
        mistakes: 1500, // باید به 999 کلمپ شود
      })
    ).json();

    expect(body.isNewRecord).toBe(true);
    expect(body.stats.bestScore).toBe(160);
    expect(body.stats.totalLosses).toBe(999);
  });

  it("امتیاز رشتهٔ غیرعددی → 400", async () => {
    await loginAs(USER_ID);
    const res = await post(memoryPOST, "/api/game/memory/result", {
      action: "session",
      score: "abc",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/game/speedquiz/result", () => {
  it("پاسخ درست → totalWins+1 + استریک", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(speedquizPOST, "/api/game/speedquiz/result", {
        action: "answer",
      })
    ).json();

    expect(body.stats.totalWins).toBe(1);
    expect(body.streak.current).toBe(1);
  });

  it("پایان دور: پاسخ‌های غلط کلمپ 999 و بهترین امتیاز", async () => {
    await loginAs(USER_ID);
    const body = await (
      await post(speedquizPOST, "/api/game/speedquiz/result", {
        action: "session",
        score: 320,
        wrong: 2000,
      })
    ).json();

    expect(body.stats.bestScore).toBe(320);
    expect(body.stats.totalLosses).toBe(999);
  });
});

describe("خطای دیتابیس در ثبت نتیجه → 500 + Sentry", () => {
  it("hangman: خطای DB با DSN تنظیم‌شده → captureException", async () => {
    process.env.SENTRY_DSN = SENTRY_DSN_TEST;
    await loginAs(USER_ID);

    prismaMock.gameScore.findUnique.mockRejectedValueOnce(
      new Error("db exploded") as never,
    );

    const res = await post(hangmanPOST, "/api/game/hangman/result", {
      action: "start",
    });

    expect(res.status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "db exploded" }),
      expect.objectContaining({ extra: expect.anything() }),
    );
  });

  it("memory: بدون DSN → 500 ولی گزارش Sentry ارسال نمی‌شود", async () => {
    await loginAs(USER_ID);

    prismaMock.gameScore.findUnique.mockRejectedValueOnce(
      new Error("no dsn error") as never,
    );

    const res = await post(memoryPOST, "/api/game/memory/result", {
      action: "start",
    });

    expect(res.status).toBe(500);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
