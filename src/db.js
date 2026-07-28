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

CREATE TABLE IF NOT EXISTS pin_lockouts (
  kid_id INTEGER PRIMARY KEY REFERENCES kids(id) ON DELETE CASCADE,
  fails INTEGER DEFAULT 0,         -- consecutive wrong PINs in the current window
  first_fail INTEGER,             -- epoch ms of the first fail in this window
  locked_until INTEGER DEFAULT 0  -- epoch ms; if > now, PIN login is locked for this child
);

CREATE TABLE IF NOT EXISTS game_progress (
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  game TEXT NOT NULL,              -- which game this save-slot belongs to (e.g. 'market')
  data TEXT NOT NULL,             -- small JSON blob: level reached, stars, career stats, badges
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (kid_id, game)
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
  // Parent choice: does the CHILD get to see their own grade-level placement? Default 0 (hidden),
  // so a child who places below their enrolled grade never has that shown to them. Parents always
  // see the real level in the report; they flip this on if/when they want to share it with the kid.
  "ALTER TABLE kids ADD COLUMN show_level INTEGER DEFAULT 0",
  // Parent choice: is the Play Zone arcade available to this child? Default 1 (on). A parent can
  // switch the games off from the dashboard so the child sees a pure-learning experience.
  "ALTER TABLE kids ADD COLUMN games_enabled INTEGER DEFAULT 1",
  // Parent "earn it" gate: number of questions the child must answer TODAY before the Play Zone
  // unlocks. 0 = no gate (always available when games_enabled). Only applies when games_enabled=1.
  "ALTER TABLE kids ADD COLUMN games_gate INTEGER DEFAULT 0",
  // Parent daily time cap for games, in MINUTES. 0 = no limit. When today's tracked game time
  // reaches this, the Play Zone locks until the next day.
  "ALTER TABLE kids ADD COLUMN games_time_limit INTEGER DEFAULT 0",
  // Concepts the child missed during the placement quiz (JSON array of skill names) so
  // parents can see, in plain language, what to keep an eye on from the assessment.
  "ALTER TABLE subject_state ADD COLUMN placement_missed TEXT",
  // The grade the child was actually PLACED at, captured once at placement time and never
  // rewritten by later promotion/demotion. The parent-facing "Why we started here" note reads
  // this (not the live, adjusted level) so it can't retroactively invent a false placement story.
  "ALTER TABLE subject_state ADD COLUMN placed_level REAL",
  // Highest grade the child has genuinely DEMONSTRATED (cleanly passed in placement, or cleared
  // via a real promotion). Distinct from the served `level`, which can be floored above true
  // ability. The Gallop Score credits sub-grade skills only up to this, so the score reflects
  // demonstrated learning rather than where the child happens to be seated. -1 = nothing cleared.
  "ALTER TABLE subject_state ADD COLUMN demonstrated_level INTEGER DEFAULT -1",
  // Family time zone (IANA name, e.g. 'America/Los_Angeles'), captured from the parent's browser.
  // Used so "today"/"this week" counts roll over at the family's local midnight instead of UTC —
  // otherwise an evening-Pacific family sees today's questions drop to 0 once it passes UTC midnight.
  "ALTER TABLE parents ADD COLUMN tz TEXT",
  // Account type: 'family' (a parent, the default and every existing account) or 'teacher'
  // (a school/educator account). A teacher account owns students the same way a parent owns
  // kids, but the UI routes it to the class dashboard and its students are grouped into classes.
  "ALTER TABLE parents ADD COLUMN account_type TEXT DEFAULT 'family'",
  // School / organization name, for teacher accounts.
  "ALTER TABLE parents ADD COLUMN school_name TEXT",
  // Which class a teacher-created student belongs to (denormalized convenience; the authoritative
  // mapping is class_members). Null for family kids and unassigned students.
  "ALTER TABLE kids ADD COLUMN class_id INTEGER",
  // Whether students may self-join a class with its join code (teacher can toggle off).
  "ALTER TABLE classes ADD COLUMN join_enabled INTEGER DEFAULT 1",
  // Multi-teacher schools: a teacher account may belong to a school and hold a role within it
  // ('head' = head of school, sees every class; 'member' = a regular teacher). Null = solo teacher.
  "ALTER TABLE parents ADD COLUMN school_id INTEGER",
  "ALTER TABLE parents ADD COLUMN school_role TEXT",
  // Together Mode (parent-assisted practice): an answer logged with assisted=1 was worked on WITH
  // a parent. It counts as engagement but NEVER moves independent mastery, placement, or the Gallop
  // Score — the report/exports keep assisted and independent work separate (COPPA-safe, honest).
  "ALTER TABLE activity_log ADD COLUMN assisted INTEGER DEFAULT 0",
  // A kid session launched via "Practice together" is flagged assisted so every answer in it is
  // recorded as assisted, surviving the page reload the parent→child handoff performs.
  "ALTER TABLE sessions ADD COLUMN assisted INTEGER DEFAULT 0",
  // Level provenance (PP-106): when a PARENT manually sets a subject's working level, record it so
  // the report can say "set by you on <date>" and offer a return to Gallop's adaptive placement.
  // level_src null/'adaptive' = Gallop-chosen; 'parent' = manually set. prev_level = the adaptive
  // level just before the manual override, so "return to adaptive" can restore it.
  "ALTER TABLE subject_state ADD COLUMN level_src TEXT",
  "ALTER TABLE subject_state ADD COLUMN level_set_at TEXT",
  "ALTER TABLE subject_state ADD COLUMN prev_level REAL"
]) {
  try { db.exec(stmt); } catch (e) { /* column already exists */ }
}

