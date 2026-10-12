import { NextResponse } from "next/server";
import { chatwootConfig } from "@/lib/chatwoot";

export const dynamic = "force-dynamic";

/** ตรวจว่าพอร์ทัลตั้งค่าครบ และเข้าถึง Chatwoot ได้ (ไม่คืนค่า token) */
export async function GET() {
  const { baseUrl, websiteToken, hmacToken } = chatwootConfig();
  let chatwoot: { reachable: boolean; version?: string } = { reachable: false };
  try {
    const r = await fetch(`${baseUrl}/api`, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (r.ok) chatwoot = { reachable: true, version: ((await r.json()) as { version?: string }).version };
  } catch {
    // reachable = false
  }
  const configured = {
    websiteToken: Boolean(websiteToken),
    hmacToken: Boolean(hmacToken),
    // แอดมินต้องมี SESSION_SECRET ยาว ≥ 16 ตัว (รายงานแค่ว่ามี/ไม่มี ไม่คืนค่า)
    sessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16),
  };
  return NextResponse.json({
    ok: chatwoot.reachable && configured.websiteToken && configured.sessionSecret,
    baseUrl,
    chatwoot,
    configured,
    // ช่วยไล่ปัญหาตอน deploy: อยู่บน Vercel หรือไม่ และ deployment ไหน
    host: process.env.VERCEL ? { vercel: true, env: process.env.VERCEL_ENV ?? null, url: process.env.VERCEL_URL ?? null } : { vercel: false },
  });
}
