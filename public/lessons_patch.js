/* Gallop Learning Academy — lesson patch layer.
   Adds teaching beats to lessons whose practice questions needed a step the base
   lesson didn't cover (found by the lesson↔question audit). Loaded AFTER
   lessons.js; augments window.GALLOP_LESSONS in place. Idempotent: re-running is
   a no-op. New beats are inserted just before each lesson's closing recap, so the
   "remember this" summary still lands last. */
'use strict';
(() => {
  const L = window.GALLOP_LESSONS;
  if (!L) return;
  const bySkill = {};
  for (const subj of Object.keys(L)) for (const les of (L[subj] || [])) if (les && les.skillId) bySkill[les.skillId] = les;

  // skillId -> extra steps (each covers a real gap between the lesson and its questions)
  const PATCH = {
    // Fractions: some questions ask the fraction LEFT, not the fraction used.
    'm.3.frac': [
      { kind: 'concept', title: 'The fraction that is LEFT',
        body: 'Sometimes a question asks for the part that is LEFT, not the part you used. The bottom is still how many equal pieces there are in all. For the top, take away the pieces used — what remains is your answer.',
        analogy: 'A pizza in 6 slices and you give away 5: six on the bottom, one slice left, so 1/6 is left.',
        say: 'Sometimes you want the part that is left. The bottom is all the equal pieces. Take away the ones used, and what is left is the top.' },
      { kind: 'example', title: 'Worked example: what is left?',
        body: 'A pack of stickers has 6 equal sheets. You give away 5. What fraction is LEFT?',
        reveal: ['The pack has 6 equal sheets, so the bottom is 6.', 'You gave away 5, so 6 − 5 = 1 sheet is left.', 'The fraction left is 1 over 6, written 1/6.'],
        say: 'Six sheets in all. You gave away five, so one is left. One sixth is left.' }
    ],
    // Long division: a place that divides unevenly and carries a remainder.
    'm.4.longdiv': [
      { kind: 'example', title: 'When a place does not divide evenly',
        body: 'Try 168 ÷ 6. Work one place at a time and carry the leftover to the next.',
        reveal: ['6 into 16 is 2 (that is 12), with 4 left over. Write 2.', 'Carry the 4 in front of the 8 to make 48.', '6 into 48 is exactly 8. Write 8. The answer is 28.'],
        say: 'Six into sixteen is two, remainder four. Carry the four to make forty-eight. Six into forty-eight is eight. So twenty-eight.' }
    ],
    // Factors lesson never defines "multiple", but questions ask for multiples.
    'm.4.factors': [
      { kind: 'concept', title: 'Factors vs. multiples',
        body: 'A FACTOR fits evenly INTO a number — 3 is a factor of 12. A MULTIPLE is what you land on counting BY a number: the multiples of 4 are 4, 8, 12, 16, 20 — its times table. So 12 is a multiple of 4 because 4 × 3 = 12.',
        analogy: 'Factors are the numbers that build it; multiples are the numbers it builds as you skip-count.',
        say: 'A factor fits into a number. A multiple is what you get counting by it. Multiples of four are four, eight, twelve, sixteen.' },
      { kind: 'try', title: 'Your turn: find the multiple',
        body: 'Which number is a MULTIPLE of 5?',
        say: 'Which number is a multiple of five?',
        widget: { w: 'tapPick', prompt: 'Count by 5s: 5, 10, 15…', options: [{ label: '10', correct: true }, { label: '12' }, { label: '27' }] } }
    ],
    // Circle lesson worked AREA; questions also ask CIRCUMFERENCE (radius & diameter).
    'm.10.circles': [
      { kind: 'show', title: 'Circumference: the distance around',
        body: 'Area fills the inside of a circle. CIRCUMFERENCE is the distance all the way around the edge. Its formula is C = 2 × π × r. Because the diameter is twice the radius, that is the same as C = π × d.',
        analogy: 'If area is the pizza you eat, circumference is the crust you trace with your finger.',
        say: 'Circumference is the distance around the edge. It equals two pi r, which is the same as pi times the diameter.' },
      { kind: 'example', title: 'Worked example: circumference',
        body: 'Find each circumference in terms of π.',
        reveal: ['Radius 6: C = 2 × π × 6 = 12π.', 'Diameter 24: C = π × 24 = 24π.', 'With a radius use 2πr; with a diameter use πd. Leave the answer in terms of π.'],
        say: 'Radius six gives two pi six, twelve pi. Diameter twenty-four gives pi times twenty-four, twenty-four pi.' }
    ],
    // Angles lesson teaches supplementary (180); questions also ask complementary (90).
    'm.10.angles': [
      { kind: 'concept', title: 'Complementary angles add to 90',
        body: 'Two angles are COMPLEMENTARY when they add to 90° — a square corner. If one is 38°, the other is 90 − 38 = 52°. (Supplementary adds to 180, a straight line; complementary adds to 90, a corner.)',
        analogy: 'Supplementary angles make a flat line; complementary angles make an L-shaped corner.',
        say: 'Complementary angles add to ninety degrees, a square corner. If one is thirty-eight, the other is ninety minus thirty-eight, fifty-two.' },
      { kind: 'try', title: 'Your turn: complementary',
        body: 'Two complementary angles. One is 60°. What is the other?',
        say: 'Two complementary angles. One is sixty degrees. What is the other?',
        widget: { w: 'tapPick', prompt: 'They add to 90°, so…', options: [{ label: '30°', correct: true }, { label: '120°' }, { label: '40°' }] } }
    ],
    // Exponents lesson evaluates powers; questions also test the product-of-powers rule.
    'm.8.expon': [
      { kind: 'concept', title: 'Multiplying powers: add the exponents',
        body: 'When you multiply powers with the SAME base, add the exponents: x^5 × x^2 = x^(5+2) = x^7. It works because x^5 is five x’s and x^2 is two x’s — put together that is seven x’s multiplied in a row.',
        analogy: 'Five x’s next to two more x’s is seven x’s in a row.',
        say: 'To multiply powers with the same base, add the exponents. x to the fifth times x squared is x to the seventh.' }
    ],
    // Percent lesson finds a % of a number; questions ask the SALE PRICE you pay.
    'm.6.percent': [
      { kind: 'concept', title: 'From discount to the price you PAY',
        body: 'A discount is a percent OFF. First find that percent of the price — that is the dollars OFF. To get the price you actually PAY, subtract: pay = original − dollars off.',
        analogy: '50% off a $100 jacket: 50% of 100 is $50 off, so you pay 100 − 50 = $50.',
        say: 'A discount is a percent off. Find that percent of the price for the dollars off, then subtract from the original to get what you pay.' },
      { kind: 'example', title: 'Worked example: sale price',
        body: 'A $240 jacket is 60% off. What do you PAY?',
        reveal: ['60% of 240 is 0.60 × 240 = 144 dollars off.', 'Pay = original − off = 240 − 144.', 'You pay $96.'],
        say: 'Sixty percent of two forty is one hundred forty-four off. Two forty minus one forty-four is ninety-six dollars.' }
    ],
    // Kindergarten shapes: questions include hexagon and star, not taught in base.
    'm.k.shapes': [
      { kind: 'show', title: 'Two more shapes: hexagon and star',
        body: 'A HEXAGON has 6 straight sides — like a patch on a soccer ball or a honeycomb cell. A STAR has points that poke out — like a starfish or a sheriff badge.',
        say: 'A hexagon has six sides, like a soccer ball patch. A star has points that poke out, like a starfish.',
        widget: { w: 'sideBySide', cards: [{ emoji: '⚽', title: 'Hexagon', body: '6 straight sides.' }, { emoji: '⭐', title: 'Star', body: 'Points that poke out.' }] } },
      { kind: 'try', title: 'Your turn: name the shape',
        body: 'What shape is a soccer ball patch?',
        say: 'What shape is a soccer ball patch?',
        widget: { w: 'tapPick', prompt: 'Count the sides…', options: [{ label: 'Hexagon', correct: true }, { label: 'Circle' }, { label: 'Star' }] } }
    ]
  };

  let patched = 0;
  for (const sid of Object.keys(PATCH)) {
    const les = bySkill[sid];
    const steps = PATCH[sid];
    if (!les || !Array.isArray(les.steps) || !steps || !steps.length) continue;
    const marker = steps[0].title;
    if (marker && les.steps.some(s => s && s.title === marker)) continue; // already applied
    let idx = les.steps.length;
    for (let i = les.steps.length - 1; i >= 0; i--) { if (les.steps[i] && les.steps[i].kind === 'recap') { idx = i; break; } }
    les.steps.splice(idx, 0, ...steps);
    patched++;
  }
  try { window.GALLOP_PATCHED = patched; } catch (e) {}
})();
