// Extra STANDARD skills — thicken the K-12 ladder (fun elementary, exploratory
// middle, specialized high). Bank-based so every item is fact-checked. Merged
// into skillsForSubject() by index.js. Question banks live in the generated
// ./extra_banks.js (created by the content-integration step); if that file is
// missing we degrade gracefully to no extra skills.
const { pick, textChoices, q } = require('./helpers');

let BANKS = {};
try { BANKS = require('./extra_banks'); } catch (e) { BANKS = {}; }

const _hasEmoji = s => /\p{Extended_Pictographic}/u.test(String(s));
function _balanceAnswer(a, w) {
  // Strip the pictograph AND its companion codepoints (variation selector U+FE0F,
  // zero-width joiner U+200D) or answers end with an invisible dangling character.
  if (_hasEmoji(a) && !w.some(_hasEmoji)) return String(a).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim();
  return a;
}

// A translation prompt ("'gato' means…") must never include the emoji that IS the
// answer (🐱 next to it hands the kid the translation). Strip pictographs from
// translation-style prompts; decorative emojis on non-translation prompts stay.
const _XLATE = /\bmeans\b|\bmeans…|\bin english\b|\btranslat|significa|\bes tu\b|\bis your…/i;
function _deGiveaway(p) {
  if (!_XLATE.test(String(p))) return p;
  return String(p).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').replace(/\s+([?!.,…])/g, '$1').trim();
}
function fromBank(bank) {
  return function () {
    const item = pick(bank);
    const a = _balanceAnswer(item.a, item.w);
    return q({
      prompt: _deGiveaway(item.p),
      choices: textChoices(a, item.w),
      answer: a,
      hint: item.h || '',
      explain: item.e || '',
      voice: item.v || _deGiveaway(item.p),
      passage: item.pg || null
    });
  };
}

