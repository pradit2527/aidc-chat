import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SignOutButton } from "@/components/SignOutButton";
import { initialOf, labelName } from "@/lib/adminClient";
import { dbEnabled } from "@/lib/db";
import { DEFAULT_LANG, isLang, LANG_COOKIE, translate, type Lang, type MsgKey } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getStats, type Stats } from "@/lib/stats";
import { laoTime, ticketDate } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IT Helpdesk · Ticket statistics",
  robots: { index: false, follow: false },
};

const RANGES = [7, 14, 30, 90];
const fmtAt = (sec: number | null) => (sec ? `${ticketDate(sec)} ${laoTime(sec)}` : "—");

/** หน้าสถิติจากทะเบียน Ticket ใน Neon — โทนขาว/ส้ม เรียบ อ่านง่าย (ต้องล็อกอินคอนโซลก่อน) */
export default async function StatsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const [{ days: daysParam }, jar] = await Promise.all([searchParams, cookies()]);
  const saved = jar.get(LANG_COOKIE)?.value;
  const lang: Lang = isLang(saved) ? saved : DEFAULT_LANG;
  const t = (k: MsgKey, vars?: Record<string, string | number>) => translate(lang, k, vars);

  let authed = false;
  try {
    authed = (await getSession()) !== null;
  } catch {
    authed = false;
  }
  if (!authed) redirect("/admin");

  const days = Math.max(1, Math.min(365, Number(daysParam) || 14));
  const stats: Stats | null = dbEnabled ? await getStats(days) : null;

  const minutes = (n: number | null) => {
    if (n === null) return "—";
    if (n < 60) return t("stMinutes", { n });
    return t("stHours", { h: Math.floor(n / 60), m: n % 60 });
  };
  const statusChip = (status: string) =>
    status === "resolved" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
        <Icon name="check" className="h-3 w-3" />
        {t("admStatusResolved")}
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
        {t("admStatusOpen")}
      </span>
    );

  const kpis: { key: MsgKey; value: string; icon: "chat" | "plus" | "check" | "zap" | "send" | "list"; accent?: boolean }[] = stats
    ? [
        { key: "stOpenNow", value: String(stats.summary.openNow), icon: "chat", accent: true },
        { key: "stCreatedToday", value: String(stats.summary.createdToday), icon: "plus" },
        { key: "stResolvedToday", value: String(stats.summary.resolvedToday), icon: "check" },
        { key: "stAvgResolve", value: minutes(stats.summary.avgResolveMin), icon: "zap" },
        { key: "stAvgFirstReply", value: minutes(stats.summary.avgFirstReplyMin), icon: "send" },
        { key: "stTotal", value: String(stats.summary.total), icon: "list" },
      ]
    : [];

  const maxDay = stats ? Math.max(1, ...stats.perDay.map((d) => d.created)) : 1;
  const maxLabel = stats ? Math.max(1, ...stats.perLabel.map((l) => l.total)) : 1;
  const maxAgent = stats ? Math.max(1, ...stats.perAgent.map((a) => a.total)) : 1;

  return (
    <div className="min-h-screen bg-canvas">
      {/* ส่วนหัว: ขาว เส้นส้มด้านล่าง */}
      <header className="border-b-2 border-brand-500 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
              <Icon name="list" className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-deep-800">{t("stTitle")}</h1>
              <p className="text-xs text-stone-500">
                {t("admBrand")} · {t("stDays", { n: days })}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1.5" aria-label={t("stRange")}>
            {RANGES.map((d) => (
              <a
                key={d}
                href={`/admin/stats?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  d === days ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                }`}
              >
                {t("stDays", { n: d })}
              </a>
            ))}
            <a
              href="/admin"
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-200"
            >
              <Icon name="back" className="h-3.5 w-3.5" />
              {t("admHome")}
            </a>
            <SignOutButton label={t("admSignOut")} variant="light" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {!stats ? (
          <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
            {t("stNoDb")}
          </p>
        ) : (
          <>
            {/* ตัวเลขสรุป */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Summary">
              {kpis.map((k) => (
                <div
                  key={k.key}
                  className={`rounded-2xl border p-4 shadow-sm ${k.accent ? "border-brand-200 bg-gradient-to-br from-brand-50 to-white" : "border-stone-200 bg-white"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium leading-snug text-stone-500">{t(k.key)}</span>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${k.accent ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"}`}>
                      <Icon name={k.icon} className="h-4 w-4" />
                    </span>
                  </div>
                  <div className={`mt-2 text-2xl font-bold leading-tight tabular-nums ${k.accent ? "text-brand-700" : "text-deep-800"}`}>{k.value}</div>
                </div>
              ))}
            </section>

            {/* ตารางสรุป 3 ตาราง */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel title={t("stPerDay", { n: days })} icon="list">
                <DataTable
                  head={[t("stColDay"), t("stColCreated"), t("stColResolved"), t("stColUrgent")]}
                  empty={t("stEmpty")}
                  rows={stats.perDay.map((r) => ({
                    key: r.day,
                    cells: [r.day, <Bar key="c" value={r.created} max={maxDay} />, r.resolved, <Urgent key="u" n={r.urgent} />],
                  }))}
                />
              </Panel>
              <Panel title={t("stPerLabel")} icon="list">
                <DataTable
                  head={[t("stColLabel"), t("stColTotal"), t("stColOpen")]}
                  empty={t("stEmpty")}
                  rows={stats.perLabel.map((r) => ({
                    key: r.label,
                    cells: [labelName(r.label, lang), <Bar key="t" value={r.total} max={maxLabel} />, <OpenCount key="o" n={r.open} />],
                  }))}
                />
              </Panel>
              <Panel title={t("stPerAgent")} icon="user">
                <DataTable
                  head={[t("stColAgent"), t("stColTotal"), t("stColOpen"), t("stColResolved")]}
                  empty={t("stEmpty")}
                  rows={stats.perAgent.map((r) => ({
                    key: r.agent,
                    cells: [
                      <span key="a" className="flex min-w-0 items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-deep-700 text-xs font-bold text-white">{initialOf(r.agent)}</span>
                        <span className="truncate" title={r.agent}>
                          {r.agent}
                        </span>
                      </span>,
                      <Bar key="t" value={r.total} max={maxAgent} />,
                      <OpenCount key="o" n={r.open} />,
                      r.resolved,
                    ],
                  }))}
                />
              </Panel>
            </div>

            {/* Ticket ล่าสุด */}
            <Panel title={t("stRecent")} icon="chat" count={stats.recent.length}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-brand-50 text-left text-[11px] font-semibold uppercase tracking-wide text-brand-800">
                      {[t("stColTicket"), t("stColName"), t("stColLabel"), t("stColStatus"), t("stColAgent"), t("stColCreatedAt"), t("stColResolvedAt")].map((h, i) => (
                        <th key={h} className={`px-3 py-2.5 ${i === 0 ? "rounded-l-xl" : ""} ${i === 6 ? "rounded-r-xl" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400">
                          {t("stEmpty")}
                        </td>
                      </tr>
                    )}
                    {stats.recent.map((r) => (
                      <tr key={r.id} className="border-b border-stone-100 transition last:border-0 odd:bg-white even:bg-stone-50/60 hover:bg-brand-50/40">
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold tabular-nums text-brand-700">
                          {r.ticketNo}
                          {r.urgent && (
                            <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-50 px-1.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100" title="urgent">
                              !
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-deep-700 text-xs font-bold text-white">{initialOf(r.name)}</span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-stone-800">{r.name}</span>
                              {r.department && <span className="block truncate text-xs text-stone-500">{r.department}</span>}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="flex flex-wrap gap-1">
                            {r.labels.map((l) => (
                              <span key={l} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700 ring-1 ring-stone-200">
                                {labelName(l, lang)}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">{statusChip(r.status)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-stone-700">{r.assignee || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-stone-600">{fmtAt(r.createdAt)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-stone-600">{fmtAt(r.resolvedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

/** กล่องตารางสีขาว หัวข้อพร้อมไอคอนส้ม */
function Panel({ title, icon, count, children }: { title: string; icon: "list" | "user" | "chat"; count?: number; children: React.ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-deep-800">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        {title}
        {count !== undefined && <span className="text-xs font-normal text-stone-400">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

/** ตารางมาตรฐาน: หัวส้มอ่อน แถวสลับสี ตัวเลขชิดขวา */
function DataTable({ head, rows, empty }: { head: string[]; rows: { key: string; cells: React.ReactNode[] }[]; empty: string }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-brand-50 text-[11px] font-semibold uppercase tracking-wide text-brand-800">
          {head.map((h, i) => (
            <th
              key={h}
              className={`whitespace-nowrap px-2 py-2 ${i === 0 ? "w-full rounded-l-xl text-left" : "text-right"} ${i === head.length - 1 ? "rounded-r-xl" : ""}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={head.length} className="py-6 text-center text-stone-400">
              {empty}
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <tr key={r.key} className="border-b border-stone-100 transition last:border-0 odd:bg-white even:bg-stone-50/60 hover:bg-brand-50/40">
            {r.cells.map((cell, j) =>
              j === 0 ? (
                // max-w-0 + truncate: คอลัมน์แรกยืดเต็มที่เหลือและตัดด้วย … แทนที่จะดันตารางล้นการ์ด
                <td key={j} className="max-w-0 px-2 py-2 text-stone-800">
                  <span className="block truncate">{cell}</span>
                </td>
              ) : (
                <td key={j} className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-stone-700">
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** ตัวเลขพร้อมแถบส้มสัดส่วนเทียบค่าสูงสุดในตาราง */
function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(4, Math.round((value / Math.max(1, max)) * 100));
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-brand-100 sm:inline-block" aria-hidden>
        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="min-w-5 text-right font-semibold">{value}</span>
    </span>
  );
}

function OpenCount({ n }: { n: number }) {
  return n > 0 ? <span className="inline-block min-w-6 rounded-full bg-brand-50 px-1.5 py-0.5 text-center text-xs font-semibold text-brand-700 ring-1 ring-brand-100">{n}</span> : <span className="text-stone-400">0</span>;
}

function Urgent({ n }: { n: number }) {
  return n > 0 ? <span className="inline-block min-w-6 rounded-full bg-rose-50 px-1.5 py-0.5 text-center text-xs font-semibold text-rose-700 ring-1 ring-rose-100">{n}</span> : <span className="text-stone-400">0</span>;
}
