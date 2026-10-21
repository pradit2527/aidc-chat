// ข้อความแจ้งเตือนเข้ากลุ่ม WhatsApp (ตรรกะล้วน — ทดสอบได้โดยไม่ต้องเชื่อมต่อ WhatsApp): งานแจ้งปัญหาใหม่ + ข้อความทดสอบ
import { CATEGORIES, DEPARTMENTS } from "./categories";
import type { ReportDTO } from "./reports";
import { laoTime, ticketDate } from "./tickets";

/** จำกัดความยาวข้อความให้อ่านง่ายในมือถือ (ข้อเยอะเกินให้เปิดดูในระบบแทน) */
export const WHATSAPP_BODY_MAX = 1500;

export type NoticeReport = Pick<ReportDTO, "ticketNo" | "name" | "department" | "contact" | "urgent" | "createdAt" | "items" | "files">;

/**
 * ข้อความแจ้งงานใหม่ (ภาษาลาว — ทีมไอทีอ่าน): เลขตั๋ว, ด่วน, ผู้แจ้ง/แผนก/เบอร์, เวลา, ปัญหาเป็นข้อ ๆ จัดกลุ่มตามหัวข้อ,
 * จำนวนไฟล์แนบ และลิงก์เปิดงานในคอนโซล — ยาวเกินจะตัดข้อท้าย ๆ ออกแต่คงลิงก์ไว้เสมอ
 */
export function formatReportNotice(r: NoticeReport, link: string): string {
  const dept = DEPARTMENTS.find((d) => d.id === r.department)?.label.lo ?? r.department;
  // ขึ้นต้นตามที่ผู้ใช้ต้องการ: "คุณ xxx ได้แจ้งปัญหาในระบบ Ticket แล้ว" แล้วค่อยตามด้วยรายละเอียด
  const head = [
    `🆕 ທ່ານ *${r.name}*${dept ? ` (${dept})` : ""} ໄດ້ແຈ້ງບັນຫາໃນລະບົບ Ticket ແລ້ວ`,
    `🎫 ເລກທີ *${r.ticketNo}*${r.urgent ? " · 🔴 *ດ່ວນ*" : ""}`,
    `🕒 ${ticketDate(r.createdAt)} ${laoTime(r.createdAt)}${r.contact ? ` · ☎ ${r.contact}` : ""}`,
    "",
  ];

  const byTopic = new Map<string, string[]>();
  for (const i of r.items) byTopic.set(i.topic, [...(byTopic.get(i.topic) ?? []), i.text]);
  const body: string[] = [];
  let n = 0;
  for (const [topic, texts] of byTopic) {
    body.push(`📌 ${CATEGORIES.find((c) => c.id === topic)?.label.lo ?? topic}`);
    for (const text of texts) body.push(`  ${++n}. ${text}`);
  }

  const foot = [...(r.files.length ? [`📎 ໄຟລ໌ແນບ ${r.files.length} ໄຟລ໌`] : []), "", `🔗 ${link}`];

  const render = (items: string[], cut: boolean) => [...head, ...items, ...(cut ? ["  …"] : []), ...foot].join("\n");
  let text = render(body, false);
  let cut = false;
  while (text.length > WHATSAPP_BODY_MAX && body.length > 1) {
    body.pop();
    cut = true;
    text = render(body, cut);
  }
  return text.length > WHATSAPP_BODY_MAX ? text.slice(0, WHATSAPP_BODY_MAX - 1) + "…" : text;
}

/** ข้อความทดสอบจากหน้า /admin/whatsapp */
export function formatTestNotice(nowSec = Math.floor(Date.now() / 1000)): string {
  return `✅ ທົດສອບການແຈ້ງເຕືອນຈາກ Helpdesk Support (COSI Hotel) — ຖ້າເຫັນຂໍ້ຄວາມນີ້ ແປວ່າຕັ້ງຄ່າສຳເລັດ\n🕒 ${ticketDate(nowSec)} ${laoTime(nowSec)}`;
}
