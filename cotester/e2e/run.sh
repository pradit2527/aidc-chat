#!/usr/bin/env bash
# e2e: Chatwoot จำลอง (:4000) + Next dev (:3401) + ฐานข้อมูลทดสอบ aidc_chat_test บน Neon (แยกจากฐานจริง) → jest e2e
# รัน: npm run test:e2e   (ส่ง argument ต่อให้ jest ได้ เช่น npm run test:e2e -- admin)
set -euo pipefail
cd "$(dirname "$0")/../.."

PORT="${E2E_PORT:-3401}"
MOCK_PORT=4000
LOG_DIR=cotester/e2e

# ฐานทดสอบ: ใช้ host/credential เดิมจาก .env.local แต่เปลี่ยนชื่อฐานเป็น aidc_chat_test — ห้ามตรงกับฐานจริง
PROD_URL="$(grep -E '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '\r')"
TEST_DB_URL="${E2E_DATABASE_URL:-$(printf '%s' "$PROD_URL" | sed 's#/neondb?#/aidc_chat_test?#')}"
if [ -z "$TEST_DB_URL" ] || [ "$TEST_DB_URL" = "$PROD_URL" ]; then
  echo "x ไม่ยอมรัน: URL ฐานทดสอบว่างหรือตรงกับฐานจริง (ตั้ง E2E_DATABASE_URL ให้ชี้ฐานทดสอบ)"; exit 1
fi
echo "-> ฐานทดสอบ: $(node -e "console.log(new URL(process.argv[1]).pathname)" "$TEST_DB_URL")"
DATABASE_URL="$TEST_DB_URL" node scripts/db-migrate.mjs

kill_port() { # Windows (Git Bash) / Linux
  if command -v netstat >/dev/null && netstat -ano 2>/dev/null | grep -qE ":$1 .*LISTENING"; then
    for pid in $(netstat -ano | grep -E ":$1 .*LISTENING" | awk '{print $NF}' | sort -u); do taskkill //F //PID "$pid" >/dev/null 2>&1 || true; done
  else
    fuser -k "$1/tcp" >/dev/null 2>&1 || true
  fi
}
cleanup() { echo "-> ปิดเซิร์ฟเวอร์ทดสอบ"; kill_port "$PORT"; kill_port "$MOCK_PORT"; kill "${MOCK:-}" "${NEXT:-}" 2>/dev/null || true; rm -rf "$LOG_DIR/.uploads"; }
trap cleanup EXIT

kill_port "$PORT"; kill_port "$MOCK_PORT"
node cotester/e2e/mock-chatwoot.mjs > "$LOG_DIR/.mock.log" 2>&1 & MOCK=$!
UPLOAD_DIR="$PWD/$LOG_DIR/.uploads" CHATWOOT_BASE_URL="http://127.0.0.1:$MOCK_PORT" DATABASE_URL="$TEST_DB_URL" SESSION_SECRET="e2e-session-secret-0123456789" \
  npx next dev -H 127.0.0.1 -p "$PORT" > "$LOG_DIR/.next.log" 2>&1 & NEXT=$!

echo "-> รอเซิร์ฟเวอร์ที่ :$PORT"
for i in $(seq 1 90); do
  curl -s -m 2 -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/api/health" | grep -q 200 && break
  sleep 1
done
curl -s -m 10 "http://127.0.0.1:$PORT/api/health" | grep -q '"reachable":true' || { echo "x เซิร์ฟเวอร์ไม่พร้อม"; tail -20 "$LOG_DIR/.next.log"; exit 1; }

# --runInBand: ไฟล์ e2e ใช้เซิร์ฟเวอร์/ข้อมูลจำลองชุดเดียวกัน ต้องรันทีละไฟล์
E2E_BASE_URL="http://127.0.0.1:$PORT" E2E_DATABASE_URL="$TEST_DB_URL" npx jest --config cotester/jest/e2e.config.ts --runInBand "$@"
