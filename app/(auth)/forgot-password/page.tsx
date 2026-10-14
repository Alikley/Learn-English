import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ForgotPasswordForm from "./ForgotPasswordForm";

// ========================================
// /forgot-password — فراموشی رمز عبور (v1.0.6.5 / English 1.0.1.8)
//
// کامپوننت سروری: کاربرِ واردشده (نشست معتبر + رکورد DB) به
// /home فرستاده می‌شود — الگوی همان /login. مهمان → فرم.
// ========================================

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/home");

  return <ForgotPasswordForm />;
}
