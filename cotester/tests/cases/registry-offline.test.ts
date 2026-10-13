// ทะเบียน Ticket เมื่อ "ไม่ได้ตั้ง DATABASE_URL" — ทุกฟังก์ชันต้องเป็น no-op ที่ปลอดภัย (ระบบยังใช้งานได้)
import { db, dbEnabled } from "@/lib/db";
import { logEvent, markFirstReply, registerTickets, syncTicket, ticketNoOf, unregisteredIds } from "@/lib/ticketRegistry";
import type { ConversationDTO } from "@/lib/adminTypes";

const conv: ConversationDTO = {
  id: 1,
  status: "open",
  unread: 0,
  updatedAt: 1,
  createdAt: 1,
  ticket: null,
  name: "A",
  subtitle: "",
  preview: "",
  previewFromContact: true,
  labels: [],
  closedTopics: [],
  autoGreetedAt: 0,
  assignee: null,
};

describe("ไม่มี DATABASE_URL", () => {
  test("dbEnabled = false และ db() โยน error ที่อ่านเข้าใจได้", () => {
    expect(dbEnabled).toBe(false);
    expect(() => db()).toThrow(/DATABASE_URL/);
  });
  test("registerTickets → map ว่าง (route จะ fallback ไปคำนวณจาก Chatwoot)", async () => {
    expect((await registerTickets([conv])).size).toBe(0);
  });
  test("unregisteredIds → [] (ไม่พยายาม backfill)", async () => {
    expect(await unregisteredIds([1, 2, 3])).toEqual([]);
  });
  test("ticketNoOf → null", async () => {
    expect(await ticketNoOf(conv)).toBeNull();
  });
  test("logEvent / markFirstReply / syncTicket จบโดยไม่โยน error", async () => {
    await expect(logEvent(1, "replied", "Pradit", {})).resolves.toBeUndefined();
    await expect(markFirstReply(1)).resolves.toBeUndefined();
    await expect(syncTicket(conv, "Pradit")).resolves.toBeUndefined();
  });
});
