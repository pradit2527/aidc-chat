// คุกกี้เซสชันของทีมไอที — AES-256-GCM, หมดอายุ, ทนการแก้ไข
import { sealSession, SESSION_COOKIE, SESSION_TTL_SEC, unsealSession, type Session } from "@/lib/session";

const sample = (over: Partial<Session> = {}): Session => ({
  token: "tok-abc",
  client: "cli-xyz",
  uid: "it@example.invalid",
  user: { id: 1, name: "Pradit", email: "it@example.invalid" },
  exp: Date.now() + 60_000,
  ...over,
});

describe("sealSession / unsealSession", () => {
  test("ค่าคงที่ของคุกกี้", () => {
    expect(SESSION_COOKIE).toBe("cosi_admin");
    expect(SESSION_TTL_SEC).toBe(12 * 60 * 60);
  });

  test("เข้ารหัสแล้วถอดกลับได้ครบทุกฟิลด์", () => {
    const s = sample();
    const sealed = sealSession(s);
    expect(sealed).toMatch(/^[A-Za-z0-9_-]+$/); // base64url
    expect(unsealSession(sealed)).toEqual(s);
  });

  test("เข้ารหัสค่าเดิมสองครั้งได้ข้อความต่างกัน (iv สุ่ม) แต่ถอดได้เหมือนกัน", () => {
    const s = sample();
    const a = sealSession(s);
    const b = sealSession(s);
    expect(a).not.toBe(b);
    expect(unsealSession(a)).toEqual(unsealSession(b));
  });

  test("ไม่มี token ในคุกกี้ (ไม่เห็น token เป็นข้อความธรรมดา)", () => {
    const sealed = sealSession(sample({ token: "SECRET-TOKEN-VALUE" }));
    expect(Buffer.from(sealed, "base64url").toString("latin1")).not.toContain("SECRET-TOKEN-VALUE");
  });

  test("คุกกี้ที่ถูกแก้ไข 1 ตัวอักษร → null (auth tag ไม่ผ่าน)", () => {
    const sealed = sealSession(sample());
    const i = sealed.length - 2;
    const flipped = sealed.slice(0, i) + (sealed[i] === "A" ? "B" : "A") + sealed.slice(i + 1);
    expect(unsealSession(flipped)).toBeNull();
  });

  test("หมดอายุแล้ว → null", () => {
    expect(unsealSession(sealSession(sample({ exp: Date.now() - 1 })))).toBeNull();
  });

  test("ค่าว่าง / ขยะ / undefined → null ไม่โยน error", () => {
    expect(unsealSession(undefined)).toBeNull();
    expect(unsealSession("")).toBeNull();
    expect(unsealSession("not-a-cookie")).toBeNull();
  });

  test("เปลี่ยน SESSION_SECRET แล้วคุกกี้เดิมใช้ไม่ได้", () => {
    const sealed = sealSession(sample());
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "another-secret-0123456789abcdef";
    try {
      expect(unsealSession(sealed)).toBeNull();
    } finally {
      process.env.SESSION_SECRET = prev;
    }
    expect(unsealSession(sealed)).not.toBeNull();
  });

  test("SESSION_SECRET สั้นกว่า 16 ตัว หรือไม่มี → โยน error ตอนเข้ารหัส", () => {
    const prev = process.env.SESSION_SECRET;
    try {
      process.env.SESSION_SECRET = "short";
      expect(() => sealSession(sample())).toThrow(/SESSION_SECRET/);
      delete process.env.SESSION_SECRET;
      expect(() => sealSession(sample())).toThrow(/SESSION_SECRET/);
    } finally {
      process.env.SESSION_SECRET = prev;
    }
  });
});
