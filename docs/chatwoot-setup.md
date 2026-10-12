# ตั้งค่า Chatwoot สำหรับ COSI Hotel Support

Chatwoot: `https://chatwoot.aidclaos.com` (account 1 — AIDC-TECH)
ทีมไอทีใช้ dashboard ของ Chatwoot รับเรื่อง ส่วนพนักงานโรงแรมแชทผ่านพอร์ทัลนี้ (widget ฝังในหน้าเว็บ)

## สถานะที่ตั้งค่าไว้แล้ว (12 ต.ค. 2026)

| รายการ | ค่าจริงใน Chatwoot |
|---|---|
| Inbox (Website) | **COSI Hotel Support** — inbox id **5** |
| ทีม | **COSI IT** — team id 3 (เปิด auto-assign), สมาชิก: pradit ratthanoo |
| Labels | `cosi-network`, `cosi-computer`, `cosi-pms`, `cosi-account`, `cosi-cctv`, `cosi-phone`, `cosi-other`, `cosi-urgent` (ครบ 8 ตัว) |
| ข้อความต้อนรับ (greeting) | เปิด — "ສະບາຍດີ ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ ກະລຸນາບອກພວກເຮົາກ່ຽວກັບບັນຫາຂອງທ່ານ." |
| กล่องขออีเมล (email collect box) | **ปิด** — พนักงานระบุตัวตนผ่านพอร์ทัลอยู่แล้ว ไม่ต้องถามอีเมลซ้ำ |
| Agent ใน inbox | pradit ratthanoo เท่านั้น — เพิ่มคนอื่นที่แท็บ "การร่วมมือ" ของ inbox |
| Identity validation | HMAC token อยู่ใน `.env.local`; ยัง **ไม่ได้เปิด** "Require identity validation" |
| Allowed Domains | ว่าง (อนุญาตทุกโดเมน) — ใส่โดเมนพอร์ทัลก่อนใช้งานจริง |

> inbox id 4 (`cosi-hotel`) เป็นช่องทางแบบ **API** ที่สร้างไว้ก่อน ไม่ได้ใช้กับพอร์ทัลนี้ (ฝัง widget ไม่ได้) — ลบได้ถ้าไม่ใช้

## คอนโซลไอที (`/admin`) ทำงานอย่างไร

- ทีมไอทีไม่ต้องเข้า Chatwoot โดยตรง ล็อกอินที่ `/admin` ด้วยอีเมล/รหัสผ่าน Chatwoot ของตัวเอง
  เซิร์ฟเวอร์ส่งต่อให้ Chatwoot ตรวจ (`POST /auth/sign_in`) ไม่เก็บรหัสผ่าน เก็บเฉพาะ token ในคุกกี้ที่เข้ารหัส
- ข้อความที่ตอบจะขึ้นชื่อคนที่ล็อกอินจริง ใน Chatwoot และในหน้าแชทของพนักงาน
- ใช้ได้เฉพาะผู้ใช้ที่เป็นสมาชิกของ account (`CHATWOOT_ACCOUNT_ID`) และเห็นเฉพาะ inbox `CHATWOOT_INBOX_ID`
- **ช่องแชทที่แสดง = inbox `CHATWOOT_INBOX_ID` (ปัจจุบัน 5 "COSI Hotel Support")** เหมือนหน้า
  `…/app/accounts/1/inbox/5` ของ Chatwoot: หัวรายการแสดงชื่อช่อง และมีแท็บ ของฉัน / ยังไม่มีผู้รับ / ทั้งหมด
  (นับตามสถานะและป้ายกำกับที่กำลังกรองอยู่) เพิ่มเติมจากแท็บสถานะ กำลังดำเนินการ / แก้ไขแล้ว / ทั้งหมด
- ป้ายกำกับที่แสดง = label ที่ขึ้นต้นด้วย `CHATWOOT_LABEL_PREFIX` (ค่าเริ่มต้น `cosi-`)
  ตัวเลขสีเทา = งานที่เปิดอยู่ / งานทั้งหมด, ตัวเลขสีแดงที่ขยับ = ข้อความที่ยังไม่ได้อ่าน
- **ปิดเคส:** กดปุ่มเขียวแล้วจะมีหน้าต่างแสดงหัวข้อ (ป้ายกำกับหมวดปัญหา) ที่ยังไม่ปิด พร้อม checkbox ให้เลือก
  ติ๊กครบ = ปิดเคสทั้งหมด (resolved), ติ๊กบางส่วน = ปิดเฉพาะหัวข้อนั้น เคสยังเปิดอยู่
  สถานะ "หัวข้อที่ปิดแล้ว" เก็บใน conversation custom attribute `closed_topics` (label ยังอยู่ จึงนับงานย้อนหลังได้)
  และมีบันทึกภายในในแชทว่าใครปิดหัวข้ออะไร; กด "เปิดใหม่" จะล้างรายการหัวข้อที่ปิดแล้ว
  ตัวเลขงานเปิดของแต่ละป้ายนับเฉพาะหัวข้อที่ยังไม่ปิด (ป้าย "ด่วน" ไม่นับเป็นหัวข้อ)
