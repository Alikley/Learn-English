import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { reportError } from "@/lib/report-error";
import { sendEmail, isSendgridConfigured } from "@/lib/sendgrid";
import {
  createPasswordResetToken,
  buildResetEmail,
  appBaseUrl,
} from "@/lib/password-reset";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// POST /api/auth/forgot-password (v1.0.6.5 / English 1.0.1.8)
//
// ورودی: { email }
//
// همیشه پاسخِ موفقِ عمومی برمی‌گرداند (که با وجود/نبودِ ایمیل
// فرق نکند — کسی نتواند لیست اعضا را حدس بزند).
//
// اگر کاربر وجود داشته باشد:
//  - SendGrid تنظیم شده → ایمیل «بازیابی رمز» فرستاده می‌شود
//  - تنظیم نشده (حالت توسعه) → لینک فقط در کنسول سرور چاپ
//    می‌شود؛ و اگر NEXTAUTH_URL لوکال باشد، لینک در پاسخ هم
//    می‌آید (devLink) تا بدون SendGrid هم کل جریان قابل تست باشد
//
// محدودیت: هر ۹۰ ثانیه یک درخواست به ازای هر کاربر.
// ========================================

/** فقط وقتی SendGrid نیست و اپ لوکال است، لینک ریست در پاسخ می‌آید */
function isLocalDevMode(): boolean {
  const base = appBaseUrl();
  return (
    process.env.NODE_ENV !== "production" &&
    (base.startsWith("http://localhost") || base.startsWith("http://127.0.0.1"))
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "ایمیل معتبر وارد کنید" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // ⚠️ پاسخ همیشه یکسان — فارغ از وجود کاربر
    const generic = {
      ok: true,
      message:
        "اگر این ایمیل ثبت شده باشد، لینک بازیابی برایش فرستاده شد. صندوق ورودی (و پوشهٔ اسپم) را ببینید.",
    };

    if (!user || !user.id) return NextResponse.json(generic);

    // ساخت (یا محدودیت سرعت) توکن
    const created = await createPasswordResetToken(user.id);
    if (created.status !== "created") {
      // درخواست تکراری در ۹۰ ثانیه — همان پاسخ عمومی، بی‌سروصدا
      return NextResponse.json(generic);
    }

    const resetUrl = `${appBaseUrl()}/reset-password?token=${created.token}`;

    if (isSendgridConfigured()) {
      const result = await sendEmail({
        to: email,
        ...buildResetEmail(resetUrl),
      });
      if (!result.ok) {
        // ایمیل نرفت — جزئیات فقط در لاگ سرور می‌ماند تا وجود/
        // نبودِ حساب کاربری از بیرون قابل تشخیص نباشد
        console.error(
          `[forgot-password] ارسال ایمیل ناموفق (${email}): ${result.error}`,
        );
      }
    } else {
      // حالت توسعه — بدون SendGrid: لینک فقط در کنسول سرور
      console.log(
        `\n[forgot-password] حالت توسعه (SendGrid تنظیم نشده) — لینک بازیابی:\n${resetUrl}\n`,
      );
      if (isLocalDevMode()) {
        return NextResponse.json({ ...generic, devLink: resetUrl });
      }
    }

    return NextResponse.json(generic);
  } catch (e) {
    reportError(e, { route: "/api/auth/forgot-password" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
