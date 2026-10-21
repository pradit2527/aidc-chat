import type { NextConfig } from "next";

// ให้เครื่องอื่นในวงเครือข่ายเดียวกันเปิดทดสอบผ่าน http://<IP เครื่องนี้>:3400 ได้
// Next.js (โหมด dev) บล็อกคำขอข้ามต้นทางไปยัง /_next/* ตามค่าเริ่มต้น จึงต้องระบุ host ที่อนุญาต
// `*` = หนึ่งส่วนของชื่อ host — ครอบคลุมเฉพาะช่วง IP ภายใน (private) เท่านั้น
// เพิ่มชื่อเครื่อง/โดเมนอื่นได้ผ่านตัวแปร DEV_ALLOWED_ORIGINS (คั่นด้วยจุลภาค)
const extraOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Next 16 ยอมให้มี dev server เดียวต่อโฟลเดอร์ .next — ชุดเทส e2e ใช้ NEXT_DIST_DIR=.next-e2e เพื่อรันคู่กับ dev server ปกติได้
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // ไลบรารี WhatsApp (Baileys) และ logger ของมันใช้ของเฉพาะ Node — ให้ require ตรง ๆ ไม่ต้องผ่าน bundler ฝั่งเซิร์ฟเวอร์
  serverExternalPackages: ["baileys", "pino"],
  allowedDevOrigins: [
    "10.*.*.*",
    "192.168.*.*",
    ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
    "*.local",
    ...extraOrigins,
  ],
  experimental: {
    // แคชบนดิสก์ของ Turbopack ทำให้ route ตอบ 404 ค้างหลังรีสตาร์ท dev server (เจอใน aidc-booking) — ปิดไว้
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
