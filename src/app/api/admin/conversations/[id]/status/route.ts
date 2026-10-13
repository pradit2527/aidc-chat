import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw, toConversation } from "@/lib/cw";
import { syncTicket } from "@/lib/ticketRegistry";

type Ctx = { params: Promise<{ id: string }> };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** ปิดเคส (resolved) หรือเปิดใหม่ (open) — เปิดใหม่จะล้างรายการ "หัวข้อที่ปิดแล้ว" ด้วย */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status;
  if (!id || (status !== "resolved" && status !== "open")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  return adminRoute(
    req,
    async (s) => {
      await cw(s, acct(`/conversations/${id}/toggle_status`), { json: { status } });
      if (status === "open") {
        await cw(s, acct(`/conversations/${id}/custom_attributes`), {
          json: { custom_attributes: { closed_topics: "" } },
        }).catch(() => {});
      }
      // ทะเบียน Ticket: บันทึกสถานะใหม่ทันที (ไม่รอให้รายการเคสโพลล์มาเจอ)
      const raw = await cw<unknown>(s, acct(`/conversations/${id}`)).catch(() => null);
      if (raw) {
        const conv = toConversation(isObj(raw) && isObj(raw.payload) ? raw.payload : raw);
        await syncTicket(
          { ...conv, status, closedTopics: status === "open" ? [] : conv.closedTopics, updatedAt: Math.floor(Date.now() / 1000) },
          s.user.name,
        );
      }
      return { ok: true, status };
    },
    { mutating: true },
  );
}
