// BrightPath Adaptive Engine — the "great teacher" brain
// Per-subject level, per-skill mastery, targeted review, auto level-up/down.
const db = require('./db');
const content = require('./content');

const MASTERED = 0.8;
const STRUGGLING = 0.45;
const LEVEL_WINDOW = 1; // skills within [level-1, level] are the active zone

// Anti-repeat: remember the last N prompts served to each kid per subject so the
// same question doesn't come back around while they'd still recognize it.
const RECENT_MAX = 30;
const recentQs = new Map(); // "kidId:subject" -> [prompt, ...]
function recentSet(kidId, subject) { return new Set(recentQs.get(`${kidId}:${subject}`) || []); }
function noteRecent(kidId, subject, prompt) {
  if (!prompt) return;
  const key = `${kidId}:${subject}`;
  const arr = recentQs.get(key) || [];
  arr.push(prompt);
  if (arr.length > RECENT_MAX) arr.splice(0, arr.length - RECENT_MAX);
  recentQs.set(key, arr);
  if (recentQs.size > 5000) recentQs.clear(); // memory guard
}

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
  const question = content.generateQuestion(subject, skill.id, 0.35, recentSet(kidId, subject));
  if (question) noteRecent(kidId, subject, question.prompt);
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
        const question = content.generateQuestion(subject, sk.id, Math.max(0.3, r.mastery - 0.2), recentSet(kidId, subject));
        if (question) { noteRecent(kidId, subject, question.prompt); return { question, mode: 'retention', level: state.level, skill: { id: sk.id, name: sk.name, grade: sk.grade, mastery: r.mastery } }; }
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
  const question = content.generateQuestion(subject, chosen.skill.id, d, recentSet(kidId, subject));
  if (question) noteRecent(kidId, subject, question.prompt);
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

