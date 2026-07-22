// ============================================================================
// Gallop QA / staging subsystem — passwordless one-click test personas.
//
// SAFETY: this router only mounts when BOTH env vars are set:
//   QA_MODE=1           (turns the whole subsystem on)
//   QA_KEY=<secret>     (every /qa link must carry ?key=<secret>)
// It is intended to run ONLY on the isolated staging service (its own throwaway
// DB, no Stripe keys). It never runs on production unless someone explicitly sets
// those vars there. All accounts are fictional (emails @gallop.test) and billing
// is simulated in the DB — no real payment processor is ever touched here.
// ============================================================================
const express = require('express');
const db = require('./db');
const auth = require('./auth');

const QA_KEY = process.env.QA_KEY || '';
const enabled = () => process.env.QA_MODE === '1' && QA_KEY.length >= 6;

const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', maxAge: 90 * 86400000, secure: process.env.NODE_ENV === 'production' };
const SUBJECTS = ['math', 'english', 'science', 'spanish'];
const isoDaysAgo = d => new Date(Date.now() - d * 86400000).toISOString().slice(0, 19).replace('T', ' ');
const todayStr = () => new Date().toISOString().slice(0, 10);

// ---- low-level seed helpers -------------------------------------------------
function ensureParent(email, name, { sub_status = 'active', sub_plan = 'family', trialDays = 7 } = {}) {
  let p = db.prepare('SELECT * FROM parents WHERE email=?').get(email);
  if (!p) { auth.createParent(email, name, 'qa-Passw0rd!'); p = db.prepare('SELECT * FROM parents WHERE email=?').get(email); }
  const trial_ends = isoDaysAgo(-trialDays); // future
  db.prepare('UPDATE parents SET name=?, sub_status=?, sub_plan=?, trial_ends=? WHERE id=?')
    .run(name, sub_status, sub_plan, trial_ends, p.id);
  return p.id;
}
function ensureKid(parentId, name, grade, avatar) {
  let k = db.prepare('SELECT * FROM kids WHERE parent_id=? AND name=?').get(parentId, name);
  if (!k) {
    const info = db.prepare('INSERT INTO kids (parent_id,name,pin,grade,avatar,consent_at) VALUES (?,?,?,?,?,datetime(\'now\'))')
      .run(parentId, name, '1234', grade, avatar || 'fox');
    k = db.prepare('SELECT * FROM kids WHERE id=?').get(info.lastInsertRowid);
  } else {
    db.prepare('UPDATE kids SET grade=?, avatar=? WHERE id=?').run(grade, avatar || k.avatar, k.id);
  }
  return k.id;
}
function setSubjectLevels(kidId, levels) {
  for (const s of SUBJECTS) {
    const lvl = levels[s];
    if (lvl == null) continue;
    db.prepare('INSERT INTO subject_state (kid_id,subject,level,placed) VALUES (?,?,?,1) ON CONFLICT(kid_id,subject) DO UPDATE SET level=excluded.level, placed=1')
      .run(kidId, s, lvl);
  }
}
function setSkill(kidId, subject, skillId, { mastery, attempts, correct, winStreak = 0, lastSeenDays = 1 }) {
  db.prepare(`INSERT INTO skill_state (kid_id,subject,skill_id,mastery,attempts,correct,win_streak,last_seen)
    VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(kid_id,subject,skill_id) DO UPDATE SET mastery=excluded.mastery, attempts=excluded.attempts, correct=excluded.correct, win_streak=excluded.win_streak, last_seen=excluded.last_seen`)
    .run(kidId, subject, skillId, mastery, attempts, correct, winStreak, isoDaysAgo(lastSeenDays));
}
// Spread N answers for a skill across the last `spanDays`, with a given correct-rate.
function seedActivity(kidId, subject, skillId, n, correctRate, spanDays) {
  const ins = db.prepare('INSERT INTO activity_log (kid_id,subject,skill_id,correct,difficulty,time_ms,ts) VALUES (?,?,?,?,?,?,?)');
  for (let i = 0; i < n; i++) {
    const day = Math.floor((i / n) * spanDays);
    const correct = Math.random() < correctRate ? 1 : 0;
    ins.run(kidId, subject, skillId, correct, 0.4 + Math.random() * 0.3, 4000 + Math.floor(Math.random() * 9000), isoDaysAgo(spanDays - day));
  }
}
function giveCert(kidId, subject, title, level) {
  const has = db.prepare('SELECT 1 FROM certificates WHERE kid_id=? AND subject=? AND title=?').get(kidId, subject, title);
  if (!has) db.prepare('INSERT INTO certificates (kid_id,subject,title,level,issued_at) VALUES (?,?,?,?,?)').run(kidId, subject, title, level, isoDaysAgo(5));
}
function setKidStats(kidId, { xp = 0, coins = 0, streak = 0, activeToday = true, tokens = 5 }) {
  db.prepare('UPDATE kids SET xp=?, coins=?, streak=?, last_active_day=?, play_tokens=? WHERE id=?')
    .run(xp, coins, streak, activeToday ? todayStr() : isoDaysAgo(3).slice(0, 10), tokens, kidId);
}

