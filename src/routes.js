// REST API routes
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const adaptive = require('./adaptive');
const content = require('./content');
const billing = require('./stripe');
const play = require('./play');
const gscore = require('./score');
const mailer = require('./mailer');
const support = require('./support');
const newsletter = require('./newsletter');
const inbound = require('./inbound');
const timeutil = require('./timeutil');

const router = express.Router();

// The family's saved time zone (IANA), so "today"/"this week" counters roll over at the
// family's local midnight instead of UTC. Looked up by parent id or by a kid's parent.
function tzForParent(parentId) {
  try { const p = db.prepare('SELECT tz FROM parents WHERE id=?').get(parentId); return p && p.tz; } catch (e) { return null; }
}
function tzForKid(kidId) {
  try { const r = db.prepare('SELECT p.tz AS tz FROM kids k JOIN parents p ON p.id=k.parent_id WHERE k.id=?').get(kidId); return r && r.tz; } catch (e) { return null; }
}
router.use(play.router);
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 90 * 86400000, secure: process.env.NODE_ENV === 'production' };
const AVATARS = ['fox', 'panda', 'dragon', 'unicorn', 'robot', 'astronaut', 'tiger', 'octopus'];

// Placement sessions are persisted to SQLite (placement_sessions) so an in-flight placement
// survives a deploy, restart, reconnect, or device change — the child resumes exactly where
// they left off instead of losing every answer (the "Quick hiccup!" data-loss bug). A thin
// Map-like façade keeps the call sites below unchanged.
const placements = {
  get(key) {
    const [kidId, subject] = splitPKey(key);
    try {
      const r = db.prepare('SELECT history FROM placement_sessions WHERE kid_id=? AND subject=?').get(kidId, subject);
      if (!r) return null;
      const h = JSON.parse(r.history);
      return Array.isArray(h) ? h : [];
    } catch (e) { return null; }
  },
  set(key, history) {
    const [kidId, subject] = splitPKey(key);
    try {
      db.prepare(`INSERT INTO placement_sessions (kid_id, subject, history, updated_at)
        VALUES (?,?,?,datetime('now'))
        ON CONFLICT(kid_id, subject) DO UPDATE SET history=excluded.history, updated_at=datetime('now')`)
        .run(kidId, subject, JSON.stringify(history || []));
    } catch (e) { /* best-effort: never break the quiz on a write hiccup */ }
  },
  delete(key) {
    const [kidId, subject] = splitPKey(key);
    try { db.prepare('DELETE FROM placement_sessions WHERE kid_id=? AND subject=?').run(kidId, subject); } catch (e) {}
  }
};
// keys are `${kidId}:${subject}`; subject never contains a colon (validSubject-gated).
function splitPKey(key) { const i = String(key).indexOf(':'); return [Number(key.slice(0, i)), key.slice(i + 1)]; }

// Dependency-free rate limiter for auth endpoints: caps attempts per IP+route window to
// stop password/PIN brute-force and credential stuffing. In-memory (fine for a single
// instance); swap for a shared store if we ever scale horizontally.
const _rl = new Map();
setInterval(() => { const now = Date.now(); for (const [k, v] of _rl) if (v.reset < now) _rl.delete(k); }, 60000).unref?.();
function rateLimit({ windowMs = 15 * 60000, max = 20, key = 'rl' } = {}) {
  return (req, res, next) => {
    // Use Express's req.ip (respects trust proxy, resolves the rightmost TRUSTED hop).
    // Never read X-Forwarded-For directly — the leftmost value is client-controlled, so
    // an attacker could rotate it per request and bypass the limiter entirely.
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const id = `${key}:${ip}`;
    const now = Date.now();
    let e = _rl.get(id);
    if (!e || e.reset < now) { e = { count: 0, reset: now + windowMs }; _rl.set(id, e); }
    e.count++;
    if (e.count > max) {
      res.setHeader('Retry-After', Math.ceil((e.reset - now) / 1000));
      return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    next();
  };
}
const loginLimiter = rateLimit({ windowMs: 15 * 60000, max: 20, key: 'login' });
const pinLimiter = rateLimit({ windowMs: 15 * 60000, max: 15, key: 'pin' });
// Answers: generous for real kids (nobody answers faster than ~2s/question) but stops
// scripted XP/certificate farming cold.
const answerLimiter = rateLimit({ windowMs: 60000, max: 40, key: 'answer' });

// CSRF defense (dependency-free): reject state-changing requests whose browser Origin
// doesn't match our host. Combined with SameSite=Lax cookies, this blocks a malicious
// site from POSTing to our API with the user's cookie. Server-to-server callers send no
// Origin and pass (the Stripe webhook is mounted before this router in server.js anyway).
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
router.use((req, res, next) => {
  if (!MUTATING.has(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && origin !== 'null') {
    let ok = false;
    try { ok = new URL(origin).host === req.headers.host; } catch (e) { ok = false; }
    if (!ok) return res.status(403).json({ error: 'Cross-origin request blocked' });
  }
  next();
});

// Health check for uptime monitoring / load balancers: cheap, unauthenticated, and pings
// the DB so a wedged database surfaces as unhealthy rather than a silent 200.
router.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    const lb = typeof db.latestBackup === 'function' ? db.latestBackup() : null;
    return res.json({ ok: true, ts: new Date().toISOString(), lastBackup: lb ? lb.file : null });
  } catch (e) { return res.status(503).json({ ok: false, error: 'db' }); }
});

// First-party activation beacon. Records ONLY an allowlisted event name + timestamp — no learner
// identifier of any kind — so learner-side activation (which must never reach GTM/GA under COPPA)
// is still measurable as an aggregate funnel. Unknown names are silently ignored (anti-bloat).
const EV_ALLOW = new Set([
  'demo_start', 'demo_complete', 'placement_start', 'placement_resume', 'placement_complete',
  'lesson_start', 'lesson_complete', 'first_correct', 'paywall_view', 'parent_report_view', 'learner_added'
]);
router.post('/ev', (req, res) => {
  try {
    const name = String((req.body && req.body.name) || '').slice(0, 40);
    if (EV_ALLOW.has(name)) db.prepare('INSERT INTO events (name) VALUES (?)').run(name);
  } catch (e) { /* analytics must never break a user action */ }
  res.json({ ok: true });
});

// Owner view: aggregate activation-funnel counts over the last N days (default 30). Admin-only.
router.get('/admin/funnel', auth.requireAdmin, (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
  try {
    const rows = db.prepare(
      `SELECT name, COUNT(*) AS n FROM events WHERE ts >= datetime('now', ?) GROUP BY name`
    ).all(`-${days} days`);
    const counts = {};
    for (const r of rows) counts[r.name] = r.n;
    res.json({ days, counts });
  } catch (e) { res.status(500).json({ error: 'funnel' }); }
});

// Idempotency for answer submission: a double-tap or a network retry must not record the
// same answer twice (which would double-move mastery / double-mint XP). The client sends a
// per-question nonce; we remember recently-seen (kid, nonce) pairs and no-op on repeats.
const _seenAnswers = new Map(); // `${kidId}:${nonce}` -> expiry
setInterval(() => { const now = Date.now(); for (const [k, v] of _seenAnswers) if (v < now) _seenAnswers.delete(k); }, 60000).unref?.();
function answerAlreadySeen(kidId, nonce) {
  if (!nonce) return false;
  const id = `${kidId}:${nonce}`;
  if (_seenAnswers.has(id)) return true;
  _seenAnswers.set(id, Date.now() + 5 * 60000); // 5-minute window
  return false;
}

// Subject must be validated with an OWN-property check: '__proto__'/'constructor' are
// truthy on plain objects and would crash downstream (.skills of undefined → 500).
const validSubject = s => typeof s === 'string' && Object.prototype.hasOwnProperty.call(content.SUBJECTS, s);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------- parent auth ----------
router.post('/auth/signup', loginLimiter, (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password || password.length < 8)
    return res.status(400).json({ error: 'Need email, name, and a password of 8+ characters.' });
  if (!EMAIL_RE.test(String(email).trim()))
    return res.status(400).json({ error: 'That email address doesn\'t look right — double-check it?' });
  // Server-side gate: every account must affirmatively accept Terms/Privacy and parent consent
  // (recorded below), not just pass the client checkbox.
  if ((req.body || {}).consent !== true)
    return res.status(400).json({ error: 'Please confirm you are the parent or guardian and agree to the Terms and Privacy Policy.' });
  try {
    const id = auth.createParent(email, name, password);
    auth.syncAdminFlag(db.prepare('SELECT * FROM parents WHERE id=?').get(id));
    // Record the parent's affirmative consent at signup (checkbox), part of the COPPA trail.
    if ((req.body || {}).consent) {
      try { db.recordConsent({ parentId: id, parentEmail: String(email).trim(), method: 'checkbox', detail: 'signup: parent/guardian 18+, agreed to Terms & Privacy Policy, consented to child data collection' }); } catch (e) {}
    }
    const token = auth.createSession('parent', id);
    res.cookie('bp_session', token, COOKIE_OPTS);
    // Fire-and-forget welcome email (never blocks or fails the signup itself)
    mailer.sendWelcomeTrial(db.prepare('SELECT * FROM parents WHERE id=?').get(id));
    res.json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      // Account exists — if the password matches, just log them in (no second form!)
      const p = auth.verifyParent(email, password);
      if (p) {
        const token = auth.createSession('parent', p.id);
        res.cookie('bp_session', token, COOKIE_OPTS);
        return res.json({ ok: true, existing: true });
      }
      return res.status(400).json({ error: 'That email already has an account (and that password didn\'t match it). Try logging in!' });
    }
    res.status(500).json({ error: 'Could not create account.' });
  }
});

// Parent jumps straight into their kid's session (no re-login, no PIN dance).
// We stash the parent's own session token in bp_parent_return so the kid view can
// offer a one-tap "Exit to parent" instead of forcing a full re-login.
router.post('/auth/enter-kid', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number((req.body || {}).kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const parentToken = req.cookies.bp_session;
  if (parentToken) res.cookie('bp_parent_return', parentToken, COOKIE_OPTS);
  // Together Mode: the parent launched "Practice together", so flag the whole kid session assisted.
  // Every answer in it is recorded assisted and can never move independent mastery/placement.
  const together = !!(req.body && (req.body.together === true || req.body.together === 1 || req.body.together === '1'));
  const token = auth.createSession('kid', kid.id, together);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true, kid: publicKid(kid), assisted: together });
});

// Return from a parent-launched kid session back to the parent dashboard.
router.post('/auth/exit-kid', (req, res) => {
  const parentToken = req.cookies.bp_parent_return;
  const s = parentToken ? auth.getSession(parentToken) : null;
  if (!s || s.kind !== 'parent') return res.status(400).json({ error: 'No parent session to return to.' });
  // Bind the stash to THIS kid's actual parent: a stray/foreign parent token in the
  // stash cookie must never be honored for a kid it doesn't own.
  const kidSess = auth.getSession(req.cookies.bp_session);
  if (kidSess && kidSess.kind === 'kid') {
    const kid = db.prepare('SELECT parent_id FROM kids WHERE id=?').get(kidSess.ref_id);
    if (!kid || kid.parent_id !== s.ref_id) return res.status(403).json({ error: 'That parent session does not match this learner.' });
    // Retire the kid session server-side so the old token can't be replayed.
    auth.destroySession(req.cookies.bp_session);
  }
  res.cookie('bp_session', parentToken, COOKIE_OPTS);
  res.clearCookie('bp_parent_return');
  res.json({ ok: true });
});

router.post('/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  const p = auth.verifyParent(email || '', password || '');
  if (!p) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const token = auth.createSession('parent', p.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true });
});

router.post('/auth/change-password', loginLimiter, auth.requireParent, (req, res) => {
  const { current, next } = req.body || {};
  if (!next || next.length < 8) return res.status(400).json({ error: 'New password needs 8+ characters.' });
  if (!auth.verifyParent(req.parent.email, current || '')) return res.status(401).json({ error: 'Current password is incorrect.' });
  auth.setPassword(req.parent.id, next);
  res.json({ ok: true });
});

// ---------- forgot / reset password ----------
const crypto = require('crypto');
const hashToken = t => crypto.createHash('sha256').update(String(t)).digest('hex');
// Request a reset link. ALWAYS returns 200 with the same message whether or not the email
// exists — never reveal which addresses have accounts (prevents account enumeration).
router.post('/auth/forgot', loginLimiter, (req, res) => {
  try {
    const email = String((req.body || {}).email || '').toLowerCase().trim();
    const p = EMAIL_RE.test(email) ? db.prepare('SELECT * FROM parents WHERE email=?').get(email) : null;
    if (p) {
      const token = crypto.randomBytes(32).toString('hex');
      db.prepare("INSERT INTO password_resets (token_hash, parent_id, expires_at) VALUES (?,?, datetime('now','+1 hour'))").run(hashToken(token), p.id);
      const origin = process.env.APP_ORIGIN || `${req.protocol}://${req.headers.host}`;
      mailer.sendPasswordReset(p, `${origin}/#reset/${token}`);
    }
  } catch (e) { /* never leak internal errors on this path */ }
  res.json({ ok: true, message: 'If that email has an account, a reset link is on its way.' });
});
// Consume a reset token and set a new password.
router.post('/auth/reset', loginLimiter, (req, res) => {
  const { token, password } = req.body || {};
  if (!password || String(password).length < 8) return res.status(400).json({ error: 'New password needs 8+ characters.' });
  if (!token) return res.status(400).json({ error: 'Missing reset token.' });
  const row = db.prepare("SELECT * FROM password_resets WHERE token_hash=? AND used=0 AND expires_at > datetime('now')").get(hashToken(token));
  if (!row) return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });
  auth.setPassword(row.parent_id, String(password));
  db.prepare('UPDATE password_resets SET used=1 WHERE token_hash=?').run(row.token_hash);
  // Invalidate any other outstanding reset links + existing sessions for safety.
  db.prepare("UPDATE password_resets SET used=1 WHERE parent_id=? AND used=0").run(row.parent_id);
  try { db.prepare("DELETE FROM sessions WHERE kind='parent' AND ref_id=?").run(row.parent_id); } catch (e) {}
  res.json({ ok: true });
});

router.post('/auth/logout', (req, res) => {
  auth.destroySession(req.cookies.bp_session);
  res.clearCookie('bp_session');
  res.clearCookie('bp_parent_return');
  res.json({ ok: true });
});

