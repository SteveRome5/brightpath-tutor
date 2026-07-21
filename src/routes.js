// REST API routes
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const adaptive = require('./adaptive');
const content = require('./content');
const billing = require('./stripe');
const play = require('./play');
const gscore = require('./score');

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
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.socket?.remoteAddress || 'unknown';
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

// ---------- parent auth ----------
router.post('/auth/signup', loginLimiter, (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password || password.length < 8)
    return res.status(400).json({ error: 'Need email, name, and a password of 8+ characters.' });
  try {
    const id = auth.createParent(email, name, password);
    auth.syncAdminFlag(db.prepare('SELECT * FROM parents WHERE id=?').get(id));
    const token = auth.createSession('parent', id);
    res.cookie('bp_session', token, COOKIE_OPTS);
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
  // Retire the kid session cookie, restore the parent session, clear the stash.
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
  return { id: k.id, name: k.name, avatar: k.avatar, avatar_config: cfg, grade: k.grade, xp: k.xp, coins: k.coins, streak: k.streak, play_tokens: k.play_tokens || 0, calendar_mode: k.calendar_mode, weekly_goal: k.weekly_goal };
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
    const srows = db.prepare('SELECT skill_id, mastery FROM skill_state WHERE kid_id=? AND subject=?').all(req.kid.id, sub);
    const gallopScore = srows.length ? gscore.subjectScore(sub, Object.fromEntries(srows.map(r => [r.skill_id, r.mastery])), st.placed ? st.level : undefined) : null;
    return { subject: sub, label: meta.label, emoji: meta.emoji, color: meta.color, level: st.level, levelName: adaptive.gradeName(Math.round(st.level)), placed: !!st.placed, avgMastery: m.m, answersToday: today.n || 0, gallopScore };
  });
  const _perSub = {}; subjects.forEach(s => { if (s.gallopScore != null) _perSub[s.subject] = s.gallopScore; });
  const gallopOverall = gscore.overall(_perSub);
  // Smart "Up Next": weakest, least-practiced-today subject — or first placement needed
  let recommended = null;
  const placedSubs = subjects.filter(s => s.placed);
  if (!placedSubs.length) {
    recommended = { subject: subjects[0].subject, type: 'place' };
  } else {
    const cand = [...placedSubs].sort((a, b) =>
      ((a.avgMastery == null ? 0.5 : a.avgMastery) + (a.answersToday > 0 ? 1 : 0)) -
      ((b.avgMastery == null ? 0.5 : b.avgMastery) + (b.answersToday > 0 ? 1 : 0)))[0];
    const unplaced = subjects.find(s => !s.placed);
    if (unplaced && placedSubs.every(s => s.answersToday > 0)) recommended = { subject: unplaced.subject, type: 'place' };
    else recommended = { subject: cand.subject, type: cand.avgMastery != null && cand.avgMastery < 0.5 ? 'boost' : cand.answersToday > 0 ? 'more' : 'fresh' };
  }
  const week = db.prepare("SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-7 days')").get(req.kid.id);
  const lastWeek = db.prepare("SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-14 days') AND ts < datetime('now','-7 days')").get(req.kid.id);
  const activeDays = db.prepare("SELECT DISTINCT date(ts) AS d FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-14 days')").all(req.kid.id).map(r => r.d);
  res.json({ kid: publicKid(db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id)), subjects, weekAnswers: week.n || 0, lastWeek: { answers: lastWeek.n || 0, correct: lastWeek.c || 0 }, recommended, activeDays, gallopOverall });
});

// placement quiz
router.post('/learn/:kidId/placement/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!content.SUBJECTS[subject]) return res.status(404).json({ error: 'Unknown subject' });
  const key = `${req.kid.id}:${subject}`;
  const { answerIndex, questionAnswerIndex, probeGrade, reset } = req.body || {};
  if (reset) placements.delete(key);
  let history = placements.get(key) || [];
  if (answerIndex != null && probeGrade != null) {
    history.push({ grade: Number(probeGrade), correct: Number(answerIndex) === Number(questionAnswerIndex) });
    placements.set(key, history);
  }
  const result = adaptive.placementNext(req.kid.id, subject, history);
  if (result.done) {
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
  if (!content.SUBJECTS[subject]) return res.status(404).json({ error: 'Unknown subject' });
  let activity = null;
  // A single flaky generator must never freeze a kid's session — retry, then fail soft.
  // A truthy activity whose question failed to generate (question:null) still counts as a
  // miss here, otherwise indexing qn.choices below would throw a 500 instead of the soft 503.
  for (let attempt = 0; attempt < 3 && !(activity && activity.question); attempt++) {
    try { activity = adaptive.nextActivity(req.kid.id, subject); } catch (e) { activity = null; }
  }
  if (!activity || !activity.question) return res.status(503).json({ error: 'Hiccup loading the next question — tap to try again!' });
  const qn = activity.question;
  const answerIdx = qn.choices.indexOf(qn.answer);
  res.json({
    mode: activity.mode, level: activity.level, skill: activity.skill,
    question: {
      prompt: qn.prompt, choices: qn.choices, voice: qn.voice, hint: qn.hint, explain: qn.explain,
      passage: qn.passage || null,
      answerIndex: answerIdx, skillId: qn.skillId, skillName: qn.skillName, difficulty: qn.difficulty
    }
  });
});

// submit an answer
router.post('/learn/:kidId/answer', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject, skillId, correct, timeMs, difficulty } = req.body || {};
  if (!content.SUBJECTS[subject] || !content.getSkill(subject, skillId))
    return res.status(400).json({ error: 'Bad subject/skill' });
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

router.post('/learn/:kidId/track/answer', auth.requireKid, auth.requireActiveSub, (req, res) => {
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
  if (!content.SUBJECTS[subject]) return res.status(404).json({ error: 'Unknown subject' });
  db.prepare('UPDATE subject_state SET placed=0 WHERE kid_id=? AND subject=?').run(req.kid.id, subject);
  placements.delete(`${req.kid.id}:${subject}`);
  res.json({ ok: true });
});

// Kid taps "Too tricky?" — gallop back one level (or "Ready for more" — up one)
router.post('/learn/:kidId/level-shift/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!content.SUBJECTS[subject]) return res.status(404).json({ error: 'Unknown subject' });
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
  if (!content.SUBJECTS[subject] || level == null || !Number.isFinite(Number(level))) return res.status(400).json({ error: 'Need a subject and a valid level.' });
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

module.exports = router;