- **แจ้งผู้ใช้เมื่อปิดเคส/ปิดหัวข้อ:** นอกจากโน้ตภายใน ระบบส่ง "ข้อความสาธารณะ" (ลาว + อังกฤษ) เข้าแชทของพนักงานด้วย
  — ปิดทั้งเคส: "เคสนี้ถูกปิดแล้ว — แก้ไขแล้ว: <หัวข้อ>…" / ปิดบางหัวข้อ: "ปิดหัวข้อแล้ว: … ยังดำเนินการอยู่: …"
  (ข้อความสร้างที่ `src/lib/closeNotice.ts`, ส่งจาก `…/conversations/:id/topics`) พนักงานเห็นในหน้าต่างแชท และ Chatwoot
  จะเด้งการ์ด "ข้อความที่ยังไม่อ่าน" มุมขวาล่างให้เองแม้ซ่อนปุ่มลอยไว้
- **ทักทายอัตโนมัติ "ทุกครั้งที่มีแชทใหม่":** Chatwoot ส่งข้อความต้อนรับของ inbox เฉพาะตอนสร้างบทสนทนาใหม่
  ระบบจึงเสริมให้: เมื่อคอนโซลโพลล์รายการเคสเปิด เซิร์ฟเวอร์ตรวจลำดับข้อความของเคสที่มีความเคลื่อนไหวใหม่ ถ้าข้อความล่าสุดของ
  ลูกค้าเป็น "แชทใหม่" (ข้อความแรกหลังเคสถูกปิดแล้วพิมพ์มาอีก, หรือเว้นช่วงเงียบ ≥ 60 นาที, หรือยังไม่มีข้อความขาออกเลย)
  จะส่ง "ສະບາຍດີ ພະແນກໄອທີຍິນດີໃຫ້ບໍລິການ ກະລຸນາບອກພວກເຮົາກ່ຽວກັບບັນຫາຂອງທ່ານ" ในชื่อเจ้าหน้าที่ที่ล็อกอินอยู่ ครั้งเดียวต่อการเริ่มแชท
  (บันทึก custom attribute `auto_greeted_at` ก่อนส่ง) — ไม่ซ้ำกับข้อความต้อนรับของ Chatwoot เพราะนับเฉพาะข้อความลูกค้า
  ที่มาหลังข้อความขาออกล่าสุด; ต้องมีคอนโซลเปิดอยู่อย่างน้อยหนึ่งเครื่อง  ปรับด้วย `ADMIN_AUTO_GREETING`, `ADMIN_GREETING_IDLE_MIN`
- **ตัวเลขแดง = เคสที่ยังรอไอทีตอบ:** นับเมื่อข้อความล่าสุดเป็นของพนักงานและเคสยังเปิดอยู่ (อย่างน้อย 1)
  หรือใช้ `unread_count` ของ Chatwoot ถ้ามากกว่า — จึงไม่หายไปเพียงเพราะมีใครกด "อ่านแล้ว" ที่หน้า Chatwoot
  ตัวเลขจะหายเมื่อไอทีตอบกลับ (หรือเปิดห้องแชทนั้นอยู่)
- อัปเดตด้วยการ poll (รายการทุก 5 วินาที, ห้องแชทที่เปิดอยู่ทุก 3 วินาที) และมีเสียงเตือนเมื่อมีข้อความใหม่
- ตัวแชทสร้างบน Chatwoot Application API: `conversations`, `conversations/meta` (นับจำนวนงาน), `labels`,
  `canned_responses`, `agents`, `toggle_status`, `assignments`, `update_last_seen`
- พนักงานที่ยังไม่ยืนยันอีเมลใน Chatwoot (สถานะ "รอการยืนยัน") จะล็อกอินไม่ได้จนกว่าจะยืนยัน

## 1. สิ่งที่ต้องมีใน Chatwoot

| รายการ | ค่า | เมนู |
|---|---|---|
| Inbox (ช่องทาง Website) | `COSI Hotel Support` | Settings → Inboxes → เพิ่มกล่องข้อความ → Website |
| ทีม | `COSI IT` | Settings → Teams |
| Labels | ดูตารางด้านล่าง | Settings → Labels |
| Agent | ทีมไอทีที่ดูแล COSI (เพิ่มเข้า inbox และทีม) | Settings → Agents / Inbox → Collaborators |

