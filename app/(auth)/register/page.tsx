import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, googleAuthEnabled } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

// ========================================
// /register — ثبت‌نام (v1.0.5.2 / English 1.0.1.2)
//
// کامپوننت سروری: کاربرِ واردشده (نشست معتبر + رکورد DB) قبل از
// رندر فرم ثبت‌نام، با redirect سروری به /home فرستاده می‌شود.
// مهمان → فرم ساخت حساب جدید.
//
// v1.0.6.0 (English 1.0.1.3): اگر کلیدهای گوگل در .env باشند،
// دکمهٔ «ثبت‌نام با گوگل» به فرم پاس داده می‌شود.
// ========================================

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/home");

  return <RegisterForm googleEnabled={googleAuthEnabled} />;
}
