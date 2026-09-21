import type { Metadata } from "next";

// عنوان تب مرورگر این صفحه — v1.0.1.9
// (قالب ریشه: «{title} | Flex English»)
export const metadata: Metadata = {
  // default برای خودِ این مسیر + template برای مسیرهای فرزند
  title: { default: "تمرین‌ها", template: "%s | Flex English" },

  description: "تمرین‌های شنیداری، گرامری و نوشتاری",
};

export default function PageMetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
