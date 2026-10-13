// Chatwoot จำลองสำหรับทดสอบคอนโซลไอที (เฉพาะเครื่องนี้ พอร์ต 4000) — ข้อมูลทั้งหมดเป็นของปลอม
import { createServer } from "node:http";

const TEST_EMAIL = "it.test@example.invalid";
const TEST_PASSWORD = "mock-only-password";
const TOKEN = { "access-token": "mock-token", client: "mock-client", uid: TEST_EMAIL };
const ME = { id: 1, name: "Pradit Ratthanoo" };
const t0 = Math.floor(Date.now() / 1000);
const ago = (m) => t0 - m * 60;

const sender = (id, name, description) => ({
  id, name, additional_attributes: { description, company_name: "COSI Hotel" }, custom_attributes: {},
});
const msg = (id, convId, type, content, at, extra = {}) => ({
  id, conversation_id: convId, message_type: type, content, created_at: at, private: false,
  sender: type === 0 ? { name: "" } : { name: ME.name, type: "user" }, attachments: [], ...extra,
});

const store = {
  20: { c: { id: 20, status: "open", labels: ["cosi-network"], sender: sender(120, "นาง นานา มารีน่า", "Front Office · 0201112222"),
    unread_count: 1, agent_last_seen_at: 0, ts: ago(7) },
    m: [msg(2001, 20, 1, "สะบายดี ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ", ago(8)), msg(2002, 20, 0, "😁", ago(7))] },
  19: { c: { id: 19, status: "open", labels: ["cosi-computer", "cosi-other", "cosi-urgent"],
    sender: sender(119, "Lao Development Bank", "รักษาความปลอดภัย · 0205577441"), unread_count: 0, agent_last_seen_at: ago(5), ts: ago(15) },
    m: [msg(1901, 19, 0, "", ago(20), { attachments: [{ id: 1, file_type: "image", data_url: "http://localhost:4000/img.png", thumb_url: "http://localhost:4000/img.png" }] }),
        msg(1902, 19, 0, "ສອບຖາມ", ago(16)), msg(1903, 19, 0, "ແນ", ago(15))] },
  18: { c: { id: 18, status: "open", labels: ["cosi-computer", "cosi-phone"], sender: sender(118, "Khamsavath Xayyaseng", ""),
    unread_count: 0, agent_last_seen_at: ago(40), ts: ago(78) },
    m: [msg(1801, 18, 0, "7ue7mu7imo6", ago(78))] },
  16: { c: { id: 16, status: "open", labels: ["cosi-account", "cosi-cctv", "cosi-pms"], sender: sender(116, "Pradit Ratthanoo", "Management"),
    unread_count: 0, agent_last_seen_at: ago(60), ts: ago(61) },
    m: [msg(1601, 16, 0, "มีโพสต์ผู้เปลี่ยนที่ระบบ", ago(100)), msg(1602, 16, 1, "บันทึกภายใน — ลองเรียกตามนี้ก่อน", ago(61), { private: true })] },
  15: { c: { id: 15, status: "open", labels: ["cosi-cctv", "cosi-computer", "cosi-network"], sender: sender(115, "Test Staff", "Front Office · 101"),
    unread_count: 0, agent_last_seen_at: ago(120), ts: ago(125) },
    m: [msg(1501, 15, 0, "ระบบคิดเงินไม่ได้", ago(125))] },
};
const custom = { 16: { closed_topics: "cosi-account" } };
store[15].c.status = "resolved";
const assignee = {};
for (const id of Object.keys(store)) assignee[id] = ME;

const labels = [
  ["cosi-account", "#8264DE"], ["cosi-cctv", "#17B582"], ["cosi-computer", "#D2117C"], ["cosi-network", "#AC7F10"],
  ["cosi-other", "#E84795"], ["cosi-phone", "#292BBB"], ["cosi-pms", "#BDACAC"], ["cosi-urgent", "#413F2D"], ["support", "#E3138E"],
].map(([title, color], i) => ({ id: i + 1, title, description: "", color, show_on_sidebar: true }));

