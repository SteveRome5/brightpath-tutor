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

const router = express.Router();
router.use(play.router);
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 90 * 86400000, secure: process.env.NODE_ENV === 'production' };
const AVATARS = ['fox', 'panda', 'dragon', 'unicorn', 'robot', 'astronaut', 'tiger', 'octopus'];

// In-memory placement sessions (short-lived)
const placements = new Map(); // key `${kidId}:${subject}` -> history[]

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
  try { db.prepare('SELECT 1').get(); return res.json({ ok: true, ts: new Date().toISOString() }); }
  catch (e) { return res.status(503).json({ ok: false, error: 'db' }); }
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
  try {
    const id = auth.createParent(email, name, password);
    auth.syncAdminFlag(db.prepare('SELECT * FROM parents WHERE id=?').get(id));
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
  const token = auth.createSession('kid', kid.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true, kid: publicKid(kid) });
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
  // Uniform error (do not reveal whether the family/child exists vs. the PIN was wrong).
  if (!kid || !auth.verifyPin(pin, kid.pin)) return res.status(401).json({ error: 'That email, learner, and PIN did not match. Try again!' });
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

router.get('/auth/me', (req, res) => {
  const s = auth.getSession(req.cookies.bp_session);
  if (!s) return res.json({ role: 'guest' });
  if (s.kind === 'parent') {
    const p = db.prepare('SELECT id, email, name, sub_status, sub_plan, trial_ends, is_admin FROM parents WHERE id=?').get(s.ref_id);
    if (!p) return res.json({ role: 'guest' });
    const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(p.id).map(publicKid);
    return res.json({ role: 'parent', parent: p, kids, billingMode: billing.billingMode(), plans: billing.PLANS });
  }
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(s.ref_id);
  if (!kid) return res.json({ role: 'guest' });
  // If this kid session was launched by a parent (bp_parent_return holds a live
  // parent session), tell the client so it can show an "Exit to parent" control.
  let parentReturn = false;
  try { const pr = auth.getSession(req.cookies.bp_parent_return); parentReturn = !!(pr && pr.kind === 'parent'); } catch (e) {}
  res.json({ role: 'kid', kid: publicKid(kid), parentReturn });
});

function publicKid(k) {
  let cfg = null; try { cfg = k.avatar_config ? JSON.parse(k.avatar_config) : null; } catch (e) {}
  return { id: k.id, name: k.name, avatar: k.avatar, avatar_config: cfg, avatar_img: k.avatar_img || null, grade: k.grade, xp: k.xp, coins: k.coins, streak: k.streak, play_tokens: k.play_tokens || 0, calendar_mode: k.calendar_mode, weekly_goal: k.weekly_goal };
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
  const info = db.prepare('INSERT INTO kids (parent_id, name, grade, pin, avatar, calendar_mode, consent_at) VALUES (?,?,?,?,?,?, datetime(\'now\'))')
    .run(req.parent.id, cleanName, Math.max(0, Math.min(12, Math.round(Number(grade)))), auth.hashPin(String(pin)), AVATARS.includes(avatar) ? avatar : 'fox', calendar_mode || 'traditional');
  res.json({ ok: true, kidId: info.lastInsertRowid });
});

router.patch('/kids/:kidId', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { name, grade, pin, avatar, calendar_mode, weekly_goal } = req.body || {};
  if (pin != null && pin !== '' && !/^\d{4}$/.test(String(pin))) return res.status(400).json({ error: 'PIN must be 4 digits.' });
  const gradeVal = grade != null && Number.isFinite(Number(grade)) ? Math.max(0, Math.min(12, Math.round(Number(grade)))) : null;
  // Validate avatar against the allow-list and bound the weekly goal (matches POST /kids).
  const avatarVal = AVATARS.includes(avatar) ? avatar : null;
  const goalVal = weekly_goal != null && Number.isFinite(Number(weekly_goal)) ? Math.max(10, Math.min(500, Math.round(Number(weekly_goal)))) : null;
  db.prepare(`UPDATE kids SET name=COALESCE(?,name), grade=COALESCE(?,grade), pin=COALESCE(?,pin),
              avatar=COALESCE(?,avatar), calendar_mode=COALESCE(?,calendar_mode), weekly_goal=COALESCE(?,weekly_goal) WHERE id=?`)
    .run(name ? String(name).trim().slice(0, 40) : null, gradeVal, pin ? auth.hashPin(String(pin)) : null, avatarVal, calendar_mode || null, goalVal, kid.id);
  res.json({ ok: true });
});

router.delete('/kids/:kidId', auth.requireParent, (req, res) => {
  db.prepare('DELETE FROM kids WHERE id=? AND parent_id=?').run(Number(req.params.kidId), req.parent.id);
  res.json({ ok: true });
});

// ---------- learning (kid or parent-on-behalf) ----------
router.get('/learn/subjects', (req, res) => res.json({ subjects: content.subjectMeta() }));

