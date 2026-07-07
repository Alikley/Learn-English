import { prisma } from "@/prisma/Prisma client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
