// ข้อความสองภาษา, หมวดปัญหา/แผนก, ตัวช่วยแสดงผลของคอนโซล
import { initialOf, labelName } from "@/lib/adminClient";
import { CATEGORIES, categoryLabel, DEPARTMENT_IDS, DEPARTMENTS, URGENT_LABEL } from "@/lib/categories";
import { DEFAULT_LANG, isLang, LANG_COOKIE, LANGS, translate } from "@/lib/i18n";

describe("i18n", () => {
  test("ภาษาเริ่มต้นคือลาว และรองรับ lo/en เท่านั้น", () => {
    expect(DEFAULT_LANG).toBe("lo");
    expect(LANGS.map((l) => l.id)).toEqual(["lo", "en"]);
    expect(LANG_COOKIE).toBe("lang");
    expect(isLang("lo")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("th")).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  test("ชื่อระบบตามที่ผู้ใช้กำหนด (ลาว) และคำแปลอังกฤษ", () => {
    expect(translate("lo", "heroTitle")).toBe("ລະບົບການແຈ້ງບັນຫາ");
    expect(translate("en", "heroTitle")).toBe("Problem Reporting System");
    expect(translate("lo", "step1Title")).toBe("1. ຜູ້ໃຊ້ງານ");
    expect(translate("en", "admTitle")).toBe("Ticket Support");
  });

  test("แทนที่ตัวแปร {n} {h} {m} ได้ทุกตำแหน่ง", () => {
    expect(translate("en", "stMinutes", { n: 5 })).toBe("5 min");
    expect(translate("lo", "stMinutes", { n: 5 })).toBe("5 ນາທີ");
    expect(translate("en", "stHours", { h: 1, m: 5 })).toBe("1 h 5 min");
    expect(translate("en", "stPerDay", { n: 14 })).toContain("14");
  });

  test("ไม่มีตัวแปร → คืนข้อความดิบไม่เปลี่ยน", () => {
    expect(translate("en", "stMinutes")).toBe("{n} min");
  });
});

describe("หมวดปัญหา (CATEGORIES)", () => {
  test("มี 7 หมวด id ไม่ซ้ำ และตรงกับ label ใน Chatwoot (cosi-<id>)", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(["network", "computer", "pms", "account", "cctv", "phone", "other"]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(categoryLabel("network")).toBe("cosi-network");
    expect(URGENT_LABEL).toBe("cosi-urgent");
  });

  test("ทุกหมวดมีข้อความลาวและอังกฤษครบ (label + hint) และไอคอน", () => {
    for (const c of CATEGORIES) {
      expect(c.label.lo.trim()).not.toBe("");
      expect(c.label.en.trim()).not.toBe("");
      expect(c.hint.lo.trim()).not.toBe("");
      expect(c.hint.en.trim()).not.toBe("");
      expect(c.icon).toBeTruthy();
    }
  });

  test("แผนก 10 รายการ id ไม่ซ้ำ มีสองภาษา", () => {
    expect(DEPARTMENTS).toHaveLength(10);
    expect(new Set(DEPARTMENT_IDS).size).toBe(10);
    expect(DEPARTMENT_IDS).toContain("front-office");
    for (const d of DEPARTMENTS) {
      expect(d.label.lo).toBeTruthy();
      expect(d.label.en).toBeTruthy();
    }
  });
});

describe("adminClient helpers", () => {
  test("labelName แปลง label เป็นชื่ออ่านง่ายตามภาษา", () => {
    expect(labelName("cosi-network", "lo")).toBe("Wi-Fi / ອິນເຕີເນັດ");
    expect(labelName("cosi-network", "en")).toBe("Wi-Fi / Internet");
    expect(labelName("cosi-other", "en")).toBe("Something else");
  });
  test("label ด่วน มีคำแปลเฉพาะ และ label ที่ไม่รู้จักคืนค่าเดิม", () => {
    expect(labelName("cosi-urgent", "lo")).not.toBe("cosi-urgent");
    expect(labelName("cosi-urgent", "en")).not.toBe("cosi-urgent");
    expect(labelName("support", "lo")).toBe("support");
  });
  test("initialOf ใช้อักษรแรก (รองรับอักษรลาว/ไทย) และ ? เมื่อว่าง", () => {
    expect(initialOf("Pradit Ratthanoo")).toBe("P");
    expect(initialOf("  khamsavath")).toBe("K");
    expect(initialOf("ນາງ ນານາ")).toBe("ນ");
    expect(initialOf("")).toBe("?");
    expect(initialOf("   ")).toBe("?");
  });
});
