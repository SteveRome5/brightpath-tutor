// BrightPath Adaptive Engine — the "great teacher" brain
// Per-subject level, per-skill mastery, targeted review, auto level-up/down.
const db = require('./db');
const content = require('./content');

const MASTERED = 0.8;
const STRUGGLING = 0.45;
const LEVEL_WINDOW = 1; // skills within [level-1, level] are the active zone

// ---------- state helpers ----------
function getSubjectState(kidId, subject) {
  let row = db.prepare('SELECT * FROM subject_state WHERE kid_id=? AND subject=?').get(kidId, subject);
  if (!row) {
    const kid = db.prepare('SELECT grade FROM kids WHERE id=?').get(kidId);
    db.prepare('INSERT INTO subject_state (kid_id, subject, level, placed) VALUES (?,?,?,0)')
      .run(kidId, subject, subject === 'spanish' ? 0 : (kid ? kid.grade : 0));
    row = db.prepare('SELECT * FROM subject_state WHERE kid_id=? AND subject=?').get(kidId, subject);
  }
  return row;
}

function getSkillState(kidId, subject, skillId) {
  let row = db.prepare('SELECT * FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(kidId, subject, skillId);
  if (!row) {
    db.prepare('INSERT INTO skill_state (kid_id, subject, skill_id) VALUES (?,?,?)').run(kidId, subject, skillId);
    row = db.prepare('SELECT * FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(kidId, subject, skillId);
  }
  return row;
}

function activeSkills(kidId, subject) {
  const state = getSubjectState(kidId, subject);
  const lvl = Math.round(state.level);
  const all = content.skillsForSubject(subject);
  // active zone: skills at current level, plus one level below for review
  let zone = all.filter(s => s.grade >= lvl - LEVEL_WINDOW && s.grade <= lvl);
  if (!zone.length) zone = all.filter(s => s.grade <= lvl).slice(-4);
  if (!zone.length) zone = all.slice(0, 4);
  return { state, zone };
}

// ---------- placement ----------
// Adaptive placement: start at declared grade, step up/down based on answers.
function placementNext(kidId, subject, history) {
  // history: [{grade, correct}]
  getSubjectState(kidId, subject); // ensure the row exists so the final UPDATE always lands
  const kid = db.prepare('SELECT grade FROM kids WHERE id=?').get(kidId);
  const maxG = maxGrade(subject);
  // Start one grade BELOW enrollment: a kid entering 2nd grade has finished 1st,
  // not 2nd — starting at material they know builds confidence, and strong kids
  // step up within two questions anyway.
  let probe = subject === 'spanish' ? 0 : Math.min(Math.max(0, kid.grade - 1), maxG);
  // Probes never climb more than 3 grades above enrollment — a strong 2nd-grade
  // reader should NOT be shown high-school vocabulary during placement.
  const probeCap = subject === 'spanish' ? maxG : Math.min(maxG, kid.grade + 3);
  if (history.length) {
    const last = history[history.length - 1];
    const streak = tailStreak(history);
    if (last.correct) probe = Math.min(probeCap, last.grade + (streak >= 2 ? 2 : 1));
    else probe = Math.max(0, last.grade - (streak >= 2 ? 2 : 1));
  }
  const done = history.length >= 8 || oscillating(history);
  if (done) {
    let level = settleLevel(history, subject === 'spanish' ? 0 : kid.grade);
    // Place ambitiously but sanely: at most 3 grades above enrollment
    // (Spanish is a years-of-study ladder, so beginners always start low anyway.)
    if (subject !== 'spanish') level = Math.min(level, Math.min(maxGrade(subject), kid.grade + 3));
    db.prepare('UPDATE subject_state SET level=?, placed=1 WHERE kid_id=? AND subject=?').run(level, kidId, subject);
    // Seed skill states in the zone so reports look alive
    const all = content.skillsForSubject(subject).filter(s => s.grade === Math.round(level));
    for (const s of all) getSkillState(kidId, subject, s.id);
    return { done: true, level };
  }
  const skillsAt = content.skillsForSubject(subject).filter(s => s.grade === probe);
  const pickFrom = skillsAt.length ? skillsAt : content.skillsForSubject(subject);
  const skill = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  // Placement questions run gentle (0.35): we're measuring the level, not stress-testing it.
  // Kids prove understanding on basics first; lessons ramp difficulty afterward.
  const question = content.generateQuestion(subject, skill.id, 0.35);
  return { done: false, probeGrade: probe, question };
}

function tailStreak(history) {
  let n = 0;
  const want = history[history.length - 1].correct;
  for (let i = history.length - 1; i >= 0 && history[i].correct === want; i--) n++;
  return n;
}
function oscillating(history) {
  if (history.length < 6) return false;
  const t = history.slice(-4);
  return t[0].correct !== t[1].correct && t[1].correct !== t[2].correct && t[2].correct !== t[3].correct;
}
function settleLevel(history, fallback) {
  const correctGrades = history.filter(h => h.correct).map(h => h.grade);
  if (!correctGrades.length) return Math.max(0, Math.min(fallback, 1));
  // highest grade answered correctly at least once, softened by miss pattern
  const top = Math.max(...correctGrades);
  const missesAtTop = history.filter(h => h.grade >= top && !h.correct).length;
  return Math.max(0, Math.min(maxGrade('math'), missesAtTop >= 2 ? top - 1 : top));
}
function maxGrade(subject) {
  const all = content.skillsForSubject(subject);
  return Math.max(...all.map(s => s.grade));
}

// ---------- lesson selection: the tutor's judgment ----------
// Priorities: (1) rescue struggling skills, (2) advance frontier skills,
// (3) sprinkle review of mastered skills to keep them fresh.
function nextActivity(kidId, subject) {
  const { state, zone } = activeSkills(kidId, subject);
  // Spaced retention: ~1 in 8 questions resurfaces an old mastered skill
  // (last seen 3+ days ago) so learning actually STICKS — the science of review.
  if (Math.random() < 0.12) {
    const old = db.prepare(`SELECT * FROM skill_state WHERE kid_id=? AND subject=? AND mastery >= ?
      AND (last_seen IS NULL OR last_seen < datetime('now','-3 days'))`).all(kidId, subject, MASTERED);
    if (old.length) {
      const r = old[Math.floor(Math.random() * old.length)];
      const sk = content.getSkill(subject, r.skill_id);
      if (sk) {
        const question = content.generateQuestion(subject, sk.id, Math.max(0.3, r.mastery - 0.2));
        if (question) return { question, mode: 'retention', level: state.level, skill: { id: sk.id, name: sk.name, grade: sk.grade, mastery: r.mastery } };
      }
    }
  }
  const states = zone.map(s => ({ skill: s, st: getSkillState(kidId, subject, s.id) }));

  const struggling = states.filter(x => x.st.attempts >= 3 && x.st.mastery < STRUGGLING);
  const frontier = states.filter(x => x.st.mastery < MASTERED && !(x.st.attempts >= 3 && x.st.mastery < STRUGGLING));
  const fresh = states.filter(x => x.st.mastery >= MASTERED);

  let chosen, mode;
  const roll = Math.random();
  if (struggling.length && roll < 0.5) {
    chosen = weightedLowest(struggling); mode = 'boost';       // extra help where needed
  } else if (frontier.length) {
    chosen = weightedLowest(frontier); mode = 'learn';
  } else if (struggling.length) {
    chosen = weightedLowest(struggling); mode = 'boost';
  } else if (fresh.length && roll < 0.9) {
    chosen = fresh[Math.floor(Math.random() * fresh.length)]; mode = 'review';
  } else {
    chosen = states[Math.floor(Math.random() * states.length)] || null; mode = 'review';
  }
  if (!chosen) {
    // Never dead-end a session: fall back to the nearest grade with content.
    const all = content.skillsForSubject(subject);
    if (!all.length) return null;
    const target = Math.round(state.level);
    const near = all.slice().sort((a, b) => Math.abs(a.grade - target) - Math.abs(b.grade - target))[0];
    chosen = { skill: near, st: getSkillState(kidId, subject, near.id) };
    mode = 'review';
  }

  // difficulty scales with mastery — easier when struggling, harder when hot
  const d = Math.max(0.15, Math.min(0.95, chosen.st.mastery + (mode === 'boost' ? -0.15 : 0.1)));
  const question = content.generateQuestion(subject, chosen.skill.id, d);
  return {
    question, mode, level: state.level,
    skill: { id: chosen.skill.id, name: chosen.skill.name, grade: chosen.skill.grade, mastery: chosen.st.mastery }
  };
}

function weightedLowest(list) {
  const sorted = list.slice().sort((a, b) => a.st.mastery - b.st.mastery);
  // mostly the weakest, sometimes second-weakest for variety
  return Math.random() < 0.7 ? sorted[0] : sorted[Math.min(1, sorted.length - 1)];
}

// ---------- recording answers & progression ----------
function recordAnswer(kidId, subject, skillId, correct, timeMs, difficulty) {
  const st = getSkillState(kidId, subject, skillId);
  let m = st.mastery;
  if (correct) m = m + 0.16 * (1 - m) * (0.7 + (difficulty || 0.5) * 0.6);
  else m = m * 0.72;
  m = Math.max(0.05, Math.min(1, m));
  db.prepare(`UPDATE skill_state SET mastery=?, attempts=attempts+1, correct=correct+?,
              win_streak=?, last_seen=datetime('now') WHERE kid_id=? AND subject=? AND skill_id=?`)
    .run(m, correct ? 1 : 0, correct ? st.win_streak + 1 : 0, kidId, subject, skillId);
  db.prepare('INSERT INTO activity_log (kid_id, subject, skill_id, correct, difficulty, time_ms) VALUES (?,?,?,?,?,?)')
    .run(kidId, subject, skillId, correct ? 1 : 0, difficulty || 0.5, timeMs || null);

  // XP & coins
  const xp = correct ? Math.round(10 + (difficulty || 0.5) * 10) : 2;
  db.prepare('UPDATE kids SET xp = xp + ?, coins = coins + ? WHERE id=?').run(xp, correct ? 1 : 0, kidId);
  updateStreak(kidId);

  const events = [];
  // Learn-to-play: every 5 correct answers earns a Play Zone token (max 9 banked)
  if (correct) {
    const k = db.prepare('SELECT play_tokens, correct_since_token FROM kids WHERE id=?').get(kidId);
    let cst = (k.correct_since_token || 0) + 1;
    if (cst >= 5 && (k.play_tokens || 0) < 9) {
      db.prepare('UPDATE kids SET play_tokens = play_tokens + 1, correct_since_token = 0 WHERE id=?').run(kidId);
      events.push({ type: 'token', tokens: (k.play_tokens || 0) + 1 });
    } else {
      db.prepare('UPDATE kids SET correct_since_token = ? WHERE id=?').run(cst >= 5 ? 0 : cst, kidId);
    }
  }
  // level-up check: all current-level skills mastered
  const state = getSubjectState(kidId, subject);
  const lvl = Math.round(state.level);
  const levelSkills = content.skillsForSubject(subject).filter(s => s.grade === lvl);
  const allMastered = levelSkills.length > 0 && levelSkills.every(s => {
    const ss = db.prepare('SELECT mastery, attempts FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(kidId, subject, s.id);
    return ss && ss.mastery >= MASTERED && ss.attempts >= 3;
  });
  if (allMastered && lvl < maxGrade(subject)) {
    db.prepare('UPDATE subject_state SET level=? WHERE kid_id=? AND subject=?').run(lvl + 1, kidId, subject);
    const title = `${subjectLabel(subject)} — ${gradeName(lvl)} Complete!`;
    db.prepare('INSERT INTO certificates (kid_id, subject, title, level) VALUES (?,?,?,?)').run(kidId, subject, title, lvl);
    events.push({ type: 'levelup', subject, newLevel: lvl + 1, certificate: title });
  }
  // gentle level-down: sustained struggle across the level (8 answers is enough
  // signal — a kid missing 6 of 8 shouldn't have to grind 4 more before relief)
  const recent = db.prepare(`SELECT correct FROM activity_log WHERE kid_id=? AND subject=? ORDER BY id DESC LIMIT 8`).all(kidId, subject);
  if (recent.length >= 8 && recent.filter(r => r.correct).length <= 2 && state.level > 0) {
    db.prepare('UPDATE subject_state SET level=? WHERE kid_id=? AND subject=?').run(Math.max(0, state.level - 1), kidId, subject);
    events.push({ type: 'support', subject, newLevel: Math.max(0, state.level - 1) });
  }
  events.push(...checkBadges(kidId));
  return { mastery: m, xpGained: xp, events };
}

function updateStreak(kidId) {
  const kid = db.prepare('SELECT streak, last_active_day FROM kids WHERE id=?').get(kidId);
  const today = new Date().toISOString().slice(0, 10);
  if (kid.last_active_day === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = kid.last_active_day === yesterday ? kid.streak + 1 : 1;
  db.prepare('UPDATE kids SET streak=?, last_active_day=? WHERE id=?').run(streak, today, kidId);
}

const BADGES = [
  { id: 'first_steps', name: 'First Steps', emoji: '👟', test: k => k.totalAnswers >= 1 },
  { id: 'ten_correct', name: 'Perfect 10', emoji: '🔟', test: k => k.totalCorrect >= 10 },
  { id: 'fifty_correct', name: 'Half-Century Hero', emoji: '🏏', test: k => k.totalCorrect >= 50 },
  { id: 'century', name: 'Century Club', emoji: '💯', test: k => k.totalCorrect >= 100 },
  { id: 'streak3', name: 'On Fire (3-day streak)', emoji: '🔥', test: k => k.streak >= 3 },
  { id: 'streak7', name: 'Unstoppable (7-day streak)', emoji: '🌟', test: k => k.streak >= 7 },
  { id: 'polyglot', name: 'World Explorer', emoji: '🌎', test: k => k.spanishAnswers >= 20 },
  { id: 'scientist', name: 'Lab Legend', emoji: '🧪', test: k => k.scienceAnswers >= 20 },
  { id: 'mathlete', name: 'Mathlete', emoji: '🧮', test: k => k.mathAnswers >= 20 },
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', test: k => k.englishAnswers >= 20 },
  { id: 'xp1000', name: 'XP Machine', emoji: '⚡', test: k => k.xp >= 1000 }
];

function checkBadges(kidId) {
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(kidId);
  const agg = db.prepare(`SELECT COUNT(*) AS total, SUM(correct) AS totalCorrect,
    SUM(CASE WHEN subject='spanish' THEN 1 ELSE 0 END) AS sp,
    SUM(CASE WHEN subject='science' THEN 1 ELSE 0 END) AS sc,
    SUM(CASE WHEN subject='math' THEN 1 ELSE 0 END) AS ma,
    SUM(CASE WHEN subject='english' THEN 1 ELSE 0 END) AS en
    FROM activity_log WHERE kid_id=?`).get(kidId);
  const stats = {
    totalAnswers: agg.total || 0, totalCorrect: agg.totalCorrect || 0, streak: kid.streak, xp: kid.xp,
    spanishAnswers: agg.sp || 0, scienceAnswers: agg.sc || 0, mathAnswers: agg.ma || 0, englishAnswers: agg.en || 0
  };
  const earned = new Set(db.prepare('SELECT badge_id FROM badges WHERE kid_id=?').all(kidId).map(r => r.badge_id));
  const events = [];
  for (const b of BADGES) {
    if (!earned.has(b.id) && b.test(stats)) {
      db.prepare('INSERT INTO badges (kid_id, badge_id) VALUES (?,?)').run(kidId, b.id);
      events.push({ type: 'badge', badge: { id: b.id, name: b.name, emoji: b.emoji } });
    }
  }
  return events;
}

// ---------- reporting ----------
function gradeName(g) {
  return g === 0 ? 'Kindergarten' : `Grade ${g}`;
}
function subjectLabel(s) {
  return { math: 'Math', english: 'English', science: 'Science', spanish: 'Spanish' }[s] || s;
}
function letterGrade(avg) {
  if (avg >= 0.9) return 'A+'; if (avg >= 0.85) return 'A'; if (avg >= 0.8) return 'A-';
  if (avg >= 0.75) return 'B+'; if (avg >= 0.7) return 'B'; if (avg >= 0.65) return 'B-';
  if (avg >= 0.6) return 'C+'; if (avg >= 0.55) return 'C'; if (avg >= 0.45) return 'C-';
  return 'Growing 🌱';
}

function reportCard(kidId) {
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(kidId);
  const subjects = ['math', 'english', 'science', 'spanish'].map(sub => {
    const state = getSubjectState(kidId, sub);
    const rows = db.prepare('SELECT * FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').all(kidId, sub);
    const avg = rows.length ? rows.reduce((a, r) => a + r.mastery, 0) / rows.length : null;
    const agg = db.prepare(`SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND subject=?`).get(kidId, sub);
    const strengths = rows.filter(r => r.mastery >= MASTERED).sort((a, b) => b.mastery - a.mastery).slice(0, 3);
    const focus = rows.filter(r => r.mastery < STRUGGLING && r.attempts >= 2).sort((a, b) => a.mastery - b.mastery).slice(0, 3);
    const nameOf = id => { const s = content.getSkill(sub, id); return s ? s.name : id; };
    return {
      subject: sub, label: subjectLabel(sub), level: state.level, levelName: gradeName(Math.round(state.level)),
      placed: !!state.placed, avgMastery: avg, letter: avg == null ? '—' : letterGrade(avg),
      questionsAnswered: agg.n || 0, accuracy: agg.n ? (agg.c / agg.n) : null,
      strengths: strengths.map(r => nameOf(r.skill_id)),
      focusAreas: focus.map(r => nameOf(r.skill_id)),
      // full per-skill drill-down for parents
      skills: rows.sort((a, b) => b.mastery - a.mastery).slice(0, 24).map(r => {
        const sk = content.getSkill(sub, r.skill_id);
        return {
          name: sk ? sk.name : r.skill_id, grade: sk ? sk.grade : null,
          mastery: r.mastery, attempts: r.attempts,
          accuracy: r.attempts ? r.correct / r.attempts : null
        };
      })
    };
  });
  const badges = db.prepare(`SELECT badge_id, earned_at FROM badges WHERE kid_id=?`).all(kidId)
    .map(r => ({ ...BADGES.find(b => b.id === r.badge_id), earned_at: r.earned_at })).filter(b => b.id);
  const certs = db.prepare('SELECT * FROM certificates WHERE kid_id=? ORDER BY issued_at DESC').all(kidId);
  const week = db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-7 days')`).get(kidId);
  // 14-day activity history for the parent chart (fill missing days with zeros)
  const rows = db.prepare(`SELECT date(ts) AS d, COUNT(*) AS n, SUM(correct) AS c
    FROM activity_log WHERE kid_id=? AND ts >= datetime('now','-14 days') GROUP BY date(ts)`).all(kidId);
  const byDay = Object.fromEntries(rows.map(r => [r.d, r]));
  const history = [];
  for (let i = 13; i >= 0; i--) {
    const d = db.prepare(`SELECT date('now', ?) AS d`).get(`-${i} days`).d;
    const r = byDay[d];
    history.push({ day: d, answers: r ? r.n : 0, correct: r ? (r.c || 0) : 0 });
  }
  return {
    kid: { id: kid.id, name: kid.name, avatar: kid.avatar, grade: kid.grade, xp: kid.xp, coins: kid.coins, streak: kid.streak, weekly_goal: kid.weekly_goal, calendar_mode: kid.calendar_mode },
    subjects, badges, certificates: certs, weekAnswers: week.n || 0,
    history,
    pace: pace(kid)
  };
}

// School-calendar pacing
function pace(kid) {
  const now = new Date();
  let start, end, label;
  if (kid.calendar_mode === 'yearround') {
    start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31); label = 'Year-round';
  } else if (kid.calendar_mode === 'homeschool') {
    start = new Date(now.getFullYear(), 8, 1); if (now < start) start = new Date(now.getFullYear() - 1, 8, 1);
    end = new Date(start.getFullYear() + 1, 5, 30); label = 'Homeschool year';
  } else {
    start = new Date(now.getFullYear(), 7, 25); if (now < start) start = new Date(now.getFullYear() - 1, 7, 25);
    end = new Date(start.getFullYear() + 1, 5, 12); label = 'Traditional school year';
  }
  // Summer break (traditional & homeschool): last year ended, next hasn't started.
  if (now > end) {
    const nextStart = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    return {
      label: label + ' · Summer break', summer: true,
      startISO: nextStart.toISOString().slice(0, 10), endISO: end.toISOString().slice(0, 10),
      pctThroughYear: 1,
      note: `School's out! Summer practice keeps skills sharp — the ${nextStart.getFullYear()}–${nextStart.getFullYear() + 1} year starts ${nextStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
    };
  }
  const pct = Math.max(0, Math.min(1, (now - start) / (end - start)));
  return { label, startISO: start.toISOString().slice(0, 10), endISO: end.toISOString().slice(0, 10), pctThroughYear: pct };
}

// Manually shift a kid's level in a subject (kid "too tricky" button / parent control).
function setLevel(kidId, subject, level) {
  getSubjectState(kidId, subject); // ensure row
  const lv = Math.max(0, Math.min(maxGrade(subject), Number(level)));
  db.prepare('UPDATE subject_state SET level=?, placed=1 WHERE kid_id=? AND subject=?').run(lv, kidId, subject);
  return lv;
}

module.exports = {
  getSubjectState, nextActivity, recordAnswer, placementNext, reportCard,
  gradeName, subjectLabel, setLevel, maxGrade, BADGES, MASTERED, STRUGGLING
};
