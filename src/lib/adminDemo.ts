// โหมดตัวอย่างของคอนโซลไอที (/admin?demo=1) — ใช้ดูหน้าตา/ทดสอบหน้าจอโดยไม่ต้องล็อกอิน
// เปิดได้เฉพาะตอนพัฒนา (NODE_ENV !== production) ข้อมูลทั้งหมดเป็นของปลอมและอยู่ในหน่วยความจำของ browser
import type { CannedDTO, ConversationDTO, LabelsResponse, MessageDTO } from "./adminTypes";
import { assignTickets } from "./tickets";

const now = () => Math.floor(Date.now() / 1000);
const ago = (min: number) => now() - min * 60;

const ME = { id: 1, name: "Pradit" };

let convs: ConversationDTO[] = [
  {
    id: 101, status: "open", unread: 3, updatedAt: ago(2), createdAt: 0, ticket: null, name: "ສົມໃຈ ວົງສະຫວັນ", subtitle: "Front Office · 101",
    preview: "Wi-Fi ຢູ່ເຄົາເຕີຕ້ອນຮັບໃຊ້ບໍ່ໄດ້ ແຂກກຳລັງລໍຖ້າເຊັກອິນ", previewFromContact: true,
    labels: ["cosi-network", "cosi-computer", "cosi-urgent"], closedTopics: [], assignee: null,
  },
  {
    id: 102, status: "open", unread: 1, updatedAt: ago(14), createdAt: 0, ticket: null, name: "Khamla Phommachan", subtitle: "Housekeeping · 205",
    preview: "Printer on floor 2 is not printing", previewFromContact: true, labels: ["cosi-computer", "cosi-account"], closedTopics: ["cosi-account"], assignee: ME,
  },
  {
    id: 103, status: "open", unread: 0, updatedAt: ago(41), createdAt: 0, ticket: null, name: "ນ້ອຍ ສີວິໄລ", subtitle: "Accounting",
    preview: "ກຳລັງກວດສອບໃຫ້ ລໍຖ້າສັກຄູ່", previewFromContact: false, labels: ["cosi-pms"], closedTopics: [], assignee: ME,
  },
  {
    id: 104, status: "open", unread: 2, updatedAt: ago(75), createdAt: 0, ticket: null, name: "Somsack", subtitle: "Security · 330",
    preview: "ກ້ອງຊັ້ນ 3 ບໍ່ຕິດ ມີພາບດຳ", previewFromContact: true, labels: ["cosi-cctv"], closedTopics: [], assignee: null,
  },
  {
    id: 105, status: "resolved", unread: 0, updatedAt: ago(60 * 20), createdAt: 0, ticket: null, name: "Vilay", subtitle: "F&B · 112",
    preview: "ຂອບໃຈ ໃຊ້ໄດ້ແລ້ວ", previewFromContact: true, labels: ["cosi-account"], closedTopics: [], assignee: ME,
  },
];

// เวลาสร้างเคสของข้อมูลตัวอย่าง + เลขตั๋ว (คำนวณด้วยฟังก์ชันเดียวกับของจริง)
const CREATED: Record<number, number> = { 101: ago(40), 102: ago(70), 103: ago(120), 104: ago(130), 105: ago(60 * 21) };
for (const c of convs) c.createdAt = CREATED[c.id] ?? c.updatedAt;
const demoTickets = assignTickets(convs);
for (const c of convs) c.ticket = demoTickets.get(c.id) ?? null;

const thread = (id: number): MessageDTO[] => {
  const c = convs.find((x) => x.id === id);
  const who = c?.name ?? "";
  const m = (i: number, kind: MessageDTO["kind"], content: string, min: number, extra: Partial<MessageDTO> = {}): MessageDTO => ({
    id: id * 100 + i, createdAt: ago(min), kind, content, private: false, senderName: kind === "incoming" ? who : "", attachments: [], ...extra,
  });
  return [
    m(1, "outgoing", "ສະບາຍດີ ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ ກະລຸນາບອກພວກເຮົາກ່ຽວກັບບັນຫາຂອງທ່ານ.", 30, { senderName: "Bot" }),
    m(2, "incoming", c?.preview ?? "…", 28),
    m(3, "activity", "Assigned to Pradit by Automation System", 27),
    m(4, "outgoing", "ຮັບເລື່ອງແລ້ວ ກຳລັງກວດສອບ ຂໍເວລາ 5 ນາທີ", 20, { senderName: ME.name }),
    m(5, "outgoing", "ລູກຄ້າຄົນນີ້ໃຊ້ຕູ້ສາຍ LAN ຕົວທີ 2 — ກວດ switch ຊັ້ນລຸ່ມ", 18, { senderName: ME.name, private: true }),
    m(6, "incoming", "ຍັງບໍ່ໄດ້ເທື່ອ ຮີບດ້ວຍ", 2),
  ];
};

const messagesStore = new Map<number, MessageDTO[]>();
const messagesOf = (id: number) => {
  if (!messagesStore.has(id)) messagesStore.set(id, thread(id));
  return messagesStore.get(id)!;
};

