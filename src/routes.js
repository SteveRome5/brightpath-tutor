// REST API routes
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const adaptive = require('./adaptive');
const content = require('./content');
const billing = require('./stripe');

const router = express.Router();
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 90 * 86400000, secure: process.env.NODE_ENV === 'production' };
const AVATARS = ['fox', 'panda', 'dragon', 'unicorn', 'robot', 'astronaut', 'tiger', 'octopus'];

// In-memory placement sessions (short-lived)
const placements = new Map(); // key `${kidId}:${subject}` -> history[]

// ---------- parent auth ----------
router.post('/auth/signup', (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password || password.length < 6)
    return res.status(400).json({ error: 'Need email, name, and a password of 6+ characters.' });
  try {
    const id = auth.createParent(email, name, password);
    const token = auth.createSession('parent', id);
    res.cookie('bp_session', token, COOKIE_OPTS);
    res.json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(400).json({ error: 'That email already has an account. Try logging in!' });
    res.status(500).json({ error: 'Could not create account.' });
  }
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const p = auth.verifyParent(email || '', password || '');
  if (!p) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const token = auth.createSession('parent', p.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true });
});

router.post('/auth/logout', (req, res) => {
  auth.destroySession(req.cookies.bp_session);
  res.clearCookie('bp_session');
  res.json({ ok: true });
});

// Kid login: pick family email + kid + PIN (works on any device)
router.post('/auth/kid-login', (req, res) => {
  const { email, kidId, pin } = req.body || {};
  const parent = db.prepare('SELECT * FROM parents WHERE email=?').get((email || '').toLowerCase().trim());
  if (!parent) return res.status(401).json({ error: 'Family not found — check the email.' });
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(kidId), parent.id);
  if (!kid || kid.pin !== String(pin)) return res.status(401).json({ error: 'Wrong PIN — try again!' });
  const token = auth.createSession('kid', kid.id);
  res.cookie('bp_session', token, COOKIE_OPTS);
  res.json({ ok: true, kid: publicKid(kid) });
});

router.get('/auth/family-kids', (req, res) => {
  const parent = db.prepare('SELECT * FROM parents WHERE email=?').get((req.query.email || '').toLowerCase().trim());
  if (!parent) return res.status(404).json({ error: 'Family not found.' });
  const kids = db.prepare('SELECT id, name, avatar FROM kids WHERE parent_id=?').all(parent.id);
  res.json({ kids });
});

router.get('/auth/me', (req, res) => {
  const s = auth.getSession(req.cookies.bp_session);
  if (!s) return res.json({ role: 'guest' });
  if (s.kind === 'parent') {
    const p = db.prepare('SELECT id, email, name, sub_status, sub_plan, trial_ends FROM parents WHERE id=?').get(s.ref_id);
    if (!p) return res.json({ role: 'guest' });
    const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(p.id).map(publicKid);
    return res.json({ role: 'parent', parent: p, kids, billingMode: billing.billingMode(), plans: billing.PLANS });
  }
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(s.ref_id);
  if (!kid) return res.json({ role: 'guest' });
  res.json({ role: 'kid', kid: publicKid(kid) });
});

function publicKid(k) {
  return { id: k.id, name: k.name, avatar: k.avatar, grade: k.grade, xp: k.xp, coins: k.coins, streak: k.streak, calendar_mode: k.calendar_mode, weekly_goal: k.weekly_goal };
}

// ---------- kid management (parent) ----------
router.post('/kids', auth.requireParent, (req, res) => {
  const { name, grade, pin, avatar, calendar_mode } = req.body || {};
  if (!name || grade == null || !/^\d{4}$/.test(String(pin)))
    return res.status(400).json({ error: 'Need a name, grade, and a 4-digit PIN.' });
  const count = db.prepare('SELECT COUNT(*) AS n FROM kids WHERE parent_id=?').get(req.parent.id).n;
  const plan = billing.PLANS[req.parent.sub_plan] || billing.PLANS.family;
  if (count >= plan.kids) return res.status(400).json({ error: `Your ${plan.name} plan supports up to ${plan.kids} learner(s).` });
  const info = db.prepare('INSERT INTO kids (parent_id, name, grade, pin, avatar, calendar_mode) VALUES (?,?,?,?,?,?)')
    .run(req.parent.id, String(name).trim(), Math.max(0, Math.min(12, Number(grade))), String(pin), AVATARS.includes(avatar) ? avatar : 'fox', calendar_mode || 'traditional');
  res.json({ ok: true, kidId: info.lastInsertRowid });
});

router.patch('/kids/:kidId', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(req.params.kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found.' });
  const { name, grade, pin, avatar, calendar_mode, weekly_goal } = req.body || {};
  db.prepare(`UPDATE kids SET name=COALESCE(?,name), grade=COALESCE(?,grade), pin=COALESCE(?,pin),
              avatar=COALESCE(?,avatar), calendar_mode=COALESCE(?,calendar_mode), weekly_goal=COALESCE(?,weekly_goal) WHERE id=?`)
    .run(name || null, grade != null ? Number(grade) : null, pin ? String(pin) : null, avatar || null, calendar_mode || null, weekly_goal != null ? Number(weekly_goal) : null, kid.id);
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
    return { subject: sub, label: meta.label, emoji: meta.emoji, color: meta.color, level: st.level, levelName: adaptive.gradeName(Math.round(st.level)), placed: !!st.placed };
  });
  res.json({ kid: publicKid(db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id)), subjects });
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
  const answerIdx = question.choices.indexOf(question.answer);
  res.json({
    done: false, probeGrade: result.probeGrade, progress: history.length,
    question: { prompt: question.prompt, choices: question.choices, voice: question.voice, answerIndex: answerIdx, skillName: question.skillName }
  });
});

// next activity in a subject
router.get('/learn/:kidId/next/:subject', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject } = req.params;
  if (!content.SUBJECTS[subject]) return res.status(404).json({ error: 'Unknown subject' });
  const activity = adaptive.nextActivity(req.kid.id, subject);
  if (!activity) return res.status(404).json({ error: 'No content available' });
  const qn = activity.question;
  const answerIdx = qn.choices.indexOf(qn.answer);
  res.json({
    mode: activity.mode, level: activity.level, skill: activity.skill,
    question: {
      prompt: qn.prompt, choices: qn.choices, voice: qn.voice, hint: qn.hint, explain: qn.explain,
      answerIndex: answerIdx, skillId: qn.skillId, skillName: qn.skillName, difficulty: qn.difficulty
    }
  });
});

// submit an answer
router.post('/learn/:kidId/answer', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { subject, skillId, correct, timeMs, difficulty } = req.body || {};
  if (!content.SUBJECTS[subject] || !content.getSkill(subject, skillId))
    return res.status(400).json({ error: 'Bad subject/skill' });
  const result = adaptive.recordAnswer(req.kid.id, subject, skillId, !!correct, Number(timeMs) || null, Number(difficulty) || 0.5);
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  res.json({ ...result, kid: publicKid(kid) });
});

// report card (kid-safe view + parent view share this)
router.get('/learn/:kidId/report', auth.requireKid, (req, res) => {
  res.json(adaptive.reportCard(req.kid.id));
});

// ---------- billing ----------
router.post('/billing/checkout', auth.requireParent, async (req, res) => {
  try {
    const origin = `${req.protocol}://${req.get('host')}`;
    const out = await billing.createCheckout(req.parent, req.body.plan === 'solo' ? 'solo' : 'family', origin);
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
