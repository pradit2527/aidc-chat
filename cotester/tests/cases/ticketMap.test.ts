// ดึงเคสตั้งแต่ต้นวันจาก Chatwoot (แบ่งหน้า) และ cache ของเลขตั๋วแบบคำนวณ
import { fetchConversationsSince, ticketMap } from "@/lib/ticketMap";
import { dayStart } from "@/lib/tickets";

const NOW = Math.floor(Date.parse("2026-10-13T06:00:00Z") / 1000); // 13:00 เวลาลาว
const need = dayStart(NOW);

/** สร้าง Chatwoot จำลองที่เรียงตามกิจกรรมล่าสุด: หน้าละ 25 เคส เวลาลดลงทีละ step วินาที */
function fakeChatwoot(total: number, step: number) {
  const calls: string[] = [];
  const fetchJson = async (path: string) => {
    calls.push(path);
    const page = Number(new URL("http://x" + path).searchParams.get("page"));
    const payload = [];
    for (let i = (page - 1) * 25; i < Math.min(page * 25, total); i++) {
      const ts = NOW - i * step;
      payload.push({ id: 1000 - i, status: "open", timestamp: ts, created_at: ts - 60, labels: [], meta: {} });
    }
    return { data: { payload } };
  };
  return { fetchJson, calls };
}

describe("fetchConversationsSince", () => {
  test("หน้าเดียวไม่เต็ม 25 → เรียกครั้งเดียว ได้ครบ", async () => {
    const cw = fakeChatwoot(7, 60);
    const list = await fetchConversationsSince(cw.fetchJson, NOW);
    expect(list).toHaveLength(7);
    expect(cw.calls).toHaveLength(1);
    expect(cw.calls[0]).toContain("status=all");
    expect(cw.calls[0]).toContain("inbox_id=5");
  });

  test("ไล่หน้าจนกว่าจะเจอเคสที่กิจกรรมเก่ากว่าต้นวัน แล้วหยุด", async () => {
    // step 3600 วิ: หน้าแรก 25 เคสครอบคลุม 24 ชม. → เคสท้ายหน้าเก่ากว่าต้นวัน (13:00 ลาว = 13 ชม. หลังเที่ยงคืน) → หยุดที่หน้า 1
    const cw = fakeChatwoot(100, 3600);
    await fetchConversationsSince(cw.fetchJson, NOW);
    expect(cw.calls).toHaveLength(1);
    // step 60 วิ: หน้าละ 25 นาที → ต้องไล่หลายหน้าจนครบ 13 ชม. (≈ 32 หน้า) แต่จำกัดสูงสุด 12 หน้า
    const cw2 = fakeChatwoot(1000, 60);
    const list = await fetchConversationsSince(cw2.fetchJson, NOW);
    expect(cw2.calls).toHaveLength(12);
    expect(list).toHaveLength(300);
  });

  test("ทุกเคสที่สร้างตั้งแต่ต้นวันอยู่ในผลลัพธ์ (ไม่หลุด)", async () => {
    const cw = fakeChatwoot(60, 1200); // 20 นาที/เคส → 13 ชม. ≈ 39 เคส → 2 หน้า
    const list = await fetchConversationsSince(cw.fetchJson, NOW);
    const todays = list.filter((c) => c.createdAt >= need);
    expect(cw.calls.length).toBeGreaterThanOrEqual(2);
    expect(todays.length).toBeGreaterThanOrEqual(39);
  });
});

describe("ticketMap (แบบคำนวณ) — cache 20 วินาที", () => {
  test("ให้เลขตั๋วตามวันและลำดับ id และเรียกซ้ำภายใน TTL ไม่ดึง Chatwoot อีก", async () => {
    const cw = fakeChatwoot(5, 60);
    const first = await ticketMap(cw.fetchJson, NOW);
    expect(first.get(1000)).toBe("cosi-13-10-2026-005"); // id มากสุด = ลำดับท้าย
    expect(first.get(996)).toBe("cosi-13-10-2026-001");
    const n = cw.calls.length;
    const second = await ticketMap(cw.fetchJson, NOW + 5);
    expect(second).toBe(first); // object เดิมจาก cache
    expect(cw.calls).toHaveLength(n);
  });
});
