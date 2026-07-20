// Content registry — assembles all subjects into one queryable curriculum
const math = require('./math');
const english = require('./english');
const science = require('./science');
const spanish = require('./spanish');

const SUBJECTS = { math, english, science, spanish };

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

module.exports = { SUBJECTS, subjectMeta, getSkill, skillsForSubject, generateQuestion };
