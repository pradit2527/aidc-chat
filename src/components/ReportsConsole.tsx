"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, fmtTime, initialOf, labelName } from "@/lib/adminClient";
import type { AdminUser, AgentDTO } from "@/lib/adminTypes";
import { DEPARTMENTS } from "@/lib/categories";
import { LANGS, type Lang } from "@/lib/i18n";
import type { ReportDTO, ReportStatus } from "@/lib/reports";
import { AidcLogo } from "./AidcLogo";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { ReportFiles } from "./ReportFiles";
import { SignOutButton } from "./SignOutButton";

type Tab = ReportStatus | "all";
type ListRes = { enabled: boolean; status: Tab; summary: { new: number; inProgress: number; done: number }; reports: ReportDTO[] };

/** หน้ามอนิเตอร์งานแจ้งปัญหาของทีมไอที: รับงาน → ติ๊กข้อที่แก้แล้ว → ปิดงาน */
export default function ReportsConsole({ user, initialLang, initialReportId = null }: { user: AdminUser; initialLang: Lang; initialReportId?: number | null }) {
  return (
    <I18nProvider initial={initialLang}>
      <Console user={user} initialReportId={initialReportId} />
    </I18nProvider>
  );
}

const TABS: Tab[] = ["new", "in_progress", "done", "all"];

