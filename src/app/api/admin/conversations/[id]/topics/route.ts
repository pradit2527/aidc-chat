import { NextResponse } from "next/server";
import { adminRoute, parseId } from "@/lib/adminApi";
import { URGENT_LABEL } from "@/lib/categories";
import { closeNoticeText } from "@/lib/closeNotice";
import { acct, cw, toConversation } from "@/lib/cw";
import { ticketMap } from "@/lib/ticketMap";
import { logEvent, syncTicket, ticketNoOf } from "@/lib/ticketRegistry";

type Ctx = { params: Promise<{ id: string }> };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * ปิดหัวข้อ (label) ที่เลือกของบทสนทนา
 * - บันทึกหัวข้อที่ปิดแล้วใน custom attribute `closed_topics` (label ยังอยู่ จึงนับจำนวนงานย้อนหลังได้ครบ)
 * - ส่งโน้ตภายใน (ทีมไอทีเห็น) และ "ข้อความแจ้งผู้ใช้" แบบสาธารณะ (พนักงานเห็นในแชท)
 * - ถ้าทุกหัวข้อถูกปิดครบ (หรือเคสไม่มีหัวข้อเลย) → ปิดบทสนทนา (resolved) ให้อัตโนมัติ
 */
export async function POST(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  const body = (await req.json().catch(() => null)) as { close?: unknown; note?: unknown } | null;
  const close = Array.isArray(body?.close)
    ? body.close.filter((s): s is string => typeof s === "string" && /^[a-z0-9_-]{1,60}$/.test(s))
    : null;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (!id || close === null) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  return adminRoute(
    req,
    async (s) => {
      const raw = await cw<unknown>(s, acct(`/conversations/${id}`));
      const conv = toConversation(isObj(raw) && isObj(raw.payload) ? raw.payload : raw);

      const topics = conv.labels.filter((l) => l !== URGENT_LABEL);
      const before = new Set(conv.closedTopics.filter((l) => topics.includes(l)));
      const closed = new Set(before);
      for (const l of close) if (topics.includes(l)) closed.add(l);
      const closedList = [...closed];
      const newlyClosed = closedList.filter((l) => !before.has(l));

      await cw(s, acct(`/conversations/${id}/custom_attributes`), {
        json: { custom_attributes: { closed_topics: closedList.join(",") } },
      });

      // บันทึกภายในไว้ในแชท ให้ทีมเห็นว่าใครปิดหัวข้ออะไร
      if (note) {
        await cw(s, acct(`/conversations/${id}/messages`), {
          json: { content: note, message_type: "outgoing", private: true },
        }).catch(() => {});
      }

      const remaining = topics.filter((l) => !closed.has(l));
      const resolved = remaining.length === 0;

      // เลขตั๋วของเคสนี้ (ใส่ในข้อความแจ้งผู้ใช้) — คำนวณไม่ได้ก็ส่งข้อความได้ตามปกติ
      let ticket: string | null = null;
      try {
        ticket = (await ticketNoOf(conv)) ?? (await ticketMap((p) => cw<unknown>(s, p), conv.createdAt)).get(id) ?? null;
      } catch {
        // ไม่ใส่เลขตั๋ว
      }

      // ข้อความแจ้งผู้ใช้ (สาธารณะ) — ส่งก่อนเปลี่ยนสถานะเป็น resolved เพื่อให้อยู่ในบทสนทนาเดียวกันเสมอ
      // ถ้าส่งไม่สำเร็จไม่ขัดขวางการปิดเคส
      if (resolved || newlyClosed.length > 0) {
        await cw(s, acct(`/conversations/${id}/messages`), {
          json: {
            content: closeNoticeText({ closed: resolved ? closedList : newlyClosed, remaining, resolved, ticket, name: conv.name }),
            message_type: "outgoing",
            private: false,
          },
        }).catch(() => {});
      }

      if (resolved) {
        await cw(s, acct(`/conversations/${id}/toggle_status`), { json: { status: "resolved" } });
      }
      // บันทึกเหตุการณ์เฉพาะเมื่อมีอะไรเปลี่ยนจริง (เลือกหัวข้อที่เคสไม่มี/ปิดไปแล้ว → ไม่บันทึก)
      if (resolved || newlyClosed.length > 0) {
        await logEvent(id, "topic_closed", s.user.name, { topics: resolved ? closedList : newlyClosed, resolved });
      }
      await syncTicket(
        {
          ...conv,
          status: resolved ? "resolved" : conv.status,
          closedTopics: closedList,
          updatedAt: Math.floor(Date.now() / 1000),
        },
        s.user.name,
      );
      return { closedTopics: closedList, resolved };
    },
    { mutating: true },
  );
}