// Each badge: id, name, emoji, rarity, cat (category), stat (which stat it tracks),
// goal (target value), and desc. A locked badge shows progress = stats[stat]/goal,
// so kids always see how close they are to the next unlock. Rarity drives the glow.
const BADGES = [
  // --- Milestones (answering & correctness) ---
  { id: 'first_steps', name: 'First Steps', emoji: '👟', rarity: 'common', cat: 'milestone', stat: 'totalAnswers', goal: 1, desc: 'Answer your very first question.' },
  { id: 'ten_correct', name: 'Perfect 10', emoji: '🔟', rarity: 'common', cat: 'milestone', stat: 'totalCorrect', goal: 10, desc: 'Get 10 questions right.' },
  { id: 'fifty_correct', name: 'Half-Century Hero', emoji: '🏏', rarity: 'rare', cat: 'milestone', stat: 'totalCorrect', goal: 50, desc: 'Get 50 questions right.' },
  { id: 'century', name: 'Century Club', emoji: '💯', rarity: 'rare', cat: 'milestone', stat: 'totalCorrect', goal: 100, desc: 'Get 100 questions right.' },
  { id: 'quincy', name: 'High Five Hundred', emoji: '🖐️', rarity: 'epic', cat: 'milestone', stat: 'totalCorrect', goal: 500, desc: 'Get 500 questions right.' },
  { id: 'grand', name: 'Grand Master', emoji: '🏆', rarity: 'legendary', cat: 'milestone', stat: 'totalCorrect', goal: 1000, desc: 'Get 1,000 questions right!' },
  // --- Streaks ---
  { id: 'streak3', name: 'On Fire', emoji: '🔥', rarity: 'common', cat: 'streak', stat: 'streak', goal: 3, desc: 'Learn 3 days in a row.' },
  { id: 'streak7', name: 'Unstoppable', emoji: '🌟', rarity: 'rare', cat: 'streak', stat: 'streak', goal: 7, desc: 'A 7-day learning streak.' },
  { id: 'streak14', name: 'Two-Week Titan', emoji: '💫', rarity: 'epic', cat: 'streak', stat: 'streak', goal: 14, desc: 'A 14-day streak — wow!' },
  { id: 'streak30', name: 'Month of Mastery', emoji: '👑', rarity: 'legendary', cat: 'streak', stat: 'streak', goal: 30, desc: 'A 30-day streak. Legendary!' },
  // --- Subject explorers ---
  { id: 'mathlete', name: 'Mathlete', emoji: '🧮', rarity: 'common', cat: 'subject', stat: 'mathAnswers', goal: 20, desc: 'Answer 20 math questions.' },
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', rarity: 'common', cat: 'subject', stat: 'englishAnswers', goal: 20, desc: 'Answer 20 English questions.' },
  { id: 'scientist', name: 'Lab Legend', emoji: '🧪', rarity: 'common', cat: 'subject', stat: 'scienceAnswers', goal: 20, desc: 'Answer 20 science questions.' },
  { id: 'polyglot', name: 'World Explorer', emoji: '🌎', rarity: 'common', cat: 'subject', stat: 'spanishAnswers', goal: 20, desc: 'Answer 20 Spanish questions.' },
  { id: 'math100', name: 'Number Ninja', emoji: '➗', rarity: 'epic', cat: 'subject', stat: 'mathAnswers', goal: 100, desc: 'Answer 100 math questions.' },
  { id: 'eng100', name: 'Word Wizard', emoji: '✍️', rarity: 'epic', cat: 'subject', stat: 'englishAnswers', goal: 100, desc: 'Answer 100 English questions.' },
  { id: 'sci100', name: 'Mad Scientist', emoji: '🔬', rarity: 'epic', cat: 'subject', stat: 'scienceAnswers', goal: 100, desc: 'Answer 100 science questions.' },
  { id: 'spa100', name: 'Español Star', emoji: '💃', rarity: 'epic', cat: 'subject', stat: 'spanishAnswers', goal: 100, desc: 'Answer 100 Spanish questions.' },
  { id: 'renaissance', name: 'Renaissance Kid', emoji: '🎨', rarity: 'legendary', cat: 'subject', stat: 'allFourActive', goal: 4, desc: 'Practice all four subjects (20+ each).' },
  // --- Mastery ---
  { id: 'master1', name: 'Skill Sharpener', emoji: '⭐', rarity: 'rare', cat: 'mastery', stat: 'skillsMastered', goal: 5, desc: 'Master 5 skills.' },
  { id: 'master15', name: 'Mastery Maven', emoji: '🎯', rarity: 'epic', cat: 'mastery', stat: 'skillsMastered', goal: 15, desc: 'Master 15 skills.' },
  { id: 'master40', name: 'Grand Scholar', emoji: '🦉', rarity: 'legendary', cat: 'mastery', stat: 'skillsMastered', goal: 40, desc: 'Master 40 skills!' },
  { id: 'cert1', name: 'Level Up!', emoji: '🎓', rarity: 'rare', cat: 'mastery', stat: 'certificates', goal: 1, desc: 'Earn your first certificate.' },
  { id: 'cert5', name: 'Certified Champion', emoji: '📜', rarity: 'legendary', cat: 'mastery', stat: 'certificates', goal: 5, desc: 'Earn 5 certificates.' },
  // --- XP / rank ---
  { id: 'xp1000', name: 'XP Machine', emoji: '⚡', rarity: 'rare', cat: 'xp', stat: 'xp', goal: 1000, desc: 'Earn 1,000 XP.' },
  { id: 'xp5000', name: 'XP Dynamo', emoji: '🌀', rarity: 'epic', cat: 'xp', stat: 'xp', goal: 5000, desc: 'Earn 5,000 XP.' },
  { id: 'xp15000', name: 'Thoroughbred', emoji: '🏇', rarity: 'legendary', cat: 'xp', stat: 'xp', goal: 15000, desc: 'Earn 15,000 XP — top rank!' },
  // --- Collector (avatars, snacks, games) ---
  { id: 'collector', name: 'Style Collector', emoji: '🎩', rarity: 'rare', cat: 'collector', stat: 'avatarsOwned', goal: 5, desc: 'Own 5 avatar items.' },
  { id: 'collector20', name: 'Fashionista', emoji: '💎', rarity: 'epic', cat: 'collector', stat: 'avatarsOwned', goal: 20, desc: 'Own 20 avatar items.' },
  { id: 'foodie', name: 'Snack Collector', emoji: '🍿', rarity: 'rare', cat: 'collector', stat: 'snacksCollected', goal: 10, desc: 'Collect 10 snacks.' },
  { id: 'gourmet', name: 'Gourmet Gallop', emoji: '🍱', rarity: 'epic', cat: 'collector', stat: 'snacksCollected', goal: 30, desc: 'Collect 30 snacks.' },
  { id: 'gamer', name: 'Arcade Ace', emoji: '🕹️', rarity: 'rare', cat: 'collector', stat: 'gamesPlayed', goal: 10, desc: 'Play 10 arcade games.' },
  { id: 'blitzpro', name: 'Lightning Legend', emoji: '⚡', rarity: 'epic', cat: 'collector', stat: 'bestBlitz', goal: 20, desc: 'Score 20+ in Lightning Round.' }
];
const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

