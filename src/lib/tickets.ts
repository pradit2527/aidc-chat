// เลขตั๋ว (Ticket) ของแต่ละเคส: Ticket<วัน-เดือน-ปี>-<ลำดับของวัน 3 หลัก> เช่น Ticket12-10-2026-001
// - วันที่ใช้เวลาลาว (UTC+7) ของวันที่เคสถูกสร้าง; ลำดับเริ่ม 001 ใหม่ทุกวัน เรียงตามเลขเคสใน Chatwoot (เก่าก่อน)
// - คำนวณจากข้อมูลใน Chatwoot ทุกครั้ง ไม่มีที่เก็บแยก จึงตรงกันทั้งฝั่งพนักงานและฝั่งไอที (ฟังก์ชันล้วน ใช้ได้ทั้ง server/client)

const OFFSET_SEC = 7 * 3600; // Asia/Vientiane

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "12-10-2026" ตามเวลาลาว */
export function ticketDate(sec: number): string {
  const d = new Date((sec + OFFSET_SEC) * 1000);
  return `${pad2(d.getUTCDate())}-${pad2(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
}

/** เวลาเริ่มต้นวัน (วินาที, UTC) ของวันที่ sec ตามเวลาลาว */
export function dayStart(sec: number): number {
  return Math.floor((sec + OFFSET_SEC) / 86400) * 86400 - OFFSET_SEC;
}

/** "09:15" ตามเวลาลาว */
export function laoTime(sec: number): string {
  const d = new Date((sec + OFFSET_SEC) * 1000);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

export const formatTicket = (date: string, seq: number) => `Ticket${date}-${String(seq).padStart(3, "0")}`;

/** กำหนดเลขตั๋วให้ทุกเคส: จัดกลุ่มตามวันที่สร้าง แล้วเรียงตามเลขเคส (id) นับ 1,2,3… */
export function assignTickets(rows: { id: number; createdAt: number }[]): Map<number, string> {
  const byDay = new Map<string, number[]>();
  for (const r of [...rows].sort((a, b) => a.id - b.id)) {
    const day = ticketDate(r.createdAt);
    const list = byDay.get(day);
    if (list) list.push(r.id);
    else byDay.set(day, [r.id]);
  }
  const out = new Map<number, string>();
  for (const [day, ids] of byDay) ids.forEach((id, i) => out.set(id, formatTicket(day, i + 1)));
  return out;
}
