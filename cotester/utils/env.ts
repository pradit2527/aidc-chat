/**
 * ค่า env สำหรับเทส — โหลดก่อนทุกชุด (jest setupFiles)
 * ใช้ค่าปลอมที่คาดเดาได้ ไม่อ่าน .env.local และตัด DATABASE_URL ออกเพื่อไม่ให้ unit test แตะฐานข้อมูลจริง
 */
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "unit-test-secret-0123456789abcdef";
process.env.CHATWOOT_BASE_URL = "http://chatwoot.test";
process.env.CHATWOOT_WEBSITE_TOKEN = "unit-website-token";
process.env.CHATWOOT_HMAC_TOKEN = "unit-hmac-token";
process.env.CHATWOOT_ACCOUNT_ID = "1";
process.env.CHATWOOT_INBOX_ID = "5";
delete process.env.DATABASE_URL;
delete process.env.VERCEL;
delete process.env.ADMIN_AUTO_GREETING;
delete process.env.ADMIN_GREETING_IDLE_MIN;
