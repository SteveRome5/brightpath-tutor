// Content registry — assembles all subjects into one queryable curriculum
const math = require('./math');
const english = require('./english');
const science = require('./science');
const spanish = require('./spanish');
const { extraSkills } = require('./extra');
const { expansionSkills } = require('./expansion');
const advanced = require('./advanced');

const SUBJECTS = { math, english, science, spanish };

// Merge the extra standard skills into each subject's skill list once, at load.
// These thicken the normal K-12 ladder and are treated exactly like base skills
// (placement, mastery, score). Advanced/exam-prep skills are intentionally NOT
// merged here — they live in ./advanced.js and never touch the adaptive engine.
for (const [subj, s] of Object.entries(SUBJECTS)) {
  const extra = (extraSkills && extraSkills[subj]) || [];
  if (extra.length) {
    // If an extra (verified, bank-backed) skill shares an id with a base skill,
    // the verified one wins — drop the base duplicate, then append the extras.
    // Prevents the same skill id appearing twice and a base gen() shadowing the
    // fact-checked bank via getSkill()'s first-match .find().
    const extraIds = new Set(extra.map(k => k.id));
    s.skills = s.skills.filter(k => !extraIds.has(k.id)).concat(extra);
  }
}
// Then merge the expansion skills the same way (expansion id wins over base/extra), so the
// richer 16-item versions of any shared skill replace thinner ones and new skills are added.
for (const [subj, s] of Object.entries(SUBJECTS)) {
  const exp = (expansionSkills && expansionSkills[subj]) || [];
  if (exp.length) {
    const expIds = new Set(exp.map(k => k.id));
    s.skills = s.skills.filter(k => !expIds.has(k.id)).concat(exp);
  }
}

function subjectMeta() {
  return Object.values(SUBJECTS).map(s => ({
    subject: s.subject, label: s.label, emoji: s.emoji, color: s.color,
    skills: s.skills.map(k => ({ id: k.id, name: k.name, grade: k.grade }))
  }));
}

function getSkill(subject, skillId) {
  const s = SUBJECTS[subject];
  if (!s) return null;
  return s.skills.find(k => k.id === skillId) || null;
}

function skillsForSubject(subject) {
  const s = SUBJECTS[subject];
  return s ? s.skills : [];
}

// Generate a question for a skill at a difficulty (0..1).
// `avoid` (optional Set of prompt strings) = recently-served questions for this kid;
// we retry generation to dodge repeats, falling back gracefully on tiny banks.
function generateQuestion(subject, skillId, difficulty = 0.4, avoid = null) {
  const skill = getSkill(subject, skillId);
  if (!skill) return null;
  let question = null, fallback = null;
  const tries = avoid && avoid.size ? 14 : 5;
  for (let i = 0; i < tries; i++) {
    let q;
    try { q = skill.gen(difficulty); } catch (e) { continue; /* rare invalid combos */ }
    if (!q) continue;
    if (!fallback) fallback = q;
    if (!avoid || !avoid.has(q.prompt)) { question = q; break; }
  }
  question = question || fallback;
  if (!question) return null;
  return { subject, skillId, skillName: skill.name, grade: skill.grade, difficulty, ...question };
}

// Advanced exam-prep track passthrough (separate from the adaptive engine).
function listTracks() { return advanced.listTracks(); }
function getTrack(id) { return advanced.getTrack(id); }
function generateTrackQuestion(trackId, avoid = null) { return advanced.generateTrackQuestion(trackId, avoid); }

module.exports = { SUBJECTS, subjectMeta, getSkill, skillsForSubject, generateQuestion, listTracks, getTrack, generateTrackQuestion };
