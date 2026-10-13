import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { labelName } from "@/lib/adminClient";
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

const DAY_OPTIONS = [7, 14, 30, 90];
const fmtAt = (sec: number | null) => (sec ? `${ticketDate(sec)} ${laoTime(sec)}` : "—");

/** หน้าสถิติจากทะเบียน Ticket ใน Neon — ต้องล็อกอินคอนโซลก่อน (ไม่มีเซสชันจะเด้งไป /admin) */
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

  const cards: [MsgKey, string][] = stats
    ? [
        ["stOpenNow", String(stats.summary.openNow)],
        ["stCreatedToday", String(stats.summary.createdToday)],
        ["stResolvedToday", String(stats.summary.resolvedToday)],
        ["stAvgResolve", minutes(stats.summary.avgResolveMin)],
        ["stAvgFirstReply", minutes(stats.summary.avgFirstReplyMin)],
        ["stTotal", String(stats.summary.total)],
      ]
    : [];

  return (
    <div className="min-h-screen">
      <header className="hero text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-base font-semibold">{t("stTitle")}</h1>
          <nav className="flex items-center gap-2 text-xs" aria-label="Range">
            {DAY_OPTIONS.map((d) => (
              <a
                key={d}
                href={`/admin/stats?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  d === days ? "bg-white text-deep-800" : "bg-white/15 ring-1 ring-white/25 hover:bg-white/25"
                }`}
              >
                {d}d
              </a>
            ))}
            <a href="/admin" className="ml-2 rounded-full bg-brand-600 px-3 py-1 font-semibold transition hover:bg-brand-700">
              {t("stBack")}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {!stats ? (
          <p role="alert" className="card p-5 text-sm text-rose-700">
            {t("stNoDb")}
          </p>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" aria-label="Summary">
              {cards.map(([k, v]) => (
                <div key={k} className="card p-4">
                  <div className="text-[11px] font-medium text-stone-500">{t(k)}</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-deep-800">{v}</div>
                </div>
              ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
              <Table
                title={t("stPerDay", { n: days })}
                head={[t("stColDay"), t("stColCreated"), t("stColResolved"), t("stColUrgent")]}
                rows={stats.perDay.map((r) => [r.day, r.created, r.resolved, r.urgent])}
                empty={t("stEmpty")}
              />
              <Table
                title={t("stPerLabel")}
                head={[t("stColLabel"), t("stColTotal"), t("stColOpen")]}
                rows={stats.perLabel.map((r) => [labelName(r.label, lang), r.total, r.open])}
                empty={t("stEmpty")}
              />
              <Table
                title={t("stPerAgent")}
                head={[t("stColAgent"), t("stColTotal"), t("stColOpen"), t("stColResolved")]}
                rows={stats.perAgent.map((r) => [r.agent, r.total, r.open, r.resolved])}
                empty={t("stEmpty")}
              />
            </div>

            <section className="card overflow-x-auto p-4">
              <h2 className="mb-3 text-sm font-semibold">{t("stRecent")}</h2>
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-stone-500">
                  <tr>
                    {[
                      t("stColTicket"),
                      t("stColName"),
                      t("stColLabel"),
                      t("stColStatus"),
                      t("stColAgent"),
                      t("stColCreatedAt"),
                      t("stColResolvedAt"),
                    ].map((h) => (
                      <th key={h} className="pb-2 pr-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {stats.recent.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-stone-400">
                        {t("stEmpty")}
                      </td>
                    </tr>
                  )}
                  {stats.recent.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-4 font-semibold tabular-nums">
                        {r.ticketNo}
                        {r.urgent && (
                          <span className="ml-1 rounded bg-rose-50 px-1 text-[10px] font-bold text-rose-700" title="urgent">
                            !
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {r.name}
                        {r.department && <span className="block text-xs text-stone-500">{r.department}</span>}
                      </td>
                      <td className="py-2 pr-4 text-xs text-stone-600">
                        {r.labels.map((l) => labelName(l, lang)).join(", ")}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs">{r.assignee || "—"}</td>
                      <td className="py-2 pr-4 text-xs tabular-nums">{fmtAt(r.createdAt)}</td>
                      <td className="py-2 pr-4 text-xs tabular-nums">{fmtAt(r.resolvedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Table({ title, head, rows, empty }: { title: string; head: string[]; rows: (string | number)[][]; empty: string }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-stone-500">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`pb-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-stone-400">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={`py-1.5 ${j > 0 ? "text-right tabular-nums" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
