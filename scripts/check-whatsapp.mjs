// ตรวจว่าไลบรารี Baileys + เครือข่ายเครื่องนี้ไปถึง WhatsApp ได้ (ขอ QR แล้วออก — ไม่สแกน)
// (ตั้งชื่อใหม่ให้ useMultiFileAuthState เพราะ eslint เข้าใจผิดว่าเป็น React hook)
import makeWASocket, { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState as multiFileAuthState } from "baileys";
import pino from "pino";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "wa-probe-"));
const logger = pino({ level: "silent" });
const t0 = Date.now();
try {
  const { state, saveCreds } = await multiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();
  console.log("wa version", version.join("."), `(${Date.now() - t0}ms)`);
  const sock = makeWASocket({
    version,
    logger,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    browser: ["COSI Helpdesk", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });
  sock.ev.on("creds.update", saveCreds);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout 40s — no QR")), 40_000);
    sock.ev.on("connection.update", (u) => {
      if (u.qr) {
        console.log("QR received:", u.qr.length, "chars", `(${Date.now() - t0}ms)`);
        clearTimeout(timer);
        resolve();
      }
      if (u.connection === "close") {
        clearTimeout(timer);
        reject(new Error("closed: " + (u.lastDisconnect?.error?.output?.statusCode ?? u.lastDisconnect?.error?.message)));
      }
    });
  });
  await sock.end(undefined);
  console.log("ok");
} finally {
  rmSync(dir, { recursive: true, force: true });
  setTimeout(() => process.exit(0), 500);
}
