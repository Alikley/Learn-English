import Link from "next/link";

// ========================================
// not-found — صفحهٔ ۴۰۴ فارسی (v1.0.7.1 / English 1.0.1.14 / گام ۲)
//
// قبل از این نسخه سایت «صفحهٔ ۴۰۴» نداشت: هر آدرس غلط
// مثل /dasboard یا /coures فقط سفید/بی‌جواب می‌ماند و کاربر
// ایرانی راهی برای برگشتن نداشت.
//
// این صفحه داخل روت layout رندر می‌شود — یعنی ناوبار و
// سایدبار سایت سر جایشان هستند و کاربر همیشه می‌تواند
// از منو مسیرش را پیدا کند. طراحی همان هویت بصری سایت
// است (اسلیت + آبی، دارک‌مود کلاس‌محور، RTL).
//
// کامپوننت سروری است — هیچ state/hook ندارد؛ دکمه‌ها
// Link هستند تا prefetch شوند.
// ========================================

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-[70vh] flex-1 items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-lg">
        {/* —— کارت اصلی —— */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 md:p-12">
          {/* عدد ۴۰۴ — بزرگ و فارسی */}
          <div className="mb-2 select-none text-7xl font-black tracking-tight text-blue-600 dark:text-blue-400 md:text-8xl">
            ۴۰۴
          </div>

          {/* نشان کتاب گمشده */}
          <div className="mb-5 text-5xl" aria-hidden="true">
            🧭
          </div>

          <h1 className="mb-3 text-xl font-extrabold text-slate-900 dark:text-slate-100 md:text-2xl">
            صفحه‌ای که دنبالش بودی پیدا نشد!
          </h1>

          <p className="mx-auto mb-2 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
            شاید آدرس را اشتباه تایپ کرده‌ای، یا این صفحه حذف/جابه‌جا شده
            است. نگران نباش — درس‌ها و پیشرفتت همه سر جایشان هستند.
          </p>
          <p className="mb-8 text-xs text-slate-400 dark:text-slate-500" dir="ltr">
            The page you are looking for does not exist or has been moved.
          </p>

          {/* —— دکمه‌های مسیریابی —— */}
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Link
              href="/home"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              🏠 بازگشت به خانه
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              📚 دوره‌های آموزشی
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              💬 پرسش از بچه‌ها
            </Link>
          </div>
        </div>

        {/* —— راهنمای آدرس‌های پرکاربرد (زیر کارت) —— */}
        <p className="mt-6 text-center text-xs leading-6 text-slate-400 dark:text-slate-500">
          آدرس‌های اصلی:{" "}
          <Link
            href="/home"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            خانه
          </Link>{" "}
          ·{" "}
          <Link
            href="/dashboard"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            داشبورد
          </Link>{" "}
          ·{" "}
          <Link
            href="/vocab"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            لغت‌نامه
          </Link>{" "}
          ·{" "}
          <Link
            href="/game"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            بازی‌ها
          </Link>
        </p>
      </div>
    </main>
  );
}
