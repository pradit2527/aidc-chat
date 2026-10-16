// ชนิดข้อมูลที่คอนโซลไอทีใช้ร่วมกันระหว่าง API (server) กับหน้าจอ (client)

export type ConvStatus = "open" | "resolved" | "pending" | "snoozed";

/** local = แอดมินบัญชีในระบบเอง (email คือ username) */
export type AdminUser = { id: number; name: string; email: string; local?: boolean };

export type ConversationDTO = {
  id: number;
  status: ConvStatus;
  unread: number;
  /** เวลากิจกรรมล่าสุด (วินาที) */
  updatedAt: number;
  /** เวลาที่สร้างเคส (วินาที) */
  createdAt: number;
  /** เลขตั๋ว เช่น Ticket12-10-2026-001 (null = คำนวณไม่ได้) */
  ticket: string | null;
  name: string;
  /** แผนก / เบอร์ต่อ ที่พนักงานกรอกไว้ */
  subtitle: string;
  preview: string;
  previewFromContact: boolean;
  labels: string[];
  /** หัวข้อ (label) ที่ไอทีกดปิดไปแล้ว แต่บทสนทนายังเปิดอยู่เพราะยังมีหัวข้ออื่นค้าง */
  closedTopics: string[];
  /** เวลาที่ส่งคำทักทายอัตโนมัติล่าสุด (วินาที, 0 = ยังไม่เคย) จาก custom attribute `auto_greeted_at` */
  autoGreetedAt: number;
  assignee: { id: number; name: string } | null;
};

export type AttachmentDTO = { id: number; type: string; url: string; thumb: string; name: string };

export type MessageDTO = {
  id: number;
  /** เวลา (วินาที) */
  createdAt: number;
  kind: "incoming" | "outgoing" | "activity";
  content: string;
  private: boolean;
  senderName: string;
  attachments: AttachmentDTO[];
};

export type CannedDTO = { id: number; shortCode: string; content: string };

export type AgentDTO = { id: number; name: string };

/** ป้ายกำกับ + จำนวนงาน (บทสนทนา) ที่ติดป้ายนั้นใน inbox ของโรงแรม */
export type LabelDTO = {
  title: string;
  color: string;
  description: string;
  /** งานที่ยังเปิดอยู่ */
  open: number;
  /** งานทั้งหมด (รวมที่แก้ไขแล้ว) */
  total: number;
};

export type LabelsResponse = {
  totals: { open: number; resolved: number; all: number };
  labels: LabelDTO[];
};
