#!/usr/bin/env bash
# smoke test ระบบที่ติดตั้งแล้ว (อ่านอย่างเดียว ไม่ล็อกอิน ไม่สร้างข้อมูล)
# รัน: npm run test:deployed            → เซิร์ฟเวอร์ภายใน http://10.0.100.54:3400
#      E2E_DEPLOYED_URL=https://aidc-chat.vercel.app npm run test:deployed
set -euo pipefail
cd "$(dirname "$0")/../.."
export E2E_DEPLOYED_URL="${E2E_DEPLOYED_URL:-http://10.0.100.54:3400}"
npx jest --config cotester/jest/e2e.config.ts deployed