// ---- persona definitions ----------------------------------------------------
// Every student persona is owned by one hidden QA family parent (so kid logins work
// independently). The two PARENT personas are their own accounts.
const QA_FAMILY_EMAIL = 'qa+students@gallop.test';

// rich, weeks-long history used by the "returning" style personas
function seedReturningKid(kidId, grade, opts = {}) {
  const lvl = opts.levels || { math: grade, english: grade, science: grade, spanish: Math.max(0, grade - 1) };
  setSubjectLevels(kidId, lvl);
  // mastered skills (high mastery, many attempts) — one with an OLD last_seen = retention due
  (opts.mastered || []).forEach((s, i) => setSkill(kidId, s.subject, s.id, { mastery: 0.9, attempts: 28, correct: 26, winStreak: 6, lastSeenDays: i === 0 ? 16 : 3 }));
  // skills still being learned
  (opts.learning || []).forEach(s => setSkill(kidId, s.subject, s.id, { mastery: 0.55, attempts: 14, correct: 8, winStreak: 1, lastSeenDays: 1 }));
  // recurring-mistake / struggling skills
  (opts.struggling || []).forEach(s => { setSkill(kidId, s.subject, s.id, { mastery: 0.28, attempts: 22, correct: 7, winStreak: 0, lastSeenDays: 0 }); seedActivity(kidId, s.subject, s.id, 22, 0.32, 18); });
  // general activity across subjects over ~3 weeks
  for (const s of SUBJECTS) seedActivity(kidId, s, (lvl[s] != null ? 'm' : 'm') && `${s[0]}.hist`, 0, 0.8, 21); // no-op guard
  (opts.mastered || []).forEach(s => seedActivity(kidId, s.subject, s.id, 26, 0.9, 20));
  (opts.learning || []).forEach(s => seedActivity(kidId, s.subject, s.id, 14, 0.6, 12));
  (opts.certs || []).forEach(c => giveCert(kidId, c.subject, c.title, c.level));
  setKidStats(kidId, { xp: opts.xp || 1400, coins: opts.coins || 60, streak: opts.streak || 5, activeToday: true, tokens: 5 });
}

