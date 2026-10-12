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
  const configured = { websiteToken: Boolean(websiteToken), hmacToken: Boolean(hmacToken) };
  return NextResponse.json({ ok: chatwoot.reachable && configured.websiteToken, baseUrl, chatwoot, configured });
}
