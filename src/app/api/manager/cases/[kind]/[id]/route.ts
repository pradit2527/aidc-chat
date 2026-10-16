import { NextResponse } from "next/server";
import { parseId } from "@/lib/adminApi";
import { getCaseDetail } from "@/lib/caseDetail";
import { dbEnabled } from "@/lib/db";
import { getManager } from "@/lib/managerSession";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ kind: string; id: string }> };

/** รายละเอียดเคส 1 รายการ (แชท หรือ แจ้งปัญหา) สำหรับหัวหน้า — อ่านอย่างเดียว */
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await getManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { kind, id: rawId } = await params;
  const id = parseId(rawId);
  if ((kind !== "chat" && kind !== "report") || !id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const detail = await getCaseDetail(kind, id);
    return detail ? NextResponse.json({ detail }) : NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch (e) {
    console.error("[manager] case detail failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
}
