import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "./LoginForm";

// ========================================
// /login — ورود (v1.0.5.2 / English 1.0.1.2)
//
// کامپوننت سروری: کاربرِ واردشده (نشست معتبر + رکورد DB) قبل از
// رندر فرم ورود، با redirect سروری به /home فرستاده می‌شود — دیگر
// صفحهٔ ورود برای او فلش نمی‌زند و با router.push("/home") در
// AuthContext هیچ مسابقه‌ای نمی‌مانَد. مهمان → فرم ورود.
// ========================================

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/home");

  return <LoginForm />;
}
