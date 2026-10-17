import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// OneSignal + یادآور استریک (v1.0.6.5 / English 1.0.1.8)
//
// lib/onesignal (payload، قطعه‌بندی ۲۰۰۰تایی، گیتِ کلید)
// + lib/streak-reminders (منطق «دیروز فعال، امروز نه»، متن
// شخصی، جمع‌بندی خطاها) + روت cron (رمز + 503های روشن)
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("next-auth", () => {
  // برای تست /api/push/subscribe (requireAuth)
  const fn = vi.fn();
  return { default: fn, getServerSession: fn };
});

const fetchMock = vi.fn(
  async (url: string, init?: RequestInit) =>
    ({
      ok: true,
      status: 200,
      json: async () => ({ id: "notif-1", recipients: 3 }),
      text: async () => JSON.stringify({ id: "notif-1", recipients: 3 }),
    }) as unknown as Response,
);
vi.stubGlobal("fetch", fetchMock);

import {
  isOneSignalConfigured,
  sendPushToSubscriptions,
} from "@/lib/onesignal";
import {
  isStreakAtRiskToday,
  getStreakReminderCandidates,
  sendStreakReminders,
} from "@/lib/streak-reminders";
import {
  GET as cronGET,
  POST as cronPOST,
} from "@/app/api/cron/streak-reminders/route";
import {
  POST as pushSubscribePOST,
  DELETE as pushSubscribeDELETE,
} from "@/app/api/push/subscribe/route";
import { mockDb, resetMockDb } from "./helpers/mock-prisma";
import getServerSession from "next-auth";
import { NextRequest } from "next/server";

function setKeys() {
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = "app-123";
  process.env.ONESIGNAL_REST_API_KEY = "rest-key";
}
function clearKeys() {
  delete process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  delete process.env.ONESIGNAL_REST_API_KEY;
}

