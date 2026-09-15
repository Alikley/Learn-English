// ========================================
// تم رنگی دوره‌ها بر اساس بخش (دسته) — v1.0.1.0
//
// کاربر خواست پس‌زمینه صفحه درس‌ها به رنگ هر بخش باشد:
//   گرامر آبی / مکالمه سبز / لغات بنفش / لیسنینگ نارنجی
//
// دسته از titleEn دوره تشخیص داده می‌شود (همان منطق
// app/api/categories/route.ts) و به یک تم کامل کلاس‌های
// Tailwind نگاشت می‌شود: پس‌زمینه گرادیانی صفحه، رنگ
// دکمه شروع، حلقه شماره درس، بج سطح، نوار پیشرفت و …
//
// همه کلاس‌ها literal اند (نه داینامیک) تا Tailwind v4
// آن‌ها را در بیلد تولید کند.
// ========================================

export type CourseTheme = {
  /** کلید دسته */
  key: "grammar" | "conversation" | "vocabulary" | "listening" | "default";
  /** نام فارسی دسته */
  label: string;
  /** پس‌زمینه کل صفحه درس‌ها — گرادیان نرم به رنگ بخش */
  pageBg: string;
  /** هدر — سفید نیمه‌شفاف روی گرادیان */
  headerBg: string;
  /** حاشیه هدر به رنگ بخش */
  headerBorder: string;
  /** بج سطح درس */
  badge: string;
  /** دکمه «شروع» */
  solid: string;
  /** دکمه «مشاهده مجدد» — حالت ملایم */
  soft: string;
  /** حلقه دور شماره درس */
  ring: string;
  /** متن شماره درس */
  ringText: string;
  /** نوار پیشرفت دوره */
  progress: string;
  /** هاور کارت — سایه رنگی */
  hoverShadow: string;
  /** حاشیه کارت هنگام هاور */
  hoverBorder: string;
  /** خط‌چین اتصال پله‌ها روی صفحه */
  stairLine: string;
};

const THEMES: Record<CourseTheme["key"], CourseTheme> = {
  // ---- گرامر: آبی ----
  grammar: {
    key: "grammar",
    label: "گرامر",
    pageBg: "bg-gradient-to-b from-blue-200/70 via-sky-50 to-blue-100/60",
    headerBg: "bg-white/70 backdrop-blur-sm",
    headerBorder: "border-blue-200/70",
    badge: "bg-blue-100 text-blue-700",
    solid: "bg-blue-600 hover:bg-blue-700",
    soft: "text-blue-700 bg-blue-50 hover:bg-blue-100",
    ring: "border-blue-400",
    ringText: "text-blue-600",
    progress: "bg-blue-500",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(37,99,235,0.18)]",
    hoverBorder: "hover:border-blue-300",
    stairLine: "border-blue-300/70",
  },
  // ---- مکالمه: سبز ----
  conversation: {
    key: "conversation",
    label: "مکالمه",
    pageBg: "bg-gradient-to-b from-teal-200/70 via-emerald-50 to-teal-100/60",
    headerBg: "bg-white/70 backdrop-blur-sm",
    headerBorder: "border-teal-200/70",
    badge: "bg-teal-100 text-teal-700",
    solid: "bg-teal-600 hover:bg-teal-700",
    soft: "text-teal-700 bg-teal-50 hover:bg-teal-100",
    ring: "border-teal-400",
    ringText: "text-teal-600",
    progress: "bg-teal-500",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(13,148,136,0.18)]",
    hoverBorder: "hover:border-teal-300",
    stairLine: "border-teal-300/70",
  },
  // ---- لغات: بنفش ----
  vocabulary: {
    key: "vocabulary",
    label: "لغات",
    pageBg: "bg-gradient-to-b from-purple-200/70 via-violet-50 to-purple-100/60",
    headerBg: "bg-white/70 backdrop-blur-sm",
    headerBorder: "border-purple-200/70",
    badge: "bg-purple-100 text-purple-700",
    solid: "bg-purple-600 hover:bg-purple-700",
    soft: "text-purple-700 bg-purple-50 hover:bg-purple-100",
    ring: "border-purple-400",
    ringText: "text-purple-600",
    progress: "bg-purple-500",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(147,51,234,0.18)]",
    hoverBorder: "hover:border-purple-300",
    stairLine: "border-purple-300/70",
  },
  // ---- لیسنینگ: نارنجی ----
  listening: {
    key: "listening",
    label: "لیسنینگ",
    pageBg: "bg-gradient-to-b from-orange-200/70 via-amber-50 to-orange-100/60",
    headerBg: "bg-white/70 backdrop-blur-sm",
    headerBorder: "border-orange-200/70",
    badge: "bg-orange-100 text-orange-700",
    solid: "bg-orange-500 hover:bg-orange-600",
    soft: "text-orange-700 bg-orange-50 hover:bg-orange-100",
    ring: "border-orange-400",
    ringText: "text-orange-600",
    progress: "bg-orange-500",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(249,115,22,0.18)]",
    hoverBorder: "hover:border-orange-300",
    stairLine: "border-orange-300/70",
  },
  // ---- پیش‌فرض (دوره‌های خارج از چهار دسته) ----
  default: {
    key: "default",
    label: "دوره",
    pageBg: "bg-gradient-to-b from-slate-200/60 via-slate-50 to-slate-100/60",
    headerBg: "bg-white/70 backdrop-blur-sm",
    headerBorder: "border-slate-200/70",
    badge: "bg-slate-100 text-slate-700",
    solid: "bg-slate-600 hover:bg-slate-700",
    soft: "text-slate-700 bg-slate-50 hover:bg-slate-100",
    ring: "border-slate-300",
    ringText: "text-slate-500",
    progress: "bg-slate-500",
    hoverShadow: "hover:shadow-[0_10px_28px_rgba(71,85,105,0.16)]",
    hoverBorder: "hover:border-slate-300",
    stairLine: "border-slate-300/70",
  },
};

// همان منطق تشخیص دسته در API دسته‌بندی‌ها:
// titleEn دوره نام دسته را در خود دارد (مثل «Grammar Beginner»)
export function getCourseTheme(titleEn?: string | null): CourseTheme {
  const t = (titleEn ?? "").toLowerCase();
  if (t.includes("grammar")) return THEMES.grammar;
  if (t.includes("conversation")) return THEMES.conversation;
  if (t.includes("vocabulary")) return THEMES.vocabulary;
  if (t.includes("listening")) return THEMES.listening;
  return THEMES.default;
}
