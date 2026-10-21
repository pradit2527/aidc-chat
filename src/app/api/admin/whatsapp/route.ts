import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { deviceEnabled, waDevice } from "@/lib/waDevice";
import { getGroupTarget, groupName, isGroupJid, recentNotifications, resolveGroupTarget, sendGroupTest, setGroupTarget } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** ภาพรวมสำหรับหน้า /admin/whatsapp — สถานะอุปกรณ์/QR, กลุ่ม (เลือกให้เองเมื่อเชื่อมต่อแล้ว), กลุ่มที่เลือกได้, ประวัติการส่ง (ไม่มีค่าลับ) */
async function view() {
  const d = waDevice();
  const [group, groups, recent] = await Promise.all([resolveGroupTarget(), d.listGroups().catch(() => []), recentNotifications()]);
  return {
    db: dbEnabled,
    device: { ...d.getState(), group, groups },
    groupName: groupName(),
    publicUrl: (process.env.PORTAL_PUBLIC_URL ?? "").trim() || null,
    recent,
  };
}

/** GET ?summary=1 = เฉพาะสถานะย่อ (หน้าหลักทีมไอทีใช้เตือนว่ายังตั้งค่าไม่ครบ) */
export async function GET(req: Request) {
  const summary = new URL(req.url).searchParams.get("summary") === "1";
  return adminRoute(req, async () => {
    if (!summary) return view();
    const s = waDevice().getState();
    const group = deviceEnabled() ? await resolveGroupTarget() : null;
    return { db: dbEnabled, device: { enabled: s.enabled, status: s.status, group: group?.name ?? null } };
  });
}

const ACTIONS = new Set(["link", "unlink", "group", "groups", "testGroup"]);

/**
 * {action:"link"} สร้าง QR/ต่อใหม่ · {action:"unlink"} ยกเลิกการเชื่อมต่อ · {action:"group", jid} เลือกกลุ่ม (jid ว่าง = ล้าง)
 * {action:"groups"} โหลดรายชื่อกลุ่มใหม่ · {action:"testGroup"} ส่งข้อความทดสอบเข้ากลุ่ม
 * ผลลัพธ์ทางธุรกิจ (ยังไม่เปิด/กลุ่มผิด/ยังไม่เลือกกลุ่ม) คืน 200 พร้อม ok:false + error ให้หน้าเว็บแสดงข้อความได้ตรง
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
          if (jid === null || jid === "" || jid === undefined) {
            await setGroupTarget(null);
            return { ok: true, ...(await view()) };
          }
          if (!isGroupJid(jid)) return { ok: false, error: "invalid_group", ...(await view()) };
          const known = (await d.listGroups().catch(() => [])).find((g) => g.jid === jid);
          const name = known?.name ?? String(body?.name ?? "").trim().slice(0, 120);
          await setGroupTarget({ jid, name });
          return { ok: true, ...(await view()) };
        }
        default: {
          const group = await getGroupTarget();
          if (!group) return { ok: false, error: "no_group", ...(await view()) };
          const result = await sendGroupTest(group);
          return { ok: result.ok, result, ...(await view()) };
        }
      }
    },
    { mutating: true },
  );
}