// Kid login: pick family email + kid + PIN (works on any device)
router.post('/auth/kid-login', pinLimiter, (req, res) => {
  const { email, kidId, pin } = req.body || {};
  const parent = db.prepare('SELECT * FROM parents WHERE email=?').get((email || '').toLowerCase().trim());
  const kid = parent ? db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(kidId), parent.id) : null;
  // Per-child brute-force lock: a 4-digit PIN is small, so after too many wrong tries we
  // freeze THIS child's PIN login for a while (survives IP rotation — the lock lives in the
  // DB keyed by the child, not the IP). The parent can still launch them from their own
  // logged-in session, and can reset the PIN, so this never hard-locks a real family out.
  if (kid && db.pinLockRemaining(kid.id) > 0) {
    return res.status(429).json({ error: 'Too many tries for this learner. Please wait about 15 minutes, or ask a grown-up to open it from their account.' });
  }
  // Uniform error (do not reveal whether the family/child exists vs. the PIN was wrong).
  if (!kid || !auth.verifyPin(pin, kid.pin)) {
    if (kid) db.notePinFail(kid.id);   // count wrong PINs against this child's lockout
    return res.status(401).json({ error: 'That email, learner, and PIN did not match. Try again!' });
  }
  db.clearPinFails(kid.id);            // good login wipes the failed-attempt counter
  // Transparently upgrade a legacy plaintext PIN to a salted hash on successful login.
  if (auth.isLegacyPin(kid.pin)) { try { db.prepare('UPDATE kids SET pin=? WHERE id=?').run(auth.hashPin(String(pin)), kid.id); } catch (e) {} }
  const token = auth.createSession('kid', kid.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true, kid: publicKid(kid) });
});

router.get('/auth/family-kids', pinLimiter, (req, res) => {
  const parent = db.prepare('SELECT * FROM parents WHERE email=?').get((req.query.email || '').toLowerCase().trim());
  // Return an empty list rather than a 404 so this endpoint cannot be used to enumerate
  // which emails have accounts. (Child names are only listed for a real family email.)
  if (!parent) return res.json({ kids: [] });
  const kids = db.prepare('SELECT id, name, avatar FROM kids WHERE parent_id=?').all(parent.id);
  res.json({ kids });
});

// The parent's browser reports its IANA time zone once per load, so "today"/"this week"
// counters roll over at the family's real local midnight. Only saves valid zones, and only
// when it actually changes — a no-op write otherwise. Never fails the caller.
router.post('/me/tz', auth.requireParent, (req, res) => {
  try {
    const tz = (req.body || {}).tz;
    if (tz && typeof tz === 'string') {
      const zone = timeutil.normalizeZone(tz);
      // normalizeZone returns the default for bogus input; only save if the input was itself valid
      if (zone === tz && zone !== tzForParent(req.parent.id)) {
        db.prepare('UPDATE parents SET tz=? WHERE id=?').run(zone, req.parent.id);
      }
    }
  } catch (e) { /* best-effort */ }
  res.json({ ok: true });
});

router.get('/auth/me', (req, res) => {
  const s = auth.getSession(req.cookies.bp_session);
  if (!s) return res.json({ role: 'guest' });
  if (s.kind === 'parent') {
    const p = db.prepare('SELECT id, email, name, sub_status, sub_plan, trial_ends, is_admin, account_type, school_name FROM parents WHERE id=?').get(s.ref_id);
    if (!p) return res.json({ role: 'guest' });
    // Teacher accounts get the class dashboard, not the family view + kid list.
    if (p.account_type === 'teacher') {
      auth.syncAdminFlag(p);
      return res.json({ role: 'parent', parent: p, kids: [], billingMode: billing.billingMode(), plans: billing.PLANS, teacher: true, school: schoolContext(p) });
    }
    // Grant owner/admin on any load (not only fresh login) if the email is on the
    // ADMIN_EMAILS list — so adding an owner never requires them to log out and back in.
    auth.syncAdminFlag(p);
    const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(p.id).map(publicKid);
    return res.json({ role: 'parent', parent: p, kids, billingMode: billing.billingMode(), plans: billing.PLANS });
  }
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(s.ref_id);
  if (!kid) return res.json({ role: 'guest' });
  // If this kid session was launched by a parent (bp_parent_return holds a live
  // parent session), tell the client so it can show an "Exit to parent" control.
  let parentReturn = false;
  try { const pr = auth.getSession(req.cookies.bp_parent_return); parentReturn = !!(pr && pr.kind === 'parent'); } catch (e) {}
  const kidSess = auth.getSession(req.cookies.bp_session);
  res.json({ role: 'kid', kid: publicKid(kid), parentReturn, assisted: !!(kidSess && kidSess.assisted) });
});

function publicKid(k) {
  let cfg = null; try { cfg = k.avatar_config ? JSON.parse(k.avatar_config) : null; } catch (e) {}
  // answered_today drives the parent "earn it" games gate (unlock after N questions today);
  // game_seconds_today drives the parent daily time cap.
  let answeredToday = 0, gameSecondsToday = 0;
  const win = timeutil.dayWindow(tzForKid(k.id));
  try { answeredToday = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ?').get(k.id, win.todayStart, win.tomorrowStart).n; } catch (e) {}
  try { const gt = db.prepare("SELECT seconds FROM game_time WHERE kid_id=? AND day=date('now')").get(k.id); gameSecondsToday = gt ? gt.seconds : 0; } catch (e) {}
  return { id: k.id, name: k.name, avatar: k.avatar, avatar_config: cfg, avatar_img: k.avatar_img || null, grade: k.grade, xp: k.xp, coins: k.coins, streak: k.streak, play_tokens: k.play_tokens || 0, calendar_mode: k.calendar_mode, weekly_goal: k.weekly_goal, show_level: k.show_level || 0, games_enabled: k.games_enabled == null ? 1 : k.games_enabled, games_gate: k.games_gate == null ? 0 : k.games_gate, answered_today: answeredToday, games_time_limit: k.games_time_limit == null ? 0 : k.games_time_limit, game_seconds_today: gameSecondsToday, learn_minutes_today: learnMinutesBetween(k.id, win.todayStart, win.tomorrowStart) };
}

// Honest "time on task" from real answer data: sum each answer's time, capped at 2 minutes
// per question so an idle/left-open tab can never inflate it. No new writes — pure read of
// activity_log (which already stores time_ms + ts). sinceExpr is a SQLite datetime/date expr.
function learnMinutes(kidId, sinceExpr) {
  try {
    const row = db.prepare(`SELECT COALESCE(SUM(MIN(COALESCE(time_ms,0),120000)),0) AS ms FROM activity_log WHERE kid_id=? AND ts >= ${sinceExpr}`).get(kidId);
    return Math.round((row.ms || 0) / 60000);
  } catch (e) { return 0; }
}
// Same "honest minutes" sum but bounded by explicit UTC instant strings (local-day aware).
// `until` is optional; when given, the window is [since, until).
function learnMinutesBetween(kidId, sinceUTC, untilUTC) {
  try {
    let sql = 'SELECT COALESCE(SUM(MIN(COALESCE(time_ms,0),120000)),0) AS ms FROM activity_log WHERE kid_id=? AND ts >= ?';
    const args = [kidId, sinceUTC];
    if (untilUTC) { sql += ' AND ts < ?'; args.push(untilUTC); }
    const row = db.prepare(sql).get(...args);
    return Math.round((row.ms || 0) / 60000);
  } catch (e) { return 0; }
}

// ---------- kid management (parent) ----------
router.post('/kids', auth.requireParent, (req, res) => {
  const { name, grade, pin, avatar, calendar_mode, consent } = req.body || {};
  if (!name || grade == null || !Number.isFinite(Number(grade)) || !/^\d{4}$/.test(String(pin)))
    return res.status(400).json({ error: 'Need a name, a valid grade, and a 4-digit PIN.' });
  // COPPA: a parent must affirmatively consent before we create a child profile / collect any data.
  if (consent !== true) return res.status(400).json({ error: 'Please confirm you are the parent or guardian and consent to creating this learner.' });
  const cleanName = String(name).trim().slice(0, 40);
  if (!cleanName) return res.status(400).json({ error: 'Need a name.' });
  const count = db.prepare('SELECT COUNT(*) AS n FROM kids WHERE parent_id=?').get(req.parent.id).n;
  const plan = billing.PLANS[req.parent.sub_plan] || billing.PLANS.family;
  if (count >= plan.kids) return res.status(400).json({ error: `Your ${plan.name} plan supports up to ${plan.kids} learner(s).` });
  const gradeNum = Math.max(0, Math.min(12, Math.round(Number(grade))));
  // PRODUCT-105: age-aware default weekly goal (stored as lessons/week; x10 ≈ answers) so a
  // kindergartner isn't defaulted to 120 answers/week like a high-schooler. Parents can change it.
  const defaultGoal = gradeNum <= 2 ? 6 : gradeNum <= 5 ? 9 : gradeNum <= 8 ? 12 : 15;
  const info = db.prepare('INSERT INTO kids (parent_id, name, grade, pin, avatar, calendar_mode, weekly_goal, consent_at) VALUES (?,?,?,?,?,?,?, datetime(\'now\'))')
    .run(req.parent.id, cleanName, gradeNum, auth.hashPin(String(pin)), AVATARS.includes(avatar) ? avatar : 'fox', calendar_mode || 'traditional', defaultGoal);
  // Record the parent's affirmative consent (auditable, versioned). If they've paid, the
  // card transaction on file already stands as the stronger verifiable consent.
  db.recordConsent({ parentId: req.parent.id, parentEmail: req.parent.email, kidId: info.lastInsertRowid, method: 'checkbox', detail: 'learner-creation' });
  res.json({ ok: true, kidId: info.lastInsertRowid });
});

router.patch('/kids/:kidId', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { name, grade, pin, avatar, calendar_mode, weekly_goal, show_level, games_enabled, games_gate, games_time_limit } = req.body || {};
  if (pin != null && pin !== '' && !/^\d{4}$/.test(String(pin))) return res.status(400).json({ error: 'PIN must be 4 digits.' });
  const gradeVal = grade != null && Number.isFinite(Number(grade)) ? Math.max(0, Math.min(12, Math.round(Number(grade)))) : null;
  // Validate avatar against the allow-list and bound the weekly goal (matches POST /kids).
  const avatarVal = AVATARS.includes(avatar) ? avatar : null;
  const goalVal = weekly_goal != null && Number.isFinite(Number(weekly_goal)) ? Math.max(10, Math.min(500, Math.round(Number(weekly_goal)))) : null;
  // Parent choice: whether the child sees their own grade-level placement (default hidden, so a
  // child who places below grade never has it shown to them). null = leave unchanged.
  const showLevelVal = show_level == null ? null : (show_level ? 1 : 0);
  // Parent choice: whether the Play Zone arcade is available to this child. null = leave unchanged.
  const gamesEnabledVal = games_enabled == null ? null : (games_enabled ? 1 : 0);
  // "Earn it" gate: questions required today before games unlock (0 = none). Bounded 0..100.
  const gamesGateVal = games_gate == null ? null : Math.max(0, Math.min(100, Math.round(Number(games_gate)) || 0));
  // Daily game time cap in minutes (0 = no limit). Bounded 0..240.
  const gamesTimeLimitVal = games_time_limit == null ? null : Math.max(0, Math.min(240, Math.round(Number(games_time_limit)) || 0));
  db.prepare(`UPDATE kids SET name=COALESCE(?,name), grade=COALESCE(?,grade), pin=COALESCE(?,pin),
              avatar=COALESCE(?,avatar), calendar_mode=COALESCE(?,calendar_mode), weekly_goal=COALESCE(?,weekly_goal), show_level=COALESCE(?,show_level), games_enabled=COALESCE(?,games_enabled), games_gate=COALESCE(?,games_gate), games_time_limit=COALESCE(?,games_time_limit) WHERE id=?`)
    .run(name ? String(name).trim().slice(0, 40) : null, gradeVal, pin ? auth.hashPin(String(pin)) : null, avatarVal, calendar_mode || null, goalVal, showLevelVal, gamesEnabledVal, gamesGateVal, gamesTimeLimitVal, kid.id);
  res.json({ ok: true });
});

router.delete('/kids/:kidId', auth.requireParent, (req, res) => {
  const kidId = Number(req.params.kidId);
  const kid = db.prepare('SELECT id FROM kids WHERE id=? AND parent_id=?').get(kidId, req.parent.id);
  if (kid) {
    // Deleting a learner is also a consent withdrawal — record it before the cascade wipes
    // the child's data, so the audit trail shows consent was withdrawn and data removed.
    db.recordConsent({ parentId: req.parent.id, parentEmail: req.parent.email, kidId, method: 'withdrawn', detail: 'learner-deleted' });
    db.prepare('DELETE FROM kids WHERE id=? AND parent_id=?').run(kidId, req.parent.id);
  }
  res.json({ ok: true });
});

