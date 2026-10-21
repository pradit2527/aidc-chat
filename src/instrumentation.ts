// รันครั้งเดียวตอนเซิร์ฟเวอร์ Next ขึ้น (ทั้ง dev และ production, เฉพาะ runtime Node)
// เชื่อมต่อ WhatsApp "อุปกรณ์ที่เชื่อมต่อ" กลับมาอัตโนมัติถ้าเคยสแกน QR ไว้แล้ว (ดู src/lib/waDevice.ts)
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { deviceEnabled, waDevice } = await import("./lib/waDevice");
  if (!deviceEnabled()) return;
  // ไม่ await — ให้เซิร์ฟเวอร์พร้อมรับคำขอทันที การเชื่อมต่อทำเบื้องหลัง
  waDevice()
    .autoStart()
    .catch((e: unknown) => console.error(`[whatsapp] autostart: ${e instanceof Error ? e.message : String(e)}`));
}
