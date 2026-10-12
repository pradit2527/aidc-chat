import type { Lang } from "./i18n";

type Text = Record<Lang, string>;

export type IconName = "wifi" | "monitor" | "server" | "mail" | "camera" | "phone" | "dots";

// หมวดปัญหา — id ใช้ต่อท้ายชื่อ label ใน Chatwoot เป็น `cosi-<id>` (ดู docs/chatwoot-setup.md)
export const CATEGORIES: { id: string; icon: IconName; label: Text; hint: Text }[] = [
  {
    id: "network",
    icon: "wifi",
    label: { lo: "Wi-Fi / ອິນເຕີເນັດ", en: "Wi-Fi / Internet" },
    hint: { lo: "ເຊື່ອມຕໍ່ບໍ່ໄດ້, ຊ້າ, ຫຼຸດບ່ອຍ", en: "Can't connect, slow, keeps dropping" },
  },
  {
    id: "computer",
    icon: "monitor",
    label: { lo: "ຄອມພິວເຕີ / ເຄື່ອງພິມ", en: "Computer / Printer" },
    hint: { lo: "ເປີດບໍ່ຕິດ, ຄ້າງ, ພິມບໍ່ອອກ", en: "Won't start, frozen, can't print" },
  },
  {
    id: "pms",
    icon: "server",
    label: { lo: "ລະບົບໂຮງແຮມ (PMS / POS)", en: "Hotel system (PMS / POS)" },
    hint: { lo: "ເຊັກອິນ, ໃບບິນ, ເຄື່ອງ POS", en: "Check-in, billing, POS terminal" },
  },
  {
    id: "account",
    icon: "mail",
    label: { lo: "ອີເມວ / ບັນຊີຜູ້ໃຊ້", en: "Email / User account" },
    hint: { lo: "ລືມລະຫັດ, ເຂົ້າບໍ່ໄດ້, ຂໍສິດການເຂົ້າເຖິງ", en: "Password, can't sign in, access rights" },
  },
  {
    id: "cctv",
    icon: "camera",
    label: { lo: "ກ້ອງວົງຈອນປິດ / ລະບົບປະຕູ", en: "CCTV / Door access" },
    hint: { lo: "ກ້ອງບໍ່ຕິດ, ບັດເຂົ້າປະຕູບໍ່ໄດ້", en: "Camera offline, access card fails" },
  },
  {
    id: "phone",
    icon: "phone",
    label: { lo: "ໂທລະສັບ / ໂທລະທັດ", en: "Phone / TV" },
    hint: { lo: "ສາຍພາຍໃນ, IPTV ໃນຫ້ອງແຂກ", en: "Extensions, in-room IPTV" },
  },
  {
    id: "other",
    icon: "dots",
    label: { lo: "ອື່ນໆ", en: "Something else" },
    hint: { lo: "ບໍ່ແນ່ໃຈ — ບອກລາຍລະອຽດໃນແຊັດ", en: "Not sure — describe it in chat" },
  },
];

export const categoryLabel = (id: string) => `cosi-${id}`;
export const URGENT_LABEL = "cosi-urgent";

export const DEPARTMENTS: { id: string; label: Text }[] = [
  { id: "front-office", label: { lo: "ຕ້ອນຮັບ", en: "Front Office" } },
  { id: "housekeeping", label: { lo: "ແມ່ບ້ານ", en: "Housekeeping" } },
  { id: "fnb", label: { lo: "ອາຫານ ແລະ ເຄື່ອງດື່ມ", en: "Food & Beverage" } },
  { id: "sales", label: { lo: "ຂາຍ ແລະ ການຕະຫຼາດ", en: "Sales & Marketing" } },
  { id: "accounting", label: { lo: "ບັນຊີ", en: "Accounting" } },
  { id: "hr", label: { lo: "ຊັບພະຍາກອນບຸກຄົນ", en: "Human Resources" } },
  { id: "engineering", label: { lo: "ຊ່າງ", en: "Engineering" } },
  { id: "security", label: { lo: "ຮັກສາຄວາມປອດໄພ", en: "Security" } },
  { id: "management", label: { lo: "ຜູ້ບໍລິຫານ", en: "Management" } },
  { id: "other", label: { lo: "ອື່ນໆ", en: "Other" } },
];

export const DEPARTMENT_IDS = DEPARTMENTS.map((d) => d.id);