const PERSONAS = {
  'new-parent': {
    kind: 'parent', label: 'New Parent (fresh signup)',
    desc: 'Trial available, onboarding NOT done, no children, no payment method. Tests signup → add child → pick grade → goals → first session, and whether Gallop’s value is clear.',
    seed() {
      const pid = ensureParent('qa+new-parent@gallop.test', 'Alex Rivera', { sub_status: 'trial', trialDays: 7 });
      // ensure truly fresh: remove any kids
      db.prepare('DELETE FROM kids WHERE parent_id=?').run(pid);
      return { kind: 'parent', id: pid };
    }
  },
  'returning-parent': {
    kind: 'parent', label: 'Returning Parent (3 kids, weeks of history)',
    desc: 'Active subscription, 3 children with several weeks of activity, completed + incomplete lessons, weekly reports, strengths, gaps, a mastered skill and a skill awaiting a retention check. Tests switching kids, progress, reports, recommendations, retention.',
    seed() {
      const pid = ensureParent('qa+returning-parent@gallop.test', 'Jordan Chen', { sub_status: 'active', sub_plan: 'family' });
      const maya = ensureKid(pid, 'Maya', 4, 'unicorn');
      seedReturningKid(maya, 4, {
        levels: { math: 3.5, english: 4, science: 4, spanish: 3 },
        mastered: [{ subject: 'english', id: 'e.3.synant' }, { subject: 'science', id: 's.3.forces' }],
        learning: [{ subject: 'math', id: 'm.4.equivfrac' }],
        struggling: [{ subject: 'math', id: 'm.4.equivfrac' }],
        certs: [{ subject: 'english', title: 'English Level 3 Master', level: 3 }], xp: 1650, streak: 7
      });
      const leo = ensureKid(pid, 'Leo', 7, 'dragon');
      seedReturningKid(leo, 7, {
        levels: { math: 7, english: 7, science: 6, spanish: 6 },
        mastered: [{ subject: 'math', id: 'm.7.equation' }, { subject: 'spanish', id: 'sp.5.eri' }],
        learning: [{ subject: 'science', id: 's.7.chemistry' }],
        struggling: [{ subject: 'english', id: 'e.7.evidence' }], xp: 2200, streak: 3
      });
      const ivy = ensureKid(pid, 'Ivy', 1, 'panda');
      seedReturningKid(ivy, 1, {
        levels: { math: 1, english: 1, science: 1, spanish: 0 },
        mastered: [{ subject: 'math', id: 'm.1.add20' }],
        learning: [{ subject: 'english', id: 'e.1.vowels' }], struggling: [], xp: 520, streak: 2
      });
      return { kind: 'parent', id: pid };
    }
  },
  'k-student': {
    kind: 'kid', label: 'Kindergarten Student (age ~5, pre-reader)',
    desc: 'Grade K, no history, needs read-aloud, very short instructions. Tests whether a young child can use Gallop without constant help.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Sam (K)', 0, 'panda');
      setSubjectLevels(kid, { math: 0, english: 0, science: 0, spanish: 0 });
      setKidStats(kid, { xp: 0, coins: 0, streak: 0, activeToday: false, tokens: 5 });
      return { kind: 'kid', id: kid };
    }
  },
  'grade4-fractions': {
    kind: 'kid', label: '4th Grader struggling with fractions',
    desc: 'Confuses numerator/denominator, has missed the same fraction idea several times, some history, a fraction skill queued to resume. Tests whether Gallop diagnoses the misconception and changes its approach instead of repeating itself.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Noah (Gr4)', 4, 'tiger');
      setSubjectLevels(kid, { math: 3.5, english: 4, science: 4, spanish: 3 });
      // repeated fraction failure
      setSkill(kid, 'math', 'm.4.equivfrac', { mastery: 0.24, attempts: 26, correct: 7, winStreak: 0, lastSeenDays: 0 });
      seedActivity(kid, 'math', 'm.4.equivfrac', 26, 0.27, 20);
      setSkill(kid, 'math', 'm.3.frac', { mastery: 0.35, attempts: 18, correct: 9, winStreak: 0, lastSeenDays: 1 });
      seedActivity(kid, 'math', 'm.3.frac', 18, 0.5, 18);
      setSkill(kid, 'english', 'e.3.reading', { mastery: 0.7, attempts: 16, correct: 13, winStreak: 3, lastSeenDays: 2 });
      seedActivity(kid, 'english', 'e.3.reading', 16, 0.8, 14);
      setKidStats(kid, { xp: 900, coins: 24, streak: 2, activeToday: true, tokens: 5 });
      return { kind: 'kid', id: kid };
    }
  },
  'grade7': {
    kind: 'kid', label: '7th Grader (capable, dislikes childish tone)',
    desc: 'Academically strong, dislikes corny language and fake enthusiasm, wants direct explanations, has said work felt too easy, several completed sessions. Tests age-appropriateness of tone.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Zoe (Gr7)', 7, 'astronaut');
      seedReturningKid(kid, 7, {
        levels: { math: 7.5, english: 7, science: 7, spanish: 6 },
        mastered: [{ subject: 'math', id: 'm.7.proportion' }, { subject: 'science', id: 's.7.chemistry' }],
        learning: [{ subject: 'english', id: 'e.7.argument' }], struggling: [], xp: 2600, streak: 9
      });
      return { kind: 'kid', id: kid };
    }
  },
  'grade11-algebra2': {
    kind: 'kid', label: '11th Grader (Algebra II exam prep)',
    desc: 'Preparing for an Algebra II–style exam, limited study time, wants fast concise help and exam-style questions, some history. Tests credibility and usefulness for high schoolers.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Maya (Gr11)', 11, 'robot');
      setSubjectLevels(kid, { math: 11, english: 11, science: 11, spanish: 10 });
      setSkill(kid, 'math', 'm.11.functions', { mastery: 0.72, attempts: 20, correct: 15, winStreak: 3, lastSeenDays: 2 });
      setSkill(kid, 'math', 'm.11.exponential', { mastery: 0.58, attempts: 14, correct: 8, winStreak: 1, lastSeenDays: 1 });
      setSkill(kid, 'math', 'm.11.logs', { mastery: 0.4, attempts: 10, correct: 4, winStreak: 0, lastSeenDays: 0 });
      ['m.11.functions', 'm.11.exponential', 'm.11.logs'].forEach(s => seedActivity(kid, 'math', s, 14, 0.6, 12));
      setKidStats(kid, { xp: 3100, coins: 40, streak: 4, activeToday: true, tokens: 5 });
      return { kind: 'kid', id: kid };
    }
  },
  'advanced': {
    kind: 'kid', label: 'Advanced Student (needs harder work)',
    desc: 'Answers grade-level questions correctly and moves fast; should be pushed up, not forced through easy repetition. Tests whether difficulty truly adapts upward.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Kai (advanced Gr5)', 5, 'dragon');
      // grade 5 kid working well ABOVE grade level
      setSubjectLevels(kid, { math: 7, english: 7, science: 6.5, spanish: 6 });
      [['math', 'm.5.fracops'], ['math', 'm.6.ratio'], ['math', 'm.6.percent'], ['english', 'e.5.figlang'], ['science', 's.5.body']]
        .forEach(([subj, id]) => { setSkill(kid, subj, id, { mastery: 0.94, attempts: 24, correct: 23, winStreak: 9, lastSeenDays: 1 }); seedActivity(kid, subj, id, 24, 0.95, 16); });
      giveCert(kid, 'math', 'Math Level 5 Master', 5);
      setKidStats(kid, { xp: 3400, coins: 80, streak: 12, activeToday: true, tokens: 5 });
      return { kind: 'kid', id: kid };
    }
  },
  'returning-student': {
    kind: 'kid', label: 'Returning Student (rich history — does Gallop remember me?)',
    desc: 'Weeks of history, known strengths, recurring mistakes, mastered skills, and one skill awaiting a later retention check. Tests whether Gallop knows the student and adapts over time.',
    seed() {
      const pid = ensureParent(QA_FAMILY_EMAIL, 'QA Family', { sub_status: 'active' });
      const kid = ensureKid(pid, 'Ava (Gr6)', 6, 'octopus');
      seedReturningKid(kid, 6, {
        levels: { math: 6, english: 6, science: 6, spanish: 5 },
        mastered: [{ subject: 'math', id: 'm.6.ratio' }, { subject: 'english', id: 'e.6.theme' }, { subject: 'spanish', id: 'sp.5.eri' }],
        learning: [{ subject: 'science', id: 's.6.cells' }],
        struggling: [{ subject: 'math', id: 'm.6.integers' }],
        certs: [{ subject: 'math', title: 'Math Level 5 Master', level: 5 }], xp: 2050, streak: 6
      });
      return { kind: 'kid', id: kid };
    }
  }
};

