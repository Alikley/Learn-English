import { requireAuth, ok } from "@/lib/api-helpers";
import { getStreak } from "@/lib/streak";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const streak = await getStreak(auth.session.user.id);
  return ok(streak);
}
