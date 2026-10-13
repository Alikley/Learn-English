"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  PenLine,
  Library,
  Gamepad2,
  MessagesSquare,
  Sun,
  Moon,
  Globe,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";

// ========================================
// لندینگ پیج عمومی (v1.0.5.0 / English 1.0.1.0)
//
// ریشهٔ سایت برای بازدیدکنندهٔ جدید: معرفی امکانات،
// انیمیشن ورود/شناور، شمارندهٔ آمار، دوزبانه (fa/en با
// جهت درست)، دارک‌مود و دکمه‌های ثبت‌نام/ورود.
//
// v1.0.5.2 (English 1.0.1.2): این ویو از app/page.tsx (که حالا
// کامپوننت سروری است) رندر می‌شود. سرور قبل از رندر، نشست را چک
// می‌کند و کاربرِ واردشده را با ریدایرکتِ سرور به /home می‌فرستد —
// یعنی لندینگ دیگر حتی یک لحظه هم برای کاربرِ لاگین‌شده فلش نمی‌زند.
// ========================================

const CONTENT = {
  fa: {
    nav: { features: "امکانات", how: "چطور کار می‌کند", login: "ورود", register: "ثبت‌نام رایگان" },
    hero: {
      badge: "پلتفرم آموزش انگلیسی با هوش مصنوعی",
      title1: "یادگیری انگلیسی،",
      title2: "به روش خودت",
      sub: "۲۱ کتاب کمبریج با برگهٔ امتحانی هوشمند، تصحیح رایتینگ با AI، لغت‌نامه جعبه‌لایتنر، بازی‌های آموزشی و دوره‌های گام‌به‌گام — همه در یک جا.",
      ctaRegister: "شروع رایگان",
      ctaLogin: "ورود به حساب",
      ctaPanel: "ورود به پنل کاربری",
      note: "بدون کارت بانکی — همین حالا امتحان کن",
    },
    stats: [
      { value: 21, suffix: "", label: "کتاب کمبریج" },
      { value: 84, suffix: "", label: "آزمون کامل" },
      { value: 3, suffix: "", label: "مهارت اصلی" },
      { value: 120, suffix: "+", label: "درس تعاملی" },
    ],
    featuresTitle: "همه‌چیز برای رسیدن به بند رویایی",
    featuresSub: "از سطح مبتدی تا آمادگی کامل آیلتس — مسیرت را خودت انتخاب کن",
    features: [
      {
        icon: BookOpen,
        title: "کتابخانهٔ کمبریج",
        body: "۲۱ کتاب رسمی کمبریج با PDF اصلی و فایل‌های صوتی — تست‌های واقعی با تایمر آزمون.",
      },
      {
        icon: Sparkles,
        title: "برگه‌ساز هوش مصنوعی",
        body: "سوال‌های هر تست به‌صورت ساختاریافته از خود PDF استخراج می‌شوند — پاسخ‌برگ تعاملی و کلید خودکار.",
      },
      {
        icon: PenLine,
        title: "تصحیح رایتینگ AI",
        body: "متن‌ات را بنویس؛ غلط‌های املایی و گرامری، نقاط قوت و پیشنهادهای بهبود را با نمره بگیر.",
      },
      {
        icon: GraduationCap,
        title: "دوره‌های گام‌به‌گام",
        body: "گرامر، مکالمه و واژگان در سه سطح مبتدی، متوسط و پیشرفته با درس‌های تعاملی.",
      },
      {
        icon: Library,
        title: "لغت‌نامه هوشمند",
        body: "ترجمهٔ لحظه‌ای کلمات + جعبه‌های لایتنر برای مرور طلایی واژگان قبل از فراموشی.",
      },
      {
        icon: Gamepad2,
        title: "بازی‌های آموزشی",
        body: "مچمور، هنگمن و کوییز سرعتی — یادگیری وقتی خسته‌کننده نمی‌شود.",
      },
    ],
    howTitle: "چطور کار می‌کند؟",
    how: [
      { title: "ثبت‌نام رایگان", body: "فقط یک ایمیل و رمز — کمتر از یک دقیقه." },
      { title: "مسیرت را انتخاب کن", body: "آیلتس، دوره‌ها، لغت‌نامه یا بازی — از هرجا شروع کن." },
      { title: "تمرین کن و پیشرفت ببین", body: "نمره‌ها، استریک روزانه و گزارش پیشرفت همیشه همراهت." },
    ],
    ctaTitle: "امروز اولین قدم را بردار",
    ctaSub: "به هزاران یادگیرنده بپیوند — یادگیری انگلیسی دیگر سخت نیست.",
    ctaButton: "ساخت حساب رایگان",
    footer: "Flex English — یادگیری انگلیسی به روش خودت",
  },
  en: {
    nav: { features: "Features", how: "How it works", login: "Log in", register: "Sign up free" },
    hero: {
      badge: "AI-powered English learning platform",
      title1: "Learn English,",
      title2: "your own way",
      sub: "21 Cambridge books with smart exam papers, AI writing correction, Leitner-box vocabulary, educational games and step-by-step courses — all in one place.",
      ctaRegister: "Start for free",
      ctaLogin: "Log in",
      ctaPanel: "Go to dashboard",
      note: "No credit card — try it right now",
    },
    stats: [
      { value: 21, suffix: "", label: "Cambridge books" },
      { value: 84, suffix: "", label: "Full tests" },
      { value: 3, suffix: "", label: "Core skills" },
      { value: 120, suffix: "+", label: "Interactive lessons" },
    ],
    featuresTitle: "Everything you need to hit your dream band",
    featuresSub: "From beginner to full IELTS readiness — choose your own path",
    features: [
      {
        icon: BookOpen,
        title: "Cambridge library",
        body: "21 official Cambridge books with original PDFs and audio — real tests with exam timer.",
      },
      {
        icon: Sparkles,
        title: "AI exam paper builder",
        body: "Questions of every test are extracted from the actual PDF — interactive answer sheet and auto key.",
      },
      {
        icon: PenLine,
        title: "AI writing correction",
        body: "Write your text; get spelling and grammar fixes, strengths and improvement tips with a score.",
      },
      {
        icon: GraduationCap,
        title: "Step-by-step courses",
        body: "Grammar, conversation and vocabulary in three levels with interactive lessons.",
      },
      {
        icon: Library,
        title: "Smart dictionary",
        body: "Instant word translation + Leitner boxes for golden-review before forgetting.",
      },
      {
        icon: Gamepad2,
        title: "Educational games",
        body: "Memory, hangman and speed quiz — learning that never gets boring.",
      },
    ],
    howTitle: "How it works?",
    how: [
      { title: "Sign up free", body: "Just an email and password — under a minute." },
      { title: "Pick your path", body: "IELTS, courses, dictionary or games — start anywhere." },
      { title: "Practice & progress", body: "Scores, daily streak and progress reports always with you." },
    ],
    ctaTitle: "Take your first step today",
    ctaSub: "Join thousands of learners — English doesn't have to be hard.",
    ctaButton: "Create free account",
    footer: "Flex English — learn English your own way",
  },
} as const;

