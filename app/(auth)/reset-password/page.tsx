import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import PageLoading from "@/app/components/PageLoading";

// ========================================
// /reset-password — تعیین رمز جدید (v1.0.6.5 / English 1.0.1.8)
//
// کاربر با کلیک روی لینک ایمیل به اینجا می‌آید:
// /reset-password?token=<۶۴ کاراکتر هگز>
//
// نکته: ریدایرکتِ «کاربرِ واردشده» اینجا انجام نمی‌شود — ممکن است
// کاربرِ لاگین‌کرده بخواهد رمزش را از ایمیل عوض کند.
// Suspense لازم است چون فرم از useSearchParams می‌خواند (Next 16).
// ========================================

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
