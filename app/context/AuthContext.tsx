"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: {
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    phone?: string | null;
    image?: string | null;
    id?: string;
  } | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  // v1.0.5.1 — پاکسازی کوکی سشنِ سرگردان:
  // نشستِ authenticated بدون user.id یعنی کوکیِ به‌جامانده از دیتابیسِ
  // قبلی که سرور آن را بی‌اعتبار کرده است. با signOut بدون ریدایرکت،
  // کوکی از مرورگر حذف می‌شود تا دفعهٔ بعد تمیز باشد؛ کاربر همین‌جا
  // مهمان می‌ماند و از لندینگ به داخل پریده نمی‌شود.
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ redirect: false });
    }
  }, [status, session]);

  const login = async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) return { error: "ایمیل یا رمز عبور اشتباه است" };
    // v1.0.5.0 — ریشه لندینگ عمومی شد؛ بعد از ورود مستقیم به پنل اصلی
    router.push("/home");
    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    // ۱. ثبت‌نام در دیتابیس
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "خطا در ثبت نام" };

    // ۲. ورود خودکار بعد از ثبت‌نام
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signInRes?.error) return { error: "ثبت نام موفق بود، لطفاً وارد شوید" };

    // v1.0.5.0 — بعد از ثبت‌نام مستقیم به پنل اصلی
    router.push("/home");
    return {};
  };

  // v1.0.5.0 — بعد از خروج، کاربر لندینگ را ببیند (نه صفحهٔ ورود)
  const logout = () => signOut({ callbackUrl: "/" });

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
