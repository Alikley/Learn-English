import type { Metadata } from "next";

// عنوان تب مرورگر این صفحه — v1.0.1.9
// (قالب ریشه: «{title} | Flex English»)
export const metadata: Metadata = {
  // default برای خودِ این مسیر + template برای مسیرهای فرزند
  title: { default: "ورود", template: "%s | Flex English" },

  description: "ورود به حساب کاربری Flex English",
};

export default function PageMetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
