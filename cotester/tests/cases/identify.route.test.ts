// POST /api/identify — ตัวตนพนักงานสำหรับ widget (identifier คงที่ + HMAC)
import { createHmac } from "node:crypto";
import { POST } from "@/app/api/identify/route";

const call = (body: unknown) =>
  POST(new Request("http://localhost/api/identify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));

describe("POST /api/identify", () => {
  test("ไม่มีชื่อ → 400 name_required", async () => {
    const res = await call({ department: "front-office" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "name_required" });
  });

  test("ชื่อเป็นช่องว่างล้วน → ถือว่าไม่มีชื่อ", async () => {
    expect((await call({ name: "   ", department: "front-office" })).status).toBe(400);
  });

  test("แผนกไม่อยู่ในรายการ → 400 department_required", async () => {
    const res = await call({ name: "Pradit", department: "spa" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "department_required" });
  });

  test("body ไม่ใช่ JSON → 400 (ไม่ล่ม)", async () => {
    const res = await POST(new Request("http://localhost/api/identify", { method: "POST", body: "{bad" }));
    expect(res.status).toBe(400);
  });

  test("ข้อมูลถูกต้อง → identifier คงที่ + identifierHash = HMAC-SHA256 ของ identifier", async () => {
    const res = await call({ name: "  Pradit   R ", department: "front-office", contact: " 101 " });
    expect(res.status).toBe(200);
    const j = (await res.json()) as Record<string, string>;
    expect(j.name).toBe("Pradit R"); // ช่องว่างซ้ำถูกยุบ, ตัดหัวท้าย
    expect(j.contact).toBe("101");
    expect(j.department).toBe("front-office");
    expect(j.departmentLabel).toBe("Front Office"); // ใช้อังกฤษใน Chatwoot
    expect(j.identifier).toMatch(/^cosi_[0-9a-f]{24}$/);
    expect(j.identifierHash).toBe(createHmac("sha256", "unit-hmac-token").update(j.identifier, "utf8").digest("hex"));
  });

  test("identifier เดิมเสมอเมื่อชื่อ (ไม่สนตัวพิมพ์) และแผนกเดิม; แผนกต่าง → ต่าง", async () => {
    const a = (await (await call({ name: "Pradit R", department: "front-office" })).json()) as { identifier: string };
    const b = (await (await call({ name: "PRADIT r", department: "front-office" })).json()) as { identifier: string };
    const c = (await (await call({ name: "Pradit R", department: "housekeeping" })).json()) as { identifier: string };
    expect(a.identifier).toBe(b.identifier);
    expect(a.identifier).not.toBe(c.identifier);
  });

  test("ชื่อยาวเกิน 80 ตัวอักษร → ตัดที่ 80, เบอร์เกิน 40 → ตัดที่ 40", async () => {
    const j = (await (await call({ name: "ก".repeat(100), department: "other", contact: "1".repeat(60) })).json()) as Record<string, string>;
    expect(j.name).toHaveLength(80);
    expect(j.contact).toHaveLength(40);
  });

  test("ไม่ได้ตั้ง CHATWOOT_HMAC_TOKEN → identifierHash เป็น null (widget ยังใช้ได้แต่ไม่ยืนยันตัวตน)", async () => {
    const prev = process.env.CHATWOOT_HMAC_TOKEN;
    process.env.CHATWOOT_HMAC_TOKEN = "";
    try {
      const j = (await (await call({ name: "A", department: "other" })).json()) as { identifierHash: string | null };
      expect(j.identifierHash).toBeNull();
    } finally {
      process.env.CHATWOOT_HMAC_TOKEN = prev;
    }
  });
});
