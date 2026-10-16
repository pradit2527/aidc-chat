#!/usr/bin/env bash
# Deploy ไปยังเซิร์ฟเวอร์ภายใน (Docker compose) — รันจากเครื่องพัฒนา: npm run deploy:server
# ต้องมีกุญแจ SSH ของเครื่องนี้อยู่บนเซิร์ฟเวอร์แล้ว และมีไฟล์ .env.production ในโฟลเดอร์ปลายทาง (ดู README)
set -euo pipefail
HOST="${DEPLOY_HOST:-itsupport@10.0.100.54}"
DIR="${DEPLOY_DIR:-apps/aidc-chat}"
PORT="${DEPLOY_PORT:-3400}"
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "! มีไฟล์ที่ยังไม่ commit — deploy ใช้เฉพาะ commit ล่าสุด (HEAD)"
fi
ssh -o BatchMode=yes "$HOST" "test -f $DIR/.env.production" \
  || { echo "x ไม่พบ $DIR/.env.production บนเซิร์ฟเวอร์ — สร้างก่อน (README → Deploy บนเซิร์ฟเวอร์ภายใน)"; exit 1; }

echo "-> ส่งโค้ด (git archive HEAD) ไป $HOST:$DIR"
# ล้างโฟลเดอร์ซอร์สที่ git ติดตามก่อนแตกไฟล์ — ไม่งั้นไฟล์ที่ถูกลบ/ย้ายใน git จะค้างบนเซิร์ฟเวอร์แล้ว build พัง
# (ไม่แตะ .env.production และ data/ ซึ่งเป็นข้อมูลของเซิร์ฟเวอร์)
TRACKED_DIRS="$(git ls-files | grep / | cut -d/ -f1 | sort -u | tr '\n' ' ')"
git archive --format=tar HEAD | ssh -o BatchMode=yes "$HOST" "mkdir -p $DIR && cd $DIR && rm -rf $TRACKED_DIRS && tar -xf -"

echo "-> build image + restart container"
ssh -o BatchMode=yes "$HOST" "cd $DIR && docker compose up -d --build --remove-orphans && docker compose ps"

echo "ok: http://${HOST#*@}:$PORT"
