// สถิติจากทะเบียน Ticket (Neon) — ใช้ทั้ง API /api/admin/stats และหน้า /admin/stats
import { q } from "./db";
import { ticketDate } from "./tickets";

export type Stats = {
  days: number;
  summary: {
    openNow: number;
    createdToday: number;
    resolvedToday: number;
    /** นาที (null = ยังไม่มีข้อมูล) */
    avgResolveMin: number | null;
    avgFirstReplyMin: number | null;
    total: number;
  };
  perDay: { day: string; created: number; resolved: number; urgent: number }[];
  perLabel: { label: string; total: number; open: number }[];
  perAgent: { agent: string; total: number; open: number; resolved: number }[];
  recent: {
    id: number;
    ticketNo: string;
    name: string;
    department: string;
    labels: string[];
    status: string;
    urgent: boolean;
    assignee: string;
    createdAt: number;
    resolvedAt: number | null;
  }[];
  /** การแบ่งหน้าของ recent (หน้าละ 30) */
  recentTotal: number;
  recentPage: number;
  recentPages: number;
};

type S = Record<string, string | null>;
const num = (v: string | null | undefined) => (v === null || v === undefined || v === "" ? null : Number(v));

export const RECENT_PER_PAGE = 30;

export async function getStats(days = 14, recentPage = 1): Promise<Stats> {
  const today = ticketDate(Math.floor(Date.now() / 1000));
  const [summary] = await q<S>(
    `SELECT count(*) FILTER (WHERE status = 'open')::int::text AS open_now,
            count(*) FILTER (WHERE ticket_day = $1)::int::text AS created_today,
            count(*) FILTER (WHERE resolved_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Vientiane') AT TIME ZONE 'Asia/Vientiane')::int::text AS resolved_today,
            round(avg(extract(epoch from (resolved_at - created_at)) / 60)
                  FILTER (WHERE resolved_at IS NOT NULL AND created_at > now() - interval '30 days'))::text AS avg_resolve_min,
            round(avg(extract(epoch from (first_reply_at - created_at)) / 60)
                  FILTER (WHERE first_reply_at IS NOT NULL AND created_at > now() - interval '30 days'))::text AS avg_first_reply_min,
            count(*)::int::text AS total
       FROM tickets`,
    [today],
  );
  const perDay = await q<S>(
    `SELECT ticket_day AS day, count(*)::int::text AS created, count(resolved_at)::int::text AS resolved,
            count(*) FILTER (WHERE urgent)::int::text AS urgent
       FROM tickets WHERE created_at > now() - make_interval(days => $1)
      GROUP BY ticket_day ORDER BY min(created_at) DESC`,
    [days],
  );
  const perLabel = await q<S>(
    `SELECT l AS label, count(*)::int::text AS total, count(*) FILTER (WHERE status = 'open')::int::text AS open
       FROM tickets, unnest(labels) AS l
      WHERE created_at > now() - make_interval(days => $1)
      GROUP BY l ORDER BY count(*) DESC`,
    [days],
  );
  const perAgent = await q<S>(
    `SELECT assignee_name AS agent, count(*)::int::text AS total,
            count(*) FILTER (WHERE status = 'open')::int::text AS open,
            count(*) FILTER (WHERE status = 'resolved')::int::text AS resolved
       FROM tickets WHERE created_at > now() - make_interval(days => $1) AND assignee_name <> ''
      GROUP BY assignee_name ORDER BY count(*) DESC`,
    [days],
  );
  const recentTotal = num(summary?.total) ?? 0;
  const recentPages = Math.max(1, Math.ceil(recentTotal / RECENT_PER_PAGE));
  const page = Math.min(Math.max(1, recentPage), recentPages);
  const recent = await q<Record<string, unknown>>(
    `SELECT conversation_id::text AS id, ticket_no, contact_name, department, labels, status, urgent, assignee_name,
            extract(epoch from created_at)::bigint::text AS created,
            extract(epoch from resolved_at)::bigint::text AS resolved
       FROM tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [RECENT_PER_PAGE, (page - 1) * RECENT_PER_PAGE],
  );
  return {
    days,
    summary: {
      openNow: num(summary?.open_now) ?? 0,
      createdToday: num(summary?.created_today) ?? 0,
      resolvedToday: num(summary?.resolved_today) ?? 0,
      avgResolveMin: num(summary?.avg_resolve_min),
      avgFirstReplyMin: num(summary?.avg_first_reply_min),
      total: num(summary?.total) ?? 0,
    },
    perDay: perDay.map((r) => ({
      day: String(r.day),
      created: Number(r.created),
      resolved: Number(r.resolved),
      urgent: Number(r.urgent),
    })),
    perLabel: perLabel.map((r) => ({ label: String(r.label), total: Number(r.total), open: Number(r.open) })),
    perAgent: perAgent.map((r) => ({
      agent: String(r.agent),
      total: Number(r.total),
      open: Number(r.open),
      resolved: Number(r.resolved),
    })),
    recent: recent.map((r) => ({
      id: Number(r.id),
      ticketNo: String(r.ticket_no),
      name: String(r.contact_name ?? ""),
      department: String(r.department ?? ""),
      labels: Array.isArray(r.labels) ? (r.labels as string[]) : [],
      status: String(r.status),
      urgent: r.urgent === true,
      assignee: String(r.assignee_name ?? ""),
      createdAt: Number(r.created) || 0,
      resolvedAt: r.resolved === null || r.resolved === undefined ? null : Number(r.resolved),
    })),
    recentTotal,
    recentPage: page,
    recentPages,
  };
}
