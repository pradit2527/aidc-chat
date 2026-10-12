import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw } from "@/lib/cw";

type Ctx = { params: Promise<{ id: string }> };

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
      return { ok: true, status };
    },
    { mutating: true },
  );
}
