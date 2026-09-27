import { prisma } from "@/prisma/Prisma client";
import { NextResponse } from "next/server";

// ========================================
// فهرست کتاب‌های کتابخانه — v1.0.3.3
// خودترمیم: اگر جدول Book خالی بود (نصب تازه بدون
// اجرای seed)، دو کتاب پیش‌فرض به‌صورت خودکار
// ساخته می‌شوند تا کتابخانه هرگز خالی نماند.
// ========================================

const DEFAULT_BOOKS = [
  {
    title: "Prince William",
    titleFa: "شاهزاده ویلیام",
    author: "Penguin Readers",
    description: "داستان کوتاه سطح 1 (مبتدی) درباره شاهزاده ویلیام.",
    level: "BEGINNER",
    coverUrl: "/books/covers/prince-william.jpg",
    pdfPath: "/books/prince-william.pdf",
    pages: 20,
  },
  {
    title: "Pride and Prejudice",
    titleFa: "غرور و تعصب",
    author: "Jane Austen",
    description: "داستان کلاسیک جین آستن درباره عشق و غرور.",
    level: "INTERMEDIATE",
    coverUrl: "/books/covers/pride-and-prejudice.jpg",
    pdfPath: "/books/pride-and-prejudice.pdf",
    pages: 30,
  },
];

export async function GET() {
  try {
    let books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    // ---------- خودترمیم: نصب تازه بدون seed ----------
    if (books.length === 0) {
      try {
        await prisma.book.createMany({ data: DEFAULT_BOOKS });
        books = await prisma.book.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch (healError) {
        console.error("Books self-heal error:", healError);
      }
    }

    return NextResponse.json(books);
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
