// ตรวจว่า Chatwoot เข้าถึงได้ และ website token ใน .env.local ใช้งานได้ (ไม่พิมพ์ค่า token)
import { existsSync, readFileSync } from "node:fs";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");
loadEnv(".env");

const base = (process.env.CHATWOOT_BASE_URL || "https://chatwoot.aidclaos.com").replace(/\/+$/, "");
const token = process.env.CHATWOOT_WEBSITE_TOKEN || "";
const hmac = process.env.CHATWOOT_HMAC_TOKEN || "";
let failed = false;
const report = (ok, msg) => {
  if (!ok) failed = true;
  console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
};

async function get(path) {
  const r = await fetch(base + path, { signal: AbortSignal.timeout(10000) });
  return r;
}

try {
  const r = await get("/api");
  const j = await r.json();
  report(r.ok, `Chatwoot ${base} version ${j.version}`);
} catch (e) {
  report(false, `Chatwoot ${base} unreachable: ${e.message}`);
}

try {
  const r = await get("/packs/js/sdk.js");
  report(r.ok, `widget SDK /packs/js/sdk.js → ${r.status}`);
} catch (e) {
  report(false, `widget SDK unreachable: ${e.message}`);
}

report(Boolean(token), token ? "CHATWOOT_WEBSITE_TOKEN is set" : "CHATWOOT_WEBSITE_TOKEN is empty (.env.local)");
if (token) {
  try {
    const r = await get(`/widget?website_token=${encodeURIComponent(token)}&locale=en`);
    report(r.ok, `widget page for this token → ${r.status}`);
  } catch (e) {
    report(false, `widget page unreachable: ${e.message}`);
  }
}
console.log(hmac ? "INFO CHATWOOT_HMAC_TOKEN is set (user identity validation enabled)" : "INFO CHATWOOT_HMAC_TOKEN is empty (identity not validated)");

process.exit(failed ? 1 : 0);
