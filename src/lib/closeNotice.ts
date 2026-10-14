// ข้อความแจ้งผู้ใช้ (พนักงานโรงแรม) เมื่อไอทีปิดเคส/ปิดหัวข้อ — ส่งเข้าแชทเป็นข้อความสาธารณะ ลาว + อังกฤษ
import { CATEGORIES } from "./categories";

type L = "lo" | "en";

const topicName = (title: string, lang: L) => {
  const cat = CATEGORIES.find((c) => `cosi-${c.id}` === title);
  return cat ? cat.label[lang] : title.replace(/^cosi-/, "");
};
const names = (titles: string[], lang: L) => titles.map((t) => topicName(t, lang)).join(", ");

export function closeNoticeText(opts: {
  closed: string[];
  remaining: string[];
  resolved: boolean;
  ticket?: string | null;
  /** ชื่อผู้แจ้งปัญหา — แสดงต่อท้ายเลขตั๋ว เช่น "ເຄສ Ticket13-10-2026-002 : ວິພາຣັດ ວັນນະຍຸກ ຖືກປິດແລ້ວ" */
  name?: string | null;
}): string {
  const { closed, remaining, resolved, ticket } = opts;
  const name = (opts.name ?? "").trim();
  const who = name && name !== "—" ? ` : ${name}` : "";
  if (resolved) {
    const loHead = (ticket ? `ເຄສ ${ticket}` : "ເຄສນີ້") + who;
    const enHead = (ticket ? `Case ${ticket}` : "Case") + who;
    const lo = [
      `✅ ${loHead} ຖືກປິດແລ້ວ${closed.length ? ` — ແກ້ໄຂແລ້ວ: ${names(closed, "lo")}` : ""}`,
      "ຂອບໃຈທີ່ແຈ້ງ ຖ້າຍັງມີບັນຫາອີກ ພິມຂໍ້ຄວາມໃໝ່ໄດ້ທຸກເວລາ.",
    ].join("\n");
    const en = [
      `✅ ${enHead} is now closed${closed.length ? ` — resolved: ${names(closed, "en")}` : ""}.`,
      "Thank you! If the problem comes back, just send a new message at any time.",
    ].join("\n");
    return `${lo}\n\n${en}`;
  }
  const lo = [`✅ ປິດຫົວຂໍ້ແລ້ວ: ${names(closed, "lo")}`, `⏳ ຍັງດຳເນີນການຢູ່: ${names(remaining, "lo")}`].join("\n");
  const en = [`✅ Resolved: ${names(closed, "en")}`, `⏳ Still in progress: ${names(remaining, "en")}`].join("\n");
  return `${lo}\n\n${en}`;
}
