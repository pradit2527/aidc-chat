# COSI Support

ระบบแชทซัพพอร์ตไอทีของโรงแรม COSI

- **ฝั่งไอที** — ใช้ dashboard ของ Chatwoot (`https://chatwoot.aidclaos.com`) รับเรื่อง มอบหมาย ติด label ปิดเคส
- **ฝั่งพนักงานโรงแรม** — พอร์ทัลเว็บนี้ (ลาว/อังกฤษ) กรอกชื่อ + แผนก เลือกหัวข้อปัญหา แล้วแชทกับทีมไอทีผ่าน Chatwoot widget

```
พนักงานโรงแรม ──► พอร์ทัล (Next.js :3400) ──widget──► Chatwoot ◄── ทีมไอที (dashboard)
                        │ /api/identify (HMAC)
```

## หน้าที่มี

| เส้นทาง | สำหรับ | หน้าที่ |
|---|---|---|
| `/` | ทุกคน | **หน้าแรก = โปสเตอร์ QR** ชี้ไป `/login` (+ ลิงก์ไปหน้าพนักงาน/ทีมไอที) · เปิดเครื่องมือพิมพ์/ดาวน์โหลดด้วย `/?tools=1` |
| `/login` | พนักงานโรงแรม | **ปลายทางของ QR**: ล็อกอินด้วย username + รหัสผ่าน → ไป `/start` (ล็อกอินค้างอยู่แล้วข้ามไป `/start` เอง; ถ้าเปิดหน้าที่ต้องล็อกอินก่อน จะกลับไปหน้านั้นหลังล็อกอิน `?next=`) · ไม่มีปุ่มลงทะเบียนเอง — บัญชีสร้างโดยทีมไอทีที่ `/admin/users` · ทีมไอทีเข้า `/admin` ตรง ๆ ด้วยบัญชี Chatwoot (ไม่เกี่ยวกับหน้านี้) |
| `/admin/users` | ทีมไอที | **จัดการผู้ใช้งาน** 2 แท็บ: **พนักงาน** (แอดมินสร้างบัญชี: username a-z 0-9 . _ - อย่างน้อย 3 + รหัสผ่าน ≥ 6 + ชื่อ + แผนก + เบอร์ต่อ) และ **แอดมิน** (บัญชี username/password เก็บในระบบเอง role admin) — แก้ไขข้อมูล, รีเซ็ตรหัสผ่าน, ลบ (คนที่ล็อกอินค้างอยู่หลุดทันที; ลบบัญชีตัวเองไม่ได้) · API `/api/admin/users` · เมนูอยู่ที่หน้าหลักแอดมินและแถบหัวทุกหน้า |
| แอดมินบัญชีในระบบเอง | ทีมไอที | ล็อกอินที่ `/admin` โดยพิมพ์ **username** (ไม่มี `@`) แทนอีเมล Chatwoot → ใช้ได้: งานแจ้งปัญหา, ผู้ใช้งาน, สถิติ · **ใช้คอนโซลแชทไม่ได้** (ไม่มี token Chatwoot — เมนูแชทถูกปิด, `/admin/chat` เด้งกลับ, API แชทตอบ 403) ต้องใช้บัญชี Chatwoot (มี `@`) |
| `/start` | พนักงานโรงแรม | **หน้าหลักหลังล็อกอิน** (แสดงชื่อ/แผนกจากบัญชี + ปุ่มออกจากระบบ): เลือก 1. ระบบแชท → `/chat` หรือ 2. แจ้งปัญหา → `/report` + "ລາຍງານຂອງຂ້ອຍ" (รายงานของ identifier เดียวกัน พร้อมสถานะ ผู้รับเรื่อง จำนวนข้อ หน้าละ 12 ผ่าน `GET /api/reports/mine`) |
| `/report` | พนักงานโรงแรม | **แจ้งปัญหาแบบรายการ** (ไม่ผ่านแชท): กรอกชื่อ/แผนก (ชุดเดียวกับแชท) → เลือกหัวข้อ 7 หมวด → เพิ่มปัญหาเป็นข้อ ๆ ในแต่ละหัวข้อ → ส่งหาไอที ได้เลขตั๋วชุดเดียวกับเคสแชท |
| `/api/reports/upload`, `/api/reports/files/<id>` | — | แนบรูป/วิดีโอกับรายงาน (สูงสุด 5 ไฟล์ รูป ≤ 10 MB ย่อในเบราว์เซอร์ก่อน, วิดีโอ ≤ 50 MB) เก็บบนดิสก์ `UPLOAD_DIR` (ค่าเริ่มต้น `./data/uploads`, compose mount `./data`) — บน Vercel ปิดอัตโนมัติ; ดูได้เฉพาะไอทีที่ล็อกอินหรือเจ้าของรายงาน |
| `/report/<เลขตั๋ว>` | พนักงานโรงแรม | ติดตามสถานะรายงาน (รอรับงาน → กำลังทำ → สำเร็จ, ติ๊กรายข้อ) — เปิดได้เฉพาะเครื่องที่ส่ง (identifier ใน localStorage) |
| `/admin/reports` | ทีมไอที | **มอนิเตอร์งานแจ้งปัญหา**: แท็บ ใหม่/กำลังทำ/สำเร็จ, รับงาน, ติ๊กข้อที่แก้แล้ว (ครบทุกข้อ → ปิดอัตโนมัติ), ปิดงาน/เปิดใหม่, มอบหมาย, บันทึกภายใน; ปุ่ม ງານແຈ້ງ ที่หัวคอนโซลแชทมีตัวเลขงานใหม่ |
| `/chat` | พนักงานโรงแรม | แจ้งปัญหา (ต้องล็อกอิน; ชื่อ/แผนกมาจากบัญชี) → เลือกหัวข้อ → แชทกับไอที (ฝัง Chatwoot widget); เมื่อไอทีปิดเคส จะมีข้อความแจ้งพร้อมเลข Ticket ในแชท |
| `/admin` | ทีมไอที | **หน้าหลักทีมไอที** (หลังล็อกอินด้วยบัญชี Chatwoot): เลือก 1. ระบบแชท → `/admin/chat` 2. แจ้งปัญหา → `/admin/reports` + สรุปแชทที่ยังเปิด (รอตอบขึ้นก่อน) และงานแจ้งที่ยังไม่สำเร็จ กดรายการแล้วเปิดเคส/งานนั้นทันที (`?c=` / `?r=`) |
| `/admin/chat` | ทีมไอที | **คอนโซลตอบแชท** ไม่ต้องเข้า Chatwoot: ล็อกอินด้วยบัญชี Chatwoot, ดูรายการแจ้งปัญหา, กรองตามป้ายกำกับ (มีจำนวนงาน + ตัวเลขแดงแจ้งเตือน), ตอบ/บันทึกภายใน/มอบหมาย/ปิดเคส |
| `/admin/stats` | ทีมไอที | **สถิติ Ticket** จากทะเบียนใน Neon: เปิดอยู่/แจ้งวันนี้/ปิดวันนี้, เวลาปิดเคสและเวลาตอบครั้งแรกเฉลี่ย, รายวัน, ตามป้ายกำกับ, ตามเจ้าหน้าที่, Ticket ล่าสุดแบบการ์ด/ตาราง หน้าละ 12 (เลือกช่วง `?days=7|14|30|90`; ต้องล็อกอินคอนโซลก่อน) |
| `/qr` | — | ลิงก์เดิม เด้งไปหน้าแรก `/` |
| `/admin?demo=1` | ตอนพัฒนา | โหมดตัวอย่างของคอนโซล (ข้อมูลปลอม ไม่เรียก Chatwoot ปิดอัตโนมัติใน production) |

