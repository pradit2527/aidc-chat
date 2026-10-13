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
