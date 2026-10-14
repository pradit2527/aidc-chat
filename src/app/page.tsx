import { networkInterfaces } from "node:os";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import QrPoster from "@/components/QrPoster";
import { DEFAULT_LANG, isLang, LANG_COOKIE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COSI Hotel · QR Code",
  description: "ສະແກນ QR ເຂົ້າລະບົບການແຈ້ງບັນຫາ COSI Hotel (Ticket System)",
};

// ชื่ออินเทอร์เฟซเสมือน (Hyper-V / VM / Docker / WSL ฯลฯ) ที่มือถือในวง Wi-Fi เข้าถึงไม่ได้
const VIRTUAL = /vethernet|virtual|vmware|vbox|hyper-v|wsl|docker|loopback|bluetooth|tailscale|zerotier/i;

/** IP ภายในของเครื่องนี้ที่ใช้ในวงเครือข่ายจริง (เลือก private IPv4 ของ Wi-Fi/LAN ตัวแรก) */
function lanIp(): string | null {
  const found: { name: string; address: string }[] = [];
  for (const [name, list] of Object.entries(networkInterfaces())) {
    if (VIRTUAL.test(name)) continue;
    for (const a of list ?? []) {
      if (a.family !== "IPv4" || a.internal) continue;
      if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address)) found.push({ name, address: a.address });
    }
  }
  return found[0]?.address ?? null;
}

const isLocalHost = (host: string) => /^(localhost|127\.|\[::1\])/i.test(host);

/** หน้าแรก = โปสเตอร์ QR (ชี้ไปหน้าพนักงาน /chat) — เปิดแถบเครื่องมือด้วย /?tools=1 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ tools?: string }> }) {
  const [{ tools }, jar, h] = await Promise.all([searchParams, cookies(), headers()]);
  const saved = jar.get(LANG_COOKIE)?.value;

  // ลำดับการเลือกลิงก์ใน QR: 1) PORTAL_PUBLIC_URL  2) ถ้าเปิดผ่าน localhost → ใช้ IP ของเครื่องนี้ (สแกนจากมือถือได้)
  //                          3) ว่าง → หน้าจอใช้ origin ที่เปิดอยู่ (เช่น โดเมนบน Vercel)
  let publicUrl = (process.env.PORTAL_PUBLIC_URL || "").trim();
  if (!publicUrl) {
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    const ip = isLocalHost(host) ? lanIp() : null;
    if (ip) {
      const port = host.includes(":") ? host.slice(host.lastIndexOf(":") + 1) : "";
      const proto = h.get("x-forwarded-proto") ?? "http";
      publicUrl = `${proto}://${ip}${port ? `:${port}` : ""}`;
    }
  }

  return <QrPoster initialLang={isLang(saved) ? saved : DEFAULT_LANG} publicUrl={publicUrl} showTools={tools === "1"} />;
}
