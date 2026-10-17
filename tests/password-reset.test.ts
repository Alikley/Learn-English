import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ========================================
// بازیابی رمز عبور (v1.0.6.5 / English 1.0.1.8)
//
// POST /api/auth/forgot-password + POST /api/auth/reset-password
// + منطق توکن (هش SHA-256، انقضای ۳۰ دقیقه، یک‌بارمصرف،
// محدودیت ۹۰ ثانیه) + ضد حدس‌زدن اعضا (پاسخ عمومی)
// ========================================

vi.mock("@/prisma/prisma-client", async () => {
  const { prismaMock } = await import("./helpers/mock-prisma");
  return { prisma: prismaMock };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// fetch را ماک می‌کنیم تا نه SendGrid واقعی صدا زده شود و نه سشن
vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({
    ok: true,
    status: 202,
    json: async () => ({}),
    text: async () => "",
  })),
);

import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "@/app/api/auth/reset-password/route";
import {
  hashResetToken,
  createPasswordResetToken,
  findValidResetToken,
  buildResetEmail,
  appBaseUrl,
  RESET_TOKEN_TTL_MS,
} from "@/lib/password-reset";
import { prismaMock, mockDb, resetMockDb } from "./helpers/mock-prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const FORGOT_URL = "http://localhost:3000/api/auth/forgot-password";
const RESET_URL = "http://localhost:3000/api/auth/reset-password";

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function seedUser(email = "ali@example.com", password = "oldPass123") {
  mockDb.users.push({
    id: "user-1",
    name: "Ali",
    nickname: null,
    email,
    image: null,
    password: bcrypt.hashSync(password, 10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return mockDb.users[0];
}

describe("lib/password-reset — منطق توکن", () => {
  beforeEach(() => {
    resetMockDb();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
  });

  it("هش SHA-256 هگز ۶۴ کاراکتری است و به توکن حساس", () => {
    const h1 = hashResetToken("abc");
    const h2 = hashResetToken("abd");
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
    expect(h2).not.toBe(h1);
  });

  it("create → توکن خام ۶۴ هگز + رکورد با هش (نه توکن خام)", async () => {
    seedUser();
    const result = await createPasswordResetToken("user-1");
    expect(result.status).toBe("created");
    if (result.status !== "created") return;

    expect(result.token).toMatch(/^[a-f0-9]{64}$/);
    expect(mockDb.passwordResetTokens).toHaveLength(1);
    // در DB فقط هش نشسته
    expect(mockDb.passwordResetTokens[0].tokenHash).toBe(
      hashResetToken(result.token),
    );
    expect(mockDb.passwordResetTokens[0].tokenHash).not.toBe(result.token);
    // انقضا ~۳۰ دقیقه
    const ttl =
      mockDb.passwordResetTokens[0].expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(RESET_TOKEN_TTL_MS - 60_000);
    expect(ttl).toBeLessThanOrEqual(RESET_TOKEN_TTL_MS);
  });

  it("توکن قبلیِ استفاده‌نشده با درخواست جدید حذف می‌شود", async () => {
    seedUser();
    await createPasswordResetToken("user-1");
    await createPasswordResetToken("user-1");
    // هر دو ساخت موفق داشتند ولی فقط آخرین باید در DB باشد
    expect(mockDb.passwordResetTokens).toHaveLength(1);
  });

  it("محدودیت سرعت: درخواست دوم زیر ۹۰ ثانیه → rate-limited", async () => {
    seedUser();
    const first = await createPasswordResetToken("user-1");
    expect(first.status).toBe("created");

    const second = await createPasswordResetToken("user-1");
    expect(second.status).toBe("rate-limited");
    expect(mockDb.passwordResetTokens).toHaveLength(1);
  });

  it("findValidResetToken: توکن معتبر → کاربر؛ غلط/منقضی → null", async () => {
    seedUser();
    const created = await createPasswordResetToken("user-1");
    if (created.status !== "created") throw new Error("must be created");

    const row = await findValidResetToken(created.token);
    expect(row?.userId).toBe("user-1");

    expect(await findValidResetToken("wrong-token")).toBeNull();

    // منقضی‌شده
    mockDb.passwordResetTokens[0].expiresAt = new Date(Date.now() - 1000);
    expect(await findValidResetToken(created.token)).toBeNull();
  });

  it("ایمیل ساخته‌شده: دوزبانه + لینک + بدون XSS خام", () => {
    const email = buildResetEmail("http://localhost:3000/reset-password?token=xyz");
    expect(email.subject).toContain("بازیابی");
    expect(email.html).toContain("reset-password?token=xyz");
    expect(email.html).toContain("۳۰ دقیقه");
    expect(email.text).toContain("reset-password?token=xyz");
    expect(email.text).toContain("30 minutes");
  });
});

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    resetMockDb();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    vi.mocked(globalThis.fetch).mockClear();
  });

  afterEach(() => {
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  it("ایمیل غلط/خالی → 400", async () => {
    const res = await forgotPasswordPOST(jsonRequest(FORGOT_URL, { email: "" }));
    expect(res.status).toBe(400);

    const res2 = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "not-an-email" }),
    );
    expect(res2.status).toBe(400);
  });

  it("ایمیلِ ثبت‌نشده → 200 + پیام عمومی + بدون ساخت توکن", async () => {
    const res = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ghost@example.com" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.devLink).toBeUndefined();
    expect(mockDb.passwordResetTokens).toHaveLength(0);
  });

  it("ایمیلِ ثبت‌شده + بدون SendGrid (لوکال) → توکن + devLink در پاسخ", async () => {
    seedUser();
    const res = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ali@example.com" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.devLink).toMatch(
      /^http:\/\/localhost:3000\/reset-password\?token=[a-f0-9]{64}$/,
    );
    expect(mockDb.passwordResetTokens).toHaveLength(1);
    // بدون SendGrid → هیچ فچی نباید زده شود
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("ایمیلِ ثبت‌شده + SendGrid تنظیم‌شده → فراخوانی REST SendGrid", async () => {
    seedUser();
    process.env.SENDGRID_API_KEY = "SG.test-key";
    process.env.SENDGRID_FROM_EMAIL = "noreply@example.com";

    const res = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ali@example.com" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // در حالت SendGrid → devLink در پاسخ نیست (حتی لوکال)
    expect(body.devLink).toBeUndefined();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer SG.test-key",
    );
    const payload = JSON.parse(init.body as string);
    expect(payload.personalizations[0].to[0].email).toBe("ali@example.com");
    expect(payload.from.email).toBe("noreply@example.com");
    expect(payload.subject).toContain("بازیابی");
    expect(payload.content[1].value).toContain("reset-password?token=");
  });

  it("SendGrid تنظیم‌شده + خطای 451 در حالت لوکال → devLink + devEmailError (v1.0.6.6)", async () => {
    seedUser();
    process.env.SENDGRID_API_KEY = "SG.test-key";
    process.env.SENDGRID_FROM_EMAIL = "noreply@example.com";
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    vi.mocked(globalThis.fetch).mockImplementationOnce(
      async () =>
        ({
          ok: false,
          status: 451,
          text: async () => "451 Unavailable For Legal Reasons",
        }) as unknown as Response,
    );

    const res = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ali@example.com" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // ایمیل نرفت ولی جریان لوکال کامل می‌شود: لینک روی صفحه
    expect(body.devLink).toMatch(
      /^http:\/\/localhost:3000\/reset-password\?token=[a-f0-9]{64}$/,
    );
    // دلیل خطا (451 تحریمی + راه‌حل OUTBOUND_PROXY_URL) هم می‌آید
    expect(body.devEmailError).toContain("451");
    expect(body.devEmailError).toContain("OUTBOUND_PROXY_URL");
    expect(body.devEmailError).toContain("socks5");
  });

  it("SendGrid تنظیم‌شده + ایمیلِ ناشناس → هیچ فچی (ضد حدس‌زدن)", async () => {
    process.env.SENDGRID_API_KEY = "SG.test-key";
    process.env.SENDGRID_FROM_EMAIL = "noreply@example.com";

    await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ghost@example.com" }),
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("محدودیت ۹۰ ثانیه → پاسخ عمومی، بدون توکن جدید", async () => {
    seedUser();
    await forgotPasswordPOST(jsonRequest(FORGOT_URL, { email: "ali@example.com" }));
    expect(mockDb.passwordResetTokens).toHaveLength(1);

    const res2 = await forgotPasswordPOST(
      jsonRequest(FORGOT_URL, { email: "ali@example.com" }),
    );
    expect(res2.status).toBe(200);
    const body = await res2.json();
    expect(body.devLink).toBeUndefined();
    expect(mockDb.passwordResetTokens).toHaveLength(1);
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    resetMockDb();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  afterEach(() => {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  async function makeToken(userId = "user-1") {
    const created = await createPasswordResetToken(userId);
    if (created.status !== "created") throw new Error("must be created");
    return created.token;
  }

  it("توکن غلط → 400", async () => {
    seedUser();
    const res = await resetPasswordPOST(
      jsonRequest(RESET_URL, { token: "nope", password: "newPass123" }),
    );
    expect(res.status).toBe(400);
  });

  it("رمز کوتاه → 400 بدون تغییر رمز", async () => {
    seedUser();
    const token = await makeToken();
    const res = await resetPasswordPOST(
      jsonRequest(RESET_URL, { token, password: "123" }),
    );
    expect(res.status).toBe(400);
    expect(mockDb.users[0].password).not.toBeNull();
  });

  it("توکن منقضی → 400", async () => {
    seedUser();
    const token = await makeToken();
    mockDb.passwordResetTokens[0].expiresAt = new Date(Date.now() - 1000);

    const res = await resetPasswordPOST(
      jsonRequest(RESET_URL, { token, password: "newPass123" }),
    );
    expect(res.status).toBe(400);
  });

  it("جریان موفق: رمز جدید bcrypt + همهٔ توکن‌ها حذف", async () => {
    const user = seedUser();
    const oldHash = user.password as string;
    const token = await makeToken();
    // یک توکن دوم هم برای همان کاربر (شبیه درخواست تکراری قدیمی)
    await prismaMock.passwordResetToken.create({
      data: {
        userId: "user-1",
        tokenHash: hashResetToken("another-token-123"),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    expect(mockDb.passwordResetTokens).toHaveLength(2);

    const res = await resetPasswordPOST(
      jsonRequest(RESET_URL, { token, password: "brandNew456" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    // رمز عوض شده (هش جدید، نه قدیمی، و با متن خام منطبق)
    expect(mockDb.users[0].password).not.toBe(oldHash);
    expect(
      await bcrypt.compare("brandNew456", mockDb.users[0].password as string),
    ).toBe(true);
    expect(
      await bcrypt.compare("oldPass123", mockDb.users[0].password as string),
    ).toBe(false);

    // همهٔ توکن‌های کاربر باطل شدند (یک‌بارمصرف)
    expect(mockDb.passwordResetTokens).toHaveLength(0);

    // توکن مصرف‌شده دوباره کار نمی‌کند
    const res2 = await resetPasswordPOST(
      jsonRequest(RESET_URL, { token, password: "again789" }),
    );
    expect(res2.status).toBe(400);
  });

  it("appBaseUrl: بدون NEXTAUTH_URL → لوکال پیش‌فرض؛ با اسلش آخر → پاک", () => {
    delete process.env.NEXTAUTH_URL;
    expect(appBaseUrl()).toBe("http://localhost:3000");
    process.env.NEXTAUTH_URL = "https://site.com/";
    expect(appBaseUrl()).toBe("https://site.com");
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });
});
