import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/Prisma client";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "همه فیلدها الزامی هستند" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // 🔥 مهم
        name,
        email,
        password: hashed,

        streak: {
          create: {
            current: 0,
            longest: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