router.get('/learn/:kidId/overview', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const subjects = ['math', 'english', 'science', 'spanish'].map(sub => {
    const st = adaptive.getSubjectState(req.kid.id, sub);
    const meta = content.SUBJECTS[sub];
    const m = db.prepare('SELECT AVG(mastery) AS m FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').get(req.kid.id, sub);
    const today = db.prepare("SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND subject=? AND date(ts)=date('now')").get(req.kid.id, sub);
    // attempts>0: score only skills the child has actually worked on, so the overview
    // number matches the report card instead of crediting untouched seeded skills.
    const srows = db.prepare('SELECT skill_id, mastery FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').all(req.kid.id, sub);
    const gallopScore = srows.length ? gscore.subjectScore(sub, Object.fromEntries(srows.map(r => [r.skill_id, r.mastery])), st.placed ? st.level : undefined) : null;
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
    const wasCorrect = Number(answerIndex) === Number(questionAnswerIndex);
    // -1 = "haven't learned this yet". We record the skill name of a genuine miss (a wrong
    // pick) so parents can later see, in plain words, what the assessment surfaced. Honest
    // "haven't covered this" skips aren't framed as mistakes.
    const missed = (!wasCorrect && Number(answerIndex) !== -1 && skillName) ? String(skillName).slice(0, 80) : null;
    history.push({ grade: Number(probeGrade), correct: wasCorrect, missed });
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
    question: { prompt: question.prompt, choices: question.choices, voice: question.voice, passage: question.passage || null, answerIndex: answerIdx, skillName: question.skillName }
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
  // A single flaky generator must never freeze a kid's session — retry, then fail soft.
  // A truthy activity whose question failed to generate (question:null) still counts as a
  // miss here, otherwise indexing qn.choices below would throw a 500 instead of the soft 503.
  for (let attempt = 0; attempt < 3 && !(activity && activity.question); attempt++) {
    try { activity = adaptive.nextActivity(req.kid.id, subject, { focusSkill }); } catch (e) { activity = null; }
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
  const result = adaptive.recordAnswer(req.kid.id, subject, skillId, !!correct, tMs, diff);
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ...result, kid: publicKid(kid) });
});

// ---------- advanced exam-prep tracks (AP / Honors / Regents) ----------
// Separate from the adaptive ladder: track practice never changes a learner's
// subject level or mastery. It still logs activity (so it counts toward streak,
// daily quests, XP/coins) under a namespaced skill_id that the adaptive engine
// ignores.
const trackRecent = new Map(); // `${kidId}:${trackId}` -> [recent prompts]

router.get('/learn/tracks', (req, res) => res.json({ tracks: content.listTracks() }));

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
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ok: true, correct: isCorrect, xpEarned: xp, coinsEarned: isCorrect ? 2 : 0, kid: publicKid(kid) });
});

// report card (kid-safe view + parent view share this)
router.get('/learn/:kidId/achievements', auth.requireKid, (req, res) => {
  res.json(adaptive.achievements(req.kid.id));
});

router.get('/learn/:kidId/report', auth.requireKid, (req, res) => {
  res.json(adaptive.reportCard(req.kid.id));
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
    const st = db.prepare('SELECT level, placed FROM subject_state WHERE kid_id=? AND subject=?').get(kid.id, sub);
    return { subject: sub, label: adaptive.subjectLabel(sub), placed: !!(st && st.placed),
             level: st ? Math.round(st.level) : null,
             levelName: st && st.placed ? adaptive.gradeName(Math.round(st.level)) : 'Not placed yet',
             max: adaptive.maxGrade(sub) };
  });
  res.json({ levels });
});
router.post('/kids/:kidId/level', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { subject, level } = req.body || {};
  if (!validSubject(subject) || level == null || !Number.isFinite(Number(level))) return res.status(400).json({ error: 'Need a subject and a valid level.' });
  const newLevel = adaptive.setLevel(kid.id, subject, Number(level));
  res.json({ ok: true, level: newLevel, levelName: adaptive.gradeName(newLevel) });
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
    const w = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-7 days')").get(k.id);
    return { id: k.id, name: k.name, avatar: k.avatar, streak: k.streak, weekAnswers: w.n || 0, weekAccuracy: w.n ? Math.round((w.c || 0) / w.n * 100) : null };
  }).sort((a, b) => b.weekAnswers - a.weekAnswers);
  res.json({ stats });
});

// ---------- billing ----------
router.post('/billing/checkout', auth.requireParent, async (req, res) => {
  try {
    const origin = `${req.protocol}://${req.get('host')}`;
    const plan = billing.PLANS[req.body.plan] ? req.body.plan : 'family';
    const out = await billing.createCheckout(req.parent, plan, origin);
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
  try { db.prepare('INSERT OR IGNORE INTO newsletter_subs (email, source) VALUES (?, ?)').run(email, 'landing'); } catch (e) {}
  res.json({ ok: true });
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

// Unknown /api/* paths must return JSON 404, not the SPA's index.html.
router.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
