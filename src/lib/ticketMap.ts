// ฝั่งเซิร์ฟเวอร์ — สร้างแผนที่ เลขเคส → เลขตั๋ว จากรายการเคสของ inbox (ดึงด้วย session ของไอที หรือ service token)
import { acct, INBOX_ID, payloadArray, toConversation } from "./cw";
import { assignTickets, dayStart } from "./tickets";

type FetchJson = (path: string) => Promise<unknown>;

const PAGE_SIZE = 25;
const MAX_PAGES = 12; // สูงสุด 300 เคสล่าสุด
const TTL_MS = 20_000;

let cache: { at: number; coveredFrom: number; map: Map<number, string> } | null = null;

/**
 * เลขตั๋วของเคสที่สร้างตั้งแต่ `sinceSec` เป็นต้นไป — ต้องดึงเคสของวันนั้นให้ครบจึงจะนับลำดับของวันถูกต้อง
 * (Chatwoot เรียงตามกิจกรรมล่าสุด จึงไล่หน้าไปจนกิจกรรมเก่ากว่าต้นวันของ sinceSec)
 */
export async function ticketMap(fetchJson: FetchJson, sinceSec: number): Promise<Map<number, string>> {
  const need = dayStart(sinceSec);
  if (cache && Date.now() - cache.at < TTL_MS && cache.coveredFrom <= need) return cache.map;

  const rows: { id: number; createdAt: number }[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = new URLSearchParams({ inbox_id: INBOX_ID, status: "all", assignee_type: "all", page: String(page) });
    const list = payloadArray(await fetchJson(acct(`/conversations?${q}`))).map(toConversation);
    for (const c of list) rows.push({ id: c.id, createdAt: c.createdAt });
    if (list.length < PAGE_SIZE) break;
    if (Math.min(...list.map((c) => c.updatedAt)) < need) break;
  }

  const map = assignTickets(rows);
  cache = { at: Date.now(), coveredFrom: need, map };
  return map;
}
