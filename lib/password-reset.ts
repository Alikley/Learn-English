// ========================================
// v1.0.6.5 (English 1.0.1.8) — بازیابی رمز عبور
//
// جریان:
//  ۱) کاربر ایمیلش را در /forgot-password وارد می‌کند
//  ۲) سرور توکن تصادفی ۳۲ بایتی می‌سازد، فقط SHA-256 آن را در
//     جدول PasswordResetToken ذخیره می‌کند (۳۰ دقیقه اعتبار)
//     و لینک /reset-password?token=... با SendGrid ایمیل می‌شود
//  ۳) کاربر روی دکمهٔ ایمیل کلیک می‌کند و رمز جدید می‌گذارد
//  ۴) توکن مصرف می‌شود + همهٔ توکن‌های دیگر آن کاربر باطل
//
// امنیت:
//  - توکن خام فقط در ایمیل است؛ DB لو برود هم بی‌فایده است
//  - توکن‌ها یک‌بارمصرف و ۳۰ دقیقه‌ای هستند
//  - برای هر درخواست، توکن‌های قبلیِ استفاده‌نشده حذف می‌شوند
//    (فقط آخرین لینک کار می‌کند)
//  - محدودیت سرعت: حداکثر یک درخواست هر ۹۰ ثانیه به ازای کاربر
// ========================================

import crypto from "crypto";
import { prisma } from "@/prisma/Prisma client";

/** عمر توکن — ۳۰ دقیقه */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
/** حداقل فاصلهٔ بین دو درخواست فراموشی رمز برای یک کاربر */
export const RESET_RATE_LIMIT_MS = 90 * 1000;

/** هش SHA-256 (هگز) از توکن خام — چیزی که در DB می‌نشیند */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type CreateResetResult =
  | { status: "created"; token: string }
  | { status: "rate-limited" };

/**
 * ساخت توکن ریست برای کاربر — توکن‌های قبلیِ استفاده‌نشده حذف
 * می‌شوند (فقط آخرین لینک معتبر می‌ماند). اگر کاربر تازه
 * (کمتر از ۹۰ ثانیه پیش) درخواست داده باشد → rate-limited.
 */
export async function createPasswordResetToken(
  userId: string,
): Promise<CreateResetResult> {
  const rateCutoff = new Date(Date.now() - RESET_RATE_LIMIT_MS);
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId, createdAt: { gte: rateCutoff } },
    select: { id: true },
  });
  if (recent) return { status: "rate-limited" };

  // توکن‌های قبلیِ استفاده‌نشده حذف — لینک‌های قدیمی باطل
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  return { status: "created", token };
}

export type ValidTokenRow = {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

/** پیداکردن توکنِ معتبر (هش) — منقضی/مصرف‌شده = null */
export async function findValidResetToken(
  token: string,
): Promise<ValidTokenRow | null> {
  if (!token) return null;
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!row) return null;
  if (row.usedAt) return null;
  if (new Date(row.expiresAt).getTime() <= Date.now()) return null;
  return row;
}

/**
 * ساختِ ایمیل بازیابی رمز (دوزبانه — فارسی اول).
 * خروجی آمادهٔ sendEmail از lib/sendgrid.ts
 */
export function buildResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "بازیابی رمز عبور — Flex English";

  const text = [
    "سلام!",
    "",
    "این ایمیل برای بازیابی رمز عبور حساب Flex English شماست.",
    `لینک بازیابی (۳۰ دقیقه اعتبار دارد): ${resetUrl}`,
    "",
    "اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید —",
    "رمز شما تغییر نمی‌کند.",
    "",
    "— تیم Flex English",
    "",
    "Hi! You requested a password reset for your Flex English account.",
    `Reset link (valid for 30 minutes): ${resetUrl}`,
    "If you didn't request this, just ignore this email.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;text-align:center">
            <div style="font-size:22px;font-weight:bold;color:#ffffff">
              flex <span style="font-weight:normal">English</span>
            </div>
            <div style="font-size:13px;color:#dbeafe;margin-top:6px">Password Reset — بازیابی رمز عبور</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 12px;font-size:15px;color:#0f172a;line-height:1.9">
              سلام! 👋
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:2">
              شما درخواست بازیابی رمز عبور کرده‌اید. روی دکمهٔ زیر بزنید و
              رمز جدید انتخاب کنید. این لینک فقط <b>۳۰ دقیقه</b> اعتبار دارد
              و فقط یک بار قابل استفاده است.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0 24px">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;
                          font-weight:bold;font-size:15px;padding:14px 40px;border-radius:12px">
                  بازیابی رمز عبور
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.9;direction:ltr;text-align:left">
              If the button doesn't work, copy this link:<br>
              <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.9">
              🔒 اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید —
              رمز شما بدون کلیک روی این لینک تغییر نمی‌کند.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#94a3b8">
            Flex English — یادگیری زبان به ساده‌ترین شکل
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

/** آدرسِ پایهٔ اپ — از NEXTAUTH_URL (همان که از قبل در .env هست) */
export function appBaseUrl(): string {
  const raw = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