// Start fresh: wipe a learner's LEARNING progress (levels, skills, answers, badges, certificates,
// scores, quests) and zero their counters, so their next session begins with a clean placement.
// Keeps the child's profile (name, grade, PIN, avatar & purchased cosmetics) and the consent trail.
router.post('/kids/:kidId/reset', auth.requireParent, (req, res) => {
  const kidId = Number(req.params.kidId);
  const kid = db.prepare('SELECT id FROM kids WHERE id=? AND parent_id=?').get(kidId, req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const wipe = ['activity_log', 'skill_state', 'subject_state', 'badges', 'certificates', 'game_scores', 'daily_quests', 'score_snapshots', 'game_progress', 'game_time'];
  const tx = db.transaction(() => {
    for (const t of wipe) { try { db.prepare(`DELETE FROM ${t} WHERE kid_id=?`).run(kidId); } catch (e) { /* table/column may not exist in older schemas */ } }
    try { db.prepare('UPDATE kids SET xp=0, coins=0, streak=0, play_tokens=0, last_active_day=NULL WHERE id=?').run(kidId); } catch (e) {}
  });
  tx();
  try { db.recordConsent({ parentId: req.parent.id, parentEmail: req.parent.email, kidId, method: 'checkbox', detail: 'progress-reset (start fresh)' }); } catch (e) {}
  res.json({ ok: true });
});

// ---------- parent data-control (COPPA: review, export, withdraw) ----------
// A parent can see exactly what's collected about their children and their consent history.
router.get('/privacy/summary', auth.requireParent, (req, res) => {
  const kids = db.prepare('SELECT id, name, grade, created_at, consent_at FROM kids WHERE parent_id=?').all(req.parent.id).map(k => {
    const answers = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=?').get(k.id).n;
    return { id: k.id, name: k.name, grade: k.grade, addedOn: k.created_at, consentOn: k.consent_at, dataPoints: { answers, profile: true } };
  });
  const paid = req.parent.sub_status === 'active';
  res.json({
    policyVersion: db.POLICY_VERSION,
    collected: ['Child\'s first name (or nickname)', 'Grade level', 'A 4-digit login PIN', 'Answers and progress in lessons'],
    usedFor: 'Running and adapting your child\'s lessons and showing you their progress. We do not sell children\'s data or use it for advertising.',
    consentMethod: paid ? 'payment_card' : 'checkbox',
    consentHistory: db.consentFor(req.parent.id),
    kids
  });
});
// Full machine-readable export of the family's data (parent's right to review/port).
router.get('/privacy/export', auth.requireParent, (req, res) => {
  const parent = { id: req.parent.id, name: req.parent.name, email: req.parent.email, created_at: req.parent.created_at, sub_status: req.parent.sub_status, sub_plan: req.parent.sub_plan };
  const kids = db.prepare('SELECT id, name, grade, avatar, calendar_mode, xp, coins, streak, created_at, consent_at FROM kids WHERE parent_id=?').all(req.parent.id).map(k => {
    k.subjectState = db.prepare('SELECT subject, level, placed FROM subject_state WHERE kid_id=?').all(k.id);
    k.skills = db.prepare('SELECT subject, skill_id, mastery, attempts, correct FROM skill_state WHERE kid_id=?').all(k.id);
    k.recentActivity = db.prepare('SELECT subject, skill_id, correct, ts FROM activity_log WHERE kid_id=? ORDER BY id DESC LIMIT 500').all(k.id);
    return k;
  });
  res.setHeader('Content-Disposition', 'attachment; filename="gallop-my-data.json"');
  res.json({ exportedAt: new Date().toISOString(), policyVersion: db.POLICY_VERSION, parent, kids, consentHistory: db.consentFor(req.parent.id) });
});

// ---------- learning (kid or parent-on-behalf) ----------
router.get('/learn/subjects', (req, res) => res.json({ subjects: content.subjectMeta() }));

router.get('/learn/:kidId/overview', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const owin = timeutil.dayWindow(tzForKid(req.kid.id));  // family-local "today" boundary
  const subjects = ['math', 'english', 'science', 'spanish'].map(sub => {
    const st = adaptive.getSubjectState(req.kid.id, sub);
    const meta = content.SUBJECTS[sub];
    const m = db.prepare('SELECT AVG(mastery) AS m FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').get(req.kid.id, sub);
    const today = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND subject=? AND ts >= ? AND ts < ?').get(req.kid.id, sub, owin.todayStart, owin.tomorrowStart);
    // attempts>0: score only skills the child has actually worked on, so the overview
    // number matches the report card instead of crediting untouched seeded skills.
    const srows = db.prepare('SELECT skill_id, mastery FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').all(req.kid.id, sub);
    const _demoLvl = Number.isFinite(st.demonstrated_level) ? st.demonstrated_level : -1;
    const gallopScore = srows.length ? gscore.subjectScore(sub, Object.fromEntries(srows.map(r => [r.skill_id, r.mastery])), st.placed ? _demoLvl : undefined) : null;
    // Recommendation signals (tester finding #2): an unresolved difficulty (a skill tried
    // several times and still stuck) and an overdue retention check should drive "Up Next"
    // ahead of mere daily subject rotation.
    const struggling = db.prepare('SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND subject=? AND attempts>=3 AND mastery < ?').get(req.kid.id, sub, adaptive.STRUGGLING).n;
    const retentionDue = db.prepare("SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND subject=? AND mastery >= ? AND (last_seen IS NULL OR last_seen < datetime('now','-3 days'))").get(req.kid.id, sub, adaptive.MASTERED).n;
    return { subject: sub, label: meta.label, emoji: meta.emoji, color: meta.color, level: st.level, levelName: adaptive.gradeName(Math.round(st.level)), placed: !!st.placed, avgMastery: m.m, answersToday: today.n || 0, gallopScore, struggling, retentionDue };
  });
  const _perSub = {}; subjects.forEach(s => { if (s.gallopScore != null) _perSub[s.subject] = s.gallopScore; });
  const gallopOverall = gscore.overall(_perSub);
  // Smart "Up Next" (tester finding #2): priority is (1) unresolved difficulty, then
  // (2) an overdue retention check, then (3) weakest subject — with daily "not practiced
  // today" rotation as only a gentle tiebreak, NOT the dominant factor it used to be.
  // (Explicit exam/goal deadlines aren't modeled per-learner yet — noted as remaining work.)
  let recommended = null;
  const placedSubs = subjects.filter(s => s.placed);
  if (!placedSubs.length) {
    recommended = { subject: subjects[0].subject, type: 'place' };
  } else {
    const priority = s => {
      let p = 0;
      if (s.struggling > 0) p += 100;                                   // unresolved difficulty first
      if (s.retentionDue > 0) p += 40;                                  // then overdue retention
      p += (1 - (s.avgMastery == null ? 0.5 : s.avgMastery)) * 20;      // then weakness
      if (s.answersToday > 0) p -= 3;                                   // gentle rotation nudge only
      return p;
    };
    const cand = [...placedSubs].sort((a, b) => priority(b) - priority(a))[0];
    const unplaced = subjects.find(s => !s.placed);
    const type = cand.struggling > 0 ? 'boost'
      : cand.retentionDue > 0 ? 'review'
      : (cand.avgMastery != null && cand.avgMastery < 0.5) ? 'boost'
      : cand.answersToday > 0 ? 'more' : 'fresh';
    // Only steer to a brand-new placement when nothing urgent is pending and everything's been touched today.
    if (unplaced && cand.struggling === 0 && cand.retentionDue === 0 && placedSubs.every(s => s.answersToday > 0)) {
      recommended = { subject: unplaced.subject, type: 'place' };
    } else {
      recommended = { subject: cand.subject, type };
    }
  }
  const week = db.prepare("SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-7 days')").get(req.kid.id);
  const lastWeek = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-14 days') AND ts < datetime('now','-7 days')").get(req.kid.id);
  const activeDays = db.prepare("SELECT DISTINCT date(ts) AS d FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-14 days')").all(req.kid.id).map(r => r.d);
  res.json({ kid: publicKid(db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id)), subjects, weekAnswers: week.n || 0, lastWeek: { answers: lastWeek.n || 0, correct: lastWeek.c || 0 }, recommended, activeDays, gallopOverall });
});

// placement quiz
router.post('/learn/:kidId/placement/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!validSubject(subject)) return res.status(404).json({ error: 'Unknown subject' });
  const key = `${req.kid.id}:${subject}`;
  const { answerIndex, questionAnswerIndex, probeGrade, reset, skillName } = req.body || {};
  if (reset) placements.delete(key);
  let history = placements.get(key) || [];
  if (answerIndex != null && probeGrade != null) {
    const isIdk = Number(answerIndex) === -1;              // "I haven't learned this yet"
    const wasCorrect = Number(answerIndex) === Number(questionAnswerIndex);
    // "Haven't learned this yet" is NOT a wrong answer — it's a signal to stop testing
    // higher, never a reason to demote the child (it must never sink them toward K). We
    // flag it so the placement engine caps the ceiling instead of descending on it.
    const missed = (!wasCorrect && !isIdk && skillName) ? String(skillName).slice(0, 80) : null;
    history.push({ grade: Number(probeGrade), correct: wasCorrect, idk: isIdk, missed });
    placements.set(key, history);
  }
  const result = adaptive.placementNext(req.kid.id, subject, history);
  if (result.done) {
    // Persist a de-duplicated list of missed concepts for the parent report before clearing.
    const missedNames = [...new Set(history.filter(h => h.missed).map(h => h.missed))].slice(0, 6);
    try { adaptive.savePlacementMissed(req.kid.id, subject, missedNames); } catch (e) { /* best-effort */ }
    placements.delete(key);
    return res.json({ done: true, level: result.level, levelName: adaptive.gradeName(Math.round(result.level)) });
  }
  const { question } = result;
  if (!question || !question.choices) return res.status(503).json({ error: 'Hiccup loading the question — tap to try again!' });
  const answerIdx = question.choices.indexOf(question.answer);
  res.json({
    done: false, probeGrade: result.probeGrade, progress: history.length,
    question: { prompt: question.prompt, choices: question.choices, voice: question.voice, passage: question.passage || null, clock: question.clock || null, answerIndex: answerIdx, skillName: question.skillName }
  });
});

// next activity in a subject
router.get('/learn/:kidId/next/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!validSubject(subject)) return res.status(404).json({ error: 'Unknown subject' });
  let activity = null;
  // Mission coherence: the client passes ?focus=<skillId> so a 10-question mission stays on
  // one skill until it's mastered (tester finding #1). Sanitize to a plausible skill id.
  const focusRaw = typeof req.query.focus === 'string' ? req.query.focus.slice(0, 64) : '';
  const focusSkill = /^[\w.\-]+$/.test(focusRaw) ? focusRaw : '';
  // "Too easy? Level me up" sends ?boost=1 so the very next item is served harder (P1.4).
  const hard = req.query.boost === '1';
  // A single flaky generator must never freeze a kid's session — retry, then fail soft.
  // A truthy activity whose question failed to generate (question:null) still counts as a
  // miss here, otherwise indexing qn.choices below would throw a 500 instead of the soft 503.
  for (let attempt = 0; attempt < 3 && !(activity && activity.question); attempt++) {
    try { activity = adaptive.nextActivity(req.kid.id, subject, { focusSkill, hard }); } catch (e) { activity = null; }
  }
  if (!activity || !activity.question) return res.status(503).json({ error: 'Hiccup loading the next question — tap to try again!' });
  const qn = activity.question;
  const answerIdx = qn.choices.indexOf(qn.answer);
  res.json({
    mode: activity.mode, level: activity.level, skill: activity.skill,
    question: {
      prompt: qn.prompt, choices: qn.choices, voice: qn.voice, hint: qn.hint, explain: qn.explain,
      whyWrong: qn.whyWrong || null,
      passage: qn.passage || null,
      clock: qn.clock || null,
      answerIndex: answerIdx, skillId: qn.skillId, skillName: qn.skillName, difficulty: qn.difficulty
    }
  });
});

// submit an answer
router.post('/learn/:kidId/answer', answerLimiter, auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject, skillId, correct, timeMs, difficulty, nonce } = req.body || {};
  if (!validSubject(subject) || !content.getSkill(subject, skillId))
    return res.status(400).json({ error: 'Bad subject/skill' });
  // Idempotency: if this exact answer submission was already recorded (double-tap / retry),
  // don't record it again — just return the current state so the UI stays consistent.
  const nonceStr = typeof nonce === 'string' ? nonce.slice(0, 80) : '';
  if (answerAlreadySeen(req.kid.id, nonceStr)) {
    const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
    const ss = db.prepare('SELECT mastery FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(req.kid.id, subject, skillId);
    return res.json({ duplicate: true, mastery: ss ? ss.mastery : 0.3, xpGained: 0, events: [], kid: publicKid(kid) });
  }
  // Never trust client-supplied difficulty/time — clamp to sane bounds so a crafted
  // request can't corrupt mastery, mint fake certificates, or inflate XP.
  let diff = Number(difficulty); diff = Number.isFinite(diff) ? Math.max(0, Math.min(1, diff)) : 0.5;
  const tRaw = Number(timeMs); const tMs = Number.isFinite(tRaw) && tRaw > 0 ? Math.min(tRaw, 600000) : null;
  const result = adaptive.recordAnswer(req.kid.id, subject, skillId, !!correct, tMs, diff, req.assistedSession);
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ...result, kid: publicKid(kid) });
});

// A child on the paywall can ask their parent to subscribe — emails the parent a one-click
// link. Rate-limited to once per day per family so it can't be used to spam.
router.post('/learn/:kidId/notify-parent', auth.requireKid, (req, res) => {
  try {
    const parent = db.prepare('SELECT * FROM parents WHERE id=?').get(req.kid.parent_id);
    if (!parent || !parent.email) return res.status(404).json({ error: 'No parent account.' });
    const recent = db.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind='child_request' AND created_at > datetime('now','-1 day') LIMIT 1").get(parent.email);
    if (!recent) mailer.sendChildSubscribeRequest(parent, req.kid);
    res.json({ ok: true });
  } catch (e) { res.json({ ok: true }); } // never surface an error to a child
});

// ---------- advanced exam-prep tracks (AP / Honors / Regents) ----------
// Separate from the adaptive ladder: track practice never changes a learner's
// subject level or mastery. It still logs activity (so it counts toward streak,
// daily quests, XP/coins) under a namespaced skill_id that the adaptive engine
// ignores.
const trackRecent = new Map(); // `${kidId}:${trackId}` -> [recent prompts]

router.get('/learn/tracks', (req, res) => res.json({ tracks: content.listTracks() }));

// Official AP exam blueprint + Gallop's current coverage for a track (reference data, public).
router.get('/learn/track/:trackId/blueprint', (req, res) => {
  const cov = content.apCoverage(req.params.trackId);
  if (!cov) return res.status(404).json({ error: 'No blueprint for this track.' });
  res.json({ blueprint: cov });
});

router.get('/learn/:kidId/track/:trackId/next', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { trackId } = req.params;
  const key = `${req.kid.id}:${trackId}`;
  const avoid = new Set(trackRecent.get(key) || []);
  let qn = null;
  for (let attempt = 0; attempt < 3 && !qn; attempt++) {
    try { qn = content.generateTrackQuestion(trackId, avoid); } catch (e) { qn = null; }
  }
  if (!qn || !qn.choices) return res.status(404).json({ error: 'That track has no questions yet.' });
  const recent = trackRecent.get(key) || [];
  recent.push(qn.prompt); while (recent.length > 12) recent.shift();
  trackRecent.set(key, recent);
  const answerIdx = qn.choices.indexOf(qn.answer);
  res.json({
    question: {
      prompt: qn.prompt, choices: qn.choices, voice: qn.voice, hint: qn.hint, explain: qn.explain,
      passage: qn.passage || null, answerIndex: answerIdx, trackId: qn.trackId, trackName: qn.trackName, exam: qn.exam, subject: qn.subject
    }
  });
});

router.post('/learn/:kidId/track/answer', answerLimiter, auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { trackId, correct } = req.body || {};
  const meta = content.listTracks().find(t => t.id === trackId) || null;
  if (!meta) return res.status(400).json({ error: 'Unknown track' });
  const isCorrect = !!correct;
  // Log under the track's subject so it counts toward streak/quests, but with a
  // namespaced skill_id ("track:<id>") that is never in any grade's skill list,
  // so settleLevel / mastery / Gallop Score are untouched.
  db.prepare('INSERT INTO activity_log (kid_id, subject, skill_id, correct, difficulty, time_ms) VALUES (?,?,?,?,?,?)')
    .run(req.kid.id, meta.subject, `track:${trackId}`, isCorrect ? 1 : 0, 0.9, Number((req.body || {}).timeMs) || null);
  const xp = isCorrect ? 15 : 3;
  db.prepare('UPDATE kids SET xp = xp + ?, coins = coins + ? WHERE id=?').run(xp, isCorrect ? 2 : 0, req.kid.id);
  try { adaptive.updateStreak(req.kid.id); } catch (e) {}
  // Update exam-readiness running MC stats for this track.
  try {
    trackProgressUpsert(req.kid.id, trackId, row => { row.mc_attempts += 1; if (isCorrect) row.mc_correct += 1; });
  } catch (e) {}
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ok: true, correct: isCorrect, xpEarned: xp, coinsEarned: isCorrect ? 2 : 0, kid: publicKid(kid) });
});

