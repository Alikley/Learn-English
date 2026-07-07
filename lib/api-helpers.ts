import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

type AuthSuccess = { session: Session & { user: { id: string } }; error: null };
type AuthFailure = { session: null; error: NextResponse };

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 }),
    };
  }
  return {
    session: session as Session & { user: { id: string } },
    error: null,
  };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
