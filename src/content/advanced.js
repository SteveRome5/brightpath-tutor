// Advanced exam-prep track — AP / Honors / NY Regents. Kept SEPARATE from the
// K-12 adaptive ladder: these skills are never returned by skillsForSubject(),
// so placement, mastery, and Gallop Score are unaffected. Students opt into a
// track from the Exam Prep zone and practice its bank directly.
// Question banks live in the generated ./advanced_banks.js.
const { pick, textChoices, q } = require('./helpers');

let BANKS = {};
try { BANKS = require('./advanced_banks'); } catch (e) { BANKS = {}; }

const _hasEmoji = s => /\p{Extended_Pictographic}/u.test(String(s));
function _balanceAnswer(a, w) {
  if (_hasEmoji(a) && !w.some(_hasEmoji)) return String(a).replace(/\p{Extended_Pictographic}/gu, '').replace(/\s{2,}/g, ' ').trim();
  return a;
}

// Ordered track metadata. exam ∈ {Regents, AP, Honors}. subject links to the
// four core subjects for theming/labels.
const TRACK_META = [
  { id: 'regents-alg1', subject: 'math', exam: 'Regents', name: 'Regents Algebra I', emoji: '📐' },
  { id: 'regents-geo', subject: 'math', exam: 'Regents', name: 'Regents Geometry', emoji: '📐' },
  { id: 'regents-alg2', subject: 'math', exam: 'Regents', name: 'Regents Algebra II', emoji: '📐' },
  { id: 'regents-earth', subject: 'science', exam: 'Regents', name: 'Regents Earth Science', emoji: '🌍' },
  { id: 'regents-living', subject: 'science', exam: 'Regents', name: 'Regents Living Environment', emoji: '🧬' },
  { id: 'regents-chem', subject: 'science', exam: 'Regents', name: 'Regents Chemistry', emoji: '⚗️' },
  { id: 'regents-ela', subject: 'english', exam: 'Regents', name: 'Regents ELA', emoji: '📝' },
  { id: 'ap-calc-ab', subject: 'math', exam: 'AP', name: 'AP Calculus AB', emoji: '∫' },
  { id: 'ap-stats', subject: 'math', exam: 'AP', name: 'AP Statistics', emoji: '📊' },
  { id: 'ap-bio', subject: 'science', exam: 'AP', name: 'AP Biology', emoji: '🧬' },
  { id: 'ap-chem', subject: 'science', exam: 'AP', name: 'AP Chemistry', emoji: '⚗️' },
  { id: 'ap-physics1', subject: 'science', exam: 'AP', name: 'AP Physics 1', emoji: '⚛️' },
  { id: 'ap-envsci', subject: 'science', exam: 'AP', name: 'AP Environmental Science', emoji: '🌱' },
  { id: 'ap-eng-lang', subject: 'english', exam: 'AP', name: 'AP English Language', emoji: '🗣️' },
  { id: 'ap-eng-lit', subject: 'english', exam: 'AP', name: 'AP English Literature', emoji: '📚' },
  { id: 'ap-spanish', subject: 'spanish', exam: 'AP', name: 'AP Spanish Language', emoji: '🌎' },
  { id: 'honors-precalc', subject: 'math', exam: 'Honors', name: 'Honors Precalculus', emoji: '📈' },
  { id: 'honors-spanish', subject: 'spanish', exam: 'Honors', name: 'Honors Spanish IV', emoji: '🌎' },
];

function bankFor(id) { const b = BANKS[id]; return Array.isArray(b) ? b : []; }

// Public list — only tracks that actually have questions loaded.
function listTracks() {
  return TRACK_META
    .filter(t => bankFor(t.id).length)
    .map(t => ({ id: t.id, subject: t.subject, exam: t.exam, name: t.name, emoji: t.emoji, count: bankFor(t.id).length }));
}

function getTrack(id) { return TRACK_META.find(t => t.id === id) || null; }

// Generate one question from a track, dodging recently-served prompts.
function generateTrackQuestion(trackId, avoid = null) {
  const meta = getTrack(trackId);
  const bank = bankFor(trackId);
  if (!meta || !bank.length) return null;
  let item = null, fallback = null;
  const tries = avoid && avoid.size ? 14 : 4;
  for (let i = 0; i < tries; i++) {
    const cand = pick(bank);
    if (!fallback) fallback = cand;
    if (!avoid || !avoid.has(cand.p)) { item = cand; break; }
  }
  item = item || fallback;
  const a = _balanceAnswer(item.a, item.w);
  const built = q({
    prompt: item.p, choices: textChoices(a, item.w), answer: a,
    hint: item.h || '', explain: item.e || '', voice: item.v || item.p, passage: item.pg || null
  });
  return { trackId, trackName: meta.name, exam: meta.exam, subject: meta.subject, ...built };
}

module.exports = { listTracks, getTrack, generateTrackQuestion, TRACK_META };
