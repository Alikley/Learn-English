// ========================================
// سرو کتاب‌های PDF از B2 — نسخه ۱.۰.۲.۸
// پیش از این، PDF‌ها هر بار از یک سرور بیرونی
// (languagecentre.ir) به‌صورت zip دانلود و extract
// می‌شدند — کند و وابسته به سرور دیگران.
// حالا فایل‌ها در باکت خصوصی B2 هستند و این روت
// فقط به لینک امضادارِ امن ریدایرکت می‌کند.
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { isMediaConfigured, signedMediaUrl } from "@/lib/b2-media";

// مسیر فایل در باکت B2 — کلید = شناسه کتاب در دیتابیس
const PDF_FILES: Record<number, string> = {
  1: "books/level_1_-_Prince_William_-_Penguin_Readers.pdf",
  2: "books/pride-and-prejudice.pdf",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await params;
  const file = PDF_FILES[Number(bookId)];

  if (!file) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  if (!isMediaConfigured()) {
    return NextResponse.json(
      { error: "Media storage is not configured" },
      { status: 503 },
    );
  }

  try {
    const url = await signedMediaUrl(file);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error("PDF serve error:", error);
    return NextResponse.json({ error: "Failed to serve PDF" }, { status: 500 });
  }
}
