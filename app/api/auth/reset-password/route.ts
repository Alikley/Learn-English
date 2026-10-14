import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/Prisma client";
import { reportError } from "@/lib/report-error";
import { findValidResetToken } from "@/lib/password-reset";

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

const INVALID_TOKEN_MSG =
  "لینک بازیابی نامعتبر است یا منقضی شده — دوباره از «فراموشی رمز» شروع کنید";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: INVALID_TOKEN_MSG }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 },
      );
    }
    if (password.length > 100) {
      return NextResponse.json(
        { error: "رمز عبور حداکثر ۱۰۰ کاراکتر باشد" },
        { status: 400 },
      );
    }

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
