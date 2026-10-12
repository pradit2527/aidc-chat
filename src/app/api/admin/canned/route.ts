import { adminRoute } from "@/lib/adminApi";
import { acct, cw, payloadArray, toAgent, toCanned } from "@/lib/cw";

export const dynamic = "force-dynamic";

/** คำตอบด่วน (canned responses) + รายชื่อ agent สำหรับมอบหมายงาน */
export async function GET(req: Request) {
  return adminRoute(req, async (s) => {
    const [canned, agents] = await Promise.all([
      cw<unknown>(s, acct("/canned_responses")).catch(() => []),
      cw<unknown>(s, acct("/agents")).catch(() => []),
    ]);
    return {
      canned: payloadArray(canned).map(toCanned).filter((c) => c.content),
      agents: payloadArray(agents).map(toAgent).filter((a) => a.id && a.name),
    };
  });
}