// ---------- Advanced Track: free-response, exam simulator, exam-readiness ----------
// Ensure a track_progress row exists, apply a mutation, persist. Kept isolated from the ladder.
function trackProgressRow(kidId, trackId) {
  let r = db.prepare('SELECT * FROM track_progress WHERE kid_id=? AND track_id=?').get(kidId, trackId);
  if (!r) {
    db.prepare('INSERT OR IGNORE INTO track_progress (kid_id, track_id) VALUES (?,?)').run(kidId, trackId);
    r = db.prepare('SELECT * FROM track_progress WHERE kid_id=? AND track_id=?').get(kidId, trackId);
  }
  return r;
}
function trackProgressUpsert(kidId, trackId, mutate) {
  const r = trackProgressRow(kidId, trackId);
  mutate(r);
  db.prepare(`UPDATE track_progress SET mc_attempts=?, mc_correct=?, frq_attempts=?, frq_points=?, frq_max=?, best_exam_score=?, last_exam_pct=?, updated_at=datetime('now') WHERE kid_id=? AND track_id=?`)
    .run(r.mc_attempts, r.mc_correct, r.frq_attempts, r.frq_points, r.frq_max, r.best_exam_score, r.last_exam_pct, kidId, trackId);
  return r;
}
// Estimated AP score band (1..5) from a composite percent — a practice estimate, not official.
function estBand(pct) { return pct >= 75 ? 5 : pct >= 62 ? 4 : pct >= 48 ? 3 : pct >= 33 ? 2 : 1; }
// Evidence thresholds before we're willing to show a 1–5 estimate at all. A handful of correct
// questions from one content slice cannot support a course-wide AP prediction (AP-P0.1), so below
// the threshold we return estBand=null and the UI says "not enough evidence yet".
const AP_MIN_MC = 25;         // meaningful multiple-choice sample
const AP_MIN_FRQ = 1;         // at least one free-response attempt (self-scored)
function readinessFor(r, trackId) {
  const mcPct = r.mc_attempts >= 1 ? Math.round(r.mc_correct / r.mc_attempts * 100) : null;
  const frqPct = r.frq_max >= 1 ? Math.round(r.frq_points / r.frq_max * 100) : null;
  // Composite for the readiness bar. FRQ is SELF-SCORED, so it is discounted (weighted 0.3, not
  // 0.55) rather than trusted like objective evidence.
  let composite = null;
  if (mcPct != null && frqPct != null) composite = Math.round(0.7 * mcPct + 0.3 * frqPct);
  else composite = mcPct != null ? mcPct : frqPct;
  // Only surface a 1–5 estimate once there's enough objective + constructed-response evidence.
  const enough = (r.mc_attempts >= AP_MIN_MC) && (r.frq_attempts >= AP_MIN_FRQ);
  const evidence = (r.mc_attempts || 0) + (r.frq_attempts || 0) * 3;   // FRQ counts as a bigger unit
  const confidence = !enough ? 'insufficient' : evidence >= 80 ? 'high' : evidence >= 45 ? 'medium' : 'low';
  const band = enough && composite != null ? estBand(composite) : null;
  // Low confidence → present a RANGE (±1 band) rather than a single false-precise number.
  const bandRange = band == null ? null : (confidence === 'high' ? [band, band] : [Math.max(1, band - 1), Math.min(5, band + (confidence === 'low' ? 1 : 0))]);
  return {
    trackId,
    mcPct, mcAttempts: r.mc_attempts,
    frqPct, frqAttempts: r.frq_attempts, frqPoints: r.frq_points, frqMax: r.frq_max,
    readiness: enough ? composite : null,          // hide the % until there's enough evidence
    estBand: band,                                 // null until the evidence threshold is met
    bandRange, confidence,
    needMoreMc: Math.max(0, AP_MIN_MC - (r.mc_attempts || 0)),
    needFrq: r.frq_attempts < AP_MIN_FRQ,
    bestExamScore: r.best_exam_score || null,
    lastExamPct: r.last_exam_pct || null
  };
}

// List the free-response questions available for a track (metadata only).
router.get('/learn/:kidId/track/:trackId/frqs', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const meta = content.getTrack(req.params.trackId);
  if (!meta) return res.status(404).json({ error: 'Unknown track' });
  res.json({ track: { id: meta.id, name: meta.name, exam: meta.exam, subject: meta.subject }, frqs: content.listFrqs(req.params.trackId) });
});

// Full free-response question (prompt + parts + model solutions + rubric). The client keeps
// solutions hidden until the student chooses to reveal and self-score.
router.get('/learn/:kidId/track/:trackId/frq/:frqId', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const f = content.getFrq(req.params.trackId, req.params.frqId);
  if (!f) return res.status(404).json({ error: 'Question not found' });
  const meta = content.getTrack(req.params.trackId);
  res.json({ frq: f, track: meta ? { id: meta.id, name: meta.name, exam: meta.exam, subject: meta.subject } : null });
});

// Record a free-response self-score.
router.post('/learn/:kidId/track/frq/score', answerLimiter, auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { trackId, frqId } = req.body || {};
  const f = content.getFrq(trackId, frqId);
  if (!f) return res.status(400).json({ error: 'Unknown question' });
  const meta = content.getTrack(trackId);
  const max = f.maxPoints;
  let earned = Number((req.body || {}).pointsEarned);
  if (!Number.isFinite(earned)) earned = 0;
  earned = Math.max(0, Math.min(max, Math.round(earned)));
  // PRODUCT-104: a self-score only counts toward the AP readiness estimate when the student
  // ACTUALLY attempted the problem (typed work, or spent real time on it before revealing). A
  // "reveal the model answer, then award full marks" peek is logged as light practice for a small
  // XP nudge but must NEVER inflate readiness or the constructed-response evidence count.
  const attempted = (req.body || {}).attempted === true;
  if (attempted) {
    db.prepare('INSERT INTO activity_log (kid_id, subject, skill_id, correct, difficulty, time_ms) VALUES (?,?,?,?,?,?)')
      .run(req.kid.id, meta.subject, `track:${trackId}`, earned >= max * 0.6 ? 1 : 0, 0.95, null);
    trackProgressUpsert(req.kid.id, trackId, row => { row.frq_attempts += 1; row.frq_points += earned; row.frq_max += max; });
  }
  const xp = attempted ? (20 + earned * 3) : 6;
  db.prepare('UPDATE kids SET xp = xp + ?, coins = coins + ? WHERE id=?').run(xp, attempted ? Math.max(2, earned) : 1, req.kid.id);
  try { adaptive.updateStreak(req.kid.id); } catch (e) {}
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ok: true, earned, max, xpEarned: xp, counted: attempted, kid: publicKid(kid) });
});

// Build an exam-simulator paper: a set of MC questions + one or more FRQs for the track.
router.get('/learn/:kidId/track/:trackId/exam', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const trackId = req.params.trackId;
  const meta = content.getTrack(trackId);
  if (!meta) return res.status(404).json({ error: 'Unknown track' });
  const MC_N = 10;
  const mc = [];
  const seen = new Set();
  for (let i = 0; i < MC_N * 4 && mc.length < MC_N; i++) {
    let q = null; try { q = content.generateTrackQuestion(trackId, seen); } catch (e) { q = null; }
    if (!q || !q.choices) break;
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    mc.push({ prompt: q.prompt, choices: q.choices, passage: q.passage || null, answerIndex: q.choices.indexOf(q.answer), explain: q.explain });
  }
  // One FRQ (rotate by a client-provided index if given).
  const frqs = content.listFrqs(trackId);
  let frq = null;
  if (frqs.length) {
    const idx = Math.max(0, Math.min(frqs.length - 1, Number(req.query.frq) || 0));
    frq = content.getFrq(trackId, frqs[idx].id);
  }
  res.json({
    track: { id: meta.id, name: meta.name, exam: meta.exam, subject: meta.subject },
    mc, frq, timeSuggestSec: MC_N * 90 + (frq ? 900 : 0)
  });
});

// Score a completed exam simulation → estimated band (1..5).
router.post('/learn/:kidId/track/exam/score', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const b = req.body || {};
  const trackId = String(b.trackId || '');
  const meta = content.getTrack(trackId);
  if (!meta) return res.status(400).json({ error: 'Unknown track' });
  const mcTotal = Math.max(0, Number(b.mcTotal) || 0);
  const mcCorrect = Math.max(0, Math.min(mcTotal, Number(b.mcCorrect) || 0));
  const frqMax = Math.max(0, Number(b.frqMax) || 0);
  const frqPoints = Math.max(0, Math.min(frqMax, Number(b.frqPoints) || 0));
  const mcPct = mcTotal ? mcCorrect / mcTotal * 100 : null;
  const frqPct = frqMax ? frqPoints / frqMax * 100 : null;
  let composite;
  // FRQ is self-scored, so discount it (0.7 MC / 0.3 FRQ) in the mini-mock result too.
  if (mcPct != null && frqPct != null) composite = Math.round(0.7 * mcPct + 0.3 * frqPct);
  else composite = Math.round(mcPct != null ? mcPct : (frqPct != null ? frqPct : 0));
  const band = estBand(composite);
  db.prepare('INSERT INTO activity_log (kid_id, subject, skill_id, correct, difficulty, time_ms) VALUES (?,?,?,?,?,?)')
    .run(req.kid.id, meta.subject, `track:${trackId}`, composite >= 60 ? 1 : 0, 1.0, Number(b.timeMs) || null);
  const xp = 40 + band * 15;
  db.prepare('UPDATE kids SET xp = xp + ?, coins = coins + ? WHERE id=?').run(xp, 10, req.kid.id);
  try { adaptive.updateStreak(req.kid.id); } catch (e) {}
  trackProgressUpsert(req.kid.id, trackId, row => {
    row.last_exam_pct = composite;
    if (band > (row.best_exam_score || 0)) row.best_exam_score = band;
    // Fold the exam's MC + FRQ into running readiness too.
    row.mc_attempts += mcTotal; row.mc_correct += mcCorrect;
    if (frqMax) { row.frq_attempts += 1; row.frq_points += frqPoints; row.frq_max += frqMax; }
  });
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ok: true, composite, band, mcPct: mcPct == null ? null : Math.round(mcPct), frqPct: frqPct == null ? null : Math.round(frqPct), xpEarned: xp, kid: publicKid(kid) });
});

// Exam-readiness snapshot for a track (or all tracks the student has touched).
router.get('/learn/:kidId/track/:trackId/progress', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const r = trackProgressRow(req.kid.id, req.params.trackId);
  res.json({ progress: readinessFor(r, req.params.trackId) });
});
router.get('/learn/:kidId/tracks/progress', auth.requireKid, (req, res) => {
  const rows = db.prepare('SELECT * FROM track_progress WHERE kid_id=?').all(req.kid.id);
  const out = {};
  for (const r of rows) out[r.track_id] = readinessFor(r, r.track_id);
  res.json({ progress: out });
});

// report card (kid-safe view + parent view share this)
router.get('/learn/:kidId/achievements', auth.requireKid, (req, res) => {
  res.json(adaptive.achievements(req.kid.id));
});

router.get('/learn/:kidId/report', auth.requireKid, (req, res) => {
  res.json(adaptive.reportCard(req.kid.id));
});

// Lightweight strengths for the Career Explorer — per-subject strength scores used to match
// a child to career fields (far cheaper than the full report). Works for a kid or a parent-on-behalf.
router.get('/learn/:kidId/careers', auth.requireKid, (req, res) => {
  try { res.json({ career: adaptive.careerInsights(req.kid.id) }); }
  catch (e) { res.json({ career: null }); }
});

// ---------- daily quests ----------
const QUEST_BONUS_COINS = 10;
function questStatus(kidId) {
  const t = db.prepare(`SELECT COUNT(*) AS answers, SUM(correct) AS correct, COUNT(DISTINCT subject) AS subjects
                        FROM activity_log WHERE kid_id=? AND date(ts)=date('now')`).get(kidId);
  const quests = [
    { id: 'answers', emoji: '📝', label: 'Answer 10 questions', progress: Math.min(10, t.answers || 0), target: 10 },
    { id: 'correct', emoji: '🎯', label: 'Get 7 correct', progress: Math.min(7, t.correct || 0), target: 7 },
    { id: 'subjects', emoji: '🌈', label: 'Practice 2 different subjects', progress: Math.min(2, t.subjects || 0), target: 2 }
  ].map(q => ({ ...q, done: q.progress >= q.target }));
  const claimed = db.prepare("SELECT bonus_claimed FROM daily_quests WHERE kid_id=? AND day=date('now')").get(kidId);
  return { quests, allDone: quests.every(q => q.done), claimed: !!(claimed && claimed.bonus_claimed), bonusCoins: QUEST_BONUS_COINS };
}

router.get('/learn/:kidId/quests', auth.requireKid, (req, res) => {
  res.json(questStatus(req.kid.id));
});

router.post('/learn/:kidId/quests/claim', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const st = questStatus(req.kid.id);
  if (!st.allDone) return res.status(400).json({ error: 'Quests not finished yet — keep going!' });
  if (st.claimed) return res.json({ ok: true, alreadyClaimed: true });
  db.prepare("INSERT OR REPLACE INTO daily_quests (kid_id, day, bonus_claimed) VALUES (?, date('now'), 1)").run(req.kid.id);
  db.prepare('UPDATE kids SET coins = coins + ? WHERE id=?').run(QUEST_BONUS_COINS, req.kid.id);
  const kid = db.prepare('SELECT coins FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ok: true, coinsEarned: QUEST_BONUS_COINS, coins: kid.coins });
});

// Retake a placement assessment (fresh start for that subject's level)
router.post('/learn/:kidId/placement/:subject/retake', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!validSubject(subject)) return res.status(404).json({ error: 'Unknown subject' });
  db.prepare('UPDATE subject_state SET placed=0 WHERE kid_id=? AND subject=?').run(req.kid.id, subject);
  placements.delete(`${req.kid.id}:${subject}`);
  res.json({ ok: true });
});

// Kid taps "Too tricky?" — gallop back one level (or "Ready for more" — up one)
router.post('/learn/:kidId/level-shift/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!validSubject(subject)) return res.status(404).json({ error: 'Unknown subject' });
  const delta = Number((req.body || {}).delta) < 0 ? -1 : 1;
  const state = adaptive.getSubjectState(req.kid.id, subject);
  const newLevel = adaptive.setLevel(req.kid.id, subject, Math.round(state.level) + delta);
  res.json({ ok: true, level: newLevel, levelName: adaptive.gradeName(newLevel) });
});