// One-time backfill of placed_level / demonstrated_level for children placed BEFORE these
// columns existed. Guarded by "placed_level IS NULL" so it only touches pre-migration rows
// (every new placement sets placed_level explicitly, so those are never rewritten) — this makes
// it idempotent and prevents clobbering a legitimately-placed-at-0 learner. We use the child's
// current working level as the best available proxy for both, so existing Gallop Scores carry
// over smoothly instead of dropping to the floor on deploy.
try {
  db.exec("UPDATE subject_state SET placed_level = level, demonstrated_level = CAST(ROUND(level) AS INTEGER) WHERE placed = 1 AND placed_level IS NULL");
} catch (e) {}

// Self-heal: a child's working `level` must never sit BELOW their demonstrated (proven-cleared)
// level. That impossible state is what made the report show "Working level: Grade 1" while the
// Gallop Score and "Why we started here" both said Grade 3 — deeply confusing to parents. It came
// from an older, over-eager demote that could push the served level below a grade the child had
// already passed. Raise any such level back up to the proven grade (this only ever RAISES a level,
// never lowers anyone, and never past what was actually demonstrated). A new guard in adaptive.js
// stops it ever recurring. Idempotent: once level >= demonstrated_level, this is a no-op.
try {
  db.exec("UPDATE subject_state SET level = demonstrated_level WHERE placed = 1 AND demonstrated_level IS NOT NULL AND demonstrated_level >= 0 AND level < demonstrated_level");
} catch (e) {}

// Per-day game-time tracking (seconds), for the parent daily time cap. One row per child per
// UTC day; the kid client ticks elapsed game seconds here while a game is open.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS game_time (
    kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    day TEXT NOT NULL,                 -- YYYY-MM-DD (UTC)
    seconds INTEGER DEFAULT 0,
    PRIMARY KEY (kid_id, day)
  )`);
} catch (e) {}

// B2B lead capture: schools/educators who submit the "Book a demo / request pricing" form.
// Stored durably so a lead is never lost even if the notification email fails to send.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS school_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school TEXT, name TEXT, email TEXT, phone TEXT, role TEXT,
    students TEXT, interest TEXT, message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
} catch (e) {}

// Teacher/school dashboard: classes group a teacher account's students. owner_id references the
// teacher's parents row. class_members is the authoritative student↔class mapping (a student can
// sit in more than one class — e.g. a homeroom and a subject group).
try {
  db.exec(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade INTEGER,                     -- optional default grade for the class (0=K..12), null = mixed
    join_code TEXT,
    join_enabled INTEGER DEFAULT 1,    -- students may self-join with the code (teacher can toggle)
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS class_members (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    added_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (class_id, kid_id)
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_classes_owner ON classes(owner_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id)');
} catch (e) {}

// Teacher assignments: a focus skill (or whole subject) a teacher sets for a class.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS class_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    skill_id TEXT,
    skill_name TEXT,
    note TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_assign_class ON class_assignments(class_id)');
} catch (e) {}

// Game attempts: one row each time a game is opened (a token spent), so "attempts" can be shown
// separately from "completed rounds" (game_scores). A token disappearing while play history says
// zero was confusing (GAME-P1.5).
try {
  db.exec(`CREATE TABLE IF NOT EXISTS game_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    ts TEXT DEFAULT (datetime('now'))
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_game_attempts ON game_attempts(kid_id, game)');
} catch (e) {}

