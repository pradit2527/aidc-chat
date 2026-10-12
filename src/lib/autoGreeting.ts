// คำทักทายอัตโนมัติ "ทุกครั้งที่มีแชทใหม่" — รวมถึงคนเก่าที่พิมพ์ต่อในบทสนทนาเดิม
//
// Chatwoot ส่งข้อความต้อนรับของ inbox เฉพาะตอนสร้างบทสนทนาใหม่ จึงไม่ครอบคลุมกรณี:
//   - คนเก่าพิมพ์มาใหม่ในเคสที่ยังเปิดค้างอยู่ (เงียบไปนาน)
//   - คนเก่าพิมพ์ต่อในเธรดที่ปิดแล้ว (Chatwoot เปิดเคสเดิมขึ้นมาใหม่)
// ระบบนี้ตรวจจาก "ลำดับข้อความ" ว่าข้อความล่าสุดของลูกค้าคือการเริ่มแชทใหม่หรือไม่ แล้วส่งคำทักทายในชื่อเจ้าหน้าที่
// (ตั้งข้อความด้วย ADMIN_AUTO_GREETING, ปิดด้วย ADMIN_AUTO_GREETING=off, ช่วงเงียบด้วย ADMIN_GREETING_IDLE_MIN)

const rawText = (process.env.ADMIN_AUTO_GREETING ?? "").trim();

export const AUTO_GREETING_ENABLED = rawText.toLowerCase() !== "off";
export const AUTO_GREETING_TEXT =
  AUTO_GREETING_ENABLED && rawText ? rawText : "ສະບາຍດີ ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ ກະລຸນາບອກພວກເຮົາກ່ຽວກັບບັນຫາຂອງທ່ານ";

/** custom attribute ที่เก็บเวลาส่งคำทักทายล่าสุด (ISO) — อยู่ใน Chatwoot จึงไม่ซ้ำแม้เปิดคอนโซลหลายเครื่อง */
export const GREETED_ATTR = "auto_greeted_at";

/** เงียบนานเกินนี้แล้วลูกค้าพิมพ์มาใหม่ = ถือเป็นแชทใหม่ (นาที → วินาที) */
export const IDLE_SEC = (Number(process.env.ADMIN_GREETING_IDLE_MIN) || 60) * 60;

export type MsgLite = {
  /** วินาที */
  createdAt: number;
  kind: "incoming" | "outgoing" | "activity";
  privateNote: boolean;
  text: string;
};

/**
 * เวลาที่ "แชทใหม่" ของลูกค้าเริ่ม หรือ null ถ้าข้อความล่าสุดเป็นการคุยต่อเนื่อง
 * แชทใหม่ = ข้อความแรกของลูกค้าหลังข้อความขาออกสาธารณะล่าสุด (บอท/เจ้าหน้าที่) โดย
 *   (ก) ยังไม่เคยมีข้อความขาออกเลย (ติดต่อครั้งแรก — ปกติ Chatwoot ทักให้แล้ว จะไม่เข้ากรณีนี้)
 *   (ข) ระหว่างนั้นเคสถูกปิด (activity "resolved") แล้วลูกค้าพิมพ์มาอีก
 *   (ค) เว้นช่วงเงียบตั้งแต่ IDLE_SEC ขึ้นไป
 */
export function chatStartOf(messages: MsgLite[], idleSec: number = IDLE_SEC): number | null {
  const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
  let lastOut = 0;
  for (const m of sorted) if (m.kind === "outgoing" && !m.privateNote) lastOut = m.createdAt;
  const firstIn = sorted.find((m) => m.kind === "incoming" && m.createdAt > lastOut);
  if (!firstIn) return null;
  if (lastOut === 0) return firstIn.createdAt;
  const resolvedBetween = sorted.some(
    (m) => m.kind === "activity" && /resolved/i.test(m.text) && m.createdAt >= lastOut && m.createdAt <= firstIn.createdAt,
  );
  return resolvedBetween || firstIn.createdAt - lastOut >= idleSec ? firstIn.createdAt : null;
}

/** ควรทักทายหรือไม่ — ทักเมื่อมีแชทใหม่ที่เริ่มหลังจากครั้งล่าสุดที่เคยทัก */
export function shouldGreet(
  messages: MsgLite[],
  greetedAtSec: number,
  idleSec: number = IDLE_SEC,
): { greet: boolean; chatStart: number | null } {
  const chatStart = chatStartOf(messages, idleSec);
  return { greet: chatStart !== null && chatStart > greetedAtSec, chatStart };
}
