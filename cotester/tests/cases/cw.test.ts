// แปลงข้อมูลดิบจาก Chatwoot → DTO ของคอนโซล (ต้องทนฟิลด์ที่หาย/ผิดชนิด)
import { acct, payloadArray, toAgent, toCanned, toConversation, toMessage } from "@/lib/cw";

const rawConv = (over: Record<string, unknown> = {}) => ({
  id: 19,
  status: "open",
  unread_count: 0,
  timestamp: 1_700_000_900,
  created_at: 1_700_000_000,
  labels: ["cosi-computer", "cosi-urgent", 42, null],
  custom_attributes: { closed_topics: " cosi-computer , cosi-other ,", auto_greeted_at: "2026-10-13T01:00:00Z" },
  meta: {
    sender: { name: "Lao Development Bank", additional_attributes: { description: "Security · 0205577441" } },
    assignee: { id: 1, name: "Pradit" },
  },
  last_non_activity_message: { message_type: 0, content: "  ສອບຖາມ   ເລື່ອງ  ", created_at: 1_700_000_900 },
  ...over,
});

describe("toConversation", () => {
  test("แปลงฟิลด์หลักครบ และกรอง label ที่ไม่ใช่ string", () => {
    const c = toConversation(rawConv());
    expect(c).toMatchObject({
      id: 19,
      status: "open",
      name: "Lao Development Bank",
      subtitle: "Security · 0205577441",
      labels: ["cosi-computer", "cosi-urgent"],
      closedTopics: ["cosi-computer", "cosi-other"],
      assignee: { id: 1, name: "Pradit" },
      ticket: null,
      createdAt: 1_700_000_000,
      updatedAt: 1_700_000_900,
      previewFromContact: true,
    });
    expect(c.preview).toBe("ສອບຖາມ ເລື່ອງ");
    expect(c.autoGreetedAt).toBe(Math.floor(Date.parse("2026-10-13T01:00:00Z") / 1000));
  });

  test("ตัวเลขแจ้งเตือน: ลูกค้าส่งล่าสุดและเคสเปิด → อย่างน้อย 1 แม้ unread_count = 0", () => {
    expect(toConversation(rawConv({ unread_count: 0 })).unread).toBe(1);
    expect(toConversation(rawConv({ unread_count: 3 })).unread).toBe(3);
  });
  test("ตัวเลขแจ้งเตือน: เคส resolved หรือข้อความล่าสุดเป็นของเจ้าหน้าที่ → ใช้ unread_count ตามจริง", () => {
    expect(toConversation(rawConv({ status: "resolved" })).unread).toBe(0);
    expect(
      toConversation(rawConv({ last_non_activity_message: { message_type: 1, content: "ok", created_at: 1 } })).unread,
    ).toBe(0);
  });

  test("สถานะที่ไม่รู้จัก → open, ชื่อหาย → —, ผู้รับผิดชอบหาย → null", () => {
    const c = toConversation({ id: 1, status: "weird", meta: {} });
    expect(c.status).toBe("open");
    expect(c.name).toBe("—");
    expect(c.assignee).toBeNull();
    expect(c.labels).toEqual([]);
    expect(c.closedTopics).toEqual([]);
    expect(c.autoGreetedAt).toBe(0);
  });

  test("subtitle ใช้ company_name เมื่อไม่มี description", () => {
    const c = toConversation(rawConv({ meta: { sender: { name: "A", additional_attributes: { company_name: "COSI" } } } }));
    expect(c.subtitle).toBe("COSI");
  });

  test("preview: ตัดที่ 120 ตัวอักษร และใช้ 📎 เมื่อมีแต่ไฟล์แนบ", () => {
    const long = "x".repeat(300);
    expect(toConversation(rawConv({ last_non_activity_message: { message_type: 0, content: long } })).preview).toHaveLength(120);
    expect(
      toConversation(rawConv({ last_non_activity_message: { message_type: 0, content: "", attachments: [{ id: 1 }] } })).preview,
    ).toBe("📎");
  });

  test("ไม่มี last_non_activity_message → ใช้ข้อความสุดท้ายใน messages", () => {
    const c = toConversation(rawConv({ last_non_activity_message: undefined, messages: [{ message_type: 1, content: "a" }, { message_type: 0, content: "ล่าสุด" }] }));
    expect(c.preview).toBe("ล่าสุด");
    expect(c.previewFromContact).toBe(true);
  });

  test("ข้อมูลไม่ใช่ object → DTO ค่าว่างที่ปลอดภัย", () => {
    const c = toConversation(null);
    expect(c.id).toBe(0);
    expect(c.status).toBe("open");
    expect(c.unread).toBe(0);
  });
});

