// BrightPath Adaptive Engine, the "great teacher" brain
// Per-subject level, per-skill mastery, targeted review, auto level-up/down.
const db = require('./db');
const content = require('./content');
const gscore = require('./score');

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
// COMPREHENSIVE adaptive placement. We probe grade by grade, asking 2 questions
// at each grade before deciding (one lucky guess or one careless slip never
// decides a child's whole path), climb while they pass and descend while they
// miss, and settle at the HIGHEST grade they demonstrably pass, placing them on
// the correct path with just enough headroom to grow, never bored, never lost.
const PLACE_PER_GRADE = 2;      // questions asked at each grade before moving on
const PLACE_MAX = 14;           // hard cap on total placement questions
const PLACE_PASS = 0.6;         // ≥60% at a grade = "passes" that grade
const PLACE_FAIL = 0.5;         // <50% at a grade = "fails" that grade

function gradeTallies(history) {
  const t = {};
  // "I haven't learned this yet" (idk) is NOT counted as an attempt: it isn't evidence the
  // child failed the grade, only that they haven't reached it. Counting it as a miss is what
  // used to sink a learner toward Kindergarten during the assessment.
  for (const h of history) { if (h.idk) continue; (t[h.grade] = t[h.grade] || { c: 0, n: 0 }).n++; if (h.correct) t[h.grade].c++; }
  return t;
}
function highestPassed(tallies) {
  const g = Object.keys(tallies).map(Number).filter(x => tallies[x].n >= PLACE_PER_GRADE && tallies[x].c / tallies[x].n >= PLACE_PASS);
  return g.length ? Math.max(...g) : -1;
}
function placementNext(kidId, subject, history) {
  // history: [{grade, correct}]
  getSubjectState(kidId, subject); // ensure the row exists so the final UPDATE always lands
  const kid = db.prepare('SELECT grade FROM kids WHERE id=?').get(kidId);
  const maxG = maxGrade(subject);
  const enrolled = subject === 'spanish' ? 0 : Math.min(Math.max(0, kid.grade), maxG);
  // Start one grade BELOW enrollment, a kid entering 2nd grade has finished 1st,
  // not 2nd. Confidence first; strong kids climb fast.
  const start = subject === 'spanish' ? 0 : Math.max(0, enrolled - 1);
  // Never show material more than 3 grades above enrollment during placement.
  const probeCap = subject === 'spanish' ? maxG : Math.min(maxG, enrolled + 3);
  const tallies = gradeTallies(history);
  const hp = highestPassed(tallies);

  // "I haven't learned this yet" caps the CEILING — it means "don't test me higher," never
  // "send me back." When the child taps it, settle at the highest grade they actually passed,
  // floored at one grade below their enrolled grade so the assessment can never demote them
  // multiple grades from an honest "not yet." Genuine WRONG answers still place lower (that's
  // real evidence); only idk is floored. (Spanish always starts at 0, so the floor is 0.)
  const lastEntry = history.length ? history[history.length - 1] : null;
  if (lastEntry && lastEntry.idk) {
    const floor = subject === 'spanish' ? 0 : Math.max(0, enrolled - 1);
    let level = Math.max(hp >= 0 ? hp : floor, floor);
    if (subject !== 'spanish') level = Math.min(level, probeCap);
    level = Math.max(0, Math.min(maxG, level));
    db.prepare('UPDATE subject_state SET level=?, placed=1 WHERE kid_id=? AND subject=?').run(level, kidId, subject);
    for (const s of content.skillsForSubject(subject).filter(s => s.grade === Math.round(level))) getSkillState(kidId, subject, s.id);
    return { done: true, level };
  }

  // Decide the next probe grade. We stay MONOTONIC-AWARE: once a child has clearly
  // passed grade H, a later stray miss at or below H is treated as noise (we don't
  // sink them), instead we push upward to keep finding their true ceiling.
  let probe = start;
  if (history.length) {
    const lastGrade = history[history.length - 1].grade;
    const gt = tallies[lastGrade];
    if (gt.n < PLACE_PER_GRADE) {
      probe = lastGrade;                                   // finish confirming this grade
    } else if (gt.c / gt.n >= PLACE_PASS) {
      probe = Math.min(probeCap, lastGrade + 1);           // passed → climb
    } else if (hp >= 0 && lastGrade <= hp) {
      probe = Math.min(probeCap, hp + 1);                  // stray low miss → keep climbing past best pass
    } else {
      probe = Math.max(0, lastGrade - 1);                  // genuine miss above our best → descend
    }
  }

  // Stop when we've BRACKETED the level (highest passed grade + the grade above it
  // confirmed-failed, or passing the ceiling), or hit the question cap.
  const done = history.length >= PLACE_MAX || placementBracketed(tallies, probeCap, start);
  if (done) {
    let level = settleLevel(history, enrolled, maxG);
    if (subject !== 'spanish') level = Math.min(level, probeCap);
    level = Math.max(0, Math.min(maxG, level));
    db.prepare('UPDATE subject_state SET level=?, placed=1 WHERE kid_id=? AND subject=?').run(level, kidId, subject);
    // Seed the placed-level skill states so the first lessons + reports feel alive.
    for (const s of content.skillsForSubject(subject).filter(s => s.grade === Math.round(level))) getSkillState(kidId, subject, s.id);
    return { done: true, level };
  }

  const skillsAt = content.skillsForSubject(subject).filter(s => s.grade === probe);
  const pickFrom = skillsAt.length ? skillsAt : content.skillsForSubject(subject);
  // Prefer a skill we haven't probed yet at this grade, for breadth of assessment.
  const probedIds = new Set(); // (best-effort; history doesn't store skillId, so vary by random)
  const skill = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  // Placement runs at a fair, mid difficulty (0.4): hard enough to distinguish real
  // understanding from guessing, gentle enough not to punish a shaky-but-capable kid.
  const question = content.generateQuestion(subject, skill.id, 0.4, recentSet(kidId, subject));
  if (question) noteRecent(kidId, subject, question.prompt);
  return { done: false, probeGrade: probe, question };
}