// Parent view + set a learner's per-subject levels (from the ✏️ edit panel)
router.get('/kids/:kidId/levels', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const levels = Object.keys(content.SUBJECTS).map(sub => {
    const st = db.prepare('SELECT level, placed, level_src, level_set_at, prev_level FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, sub);
    return { subject: sub, label: adaptive.subjectLabel(sub), placed: !!(st && st.placed),
             level: st ? Math.round(st.level) : null,
             levelName: st && st.placed ? adaptive.gradeName(Math.round(st.level)) : 'Not placed yet',
             setByParent: !!(st && st.level_src === 'parent'),
             setAt: st && st.level_set_at ? String(st.level_set_at).slice(0, 10) : null,
             prevAdaptive: st && st.prev_level != null ? adaptive.gradeName(Math.round(st.prev_level)) : null,
             max: adaptive.maxGrade(sub) };
  });
  res.json({ levels });
});
router.post('/kids/:kidId/level', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { subject, level } = req.body || {};
  if (!validSubject(subject) || level == null || !Number.isFinite(Number(level))) return res.status(400).json({ error: 'Need a subject and a valid level.' });
  // Capture the level Gallop had BEFORE this manual override (only the first time, so repeated
  // parent tweaks don't overwrite the true adaptive baseline) so "return to adaptive" can restore it.
  const before = db.prepare('SELECT level, level_src, prev_level FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, subject);
  const prev = before && before.level_src === 'parent' && before.prev_level != null ? before.prev_level : (before ? before.level : null);
  const newLevel = adaptive.setLevel(kid.id, subject, Number(level), { authoritative: true });
  db.prepare("UPDATE subject_state SET level_src='parent', level_set_at=datetime('now'), prev_level=? WHERE kid_id=? AND subject=?").run(prev, kid.id, subject);
  res.json({ ok: true, level: newLevel, levelName: adaptive.gradeName(newLevel) });
});
// Return a subject to Gallop's adaptive placement: clear the parent override and restore the
// adaptive level Gallop had before the manual change, so the engine continues from there (PP-106).
router.post('/kids/:kidId/level/adaptive', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { subject } = req.body || {};
  if (!validSubject(subject)) return res.status(400).json({ error: 'Need a subject.' });
  const st = db.prepare('SELECT prev_level FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, subject);
  if (st && st.prev_level != null) adaptive.setLevel(kid.id, subject, Math.round(st.prev_level), { authoritative: true });
  db.prepare("UPDATE subject_state SET level_src=NULL, level_set_at=NULL, prev_level=NULL WHERE kid_id=? AND subject=?").run(kid.id, subject);
  const cur = db.prepare('SELECT level FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, subject);
  res.json({ ok: true, levelName: cur ? adaptive.gradeName(Math.round(cur.level)) : null });
});

// ---------- admin (owner only) ----------
router.get('/admin/overview', auth.requireAdmin, (req, res) => {
  // Test accounts (from development/QA) are excluded from business numbers
  const TEST_SQL = "(email LIKE '%@example.com' OR email LIKE '%@t.com' OR email LIKE '%gallop-test.com')";
  const testIds = db.prepare(`SELECT id FROM parents WHERE ${TEST_SQL}`).all().map(r => r.id);
  const pNot = testIds.length ? `id NOT IN (${testIds.join(',')})` : '1=1';
  const kNot = testIds.length ? `parent_id NOT IN (${testIds.join(',')})` : '1=1';
  const realKidIds = db.prepare(`SELECT id FROM kids WHERE ${kNot}`).all().map(r => r.id);
  const aIn = realKidIds.length ? `kid_id IN (${realKidIds.join(',')})` : '1=0';
  const g = q => db.prepare(q).get();
  const totals = {
    parents: g(`SELECT COUNT(*) AS n FROM parents WHERE ${pNot}`).n,
    kids: realKidIds.length,
    answersAllTime: g(`SELECT COUNT(*) AS n FROM activity_log WHERE ${aIn}`).n,
    answersWeek: g(`SELECT COUNT(*) AS n FROM activity_log WHERE ${aIn} AND ts >= datetime('now','-7 days')`).n,
    answersToday: g(`SELECT COUNT(*) AS n FROM activity_log WHERE ${aIn} AND date(ts)=date('now')`).n,
    activeKidsWeek: g(`SELECT COUNT(DISTINCT kid_id) AS n FROM activity_log WHERE ${aIn} AND ts >= datetime('now','-7 days')`).n,
    certificates: g(`SELECT COUNT(*) AS n FROM certificates WHERE ${aIn.replace(/kid_id/g, 'kid_id')}`).n,
    testAccounts: testIds.length
  };
  const byStatus = Object.fromEntries(db.prepare(`SELECT sub_status, COUNT(*) AS n FROM parents WHERE ${pNot} GROUP BY sub_status`).all().map(r => [r.sub_status, r.n]));
  const activeByPlan = db.prepare(`SELECT sub_plan, COUNT(*) AS n FROM parents WHERE sub_status='active' AND ${pNot} GROUP BY sub_plan`).all();
  // Source MRR from the live plan prices so it can't drift from what customers are charged.
  const mrr = activeByPlan.reduce((t, r) => t + ((billing.PLANS[r.sub_plan] || {}).priceMonthly || 0) * r.n, 0);
  const signups = db.prepare(`SELECT date(created_at) AS d, COUNT(*) AS n FROM parents WHERE ${pNot} AND created_at >= datetime('now','-14 days') GROUP BY date(created_at)`).all();
  const recent = db.prepare(`SELECT p.id, p.email, p.name, p.sub_status, p.sub_plan, p.trial_ends, p.created_at,
      (SELECT COUNT(*) FROM kids k WHERE k.parent_id=p.id) AS kids,
      (SELECT COUNT(*) FROM activity_log a JOIN kids k2 ON a.kid_id=k2.id WHERE k2.parent_id=p.id AND a.ts >= datetime('now','-7 days')) AS weekAnswers
    FROM parents p WHERE ${pNot.replace(/^id/, 'p.id')} ORDER BY p.created_at DESC LIMIT 25`).all();
  const gradeBands = db.prepare(`SELECT CASE WHEN grade<=2 THEN 'K-2' WHEN grade<=5 THEN '3-5' WHEN grade<=8 THEN '6-8' ELSE '9-12' END AS band, COUNT(*) AS n FROM kids WHERE ${kNot} GROUP BY band`).all();
  res.json({ totals, byStatus, mrr, signups, recent, gradeBands });
});

// CSV export of real families (admin)
router.get('/admin/export.csv', auth.requireAdmin, (req, res) => {
  const TEST_SQL = "(email LIKE '%@example.com' OR email LIKE '%@t.com' OR email LIKE '%gallop-test.com')";
  const rows = db.prepare(`SELECT p.name, p.email, p.sub_status, p.sub_plan, p.created_at, p.trial_ends,
      (SELECT COUNT(*) FROM kids k WHERE k.parent_id=p.id) AS kids,
      (SELECT COUNT(*) FROM activity_log a JOIN kids k2 ON a.kid_id=k2.id WHERE k2.parent_id=p.id) AS totalAnswers
    FROM parents p WHERE NOT ${TEST_SQL} ORDER BY p.created_at DESC`).all();
  // Quote every cell AND neutralize spreadsheet formula injection: a value beginning
  // with = + - @ (or tab/CR) is prefixed with ' so Excel/Sheets treats it as text.
  const csvCell = v => {
    let s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = ['name,email,status,plan,joined,trial_ends,kids,total_answers',
    ...rows.map(r => [r.name, r.email, r.sub_status, r.sub_plan, r.created_at, r.trial_ends, r.kids, r.totalAnswers].map(csvCell).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="gallop-families.csv"');
  res.send(csv);
});

// ---------- family weekly stats (sibling leaderboard) ----------
router.get('/family/stats', auth.requireParent, (req, res) => {
  const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(req.parent.id);
  const stats = kids.map(k => {
    const w = db.prepare("SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-7 days')").get(k.id);
    const wAcc = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND ts >= datetime('now','-7 days')").get(k.id);
    return { id: k.id, name: k.name, avatar: k.avatar, streak: k.streak, weekAnswers: w.n || 0, weekAccuracy: wAcc.n ? Math.round((wAcc.c || 0) / wAcc.n * 100) : null };
  }).sort((a, b) => b.weekAnswers - a.weekAnswers);
  res.json({ stats });
});

// Actionable per-child snapshot for the dashboard: how each child is doing this week,
// their overall pace status, and the exact skill they're struggling with (with a deep
// link so a parent can launch focused practice on it in one tap).
router.get('/family/overview', auth.requireParent, (req, res) => {
  const STRUGGLING = 0.45;
  const win = timeutil.dayWindow(tzForParent(req.parent.id));  // family-local day/week boundaries
  const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(req.parent.id);
  const out = kids.map(k => {
    // weekAnswers counts ALL work (engagement/goal); weekAccuracy excludes optional Advanced
    // Track (AP/honors) so the accuracy figure is a fair grade-level read, matching the report.
    const w = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ?').get(k.id, win.weekStart);
    const wAcc = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND (assisted IS NULL OR assisted=0) AND ts >= ?").get(k.id, win.weekStart);
    const totalAns = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=?').get(k.id).n;
    // The skills this child is genuinely stuck on, hardest first — this is "where they need help".
    const struggles = db.prepare(
      `SELECT subject, skill_id, mastery FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<? ORDER BY mastery ASC LIMIT 2`
    ).all(k.id, STRUGGLING);
    const focus = struggles.map(s => { const sk = content.getSkill(s.subject, s.skill_id); return { subject: s.subject, skillId: s.skill_id, name: sk ? sk.name : s.skill_id }; });
    // Overall pace + growth: the report card computes both (and writes today's score snapshot).
    let overall = 'getting-started', gallop = null, gallopDelta = null;
    try {
      const card = adaptive.reportCard(k.id);
      // A pace verdict needs real evidence. 'building' (subject not started) and 'insufficient'
      // (placed but too few answers) are NO-DATA states, not "on track" — excluding them means a
      // brand-new learner with zero answers stays 'getting-started' instead of a false green
      // "On track" (P0-5). Only judge overall when at least one subject has a real verdict.
      const st = (card.subjects || []).map(s => s.status).filter(x => x && x !== 'insufficient' && x !== 'building');
      if (totalAns > 0 && st.length) {
        if (st.some(s => s === 'needs-support')) overall = 'needs-support';
        else if (st.every(s => s === 'excelling')) overall = 'excelling';
        else if (st.some(s => s === 'developing')) overall = 'developing';
        else overall = 'on-track';
      }
      if (card.gallop) { gallop = card.gallop.overall; gallopDelta = (card.gallop.deltas && card.gallop.deltas.overall) || null; }
    } catch (e) {}
    const todayAns = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ?').get(k.id, win.todayStart, win.tomorrowStart).n;
    // Today's work split by subject (with accuracy) so a parent can see WHAT their child
    // worked on today, not just the total — e.g. "40 Math · 30 Reading · 20 Science".
    const todayBySubject = db.prepare(
      'SELECT subject, COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ? GROUP BY subject ORDER BY n DESC'
    ).all(k.id, win.todayStart, win.tomorrowStart)
      .map(r => ({ subject: r.subject, count: r.n, accuracy: r.n ? Math.round((r.c || 0) / r.n * 100) : null }));
    return {
      id: k.id, name: k.name, grade: k.grade, avatar: k.avatar, streak: k.streak, xp: k.xp,
      weekAnswers: w.n || 0, weekAccuracy: wAcc.n ? Math.round((wAcc.c || 0) / wAcc.n * 100) : null,
      weeklyGoal: (k.weekly_goal || 12) * 10, totalAnswers: totalAns, needsSetup: totalAns === 0,
      todayAnswers: todayAns, todayBySubject, minutesToday: learnMinutesBetween(k.id, win.todayStart, win.tomorrowStart), minutesWeek: learnMinutesBetween(k.id, win.weekStart),
      overall, focus, gallop, gallopDelta
    };
  });
  res.json({ kids: out });
});

// Monthly growth recap — the longer arc a parent celebrates: score trend, grades completed,
// skills mastered, and consistency over the last 30 days. Every figure comes from real data.
router.get('/family/monthly', auth.requireParent, (req, res) => {
  const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(req.parent.id);
  const out = kids.map(k => {
    const ans = db.prepare("SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts>=datetime('now','-30 days')").get(k.id).n;
    // Accuracy excludes optional Advanced-Track (AP/honors), matching the report & dashboard.
    const accR = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND ts>=datetime('now','-30 days')").get(k.id);
    const days = db.prepare("SELECT COUNT(DISTINCT date(ts)) AS d FROM activity_log WHERE kid_id=? AND ts>=datetime('now','-30 days')").get(k.id).d;
    // Grades COMPLETED this month = certificates issued this month (a certificate is a level completion).
    const certs = db.prepare("SELECT subject, title FROM certificates WHERE kid_id=? AND issued_at>=datetime('now','-30 days') ORDER BY issued_at DESC").all(k.id);
    const badges = db.prepare("SELECT COUNT(*) AS n FROM badges WHERE kid_id=? AND earned_at>=datetime('now','-30 days')").get(k.id).n || 0;
    // Skills mastered = cumulative count at ≥80% mastery (a real, defensible achievement tally).
    const mastered = db.prepare("SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND mastery>=0.8").get(k.id).n || 0;
    // Gallop Score + 30-day change (from the daily snapshots the report writes).
    const cur = db.prepare("SELECT score FROM score_snapshots WHERE kid_id=? AND subject='overall' ORDER BY day DESC LIMIT 1").get(k.id);
    const prior = db.prepare("SELECT score FROM score_snapshots WHERE kid_id=? AND subject='overall' AND day<=date('now','-30 days') ORDER BY day DESC LIMIT 1").get(k.id);
    const earliest = db.prepare("SELECT score, day FROM score_snapshots WHERE kid_id=? AND subject='overall' ORDER BY day ASC LIMIT 1").get(k.id);
    let gallop = cur ? cur.score : null, gallopDelta = null, sinceStart = false;
    if (cur) { const base = prior || earliest; if (base && base.score != null) { gallopDelta = cur.score - base.score; sinceStart = !prior; } }
    return {
      id: k.id, name: k.name, avatar: k.avatar, grade: k.grade,
      monthAnswers: ans, monthAccuracy: accR.n ? Math.round((accR.c || 0) / accR.n * 100) : null,
      activeDays: days, certs, badges, skillsMastered: mastered, gallop, gallopDelta, sinceStart
    };
  }).filter(k => k.monthAnswers > 0);
  res.json({ kids: out });
});

// ---------- billing ----------
router.post('/billing/checkout', auth.requireParent, async (req, res) => {
  try {
    const origin = `${req.protocol}://${req.get('host')}`;
    const plan = billing.PLANS[req.body.plan] ? req.body.plan : 'family';
    const autoRenew = !(req.body.autorenew === false || req.body.autorenew === '0'); // default ON
    const out = await billing.createCheckout(req.parent, plan, origin, autoRenew);
    res.json(out);
  } catch (e) { res.status(500).json({ error: 'Billing error: ' + e.message }); }
});

router.post('/billing/portal', auth.requireParent, async (req, res) => {
  try {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.json(await billing.createPortal(req.parent, origin));
  } catch (e) { res.status(500).json({ error: 'Billing error: ' + e.message }); }
});

// ---------- email: newsletter capture, unsubscribe, admin export ----------
const newsletterLimiter = rateLimit({ windowMs: 15 * 60000, max: 10, key: 'newsletter' });
router.post('/newsletter', newsletterLimiter, (req, res) => {
  const email = String((req.body || {}).email || '').toLowerCase().trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'That email doesn\'t look right — double-check it?' });
  const src = (req.body || {}).source === 'signup' ? 'signup' : 'landing';
  try { db.prepare('INSERT OR IGNORE INTO newsletter_subs (email, source) VALUES (?, ?)').run(email, src); } catch (e) {}
  res.json({ ok: true });
});

// B2B lead capture — the "Book a demo / request pricing" form on /schools. Stores the lead
// durably and notifies the team by email. Rate-limited against spam. A school filling this
// out is their own action; we only record and forward it.
const schoolLimiter = rateLimit({ windowMs: 15 * 60000, max: 8, key: 'school' });
router.post('/schools/inquiry', schoolLimiter, (req, res) => {
  const b = req.body || {};
  const clean = s => String(s == null ? '' : s).trim().slice(0, 2000);
  const lead = {
    school: clean(b.school), name: clean(b.name), email: clean(b.email).toLowerCase(),
    phone: clean(b.phone), role: clean(b.role), students: clean(b.students),
    interest: clean(b.interest), message: clean(b.message)
  };
  if (!lead.name || !EMAIL_RE.test(lead.email)) {
    return res.status(400).json({ error: 'Please share your name and a valid email so we can reach you.' });
  }
  try {
    db.prepare('INSERT INTO school_leads (school,name,email,phone,role,students,interest,message) VALUES (?,?,?,?,?,?,?,?)')
      .run(lead.school, lead.name, lead.email, lead.phone, lead.role, lead.students, lead.interest, lead.message);
  } catch (e) {}
  try { mailer.sendSchoolLead(lead); } catch (e) {}
  res.json({ ok: true });
});

// Admin: school leads as CSV for follow-up.
router.get('/admin/school-leads.csv', auth.requireAdmin, (req, res) => {
  const csvCell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const rows = db.prepare('SELECT created_at, school, name, email, phone, role, students, interest, message FROM school_leads ORDER BY id DESC').all();
  const out = ['created_at,school,name,email,phone,role,students,interest,message',
    ...rows.map(r => [r.created_at, r.school, r.name, r.email, r.phone, r.role, r.students, r.interest, r.message].map(csvCell).join(','))];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="gallop-school-leads.csv"');
  res.send(out.join('\n'));
});

// ============================================================================
// TEACHER / SCHOOL DASHBOARD
// A teacher account is a parents row with account_type='teacher'. It owns students
// (kids rows, parent_id = teacher id) grouped into classes. All the adaptive engine,
// lessons, games, and reporting are reused unchanged; only the ownership grouping and
// the dashboard views are new. Every route is strictly scoped to the signed-in teacher.
// ============================================================================
const TEACHER_SUBJECTS = ['math', 'english', 'science', 'spanish'];

function requireTeacher(req, res, next) {
  const s = auth.getSession(req.cookies.bp_session);
  if (!s || s.kind !== 'parent') return res.status(401).json({ error: 'Not signed in' });
  const p = db.prepare('SELECT * FROM parents WHERE id=?').get(s.ref_id);
  if (!p) return res.status(401).json({ error: 'Account not found' });
  if (p.account_type !== 'teacher') return res.status(403).json({ error: 'This area is for school accounts.' });
  req.parent = p;
  next();
}

function genJoinCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous O/0/I/1
  for (let attempt = 0; attempt < 12; attempt++) {
    let c = ''; for (let i = 0; i < 6; i++) c += A[Math.floor(Math.random() * A.length)];
    if (!db.prepare('SELECT 1 FROM classes WHERE join_code=?').get(c)) return c;
  }
  return 'C' + Date.now().toString(36).toUpperCase().slice(-5);
}
function genPin() { return String(Math.floor(1000 + Math.random() * 9000)); }
function genSchoolCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 12; attempt++) {
    let c = 'S'; for (let i = 0; i < 5; i++) c += A[Math.floor(Math.random() * A.length)];
    if (!db.prepare('SELECT 1 FROM schools WHERE code=?').get(c)) return c;
  }
  return 'S' + Date.now().toString(36).toUpperCase().slice(-5);
}
// Which teacher account ids this teacher may READ. Own always; a head of school may read every
// member teacher's classes/students. Writes stay owner-only (checked separately).
function readScopeIds(parent) {
  if (parent.school_id && parent.school_role === 'head') {
    const ids = db.prepare('SELECT id FROM parents WHERE school_id=?').all(parent.school_id).map(r => r.id);
    return ids.length ? ids : [parent.id];
  }
  return [parent.id];
}
function classForRead(parent, id) {
  const ids = readScopeIds(parent);
  const ph = ids.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM classes WHERE id=? AND owner_id IN (${ph})`).get(id, ...ids);
}
function kidForRead(parent, kidId) {
  const ids = readScopeIds(parent);
  const ph = ids.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM kids WHERE id=? AND parent_id IN (${ph})`).get(kidId, ...ids);
}
function schoolContext(parent) {
  if (!parent.school_id) return null;
  const s = db.prepare('SELECT id, name, code, head_id FROM schools WHERE id=?').get(parent.school_id);
  if (!s) return null;
  return { id: s.id, name: s.name, code: parent.school_role === 'head' ? s.code : undefined, isHead: parent.school_role === 'head' };
}