รองรับคอมพิวเตอร์ แท็บเล็ต และมือถือ (คอนโซล: มือถือ 1 หน้าจอสลับรายการ/แชท, แท็บเล็ต 2 คอลัมน์, คอมพิวเตอร์ 3 คอลัมน์)

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env.local     # ใส่ CHATWOOT_WEBSITE_TOKEN (และ CHATWOOT_HMAC_TOKEN)
npm run dev                    # http://localhost:3400  (/ = QR, /chat = พนักงาน, /admin = ไอที)
npm run check:chatwoot         # ตรวจการเชื่อมต่อ Chatwoot
```

การตั้งค่าฝั่ง Chatwoot (inbox, ทีม, label, token) ดูที่ [docs/chatwoot-setup.md](docs/chatwoot-setup.md)

## ข้อมูลถูกเก็บที่ไหน

**เนื้อหาแชททั้งหมดอยู่ที่ Chatwoot ที่เดียว** ส่วน Neon Postgres (ถ้าตั้ง `DATABASE_URL`) เก็บเฉพาะ **ทะเบียน Ticket + ประวัติเหตุการณ์ + สถิติ** — ไม่เก็บข้อความแชท

| ที่เก็บ | เก็บอะไร | หมายเหตุ |
|---|---|---|
| **Chatwoot** (`chatwoot.aidclaos.com`) | แชท ข้อความ ไฟล์แนบ ผู้ติดต่อ (ชื่อ แผนก เบอร์ต่อ) ป้ายกำกับ ผู้รับผิดชอบ สถานะ และ "หัวข้อที่ปิดแล้ว" (`closed_topics`) | แหล่งข้อมูลจริงเพียงแห่งเดียว (Postgres/ไฟล์แนบอยู่บนเซิร์ฟเวอร์ Chatwoot) |
| **ดิสก์เซิร์ฟเวอร์ภายใน** `~/apps/aidc-chat/data/uploads` | ไฟล์แนบของงานแจ้งปัญหา (รูป/วิดีโอ) — ข้อมูลไฟล์อยู่ตาราง `report_files` | อยู่นอกคอนเทนเนอร์ (bind mount) ไม่หายตอน build ใหม่; สำรองโฟลเดอร์นี้ด้วยถ้าย้ายเครื่อง |
| **Neon Postgres** (`neondb`, ภูมิภาค ap-southeast-1 สิงคโปร์, ไม่บังคับ) | งานแจ้งปัญหาแบบรายการ: `reports` (ผู้แจ้ง, สถานะ, ผู้รับผิดชอบ, บันทึกภายใน), `report_items` (ข้อย่อย + ติ๊กแล้ว/โดยใคร), `report_events`; ตาราง `tickets` (เลขตั๋วถาวร, ชื่อ/แผนก, ป้ายกำกับ, หัวข้อที่ปิด, ด่วน, สถานะ, ผู้รับผิดชอบ, เวลาสร้าง/ตอบครั้งแรก/ปิด), `ticket_counters` (ตัวนับเลขต่อวัน), `ticket_events` (created, greeted, replied, note, topic_closed, assigned, resolved, reopened) | ลงทะเบียนอัตโนมัติเมื่อคอนโซลโหลดรายการเคส; ถ้าไม่ตั้งค่า ระบบคำนวณเลขตั๋วจาก Chatwoot แทน (ไม่ถาวร) และไม่มีหน้า `/admin/stats` |
| **บัญชีพนักงาน** (สร้างที่ `/admin/users`) | username, รหัสผ่านที่ hash ด้วย scrypt (ไม่เก็บรหัสจริง), ชื่อ, แผนก, เบอร์ต่อ | ถ้าตั้ง `DATABASE_URL` เก็บตาราง `app_users` ใน Neon (สร้างอัตโนมัติ/`npm run db:migrate`); ไม่ตั้ง → ไฟล์ `data/users.json` (`USERS_FILE`, สิทธิ์ 600, อยู่นอก git) — **บน Vercel ต้องมี `DATABASE_URL`** เพราะดิสก์เขียนไม่ได้ · เซสชันเป็นคุกกี้ `cosi_user` (httpOnly, เข้ารหัส, 30 วัน) |
| **เบราว์เซอร์ของพนักงาน** | `localStorage`: ชื่อ/แผนก/เบอร์ต่อ + identifier ที่ใช้ระบุตัว; คุกกี้ `lang` | อยู่เฉพาะเครื่องนั้น ปุ่ม "ปรับผู้ใช้" ล้างให้ |
| **เบราว์เซอร์ของทีมไอที** | คุกกี้ `cosi_admin` (httpOnly, เข้ารหัส AES-256-GCM, อายุ 12 ชม.) เก็บ token ของ Chatwoot ของผู้ล็อกอิน; `localStorage`: เปิด/ปิดเสียง | ไม่เก็บรหัสผ่าน; ออกจากระบบแล้วคุกกี้ถูกลบ |
| **ไฟล์ `.env.local` บนเซิร์ฟเวอร์ของเรา** | ความลับของระบบ: website token, HMAC token, `SESSION_SECRET`, `DATABASE_URL` | อยู่นอก git (`.gitignore`) |
| **หน่วยความจำของเซิร์ฟเวอร์ (ชั่วคราว)** | ตัวนับจำกัดจำนวนครั้งล็อกอิน/เรียก, แคชจำนวนงานต่อป้าย 6 วินาที | หายเมื่อรีสตาร์ท ไม่มีข้อมูลงาน |

- ล็อกของเซิร์ฟเวอร์เก็บเฉพาะบรรทัดคำขอ (path/สถานะ) และข้อความ error ไม่มีเนื้อหาแชทและไม่มี token
- ไม่มี analytics หรือบริการภายนอกอื่นนอกจาก Chatwoot และ Neon (ฟอนต์ถูกโหลดมาเก็บกับตัวแอปตอน build)

### ตั้งค่า Neon (ทะเบียน Ticket + สถิติ)

1. Neon → Project → Branch → **Connect** → เลือก **Pooled connection** → คัดลอก connection string
2. ใส่ใน `.env.local` เป็น `DATABASE_URL=postgresql://...` (ไฟล์นี้อยู่นอก git)
3. สร้างตาราง: `npm run db:migrate` (รันซ้ำได้ ไม่ลบข้อมูล — ใช้ `db/schema.sql`)
4. เปิดคอนโซล `/admin` หนึ่งครั้ง เคสที่เห็นจะถูกลงทะเบียนและได้เลขตั๋วถาวรทันที แล้วดูที่ปุ่ม **ສະຖິຕິ** หรือ `/admin/stats`

