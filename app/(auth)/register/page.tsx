"use client";
import { localizeMessage } from "@/lib/message-i18n";
import { useLanguage } from "@/app/context/LanguageContext";

import { useForm } from "react-hook-form";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const { tr, dir } = useLanguage();
  const { register: registerUser, isLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    const res = await registerUser(data.name, data.email, data.password);
    if (res?.error) setServerError(res.error);
  };

  return (
    <div
      className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-[#0b1220] relative flex items-center justify-center p-4"
      dir={dir}
    >
      <div className="absolute top-4 left-4 z-10 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-slate-100 dark:border-slate-700 shadow-sm">
            <ThemeToggle />
          </div>
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            flex <span className="text-slate-900 dark:text-slate-100">English</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {tr("یادگیری رو همین الان شروع کن", "Start learning right now")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {tr("ساخت حساب جدید", "Create a New Account")}
          </h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {localizeMessage(serverError)}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {tr("نام و نام خانوادگی", "Full Name")}
              </label>
              <input
                type="text"
                placeholder={tr("مثلاً: علی مرادی", "e.g. Ali Moradi")}
                {...register("name", {
                  required: tr("نام را وارد کنید", "Enter your name"),
                  minLength: { value: 3, message: tr("حداقل ۳ کاراکتر", "At least 3 characters") },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${errors.name ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {tr("ایمیل", "Email")}
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                {...register("email", {
                  required: tr("ایمیل را وارد کنید", "Enter your email"),
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: tr("ایمیل معتبر نیست", "Invalid email address"),
                  },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${errors.email ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {tr("رمز عبور", "Password")}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={tr("حداقل ۶ کاراکتر", "At least 6 characters")}
                  {...register("password", {
                    required: tr("رمز عبور را وارد کنید", "Enter your password"),
                    minLength: { value: 6, message: tr("حداقل ۶ کاراکتر", "At least 6 characters") },
                  })}
                  className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm outline-none transition-all duration-200 ${errors.password ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {tr("تکرار رمز عبور", "Repeat Password")}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder={tr("رمز عبور را دوباره وارد کنید", "Enter the password again")}
                  {...register("confirmPassword", {
                    required: tr("تکرار رمز عبور را وارد کنید", "Enter the password confirmation"),
                    validate: (val) =>
                      val === watch("password") ||
                      tr("رمز عبور و تکرار آن یکسان نیستند", "Password and confirmation do not match"),
                  })}
                  className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm outline-none transition-all duration-200 ${errors.confirmPassword ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  {tr("ثبت نام", "Sign Up")}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {tr("قبلاً ثبت نام کردی؟", "Already registered?")}{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                {tr("وارد شو", "Log In")}
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          {tr("با ثبت نام، قوانین و حریم خصوصی flex English را می‌پذیری", "By signing up, you accept the flex English terms and privacy policy")}
        </p>
      </div>
    </div>
  );
}
