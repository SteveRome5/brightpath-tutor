// Shared helpers for question generators — randomization + real-life flavor
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Build multiple-choice around a numeric answer with plausible distractors
function numChoices(answer, spreadFn) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const d = spreadFn ? spreadFn() : answer + pick([-1, 1]) * rint(1, Math.max(2, Math.round(Math.abs(answer) * 0.3) + 1));
    if (d !== answer && (typeof d !== 'number' || isFinite(d))) set.add(d);
  }
  // Guaranteed-terminating filler: keep incrementing until we find unused values.
  // (The old `answer + set.size + guard` could collide with an existing member
  //  and spin forever — e.g. complementary angles 13°/77° — freezing the server.)
  let filler = answer + guard;
  while (set.size < 4) { filler++; if (!set.has(filler)) set.add(filler); }
  return shuffle([...set]).map(String);
}
function textChoices(answer, distractors) {
  const seen = new Set([String(answer)]);
  const uniq = [];
  for (const d of shuffle(distractors)) {
    const s = String(d);
    if (!seen.has(s)) { seen.add(s); uniq.push(s); }
    if (uniq.length === 3) break;
  }
  // Guarantee 4 options: when the supplied distractors collide (e.g. 3×3 where several
  // "off by a group" wrong answers land on the same number), backfill with nearby numbers
  // so we never render a 3-choice question. Only applies when the answer is a plain number.
  const an = Number(answer);
  if (uniq.length < 3 && Number.isFinite(an) && String(an) === String(answer).trim()) {
    for (let k = 1; uniq.length < 3 && k < 60; k++) {
      for (const cand of [an + k, an - k]) {
        const s = String(cand);
        if (cand >= 0 && !seen.has(s)) { seen.add(s); uniq.push(s); if (uniq.length === 3) break; }
      }
    }
  }
  return shuffle([String(answer), ...uniq]);
}
const KID_NAMES = ['Margaux', 'Leo', 'Zoe', 'Mateo', 'Ava', 'Kai', 'Nia', 'Sofia', 'Jayden', 'Ruby', 'Diego', 'Emma'];
const FOODS = ['pizza slices', 'cupcakes', 'strawberries', 'tacos', 'cookies', 'apple slices', 'pretzels'];
const TOYS = ['marbles', 'trading cards', 'stickers', 'LEGO bricks', 'seashells', 'crayons'];
const PLACES = ['the farmers market', 'the school fair', 'the beach', 'the zoo', 'soccer practice', 'the arcade', 'grandma’s house'];

// Standard question object:
// { prompt, choices:[..4], answer:'exact choice string', hint, explain, voice, context, art }
function q(o) {
  return {
    prompt: o.prompt,
    choices: o.choices,
    answer: String(o.answer),
    hint: o.hint || '',
    explain: o.explain || '',
    // Misconception-specific feedback: map a wrong choice (as a string) to a message that
    // names WHY that specific answer is a common mistake (e.g. "you reversed the fraction"
    // or "you added instead of multiplied"). The UI shows this instead of the generic
    // explanation when the learner picks that exact distractor.
    whyWrong: o.whyWrong || null,
    voice: o.voice || o.prompt.replace(/[×÷]/g, m => (m === '×' ? ' times ' : ' divided by ')),
    passage: o.passage || null,
    art: o.art || null
  };
}

module.exports = { rint, pick, shuffle, numChoices, textChoices, q, KID_NAMES, FOODS, TOYS, PLACES };
