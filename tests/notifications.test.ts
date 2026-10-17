import { describe, it, expect, vi, beforeEach } from "vitest";

// ========================================
// اعلان‌های واقعی کاربر (v1.0.6.9 / English 1.0.1.12)
//
// GET/PATCH/DELETE /api/notifications + lib/notify.ts:
//  - 401 بدون نشست
//  - GET: فقط ردیف‌های خود کاربر، جدید→قدیم + unreadCount
//  - PATCH {id}: فقط ردیف خود کاربر خوانده می‌شود (id غریبه نه)
//  - PATCH {all:true}: همهٔ ناخوانده‌ها خوانده می‌شوند
//  - DELETE {id}: فقط ردیف خود کاربر حذف می‌شود
//  - PATCH بدنهٔ خالی → 400
//  - notifyUser: ردیف ساخته می‌شود؛ خطای DB هرگز throw نمی‌کند
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
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

import {
  GET,
  PATCH,
  DELETE,
} from "@/app/api/notifications/route";
import { notifyUser } from "@/lib/notify";
import { prismaMock, mockDb, resetMockDb } from "./helpers/mock-prisma";
import type { MockNotificationRow } from "./helpers/mock-prisma";
import getServerSession from "next-auth";
import { NextRequest } from "next/server";

const USER_ID = "u-notif-1";
const OTHER_USER_ID = "u-notif-2";

async function loginAs(userId: string) {
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: userId },
  } as never);
}

