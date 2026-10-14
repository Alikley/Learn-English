"use client";

// v1.0.6.6 (English 1.0.1.9) — فرم کلاینت «فراموشی رمز عبور».
// POST /api/auth/forgot-password → پیام عمومی (ضد حدس‌زدن اعضا).
// در حالت توسعه (SendGrid تنظیم نشده + NEXTAUTH_URL لوکال) سرور
// devLink برمی‌گرداند تا کل جریان بدون SendGrid قابل تست باشد.
//
// v1.0.6.6: اگر ارسال ایمیل ناموفق باشد (مثل 451 تحریمی) و اپ
// لوکال است، devLink + devEmailError برمی‌گردد — لینک روی صفحه
// نمایش داده می‌شود تا جریان کامل شود؛ به‌علاوه دکمهٔ «تشخیص
// خودکار» (GET /api/notify/diagnose) علت دقیق (کلید/فرستنده/IP
// بلاک/پروکسی) را دوزبانه نشان می‌دهد.
import { useLanguage } from "@/app/context/LanguageContext";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowRight, Mail, Send, Stethoscope } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type ForgotForm = { email: string };

type DiagnoseVerdict = { level: string; fa: string; en: string };

const VERDICT_STYLES: Record<string, string> = {
  ok: "text-green-700 dark:text-green-400",
  info: "text-slate-600 dark:text-slate-300",
  warn: "text-amber-700 dark:text-amber-400",
  error: "text-red-700 dark:text-red-400",
};

export default function ForgotPasswordForm() {
  const { tr, dir } = useLanguage();
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [devEmailError, setDevEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [verdicts, setVerdicts] = useState<DiagnoseVerdict[] | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setServerError("");
    setDevLink("");
    setDevEmailError("");
    setVerdicts(null);
    setSending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(body?.error || tr("خطا — دوباره تلاش کنید", "Error — try again"));
        return;
      }
      if (typeof body?.devLink === "string" && body.devLink) {
        setDevLink(body.devLink);
      }
      if (typeof body?.devEmailError === "string" && body.devEmailError) {
        setDevEmailError(body.devEmailError);
      }
      setSent(true);
    } catch {
      setServerError(
        tr("ارتباط با سرور برقرار نشد", "Could not reach the server"),
      );
    } finally {
      setSending(false);
    }
  };

  const runDiagnose = async () => {
    setDiagnosing(true);
    setVerdicts(null);
    try {
      const res = await fetch("/api/notify/diagnose").then((r) => r.json()).catch(() => null);
      if (res?.verdicts) {
        setVerdicts(res.verdicts as DiagnoseVerdict[]);
      } else {
        setServerError(
          tr("تشخیص خودکار در دسترس نبود — چند لحظه بعد دوباره امتحان کنید", "Auto-diagnose unavailable — try again in a moment"),
        );
      }
    } finally {
      setDiagnosing(false);
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
            {tr("بازیابی رمز عبور", "Password Recovery")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-8 border border-slate-100 dark:border-slate-700">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
                <Send size={26} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tr("ایمیل ارسال شد!", "Email Sent!")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-2">
                {tr(
                  `اگر «${getValues("email")}» ثبت شده باشد، لینک بازیابی برایش فرستاده شد. صندوق ورودی (و پوشهٔ اسپم) را ببینید.`,
                  `If "${getValues("email")}" is registered, a reset link was sent to it. Check your inbox (and spam folder).`,
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                {tr(
                  "لینک ۳۰ دقیقه اعتبار دارد و فقط یک بار قابل استفاده است.",
                  "The link is valid for 30 minutes and can be used once.",
                )}
              </p>

              {devEmailError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-right">
                  <p className="text-xs text-red-700 dark:text-red-400 mb-2 leading-6">
                    {tr(
                      "ارسال ایمیل ناموفق بود (جزئیات فقط در حالت لوکال نمایش داده می‌شود):",
                      "Email delivery failed (details only shown in local mode):",
                    )}
                  </p>
                  <p className="text-[11px] text-red-600 dark:text-red-300 break-all leading-5" dir="ltr">
                    {devEmailError}
                  </p>
                </div>
              )}

              {devLink && (
                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-right">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2 leading-6">
                    {devEmailError
                      ? tr(
                          "چون ایمیل نرفت، لینک بازیابی اینجا هم نمایش داده شد (فقط حالت لوکال):",
                          "Since the email failed, the reset link is shown here too (local mode only):",
                        )
                      : tr(
                          "حالت توسعه (SendGrid تنظیم نشده) — لینک اینجا هم نمایش داده شد:",
                          "Dev mode (SendGrid not configured) — link shown here too:",
                        )}
                  </p>
                  <a
                    href={devLink}
                    className="block text-[11px] text-amber-800 dark:text-amber-300 break-all font-mono underline underline-offset-2"
                  >
                    {devLink}
                  </a>
                </div>
              )}

              <button
                onClick={runDiagnose}
                disabled={diagnosing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors mb-3"
              >
                {diagnosing ? (
                  <span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-500 rounded-full animate-spin" />
                ) : (
                  <Stethoscope size={16} />
                )}
                {tr("ایمیل نیامد؟ تشخیص خودکار مشکل", "No email? Auto-diagnose")}
              </button>

              {verdicts && (
                <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-xl text-xs leading-6 space-y-1.5 text-right">
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {tr("نتیجهٔ تشخیص خودکار:", "Auto-diagnose results:")}
                  </p>
                  {verdicts.map((v, i) => (
                    <p key={i} className={VERDICT_STYLES[v.level] ?? VERDICT_STYLES.info}>
                      {tr(v.fa, v.en)}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setSent(false);
                  setDevLink("");
                  setDevEmailError("");
                }}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-3"
              >
                {tr("ارسال مجدد به ایمیل دیگر", "Send to another email")}
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <ArrowRight size={16} />
                {tr("بازگشت به ورود", "Back to Login")}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                {tr("فراموشی رمز عبور", "Forgot Password")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-7 mb-6">
                {tr(
                  "ایمیل حساب خود را وارد کنید تا لینک بازیابی رمز برایتان ارسال شود.",
                  "Enter your account email and we'll send you a reset link.",
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
                    {tr("ایمیل", "Email")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      dir="ltr"
                      placeholder="example@email.com"
                      {...register("email", {
                        required: tr("ایمیل را وارد کنید", "Enter your email"),
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: tr("ایمیل معتبر نیست", "Invalid email address"),
                        },
                      })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                        errors.email
                          ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-500/25"
                          : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/25 focus:bg-white dark:focus:bg-slate-800"
                      }`}
                    />
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  {sending ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {tr("ارسال لینک بازیابی", "Send Reset Link")}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {tr("به یاد آوردید؟ وارد شوید", "Remembered? Log in")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