// ---- billing-state simulation (no Stripe) -----------------------------------
const BILLING_ACTIONS = {
  active: { sub_status: 'active', trialDays: 30, note: 'Active paid subscription' },
  trial: { sub_status: 'trial', trialDays: 5, note: 'On free trial, 5 days left' },
  'expiring-trial': { sub_status: 'trial', trialDays: 0, note: 'Trial expiring today' },
  'trial-expired': { sub_status: 'trial', trialDays: -1, note: 'Trial expired (should hit paywall)' },
  'past-due': { sub_status: 'past_due', trialDays: 30, note: 'Failed payment / past due' },
  canceled: { sub_status: 'canceled', trialDays: 30, note: 'Subscription canceled' }
};

// ---- data export ------------------------------------------------------------
function exportPersona(slug) {
  const seeded = PERSONAS[slug].seed();
  const out = { persona: slug, kind: seeded.kind };
  if (seeded.kind === 'parent') {
    const p = db.prepare('SELECT id,email,name,sub_status,sub_plan,trial_ends,created_at FROM parents WHERE id=?').get(seeded.id);
    out.parent = p;
    out.children = db.prepare('SELECT id,name,grade,xp,coins,streak FROM kids WHERE parent_id=?').all(seeded.id).map(k => ({
      ...k,
      subjects: db.prepare('SELECT subject,level FROM subject_state WHERE kid_id=?').all(k.id),
      skills: db.prepare('SELECT subject,skill_id,mastery,attempts,correct FROM skill_state WHERE kid_id=?').all(k.id),
      answers: db.prepare('SELECT COUNT(*) n, SUM(correct) c FROM activity_log WHERE kid_id=?').get(k.id)
    }));
  } else {
    const k = db.prepare('SELECT id,name,grade,xp,coins,streak FROM kids WHERE id=?').get(seeded.id);
    out.student = { ...k, subjects: db.prepare('SELECT subject,level FROM subject_state WHERE kid_id=?').all(k.id), skills: db.prepare('SELECT subject,skill_id,mastery,attempts,correct FROM skill_state WHERE kid_id=?').all(k.id) };
  }
  return out;
}