// Build one roster row (per-student snapshot) for the class dashboard. Honest, lightweight
// stats straight from activity — no heavy report-card computation per student.
function teacherRosterRow(kid, win) {
  const subjects = TEACHER_SUBJECTS.map(sub => {
    const st = db.prepare('SELECT level, placed FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, sub);
    return {
      subject: sub,
      placed: !!(st && st.placed),
      level: st ? st.level : null,
      levelName: st && st.placed ? adaptive.gradeName(Math.round(st.level)) : null
    };
  });
  const week = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND ts >= ?").get(kid.id, win.weekStart);
  const weekAll = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ?').get(kid.id, win.weekStart);
  const today = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ?').get(kid.id, win.todayStart, win.tomorrowStart);
  const struggles = db.prepare('SELECT subject, skill_id, mastery FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<0.45 ORDER BY mastery ASC LIMIT 3').all(kid.id);
  const topStruggle = struggles[0] ? (() => { const sk = content.getSkill(struggles[0].subject, struggles[0].skill_id); return { subject: struggles[0].subject, name: sk ? sk.name : struggles[0].skill_id }; })() : null;
  const weekAccuracy = week.n ? Math.round((week.c || 0) / week.n * 100) : null;
  const totalAns = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=?').get(kid.id).n;
  let status = 'inactive';
  if (weekAll.n > 0) {
    if (struggles.length >= 1 || (weekAccuracy != null && weekAccuracy < 60)) status = 'needs-support';
    else if (weekAccuracy != null && weekAccuracy >= 85) status = 'excelling';
    else status = 'on-track';
  } else if (totalAns === 0) status = 'not-started';
  return {
    id: kid.id, name: kid.name, grade: kid.grade, avatar: kid.avatar,
    streak: kid.streak || 0, lastActive: kid.last_active_day || null,
    subjects, weekAnswers: weekAll.n || 0, weekAccuracy,
    todayAnswers: today.n || 0, minutesWeek: learnMinutesBetween(kid.id, win.weekStart),
    strugglesCount: struggles.length, topStruggle, totalAnswers: totalAns, status
  };
}

function classPublic(c, studentCount) {
  return { id: c.id, name: c.name, grade: c.grade, joinCode: c.join_code, joinEnabled: c.join_enabled == null ? 1 : c.join_enabled, ownerId: c.owner_id, createdAt: c.created_at, studentCount };
}

// ---- Teacher signup (creates a school account) ----
router.post('/teacher/signup', loginLimiter, (req, res) => {
  const { email, name, password, school } = req.body || {};
  if (!email || !name || !password || String(password).length < 8)
    return res.status(400).json({ error: 'Need your name, email, and a password of 8+ characters.' });
  if (!EMAIL_RE.test(String(email).trim()))
    return res.status(400).json({ error: 'That email address doesn\'t look right — double-check it?' });
  if ((req.body || {}).consent !== true)
    return res.status(400).json({ error: 'Please agree to the Terms and Privacy Policy to continue.' });
  try {
    const id = auth.createParent(email, name, password);
    db.prepare("UPDATE parents SET account_type='teacher', school_name=? WHERE id=?").run(String(school || '').trim().slice(0, 120) || null, id);
    auth.syncAdminFlag(db.prepare('SELECT * FROM parents WHERE id=?').get(id));
    try { db.recordConsent({ parentId: id, parentEmail: String(email).trim(), method: 'school-signup', detail: 'teacher account: agreed to Terms & Privacy Policy' }); } catch (e) {}
    const token = auth.createSession('parent', id);
    res.cookie('bp_session', token, COOKIE_OPTS);
    res.json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      const p = auth.verifyParent(email, password);
      if (p && p.account_type === 'teacher') {
        const token = auth.createSession('parent', p.id);
        res.cookie('bp_session', token, COOKIE_OPTS);
        return res.json({ ok: true, existing: true });
      }
      return res.status(400).json({ error: 'That email already has an account. Try logging in instead.' });
    }
    res.status(500).json({ error: 'Could not create the account.' });
  }
});

// ---- Overview: all classes + org-wide stats ----
router.get('/teacher/overview', requireTeacher, (req, res) => {
  const win = timeutil.dayWindow(req.parent.tz);
  const classes = db.prepare('SELECT * FROM classes WHERE owner_id=? ORDER BY created_at').all(req.parent.id);
  const out = classes.map(c => {
    const ids = db.prepare('SELECT kid_id FROM class_members WHERE class_id=?').all(c.id).map(r => r.kid_id);
    let activeWeek = 0;
    for (const kid of ids) { const n = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ?').get(kid, win.weekStart).n; if (n > 0) activeWeek++; }
    return { ...classPublic(c, ids.length), activeWeek };
  });
  // Org totals (distinct students across the teacher's account)
  const allKids = db.prepare('SELECT id, last_active_day FROM kids WHERE parent_id=?').all(req.parent.id);
  let activeToday = 0, needingSupport = 0, answersWeek = 0;
  for (const k of allKids) {
    const t = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ?').get(k.id, win.todayStart, win.tomorrowStart).n;
    if (t > 0) activeToday++;
    const wk = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND ts >= ?").get(k.id, win.weekStart);
    answersWeek += wk.n || 0;
    const struggles = db.prepare('SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<0.45').get(k.id).n;
    const acc = wk.n ? (wk.c || 0) / wk.n * 100 : null;
    if (struggles >= 1 || (acc != null && acc < 60)) needingSupport++;
  }
  res.json({
    school: req.parent.school_name || null, teacherName: req.parent.name,
    schoolCtx: schoolContext(req.parent),
    classes: out,
    totals: { students: allKids.length, classes: classes.length, activeToday, needingSupport, answersWeek }
  });
});

// ---- Create a class ----
router.post('/teacher/classes', requireTeacher, (req, res) => {
  const name = String((req.body || {}).name || '').trim().slice(0, 80);
  if (!name) return res.status(400).json({ error: 'Give the class a name.' });
  const g = (req.body || {}).grade;
  const grade = g != null && g !== '' && Number.isFinite(Number(g)) ? Math.max(0, Math.min(12, Math.round(Number(g)))) : null;
  const code = genJoinCode();
  const info = db.prepare('INSERT INTO classes (owner_id, name, grade, join_code) VALUES (?,?,?,?)').run(req.parent.id, name, grade, code);
  const c = db.prepare('SELECT * FROM classes WHERE id=?').get(info.lastInsertRowid);
  res.json({ ok: true, class: classPublic(c, 0) });
});

// ---- Rename / regrade a class ----
router.patch('/teacher/classes/:id', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const name = (req.body || {}).name != null ? String(req.body.name).trim().slice(0, 80) : null;
  const g = (req.body || {}).grade;
  const grade = g === '' ? null : (g != null && Number.isFinite(Number(g)) ? Math.max(0, Math.min(12, Math.round(Number(g)))) : undefined);
  db.prepare('UPDATE classes SET name=COALESCE(?,name), grade=CASE WHEN ? THEN ? ELSE grade END WHERE id=?')
    .run(name || null, grade !== undefined ? 1 : 0, grade === undefined ? null : grade, c.id);
  if ((req.body || {}).join_enabled != null) {
    db.prepare('UPDATE classes SET join_enabled=? WHERE id=?').run((req.body).join_enabled ? 1 : 0, c.id);
  }
  res.json({ ok: true });
});

// ---- Regenerate a class join code ----
router.post('/teacher/classes/:id/regenerate-code', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const code = genJoinCode();
  db.prepare('UPDATE classes SET join_code=? WHERE id=?').run(code, c.id);
  res.json({ ok: true, joinCode: code });
});

// ---- Delete a class (students remain in the account, just unassigned) ----
router.delete('/teacher/classes/:id', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const tx = db.transaction(() => {
    db.prepare('UPDATE kids SET class_id=NULL WHERE class_id=? AND parent_id=?').run(c.id, req.parent.id);
    db.prepare('DELETE FROM class_members WHERE class_id=?').run(c.id);
    db.prepare('DELETE FROM classes WHERE id=?').run(c.id);
  });
  tx();
  res.json({ ok: true });
});

