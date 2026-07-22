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

module.exports = db;
