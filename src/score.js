// Gallop Score — Gallop's own progress metric, a per-subject number from ~200 to 1200.
// It rises as a child (a) unlocks new skills and (b) deepens mastery of them. Harder
// skills are worth more, and a skill only pays its full value at deep mastery, so the
// number cannot be inflated by breezing — the only way up is real understanding.
const content = require('./content');

const FLOOR = 200, SPAN = 1000;
const CAP_GRADE = 12;
// A skill's weight grows with its grade, so conquering harder material moves the score more.
const weight = grade => Math.pow((grade || 0) + 1, 1.15);
// Credit curve: partial credit for progress, FULL credit only at deep mastery (~0.85+).
const credit = m => Math.max(0, Math.min(1, ((m || 0) - 0.2) / (0.85 - 0.2)));

// Cache the per-subject skill weights + totals (the skill tree never changes at runtime).
const _models = {};
function model(subject) {
  if (_models[subject]) return _models[subject];
  const skills = content.skillsForSubject(subject).map(s => ({ id: s.id, grade: s.grade, w: weight(s.grade) }));
  const totalW = skills.reduce((a, s) => a + s.w, 0) || 1;
  // Precompute the "at grade level G" reference score for the grade translation.
  const bands = [];
  for (let g = 0; g <= CAP_GRADE; g++) {
    const earned = skills.reduce((a, s) => a + (s.grade <= g ? s.w * 0.9 : 0), 0);
    bands.push(Math.round(FLOOR + SPAN * (earned / totalW)));
  }
  return (_models[subject] = { skills, totalW, bands });
}

// masteryMap: { skillId: mastery } for this child+subject (missing = 0, unattempted).
// reachedLevel (optional): the grade the child has been PLACED at. The adaptive engine
// only ever serves the child's current grade and the one just below it, so skills at
// lower grades are never practiced and their mastery stays 0 forever. But placement (and
// every later promotion) required the child to clear those lower grades, so we credit
// them as reached. Without this, a strong 5th-grader who has mastered all of grade 5
// would score like a 1st-grader, because grades 0-4 read as 0 mastery. That made the
// headline number and the parent-facing grade equivalent wrong for anyone above grade ~1.
function subjectScore(subject, masteryMap, reachedLevel) {
  const m = model(subject);
  const reached = Number.isFinite(reachedLevel) ? Math.round(reachedLevel) : -1;
  const effective = s => {
    const actual = masteryMap[s.id] || 0;
    // Grades strictly below the placed grade are treated as cleared (credited at 0.9),
    // never lowering a child who has since surpassed that mastery on their own.
    return s.grade < reached ? Math.max(actual, 0.9) : actual;
  };
  const earned = m.skills.reduce((a, s) => a + s.w * credit(effective(s)), 0);
  let raw = FLOOR + SPAN * (earned / m.totalW);
  return Math.round(Math.min(raw, FLOOR + SPAN));
}

// Translate a score to the school grade a parent would recognize. Returns { grade, label }.
// bands[g] is the score of a child who has deeply reached grade g, so we report the
// HIGHEST grade the child has actually reached, then how far into it they are.
function gradeEquivalent(subject, score) {
  const bands = model(subject).bands; // index = grade 0..12
  const ord = g => (g === 1 ? 'st' : g === 2 ? 'nd' : g === 3 ? 'rd' : 'th');
  if (score <= bands[0]) return { grade: 0, label: 'early kindergarten' };
  let g = 0;
  for (let k = 0; k <= CAP_GRADE; k++) { if (score >= bands[k]) g = k; }
  if (g >= CAP_GRADE) return { grade: CAP_GRADE, label: 'high-school level and beyond' };
  const lo = bands[g], hi = bands[g + 1], frac = (score - lo) / Math.max(1, hi - lo);
  const stage = frac < 0.5 ? 'mid' : 'late';
  const gname = g === 0 ? 'kindergarten' : `${g}${ord(g)} grade`;
  return { grade: g, label: `${stage} ${gname}` };
}

// Blend per-subject scores into one top-line number (average of subjects the child has started).
function overall(perSubject) {
  const vals = Object.values(perSubject).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

module.exports = { subjectScore, gradeEquivalent, overall, FLOOR, TOP: FLOOR + SPAN };