// Gather every stat any badge needs, in one query pass.
function achievementStats(kidId) {
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(kidId);
  const agg = db.prepare(`SELECT COUNT(*) AS total, SUM(correct) AS totalCorrect,
    SUM(CASE WHEN subject='spanish' THEN 1 ELSE 0 END) AS sp,
    SUM(CASE WHEN subject='science' THEN 1 ELSE 0 END) AS sc,
    SUM(CASE WHEN subject='math' THEN 1 ELSE 0 END) AS ma,
    SUM(CASE WHEN subject='english' THEN 1 ELSE 0 END) AS en
    FROM activity_log WHERE kid_id=?`).get(kidId);
  const mastered = db.prepare('SELECT COUNT(*) AS n FROM skill_state WHERE kid_id=? AND mastery >= ?').get(kidId, MASTERED).n;
  const certs = db.prepare('SELECT COUNT(*) AS n FROM certificates WHERE kid_id=?').get(kidId).n;
  const avatars = db.prepare('SELECT COUNT(*) AS n FROM avatar_items WHERE kid_id=?').get(kidId).n;
  let snacks = 0, bestBlitz = 0, gamesPlayed = 0;
  try { snacks = db.prepare('SELECT COALESCE(SUM(qty),0) AS n FROM snacks WHERE kid_id=?').get(kidId).n; } catch (e) {}
  try { gamesPlayed = db.prepare('SELECT COUNT(*) AS n FROM game_scores WHERE kid_id=?').get(kidId).n; } catch (e) {}
  try { bestBlitz = db.prepare("SELECT COALESCE(MAX(score),0) AS n FROM game_scores WHERE kid_id=? AND game='blitz'").get(kidId).n; } catch (e) {}
  const subj = { math: agg.ma || 0, english: agg.en || 0, science: agg.sc || 0, spanish: agg.sp || 0 };
  const allFourActive = ['math', 'english', 'science', 'spanish'].filter(s => subj[s] >= 20).length;
  return {
    totalAnswers: agg.total || 0, totalCorrect: agg.totalCorrect || 0, streak: kid.streak || 0, xp: kid.xp || 0,
    mathAnswers: subj.math, englishAnswers: subj.english, scienceAnswers: subj.science, spanishAnswers: subj.spanish,
    skillsMastered: mastered, certificates: certs, avatarsOwned: avatars, snacksCollected: snacks,
    gamesPlayed, bestBlitz, allFourActive
  };
}

function checkBadges(kidId) {
  const stats = achievementStats(kidId);
  const earned = new Set(db.prepare('SELECT badge_id FROM badges WHERE kid_id=?').all(kidId).map(r => r.badge_id));
  const events = [];
  for (const b of BADGES) {
    if (!earned.has(b.id) && (stats[b.stat] || 0) >= b.goal) {
      db.prepare('INSERT INTO badges (kid_id, badge_id) VALUES (?,?)').run(kidId, b.id);
      events.push({ type: 'badge', badge: { id: b.id, name: b.name, emoji: b.emoji, rarity: b.rarity } });
    }
  }
  return events;
}