function req(method: "PATCH" | "DELETE", body: unknown) {
  return new NextRequest("http://localhost:3000/api/notifications", {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

/** ساخت ردیف اعلان با کنترل کامل فیلدها */
function seedNotification(
  overrides: Partial<MockNotificationRow> & { userId: string; id: string },
): MockNotificationRow {
  const row: MockNotificationRow = {
    type: "system",
    titleFa: "عنوان",
    titleEn: "Title",
    textFa: "متن",
    textEn: "Text",
    link: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    ...overrides,
  };
  mockDb.notifications.push(row);
  return row;
}

beforeEach(() => {
  resetMockDb();
  vi.mocked(getServerSession).mockReset();
});

describe("GET /api/notifications", () => {
  it("بدون نشست → 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("با نشست → فقط ردیف‌های خود کاربر، جدید→قدیم + unreadCount درست", async () => {
    await loginAs(USER_ID);

    const old = seedNotification({
      id: "n-old",
      userId: USER_ID,
      isRead: true,
      readAt: new Date(),
      createdAt: new Date("2026-10-01T10:00:00Z"),
    });
    const newer = seedNotification({
      id: "n-new",
      userId: USER_ID,
      createdAt: new Date("2026-10-02T10:00:00Z"),
    });
    // ردیف کاربر دیگر — نباید برگردد
    seedNotification({
      id: "n-foreign",
      userId: OTHER_USER_ID,
      createdAt: new Date("2026-10-03T10:00:00Z"),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.notifications).toHaveLength(2);
    // جدید اول
    expect(body.notifications[0].id).toBe(newer.id);
    expect(body.notifications[1].id).toBe(old.id);
    // فقط ناخوانده‌های خود کاربر شمرده می‌شوند (۱ از ۲)
    expect(body.unreadCount).toBe(1);
  });
});

describe("PATCH /api/notifications", () => {
  it("{id} فقط ردیف خود کاربر را خوانده می‌کند — id غریبه دست نمی‌خورد", async () => {
    await loginAs(USER_ID);

    const own = seedNotification({ id: "n-own", userId: USER_ID });
    const foreign = seedNotification({ id: "n-x", userId: OTHER_USER_ID });

    const res = await PATCH(req("PATCH", { id: own.id }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.unreadCount).toBe(0);

    expect(
      mockDb.notifications.find((n) => n.id === own.id)?.isRead,
    ).toBe(true);
    expect(
      mockDb.notifications.find((n) => n.id === foreign.id)?.isRead,
    ).toBe(false);
  });

  it("id متعلق به کاربر دیگر → بدون تغییر و unreadCount بدون تغییر", async () => {
    await loginAs(USER_ID);

    seedNotification({ id: "n-mine", userId: USER_ID });
    seedNotification({ id: "n-theirs", userId: OTHER_USER_ID });

    const res = await PATCH(req("PATCH", { id: "n-theirs" }));
    expect(res.status).toBe(200);
    const body = await res.json();

    // ردیف غریبه ناخوانده ماند؛ شمارش خود کاربر هم ۱ ماند
    expect(
      mockDb.notifications.find((n) => n.id === "n-theirs")?.isRead,
    ).toBe(false);
    expect(body.unreadCount).toBe(1);
  });

  it("{all:true} همهٔ ناخوانده‌های کاربر را خوانده می‌کند", async () => {
    await loginAs(USER_ID);

    seedNotification({ id: "n-a", userId: USER_ID });
    seedNotification({ id: "n-b", userId: USER_ID });
    seedNotification({ id: "n-c", userId: OTHER_USER_ID });

    const res = await PATCH(req("PATCH", { all: true }));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.unreadCount).toBe(0);
    expect(mockDb.notifications.find((n) => n.id === "n-a")?.isRead).toBe(
      true,
    );
    expect(mockDb.notifications.find((n) => n.id === "n-b")?.isRead).toBe(
      true,
    );
    // ردیف کاربر دیگر کاری به او نداریم
    expect(mockDb.notifications.find((n) => n.id === "n-c")?.isRead).toBe(
      false,
    );
  });

  it("بدنهٔ خالی → 400", async () => {
    await loginAs(USER_ID);
    const res = await PATCH(req("PATCH", {}));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/notifications", () => {
  it("{id} فقط ردیف خود کاربر را حذف می‌کند", async () => {
    await loginAs(USER_ID);

    seedNotification({ id: "n-del", userId: USER_ID });
    seedNotification({ id: "n-stay-foreign", userId: OTHER_USER_ID });

    const res = await DELETE(req("DELETE", { id: "n-del" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(
      mockDb.notifications.some((n) => n.id === "n-del"),
    ).toBe(false);
    expect(
      mockDb.notifications.some((n) => n.id === "n-stay-foreign"),
    ).toBe(true);
  });

  it("بدون id → 400", async () => {
    await loginAs(USER_ID);
    const res = await DELETE(req("DELETE", {}));
    expect(res.status).toBe(400);
  });
});

describe("notifyUser — lib/notify.ts", () => {
  it("پرایسمای سالم → ردیف با فیلدهای درست ساخته می‌شود", async () => {
    await notifyUser(USER_ID, {
      type: "streak",
      titleFa: "🔥 ۷ روز متوالی!",
      titleEn: "🔥 7-day streak!",
      textFa: "ادامه بده",
      textEn: "Keep going",
      link: "/dashboard",
    });

    expect(mockDb.notifications).toHaveLength(1);
    const row = mockDb.notifications[0];
    expect(row.userId).toBe(USER_ID);
    expect(row.type).toBe("streak");
    expect(row.titleFa).toBe("🔥 ۷ روز متوالی!");
    expect(row.titleEn).toBe("🔥 7-day streak!");
    expect(row.textFa).toBe("ادامه بده");
    expect(row.textEn).toBe("Keep going");
    expect(row.link).toBe("/dashboard");
    expect(row.isRead).toBe(false);
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
  });

  it("خطای پرایسما → بدون throw حل می‌شود (مسیر اصلی نمی‌شکند)", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    prismaMock.notification.create.mockRejectedValueOnce(
      new Error("db exploded") as never,
    );

    await expect(
      notifyUser(USER_ID, {
        type: "system",
        titleFa: "عنوان",
        textFa: "متن",
      }),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
