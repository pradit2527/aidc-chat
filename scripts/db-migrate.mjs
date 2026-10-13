// สร้าง/อัปเดตตารางใน Neon ตาม db/schema.sql (รันซ้ำได้) — อ่าน DATABASE_URL จาก .env.local หรือ env
import { readFileSync, existsSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");
if (!process.env.DATABASE_URL) {
  console.error("ไม่พบ DATABASE_URL (.env.local)");
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(readFileSync("db/schema.sql", "utf8"));
  const t = await pool.query(
    "select table_name, (select count(*) from information_schema.columns c where c.table_name=t.table_name) as cols from information_schema.tables t where table_schema='public' order by 1",
  );
  console.log("✔ ตารางพร้อม:", t.rows.map((r) => `${r.table_name}(${r.cols})`).join(", "));
} finally {
  await pool.end();
}