const raw = (id) => {
  const { c, m } = store[id];
  const visible = m.filter((x) => x.message_type !== 2);
  const last = visible[visible.length - 1];
  return {
    id, account_id: 1, inbox_id: 5, status: c.status, unread_count: c.unread_count, agent_last_seen_at: c.agent_last_seen_at,
    contact_last_seen_at: c.ts, timestamp: c.ts, created_at: c.ts - 600, labels: c.labels, priority: null,
    custom_attributes: custom[id] ?? {}, additional_attributes: {},
    meta: { sender: c.sender, assignee: assignee[id] ?? null, channel: "Channel::WebWidget" },
    messages: [last], last_non_activity_message: last,
  };
};

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { "content-type": "application/json", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
};
const readBody = (req) => new Promise((r) => { let s = ""; req.on("data", (d) => (s += d)); req.on("end", () => { try { r(JSON.parse(s || "{}")); } catch { r({}); } }); });

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:4000");
  const p = url.pathname;
  const body = req.method === "POST" ? await readBody(req) : {};
  console.log(req.method, p + url.search);

  if (p === "/img.png") {
    res.writeHead(200, { "content-type": "image/png" });
    return res.end(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
  }
  if (p === "/api") return send(res, 200, { version: "4.17.1-mock", queue_services: "ok", data_services: "ok" });
  if (p === "/auth/sign_in") {
    if (body.email === TEST_EMAIL && body.password === TEST_PASSWORD) {
      return send(res, 200, { data: { id: 1, name: ME.name, email: TEST_EMAIL, accounts: [{ id: 1, name: "AIDC-TECH" }] } }, TOKEN);
    }
    return send(res, 401, { errors: ["Invalid login credentials"] });
  }
  if (p === "/auth/sign_out") return send(res, 200, { success: true });
  if (!p.startsWith("/api/v1/")) return send(res, 404, {});
  const okSession = req.headers["access-token"] === TOKEN["access-token"] && req.headers.uid === TEST_EMAIL;
  const okService = req.headers.api_access_token === "mock-service-token";
  if (!okSession && !okService) return send(res, 401, { errors: ["unauthorized"] });

  if (p === "/api/v1/profile") {
    return send(res, 200, { id: 1, name: ME.name, email: TEST_EMAIL, access_token: "mock-service-token", accounts: [{ id: 1, name: "AIDC-TECH" }] });
  }
  const base = "/api/v1/accounts/1";
  let m;
  if (p === `${base}/conversations/meta`) {
    const st = url.searchParams.get("status") ?? "open";
    const lab = url.searchParams.getAll("labels[]");
    const n = Object.keys(store).filter((id) => (st === "all" || store[id].c.status === st) && lab.every((l) => store[id].c.labels.includes(l))).length;
    return send(res, 200, { meta: { mine_count: n, assigned_count: n, unassigned_count: 0, all_count: n } });
  }
  if (p === `${base}/conversations`) {
    const st = url.searchParams.get("status") ?? "open";
    const lab = url.searchParams.getAll("labels[]");
    const ids = Object.keys(store).map(Number).sort((a, b) => store[b].c.ts - store[a].c.ts)
      .filter((id) => (st === "all" || store[id].c.status === st) && lab.every((l) => store[id].c.labels.includes(l)));
    return send(res, 200, { data: { meta: { mine_count: ids.length, unassigned_count: 0, assigned_count: ids.length, all_count: ids.length }, payload: ids.map(raw) } });
  }
  if (p === `${base}/contacts/search`) {
    return send(res, 200, { payload: [{ id: 900, name: "Test Staff", identifier: url.searchParams.get("q") ?? "" }] });
  }
  if (p === `${base}/contacts/900/conversations`) return send(res, 200, { payload: [20, 19, 16, 15].map(raw) });
  if (p === `${base}/labels`) return send(res, 200, { payload: labels });
  if (p === `${base}/canned_responses`) return send(res, 200, [{ id: 1, short_code: "ack", content: "รับเรื่องแล้ว กำลังตรวจสอบ" }]);
  if (p === `${base}/agents`) return send(res, 200, [{ id: 1, name: ME.name, role: "administrator" }, { id: 2, name: "Decha", role: "agent" }]);
  if (p === `${base}/inboxes/5`) return send(res, 200, { id: 5, name: "COSI Hotel Support", channel_type: "Channel::WebWidget" });
  if ((m = p.match(new RegExp(`^${base}/conversations/(\\d+)(?:/(\\w+))?$`)))) {
    const id = Number(m[1]);
    if (!store[id]) return send(res, 404, {});
    const act = m[2];
    if (!act) return send(res, 200, raw(id));
    if (act === "messages" && req.method === "GET") return send(res, 200, { meta: {}, payload: store[id].m });
    if (act === "messages") {
      const n = { ...msg(id * 100 + store[id].m.length + 50, id, 1, body.content, Math.floor(Date.now() / 1000), { private: body.private === true }) };
      store[id].m.push(n);
      return send(res, 200, n);
    }
    if (act === "toggle_status") { store[id].c.status = body.status; return send(res, 200, { payload: { success: true, current_status: body.status } }); }
    if (act === "update_last_seen") { store[id].c.unread_count = 0; store[id].c.agent_last_seen_at = Math.floor(Date.now() / 1000); return send(res, 200); }
    if (act === "assignments") { assignee[id] = body.assignee_id === 1 ? ME : body.assignee_id === 2 ? { id: 2, name: "Decha" } : null; return send(res, 200, assignee[id] ?? {}); }
    if (act === "custom_attributes") { custom[id] = { ...(custom[id] ?? {}), ...(body.custom_attributes ?? {}) }; return send(res, 200, { custom_attributes: custom[id] }); }
  }
  return send(res, 404, { error: "mock: not implemented", path: p });
}).listen(4000, () => console.log("mock chatwoot on :4000"));
