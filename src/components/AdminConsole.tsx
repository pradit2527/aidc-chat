"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { api, ApiError, fmtTime, initialOf, labelName } from "@/lib/adminClient";
import { demoApi } from "@/lib/adminDemo";
import type {
  AdminUser,
  AgentDTO,
  CannedDTO,
  ConversationDTO,
  ConvStatus,
  LabelsResponse,
  MessageDTO,
} from "@/lib/adminTypes";
import { URGENT_LABEL } from "@/lib/categories";
import { LANGS, type MsgKey } from "@/lib/i18n";
import { laoTime, ticketDate } from "@/lib/tickets";
import { AidcLogo } from "./AidcLogo";
import CloseCaseDialog, { type TopicItem } from "./CloseCaseDialog";
import { useI18n } from "./I18n";
import { Icon } from "./Icon";
import { ReportsLink } from "./ReportsLink";

type Tab = "open" | "resolved" | "all";
type Props = { user: AdminUser; onSignedOut: () => void; demo?: boolean; /** เปิดเคสนี้ทันที (ลิงก์จากหน้าหลักทีมไอที) */ initialConversationId?: number | null };

const PAGE_SIZE = 25;

// ---------- ตัวช่วยเล็ก ๆ ----------

function mergeMessages(prev: MessageDTO[], next: MessageDTO[]): MessageDTO[] {
  const map = new Map<number, MessageDTO>();
  for (const m of prev) map.set(m.id, m);
  for (const m of next) map.set(m.id, m);
  return [...map.values()].sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
}

function useInterval(fn: () => void, ms: number) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/** เสียงปิ๊งสั้น ๆ เมื่อมีข้อความใหม่ (ไม่ต้องมีไฟล์เสียง) */
function beep() {
  try {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    window.setTimeout(() => void ctx.close(), 700);
  } catch {
    // เบราว์เซอร์บล็อกเสียง — ข้าม
  }
}

// ค่าเปิด/ปิดเสียง เก็บใน localStorage (ใช้ useSyncExternalStore เพื่อไม่ให้ hydration ไม่ตรงกัน)
const SOUND_KEY = "cosi-support.sound";
const soundListeners = new Set<() => void>();
const getSound = () => {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};
const setSoundPref = (on: boolean) => {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // ไม่เป็นไร
  }
  soundListeners.forEach((l) => l());
};
const subscribeSound = (cb: () => void) => {
  soundListeners.add(cb);
  return () => void soundListeners.delete(cb);
};

