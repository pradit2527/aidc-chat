// ฝั่งเซิร์ฟเวอร์เท่านั้น — อ่านค่า Chatwoot จาก env (hmacToken ห้ามส่งไปฝั่ง browser)
import { createHmac } from "node:crypto";

export function chatwootConfig() {
  return {
    baseUrl: (process.env.CHATWOOT_BASE_URL || "https://chatwoot.aidclaos.com").replace(/\/+$/, ""),
    websiteToken: process.env.CHATWOOT_WEBSITE_TOKEN || "",
    hmacToken: process.env.CHATWOOT_HMAC_TOKEN || "",
  };
}

/** access token (Chatwoot → Profile Settings → Access Token) ของ "บัญชี agent กลาง" ที่แอดมินในระบบเองใช้ส่งต่อไปคอนโซลแชท — ว่าง = แอดมินในระบบเองใช้แชทไม่ได้ */
export const agentToken = () => (process.env.CHATWOOT_AGENT_TOKEN || "").trim();

/** identifier_hash ที่ Chatwoot ใช้ยืนยันว่า identifier มาจากเซิร์ฟเวอร์ของเรา (HMAC-SHA256, hex) */
export function signIdentifier(identifier: string): string | null {
  const { hmacToken } = chatwootConfig();
  if (!hmacToken) return null;
  return createHmac("sha256", hmacToken).update(identifier, "utf8").digest("hex");
}
