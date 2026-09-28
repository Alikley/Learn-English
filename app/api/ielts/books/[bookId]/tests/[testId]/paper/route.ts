import { NextRequest, NextResponse } from "next/server";
import { requireAuth, err } from "@/lib/api-helpers";
import { buildExamPaper, getPaperInfo, paperFilename } from "@/lib/ielts/exam-paper";
import type { PaperSkill } from "@/lib/ielts/exam-paper";

// ========================================
// GET /api/ielts/books/[bookId]/tests/[testId]/paper (v1.0.3.4)
// برگهٔ امتحانی اختصاصی یک تست/مهارت — فقط صفحات همان تست
// از PDF کتاب + صفحهٔ جلد امتحانی.
//
//   ?skill=listening|reading|writing   (الزامی)
//   ?check=1                           → فقط بررسی در دسترس بودن (JSON)
//   ?dl=1                              → دانلود به‌جای نمایش درجایگاه
//
// بار اول ممکن است چند ثانیه طول بکشد (خواندن PDF کتاب)؛
// نتیجه در ‎.cache/ielts-papers‎ کش می‌شود.
// ========================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SKILLS: PaperSkill[] = ["listening", "reading", "writing"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string; testId: string }> },
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { bookId: bookIdParam, testId: testIdParam } = await params;
  const bookId = Number(bookIdParam);
  const testId = Number(testIdParam);
  if (!Number.isInteger(bookId) || bookId < 1 || bookId > 8)
    return err("شناسهٔ کتاب نامعتبر است (۱ تا ۸)");
  if (!Number.isInteger(testId) || testId < 1 || testId > 4)
    return err("شناسهٔ تست نامعتبر است (۱ تا ۴)");

  const url = new URL(req.url);
  const skill = url.searchParams.get("skill") as PaperSkill | null;
  if (!skill || !SKILLS.includes(skill)) {
    return err("مهارت نامعتبر است (listening / reading / writing)");
  }

  // ---------- فقط بررسی ----------
  if (url.searchParams.get("check") === "1") {
    const info = await getPaperInfo(bookId, testId, skill);
    return NextResponse.json(info);
  }

  // ---------- ساخت برگه ----------
  const result = await buildExamPaper(bookId, testId, skill);
  if ("error" in result) {
    return err(result.error, 503);
  }

  const disposition = url.searchParams.get("dl") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${paperFilename(bookId, testId, skill)}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
