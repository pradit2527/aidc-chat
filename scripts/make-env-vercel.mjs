// สร้างไฟล์ .env.vercel (git ignore) จาก .env.local สำหรับวางลง Vercel → Settings → Environment Variables
// ใช้: node scripts/make-env-vercel.mjs [https://your-domain]   (ค่าเริ่มต้น https://aidc-chat.vercel.app)
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const publicUrl = (process.argv[2] || "https://aidc-chat.vercel.app").replace(/\/+$/, "");
const env = {};
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const missing = ["CHATWOOT_WEBSITE_TOKEN", "CHATWOOT_HMAC_TOKEN"].filter((k) => !env[k]);

const lines = [
  "# วางทั้งไฟล์นี้ลงใน Vercel → Project → Settings → Environment Variables (ช่องรับหลายบรรทัด) แล้ว Redeploy",
  "# ไฟล์นี้ถูก git ignore (มีค่าลับ) — ห้ามส่งต่อ",
  `CHATWOOT_BASE_URL=${env.CHATWOOT_BASE_URL || "https://chatwoot.aidclaos.com"}`,
  `CHATWOOT_WEBSITE_TOKEN=${env.CHATWOOT_WEBSITE_TOKEN || ""}`,
  `CHATWOOT_HMAC_TOKEN=${env.CHATWOOT_HMAC_TOKEN || ""}`,
  `CHATWOOT_ACCOUNT_ID=${env.CHATWOOT_ACCOUNT_ID || "1"}`,
  `CHATWOOT_INBOX_ID=${env.CHATWOOT_INBOX_ID || "5"}`,
  // production ใช้ secret คนละตัวกับเครื่องพัฒนา
  `SESSION_SECRET=${randomBytes(32).toString("hex")}`,
  `PORTAL_PUBLIC_URL=${publicUrl}`,
  "",
];
writeFileSync(".env.vercel", lines.join("\n"), "utf8");
console.log(`✔ เขียน .env.vercel แล้ว (${lines.filter((l) => /^[A-Z]/.test(l)).length} ตัวแปร) — เปิดไฟล์ คัดลอกทั้งหมด แล้ววางใน Vercel`);
if (missing.length) console.log(`⚠ ค่าใน .env.local ยังว่าง: ${missing.join(", ")} — เติมก่อนวาง`);
