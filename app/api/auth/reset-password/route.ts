import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/prisma-client";
import { reportError } from "@/lib/report-error";
import { findValidResetToken } from "@/lib/password-reset";
// v1.0.7.1 (English 1.0.1.14) — پارس بدنه با zod به‌جای دستی
import { validateObject, resetPasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// POST /api/auth/reset-password (v1.0.6.5 / English 1.0.1.8)
//
// ورودی: { token, password }
//
//  - توکن را با هش در DB پیدا می‌کند؛ منقضی (۳۰ دقیقه) یا
//    استفاده‌شده → 400
//  - رمز جدید (حداقل ۶ کاراکتر) با bcrypt (همان ثبت‌نام،
//    cost 12) ذخیره می‌شود
//  - بعد از موفقیت: همهٔ توکن‌های ریستِ آن کاربر حذف می‌شوند
//
// نکته: نشست‌های JWT قبلی قابل ابطال نیستند (استراتژی jwt) —
// مستند در DEPLOY.md؛ کاربر باید در مرورگرهای دیگر logout بزند.
// ========================================

/** توکنِ پیدا‌نشده/منقضی — همان پیام که اسکیما هم برای غایب بودن می‌دهد */
const INVALID_TOKEN_MSG =
  "لینک بازیابی نامعتبر است یا منقضی شده — دوباره از «فراموشی رمز» شروع کنید";

export async function POST(req: NextRequest) {
  try {
    // بدنهٔ خراب هم مثل قدیم همان پیام فرم را می‌دهد ({} → توکن غایب)
    const body = await req.json().catch(() => ({}));
    const parsed = validateObject(resetPasswordSchema, body);
    if (!parsed.ok) return parsed.response;
    const { token, password } = parsed.data;

    const row = await findValidResetToken(token);
    if (!row) {
      return NextResponse.json({ error: INVALID_TOKEN_MSG }, { status: 400 });
    }

    // آپدیت رمز
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: row.userId },
      data: { password: hashed },
    });

    // توکن را مصرف کن + باقی توکن‌های کاربر را هم باطل کن
    await prisma.passwordResetToken.deleteMany({
      where: { userId: row.userId },
    });

    return NextResponse.json({
      ok: true,
      message: "رمز عبور با موفقیت تغییر کرد — حالا وارد شوید",
    });
  } catch (e) {
    reportError(e, { route: "/api/auth/reset-password" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
