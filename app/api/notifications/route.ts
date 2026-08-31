import { requireAuth, ok } from "@/lib/api-helpers";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok({ notifications: [], unreadCount: 0 });
}

export async function PATCH() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  return ok({ success: true });
}