เลขตั๋ว `Ticket<วว-ดด-ปปปป>-<ลำดับ>` ออกตามลำดับเวลาสร้างเคสในวันนั้น (เวลาลาว UTC+7) ด้วย advisory lock ต่อวัน จึงไม่ซ้ำแม้คอนโซลหลายเครื่องโหลดพร้อมกัน

## Deploy บน Vercel

โค้ดขึ้น Vercel ได้ทันทีจาก GitHub แต่ **ค่าลับใน `.env.local` ไม่ได้อยู่ใน git** จึงต้องตั้งเองที่ Vercel ไม่เช่นนั้น
หน้าแชท (ต้องมี `CHATWOOT_WEBSITE_TOKEN`) และหน้าแอดมิน (ต้องมี `SESSION_SECRET`) จะขึ้นข้อความว่ายังไม่ได้ตั้งค่า

1. รัน `node scripts/make-env-vercel.mjs` (หรือใช้ไฟล์ `.env.vercel` ที่สร้างไว้แล้ว — git ignore) ได้ค่าทั้งหมดพร้อมวาง
2. Vercel → Project → **Settings → Environment Variables** → วางทั้งไฟล์ลงช่อง (รองรับหลายบรรทัด) → เลือก Production (+ Preview) → Save
3. **Deployments → Redeploy** (ค่าตัวแปรมีผลกับ deployment ใหม่เท่านั้น)

