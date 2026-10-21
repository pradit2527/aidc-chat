"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { api, fmtTime } from "@/lib/adminClient";
import type { AdminUser } from "@/lib/adminTypes";
import type { Lang } from "@/lib/i18n";
import { normalizePhone, prettyPhone } from "@/lib/phone";
import { useLive } from "@/lib/useLive";
import type { DeviceState, GroupInfo } from "@/lib/waDevice";
import type { GroupTarget, NotifyLog, Recipient, SendResult, WaStatus } from "@/lib/whatsapp";
import { AdminHeader } from "./AdminHeader";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";

type View = {
  db: boolean;
  device: DeviceState & { group: GroupTarget | null; groups: GroupInfo[] };
  twilio: WaStatus;
  recipients: Recipient[];
  recent: NotifyLog[];
};
type ActionRes = View & { ok: boolean; error?: string; results?: SendResult[] };

/**
 * หน้าตั้งค่าแจ้งเตือน WhatsApp ของทีมไอที
 * 1) กลุ่ม WhatsApp ผ่านอุปกรณ์ที่เชื่อมต่อ: สแกน QR → เลือกกลุ่ม → ทดสอบ (ช่องทางหลัก)
 * 2) เบอร์โดยตรงผ่าน Twilio (ช่องทางเสริม, พับไว้)  3) ประวัติการส่ง
 */
export default function WhatsAppSettings({ user, initialLang }: { user: AdminUser; initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Settings user={user} />
    </I18nProvider>
  );
}

const field =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-stone-100 disabled:text-stone-400 md:text-sm";
const btnPrimary = "rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-50";
const btnSoft = "rounded-full bg-deep-50 px-3 py-1.5 text-xs font-semibold text-deep-800 ring-1 ring-deep-100 transition hover:bg-deep-100 disabled:opacity-50";
const btnDanger = "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100 disabled:opacity-50";

