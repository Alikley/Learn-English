import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/Prisma client";
import { requireAuth } from "@/lib/api-helpers";
import { reportError } from "@/lib/report-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ========================================
// POST /api/push/subscribe (v1.0.6.5 / English 1.0.1.8)
//
// ثبت اشتراک پوش OneSignal برای کاربرِ واردشده.
// مرورگر بعد از پذیرش اجازهٔ Notification، subscription ID خود
// را (از OneSignal SDK) اینجا می‌فرستد. کاربر می‌تواند چند
// دستگاه داشته باشد (هر دستگاه یک ردیف).
// ========================================

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => null);
    const subscriptionId =
      typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : "";

    if (!subscriptionId || subscriptionId.length < 8 || subscriptionId.length > 128) {
      return NextResponse.json(
        { error: "شناسهٔ اشتراک معتبر نیست" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.upsert({
      where: {
        userId_subscriptionId: { userId: auth.session.user.id, subscriptionId },
      },
      create: {
        userId: auth.session.user.id,
        subscriptionId,
      },
      update: {
        // آپدیت زمان — subscriptionId از قبل هست
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    reportError(e, { route: "/api/push/subscribe:POST" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

// ========================================
// DELETE /api/push/subscribe — قطع یادآور برای این دستگاه
// ========================================

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => null);
    const subscriptionId =
      typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : "";

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "شناسهٔ اشتراک لازم است" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: auth.session.user.id,
        subscriptionId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    reportError(e, { route: "/api/push/subscribe:DELETE" });
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
