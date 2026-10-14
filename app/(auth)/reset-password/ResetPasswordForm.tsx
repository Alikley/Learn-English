"use client";

// v1.0.6.5 — فرم کلاینت «رمز جدید» (از لینک ایمیل).
// POST /api/auth/reset-password { token, password }
import { useLanguage } from "@/app/context/LanguageContext";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type ResetForm = { password: string; confirm: string };

export default function ResetPasswordForm() {
  const { tr, dir } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetForm>();

  const onSubmit = async (data: ResetForm) => {
    setServerError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(
          body?.error || tr("خطا — دوباره تلاش کنید", "Error — try again"),
        );
        return;
      }
      setDone(true);
      // بعد از ۴ ثانیه خودکار به ورود برو
      setTimeout(() => router.push("/login"), 4000);
    } catch {
      setServerError(
        tr("ارتباط با سرور برقرار نشد", "Could not reach the server"),
      );
    } finally {
      setBusy(false);
    }
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
            {tr("تعیین رمز عبور جدید", "Set a New Password")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-8 border border-slate-100 dark:border-slate-700">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tr("رمز عبور تغییر کرد!", "Password Changed!")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-6">
                {tr(
                  "حالا با رمز جدید وارد شوید. چند لحظهٔ دیگر به صفحهٔ ورود منتقل می‌شوید…",
                  "Now log in with your new password. Redirecting to login…",
                )}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <KeyRound size={16} />
                {tr("رفتن به ورود", "Go to Login")}
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                <KeyRound size={26} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tr("لینک نامعتبر است", "Invalid Link")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-6">
                {tr(
                  "لینک بازیابی ناقص است. از ایمیل ارسال‌شده، دوباره روی دکمهٔ «بازیابی رمز عبور» کلیک کنید.",
                  "The reset link is incomplete. Open the email again and click the reset button.",
                )}
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                {tr("درخواست لینک جدید", "Request a new link")}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tr("رمز جدید", "New Password")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-6">
                {tr(
                  "رمز جدید خود را انتخاب کنید (حداقل ۶ کاراکتر). بعد از تغییر، رمز قبلی دیگر کار نمی‌کند.",
                  "Choose a new password (min 6 characters). Your old password stops working after this.",
                )}
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {tr("رمز عبور جدید", "New Password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder={tr("حداقل ۶ کاراکتر", "At least 6 characters")}
                      {...register("password", {
                        required: tr("رمز جدید را وارد کنید", "Enter the new password"),
                        minLength: {
                          value: 6,
                          message: tr("حداقل ۶ کاراکتر", "At least 6 characters"),
                        },
                      })}
                      className={`w-full px-4 py-3 pl-11 rounded-xl border text-sm outline-none transition-all duration-200 ${
                        errors.password
                          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25"
                          : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={tr("نمایش/مخفی رمز", "Show/hide password")}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {tr("تکرار رمز جدید", "Confirm New Password")}
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={tr("دوباره رمز را وارد کنید", "Enter it again")}
                    {...register("confirm", {
                      required: tr("تکرار رمز الزامی است", "Confirm is required"),
                      validate: (v) =>
                        v === getValues("password") ||
                        tr("رمزها یکسان نیستند", "Passwords don't match"),
                    })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                      errors.confirm
                        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25"
                        : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"
                    }`}
                  />
                  {errors.confirm && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.confirm.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  {busy ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound size={16} />
                  )}
                  {tr("ثبت رمز جدید", "Set New Password")}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {tr("انصراف و بازگشت به ورود", "Cancel and go to login")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
