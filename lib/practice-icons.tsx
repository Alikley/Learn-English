import {
  Activity,
  ArrowDownUp,
  ArrowLeftRight,
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCheck,
  CheckCircle2,
  CircleHelp,
  Clock,
  Equal,
  FileText,
  Gauge,
  GraduationCap,
  Headphones,
  Heart,
  History,
  KeyRound,
  Languages,
  Leaf,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Mic,
  Music,
  PenLine,
  Plane,
  Play,
  Repeat,
  Scale,
  Shuffle,
  Smartphone,
  Sparkles,
  Split,
  Star,
  Target,
  ThumbsUp,
  Trophy,
  User,
  UtensilsCrossed,
  Volume2,
  WandSparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ========================================
// آیکون‌های بخش تمرین (نسخه ۱.۰.۱.۵)
// نگاشت نام آیکون (رشته) → کامپوننت lucide
// پوشش کامل آیکون‌های data/training:
//   writing-topics (۱۰) + grammar-sets (۱۵) + هاب/شنیداری
// ========================================

export const PRACTICE_ICONS: Record<string, LucideIcon> = {
  // موضوعات نوشتاری — data/training/writing-topics.ts
  Heart,
  UtensilsCrossed,
  Plane,
  Smartphone,
  Briefcase,
  Scale,
  MapPin,
  BookOpen,
  Leaf,
  Mail,

  // مجموعه‌های گرامری — data/training/grammar-sets.ts
  Activity,
  ArrowDownUp,
  ArrowLeftRight,
  CheckCheck,
  CircleHelp,
  Equal,
  History,
  KeyRound,
  Link2,
  MessagesSquare,
  Repeat,
  Shuffle,
  Split,
  User,
  WandSparkles,

  // هاب تمرین‌ها + شنیداری
  Headphones,
  BookMarked,
  PenLine,
  Clock,
  Zap,
  Volume2,
  CheckCircle2,

  // آیکون‌های پرکاربرد رابط کاربری تمرین‌ها
  Star,
  Gauge,
  Sparkles,
  Trophy,
  FileText,
  GraduationCap,
  Languages,
  MessageCircle,
  Mic,
  Music,
  Play,
  Target,
  ThumbsUp,
};

/** آیکون پیش‌فرض در صورت نام نامعتبر */
export const DEFAULT_PRACTICE_ICON: LucideIcon = PenLine;

/**
 * یافتن کامپوننت آیکون از نام رشته‌ای
 * اگر خودِ کامپوننت داده شود، همان برمی‌گردد
 */
export function getPracticeIcon(
  name: string | LucideIcon | null | undefined,
): LucideIcon {
  if (!name) return DEFAULT_PRACTICE_ICON;
  if (typeof name !== "string") return name;
  return PRACTICE_ICONS[name] ?? DEFAULT_PRACTICE_ICON;
}

/**
 * نمایش آیکون تمرین بر اساس نام رشته‌ای یا کامپوننت
 * سازگار با هر دو قرارداد پراپ name / icon
 * (الگوی lookup مستقیم — مطابق صفحات موجود — تا کامپایلر ری‌اکت خطا ندهد)
 */
export function PracticeIcon({
  icon,
  name,
  className,
  size,
}: {
  icon?: string | LucideIcon;
  name?: string | LucideIcon;
  className?: string;
  size?: number;
}) {
  const requested = icon ?? name;
  // جست‌وجوی مستقیم در نقشه — بدون فراخوانی تابع در حین رندر
  const Icon =
    (typeof requested === "string" ? PRACTICE_ICONS[requested] : requested) ??
    DEFAULT_PRACTICE_ICON;
  const style =
    typeof size === "number" ? { width: size, height: size } : undefined;
  return <Icon className={className} style={style} aria-hidden="true" />;
}

/** نام‌های جایگزین برای سازگاری با نسخه‌های قبلی صفحات */
export const TOPIC_ICONS: Record<string, LucideIcon> = PRACTICE_ICONS;
export const GRAMMAR_ICONS: Record<string, LucideIcon> = PRACTICE_ICONS;