const labelsResponse = (): LabelsResponse => {
  const open = convs.filter((c) => c.status === "open");
  const defs: [string, string, number][] = [
    ["cosi-network", "#AC7F10", 5], ["cosi-computer", "#D2117C", 4], ["cosi-pms", "#BDACAC", 2],
    ["cosi-account", "#8264DE", 2], ["cosi-cctv", "#17B582", 1], ["cosi-phone", "#292BBB", 0],
    ["cosi-other", "#E84795", 1], ["cosi-urgent", "#413F2D", 2],
  ];
  return {
    totals: { open: open.length, resolved: convs.length - open.length, all: convs.length },
    labels: defs.map(([title, color, extra]) => {
      const o = open.filter((c) => c.labels.includes(title) && !c.closedTopics.includes(title)).length;
      return { title, color, description: "", open: o, total: o + extra };
    }),
  };
};

const canned: CannedDTO[] = [
  { id: 1, shortCode: "ack", content: "ຮັບເລື່ອງແລ້ວ ກຳລັງກວດສອບໃຫ້ ຂໍເວລາສັກຄູ່" },
  { id: 2, shortCode: "onsite", content: "ທີມໄອທີກຳລັງໄປຫາເຈົ້າ ກະລຸນາລໍຖ້າຢູ່ຈຸດເດີມ" },
  { id: 3, shortCode: "done", content: "ແກ້ໄຂແລ້ວ ກະລຸນາລອງໃຊ້ອີກຄັ້ງ ຖ້າຍັງມີບັນຫາແຈ້ງໄດ້ທັນທີ" },
];

type Init = { method?: string; json?: unknown };

export async function demoApi<T>(path: string, init: Init = {}): Promise<T> {
  await new Promise((r) => setTimeout(r, 120));
  const url = new URL(path, "http://demo.local");
  const p = url.pathname;
  const body = (init.json ?? {}) as Record<string, unknown>;
  let out: unknown = {};

  if (p === "/api/admin/conversations") {
    const status = url.searchParams.get("status") ?? "open";
    out = { conversations: convs.filter((c) => status === "all" || c.status === status) };
  } else if (p === "/api/admin/labels") {
    out = labelsResponse();
  } else if (p === "/api/admin/inbox") {
    out = { id: 5, name: "COSI Hotel Support", channel: "Channel::WebWidget" };
  } else if (p === "/api/admin/canned") {
    out = { canned, agents: [ME, { id: 2, name: "Decha" }] };
  } else {
    const m = p.match(/^\/api\/admin\/conversations\/(\d+)\/(messages|status|assign|read|topics)$/);
    if (m) {
      const id = Number(m[1]);
      const conv = convs.find((c) => c.id === id);
      if (m[2] === "messages" && init.json === undefined) {
        out = { messages: messagesOf(id) };
      } else if (m[2] === "messages" && conv) {
        const list = messagesOf(id);
        const msg: MessageDTO = {
          id: id * 100 + list.length + 10, createdAt: now(), kind: "outgoing", content: String(body.content ?? ""),
          private: body.private === true, senderName: ME.name, attachments: [],
        };
        list.push(msg);
        if (!msg.private) Object.assign(conv, { preview: msg.content, previewFromContact: false, updatedAt: msg.createdAt });
        out = { message: msg };
      } else if (m[2] === "topics" && conv) {
        const topics = conv.labels.filter((l) => l !== "cosi-urgent");
        const want = Array.isArray(body.close) ? (body.close as string[]) : [];
        const closed = new Set([...conv.closedTopics, ...want.filter((l) => topics.includes(l))]);
        conv.closedTopics = [...closed];
        if (typeof body.note === "string" && body.note) {
          messagesOf(id).push({
            id: id * 100 + messagesOf(id).length + 10, createdAt: now(), kind: "outgoing", content: body.note,
            private: true, senderName: ME.name, attachments: [],
          });
        }
        const resolved = topics.every((l) => closed.has(l));
        // ข้อความแจ้งผู้ใช้แบบสาธารณะ (ใน production ส่งจากเซิร์ฟเวอร์ ดู src/lib/closeNotice.ts)
        messagesOf(id).push({
          id: id * 100 + messagesOf(id).length + 20, createdAt: now(), kind: "outgoing", private: false, senderName: ME.name,
          content: resolved
            ? ["✅ ເຄສນີ້ຖືກປິດແລ້ວ", "ຂອບໃຈທີ່ແຈ້ງ ຖ້າຍັງມີບັນຫາອີກ ພິມຂໍ້ຄວາມໃໝ່ໄດ້ທຸກເວລາ.", "",
               "✅ This case is now closed.", "Thank you! If the problem comes back, just send a new message at any time."].join("\n")
            : ["✅ ປິດຫົວຂໍ້ແລ້ວ", "⏳ ຍັງດຳເນີນການຢູ່", "", "✅ Resolved", "⏳ Still in progress"].join("\n"),
          attachments: [],
        });
        if (resolved) conv.status = "resolved";
        out = { closedTopics: conv.closedTopics, resolved };
      } else if (m[2] === "status" && conv) {
        conv.status = body.status === "resolved" ? "resolved" : "open";
        if (conv.status === "open") conv.closedTopics = [];
      } else if (m[2] === "assign" && conv) {
        conv.assignee = body.assigneeId === 1 ? ME : body.assigneeId === 2 ? { id: 2, name: "Decha" } : null;
      } else if (m[2] === "read" && conv) {
        conv.unread = 0;
      }
    }
  }
  convs = convs.map((c) => ({ ...c }));
  return out as T;
}
