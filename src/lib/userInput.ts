// ตรวจข้อมูลผู้ใช้ที่แอดมินกรอก (สร้าง/แก้ไข) — ใช้ร่วมกันใน route handler
import { DEPARTMENTS } from "./categories";
import { normalizeUsername, PASSWORD_MAX, PASSWORD_MIN, USERNAME_RE, type Role } from "./users";

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "";

type Err = { error: "username_invalid" | "password_invalid" | "name_required" | "department_required" };

/** แผนกบังคับเฉพาะพนักงาน — แอดมินในระบบเอง ไม่ต้องมีแผนก */
export function parseUserFields(b: Record<string, unknown> | null, role: Role = "staff"): Err | { name: string; department: string; contact: string } {
  const name = clean(b?.name, 80);
  const dept = DEPARTMENTS.find((d) => d.id === b?.department);
  if (!name) return { error: "name_required" };
  if (role === "staff" && !dept) return { error: "department_required" };
  return { name, department: dept?.id ?? "", contact: clean(b?.contact, 40) };
}

export const validPassword = (v: unknown): v is string => typeof v === "string" && v.length >= PASSWORD_MIN && v.length <= PASSWORD_MAX;

export function parseNewUser(b: Record<string, unknown> | null) {
  const username = normalizeUsername(clean(b?.username, 40));
  if (!USERNAME_RE.test(username)) return { error: "username_invalid" } as Err;
  if (!validPassword(b?.password)) return { error: "password_invalid" } as Err;
  const role: Role = b?.role === "admin" ? "admin" : "staff";
  const f = parseUserFields(b, role);
  if ("error" in f) return f;
  return { role, username, password: b?.password as string, ...f };
}