// ---- reset ------------------------------------------------------------------
const QA_EMAILS = ['qa+new-parent@gallop.test', 'qa+returning-parent@gallop.test', QA_FAMILY_EMAIL];
function resetAll() {
  for (const email of QA_EMAILS) {
    const p = db.prepare('SELECT id FROM parents WHERE email=?').get(email);
    if (p) db.prepare('DELETE FROM parents WHERE id=?').run(p.id); // cascade removes kids + history
  }
  for (const slug of Object.keys(PERSONAS)) PERSONAS[slug].seed();
}

// ---- router -----------------------------------------------------------------
function keyOk(req) { return enabled() && (req.query.key === QA_KEY || req.cookies.qa_key === QA_KEY); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function buildRouter() {
  const r = express.Router();
  r.use((req, res, next) => {
    if (!enabled()) return res.status(404).send('Not found');
    if (!keyOk(req)) return res.status(401).send('QA access key required. Add ?key=... to the URL.');
    if (req.query.key === QA_KEY) res.cookie('qa_key', QA_KEY, COOKIE_OPTS);
    next();
  });

  // Launchpad
  r.get('/', (req, res) => {
    const k = QA_KEY;
    const card = (slug) => {
      const p = PERSONAS[slug];
      const billing = p.kind === 'parent' ? `<div class="bill">Set billing state: ${Object.keys(BILLING_ACTIONS).map(a => `<a class="pill" href="/qa/billing/${slug}/${a}?key=${k}">${a}</a>`).join(' ')}</div>` : '';
      return `<div class="pc"><h3>${esc(p.label)}</h3><p>${esc(p.desc)}</p>
        <div class="row"><a class="btn" href="/qa/as/${slug}?key=${k}" target="_blank">▶ Open this account</a>
        <a class="lnk" href="/qa/export/${slug}?key=${k}" target="_blank">Export data</a>
        <a class="lnk danger" href="/qa/delete/${slug}?key=${k}">Delete</a></div>${billing}</div>`;
    };
    res.set('Content-Type', 'text/html').send(`<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Gallop QA Launchpad</title><style>
body{font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:0 auto;padding:24px;background:#0f1420;color:#e8edf4}
h1{font-size:1.6rem}h3{margin:.2rem 0}a{color:#7db9ff}
.pc{background:#182234;border:1px solid #26344c;border-radius:12px;padding:14px 16px;margin:12px 0}
.pc p{color:#9fb0c8;font-size:.92rem;margin:.3rem 0 .6rem}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.btn{display:inline-block;background:#2e7d46;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700}
.lnk{font-size:.85rem}.danger{color:#e88}
.bill{margin-top:8px;font-size:.82rem;color:#9fb0c8}.pill{display:inline-block;background:#20304a;padding:2px 8px;border-radius:999px;margin:2px;text-decoration:none;font-size:.78rem}
.top{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.warn{background:#3a2a12;border:1px solid #6b4e12;color:#f0d9a8;padding:10px 14px;border-radius:10px;font-size:.86rem;margin:10px 0}
.reset{background:#8a2b2b;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700}
</style>
<h1>🐎 Gallop — QA Launchpad</h1>
<div class="warn"><b>Isolated staging environment.</b> All accounts are fictional (@gallop.test) and billing is simulated — no real payment is ever processed. One click opens each account with no password, email, or verification. Links stop working the moment QA mode is turned off.</div>
<div class="top"><a class="reset" href="/qa/reset?key=${k}">↺ Reset ALL test accounts</a> <span style="font-size:.82rem;color:#9fb0c8">Wipes and re-seeds every persona to a clean baseline.</span></div>
<h2>Parents</h2>${['new-parent', 'returning-parent'].map(card).join('')}
<h2>Students</h2>${['k-student', 'grade4-fractions', 'grade7', 'grade11-algebra2', 'advanced', 'returning-student'].map(card).join('')}
<p style="color:#7a8aa0;font-size:.8rem;margin-top:20px">Kid PIN (if ever asked): 1234 · Build: <code>${esc(process.env.RENDER_GIT_COMMIT || 'local')}</code></p>`);
  });

  // One-click login
  r.get('/as/:slug', (req, res) => {
    const p = PERSONAS[req.params.slug];
    if (!p) return res.status(404).send('Unknown persona');
    let seeded; try { seeded = p.seed(); } catch (e) { return res.status(500).send('Seed error: ' + e.message); }
    const token = auth.createSession(seeded.kind, seeded.id);
    res.cookie('bp_session', token, COOKIE_OPTS);
    res.redirect(seeded.kind === 'parent' ? '/#parent' : '/#home');
  });

  // Billing-state simulation (parents only)
  r.get('/billing/:slug/:action', (req, res) => {
    const p = PERSONAS[req.params.slug];
    const act = BILLING_ACTIONS[req.params.action];
    if (!p || p.kind !== 'parent' || !act) return res.status(400).send('Bad billing request');
    const seeded = p.seed();
    db.prepare('UPDATE parents SET sub_status=?, trial_ends=? WHERE id=?').run(act.sub_status, isoDaysAgo(-act.trialDays), seeded.id);
    res.set('Content-Type', 'text/html').send(`<p>✅ Set <b>${esc(p.label)}</b> → <b>${esc(act.note)}</b>. <a href="/qa/as/${req.params.slug}?key=${QA_KEY}">Open the account →</a> · <a href="/qa?key=${QA_KEY}">Back to launchpad</a></p>`);
  });

  // Export fictional data
  r.get('/export/:slug', (req, res) => {
    if (!PERSONAS[req.params.slug]) return res.status(404).send('Unknown persona');
    res.json(exportPersona(req.params.slug));
  });

  // Delete a persona (it can be re-created by opening it again)
  r.get('/delete/:slug', (req, res) => {
    const p = PERSONAS[req.params.slug];
    if (!p) return res.status(404).send('Unknown persona');
    const seeded = p.seed();
    if (seeded.kind === 'parent') db.prepare('DELETE FROM parents WHERE id=?').run(seeded.id);
    else db.prepare('DELETE FROM kids WHERE id=?').run(seeded.id);
    res.set('Content-Type', 'text/html').send(`<p>🗑️ Deleted <b>${esc(p.label)}</b>. <a href="/qa?key=${QA_KEY}">Back to launchpad</a> (open it again to re-create it).</p>`);
  });

  // Reset everything
  r.get('/reset', (req, res) => {
    resetAll();
    res.set('Content-Type', 'text/html').send(`<p>↺ All QA accounts reset to a clean baseline. <a href="/qa?key=${QA_KEY}">Back to launchpad</a></p>`);
  });

  return r;
}

module.exports = { enabled, buildRouter, resetAll, PERSONAS };
