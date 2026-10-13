// การเชื่อมต่อ Neon Postgres (ทะเบียน Ticket + ประวัติ + สถิติ) — ปิดอัตโนมัติถ้าไม่มี DATABASE_URL
// ใช้ @neondatabase/serverless (pg-compatible Pool ผ่าน WebSocket) ซึ่งทำงานได้ทั้ง Node ปกติและ Vercel
import { Pool } from "@neondatabase/serverless";

export const dbEnabled = Boolean(process.env.DATABASE_URL);

// เก็บ pool ไว้ที่ globalThis เพื่อไม่ให้ HMR ตอนพัฒนาสร้าง pool ซ้ำ
const g = globalThis as unknown as { __cosiPool?: Pool };

export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ยังไม่ได้ตั้งค่า");
  g.__cosiPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return g.__cosiPool;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await db().query(text, params);
  return r.rows as T[];
}
