// ฝั่งเซิร์ฟเวอร์ — สร้างแผนที่ เลขเคส → เลขตั๋ว จากรายการเคสของ inbox (ดึงด้วย session ของไอที หรือ service token)
import type { ConversationDTO } from "./adminTypes";
import { acct, INBOX_ID, payloadArray, toConversation } from "./cw";
import { assignTickets, dayStart } from "./tickets";

type FetchJson = (path: string) => Promise<unknown>;

const PAGE_SIZE = 25;
const MAX_PAGES = 12; // สูงสุด 300 เคสล่าสุด
const TTL_MS = 20_000;

let cache: { at: number; coveredFrom: number; map: Map<number, string> } | null = null;

/**
 * เคสทุกสถานะที่มีกิจกรรมตั้งแต่ต้นวันของ `sinceSec` — ครบทุกเคสที่ "สร้าง" ตั้งแต่วันนั้น
 * (Chatwoot เรียงตามกิจกรรมล่าสุด จึงไล่หน้าไปจนกิจกรรมเก่ากว่าต้นวัน)
 */
export async function fetchConversationsSince(fetchJson: FetchJson, sinceSec: number): Promise<ConversationDTO[]> {
  const need = dayStart(sinceSec);
  const out: ConversationDTO[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = new URLSearchParams({ inbox_id: INBOX_ID, status: "all", assignee_type: "all", page: String(page) });
    const list = payloadArray(await fetchJson(acct(`/conversations?${q}`))).map(toConversation);
    out.push(...list);
    if (list.length < PAGE_SIZE) break;
    if (Math.min(...list.map((c) => c.updatedAt)) < need) break;
  }
  return out;
}

/**
 * เลขตั๋วของเคสที่สร้างตั้งแต่ `sinceSec` เป็นต้นไป (แบบคำนวณ ไม่ใช้ฐานข้อมูล) — ต้องดึงเคสของวันนั้นให้ครบจึงจะนับลำดับถูกต้อง
 */
export async function ticketMap(fetchJson: FetchJson, sinceSec: number): Promise<Map<number, string>> {
  const need = dayStart(sinceSec);
  if (cache && Date.now() - cache.at < TTL_MS && cache.coveredFrom <= need) return cache.map;

  const rows = (await fetchConversationsSince(fetchJson, need)).map((c) => ({ id: c.id, createdAt: c.createdAt }));
  const map = assignTickets(rows);
  cache = { at: Date.now(), coveredFrom: need, map };
  return map;
}
