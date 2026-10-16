// ตัวช่วยยิง HTTP ใน e2e — เก็บคุกกี้เซสชันเอง (fetch ของ Node ไม่มี cookie jar)
export const BASE = (process.env.E2E_BASE_URL ?? "http://127.0.0.1:3401").replace(/\/+$/, "");

export type Res = { status: number; headers: Headers; text: string; json: unknown; redirect: string | null };

export class Client {
  private cookies = new Map<string, string>();

  constructor(public base: string = BASE) {}

  cookie(name: string) {
    return this.cookies.get(name);
  }

  setCookie(name: string, value: string) {
    this.cookies.set(name, value);
  }

  async req(
    path: string,
    init: { method?: string; json?: unknown; headers?: Record<string, string>; origin?: string | null } = {},
  ): Promise<Res> {
    const method = init.method ?? (init.json !== undefined ? "POST" : "GET");
    const headers: Record<string, string> = { accept: "application/json, text/html", ...(init.headers ?? {}) };
    if (init.json !== undefined) headers["content-type"] = "application/json";
    // POST จากหน้าเว็บของเราเองจะมี Origin ตรงกับโฮสต์ — ใส่ให้โดยอัตโนมัติ (ส่ง origin: null เพื่อไม่ใส่)
    if (method !== "GET" && init.origin !== null) headers.origin = init.origin ?? this.base;
    if (this.cookies.size) headers.cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
    const res = await fetch(this.base + path, {
      method,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      redirect: "manual",
    });
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [pair, ...attrs] = raw.split(";");
      const [name, ...rest] = pair.split("=");
      const value = rest.join("=");
      const maxAge = attrs.map((a) => a.trim().toLowerCase()).find((a) => a.startsWith("max-age="));
      if (!value || (maxAge && Number(maxAge.slice(8)) <= 0)) this.cookies.delete(name.trim());
      else this.cookies.set(name.trim(), value);
    }
    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return { status: res.status, headers: res.headers, text, json, redirect: res.headers.get("location") };
  }

  get = (path: string, headers?: Record<string, string>) => this.req(path, { headers });
  post = (path: string, json: unknown, opts: { origin?: string | null; headers?: Record<string, string> } = {}) =>
    this.req(path, { method: "POST", json, ...opts });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** รอจนเงื่อนไขเป็นจริง (ใช้กับงานเบื้องหลัง เช่น คำทักทายอัตโนมัติ) */
export async function waitFor<T>(fn: () => Promise<T>, ok: (v: T) => boolean, timeoutMs = 10_000): Promise<T> {
  const until = Date.now() + timeoutMs;
  let last: T = await fn();
  while (!ok(last) && Date.now() < until) {
    await sleep(500);
    last = await fn();
  }
  return last;
}

const MOCK_ADMIN = { email: "it.test@example.invalid", password: "mock-only-password" };

/** แอดมิน (Chatwoot จำลอง) ล็อกอินแล้วสร้างบัญชีพนักงาน คืน Client ของแอดมิน + ผลสร้าง */
export async function adminCreateUser(fields: Record<string, unknown>, admin = new Client()) {
  if (!admin.cookie("cosi_admin")) await admin.post("/api/admin/login", MOCK_ADMIN);
  const res = await admin.post("/api/admin/users", fields);
  return { admin, res };
}

/** สร้างบัญชีพนักงานผ่านแอดมิน แล้วล็อกอินด้วยบัญชีนั้น — คืน Client ของพนักงาน (มีคุกกี้ cosi_user) + profile */
export async function staffLogin(fields: { username: string; password: string; name: string; department: string; contact?: string }) {
  const { res } = await adminCreateUser({ contact: "", ...fields });
  if (res.status !== 201) throw new Error(`สร้างผู้ใช้ทดสอบไม่สำเร็จ: ${res.status} ${res.text}`);
  const staff = new Client();
  const login = await staff.post("/api/auth/login", { username: fields.username, password: fields.password });
  if (login.status !== 200) throw new Error(`ล็อกอินผู้ใช้ทดสอบไม่สำเร็จ: ${login.status}`);
  return { staff, profile: (login.json as { profile: Record<string, string> }).profile };
}
