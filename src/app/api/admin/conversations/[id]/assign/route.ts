import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw } from "@/lib/cw";

type Ctx = { params: Promise<{ id: string }> };

/** มอบหมายให้ agent (assigneeId) หรือยกเลิกการมอบหมาย (null) */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const body = (await req.json().catch(() => null)) as { assigneeId?: unknown } | null;
  const raw = body?.assigneeId;
  const assigneeId = raw === null ? null : typeof raw === "number" && Number.isInteger(raw) && raw > 0 ? raw : undefined;
  if (!id || assigneeId === undefined) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  return adminRoute(
    req,
    async (s) => {
      await cw(s, acct(`/conversations/${id}/assignments`), { json: { assignee_id: assigneeId } });
      return { ok: true };
    },
    { mutating: true },
  );
}
