-- ทะเบียน Ticket ของระบบ COSI Support (Neon Postgres) — ข้อความแชทยังอยู่ใน Chatwoot
-- รัน: npm run db:migrate  (idempotent รันซ้ำได้)

CREATE TABLE IF NOT EXISTS tickets (
  conversation_id   BIGINT PRIMARY KEY,                -- id บทสนทนาใน Chatwoot
  ticket_no         TEXT NOT NULL UNIQUE,              -- Ticket13-10-2026-001
  ticket_day        TEXT NOT NULL,                     -- dd-mm-yyyy (เวลาลาว)
  seq               INT  NOT NULL,
  contact_name      TEXT NOT NULL DEFAULT '',
  department        TEXT NOT NULL DEFAULT '',          -- แผนก · เบอร์ต่อ ตามที่พนักงานกรอก
  labels            TEXT[] NOT NULL DEFAULT '{}',
  closed_topics     TEXT[] NOT NULL DEFAULT '{}',
  urgent            BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'open',      -- open | resolved | pending | snoozed
  assignee_name     TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL,              -- เวลาสร้างเคสใน Chatwoot
  first_reply_at    TIMESTAMPTZ,                       -- เจ้าหน้าที่ตอบครั้งแรก (จากคอนโซล)
  resolved_at       TIMESTAMPTZ,
  last_activity_at  TIMESTAMPTZ NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tickets_day_idx    ON tickets (ticket_day);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_created_idx ON tickets (created_at DESC);

-- ตัวนับเลขตั๋วรายวัน (เริ่ม 001 ใหม่ทุกวัน)
CREATE TABLE IF NOT EXISTS ticket_counters (
  day TEXT PRIMARY KEY,
  seq INT NOT NULL DEFAULT 0
);

-- ประวัติเหตุการณ์ของแต่ละเคส
CREATE TABLE IF NOT EXISTS ticket_events (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  ticket_no       TEXT,
  type            TEXT NOT NULL,        -- created | assigned | replied | note | greeted | topic_closed | resolved | reopened
  actor           TEXT NOT NULL DEFAULT '',
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ticket_events_conv_idx ON ticket_events (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS ticket_events_type_idx ON ticket_events (type, created_at);

-- ===== แจ้งปัญหาแบบรายการ (ไม่ผ่านแชท) — พนักงานส่งหัวข้อ + ข้อย่อย, ไอทีรับงาน/ปิดงานที่ /admin/reports =====
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  ticket_no TEXT NOT NULL UNIQUE,        -- ใช้เลขชุดเดียวกับเคสแชท (ticket_counters ต่อวัน)
  ticket_day TEXT NOT NULL,
  seq INT NOT NULL,
  reporter_name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  identifier TEXT NOT NULL DEFAULT '',   -- cosi_xxx จาก /api/identify ใช้ให้เจ้าของดูสถานะได้
  urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',    -- new | in_progress | done
  assignee_name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',         -- บันทึกภายในของไอที
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  done_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS report_items (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,                   -- id หมวด เช่น network, computer
  text TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  done_by TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS report_events (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                    -- created | started | assigned | note | item_done | item_undone | done | reopened
  actor TEXT NOT NULL DEFAULT '',
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_identifier_idx ON reports (identifier);
CREATE INDEX IF NOT EXISTS report_items_report_idx ON report_items (report_id, position);
CREATE INDEX IF NOT EXISTS report_events_report_idx ON report_events (report_id, id);

-- ไฟล์แนบของงานแจ้งปัญหา (รูป/วิดีโอ) — ตัวไฟล์อยู่บนดิสก์ของเซิร์ฟเวอร์ (UPLOAD_DIR) ตารางนี้เก็บเฉพาะข้อมูลไฟล์
-- report_id ว่าง = อัปโหลดไว้ก่อนส่งรายงาน (ผูกตอน POST /api/reports ด้วย token)
CREATE TABLE IF NOT EXISTS report_files (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  uploader TEXT NOT NULL DEFAULT '',   -- identifier ของเครื่องที่อัปโหลด
  original_name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,    -- path สัมพัทธ์ใต้ UPLOAD_DIR
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS report_files_report_idx ON report_files (report_id, id);
