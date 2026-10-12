// ฝั่งเซิร์ฟเวอร์ — ส่งคำทักทายอัตโนมัติเมื่อคอนโซลโพลล์รายการเคส (ใช้ token ของเจ้าหน้าที่ที่ล็อกอินอยู่)
// ตรวจเฉพาะเคสเปิดที่ข้อความล่าสุดเป็นของลูกค้า และเฉพาะเมื่อเคสมีความเคลื่อนไหวใหม่ตั้งแต่ตรวจครั้งก่อน
import type { ConversationDTO } from "./adminTypes";
import { AUTO_GREETING_ENABLED, AUTO_GREETING_TEXT, GREETED_ATTR, shouldGreet, type MsgLite } from "./autoGreeting";
import { acct, cw, payloadArray } from "./cw";
import type { Session } from "./session";

type Raw = Record<string, unknown>;
const asObj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});

const checked = new Map<number, number>(); // id → updatedAt ที่ประเมินแล้ว
const inFlight = new Set<number>();

function toLite(raw: unknown): MsgLite {
  const m = asObj(raw);
  const t = m.message_type;
  const kind: MsgLite["kind"] =
    t === 0 || t === "incoming" ? "incoming" : t === 2 || t === "activity" ? "activity" : "outgoing";
  return {
    createdAt: Number(m.created_at) || 0,
    kind,
    privateNote: m.private === true,
    text: typeof m.content === "string" ? m.content : "",
  };
}

async function greetIfNewChat(s: Session, c: ConversationDTO): Promise<void> {
  const messages = payloadArray(await cw<unknown>(s, acct(`/conversations/${c.id}/messages`))).map(toLite);
  const { greet } = shouldGreet(messages, c.autoGreetedAt);
  if (!greet) return;
  // บันทึกก่อนส่ง เพื่อให้คอนโซลเครื่องอื่นที่โพลล์พร้อมกันไม่ส่งซ้ำ
  await cw(s, acct(`/conversations/${c.id}/custom_attributes`), {
    json: { custom_attributes: { [GREETED_ATTR]: new Date().toISOString() } },
  });
  await cw(s, acct(`/conversations/${c.id}/messages`), {
    json: { content: AUTO_GREETING_TEXT, message_type: "outgoing", private: false },
  });
  console.log(`[greeter] greeted conversation #${c.id}`);
}

/**
 * เรียกจาก route รายการเคสผ่าน `after()` ของ Next — ทำงานหลังส่งคำตอบแล้ว ไม่หน่วงหน้าจอ
 * คืน Promise ที่รอทุกเคสเสร็จ เพื่อให้แพลตฟอร์ม serverless (เช่น Vercel) ไม่ตัดงานกลางคัน
 */
export async function runGreetings(s: Session, convs: ConversationDTO[]): Promise<void> {
  if (!AUTO_GREETING_ENABLED) return;
  const tasks: Promise<void>[] = [];
  for (const c of convs) {
    if (c.status !== "open" || !c.previewFromContact) continue;
    if (checked.get(c.id) === c.updatedAt || inFlight.has(c.id)) continue;
    inFlight.add(c.id);
    tasks.push(
      greetIfNewChat(s, c)
        .catch((e: unknown) => console.error(`[greeter] #${c.id}: ${e instanceof Error ? e.message : String(e)}`))
        .finally(() => {
          checked.set(c.id, c.updatedAt);
          inFlight.delete(c.id);
        }),
    );
  }
  await Promise.allSettled(tasks);
}
