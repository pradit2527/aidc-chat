// เชื่อมต่อ WhatsApp แบบ "อุปกรณ์ที่เชื่อมต่อ" (Linked device — หลักการเดียวกับ WhatsApp Web) ด้วย Baileys
// เพื่อส่งแจ้งเตือนเข้า *กลุ่ม* WhatsApp ของทีมไอที (API ทางการของ WhatsApp และ Twilio ส่งเข้ากลุ่มไม่ได้)
// - เปิดด้วย WHATSAPP_DEVICE=1; ข้อมูลการเชื่อมต่อ (คีย์ของอุปกรณ์) อยู่ใต้ WHATSAPP_DIR/auth (ค่าเริ่มต้น ./data/whatsapp — บนเซิร์ฟเวอร์คือ volume ./data)
// - ทำงานใน process ของ Next (singleton บน globalThis) เริ่มอัตโนมัติตอนเซิร์ฟเวอร์ขึ้น (src/instrumentation.ts) ถ้าเคยสแกน QR แล้ว
// - แอดมินสแกน QR ที่หน้า /admin/whatsapp ด้วยเบอร์ของทีมไอที (ต้องเป็นสมาชิกกลุ่มที่จะรับแจ้งเตือน) แล้วเลือกกลุ่ม
// - ขาดการเชื่อมต่อ → ต่อใหม่เอง (backoff สูงสุด 30 วิ); ถูกยกเลิกจากมือถือ → ลบคีย์ รอสแกนใหม่
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import type { ConnectionState, WASocket } from "baileys";
import QRCode from "qrcode";
import { flagOn } from "./features";

export const deviceEnabled = () => flagOn(process.env.WHATSAPP_DEVICE);
export const deviceDir = () => process.env.WHATSAPP_DIR || path.join(process.cwd(), "data", "whatsapp");
const authDir = () => path.join(deviceDir(), "auth");

/** off = ปิดด้วย env · idle = ยังไม่เชื่อมต่อ/รอกดสร้าง QR · qr = รอสแกน · connecting · open = พร้อมส่ง · closed = หลุด กำลังต่อใหม่ · logged_out = ถูกยกเลิกจากมือถือ */
export type DeviceStatus = "off" | "idle" | "starting" | "qr" | "connecting" | "open" | "closed" | "logged_out" | "error";

export type DeviceState = {
  enabled: boolean;
  status: DeviceStatus;
  /** data URL ของรูป QR (เฉพาะตอน status = qr) */
  qr: string | null;
  qrAt: number | null;
  /** บัญชีที่เชื่อมต่ออยู่ */
  me: { phone: string; name: string } | null;
  lastError: string | null;
  /** เวลาที่เชื่อมต่อสำเร็จครั้งล่าสุด (ms) */
  since: number | null;
  sent: number;
  failed: number;
  queued: number;
};

export type GroupInfo = { jid: string; name: string; size: number };

const MAX_QR = 8; // WhatsApp ออก QR ใหม่ทุก ~20 วิ → รอราว 2.5 นาที แล้วหยุด (กด "เชื่อมต่อ" ใหม่ได้)
const QUEUE_MAX = 50;
const QUEUE_TIMEOUT_MS = 90_000;
const GROUPS_CACHE_MS = 60_000;

type Pending = { jid: string; text: string; resolve: () => void; reject: (e: Error) => void; timer: NodeJS.Timeout };
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

