import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw, toConversation } from "@/lib/cw";
import { syncTicket } from "@/lib/ticketRegistry";

type Ctx = { params: Promise<{ id: string }> };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

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
      // ทะเบียน Ticket: บันทึกผู้รับผิดชอบใหม่ทันที
      const raw = await cw<unknown>(s, acct(`/conversations/${id}`)).catch(() => null);
      if (raw) {
        const conv = toConversation(isObj(raw) && isObj(raw.payload) ? raw.payload : raw);
        await syncTicket({ ...conv, updatedAt: Math.floor(Date.now() / 1000) }, s.user.name);
      }
      return { ok: true };
    },
    { mutating: true },
  );
}
