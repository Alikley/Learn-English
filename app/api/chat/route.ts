import { requireAuth, ok } from "@/lib/api-helpers";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok([]);
}

export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok({ message: null }, 201);
}