class Device {
  private sock: WASocket | null = null;
  private status: DeviceStatus = "idle";
  private qr: string | null = null;
  private qrAt: number | null = null;
  private qrCount = 0;
  private me: DeviceState["me"] = null;
  private lastError: string | null = null;
  private since: number | null = null;
  private sent = 0;
  private failed = 0;
  private queue: Pending[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private backoffMs = 2000;
  private stopping = false;
  private groups: { at: number; list: GroupInfo[] } | null = null;
  private starting: Promise<void> | null = null;

  getState(): DeviceState {
    const enabled = deviceEnabled();
    return {
      enabled,
      status: enabled ? this.status : "off",
      qr: this.status === "qr" ? this.qr : null,
      qrAt: this.qrAt,
      me: this.me,
      lastError: this.lastError,
      since: this.since,
      sent: this.sent,
      failed: this.failed,
      queued: this.queue.length,
    };
  }

  /** ตอนเซิร์ฟเวอร์ขึ้น: ต่อกลับเฉพาะเมื่อเคยสแกนไว้ (มี creds.json) — ไม่งั้นรอให้แอดมินกดสร้าง QR */
  async autoStart(): Promise<void> {
    if (!deviceEnabled()) return;
    try {
      await stat(path.join(authDir(), "creds.json"));
    } catch {
      return;
    }
    await this.start();
  }

  /** เริ่ม/ต่อใหม่ (force = ข้ามการตรวจสถานะ ใช้ตอน reconnect) */
  async start(force = false): Promise<void> {
    if (!deviceEnabled()) {
      this.status = "off";
      return;
    }
    if (this.starting) return this.starting;
    if (!force && ["open", "qr", "connecting", "starting"].includes(this.status)) return;
    this.starting = this.connect().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  private clearTimer() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private async connect() {
    this.clearTimer();
    this.stopping = false;
    this.status = "starting";
    this.lastError = null;
    this.qr = null;
    this.qrCount = 0;
    const old = this.sock;
    this.sock = null;
    if (old) {
      try {
        void old.end(undefined);
      } catch {
        // ปิดของเก่าไม่สำเร็จก็ไม่เป็นไร
      }
    }
    try {
      const baileys = await import("baileys");
      const { default: pino } = await import("pino");
      const logger = pino({ level: "silent" });
      await mkdir(authDir(), { recursive: true });
      const { state, saveCreds } = await baileys.useMultiFileAuthState(authDir());
      const version = await baileys
        .fetchLatestBaileysVersion()
        .then((v) => v.version)
        .catch(() => undefined);
      const sock = baileys.default({
        ...(version ? { version } : {}),
        logger,
        auth: { creds: state.creds, keys: baileys.makeCacheableSignalKeyStore(state.keys, logger) },
        browser: ["COSI Helpdesk", "Chrome", "1.0.0"],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
      });
      this.sock = sock;
      this.status = "connecting";
      sock.ev.on("creds.update", saveCreds);
      sock.ev.on("connection.update", (u) => void this.onUpdate(sock, u));
    } catch (e) {
      this.status = "error";
      this.lastError = msg(e);
      this.sock = null;
      console.error(`[whatsapp] connect: ${msg(e)}`);
    }
  }

  private async onUpdate(sock: WASocket, u: Partial<ConnectionState>) {
    if (sock !== this.sock) return; // เหตุการณ์ของ socket เก่าที่ถูกแทนแล้ว
    if (u.qr) {
      this.qrCount++;
      if (this.qrCount > MAX_QR) {
        // ไม่มีใครสแกน — หยุดไว้ก่อน ให้แอดมินกดสร้าง QR ใหม่เมื่อพร้อม
        this.stopping = true;
        this.lastError = "qr_expired";
        this.status = "idle";
        this.qr = null;
        this.sock = null;
        try {
          void sock.end(undefined);
        } catch {
          // ไม่เป็นไร
        }
        return;
      }
      this.qr = await QRCode.toDataURL(u.qr, { margin: 1, width: 320 }).catch(() => null);
      this.qrAt = Date.now();
      this.status = "qr";
    }
    if (u.connection === "open") {
      this.status = "open";
      this.qr = null;
      this.qrCount = 0;
      this.backoffMs = 2000;
      this.since = Date.now();
      this.lastError = null;
      this.groups = null;
      const id = sock.user?.id ?? ""; // รูป 8562012345678:3@s.whatsapp.net
      this.me = { phone: "+" + id.split(":")[0].split("@")[0], name: sock.user?.name ?? "" };
      console.log(`[whatsapp] linked as ${this.me.phone}`);
      void this.flush();
    }
    if (u.connection === "close") {
      const code = (u.lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;
      this.sock = null;
      this.qr = null;
      if (code === 401) {
        // loggedOut: ถูกยกเลิกอุปกรณ์จากมือถือ → ลบคีย์ รอสแกนใหม่
        this.status = "logged_out";
        this.me = null;
        this.lastError = null;
        await this.clearAuth();
        this.rejectAll("logged_out");
        console.warn("[whatsapp] logged out from phone — scan the QR again at /admin/whatsapp");
        return;
      }
      if (this.stopping) {
        this.status = "idle";
        return;
      }
      if (code === 515) {
        // restartRequired: ปกติหลังสแกนสำเร็จ WhatsApp ให้ต่อใหม่ทันที
        this.status = "connecting";
        void this.start(true);
        return;
      }
      this.lastError = `closed_${code ?? "unknown"}`;
      if (!sock.authState.creds.registered) {
        // ยังไม่เคยจับคู่ — ไม่วนต่อใหม่เอง
        this.status = "idle";
        return;
      }
      this.status = "closed";
      this.reconnectTimer = setTimeout(() => void this.start(true), this.backoffMs);
      this.backoffMs = Math.min(this.backoffMs * 2, 30_000);
    }
  }

  private async clearAuth() {
    await rm(authDir(), { recursive: true, force: true }).catch(() => {});
    this.groups = null;
  }

  private rejectAll(reason: string) {
    for (const p of this.queue) {
      clearTimeout(p.timer);
      this.failed++;
      p.reject(new Error(reason));
    }
    this.queue = [];
  }

  private async flush() {
    while (this.queue.length && this.status === "open" && this.sock) {
      const p = this.queue.shift()!;
      clearTimeout(p.timer);
      try {
        await this.sock.sendMessage(p.jid, { text: p.text });
        this.sent++;
        p.resolve();
      } catch (e) {
        this.failed++;
        p.reject(e instanceof Error ? e : new Error(String(e)));
      }
    }
  }

  /** ส่งข้อความ (jid ของกลุ่ม = <ตัวเลข>@g.us) — กำลังต่อใหม่อยู่จะเข้าคิวรอสูงสุด 90 วิ; ยังไม่เชื่อมต่อ → not_linked */
  async send(jid: string, text: string): Promise<void> {
    if (!deviceEnabled()) throw new Error("device_disabled");
    if (this.status === "open" && this.sock) {
      try {
        await this.sock.sendMessage(jid, { text });
        this.sent++;
        return;
      } catch (e) {
        this.failed++;
        throw e;
      }
    }
    if (!["connecting", "starting", "closed"].includes(this.status)) throw new Error("not_linked");
    if (this.queue.length >= QUEUE_MAX) throw new Error("queue_full");
    return new Promise<void>((resolve, reject) => {
      const p: Pending = {
        jid,
        text,
        resolve,
        reject,
        timer: setTimeout(() => {
          this.queue = this.queue.filter((x) => x !== p);
          this.failed++;
          reject(new Error("timeout"));
        }, QUEUE_TIMEOUT_MS),
      };
      this.queue.push(p);
    });
  }

  /** กลุ่มที่บัญชีนี้เป็นสมาชิก (แคช 60 วิ) — ยังไม่เชื่อมต่อ → รายการล่าสุดที่เคยดึงได้ (หรือว่าง) */
  async listGroups(force = false): Promise<GroupInfo[]> {
    if (this.status !== "open" || !this.sock) return this.groups?.list ?? [];
    if (!force && this.groups && Date.now() - this.groups.at < GROUPS_CACHE_MS) return this.groups.list;
    const all = await this.sock.groupFetchAllParticipating();
    const list = Object.values(all)
      .map((g) => ({ jid: g.id, name: g.subject, size: g.participants?.length ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
    this.groups = { at: Date.now(), list };
    return list;
  }

  /** ยกเลิกการเชื่อมต่อจากฝั่งเรา (ลบคีย์) — ต้องสแกน QR ใหม่ */
  async unlink(): Promise<void> {
    this.clearTimer();
    this.stopping = true;
    const s = this.sock;
    this.sock = null;
    if (s) {
      try {
        await s.logout();
      } catch {
        try {
          void s.end(undefined);
        } catch {
          // ไม่เป็นไร
        }
      }
    }
    await this.clearAuth();
    this.status = "idle";
    this.me = null;
    this.qr = null;
    this.lastError = null;
    this.rejectAll("unlinked");
  }
}

// singleton บน globalThis — HMR ตอนพัฒนาไม่สร้างการเชื่อมต่อซ้ำ
const g = globalThis as unknown as { __cosiWaDevice?: Device };
export function waDevice(): Device {
  g.__cosiWaDevice ??= new Device();
  return g.__cosiWaDevice;
}
