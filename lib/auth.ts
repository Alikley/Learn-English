import { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/Prisma client";

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
// ========================================

// ========================================
// v1.0.6.0 (English 1.0.1.3) — ورود با گوگل
//
// فعال‌سازی: GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET در .env
// (خالی = دکمهٔ گوگل در فرم‌ها مخفی می‌شود — مثل قبل).
//
// چطور بدون مایگریشن کار می‌کند؟
//  NextAuth برای OAuth همیشه جدول Account می‌خواهد؛ به‌جای آن،
//  اتصال در callback jwt انجام می‌شود:
//   ۱) ایمیلی که گوگل (صاحبِ تأییدشدهٔ ایمیل) برمی‌گرداند را در
//      جدول user جستجو می‌کنیم:
//      - هست (مثلاً قبلاً با همان ایمیل ثبت‌نام کرده) → همان حساب
//        به ورود با گوگل هم وصل می‌شود (کاهش اصطکاک!)
//      - نیست → کاربر تازه با streak صفر (قانون ۱.۰.1.2: استریک
//        فقط با تمام‌کردن فعالیت فعال می‌شود) ساخته می‌شود
//   ۲) token.id = شناسهٔ رکورد DB → بقیهٔ زنجیره (چک سشن،
//      AuthGuard و…) دقیقاً مثل ورود با رمز کار می‌کند
// ========================================

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** آیا ورود با گوگل با کلیدهای .env فعال شده است؟ */
export const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);

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

/** ساخت یا اتصال کاربر DB برای ورود با گوگل — خروجی: شناسهٔ کاربر DB */
async function linkGoogleUser(profile: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}): Promise<string | null> {
  const email = profile.email?.trim().toLowerCase() || null;
  if (!email) return null; // گوگل ایمیل نداد → نشست بدون کاربر

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // اکانت موجود (مثلاً ثبت‌نام رمزی با همین ایمیل) → همان حساب
    // پروفایل خالی را از گوگل تکمیل کن (بدون بازنویسی نام کاربر)
    if (!existing.image && profile.image) {
      try {
        await prisma.user.update({
          where: { id: existing.id },
          data: { image: profile.image },
        });
      } catch {
        // فقط تصویر بود — ناکامی مهم نیست
      }
    }
    return existing.id;
  }

  // کاربر تازه — streak با current=0 (قانون ۱.۰.1.2)
  const created = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: profile.name?.trim() || null,
      nickname: profile.name?.trim() || null,
      email,
      image: profile.image ?? null,
      streak: {
        create: { current: 0, longest: 0 },
      },
    },
    select: { id: true },
  });

  return created.id;
}

export const authOptions: NextAuthOptions = {
  // v1.0.6.0 — adapter حذف شد: استراتژی jwt است و برای OAuth هم
  // اتصال کاربر در callback jwt انجام می‌شود؛ جدول Account لازم
  // نیست → بدون مایگریشن، دیتابیس دست نمی‌خورد.
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
    // ⚙️ فقط وقتی کلیدها در .env هستند اضافه می‌شود
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // ---- ورود با گوگل: ساخت/اتصال کاربر DB ----
      if (user && account?.provider === "google") {
        const dbId = await linkGoogleUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
        if (!dbId) {
          // بدون ایمیل قابل‌اتکا → نشست بدون کاربر
          return token;
        }
        token.id = dbId;
        return token;
      }

      // ---- ورود با رمز (رفتار قبلی) ----
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