// Advanced Track exam-readiness: per-student, per-track running stats for AP/Honors/Regents
// tracks — multiple-choice practice, free-response self-scores, and best exam-simulator result.
// Kept entirely separate from the K-12 adaptive ladder (never touches subject_state/skill_state).
try {
  db.exec(`CREATE TABLE IF NOT EXISTS track_progress (
    kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    mc_attempts INTEGER DEFAULT 0,
    mc_correct INTEGER DEFAULT 0,
    frq_attempts INTEGER DEFAULT 0,
    frq_points INTEGER DEFAULT 0,
    frq_max INTEGER DEFAULT 0,
    best_exam_score INTEGER DEFAULT 0,   -- estimated 1..5, 0 = none yet
    last_exam_pct INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (kid_id, track_id)
  )`);
} catch (e) {}

// Placement sessions persisted server-side so an in-flight placement survives a deploy,
// restart, reconnect, or device change (was an in-memory Map that vanished on redeploy —
// the "Quick hiccup! That didn't load" data-loss bug). history is a JSON array of probes;
// the row is deleted the moment placement completes.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS placement_sessions (
    kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    history TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (kid_id, subject)
  )`);
} catch (e) {}

// First-party product-analytics events. Deliberately IDENTIFIER-FREE: we store only the event
// name and a timestamp — never a child id, name, or any learner detail. This gives the owner
// aggregate activation-funnel counts (how many placements start vs. complete, etc.) without any
// third-party tag and without profiling any child. Learner activation must NOT flow to GTM/GA
// (COPPA), so it flows here instead.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ts TEXT DEFAULT (datetime('now'))
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_name_ts ON events(name, ts)');
} catch (e) {}

// Schools: a group of teacher accounts under a head of school. Members join with the school code.
try {
  db.exec(`CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    head_id INTEGER REFERENCES parents(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code)');
} catch (e) {}

// Child-privacy: custom avatar PHOTOS were retired in favor of illustrated avatars only.
// Scrub any previously-stored photo so no child's image remains at rest. Guarded by IS NOT
// NULL so it's a no-op once clean (won't rewrite rows on every boot). New backups taken
// after this runs contain no child photos; rotate out old backups to purge them fully.
try { db.exec("UPDATE kids SET avatar_img=NULL WHERE avatar_img IS NOT NULL"); } catch (e) {}

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
db.POLICY_VERSION = '2026-07-19'; // must match the "Last updated" date shown on /privacy and /terms
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

// ---------- per-child PIN brute-force lockout ----------
// A 4-digit PIN has only 10,000 combinations, so per-IP rate limiting alone can be defeated
// by rotating IPs. This adds a lock tied to the *child's account* (survives IP rotation and
// process restarts because it lives in the DB): after PIN_MAX_FAILS wrong tries inside a
// rolling window, that child's PIN login is frozen for PIN_LOCK_MS. A successful login (or a
// parent launching the child from their own authenticated session) clears it. The parent can
// always reset the PIN, so a griefer can only ever cause a short delay.
const PIN_MAX_FAILS = 8;              // wrong tries allowed per window before the lock trips
const PIN_WINDOW_MS = 15 * 60000;     // rolling window over which fails accumulate (15 min)
const PIN_LOCK_MS = 15 * 60000;       // how long the child's PIN login stays frozen (15 min)
db.pinLockRemaining = function (kidId) {
  try {
    const r = db.prepare('SELECT locked_until FROM pin_lockouts WHERE kid_id=?').get(kidId);
    if (r && r.locked_until && r.locked_until > Date.now()) return r.locked_until - Date.now();
  } catch (e) {}
  return 0;
};
db.notePinFail = function (kidId) {
  // Record a wrong PIN. Returns ms of lockout if this attempt just tripped the lock, else 0.
  try {
    const now = Date.now();
    const r = db.prepare('SELECT fails, first_fail FROM pin_lockouts WHERE kid_id=?').get(kidId);
    if (!r) {
      db.prepare('INSERT INTO pin_lockouts (kid_id, fails, first_fail, locked_until) VALUES (?,1,?,0)').run(kidId, now);
      return 0;
    }
    let fails = r.fails || 0, firstFail = r.first_fail || now;
    if (now - firstFail > PIN_WINDOW_MS) { fails = 0; firstFail = now; }  // window expired: start fresh
    fails += 1;
    let lockedUntil = 0;
    if (fails >= PIN_MAX_FAILS) { lockedUntil = now + PIN_LOCK_MS; fails = 0; firstFail = now; }  // trip + reset counter
    db.prepare('UPDATE pin_lockouts SET fails=?, first_fail=?, locked_until=? WHERE kid_id=?').run(fails, firstFail, lockedUntil, kidId);
    return lockedUntil ? PIN_LOCK_MS : 0;
  } catch (e) { return 0; }
};
db.clearPinFails = function (kidId) {
  try { db.prepare('DELETE FROM pin_lockouts WHERE kid_id=?').run(kidId); } catch (e) {}
};
module.exports = db;