### Labels

| Label | ความหมาย | ตรงกับหัวข้อบนพอร์ทัล |
|---|---|---|
| `cosi-network` | Wi-Fi / อินเทอร์เน็ต | `network` |
| `cosi-computer` | คอมพิวเตอร์ / เครื่องพิมพ์ | `computer` |
| `cosi-pms` | ระบบโรงแรม (PMS / POS) | `pms` |
| `cosi-account` | อีเมล / บัญชีผู้ใช้ | `account` |
| `cosi-cctv` | กล้องวงจรปิด / ระบบประตู | `cctv` |
| `cosi-phone` | โทรศัพท์ / โทรทัศน์ | `phone` |
| `cosi-other` | อื่น ๆ | `other` |
| `cosi-urgent` | ด่วน — กระทบการบริการแขก | ช่อง "ด่วน" |

ชื่อ label ต้องตรงกับ `categoryLabel()` / `URGENT_LABEL` ใน `src/lib/categories.ts`

## 2. ตั้งค่า inbox "COSI Hotel Support"

- **Website name**: COSI Hotel IT Support
- **Website domain**: โดเมนที่โฮสต์พอร์ทัล (เช่น `cosi-support.aidclaos.com`) ตอนทดสอบใช้ `localhost`; หน้าพนักงานอยู่ที่ path `/chat` (หน้าแรก `/` เป็น QR)
- **Widget color**: `#0284c7`
- **Welcome heading / tagline** (ภาษาลาว): ตั้งที่ Configuration → Widget Builder
- **Pre-chat form**: ปิดไว้ (พอร์ทัลรู้ตัวตนผู้ใช้ผ่าน `setUser` อยู่แล้ว)
- **Business hours / ข้อความนอกเวลา**: ตั้งตามเวลาทำงานของทีมไอที
- **Collaborators**: เพิ่ม agent ที่ดูแลโรงแรม
- **Auto-assignment**: เปิด (round robin) ถ้าต้องการกระจายเรื่องอัตโนมัติ

## 3. ดึงค่ามาใส่ `.env.local`

หลังสร้าง inbox แล้ว เปิด Settings → Inboxes → COSI Hotel Support → **Configuration**

| ค่า | อยู่ตรงไหน | ตัวแปร |
|---|---|---|
| Website token | ในโค้ด widget (`websiteToken: '...'`) | `CHATWOOT_WEBSITE_TOKEN` |
| HMAC token | Configuration → Identity Validation → เปิด "Enforce user identity validation" | `CHATWOOT_HMAC_TOKEN` |

```bash
cp .env.example .env.local   # แล้วเติมสองค่าข้างบน
npm run check:chatwoot       # ตรวจการเชื่อมต่อ
```

`CHATWOOT_HMAC_TOKEN` เป็นความลับ ห้ามใส่ใน `NEXT_PUBLIC_*` หรือส่งไปฝั่ง browser

## 4. การทำงานของ widget

1. พนักงานกรอกชื่อ + แผนก (+เบอร์ต่อ) ครั้งเดียว → `/api/identify` สร้าง identifier คงที่ + `identifier_hash`
2. พอร์ทัลเรียก `$chatwoot.setUser(identifier, { name, company_name, description, identifier_hash })`
   ทีมไอทีจึงเห็นชื่อพนักงานและแผนกในรายการแชททันที
3. เมื่อเริ่มแชท พอร์ทัลติด label หมวดปัญหา (+ `cosi-urgent`) และ conversation custom attributes
   `category` / `priority` — ติดได้หลังบทสนทนาถูกสร้าง (เหตุการณ์ `chatwoot:on-start-conversation`)
4. widget ของ Chatwoot ไม่มี locale ลาว จึง fallback ไปภาษาเริ่มต้นของ account (ปัจจุบันเป็นไทย)
   ข้อความต้อนรับ/คำทักทายภาษาลาวตั้งที่ตัว inbox เอง (หัวข้อ, คำอธิบาย, greeting message)

## 5. ข้อควรรู้

- ถ้าพนักงานล้างข้อมูลเบราว์เซอร์ จะต้องกรอกชื่อใหม่ แต่ identifier มาจาก hash ของ ชื่อ+แผนก
  จึงเป็นผู้ติดต่อคนเดิมใน Chatwoot (ประวัติแชทไม่หาย) ถ้าพิมพ์ชื่อเหมือนเดิม
- เครื่องส่วนกลาง (เช่น เคาน์เตอร์ต้อนรับ) ใช้ปุ่ม "ປ່ຽນຜູ້ໃຊ້ / Switch user" เพื่อสลับคน
