import { prisma } from "@/prisma/Prisma client";
import { NextRequest, NextResponse } from "next/server";

const PDF_SOURCES: Record<number, string> = {
  1: "https://dl.languagecentre.ir/short-stories/level-1-Prince-William-www.languagecentre.ir_.zip",
  2: "https://dl.languagecentre.ir/short-stories/Pride-and-Prejudice-Jane-Austen-www.languagecentre.ir_.zip",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await params;
  const id = Number(bookId);

  if (!PDF_SOURCES[id]) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const zipResponse = await fetch(PDF_SOURCES[id]);
    if (!zipResponse.ok) {
      return NextResponse.json(
        { error: "Failed to download" },
        { status: 502 },
      );
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const pdfData = await extractPdfFromZip(zipBuffer, id);

    if (!pdfData) {
      return NextResponse.json({ error: "PDF not found" }, { status: 500 });
    }

    return new NextResponse(new Uint8Array(pdfData), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="book-${id}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("PDF serve error:", error);
    return NextResponse.json({ error: "Failed to serve PDF" }, { status: 500 });
  }
}

async function extractPdfFromZip(
  zipBuffer: ArrayBuffer,
  bookId: number,
): Promise<Buffer | null> {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(Buffer.from(zipBuffer));

  const entries = zip.getEntries();
  const pdfEntry = entries.find(
    (e: any) => e.entryName.endsWith(".pdf") && !e.isDirectory,
  );

  if (!pdfEntry) return null;

  try {
    if (bookId === 1) {
      return zip.readFile(pdfEntry, "www.languagecentre.ir");
    }
    return zip.readFile(pdfEntry);
  } catch {
    try {
      return zip.readFile(pdfEntry);
    } catch {
      return null;
    }
  }
}
