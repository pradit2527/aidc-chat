import { adminRoute } from "@/lib/adminApi";
import { dbEnabled } from "@/lib/db";
import { listReports, REPORT_STATUSES, reportSummary, type ReportStatus } from "@/lib/reports";

export const dynamic = "force-dynamic";

/** รายการงานแจ้งปัญหาสำหรับคอนโซลไอที: ?status=new|in_progress|done|all (ค่าเริ่มต้น new), ?summary=1 = เฉพาะจำนวน */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("status") ?? "new";
  const status: ReportStatus | "all" = raw === "all" || (REPORT_STATUSES as string[]).includes(raw) ? (raw as ReportStatus | "all") : "new";
  const summaryOnly = url.searchParams.get("summary") === "1";
  return adminRoute(req, async () => {
    if (!dbEnabled) return { enabled: false, status, summary: { new: 0, inProgress: 0, done: 0 }, reports: [] };
    const summary = await reportSummary();
    if (summaryOnly) return { enabled: true, summary };
    return { enabled: true, status, summary, reports: await listReports(status) };
  });
}
