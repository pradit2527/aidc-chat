import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { acct, cw, payloadArray, toMessage } from "@/lib/cw";
import { logEvent, markFirstReply } from "@/lib/ticketRegistry";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** ข้อความล่าสุดของบทสนทนา (ส่ง ?before=<message id> เพื่อโหลดข้อความที่เก่ากว่า) */
export async function GET(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const before = parseId(new URL(req.url).searchParams.get("before") ?? "");

  return adminRoute(req, async (s) => {
    const q = before ? `?before=${before}` : "";
    const body = await cw<unknown>(s, acct(`/conversations/${id}/messages${q}`));
    const messages = payloadArray(body)
      .map(toMessage)
      .filter((m) => m.id > 0)
      .sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
    return { messages };
  });
}

/** ตอบกลับพนักงาน หรือบันทึกภายใน (private) */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const body = (await req.json().catch(() => null)) as { content?: unknown; private?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content || content.length > 5000) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  return adminRoute(
    req,
    async (s) => {
      const raw = await cw<unknown>(s, acct(`/conversations/${id}/messages`), {
        json: { content, message_type: "outgoing", private: body?.private === true },
      });
      const isNote = body?.private === true;
      await logEvent(id, isNote ? "note" : "replied", s.user.name, {});
      if (!isNote) await markFirstReply(id);
      return { message: toMessage(raw) };
    },
    { mutating: true },
  );
}