function Console({ user, initialReportId }: { user: AdminUser; initialReportId: number | null }) {
  const { t, lang, setLang } = useI18n();
  // เปิดจากลิงก์ (?r=) → ใช้แท็บ "ทั้งหมด" เพื่อให้เจองานนั้นแน่นอน
  const [tab, setTab] = useState<Tab>(initialReportId ? "all" : "new");
  const [data, setData] = useState<ListRes | null>(null);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(initialReportId);
  const [agents, setAgents] = useState<AgentDTO[]>([]);

  const load = useCallback(async () => {
    try {
      setData(await api<ListRes>(`/api/admin/reports?status=${tab}`));
      setError(false);
    } catch {
      setError(true);
    }
  }, [tab]);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const id = setInterval(() => void load(), 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  useEffect(() => {
    api<{ agents: AgentDTO[] }>("/api/admin/canned")
      .then((r) => setAgents(r.agents))
      .catch(() => {});
  }, []);

  const reports = useMemo(() => data?.reports ?? [], [data]);
  const selected = reports.find((r) => r.id === selectedId) ?? null;

  /**
   * หลังทำรายการ: แทนที่รายงานในรายการ และถ้าสถานะเปลี่ยนจนไม่อยู่ในแท็บปัจจุบัน (เช่น ติ๊กข้อแรกของงานใหม่ → กำลังทำ,
   * ติ๊กครบ → สำเร็จ) ให้สลับแท็บตามงานนั้นไปเลย เพื่อให้เห็นว่างานย้ายไปอยู่แถบไหน (ยังเลือกงานเดิมค้างไว้)
   */
  function replace(r: ReportDTO) {
    setData((d) => (d ? { ...d, reports: d.reports.map((x) => (x.id === r.id ? r : x)) } : d));
    if (tab !== "all" && r.status !== tab) setTab(r.status);
  }

  const tabLabel = (x: Tab) => (x === "new" ? t("rcTabNew") : x === "in_progress" ? t("rcTabProgress") : x === "done" ? t("rcTabDone") : t("rcTabAll"));
  const tabCount = (x: Tab) =>
    !data ? null : x === "new" ? data.summary.new : x === "in_progress" ? data.summary.inProgress : x === "done" ? data.summary.done : data.summary.new + data.summary.inProgress + data.summary.done;

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="hero shrink-0 text-white">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <AidcLogo className="h-11" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">{t("rcTitle")}</div>
              <div className="hidden text-xs text-white/75 sm:block">{t("admBrand")}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href="/admin" title={t("admHome")} className="grid h-9 place-items-center rounded-full bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20">
              <span className="flex items-center gap-1">
                <Icon name="back" className="h-3.5 w-3.5" />
                {t("admHome")}
              </span>
            </a>
            <a href="/admin/chat" className="hidden h-9 place-items-center rounded-full bg-white/10 px-3 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20 sm:grid">
              {t("ahChat")}
            </a>
            <div className="flex rounded-full bg-white/15 p-0.5 ring-1 ring-white/25" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id)}
                  aria-pressed={lang === l.id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${lang === l.id ? "bg-white text-deep-800" : "text-white/90 hover:bg-white/10"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <span className="hidden max-w-[10rem] truncate text-sm text-white/90 md:block">{user.name}</span>
            <SignOutButton label={t("admSignOut")} />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[22rem_1fr]">
        {/* รายการ */}
        <aside className={`flex min-h-0 flex-col border-r border-stone-200 bg-white ${selected ? "hidden md:flex" : "flex"}`}>
          <div className="flex gap-1 overflow-x-auto border-b border-stone-200 p-2">
            {TABS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => {
                  setTab(x);
                  setSelectedId(null);
                }}
                aria-pressed={tab === x}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  tab === x ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : "bg-brand-50 text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100"
                }`}
              >
                {tabLabel(x)}
                {tabCount(x) !== null && (
                  <span className={`rounded-full px-1.5 text-[11px] ${tab === x ? "bg-white/25" : x === "new" && tabCount(x)! > 0 ? "bg-red-600 text-white" : "bg-white text-brand-800 ring-1 ring-brand-100"}`}>
                    {tabCount(x)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {error && (
              <p role="alert" className="m-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {t("rcLoadErr")}
              </p>
            )}
            {data && !data.enabled && <p className="m-3 text-sm text-rose-700">{t("rcNoDb")}</p>}
            {data?.enabled && reports.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-stone-400">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-400">
                  <Icon name="clipboard" className="h-5 w-5" />
                </span>
                {t("rcEmpty")}
              </div>
            )}
            {reports.map((r) => {
              const done = r.items.filter((i) => i.done).length;
              const on = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={`block w-full border-b border-l-4 border-stone-100 px-4 py-3 text-left transition ${on ? "border-l-brand-500 bg-brand-50" : "border-l-transparent hover:bg-brand-50/40"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tabular-nums text-brand-700">{r.ticketNo}</span>
                    <span className="text-[11px] text-stone-500">{fmtTime(r.createdAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-deep-700 text-xs font-bold text-white">{initialOf(r.name)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="block truncate text-xs text-stone-500">{DEPARTMENTS.find((d) => d.id === r.department)?.label[lang] ?? r.department}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {[...new Set(r.items.map((i) => i.topic))].map((tp) => (
                      <span key={tp} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700">
                        {labelName(`cosi-${tp}`, lang)}
                      </span>
                    ))}
                    {r.urgent && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{t("admUrgent")}</span>}
                    <span className="ml-auto text-[11px] text-stone-500">{t("rcItemsDone", { done, total: r.items.length })}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* รายละเอียด */}
        <section className={`min-h-0 overflow-y-auto ${selected ? "block" : "hidden md:block"}`}>
          {selected ? (
            <Detail key={selected.id} r={selected} user={user} agents={agents} onChange={replace} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-sm text-stone-400">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-400">
                <Icon name="clipboard" className="h-6 w-6" />
              </span>
              {t("rcPick")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({
  r,
  user,
  agents,
  onChange,
  onBack,
}: {
  r: ReportDTO;
  user: AdminUser;
  agents: AgentDTO[];
  onChange: (r: ReportDTO) => void;
  onBack: () => void;
}) {
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [note, setNote] = useState(r.note);
  const [saved, setSaved] = useState(false);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setErr(false);
    try {
      const res = await api<{ report: ReportDTO }>(`/api/admin/reports/${r.id}`, { json: body });
      onChange(res.report);
      return true;
    } catch {
      setErr(true);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const byTopic = new Map<string, ReportDTO["items"]>();
  for (const i of r.items) byTopic.set(i.topic, [...(byTopic.get(i.topic) ?? []), i]);
  const done = r.items.filter((i) => i.done).length;
  const dept = DEPARTMENTS.find((d) => d.id === r.department)?.label[lang] ?? r.department;
  const statusText = r.status === "new" ? t("rsStatusNew") : r.status === "in_progress" ? t("rsStatusProgress") : t("rsStatusDone");
  const statusCls = r.status === "done" ? "bg-emerald-50 text-emerald-700" : r.status === "in_progress" ? "bg-amber-100 text-amber-900" : "bg-red-50 text-red-700";
  const names = [...new Set([user.name, ...agents.map((a) => a.name), r.assignee].filter(Boolean))];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 md:hidden" aria-label={t("admBack")}>
          <Icon name="back" className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tabular-nums text-deep-800">{r.ticketNo}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCls}`}>{statusText}</span>
            {r.urgent && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">{t("admUrgent")}</span>}
          </div>
          <p className="mt-1 text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{r.name}</span>
            {dept && ` · ${dept}`}
            {r.contact && ` · ${t("rcContact")} ${r.contact}`}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            {t("rsSentAt")} {fmtTime(r.createdAt)}
            {r.doneAt ? ` · ${t("rsDoneAt")} ${fmtTime(r.doneAt)}` : ""}
          </p>
        </div>
      </div>

      {/* การกระทำ */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
        {r.status === "new" && (
          <button type="button" disabled={busy} onClick={() => act({ action: "start" })} className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:brightness-110 disabled:opacity-50">
            {t("rcStart")}
          </button>
        )}
        {r.status !== "done" && (
          <button type="button" disabled={busy} onClick={() => act({ action: "done" })} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {t("rcDone")}
          </button>
        )}
        {r.status === "done" && (
          <button type="button" disabled={busy} onClick={() => act({ action: "reopen" })} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-50">
            {t("rcReopen")}
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-stone-500">{t("rcAssignee")}</span>
          <select
            value={r.assignee}
            disabled={busy}
            onChange={(e) => act({ action: "assign", assignee: e.target.value })}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            <option value="">{t("rcUnassigned")}</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      {err && (
        <p role="alert" className="text-sm text-rose-600">
          {t("rcActErr")}
        </p>
      )}

      {/* รายการข้อ */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-deep-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name="list" className="h-4 w-4" />
            </span>
            {t("rcItems")}
          </h3>
          <span className="text-xs text-stone-500">{t("rcItemsDone", { done, total: r.items.length })}</span>
        </div>
        <p className="mt-0.5 text-xs text-stone-400">{t("rcAutoClosed")}</p>
        <div className="mt-3 space-y-3">
          {[...byTopic].map(([topic, items]) => (
            <div key={topic} className="rounded-xl border border-l-4 border-stone-200 border-l-brand-400 bg-stone-50/40 p-3">
              <h4 className="text-sm font-semibold text-deep-800">{labelName(`cosi-${topic}`, lang)}</h4>
              <ul className="mt-2 space-y-1.5">
                {items.map((i) => (
                  <li key={i.id}>
                    <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-50 ${i.done ? "text-stone-400" : ""}`}>
                      <input
                        type="checkbox"
                        checked={i.done}
                        disabled={busy}
                        onChange={(e) => act({ action: "item", itemId: i.id, done: e.target.checked })}
                        className="mt-1 h-4 w-4 accent-emerald-600"
                      />
                      <span className={`min-w-0 flex-1 break-words ${i.done ? "line-through" : ""}`}>{i.text}</span>
                      {i.done && i.doneBy && <span className="shrink-0 text-[11px] text-stone-400">{t("rcDoneBy", { name: i.doneBy })}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {r.files.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <ReportFiles files={r.files} title={t("rcFiles")} />
        </div>
      )}

      {/* บันทึกภายใน */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-deep-800">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name="lock" className="h-4 w-4" />
            </span>
            {t("rcNote")}
          </span>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
            rows={3}
            maxLength={2000}
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={busy || note === r.note}
            onClick={async () => {
              if (await act({ action: "note", note })) setSaved(true);
            }}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:brightness-110 disabled:opacity-40"
          >
            {t("rcSaveNote")}
          </button>
          {saved && <span className="text-xs text-emerald-700">{t("rcSaved")}</span>}
        </div>
      </div>
    </div>
  );
}
