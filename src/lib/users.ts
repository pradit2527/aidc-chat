// บัญชีผู้ใช้พนักงาน (username + รหัสผ่าน) — เก็บใน Neon (app_users) ถ้าตั้ง DATABASE_URL
// ไม่เช่นนั้นเก็บเป็นไฟล์ JSON บนดิสก์ (USERS_FILE, ค่าเริ่มต้น ./data/users.json) สำหรับเครื่องเดียว/ทดสอบในเครื่อง
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, dbEnabled, q } from "./db";

export type User = {
  id: number;
  username: string;
  name: string;
  department: string;
  contact: string;
};
type UserRow = User & { passwordHash: string };

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 100;

export const normalizeUsername = (v: string) => v.trim().toLowerCase();

// ---------- รหัสผ่าน ----------
const scryptAsync = (pw: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => scrypt(pw, salt, 64, (e, k) => (e ? reject(e) : resolve(k))));

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${(await scryptAsync(pw, salt)).toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string | null): Promise<boolean> {
  // ไม่มีผู้ใช้ → ยังคำนวณ hash หนึ่งครั้งเพื่อให้เวลาตอบใกล้เคียงกัน (กันเดา username)
  const [kind, saltHex, hashHex] = (stored ?? `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`).split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const got = await scryptAsync(pw, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(got, expected) && stored !== null;
}

// ---------- ที่เก็บ ----------
type FileShape = { nextId: number; users: (UserRow & { createdAt: string })[] };
const FILE = () => path.resolve(process.env.USERS_FILE || "./data/users.json");
let chain: Promise<unknown> = Promise.resolve(); // คิวเขียนไฟล์ทีละรายการ กัน username ซ้ำจากคำขอพร้อมกัน

async function readFileStore(): Promise<FileShape> {
  try {
    return JSON.parse(await readFile(FILE(), "utf8")) as FileShape;
  } catch {
    return { nextId: 1, users: [] };
  }
}
async function writeFileStore(d: FileShape) {
  await mkdir(path.dirname(FILE()), { recursive: true });
  const tmp = `${FILE()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(d, null, 2), { mode: 0o600 });
  await rename(tmp, FILE());
}

let ensured: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  ensured ??= db()
    .query(
      `CREATE TABLE IF NOT EXISTS app_users (
         id BIGSERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
         name TEXT NOT NULL, department TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '',
         created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    )
    .then(() => undefined)
    .catch((e) => {
      ensured = null;
      throw e;
    });
  return ensured;
}

type DbRow = { id: string; username: string; password_hash: string; name: string; department: string; contact: string };
const fromDb = (r: DbRow): UserRow => ({
  id: Number(r.id),
  username: r.username,
  passwordHash: r.password_hash,
  name: r.name,
  department: r.department,
  contact: r.contact,
});
const strip = (u: UserRow): User => ({ id: u.id, username: u.username, name: u.name, department: u.department, contact: u.contact });

async function findRow(username: string): Promise<UserRow | null> {
  if (dbEnabled) {
    await ensureTable();
    const r = await q<DbRow>("SELECT * FROM app_users WHERE username = $1", [username]);
    return r[0] ? fromDb(r[0]) : null;
  }
  return (await readFileStore()).users.find((u) => u.username === username) ?? null;
}

export class UsernameTakenError extends Error {}

export async function createUser(input: {
  username: string;
  password: string;
  name: string;
  department: string;
  contact: string;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const { username, name, department, contact } = input;
  if (dbEnabled) {
    await ensureTable();
    const r = await q<DbRow>(
      `INSERT INTO app_users (username, password_hash, name, department, contact)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (username) DO NOTHING RETURNING *`,
      [username, passwordHash, name, department, contact],
    );
    if (!r[0]) throw new UsernameTakenError();
    return strip(fromDb(r[0]));
  }
  const run = chain.then(async () => {
    const d = await readFileStore();
    if (d.users.some((u) => u.username === username)) throw new UsernameTakenError();
    const row = { id: d.nextId, username, passwordHash, name, department, contact, createdAt: new Date().toISOString() };
    d.users.push(row);
    d.nextId += 1;
    await writeFileStore(d);
    return strip(row);
  });
  chain = run.catch(() => undefined);
  return run;
}

/** ตรวจ username + รหัสผ่าน → คืนผู้ใช้ หรือ null ถ้าไม่ถูกต้อง */
export async function authenticate(usernameRaw: string, password: string): Promise<User | null> {
  const row = await findRow(normalizeUsername(usernameRaw));
  const ok = await verifyPassword(password, row?.passwordHash ?? null);
  return ok && row ? strip(row) : null;
}

export async function getUserById(id: number): Promise<User | null> {
  if (dbEnabled) {
    await ensureTable();
    const r = await q<DbRow>("SELECT * FROM app_users WHERE id = $1", [id]);
    return r[0] ? strip(fromDb(r[0])) : null;
  }
  const u = (await readFileStore()).users.find((x) => x.id === id);
  return u ? strip(u) : null;
}