// Bracketed = decisive placement found. Either the child's highest clearly-passed
// grade sits right below a confirmed-failed grade, or they passed the ceiling, or
// they couldn't clear the very first (floor) grade. Anchored on highest-passed so
// a stray miss elsewhere never ends placement prematurely.
function placementBracketed(tallies, cap, start) {
  const hp = highestPassed(tallies);
  if (hp >= 0) {
    if (hp >= cap) return true;                                    // passed the ceiling
    const up = tallies[hp + 1];
    if (up && up.c / up.n < PLACE_FAIL) {
      // Confirm a fail before ending, and demand an EXTRA confirmation (3 tries)
      // when this would place the child below their starting grade, so a single
      // unlucky moment can never sink a capable student's whole placement.
      const need = (hp + 1 <= start) ? 3 : PLACE_PER_GRADE;
      if (up.n >= need) return true;                               // pass hp, fail hp+1 (confirmed)
    }
    return false;
  }
  // Never passed anything yet: only decisive if they've clearly failed the floor grade.
  if (tallies[0] && tallies[0].n >= PLACE_PER_GRADE && tallies[0].c / tallies[0].n < PLACE_FAIL) return true;
  return false;
}

// Settle at the highest grade the child clearly PASSES (majority correct, ≥2 tries).
// Falls back gracefully: a little credit for scattered correct answers, a floor at 0.
function settleLevel(history, fallback, maxG) {
  const tallies = gradeTallies(history);
  const passed = Object.keys(tallies).map(Number)
    .filter(g => tallies[g].n >= PLACE_PER_GRADE && tallies[g].c / tallies[g].n >= PLACE_PASS);
  if (passed.length) return Math.min(maxG, Math.max(...passed));
  // No grade cleanly passed. If they got some right, sit just below the highest attempt;
  // if they got nothing right, start at the bottom, support beats overwhelm.
  const anyCorrect = history.filter(h => h.correct).map(h => h.grade);
  if (anyCorrect.length) return Math.max(0, Math.min(maxG, Math.max(...anyCorrect) - 1));
  // Got nothing cleanly right, but do not dump an enrolled older child into Kindergarten
  // over one bad assessment. Sit them just below their enrolled grade so support still
  // beats overwhelm, without erasing years of school. (fallback = enrolled grade.)
  if (Number.isFinite(fallback) && fallback > 0) return Math.max(0, Math.min(maxG, fallback - 1));
  return 0;
}
function maxGrade(subject) {
  const all = content.skillsForSubject(subject);
  return Math.max(...all.map(s => s.grade));
}