// ---------- شمارندهٔ انیمیشنی ----------

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("fa-IR").replace(/[\u0660-\u0669]/g, (d) =>
        String(d.charCodeAt(0) - 0x0660),
      )}
      {suffix}
    </span>
  );
}

// ---------- لندینگ ----------

export default function LandingView() {
  const { lang, mounted, setLang } = useLanguage();
  const { theme, toggle: toggleTheme, mounted: themeMounted } = useTheme();
  const { user, isLoading } = useAuth();
  const t = CONTENT[mounted ? lang : "fa"];
  const dir = mounted && lang === "en" ? "ltr" : "rtl";
  const loggedIn = mounted && !isLoading && !!user;

  return (
    <div
      dir={dir}
      className="min-h-screen flex flex-col bg-[#f8fbff] dark:bg-[#0b1220] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-clip"
    >
      {/* ================= نوار بالا ================= */}
      <header className="sticky top-0 z-50 border-b border-blue-100/60 dark:border-slate-800 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/25">
              E
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              flex <span className="text-slate-900 dark:text-slate-100">English</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.features}
            </a>
            <a href="#how" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.nav.how}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((mounted ? lang : "fa") === "fa" ? "en" : "fa")}
              aria-label={lang === "fa" ? "English" : "فارسی"}
              className="h-10 px-3 flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-transform"
            >
              <Globe className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {lang === "fa" ? "EN" : "فا"}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Light Mode" : "Dark Mode"}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-transform"
            >
              {themeMounted && theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="h-10 px-4 flex items-center rounded-full border border-blue-200 dark:border-slate-700 text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="h-10 px-4 flex items-center rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors"
              >
                {t.nav.register}
              </Link>
            </div>
            {/* موبایل: فقط دکمهٔ ثبت‌نام */}
            <Link
              href="/register"
              className="sm:hidden h-10 px-4 flex items-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              {t.nav.register}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ================= هیرو ================= */}
        <section className="relative">
          {/* حباب‌های پس‌زمینهٔ شناور */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <motion.div
              animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-16 start-[8%] w-64 h-64 rounded-full bg-blue-300/25 dark:bg-blue-500/10 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-24 end-[4%] w-56 h-56 rounded-full bg-sky-300/25 dark:bg-sky-500/10 blur-2xl"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 start-[42%] w-72 h-72 rounded-full bg-indigo-200/20 dark:bg-indigo-400/5 blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-14 md:pt-24 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-6 items-center">
            {/* متن */}
            <div className={`order-2 md:order-1 ${dir === "rtl" ? "md:pe-6" : "md:ps-6"}`}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm"
              >
                <Sparkles size={13} />
                {t.hero.badge}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                className="mt-5 text-3xl sm:text-4xl md:text-[52px] leading-[1.15] font-black tracking-tight"
              >
                {t.hero.title1}
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent">
                  {t.hero.title2}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
                className="mt-5 text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300 max-w-xl"
              >
                {t.hero.sub}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                {loggedIn ? (
                  <Link
                    href="/home"
                    className="h-12 px-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.03] active:scale-95 transition-all"
                  >
                    {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                    {t.hero.ctaPanel}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="h-12 px-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.03] active:scale-95 transition-all"
                    >
                      {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                      {t.hero.ctaRegister}
                    </Link>
                    <Link
                      href="/login"
                      className="h-12 px-6 inline-flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {t.hero.ctaLogin}
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
              >
                <CheckCircle2 size={13} className="text-emerald-500" />
                {t.hero.note}
              </motion.p>
            </div>

            {/* تصویر/شخصیت با کارت‌های شناور */}
            <div className="order-1 md:order-2 relative h-64 sm:h-80 md:h-[420px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="absolute inset-0 flex items-end justify-center"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-[78%] md:w-[88%] h-full"
                >
                  <Image
                    src="/assets/student_image.svg"
                    alt="Flex English student"
                    fill
                    priority
                    className="object-contain drop-shadow-[0_18px_28px_rgba(30,64,175,0.18)] dark:opacity-90"
                  />
                </motion.div>
              </motion.div>

              {/* کارت شناور ۱ — نمرهٔ بند */}
              <motion.div
                initial={{ opacity: 0, x: dir === "rtl" ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
                className="absolute top-6 start-0 md:start-2"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-900/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                      7.5
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {lang === "fa" ? "نمرهٔ بند" : "Band score"}
                      </p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {lang === "fa" ? "هدف بعدی تو" : "Your next goal"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* کارت شناور ۲ — جعبهٔ لایتنر */}
              <motion.div
                initial={{ opacity: 0, x: dir === "rtl" ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="absolute bottom-10 end-0 md:end-2"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-900/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Library size={17} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {lang === "fa" ? "جعبهٔ لایتنر" : "Leitner box"}
                      </p>
                      <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {lang === "fa" ? "مرور طلایی واژگان" : "Golden review"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* کارت شناور ۳ — تصحیح AI */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75, ease: "easeOut" }}
                className="absolute top-[46%] end-2 md:end-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 shadow-xl shadow-blue-900/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <PenLine size={17} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {lang === "fa" ? "تصحیح رایتینگ" : "Writing check"}
                      </p>
                      <p className="text-xs font-black text-violet-600 dark:text-violet-400">
                        {lang === "fa" ? "با هوش مصنوعی" : "Powered by AI"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* ================= آمار ================= */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-16 md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur shadow-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-blue-100 dark:divide-slate-800"
            >
              {t.stats.map((s) => (
                <div key={s.label} className="p-5 md:p-7 text-center">
                  <p className="text-2xl md:text-4xl font-black bg-gradient-to-b from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-300 bg-clip-text text-transparent">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= امکانات ================= */}
        <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-900/50 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl md:text-4xl font-black">{t.featuresTitle}</h2>
              <p className="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400 leading-7">
                {t.featuresSub}
              </p>
            </motion.div>

            <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {t.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.09, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-[#f8fbff] dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-300 dark:hover:border-slate-600 transition-colors"
                >
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
                    <f.icon size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-black">{f.title}</h3>
                  <p className="mt-2 text-xs md:text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {f.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= چطور کار می‌کند ================= */}
        <section id="how" className="py-16 md:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-2xl md:text-4xl font-black text-center"
            >
              {t.howTitle}
            </motion.h2>

            <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-4 md:gap-6 relative">
              {/* خط اتصال دسکتاپ */}
              <div
                className="hidden md:block absolute top-9 inset-x-[18%] border-t-2 border-dashed border-blue-200 dark:border-slate-700"
                aria-hidden
              />
              {t.how.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                  className="relative text-center rounded-3xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm"
                >
                  <span className="relative z-10 w-14 h-14 mx-auto rounded-full bg-blue-600 text-white text-xl font-black flex items-center justify-center shadow-lg shadow-blue-600/30">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-black">{s.title}</h3>
                  <p className="mt-2 text-xs md:text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {s.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA پایانی ================= */}
        <section className="pb-20 md:pb-28">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-sky-700 px-6 md:px-12 py-12 md:py-16 text-center shadow-2xl shadow-blue-900/25"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -top-24 -start-24 w-72 h-72 rounded-full border-[28px] border-white/10"
                aria-hidden
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-28 -end-20 w-80 h-80 rounded-full border-[32px] border-white/10"
                aria-hidden
              />
              <div className="relative z-10 max-w-2xl mx-auto">
                <MessagesSquare size={34} className="mx-auto text-white/85" />
                <h2 className="mt-4 text-2xl md:text-4xl font-black text-white leading-snug">
                  {t.ctaTitle}
                </h2>
                <p className="mt-3 text-sm md:text-base text-blue-50/90 leading-7">
                  {t.ctaSub}
                </p>
                <Link
                  href="/register"
                  className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-white text-blue-700 px-8 text-sm font-black shadow-lg hover:scale-[1.04] active:scale-95 transition-transform"
                >
                  {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  {t.ctaButton}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ================= فوتر ================= */}
      <footer className="mt-auto border-t border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.footer}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold">
              {t.nav.login}
            </Link>
            <Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold">
              {t.nav.register}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
