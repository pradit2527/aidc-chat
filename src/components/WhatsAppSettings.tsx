"use client";

import Image from "next/image";
import { useCallback, useState, useSyncExternalStore } from "react";
import { api, fmtTime } from "@/lib/adminClient";
import type { AdminUser } from "@/lib/adminTypes";
import type { Lang } from "@/lib/i18n";
import { useLive } from "@/lib/useLive";
import type { DeviceState, GroupInfo } from "@/lib/waDevice";
import type { GroupTarget, NotifyLog, SendResult } from "@/lib/whatsapp";
import { AdminHeader } from "./AdminHeader";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";

type View = {
  db: boolean;
  device: DeviceState & { group: GroupTarget | null; groups: GroupInfo[] };
  groupName: string;
  publicUrl: string | null;
  recent: NotifyLog[];
};
type ActionRes = View & { ok: boolean; error?: string; result?: SendResult };

/**
 * แจ้งเตือนเข้ากลุ่ม WhatsApp — ตั้งค่าครั้งเดียว: สแกน QR ด้วยเบอร์ของทีมไอทีที่อยู่ในกลุ่ม → ระบบเลือกกลุ่ม "IT support cosi" ให้เอง
 * → ทุกงานแจ้งใหม่เข้ากลุ่มอัตโนมัติ; มีปุ่มส่งทดสอบ, เปลี่ยนกลุ่ม (กรณีชื่อไม่ตรง) และประวัติการส่ง
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

const noop = () => () => {};
const isDevHost = (host: string) => /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/i.test(host);

function Settings({ user }: { user: AdminUser }) {
  const { t } = useI18n();
  const [data, setData] = useState<View | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);
  const host = useSyncExternalStore(noop, () => window.location.host, () => "");

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
    setActErr(null);
    try {
      const r = await api<ActionRes>("/api/admin/whatsapp", { json: body });
      setData(r);
      setError(false);
      if (!r.ok && r.error) setActErr(r.error);
      return r;
    } catch {
      setError(true);
      return null;
    } finally {
      setBusy(null);
    }
  }

  const dev = data?.device;
  const linked = dev?.status === "open";
  const group = dev?.group ?? null;
  const currentJid = group?.jid ?? "";
  const selected = pick ?? currentJid;

  async function saveGroup() {
    const g = dev?.groups.find((x) => x.jid === selected);
    const r = await act({ action: "group", jid: selected || null, name: g?.name ?? "" }, "group");
    if (r?.ok) setPick(null);
  }
  async function testGroup() {
    setResult(null);
    const r = await act({ action: "testGroup" }, "testGroup");
    if (r?.result) setResult(r.result);
  }
  async function unlink() {
    if (!window.confirm(t("wdUnlinkConfirm"))) return;
    setResult(null);
    await act({ action: "unlink" }, "unlink");
  }

  const groupLabel = group?.name || data?.groupName || "";

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} barTitle={t("waTitle")} title={t("waTitle")} subtitle={t("waSub")} />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-4xl gap-4 px-4 pb-10">
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
        {host && isDevHost(host) && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            {t("waDevHost", { host, server: data?.publicUrl ?? "http://10.0.100.54:3400" })}
          </p>
        )}

        <section className="card p-5 sm:p-6">
          <p className="rounded-xl bg-deep-50 p-3 text-sm leading-relaxed text-deep-800 ring-1 ring-deep-100">{t("waWhy")}</p>

          {/* 3 ขั้น: สแกน → ระบบเลือกกลุ่ม → อัตโนมัติ */}
          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            <Step n={1} done={linked} text={t("waStep1")} />
            <Step n={2} done={Boolean(group)} text={t("waStep2", { group: groupLabel })} />
            <Step n={3} done={linked && Boolean(group)} text={t("waStep3")} />
          </ol>

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

              {linked && (
                <div className="mt-4 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-100">
                  {group ? (
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <Icon name="check" className="h-4 w-4" />
                      {t("waDone", { group: group.name || group.jid })}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-900">{t("wdGroupEmpty", { group: data?.groupName ?? "" })}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={testGroup} disabled={!group || busy !== null} className={btnPrimary}>
                      {busy === "testGroup" ? t("waSending") : t("wdTestGroup")}
                    </button>
                    {result && <ResultPill r={result} />}
                    {actErr && (
                      <span role="alert" className="text-sm text-rose-700">
                        {actErr === "no_group" ? t("wdNoGroupErr") : actErr === "device_off" ? t("wdOff") : t("waFailed")}
                      </span>
                    )}
                  </div>

                  {/* เปลี่ยนกลุ่ม — ใช้เมื่อชื่อกลุ่มไม่ตรงกับที่ระบบหาให้ */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-deep-700">{t("wdGroupChange")}</summary>
                    <label className="mt-2 block text-sm font-medium">
                      {t("wdGroup")}
                      <select value={selected} onChange={(e) => setPick(e.target.value)} disabled={busy !== null} className={field}>
                        <option value="">{t("wdGroupPick")}</option>
                        {group && !dev.groups.some((g) => g.jid === group.jid) && <option value={group.jid}>{group.name || group.jid}</option>}
                        {dev.groups.map((g) => (
                          <option key={g.jid} value={g.jid}>
                            {g.name} · {t("wdMembers", { n: g.size })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={saveGroup} disabled={busy !== null || selected === currentJid} className={btnSoft}>
                        {busy === "group" ? t("saving") : t("wdGroupSave")}
                      </button>
                      <button type="button" onClick={() => act({ action: "groups" }, "groups")} disabled={busy !== null} className={btnSoft}>
                        {t("wdGroupRefresh")}
                      </button>
                    </div>
                  </details>
                </div>
              )}

              <p className="mt-4 text-xs leading-relaxed text-stone-500">{t("wdWarn")}</p>
            </>
          )}
        </section>

        {/* ประวัติ */}
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
                <li key={n.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                  <a href={`/admin/reports?r=${n.reportId}`} className="font-semibold tabular-nums text-brand-700 hover:underline">
                    {n.ticketNo}
                  </a>
                  <span className="text-xs tabular-nums text-stone-500">{fmtTime(n.at)}</span>
                  {n.results.map((r, i) => (
                    <span key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-600">{r.to}</span>
                      <ResultPill r={r} />
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Step({ n, done, text }: { n: number; done: boolean; text: string }) {
  return (
    <li className={`flex items-start gap-2 rounded-xl p-3 text-sm ring-1 ${done ? "bg-emerald-50 text-emerald-900 ring-emerald-100" : "bg-white text-stone-700 ring-stone-200"}`}>
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-emerald-600 text-white" : "bg-brand-500 text-white"}`}>
        {done ? <Icon name="check" className="h-3.5 w-3.5" /> : n}
      </span>
      <span>{text}</span>
    </li>
  );
}

/** แถวสถานะอุปกรณ์: จุดสี + ข้อความ + ปุ่มสร้าง QR / ยกเลิก ตามสถานะ */
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

/** ผลการส่ง 1 ข้อความ: เขียว = เข้ากลุ่มแล้ว, แดง = ล้มเหลว (+ เหตุผล) */
function ResultPill({ r }: { r: SendResult }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${r.ok ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-rose-100"}`}>
        {r.ok ? t("waSent") : t("waFailed")}
      </span>
      {!r.ok && <span className="text-rose-700">{r.status === "not_linked" ? t("wdNotLinkedErr") : r.message}</span>}
    </span>
  );
}
