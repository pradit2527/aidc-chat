import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { DEPARTMENTS } from "@/lib/categories";
import { signIdentifier } from "@/lib/chatwoot";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "";

/**
 * รับชื่อ/แผนกของพนักงาน → คืน identifier ที่คงที่ + identifier_hash (HMAC) ให้ widget ใช้ setUser
 * identifier มาจาก hash ของ ชื่อ+แผนก จึงเป็นคนเดิมเสมอไม่ว่าจะเปิดจากเครื่องไหน
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = clean(body?.name, 80);
  const contact = clean(body?.contact, 40);
  const dept = DEPARTMENTS.find((d) => d.id === body?.department);

  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!dept) return NextResponse.json({ error: "department_required" }, { status: 400 });

  const identifier =
    "cosi_" + createHash("sha256").update(`${name.toLowerCase()}|${dept.id}`, "utf8").digest("hex").slice(0, 24);

  return NextResponse.json({
    name,
    department: dept.id,
    departmentLabel: dept.label.en, // ใช้ภาษาอังกฤษใน Chatwoot ให้ทีมไอทีอ่านตรงกันทุกคน
    contact,
    identifier,
    identifierHash: signIdentifier(identifier),
  });
}
