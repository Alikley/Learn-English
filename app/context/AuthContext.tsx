"use client";

import { createContext, useContext, ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: {
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    phone?: string | null;
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

  const login = async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) return { error: "ایمیل یا رمز عبور اشتباه است" };
    router.push("/");
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

    router.push("/");
    return {};
  };

  const logout = () => signOut({ callbackUrl: "/login" });

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
