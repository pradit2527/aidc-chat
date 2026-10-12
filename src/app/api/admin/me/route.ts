import { adminRoute } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return adminRoute(req, async (s) => ({ user: s.user }));
}
