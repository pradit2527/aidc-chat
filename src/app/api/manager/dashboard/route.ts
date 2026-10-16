import { NextResponse } from "next/server";
import { getDashboard, parseDashboardQuery } from "@/lib/dashboard";
import { getManager } from "@/lib/managerSession";
import { dbEnabled } from "@/lib/db";

export const dynamic = "force-dynamic";

/** ข้อมูลแดชบอร์ดของหัวหน้า (อ่านอย่างเดียว): ?kind=all|chat|report &status=all|new|in_progress|done &q= &page= */
export async function GET(req: Request) {
  if (!(await getManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ enabled: false });
  try {
    return NextResponse.json({ enabled: true, ...(await getDashboard(parseDashboardQuery(new URL(req.url).searchParams))) });
  } catch (e) {
    console.error("[manager] dashboard failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
