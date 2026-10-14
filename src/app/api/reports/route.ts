import { NextResponse } from "next/server";
import { loginAllowed, sameOrigin } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { createReport, parseReportInput } from "@/lib/reports";

export const dynamic = "force-dynamic";

/**
 * พนักงานส่งรายงานปัญหาแบบรายการ (ไม่ผ่านแชท) → ได้เลขตั๋วชุดเดียวกับเคสแชท
 * ต้องมีฐานข้อมูล (DATABASE_URL) — ไม่มี → 503 ให้หน้าเว็บแนะนำให้ใช้แชทแทน
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!loginAllowed(`report:${ip}`)) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });

  const parsed = parseReportInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const r = await createReport(parsed.value);
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    console.error(`[reports] create: ${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
