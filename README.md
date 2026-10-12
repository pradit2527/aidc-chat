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
| `/` | พนักงานโรงแรม | แจ้งปัญหา: กรอกชื่อ + แผนก → เลือกหัวข้อ → แชทกับไอที (ฝัง Chatwoot widget); เมื่อไอทีปิดเคส จะมีข้อความแจ้งพร้อมเลข Ticket ในแชท |
| `/admin` | ทีมไอที | **คอนโซลตอบแชท** ไม่ต้องเข้า Chatwoot: ล็อกอินด้วยบัญชี Chatwoot, ดูรายการแจ้งปัญหา, กรองตามป้ายกำกับ (มีจำนวนงาน + ตัวเลขแดงแจ้งเตือน), ตอบ/บันทึกภายใน/มอบหมาย/ปิดเคส |
| `/qr` | ทีมไอที | สร้าง QR Code (พาไปหน้า `/` เท่านั้น) + โปสเตอร์พิมพ์ / ดาวน์โหลด PNG, SVG |
| `/admin?demo=1` | ตอนพัฒนา | โหมดตัวอย่างของคอนโซล (ข้อมูลปลอม ไม่เรียก Chatwoot ปิดอัตโนมัติใน production) |

รองรับคอมพิวเตอร์ แท็บเล็ต และมือถือ (คอนโซล: มือถือ 1 หน้าจอสลับรายการ/แชท, แท็บเล็ต 2 คอลัมน์, คอมพิวเตอร์ 3 คอลัมน์)

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env.local     # ใส่ CHATWOOT_WEBSITE_TOKEN (และ CHATWOOT_HMAC_TOKEN)
npm run dev                    # http://localhost:3400
npm run check:chatwoot         # ตรวจการเชื่อมต่อ Chatwoot
```

การตั้งค่าฝั่ง Chatwoot (inbox, ทีม, label, token) ดูที่ [docs/chatwoot-setup.md](docs/chatwoot-setup.md)

## ข้อมูลถูกเก็บที่ไหน

**ระบบนี้ไม่มีฐานข้อมูลและไม่เขียนไฟล์ข้อมูลเอง** ข้อมูลงานทั้งหมดอยู่ที่ Chatwoot ที่เดียว

| ที่เก็บ | เก็บอะไร | หมายเหตุ |
|---|---|---|
| **Chatwoot** (`chatwoot.aidclaos.com`) | แชท ข้อความ ไฟล์แนบ ผู้ติดต่อ (ชื่อ แผนก เบอร์ต่อ) ป้ายกำกับ ผู้รับผิดชอบ สถานะ และ "หัวข้อที่ปิดแล้ว" (`closed_topics`) | แหล่งข้อมูลจริงเพียงแห่งเดียว (Postgres/ไฟล์แนบอยู่บนเซิร์ฟเวอร์ Chatwoot) |
| **เบราว์เซอร์ของพนักงาน** | `localStorage`: ชื่อ/แผนก/เบอร์ต่อ + identifier ที่ใช้ระบุตัว; คุกกี้ `lang` | อยู่เฉพาะเครื่องนั้น ปุ่ม "ปรับผู้ใช้" ล้างให้ |
| **เบราว์เซอร์ของทีมไอที** | คุกกี้ `cosi_admin` (httpOnly, เข้ารหัส AES-256-GCM, อายุ 12 ชม.) เก็บ token ของ Chatwoot ของผู้ล็อกอิน; `localStorage`: เปิด/ปิดเสียง | ไม่เก็บรหัสผ่าน; ออกจากระบบแล้วคุกกี้ถูกลบ |
| **ไฟล์ `.env.local` บนเซิร์ฟเวอร์ของเรา** | ความลับของระบบ: website token, HMAC token, `SESSION_SECRET` | อยู่นอก git (`.gitignore`) |
| **หน่วยความจำของเซิร์ฟเวอร์ (ชั่วคราว)** | ตัวนับจำกัดจำนวนครั้งล็อกอิน/เรียก, แคชจำนวนงานต่อป้าย 6 วินาที | หายเมื่อรีสตาร์ท ไม่มีข้อมูลงาน |

- ล็อกของเซิร์ฟเวอร์เก็บเฉพาะบรรทัดคำขอ (path/สถานะ) และข้อความ error ไม่มีเนื้อหาแชทและไม่มี token
- ไม่มี analytics หรือบริการภายนอกอื่นนอกจาก Chatwoot (ฟอนต์ถูกโหลดมาเก็บกับตัวแอปตอน build)

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

หมายเหตุสำหรับ serverless: งานเบื้องหลัง (ทักทายอัตโนมัติ) ใช้ `after()` ของ Next จึงทำงานบน Vercel ได้; แคชในหน่วยความจำ
(จำนวนงานต่อป้าย, เลขตั๋ว, ตัวนับจำกัดล็อกอิน) เป็นรายอินสแตนซ์ ใช้งานได้แต่ไม่แชร์กัน; ถ้า Chatwoot ตอบช้า route `labels`
อาจใกล้เพดาน 10 วินาทีของแผนฟรี  เมื่อใช้โดเมนจริงแล้ว แนะนำใส่โดเมนใน Chatwoot → inbox → Allowed Domains

## ให้เครื่องอื่นทดสอบระบบจากเครื่องนี้

```bash
npm run dev       # หรือ npm run share  (build + start แบบ production — เสถียรกว่าเมื่อมีหลายคนทดสอบพร้อมกัน)
npm run lan       # แสดงที่อยู่ที่เครื่องอื่นใช้เปิด เช่น http://10.0.1.28:3400/
```

- เซิร์ฟเวอร์ผูกที่ `0.0.0.0:3400` (ทุกอินเทอร์เฟซ) และ `allowedDevOrigins` ใน `next.config.ts`
  อนุญาตช่วง IP ภายใน (10.x, 172.16–31.x, 192.168.x, *.local) เพิ่มชื่อเครื่องอื่นได้ด้วย `DEV_ALLOWED_ORIGINS=a.example,b.example`
- เครื่องที่ทดสอบต้องอยู่เครือข่ายเดียวกัน แล้วเปิด `http://<IP เครื่องนี้>:3400/` (พนักงาน) หรือ `/admin` (ไอที)
- เปิดหน้า `/qr` ผ่านที่อยู่นี้ QR จะชี้มาที่เครื่องนี้ให้เอง สแกนจากมือถือในเครือข่ายเดียวกันได้
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
| `src/components/QrPoster.tsx` | หน้า QR + โปสเตอร์ |
| `src/components/CosiLogo.tsx` / `AidcLogo.tsx` | โลโก้ COSI (ป้ายตึก, ฝั่งพนักงาน) และโลโก้ AIDC TECH (ฝั่งไอที) |

## หมายเหตุ

- เพิ่ม/แก้หมวดปัญหาที่ `src/lib/categories.ts` แล้วสร้าง label `cosi-<id>` ให้ตรงใน Chatwoot
- `.env.local` มี token ห้าม commit (อยู่ใน `.gitignore` แล้ว)
