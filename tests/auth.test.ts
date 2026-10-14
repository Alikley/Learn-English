import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// مسیر حیاتی ۱ — ثبت‌نام / ورود (v1.0.6.0 / English 1.0.1.3)
//
// POST /api/auth/register  +  Credentials authorize
// + قانون ۱.۰.1.2 (streak با ثبت‌نام صفر می‌مانَد)  +  رگرسیون
// ۱.۰.1.1 (کوکی سرگردان → نشست بدون کاربر؛ fail-open روی خطای DB)
// ========================================

vi.mock("@/prisma/Prisma client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { POST as registerPOST } from "@/app/api/auth/register/route";
import { authOptions } from "@/lib/auth";
import { prismaMock, mockDb, resetMockDb } from "./helpers/mock-prisma";
import * as Sentry from "@sentry/nextjs";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const API = "http://localhost:3000/api/auth/register";

function jsonRequest(body: unknown) {
  return new NextRequest(API, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const SENTRY_DSN_TEST = "https://test-dsn@sentry.example.test/1";

describe("POST /api/auth/register — ثبت‌نام", () => {
  beforeEach(() => {
    resetMockDb();
    vi.mocked(Sentry.captureException).mockClear();
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  it("با فیلد غایب → 400 و هیچ رکوردی نمی‌سازد", async () => {
    const res = await registerPOST(jsonRequest({ name: "علی" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("الزامی");
    expect(mockDb.users).toHaveLength(0);
  });

  it("ثبت‌نام سالم → 201 + رمز bcrypt + streak صفر (قانون ۱.۰.1.2)", async () => {
    const res = await registerPOST(
      jsonRequest({
        name: "علی مرادی",
        email: "ali@test.dev",
        password: "secret-123",
      }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe("ali@test.dev");

    // رمز خام ذخیره نشده — bcrypt واقعی
    const row = mockDb.users.find((u) => u.email === "ali@test.dev");
    expect(row).toBeTruthy();
    expect(row!.password).not.toBe("secret-123");
    await expect(bcrypt.compare("secret-123", row!.password!)).resolves.toBe(
      true,
    );
    await expect(bcrypt.compare("wrong", row!.password!)).resolves.toBe(false);

    // 🔥 streak فقط با ثبت‌نام فعال نمی‌شود — صفر می‌مانَد
    const streak = mockDb.streaks.find((s) => s.userId === row!.id);
    expect(streak).toBeTruthy();
    expect(streak!.current).toBe(0);
    expect(streak!.longest).toBe(0);
  });

  it("ایمیل تکراری → 409", async () => {
    await registerPOST(
      jsonRequest({ name: "الف", email: "dupe@test.dev", password: "123456" }),
    );
    const res = await registerPOST(
      jsonRequest({ name: "ب", email: "dupe@test.dev", password: "123456" }),
    );
    expect(res.status).toBe(409);
    expect(mockDb.users.filter((u) => u.email === "dupe@test.dev")).toHaveLength(
      1,
    );
  });

  it("خطای دیتابیس → 500 + گزارش Sentry (وقتی DSN تنظیم شده)", async () => {
    process.env.SENTRY_DSN = SENTRY_DSN_TEST;

    prismaMock.user.findUnique.mockRejectedValueOnce(
      new Error("db down") as never,
    );

    const res = await registerPOST(
      jsonRequest({ name: "ت", email: "err@test.dev", password: "123456" }),
    );

    expect(res.status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});

/**
 * نکتهٔ مهم next-auth v4: تابع authorize که ما می‌نویسیم داخل
 * `provider.options` می‌نشیند و هستهٔ next-auth (parseProviders)
 * موقع هر درخواست آن را با شیء provider merge می‌کند — پس برای
 * تست مستقیم باید از options خوانده شود.
 */
function getCredentialsAuthorize() {
  const provider = authOptions.providers[0] as unknown as {
    options: {
      authorize: (credentials: {
        email?: string;
        password?: string;
      }) => Promise<{ id: string; name: string | null; email: string } | null>;
    };
  };
  return provider.options.authorize;
}

describe("Credentials authorize — ورود با رمز", () => {
  beforeEach(async () => {
    resetMockDb();
    const hashed = await bcrypt.hash("pass-123", 4);
    mockDb.users.push({
      id: "u-cred-1",
      name: "کاربر رمزی",
      nickname: null,
      email: "cred@test.dev",
      image: null,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("رمز درست → آبجکت کاربر با id دیتابیس", async () => {
    const authorize = getCredentialsAuthorize();

    const user = await authorize({
      email: "cred@test.dev",
      password: "pass-123",
    });
    expect(user).toBeTruthy();
    expect(user!.id).toBe("u-cred-1");
    expect(user!.email).toBe("cred@test.dev");
  });

  it("رمز غلط → null", async () => {
    const authorize = getCredentialsAuthorize();

    await expect(
      authorize({ email: "cred@test.dev", password: "wrong-pass" }),
    ).resolves.toBeNull();
  });

  it("کاربر بدون رمز عبور (رکورد ناقص) → null (با رمز وارد نمی‌شود)", async () => {
    mockDb.users.push({
      id: "u-nopass-1",
      name: "کاربر بدون رمز",
      nickname: null,
      email: "nopass@test.dev",
      image: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const authorize = getCredentialsAuthorize();

    await expect(
      authorize({ email: "nopass@test.dev", password: "anything" }),
    ).resolves.toBeNull();
  });
});

describe("jwt callback — ورود با رمز", () => {
  beforeEach(() => {
    resetMockDb();
  });

  it("ورود رمزی → token.id از خود کاربر", async () => {
    const out = await authOptions.callbacks!.jwt!({
      token: {} as never,
      user: { id: "u-plain-9" } as never,
      account: null,
    });
    expect(out.id).toBe("u-plain-9");
  });
});

describe("session callback — رگرسیون کوکی سرگردان (۱.۰.1.1)", () => {
  beforeEach(() => {
    resetMockDb();
  });

  it("کاربر موجود در DB → session.user.id ست می‌شود", async () => {
    mockDb.users.push({
      id: "sess-ok-1",
      name: "ب",
      nickname: null,
      email: "ok@test.dev",
      image: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const session = { user: {}, expires: "2099-01-01T00:00:00.000Z" };
    const out = (await authOptions.callbacks!.session!({
      session,
      token: { id: "sess-ok-1" },
    } as never)) as { user?: { id?: string } };

    expect(out.user?.id).toBe("sess-ok-1");
  });

  it("کاربرِ حذف‌شده از DB (کوکی سرگردان) → نشست بدون کاربر", async () => {
    const session = { user: {}, expires: "2099-01-01T00:00:00.000Z" };
    const out = (await authOptions.callbacks!.session!({
      session,
      token: { id: "sess-gone-1" },
    } as never)) as { user?: { id?: string } };

    expect(out.user).toBeUndefined();
  });

  it("خطای لحظه‌ای DB → fail-open (کاربر واقعی بیرون پرت نمی‌شود)", async () => {
    prismaMock.user.findUnique.mockRejectedValueOnce(new Error("hiccup") as never);

    const session = { user: {}, expires: "2099-01-01T00:00:00.000Z" };
    const out = (await authOptions.callbacks!.session!({
      session,
      token: { id: "sess-err-1" },
    } as never)) as { user?: { id?: string } };

    expect(out.user?.id).toBe("sess-err-1");
  });
});