describe("lib/onesignal — ارسال پوش", () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it("بدون کلید → isOneSignalConfigured=false و بدون فچ", async () => {
    clearKeys();
    expect(isOneSignalConfigured()).toBe(false);
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("با کلید → POST به api.onesignal.com با payload رسمی", async () => {
    setKeys();
    expect(isOneSignalConfigured()).toBe(true);

    const result = await sendPushToSubscriptions(["sub-1", "sub-2"], {
      headings: { fa: "🔥 استریک", en: "🔥 Streak" },
      contents: { fa: "پیام فارسی", en: "English body" },
      url: "https://example.com/home",
    });
    expect(result.ok).toBe(true);
    expect(result.notified).toBe(3);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.onesignal.com/notifications");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Basic rest-key",
    );
    const payload = JSON.parse(init.body as string);
    expect(payload.app_id).toBe("app-123");
    expect(payload.include_subscription_ids).toEqual(["sub-1", "sub-2"]);
    expect(payload.headings.fa).toContain("استریک");
    expect(payload.contents.en).toBe("English body");
    expect(payload.url).toBe("https://example.com/home");
  });

  it("کلید جدید os_v2_… → هدر Bearer (مستندات Keys & IDs رسمی)", async () => {
    setKeys();
    process.env.ONESIGNAL_REST_API_KEY = "os_v2_app_abc123";
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer os_v2_app_abc123",
    );
    clearKeys();
  });

  it("کلید قدیمی → همان Basic کلاسیک", async () => {
    setKeys();
    process.env.ONESIGNAL_REST_API_KEY = "legacy-rest-key";
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Basic legacy-rest-key",
    );
    clearKeys();
  });

  it("لیست خالی → موفق بدون فراخوانی", async () => {
    setKeys();
    const result = await sendPushToSubscriptions([], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("پاسخ خطا از OneSignal → ok=false + متن خطا", async () => {
    setKeys();
    fetchMock.mockImplementationOnce(
      async () =>
        ({
          ok: false,
          status: 400,
          json: async () => ({ errors: ["bad ids"] }),
          text: async () => JSON.stringify({ errors: ["bad ids"] }),
        }) as unknown as Response,
    );
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("400");
    expect(result.error).toContain("bad ids");
  });

  it("خطای شبکه → خطا با پیام و بدون throw", async () => {
    setKeys();
    fetchMock.mockImplementationOnce(
      async () => {
        throw new Error("network down");
      },
    );
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("network down");
  });

  it("بیش از ۲۰۰۰ شناسه → چند نوبت (قطعه‌بندی)", async () => {
    setKeys();
    fetchMock.mockClear();
    const ids = Array.from({ length: 4001 }, (_, i) => `sub-${i}`);
    const result = await sendPushToSubscriptions(ids, {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3); // 2000 + 2000 + 1
  });

  it("تایم‌اوت → خطای روشن (AbortError)", async () => {
    setKeys();
    fetchMock.mockImplementationOnce(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          // به‌جای انتظارِ تایم‌اوت واقعیِ ۱۰ ثانیه‌ای، خودمان
          // سیگنالِ abort را بعد از ۵۰ms قطع می‌کنیم (همان مسیر)
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
          setTimeout(() => {
            init?.signal?.dispatchEvent(new Event("abort"));
          }, 50);
        }),
    );
    const result = await sendPushToSubscriptions(["sub-1"], {
      headings: { fa: "ف", en: "E" },
      contents: { fa: "م", en: "B" },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("تایم‌اوت");
  });
});

describe("lib/streak-reminders — منطق در-خطر بودن", () => {
  const now = new Date("2026-10-14T12:00:00");

  function dayAt(offsetDays: number, hour = 10) {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  it("دیروز فعال + current>0 → در خطر", () => {
    expect(isStreakAtRiskToday(dayAt(-1), 5, now)).toBe(true);
  });

  it("امروز فعال → در خطر نیست", () => {
    expect(isStreakAtRiskToday(dayAt(0), 5, now)).toBe(false);
  });

  it("دو روز پیش → در خطر نیست (قبلاً قطع شده)", () => {
    expect(isStreakAtRiskToday(dayAt(-2), 5, now)).toBe(false);
  });

  it("current=0 → در خطر نیست", () => {
    expect(isStreakAtRiskToday(dayAt(-1), 0, now)).toBe(false);
  });

  it("امروزِ نیمه‌شب (00:30 بعد؟) و فعالیت ۱۱ شب دیروز → در خطر", () => {
    // کاربر دیشب ۲۳:۰۰ فعال بود، امروز هنوز چیزی نزده
    const lateNight = new Date("2026-10-14T12:00:00");
    const yesterday23 = new Date("2026-10-13T23:00:00");
    expect(isStreakAtRiskToday(yesterday23, 3, lateNight)).toBe(true);
  });
});

describe("lib/streak-reminders — نامزدها و ارسال", () => {
  beforeEach(() => {
    resetMockDb();
    fetchMock.mockClear();
    fetchMock.mockImplementation(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ id: "notif-1", recipients: 1 }),
          text: async () => JSON.stringify({ id: "notif-1", recipients: 1 }),
        }) as unknown as Response,
    );
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  function seedStreakUser(
    userId: string,
    current: number,
    lastActiveAt: Date,
    subscriptionId?: string,
  ) {
    mockDb.users.push({
      id: userId,
      name: `کاربر ${userId}`,
      nickname: null,
      email: `${userId}@example.com`,
      image: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDb.streaks.push({
      id: `streak-${userId}`,
      userId,
      current,
      longest: current,
      lastActiveAt,
    });
    if (subscriptionId) {
      mockDb.pushSubscriptions.push({
        id: `push-${userId}`,
        userId,
        subscriptionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  const now = new Date("2026-10-14T12:00:00");

  it("getStreakReminderCandidates: فقط دیروزِ فعالِ دارای پوش", async () => {
    const yesterday = new Date("2026-10-13T10:00:00");
    const today = new Date("2026-10-14T09:00:00");

    seedStreakUser("u1", 5, yesterday, "sub-u1"); // ← باید بیاید
    seedStreakUser("u2", 7, yesterday, undefined); // پوش ندارد → نباید بیاید
    seedStreakUser("u3", 9, today, "sub-u3"); // امروز فعال → نباید بیاید
    seedStreakUser("u4", 0, yesterday, "sub-u4"); // استریک صفر → نباید بیاید

    const candidates = await getStreakReminderCandidates(now);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe("u1");
    expect(candidates[0].subscriptionIds).toEqual(["sub-u1"]);
    expect(candidates[0].current).toBe(5);
  });

  it("sendStreakReminders: ارسال شخصی + جمع‌بندی", async () => {
    setKeys();
    const yesterday = new Date("2026-10-13T10:00:00");
    seedStreakUser("u1", 5, yesterday, "sub-u1");

    const summary = await sendStreakReminders(now);
    expect(summary.checked).toBe(1);
    expect(summary.usersNotified).toBe(1);
    expect(summary.errors).toHaveLength(0);

    // payload: متن فارسی با عدد استریک و نام کاربر
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(init.body as string);
    expect(payload.contents.fa).toContain("5");
    expect(payload.contents.fa).toContain("u1");
    expect(payload.include_subscription_ids).toEqual(["sub-u1"]);
    expect(payload.url).toBe("http://localhost:3000/home");
  });

  it("خطای OneSignal برای یک کاربر → بقیه می‌روند + خطا جمع می‌شود", async () => {
    setKeys();
    const yesterday = new Date("2026-10-13T10:00:00");
    seedStreakUser("u1", 5, yesterday, "sub-u1");
    seedStreakUser("u2", 3, yesterday, "sub-u2");

    // اولی خطا بدهد، دومی موفق
    fetchMock
      .mockImplementationOnce(
        async () =>
          ({
            ok: false,
            status: 500,
            json: async () => ({}),
            text: async () => "{}",
          }) as unknown as Response,
      )
      .mockImplementation(
        async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({ id: "n", recipients: 1 }),
            text: async () => JSON.stringify({ id: "n", recipients: 1 }),
          }) as unknown as Response,
      );

    const summary = await sendStreakReminders(now);
    expect(summary.checked).toBe(2);
    expect(summary.usersNotified).toBe(1);
    expect(summary.errors).toHaveLength(1);
    expect(summary.errors[0]).toContain("u1");
    clearKeys();
  });

  it("بدون کلید OneSignal → خطا جمع می‌شود، throw نمی‌شود", async () => {
    clearKeys();
    const yesterday = new Date("2026-10-13T10:00:00");
    seedStreakUser("u1", 5, yesterday, "sub-u1");

    const summary = await sendStreakReminders(now);
    expect(summary.checked).toBe(1);
    expect(summary.usersNotified).toBe(0);
    expect(summary.errors[0]).toContain("ONESIGNAL");
  });
});

describe("GET/POST /api/cron/streak-reminders — گیت امنیتی", () => {
  const CRON_URL = "http://localhost:3000/api/cron/streak-reminders";

  beforeEach(() => {
    resetMockDb();
    clearKeys();
    delete process.env.CRON_SECRET;
  });

  function cronRequest(headers: Record<string, string>) {
    return new NextRequest(CRON_URL, { headers });
  }

  it("بدون CRON_SECRET → 503 با پیام روشن", async () => {
    const res = await cronGET(cronRequest({}));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("CRON_SECRET");
  });

  it("رمز غلط (Bearer یا هدر سفارشی) → 401", async () => {
    process.env.CRON_SECRET = "top-secret";
    const res = await cronGET(cronRequest({ authorization: "Bearer wrong" }));
    expect(res.status).toBe(401);

    const res2 = await cronPOST(cronRequest({ "x-cron-secret": "wrong" }));
    expect(res2.status).toBe(401);
  });

  it("v1.0.6.7 — 401 حالا hint عیب‌یابی دارد: طول رمز دریافتی/منتظر (بدون لو رفتن مقدار)", async () => {
    process.env.CRON_SECRET = "da70afc2001e41264fdf9e936e90c5fe"; // 32 کاراکتر
    const res = await cronGET(cronRequest({ "x-cron-secret": "wrong" })); // 5 کاراکتر
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.hint).toBeDefined();
    expect(body.hint.via).toBe("x-cron-secret");
    expect(body.hint.receivedLength).toBe(5);
    expect(body.hint.expectedLength).toBe(32);
    expect(body.hint.lengthMatches).toBe(false);
    expect(body.hint.note).toContain("32");
    expect(body.hint.note).toContain("5");
    // هیچ مقدار رمزی نباید لو برود
    const text = JSON.stringify(body);
    expect(text).not.toContain("da70afc");
    expect(text).not.toContain("top-secret");
  });

  it("v1.0.6.7 — در حالت لوکال، ?secret=… هم پذیرفته می‌شود (تست مرورگری)", async () => {
    process.env.CRON_SECRET = "top-secret";
    // NODE_ENV در vitest = test (غیر production) → query پذیرفته می‌شود
    const req = new NextRequest(`${CRON_URL}?secret=top-secret`);
    const res = await cronGET(req);
    // رمز درست بود → از گیت رد شد و به پیام «OneSignal تنظیم نشده» رسید (503)
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("OneSignal");
  });

  it("رمز درست + OneSignal تنظیم نشده → 503 با پیام OneSignal", async () => {
    process.env.CRON_SECRET = "top-secret";
    const res = await cronGET(
      cronRequest({ authorization: "Bearer top-secret" }),
    );
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("OneSignal");
  });

  it("رمز درست + OneSignal → 200 + جمع‌بندی", async () => {
    process.env.CRON_SECRET = "top-secret";
    setKeys();
    // v1.0.6.9 — تاریخِ نسبی «دیروز» (قبلاً ۲۰۲۶-۱۰-۱۳ هاردکد بود
    // و بعد از آن روز، تستِ جاب خراب می‌شد — رفع بمب تاریخ)
    const yesterdayActive = new Date();
    yesterdayActive.setDate(yesterdayActive.getDate() - 1);
    yesterdayActive.setHours(10, 0, 0, 0);
    // کاربر در-خطر
    mockDb.users.push({
      id: "u1",
      name: "u1",
      nickname: null,
      email: "u1@x.com",
      image: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockDb.streaks.push({
      id: "s1",
      userId: "u1",
      current: 4,
      longest: 4,
      lastActiveAt: yesterdayActive,
    });
    mockDb.pushSubscriptions.push({
      id: "p1",
      userId: "u1",
      subscriptionId: "sub-u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await cronGET(
      cronRequest({ authorization: "Bearer top-secret" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.summary.checked).toBe(1);
    expect(body.summary.usersNotified).toBe(1);
    clearKeys();
  });
});

describe("POST/DELETE /api/push/subscribe — ثبت اشتراک پوش", () => {
  const SUBSCRIBE_URL = "http://localhost:3000/api/push/subscribe";

  function jsonReq(method: string, body: unknown) {
    return new NextRequest(SUBSCRIBE_URL, {
      method,
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });
  }

  beforeEach(() => {
    resetMockDb();
    vi.mocked(getServerSession).mockReset();
  });

  it("بدون نشست → 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await pushSubscribePOST(
      jsonReq("POST", { subscriptionId: "sub-123456789" }),
    );
    expect(res.status).toBe(401);
  });

  it("با نشست → upsert ردیف (userId, subscriptionId)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as never);

    const res = await pushSubscribePOST(
      jsonReq("POST", { subscriptionId: "sub-123456789" }),
    );
    expect(res.status).toBe(200);
    expect(mockDb.pushSubscriptions).toHaveLength(1);
    expect(mockDb.pushSubscriptions[0]).toMatchObject({
      userId: "u1",
      subscriptionId: "sub-123456789",
    });

    // دوباره (همان دستگاه) → آپدیت، نه ردیف جدید
    const res2 = await pushSubscribePOST(
      jsonReq("POST", { subscriptionId: "sub-123456789" }),
    );
    expect(res2.status).toBe(200);
    expect(mockDb.pushSubscriptions).toHaveLength(1);

    // دستگاه دوم برای همان کاربر → ردیف دوم
    await pushSubscribePOST(jsonReq("POST", { subscriptionId: "sub-second" }));
    expect(mockDb.pushSubscriptions).toHaveLength(2);
  });

  it("شناسهٔ نامعتبر (کوتاه/غایب) → 400", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as never);

    const res = await pushSubscribePOST(jsonReq("POST", { subscriptionId: "" }));
    expect(res.status).toBe(400);

    const res2 = await pushSubscribePOST(jsonReq("POST", {}));
    expect(res2.status).toBe(400);
  });

  it("DELETE → فقط همان دستگاه حذف می‌شود", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as never);

    await pushSubscribePOST(jsonReq("POST", { subscriptionId: "sub-123456789" }));
    await pushSubscribePOST(jsonReq("POST", { subscriptionId: "sub-second" }));
    expect(mockDb.pushSubscriptions).toHaveLength(2);

    const res = await pushSubscribeDELETE(
      jsonReq("DELETE", { subscriptionId: "sub-second" }),
    );
    expect(res.status).toBe(200);
    expect(mockDb.pushSubscriptions).toHaveLength(1);
    expect(mockDb.pushSubscriptions[0].subscriptionId).toBe("sub-123456789");
  });
});