// ---------- lesson selection: the tutor's judgment ----------
// Priorities: (1) rescue struggling skills, (2) advance frontier skills,
// (3) sprinkle review of mastered skills to keep them fresh.
function nextActivity(kidId, subject, opts = {}) {
  const { state, zone } = activeSkills(kidId, subject);
  // Spaced retention: ~1 in 8 questions resurfaces an old mastered skill
  // (last seen 3+ days ago) so learning actually STICKS, the science of review.
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
  // KUMON-STYLE HAMMER: if the child just missed a skill they haven't mastered,
  // stay on that exact concept with a FRESH question (varied numbers/context) so it
  // gets driven home, not skipped past. ~65% of post-miss reps repeat the concept;
  // the rest move on so it reinforces without becoming a wall. Variety of surface,
  // consistency of skill, that's the difference from a boring identical worksheet.
  const lastAns = db.prepare('SELECT skill_id, correct FROM activity_log WHERE kid_id=? AND subject=? ORDER BY id DESC LIMIT 1').get(kidId, subject);
  if (lastAns && !lastAns.correct && Math.random() < 0.65) {
    const sk = content.getSkill(subject, lastAns.skill_id);
    const ss = sk ? getSkillState(kidId, subject, lastAns.skill_id) : null;
    if (sk && ss && ss.mastery < MASTERED) {
      const stuck = ss.attempts >= 5 && ss.mastery < 0.35;
      const d = stuck ? 0.15 : Math.max(0.15, Math.min(0.6, ss.mastery)); // ease a touch, reinforce
      const question = content.generateQuestion(subject, sk.id, d, recentSet(kidId, subject));
      if (question) { noteRecent(kidId, subject, question.prompt); return { question, mode: 'boost', level: state.level, skill: { id: sk.id, name: sk.name, grade: sk.grade, mastery: ss.mastery, stuck } }; }
    }
  }

  const states = zone.map(s => ({ skill: s, st: getSkillState(kidId, subject, s.id) }));

  const struggling = states.filter(x => x.st.attempts >= 3 && x.st.mastery < STRUGGLING);
  const frontier = states.filter(x => x.st.mastery < MASTERED && !(x.st.attempts >= 3 && x.st.mastery < STRUGGLING));
  const fresh = states.filter(x => x.st.mastery >= MASTERED);

  let chosen, mode;
  // MISSION COHERENCE (tester finding #1): a 10-question mission should stay on ONE skill
  // long enough to build fluency, not hop to a brand-new lesson after a single question.
  // When the client anchors the mission to a focus skill that isn't mastered yet, keep
  // serving that skill (difficulty still adapts). Once it's mastered we fall through to
  // normal selection, and the client adopts the newly-served skill as the mission's focus.
  // (The ~12% spaced-retention interleave above still fires and is shown as a labeled
  // "Memory Check", which is the explicitly-labeled mixed review the review asked for.)
  if (opts.focusSkill) {
    const fsk = content.getSkill(subject, opts.focusSkill);
    if (fsk) {
      const fst = getSkillState(kidId, subject, opts.focusSkill);
      if (fst.mastery < MASTERED) {
        chosen = { skill: fsk, st: fst };
        mode = (fst.attempts >= 3 && fst.mastery < STRUGGLING) ? 'boost' : 'learn';
      }
    }
  }
  const roll = Math.random();
  if (chosen) {
    /* focus skill already selected above */
  } else if (struggling.length && roll < 0.5) {
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

  // Difficulty adapts to the child, with two guardrails:
  //  • STUCK support, a skill tried 5+ times still under 0.35 gets the gentlest
  //    questions (0.15) so a struggling child gets a real foothold, not a wall.
  //  • ANTI-BOREDOM, a mastered skill on a hot win streak ramps HARDER so a
  //    capable kid (hi, Margaux) is always stretched, never coasting on easy reps.
  const stuck = chosen.st.attempts >= 5 && chosen.st.mastery < 0.35;
  let d;
  if (stuck) {
    d = 0.15;
    mode = 'boost';
  } else {
    let bump = mode === 'boost' ? -0.15 : 0.1;
    if (chosen.st.mastery >= MASTERED && (chosen.st.win_streak || 0) >= 3) bump = 0.2; // crushing it → stretch
    // Cap at 0.85 so "challenging" never tips into "impossible", a mastered skill
    // stays engaging without knocking the child's mastery back down.
    d = Math.max(0.15, Math.min(0.85, chosen.st.mastery + bump));
  }
  const question = content.generateQuestion(subject, chosen.skill.id, d, recentSet(kidId, subject));
  if (question) noteRecent(kidId, subject, question.prompt);
  return {
    question, mode, level: state.level,
    skill: { id: chosen.skill.id, name: chosen.skill.name, grade: chosen.skill.grade, mastery: chosen.st.mastery, stuck }
  };
}

// Recent accuracy across the skills at a given grade (for pacing decisions).
// sinceAid (optional): only count answers logged AFTER this activity id, so the demote
// path can look strictly at work done since the last level change (no stale pre-change
// answers), which is what prevents a demotion from immediately cascading another grade down.
function recentLevelAccuracy(kidId, subject, grade, limit = 12, sinceAid = 0, minRows = 4) {
  const ids = content.skillsForSubject(subject).filter(s => s.grade === grade).map(s => s.id);
  if (!ids.length) return null;
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT correct FROM activity_log WHERE kid_id=? AND subject=? AND skill_id IN (${placeholders}) AND id > ?
    ORDER BY id DESC LIMIT ?`).all(kidId, subject, ...ids, sinceAid, limit);
  if (rows.length < minRows) return null;
  return rows.filter(r => r.correct).length / rows.length;
}

function weightedLowest(list) {
  const sorted = list.slice().sort((a, b) => a.st.mastery - b.st.mastery);
  // mostly the weakest, sometimes second-weakest for variety
  return Math.random() < 0.7 ? sorted[0] : sorted[Math.min(1, sorted.length - 1)];
}

// ---------- recording answers & progression ----------
function recordAnswer(kidId, subject, skillId, correct, timeMs, difficulty) {
  const st = getSkillState(kidId, subject, skillId);
  // Defense in depth: clamp difficulty here too (routes clamp already, but any future
  // caller must not be able to move mastery the wrong way with an out-of-range value).
  let d0 = Number(difficulty);
  d0 = Number.isFinite(d0) ? Math.max(0, Math.min(1, d0)) : 0.5;
  let m = st.mastery;
  if (correct) {
    m = m + 0.16 * (1 - m) * (0.7 + d0 * 0.6);
  } else {
    // Missing an EASY question means you really don't know it (bigger drop);
    // missing a HARD one is more forgivable, so a capable kid stretching into
    // tough questions doesn't get their mastery wrecked by an occasional slip.
    m = m * (0.72 + 0.12 * (d0 - 0.5));   // ≈ ×0.68 (easy) … ×0.77 (hard)
  }
  m = Math.max(0.05, Math.min(1, m));
  db.prepare(`UPDATE skill_state SET mastery=?, attempts=attempts+1, correct=correct+?,
              win_streak=?, last_seen=datetime('now') WHERE kid_id=? AND subject=? AND skill_id=?`)
    .run(m, correct ? 1 : 0, correct ? st.win_streak + 1 : 0, kidId, subject, skillId);
  db.prepare('INSERT INTO activity_log (kid_id, subject, skill_id, correct, difficulty, time_ms) VALUES (?,?,?,?,?,?)')
    .run(kidId, subject, skillId, correct ? 1 : 0, d0, timeMs || null);

  // XP & coins (d0, not `difficulty || 0.5` — a legitimate difficulty of 0 is not "missing")
  const xp = correct ? Math.round(10 + d0 * 10) : 2;
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
  // ---- progression: promote/demote with hysteresis so a child settles at the
  // right level instead of bouncing. A COOLDOWN of 6 answers must pass after any
  // level change before another, no thrash, no overshooting several grades at once.
  const state = getSubjectState(kidId, subject);
  const lvl = Math.round(state.level);
  const latestAid = db.prepare('SELECT MAX(id) AS m FROM activity_log WHERE kid_id=? AND subject=?').get(kidId, subject).m || 0;
  const sinceChange = db.prepare('SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND subject=? AND id > ?')
    .get(kidId, subject, state.last_change_aid || 0).n;
  const COOLDOWN = 6;
  if (sinceChange >= COOLDOWN) {
    const levelSkills = content.skillsForSubject(subject).filter(s => s.grade === lvl);
    // PROMOTE: sustained ≥85% accuracy across the level, every skill practiced ≥2×,
    // and a real body of work at the level (≥ max(8, 2× the skills)). A school year
    // is long, this is genuine grade mastery, never a lucky streak. But a capable
    // kid (hi, Margaux) who's truly ready climbs in ~12–18 questions, never bored.
    const totalAtLevel = levelSkills.length ? db.prepare(
      `SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND subject=? AND skill_id IN (${levelSkills.map(() => '?').join(',')})`
    ).get(kidId, subject, ...levelSkills.map(s => s.id)).n : 0;
    const allPracticed = levelSkills.length > 0 && levelSkills.every(s => {
      const ss = db.prepare('SELECT attempts FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(kidId, subject, s.id);
      return ss && ss.attempts >= 3;   // more evidence per skill before advancing
    });
    // RIGOR GATE: every skill in the grade must be genuinely mastered (or attempted a
    // lot and clearly close) before we advance. This is the Kumon-style promise, a child
    // does not leave a grade on a lucky hot streak, they leave it having actually learned
    // the whole grade. The (attempts>=8 & mastery>=0.7) valve keeps one stubborn skill
    // from blocking forever while still demanding real proficiency.
    const allMastered = levelSkills.length > 0 && levelSkills.every(s => {
      const ss = db.prepare('SELECT attempts, mastery FROM skill_state WHERE kid_id=? AND subject=? AND skill_id=?').get(kidId, subject, s.id);
      // Relief valve for one stubborn skill: needs real volume AND near-mastery. (0.75
      // — the EWMA equilibrium of a ~75%-accurate kid sits below this, so grinding
      // attempts alone can never sneak a not-yet-ready kid through.)
      return ss && (ss.mastery >= MASTERED || (ss.attempts >= 10 && ss.mastery >= 0.75));
    });
    // Promotion accuracy is measured ONLY on work since the last level change, over a
    // real body of evidence (≥15 answers) — a lucky 13/15 stretch inside old history
    // can't fire the gate anymore.
    const upAcc = recentLevelAccuracy(kidId, subject, lvl, 20, state.last_change_aid || 0, 15);
    const gatesPass = allPracticed && allMastered && totalAtLevel >= Math.max(12, levelSkills.length * 3) && upAcc != null && upAcc >= 0.85;
    if (lvl < maxGrade(subject) && gatesPass) {
      db.prepare('UPDATE subject_state SET level=?, last_change_aid=? WHERE kid_id=? AND subject=?').run(lvl + 1, latestAid, kidId, subject);
      const title = `${subjectLabel(subject)}, ${gradeName(lvl)} Complete!`;
      // Don't mint a duplicate certificate if this level was already completed before
      // (e.g. promote → demote → re-promote); one certificate per level per learner.
      const hasCert = db.prepare('SELECT 1 FROM certificates WHERE kid_id=? AND subject=? AND level=?').get(kidId, subject, lvl);
      if (!hasCert) db.prepare('INSERT INTO certificates (kid_id, subject, title, level) VALUES (?,?,?,?)').run(kidId, subject, title, lvl);
      // Only attach the certificate to the celebration when one was actually minted.
      events.push({ type: 'levelup', subject, newLevel: lvl + 1, certificate: hasCert ? null : title });
    } else if (lvl === maxGrade(subject) && gatesPass) {
      // TOP OF THE MOUNTAIN: a kid who masters the final grade of a subject earns that
      // grade's certificate too — the finish line must be celebrateable, not a dead end.
      const title = `${subjectLabel(subject)}, ${gradeName(lvl)} Complete!`;
      const hasCert = db.prepare('SELECT 1 FROM certificates WHERE kid_id=? AND subject=? AND level=?').get(kidId, subject, lvl);
      if (!hasCert) {
        db.prepare('INSERT INTO certificates (kid_id, subject, title, level) VALUES (?,?,?,?)').run(kidId, subject, title, lvl);
        events.push({ type: 'levelup', subject, newLevel: lvl, certificate: title });
      }
    } else if (lvl > 0) {
      // DEMOTE (support): sustained low accuracy at the level since the last change.
      // Only looks at answers SINCE the change (id > last_change_aid), so a fresh
      // promotion/demotion gets a fair trial on new work and we never cascade multiple
      // grades down in a row on stale pre-change answers.
      let downAcc = recentLevelAccuracy(kidId, subject, lvl, 8, state.last_change_aid || 0);
      if (downAcc == null) {
        // A struggling kid is mostly served BELOW-level review, so at-level rows can be
        // too sparse to ever trigger support. Fall back to overall recent accuracy
        // (any skill) since the last change, over a solid sample.
        const rows = db.prepare('SELECT correct FROM activity_log WHERE kid_id=? AND subject=? AND id > ? ORDER BY id DESC LIMIT 12')
          .all(kidId, subject, state.last_change_aid || 0);
        if (rows.length >= 10) downAcc = rows.filter(r => r.correct).length / rows.length;
      }
      if (downAcc != null && downAcc <= 0.35) {
        db.prepare('UPDATE subject_state SET level=?, last_change_aid=? WHERE kid_id=? AND subject=?').run(lvl - 1, latestAid, kidId, subject);
        events.push({ type: 'support', subject, newLevel: lvl - 1 });
      }
    }
  }
  events.push(...checkBadges(kidId));
  return { mastery: m, xpGained: xp, events };
}

function updateStreak(kidId) {
  const kid = db.prepare('SELECT streak, last_active_day FROM kids WHERE id=?').get(kidId);
  const today = new Date().toISOString().slice(0, 10);
  if (kid.last_active_day === today) return;
  // Streak days are UTC dates but our families live in local time: a kid practicing
  // Mon 9am and Tue 6pm Pacific spans Mon→Wed in UTC and would unfairly lose the
  // streak. Allow a gap of up to 2 UTC dates to count as consecutive — kind to
  // timezones (and one honest late-night slip), still a streak worth protecting.
  let gap = Infinity;
  if (kid.last_active_day) {
    const prev = Date.parse(kid.last_active_day + 'T00:00:00Z');
    if (Number.isFinite(prev)) gap = Math.round((Date.parse(today + 'T00:00:00Z') - prev) / 86400000);
  }
  const streak = gap >= 1 && gap <= 2 ? kid.streak + 1 : 1;
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
  { id: 'streak14', name: 'Two-Week Titan', emoji: '💫', rarity: 'epic', cat: 'streak', stat: 'streak', goal: 14, desc: 'A 14-day streak, wow!' },
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
  { id: 'xp15000', name: 'Thoroughbred', emoji: '🏇', rarity: 'legendary', cat: 'xp', stat: 'xp', goal: 15000, desc: 'Earn 15,000 XP, top rank!' },
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
  return { math: 'Math', english: 'English & Reading', science: 'Science', spanish: 'Spanish' }[s] || s;
}
// Report-card letter grade on a STANDARD, transparent scale, based on ACCURACY
// (percent correct), which is what parents expect, not the internal mastery
// score the adaptive engine uses to decide what to teach next. A child at 90%
// accuracy earns an A-, exactly as a parent would read it. Below 60% we show a
// supportive label instead of an F, because at that point the right response is
// more teaching, not a failing mark.
function letterGrade(acc) {
  if (acc == null) return '—';
  const p = acc * 100;
  if (p >= 97) return 'A+'; if (p >= 93) return 'A'; if (p >= 90) return 'A-';
  if (p >= 87) return 'B+'; if (p >= 83) return 'B'; if (p >= 80) return 'B-';
  if (p >= 77) return 'C+'; if (p >= 73) return 'C'; if (p >= 70) return 'C-';
  if (p >= 67) return 'D+'; if (p >= 63) return 'D'; if (p >= 60) return 'D-';
  return 'Keep practicing';
}
// The scale, exposed so the parent report can show exactly how a grade is earned.
const GRADE_SCALE = '90–100% A · 80–89% B · 70–79% C · 60–69% D';

// Curated career pathways. Each is matched against a child's subject-strength
// profile. `sig` weights which subjects the career leans on. `why` ties the
// child's strength to a real-world payoff; `hs` is what to focus on in high school.
const CAREER_PATHS = [
  { id: 'engineer', title: 'Engineering', emoji: '⚙️', sig: { math: 1, science: 0.8 }, why: 'Strong math + science minds design bridges, robots, rockets and apps. Every problem solved in lessons is the same muscle engineers use daily.', hs: 'Physics, calculus, and a coding or robotics elective.' },
  { id: 'cs', title: 'Computer Science & AI', emoji: '💻', sig: { math: 1, science: 0.5 }, why: 'Logical, pattern-loving thinkers thrive in software, data, and AI, some of the fastest-growing, best-paid fields.', hs: 'AP Computer Science, statistics, and a personal coding project.' },
  { id: 'medicine', title: 'Medicine & Health', emoji: '🩺', sig: { science: 1, english: 0.5 }, why: 'Science mastery plus clear communication is the foundation of doctors, nurses, and researchers who help people every day.', hs: 'Biology, chemistry, and volunteering in a clinic or hospital.' },
  { id: 'research', title: 'Scientist / Researcher', emoji: '🔬', sig: { science: 1, math: 0.6 }, why: 'Curiosity about how the world works, plus the math to measure it, drives discoveries in labs and universities.', hs: 'Lab sciences, statistics, and a science-fair research project.' },
  { id: 'finance', title: 'Finance & Business', emoji: '📈', sig: { math: 1, english: 0.4 }, why: 'Comfort with numbers powers careers in investing, accounting, and running companies, turning skills into real earning power.', hs: 'Economics, statistics, and a school business or investing club.' },
  { id: 'entrepreneur', title: 'Entrepreneur', emoji: '🚀', sig: { math: 0.7, english: 0.7 }, why: 'Founders blend numbers (pricing, budgets) with words (pitching, selling). The lemonade and market games are literally practice for this.', hs: 'Business, public speaking, and starting a small side venture.' },
  { id: 'law', title: 'Law & Policy', emoji: '⚖️', sig: { english: 1, science: 0.3 }, why: 'Reading closely, arguing clearly, and reasoning carefully are exactly what lawyers, judges, and leaders do.', hs: 'Debate, government, and rigorous reading & writing courses.' },
  { id: 'writer', title: 'Writing & Media', emoji: '✍️', sig: { english: 1 }, why: 'Word wizards become authors, journalists, marketers, and screenwriters, storytelling is one of the most durable human skills.', hs: 'Creative writing, journalism (school paper), and literature.' },
  { id: 'educator', title: 'Education & Psychology', emoji: '🎓', sig: { english: 0.8, science: 0.5 }, why: 'Explaining ideas and understanding people leads to teaching, counseling, and psychology, shaping the next generation.', hs: 'Psychology, writing, and tutoring or mentoring younger kids.' },
  { id: 'global', title: 'Global & Diplomacy', emoji: '🌍', sig: { spanish: 1, english: 0.7 }, why: 'Speaking more than one language opens international business, diplomacy, and travel careers, the world runs on bilingual talent.', hs: 'Advanced Spanish, world history, and a cultural exchange.' },
  { id: 'healthbilingual', title: 'Bilingual Healthcare', emoji: '🏥', sig: { spanish: 0.8, science: 0.8 }, why: 'Bilingual nurses and doctors are in huge demand, combining science with Spanish means serving twice the community.', hs: 'Biology, medical Spanish, and clinic volunteering.' },
  { id: 'design', title: 'Architecture & Design', emoji: '📐', sig: { math: 0.8, science: 0.4, english: 0.3 }, why: 'Geometry and spatial reasoning become buildings, products, and games that people use and love.', hs: 'Geometry, art/design, and a drafting or CAD elective.' },
  { id: 'environment', title: 'Environmental Science', emoji: '🌱', sig: { science: 1, math: 0.5 }, why: 'Understanding ecosystems and data helps protect the planet, one of the defining challenges (and job markets) of this generation.', hs: 'Environmental science, chemistry, and a sustainability project.' },
  { id: 'communicator', title: 'Marketing & Communications', emoji: '📣', sig: { english: 0.9, spanish: 0.4 }, why: 'Persuasion and clear writing drive advertising, PR, and brand-building, turning ideas into things people want.', hs: 'Writing, a second language, and running a club\'s social media.' }
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

// Plain-language "why we started them here" for parents, based on the assessment.
function placementRationale(sub, state, kid) {
  if (!state.placed) return null;
  const name = kid.name;
  const lvl = Math.round(state.level);
  const lvlName = gradeName(lvl);
  if (sub === 'spanish') {
    return `Spanish starts everyone at the beginning, since it builds from the first words up. ${name} is working at the ${lvlName} stage and will climb as the vocabulary and grammar click.`;
  }
  const diff = lvl - (kid.grade || 0);
  if (diff >= 1) {
    return `On the assessment, ${name} handled ${sub} above their enrolled grade, so we started at ${lvlName} to keep the work challenging rather than repetitive.`;
  }
  if (diff <= -1) {
    return `We started ${name} a little below their enrolled grade, at ${lvlName}, to make sure the fundamentals are solid first. This is common, and the level rises quickly once they show they've got it.`;
  }
  return `${name} placed right around their enrolled grade in ${sub}, at ${lvlName}. That's the sweet spot: familiar enough to feel confident, with room to stretch.`;
}

