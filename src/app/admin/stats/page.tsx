import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { AdminHeaderStandalone } from "@/components/AdminHeader";
import { AutoRefresh } from "@/components/AutoRefresh";
import type { AdminUser } from "@/lib/adminTypes";
import { initialOf, labelName } from "@/lib/adminClient";
import { demoStats } from "@/lib/adminDemo";
import { dbEnabled } from "@/lib/db";
import { chatEnabled } from "@/lib/features";
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
type View = "cards" | "table";

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ days?: string; page?: string; view?: string; demo?: string }> }) {
  const [{ days: daysParam, page: pageParam, view: viewParam, demo }, jar] = await Promise.all([searchParams, cookies()]);
  const view: View = viewParam === "table" ? "table" : "cards";
  const saved = jar.get(LANG_COOKIE)?.value;
  const lang: Lang = isLang(saved) ? saved : DEFAULT_LANG;
  const t = (k: MsgKey, vars?: Record<string, string | number>) => translate(lang, k, vars);
  // ระบบแชทซ่อนอยู่ (ค่าปกติ) → การ์ด/เลขตั๋วไม่ลิงก์ไปคอนโซลแชท
  const chat = chatEnabled();
  const recentHint = t(chat ? "stRecentHint" : "stRecentHintNoChat");

  let user: AdminUser | null = null;
  try {
    user = (await getSession())?.user ?? null;
  } catch {
    user = null;
  }
  if (!user) redirect("/admin");

  const days = Math.max(1, Math.min(365, Number(daysParam) || 14));
  const page = Math.max(1, Number(pageParam) || 1);
  // ?demo=1 = ข้อมูลตัวอย่าง (เฉพาะตอนพัฒนา) ไว้ดูหน้าตาโดยไม่ต้องมีฐานข้อมูล
  const stats: Stats | null = demo === "1" && process.env.NODE_ENV !== "production" ? demoStats(days) : dbEnabled ? await getStats(days, page) : null;

  const minutes = (n: number | null) => {
    if (n === null) return "—";
    if (n < 60) return t("stMinutes", { n });
    return t("stHours", { h: Math.floor(n / 60), m: n % 60 });
  };
  const statusChip = (status: string) =>
    status === "resolved" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("admStatusResolved")}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
      <AdminHeaderStandalone initialLang={lang} user={user} title={t("stTitle")} subtitle={recentHint} />

      <main className="relative z-10 mx-auto -mt-8 max-w-6xl space-y-6 px-4 pb-10">
        {/* แถบเลือกช่วงเวลา (การ์ดขาวซ้อนขอบส่วนหัว) */}
        <nav className="card flex flex-wrap items-center justify-between gap-2 p-3" aria-label={t("stRange")}>
          <span className="flex items-center gap-2 text-sm font-semibold text-deep-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name="list" className="h-4 w-4" />
            </span>
            {t("stRange")} · {t("stDays", { n: days })}
            <AutoRefresh intervalMs={15_000} label={t("liveLabel")} />
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {RANGES.map((d) => (
              <a
                key={d}
                href={`/admin/stats?days=${d}&view=${view}`}
                aria-current={d === days ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  d === days ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                }`}
              >
                {t("stDays", { n: d })}
              </a>
            ))}
          </span>
        </nav>
        {!stats ? (
          <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
            {t("stNoDb")}
          </p>
        ) : (
          <>
            {/* ตัวเลขสรุป: แถบเดียว แบ่งช่องด้วยเส้นบาง ๆ */}
            <section className="card overflow-hidden" aria-label="Summary">
              <div className="grid grid-cols-2 gap-px bg-stone-100 md:grid-cols-3 xl:grid-cols-6">
                {kpis.map((k) => (
                  <div key={k.key} className="relative bg-white p-4 sm:p-5">
                    {k.accent && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-brand-500" />}
                    <div className="flex items-center gap-2">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${k.accent ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : "bg-stone-100 text-deep-700"}`}>
                        <Icon name={k.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-[11px] font-medium leading-snug text-stone-500">{t(k.key)}</span>
                    </div>
                    <div className={`mt-3 font-bold leading-none tracking-tight tabular-nums ${k.value.length > 6 ? "text-xl sm:text-2xl" : "text-3xl"} ${k.accent ? "text-brand-600" : "text-deep-800"}`}>{k.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ตารางสรุป 3 ตาราง */}
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <Panel title={t("stPerDay", { n: days })} icon="list" count={stats.perDay.length}>
                <DataTable
                  head={[{ label: t("stColDay") }, { label: t("stColCreated"), wide: true }, { label: t("stColResolved") }, { label: t("stColUrgent") }]}
                  empty={t("stEmpty")}
                  rows={stats.perDay.map((r) => ({
                    key: r.day,
                    cells: [<span key="d" className="font-medium tabular-nums">{r.day}</span>, <Bar key="c" value={r.created} max={maxDay} />, <Resolved key="r" n={r.resolved} />, <Urgent key="u" n={r.urgent} />],
                  }))}
                  foot={
                    stats.perDay.length > 1
                      ? [t("stColTotal"), sum(stats.perDay.map((r) => r.created)), sum(stats.perDay.map((r) => r.resolved)), sum(stats.perDay.map((r) => r.urgent))]
                      : undefined
                  }
                />
              </Panel>
              <Panel title={t("stPerLabel")} icon="list" count={stats.perLabel.length}>
                <DataTable
                  head={[{ label: t("stColLabel") }, { label: t("stColTotal"), wide: true }, { label: t("stColOpen") }]}
                  empty={t("stEmpty")}
                  rows={stats.perLabel.map((r, i) => ({
                    key: r.label,
                    cells: [
                      <span key="l" className="flex min-w-0 items-center gap-2">
                        <Rank n={i + 1} />
                        <span className="truncate" title={labelName(r.label, lang)}>{labelName(r.label, lang)}</span>
                      </span>,
                      <Bar key="t" value={r.total} max={maxLabel} />,
                      <OpenCount key="o" n={r.open} />,
                    ],
                  }))}
                />
              </Panel>
              <Panel title={t("stPerAgent")} icon="user" count={stats.perAgent.length}>
                <DataTable
                  head={[{ label: t("stColAgent") }, { label: t("stColTotal"), wide: true }, { label: t("stColOpen") }, { label: t("stColResolved") }]}
                  empty={t("stEmpty")}
                  rows={stats.perAgent.map((r) => ({
                    key: r.agent,
                    cells: [
                      <span key="a" className="flex min-w-0 items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-deep-600 to-deep-800 text-xs font-bold text-white">{initialOf(r.agent)}</span>
                        <span className="truncate font-medium" title={r.agent}>{r.agent}</span>
                      </span>,
                      <Bar key="t" value={r.total} max={maxAgent} />,
                      <OpenCount key="o" n={r.open} />,
                      <Resolved key="r" n={r.resolved} />,
                    ],
                  }))}
                  foot={
                    stats.perAgent.length > 1
                      ? [t("stColTotal"), sum(stats.perAgent.map((r) => r.total)), sum(stats.perAgent.map((r) => r.open)), sum(stats.perAgent.map((r) => r.resolved))]
                      : undefined
                  }
                />
              </Panel>
            </div>

            {/* Ticket ล่าสุด — การ์ด grid หน้าละ 30 */}
            <Panel
              title={t("stRecent")}
              icon="chat"
              count={stats.recentTotal}
              actions={
                <span className="flex rounded-full bg-brand-50 p-0.5 ring-1 ring-brand-100" role="group" aria-label="view">
                  {(
                    [
                      ["cards", "grid", t("stViewCards")],
                      ["table", "list", t("stViewTable")],
                    ] as [View, "grid" | "list", string][]
                  ).map(([v, icon, label]) => (
                    <a
                      key={v}
                      href={`/admin/stats?days=${days}&page=${stats.recentPage}&view=${v}`}
                      aria-current={view === v ? "true" : undefined}
                      title={label}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        view === v ? "bg-brand-600 text-white shadow-sm" : "text-brand-700 hover:bg-brand-100"
                      }`}
                    >
                      <Icon name={icon} className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </a>
                  ))}
                </span>
              }
            >
              <p className="-mt-2 mb-3 text-xs text-stone-500">{recentHint}</p>
              {stats.recent.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-400">{t("stEmpty")}</p>
              ) : view === "table" ? (
                <div className="overflow-x-auto rounded-xl ring-1 ring-stone-200">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-deep-800 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                        {[t("stColTicket"), t("stColName"), t("stColLabel"), t("stColStatus"), t("stColAgent"), t("stColCreatedAt"), t("stColResolvedAt")].map((h, i) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.map((r) => (
                        <tr key={r.id} className="border-t border-stone-200 transition odd:bg-white even:bg-stone-50 hover:bg-brand-50">
                          <td className="whitespace-nowrap px-3 py-2.5 font-semibold tabular-nums">
                            {chat ? (
                              <a href={`/admin/chat?c=${r.id}`} className="text-brand-700 hover:underline">
                                {r.ticketNo}
                              </a>
                            ) : (
                              r.ticketNo
                            )}
                            {r.urgent && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-50 px-1.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100" title="urgent">
                                !
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-deep-600 to-deep-800 text-xs font-bold text-white">{initialOf(r.name)}</span>
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
              ) : (
                <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {stats.recent.map((r) => (
                    <li key={r.id}>
                      <a
                        href={chat ? `/admin/chat?c=${r.id}` : undefined}
                        className={`group flex h-full flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/10 ${
                          r.status === "resolved" ? "border-stone-200" : "border-brand-200 bg-gradient-to-br from-brand-50/60 to-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold tabular-nums text-brand-700">{r.ticketNo}</span>
                            <span className="block text-[11px] tabular-nums text-stone-500">{fmtAt(r.createdAt)}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            {r.urgent && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100">
                                <Icon name="alert" className="h-3 w-3" />
                                {t("admUrgent")}
                              </span>
                            )}
                            {statusChip(r.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-700 text-sm font-bold text-white">{initialOf(r.name)}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-stone-800">{r.name}</span>
                            <span className="block truncate text-xs text-stone-500">{r.department || "—"}</span>
                          </span>
                        </div>
                        {r.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {r.labels.map((l) => (
                              <span key={l} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700 ring-1 ring-stone-200">
                                {labelName(l, lang)}
                              </span>
                            ))}
                          </div>
                        )}
                        <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs">
                          <div className="min-w-0">
                            <dt className="text-stone-400">{t("stColAgent")}</dt>
                            <dd className="truncate font-medium text-stone-700">{r.assignee || "—"}</dd>
                          </div>
                          <div className="min-w-0 text-right">
                            <dt className="text-stone-400">{t("stColResolvedAt")}</dt>
                            <dd className="truncate font-medium tabular-nums text-stone-700">{r.resolvedAt ? fmtAt(r.resolvedAt) : "—"}</dd>
                          </div>
                        </dl>
                        {chat && (
                          <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">
                            {t("stOpenCase")}
                            <Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" />
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {stats.recentPages > 1 && (
                <nav className="mt-4 flex items-center justify-between gap-2 text-sm" aria-label="pagination">
                  <PageLink days={days} view={view} page={stats.recentPage - 1} disabled={stats.recentPage <= 1} label={t("hubPrev")} dir="prev" />
                  <span className="text-xs text-stone-500">{t("hubPage", { page: stats.recentPage, pages: stats.recentPages, total: stats.recentTotal })}</span>
                  <PageLink days={days} view={view} page={stats.recentPage + 1} disabled={stats.recentPage >= stats.recentPages} label={t("hubNext")} dir="next" />
                </nav>
              )}
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0);

/** การ์ดขาวของตาราง: หัวข้อ + ไอคอน + จำนวนแถว */
function Panel({
  title,
  icon,
  count,
  actions,
  children,
}: {
  title: string;
  icon: "list" | "user" | "chat";
  count?: number;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card min-w-0 overflow-hidden p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2.5 text-sm font-semibold text-deep-800">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        {title}
        {count !== undefined && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">{count}</span>}
        {actions && <span className="ml-auto flex items-center gap-1">{actions}</span>}
      </h2>
      {children}
    </section>
  );
}

type Col = { label: string; /** คอลัมน์ที่มีแถบสัดส่วน (ชิดซ้าย) */ wide?: boolean };

/**
 * ตารางสรุป: กรอบมน + หัวตารางสีเขียวเข้มตัวขาว, แถวสลับสี, เส้นตารางบาง ๆ ทั้งแนวตั้งและแนวนอน,
 * ไฮไลต์แถวตอนชี้, แถวรวมสีส้มอ่อนท้ายตาราง (ถ้ามี)
 */
function DataTable({ head, rows, empty, foot }: { head: Col[]; rows: { key: string; cells: React.ReactNode[] }[]; empty: string; foot?: React.ReactNode[] }) {
  const align = (j: number) => (j === 0 || head[j]?.wide ? "text-left" : "text-center");
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-stone-200">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-deep-800 text-[11px] font-semibold uppercase tracking-wide text-white">
            {head.map((h, j) => (
              <th key={h.label} className={`whitespace-nowrap px-2 py-2.5 ${j === 0 ? "w-full" : ""} ${align(j)} ${j > 0 ? "border-l border-white/10" : ""}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-8 text-center text-stone-400">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-stone-200 transition odd:bg-white even:bg-stone-50 hover:bg-brand-50">
              {r.cells.map((cell, j) =>
                j === 0 ? (
                  // max-w-0 + truncate: คอลัมน์แรกยืดเต็มที่เหลือและตัดด้วย … แทนที่จะดันตารางล้นการ์ด
                  <td key={j} className="max-w-0 px-2 py-2.5 text-stone-800">
                    <span className="block truncate">{cell}</span>
                  </td>
                ) : (
                  <td key={j} className={`whitespace-nowrap border-l border-stone-200 px-2 py-2.5 tabular-nums text-stone-700 ${align(j)}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {foot && rows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-brand-200 bg-brand-50 text-xs font-bold text-brand-800">
              {foot.map((c, j) => (
                <td key={j} className={`px-2 py-2.5 tabular-nums ${align(j)} ${j > 0 ? "border-l border-brand-100" : "uppercase tracking-wide"}`}>
                  {c}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** ตัวเลขพร้อมแถบสัดส่วนเทียบค่าสูงสุดในตาราง */
function Bar({ value, max }: { value: number; max: number }) {
  const pct = value === 0 ? 0 : Math.max(8, Math.round((value / Math.max(1, max)) * 100));
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-8 shrink-0 overflow-hidden rounded-full bg-stone-200/70" aria-hidden>
        <span className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${pct}%` }} />
      </span>
      <span className="min-w-4 text-right text-sm font-bold text-deep-800">{value}</span>
    </span>
  );
}

function Rank({ n }: { n: number }) {
  return <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold ${n === 1 ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-500"}`}>{n}</span>;
}

function OpenCount({ n }: { n: number }) {
  return n > 0 ? (
    <span className="inline-flex min-w-6 justify-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">{n}</span>
  ) : (
    <span className="text-stone-300">0</span>
  );
}

function Resolved({ n }: { n: number }) {
  return n > 0 ? <span className="font-semibold text-emerald-700">{n}</span> : <span className="text-stone-300">0</span>;
}

function Urgent({ n }: { n: number }) {
  return n > 0 ? (
    <span className="inline-flex min-w-6 justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">{n}</span>
  ) : (
    <span className="text-stone-300">0</span>
  );
}

/** ปุ่มก่อนหน้า/ถัดไปของรายการ Ticket (คงช่วงวันไว้ใน URL) */
function PageLink({
  days,
  view,
  page,
  disabled,
  label,
  dir,
}: {
  days: number;
  view: View;
  page: number;
  disabled: boolean;
  label: string;
  dir: "prev" | "next";
}) {
  const cls = "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition";
  if (disabled) {
    return (
      <span className={`${cls} cursor-not-allowed bg-stone-50 text-stone-300 ring-stone-100`} aria-disabled>
        {dir === "prev" && <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />}
        {label}
        {dir === "next" && <Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" />}
      </span>
    );
  }
  return (
    <a href={`/admin/stats?days=${days}&page=${page}&view=${view}`} className={`${cls} bg-brand-50 text-brand-700 ring-brand-100 hover:bg-brand-100`}>
      {dir === "prev" && <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />}
      {label}
      {dir === "next" && <Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" />}
    </a>
  );
}