// ---- Class dashboard: roster + aggregates ----
router.get('/teacher/classes/:id', requireTeacher, (req, res) => {
  const c = classForRead(req.parent, Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const win = timeutil.dayWindow(req.parent.tz);
  const kids = db.prepare('SELECT k.* FROM kids k JOIN class_members m ON m.kid_id=k.id WHERE m.class_id=? AND k.parent_id=? ORDER BY k.name').all(c.id, c.owner_id);
  const roster = kids.map(k => teacherRosterRow(k, win));
  // Aggregates
  const withWork = roster.filter(r => r.weekAnswers > 0);
  const avgAccuracy = withWork.length ? Math.round(withWork.reduce((a, r) => a + (r.weekAccuracy || 0), 0) / withWork.length) : null;
  const subjectAvg = {};
  for (const sub of TEACHER_SUBJECTS) {
    const placed = roster.map(r => r.subjects.find(s => s.subject === sub)).filter(s => s && s.placed && s.level != null);
    subjectAvg[sub] = placed.length ? Math.round(placed.reduce((a, s) => a + s.level, 0) / placed.length * 10) / 10 : null;
  }
  res.json({
    class: classPublic(c, kids.length),
    roster,
    aggregates: {
      students: roster.length,
      activeThisWeek: withWork.length,
      needingSupport: roster.filter(r => r.status === 'needs-support').length,
      excelling: roster.filter(r => r.status === 'excelling').length,
      notStarted: roster.filter(r => r.status === 'not-started').length,
      answersWeek: roster.reduce((a, r) => a + r.weekAnswers, 0),
      avgAccuracy, avgMinutesWeek: withWork.length ? Math.round(withWork.reduce((a, r) => a + r.minutesWeek, 0) / withWork.length) : 0,
      subjectAvg
    }
  });
});

// ---- Add a student to a class (creates the learner in this teacher's account) ----
router.post('/teacher/classes/:id/students', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const name = String((req.body || {}).name || '').trim().slice(0, 40);
  if (!name) return res.status(400).json({ error: 'Enter the student\'s name (a first name or nickname is fine).' });
  const g = (req.body || {}).grade;
  const grade = g != null && g !== '' && Number.isFinite(Number(g)) ? Math.max(0, Math.min(12, Math.round(Number(g)))) : (c.grade != null ? c.grade : 3);
  let pin = String((req.body || {}).pin || '').trim();
  if (pin && !/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 4 digits.' });
  if (!pin) pin = genPin();
  const avatar = AVATARS.includes((req.body || {}).avatar) ? (req.body || {}).avatar : AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const tx = db.transaction(() => {
    const info = db.prepare("INSERT INTO kids (parent_id, name, pin, grade, avatar, class_id, consent_at) VALUES (?,?,?,?,?,?,datetime('now'))")
      .run(req.parent.id, name, auth.hashPin(pin), grade, avatar, c.id);
    db.prepare('INSERT OR IGNORE INTO class_members (class_id, kid_id) VALUES (?,?)').run(c.id, info.lastInsertRowid);
    return info.lastInsertRowid;
  });
  const kidId = tx();
  try { db.recordConsent({ parentId: req.parent.id, parentEmail: req.parent.email, kidId, method: 'school', detail: 'student added by teacher/school' }); } catch (e) {}
  res.json({ ok: true, student: { id: kidId, name, grade, pin } }); // pin returned once so the teacher can share the login
});

// ---- Bulk add students (one name per line) ----
router.post('/teacher/classes/:id/import', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  let names = (req.body || {}).names;
  if (typeof names === 'string') names = names.split(/[\n,]/);
  if (!Array.isArray(names)) return res.status(400).json({ error: 'Provide a list of student names.' });
  names = names.map(n => String(n || '').trim().slice(0, 40)).filter(Boolean).slice(0, 60);
  if (!names.length) return res.status(400).json({ error: 'No names found — add one student per line.' });
  const g = (req.body || {}).grade;
  const grade = g != null && g !== '' && Number.isFinite(Number(g)) ? Math.max(0, Math.min(12, Math.round(Number(g)))) : (c.grade != null ? c.grade : 3);
  const created = [];
  const tx = db.transaction(() => {
    for (const name of names) {
      const pin = genPin();
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const info = db.prepare("INSERT INTO kids (parent_id, name, pin, grade, avatar, class_id, consent_at) VALUES (?,?,?,?,?,?,datetime('now'))")
        .run(req.parent.id, name, auth.hashPin(pin), grade, avatar, c.id);
      db.prepare('INSERT OR IGNORE INTO class_members (class_id, kid_id) VALUES (?,?)').run(c.id, info.lastInsertRowid);
      created.push({ id: info.lastInsertRowid, name, grade, pin });
    }
  });
  tx();
  try { db.recordConsent({ parentId: req.parent.id, parentEmail: req.parent.email, method: 'school', detail: `bulk-added ${created.length} students by teacher/school` }); } catch (e) {}
  res.json({ ok: true, students: created });
});

// ---- Remove a student from a class (optionally delete the learner entirely) ----
router.delete('/teacher/classes/:id/students/:kidId', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Student not found.' });
  db.prepare('DELETE FROM class_members WHERE class_id=? AND kid_id=?').run(c.id, kid.id);
  db.prepare('UPDATE kids SET class_id=NULL WHERE id=? AND class_id=?').run(kid.id, c.id);
  if (String(req.query.purge) === '1') {
    // Full deletion of the learner and their data (teacher-owned only).
    try { db.prepare('DELETE FROM kids WHERE id=? AND parent_id=?').run(kid.id, req.parent.id); } catch (e) {}
  }
  res.json({ ok: true });
});

// ---- Regenerate a student's PIN (returns the new one once) ----
router.post('/teacher/students/:kidId/pin', requireTeacher, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Student not found.' });
  const pin = genPin();
  db.prepare('UPDATE kids SET pin=? WHERE id=?').run(auth.hashPin(pin), kid.id);
  res.json({ ok: true, pin });
});

// ---- Reset a student's progress (start fresh) ----
router.post('/teacher/students/:kidId/reset', requireTeacher, (req, res) => {
  const kid = db.prepare('SELECT id FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Student not found.' });
  const wipe = ['activity_log', 'skill_state', 'subject_state', 'badges', 'certificates', 'game_scores', 'daily_quests', 'score_snapshots', 'game_progress', 'game_time'];
  const tx = db.transaction(() => {
    for (const t of wipe) { try { db.prepare(`DELETE FROM ${t} WHERE kid_id=?`).run(kid.id); } catch (e) {} }
    try { db.prepare('UPDATE kids SET xp=0, coins=0, streak=0, play_tokens=0, last_active_day=NULL WHERE id=?').run(kid.id); } catch (e) {}
  });
  tx();
  res.json({ ok: true });
});

// ---- Full per-student report (drill-down) ----
router.get('/teacher/students/:kidId', requireTeacher, (req, res) => {
  const kid = kidForRead(req.parent, Number(req.params.kidId));
  if (!kid) return res.status(404).json({ error: 'Student not found.' });
  const win = timeutil.dayWindow(req.parent.tz);
  let card = null; try { card = adaptive.reportCard(kid.id); } catch (e) {}
  const row = teacherRosterRow(kid, win);
  res.json({ student: { id: kid.id, name: kid.name, grade: kid.grade, avatar: kid.avatar, streak: kid.streak, lastActive: kid.last_active_day }, snapshot: row, report: card });
});

// ---- Teacher launches a student session (to view or help), returning here on exit ----
router.post('/teacher/enter-student', requireTeacher, (req, res) => {
  const kid = kidForRead(req.parent, Number((req.body || {}).kidId));
  if (!kid) return res.status(404).json({ error: 'Student not found.' });
  const teacherToken = req.cookies.bp_session;
  if (teacherToken) res.cookie('bp_parent_return', teacherToken, COOKIE_OPTS);
  const token = auth.createSession('kid', kid.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true, kid: publicKid(kid) });
});

// ---- Roster CSV export (student logins + this-week snapshot) ----
router.get('/teacher/classes/:id/export.csv', requireTeacher, (req, res) => {
  const c = classForRead(req.parent, Number(req.params.id));
  if (!c) return res.status(404).send('Class not found');
  const win = timeutil.dayWindow(req.parent.tz);
  const kids = db.prepare('SELECT k.* FROM kids k JOIN class_members m ON m.kid_id=k.id WHERE m.class_id=? AND k.parent_id=? ORDER BY k.name').all(c.id, c.owner_id);
  const csvCell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const header = ['name', 'grade', 'status', 'week_answers', 'week_accuracy', 'minutes_week', 'streak', 'last_active', 'math_level', 'english_level', 'science_level', 'spanish_level', 'needs_help'];
  const rows = [header.join(',')];
  for (const k of kids) {
    const r = teacherRosterRow(k, win);
    const lvl = sub => { const s = r.subjects.find(x => x.subject === sub); return s && s.levelName ? s.levelName : ''; };
    rows.push([r.name, r.grade, r.status, r.weekAnswers, r.weekAccuracy == null ? '' : r.weekAccuracy + '%', r.minutesWeek, r.streak, r.lastActive || '', lvl('math'), lvl('english'), lvl('science'), lvl('spanish'), r.topStruggle ? r.topStruggle.name : ''].map(csvCell).join(','));
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${(c.name || 'class').replace(/[^a-z0-9]+/gi, '-')}-roster.csv"`);
  res.send(rows.join('\n'));
});

// ---- Student self-join by class code (public, code-gated) ----
const joinLimiter = rateLimit({ windowMs: 15 * 60000, max: 30, key: 'classjoin' });
const MAX_CLASS_STUDENTS = 300;
function findJoinableClass(code) {
  if (!code) return null;
  const c = db.prepare('SELECT * FROM classes WHERE join_code=?').get(String(code).trim().toUpperCase());
  if (!c || (c.join_enabled != null && !c.join_enabled)) return null;
  return c;
}
router.get('/class/join/:code', joinLimiter, (req, res) => {
  const c = findJoinableClass(req.params.code);
  if (!c) return res.status(404).json({ error: 'That class code isn\'t working. Double-check it with your teacher.' });
  const owner = db.prepare('SELECT school_name FROM parents WHERE id=?').get(c.owner_id);
  res.json({ ok: true, className: c.name, grade: c.grade, school: (owner && owner.school_name) || null });
});
router.post('/class/join', joinLimiter, (req, res) => {
  const b = req.body || {};
  const c = findJoinableClass(b.code);
  if (!c) return res.status(404).json({ error: 'That class code isn\'t working. Double-check it with your teacher.' });
  const name = String(b.name || '').trim().slice(0, 40);
  if (!name) return res.status(400).json({ error: 'Enter your name to join.' });
  const pin = String(b.pin || '').trim();
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: 'Pick a 4-digit PIN you\'ll remember.' });
  const count = db.prepare('SELECT COUNT(*) AS n FROM class_members WHERE class_id=?').get(c.id).n;
  if (count >= MAX_CLASS_STUDENTS) return res.status(400).json({ error: 'This class is full — please ask your teacher.' });
  const g = b.grade;
  const grade = g != null && g !== '' && Number.isFinite(Number(g)) ? Math.max(0, Math.min(12, Math.round(Number(g)))) : (c.grade != null ? c.grade : 3);
  const avatar = AVATARS.includes(b.avatar) ? b.avatar : AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const tx = db.transaction(() => {
    const info = db.prepare("INSERT INTO kids (parent_id, name, pin, grade, avatar, class_id, consent_at) VALUES (?,?,?,?,?,?,datetime('now'))")
      .run(c.owner_id, name, auth.hashPin(pin), grade, avatar, c.id);
    db.prepare('INSERT OR IGNORE INTO class_members (class_id, kid_id) VALUES (?,?)').run(c.id, info.lastInsertRowid);
    return info.lastInsertRowid;
  });
  const kidId = tx();
  try { db.recordConsent({ parentId: c.owner_id, kidId, method: 'school-selfjoin', detail: `student self-joined class "${c.name}" with code` }); } catch (e) {}
  const token = auth.createSession('kid', kidId);
  res.cookie('bp_session', token, COOKIE_OPTS);
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(kidId);
  res.json({ ok: true, kid: publicKid(kid) });
});

