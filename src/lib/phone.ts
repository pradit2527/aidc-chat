// เบอร์โทรรูป E.164 (ใช้ได้ทั้ง server/browser — ไม่มี dependency)

/**
 * ทำให้เป็นรูป E.164 (+8562012345678): ตัดช่องว่าง/ขีด/วงเล็บ/คำนำหน้า whatsapp:, 00xx → +xx,
 * เบอร์ลาวแบบท้องถิ่น 020… → +85620…, ตัวเลขล้วนที่มีรหัสประเทศแล้ว → เติม + — ไม่ผ่านเกณฑ์ → null
 */
export function normalizePhone(input: unknown): string | null {
  let s = String(input ?? "")
    .trim()
    .replace(/^whatsapp:/i, "")
    .replace(/[\s\-().]/g, "");
  if (!s) return null;
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (/^0\d{7,}$/.test(s)) s = "+856" + s.slice(1);
  if (/^\d{9,15}$/.test(s)) s = "+" + s;
  return /^\+[1-9]\d{7,14}$/.test(s) ? s : null;
}

/** แสดงแบบอ่านง่าย: +8562012345678 → +856 20 1234 5678 (ลาว) อื่น ๆ คงเดิม */
export function prettyPhone(e164: string): string {
  const m = e164.match(/^\+856(\d{2})(\d{4})(\d{4})$/);
  return m ? `+856 ${m[1]} ${m[2]} ${m[3]}` : e164;
}