| ตัวแปร | ค่า |
|---|---|
| `CHATWOOT_BASE_URL` | `https://chatwoot.aidclaos.com` |
| `CHATWOOT_WEBSITE_TOKEN` | token ของ inbox COSI Hotel Support (ค่าสาธารณะ) |
| `CHATWOOT_HMAC_TOKEN` | HMAC ของ inbox (ลับ) |
| `SESSION_SECRET` | สุ่มใหม่สำหรับ production (ลับ) — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CHATWOOT_ACCOUNT_ID` / `CHATWOOT_INBOX_ID` | `1` / `5` |
| `PORTAL_PUBLIC_URL` | `https://aidc-chat.vercel.app` (ใช้สร้าง QR) |
| `DATABASE_URL` | connection string แบบ pooled ของ Neon (ลับ) — ไม่ใส่ก็ได้ แต่จะไม่มีทะเบียน Ticket/สถิติ |

**ต่อ Vercel กับ Neon (ทำแล้ว):** ใช้ Vercel → Project → **Storage → Connect Database → Neon** (integration) — Vercel ใส่ตัวแปร
`DATABASE_URL`, `POSTGRES_URL`, `PGHOST` ฯลฯ ให้เองทุก environment (ระบบนี้อ่านเฉพาะ `DATABASE_URL` ตัวเดียว) จากนั้น **Redeploy** หนึ่งครั้ง
ถ้าไม่ใช้ integration ให้ใส่ `DATABASE_URL` เองตามข้อ 2 · ตารางสร้างจากเครื่องเราด้วย `npm run db:migrate` หนึ่งครั้ง (ตารางอยู่ที่ Neon
ไม่ผูกกับเครื่องที่รัน) · ใช้ `@neondatabase/serverless` ซึ่งต่อผ่าน WebSocket จึงเหมาะกับ serverless · แนะนำตั้ง **Settings → Functions →
Function Region = Singapore (sin1)** ให้ฟังก์ชันอยู่ใกล้ฐานข้อมูล (ap-southeast-1) และผู้ใช้ในลาว

