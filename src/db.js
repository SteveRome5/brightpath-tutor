// BrightPath — SQLite database layer
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'brightpath.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  stripe_customer_id TEXT,
  sub_status TEXT DEFAULT 'trial',          -- trial | active | past_due | canceled
  sub_plan TEXT DEFAULT 'family',           -- solo | family
  trial_ends TEXT DEFAULT (datetime('now', '+7 days'))
);

CREATE TABLE IF NOT EXISTS kids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT 'fox',
  pin TEXT NOT NULL,                        -- 4-digit kid login PIN
  grade INTEGER NOT NULL,                   -- 0 = K ... 12
  calendar_mode TEXT DEFAULT 'traditional', -- traditional | yearround | homeschool
  weekly_goal INTEGER DEFAULT 12,           -- lessons per week across subjects
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_day TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subject_state (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,                    -- math | english | science | spanish
  level REAL NOT NULL,                      -- working grade level, may differ per subject
  placed INTEGER DEFAULT 0,                 -- has the placement quiz been completed?
  PRIMARY KEY (kid_id, subject)
);

CREATE TABLE IF NOT EXISTS skill_state (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  mastery REAL DEFAULT 0.3,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  last_seen TEXT,
  PRIMARY KEY (kid_id, subject, skill_id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  correct INTEGER NOT NULL,
  difficulty REAL,
  time_ms INTEGER,
  ts TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS badges (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (kid_id, badge_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  level REAL NOT NULL,
  issued_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                       -- parent | kid
  ref_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_kid_ts ON activity_log(kid_id, ts);

CREATE TABLE IF NOT EXISTS avatar_items (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  bought_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (kid_id, item_id)
);

CREATE TABLE IF NOT EXISTS game_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  score INTEGER NOT NULL,
  ts TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buddy_invites (
  code TEXT PRIMARY KEY,
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buddies (
  kid_a INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  kid_b INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (kid_a, kid_b)
);

CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_kid INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  to_kid INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  score_to_beat INTEGER NOT NULL,
  status TEXT DEFAULT 'open',               -- open | won | expired
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS team_rewards (
  kid_a INTEGER NOT NULL,
  kid_b INTEGER NOT NULL,
  week TEXT NOT NULL,                       -- ISO year-week
  PRIMARY KEY (kid_a, kid_b, week)
);

CREATE TABLE IF NOT EXISTS daily_quests (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  day TEXT NOT NULL,                        -- YYYY-MM-DD (UTC)
  bonus_claimed INTEGER DEFAULT 0,
  PRIMARY KEY (kid_id, day)
);

CREATE TABLE IF NOT EXISTS cheers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_kid INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  to_kid INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  cheer_id TEXT NOT NULL,
  seen INTEGER DEFAULT 0,
  ts TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS snacks (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  snack_id TEXT NOT NULL,
  qty INTEGER DEFAULT 0,
  last_bought TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (kid_id, snack_id)
);

CREATE TABLE IF NOT EXISTS score_snapshots (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,                     -- math|english|science|spanish|overall
  day TEXT NOT NULL,                         -- YYYY-MM-DD
  score INTEGER NOT NULL,
  PRIMARY KEY (kid_id, subject, day)
);

CREATE INDEX IF NOT EXISTS idx_challenges_open ON challenges(to_kid, game, status);
CREATE INDEX IF NOT EXISTS idx_game_scores_kid ON game_scores(kid_id, game);
CREATE INDEX IF NOT EXISTS idx_cheers_to ON cheers(to_kid, seen);

-- Marketing/newsletter list: landing-page signups who aren't (yet) customers.
CREATE TABLE IF NOT EXISTS newsletter_subs (
  email TEXT PRIMARY KEY,
  source TEXT DEFAULT 'landing',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Every email the app sends (or queues while no provider is configured):
-- an auditable outbox that doubles as the send log for nudge de-duplication.
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email TEXT NOT NULL,
  kind TEXT NOT NULL,                        -- welcome_trial | welcome_paid | nudge | ...
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'queued',              -- queued | sent | failed
  detail TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Stripe webhook idempotency: remember every processed event id so a duplicate or
-- out-of-order re-delivery is a no-op (no double subscription flip, no double email).
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  type TEXT,
  processed_at TEXT DEFAULT (datetime('now'))
);

-- Password reset tokens. We store only a SHA-256 hash of the token (never the raw value);
-- the raw token lives only in the emailed link. Single-use, short-lived.
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Auditable parental-consent ledger (COPPA). Every consent event is recorded with the
-- METHOD used to obtain it (a checkbox affirmation, or the stronger card-transaction that
-- the FTC recognizes as verifiable parental consent), the policy version in force, and a
-- timestamp. Withdrawals are recorded too. NOT cascade-deleted with the parent, so the
-- consent history survives even after a learner or account is removed (an audit trail).
CREATE TABLE IF NOT EXISTS consent_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  parent_email TEXT,
  kid_id INTEGER,
  method TEXT NOT NULL,          -- 'checkbox' | 'payment_card' | 'withdrawn'
  policy_version TEXT,
  detail TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- AI support tickets: every question from the in-app Help Assistant and every
-- inbound support@ email. status tracks how it was handled so nothing is lost.
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,            -- 'widget' | 'email'
  from_email TEXT,
  from_name TEXT,
  subject TEXT,
  question TEXT NOT NULL,
  ai_reply TEXT,
  category TEXT,                   -- 'safe' | 'sensitive' | 'unknown'
  status TEXT NOT NULL,            -- 'auto_answered' | 'auto_sent' | 'escalated' | 'sent' | 'dismissed'
  message_id TEXT,                 -- inbound email Message-ID, for de-dup
  created_at TEXT DEFAULT (datetime('now')),
  handled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_msgid ON support_tickets(message_id);

-- Monthly newsletter: AI-drafted, school-year-calendar themed. First few go out as a
-- draft to the admin for approval; after that the system sends on its own. One row per
-- calendar month (month_key = YYYY-MM) keeps the monthly sweep idempotent.
CREATE TABLE IF NOT EXISTS newsletters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month_key TEXT UNIQUE,           -- 'YYYY-MM'
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  theme TEXT,
  status TEXT NOT NULL,            -- 'draft' | 'sent' | 'discarded'
  mode TEXT NOT NULL,              -- 'approval' | 'auto'
  recipients INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  sent_at TEXT
);
`);

// Column migrations for existing databases (safe to re-run)
for (const stmt of [
  "ALTER TABLE kids ADD COLUMN avatar_config TEXT",
  "ALTER TABLE kids ADD COLUMN play_tokens INTEGER DEFAULT 3",
  "ALTER TABLE kids ADD COLUMN correct_since_token INTEGER DEFAULT 0",
  "ALTER TABLE parents ADD COLUMN is_admin INTEGER DEFAULT 0",
  "ALTER TABLE subject_state ADD COLUMN last_change_aid INTEGER DEFAULT 0",
  // COPPA: timestamp a parent affirmed consent to collect this child's info (set at learner creation)
  "ALTER TABLE kids ADD COLUMN consent_at TEXT",
  // Email preferences + one-click unsubscribe token (lazily generated) for parents
  "ALTER TABLE parents ADD COLUMN email_opt_out INTEGER DEFAULT 0",
  "ALTER TABLE parents ADD COLUMN unsub_token TEXT",
  // Newsletter signups get their own one-click unsubscribe token (lazily generated)
  "ALTER TABLE newsletter_subs ADD COLUMN unsub_token TEXT",
  // Lapsed-practice nudges: remember the last time we nudged so one lapse = one email
  "ALTER TABLE kids ADD COLUMN last_nudge_at TEXT",
  // Custom uploaded avatar photo (data URL) for older kids — null = use the built-in avatar
  "ALTER TABLE kids ADD COLUMN avatar_img TEXT",
  // Concepts the child missed during the placement quiz (JSON array of skill names) so
  // parents can see, in plain language, what to keep an eye on from the assessment.
  "ALTER TABLE subject_state ADD COLUMN placement_missed TEXT"
]) {
  try { db.exec(stmt); } catch (e) { /* column already exists */ }
}

// ---------- automated backups ----------
// Periodic hot backup of the SQLite database using better-sqlite3's online backup (safe
// while the app is running). Writes timestamped copies into DATA_DIR/backups and keeps the
// most recent KEEP. Because DATA_DIR is the Render persistent disk, these survive deploys.
// (For off-site durability, sync this folder to object storage — see EMAIL_SETUP/ops notes.)
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_KEEP = 10;
function backup() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(BACKUP_DIR, `gallop-${stamp}.db`);
    return db.backup(dest).then(() => {
      try {
        const files = fs.readdirSync(BACKUP_DIR).filter(f => /^gallop-.*\.db$/.test(f)).sort();
        while (files.length > BACKUP_KEEP) { const old = files.shift(); try { fs.unlinkSync(path.join(BACKUP_DIR, old)); } catch (e) {} }
      } catch (e) {}
      return dest;
    }).catch(err => { console.error('[backup] failed:', err.message); return null; });
  } catch (e) { console.error('[backup] error:', e.message); return Promise.resolve(null); }
}
function latestBackup() {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => /^gallop-.*\.db$/.test(f)).sort();
    if (!files.length) return null;
    const f = files[files.length - 1];
    return { file: f, path: path.join(BACKUP_DIR, f), size: fs.statSync(path.join(BACKUP_DIR, f)).size };
  } catch (e) { return null; }
}

db.backupNow = backup;
db.latestBackup = latestBackup;

// ---------- parental consent (COPPA) ----------
// Version string for the privacy notice / consent terms currently in force. Bump this when
// the children's privacy notice changes so consent records show which version was agreed to.
db.POLICY_VERSION = '2026-07-22';
db.recordConsent = function ({ parentId = null, parentEmail = null, kidId = null, method, detail = null }) {
  try {
    db.prepare('INSERT INTO consent_records (parent_id, parent_email, kid_id, method, policy_version, detail) VALUES (?,?,?,?,?,?)')
      .run(parentId, parentEmail, kidId, method, db.POLICY_VERSION, detail);
  } catch (e) { /* consent logging must never break the primary action */ }
};
db.consentFor = function (parentId) {
  try { return db.prepare('SELECT method, policy_version, kid_id, detail, created_at FROM consent_records WHERE parent_id=? ORDER BY id DESC').all(parentId); }
  catch (e) { return []; }
};
module.exports = db;
