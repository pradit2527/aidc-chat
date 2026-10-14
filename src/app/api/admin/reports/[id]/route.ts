import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { CwError } from "@/lib/cw";
import { dbEnabled } from "@/lib/db";
import { applyReportAction, getReport, parseReportAction } from "@/lib/reports";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** รายละเอียดงานแจ้งปัญหา 1 รายการ (รวมบันทึกภายใน) */
export async function GET(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  return adminRoute(req, async () => {
    const report = await getReport(id);
    if (!report) throw new CwError(404, "report not found");
    return { report };
  });
}

/**
 * ไอทีจัดการงาน: {action:"start"} รับงาน, {action:"item", itemId, done} ติ๊กข้อ (ครบทุกข้อ → ปิดงานอัตโนมัติ),
 * {action:"done"} ปิดงาน, {action:"reopen"}, {action:"assign", assignee}, {action:"note", note}
 */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const action = parseReportAction(await req.json().catch(() => null));
  if (!action) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  return adminRoute(
    req,
    async (s) => {
      const report = await applyReportAction(id, action, s.user.name);
      if (!report) throw new CwError(404, "report not found");
      return { report };
    },
    { mutating: true },
  );
}