function Settings({ user }: { user: AdminUser }) {
  const { t } = useI18n();
  const [data, setData] = useState<View | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  // กลุ่ม
  const [pick, setPick] = useState<string | null>(null);
  const [groupResult, setGroupResult] = useState<SendResult | null>(null);
  const [groupErr, setGroupErr] = useState<string | null>(null);
  // Twilio
  const [label, setLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [formErr, setFormErr] = useState<"invalid_phone" | "duplicate" | null>(null);
  const [results, setResults] = useState<Record<string, SendResult>>({});
  const [testErr, setTestErr] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api<View>("/api/admin/whatsapp")
        .then((v) => {
          setData(v);
          setError(false);
        })
        .catch(() => setError(true)),
    [],
  );
  useLive(load, 4_000);

  async function act(body: Record<string, unknown>, key: string): Promise<ActionRes | null> {
    if (busy) return null;
    setBusy(key);
    try {
      const r = await api<ActionRes>("/api/admin/whatsapp", { json: body });
      setData(r);
      setError(false);
      return r;
    } catch {
      setError(true);
      return null;
    } finally {
      setBusy(null);
    }
  }

  // ---- กลุ่ม ----
  const dev = data?.device;
  const linked = dev?.status === "open";
  const currentJid = dev?.group?.jid ?? "";
  const selected = pick ?? currentJid;

  async function saveGroup() {
    setGroupErr(null);
    const g = dev?.groups.find((x) => x.jid === selected);
    const r = await act({ action: "group", jid: selected || null, name: g?.name ?? "" }, "group");
    if (r && !r.ok) setGroupErr(r.error ?? "error");
    if (r?.ok) setPick(null);
  }
  async function testGroup() {
    setGroupErr(null);
    const r = await act({ action: "testGroup" }, "testGroup");
    if (!r) return;
    if (r.results?.[0]) setGroupResult(r.results[0]);
    if (!r.ok && r.error) setGroupErr(r.error);
  }
  async function unlink() {
    if (!window.confirm(t("wdUnlinkConfirm"))) return;
    setGroupResult(null);
    await act({ action: "unlink" }, "unlink");
  }

  // ---- Twilio ----
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const r = await act({ action: "add", phone, label }, "add");
    if (!r) return;
    if (!r.ok) setFormErr(r.error === "duplicate" ? "duplicate" : "invalid_phone");
    else {
      setPhone("");
      setLabel("");
    }
  }
  async function test(p?: string) {
    setTestErr(null);
    const r = await act({ action: "test", ...(p ? { phone: p } : {}) }, p ? `test:${p}` : "test:all");
    if (!r) return;
    if (r.results) setResults((m) => ({ ...m, ...Object.fromEntries(r.results!.map((x) => [x.to, x])) }));
    if (!r.ok && r.error) setTestErr(r.error);
  }
  async function remove(p: string) {
    if (!window.confirm(t("waRemoveConfirm", { phone: prettyPhone(p) }))) return;
    await act({ action: "remove", phone: p }, `remove:${p}`);
  }

  const preview = phone.trim() ? normalizePhone(phone) : null;
  const twilioReady = Boolean(data?.twilio.configured && data.db);

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} barTitle={t("waTitle")} title={t("waTitle")} subtitle={t("waSub")} />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-4 px-4 pb-10">
        {error && (
          <p role="alert" className="card p-4 text-sm text-rose-700">
            {t("admLoadErr")}
          </p>
        )}
        {data && !data.db && (
          <p role="alert" className="card p-4 text-sm text-rose-700">
            {t("rcNoDb")}
          </p>
        )}

        {/* 1) กลุ่ม WhatsApp ผ่านอุปกรณ์ที่เชื่อมต่อ */}
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon name="bell" className="h-4 w-4 text-deep-700" />
            {t("wdTitle")}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{t("wdHint")}</p>

          {!dev ? (
            <div className="mt-4 h-10 animate-pulse rounded-xl bg-stone-100" />
          ) : dev.status === "off" ? (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-100">{t("wdOff")}</p>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-stone-200 p-4">
                <DeviceStatusRow dev={dev} busy={busy} onLink={() => act({ action: "link" }, "link")} onUnlink={unlink} />
                {dev.status === "qr" && dev.qr && (
                  <div className="mt-4 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
                    <Image src={dev.qr} alt="QR" width={320} height={320} unoptimized priority className="h-64 w-64 rounded-xl ring-1 ring-stone-200" />
                    <div className="text-sm">
                      <p className="font-semibold text-deep-800">{t("wdScan")}</p>
                      <p className="mt-1 leading-relaxed text-stone-600">{t("wdScanSteps")}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-100">
                <label className="block text-sm font-medium">
                  {t("wdGroup")}
                  <select value={selected} onChange={(e) => setPick(e.target.value)} disabled={!linked || busy !== null} className={field}>
                    <option value="">{t("wdGroupPick")}</option>
                    {dev.group && !dev.groups.some((g) => g.jid === dev.group!.jid) && <option value={dev.group.jid}>{dev.group.name || dev.group.jid}</option>}
                    {dev.groups.map((g) => (
                      <option key={g.jid} value={g.jid}>
                        {g.name} · {t("wdMembers", { n: g.size })}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={saveGroup} disabled={!linked || busy !== null || selected === currentJid} className={btnPrimary}>
                    {busy === "group" ? t("saving") : t("wdGroupSave")}
                  </button>
                  <button type="button" onClick={() => act({ action: "groups" }, "groups")} disabled={!linked || busy !== null} className={btnSoft}>
                    {t("wdGroupRefresh")}
                  </button>
                  <button type="button" onClick={testGroup} disabled={!linked || !dev.group || busy !== null} className={btnSoft}>
                    {busy === "testGroup" ? t("waSending") : t("wdTestGroup")}
                  </button>
                </div>
                <p className="mt-3 text-xs text-stone-500">
                  {!linked
                    ? t("wdNeedLink")
                    : dev.groups.length === 0
                      ? t("wdGroupEmpty")
                      : dev.group
                        ? `${t("wdGroup")}: ${dev.group.name}`
                        : t("wdGroupNone")}
                </p>
                {groupErr && (
                  <p role="alert" className="mt-2 text-sm text-rose-700">
                    {groupErr === "no_group" ? t("wdNoGroupErr") : groupErr === "device_off" ? t("wdOff") : t("waFailed")}
                  </p>
                )}
                {groupResult && (
                  <p className="mt-2">
                    <ResultPill r={groupResult} />
                  </p>
                )}
              </div>

              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">{t("wdWarn")}</p>
            </>
          )}
        </section>

        {/* 2) Twilio (เบอร์โดยตรง) — พับไว้ */}
        <details className="card p-5">
          <summary className="cursor-pointer text-sm font-semibold">
            {t("waTwilioSection")}
            {data && <span className="ml-2 text-xs font-normal text-stone-500">({data.twilio.configured ? t("waReady") : t("waNotConfiguredShort")})</span>}
          </summary>
          {!data ? (
            <div className="mt-3 h-10 animate-pulse rounded-xl bg-stone-100" />
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact label="Twilio" ok={data.twilio.configured} text={data.twilio.configured ? t("waReady") : t("waNotConfigured", { missing: data.twilio.missing.join(", ") })} />
                <Fact
                  label={t("waSender")}
                  ok={data.twilio.configured}
                  text={
                    <>
                      <span className="tabular-nums">{data.twilio.from.replace(/^whatsapp:/, "")}</span>
                      {data.twilio.sandbox && <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">{t("waSandbox")}</span>}
                    </>
                  }
                />
              </div>
              {data.twilio.sandbox && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">
                  {t("waSandboxHint", { from: data.twilio.from.replace(/^whatsapp:/, "") })}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="phone" className="h-4 w-4 text-deep-700" />
                  {t("waRecipients")}
                  <span className="text-xs font-normal text-stone-500">({data.recipients.length})</span>
                </h3>
                {data.recipients.length > 0 && (
                  <button type="button" onClick={() => test()} disabled={!twilioReady || busy !== null} className={btnSoft}>
                    {busy === "test:all" ? t("waSending") : t("waTestAll")}
                  </button>
                )}
              </div>
              {testErr && (
                <p role="alert" className="text-sm text-rose-700">
                  {testErr === "not_configured" ? t("waNotConfiguredShort") : testErr === "no_recipients" ? t("waNoRecipients") : t("waFailed")}
                </p>
              )}
              {data.recipients.length === 0 ? (
                <p className="text-sm text-stone-400">{t("waNoRecipients")}</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {data.recipients.map((r) => (
                    <li key={r.phone} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-700 text-white">
                        <Icon name="user" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.label || prettyPhone(r.phone)}</span>
                        {r.label && <span className="block text-xs tabular-nums text-stone-500">{prettyPhone(r.phone)}</span>}
                        {results[r.phone] && (
                          <span className="mt-1 block">
                            <ResultPill r={results[r.phone]} />
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <button type="button" onClick={() => test(r.phone)} disabled={!twilioReady || busy !== null} className={btnSoft}>
                          {busy === `test:${r.phone}` ? t("waSending") : t("waTest")}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(r.phone)}
                          disabled={busy !== null}
                          aria-label={t("waRemove")}
                          title={t("waRemove")}
                          className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={add} className="grid gap-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-100 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
                <label className="block text-sm font-medium">
                  {t("waLabel")}
                  <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} className={field} />
                </label>
                <label className="block text-sm font-medium">
                  {t("waPhone")}
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" required placeholder="+856 20 1234 5678" className={field} />
                </label>
                <button type="submit" disabled={!data.db || busy !== null || !preview} className={btnPrimary}>
                  {busy === "add" ? t("saving") : t("waAdd")}
                </button>
                <p className={`text-xs sm:col-span-3 ${formErr ? "text-rose-700" : "text-stone-500"}`} role={formErr ? "alert" : undefined}>
                  {formErr === "duplicate"
                    ? t("waDuplicate")
                    : formErr === "invalid_phone" || (phone.trim() && !preview)
                      ? t("waPhoneInvalid")
                      : preview
                        ? t("waWillSave", { phone: prettyPhone(preview) })
                        : " "}
                </p>
              </form>
            </div>
          )}
        </details>

        {/* 3) ประวัติ */}
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="list" className="h-4 w-4 text-deep-700" />
            {t("waRecent")}
          </h2>
          {!data ? (
            <div className="mt-3 h-10 animate-pulse rounded-xl bg-stone-100" />
          ) : data.recent.length === 0 ? (
            <p className="mt-3 text-sm text-stone-400">{t("waNoRecent")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-stone-100">
              {data.recent.map((n) => (
                <li key={n.id} className="py-2.5 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <a href={`/admin/reports?r=${n.reportId}`} className="font-semibold tabular-nums text-brand-700 hover:underline">
                      {n.ticketNo}
                    </a>
                    <span className="text-xs tabular-nums text-stone-500">{fmtTime(n.at)}</span>
                  </div>
                  <ul className="mt-1 grid gap-1">
                    {n.results.map((r, i) => (
                      <li key={`${r.channel}:${r.to}:${i}`} className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-semibold text-stone-600">{r.channel === "group" ? t("waChannelGroup") : "Twilio"}</span>
                        <span className="tabular-nums text-stone-600">{r.channel === "group" ? r.to : prettyPhone(r.to)}</span>
                        <ResultPill r={r} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

/** แถวสถานะอุปกรณ์: จุดสี + ข้อความ + ปุ่มเชื่อมต่อ/ยกเลิก ตามสถานะ */
function DeviceStatusRow({ dev, busy, onLink, onUnlink }: { dev: DeviceState; busy: string | null; onLink: () => void; onUnlink: () => void }) {
  const { t } = useI18n();
  const s = dev.status;
  const dot = s === "open" ? "bg-emerald-500" : s === "qr" || s === "connecting" || s === "starting" || s === "closed" ? "bg-amber-500" : s === "error" || s === "logged_out" ? "bg-rose-500" : "bg-stone-300";
  const text =
    s === "open"
      ? `${t("wdLinked")} · ${dev.me?.phone ?? ""}${dev.me?.name ? ` (${dev.me.name})` : ""}`
      : s === "qr"
        ? t("wdScan")
        : s === "connecting" || s === "starting"
          ? t("wdLinking")
          : s === "closed"
            ? t("wdReconnecting")
            : s === "logged_out"
              ? t("wdLoggedOut")
              : s === "error"
                ? `${t("wdError")}${dev.lastError ? ` — ${dev.lastError}` : ""}`
                : dev.lastError === "qr_expired"
                  ? t("wdQrExpired")
                  : t("wdNotLinked");
  const canLink = s === "idle" || s === "logged_out" || s === "error" || s === "closed";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className="min-w-0 flex-1 text-sm font-medium text-stone-800">
        {text}
        {s === "open" && dev.since && <span className="ml-2 text-xs font-normal text-stone-500">{fmtTime(Math.floor(dev.since / 1000))}</span>}
      </span>
      {canLink && (
        <button type="button" onClick={onLink} disabled={busy !== null} className={btnPrimary}>
          {busy === "link" ? t("wdLinking") : t("wdLink")}
        </button>
      )}
      {(s === "open" || s === "qr" || s === "connecting" || s === "starting") && (
        <button type="button" onClick={onUnlink} disabled={busy !== null} className={btnDanger}>
          {busy === "unlink" ? t("saving") : t("wdUnlink")}
        </button>
      )}
    </div>
  );
}

function Fact({ label, ok, text }: { label: string; ok: boolean; text: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-stone-800">{text}</div>
    </div>
  );
}

/** ผลการส่ง 1 ข้อความ: เขียว = ถึงแล้ว/ส่งเข้ากลุ่มแล้ว, ฟ้า = Twilio รับแล้วรอยืนยัน, แดง = ล้มเหลว (+ รหัส/ข้อความ และคำแนะนำ) */
function ResultPill({ r }: { r: SendResult }) {
  const { t } = useI18n();
  const good = r.status === "delivered" || r.status === "read" || (r.channel === "group" && r.ok);
  const pending = r.ok && !good;
  const cls = good ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : pending ? "bg-sky-50 text-sky-700 ring-sky-100" : "bg-rose-50 text-rose-700 ring-rose-100";
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${cls}`}>{good ? t("waDelivered") : pending ? t("waSent") : t("waFailed")}</span>
      {!r.ok && (r.code || r.message) && (
        <span className="text-rose-700">
          {r.code ? `${r.code} ` : ""}
          {r.status === "not_linked" ? t("wdNotLinkedErr") : r.message}
        </span>
      )}
      {r.code === 63016 && <span className="text-stone-500">{t("waWindowHint")}</span>}
      {(r.code === 20003 || r.code === 401) && <span className="text-stone-500">{t("waAuthHint")}</span>}
    </span>
  );
}
