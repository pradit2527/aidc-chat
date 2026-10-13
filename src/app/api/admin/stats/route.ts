import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** สถิติจากทะเบียน Ticket ใน Neon (?days=14) — ต้องล็อกอินคอนโซลก่อน */
export async function GET(req: Request) {
  if (!dbEnabled) return NextResponse.json({ enabled: false });
  const days = Math.max(1, Math.min(365, Number(new URL(req.url).searchParams.get("days")) || 14));
  return adminRoute(req, async () => ({ enabled: true, ...(await getStats(days)) }));
}