/** ตัวเลขแจ้งเตือนสีแดง: เด้งเมื่อตัวเลขเปลี่ยน แล้วสั่นดึ๋งๆ เป็นช่วงๆ (key ผูกกับตัวเลขเพื่อเล่นแอนิเมชันใหม่) */
function UnreadBadge({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      key={n}
      aria-label={`${n} unread`}
      className={`unread-badge inline-grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm shadow-red-600/40 ${className}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

async function fetchConversations(
  call: typeof api,
  status: Tab,
  maxPages: number,
): Promise<ConversationDTO[]> {
  const byId = new Map<number, ConversationDTO>();
  for (let page = 1; page <= maxPages; page++) {
    const r = await call<{ conversations: ConversationDTO[] }>(
      `/api/admin/conversations?status=${status}&page=${page}`,
    );
    // ป้องกันข้อมูลจากเซิร์ฟเวอร์ที่ขาดฟิลด์ (เช่น เซิร์ฟเวอร์เวอร์ชันเก่ากว่าหน้าจอ) ไม่ให้ทั้งหน้าล่ม
    for (const c of r.conversations) {
      byId.set(c.id, {
        ...c,
        labels: c.labels ?? [],
        closedTopics: c.closedTopics ?? [],
        autoGreetedAt: c.autoGreetedAt ?? 0,
      });
    }
    if (r.conversations.length < PAGE_SIZE) break;
  }
  return [...byId.values()];
}

const STATUS_KEY: Record<ConvStatus, MsgKey> = {
  open: "admStatusOpen",
  resolved: "admStatusResolved",
  pending: "admStatusPending",
  snoozed: "admStatusSnoozed",
};

// ---------- คอนโซล ----------

export default function AdminConsole({ user, onSignedOut, demo = false, initialConversationId = null }: Props) {
  const { t, lang, setLang } = useI18n();
  const call = demo ? (demoApi as typeof api) : api;

  const [openList, setOpenList] = useState<ConversationDTO[] | null>(null);
  const [tabList, setTabList] = useState<ConversationDTO[] | null>(null);
  const [labels, setLabels] = useState<LabelsResponse | null>(null);
  const [canned, setCanned] = useState<CannedDTO[]>([]);
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [tab, setTab] = useState<Tab>("open");
  const [scope, setScope] = useState<"mine" | "unassigned" | "all">("all");
  const [inbox, setInbox] = useState<{ id: number; name: string } | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [isNote, setIsNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [offlineCode, setOfflineCode] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);
  const [flash, setFlash] = useState<Set<string>>(() => new Set());
  const sound = useSyncExternalStore(subscribeSound, getSound, () => true);

  // ref สำหรับ callback ที่ถูกเรียกจาก interval (ไม่ต้องสร้างใหม่ทุกครั้งที่ state เปลี่ยน)
  const selectedIdRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const soundRef = useRef(true);
  const prevUnread = useRef(new Map<number, number>());
  const loadedOnce = useRef(false);
  const readUpTo = useRef(new Map<number, number>());
  const stickBottom = useRef(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const signedOutRef = useRef(onSignedOut);
  const tabRef = useRef<Tab>("open");

  useEffect(() => {
    signedOutRef.current = onSignedOut;
    soundRef.current = sound;
  });

  useEffect(() => {
    const onVis = () => {
      visibleRef.current = document.visibilityState === "visible";
      setVisible(visibleRef.current);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const fail = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) signedOutRef.current();
    else {
      setOffline(true);
      setOfflineCode(e instanceof ApiError ? e.status : null);
    }
  }, []);

  // ---------- โหลดข้อมูล ----------

  const refreshOpen = useCallback(async () => {
    try {
      const list = await fetchConversations(call, "open", 4);
      const prev = prevUnread.current;
      const bumped = new Set<string>();
      let increased = false;
      for (const c of list) {
        const viewing = c.id === selectedIdRef.current && visibleRef.current;
        if (c.unread > (prev.get(c.id) ?? 0) && !viewing) {
          increased = true;
          c.labels.forEach((l) => bumped.add(l));
        }
      }
      prevUnread.current = new Map(list.map((c) => [c.id, c.unread]));
      setOpenList(list);
      setOffline(false);
      if (increased && loadedOnce.current) {
        if (soundRef.current) beep();
        if (bumped.size) {
          setFlash(bumped);
          window.setTimeout(() => setFlash(new Set()), 1800);
        }
      }
      loadedOnce.current = true;
    } catch (e) {
      fail(e);
    }
  }, [call, fail]);

  const refreshLabels = useCallback(async () => {
    try {
      setLabels(await call<LabelsResponse>("/api/admin/labels"));
    } catch (e) {
      fail(e);
    }
  }, [call, fail]);

  const refreshTab = useCallback(async () => {
    if (tabRef.current === "open") return;
    const wanted = tabRef.current;
    try {
      const list = await fetchConversations(call, wanted, 3);
      if (tabRef.current === wanted) setTabList(list);
    } catch (e) {
      fail(e);
    }
  }, [call, fail]);

  const markRead = useCallback(
    (id: number, upTo: number) => {
      if ((readUpTo.current.get(id) ?? -1) >= upTo) return;
      readUpTo.current.set(id, upTo);
      call(`/api/admin/conversations/${id}/read`, { json: {} })
        .then(() => setOpenList((l) => l?.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) ?? l))
        .catch(() => readUpTo.current.delete(id));
    },
    [call],
  );

  const refreshMessages = useCallback(async () => {
    const id = selectedIdRef.current;
    if (!id) return;
    try {
      const r = await call<{ messages: MessageDTO[] }>(`/api/admin/conversations/${id}/messages`);
      if (selectedIdRef.current !== id) return;
      setMessages((prev) => mergeMessages(prev, r.messages));
      setOffline(false);
      const newest = r.messages.reduce((mx, m) => Math.max(mx, m.id), 0);
      if (visibleRef.current && newest) markRead(id, newest);
    } catch (e) {
      fail(e);
    } finally {
      setMsgLoading(false);
    }
  }, [call, fail, markRead]);

  // โหลดครั้งแรก (ผ่าน timeout เพื่อไม่ให้ setState ถูกเรียกแบบ synchronous ใน effect)
  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshOpen();
      void refreshLabels();
      call<{ canned: CannedDTO[]; agents: AgentDTO[] }>("/api/admin/canned")
        .then((r) => {
          setCanned(r.canned);
          setAgents(r.agents);
        })
        .catch(() => {});
      call<{ id: number; name: string }>("/api/admin/inbox")
        .then(setInbox)
        .catch(() => {});
    }, 0);
    return () => window.clearTimeout(id);
  }, [call, refreshOpen, refreshLabels]);

  // เปิดจากลิงก์ /admin/chat?c=<id>: สลับไปแท็บ "ทั้งหมด" (เผื่อเคสปิดแล้ว) แล้วเลือกเคสนั้น
  useEffect(() => {
    if (!initialConversationId) return;
    const id = window.setTimeout(() => {
      changeTab("all");
      selectConversation(initialConversationId);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ทำครั้งเดียวตอนเปิดหน้า
  }, [initialConversationId]);

  useInterval(() => void refreshOpen(), 5000);
  useInterval(() => void refreshLabels(), 10000);
  useInterval(() => void refreshTab(), 8000);
  useInterval(() => void refreshMessages(), 3000);

  // ---------- การกระทำของผู้ใช้ ----------

  function selectConversation(id: number | null) {
    selectedIdRef.current = id;
    setSelectedId(id);
    setMessages([]);
    setText("");
    setSendError(false);
    setQuickOpen(false);
    setIsNote(false);
    stickBottom.current = true;
    if (id) {
      setMsgLoading(true);
      void refreshMessages();
    }
  }

  function changeTab(next: Tab) {
    tabRef.current = next;
    setTab(next);
    setTabList(null);
    if (next !== "open") void refreshTab();
  }

  async function send() {
    const content = text.trim();
    const id = selectedId;
    if (!content || !id || sending) return;
    setSending(true);
    setSendError(false);
    try {
      const r = await call<{ message: MessageDTO }>(`/api/admin/conversations/${id}/messages`, {
        json: { content, private: isNote },
      });
      setMessages((prev) => mergeMessages(prev, [r.message]));
      setText("");
      stickBottom.current = true;
      void refreshOpen();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) signedOutRef.current();
      else setSendError(true);
    } finally {
      setSending(false);
    }
  }

  /** ยืนยันปิดหัวข้อที่เลือก — ถ้าปิดครบทุกหัวข้อ เซิร์ฟเวอร์จะปิดเคส (resolved) ให้เอง */
  async function confirmClose(topicsToClose: string[]) {
    if (!selectedId) return;
    setClosing(true);
    setCloseError(false);
    try {
      const note = topicsToClose.length
        ? t("admTopicNote", {
            topics: topicsToClose.map((x) => labelName(x, lang)).join(", "),
            name: user.name,
          })
        : undefined;
      await call(`/api/admin/conversations/${selectedId}/topics`, { json: { close: topicsToClose, note } });
      setCloseOpen(false);
      await Promise.all([refreshOpen(), refreshTab(), refreshLabels(), refreshMessages()]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) signedOutRef.current();
      else setCloseError(true);
    } finally {
      setClosing(false);
    }
  }

  async function setStatus(status: "open" | "resolved") {
    if (!selectedId) return;
    try {
      await call(`/api/admin/conversations/${selectedId}/status`, { json: { status } });
      void refreshOpen();
      void refreshTab();
      void refreshLabels();
    } catch (e) {
      fail(e);
    }
  }

  async function assign(assigneeId: number | null) {
    if (!selectedId) return;
    try {
      await call(`/api/admin/conversations/${selectedId}/assign`, { json: { assigneeId } });
      void refreshOpen();
      void refreshTab();
    } catch (e) {
      fail(e);
    }
  }

  async function signOut() {
    try {
      if (!demo) await api("/api/admin/logout", { json: {} });
    } finally {
      onSignedOut();
    }
  }

  // เลื่อนลงล่างสุดเมื่อมีข้อความใหม่ (เฉพาะตอนผู้ใช้อยู่ท้ายแชทอยู่แล้ว)
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && stickBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, selectedId]);

  // ---------- ข้อมูลที่คำนวณ ----------

  const openRows = useMemo(() => openList ?? [], [openList]);
  const unreadOf = useCallback(
    (c: ConversationDTO) => (c.id === selectedId && visible ? 0 : c.unread),
    [selectedId, visible],
  );

  const { unreadByLabel, unreadTotal } = useMemo(() => {
    const byLabel = new Map<string, number>();
    let total = 0;
    for (const c of openRows) {
      const n = unreadOf(c);
      if (!n) continue;
      total += n;
      // หัวข้อที่ปิดไปแล้วไม่ต้องนับเป็นตัวเลขแดงของป้ายนั้น
      for (const l of c.labels) if (!c.closedTopics.includes(l)) byLabel.set(l, (byLabel.get(l) ?? 0) + n);
    }
    return { unreadByLabel: byLabel, unreadTotal: total };
  }, [openRows, unreadOf]);

  useEffect(() => {
    const base = t("admTitle");
    document.title = unreadTotal ? `(${unreadTotal}) ${base}` : base;
  }, [unreadTotal, t]);

  const colorOf = useMemo(() => {
    const m = new Map<string, string>();
    labels?.labels.forEach((l) => m.set(l.title, l.color));
    return m;
  }, [labels]);

  const source = tab === "open" ? openRows : (tabList ?? []);
  const q = query.trim().toLowerCase();
  const baseRows = source.filter(
    (c) =>
      // ในแท็บ "กำลังดำเนินการ" ป้ายที่หัวข้อถูกปิดไปแล้วไม่นับว่าเป็นงานของป้ายนั้นอีก
      (!labelFilter ||
        (c.labels.includes(labelFilter) && (tab !== "open" || !c.closedTopics.includes(labelFilter)))) &&
      (!q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)),
  );
  // มุมมองแบบเดียวกับหน้า inbox ของ Chatwoot: ของฉัน / ยังไม่มีผู้รับ / ทั้งหมด
  const isMine = (c: ConversationDTO) => c.assignee?.id === (user.agentId ?? user.id);
  const scopeCounts = {
    mine: baseRows.filter(isMine).length,
    unassigned: baseRows.filter((c) => !c.assignee).length,
    all: baseRows.length,
  };
  const rows = baseRows.filter((c) => (scope === "mine" ? isMine(c) : scope === "unassigned" ? !c.assignee : true));
  const listLoading = tab === "open" ? openList === null : tabList === null;

  const selected = [...openRows, ...(tabList ?? [])].find((c) => c.id === selectedId) ?? null;
  const iAmAssignee = selected?.assignee?.id === (user.agentId ?? user.id);

  // หัวข้อของเคสที่เปิดอยู่ (ไม่รวมป้าย "ด่วน" ซึ่งเป็นแค่ระดับความเร่งด่วน)
  const topicItem = (l: string): TopicItem => ({
    title: l,
    name: labelName(l, lang),
    color: colorOf.get(l) ?? "#a8a29e",
  });
  const categoryLabels = selected ? selected.labels.filter((l) => l !== URGENT_LABEL) : [];
  const openTopics = selected ? categoryLabels.filter((l) => !selected.closedTopics.includes(l)).map(topicItem) : [];
  const closedTopicItems = selected ? categoryLabels.filter((l) => selected.closedTopics.includes(l)).map(topicItem) : [];

  const tabs: { id: Tab; label: MsgKey; count: number | null }[] = [
    { id: "open", label: "admTabOpen", count: labels?.totals.open ?? null },
    { id: "resolved", label: "admTabResolved", count: labels?.totals.resolved ?? null },
    { id: "all", label: "admTabAll", count: labels?.totals.all ?? null },
  ];

  const labelButtons = (labels?.labels ?? []).map((l) => ({ ...l, unread: unreadByLabel.get(l.title) ?? 0 }));

  // ปุ่มจัดการบทสนทนา: มอบหมาย / รับเรื่อง / ปิดเคส (ใช้ซ้ำทั้งจอใหญ่และมือถือ)
  const actions = selected ? (
    <>
      <select
        value={selected.assignee?.id ?? ""}
        onChange={(e) => void assign(e.target.value ? Number(e.target.value) : null)}
        aria-label={t("admAssignee")}
        className="h-10 min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-2 text-base outline-none focus:border-brand-500 sm:h-9 sm:flex-none sm:text-sm"
      >
        <option value="">{t("admUnassigned")}</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      {!iAmAssignee && (
        <button
          type="button"
          onClick={() => void assign(user.agentId ?? user.id)}
          className="h-10 shrink-0 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium hover:bg-stone-50 sm:h-9"
        >
          {t("admAssignMe")}
        </button>
      )}
      {selected.status === "resolved" ? (
        <button
          type="button"
          onClick={() => void setStatus("open")}
          className="h-10 shrink-0 rounded-lg bg-deep-700 px-3 text-sm font-semibold text-white hover:bg-deep-800 sm:h-9"
        >
          {t("admReopen")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setCloseError(false);
            setCloseOpen(true);
          }}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 sm:h-9"
        >
          <Icon name="check" className="h-4 w-4" />
          {t("admResolve")}
        </button>
      )}
    </>
  ) : null;

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      {/* ===== แถบบน ===== */}
      <header className="hero shrink-0 text-white">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <AidcLogo className="h-11" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">{t("admTitle")}</div>
            </div>
            {unreadTotal > 0 && <UnreadBadge n={unreadTotal} className="ml-1" />}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSoundPref(!sound)}
              title={sound ? t("admSoundOn") : t("admSoundOff")}
              aria-label={sound ? t("admSoundOn") : t("admSoundOff")}
              aria-pressed={sound}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Icon name={sound ? "bell" : "bellOff"} className="h-4 w-4" />
            </button>
            <a
              href="/admin"
              title={t("admHome")}
              className="grid h-9 place-items-center rounded-full bg-white/10 px-2.5 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <span className="flex items-center gap-1">
                <Icon name="back" className="h-3.5 w-3.5" />
                {t("admHome")}
              </span>
            </a>
            <ReportsLink label={t("admReports")} />
            <a
              href="/admin/stats"
              title={t("admStats")}
              className="hidden h-9 place-items-center rounded-full bg-white/10 px-2.5 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20 sm:grid"
            >
              {t("admStats")}
            </a>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="QR Code"
              className="hidden h-9 place-items-center rounded-full bg-white/10 px-2.5 text-xs font-bold ring-1 ring-white/20 transition hover:bg-white/20 sm:grid"
            >
              QR
            </a>
            <div className="flex rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id)}
                  aria-pressed={lang === l.id}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    lang === l.id ? "bg-white text-deep-800" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <span className="hidden max-w-32 truncate text-xs text-white/85 md:block" title={user.email}>
              {user.name}
            </span>
            <button
              type="button"
              onClick={signOut}
              title={t("admSignOut")}
              aria-label={t("admSignOut")}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {demo && (
        <div role="status" className="shrink-0 bg-amber-300 px-4 py-1.5 text-center text-xs font-semibold text-amber-950">
          {t("admDemoBanner")}{" "}
          <a href="/admin" className="underline">
            /admin
          </a>
        </div>
      )}
      {offline && (
        <div role="status" className="shrink-0 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
          {t("admLoadErr")}
          {offlineCode ? ` (HTTP ${offlineCode})` : ""}
        </div>
      )}

      {closeOpen && selected && (
        <CloseCaseDialog
          customer={selected.name}
          topics={openTopics}
          closed={closedTopicItems}
          busy={closing}
          error={closeError}
          onCancel={() => setCloseOpen(false)}
          onConfirm={(picked) => void confirmClose(picked)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        {/* ===== แถบป้ายกำกับ (จอใหญ่) ===== */}
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-stone-200 bg-white p-3 lg:flex">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("admLabels")}</h2>
          <button
            type="button"
            onClick={() => setLabelFilter(null)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
              labelFilter === null ? "bg-brand-50 font-semibold ring-1 ring-brand-200" : "hover:bg-stone-100"
            }`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-stone-400" />
            <span className="min-w-0 flex-1 truncate">{t("admAllLabels")}</span>
            {unreadTotal > 0 && <UnreadBadge n={unreadTotal} />}
            <span className="shrink-0 rounded-md bg-stone-100 px-1.5 text-xs tabular-nums text-stone-600">
              {labels?.totals.open ?? "–"}
              <span className="text-stone-400">/{labels?.totals.all ?? "–"}</span>
            </span>
          </button>
          <div className="mt-1 space-y-0.5">
            {labelButtons.map((l) => (
              <button
                key={l.title}
                type="button"
                onClick={() => setLabelFilter(labelFilter === l.title ? null : l.title)}
                title={l.title}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                  flash.has(l.title) ? "row-flash" : ""
                } ${labelFilter === l.title ? "bg-brand-50 font-semibold ring-1 ring-brand-200" : "hover:bg-stone-100"}`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: l.color }} />
                <span className="min-w-0 flex-1 truncate">{labelName(l.title, lang)}</span>
                {l.unread > 0 && <UnreadBadge n={l.unread} />}
                <span
                  className="shrink-0 rounded-md bg-stone-100 px-1.5 text-xs tabular-nums text-stone-600"
                  title={`${l.open} / ${l.total}`}
                >
                  {l.open}
                  <span className="text-stone-400">/{l.total}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-auto px-2 pt-4 text-[11px] leading-relaxed text-stone-400">{t("admLabelCountHint")}</p>
        </aside>

        {/* ===== รายการแจ้งปัญหา ===== */}
        <section
          className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 w-full shrink-0 flex-col border-r border-stone-200 bg-white md:w-80 lg:w-[22rem]`}
        >
          <div className="shrink-0 space-y-2 border-b border-stone-100 p-3">
            {/* ช่องแชทที่แสดงอยู่ (inbox ของ Chatwoot) */}
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-deep-700 text-white">
                <Icon name="chat" className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-bold">{inbox?.name || "COSI Hotel Support"}</div>
                <div className="truncate text-[11px] text-stone-500">
                  {t("admChannel")}
                  {inbox ? ` #${inbox.id}` : ""} · {t("admTabOpen")} {labels?.totals.open ?? "–"}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5" role="group" aria-label={t("admChannel")}>
              {(
                [
                  ["mine", t("admScopeMine"), scopeCounts.mine],
                  ["unassigned", t("admUnassigned"), scopeCounts.unassigned],
                  ["all", t("admTabAll"), scopeCounts.all],
                ] as const
              ).map(([id, label, n]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={scope === id}
                  onClick={() => setScope(id)}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    scope === id ? "bg-deep-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span
                    className={`rounded-md px-1.5 text-[11px] tabular-nums ${
                      scope === id ? "bg-white/20 text-white" : "bg-white text-stone-500"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex rounded-xl bg-stone-100 p-1" role="tablist">
              {tabs.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === x.id}
                  onClick={() => changeTab(x.id)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    tab === x.id ? "bg-white text-deep-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {t(x.label)}
                  {x.count !== null && <span className="ml-1 tabular-nums text-stone-400">{x.count}</span>}
                </button>
              ))}
            </div>
            <label className="relative block">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admSearch")}
                className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </label>
            {/* ป้ายกำกับสำหรับจอเล็ก/แท็บเล็ต (จอใหญ่ใช้แถบด้านซ้าย) */}
            <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 lg:hidden">
              <button
                type="button"
                onClick={() => setLabelFilter(null)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  labelFilter === null ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"
                }`}
              >
                {t("admAllLabels")}
                {unreadTotal > 0 && <UnreadBadge n={unreadTotal} />}
              </button>
              {labelButtons.map((l) => (
                <button
                  key={l.title}
                  type="button"
                  onClick={() => setLabelFilter(labelFilter === l.title ? null : l.title)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    flash.has(l.title) ? "row-flash" : ""
                  } ${labelFilter === l.title ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"}`}
                >
                  <span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
                  {labelName(l.title, lang)}
                  {l.unread > 0 && <UnreadBadge n={l.unread} />}
                  <span className="tabular-nums text-stone-400">
                    {l.open}/{l.total}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              tab === "open" && !labelFilter && !q && (labels?.totals.resolved ?? 0) > 0 ? (
                // แท็บ "กำลังดำเนิน" ว่างเพราะทุกเคสถูกปิดแล้ว — บอกให้ชัดว่าประวัติยังอยู่ และพาไปดู
                <div className="space-y-3 p-8 text-center">
                  <p className="text-sm text-stone-500">{t("admEmptyOpen")}</p>
                  <button
                    type="button"
                    onClick={() => changeTab("resolved")}
                    className="inline-flex h-9 items-center rounded-lg bg-deep-700 px-4 text-sm font-semibold text-white hover:bg-deep-800"
                  >
                    {t("admViewResolved", { n: labels?.totals.resolved ?? 0 })}
                  </button>
                </div>
              ) : (
                <p className="p-8 text-center text-sm text-stone-400">{t("admEmptyList")}</p>
              )
            ) : (
              rows.map((c) => {
                const unread = unreadOf(c);
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className={`flex w-full gap-3 border-b border-stone-100 px-3 py-3 text-left transition ${
                      active ? "bg-brand-50" : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep-700 text-sm font-bold text-white">
                      {initialOf(c.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>{c.name}</span>
                        <span className="shrink-0 text-[11px] tabular-nums text-stone-400">{fmtTime(c.updatedAt)}</span>
                      </span>
                      {c.ticket && (
                        <span className="block truncate text-[11px] font-semibold tabular-nums text-deep-700">
                          {c.ticket}
                        </span>
                      )}
                      {c.subtitle && <span className="block truncate text-xs text-stone-500">{c.subtitle}</span>}
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className={`truncate text-xs ${unread ? "font-medium text-stone-800" : "text-stone-500"}`}>
                          {!c.previewFromContact && c.preview ? `${t("admYou")}: ` : ""}
                          {c.preview}
                        </span>
                        {unread > 0 && <UnreadBadge n={unread} />}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1">
                        {c.labels.map((l) => {
                          const done = c.closedTopics.includes(l);
                          return (
                            <span
                              key={l}
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                                done ? "bg-emerald-50 text-emerald-700 line-through" : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {done ? (
                                <Icon name="check" className="h-2.5 w-2.5" />
                              ) : (
                                <span
                                  className="h-1.5 w-1.5 rounded-sm"
                                  style={{ background: colorOf.get(l) ?? "#a8a29e" }}
                                />
                              )}
                              {labelName(l, lang)}
                            </span>
                          );
                        })}
                        {c.status !== "open" && (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            {t(STATUS_KEY[c.status])}
                          </span>
                        )}
                        {c.assignee && (
                          <span className="ml-auto truncate text-[10px] text-stone-400">{c.assignee.name}</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ===== ห้องแชท ===== */}
        <section className={`${selectedId ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-1 flex-col bg-stone-50`}>
          {!selected ? (
            <div className="m-auto flex flex-col items-center gap-3 p-8 text-center text-stone-400">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                <Icon name="chat" className="h-6 w-6" />
              </span>
              <p className="max-w-xs text-sm">{t("admPickConv")}</p>
            </div>
          ) : (
            <>
              {/* หัวห้องแชท */}
              <div className="shrink-0 border-b border-stone-200 bg-white px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => selectConversation(null)}
                    aria-label={t("admBack")}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-stone-600 hover:bg-stone-100 md:hidden"
                  >
                    <Icon name="back" className="h-5 w-5" />
                  </button>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep-700 text-sm font-bold text-white">
                    {initialOf(selected.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-bold">{selected.name}</h2>
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          selected.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {t(STATUS_KEY[selected.status])}
                      </span>
                    </div>
                    <p className="truncate text-xs text-stone-500">
                      {[
                        selected.subtitle,
                        selected.ticket ?? `#${selected.id}`,
                        selected.createdAt ? `${ticketDate(selected.createdAt)} ${laoTime(selected.createdAt)}` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 sm:flex">{actions}</div>
                </div>
                <div className="mt-2 flex items-center gap-2 sm:hidden">{actions}</div>
                {selected.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.labels.map((l) => {
                      const done = selected.closedTopics.includes(l);
                      return (
                        <span
                          key={l}
                          title={done ? t("admClosedTopics") : undefined}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            done
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 line-through decoration-emerald-400"
                              : "border-stone-200 bg-white text-stone-700"
                          }`}
                        >
                          {done ? (
                            <Icon name="check" className="h-3 w-3" />
                          ) : (
                            <span className="h-2 w-2 rounded-sm" style={{ background: colorOf.get(l) ?? "#a8a29e" }} />
                          )}
                          {labelName(l, lang)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ข้อความ */}
              <div
                ref={scrollerRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  stickBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                }}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
              >
                {msgLoading && messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-stone-200" />
                    <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-stone-200" />
                  </div>
                )}
                {messages.map((m) => (
                  <Bubble key={m.id} m={m} youLabel={t("admYou")} noteLabel={t("admPrivateNote")} />
                ))}
              </div>

              {/* ช่องตอบ */}
              <div className="relative shrink-0 border-t border-stone-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
                {quickOpen && (
                  <div className="absolute bottom-full left-3 z-10 mb-2 max-h-64 w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl bg-white p-1 shadow-xl ring-1 ring-stone-200">
                    {canned.length === 0 ? (
                      <p className="p-3 text-xs text-stone-500">{t("admNoQuick")}</p>
                    ) : (
                      canned.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setText((v) => (v ? `${v}\n${c.content}` : c.content));
                            setQuickOpen(false);
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left hover:bg-stone-100"
                        >
                          <span className="block text-xs font-semibold text-brand-700">/{c.shortCode}</span>
                          <span className="line-clamp-2 text-sm text-stone-700">{c.content}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {sendError && (
                  <p role="alert" className="mb-2 text-xs text-rose-600">
                    {t("admSendErr")}
                  </p>
                )}
                <div
                  className={`rounded-xl border p-2 transition focus-within:ring-2 ${
                    isNote
                      ? "border-amber-300 bg-amber-50 focus-within:ring-amber-200"
                      : "border-stone-300 bg-white focus-within:border-brand-500 focus-within:ring-brand-200"
                  }`}
                >
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={2}
                    maxLength={5000}
                    placeholder={isNote ? t("admNotePlaceholder") : t("admReplyPlaceholder")}
                    className="block max-h-40 min-h-12 w-full resize-none bg-transparent px-1 py-1 text-base outline-none md:text-sm"
                  />
                  <div className="mt-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickOpen((v) => !v)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      <Icon name="zap" className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("admQuick")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNote((v) => !v)}
                      aria-pressed={isNote}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition ${
                        isNote ? "bg-amber-200 text-amber-900" : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <Icon name="lock" className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("admPrivateNote")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={!text.trim() || sending}
                      className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      <Icon name="send" className="h-4 w-4" />
                      {t("admSend")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );

}

function Bubble({ m, youLabel, noteLabel }: { m: MessageDTO; youLabel: string; noteLabel: string }) {
  if (m.kind === "activity") {
    return (
      <p className="mx-auto max-w-[90%] text-center text-[11px] text-stone-400">
        {m.content} · {fmtTime(m.createdAt)}
      </p>
    );
  }
  const mine = m.kind === "outgoing";
  const tone = m.private
    ? "border border-amber-300 bg-amber-50 text-amber-950"
    : mine
      ? "bg-deep-700 text-white"
      : "bg-white text-stone-800 ring-1 ring-stone-200";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {mine && (m.private || m.senderName) && (
          <span className="px-1 text-[11px] text-stone-400">
            {m.private ? `🔒 ${noteLabel} · ` : ""}
            {m.senderName || youLabel}
          </span>
        )}
        <div className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${tone}`}>
          {m.content}
          {m.attachments.map((a) =>
            a.type === "image" ? (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="mt-2 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.thumb} alt={a.name} className="max-h-56 rounded-lg" />
              </a>
            ) : (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-black/10 px-2.5 py-1.5 text-xs underline"
              >
                <Icon name="clip" className="h-3.5 w-3.5" />
                {a.name}
              </a>
            ),
          )}
        </div>
        {!mine && m.senderName && <span className="px-1 text-[11px] text-stone-400">{m.senderName}</span>}
        <span className="px-1 text-[10px] tabular-nums text-stone-400">{fmtTime(m.createdAt)}</span>
      </div>
    </div>
  );
}
