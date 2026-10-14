import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { getReportForOwner, publicView } from "@/lib/reports";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ no: string }> };

/** เจ้าของรายงานดูสถานะ: ต้องส่ง identifier ของเครื่องที่ส่งมาด้วย (?who=cosi_…) ไม่ตรง → 404 */
export async function GET(req: Request, { params }: Ctx) {
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { no } = await params;
  const who = new URL(req.url).searchParams.get("who") ?? "";
  try {
    const r = await getReportForOwner(no, who);
    if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ report: publicView(r) });
  } catch (e) {
    console.error(`[reports] get: ${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
