"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fmtTime, labelName } from "@/lib/adminClient";
import { DEPARTMENTS } from "@/lib/categories";
import type { Bucket, CaseRow, Dashboard, Kind } from "@/lib/dashboard";
import type { Lang, MsgKey } from "@/lib/i18n";
import { useLive } from "@/lib/useLive";
import { I18nProvider, useI18n } from "./I18n";
import { Icon } from "./Icon";
import { StaffHeader } from "./StaffHeader";

type Res = ({ enabled: false } | ({ enabled: true } & Dashboard)) | null;

/** แดชบอร์ดหัวหน้าโรงแรม: สรุปแชท + แจ้งปัญหาทุกเคสของพนักงานทุกคน พร้อมสถานะ (อ่านอย่างเดียว, อัปเดตอัตโนมัติ) */
export default function ManagerDashboard({ name, initialLang }: { name: string; initialLang: Lang }) {
  return (
    <I18nProvider initial={initialLang}>
      <Dash name={name} />
    </I18nProvider>
  );
}

const BUCKETS: Bucket[] = ["new", "in_progress", "done"];
const BUCKET_LABEL: Record<Bucket, MsgKey> = { new: "stNew", in_progress: "stProg", done: "stDone" };
const BUCKET_CLS: Record<Bucket, string> = {
  new: "bg-rose-50 text-rose-700 ring-rose-200",
  in_progress: "bg-amber-50 text-amber-800 ring-amber-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
const BUCKET_BAR: Record<Bucket, string> = { new: "bg-rose-500", in_progress: "bg-amber-400", done: "bg-emerald-500" };

function Dash({ name }: { name: string }) {
  const { t } = useI18n();
  const [data, setData] = useState<Res>(null);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<Kind | "all">("all");
  const [status, setStatus] = useState<Bucket | "all">("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // ค่าค้นหาที่ผ่าน debounce แล้ว
  const [page, setPage] = useState(1);
  const [updated, setUpdated] = useState("");
  const seq = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    const my = ++seq.current;
    try {
      const params = new URLSearchParams({ kind, status, q, page: String(page) });
      const r = await fetch(`/api/manager/dashboard?${params}`, { cache: "no-store", credentials: "same-origin" });
      if (r.status === 401) {
        window.location.assign("/manager/login");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as Res;
      if (my !== seq.current) return; // มีคำขอใหม่กว่าแล้ว
      setData(j);
      setError(false);
      const d = new Date();
      setUpdated(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    } catch {
      if (my === seq.current) setError(true);
    }
  }, [kind, status, q, page]);

  useLive(load, 15_000);

  async function signOut() {
    try {
      await fetch("/api/manager/logout", { method: "POST" });
    } catch {
      // ออฟไลน์ — ไปหน้าล็อกอินต่อ
    }
    window.location.assign("/manager/login");
  }

  const d = data && data.enabled ? data : null;

  return (
    <div className="min-h-screen">
      <StaffHeader
        title={t("mgrTitle")}
        subtitle={t("mgrSub")}
        extra={
          <>
            <span className="hidden max-w-[10rem] truncate text-sm text-white/90 sm:block">{name}</span>
            <button
              type="button"
              onClick={signOut}
              title={t("admSignOut")}
              aria-label={t("admSignOut")}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </>
        }
      />
      <main className="relative z-10 mx-auto -mt-8 grid max-w-6xl gap-4 px-4 pb-10">
        {data && !data.enabled && (
          <p role="alert" className="card p-4 text-sm text-rose-700">
            {t("mgrNeedDb")}
          </p>
        )}
        {error && (
          <p role="alert" className="card p-3 text-sm text-amber-800">
            {t("mgrLoadErr")}
          </p>
        )}
        {!data && !error && <div className="card h-40 animate-pulse bg-stone-100" />}

        {d && (
          <>
            <Kpis d={d} />
            <div className="grid gap-4 lg:grid-cols-2">
              <StatusCard title={t("mgrChats")} icon="chat" counts={d.totals.chat} />
              <StatusCard title={t("mgrReports")} icon="clipboard" counts={d.totals.report} />
            </div>
            <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
              <PerDay d={d} />
              <PerDept d={d} />
            </div>
          </>
        )}

        <section className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Icon name="list" className="h-4 w-4 text-deep-700" />
              {t("mgrCases")}
              {d && <span className="text-xs font-normal text-stone-500">({d.total})</span>}
            </h2>
            {updated && <span className="text-xs text-stone-500">{t("mgrUpdated", { time: updated })}</span>}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mgrSearch")}
              aria-label={t("mgrSearch")}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <Chips
              label={t("mgrKind")}
              value={kind}
              onChange={(v) => {
                setKind(v);
                setPage(1);
              }}
              options={[
                ["all", t("mgrAll")],
                ["chat", t("mgrKindChat")],
                ["report", t("mgrKindReport")],
              ]}
            />
            <Chips
              label={t("mgrStatus")}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[["all", t("mgrAll")], ...BUCKETS.map((b) => [b, t(BUCKET_LABEL[b])] as [Bucket, string])]}
            />
          </div>

          {d && d.cases.length === 0 && <p className="mt-6 text-center text-sm text-stone-500">{t("mgrNoCases")}</p>}
          {d && d.cases.length > 0 && (
            <>
              <div className="mt-3 hidden grid-cols-[10rem_1fr_1fr_1fr_7rem_7rem] gap-3 px-2 text-xs font-semibold text-stone-500 md:grid">
                <span>{t("mgrColTicket")}</span>
                <span>{t("mgrColFrom")}</span>
                <span>{t("mgrColTopic")}</span>
                <span>{t("mgrColHandler")}</span>
                <span>{t("mgrColCreated")}</span>
                <span>{t("mgrStatus")}</span>
              </div>
              <ul className="mt-1 divide-y divide-stone-100">
                {d.cases.map((c) => (
                  <CaseItem key={`${c.kind}-${c.id}`} c={c} />
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  disabled={d.page <= 1}
                  onClick={() => setPage(d.page - 1)}
                  className="rounded-lg px-3 py-1.5 font-semibold text-deep-700 hover:bg-deep-100 disabled:opacity-40"
                >
                  {t("hubPrev")}
                </button>
                <span className="text-xs text-stone-500">{t("hubPage", { page: d.page, pages: d.pages, total: d.total })}</span>
                <button
                  type="button"
                  disabled={d.page >= d.pages}
                  onClick={() => setPage(d.page + 1)}
                  className="rounded-lg px-3 py-1.5 font-semibold text-deep-700 hover:bg-deep-100 disabled:opacity-40"
                >
                  {t("hubNext")}
                </button>
              </div>
            </>
          )}
          <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">{t("mgrChatNote")}</p>
        </section>
      </main>
    </div>
  );
}

function useDuration() {
  const { t } = useI18n();
  return (min: number | null) => (min === null ? "—" : min < 60 ? t("mgrMin", { n: min }) : t("mgrHour", { n: (min / 60).toFixed(1) }));
}

function Kpis({ d }: { d: Dashboard }) {
  const { t } = useI18n();
  const dur = useDuration();
  const items: { label: string; value: string | number; tone?: string }[] = [
    { label: t("mgrOpenNow"), value: d.totals.openNow, tone: "text-deep-800" },
    { label: t("mgrUrgent"), value: d.totals.urgentOpen, tone: d.totals.urgentOpen > 0 ? "text-rose-600" : "text-deep-800" },
    { label: t("mgrToday"), value: d.totals.createdToday, tone: "text-deep-800" },
    { label: t("mgrDoneToday"), value: d.totals.doneToday, tone: "text-emerald-700" },
    { label: t("mgrAvgFirst"), value: dur(d.totals.avgFirstResponseMin), tone: "text-deep-800" },
    { label: t("mgrAvgResolve"), value: dur(d.totals.avgResolveMin), tone: "text-deep-800" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((k) => (
        <div key={k.label} className="card p-4">
          <div className="text-xs font-medium text-stone-500">{k.label}</div>
          <div className={`mt-1 text-2xl font-bold ${k.tone ?? ""}`}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

function StatusCard({ title, icon, counts }: { title: string; icon: "chat" | "clipboard"; counts: Record<Bucket, number> }) {
  const { t } = useI18n();
  const total = BUCKETS.reduce((n, b) => n + counts[b], 0);
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon name={icon} className="h-4 w-4 text-deep-700" />
        {title}
        <span className="text-xs font-normal text-stone-500">({total})</span>
      </h2>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-stone-100" role="img" aria-label={title}>
        {BUCKETS.map((b) => (
          <span key={b} className={BUCKET_BAR[b]} style={{ width: total ? `${(counts[b] / total) * 100}%` : 0 }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {BUCKETS.map((b) => (
          <div key={b} className={`rounded-xl p-3 ring-1 ${BUCKET_CLS[b]}`}>
            <div className="text-2xl font-bold">{counts[b]}</div>
            <div className="text-xs font-medium">{t(BUCKET_LABEL[b])}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PerDay({ d }: { d: Dashboard }) {
  const { t } = useI18n();
  const max = Math.max(1, ...d.perDay.map((x) => x.chat + x.report));
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{t("mgrPerDay")}</h2>
      <div className="mt-2 flex gap-3 text-xs text-stone-600">
        <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-deep-700" />{t("mgrKindChat")}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-500" />{t("mgrKindReport")}</span>
      </div>
      <div className="mt-3 flex h-40 items-end gap-1.5">
        {d.perDay.map((x) => {
          const total = x.chat + x.report;
          return (
            <div key={x.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${x.day}: ${t("mgrKindChat")} ${x.chat} · ${t("mgrKindReport")} ${x.report} · ${t("stDone")} ${x.done}`}>
              <span className="text-[10px] font-semibold text-stone-600">{total || ""}</span>
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-t" style={{ height: `${(total / max) * 100}%`, minHeight: total ? 4 : 0 }}>
                <span className="bg-brand-500" style={{ flexGrow: x.report }} />
                <span className="bg-deep-700" style={{ flexGrow: x.chat }} />
              </div>
              <span className="text-[10px] text-stone-500">{x.day.slice(8)}/{x.day.slice(5, 7)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PerDept({ d }: { d: Dashboard }) {
  const { t, lang } = useI18n();
  const max = Math.max(1, ...d.perDepartment.map((x) => x.total));
  const label = (en: string) => DEPARTMENTS.find((x) => x.label.en === en)?.label[lang] ?? en;
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold">{t("mgrPerDept")}</h2>
      {d.perDepartment.length === 0 && <p className="mt-4 text-sm text-stone-500">{t("mgrNoCases")}</p>}
      <ul className="mt-3 space-y-2.5">
        {d.perDepartment.slice(0, 8).map((x) => (
          <li key={x.department}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium">{label(x.department)}</span>
              <span className="shrink-0 text-xs text-stone-500">
                {x.total} · {x.open} {t("mgrDeptOpen")}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
              <span className="block h-full rounded-full bg-deep-700" style={{ width: `${(x.total / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Chips<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex gap-1 rounded-lg bg-stone-100 p-1 text-xs font-semibold" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 transition ${value === v ? "bg-white text-deep-800 shadow-sm" : "text-stone-600 hover:text-deep-800"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function CaseItem({ c }: { c: CaseRow }) {
  const { t, lang } = useI18n();
  const dept = DEPARTMENTS.find((x) => x.label.en === c.department)?.label[lang] ?? c.department;
  const topics = c.topics.filter((x) => x !== "cosi-urgent").map((x) => labelName(x, lang));
  return (
    <li className="grid gap-x-3 gap-y-1 px-2 py-3 md:grid-cols-[10rem_1fr_1fr_1fr_7rem_7rem] md:items-center">
      <div className="flex items-center gap-1.5 text-xs">
        <Icon name={c.kind === "chat" ? "chat" : "clipboard"} className="h-3.5 w-3.5 shrink-0 text-deep-700" />
        <span className="font-semibold text-brand-700">{c.ticketNo.replace("Ticket", "")}</span>
        {c.urgent && <span className="rounded bg-rose-600 px-1 text-[10px] font-bold text-white">{lang === "lo" ? "ດ່ວນ" : "URGENT"}</span>}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{c.name || "—"}</div>
        <div className="truncate text-xs text-stone-500">{dept}</div>
      </div>
      <div className="min-w-0 truncate text-sm text-stone-700">
        {topics.join(", ") || "—"}
        {c.kind === "report" && c.itemsTotal > 0 && <span className="ml-1 text-xs text-stone-500">· {t("mgrItems", { done: c.itemsDone, total: c.itemsTotal })}</span>}
      </div>
      <div className="min-w-0 truncate text-sm text-stone-700">{c.assignee || <span className="text-stone-400">{t("mgrNoHandler")}</span>}</div>
      <div className="text-xs text-stone-600">
        {fmtTime(c.createdAt)}
        {c.doneAt ? <div className="text-stone-400">{t("mgrColDone")} {fmtTime(c.doneAt)}</div> : null}
      </div>
      <div>
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${BUCKET_CLS[c.status]}`}>{t(BUCKET_LABEL[c.status])}</span>
      </div>
    </li>
  );
}
