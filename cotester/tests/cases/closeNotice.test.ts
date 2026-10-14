// ข้อความแจ้งผู้ใช้เมื่อไอทีปิดหัวข้อ/ปิดเคส (ลาว + อังกฤษ)
import { closeNoticeText } from "@/lib/closeNotice";

describe("closeNoticeText", () => {
  test("ปิดบางหัวข้อ: บอกหัวข้อที่ปิดและที่ยังค้าง ทั้งสองภาษา", () => {
    const text = closeNoticeText({ closed: ["cosi-computer"], remaining: ["cosi-other"], resolved: false });
    expect(text).toContain("✅ ປິດຫົວຂໍ້ແລ້ວ: ຄອມພິວເຕີ / ເຄື່ອງພິມ");
    expect(text).toContain("⏳ ຍັງດຳເນີນການຢູ່: ອື່ນໆ");
    expect(text).toContain("✅ Resolved: Computer / Printer");
    expect(text).toContain("⏳ Still in progress: Something else");
    expect(text).not.toContain("Ticket");
  });

  test("ปิดเคสพร้อมเลขตั๋ว: ใส่เลขตั๋วและหัวข้อที่แก้แล้ว", () => {
    const text = closeNoticeText({
      closed: ["cosi-computer", "cosi-other"],
      remaining: [],
      resolved: true,
      ticket: "Ticket13-10-2026-004",
    });
    expect(text).toContain("✅ ເຄສ Ticket13-10-2026-004 ຖືກປິດແລ້ວ — ແກ້ໄຂແລ້ວ: ຄອມພິວເຕີ / ເຄື່ອງພິມ, ອື່ນໆ");
    expect(text).toContain("✅ Case Ticket13-10-2026-004 is now closed — resolved: Computer / Printer, Something else.");
    expect(text).toContain("Thank you! If the problem comes back");
  });

  test("ใส่ชื่อผู้แจ้งต่อท้ายเลขตั๋ว (ผู้ใช้สั่ง): 'ເຄສ <ticket> : <ชื่อ> ຖືກປິດແລ້ວ' ทั้งสองภาษา", () => {
    const text = closeNoticeText({ closed: ["cosi-network"], remaining: [], resolved: true, ticket: "Ticket13-10-2026-002", name: " ວິພາຣັດ ວັນນະຍຸກ " });
    expect(text).toContain("✅ ເຄສ Ticket13-10-2026-002 : ວິພາຣັດ ວັນນະຍຸກ ຖືກປິດແລ້ວ — ແກ້ໄຂແລ້ວ: Wi-Fi / ອິນເຕີເນັດ");
    expect(text).toContain("✅ Case Ticket13-10-2026-002 : ວິພາຣັດ ວັນນະຍຸກ is now closed — resolved: Wi-Fi / Internet.");
  });

  test("ชื่อว่างหรือเป็น '—' (ไม่ทราบชื่อ) → ไม่ใส่ส่วนชื่อ; ไม่มีเลขตั๋วแต่มีชื่อ → 'ເຄສນີ້ : ชื่อ'", () => {
    expect(closeNoticeText({ closed: [], remaining: [], resolved: true, ticket: "T1", name: "—" })).toContain("✅ ເຄສ T1 ຖືກປິດແລ້ວ");
    expect(closeNoticeText({ closed: [], remaining: [], resolved: true, ticket: "T1", name: "" })).toContain("✅ Case T1 is now closed.");
    expect(closeNoticeText({ closed: [], remaining: [], resolved: true, ticket: null, name: "Bob" })).toContain("✅ ເຄສນີ້ : Bob ຖືກປິດແລ້ວ");
  });

  test("ปิดบางหัวข้อ: ข้อความไม่เปลี่ยนแม้ส่งชื่อมา", () => {
    const text = closeNoticeText({ closed: ["cosi-network"], remaining: ["cosi-pms"], resolved: false, name: "Bob" });
    expect(text).not.toContain("Bob");
  });

  test("ปิดเคสโดยไม่มีเลขตั๋วและไม่มีหัวข้อ: ใช้คำว่า 'เคสนี้'", () => {
    const text = closeNoticeText({ closed: [], remaining: [], resolved: true, ticket: null });
    expect(text).toContain("✅ ເຄສນີ້ ຖືກປິດແລ້ວ");
    expect(text).toContain("✅ Case is now closed.");
    expect(text).not.toContain("ແກ້ໄຂແລ້ວ:");
  });

  test("label ที่ไม่รู้จัก → ตัดคำนำหน้า cosi- ออกแล้วแสดงตามเดิม", () => {
    const text = closeNoticeText({ closed: ["cosi-xyz"], remaining: ["custom"], resolved: false });
    expect(text).toContain("ປິດຫົວຂໍ້ແລ້ວ: xyz");
    expect(text).toContain("Still in progress: custom");
  });

  test("ภาษาลาวมาก่อน คั่นด้วยบรรทัดว่าง แล้วตามด้วยอังกฤษ", () => {
    const text = closeNoticeText({ closed: ["cosi-network"], remaining: ["cosi-pms"], resolved: false });
    const [lo, en] = text.split("\n\n");
    expect(lo.startsWith("✅ ປິດຫົວຂໍ້ແລ້ວ")).toBe(true);
    expect(en.startsWith("✅ Resolved")).toBe(true);
  });
});