// ---- Class assignments (teacher sets a focus skill/subject for a class) ----
router.get('/teacher/classes/:id/assignments', requireTeacher, (req, res) => {
  const c = classForRead(req.parent, Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const rows = db.prepare('SELECT id, subject, skill_id AS skillId, skill_name AS skillName, note, created_at FROM class_assignments WHERE class_id=? AND active=1 ORDER BY created_at DESC').all(c.id);
  res.json({ assignments: rows });
});
router.post('/teacher/classes/:id/assignments', requireTeacher, (req, res) => {
  const c = db.prepare('SELECT * FROM classes WHERE id=? AND owner_id=?').get(Number(req.params.id), req.parent.id);
  if (!c) return res.status(404).json({ error: 'Class not found.' });
  const b = req.body || {};
  const subject = String(b.subject || '').trim();
  if (!TEACHER_SUBJECTS.includes(subject)) return res.status(400).json({ error: 'Pick a subject.' });
  let skillId = b.skillId ? String(b.skillId).trim() : null;
  let skillName = null;
  if (skillId) {
    const sk = content.getSkill(subject, skillId);
    if (!sk) return res.status(400).json({ error: 'That skill isn\'t in this subject.' });
    skillName = sk.name;
  }
  const note = String(b.note || '').trim().slice(0, 200) || null;
  const info = db.prepare('INSERT INTO class_assignments (class_id, subject, skill_id, skill_name, note) VALUES (?,?,?,?,?)').run(c.id, subject, skillId, skillName, note);
  res.json({ ok: true, assignment: { id: info.lastInsertRowid, subject, skillId, skillName, note } });
});
router.delete('/teacher/assignments/:aid', requireTeacher, (req, res) => {
  const a = db.prepare('SELECT a.* FROM class_assignments a JOIN classes c ON c.id=a.class_id WHERE a.id=? AND c.owner_id=?').get(Number(req.params.aid), req.parent.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found.' });
  db.prepare('UPDATE class_assignments SET active=0 WHERE id=?').run(a.id);
  res.json({ ok: true });
});
router.get('/learn/:kidId/assignments', auth.requireKid, (req, res) => {
  const cid = req.kid.class_id;
  if (!cid) return res.json({ assignments: [] });
  const rows = db.prepare('SELECT subject, skill_id AS skillId, skill_name AS skillName, note FROM class_assignments WHERE class_id=? AND active=1 ORDER BY created_at DESC LIMIT 5').all(cid);
  res.json({ assignments: rows });
});

// ---- Schools (multi-teacher, head of school) ----
router.post('/teacher/school/create', requireTeacher, (req, res) => {
  if (req.parent.school_id) return res.status(400).json({ error: 'Your account is already part of a school.' });
  const name = String((req.body || {}).name || '').trim().slice(0, 120) || (req.parent.school_name || 'My School');
  const code = genSchoolCode();
  const info = db.prepare('INSERT INTO schools (name, code, head_id) VALUES (?,?,?)').run(name, code, req.parent.id);
  db.prepare("UPDATE parents SET school_id=?, school_role='head' WHERE id=?").run(info.lastInsertRowid, req.parent.id);
  res.json({ ok: true, school: { id: info.lastInsertRowid, name, code, isHead: true } });
});
router.post('/teacher/school/join', requireTeacher, (req, res) => {
  if (req.parent.school_id) return res.status(400).json({ error: 'Your account is already part of a school.' });
  const code = String((req.body || {}).code || '').trim().toUpperCase();
  const s = db.prepare('SELECT * FROM schools WHERE code=?').get(code);
  if (!s) return res.status(404).json({ error: 'That school code isn\'t working — check it with your school lead.' });
  db.prepare("UPDATE parents SET school_id=?, school_role='member' WHERE id=?").run(s.id, req.parent.id);
  res.json({ ok: true, school: { id: s.id, name: s.name, isHead: false } });
});
router.post('/teacher/school/leave', requireTeacher, (req, res) => {
  if (!req.parent.school_id) return res.json({ ok: true });
  const s = db.prepare('SELECT * FROM schools WHERE id=?').get(req.parent.school_id);
  const wasHead = s && s.head_id === req.parent.id;
  db.prepare('UPDATE parents SET school_id=NULL, school_role=NULL WHERE id=?').run(req.parent.id);
  if (wasHead) {
    const next = db.prepare("SELECT id FROM parents WHERE school_id=? AND id!=? ORDER BY id LIMIT 1").get(s.id, req.parent.id);
    if (next) { db.prepare('UPDATE schools SET head_id=? WHERE id=?').run(next.id, s.id); db.prepare("UPDATE parents SET school_role='head' WHERE id=?").run(next.id); }
  }
  res.json({ ok: true });
});
router.get('/teacher/school', requireTeacher, (req, res) => {
  if (!req.parent.school_id) return res.status(404).json({ error: 'Not part of a school.' });
  const s = db.prepare('SELECT * FROM schools WHERE id=?').get(req.parent.school_id);
  if (!s) return res.status(404).json({ error: 'School not found.' });
  const isHead = s.head_id === req.parent.id;
  const win = timeutil.dayWindow(req.parent.tz);
  const teachers = db.prepare("SELECT id, name, email, school_role FROM parents WHERE school_id=? ORDER BY (school_role='head') DESC, name").all(s.id);
  let teacherRows = [], totals = { students: 0, classes: 0, activeToday: 0, needingSupport: 0 };
  if (isHead) {
    for (const t of teachers) {
      const classes = db.prepare('SELECT * FROM classes WHERE owner_id=?').all(t.id);
      const kids = db.prepare('SELECT id FROM kids WHERE parent_id=?').all(t.id).map(r => r.id);
      let active = 0, support = 0;
      for (const kid of kids) {
        const td = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= ? AND ts < ?').get(kid, win.todayStart, win.tomorrowStart).n;
        if (td > 0) active++;
        const wk = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND skill_id NOT LIKE 'track:%' AND ts >= ?").get(kid, win.weekStart);
        const strug = db.prepare('SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<0.45').get(kid).n;
        const acc = wk.n ? (wk.c || 0) / wk.n * 100 : null;
        if (strug >= 1 || (acc != null && acc < 60)) support++;
      }
      teacherRows.push({
        id: t.id, name: t.name, email: t.email, isHead: t.school_role === 'head',
        classes: classes.map(c => ({ id: c.id, name: c.name, grade: c.grade, students: db.prepare('SELECT COUNT(*) AS n FROM class_members WHERE class_id=?').get(c.id).n })),
        students: kids.length, activeToday: active, needingSupport: support
      });
      totals.students += kids.length; totals.classes += classes.length; totals.activeToday += active; totals.needingSupport += support;
    }
  }
  res.json({ school: { id: s.id, name: s.name, code: isHead ? s.code : undefined, isHead }, teachers: teachers.map(t => ({ name: t.name, email: t.email, isHead: t.school_role === 'head' })), teacherRows, totals });
});

// One-click unsubscribe from lifecycle/tips emails (link in every non-receipt email).
router.get('/email/unsubscribe', (req, res) => {
  const t = String(req.query.t || '');
  const row = t ? db.prepare('SELECT id FROM parents WHERE unsub_token=?').get(t) : null;
  if (row) db.prepare('UPDATE parents SET email_opt_out=1 WHERE id=?').run(row.id);
  res.type('html').send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Georgia,serif;background:#f6f4ee;color:#16213a;text-align:center;padding:60px 20px">
    <h2 style="color:#1A5C38">${row ? 'You\'re unsubscribed' : 'Link not recognized'}</h2>
    <p>${row ? 'We\'ll stop sending progress reminders and tips to this address. Billing and account emails still arrive when needed.' : 'This unsubscribe link looks expired or incomplete — email support@learnwithgallop.com and we\'ll sort it instantly.'}</p>
    <p><a href="/" style="color:#1A5C38">← Back to Gallop</a></p></body>`);
});

// Admin: the full mailing list (customers + newsletter signups) as CSV for campaigns.
router.get('/admin/newsletter.csv', auth.requireAdmin, (req, res) => {
  const csvCell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const parents = db.prepare("SELECT email, name, sub_status, created_at FROM parents WHERE COALESCE(email_opt_out,0)=0").all();
  const subs = db.prepare('SELECT email, created_at FROM newsletter_subs').all();
  const seen = new Set(parents.map(p => p.email.toLowerCase()));
  const rows = [
    'email,name,type,status,joined',
    ...parents.map(p => [p.email, p.name, 'customer', p.sub_status, p.created_at].map(csvCell).join(',')),
    ...subs.filter(s => !seen.has(s.email.toLowerCase())).map(s => [s.email, '', 'newsletter', '', s.created_at].map(csvCell).join(','))
  ];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="gallop-mailing-list.csv"');
  res.send(rows.join('\n'));
});

// ---------- AI support: in-app Help Assistant + admin review queue ----------
const supportLimiter = rateLimit({ windowMs: 10 * 60000, max: 12, key: 'support' });

// Public: a parent asks the in-app assistant a question. Safe answers come back
// instantly; sensitive/uncertain ones create a ticket and notify a human.
router.post('/support/ask', supportLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    const question = String(b.question || '').trim().slice(0, 4000);
    const name = String(b.name || '').trim().slice(0, 120);
    const email = String(b.email || '').trim().slice(0, 200);
    if (question.length < 2) return res.status(400).json({ error: 'Please type your question.' });

    const result = await support.assist({ question, name });
    const status = result.escalate ? 'escalated' : 'auto_answered';
    const handledAt = result.escalate ? null : new Date().toISOString();
    const info = db.prepare(
      `INSERT INTO support_tickets (source, from_email, from_name, subject, question, ai_reply, category, status, handled_at)
       VALUES ('widget', ?, ?, NULL, ?, ?, ?, ?, ?)`
    ).run(email || null, name || null, question, result.reply, result.category, status, handledAt);

    if (result.escalate) {
      const ticket = db.prepare('SELECT * FROM support_tickets WHERE id=?').get(info.lastInsertRowid);
      try { mailer.sendSupportEscalation(ticket); } catch (e) {}
    }
    res.json({ answer: result.reply, escalated: !!result.escalate, needEmail: result.escalate && !email });
  } catch (e) {
    res.json({ answer: "Thanks for reaching out! I'm having a brief hiccup — please email support@learnwithgallop.com and a person will help you right away.", escalated: true });
  }
});

// Admin: list recent support tickets that need attention or were handled.
router.get('/support/queue', auth.requireAdmin, (req, res) => {
  const open = db.prepare(`SELECT * FROM support_tickets WHERE status IN ('escalated') ORDER BY id DESC LIMIT 100`).all();
  const recent = db.prepare(`SELECT * FROM support_tickets WHERE status IN ('sent','dismissed','auto_answered','auto_sent') ORDER BY id DESC LIMIT 40`).all();
  const autoSent = db.prepare(`SELECT COUNT(*) AS n FROM support_tickets WHERE status='auto_sent'`).get().n;
  res.json({ open, recent, inboundConnected: inbound.configured() || inbound.webhookConfigured(), aiConnected: support.aiConfigured(), autoSentCount: autoSent });
});

// Admin: send a (possibly edited) reply to the parent and close the ticket.
router.post('/support/queue/:id/reply', auth.requireAdmin, (req, res) => {
  const t = db.prepare('SELECT * FROM support_tickets WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Ticket not found.' });
  const reply = String((req.body || {}).reply || '').trim().slice(0, 6000);
  if (!reply) return res.status(400).json({ error: 'Reply is empty.' });
  if (!t.from_email) return res.status(400).json({ error: 'This ticket has no email address to reply to.' });
  try { mailer.sendSupportReply(t.from_email, t.subject || 'your question', reply); } catch (e) {}
  db.prepare("UPDATE support_tickets SET status='sent', ai_reply=?, handled_at=datetime('now') WHERE id=?").run(reply, t.id);
  res.json({ ok: true });
});

// Admin: dismiss a ticket without replying.
router.post('/support/queue/:id/dismiss', auth.requireAdmin, (req, res) => {
  db.prepare("UPDATE support_tickets SET status='dismissed', handled_at=datetime('now') WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// Inbound support email via the Google Apps Script bridge (Workspace-friendly path;
// used instead of IMAP when app passwords aren't available). Authenticated by a shared
// secret (SUPPORT_INBOUND_TOKEN) that lives in Render and in the Apps Script. The script
// only marks a Gmail message read once we return 200, so nothing is lost on a hiccup.
const inboundLimiter = rateLimit({ windowMs: 60000, max: 60, key: 'inbound' });
router.post('/support/inbound', inboundLimiter, async (req, res) => {
  const token = process.env.SUPPORT_INBOUND_TOKEN || '';
  const given = req.get('X-Gallop-Token') || (req.body && req.body.token) || '';
  // Constant-time comparison so the shared secret can't be recovered via response timing.
  const okToken = token && given.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(token));
  if (!okToken) return res.status(401).json({ error: 'unauthorized' });
  try {
    const b = req.body || {};
    let fromEmail = b.email, fromName = b.name;
    if (!fromEmail && b.from) { const p = inbound.parseFrom(b.from); fromEmail = p.email; fromName = fromName || p.name; }
    const result = await inbound.processInbound({
      fromEmail, fromName,
      subject: String(b.subject || '').slice(0, 300),
      body: String(b.body || '').slice(0, 8000),
      messageId: String(b.messageId || b.message_id || '').slice(0, 250)
    });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: 'processing-failed' });
  }
});

// ---------- Standards alignment (administrator-facing coverage map) ----------
const standards = require('./content/standards');
const GRADE_LABEL = g => g === 0 ? 'Kindergarten' : `Grade ${g}`;
router.get('/standards/overview', (req, res) => {
  const meta = content.subjectMeta();
  const fwCount = {};
  const subjects = meta.map(s => {
    const byGrade = {};
    for (const k of s.skills) {
      const std = k.standard || null;
      if (std && std.framework) fwCount[std.framework] = (fwCount[std.framework] || 0) + 1;
      (byGrade[k.grade] = byGrade[k.grade] || []).push({
        id: k.id, name: k.name,
        code: std ? std.code : null, framework: std ? std.framework : null,
        domain: std ? std.domain : null, description: std ? std.description : null,
        proficiency: std ? (std.proficiency || null) : null
      });
    }
    const grades = Object.keys(byGrade).map(Number).sort((a, b) => a - b)
      .map(g => ({ grade: g, label: GRADE_LABEL(g), skills: byGrade[g] }));
    const primaryFw = s.subject === 'math' || s.subject === 'english' ? 'Common Core'
      : s.subject === 'science' ? 'NGSS' : 'ACTFL';
    return { subject: s.subject, label: s.label, emoji: s.emoji, color: s.color, primaryFramework: primaryFw, grades };
  });
  const totalSkills = meta.reduce((n, s) => n + s.skills.length, 0);
  const mapped = Object.values(fwCount).reduce((a, b) => a + b, 0);
  res.json({ subjects, frameworks: standards.FRAMEWORKS, frameworkCounts: fwCount, totals: { skills: totalSkills, mapped } });
});

// ---------- Monthly newsletter (admin review + autonomous send) ----------
// One-click unsubscribe for newsletter-only signups (parents use /email/unsubscribe).
router.get('/newsletter/unsubscribe', (req, res) => {
  const t = String(req.query.t || '');
  const row = t ? db.prepare('SELECT email FROM newsletter_subs WHERE unsub_token=?').get(t) : null;
  if (row) db.prepare('DELETE FROM newsletter_subs WHERE unsub_token=?').run(t);
  res.type('html').send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Georgia,serif;background:#f6f4ee;color:#16213a;text-align:center;padding:60px 20px">
    <h2 style="color:#1A5C38">${row ? "You're unsubscribed" : 'Link not recognized'}</h2>
    <p>${row ? "We've removed this address from the Gallop newsletter." : 'This unsubscribe link looks expired — email support@learnwithgallop.com and we\'ll sort it instantly.'}</p>
    <p><a href="/" style="color:#1A5C38">← Back to Gallop</a></p></body>`);
});

// Admin: list the current draft(s) + history, with recipient count.
router.get('/admin/newsletters', auth.requireAdmin, (req, res) => {
  const drafts = db.prepare("SELECT * FROM newsletters WHERE status='draft' ORDER BY id DESC").all();
  const history = db.prepare("SELECT id, month_key, subject, theme, status, mode, recipients, sent_at, created_at FROM newsletters WHERE status!='draft' ORDER BY id DESC LIMIT 24").all();
  res.json({ drafts, history, recipientCount: newsletter.recipients().length, approvalRemaining: Math.max(0, newsletter.APPROVAL_COUNT - newsletter.sentCount()) });
});

// Admin: generate (or regenerate) this month's draft on demand.
router.post('/admin/newsletters/generate', auth.requireAdmin, async (req, res) => {
  try {
    const nl = await newsletter.ensureDraft(new Date(), { force: !!(req.body && req.body.force) });
    res.json({ ok: true, id: nl.id });
  } catch (e) { res.status(500).json({ error: 'Could not generate a draft right now.' }); }
});

// Admin: send a draft to all subscribers (optionally with edited subject/body).
router.post('/admin/newsletters/:id/send', auth.requireAdmin, async (req, res) => {
  const nl = db.prepare('SELECT * FROM newsletters WHERE id=?').get(req.params.id);
  if (!nl) return res.status(404).json({ error: 'Draft not found.' });
  if (nl.status === 'sent') return res.status(400).json({ error: 'Already sent.' });
  const b = req.body || {};
  if (b.subject || b.body_html) {
    db.prepare('UPDATE newsletters SET subject=COALESCE(?,subject), body_html=COALESCE(?,body_html) WHERE id=?')
      .run(b.subject ? String(b.subject).slice(0, 200) : null, b.body_html ? String(b.body_html).slice(0, 40000) : null, nl.id);
  }
  const fresh = db.prepare('SELECT * FROM newsletters WHERE id=?').get(nl.id);
  try {
    const n = await newsletter.sendToSubscribers(fresh);
    res.json({ ok: true, sent: n });
  } catch (e) { res.status(500).json({ error: 'Send failed. Please try again.' }); }
});

// Admin: discard a draft without sending.
router.post('/admin/newsletters/:id/discard', auth.requireAdmin, (req, res) => {
  db.prepare("UPDATE newsletters SET status='discarded' WHERE id=? AND status='draft'").run(req.params.id);
  res.json({ ok: true });
});

// Unknown /api/* paths must return JSON 404, not the SPA's index.html.
router.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
