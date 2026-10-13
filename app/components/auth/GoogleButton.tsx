"use client";

// ========================================
// دکمهٔ ورود/ثبت‌نام با گوگل (v1.0.6.0 / English 1.0.1.3)
//
// - فقط وقتی رندر می‌شود که کلیدهای گوگل (GOOGLE_CLIENT_ID /
//   GOOGLE_CLIENT_SECRET) در .env تنظیم شده باشند — مقدار آن
//   از صفحهٔ سروری (login/register page) به‌صورت prop پاس می‌شود.
// - کلیک → signIn("google") → ریدایرکت کامل به گوگل → برگشت به
//   /home با نشست ساخته‌شده (بدون فرم، بدون رمز — کاهش اصطکاک)
// ========================================

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function GoogleButton({
  labelFa,
  labelEn,
}: {
  labelFa: string;
  labelEn: string;
}) {
  const { tr } = useLanguage();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        // ریدایرکت کامل به Google — بعد از بازگشت، صفحهٔ /home است
        signIn("google", { callbackUrl: "/home" });
      }}
      className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all duration-200"
    >
      {pending ? (
        <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
      ) : (
        <>
          <GoogleIcon />
          {tr(labelFa, labelEn)}
        </>
      )}
    </button>
  );
}