// Store the concepts a child missed on the placement quiz (array of skill names).
// Kept small and human-readable so the parent report can show them verbatim.
function savePlacementMissed(kidId, subject, missedNames) {
  getSubjectState(kidId, subject); // ensure row exists
  const uniq = Array.isArray(missedNames) ? [...new Set(missedNames.filter(Boolean))].slice(0, 6) : [];
  const json = uniq.length ? JSON.stringify(uniq) : null;
  db.prepare('UPDATE subject_state SET placement_missed=? WHERE kid_id=? AND subject=?').run(json, kidId, subject);
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
    // Pace status, the guardrails, made visible: is this child cruising (elevate),
    // holding steady, or needing extra care right now?
    // Status uses the child's RECENT overall experience in the subject (last ~15
    // answers), stable, and honest to what they've actually been feeling lately.
    const recentRows = db.prepare('SELECT correct FROM activity_log WHERE kid_id=? AND subject=? ORDER BY id DESC LIMIT 15').all(kidId, sub);
    const MIN_SAMPLE = 8;                        // fewer than this = not enough to judge
    const recentAcc = recentRows.length >= MIN_SAMPLE ? recentRows.filter(r => r.correct).length / recentRows.length : null;
    // Explicit, honest status rules (never a definitive label on a tiny sample):
    //   building        — subject not started / not placed yet
    //   insufficient    — placed but under the minimum sample, so we DON'T claim a verdict
    //   excelling       — recent accuracy ≥ 85% (or fully mastered with no focus gaps)
    //   on-track        — recent accuracy 60–85% (the healthy challenging-but-doable zone)
    //   developing      — recent accuracy 50–60% (progressing, a notch below on-track)
    //   needs-support   — recent accuracy < 50% (we ease difficulty + add practice)
    let status = 'building';
    if (state.placed) {
      if ((agg.n || 0) < MIN_SAMPLE || recentAcc == null) status = 'insufficient';
      else if (recentAcc >= 0.85 || (avg != null && avg >= MASTERED && !focus.length)) status = 'excelling';
      else if (recentAcc >= 0.6) status = 'on-track';
      else if (recentAcc >= 0.5) status = 'developing';
      else status = 'needs-support';
    }
    // Gallop Score, this subject's headline progress number (200–1200).
    const masteryMap = Object.fromEntries(rows.map(r => [r.skill_id, r.mastery]));
    const gallopScore = rows.length ? gscore.subjectScore(sub, masteryMap, state.placed ? state.level : undefined) : null;
    const gradeEquiv = gallopScore != null ? gscore.gradeEquivalent(sub, gallopScore) : null;
    return {
      subject: sub, label: subjectLabel(sub), level: state.level, levelName: gradeName(Math.round(state.level)),
      placed: !!state.placed, avgMastery: avg, letter: letterGrade(agg.n ? (agg.c / agg.n) : null),
      gallopScore, gradeEquiv,
      questionsAnswered: agg.n || 0, accuracy: agg.n ? (agg.c / agg.n) : null,
      status, recentAccuracy: recentAcc, recentSample: recentRows.length, enrolledGrade: kid.grade || 0,
      placementNote: placementRationale(sub, state, kid),
      placementMissed: (() => { try { return state.placement_missed ? JSON.parse(state.placement_missed) : []; } catch (e) { return []; } })(),
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
  // ---- Gallop Score: top-line blend + weekly "+X points" delta ----
  const perSubjectScore = {};
  subjects.forEach(s => { if (s.gallopScore != null) perSubjectScore[s.subject] = s.gallopScore; });
  const overallScore = gscore.overall(perSubjectScore);
  const gallop = { overall: overallScore, bySubject: perSubjectScore, deltas: {} };
  try {
    const today = db.prepare(`SELECT date('now') AS d`).get().d;
    const snap = db.prepare('INSERT OR REPLACE INTO score_snapshots (kid_id, subject, day, score) VALUES (?,?,?,?)');
    const priorOf = db.prepare(`SELECT score FROM score_snapshots WHERE kid_id=? AND subject=? AND day <= date('now','-7 days') ORDER BY day DESC LIMIT 1`);
    const earliestOf = db.prepare(`SELECT score FROM score_snapshots WHERE kid_id=? AND subject=? ORDER BY day ASC LIMIT 1`);
    const record = (subj, val) => {
      if (val == null) return;
      snap.run(kidId, subj, today, val);
      const base = priorOf.get(kidId, subj) || earliestOf.get(kidId, subj);
      if (base) gallop.deltas[subj] = val - base.score;
    };
    Object.entries(perSubjectScore).forEach(([s, v]) => record(s, v));
    record('overall', overallScore);
  } catch (e) { /* snapshots are best-effort */ }

  return {
    kid: { id: kid.id, name: kid.name, avatar: kid.avatar, grade: kid.grade, xp: kid.xp, coins: kid.coins, streak: kid.streak, weekly_goal: kid.weekly_goal, calendar_mode: kid.calendar_mode },
    subjects, badges, certificates: certs, weekAnswers: week.n || 0,
    history, gradeScale: GRADE_SCALE, gallop,
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
      note: `School's out! Summer practice keeps skills sharp, the ${nextStart.getFullYear()}–${nextStart.getFullYear() + 1} year starts ${nextStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
    };
  }
  const pct = Math.max(0, Math.min(1, (now - start) / (end - start)));
  return { label, startISO: start.toISOString().slice(0, 10), endISO: end.toISOString().slice(0, 10), pctThroughYear: pct };
}

// Manually shift a kid's level in a subject (kid "too tricky" button / parent control).
function setLevel(kidId, subject, level) {
  getSubjectState(kidId, subject); // ensure row
  const lv = Math.max(0, Math.min(maxGrade(subject), Number(level)));
  // Reset the hysteresis anchor: a manual level move starts a fresh trial at the new
  // level instead of judging it against stale pre-move history.
  const latestAid = db.prepare('SELECT MAX(id) AS m FROM activity_log WHERE kid_id=? AND subject=?').get(kidId, subject).m || 0;
  db.prepare('UPDATE subject_state SET level=?, placed=1, last_change_aid=? WHERE kid_id=? AND subject=?').run(lv, latestAid, kidId, subject);
  return lv;
}

module.exports = {
  getSubjectState, nextActivity, recordAnswer, placementNext, reportCard, savePlacementMissed,
  gradeName, subjectLabel, setLevel, maxGrade, achievements, careerInsights, BADGES, MASTERED, STRUGGLING,
  updateStreak
};
