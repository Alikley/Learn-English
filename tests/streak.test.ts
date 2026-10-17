import { describe, it, expect, vi, beforeEach } from "vitest";

// ========================================
// مسیر حیاتی ۲ — محاسبهٔ استریک (روزهای متوالی)
// (v1.0.6.0 / English 1.0.1.3)
//
// کل قواعد lib/streak.ts:
//  - اولین فعالیت → current=1
//  - همان روز → بدون تغییر (جز حالت ثبت‌نامِ current=0 → 1)
//  - دیروز → +1 و آپدیت longest
//  - فاصلهٔ بیش از یک روز → ریست به 1
//  - getStreak: قدیمی‌تر از دیروز → current=0
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

import { updateStreak, getStreak } from "@/lib/streak";
import { prismaMock, mockDb, resetMockDb } from "./helpers/mock-prisma";

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const daysAgo = (n: number) => {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
};

function seedStreak(
  userId: string,
  current: number,
  longest: number,
  lastActiveAt: Date,
) {
  mockDb.streaks.push({
    id: `streak-${userId}`,
    userId,
    current,
    longest,
    lastActiveAt,
  });
}

beforeEach(() => {
  resetMockDb();
});

describe("updateStreak — ثبت فعالیت", () => {
  it("اولین فعالیت (رکورد streak ندارَد) → current=1, longest=1", async () => {
    const out = await updateStreak("st-1");
    expect(out.current).toBe(1);
    expect(out.longest).toBe(1);
    expect(prismaMock.streak.create).toHaveBeenCalledTimes(1);
  });

  it("همان روز با current>0 → بدون تغییر (ثبت تکراری بی‌اثر)", async () => {
    seedStreak("st-2", 3, 7, new Date());
    prismaMock.streak.update.mockClear();

    const out = await updateStreak("st-2");

    expect(out.current).toBe(3);
    expect(prismaMock.streak.update).not.toHaveBeenCalled();
  });

  it("روز ثبت‌نام (current=0، همان روز) → اولین فعالیت 1 می‌کند", async () => {
    // قانون 1.0.1.2: رکورد ثبت‌نام با current=0 ساخته می‌شود
    seedStreak("st-3", 0, 0, new Date());

    const out = await updateStreak("st-3");

    expect(out.current).toBe(1);
    expect(out.longest).toBe(1);
  });

  it("آخرین فعالیت دیروز → ادامهٔ زنجیره (+1)", async () => {
    seedStreak("st-4", 4, 9, daysAgo(1));

    const out = await updateStreak("st-4");

    expect(out.current).toBe(5);
    expect(out.longest).toBe(9);
  });

  it("دیروز با رکورد → longest هم آپدیت می‌شود", async () => {
    seedStreak("st-5", 9, 9, daysAgo(1));

    const out = await updateStreak("st-5");

    expect(out.current).toBe(10);
    expect(out.longest).toBe(10);
  });

  it("فاصلهٔ ۲ روز و بیشتر → ریست زنجیره به 1 (longest دست‌نخورده)", async () => {
    seedStreak("st-6", 6, 20, daysAgo(3));

    const out = await updateStreak("st-6");

    expect(out.current).toBe(1);
    expect(out.longest).toBe(20);
  });
});

describe("getStreak — خواندن استریک", () => {
  it("کاربر بدون رکورد → {0,0}", async () => {
    const out = await getStreak("gs-1");
    expect(out).toEqual({ current: 0, longest: 0 });
  });

  it("فعال امروز → همان اعداد", async () => {
    seedStreak("gs-2", 2, 5, new Date());
    const out = await getStreak("gs-2");
    expect(out).toEqual({ current: 2, longest: 5 });
  });

  it("آخرین فعالیت دیروز → زنجیره هنوز برقرار", async () => {
    seedStreak("gs-3", 3, 4, daysAgo(1));
    const out = await getStreak("gs-3");
    expect(out).toEqual({ current: 3, longest: 4 });
  });

  it("آخرین فعالیت ۲+ روز قبل → زنجیره شکسته: current=0", async () => {
    seedStreak("gs-4", 5, 11, daysAgo(2));

    const out = await getStreak("gs-4");

    expect(out.current).toBe(0);
    expect(out.longest).toBe(11);
    // صفرشدن در DB هم persist می‌شود
    expect(mockDb.streaks.find((s) => s.userId === "gs-4")?.current).toBe(0);
    expect(prismaMock.streak.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "gs-4" },
        data: { current: 0 },
      }),
    );
  });
});
