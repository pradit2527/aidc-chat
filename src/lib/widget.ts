// ฝั่ง browser เท่านั้น — โหลด Chatwoot web widget และควบคุมผ่าน window.$chatwoot
import { URGENT_LABEL } from "./categories";
import type { Lang } from "./i18n";

export type ChatwootSdk = {
  toggle: (state?: "open" | "close") => void;
  setUser: (identifier: string, attrs: Record<string, unknown>) => void;
  setLocale: (locale: string) => void;
  setLabel: (label: string) => void;
  removeLabel?: (label: string) => void;
  setConversationCustomAttributes: (attrs: Record<string, unknown>) => void;
  reset: () => void;
};

declare global {
  interface Window {
    chatwootSettings?: Record<string, unknown>;
    chatwootSDK?: { run: (cfg: { websiteToken: string; baseUrl: string }) => void };
    $chatwoot?: ChatwootSdk;
  }
}

export type Profile = {
  name: string;
  department: string;
  departmentLabel: string;
  contact: string;
  identifier: string;
  identifierHash: string | null;
};

// widget ของ Chatwoot ไม่มีภาษาลาว — ถ้า locale ไม่รองรับ widget จะ fallback เป็นอังกฤษเอง
// ข้อความต้อนรับ/ข้อความนอกเวลาทำการภาษาลาวตั้งที่ตัว inbox ใน Chatwoot
const widgetLocale = (lang: Lang) => (lang === "lo" ? "lo" : "en");

type ChatMeta = { category: string; label: string; urgent: boolean };


let sdkPromise: Promise<ChatwootSdk> | null = null;
let pendingMeta: ChatMeta | null = null;
let appliedLabels: string[] = [];

export function loadChatwoot(opts: { baseUrl: string; websiteToken: string; lang: Lang }): Promise<ChatwootSdk> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<ChatwootSdk>((resolve, reject) => {
    window.chatwootSettings = {
      hideMessageBubble: true, // เปิดจากปุ่มของพอร์ทัลเอง ไม่ใช้ bubble เริ่มต้น
      position: "right",
      locale: widgetLocale(opts.lang),
      darkMode: "light",
      type: "standard",
    };
    window.addEventListener(
      "chatwoot:ready",
      () => (window.$chatwoot ? resolve(window.$chatwoot) : reject(new Error("chatwoot sdk missing"))),
      { once: true },
    );
    // บทสนทนาเพิ่งถูกสร้าง → ตอนนี้ติด label/attribute ได้แล้ว (ก่อนมีบทสนทนา setLabel จะไม่มีผล)
    window.addEventListener("chatwoot:on-start-conversation", () => {
      if (pendingMeta) applyMeta(pendingMeta);
    });
    const s = document.createElement("script");
    s.src = `${opts.baseUrl}/packs/js/sdk.js`;
    s.async = true;
    s.onload = () => window.chatwootSDK?.run({ websiteToken: opts.websiteToken, baseUrl: opts.baseUrl });
    s.onerror = () => reject(new Error("chatwoot sdk failed to load"));
    document.head.appendChild(s);
  }).catch((e) => {
    sdkPromise = null; // ให้กดลองใหม่ได้
    throw e;
  });
  return sdkPromise;
}

/** ระบุตัวผู้ใช้ให้ Chatwoot — ทีมไอทีจะเห็นชื่อ/แผนกในรายการแชท */
export function identify(cw: ChatwootSdk, p: Profile) {
  cw.setUser(p.identifier, {
    name: p.name,
    company_name: "COSI Hotel",
    description: [p.departmentLabel, p.contact].filter(Boolean).join(" · "),
    ...(p.identifierHash ? { identifier_hash: p.identifierHash } : {}),
  });
}

function applyMeta(meta: ChatMeta) {
  const cw = window.$chatwoot;
  if (!cw) return;
  const next = [meta.label, ...(meta.urgent ? [URGENT_LABEL] : [])];
  for (const old of appliedLabels) if (!next.includes(old)) cw.removeLabel?.(old);
  for (const l of next) cw.setLabel(l);
  appliedLabels = next;
  cw.setConversationCustomAttributes({ category: meta.category, priority: meta.urgent ? "urgent" : "normal" });
}

export function setChatMeta(meta: ChatMeta) {
  pendingMeta = meta;
  applyMeta(meta);
}

export function setWidgetLocale(lang: Lang) {
  window.$chatwoot?.setLocale(widgetLocale(lang));
}

export function resetChatwoot() {
  pendingMeta = null;
  appliedLabels = [];
  window.$chatwoot?.reset();
}
