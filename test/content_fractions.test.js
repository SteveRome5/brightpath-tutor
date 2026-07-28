// Property-based validator for the Equivalent Fractions generator (P0.1 regression guard).
// Run: node test/content_fractions.test.js  (exit 1 on any invariant violation)
const math = require('../src/content/math');
const { gcd } = require('../src/content/helpers');

const skill = math.skills.find(s => s.id === 'm.4.equivfrac');
if (!skill) { console.error('FAIL: m.4.equivfrac skill not found'); process.exit(1); }

function parseFrac(s) {
  const m = String(s).match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}
function equal(a, b) { return a[0] * b[0] !== 0 || true, a[0] * b[1] === b[0] * a[1]; }

let fails = [];
const N = 12000;
for (let i = 0; i < N; i++) {
  const d = Math.random();
  const item = skill.gen(d);
  const isSimplify = /simplest form/.test(item.prompt);
  const ansF = parseFrac(item.answer);
  const choices = item.choices.map(parseFrac);

  // structural invariants (both modes)
  if (item.choices.length !== 4) fails.push(['not 4 choices', item.prompt, item.choices]);
  if (new Set(item.choices).size !== item.choices.length) fails.push(['dup choices', item.prompt, item.choices]);
  if (!item.choices.includes(item.answer)) fails.push(['answer not in choices', item.prompt, item.answer]);
  if (!ansF || choices.some(c => !c)) { fails.push(['unparseable fraction', item.prompt, item.choices]); continue; }

  // source fraction from the prompt
  const src = (item.prompt.match(/(\d+)\/(\d+)/) || []).slice(1).map(Number);
  const srcF = [src[0], src[1]];

  if (isSimplify) {
    // 1) answer is fully reduced
    if (gcd(ansF[0], ansF[1]) !== 1) fails.push(['answer NOT reduced', item.prompt, item.answer]);
    // 2) answer is equivalent to the source fraction
    if (ansF[0] * srcF[1] !== srcF[0] * ansF[1]) fails.push(['answer not equivalent to source', item.prompt, item.answer, srcF]);
    // 3) EXACTLY ONE choice is both equivalent-to-source AND reduced (the simplest form)
    const good = choices.filter(c => c[0] * srcF[1] === srcF[0] * c[1] && gcd(c[0], c[1]) === 1);
    if (good.length !== 1) fails.push(['not exactly one simplest-form choice', item.prompt, item.choices, good.length]);
    // 4) explanation reaches the same answer
    if (!item.explain.includes(item.answer)) fails.push(['explain mismatch', item.prompt, item.answer, item.explain]);
  } else {
    // make mode: exactly one choice equivalent to the source fraction
    const good = choices.filter(c => c[1] !== 0 && c[0] * srcF[1] === srcF[0] * c[1]);
    if (good.length !== 1) fails.push(['make: not exactly one equivalent', item.prompt, item.choices, good.length]);
    if (ansF[0] * srcF[1] !== srcF[0] * ansF[1]) fails.push(['make: answer not equivalent', item.prompt, item.answer]);
  }
  if (fails.length > 8) break;
}

// Targeted cases the QA flagged
function reduceCheck(bn, bd, want) {
  const g = gcd(bn, bd);
  const got = `${bn / g}/${bd / g}`;
  if (got !== want) { console.error(`FAIL reduce ${bn}/${bd} => ${got}, expected ${want}`); return false; }
  return true;
}
let unit = true;
unit &= reduceCheck(16, 40, '2/5');
unit &= reduceCheck(8, 32, '1/4');
unit &= reduceCheck(6, 9, '2/3');
unit &= reduceCheck(100, 40, '5/2');

if (fails.length || !unit) {
  console.error(`FAIL: ${fails.length} invariant violation(s) over ${N} generated items`);
  fails.slice(0, 8).forEach(f => console.error('  -', JSON.stringify(f)));
  process.exit(1);
}
console.log(`PASS: ${N} equivalent-fraction items valid; GCD unit cases correct.`);
