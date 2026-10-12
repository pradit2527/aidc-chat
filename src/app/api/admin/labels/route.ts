import { adminRoute } from "@/lib/adminApi";
import type { LabelDTO, LabelsResponse } from "@/lib/adminTypes";
import { acct, cw, INBOX_ID, payloadArray, toConversation } from "@/lib/cw";
import type { Session } from "@/lib/session";

export const dynamic = "force-dynamic";

const PREFIX = process.env.CHATWOOT_LABEL_PREFIX ?? "cosi-";
const PAGE_SIZE = 25;
const MAX_PAGES = 8; // นับงานเปิดจากบทสนทนาล่าสุดสูงสุด 200 รายการ

type Raw = Record<string, unknown>;
const asObj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});

/** นับบทสนทนาด้วย endpoint meta ของ Chatwoot (นับที่ฝั่ง server ของ Chatwoot จึงไม่ติดเพดานหน้าละ 25) */
async function count(s: Session, status: string, label?: string): Promise<number> {
  const q = new URLSearchParams({ inbox_id: INBOX_ID, status, assignee_type: "all" });
  if (label) q.append("labels[]", label);
  try {
    const body = asObj(await cw<unknown>(s, acct(`/conversations/meta?${q}`)));
    const meta = asObj(body.meta ?? asObj(body.data).meta);
    return Number(meta.all_count) || 0;
  } catch {
    return 0;
  }
}

/** งานที่ยังเปิดอยู่ต่อป้ายกำกับ = บทสนทนาที่เปิดอยู่ และหัวข้อนั้น "ยังไม่ถูกปิด" (ดู closed_topics) */
async function openTopicCounts(s: Session): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = new URLSearchParams({ inbox_id: INBOX_ID, status: "open", assignee_type: "all", page: String(page) });
    const rows = payloadArray(await cw<unknown>(s, acct(`/conversations?${q}`))).map(toConversation);
    for (const c of rows) {
      for (const l of c.labels) {
        if (!c.closedTopics.includes(l)) counts.set(l, (counts.get(l) ?? 0) + 1);
      }
    }
    if (rows.length < PAGE_SIZE) break;
  }
  return counts;
}

// แคชสั้น ๆ ต่อผู้ใช้ — หน้าจอ poll ทุก 10 วินาที แต่ไม่ต้องยิง Chatwoot หลายสิบครั้งทุกรอบ
const cache = new Map<number, { at: number; data: LabelsResponse }>();
const TTL_MS = 6000;

export async function GET(req: Request) {
  return adminRoute(req, async (s) => {
    const hit = cache.get(s.user.id);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

    const raw = asObj(await cw<unknown>(s, acct("/labels")));
    const labels = payloadArray(raw)
      .map(asObj)
      .filter((l) => typeof l.title === "string" && (l.title as string).startsWith(PREFIX));

    const [open, all, openByLabel, totals] = await Promise.all([
      count(s, "open"),
      count(s, "all"),
      openTopicCounts(s).catch(() => new Map<string, number>()),
      Promise.all(labels.map((l) => count(s, "all", l.title as string))),
    ]);

    const perLabel: LabelDTO[] = labels.map((l, i) => {
      const title = l.title as string;
      return {
        title,
        color: typeof l.color === "string" ? l.color : "#64748b",
        description: typeof l.description === "string" ? l.description : "",
        open: openByLabel.get(title) ?? 0,
        total: totals[i],
      };
    });

    const data: LabelsResponse = {
      totals: { open, resolved: Math.max(0, all - open), all },
      labels: perLabel,
    };
    cache.set(s.user.id, { at: Date.now(), data });
    return data;
  });
}