// id -> { subject, grade, name }. IDs must match the generated bank keys.
const META = [
  { id: 'm.3.multimeadow', subject: 'math', grade: 3, name: 'Multiplication Meadow' },
  { id: 'm.4.fracpizza', subject: 'math', grade: 4, name: 'Fraction Pizzeria' },
  { id: 'm.5.decimoney', subject: 'math', grade: 5, name: 'Decimal Money Market' },
  { id: 'm.6.ratesreal', subject: 'math', grade: 6, name: 'Ratios & Rates IRL' },
  { id: 'm.7.datadetect', subject: 'math', grade: 7, name: 'Data Detective' },
  { id: 'm.8.funcstories', subject: 'math', grade: 8, name: 'Functions & Graph Stories' },
  { id: 'm.8.prealgebra', subject: 'math', grade: 8, name: 'Pre-Algebra Foundations' },
  { id: 'm.10.trig', subject: 'math', grade: 10, name: 'Right-Triangle Trigonometry' },
  { id: 'm.11.explog', subject: 'math', grade: 11, name: 'Exponentials & Logarithms' },
  { id: 'm.11.statistics', subject: 'math', grade: 11, name: 'Statistics & Data Analysis' },
  { id: 'm.11.precalc', subject: 'math', grade: 11, name: 'Pre-Calculus' },
  { id: 'm.12.calculus', subject: 'math', grade: 12, name: 'Calculus: Derivatives & Integrals' },

  { id: 'e.1.rhyme', subject: 'english', grade: 1, name: 'Rhyme & Word Play' },
  { id: 'e.3.storydet', subject: 'english', grade: 3, name: 'Story Detective' },
  { id: 'e.5.figlang', subject: 'english', grade: 5, name: 'Figurative Language Lab' },
  { id: 'e.7.argument', subject: 'english', grade: 7, name: 'Building an Argument' },
  { id: 'e.8.themevoice', subject: 'english', grade: 8, name: 'Theme, Tone & Voice' },
  { id: 'e.10.rhetoric', subject: 'english', grade: 10, name: 'Rhetoric & Persuasion' },
  { id: 'e.11.litanalysis', subject: 'english', grade: 11, name: 'Literary Analysis' },

  { id: 's.1.weather', subject: 'science', grade: 1, name: 'Weather Watchers' },
  { id: 's.3.forces', subject: 'science', grade: 3, name: 'Push, Pull & Motion' },
  { id: 's.4.ecosystems', subject: 'science', grade: 4, name: 'Ecosystem Explorers' },
  { id: 's.6.cells', subject: 'science', grade: 6, name: 'Cells & Microscopes' },
  { id: 's.7.matter', subject: 'science', grade: 7, name: 'Atoms, Elements & Reactions' },
  { id: 's.8.space', subject: 'science', grade: 8, name: 'Space & the Solar System' },
  { id: 's.9.genetics', subject: 'science', grade: 9, name: 'Genetics & Heredity' },
  { id: 's.11.physics', subject: 'science', grade: 11, name: 'Physics: Forces & Energy' },

  { id: 'sp.1.colors', subject: 'spanish', grade: 1, name: 'Colores y Números' },
  { id: 'sp.3.family', subject: 'spanish', grade: 3, name: 'La Familia y La Casa' },
  { id: 'sp.5.verbs', subject: 'spanish', grade: 5, name: 'Present-Tense Verbs' },
  { id: 'sp.6.routine', subject: 'spanish', grade: 6, name: 'Rutinas y Reflexivos' },
  { id: 'sp.7.preterite', subject: 'spanish', grade: 7, name: 'El Pasado (Preterite)' },
  { id: 'sp.8.culture', subject: 'spanish', grade: 8, name: 'Cultura y Tradiciones' },
  { id: 'sp.10.subjunctive', subject: 'spanish', grade: 10, name: 'The Subjunctive Mood' },

  // Verified replacements for formerly-thin base banks (each ≥30 fact-checked items):
  { id: 's.4.space', subject: 'science', grade: 4, name: "Solar System Explorer" },
  { id: 's.k.weather', subject: 'science', grade: 0, name: "Weather Watch" },
  { id: 's.7.chemistry', subject: 'science', grade: 7, name: "Chemistry Basics" },
  { id: 's.8.physics', subject: 'science', grade: 8, name: "Energy & Physics" },
  { id: 's.7.earth', subject: 'science', grade: 7, name: "Earth Science" },
  { id: 's.10.chem2', subject: 'science', grade: 10, name: "Chemistry II" },
  { id: 's.11.physics2', subject: 'science', grade: 11, name: "Physics II" },
  { id: 's.9.biology', subject: 'science', grade: 9, name: "Biology: DNA & Genetics" },
  { id: 's.2.habitats', subject: 'science', grade: 2, name: "Habitats & Homes" },
  { id: 's.12.advanced', subject: 'science', grade: 12, name: "Advanced Science" },
  { id: 's.5.body', subject: 'science', grade: 5, name: "Amazing Human Body" },
  { id: 'sp.2.days', subject: 'spanish', grade: 2, name: "Días y Meses" },
  { id: 'sp.2.body', subject: 'spanish', grade: 2, name: "El Cuerpo" },
  { id: 's.5.ecosystems', subject: 'science', grade: 5, name: "Ecosystems & Energy" },
  { id: 'sp.3.ser', subject: 'spanish', grade: 3, name: "Ser vs. Estar" },
  { id: 'sp.2.phrases', subject: 'spanish', grade: 2, name: "Frases Útiles" },
  { id: 'sp.1.family', subject: 'spanish', grade: 1, name: "La Familia" },
];

// Build skill objects only for metas that actually have a non-empty bank.
const bySubject = { math: [], english: [], science: [], spanish: [] };
for (const m of META) {
  const bank = BANKS[m.id];
  if (!bank || !bank.length) continue;
  bySubject[m.subject].push({ id: m.id, name: m.name, grade: m.grade, gen: fromBank(bank) });
}

module.exports = { extraSkills: bySubject };
