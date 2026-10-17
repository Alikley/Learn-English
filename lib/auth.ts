import { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/prisma-client";

// ========================================
// v1.0.5.1 (English 1.0.1.1) — رفع باگ
// «پرش خودکار از لندینگ به داخل برنامه بدون ثبت‌نام»
//
// ریشه: NextAuth با استراتژی jwt فقط امضای کوکی سشن را چک می‌کند
// و دیتابیس را نمی‌بیند. اگر دیتابیس بازسازی شده باشد (مثلاً
// مایگریشن تازه روی دیتابیس خالی) ولی کوکی سشنِ به‌جامانده از
// ورودِ قبلی هنوز در مرورگر باشد، /api/auth/session یک «کاربرِ
// سرگردان» برمی‌گرداند — بدون اینکه حتی یک رکورد کاربر در
// دیتابیس وجود داشته باشد. نتیجه: AuthGuard مهمان را همان لحظه
// از لندینگ (/) به پنل اصلی (/home) می‌پراند.
//
// راه‌حل: callback سشن پیش از تحویلِ نشست، وجود رکورد کاربر را در
// دیتابیس چک می‌کند (کش ۶۰ ثانیه‌ای به ازای هر کاربر تا DB در
// هر درخواست کتک نخورد). اگر کاربر موجود نبود، نشست «بدون کاربر»
// برگردانده می‌شود → کلاینت مهمان می‌ماند و AuthContext کوکیِ
// سرگردان را پاک می‌کند.
//
// خطای موقت DB → نشست معتبر فرض می‌شود (رفتار ایمن: خروج گروهی
// کاربران واقعی هنگام هیکپِ لحظه‌ای دیتابیس نداریم).
//
// v1.0.6.4 (English 1.0.1.7) — حذف کامل ورود با گوگل:
// provider گوگل، اتصال حساب و تمام کد/کلید/پروکسی مرتبط با آن
// به درخواست کاربر حذف شدند. ورود فقط با ایمل + رمز عبور است.
// ========================================

const SESSION_USER_CHECK_TTL_MS = 60_000;
const sessionUserCache = new Map<string, { ok: boolean; at: number }>();

async function sessionUserExists(userId: string): Promise<boolean> {
  const hit = sessionUserCache.get(userId);
  if (hit && Date.now() - hit.at < SESSION_USER_CHECK_TTL_MS) return hit.ok;

  let ok = true;
  try {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    ok = row !== null;
  } catch {
    // DB در دسترس نیست → نشست را بی‌اعتبار نکن
    ok = true;
  }

  sessionUserCache.set(userId, { ok, at: Date.now() });
  return ok;
}

export const authOptions: NextAuthOptions = {
  // استراتژی jwt — جدول Account لازم نیست → بدون مایگریشن.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      const userId = token.id as string | undefined;

      // کوکی سرگردان (کاربر در دیتابیس نیست یا شناسه ندارد) →
      // نشست بدون کاربر برگردان → کلاینت مهمان دیده می‌شود
      if (!userId || !(await sessionUserExists(userId))) {
        return { ...session, user: undefined } as unknown as Session;
      }

      if (session.user) session.user.id = userId;
      return session;
    },
  },
};
