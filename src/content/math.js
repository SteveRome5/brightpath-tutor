// BrightPath Math, K-12 skill tree with real-life question generators
// Each skill: { id, name, grade, gen(d) } where d = difficulty 0..1
const { rint, pick, shuffle, numChoices, textChoices, q, KID_NAMES, FOODS, TOYS, PLACES } = require('./helpers');

// Build 4 guaranteed-distinct "<n>π" answer choices around a correct coefficient.
function piDistractors(coeff) {
  const set = new Set([coeff]);
  const cands = [coeff * 2, Math.max(1, Math.round(coeff / 2)), coeff + 2, coeff + 1, Math.max(1, coeff - 1), coeff + 4, coeff * 4];
  for (const c of cands) { if (set.size >= 4) break; if (c !== coeff && c > 0) set.add(c); }
  let f = coeff + 5; while (set.size < 4) { if (!set.has(f)) set.add(f); f++; }
  return shuffle([...set]).map(c => `${c}π`);
}

const skills = [
  // ---------- KINDERGARTEN (0) ----------
  {
    id: 'm.k.count', name: 'Counting Champs', grade: 0,
    gen(d) {
      const n = rint(3, d > 0.5 ? 10 : 6);
      const emoji = pick(['🍎', '⭐', '🐤', '🎈', '🚗', '🐞']);
      return q({
        prompt: `Count them! ${emoji.repeat(n)}\nHow many ${emoji} are there?`,
        voice: 'Count the pictures. How many are there?',
        choices: numChoices(n, () => Math.max(1, n + pick([-2, -1, 1, 2]))),
        answer: n,
        hint: 'Touch each one as you count: 1, 2, 3…',
        explain: `There are ${n}! Great counting.`
      });
    }
  },
  {
    id: 'm.k.compare', name: 'More or Less?', grade: 0,
    gen(d) {
      let a = rint(1, 8), b = rint(1, 8);
      if (a === b) b = a + 1;
      // Compare two groups of the SAME thing (a plate of 6 strawberries vs a plate
      // of 4 strawberries) — comparing strawberries to frogs confused kids.
      const e1 = pick(['🍓', '🍪', '🐟', '⭐', '🎈']);
      const bigger = a > b;
      return q({
        prompt: `Plate 1: ${e1.repeat(a)}\nPlate 2: ${e1.repeat(b)}\nWhich plate has MORE?`,
        voice: 'Look at the two plates. Which one has more?',
        choices: shuffle([`Plate 1 (${a})`, `Plate 2 (${b})`]),
        answer: bigger ? `Plate 1 (${a})` : `Plate 2 (${b})`,
        hint: 'Count each plate first!',
        explain: `${Math.max(a, b)} is more than ${Math.min(a, b)}.`
      });
    }
  },
  {
    id: 'm.k.shapes', name: 'Shape Detective', grade: 0,
    gen() {
      const shapes = [
        ['circle', 'a pizza 🍕 (the whole pie!)', 0], ['square', 'a cracker 🍘', 4],
        ['triangle', 'a slice of watermelon 🍉', 3], ['rectangle', 'a door 🚪', 4],
        ['star', 'a starfish at the beach', 0], ['heart', 'a valentine card', 0],
        ['circle', 'a clock 🕐', 0], ['circle', 'a full moon 🌕', 0], ['circle', 'a wheel 🛞', 0],
        ['square', 'a waffle 🧇', 4], ['square', 'a checkerboard tile', 4],
        ['triangle', 'a party hat 🥳', 3], ['triangle', 'a slice of pizza 🍕', 3], ['triangle', 'a yield sign', 3],
        ['rectangle', 'a phone 📱', 4], ['rectangle', 'a dollar bill 💵', 4], ['rectangle', 'a book 📖', 4],
        ['oval', 'an egg 🥚', 0], ['oval', 'a football 🏈', 0],
        ['diamond', 'a kite 🪁', 4], ['star', 'a sheriff badge', 0], ['heart', 'a candy heart', 0],
        ['hexagon', 'a honeycomb cell 🍯', 6], ['hexagon', 'a soccer ball patch ⚽', 6]
      ];
      const allNames = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval', 'diamond', 'hexagon'];
      const [name, real, sides] = pick(shapes);
      // Two flavors: name-the-shape, or count-the-sides (only for shapes with straight sides)
      if (sides >= 3 && Math.random() < 0.4) {
        return q({
          prompt: `A ${name} has how many sides? (Think of ${real}.)`,
          choices: textChoices(String(sides), ['0 (it\'s round!)', String(sides - 1), String(sides + 1), String(sides + 2)].filter(x => x !== String(sides))),
          answer: String(sides),
          hint: 'Trace around the edge and count each straight side!',
          explain: `A ${name} has ${sides} sides. Great counting!`
        });
      }
      return q({
        prompt: `Real-life shapes! What shape is ${real}?`,
        choices: textChoices(name, allNames.filter(n => n !== name)),
        answer: name,
        hint: 'Picture it in your mind. Is it round, or does it have corners?',
        explain: `Yes! ${real} is shaped like a ${name}.`
      });
    }
  },
  {
    id: 'm.k.add5', name: 'Adding Small Treasures', grade: 0,
    gen(d) {
      const a = rint(1, 3), b = rint(1, d > 0.5 ? 4 : 2);
      const toy = pick(TOYS), name = pick(KID_NAMES);
      return q({
        prompt: `${name} has ${a} ${toy}.\n${name} gets ${b} more.\nHow many now?`,
        choices: numChoices(a + b, () => Math.max(1, a + b + pick([-2, -1, 1, 2]))),
        answer: a + b,
        hint: `Start at ${a} and count up ${b} more.`,
        explain: `${a} + ${b} = ${a + b}. Sharing is the best math!`
      });
    }
  },

  // ---------- GRADE 1 ----------
  {
    id: 'm.1.add20', name: 'Addition to 20', grade: 1,
    gen(d) {
      const a = rint(2, d > 0.5 ? 12 : 8), b = rint(2, d > 0.5 ? 8 : 6);
      const f = pick(FOODS), name = pick(KID_NAMES);
      return q({
        prompt: `${name} has ${a} ${f}.\n${name} gets ${b} more.\nHow many ${f} now?`,
        choices: numChoices(a + b),
        answer: a + b,
        hint: 'Put the bigger number in your head and count up.',
        explain: `${a} + ${b} = ${a + b}.`
      });
    }
  },
  {
    id: 'm.1.sub20', name: 'Subtraction to 20', grade: 1,
    gen(d) {
      const a = rint(8, d > 0.5 ? 18 : 12), b = rint(2, a - 2);
      const name = pick(KID_NAMES);
      return q({
        prompt: `${name} had ${a} balloons. 🎈\n${b} floated away!\nHow many are left?`,
        choices: numChoices(a - b),
        answer: a - b,
        hint: `Count back from ${a}.`,
        explain: `${a} − ${b} = ${a - b}.`
      });
    }
  },
  {
    id: 'm.1.place', name: 'Tens & Ones', grade: 1,
    gen(d) {
      const t = rint(1, d > 0.5 ? 9 : 5), o = rint(0, 9);
      return q({
        prompt: `${t} tens and ${o} ones.\nWhat number is that? 🧃`,
        choices: numChoices(t * 10 + o, () => t * 10 + o + pick([-10, 10, -1, 1, 9, -9])),
        answer: t * 10 + o,
        hint: `${t} tens is ${t * 10}. Then add the ones.`,
        explain: `${t} tens + ${o} ones = ${t * 10 + o}.`
      });
    }
  },
  {
    id: 'm.1.time', name: 'Clock Reader', grade: 1,
    gen(d) {
      const h = rint(1, 12);
      const half = d > 0.5 && Math.random() > 0.5;
      const ans = half ? `${h}:30` : `${h}:00`;
      return q({
        prompt: `Little hand: ${h}.\nBig hand: ${half ? '6' : '12'}.\nWhat time is it? 🕐`,
        choices: textChoices(ans, [`${h}:00`, `${h}:30`, `${(h % 12) + 1}:00`, `${(h % 12) + 1}:30`, `${h}:15`]),
        answer: ans,
        hint: 'Big hand at 12 = o’clock. Big hand at 6 = thirty.',
        explain: `That clock says ${ans}. Popcorn time! 🍿`
      });
    }
  },
  {
    id: 'm.1.coins', name: 'Coin Counter', grade: 1,
    gen(d) {
      const dimes = rint(0, d > 0.5 ? 4 : 2), nickels = rint(0, 2), pennies = rint(0, 4);
      const total = dimes * 10 + nickels * 5 + pennies;
      if (total === 0) return this.gen(d);
      return q({
        prompt: `Your piggy bank 🐷 has:\n${dimes} dime${dimes === 1 ? '' : 's'}, ${nickels} nickel${nickels === 1 ? '' : 's'}, ${pennies} penn${pennies === 1 ? 'y' : 'ies'}.\nHow many cents?`,
        choices: numChoices(total, () => Math.max(0, total + pick([-5, 5, -10, 10, -1, 1]))).map(c => `${c}¢`),
        answer: `${total}¢`,
        hint: 'Dimes = 10¢, nickels = 5¢, pennies = 1¢.',
        explain: `${dimes}×10 + ${nickels}×5 + ${pennies}×1 = ${total}¢.`
      });
    }
  },

  // ---------- GRADE 2 ----------
  {
    id: 'm.2.add100', name: 'Big Addition (to 100)', grade: 2,
    gen(d) {
      const a = rint(15, d > 0.5 ? 68 : 40), b = rint(12, d > 0.5 ? 30 : 25);
      const name = pick(KID_NAMES);
      return q({
        prompt: `${name}'s lemonade stand 🍋 earned ${a}¢ in the morning and ${b}¢ in the afternoon. Total earnings?`,
        choices: numChoices(a + b).map(c => `${c}¢`),
        answer: `${a + b}¢`,
        hint: 'Add the tens first, then the ones.',
        explain: `${a} + ${b} = ${a + b}¢. Business is booming!`
      });
    }
  },
  {
    id: 'm.2.sub100', name: 'Big Subtraction (to 100)', grade: 2,
    gen(d) {
      const a = rint(40, d > 0.5 ? 95 : 70), b = rint(12, a - 15);
      return q({
        prompt: `A book has ${a} pages. You've read ${b} pages under your blanket with a flashlight 🔦. How many pages left?`,
        choices: numChoices(a - b),
        answer: a - b,
        hint: 'Subtract the tens, then the ones (borrow if needed).',
        explain: `${a} − ${b} = ${a - b} pages to go!`
      });
    }
  },
  {
    id: 'm.2.skip', name: 'Skip Counting', grade: 2,
    gen(d) {
      const step = pick(d > 0.5 ? [5, 10, 25, 3] : [2, 5, 10]);
      const start = step * rint(1, 4);
      const seq = [start, start + step, start + 2 * step];
      return q({
        prompt: `Counting ${step === 25 ? 'quarters 🪙' : step === 2 ? 'pairs of socks 🧦' : 'by ' + step + 's'}: ${seq.join(', ')}, ___?`,
        choices: numChoices(start + 3 * step, () => start + 3 * step + pick([-step, step, -1, 1, 2])),
        answer: start + 3 * step,
        hint: `Each jump adds ${step}.`,
        explain: `${seq[2]} + ${step} = ${start + 3 * step}.`
      });
    }
  },
  {
    id: 'm.2.change', name: 'Making Change', grade: 2,
    gen(d) {
      const price = rint(15, d > 0.5 ? 85 : 60);
      const paid = price <= 25 ? 25 : price <= 50 ? 50 : 100;
      return q({
        prompt: `At ${pick(PLACES)}, a smoothie costs ${price}¢. You pay with ${paid === 100 ? 'a dollar' : paid + '¢'}. How much change?`,
        choices: numChoices(paid - price, () => Math.max(0, (paid - price) + pick([-10, -5, -1, 1, 5, 10]))).map(c => `${c}¢`),
        answer: `${paid - price}¢`,
        hint: `Count up from ${price} to ${paid}.`,
        explain: `${paid} − ${price} = ${paid - price}¢ back in your pocket.`
      });
    }
  },
  {
    id: 'm.2.groups', name: 'Equal Groups (early ×)', grade: 2,
    gen(d) {
      const g = rint(2, d > 0.5 ? 5 : 4), per = rint(2, 5);
      return q({
        prompt: `Party bags! 🎉 You make ${g} bags with ${per} ${pick(TOYS)} in each. How many in all?`,
        choices: numChoices(g * per),
        answer: g * per,
        hint: `Count by ${per}s, ${g} times.`,
        explain: `${g} groups of ${per} = ${g * per}. That's ${g} × ${per}!`
      });
    }
  },
  {
    id: 'm.2.measure', name: 'Measure It!', grade: 2,
    gen(d) {
      const items = [['a crayon', 9, 'cm'], ['a skateboard', 70, 'cm'], ['a door', 2, 'meters'], ['a goldfish', 6, 'cm'], ['a soccer field', 100, 'meters'],
        ['a pencil', 18, 'cm'], ['a school bus', 12, 'meters'], ['a ladybug', 1, 'cm'], ['a bathtub', 2, 'meters'], ['your thumb', 5, 'cm'],
        ['a basketball hoop', 3, 'meters'], ['a dollar bill', 15, 'cm'], ['a giraffe', 5, 'meters'], ['a paperclip', 3, 'cm'], ['a garden hose', 15, 'meters'],
        ['a shoe', 25, 'cm'], ['a flagpole', 8, 'meters'], ['a strawberry', 4, 'cm'], ['a couch', 2, 'meters'], ['a jump rope', 3, 'meters']];
      const [item, real, unit] = pick(items);
      const wrongs = unit === 'cm' ? [`${real} meters`, `${real * 10} meters`, `${Math.max(1, Math.round(real / 3))} km`] : [`${real} cm`, `${real * 100} km`, `${real} mm`];
      return q({
        prompt: `Best estimate: about how long/tall is ${item}?`,
        choices: textChoices(`${real} ${unit}`, wrongs),
        answer: `${real} ${unit}`,
        hint: 'Your finger is about 1 cm wide. A big step is about 1 meter.',
        explain: `${item} is about ${real} ${unit}. Nice estimating!`
      });
    }
  },

  // ---------- GRADE 3 ----------
  {
    id: 'm.3.mult', name: 'Multiplication Facts', grade: 3,
    gen(d) {
      const a = rint(2, d > 0.5 ? 12 : 9), b = rint(2, d > 0.5 ? 12 : 9);
      const ctx = pick([
        `A spider has 8 legs, but let's try: ${a} spiders with ${b} spots each. Total spots?`,
        `${a} rows of chairs with ${b} chairs each for the talent show. How many chairs?`,
        `${a} packs of gum, ${b} pieces per pack. How many pieces?`
      ]);
      // Deliberate diagnostic distractor: a+b is what a child gets if they ADD instead
      // of multiply — so a parent (and the tutor) can see that exact mistake.
      return q({
        prompt: ctx,
        choices: textChoices(a * b, [a + b, a * b - b, a * b + b, a * b - a]),
        answer: a * b,
        hint: `Think: ${a} groups of ${b}.`,
        explain: `${a} × ${b} = ${a * b}.`,
        whyWrong: {
          [String(a + b)]: `Looks like you ADDED instead of multiplied: ${a} + ${b} = ${a + b}. But "${a} × ${b}" means ${a} groups of ${b} — add ${b} to itself ${a} times, which gives ${a * b}.`,
          [String(a * b - b)]: `So close — that's only ${a - 1} groups of ${b}. There are ${a} groups, so add one more ${b}: ${a} × ${b} = ${a * b}.`,
          [String(a * b + b)]: `Almost — that's ${a + 1} groups of ${b}. There are just ${a} groups: ${a} × ${b} = ${a * b}.`
        }
      });
    }
  },
  {
    id: 'm.3.div', name: 'Division Facts', grade: 3,
    gen(d) {
      const b = rint(2, d > 0.5 ? 12 : 9), ans = rint(2, d > 0.5 ? 12 : 9);
      const a = b * ans;
      return q({
        prompt: `${a} ${pick(FOODS)} shared equally among ${b} friends. How many does each friend get?`,
        choices: numChoices(ans, () => Math.max(1, ans + pick([-2, -1, 1, 2]))),
        answer: ans,
        hint: `What number times ${b} makes ${a}?`,
        explain: `${a} ÷ ${b} = ${ans}. Fair shares!`
      });
    }
  },
  {
    id: 'm.3.frac', name: 'Fraction Foundations', grade: 3,
    gen(d) {
      // Wider denominator range + rotating contexts so struggling kids (low d) don't
      // see the same handful of pizza prompts on repeat.
      const den = pick(d > 0.5 ? [3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6]), num = rint(1, den - 1);
      const ctx = pick([
        { thing: 'pizza 🍕', pieces: 'equal slices', act: 'You eat' },
        { thing: 'chocolate bar 🍫', pieces: 'equal squares', act: 'You eat' },
        { thing: 'sandwich 🥪', pieces: 'equal pieces', act: 'You eat' },
        { thing: 'garden 🌷', pieces: 'equal rows', act: 'You plant flowers in' },
        { thing: 'poster 🎨', pieces: 'equal sections', act: 'You paint' },
        { thing: 'pack of stickers ⭐', pieces: 'equal sheets', act: 'You give away' }
      ]);
      const leftMode = d > 0.5 && Math.random() < 0.35;
      if (leftMode) {
        const left = den - num;
        return q({
          prompt: `A ${ctx.thing} is split into ${den} ${ctx.pieces}. ${ctx.act} ${num}. What fraction is LEFT?`,
          choices: textChoices(`${left}/${den}`, [`${num}/${den}`, `${den}/${left}`, `${Math.min(left + 1, den)}/${den}`, `1/${left || 1}`]),
          answer: `${left}/${den}`,
          hint: `${den} parts minus the ${num} used.`,
          explain: `${den} − ${num} = ${left}, so ${left}/${den} is left.`,
          whyWrong: {
            [`${num}/${den}`]: `That's the fraction you USED, not the fraction LEFT. Start with all ${den} parts and take away the ${num} used: ${den} − ${num} = ${left}. So ${left}/${den} is left.`,
            [`${den}/${left}`]: `You flipped it. The bottom is always the total equal parts (${den}), and the top is how many are left (${left}). So it's ${left}/${den}.`
          }
        });
      }
      return q({
        prompt: `A ${ctx.thing} is split into ${den} ${ctx.pieces}. ${ctx.act} ${num}. What fraction is that?`,
        choices: textChoices(`${num}/${den}`, [`${den}/${num}`, `${num}/${den + 1}`, `${Math.min(num + 1, den)}/${den}`, `1/${num || 1}`]),
        answer: `${num}/${den}`,
        hint: 'The parts used, over the total parts.',
        explain: `${num} out of ${den} parts = ${num}/${den}.`,
        whyWrong: {
          // The classic numerator/denominator reversal — name it explicitly.
          [`${den}/${num}`]: `You reversed the two numbers. The TOP number is how many parts you used: ${num}. The BOTTOM is the total equal parts altogether: ${den}. So the fraction is ${num}/${den}, not ${den}/${num}.`,
          [`${num}/${den + 1}`]: `Careful counting the bottom — the ${ctx.thing.split(' ')[0]} is split into ${den} equal parts, not ${den + 1}. The bottom is the total parts: ${den}. So it's ${num}/${den}.`,
          [`${Math.min(num + 1, den)}/${den}`]: `Close! The bottom (${den}) is right. But the top is how many parts you used — that's ${num}, not ${num + 1}. So it's ${num}/${den}.`
        }
      });
    }
  },
  {
    id: 'm.3.area', name: 'Area & Perimeter', grade: 3,
    gen(d) {
      const w = rint(2, d > 0.5 ? 9 : 6), h = rint(2, d > 0.5 ? 9 : 6);
      const isArea = Math.random() > 0.5;
      const ans = isArea ? w * h : 2 * (w + h);
      return q({
        prompt: `You're designing a Minecraft-style garden ${w} blocks wide and ${h} blocks long. What is its ${isArea ? 'AREA (blocks of grass inside)' : 'PERIMETER (fence blocks around)'}?`,
        choices: numChoices(ans, () => pick([w * h, 2 * (w + h), w + h, w * h + w])),
        answer: ans,
        hint: isArea ? 'Area = width × length.' : 'Perimeter = add all four sides.',
        explain: isArea ? `${w} × ${h} = ${ans} blocks of grass.` : `${w}+${h}+${w}+${h} = ${ans} fence blocks.`
      });
    }
  },
  {
    id: 'm.3.word', name: 'Word Problem Power', grade: 3,
    gen(d) {
      const per = rint(3, 8), groups = rint(3, d > 0.5 ? 9 : 6), extra = rint(2, 9);
      const name = pick(KID_NAMES);
      return q({
        prompt: `${name} buys ${groups} packs of ${pick(TOYS)} (${per} in each pack) and gets ${extra} more as a gift. How many total?`,
        choices: numChoices(groups * per + extra, () => pick([groups * per, groups * per + extra + pick([-2, 2]), (groups + 1) * per + extra])),
        answer: groups * per + extra,
        hint: 'Multiply first, then add the gift.',
        explain: `${groups} × ${per} = ${groups * per}, plus ${extra} = ${groups * per + extra}.`
      });
    }
  },

  // ---------- GRADE 4 ----------
  {
    id: 'm.4.multibig', name: 'Multi-Digit Multiplication', grade: 4,
    gen(d) {
      const a = rint(12, d > 0.5 ? 99 : 40), b = rint(3, d > 0.5 ? 12 : 9);
      return q({
        prompt: `A stadium row seats ${a} fans. Your section has ${b} rows. How many seats?`,
        choices: numChoices(a * b, () => a * b + pick([-a, a, -10, 10, -b, b])),
        answer: a * b,
        hint: `Break it up: ${b} × ${Math.floor(a / 10) * 10} plus ${b} × ${a % 10}.`,
        explain: `${a} × ${b} = ${a * b} seats.`
      });
    }
  },
  {
    id: 'm.4.longdiv', name: 'Long Division', grade: 4,
    gen(d) {
      const b = rint(3, d > 0.5 ? 9 : 6), ans = rint(11, d > 0.5 ? 45 : 25);
      const a = b * ans;
      return q({
        prompt: `A game studio ships ${a} controllers in boxes of ${b}. How many boxes do they need?`,
        choices: numChoices(ans, () => ans + pick([-3, -2, -1, 1, 2, 3])),
        answer: ans,
        hint: `How many ${b}s fit into ${a}?`,
        explain: `${a} ÷ ${b} = ${ans} boxes.`
      });
    }
  },
  {
    id: 'm.4.equivfrac', name: 'Equivalent Fractions', grade: 4,
    gen(d) {
      const den = pick([2, 3, 4, 5, 6, 8, 10]), num = rint(1, den - 1), m = pick(d > 0.5 ? [3, 4, 5, 6] : [2, 3, 4]);
      const ctx = pick(['flour', 'sugar', 'milk', 'water', 'juice']);
      const mode = pick(['make', 'make', 'simplify']);
      if (mode === 'simplify') {
        // Give an unreduced fraction and ask for the simplest form
        const bigNum = num * m, bigDen = den * m;
        return q({
          prompt: `Which fraction is EQUAL to ${bigNum}/${bigDen} but written in simplest form?`,
          choices: textChoices(`${num}/${den}`, [`${num + 1}/${den}`, `${num}/${den + 1}`, `${bigNum}/${bigDen - 1}`, `${num * 2}/${den}`]),
          answer: `${num}/${den}`,
          hint: `Divide top and bottom by ${m}.`,
          explain: `${bigNum} ÷ ${m} = ${num} and ${bigDen} ÷ ${m} = ${den}, so ${bigNum}/${bigDen} = ${num}/${den}.`
        });
      }
      return q({
        prompt: `A recipe needs ${num}/${den} cup of ${ctx}. Which fraction is EQUAL to ${num}/${den}?`,
        choices: textChoices(`${num * m}/${den * m}`, [`${num + 1}/${den + 1}`, `${num * m}/${den * m + 1}`, `${num}/${den * m}`, `${den}/${num || 1}`]),
        answer: `${num * m}/${den * m}`,
        hint: 'Multiply top AND bottom by the same number.',
        explain: `${num}/${den} × ${m}/${m} = ${num * m}/${den * m}.`
      });
    }
  },
  {
    id: 'm.4.decimals', name: 'Decimal Debut', grade: 4,
    gen(d) {
      const dollars = rint(1, d > 0.5 ? 9 : 5), cents = rint(5, 95);
      const total = dollars + cents / 100;
      const ans = total.toFixed(2);
      // Build clean, guaranteed-distinct wrong forms (a decimal-place slip, a dime off,
      // and a dollar off), padding if any collide, so the question always has 4 choices.
      const set = new Set();
      set.add(`$${(dollars + cents / 10).toFixed(2)}`);
      set.add(`$${(total + 0.1).toFixed(2)}`);
      set.add(`$${(total + 1).toFixed(2)}`);
      let k = 2;
      while (set.size < 3) { set.add(`$${(total + k * 0.1 + 0.2).toFixed(2)}`); k++; }
      set.delete(`$${ans}`);
      return q({
        prompt: `You scan a snack at self-checkout: ${dollars} dollars and ${cents} cents. How is that written as a decimal?`,
        choices: textChoices(`$${ans}`, [...set]),
        answer: `$${ans}`,
        hint: 'Cents are hundredths, so two digits after the point.',
        explain: `${dollars} and ${cents}/100 = $${ans}.`
      });
    }
  },
  {
    id: 'm.4.factors', name: 'Factors & Multiples', grade: 4,
    gen(d) {
      const n = pick(d > 0.5 ? [24, 36, 48, 30, 40, 42, 54, 60, 56, 45] : [12, 16, 18, 20, 15, 21, 28, 32, 27, 14]);
      const factors = [];
      for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
      const nos = [];
      for (let i = 2; i < n; i++) if (n % i !== 0) nos.push(i);
      const item = pick(FOODS.concat(['cupcakes', 'party favors', 'trading cards', 'juice boxes']));
      const mode = pick(['factor', 'factor', 'notfactor', 'multiple']);
      if (mode === 'notfactor' && nos.length) {
        const no = pick(nos);
        // Use the full factor list (including 1 and n) so numbers with few proper factors
        // still yield 3 distinct factor distractors.
        const yesFactors = shuffle(factors.filter(f => f !== no)).slice(0, 3);
        if (yesFactors.length === 3) {
          return q({
            prompt: `Which number is NOT a factor of ${n}? (It would leave a remainder.)`,
            choices: textChoices(String(no), yesFactors.map(String)),
            answer: no,
            hint: `Try dividing ${n} by each. A factor divides evenly.`,
            explain: `${n} ÷ ${no} does not come out even, so ${no} is not a factor of ${n}.`
          });
        }
      }
      if (mode === 'multiple') {
        const base = pick(factors.filter(f => f >= 2 && f <= 9));
        const mult = base * pick([2, 3, 4, 5]);
        const notMults = [];
        for (let i = base + 1; i < mult + base * 3; i++) if (i % base !== 0) notMults.push(i);
        return q({
          prompt: `Which number is a MULTIPLE of ${base}?`,
          choices: textChoices(String(mult), shuffle(notMults).slice(0, 3).map(String)),
          answer: mult,
          hint: `Count by ${base}s: ${base}, ${base * 2}, ${base * 3}, ...`,
          explain: `${base} × ${mult / base} = ${mult}, so ${mult} is a multiple of ${base}.`
        });
      }
      const yes = pick(factors.filter(f => f > 1 && f < n));
      return q({
        prompt: `You want to split ${n} ${item} into equal boxes with none left over. Which box size works?`,
        choices: textChoices(String(yes), shuffle(nos).slice(0, 3).map(String)),
        answer: yes,
        hint: `Does the number divide ${n} evenly?`,
        explain: `${n} ÷ ${yes} = ${n / yes} boxes exactly. ${yes} is a factor of ${n}.`
      });
    }
  },

  // ---------- GRADE 5 ----------
  {
    id: 'm.5.fracops', name: 'Fraction Add & Subtract', grade: 5,
    gen(d) {
      const den = pick(d > 0.5 ? [6, 8, 10, 12] : [4, 6, 8]);
      let a = rint(1, den - 2), b = rint(1, den - a - 1);
      // Guaranteed-distinct wrong forms: added the denominators, subtracted instead of
      // added, and an off-by-one top. Padded so there are always 3 distractors.
      const ansStr = `${a + b}/${den}`;
      const set = new Set([`${a + b}/${den * 2}`, `${Math.max(1, Math.abs(a - b))}/${den}`, `${a + b + 1}/${den}`]);
      set.delete(ansStr);
      let ex = 2; while (set.size < 3) { set.add(`${a + b}/${den + ex}`); ex++; }
      return q({
        prompt: `Pizza party math: you eat ${a}/${den} of a pizza and your cousin eats ${b}/${den}. How much did you eat together?`,
        choices: textChoices(ansStr, [...set]),
        answer: ansStr,
        hint: 'Same denominator? Just add the tops.',
        explain: `${a}/${den} + ${b}/${den} = ${a + b}/${den}.`
      });
    }
  },
  {
    id: 'm.5.decops', name: 'Decimal Operations', grade: 5,
    gen(d) {
      const a = rint(150, d > 0.5 ? 899 : 500) / 100, b = rint(100, 400) / 100;
      const ans = (a + b).toFixed(2);
      return q({
        prompt: `Ordering lunch 🌮: tacos cost $${a.toFixed(2)} and a smoothie costs $${b.toFixed(2)}. What's the total?`,
        choices: textChoices(`$${ans}`, [`$${(a + b + 1).toFixed(2)}`, `$${(a + b - 0.1).toFixed(2)}`, `$${(a + b + 0.05).toFixed(2)}`, `$${Math.abs(a - b).toFixed(2)}`]),
        answer: `$${ans}`,
        hint: 'Line up the decimal points and add.',
        explain: `$${a.toFixed(2)} + $${b.toFixed(2)} = $${ans}.`
      });
    }
  },
  {
    id: 'm.5.volume', name: 'Volume Builder', grade: 5,
    gen(d) {
      const l = rint(2, d > 0.5 ? 8 : 5), w = rint(2, 6), h = rint(2, 5);
      return q({
        prompt: `An aquarium 🐠 is ${l} × ${w} × ${h} (in feet). How many cubic feet of water fills it?`,
        choices: numChoices(l * w * h, () => pick([l * w * h, l * w + h, l + w + h, l * w * (h + 1), l * w * h + l])),
        answer: l * w * h,
        hint: 'Volume = length × width × height.',
        explain: `${l} × ${w} × ${h} = ${l * w * h} cubic feet.`
      });
    }
  },
  {
    id: 'm.5.oop', name: 'Order of Operations', grade: 5,
    gen(d) {
      const a = rint(2, 6), b = rint(2, d > 0.5 ? 9 : 6), c = rint(2, 5);
      const ans = a + b * c;
      return q({
        prompt: `Game score! You have ${a} points, then defeat ${b} monsters worth ${c} points each. Total: ${a} + ${b} × ${c} = ?`,
        choices: numChoices(ans, () => pick([(a + b) * c, ans, ans + c, a * b + c])),
        answer: ans,
        hint: 'Multiply BEFORE you add (PEMDAS).',
        explain: `${b} × ${c} = ${b * c} first, then + ${a} = ${ans}.`
      });
    }
  },

  // ---------- GRADE 6 ----------
  {
    id: 'm.6.ratio', name: 'Ratios in Real Life', grade: 6,
    gen(d) {
      const a = rint(2, 5), b = rint(2, 5), m = rint(2, d > 0.5 ? 6 : 4);
      return q({
        prompt: `Trail mix recipe: ${a} cups of nuts for every ${b} cups of raisins. If you use ${a * m} cups of nuts, how many cups of raisins?`,
        choices: numChoices(b * m, () => pick([a * m, b * m + b, b * m - 1, a + b * m])),
        answer: b * m,
        hint: `The recipe was multiplied by ${m}.`,
        explain: `${a}:${b} scaled by ${m} → ${a * m}:${b * m}.`
      });
    }
  },
  {
    id: 'm.6.percent', name: 'Percent Power', grade: 6,
    gen(d) {
      const base = pick(d > 0.5 ? [40, 60, 80, 120, 150, 200, 240] : [20, 40, 50, 100]);
      const pct = pick(d > 0.5 ? [10, 15, 20, 25, 30, 40, 60, 75] : [10, 25, 50]);
      const ans = Math.round(base * pct / 100 * 100) / 100;
      // Money always renders as whole dollars or 2 decimals — never "$22.5".
      const $$ = v => { const n = Number(v); return Number.isInteger(n) ? String(n) : n.toFixed(2); };
      const mode = pick(['save', 'tip', 'tax', 'score', 'whatpct', 'left']);
      if (mode === 'tip') {
        return q({ prompt: `Dinner 🍝 costs $${base}. You leave a ${pct}% tip. How much is the TIP?`,
          choices: numChoices(ans, () => pick([ans, base * (pct + 5) / 100, ans + 2, ans * 2])).map(c => `$${$$(c)}`),
          answer: `$${$$(ans)}`, hint: `${pct}% of $${base}.`, explain: `${pct}% × $${base} = $${$$(ans)} tip.` });
      }
      if (mode === 'tax') {
        const total = base + ans;
        return q({ prompt: `A game 🎮 costs $${base} plus ${pct}% sales tax. What's the TOTAL you pay?`,
          choices: numChoices(total, () => pick([total, base, ans, total + 5])).map(c => `$${$$(c)}`),
          answer: `$${$$(total)}`, hint: `Find the tax, then add it to $${base}.`, explain: `Tax = $${$$(ans)}; $${base} + $${$$(ans)} = $${$$(total)}.` });
      }
      if (mode === 'score') {
        const total = pick([20, 25, 40, 50]);
        // Only use a percent that yields a WHOLE number of questions for this total, so the
        // stated percent and the count of correct answers are exactly consistent.
        const spct = pick([10, 20, 25, 30, 40, 50, 60, 75, 80].filter(p => (total * p) % 100 === 0));
        const got = total * spct / 100;
        return q({ prompt: `On a ${total}-question test 📝 you got ${spct}% correct. How many questions did you get right?`,
          choices: numChoices(got, () => pick([got, total - got, got + 1, got + 2])),
          answer: got, hint: `${spct}% of ${total}.`, explain: `${spct}% × ${total} = ${got} correct.` });
      }
      if (mode === 'whatpct') {
        const part = pick([5, 10, 15, 20, 30]); const whole = part * pick([2, 4, 5, 10]);
        const p = Math.round(part / whole * 100);
        return q({ prompt: `You made ${part} of your ${whole} free throws 🏀. What PERCENT did you make?`,
          choices: numChoices(p, () => pick([p, p + 10, p - 10, 100 - p])).map(c => `${c}%`),
          answer: `${p}%`, hint: `part ÷ whole × 100.`, explain: `${part} ÷ ${whole} = ${p}%.` });
      }
      if (mode === 'left') {
        const left = base - ans;
        return q({ prompt: `A $${base} jacket 🧥 is ${pct}% off. What's the SALE price you actually pay?`,
          choices: numChoices(left, () => pick([left, ans, base, left + 5])).map(c => `$${$$(c)}`),
          answer: `$${$$(left)}`, hint: `Save ${pct}%, pay the rest.`, explain: `$${base} − $${$$(ans)} off = $${$$(left)}.` });
      }
      return q({ prompt: `SALE! 🛍️ Sneakers cost $${base} and are ${pct}% off. How many dollars do you SAVE?`,
        choices: numChoices(ans, () => pick([ans, base - ans, ans + 5, ans * 2])).map(c => `$${$$(c)}`),
        answer: `$${$$(ans)}`, hint: `${pct}% means ${pct} out of every 100.`, explain: `${pct}% of $${base} = $${$$(ans)} saved.` });
    }
  },
  {
    id: 'm.6.integers', name: 'Negative Numbers', grade: 6,
    gen(d) {
      const a = rint(2, d > 0.5 ? 15 : 9), b = rint(a + 1, a + 12);
      return q({
        prompt: `Weather report ⛄: it's ${a}° outside, then the temperature DROPS ${b} degrees at night. What's the new temperature?`,
        choices: numChoices(a - b, () => pick([a - b, b - a, -(a + b), a - b + 2])).map(c => `${c}°`),
        answer: `${a - b}°`,
        hint: 'Dropping below zero makes it negative.',
        explain: `${a} − ${b} = ${a - b}°. Brrr!`
      });
    }
  },
  {
    id: 'm.6.expr', name: 'Expressions & Variables', grade: 6,
    gen(d) {
      const rate = rint(3, d > 0.5 ? 12 : 8), base = rint(5, 20), x = rint(2, 6);
      return q({
        prompt: `Dog-walking business 🐕: you charge $${base} plus $${rate} per walk (w). If walks = ${x}, what does ${base} + ${rate}w equal?`,
        choices: numChoices(base + rate * x, () => pick([base + rate * x, (base + rate) * x, base * x + rate, base + rate + x])).map(c => `$${c}`),
        answer: `$${base + rate * x}`,
        hint: `Replace w with ${x}, multiply first.`,
        explain: `${base} + ${rate}×${x} = ${base} + ${rate * x} = $${base + rate * x}.`
      });
    }
  },

  // ---------- GRADE 7 ----------
  {
    id: 'm.7.proportion', name: 'Proportions & Unit Rates', grade: 7,
    gen(d) {
      const items = rint(3, 6), cost = items * rint(2, d > 0.5 ? 6 : 4), want = rint(7, 12);
      const unit = cost / items;
      return q({
        prompt: `${items} smoothies cost $${cost}. At the same rate, how much do ${want} smoothies cost?`,
        choices: numChoices(unit * want, () => pick([unit * want, cost + want, unit * want + unit, cost * 2])).map(c => `$${c}`),
        answer: `$${unit * want}`,
        hint: `First find the price of ONE smoothie: $${cost} ÷ ${items}.`,
        explain: `$${unit} each × ${want} = $${unit * want}.`
      });
    }
  },
  {
    id: 'm.7.equation', name: 'Solving Equations', grade: 7,
    gen(d) {
      const x = rint(2, d > 0.5 ? 12 : 8), a = rint(2, 6), b = rint(1, 20);
      return q({
        prompt: `Escape-room lock 🔐: solve ${a}x + ${b} = ${a * x + b}. What is x?`,
        choices: numChoices(x, () => Math.max(1, x + pick([-3, -2, -1, 1, 2, 3]))),
        answer: x,
        hint: `Subtract ${b} from both sides, then divide by ${a}.`,
        explain: `${a}x = ${a * x} → x = ${x}. The door opens!`
      });
    }
  },
  {
    id: 'm.7.prob', name: 'Probability', grade: 7,
    gen(d) {
      const red = rint(1, 5), blue = rint(1, 5), green = d > 0.5 ? rint(1, 4) : 0;
      const total = red + blue + green;
      // Guaranteed-distinct wrong forms (inverted, red-vs-not-red odds, off-by-one),
      // padded so there are always 3 distractors even when red == blue.
      const ansStr = `${red}/${total}`;
      const set = new Set([`${total}/${red}`, `${red}/${Math.max(1, total - red)}`, `${blue}/${total}`, `${red + 1}/${total}`]);
      set.delete(ansStr);
      let ex = 1; while (set.size < 3) { set.add(`${red}/${total + ex}`); ex++; }
      return q({
        prompt: `A claw machine 🕹️ has ${red} red, ${blue} blue${green ? `, and ${green} green` : ''} plushies. If it grabs one at random, what's the chance it's red?`,
        choices: textChoices(ansStr, [...set]),
        answer: ansStr,
        hint: 'Favorable outcomes over total outcomes.',
        explain: `${red} red out of ${total} total = ${red}/${total}.`
      });
    }
  },
  {
    id: 'm.7.rational', name: 'Rational Number Ops', grade: 7,
    gen(d) {
      const a = rint(-12, -2), b = rint(2, d > 0.5 ? 12 : 8);
      const ans = a * b;
      return q({
        prompt: `Submarine dive 🌊: you descend ${Math.abs(a)} meters per minute for ${b} minutes. Your depth change is ${a} × ${b} = ?`,
        choices: numChoices(ans, () => pick([ans, -ans, a + b, ans + b])),
        answer: ans,
        hint: 'Negative × positive = negative.',
        explain: `${a} × ${b} = ${ans} meters (below the surface).`
      });
    }
  },

  // ---------- GRADE 8 ----------
  {
    id: 'm.8.linear', name: 'Linear Equations', grade: 8,
    gen(d) {
      const m = rint(2, d > 0.5 ? 8 : 5), c = rint(1, 15), x = rint(2, 9);
      return q({
        prompt: `A streaming service costs $${c} to join plus $${m}/month. Using y = ${m}x + ${c}, what do you pay after ${x} months?`,
        choices: numChoices(m * x + c, () => pick([m * x + c, m * (x + c), Math.abs(m * x - c) || m + c, (m + c) * x])).map(v => `$${v}`),
        answer: `$${m * x + c}`,
        hint: `Plug in x = ${x}.`,
        explain: `${m}×${x} + ${c} = $${m * x + c}.`
      });
    }
  },
  {
    id: 'm.8.slope', name: 'Slope & Rate of Change', grade: 8,
    gen(d) {
      const x1 = rint(0, 4), y1 = rint(0, 6);
      const run = rint(1, d > 0.5 ? 5 : 3), rise = run * rint(1, 4);
      const x2 = x1 + run, y2 = y1 + rise;
      const slope = rise / run;
      return q({
        prompt: `A skate ramp 🛹 goes from point (${x1}, ${y1}) to (${x2}, ${y2}). What's its slope (rise over run)?`,
        choices: numChoices(slope, () => pick([slope, Math.round((run / rise) * 100) / 100 || 1, slope + 1, rise, run])),
        answer: slope,
        hint: `Rise = ${y2}−${y1}, Run = ${x2}−${x1}.`,
        explain: `Slope = ${rise}/${run} = ${slope}.`
      });
    }
  },
  {
    id: 'm.8.expon', name: 'Exponents', grade: 8,
    gen(d) {
      const mode = pick(['power', 'power', 'product', 'quotient']);
      if (mode === 'product') {
        // Product rule: a^m × a^n = a^(m+n)
        const base = pick([2, 3, 5, 10, 'x']), m1 = rint(2, 5), n1 = rint(2, 5);
        return q({
          prompt: `Simplify using exponent rules: ${base}^${m1} × ${base}^${n1}`,
          choices: textChoices(`${base}^${m1 + n1}`, [`${base}^${m1 * n1}`, `${base}^${Math.abs(m1 - n1)}`, `${base}${base}^${m1 + n1}`, `${base}^${m1 + n1 + 1}`]),
          answer: `${base}^${m1 + n1}`,
          hint: 'When multiplying like bases, ADD the exponents.',
          explain: `${base}^${m1} × ${base}^${n1} = ${base}^(${m1}+${n1}) = ${base}^${m1 + n1}.`
        });
      }
      if (mode === 'quotient') {
        // Quotient rule: a^m ÷ a^n = a^(m−n), keep m>n
        const base = pick([2, 3, 5, 10, 'x']), n1 = rint(2, 4), m1 = n1 + rint(1, 4);
        return q({
          prompt: `Simplify using exponent rules: ${base}^${m1} ÷ ${base}^${n1}`,
          choices: textChoices(`${base}^${m1 - n1}`, [`${base}^${m1 + n1}`, `${base}^${m1 * n1}`, `${base}^${m1}`, `${base}^${m1 - n1 + 1}`]),
          answer: `${base}^${m1 - n1}`,
          hint: 'When dividing like bases, SUBTRACT the exponents.',
          explain: `${base}^${m1} ÷ ${base}^${n1} = ${base}^(${m1}−${n1}) = ${base}^${m1 - n1}.`
        });
      }
      const base = pick([2, 3, 4, 5, 6, 7, 10]), e = rint(2, d > 0.5 ? 4 : 3);
      const ctx = pick([
        `A video goes viral: each round, ${base} people each share it with ${base} new people. After ${e} rounds it reaches ${base}^${e} people. What is ${base}^${e}?`,
        `A cell splits into ${base} every stage. After ${e} stages you have ${base}^${e} cells. What is ${base}^${e}?`,
        `What is the value of ${base}^${e} (that is, ${base} raised to the power ${e})?`
      ]);
      return q({
        prompt: ctx,
        choices: numChoices(Math.pow(base, e), () => pick([Math.pow(base, e), base * e, Math.pow(base, e) + base, Math.pow(e, base)])),
        answer: Math.pow(base, e),
        hint: `Multiply ${base} by itself ${e} times.`,
        explain: `${Array(e).fill(base).join(' × ')} = ${Math.pow(base, e)}.`
      });
    }
  },
  {
    id: 'm.8.pythag', name: 'Pythagorean Theorem', grade: 8,
    gen(d) {
      const triples = d > 0.5 ? [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [10, 24, 26], [12, 16, 20]] : [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
      const [a, b, c] = pick(triples);
      const ctx = pick([
        `A ladder 🪜 rests ${a} ft from a wall and reaches ${b} ft up. How long is the ladder?`,
        `A TV screen 📺 is ${a} in wide and ${b} in tall. What is its diagonal (screen size)?`,
        `A park path cuts across a rectangle ${a} m by ${b} m. How long is the diagonal shortcut?`,
        `A kite string ✈️ goes ${a} m sideways and ${b} m up. How long is the string?`,
        `A ramp covers ${a} ft of ground and rises ${b} ft. How long is the ramp surface?`
      ]);
      // Sometimes ask for a missing LEG instead of the hypotenuse
      if (d > 0.5 && Math.random() < 0.35) {
        return q({ prompt: `A ${c}-ft ladder 🪜 leans so its top is ${b} ft up a wall. How far is its BASE from the wall? (a² + b² = c²)`,
          choices: numChoices(a, () => pick([a, c - b, a + 1, a - 1, b])).map(v => `${v} ft`),
          answer: `${a} ft`, hint: `c² − b² = a². Then square-root.`, explain: `${c * c} − ${b * b} = ${a * a}, √${a * a} = ${a} ft.` });
      }
      const unit = ctx.includes(' in ') || ctx.includes('screen') ? 'in' : ctx.includes(' m ') || ctx.includes(' m,') ? 'm' : 'ft';
      return q({
        prompt: `${ctx} (a² + b² = c²)`,
        choices: numChoices(c, () => pick([c, a + b, c + 1, c - 1, b])).map(v => `${v} ${unit}`),
        answer: `${c} ${unit}`,
        hint: `${a}² + ${b}² = ?  Then take the square root.`,
        explain: `${a * a} + ${b * b} = ${c * c}, and √${c * c} = ${c} ${unit}.`
      });
    }
  },

  // ---------- GRADE 9 (Algebra I) ----------
  {
    id: 'm.9.multistep', name: 'Multi-Step Equations', grade: 9,
    gen(d) {
      const x = rint(2, d > 0.5 ? 10 : 6), a = rint(2, 5), b = rint(1, 9), c = rint(1, 4);
      // a(x + b) = a*x + a*b ... solve a(x+b) - c*x = ...
      const rhs = a * (x + b) - c * x;
      return q({
        prompt: `Solve for x: ${a}(x + ${b}) − ${c}x = ${rhs}`,
        choices: numChoices(x, () => Math.max(1, x + pick([-3, -2, -1, 1, 2, 3]))),
        answer: x,
        hint: `Distribute the ${a} first, then combine x terms.`,
        explain: `${a}x + ${a * b} − ${c}x = ${rhs} → ${a - c}x = ${rhs - a * b} → x = ${x}.`
      });
    }
  },
  {
    id: 'm.9.systems', name: 'Systems of Equations', grade: 9,
    gen(d) {
      const x = rint(1, d > 0.5 ? 8 : 5), y = rint(1, 6);
      return q({
        prompt: `Concert tickets 🎫: adult + kid ticket = $${x + y}. Adult − kid = $${x - y}. What does the ADULT ticket cost?`,
        choices: numChoices(x, () => pick([x, y, x + y, Math.abs(x - y) || 1])).map(v => `$${v}`),
        answer: `$${x}`,
        hint: 'Add the two equations, the kid price cancels out.',
        explain: `Adding: 2×adult = $${2 * x}, so adult = $${x} (kid = $${y}).`
      });
    }
  },
  {
    id: 'm.9.quadratic', name: 'Factoring Quadratics', grade: 9,
    gen(d) {
      const r1 = rint(1, d > 0.5 ? 7 : 5), r2 = rint(1, 6);
      const b = r1 + r2, c = r1 * r2;
      return q({
        prompt: `Factor it: x² + ${b}x + ${c} = (x + ?)(x + ?). Which pair works?`,
        choices: textChoices(`${r1} and ${r2}`, [`${r1 + 1} and ${r2}`, `${b} and ${c}`, `${r1} and ${r2 + 2}`, `${Math.max(1, r1 - 1)} and ${r2 + 1}`]),
        answer: `${r1} and ${r2}`,
        hint: `Two numbers that MULTIPLY to ${c} and ADD to ${b}.`,
        explain: `${r1} × ${r2} = ${c} and ${r1} + ${r2} = ${b}. ✓`
      });
    }
  },
  {
    id: 'm.9.inequal', name: 'Inequalities', grade: 9,
    gen(d) {
      const rate = rint(8, d > 0.5 ? 15 : 12), goal = rate * rint(4, 9) + rint(1, rate - 1);
      const hours = Math.ceil(goal / rate);
      return q({
        prompt: `You earn $${rate}/hour babysitting and need at least $${goal} for concert tickets. Minimum WHOLE hours you must work?`,
        choices: numChoices(hours, () => Math.max(1, hours + pick([-2, -1, 1, 2]))),
        answer: hours,
        hint: `Solve ${rate}h ≥ ${goal}, then round UP.`,
        explain: `${goal} ÷ ${rate} ≈ ${(goal / rate).toFixed(1)} → round up to ${hours} hours.`
      });
    }
  },

  // ---------- GRADE 10 (Geometry) ----------
  {
    id: 'm.10.angles', name: 'Angle Relationships', grade: 10,
    gen(d) {
      const a = rint(20, d > 0.5 ? 150 : 120);
      const type = pick(['supplementary', 'complementary']);
      const total = type === 'supplementary' ? 180 : 90;
      const a2 = Math.min(a, total - 10);
      return q({
        prompt: `Two ${type} angles: one is ${a2}°. What's the other? (${type} = add to ${total}°)`,
        choices: numChoices(total - a2, () => pick([total - a2, a2, total, Math.abs(90 - a2) || 45])).map(v => `${v}°`),
        answer: `${total - a2}°`,
        hint: `They must add to ${total}°.`,
        explain: `${total} − ${a2} = ${total - a2}°.`
      });
    }
  },
  {
    id: 'm.10.triangles', name: 'Triangle Angle Sum', grade: 10,
    gen(d) {
      const a = rint(30, 80), b = rint(30, d > 0.5 ? 100 : 70);
      const c = 180 - a - b;
      if (c < 10) return this.gen(d);
      return q({
        prompt: `A sail on a boat ⛵ is a triangle with angles ${a}° and ${b}°. What's the third angle?`,
        choices: numChoices(c, () => pick([c, 180 - c, c + 10, 90])).map(v => `${v}°`),
        answer: `${c}°`,
        hint: 'All triangle angles add to 180°.',
        explain: `180 − ${a} − ${b} = ${c}°.`
      });
    }
  },
  {
    id: 'm.10.circles', name: 'Circles', grade: 10,
    gen(d) {
      const obj = pick(['pizza 🍕', 'trampoline', 'clock 🕐', 'garden fountain', 'bike wheel 🚲', 'round pool', 'dinner plate', 'Ferris wheel 🎡']);
      const mode = pick(['area', 'circ', 'fromDiam', 'realCirc']);
      if (mode === 'fromDiam') {
        const diam = rint(4, d > 0.5 ? 20 : 12) * 2; const r = diam / 2;
        const isArea = Math.random() > 0.5;
        const coeff = isArea ? r * r : diam;
        const piCoeffs = piDistractors(coeff);
        return q({ prompt: `A ${obj} has DIAMETER ${diam} units. Find its ${isArea ? 'AREA' : 'CIRCUMFERENCE'} (in terms of π).`,
          choices: piCoeffs, answer: `${coeff}π`,
          hint: isArea ? 'radius = diameter ÷ 2, then πr²' : 'Circumference = πd', explain: isArea ? `r = ${r}, so π×${r}² = ${r * r}π.` : `π × d = ${diam}π.` });
      }
      if (mode === 'realCirc') {
        const r = rint(2, 10); const ans = Math.round(2 * Math.PI * r * 10) / 10;
        return q({ prompt: `A ${obj} has radius ${r} m. About how far around is it? (use π ≈ 3.14)`,
          choices: numChoices(ans, () => Math.round((2 * Math.PI * r + pick([-3, 3, 6, -6, r])) * 10) / 10).map(v => `${v} m`),
          answer: `${ans} m`, hint: 'C = 2πr ≈ 2 × 3.14 × r', explain: `2 × 3.14 × ${r} ≈ ${ans} m.` });
      }
      const r = rint(2, d > 0.5 ? 12 : 7);
      const isArea = mode === 'area';
      const coeff = isArea ? r * r : 2 * r;
      return q({
        prompt: `A round ${obj} has radius ${r} units. What is its ${isArea ? 'AREA' : 'CIRCUMFERENCE'} (in terms of π)?`,
        choices: piDistractors(coeff),
        answer: `${coeff}π`,
        hint: isArea ? 'Area = πr²' : 'Circumference = 2πr',
        explain: isArea ? `π × ${r}² = ${r * r}π sq units.` : `2 × π × ${r} = ${2 * r}π units.`
      });
    }
  },
  {
    id: 'm.10.similar', name: 'Similar Figures', grade: 10,
    gen(d) {
      const s = rint(2, d > 0.5 ? 5 : 3), a = rint(3, 8);
      return q({
        prompt: `Map scale 🗺️: a ${a} cm road on a map is really ${a * s} km. A ${a + 2} cm road is really how many km?`,
        choices: numChoices((a + 2) * s, () => pick([(a + 2) * s, a * s + 2, (a + 2) * (s + 1), a * s])),
        answer: (a + 2) * s,
        hint: `The scale factor is ${s} (since ${a} → ${a * s}).`,
        explain: `${a + 2} × ${s} = ${(a + 2) * s} km.`
      });
    }
  },

  // ---------- GRADE 11 (Algebra II) ----------
  {
    id: 'm.11.functions', name: 'Function Evaluation', grade: 11,
    gen(d) {
      const a = rint(1, 3), b = rint(1, d > 0.5 ? 9 : 5), x = rint(2, 6);
      const ans = a * x * x - b;
      return q({
        prompt: `Physics of a dive 🤿: f(x) = ${a}x² − ${b}. Find f(${x}).`,
        choices: numChoices(ans, () => pick([ans, a * x - b, (a * x) * (a * x) - b, ans + b])),
        answer: ans,
        hint: `Square ${x} first, then multiply by ${a}, then subtract ${b}.`,
        explain: `${a}(${x})² − ${b} = ${a * x * x} − ${b} = ${ans}.`
      });
    }
  },
  {
    id: 'm.11.exponential', name: 'Exponential Growth', grade: 11,
    gen(d) {
      const factor = pick([2, 2, 3, 5, 10]);
      const p = pick([50, 100, 150, 200, 300, 500, 1000]);
      const n = rint(2, d > 0.5 ? 4 : 3);
      const ans = p * Math.pow(factor, n);
      const word = factor === 2 ? 'DOUBLES' : factor === 3 ? 'TRIPLES' : `grows ${factor}×`;
      const ctx = pick([
        `Your channel's subscribers ${word} every month. Starting at ${p}, how many after ${n} months?`,
        `A bacteria colony ${word} every hour. Starting with ${p} cells, how many after ${n} hours?`,
        `A rumor spreads and ${word} each day. If ${p} people know it today, how many know it after ${n} more days?`
      ]);
      return q({
        prompt: ctx,
        choices: numChoices(ans, () => pick([ans, p * factor * n, ans / factor, p + factor * n, ans + p])),
        answer: ans,
        hint: `Multiply the start by ${factor} once for each period: ${p} × ${factor}^${n}.`,
        explain: `${p} × ${factor}^${n} = ${p} × ${Math.pow(factor, n)} = ${ans}.`
      });
    }
  },
  {
    id: 'm.11.logs', name: 'Logarithms', grade: 11,
    gen(d) {
      const base = pick([2, 3, 4, 5, 10]), e = rint(2, d > 0.5 ? 5 : 3);
      const val = Math.pow(base, e);
      const ctx = pick([
        `Earthquake and sound scales use logs. What is log base ${base} of ${val}?`,
        `What is log base ${base} of ${val}? (Ask: ${base} to what power equals ${val}?)`,
        `Evaluate log_${base}(${val}).`
      ]);
      return q({
        prompt: ctx,
        choices: numChoices(e, () => pick([e, base, val / base, e + 1, e - 1])),
        answer: e,
        hint: `${base} to WHAT power gives ${val}?`,
        explain: `${base}^${e} = ${val}, so log base ${base} of ${val} is ${e}.`
      });
    }
  },
  {
    id: 'm.11.poly', name: 'Polynomial Operations', grade: 11,
    gen(d) {
      const a = rint(1, 4), b = rint(1, d > 0.5 ? 8 : 5), c = rint(1, 4), e = rint(1, 6);
      // Guaranteed-distinct wrong forms (wrong variable on the linear term, everything
      // collapsed to x, an off-by-one coefficient), padded so there are always 3.
      const ansStr = `${a + c}x² + ${b + e}x`;
      const set = new Set([`${a + c}x² + ${b + e}x²`, `${a + c + b + e}x`, `${a + c}x² + ${b + e + 1}x`, `${a * c}x² + ${b * e}x`]);
      set.delete(ansStr);
      let ex = 2; while (set.size < 3) { set.add(`${a + c + ex}x² + ${b + e}x`); ex++; }
      return q({
        prompt: `Simplify: (${a}x² + ${b}x) + (${c}x² + ${e}x)`,
        choices: textChoices(ansStr, [...set]),
        answer: ansStr,
        hint: 'Combine like terms: x² with x², x with x.',
        explain: `(${a}+${c})x² + (${b}+${e})x = ${a + c}x² + ${b + e}x.`
      });
    }
  },

  // ---------- GRADE 12 (Pre-Calculus) ----------
  {
    id: 'm.12.trig', name: 'Trigonometry', grade: 12,
    gen(d) {
      const easy = [['sin', 30, '1/2'], ['cos', 60, '1/2'], ['sin', 90, '1'], ['cos', 0, '1'], ['tan', 45, '1'], ['sin', 0, '0'], ['cos', 90, '0'], ['tan', 0, '0']];
      const hard = [['cos', 30, '√3/2'], ['sin', 60, '√3/2'], ['sin', 45, '√2/2'], ['cos', 45, '√2/2'], ['tan', 60, '√3'], ['tan', 30, '√3/3']];
      const angles = d > 0.5 ? easy.concat(hard) : easy;
      const [fn, ang, ans] = pick(angles);
      const ctx = pick([
        `Ferris wheel heights use trig. What is ${fn}(${ang}°)?`,
        `On the unit circle, what is the exact value of ${fn}(${ang}°)?`,
        `A ramp's angle is ${ang}°. What is ${fn}(${ang}°)?`
      ]);
      return q({
        prompt: ctx,
        choices: textChoices(ans, ['1/2', '1', '0', '√2/2', '√3/2', '√3', '√3/3', '2']),
        answer: ans,
        hint: 'Picture the unit circle and the special right triangles (30-60-90 and 45-45-90).',
        explain: `${fn}(${ang}°) = ${ans}.`
      });
    }
  },
  {
    id: 'm.12.sequences', name: 'Sequences & Series', grade: 12,
    gen(d) {
      const a1 = rint(2, 10), diff = rint(2, d > 0.5 ? 8 : 5), n = rint(4, 8);
      const ans = a1 + (n - 1) * diff;
      return q({
        prompt: `Stadium seating: row 1 has ${a1} seats, each row adds ${diff} more. How many seats in row ${n}?`,
        choices: numChoices(ans, () => pick([ans, a1 + n * diff, a1 * n, ans - diff])),
        answer: ans,
        hint: `aₙ = a₁ + (n−1)d.`,
        explain: `${a1} + ${n - 1}×${diff} = ${ans} seats.`
      });
    }
  },
  {
    id: 'm.12.limits', name: 'Intro to Limits', grade: 12,
    gen(d) {
      const mode = pick(['diffsq', 'diffsq', 'factor', 'direct']);
      const a = rint(2, d > 0.5 ? 9 : 6);
      if (mode === 'factor') {
        // (x² − Sx + P)/(x − a) = (x − a)(x − c)/(x − a) → x − c, limit a − c
        let c = rint(1, 6); if (c === a) c = a + 1;
        const S = a + c, P = a * c;
        return q({
          prompt: `As x approaches ${a}, what does (x² − ${S}x + ${P}) / (x − ${a}) approach?`,
          choices: numChoices(a - c, () => pick([a - c, a + c, a, c, a - c + 1])),
          answer: a - c,
          hint: `Factor the top into (x − ${a})(x − ${c}), then cancel (x − ${a}).`,
          explain: `The expression simplifies to x − ${c}, which approaches ${a} − ${c} = ${a - c}.`
        });
      }
      if (mode === 'direct') {
        // Continuous polynomial, direct substitution: lim x→a of (x² + bx)
        const b = rint(2, 6), ans = a * a + b * a;
        return q({
          prompt: `As x approaches ${a}, what does x² + ${b}x approach? (This function is continuous, so substitute.)`,
          choices: numChoices(ans, () => pick([ans, a * a, a + b, 2 * a + b, ans + a])),
          answer: ans,
          hint: `Just plug in x = ${a}.`,
          explain: `${a}² + ${b}·${a} = ${a * a} + ${b * a} = ${ans}.`
        });
      }
      return q({
        prompt: `As x approaches ${a}, what does (x² − ${a * a}) / (x − ${a}) approach?`,
        choices: numChoices(2 * a, () => pick([2 * a, a, a * a, 0, 2 * a + 1])),
        answer: 2 * a,
        hint: `Factor the top as a difference of squares: (x − ${a})(x + ${a}).`,
        explain: `It simplifies to x + ${a}, which approaches ${2 * a}.`
      });
    }
  },
  {
    id: 'm.12.vectors', name: 'Vectors', grade: 12,
    gen(d) {
      const x1 = rint(1, 6), y1 = rint(1, 6), x2 = rint(1, d > 0.5 ? 8 : 5), y2 = rint(1, 5);
      const ansStr = `⟨${x1 + x2}, ${y1 + y2}⟩`;
      // Guaranteed-distinct wrong forms (multiplied parts, off-by-one on x, off-by-one on y,
      // subtracted), padded so there are always 3 distractors.
      const set = new Set([`⟨${x1 * x2}, ${y1 * y2}⟩`, `⟨${x1 + x2 + 1}, ${y1 + y2}⟩`, `⟨${x1 + x2}, ${y1 + y2 + 1}⟩`, `⟨${x2 - x1}, ${y2 - y1}⟩`]);
      set.delete(ansStr);
      let ex = 2; while (set.size < 3) { set.add(`⟨${x1 + x2 + ex}, ${y1 + y2}⟩`); ex++; }
      return q({
        prompt: `Drone flight 🚁: it flies vector ⟨${x1}, ${y1}⟩ then ⟨${x2}, ${y2}⟩. What's the total displacement vector?`,
        choices: textChoices(ansStr, [...set]),
        answer: ansStr,
        hint: 'Add x-parts together and y-parts together.',
        explain: `⟨${x1}+${x2}, ${y1}+${y2}⟩ = ⟨${x1 + x2}, ${y1 + y2}⟩.`
      });
    }
  }
];

module.exports = { subject: 'math', label: 'Math', emoji: '🔢', color: '#6C5CE7', skills };