หมายเหตุสำหรับ serverless: งานเบื้องหลัง (ทักทายอัตโนมัติ) ใช้ `after()` ของ Next จึงทำงานบน Vercel ได้; แคชในหน่วยความจำ
(จำนวนงานต่อป้าย, เลขตั๋ว, ตัวนับจำกัดล็อกอิน) เป็นรายอินสแตนซ์ ใช้งานได้แต่ไม่แชร์กัน; ถ้า Chatwoot ตอบช้า route `labels`
อาจใกล้เพดาน 10 วินาทีของแผนฟรี  เมื่อใช้โดเมนจริงแล้ว แนะนำใส่โดเมนใน Chatwoot → inbox → Allowed Domains

## Deploy บนเซิร์ฟเวอร์ภายใน (Docker)

ใช้งานจริงในออฟฟิศที่ `http://10.0.100.54:3400` (เซิร์ฟเวอร์ Ubuntu, ผู้ใช้ `itsupport`, โฟลเดอร์ `~/apps/aidc-chat`) เพราะเครือข่ายออฟฟิศ
บล็อกโดเมน `*.vercel.app` ตามชื่อโดเมน (TLS ไปถึงแต่ถูกตัด, `vercel.com` เปิดได้) บางเครื่องจึงเข้า Vercel ไม่ได้
พอร์ต 3400 ไม่ชนกับโปรเจกต์อื่นบนเครื่องนั้น (web-portal 3009, trion-lidar 8080)

1. ครั้งแรก: ใส่กุญแจ SSH ของเครื่องพัฒนาไว้บนเซิร์ฟเวอร์ และสร้าง `~/apps/aidc-chat/.env.production` (คีย์เดียวกับ `.env.example`
   แต่ `PORTAL_PUBLIC_URL=http://10.0.100.54:3400` และ `SESSION_SECRET` สุ่มใหม่) — ไฟล์นี้อยู่บนเซิร์ฟเวอร์เท่านั้น
2. ทุกครั้งที่จะอัปเดต: commit แล้วรัน `npm run deploy:server` — ส่งโค้ดจาก `git archive HEAD` ผ่าน SSH แล้ว `docker compose up -d --build`
3. ดูสถานะ/ล็อกบนเซิร์ฟเวอร์: `cd ~/apps/aidc-chat && docker compose ps && docker compose logs --tail 100`

ไฟล์ที่เกี่ยวข้อง: `Dockerfile` (node 22, build แยกจาก run), `docker-compose.yml` (พอร์ต 3400, healthcheck), `scripts/deploy-server.sh`
ทะเบียน Ticket ใช้ Neon ฐานเดียวกับ Vercel จึงเห็นเลขตั๋ว/สถิติชุดเดียวกันทั้งสองที่

## การทดสอบ

```bash
npm test               # unit (jest) — ตรรกะใน src/lib และ route ที่ไม่ต้องใช้ Chatwoot จริง
npm run test:e2e       # e2e — เปิด Chatwoot จำลอง :4000 + next :3401 + ฐานทดสอบ aidc_chat_test บน Neon แล้วปิดให้เอง
npm run test:deployed  # smoke อ่านอย่างเดียวกับเซิร์ฟเวอร์ภายใน (E2E_DEPLOYED_URL เปลี่ยนปลายทางได้)
```

เทสอยู่ที่ `cotester/tests/cases` (unit) และ `cotester/tests/e2e`; e2e ไม่แตะฐานข้อมูลจริง (สคริปต์ปฏิเสธถ้า URL ชี้ `neondb`)
ผลล่าสุดและรายการที่ยังไม่ครอบคลุม: `docs/test-report-2026-10-13.md`

## ให้เครื่องอื่นทดสอบระบบจากเครื่องนี้

```bash
npm run dev       # หรือ npm run share  (build + start แบบ production — เสถียรกว่าเมื่อมีหลายคนทดสอบพร้อมกัน)
npm run lan       # แสดงที่อยู่ที่เครื่องอื่นใช้เปิด เช่น http://10.0.1.28:3400/
```

- เซิร์ฟเวอร์ผูกที่ `0.0.0.0:3400` (ทุกอินเทอร์เฟซ) และ `allowedDevOrigins` ใน `next.config.ts`
  อนุญาตช่วง IP ภายใน (10.x, 172.16–31.x, 192.168.x, *.local) เพิ่มชื่อเครื่องอื่นได้ด้วย `DEV_ALLOWED_ORIGINS=a.example,b.example`
