import type { Metadata } from "next";

// عنوان تب مرورگر این صفحه — v1.0.1.9
// (قالب ریشه: «{title} | Flex English»)
export const metadata: Metadata = {
  // default برای خودِ این مسیر + template برای مسیرهای فرزند
  title: { default: "حدس کلمه (Hangman)", template: "%s | Flex English" },

  description: "حروف را حدس بزن و کلمه را نجات بده",
};

export default function PageMetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
