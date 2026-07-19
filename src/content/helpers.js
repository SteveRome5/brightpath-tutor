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
    voice: o.voice || o.prompt.replace(/[×÷]/g, m => (m === '×' ? ' times ' : ' divided by ')),
    art: o.art || null
  };
}

module.exports = { rint, pick, shuffle, numChoices, textChoices, q, KID_NAMES, FOODS, TOYS, PLACES };