// The full Trophy Case payload: every badge (earned + locked-with-progress),
// rank ladder, certificates, collection counts, and the next goals to chase.
function achievements(kidId) {
  checkBadges(kidId); // make sure anything newly-earned is recorded first
  const stats = achievementStats(kidId);
  const earnedRows = db.prepare('SELECT badge_id, earned_at FROM badges WHERE kid_id=?').all(kidId);
  const earnedAt = Object.fromEntries(earnedRows.map(r => [r.badge_id, r.earned_at]));
  const badges = BADGES.map(b => {
    const cur = stats[b.stat] || 0;
    const done = !!earnedAt[b.id] || cur >= b.goal;
    return {
      id: b.id, name: b.name, emoji: b.emoji, rarity: b.rarity, cat: b.cat, desc: b.desc,
      goal: b.goal, cur: Math.min(cur, b.goal), earned: done, earned_at: earnedAt[b.id] || null
    };
  });
  const earnedCount = badges.filter(b => b.earned).length;
  // Next goals: closest unearned badges by % progress (only ones actually started or near)
  const nextGoals = badges.filter(b => !b.earned)
    .map(b => ({ ...b, pct: b.cur / b.goal }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);
  const certs = db.prepare('SELECT * FROM certificates WHERE kid_id=? ORDER BY issued_at DESC').all(kidId);
  const kid = db.prepare('SELECT xp, coins, streak FROM kids WHERE id=?').get(kidId);
  return {
    stats, badges, earnedCount, totalBadges: BADGES.length, nextGoals,
    certificates: certs, xp: kid.xp, coins: kid.coins, streak: kid.streak,
    rarityCounts: ['common', 'rare', 'epic', 'legendary'].map(r => ({
      rarity: r, earned: badges.filter(b => b.rarity === r && b.earned).length,
      total: badges.filter(b => b.rarity === r).length
    }))
  };
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

// Curated career pathways. Each is matched against a child's subject-strength
// profile. `sig` weights which subjects the career leans on. `why` ties the
// child's strength to a real-world payoff; `hs` is what to focus on in high school.
const CAREER_PATHS = [
  { id: 'engineer', title: 'Engineering', emoji: '⚙️', sig: { math: 1, science: 0.8 }, why: 'Strong math + science minds design bridges, robots, rockets and apps. Every problem solved in lessons is the same muscle engineers use daily.', hs: 'Physics, calculus, and a coding or robotics elective.' },
  { id: 'cs', title: 'Computer Science & AI', emoji: '💻', sig: { math: 1, science: 0.5 }, why: 'Logical, pattern-loving thinkers thrive in software, data, and AI — some of the fastest-growing, best-paid fields.', hs: 'AP Computer Science, statistics, and a personal coding project.' },
  { id: 'medicine', title: 'Medicine & Health', emoji: '🩺', sig: { science: 1, english: 0.5 }, why: 'Science mastery plus clear communication is the foundation of doctors, nurses, and researchers who help people every day.', hs: 'Biology, chemistry, and volunteering in a clinic or hospital.' },
  { id: 'research', title: 'Scientist / Researcher', emoji: '🔬', sig: { science: 1, math: 0.6 }, why: 'Curiosity about how the world works — plus the math to measure it — drives discoveries in labs and universities.', hs: 'Lab sciences, statistics, and a science-fair research project.' },
  { id: 'finance', title: 'Finance & Business', emoji: '📈', sig: { math: 1, english: 0.4 }, why: 'Comfort with numbers powers careers in investing, accounting, and running companies — turning skills into real earning power.', hs: 'Economics, statistics, and a school business or investing club.' },
  { id: 'entrepreneur', title: 'Entrepreneur', emoji: '🚀', sig: { math: 0.7, english: 0.7 }, why: 'Founders blend numbers (pricing, budgets) with words (pitching, selling). The lemonade and market games are literally practice for this.', hs: 'Business, public speaking, and starting a small side venture.' },
  { id: 'law', title: 'Law & Policy', emoji: '⚖️', sig: { english: 1, science: 0.3 }, why: 'Reading closely, arguing clearly, and reasoning carefully are exactly what lawyers, judges, and leaders do.', hs: 'Debate, government, and rigorous reading & writing courses.' },
  { id: 'writer', title: 'Writing & Media', emoji: '✍️', sig: { english: 1 }, why: 'Word wizards become authors, journalists, marketers, and screenwriters — storytelling is one of the most durable human skills.', hs: 'Creative writing, journalism (school paper), and literature.' },
  { id: 'educator', title: 'Education & Psychology', emoji: '🎓', sig: { english: 0.8, science: 0.5 }, why: 'Explaining ideas and understanding people leads to teaching, counseling, and psychology — shaping the next generation.', hs: 'Psychology, writing, and tutoring or mentoring younger kids.' },
  { id: 'global', title: 'Global & Diplomacy', emoji: '🌍', sig: { spanish: 1, english: 0.7 }, why: 'Speaking more than one language opens international business, diplomacy, and travel careers — the world runs on bilingual talent.', hs: 'Advanced Spanish, world history, and a cultural exchange.' },
  { id: 'healthbilingual', title: 'Bilingual Healthcare', emoji: '🏥', sig: { spanish: 0.8, science: 0.8 }, why: 'Bilingual nurses and doctors are in huge demand — combining science with Spanish means serving twice the community.', hs: 'Biology, medical Spanish, and clinic volunteering.' },
  { id: 'design', title: 'Architecture & Design', emoji: '📐', sig: { math: 0.8, science: 0.4, english: 0.3 }, why: 'Geometry and spatial reasoning become buildings, products, and games that people use and love.', hs: 'Geometry, art/design, and a drafting or CAD elective.' },
  { id: 'environment', title: 'Environmental Science', emoji: '🌱', sig: { science: 1, math: 0.5 }, why: 'Understanding ecosystems and data helps protect the planet — one of the defining challenges (and job markets) of this generation.', hs: 'Environmental science, chemistry, and a sustainability project.' },
  { id: 'communicator', title: 'Marketing & Communications', emoji: '📣', sig: { english: 0.9, spanish: 0.4 }, why: 'Persuasion and clear writing drive advertising, PR, and brand-building — turning ideas into things people want.', hs: 'Writing, a second language, and running a club\'s social media.' }
];

// Analyze a child's strengths and (grade-gated) surface career pathways.
function careerInsights(kidId) {
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(kidId);
  const grade = kid.grade || 0;
  const subs = ['math', 'english', 'science', 'spanish'].map(sub => {
    const state = getSubjectState(kidId, sub);
    const rows = db.prepare('SELECT mastery FROM skill_state WHERE kid_id=? AND subject=? AND attempts>0').all(kidId, sub);
    const avg = rows.length ? rows.reduce((a, r) => a + r.mastery, 0) / rows.length : null;
    const agg = db.prepare('SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND subject=?').get(kidId, sub);
    const acc = agg.n ? agg.c / agg.n : null;
    // strength score: blend mastery (60%) + accuracy (40%); null if not enough data
    const score = avg == null ? null : Math.max(0, Math.min(1, (avg * 0.6 + (acc == null ? avg : acc) * 0.4)));
    return { subject: sub, label: subjectLabel(sub), placed: !!state.placed, level: Math.round(state.level), answers: agg.n || 0, mastery: avg, accuracy: acc, score };
  });
  const active = subs.filter(s => s.score != null && s.answers >= 5);
  const ranked = active.slice().sort((a, b) => b.score - a.score);
  const scoreOf = sub => { const s = subs.find(x => x.subject === sub); return s && s.score != null ? s.score : 0; };
  // Career match: weighted signature score, only if there's enough signal
  const pathways = CAREER_PATHS.map(c => {
    let num = 0, den = 0;
    for (const [sub, w] of Object.entries(c.sig)) { num += scoreOf(sub) * w; den += w; }
    return { ...c, match: den ? num / den : 0 };
  }).sort((a, b) => b.match - a.match);
  const enough = active.length >= 1 && ranked.length && ranked[0].score >= 0.4;
  const band = grade >= 9 ? 'pathways' : grade >= 6 ? 'explore' : 'emerging';
  const topStrengths = ranked.filter(s => s.score >= 0.6).slice(0, 2);
  const growthAreas = ranked.filter(s => s.score < 0.5).sort((a, b) => a.score - b.score).slice(0, 2)
    .map(s => ({ subject: s.subject, label: s.label, score: s.score,
      why: `A little more ${s.label.toLowerCase()} practice will round out ${kid.name}'s profile and keep the most doors open.` }));
  return {
    grade, band, ranked,
    hasData: enough,
    topStrengths: topStrengths.map(s => ({ subject: s.subject, label: s.label, score: s.score, level: s.level })),
    growthAreas,
    pathways: enough ? pathways.filter(p => p.match >= 0.35).slice(0, band === 'pathways' ? 4 : 3) : []
  };
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
    pace: pace(kid),
    career: careerInsights(kidId)
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
  gradeName, subjectLabel, setLevel, maxGrade, achievements, careerInsights, BADGES, MASTERED, STRUGGLING
};
