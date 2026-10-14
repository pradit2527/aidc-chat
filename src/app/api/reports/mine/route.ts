import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { listReportsForOwner } from "@/lib/reports";

export const dynamic = "force-dynamic";

const MINE_PER_PAGE = 12;

/** รายงานของพนักงานคนหนึ่ง (?who=<identifier>&page=1) — หน้าละ 12 ใช้ที่หน้าหลัก /start (ผู้ใช้กำหนด) */
export async function GET(req: Request) {
  if (!dbEnabled) return NextResponse.json({ enabled: false, reports: [], total: 0, page: 1, pages: 1, perPage: MINE_PER_PAGE });
  const url = new URL(req.url);
  const who = url.searchParams.get("who") ?? "";
  const page = Math.max(1, Math.min(10_000, Number(url.searchParams.get("page")) || 1));
  try {
    return NextResponse.json({ enabled: true, ...(await listReportsForOwner(who, page, MINE_PER_PAGE)) });
  } catch (e) {
    console.error(`[reports] mine: ${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
