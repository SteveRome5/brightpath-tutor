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

// Generate a question for a skill at a difficulty (0..1)
function generateQuestion(subject, skillId, difficulty = 0.4) {
  const skill = getSkill(subject, skillId);
  if (!skill) return null;
  let question;
  for (let i = 0; i < 5; i++) {
    try { question = skill.gen(difficulty); break; } catch (e) { /* regenerate on rare invalid combos */ }
  }
  if (!question) return null;
  return { subject, skillId, skillName: skill.name, grade: skill.grade, difficulty, ...question };
}

module.exports = { SUBJECTS, subjectMeta, getSkill, skillsForSubject, generateQuestion };