describe("toMessage", () => {
  test.each([
    [0, "incoming"],
    ["incoming", "incoming"],
    [2, "activity"],
    ["activity", "activity"],
    [1, "outgoing"],
    ["outgoing", "outgoing"],
    [undefined, "outgoing"],
  ])("message_type %p → %s", (t, kind) => {
    expect(toMessage({ id: 1, message_type: t }).kind).toBe(kind);
  });

  test("ข้อความขาออกที่ไม่มีผู้ส่ง = Bot; มีผู้ส่ง = ชื่อผู้ส่ง; ขาเข้าไม่มีผู้ส่ง = ว่าง", () => {
    expect(toMessage({ message_type: 1 }).senderName).toBe("Bot");
    expect(toMessage({ message_type: 1, sender: { name: "Pradit" } }).senderName).toBe("Pradit");
    expect(toMessage({ message_type: 0 }).senderName).toBe("");
  });

  test("ไฟล์แนบ: ถอดชื่อไฟล์จาก URL และ thumb สำรองเป็น url", () => {
    const m = toMessage({
      id: 5,
      message_type: 0,
      private: false,
      attachments: [{ id: 9, file_type: "image", data_url: "https://x/y/%E0%BA%AE%E0%BA%B9%E0%BA%9A.png?sig=1" }],
    });
    expect(m.attachments).toEqual([{ id: 9, type: "image", url: "https://x/y/%E0%BA%AE%E0%BA%B9%E0%BA%9A.png?sig=1", thumb: "https://x/y/%E0%BA%AE%E0%BA%B9%E0%BA%9A.png?sig=1", name: "ຮູບ.png" }]);
    expect(m.private).toBe(false);
  });

  test("private เป็น true เฉพาะเมื่อเป็น boolean true", () => {
    expect(toMessage({ private: true }).private).toBe(true);
    expect(toMessage({ private: "true" }).private).toBe(false);
  });
});

describe("payloadArray — รองรับทุกรูปแบบที่ Chatwoot ห่อมา", () => {
  test.each([
    [[1, 2], [1, 2]],
    [{ payload: [1] }, [1]],
    [{ data: { payload: [2] } }, [2]],
    [{ data: [3] }, [3]],
    [{ foo: "bar" }, []],
    [null, []],
    ["text", []],
  ])("%p → %p", (input, expected) => {
    expect(payloadArray(input)).toEqual(expected);
  });
});

describe("ตัวช่วยอื่น", () => {
  test("acct ต่อ path ใต้ account 1", () => expect(acct("/labels")).toBe("/api/v1/accounts/1/labels"));
  test("toCanned / toAgent ทนฟิลด์หาย", () => {
    expect(toCanned({ id: 1, short_code: "ack", content: "x" })).toEqual({ id: 1, shortCode: "ack", content: "x" });
    expect(toCanned({})).toEqual({ id: 0, shortCode: "", content: "" });
    expect(toAgent({ id: 2, name: "Decha" })).toEqual({ id: 2, name: "Decha" });
    expect(toAgent(null)).toEqual({ id: 0, name: "" });
  });
});
