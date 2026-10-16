// บัญชีพนักงาน: hash รหัสผ่าน, ที่เก็บแบบไฟล์ (ไม่มี DATABASE_URL), เซสชันผู้ใช้, ปลายทาง next ที่ปลอดภัย
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.SESSION_SECRET = "unit-test-secret-0123456789";
process.env.USERS_FILE = path.join(mkdtempSync(path.join(tmpdir(), "cosi-users-")), "users.json");
delete process.env.DATABASE_URL;

import { sealJson, unsealJson } from "@/lib/session";
import { safeNext } from "@/lib/userSession";
import {
  authenticate,
  createUser,
  getUserById,
  deleteUser,
  hashPassword,
  listUsers,
  updateUser,
  UsernameTakenError,
  USERNAME_RE,
  verifyPassword,
} from "@/lib/users";

const input = { username: "somchai", password: "secret1", name: "Somchai", department: "front-office", contact: "101" };

describe("รหัสผ่าน", () => {
  test("hash ไม่ใช่ข้อความเดิม, salt สุ่มทุกครั้ง, ตรวจถูก/ผิดได้", async () => {
    const a = await hashPassword("secret1");
    const b = await hashPassword("secret1");
    expect(a).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(a).not.toContain("secret1");
    expect(a).not.toBe(b);
    expect(await verifyPassword("secret1", a)).toBe(true);
    expect(await verifyPassword("secret2", a)).toBe(false);
    expect(await verifyPassword("secret1", null)).toBe(false);
  });
});

describe("ผู้ใช้ (ที่เก็บแบบไฟล์)", () => {
  test("สร้าง → ล็อกอินได้ (ไม่สนตัวพิมพ์ของ username) → ไม่คืน passwordHash", async () => {
    const u = await createUser(input);
    expect(u).toEqual({ id: 1, username: "somchai", role: "staff", name: "Somchai", department: "front-office", contact: "101" });
    expect(await authenticate("SomChai", "secret1")).toEqual(u);
    expect(await getUserById(1)).toEqual(u);
  });
  test("รหัสผิด / ไม่มีผู้ใช้ → null", async () => {
    expect(await authenticate("somchai", "nope")).toBeNull();
    expect(await authenticate("ghost", "secret1")).toBeNull();
    expect(await getUserById(999)).toBeNull();
  });
  test("username ซ้ำ → UsernameTakenError (แม้สร้างพร้อมกัน มีสำเร็จแค่รายเดียว)", async () => {
    await expect(createUser(input)).rejects.toBeInstanceOf(UsernameTakenError);
    const results = await Promise.allSettled([createUser({ ...input, username: "dup.user" }), createUser({ ...input, username: "dup.user" })]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });
  test("รูปแบบ username", () => {
    for (const ok of ["abc", "a.b-c_1", "user123"]) expect(USERNAME_RE.test(ok)).toBe(true);
    for (const bad of ["ab", "A B", "-abc", "ຊື່ລາວ", "a".repeat(33)]) expect(USERNAME_RE.test(bad)).toBe(false);
  });
});

describe("บทบาท staff / admin", () => {
  test("แอดมินในระบบเอง: ล็อกอินได้เฉพาะ role admin และพนักงานล็อกอินเป็นแอดมินไม่ได้ (และกลับกัน)", async () => {
    const a = await createUser({ role: "admin", username: "boss", password: "adminpw1", name: "Boss", department: "", contact: "" });
    expect(a.role).toBe("admin");
    expect(await authenticate("boss", "adminpw1", "admin")).toEqual(a);
    expect(await authenticate("boss", "adminpw1")).toBeNull(); // ไม่ใช่ staff
    expect(await authenticate("boss", "wrong", "admin")).toBeNull();
    const s = await createUser({ username: "worker", password: "workerpw1", name: "W", department: "sales", contact: "" });
    expect(s.role).toBe("staff");
    expect(await authenticate("worker", "workerpw1", "admin")).toBeNull();
  });
});

describe("จัดการโดยแอดมิน (ไฟล์)", () => {
  test("listUsers ไม่มีรหัสผ่าน และเรียงใหม่สุดก่อน", async () => {
    const list = await listUsers();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].id).toBeGreaterThan(list[list.length - 1].id);
    expect(JSON.stringify(list)).not.toMatch(/scrypt|passwordHash/);
    expect(list[0].createdAt).toBeGreaterThan(0);
  });
  test("updateUser แก้ข้อมูล; ไม่ส่ง password = รหัสเดิมใช้ได้; ส่ง = รหัสเดิมใช้ไม่ได้", async () => {
    const u = await updateUser(1, { name: "Somchai 2", department: "sales", contact: "" });
    expect(u).toMatchObject({ id: 1, name: "Somchai 2", department: "sales" });
    expect(await authenticate("somchai", "secret1")).not.toBeNull();
    await updateUser(1, { name: "Somchai 2", department: "sales", contact: "", password: "changed-9" });
    expect(await authenticate("somchai", "secret1")).toBeNull();
    expect(await authenticate("somchai", "changed-9")).not.toBeNull();
    expect(await updateUser(999, { name: "x", department: "sales", contact: "" })).toBeNull();
  });
  test("deleteUser ลบแล้วล็อกอิน/ค้นหาไม่ได้; ลบซ้ำ = false", async () => {
    expect(await deleteUser(1)).toBe(true);
    expect(await getUserById(1)).toBeNull();
    expect(await authenticate("somchai", "changed-9")).toBeNull();
    expect(await deleteUser(1)).toBe(false);
  });
});

describe("เซสชัน / next", () => {
  test("คุกกี้เซสชันหมดอายุแล้วใช้ไม่ได้ และถูกแก้ไขแล้วใช้ไม่ได้", () => {
    const ok = sealJson({ uid: 1, exp: Date.now() + 60_000 });
    expect(unsealJson<{ uid: number; exp: number }>(ok)?.uid).toBe(1);
    expect(unsealJson(sealJson({ uid: 1, exp: Date.now() - 1 }))).toBeNull();
    expect(unsealJson(ok.slice(0, -2) + "xx")).toBeNull();
  });
  test("safeNext อนุญาตเฉพาะหน้าพนักงานภายใน — กัน open redirect", () => {
    expect(safeNext("/chat")).toBe("/chat");
    expect(safeNext("/report/Ticket13-10-2026-001")).toBe("/report/Ticket13-10-2026-001");
    for (const bad of ["https://evil.test", "//evil.test", "/admin", "/start/../admin", "/chat?x=1", undefined, 5]) {
      expect(safeNext(bad)).toBe("/start");
    }
  });
});
