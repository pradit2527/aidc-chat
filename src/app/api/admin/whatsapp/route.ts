import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { deviceEnabled, waDevice } from "@/lib/waDevice";
import {
  getGroupTarget,
  isGroupJid,
  listRecipients,
  normalizePhone,
  recentNotifications,
  saveRecipients,
  sendGroupTest,
  sendTest,
  setGroupTarget,
  whatsappStatus,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** ภาพรวมสำหรับหน้า /admin/whatsapp — ไม่มีค่าลับ (อุปกรณ์: สถานะ/QR/กลุ่ม, Twilio: ตั้งค่าครบหรือยัง + เบอร์ผู้ส่ง) */
async function view() {
  const d = waDevice();
  const [group, groups, recipients, recent] = await Promise.all([
    getGroupTarget(),
    d.listGroups().catch(() => []),
    listRecipients(),
    recentNotifications(),
  ]);
  return { db: dbEnabled, device: { ...d.getState(), group, groups }, twilio: whatsappStatus(), recipients, recent };
}

/** GET ?summary=1 = เฉพาะสถานะย่อ (หน้าหลักทีมไอทีใช้เตือนว่ายังตั้งค่าไม่ครบ) */
export async function GET(req: Request) {
  const summary = new URL(req.url).searchParams.get("summary") === "1";
  return adminRoute(req, async () => {
    if (!summary) return view();
    const s = waDevice().getState();
    const group = deviceEnabled() ? await getGroupTarget() : null;
    const t = whatsappStatus();
    return {
      db: dbEnabled,
      device: { enabled: s.enabled, status: s.status, group: group?.name ?? null },
      twilio: { configured: t.configured, recipients: t.configured ? (await listRecipients()).length : 0 },
    };
  });
}

const ACTIONS = new Set(["link", "unlink", "group", "groups", "testGroup", "add", "remove", "test"]);

/**
 * อุปกรณ์/กลุ่ม: {action:"link"} สร้าง QR/ต่อใหม่ · {action:"unlink"} ยกเลิก · {action:"group", jid} เลือกกลุ่ม · {action:"groups"} โหลดรายชื่อกลุ่มใหม่ · {action:"testGroup"}
 * Twilio: {action:"add", phone, label} · {action:"remove", phone} · {action:"test", phone?} (ไม่ใส่เบอร์ = ทุกเบอร์)
 * ผลลัพธ์ทางธุรกิจ (เบอร์ผิด/ซ้ำ/ยังไม่ตั้งค่า) คืน 200 พร้อม ok:false + error เพื่อให้หน้าเว็บแสดงข้อความได้ตรง
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const action = typeof body?.action === "string" ? body.action : "";
  if (!ACTIONS.has(action)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!dbEnabled) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  return adminRoute(
    req,
    async () => {
      const d = waDevice();
      switch (action) {
        case "link": {
          if (!deviceEnabled()) return { ok: false, error: "device_off", ...(await view()) };
          await d.start();
          return { ok: true, ...(await view()) };
        }
        case "unlink": {
          await d.unlink();
          return { ok: true, ...(await view()) };
        }
        case "groups": {
          await d.listGroups(true).catch(() => []);
          return { ok: true, ...(await view()) };
        }
        case "group": {
          const jid = body?.jid;
          if (jid === null || jid === "") {
            await setGroupTarget(null);
            return { ok: true, ...(await view()) };
          }
          if (!isGroupJid(jid)) return { ok: false, error: "invalid_group", ...(await view()) };
          const known = (await d.listGroups().catch(() => [])).find((g) => g.jid === jid);
          const name = known?.name ?? String(body?.name ?? "").trim().slice(0, 120);
          await setGroupTarget({ jid, name });
          return { ok: true, ...(await view()) };
        }
        case "testGroup": {
          const group = await getGroupTarget();
          if (!group) return { ok: false, error: "no_group", ...(await view()) };
          const result = await sendGroupTest(group);
          return { ok: result.ok, results: [result], ...(await view()) };
        }
        case "add": {
          const list = await listRecipients();
          const phone = normalizePhone(body?.phone);
          const label = String(body?.label ?? "").normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 60);
          if (!phone) return { ok: false, error: "invalid_phone", ...(await view()) };
          if (list.some((x) => x.phone === phone)) return { ok: false, error: "duplicate", ...(await view()) };
          await saveRecipients([...list, { phone, label }]);
          return { ok: true, ...(await view()) };
        }
        case "remove": {
          const list = await listRecipients();
          const phone = normalizePhone(body?.phone);
          await saveRecipients(list.filter((x) => x.phone !== phone));
          return { ok: true, ...(await view()) };
        }
        default: {
          // test (Twilio)
          if (!whatsappStatus().configured) return { ok: false, error: "not_configured", ...(await view()) };
          const list = await listRecipients();
          const one = body?.phone ? normalizePhone(body.phone) : null;
          const targets = one ? [one] : list.map((x) => x.phone);
          if (targets.length === 0) return { ok: false, error: "no_recipients", ...(await view()) };
          const results = await sendTest(targets);
          return { ok: results.every((r) => r.ok), results, ...(await view()) };
        }
      }
    },
    { mutating: true },
  );
}