- เครื่องที่ทดสอบต้องอยู่เครือข่ายเดียวกัน แล้วเปิด `http://<IP เครื่องนี้>:3400/login` (พนักงาน) หรือ `/admin` (ไอที)
- เปิดหน้าแรก `/` ผ่านที่อยู่นี้ QR จะชี้มาที่ `/login` ของเครื่องนี้ให้เอง สแกนจากมือถือในเครือข่ายเดียวกันได้
- **ไฟร์วอลล์ Windows:** ถ้าเครื่องอื่นเข้าไม่ได้ ให้เปิดพอร์ต 3400 (รันใน PowerShell แบบ Administrator)
  ```powershell
  New-NetFirewallRule -DisplayName "COSI Support 3400" -Direction Inbound -Protocol TCP -LocalPort 3400 -Action Allow -Profile Private,Domain
  ```
  ปิดคืนเมื่อทดสอบเสร็จ: `Remove-NetFirewallRule -DisplayName "COSI Support 3400"`
- เครือข่ายแบบ Visitor/Guest มักตั้งไว้ไม่ให้เครื่องคุยกันเอง (client isolation) ถ้าเข้าไม่ได้ทั้งที่ไฟร์วอลล์เปิดแล้ว ให้ใช้ Wi-Fi/LAN ของสำนักงาน
- ใช้ในเครือข่ายที่เชื่อถือได้เท่านั้น — หน้า `/admin` ล็อกอินด้วยบัญชี Chatwoot จริง และ IP อาจเปลี่ยนเมื่อเชื่อมต่อใหม่ (DHCP)

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|---|---|
| `src/components/SupportPortal.tsx` | หน้าพอร์ทัล (ฟอร์มผู้ใช้, เลือกหัวข้อ, ปุ่มเริ่มแชท, เคล็ดลับ) |
| `src/lib/widget.ts` | โหลด/ควบคุม Chatwoot widget (`window.$chatwoot`) |
| `src/lib/categories.ts` | หมวดปัญหา, แผนก, ชื่อ label |
| `src/lib/i18n.ts` | ข้อความ ลาว/อังกฤษ |
| `src/app/api/identify` | สร้าง identifier + HMAC ให้ widget (ใช้ `CHATWOOT_HMAC_TOKEN` ฝั่ง server) |
| `src/app/api/health` | ตรวจการตั้งค่าและการเข้าถึง Chatwoot |
| `src/components/AdminConsole.tsx` | คอนโซลไอที (รายการ, แถบป้ายกำกับ + ตัวเลขแดง, ห้องแชท) |
| `src/app/api/admin/*` | พร็อกซี Chatwoot API สำหรับคอนโซล (ล็อกอิน, รายการ, ข้อความ, ป้ายกำกับ, มอบหมาย, ปิดเคส) |
| `src/lib/session.ts` | เซสชันทีมไอที — token เก็บในคุกกี้ httpOnly เข้ารหัส AES-256-GCM (ต้องมี `SESSION_SECRET`) |
| `src/lib/db.ts` / `db/schema.sql` / `scripts/db-migrate.mjs` | เชื่อม Neon (pool ต่อโปรเซส), โครงตาราง, สคริปต์สร้างตาราง (`npm run db:migrate`) |
| `src/lib/ticketRegistry.ts` | ทะเบียน Ticket: ออกเลขถาวรแบบ atomic, ซิงก์สถานะ/ป้าย/ผู้รับผิดชอบจาก Chatwoot, บันทึกเหตุการณ์ |
| `src/lib/stats.ts` + `src/app/admin/stats` + `src/app/api/admin/stats` | สถิติจากทะเบียน (หน้าเว็บ + JSON API) |
| `src/components/QrPoster.tsx` | หน้า QR + โปสเตอร์ |
| `src/components/CosiLogo.tsx` / `AidcLogo.tsx` | โลโก้ COSI (ป้ายตึก, ฝั่งพนักงาน) และโลโก้ AIDC TECH (ฝั่งไอที) |

## หมายเหตุ

- เพิ่ม/แก้หมวดปัญหาที่ `src/lib/categories.ts` แล้วสร้าง label `cosi-<id>` ให้ตรงใน Chatwoot
- `.env.local` มี token ห้าม commit (อยู่ใน `.gitignore` แล้ว)
