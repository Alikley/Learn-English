import { requireAuth, ok, err } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok([]);
}
