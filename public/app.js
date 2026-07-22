/* Gallop Learning Academy SPA, vanilla JS, zero build step */
'use strict';

// Storage shim: when the browser blocks localStorage (Safari "Block all cookies",
// managed school devices, some private modes) the bare accessor THROWS at load time
// and the whole app would white-screen. Shadow it with an in-memory stand-in so the
// app runs normally — settings just don't persist across reloads in that mode.
(() => {
  try { window.localStorage.getItem('__probe__'); } catch (e) {
    const mem = {};
    const shim = {
      getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem(k, v) { mem[k] = String(v); },
      removeItem(k) { delete mem[k]; },
      clear() { for (const k of Object.keys(mem)) delete mem[k]; },
      get length() { return Object.keys(mem).length; },
      key(i) { return Object.keys(mem)[i] ?? null; }
    };
    // Bracket-style access (localStorage['bp_x'] = '1') must work too:
    const proxied = new Proxy(shim, {
      get(t, p) { if (p in t) return t[p]; return Object.prototype.hasOwnProperty.call(mem, p) ? mem[p] : undefined; },
      set(t, p, v) { mem[p] = String(v); return true; },
      deleteProperty(t, p) { delete mem[p]; return true; }
    });
    try { Object.defineProperty(window, 'localStorage', { value: proxied, configurable: true }); } catch (e2) { /* very old engines: fall through */ }
  }
})();

// ======================= tiny helpers =======================
const $ = sel => document.querySelector(sel);
const app = () => $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  document.querySelectorAll('.gallop-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'gallop-toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3800);
}
// Toast with an inline action button (e.g. an Undo). Stays a little longer so a child has
// time to reverse a tap — nothing they do should ever feel like a one-way trap.
function toastAction(msg, actionLabel, onAction) {
  document.querySelectorAll('.gallop-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'gallop-toast';
  const span = document.createElement('span'); span.textContent = msg + ' ';
  const btn = document.createElement('button'); btn.className = 'toast-action'; btn.textContent = actionLabel;
  btn.onclick = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); try { onAction(); } catch (e) {} };
  t.appendChild(span); t.appendChild(btn);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 7000);
}

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.data = data; throw e; }
  return data;
}

const AVATARS = { fox: '🦊', panda: '🐼', dragon: '🐉', unicorn: '🦄', robot: '🤖', astronaut: '🧑‍🚀', tiger: '🐯', octopus: '🐙', axolotl: '🦎', narwhal: '🦭', phoenix: '🐦‍🔥', alien: '👽' };
const ITEM_EMOJI = { crown: '👑', tophat: '🎩', cap: '🧢', party: '🥳', grad: '🎓', cowboy: '🤠', halo: '😇', headphones: '🎧', flower: '🌺', helmet: '⛑️', santa: '🎅', glasses: '👓', sunglasses: '🕶️', bowtie: '🎀', medal: '🏅', guitar: '🎸', wand: '🪄', skateboard: '🛹', trophy: '🏆', books: '📚', soccer: '⚽', controller: '🎮', rainbow: '🌈', space: '🌌', beach: '🏖️', castle: '🏰', volcano: '🌋', city: '🌆', garden: '🌻', sunset: '🌅', winter: '❄️', spooky: '🎃', holiday: '🎄', pup: '🐶', kitten: '🐱', bunny: '🐰', turtle: '🐢', butterfly: '🦋', dino: '🦕', sloth: '🦥', owl: '🦉', hamster: '🐹', parrot: '🦜', pony: '🐴' };
// Render a kid's customized avatar (base + hat + accessory + pet + background)
function avatarHTML(k) {
  // A custom uploaded photo (older kids) wins over the built-in emoji avatar.
  if (k && k.avatar_img) return `<span class="av-wrap av-photo-wrap"><img class="av-photo" src="${k.avatar_img}" alt="avatar" loading="lazy"></span>`;
  const cfg = (k && k.avatar_config) || {};
  const base = AVATARS[cfg.base || (k && k.avatar)] || '🦊';
  const bg = cfg.bg && cfg.bg !== 'purple' ? ITEM_EMOJI[cfg.bg] || '' : '';
  const hat = cfg.hat && cfg.hat !== 'none' ? ITEM_EMOJI[cfg.hat] || '' : '';
  const acc = cfg.accessory && cfg.accessory !== 'none' ? ITEM_EMOJI[cfg.accessory] || '' : '';
  const pet = cfg.pet && cfg.pet !== 'none' ? ITEM_EMOJI[cfg.pet] || '' : '';
  return `<span class="av-wrap">${bg ? `<span class="av-bg">${bg}</span>` : ''}<span class="av-base">${base}</span>${hat ? `<span class="av-hat">${hat}</span>` : ''}${acc ? `<span class="av-acc">${acc}</span>` : ''}${pet ? `<span class="av-pet">${pet}</span>` : ''}</span>`;
}
// The Gallop track, our horse IS the progress bar 🐎
function gallopTrack(pct, label) {
  pct = Math.max(0, Math.min(100, pct));
  const flags = [25, 50, 75].map(f => `<span class="g-flag ${pct >= f ? 'passed' : ''}" style="left:${f}%">⭐</span>`).join('');
  return `<div class="gallop-wrap">${label ? `<span class="gallop-label">${esc(label)}</span>` : ''}<div class="gallop-rail"></div><div class="gallop-done" style="width:${pct}%"></div>${flags}<span class="g-finish">🎯</span><span class="gallop-horse ${pct >= 100 ? 'finished' : ''}" style="left:${Math.min(pct, 98)}%">🐎</span></div>`;
}
const SUBJECT_STYLE = {
  math: { color: '#6C5CE7', emoji: '🔢', cheer: 'Math Mission' },
  english: { color: '#00B894', emoji: '📚', cheer: 'Word Quest' },
  science: { color: '#0984E3', emoji: '🔬', cheer: 'Lab Time' },
  spanish: { color: '#E17055', emoji: '🌎', cheer: 'Spanish Adventure' }
};
const PRAISE = ['¡Fantástico!', 'Nailed it!', 'You’re on fire! 🔥', 'Brain power!', 'Boom! Correct!', 'Genius move!', 'Crushed it!', 'Superstar!'];
const ENCOURAGE = ['Almost! Every mistake grows your brain 🧠', 'Good try. Let’s look at why:', 'So close! Here’s the trick:', 'No worries, even scientists mess up every day!'];
const PRAISE_TEEN = ['Correct.', 'Nice, exactly right.', 'Clean solve.', 'That’s it.', 'Solid work.', 'Right on the first read.'];
const ENCOURAGE_TEEN = ['Not quite. Here’s the reasoning:', 'Close. The key detail:', 'Let’s walk through it:', 'Off by a step. Here’s where:'];

// "When will I ever use this?", answered on every single question.
const WHY = {
  math: {
    young: [
      'Kids who run lemonade stands use this math to count their money! 🍋',
      'Bakers measure and count like this every morning. 🧁',
      'This is how you make sure you get the right change at the store! 🪙',
      'Builders count and measure like this to make houses stand up straight. 🏗️',
      'Game designers use numbers like these to make your favorite games work! 🎮'
    ],
    teen: [
      'Founders live in this math, margins, growth rates, break-even points.',
      'Investors use exactly this to compare companies and spot value.',
      'Engineers at SpaceX and Apple run these operations thousands of times a day.',
      'This is the math behind every budget, paycheck, and smart purchase you\'ll ever make.',
      'Data scientists, one of the best-paid careers, are built on this foundation.'
    ]
  },
  english: {
    young: [
      'Great readers become great leaders, words are how ideas travel! 📚',
      'Every movie, game, and book you love started with someone writing well. ✍️',
      'Knowing lots of words helps you say exactly what you mean!',
      'Reading fast and well makes EVERY other subject easier. 🚀'
    ],
    teen: [
      'CEOs say clear writing is the #1 skill they hire for.',
      'Persuasion, in essays, interviews, negotiations, is a superpower built here.',
      'Contracts, colleges, and careers all filter for people who read carefully.',
      'The best thinkers write well because writing IS thinking made visible.'
    ]
  },
  science: {
    young: [
      'Scientists ask "why?" just like you, that\'s how everything gets invented! 🔬',
      'Doctors use this science to help people feel better every day. 🩺',
      'Knowing how the world works makes you the smartest explorer around! 🌍',
      'Chefs use science, heat, mixing, freezing, every time they cook! 👩‍🍳'
    ],
    teen: [
      'Every medical breakthrough, clean-energy company, and rocket starts here.',
      'Scientific thinking, hypothesis, test, revise, is how you avoid being fooled.',
      'Biotech and climate tech are hiring the generation that masters this now.',
      'Understanding evidence beats believing headlines. That\'s a life skill.'
    ]
  },
  spanish: {
    young: [
      '¡Hola! Over 500 million people speak Spanish, that\'s a lot of new friends! 🌎',
      'Speaking two languages literally makes your brain stronger!',
      'You could order tacos in Mexico City all by yourself! 🌮'
    ],
    teen: [
      'Bilingual professionals out-earn monolingual peers in nearly every field.',
      'The U.S. has 42+ million Spanish speakers, bilingual = twice the market.',
      'Learning a language rewires your brain for better focus and memory. Proven.'
    ]
  }
};
// Topic-matched real-world lines, the shape question gets a BUILDER line, not a money line!
const WHY_TOPICS = {
  math: [
    { match: /shape|geometr|area|perimeter|angle|symmetr|volume/i,
      young: ['Builders use shapes to make houses and bridges strong! 🏗️', 'Artists and video game designers build whole worlds out of shapes! 🎮'],
      teen: ['Architects, engineers, and game developers work in geometry every day.', '3D printing, CAD design, graphics engines, it\'s all geometry.'] },
    { match: /money|coin|cent|dollar|change|percent|interest|discount|budget/i,
      young: ['This is how you make sure you get the right change at the store! 🪙', 'Kids who run lemonade stands use this to count their profit! 🍋'],
      teen: ['This is the math behind every budget, paycheck, and smart purchase.', 'Investors and founders live in percentages, margins, growth, interest.'] },
    { match: /clock|time|calendar|schedule/i,
      young: ['Reading clocks means you always know when the fun starts! ⏰', 'Pilots and train drivers read time like this to keep everyone safe!'],
      teen: ['Schedules, time zones, deadlines, adults run their lives on this.'] },
    { match: /fraction|ratio|divid|division/i,
      young: ['Chefs split recipes with fractions every single day! 👩‍🍳', 'Sharing pizza fairly with friends IS fractions! 🍕'],
      teen: ['Ratios drive recipes, medicine doses, and financial models.'] },
    { match: /graph|data|chart|probab|statist|mean|median/i,
      young: ['Sports announcers use stats like these during every game! 🏀', 'Weather forecasters use data to predict rain or shine! ⛅'],
      teen: ['Data science, one of the best-paid careers, is built on this.', 'Reading data correctly means nobody can fool you with a chart.'] },
    { match: /measur|length|weight|unit/i,
      young: ['Carpenters measure twice and cut once, just like this! 📏', 'Bakers measure ingredients so cookies come out perfect! 🍪'],
      teen: ['Engineering, medicine, construction, measurement is the foundation.'] }
  ],
  english: [
    { match: /read|comprehen|story|detail|main idea|inference/i,
      young: ['Great readers become great leaders, words are how ideas travel! 📚', 'Reading well makes EVERY other subject easier. 🚀'],
      teen: ['Careful reading is how you win at contracts, colleges, and careers.'] },
    { match: /vocab|word|synonym|antonym|prefix|suffix/i,
      young: ['Knowing lots of words helps you say exactly what you mean!', 'Word detectives can figure out ANY new word they meet! 🔍'],
      teen: ['A precise vocabulary is a negotiation and interview superpower.'] },
    { match: /grammar|sentence|punctuat|noun|verb|contraction/i,
      young: ['Clear sentences make sure everyone understands your great ideas! ✍️'],
      teen: ['CEOs say clear writing is the #1 skill they hire for.'] },
    { match: /writ|essay|persua|figurative|poet/i,
      young: ['Every movie, game, and book you love started with someone writing well!'],
      teen: ['Persuasion, essays, pitches, interviews, is a superpower built here.', 'The best thinkers write well, because writing IS thinking made visible.'] }
  ],
  science: [
    { match: /animal|plant|habitat|body|sense|living/i,
      young: ['Doctors and vets use this science to help people and pets! 🩺', 'Knowing how living things work makes you a nature explorer! 🌍'],
      teen: ['Medicine, biotech, and conservation careers all start right here.'] },
    { match: /matter|solid|liquid|gas|chemi|mix/i,
      young: ['Chefs use this science, heat, mixing, freezing, every time they cook! 👩‍🍳'],
      teen: ['Chemistry powers everything from clean water to phone batteries.'] },
    { match: /weather|space|earth|planet|rock|water cycle/i,
      young: ['Weather scientists use this to tell you when to grab an umbrella! ☔', 'Astronauts study this to explore space! 🚀'],
      teen: ['Climate science and space exploration are hiring this generation.'] },
    { match: /force|motion|energy|electric|magnet|physic/i,
      young: ['Roller coaster designers use this science to make rides thrilling AND safe! 🎢'],
      teen: ['Every rocket, EV, and power grid runs on these principles.'] },
    { match: /cell|dna|genetic|biolog|microb/i,
      young: ['Doctors and vets peek at cells to keep bodies healthy! 🔬', 'Everything alive is built from cells, even YOU! 🧬'],
      teen: ['CRISPR, vaccines, cancer research, the biotech boom starts with cells.', 'Understanding DNA is the doorway to medicine and genetic engineering.'] },
    { match: /ecosystem|environment|climate|conserv/i,
      young: ['Park rangers use this to protect animals and forests! 🌲', 'Every plant and animal has a job in nature\'s team! 🐝'],
      teen: ['Environmental science and green energy are defining careers of your generation.', 'Reading ecosystems is how we solve the climate challenge.'] }
  ],
  spanish: []
};
// Extra life-skills topic buckets, appended so each subject keeps its original
// matches while gaining more specific, career-relevant real-world connections.
WHY_TOPICS.english.push(
  { match: /argument|evidence|persua|rhetoric|inference|claim|bias|author/i,
    young: ['Spotting a good reason from a bad one keeps you smart and safe! 🕵️'],
    teen: ['Recognizing weak evidence and spin means ads and headlines can\'t fool you.', 'Lawyers, journalists, and leaders win by reasoning from real evidence.'] }
);
WHY_TOPICS.math.push(
  { match: /algebra|equation|variable|expression|slope|linear|function/i,
    young: ['Solving for the missing number is like being a math detective! 🔍'],
    teen: ['Algebra is the language of coding, engineering, and problem-solving itself.', 'Every app, spreadsheet, and simulation is algebra under the hood.'] },
  { match: /probab|odds|chance|statist/i,
    young: ['Knowing the chances helps you make smart choices in games! 🎲'],
    teen: ['Probability is how doctors weigh risks and investors weigh bets, a core adult skill.'] },
  // Skill-specific matches for concepts the generic bank used to mislabel (tester finding #3):
  { match: /negative|integer|opposite|below zero|signed number/i,
    young: ['Temperatures below zero and steps below ground use negative numbers! 🌡️'],
    teen: ['Negative numbers track things like temperature below zero, elevation below sea level, and money owed.'] },
  { match: /logarithm|\blog\b|exponent|exponential|power/i,
    young: ['Exponents show how things grow really, really fast! 📈'],
    teen: ['Logarithmic scales appear in earthquake magnitudes (Richter), sound (decibels), and pH.'] },
  { match: /decimal|round|place value|estimat/i,
    young: ['Money uses decimals — dollars and cents! 💵'],
    teen: ['Decimals and rounding show up in prices, measurements, and lab data.'] }
);
WHY_TOPICS.spanish.push(
  { match: /greeting|hola|phrase|conversa/i,
    young: ['You could say hi and make a new friend anywhere in the world! 🌎', 'Travelers use these words to feel at home in new places! ✈️'],
    teen: ['A warm greeting in someone\'s language opens doors business and diplomacy can\'t.'] },
  { match: /family|animal|food|color|number|body/i,
    young: ['You could order tacos or name your pet in Spanish! 🌮', 'Every new word is a new door to another culture! 🚪'],
    teen: ['Everyday vocabulary is the foundation of real fluency, and fluency pays.'] },
  { match: /verb|ser|estar|tense|preterite|subjunctive|grammar/i,
    young: ['Verbs let you tell stories about what everyone is doing! 🎭'],
    teen: ['Mastering verbs is the leap from "tourist Spanish" to true bilingual fluency, a career multiplier.'] }
);
// XP ranks, every learner climbs the stable, Foal to Thoroughbred 🏇
const RANKS = [['Foal', 0], ['Pony Pal', 100], ['Trotter', 250], ['Canterer', 500], ['Galloper', 1000], ['Trailblazer', 2000], ['Champion', 4000], ['Legend', 8000], ['Thoroughbred', 15000]];
function rankFor(xp) {
  let cur = RANKS[0], next = null;
  for (const r of RANKS) { if (xp >= r[1]) cur = r; else { next = r; break; } }
  return { name: cur[0], at: cur[1], next: next ? { name: next[0], at: next[1] } : null };
}

function whyLine(subject, skillName) {
  // Only show a "real world" connection when it's genuinely tied to THIS skill. A generic
  // per-subject line ("bakers measure every morning" on a negative-temperature question)
  // reads as filler and undercuts trust — better to say nothing than something unrelated.
  const topics = WHY_TOPICS[subject] || [];
  const hit = skillName ? topics.find(t => t.match.test(skillName)) : null;
  if (hit) { const list = playful() ? hit.young : (hit.teen.length ? hit.teen : hit.young); return list[Math.floor(Math.random() * list.length)]; }
  return ''; // no skill-specific match → omit rather than show an unrelated connection
}

// ---- age-adaptive themes: the app grows up with the student ----
function themeForGrade(g) { return g <= 2 ? 'junior' : g <= 5 ? 'explorer' : g <= 8 ? 'scholar' : 'academy'; }
function applyTheme() {
  document.body.dataset.theme = State.me.role === 'kid' ? themeForGrade(State.me.kid.grade) : 'pro';
}
function playful() { const t = document.body.dataset.theme; return t === 'junior' || t === 'explorer'; }

// ======================= sound engine =======================
const Sound = (() => {
  let ctx, muted = localStorage.bp_muted === '1';
  function ac() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
  function tone(freq, t0, dur, type = 'sine', gain = 0.12) {
    if (muted) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  return {
    correct() { tone(523, 0, .15); tone(659, .1, .15); tone(784, .2, .3); },
    wrong() { tone(220, 0, .25, 'triangle'); tone(196, .15, .3, 'triangle'); },
    click() { tone(600, 0, .06, 'square', .05); },
    levelup() { [523, 587, 659, 784, 880, 1047].forEach((f, i) => tone(f, i * .12, .25)); },
    badge() { tone(880, 0, .12); tone(1109, .12, .2); tone(1319, .26, .35); },
    get muted() { return muted; },
    toggle() { muted = !muted; localStorage.bp_muted = muted ? '1' : '0'; return muted; },
    ctx: ac
  };
})();

// ======================= background music (procedural, not stock) =======================
// A gentle generative soundtrack built live with Web Audio, a warm pad, a soft
// arpeggio, and the occasional bell over a slow chord loop. Two moods: a chill
// lo-fi vibe for older learners, a brighter playful one for the littles. It only
// plays in the FUN zones (arcade, avatar, snacks, trophies) so lessons stay focused.
const Music = (() => {
  let on = localStorage.bp_music === '1';   // default OFF until a kid switches it on
  let ctx = null, master = null, timer = null, step = 0, group = 'chill', playing = false;
  let track = null, trackIdx = 0, barsOnTrack = 0;
  // A library of procedural tracks. Offsets are semitones from `root`; scales are
  // pentatonic-friendly so every note lands pleasantly. Each track has its own
  // chords, arpeggio, bass pattern, timbre and melody scale for a distinct feel.
  const TRACKS = {
    // ---- older learners: chill / lo-fi / ambient ----
    lofi:     { root: 220.00, tempo: 1900, wave: 'sine',     chords: [[0,7,12,16],[-2,5,10,14],[3,10,15,19],[-4,3,8,12]], arp: [0,7,12,16,19,16,12,7], mel: [0,3,7,10,12], padGain: .05, arpGain: .04, bassGain: .06, filt: 900, bell: true },
    midnight: { root: 196.00, tempo: 2100, wave: 'sine',     chords: [[0,3,7,10],[-2,3,5,10],[-4,0,3,7],[-5,-2,3,7]], arp: [0,3,7,10,12,10,7,3], mel: [0,3,5,7,10], padGain: .052, arpGain: .036, bassGain: .06, filt: 780, bell: true },
    focus:    { root: 174.61, tempo: 2300, wave: 'triangle', chords: [[0,7,12],[5,12,17],[-3,4,9],[2,9,14]], arp: [0,7,12,7], mel: [0,2,5,7,9], padGain: .055, arpGain: .03, bassGain: .05, filt: 700, bell: false },
    cosmos:   { root: 164.81, tempo: 2200, wave: 'sine',     chords: [[0,5,10,14],[2,7,12,16],[-3,2,7,12],[-5,0,5,10]], arp: [0,5,10,14,17,14,10,5], mel: [0,5,7,10,12], padGain: .05, arpGain: .038, bassGain: .058, filt: 1000, bell: true },
    // ---- younger learners: bright / bouncy / adventurous (with a gentle drum groove) ----
    sunny:     { root: 293.66, tempo: 1500, wave: 'triangle', chords: [[0,4,7,12],[5,9,12,17],[7,11,14,19],[2,5,9,14]], arp: [0,4,7,12,7,4], mel: [0,4,7,9,12], padGain: .045, arpGain: .052, bassGain: .06, filt: 1500, bell: true, drums: true },
    adventure: { root: 261.63, tempo: 1400, wave: 'triangle', chords: [[0,4,7],[5,9,12],[9,12,16],[7,11,14]], arp: [0,4,7,12,7,4], mel: [0,2,4,7,9], padGain: .04, arpGain: .05, bassGain: .06, filt: 1400, bell: true, drums: true },
    bubbles:   { root: 329.63, tempo: 1350, wave: 'sine',     chords: [[0,5,9,12],[-3,2,7,12],[0,4,9,14],[5,9,12,16]], arp: [0,5,9,12,16,12,9,5], mel: [0,5,9,12,14], padGain: .04, arpGain: .052, bassGain: .055, filt: 1800, bell: true, drums: true },
    arcade:    { root: 277.18, tempo: 1250, wave: 'triangle', chords: [[0,4,7,12],[3,7,10,15],[5,9,12,17],[-2,3,7,10]], arp: [0,4,7,12,16,12,7,4], mel: [0,3,5,7,10], padGain: .03, arpGain: .05, bassGain: .06, filt: 2000, bell: true, drums: true }
  };
  const PLAYLIST = { chill: ['lofi', 'midnight', 'focus', 'cosmos'], playful: ['sunny', 'adventure', 'bubbles', 'arcade'] };
  const BARS_PER_TRACK = 8;  // rotate to the next track for variety after 8 bars

  function note(freq, t, dur, gain, wave, filtHz) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = wave; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = filtHz || 1200;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(f).connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  // Soft, warm kick + hi-hat for a bouncy (not harsh) kid groove.
  let _noise = null;
  function noiseBuf() { if (_noise) return _noise; const b = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (_noise = b); }
  function kick(t) { try { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(135, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0006, t + 0.18); o.connect(g).connect(master); o.start(t); o.stop(t + 0.2); } catch (e) {} }
  function hat(t, gain) { try { const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); s.buffer = noiseBuf(); f.type = 'highpass'; f.frequency.value = 8000; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0004, t + 0.045); s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 0.06); } catch (e) {} }
  function semis(root, s) { return root * Math.pow(2, s / 12); }
  function pickTrackForGroup() {
    const list = PLAYLIST[group] || PLAYLIST.chill;
    track = TRACKS[list[trackIdx % list.length]];
    trackIdx++; barsOnTrack = 0;
  }
  function schedule() {
    if (!playing) return;
    const M = track, t = ctx.currentTime + 0.05, beat = M.tempo / 1000;
    const chord = M.chords[step % M.chords.length];
    // sustained pad (whole chord)
    chord.forEach(s => note(semis(M.root, s), t, beat * 1.9, M.padGain * (0.85 + Math.random() * 0.3), M.wave, M.filt));
    // bass: root two octaves down, with a soft mid-bar pulse for groove
    note(semis(M.root / 2, chord[0]), t, beat * 1.1, M.bassGain, 'triangle', 500);
    note(semis(M.root / 2, chord[0] + 7), t + beat, beat * 0.9, M.bassGain * 0.7, 'triangle', 500);
    // arpeggio across the bar
    const per = beat / M.arp.length * 2;
    M.arp.forEach((s, i) => note(semis(M.root * 2, s + chord[0]), t + i * per, per * 1.3, M.arpGain, 'sine', M.filt + 400));
    // gentle melody: a couple of pentatonic notes, humanized, not every bar. A soft second
    // voice a whisker detuned adds warmth (a mini chorus) so it sings instead of beeps.
    if (step % 2 === 0) {
      const mel = M.mel, n1 = mel[Math.floor(Math.random() * mel.length)] + 12, n2 = mel[Math.floor(Math.random() * mel.length)] + 12;
      const mf1 = semis(M.root, n1 + chord[0]);
      note(mf1, t + beat * 0.5, beat * 0.6, M.arpGain * 1.15, 'triangle', M.filt + 800);
      note(mf1 * 1.004, t + beat * 0.5, beat * 0.6, M.arpGain * 0.5, 'sine', M.filt + 600);
      if (Math.random() < 0.6) note(semis(M.root, n2 + chord[0]), t + beat * 1.3, beat * 0.6, M.arpGain, 'sine', M.filt + 800);
    }
    // occasional shimmer bell
    if (M.bell && step % 2 === 1) note(semis(M.root * 4, chord[1]), t + beat, beat * 1.2, 0.026, 'sine', 3200);
    // bouncy drum groove for the kids' tracks: kick on the two main beats, hats on the offbeats
    if (M.drums) {
      const half = beat;  // one "beat" here is half the bar
      kick(t); kick(t + half * 0.5);
      hat(t + half * 0.25, 0.05); hat(t + half * 0.5, 0.07); hat(t + half * 0.75, 0.05); hat(t + half, 0.06); hat(t + half * 1.5, 0.06);
    }
    step++; barsOnTrack++;
    if (barsOnTrack >= BARS_PER_TRACK) pickTrackForGroup();  // rotate track for variety
    timer = setTimeout(schedule, M.tempo);
  }
  function start(which) {
    if (!on) return;
    if (which && which !== group) { group = which; trackIdx = 0; if (playing) pickTrackForGroup(); }
    else group = which || group;
    try {
      ctx = Sound.ctx();
      if (ctx.state === 'suspended') ctx.resume();
      if (!master) { master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.62, ctx.currentTime + 1.5); // gentle fade-in, sits behind gameplay
      if (!playing) { playing = true; step = 0; pickTrackForGroup(); schedule(); }
    } catch (e) { /* audio unsupported, fine */ }
  }
  function stop() {
    if (!playing) return;
    try {
      if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); }
    } catch (e) {}
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
  }
  return {
    start, stop,
    get on() { return on; },
    get nowPlaying() { const list = PLAYLIST[group] || []; return list[(trackIdx - 1 + list.length) % list.length]; },
    // Skip to the next track in the current playlist (for a "next track" button)
    skip() { if (playing) { pickTrackForGroup(); step = 0; } },
    toggle(currentMood) {
      on = !on; localStorage.bp_music = on ? '1' : '0';
      if (on) start(currentMood); else stop();
      return on;
    }
  };
})();

// ======================= voice (read-aloud) =======================
const Voice = (() => {
  let pref = localStorage.bp_autoread; // '1' on, '0' off, undefined = smart default
  // Pick the most natural-sounding voice the device offers. Modern browsers ship true
  // neural voices ("Natural"/"Neural"/"Online") that sound far less robotic than the old
  // built-ins, so we score every available voice and take the best rather than the first.
  let _voiceCache = {};
  function bestVoice(lang) {
    if (_voiceCache[lang || 'en']) return _voiceCache[lang || 'en'];
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    const base = (lang || 'en').split('-')[0].toLowerCase();
    const pool = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(base));
    if (!pool.length) return null;
    const score = v => {
      const n = (v.name || '').toLowerCase(); let s = 0;
      if (/natural|neural|online/.test(n)) s += 100;              // true neural TTS = most natural
      if (/enhanced|premium|siri/.test(n)) s += 60;               // enhanced Apple/iOS voices
      if (/aria|jenny|ava|emma|libby|sonia|samantha|serena|allison|nicky|zoe|joanna|salli/.test(n)) s += 40; // known warm, friendly voices
      if (/google/.test(n)) s += 25;
      if (/female/.test(n)) s += 12;
      // Accent: strongly prefer American English and steer AWAY from British/Australian/
      // Indian/South-African voices when the app asked for en-US (parents flagged a
      // British-sounding narrator). Region match matters more than a nice voice name.
      if (v.lang) {
        const vl = v.lang.toLowerCase(), want = (lang || '').toLowerCase();
        if (vl === want) s += 70;                                  // exact (en-US) wins big
        else if (want.startsWith('en') && /en[-_](gb|au|in|za|ie|nz)/.test(vl)) s -= 90; // wrong English accent
        else if (want.startsWith('en') && vl.startsWith('en')) s += 8;
      }
      if (/\b(uk|british|daniel|arthur|kate|serena|oliver|george|rishi|malcolm|karen|catherine|matilda|lee)\b/.test(n) && (lang || '').toLowerCase().startsWith('en-us')) s -= 60; // named UK/AU voices
      // Spanish lessons deserve a real native voice, not an English voice reading Spanish.
      // Reward known-good Spanish voices and neural Spanish, and gently favor the mainstream
      // Latin-American / Castilian accents US learners hear in class.
      if ((lang || '').toLowerCase().startsWith('es')) {
        const vlx = (v.lang || '').toLowerCase();
        if (/spanish|espa|mónica|monica|paulina|jorge|juan|diego|sabina|helena|dalia|elena|laura|lucia|lucía|penelope|penélope|miguel|carlos|marisol|angelica|angélica/.test(n)) s += 45;
        if (/es[-_](es|mx|us|419|la|co|ar)/.test(vlx)) s += 22;    // native Spanish accents
        if (/google.*(español|espanol)|español|espanol/.test(n)) s += 30;
      }
      if (v.localService === false) s += 30;                       // networked = the consistent neural voices
      if (/robot|zarvox|albert|bad ?news|bells|trinoids|whisper|cellos|organ|good ?news|jester|superstar|boing|bahh|bubbles|deranged|hysterical|wobble|pipe/.test(n)) s -= 200; // novelty/robotic voices
      return s;
    };
    const best = pool.slice().sort((a, b) => score(b) - score(a))[0] || pool[0];
    _voiceCache[lang || 'en'] = best;
    return best;
  }
  // voices load asynchronously on some browsers; clear the cache when they arrive
  try { speechSynthesis.addEventListener('voiceschanged', () => { _voiceCache = {}; }); } catch (e) {}
  function speak(text, lang) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[🍎⭐🐤🎈🚗🐞🍓🐟🍪🐸\u{1F300}-\u{1FAFF}]/gu, ''));
      // Little kids get a bouncy, upbeat storyteller voice; teens get a calm natural one.
      const young = (() => { try { return State.me && State.me.kid && State.me.kid.grade <= 5; } catch (e) { return false; } })();
      // Warm and clear, not chipmunky. A gentle lift for littles, natural for older kids.
      u.rate = young ? 0.95 : 1.0;
      u.pitch = young ? 1.1 : 1.0;
      u.volume = 1;
      if (lang) u.lang = lang;
      const v = bestVoice(lang || 'en-US');
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* voice unsupported, fine */ }
  }
  function currentAuto() {
    // Kindergarten pre-readers can't start on their own, so read-aloud defaults ON for
    // them (a 5-year-old shouldn't need a parent to press play). Everyone else stays
    // opt-in, since TTS quality varies by device and parents rely on no surprise audio.
    if (pref === '1') return true;
    if (pref === '0') return false;
    try { return !!(State.me && State.me.kid && (State.me.kid.grade || 0) <= 0); } catch (e) { return false; }
  }
  // Read-along storytime: narrate a passage while highlighting each word as it's
  // spoken. Perfect for the littles learning to read. Falls back to plain speak
  // if the browser doesn't fire boundary events.
  function readAlong(container, lang) {
    try {
      speechSynthesis.cancel();
      const spans = [...container.querySelectorAll('.pw')];
      const text = spans.map(s => s.textContent).join(' ');
      const u = new SpeechSynthesisUtterance(text);
      const young = (() => { try { return State.me && State.me.kid && State.me.kid.grade <= 5; } catch (e) { return false; } })();
      u.rate = young ? 0.9 : 0.97; u.pitch = young ? 1.1 : 1.0; u.volume = 1;
      if (lang) u.lang = lang;
      const v = bestVoice(lang || 'en-US'); if (v) u.voice = v;
      // Map character offsets → word index for highlighting
      const starts = []; let pos = 0;
      spans.forEach(s => { starts.push(pos); pos += s.textContent.length + 1; });
      let last = -1;
      const clear = () => spans.forEach(s => s.classList.remove('pw-on'));
      u.onboundary = (ev) => {
        if (ev.name && ev.name !== 'word') return;
        let idx = 0; for (let i = 0; i < starts.length; i++) { if (ev.charIndex >= starts[i]) idx = i; else break; }
        if (idx !== last) { clear(); if (spans[idx]) spans[idx].classList.add('pw-on'); last = idx; }
      };
      u.onend = clear; u.onerror = clear;
      container.classList.add('reading');
      const done = () => container.classList.remove('reading');
      u.addEventListener('end', done); u.addEventListener('error', done);
      speechSynthesis.speak(u);
    } catch (e) { /* unsupported, fine */ }
  }
  return {
    speak, readAlong,
    get auto() { return currentAuto(); },
    toggleAuto() { const next = !currentAuto(); pref = next ? '1' : '0'; localStorage.bp_autoread = pref; return next; }
  };
})();
// Render a passage into word-spans so read-along can highlight each word.
function passageHTML(passage, playful) {
  const words = String(passage).split(/\s+/).map((w, i) => `<span class="pw" data-i="${i}">${esc(w)}</span>`).join(' ');
  return `<div class="passage-box"><div class="passage-head"><span class="passage-tag">📖 ${playful ? 'Storytime' : 'Read the passage'}</span>
    <button class="btn sun small passage-read" type="button">🔊 ${playful ? 'Read to me' : 'Read aloud'}</button></div>
    <div class="passage-words">${words}</div></div>`;
}

// ======================= confetti =======================
const Confetti = (() => {
  const canvas = $('#confetti-canvas'), ctx2 = canvas.getContext('2d');
  let parts = [], raf;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();
  function burst(n = 120) {
    const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#0984E3', '#55EFC4', '#E17055', '#fd79a8'];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35,
        vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 3,
        s: Math.random() * 8 + 4, c: colors[Math.floor(Math.random() * colors.length)],
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, life: 140
      });
    }
    if (!raf) tick();
  }
  function tick() {
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 30);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += .35; p.r += p.vr; p.life--;
      ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.r);
      ctx2.fillStyle = p.c; ctx2.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
      ctx2.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = null; ctx2.clearRect(0, 0, canvas.width, canvas.height); }
  }
  return { burst };
})();

// ======================= state & router =======================
const State = { me: { role: 'guest' }, lesson: null };

async function refreshMe() { State.me = await api('/auth/me'); }

const routes = {};
let _navRetry = null; // {key, n} — transient-failure retry state for the router
function route(name, fn) { routes[name] = fn; }
async function navigate() {
  const hash = location.hash.replace(/^#\/?/, '') || 'landing';
  const [name, ...args] = hash.split('/');
  speechSynthesis && speechSynthesis.cancel();
  document.onkeydown = null;
  document.querySelectorAll('.celebrate').forEach(el => el.remove());
  applyTheme();
  // Background music lives in the FUN zones; lessons & everything else stay quiet.
  const MUSIC_ZONES = ['play', 'avatar', 'snacks', 'trophies', 'buddies', 'game'];
  if (Music.on && MUSIC_ZONES.includes(name)) Music.start(currentMusicMood()); else Music.stop();
  const fn = routes[name] || routes.landing;
  try { await fn(...args); _navRetry = null; } catch (e) {
    if (e.status === 401) { location.hash = State.me.role === 'kid' ? '#kid-login' : '#login'; return; }
    if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
    // Transient failures — the server restarting during a deploy, or a dropped
    // connection — throw a 5xx or a network error (no status). Auto-retry a few
    // times with backoff, then leave a manual "Try Again". A momentary blip should
    // never look like a crash, and should heal itself the moment the server is back.
    const transient = !e.status || e.status >= 500;
    const key = location.hash;
    if (!_navRetry || _navRetry.key !== key) _navRetry = { key, n: 0 };
    const goHome = State.me.role === 'kid' ? '#home' : '#';
    const retryNow = () => { _navRetry.n++; navigate(); };
    const emoji = transient ? '🐎' : '🙈';
    const title = transient ? 'Reconnecting…' : 'Oops, something hiccuped!';
    const msg = transient ? 'One moment — getting you back on track.' : "Let's try that again.";
    app().innerHTML = topbar(`<div class="container"><div class="card center"><div class="big-emoji">${emoji}</div><h2>${title}</h2><p class="muted">${msg}</p><div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn green" id="nav-retry">↻ Try Again</button><button class="btn ghost" onclick="location.hash='${goHome}'">🏠 Go Home</button></div></div></div>`);
    try { wireChrome(); } catch (_) {}
    const rb = document.getElementById('nav-retry'); if (rb) rb.onclick = () => { try { Sound.click(); } catch (_) {} retryNow(); };
    if (transient && _navRetry.n < 3) setTimeout(retryNow, [1500, 3000, 5000][_navRetry.n] || 5000);
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObs.observe(el));
  });
}
// Any celebration overlay: tapping the backdrop (not a button/link) dismisses it.
// Kids tap everywhere, never let a popup feel stuck.
document.addEventListener('click', e => {
  const cel = e.target.closest('.celebrate');
  if (cel && !e.target.closest('button, a, input, [data-cid], [data-g]')) cel.remove();
});
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.15 });
addEventListener('hashchange', navigate);

// ======================= shared chrome =======================
function topbar(inner = '') {
  const me = State.me;
  const homeHash = me.role === 'kid' ? '#home' : me.role === 'parent' ? '#parent' : '#';
  let right = '';
  if (me.role === 'parent') right = `${me.parent && me.parent.is_admin ? `<button class="btn ghost small" onclick="location.hash='#admin'">🛡️ Admin</button>` : ''}<button class="btn ghost small" onclick="location.hash='#parent'">Dashboard</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else if (me.role === 'kid') {
    // When a child is inside a game, give them a big obvious way back to the Play Zone,
    // so they are never trapped in a game they don't want to be in.
    const inGame = /^#\/?game\//.test(location.hash);
    const exitBtn = inGame ? `<button class="btn coral small" onclick="location.hash='#play'">← Games</button>` : '';
    // If a parent launched this child session, give them a one-tap way back to their
    // own dashboard instead of forcing a full email+password re-login.
    const parentBtn = me.parentReturn ? `<button class="btn ghost small" id="exit-kid-btn" title="Back to your parent dashboard">← Parent</button>` : '';
    right = `${exitBtn}${parentBtn}<button class="btn ghost small" onclick="location.hash='#home'">🏠 Home</button><button class="btn ghost small" onclick="location.hash='#kid-login'" title="Switch to another child">👋 Switch</button><button class="btn ghost small kid-logout" id="logout-btn">Log out</button>`;
  }
  else right = `<button class="btn ghost small" onclick="location.hash='#kid-login'">Child Login</button><button class="btn ghost small" onclick="location.hash='#login'">Parent Login</button><button class="btn sun small" onclick="location.hash='#signup'">Start free trial</button>`;
  return `
  <div class="topbar">
    <div class="logo" onclick="location.hash='${homeHash}'"><img src="/logo-mark.png" alt="Gallop" class="logo-img"> Gallop</div>
    <div class="right">
      ${right}
      <div class="sound-wrap">
        <button class="btn ghost small sound-btn" id="sound-btn" title="Sound settings" aria-label="Sound settings">${Sound.muted && !Music.on ? '🔇' : '🔊'}</button>
        <div class="sound-menu" id="sound-menu" hidden>
          <button class="sound-opt" id="sfx-toggle"><span>🔊 Sound effects</span><span class="sw ${Sound.muted ? '' : 'on'}" id="sfx-sw"></span></button>
          <button class="sound-opt" id="music-toggle"><span>🎵 Background music</span><span class="sw ${Music.on ? 'on' : ''}" id="music-sw"></span></button>
          <button class="sound-opt sound-skip" id="music-skip"><span>⏭️ Next track</span><span class="muted" style="font-size:.78rem">shuffle</span></button>
        </div>
      </div>
    </div>
  </div>${inner}`;
}
function wireChrome() {
  const sb = $('#sound-btn'), menu = $('#sound-menu');
  if (sb && menu) {
    sb.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
    // Register the outside-click-to-close handler exactly once (wireChrome runs on every
    // render). A persistent handler that no-ops unless a menu is open, rather than a
    // {once:true} listener that fires on the first stray click and then stops working.
    if (!wireChrome._soundCloseWired) {
      document.addEventListener('click', (e) => {
        const m = document.getElementById('sound-menu');
        if (m && !m.hidden && !e.target.closest('.sound-wrap')) m.hidden = true;
      });
      wireChrome._soundCloseWired = true;
    }
    const sfxSw = $('#sfx-sw'), musicSw = $('#music-sw');
    $('#sfx-toggle').onclick = (e) => { e.stopPropagation(); const muted = Sound.toggle(); sfxSw.classList.toggle('on', !muted); if (!muted) Sound.click(); sb.textContent = (Sound.muted && !Music.on) ? '🔇' : '🔊'; };
    $('#music-toggle').onclick = (e) => { e.stopPropagation(); const isOn = Music.toggle(currentMusicMood()); musicSw.classList.toggle('on', isOn); sb.textContent = (Sound.muted && !Music.on) ? '🔇' : '🔊'; };
    const skip = $('#music-skip');
    if (skip) skip.onclick = (e) => { e.stopPropagation(); if (!Music.on) { Music.toggle(currentMusicMood()); if ($('#music-sw')) $('#music-sw').classList.add('on'); } else { Music.skip(); } };
  }
  const lb = $('#logout-btn');
  if (lb) lb.onclick = async () => { await api('/auth/logout', { method: 'POST' }); await refreshMe(); location.hash = '#'; };
  const xk = $('#exit-kid-btn');
  if (xk) xk.onclick = async () => {
    try { await api('/auth/exit-kid', { method: 'POST' }); await refreshMe(); location.hash = '#parent'; }
    catch (e) { location.hash = '#login'; }
  };
  // Accessibility: the kid nav tiles are <div>s. Make them real buttons for keyboard
  // and screen-reader users (focusable + role + label). Enter/Space is handled globally.
  upgradeTiles();
}
// Callable separately after any DYNAMIC tile injection (e.g. kid-login avatar list).
function upgradeTiles() {
  document.querySelectorAll('.subject-card, .zone-card, .up-next, .avatar-opt').forEach(el => {
    if (el.getAttribute('role') === 'button') return;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    if (!el.getAttribute('aria-label')) {
      const label = (el.getAttribute('title') || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (label) el.setAttribute('aria-label', label.slice(0, 90));
    }
  });
}
// One global keyboard bridge: Enter/Space activates any role="button" that isn't a
// native control (covers all the div-based tiles upgraded in wireChrome).
if (!window._kbButtonsWired) {
  window._kbButtonsWired = true;
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const t = e.target.closest && e.target.closest('[role="button"]');
    if (!t) return;
    if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
    e.preventDefault();
    t.click();
  });
}
// Older learners get the chill lo-fi vibe; the littles get a brighter playful loop.
function currentMusicMood() {
  try { const k = State.me && State.me.kid; return (k && k.grade >= 6) ? 'chill' : 'playful'; } catch (e) { return 'chill'; }
}
function showError(id, msg) { const el = $(id); if (el) { el.textContent = msg; el.classList.add('show'); } }

// ======================= landing =======================
route('landing', async () => {
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  app().innerHTML = topbar(`
  <div class="hero">
    <img src="/logo-full.png" alt="Gallop Learning Academy" class="hero-logo">
    <div class="eyebrow">Adaptive K–12 Tutoring · Math · English · Science · Spanish</div>
    <h1>A personal tutor for every child, at every level.</h1>
    <p class="hero-tagline">Every child has a pace. Gallop finds it.</p>
    <p>Self-paced lessons in Math, English, Science &amp; Spanish that find your child's real level and adapt to every answer — on any device, no scheduling.</p>
    <div class="hero-cta">
      <button class="btn hero-primary" onclick="location.hash='${State.me.role === 'parent' ? '#parent' : '#signup'}'">Start your 7-day free trial</button>
      <div class="hero-cta-row">
        <button class="btn ghost" onclick="location.hash='#demo'">Try a sample lesson</button>
        <button class="btn ghost" onclick="location.hash='#kid-login'">Student sign-in</button>
      </div>
      <p class="hero-cta-note muted">No credit card to start · Cancel anytime</p>
    </div>
    <div class="hero-journey"><img src="/journey-green.png" alt="" class="journey-img"></div>
  </div>
  <div class="container">
    <div class="statband reveal">
      <div><b>K–12</b><span>Every grade level</span></div>
      <div><b>4</b><span>Core subjects</span></div>
      <div><b>200+</b><span>Skill areas</span></div>
      <div><b>156</b><span>Guided lessons</span></div>
      <div><b>3,400+</b><span>Expert-verified questions</span></div>
    </div>
    <h2 class="section-title reveal">How it works</h2>
    <p class="section-sub">The same three moves a good teacher makes, built into every session.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">STEP 01 · PLACE</div><h3>Find the true starting line</h3><p>A short assessment measures each subject on its own. A child who reads well but finds math harder starts in the right spot for each, not somewhere in the middle.</p></div>
      <div class="feature reveal"><div class="fnum">STEP 02 · ADAPT</div><h3>Adjust with every answer</h3><p>Skills a child has down get harder and go deeper. The shaky ones slow down, with easier questions, clearer hints, and more practice. It happens quietly, so nobody feels singled out.</p></div>
      <div class="feature reveal"><div class="fnum">STEP 03 · PROGRESS</div><h3>Prove it, then move up</h3><p>A child only advances a grade after showing they can do the whole thing, not after a lucky streak. You see the letter grades, the strengths, and the spots that need work. Certificates mark the real milestones.</p></div>
    </div>
    <h2 class="section-title reveal">Lessons, not just questions</h2>
    <p class="section-sub">Before a child practices a skill, Gallop teaches it. Short guided lessons that explain the idea the way the teacher you still remember would have, then hand it over.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">SEE IT</div><h3>Pictures do the explaining</h3><p>A pizza sliced into fourths for fractions. Rows and columns for times tables. Earth turning toward the sun for day and night. The idea shows up on the screen, not just in a sentence.</p></div>
      <div class="feature reveal"><div class="fnum">HEAR IT</div><h3>Every lesson reads aloud</h3><p>A child who learns by ear hears the concept and the worked example spoken, at their own pace, as many times as they want. Nobody gets left behind by the reading.</p></div>
      <div class="feature reveal"><div class="fnum">DO IT</div><h3>You try it before you move on</h3><p>The lesson will not continue until the child does it themselves: shading a fraction, building a number, sorting the words. Kids who learn by doing finally get to.</p></div>
    </div>
    <p class="section-sub reveal" style="margin-top:6px">Each lesson leans on a comparison a kid already gets, so the idea sticks. Fractions are fair shares. The main idea is the umbrella every sentence hides under. Ser and estar are a name tag versus a mood ring.</p>
    <h2 class="section-title reveal">We're raising critical thinkers</h2>
    <p class="section-sub">Every kid eventually asks "when will I ever use this?" We answer that on the questions themselves, and keep an eye on the adult they're becoming.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">GRADES K–5</div><h3>Little entrepreneurs</h3><p>Second-grade addition turns into running a lemonade stand: buy the supplies, set a price, count what's left over. It stops feeling like a worksheet and starts feeling like the actual world.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 6–8</div><h3>Real decisions</h3><p>Percentages show up as sale prices and interest. Reading turns into spotting a shaky argument. Science becomes a habit of testing a claim before believing it.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 9–12</div><h3>Future founders and investors</h3><p>Teenagers run a pretend portfolio in our stock-market game, follow the news, and weigh risk. Algebra becomes the math behind a margin. An essay becomes a pitch. School starts to feel like a head start.</p></div>
    </div>
    <h2 class="section-title reveal">See where it's all heading</h2>
    <p class="section-sub">As your child works, Gallop picks up on what they're good at and shows it to you. By the high school years, those strengths turn into real career directions with a clear sense of what to focus on next.</p>
    <div class="lp-career reveal">
      <div class="lp-career-panel">
        <div class="lp-career-badge">Career Pathways · a parent's view</div>
        <div class="lp-strength"><span class="lp-s-name">🔬 Science</span><span class="lp-s-bar"><i style="width:82%;background:#2f78c2"></i></span><b>82</b></div>
        <div class="lp-strength"><span class="lp-s-name">🔢 Math</span><span class="lp-s-bar"><i style="width:76%;background:#5b5bd6"></i></span><b>76</b></div>
        <div class="lp-strength"><span class="lp-s-name">📚 English</span><span class="lp-s-bar"><i style="width:61%;background:#0f9d76"></i></span><b>61</b></div>
        <div class="lp-strength"><span class="lp-s-name">🌎 Spanish</span><span class="lp-s-bar"><i style="width:44%;background:#d26440"></i></span><b>44</b></div>
        <div class="lp-paths">
          <div class="lp-path">⚙️ <b>Engineering</b> <span>81% match</span></div>
          <div class="lp-path">🩺 <b>Medicine & Health</b> <span>78% match</span></div>
          <div class="lp-path">💻 <b>Computer Science & AI</b> <span>74% match</span></div>
        </div>
      </div>
      <div class="lp-career-copy">
        <h3>Strengths, growth areas, and a plan</h3>
        <p>Every report tells you, in plain language, where your child is doing well and where they could use more practice. Once they reach high school, it starts suggesting career directions that fit how they're actually performing, along with the classes and projects worth pursuing.</p>
        <ul class="lp-check">
          <li>It grows with the student: a light preview for the younger kids, a real plan for teenagers.</li>
          <li>Fourteen career paths spanning STEM, business, healthcare, law, and the arts.</li>
          <li>It updates on its own as your child learns, so there's nothing to keep track of.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title reveal">A home for accelerated learners</h2>
    <p class="section-sub">The kids who race ahead don't hit a ceiling here. Gallop has a separate Advanced Track that goes past grade level into college-level and honors work — real challenge, on demand, all year long.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">ADVANCED PLACEMENT</div><h3>College-level AP practice</h3><p>Exam-style sets for AP Calculus, Statistics, Biology, Chemistry, Physics, Environmental Science, English Language, English Literature, and Spanish.</p></div>
      <div class="feature reveal"><div class="fnum">HONORS &amp; BEYOND</div><h3>Push past the standard track</h3><p>Honors-level Precalculus, Spanish, and more for students who have already mastered their grade and want to keep climbing.</p></div>
      <div class="feature reveal"><div class="fnum">EXAM READY</div><h3>Aligned to the real tests</h3><p>Practice matched to the tests that count — AP-style sets, honors work, and state test prep in math, science, and English built on rigorous state standards.</p></div>
    </div>
    <p class="section-sub reveal" style="margin-top:6px">The Advanced Track is its own space, so working ahead never disturbs a child's grade-level placement or Gallop Score. And the core high-school math ladder now runs pre-algebra, algebra, geometry, trigonometry, pre-calculus, calculus, and statistics.</p>

    <h2 class="section-title reveal">The curriculum</h2>
    <p class="section-sub">Every idea is taught through something real: money, sports, cooking, travel, and the technology kids already use.</p>
    <div class="subject-strip">
      <div class="sub reveal" style="background:var(--math)"><h4>Mathematics</h4><p>Counting all the way through calculus and statistics, with an advanced track for accelerated students. Lemonade-stand arithmetic, sale-rack percentages, and the functions behind a roller coaster.</p></div>
      <div class="sub reveal" style="background:var(--english)"><h4>English</h4><p>Phonics through rhetoric and college-level analysis. Reading that builds thinkers and grammar that builds writers.</p></div>
      <div class="sub reveal" style="background:var(--science)"><h4>Science</h4><p>The five senses through chemistry and physics. Why a mirror fogs, why a soda can sweats, and how a vaccine trains the body.</p></div>
      <div class="sub reveal" style="background:var(--spanish)"><h4>Spanish</h4><p>First greetings toward real fluency. Order in a Madrid café by month two, because conversation comes before conjugation.</p></div>
    </div>
    <h2 class="section-title reveal">Built for families</h2>
    <div class="feature-grid">
      <div class="feature reveal"><h3>An experience that grows up</h3><p>A first grader gets big friendly type and read-along storytime, where the words light up as they are read out loud. A teenager gets 15-minute focus sessions and quiet background music in a clean study space. It is the same engine underneath, dressed for a different age.</p></div>
      <div class="feature reveal"><h3>A trophy case worth chasing</h3><p>There are 33 badges to collect across six categories, a rank ladder that climbs from Foal to Thoroughbred, and progress bars that always show the next goal. Certificates mark each grade level a child finishes.</p></div>
      <div class="feature reveal"><h3>Motivation that makes sense</h3><p>Daily quests, streaks, a built-in learning arcade, and a coin-powered Snack Shack where a child's avatar actually eats the treats they buy. There are 48 characters to unlock, from astronauts to unicorns. Play is the reward and learning is what earns it.</p></div>
      <div class="feature reveal"><h3>Sound that was actually made for it</h3><p>Eight original soundtracks are built in, a calmer set for teenagers and brighter tunes for the younger kids, with a single tap to turn it all off. None of it is stock audio.</p></div>
      <div class="feature reveal"><h3>Safe by design</h3><p>Children can only connect with buddies a parent approves. They send pre-written cheers, race each other's high scores, and team up on weekly goals where both kids win. There is no open chat and no way for strangers to reach them.</p></div>
      <div class="feature reveal"><h3>Proof for the fridge</h3><p>Printable certificates, a one-page weekly summary, a two-week activity chart, per-skill progress bars, a spreadsheet export, and the strengths and career insights. You will always know how it is going.</p></div>
    </div>

    <div class="arcade-band reveal">
      <div class="ab-head">
        <span class="ab-kicker">ONLY ON GALLOP</span>
        <h2>The arcade where practice pays</h2>
        <p>Every 5 correct answers earns a play token — and the games aren't a break from learning, they're learning in disguise. Retro 16-bit games our team built from scratch, teaching skills most kids never get in school.</p>
      </div>
      <div class="ab-grid">
        <div class="ab-card"><span class="ab-emoji">📈</span><b>Market Mogul</b><p>Grow $1,000 on the Gallop Stock Exchange — read the news, weigh risk, learn how investing actually works.</p><span class="ab-tag">real-world money</span></div>
        <div class="ab-card"><span class="ab-emoji">🍋</span><b>Lemonade Tycoon</b><p>Buy smart, price right, watch the weather. Revenue, cost, and profit — a first business before age 10.</p><span class="ab-tag">entrepreneurship</span></div>
        <div class="ab-card"><span class="ab-emoji">🧁</span><b>Bakery Quest</b><p>Run a bakery for a day: batches, pricing, making change. Math with money on the line.</p><span class="ab-tag">business math</span></div>
        <div class="ab-card"><span class="ab-emoji">🤖</span><b>Code Quest</b><p>Program a robot step by step to reach the star — first coding logic, no typing needed.</p><span class="ab-tag">coding</span></div>
      </div>
      <p class="ab-more">+ Lightning Round, Word Search, Memory Match & Art Studio — eight games, all earned by learning.</p>
    </div>

    <h2 class="section-title reveal">Why families choose Gallop</h2>
    <p class="section-sub">Gallop is newly launched, so we would rather show you what it does than put words in a parent's mouth. Here is what you get from day one.</p>
    <div class="quote-grid">
      <figure class="quote-card reveal">
        <blockquote>Each subject is placed on its own, so a child who reads ahead but finds math harder starts in the right spot for both, not somewhere in the middle.</blockquote>
        <figcaption><span class="q-name">Placed per subject</span><span class="q-detail">Math · English · Science · Spanish</span></figcaption>
      </figure>
      <figure class="quote-card reveal">
        <blockquote>Coins, badges, an arcade, and a Snack Shack turn practice into something kids come back to, while the real work happens underneath.</blockquote>
        <figcaption><span class="q-name">Built to keep them going</span><span class="q-detail">Play is the reward</span></figcaption>
      </figure>
      <figure class="quote-card reveal">
        <blockquote>A one-page weekly summary tells you, in plain language, where your child is ahead and where they are stuck, across all four subjects.</blockquote>
        <figcaption><span class="q-name">You always know how it is going</span><span class="q-detail">Weekly report & progress</span></figcaption>
      </figure>
    </div>

    <div class="founder-note reveal">
      <div class="founder-emoji"><img src="/logo-mark.png" alt="" class="founder-horse"></div>
      <p>Gallop started at our kitchen table. We're two parents who watched our daughter drift through expensive tutoring — bored, unchallenged, doing worksheets — and decided she deserved better. So we built it ourselves: every subject in one place, teaching her at her level, turning practice into something she actually asks to do. Now we're sharing it with your family. There's no faceless edtech company behind Gallop, just a real family that built this to see their daughter succeed — and would love to see yours succeed too.</p>
    </div>

    <div class="card reveal" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:6px">Simple plans</h2>
      <p class="center muted" style="margin-bottom:20px">Start with a 7-day free trial. No credit card to begin, and you can cancel anytime.</p>
      <p class="center" style="margin:-8px 0 20px;font-weight:600">Centers like Kumon, Sylvan, and Mathnasium tend to run $150 to $200 a month <i>per subject</i>, and a private tutor is often $40 to $80 an hour. Gallop covers all four subjects, all year, for less than a single week at a center.</p>
      <div class="plans">
        <div class="plan"><h3>Solo</h3><div class="price">$34<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">One student · all four subjects · lessons, adaptive tutor & reports</p></div>
        <div class="plan hot"><span class="tag">MOST POPULAR</span><h3>Family</h3><div class="price">$54<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">Up to four students · all subjects · lessons, reports, certificates & buddies</p></div>
      </div>
      <div class="trust-strip">
        <span>🎁 7 days free, no card to start</span>
        <span>↩️ Cancel anytime in one click</span>
        <span>🔒 Payments secured by Stripe</span>
        <span>🚫 No ads, ever · we never sell your data</span>
      </div>
      <div class="compare">
        <div class="compare-head"><span>How Gallop compares to in-person options</span></div>
        <div class="compare-scroll"><table class="compare-table">
          <thead><tr><th></th><th class="us">Gallop</th><th>Learning centers<br><span>(Kumon, Sylvan, Mathnasium)</span></th><th>Private tutor</th></tr></thead>
          <tbody>
            <tr><td>Typical cost</td><td class="us"><b>$34–54 / mo</b></td><td>$150–200 / mo <i>per subject</i></td><td>$40–80 / hour</td></tr>
            <tr><td>All 4 subjects included</td><td class="us">✅</td><td>❌ pay per subject</td><td>❌ usually one</td></tr>
            <tr><td>Adapts to each child</td><td class="us">✅ every answer</td><td>➖ worksheet levels</td><td>✅ if it's a good one</td></tr>
            <tr><td>Teaches the concept first</td><td class="us">✅ guided lessons</td><td>✅ in person</td><td>✅ in person</td></tr>
            <tr><td>Learn anytime, any device</td><td class="us">✅ 24/7</td><td>❌ scheduled visits</td><td>❌ booked sessions</td></tr>
            <tr><td>Progress reports & certificates</td><td class="us">✅ automatic</td><td>➖ periodic</td><td>➖ varies</td></tr>
            <tr><td>Strengths & career insights</td><td class="us">✅ built in</td><td>❌</td><td>❌</td></tr>
            <tr><td>Advanced track for accelerated kids</td><td class="us">✅ AP, Honors & exam prep</td><td>➖ extra program</td><td>➖ varies</td></tr>
            <tr><td>Games, rewards & motivation</td><td class="us">✅ arcade + trophies</td><td>❌</td><td>❌</td></tr>
          </tbody>
        </table></div>
        <p class="muted center" style="font-size:.8rem;margin-top:10px">Learning centers and private tutors meet in person — a different kind of help. This table shows the cost and coverage families weigh when choosing. Pricing reflects commonly published U.S. rates and varies by location.</p>
      </div>
    </div>
    <div class="card reveal faq" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:18px">Questions parents ask</h2>
      <details><summary>Do I need a credit card to start?</summary><p>No. Your first 7 days are free, and you can set up your children and use everything without entering any payment details. We only ask for a card if you choose to continue after the trial.</p></details>
      <details><summary>What does it cost after the trial?</summary><p>Solo is $34 a month for one student, and Family is $54 a month for up to four. Both are billed monthly and include all four subjects, the guided lessons, the adaptive tutor, the games, and the parent reports. Nothing is sold as an add-on.</p></details>
      <details><summary>What ages and subjects does it cover?</summary><p>Every grade from kindergarten through 12th, in Math, English, Science, and Spanish. Each child is placed at their real level in each subject, so a strong reader who finds math harder starts in the right spot for both. High-school math runs all the way through calculus and statistics.</p></details>
      <details><summary>What about kids who are ahead of grade level?</summary><p>They get a separate Advanced Track. Once a student has mastered their grade, they can practice college-level and honors material — AP-style sets in Calculus, Statistics, Biology, Chemistry, Physics, Environmental Science, English, and Spanish, honors courses, and state test prep built on rigorous state standards (great preparation whatever state you're in). It's kept separate from grade-level work, so working ahead never changes a child's placement.</p></details>
      <details><summary>What if my child doesn't like it?</summary><p>The first 7 days are completely free and need no card, so you can let your child try the real thing before you ever pay. If it isn't a fit, do nothing and the trial simply ends — you're never charged. If you've already subscribed, cancel in one click and you keep access through the time you've paid for.</p></details>
      <details><summary>Are there real, human tutors?</summary><p>No — and that's the point. Gallop is self-paced adaptive software your child uses on their own, so there's nothing to schedule and no hourly rate. It teaches each concept with a short guided lesson, then adjusts every question to your child, which is how it covers all four subjects for less than a single week at a tutoring center.</p></details>
      <details><summary>Can I cancel anytime?</summary><p>Yes, in one click from your parent dashboard. Cancelling stops any future charges, and your child keeps access through the time you have already paid for.</p></details>
      <details><summary>Is my child safe, and is our data private?</summary><p>Yes. There are no ads and we never sell your data. Children connect only with buddies you approve, and they can send only pre-written cheers, so there is no open chat and no way for strangers to reach them. Payments run through Stripe, so we never see or store your card number.</p></details>
      <details><summary>What devices does it work on?</summary><p>Any device with a web browser: phone, tablet, laptop, or desktop. There is nothing to install, and progress syncs automatically across devices.</p></details>
      <details><summary>How is this different from a worksheet app or a tutoring center?</summary><p>Gallop teaches each concept with a short guided lesson before the practice, then adapts every question to your child, across all four subjects, for a small fraction of what a tutoring center charges per subject.</p></details>
      <details><summary>How do I get help?</summary><p>Email <a href="mailto:support@learnwithgallop.com">support@learnwithgallop.com</a> or message <a href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">@learnwithgallop</a> on Instagram, and a real person will get back to you.</p></details>
    </div>
  </div>
  <div class="nl-band">
    <b>📬 Learning tips & Gallop news</b>
    <p class="muted" style="margin:4px 0 10px">One short, useful email now and then. No spam, unsubscribe anytime.</p>
    <form class="nl-form" id="nl-form"><input type="email" id="nl-email" placeholder="you@example.com" required aria-label="Email address"><button class="btn green" type="submit">Sign me up</button></form>
    <p id="nl-done" style="display:none;font-weight:700;color:var(--brand);margin-top:8px">🎉 You're on the list!</p>
  </div>
  <div class="site-footer">© ${new Date().getFullYear()} Gallop Learning Academy · Adaptive tutoring for grades K–12<br>
    <a class="ig-link" href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">Follow along on Instagram at @learnwithgallop</a><br>
    <a href="mailto:support@learnwithgallop.com" style="color:inherit;opacity:.8">support@learnwithgallop.com</a> · <a href="/terms" style="color:inherit;opacity:.8">Terms of Service</a> · <a href="/privacy" style="color:inherit;opacity:.8">Privacy Policy</a>
  </div>`);
  wireChrome();
  const nlF = $('#nl-form');
  if (nlF) nlF.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/newsletter', { method: 'POST', body: { email: $('#nl-email').value } });
      nlF.style.display = 'none'; $('#nl-done').style.display = 'block';
    } catch (err) { toast(err.message || 'Hmm, that didn\'t go through — try again?'); }
  };
});

// ======================= legal =======================
function legalPage(title, bodyHTML) {
  app().innerHTML = topbar(`<div class="container" style="max-width:760px">
    <div class="card" style="line-height:1.7">
      <h2>${title}</h2>
      <p class="muted" style="margin:6px 0 18px">Last updated: July 19, 2026 · Gallop Learning Academy is operated by Lotus Farms LLC.</p>
      ${bodyHTML}
      <p style="margin-top:22px"><button class="btn ghost small" style="color:var(--brand);border-color:var(--brand)" onclick="location.hash='#'">← Back to home</button></p>
    </div></div>`);
  wireChrome();
}
// Legal pages have canonical, crawlable static versions at /terms and /privacy.
// The in-app hash links redirect there so there is a single source of legal truth.
route('terms', async () => { location.replace('/terms'); });
route('privacy', async () => { location.replace('/privacy'); });


// ======================= demo lesson (no signup!) =======================
const DEMO_QUESTIONS = [
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 2', skill: 'Money Math',
    prompt: 'You buy a snack for 65¢ and pay with $1. How much change do you get?', choices: ['35¢', '45¢', '25¢', '65¢'], answer: 0,
    hint: 'Count up from 65 to 100.', explain: '100 − 65 = 35. You get 35¢ back.', why: 'This is how you make sure you get the right change at the store! 🪙' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 3', skill: 'Word Detective',
    prompt: 'The dog was ENORMOUS, it barely fit through the door! Enormous means…', choices: ['very big', 'very loud', 'very furry', 'very fast'], answer: 0,
    hint: 'It barely FIT through the door.', explain: 'Enormous = huge, giant, very big!', why: 'Knowing lots of words helps you say exactly what you mean!' },
  { subject: 'science', emoji: '🔬', color: '#1a9e63', grade: 'Grade 2', skill: 'States of Matter',
    prompt: 'The bathroom mirror fogs up during a hot shower. That fog comes from water turning into a…', choices: ['gas, then back to tiny drops', 'solid', 'rock', 'rainbow'], answer: 0,
    hint: 'Steam rises from hot water…', explain: 'Hot water evaporates into vapor (a gas), then condenses on the cool mirror!', why: 'Chefs use this science, heat, mixing, freezing, every time they cook! 👩‍🍳' },
  { subject: 'spanish', emoji: '🌎', color: '#d4522a', grade: 'Beginner', skill: 'Los Colores',
    prompt: 'A stop sign is "rojo". Rojo means…', choices: ['red', 'blue', 'round', 'stop'], answer: 0,
    hint: 'What color is a stop sign?', explain: '¡Sí! Rojo = red.', why: 'Over 500 million people speak Spanish, that\'s a lot of new friends! 🌎' },
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 5', skill: 'Percent Power',
    prompt: 'A $40 video game is 25% off. What do you pay?', choices: ['$30', '$25', '$35', '$10'], answer: 0,
    hint: '25% of 40 is 10.', explain: '25% of $40 = $10 off → $30.', why: 'Smart shoppers and founders both live in percentages.' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 6', skill: 'Figurative Language',
    prompt: '"I\'ve told you a MILLION times to clean your room!" This is…', choices: ['hyperbole (huge exaggeration)', 'a plain fact', 'a simile (compares with like/as)', 'onomatopoeia (a sound word)'], answer: 0,
    hint: 'Was it really a million?', explain: 'Hyperbole exaggerates for effect.', why: 'Great writers use these tools, and great readers spot them.' }
];
route('demo', async () => {
  let idx = 0, correct = 0;
  function render() {
    if (idx >= DEMO_QUESTIONS.length) {
      Confetti.burst(200); Sound.levelup();
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
        <div class="big-emoji">🐎</div>
        <h2>${correct}/${DEMO_QUESTIONS.length}, and that's just a sample!</h2>
        <p class="muted" style="margin:12px 0 6px">The real tutor goes much further: a placement quiz finds your child's exact level in each subject, every answer adapts what comes next, and correct answers earn tokens for the games arcade.</p>
        <p class="muted" style="margin-bottom:18px">All four subjects. Every grade K–12. From $34/month.</p>
        <button class="btn green" onclick="location.hash='#signup'">Start 7-Day Free Trial →</button>
        <button class="btn sun" style="margin-left:8px" onclick="window.__subscribeIntent=1;location.hash='#signup'">Subscribe now →</button>
        <p class="muted" style="margin-top:10px;font-size:.82rem">Free for 7 days, or subscribe today and skip the wait. Either way you can cancel anytime.</p>
        <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-top:8px" onclick="location.hash='#'">Back</button>
      </div></div>`);
      wireChrome();
      return;
    }
    const qn = DEMO_QUESTIONS[idx];
    let answered = false;
    // Shuffle so the correct answer isn't always the first choice (looks rigged otherwise).
    const correctText = qn.choices[qn.answer];
    const shuffled = qn.choices.slice();
    for (let z = shuffled.length - 1; z > 0; z--) { const j = Math.floor(Math.random() * (z + 1));[shuffled[z], shuffled[j]] = [shuffled[j], shuffled[z]]; }
    const ansIdx = shuffled.indexOf(correctText);
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top"><b>${qn.emoji} Sample lesson, see how Gallop teaches</b>${gallopTrack(idx / DEMO_QUESTIONS.length * 100)}<b>${idx + 1}/${DEMO_QUESTIONS.length}</b></div>
      <div class="q-card">
        <span class="q-skill" style="background:${qn.color}">${esc(qn.skill)} · ${esc(qn.grade)}</span>
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${shuffled.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint)}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#'">Exit demo</button>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const ok = i === ansIdx;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) { const _ar = document.querySelectorAll('.choice')[ansIdx]; if (_ar) _ar.classList.add('answer-reveal'); }
      const fb = $('#feedback');
      if (ok) { correct++; Sound.correct(); Confetti.burst(40); fb.className = 'feedback good'; }
      else { Sound.wrong(); fb.className = 'feedback bad'; }
      fb.innerHTML = `<b>${ok ? 'Nailed it!' : 'Almost!'}</b> ${esc(qn.explain)}<div class="why-line">🌍 <b>Real world:</b> ${esc(qn.why)}</div>`;
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); idx++; render(); };
    });
  }
  render();
});

// ======================= parent signup/login =======================
route('signup', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Create your family account 👨‍👩‍👧</h2>
      <label>Your name</label><input id="f-name" placeholder="e.g. Steve">
      <label>Email</label><input id="f-email" type="email" placeholder="you@example.com">
      <label>Password (8+ characters)</label><input id="f-pass" type="password">
      <div class="error-msg" id="f-err"></div>
      <button class="btn green" style="margin-top:18px;width:100%" id="f-go">Start Free Trial →</button>
      <p class="muted center" style="margin-top:10px;font-size:.85rem">7 days free · No credit card required · Cancel anytime</p>
      <p class="muted center" style="margin-top:10px">Already have an account? <a href="#login">Log in</a></p>
      <p class="muted center" style="margin-top:8px;font-size:.8rem">By signing up you agree to our <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
    </div></div>`);
  wireChrome();
  $('#f-go').onclick = async () => {
    try {
      await api('/auth/signup', { method: 'POST', body: { name: $('#f-name').value, email: $('#f-email').value, password: $('#f-pass').value } });
      await refreshMe(); Sound.levelup(); State.onboard = true;
      // Came from "Subscribe now"? Take them straight to plan choice instead of the trial.
      if (window.__subscribeIntent) { window.__subscribeIntent = 0; location.hash = '#parent'; setTimeout(() => { const b = $('#sub-family') || $('#tb-family'); if (b) { b.scrollIntoView({ behavior: 'smooth', block: 'center' }); b.classList.add('pulse'); } }, 400); }
      else location.hash = '#parent';
    } catch (e) { showError('#f-err', e.message); }
  };
});

route('login', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Parent login 🔐</h2>
      <label>Email</label><input id="f-email" type="email">
      <label>Password</label><input id="f-pass" type="password">
      <div class="error-msg" id="f-err"></div>
      <button class="btn" style="margin-top:18px;width:100%" id="f-go">Log In →</button>
      <p class="muted center" style="margin-top:12px"><a href="#forgot">Forgot password?</a></p>
      <p class="muted center" style="margin-top:4px">New here? <a href="#signup">Create an account</a> · <a href="#kid-login">Kid login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    try {
      await api('/auth/login', { method: 'POST', body: { email: $('#f-email').value, password: $('#f-pass').value } });
      await refreshMe(); location.hash = '#parent';
    } catch (e) { showError('#f-err', e.message); }
  };
  $('#f-go').onclick = go;
  $('#f-pass').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= forgot password =======================
route('forgot', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Reset your password 🔐</h2>
      <p class="muted" style="margin:6px 0 14px">Enter your account email and we'll send you a link to set a new password.</p>
      <label>Email</label><input id="fg-email" type="email" autocomplete="email">
      <div class="error-msg" id="fg-err"></div>
      <button class="btn" style="margin-top:16px;width:100%" id="fg-go">Send reset link →</button>
      <div id="fg-done" style="display:none;margin-top:14px;padding:12px 14px;background:#e2f8f1;color:#0c6b53;border-radius:12px;font-weight:600"></div>
      <p class="muted center" style="margin-top:12px"><a href="#login">← Back to login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    const btn = $('#fg-go'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await api('/auth/forgot', { method: 'POST', body: { email: $('#fg-email').value } });
      $('#fg-done').style.display = 'block';
      $('#fg-done').textContent = '✓ ' + (r.message || 'If that email has an account, a reset link is on its way. Check your inbox (and spam).');
      btn.style.display = 'none';
    } catch (e) { showError('#fg-err', e.message); btn.disabled = false; btn.textContent = 'Send reset link →'; }
  };
  $('#fg-go').onclick = go;
  $('#fg-email').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= reset password (from emailed link #reset/<token>) =======================
route('reset', async (token) => {
  app().innerHTML = topbar(`<div class="container" style="max-width:460px">
    <div class="card">
      <h2>Choose a new password 🔑</h2>
      <p class="muted" style="margin:6px 0 14px">Almost done — pick a new password (8+ characters).</p>
      <label>New password</label><input id="rs-pass" type="password" autocomplete="new-password">
      <label>Confirm new password</label><input id="rs-pass2" type="password" autocomplete="new-password">
      <div class="error-msg" id="rs-err"></div>
      <button class="btn green" style="margin-top:16px;width:100%" id="rs-go">Set new password →</button>
      <p class="muted center" style="margin-top:12px"><a href="#login">← Back to login</a></p>
    </div></div>`);
  wireChrome();
  const go = async () => {
    const pw = $('#rs-pass').value, pw2 = $('#rs-pass2').value;
    if (pw.length < 8) { showError('#rs-err', 'Password needs at least 8 characters.'); return; }
    if (pw !== pw2) { showError('#rs-err', 'The two passwords don\'t match.'); return; }
    const btn = $('#rs-go'); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await api('/auth/reset', { method: 'POST', body: { token, password: pw } });
      toast('✓ Password updated — you can log in now.');
      location.hash = '#login';
    } catch (e) { showError('#rs-err', e.message); btn.disabled = false; btn.textContent = 'Set new password →'; }
  };
  $('#rs-go').onclick = go;
  $('#rs-pass2').addEventListener('keydown', e => e.key === 'Enter' && go());
});

// ======================= kid login =======================
route('kid-login', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:520px">
    <div class="card center">
      <div class="big-emoji">🚀</div>
      <h2>Launch Pad</h2>
      <p class="muted">Ask a grown-up for the family email the first time!</p>
      <label style="text-align:left">Family email</label><input id="k-email" type="email" value="${esc(localStorage.bp_family_email || '')}">
      <button class="btn" style="margin-top:14px" id="k-find">Find My Family →</button>
      <div class="error-msg" id="k-err"></div>
      <div id="k-kids" style="margin-top:18px"></div>
      <div id="k-pin" style="display:none">
        <h3 style="margin-top:10px">Enter your secret PIN 🤫</h3>
        <div class="pin-dots" id="pin-dots"></div>
        <div class="pinpad" id="pinpad"></div>
      </div>
    </div></div>`);
  wireChrome();
  let chosenKid = null, pin = '';
  $('#k-find').onclick = async () => {
    try {
      const email = $('#k-email').value;
      const { kids } = await api('/auth/family-kids?email=' + encodeURIComponent(email));
      localStorage.bp_family_email = email;
      if (!kids.length) return showError('#k-err', 'No learners yet, ask your parent to add you!');
      $('#k-kids').innerHTML = '<h3>Who are you?</h3><div class="avatar-pick" style="margin-top:10px">' +
        kids.map(k => `<div class="avatar-opt" data-id="${k.id}" title="${esc(k.name)}">${k.avatar_img ? avatarHTML(k) : (AVATARS[k.avatar] || '🦊')}<div style="font-size:.8rem;font-weight:700">${esc(k.name)}</div></div>`).join('') + '</div>';
      upgradeTiles();
      document.querySelectorAll('.avatar-opt').forEach(el => el.onclick = () => {
        document.querySelectorAll('.avatar-opt').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel'); chosenKid = el.dataset.id; pin = '';
        $('#k-pin').style.display = 'block'; drawPin(); Sound.click();
      });
    } catch (e) { showError('#k-err', e.message); }
  };
  function drawPin() {
    $('#pin-dots').textContent = '●'.repeat(pin.length) + '○'.repeat(4 - pin.length);
    $('#pinpad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k =>
      `<button class="pinkey" data-k="${k}">${k}</button>`).join('');
    document.querySelectorAll('.pinkey').forEach(b => b.onclick = async () => {
      const k = b.dataset.k; Sound.click();
      if (k === '⌫') pin = pin.slice(0, -1);
      else if (k === '✓') return tryLogin();
      else if (pin.length < 4) pin += k;
      $('#pin-dots').textContent = '●'.repeat(pin.length) + '○'.repeat(4 - pin.length);
      if (pin.length === 4) tryLogin();
    });
  }
  async function tryLogin() {
    try {
      await api('/auth/kid-login', { method: 'POST', body: { email: $('#k-email').value, kidId: chosenKid, pin } });
      await refreshMe(); Sound.levelup(); Confetti.burst(60); location.hash = '#home';
    } catch (e) { pin = ''; drawPin(); showError('#k-err', e.message); Sound.wrong(); }
  }
});

// ======================= kid home =======================
route('home', async () => {
  if (State.me.role === 'guest') { location.hash = '#kid-login'; return; }
  const kidId = State.me.role === 'kid' ? State.me.kid.id : null;
  if (!kidId) { location.hash = '#parent'; return; }
  const data = await api(`/learn/${kidId}/overview`);
  let quests = null;
  try { quests = await api(`/learn/${kidId}/quests`); } catch (e) { /* non-critical */ }
  const k = data.kid;
  const questCard = quests ? `
    <div class="quest-card ${quests.allDone && !quests.claimed ? 'ready' : ''}">
      <div class="wg-head"><span>${playful() ? '🗺️ Today’s Quests' : 'Daily goals'}</span>
        <span>${quests.claimed ? '✅ Bonus collected!' : quests.allDone ? '🎁 Bonus ready!' : quests.quests.filter(q => q.done).length + '/3 done'}</span></div>
      <div class="quest-list">
        ${quests.quests.map(q => `
          <div class="quest-item ${q.done ? 'done' : ''}">
            <span class="q-check">${q.done ? '✅' : q.emoji}</span>
            <span class="q-label">${esc(q.label)}</span>
            <span class="q-prog">${q.progress}/${q.target}</span>
          </div>`).join('')}
      </div>
      ${quests.allDone && !quests.claimed ? `<button class="btn sun" id="claim-quest" style="margin-top:10px;width:100%">Collect ${quests.bonusCoins} bonus coins! 🪙</button>` : ''}
    </div>` : '';
  app().innerHTML = topbar(`<div class="container">
    <div class="kid-header">
      <div class="avatar-big" onclick="location.hash='#avatar'" style="cursor:pointer" title="Customize me!">${avatarHTML(k)}</div>
      <div>
        <h1>${playful() ? `Hi ${esc(k.name)}! Ready to level up? ⚡` : `Welcome back, ${esc(k.name)}.`}</h1>
        <div class="stat-chips" style="margin-top:8px">
          ${data.gallopOverall != null ? `<span class="chip gscore-chip" title="Your all-subjects Gallop Score — it climbs with everything you truly learn">🏆 Gallop Score <b>${data.gallopOverall}</b></span>` : ''}
          ${(() => { const r = rankFor(k.xp); return `<span class="chip rank-chip" title="${r.next ? (r.next.at - k.xp) + ' XP to ' + r.next.name : 'Top rank!'}">🏇 ${r.name}</span>`; })()}
          <span class="chip">${playful() ? '🔥 ' : ''}${k.streak}-day streak</span>
          <span class="chip">${playful() ? '⚡ ' : ''}${k.xp} XP</span>
          <span class="chip">${playful() ? '🪙 ' : ''}${k.coins} coins</span>
          <span class="chip">${playful() ? '🎟️ ' : ''}${k.play_tokens || 0} tokens</span>
        </div>
      </div>
      <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#report/${k.id}'">${playful() ? '📊 ' : ''}My Progress</button>
      <button class="btn ghost small" id="autoread-btn">${Voice.auto ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'}</button></div>
    </div>
    ${(() => {
      const rec = data.recommended; if (!rec) return '';
      const s = data.subjects.find(x => x.subject === rec.subject); if (!s) return '';
      const title = rec.type === 'place' ? (playful() ? `Find your ${s.label} level!` : `Take your ${s.label} placement`)
        : rec.type === 'boost' ? (playful() ? `${s.label} needs a power-up 💪` : `${s.label}: your biggest gains are here`)
        : rec.type === 'review' ? (playful() ? `Keep ${s.label} sharp 🧠` : `${s.label}: time for a quick review`)
        : rec.type === 'more' ? (playful() ? `Keep the ${s.label} roll going 🔥` : `${s.label}: keep the momentum`)
        : (playful() ? `Fresh ${s.label} adventure awaits ✨` : `${s.label}: nothing logged today`);
      const sub = rec.type === 'place' ? (playful() ? 'A quick quiz finds your perfect starting spot.' : 'Short adaptive assessment, a few minutes.')
        : rec.type === 'boost' ? (playful() ? 'A few wins here and your skill power jumps!' : 'Targeted reps where mastery is lowest.')
        : rec.type === 'review' ? (playful() ? 'A little review so it really sticks!' : 'A spaced-review check so mastery lasts.')
        : (playful() ? 'Your tutor picked this just for you.' : 'Recommended by your progress data.');
      return `<div class="up-next" data-upnext="${rec.subject}" data-place="${rec.type === 'place' ? 1 : 0}">
        <div class="un-emoji">${s.emoji}</div>
        <div class="un-text"><span class="un-label">${playful() ? '🐎 UP NEXT' : 'UP NEXT'}</span><b>${title}</b><span class="un-sub">${sub}</span></div>
        <button class="btn sun">${rec.type === 'place' ? 'Find my level →' : 'Start →'}</button>
      </div>`;
    })()}
    <div class="week-gallop">
      <div class="wg-head"><span>${playful() ? '🏇 This week’s gallop' : 'This week'}</span><span>${data.weekAnswers || 0} / ${(k.weekly_goal || 12) * 10} answers</span></div>
      ${gallopTrack(Math.min(100, (data.weekAnswers || 0) / ((k.weekly_goal || 12) * 10) * 100))}
      ${(() => {
        const days = [];
        for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); days.push({ d, on: (data.activeDays || []).includes(d) }); }
        return `<div class="streak-dots" title="Your last 14 days">${days.map(x => `<span class="sdot ${x.on ? 'on' : ''}"></span>`).join('')}<span class="sdot-label">${playful() ? 'every dot = a day you learned!' : 'last 14 days'}</span></div>`;
      })()}
    </div>
    ${questCard}
    <div id="ach-banner"></div>
    ${(k.grade >= 6 && data.subjects.some(s => s.placed)) ? `
    <div class="focus-launch">
      <div><b>🎯 Focus Session</b><span class="muted-inv">, 15 minutes, one subject, zero distractions. Serious progress, tracked.</span></div>
      <div class="focus-btns">${data.subjects.filter(s => s.placed).map(s => `<button class="btn ghost small" data-focus="${s.subject}">${s.emoji} ${esc(s.label)}</button>`).join('')}</div>
    </div>` : ''}
    <div class="subject-grid">
      ${data.subjects.map(s => `
        <div class="subject-card" style="background:linear-gradient(135deg, ${s.color}, ${s.color}cc)" data-sub="${s.subject}" data-placed="${s.placed ? 1 : 0}">
          <div class="blob"></div>
          <div class="semoji">${s.emoji}</div>
          <h3>${esc(s.label)}</h3>
          <div class="lvl">${s.placed ? (playful() ? '📍 ' : 'Working at ') + esc(s.levelName) : (playful() ? '✨ Take placement quiz!' : 'Placement assessment needed')}</div>
          <button class="btn sun small" style="margin-top:14px">${s.placed ? (playful() ? 'Play →' : 'Continue →') : 'Find my level →'}</button>
        </div>`).join('')}
    </div>
    <div class="zone-row">
      <div class="zone-card" onclick="location.hash='#learn'"><span class="zemoji">📖</span><b>Lessons</b><span class="muted">${playful() ? 'Learn how it works before you play!' : 'Short lessons that teach the concept first'}</span></div>
      <div class="zone-card" onclick="location.hash='#play'"><span class="zemoji">🕹️</span><b>${playful() ? 'Play Zone' : 'Arcade'}</b><span class="muted">${playful() ? 'Games cost 1 🎟️, earn tokens by learning!' : 'Break games, 1 token each, earned by correct answers'}</span></div>
      <div class="zone-card" onclick="location.hash='#avatar'"><span class="zemoji">🎨</span><b>${playful() ? 'My Avatar' : 'Avatar'}</b><span class="muted">${playful() ? 'Spend coins on hats, pets & worlds' : 'Customize your profile with earned coins'}</span></div>
      <div class="zone-card" onclick="location.hash='#snacks'"><span class="zemoji">🍿</span><b>${playful() ? 'Snack Shack' : 'Snack Shack'}</b><span class="muted">${playful() ? 'Spend coins on treats from the vending machine!' : 'Trade coins for snacks & treats'}</span></div>
      <div class="zone-card" onclick="location.hash='#trophies'"><span class="zemoji">🏆</span><b>Trophy Case</b><span class="muted">${playful() ? 'Your badges, trophies & next goals!' : 'Badges, certificates & milestones'}</span></div>
      <div class="zone-card" onclick="location.hash='#buddies'"><span class="zemoji">💌</span><b>Buddies</b><span class="muted">${playful() ? 'Cheer on your friends!' : 'See your crew’s streaks and send props'}</span></div>
      ${k.grade >= 8 ? `<div class="zone-card exam-zone" onclick="location.hash='#exam'"><span class="zemoji">🎓</span><b>Advanced Track</b><span class="muted">Ahead of your grade? AP, Honors & college-level practice</span></div>` : ''}
    </div>
  </div>`);
  wireChrome();
  $('#autoread-btn').onclick = () => { $('#autoread-btn').textContent = Voice.toggleAuto() ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'; };
  // Prominent achievements banner, lazy-loaded so home stays snappy; drives striving
  (async () => {
    try {
      const a = await api(`/learn/${kidId}/achievements`);
      const el = $('#ach-banner'); if (!el) return;
      const goal = a.nextGoals && a.nextGoals[0];
      const RAR = { common: '#9aa4b2', rare: '#3d8bff', epic: '#a855f7', legendary: '#f0a500' };
      el.innerHTML = `<div class="ach-banner" onclick="location.hash='#trophies'">
        <div class="ab-trophy">🏆</div>
        <div class="ab-mid">
          <div class="ab-top"><b>${playful() ? 'Trophy Case' : 'Achievements'}</b><span class="ab-count">${a.earnedCount}/${a.totalBadges} badges</span></div>
          ${goal ? `<div class="ab-goal"><span class="ab-goal-emoji">${goal.emoji}</span>
            <div class="ab-goal-body"><span class="ab-goal-name">${playful() ? 'Next: ' : ''}${esc(goal.name)}, ${esc(goal.desc)}</span>
              <div class="ab-prog"><div class="ab-prog-fill" style="width:${Math.round(goal.cur/goal.goal*100)}%;background:${RAR[goal.rarity]}"></div></div></div>
            <span class="ab-goal-count">${goal.cur}/${goal.goal}</span></div>`
          : `<div class="ab-goal"><span class="muted">🎉 Every badge earned, you're a legend!</span></div>`}
        </div>
        <div class="ab-cta">View →</div>
      </div>`;
    } catch (e) { /* non-critical */ }
  })();
  const cq = $('#claim-quest');
  if (cq) cq.onclick = async () => {
    try {
      const r = await api(`/learn/${kidId}/quests/claim`, { method: 'POST', body: {} });
      Sound.levelup(); Confetti.burst(180);
      await refreshMe();
      navigate();
    } catch (e) { Sound.wrong(); }
  };
  // Monday-style weekly recap: once per week, celebrate LAST week's work
  try {
    const wk = (() => { const d = new Date(); const o = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-' + Math.ceil(((d - o) / 864e5 + o.getDay() + 1) / 7); })();
    const recapKey = `bp_recap_${k.id}_${wk}`;
    if (data.lastWeek && data.lastWeek.answers >= 10 && !localStorage[recapKey]) {
      localStorage[recapKey] = '1';
      const lw = data.lastWeek;
      const acc = Math.round(lw.correct / lw.answers * 100);
      const div = document.createElement('div');
      div.className = 'celebrate';
      div.innerHTML = `<img src="/logo-roundel.png" alt="" style="width:100px;height:100px">
        <h2>${playful() ? 'Look what you did last week!' : 'Last week, logged.'}</h2>
        <div class="summary-stats" style="background:rgba(255,255,255,.12)">
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">${lw.answers}</div>questions</div>
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">${acc}%</div>correct</div>
          <div class="sstat" style="color:#fff"><div class="n" style="color:#fff">🔥${k.streak}</div>streak</div>
        </div>
        <p style="font-size:1.05rem;max-width:420px">${playful() ? 'A brand-new week of quests starts NOW. Let\'s make this one even bigger! 🐎' : 'New week, fresh targets. Keep the compound interest going.'}</p>
        <button class="btn sun">${playful() ? 'Let\'s go! 🐎' : 'Start the week →'}</button>`;
      div.querySelector('button').onclick = () => { div.remove(); Sound.levelup(); Confetti.burst(120); };
      document.body.appendChild(div);
    }
  } catch (e) { /* recap is a nice-to-have */ }
  const un = document.querySelector('.up-next');
  if (un) un.onclick = () => { Sound.click(); location.hash = (un.dataset.place === '1' ? '#placement/' : '#lesson/') + un.dataset.upnext; };
  document.querySelectorAll('[data-focus]').forEach(b => b.onclick = () => { Sound.click(); location.hash = '#lesson/' + b.dataset.focus + '/focus'; });
  document.querySelectorAll('.subject-card').forEach(el => el.onclick = () => {
    Sound.click();
    location.hash = (el.dataset.placed === '1' ? '#lesson/' : '#placement/') + el.dataset.sub;
  });
});

// ======================= placement quiz =======================
route('placement', async (subject) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  if (!SUBJECT_STYLE[subject]) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  let current = null;

  async function step(body) {
    try {
      const data = await api(`/learn/${kidId}/placement/${subject}`, { method: 'POST', body: body || { reset: current === null } });
      if (data.done) return finish(data);
      current = data;
      render(data);
    } catch (e) {
      if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
      app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
        <div class="big-emoji">🐎</div><h2>Quick hiccup!</h2>
        <p class="muted" style="margin:10px 0 18px">That didn't load. Tap below to continue your placement quiz.</p>
        <button class="btn green" id="retry-p">Continue →</button>
        <button class="btn ghost small" style="margin-left:8px" onclick="location.hash='#home'">🏠 Home</button>
      </div></div>`);
      wireChrome();
      $('#retry-p').onclick = () => { Sound.click(); step(body); };
    }
  }
  function render(data) {
    const qn = data.question;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${style.emoji} Finding your ${esc(subject)} level…</b>
        ${gallopTrack(Math.min(100, data.progress / 8 * 100))}
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)}</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${qn.passage ? passageHTML(qn.passage, playful()) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
          <button class="choice idk" data-i="-1">🤷 ${playful() ? "I haven't learned this yet" : "Haven't covered this yet"}</button>
        </div>
        <div class="lesson-actions" style="justify-content:space-between">
          <span class="muted" id="pick-hint" style="font-size:.9rem">${playful() ? 'Tap your answer, then press Next.' : 'Choose an answer, then press Next.'}</span>
          <button class="btn green" id="place-next" disabled style="opacity:.5">Next →</button>
        </div>
        ${data.progress === 0 ? `<p class="muted" style="margin-top:14px">${playful() ? 'No guessing needed! Saying "I haven\'t learned this yet" is a SMART answer, it helps me find lessons that fit you. You can change your pick before Next.' : 'Skip anything you haven\'t covered, honest answers give you an accurate starting level. You can change your answer before pressing Next.'}</p>` : ''}
      </div>
    </div>`);
    wireChrome();
    const vlang = subject === 'spanish' ? 'es-ES' : 'en-US';
    $('#say-btn').onclick = () => Voice.speak(qn.passage ? qn.prompt : (qn.voice || qn.prompt), vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    // Auto: read the STORY aloud for passages (delight for the littles), else the question
    if (qn.passage && pwords && Voice.auto) Voice.readAlong(pwords, vlang);
    else if (Voice.auto) Voice.speak(qn.voice || qn.prompt, vlang);
    // Placement is deliberate: picking an answer HIGHLIGHTS it (and the child can change
    // their mind) — nothing is submitted until they press Next. We never flash right/wrong
    // during a placement quiz; it's a level-finder, not a graded test.
    let picked = null;
    const nextBtn = $('#place-next'), hint = $('#pick-hint');
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      Sound.click();
      document.querySelectorAll('.choice').forEach(x => x.classList.remove('picked'));
      b.classList.add('picked');
      picked = Number(b.dataset.i);
      nextBtn.disabled = false; nextBtn.style.opacity = '1';
      if (hint) hint.textContent = picked === -1 ? (playful() ? "That's okay — press Next." : 'Marked as not covered — press Next.') : (playful() ? 'Nice! Press Next when ready.' : 'Press Next to continue.');
    });
    nextBtn.onclick = () => {
      if (picked === null) return;
      Sound.click();
      nextBtn.disabled = true; nextBtn.style.opacity = '.5';
      step({ answerIndex: picked, questionAnswerIndex: qn.answerIndex, probeGrade: data.probeGrade, skillName: qn.skillName });
    };
  }
  function finish(data) {
    Sound.levelup(); Confetti.burst(160);
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">🎯</div>
      <h2>Level found: ${esc(data.levelName)}!</h2>
      <p class="muted" style="margin:10px 0 20px">We watched how you answered and picked the spot that fits you best in ${esc(subject)}. Not too easy, not too hard, just right. You'll move up as soon as you show you're ready.</p>
      <button class="btn green" onclick="location.hash='#lesson/${subject}'">Start Learning →</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#home'">Back Home</button>
    </div></div>`);
    wireChrome();
  }
  await step(null);
});

// ======================= lesson player =======================
route('lesson', async (subject, mode) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  if (!SUBJECT_STYLE[subject]) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  const focus = mode === 'focus';
  const FOCUS_MIN = 15;
  const SESSION_LEN = focus ? 9999 : 10;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), events: [], endAt: focus ? Date.now() + FOCUS_MIN * 60000 : null, focusSkill: null };
  let focusTimer = null;
  const fmtLeft = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  if (focus) {
    focusTimer = setInterval(() => {
      const el = $('#focus-left');
      if (!el) { clearInterval(focusTimer); return; }   // navigated away
      const left = session.endAt - Date.now();
      if (left <= 0) { clearInterval(focusTimer); summary(); return; }
      el.textContent = fmtLeft(left);
      if (left < 60000) el.style.color = '#d97b4f';
    }, 1000);
  }

  async function nextQuestion() {
    if (focus && Date.now() >= session.endAt) return summary();
    if (session.n >= SESSION_LEN) return summary();
    try {
      // Keep the mission on one skill: once anchored, ask the server for that same skill
      // until it's mastered (then it hands us a new skill and we re-anchor below).
      const q = session.focusSkill ? `?focus=${encodeURIComponent(session.focusSkill)}` : '';
      const data = await api(`/learn/${kidId}/next/${subject}${q}`);
      // Anchor to the served skill (a labeled retention "Memory Check" never re-anchors,
      // so a spaced-review question doesn't derail the mission's focus).
      if (data && data.skill && data.skill.id && data.mode !== 'retention') session.focusSkill = data.skill.id;
      render(data);
    } catch (e) {
      if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
      if (e.status === 401) { toast('Please log back in to keep going!'); location.hash = '#kid-login'; return; }
      // Never leave a kid stuck: one auto-retry, then a friendly tap-to-retry card.
      try {
        await new Promise(r => setTimeout(r, 800));
        const q = session.focusSkill ? `?focus=${encodeURIComponent(session.focusSkill)}` : '';
        const data = await api(`/learn/${kidId}/next/${subject}${q}`);
        if (data && data.skill && data.skill.id && data.mode !== 'retention') session.focusSkill = data.skill.id;
        render(data);
      } catch (e2) {
        if (e2.status === 401) { toast('Please log back in to keep going!'); location.hash = '#kid-login'; return; }
        app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
          <div class="big-emoji">🐎</div><h2>Whoa, quick water break!</h2>
          <p class="muted" style="margin:10px 0 18px">The next question didn't load. Your progress is saved, tap below to keep going.</p>
          <button class="btn green" id="retry-q">Keep Going →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px" onclick="location.hash='#home'">Back to Subjects</button>
        </div></div>`);
        wireChrome();
        $('#retry-q').onclick = () => { Sound.click(); nextQuestion(); };
      }
    }
  }

  // Strong nudge: when a brand-new skill has a lesson the kid hasn't done yet,
  // lead with the lesson (Step 1) before the practice (Step 2). Skippable — and
  // capped at 2 interruptions per session so a run of new skills doesn't turn
  // into lesson-gate → one question → lesson-gate again. After the cap, new
  // skills show only the small "watch the lesson" banner on the question card.
  const gatedSkills = new Set();
  let gatesShown = 0;
  function lessonDoneFor(teach) { try { return teach && localStorage['bp_lesson_' + teach.id] === '1'; } catch (e) { return false; } }
  function render(data) {
    const sid = data.skill && data.skill.id;
    const teach = (window.BP.lessonForSkill && sid) ? window.BP.lessonForSkill(subject, sid) : null;
    if (teach && !lessonDoneFor(teach) && data.mode === 'learn' && !gatedSkills.has(sid) && gatesShown < 2) { gatesShown++; return lessonIntro(data, teach); }
    renderQuestion(data);
  }
  function lessonIntro(data, teach) {
    app().innerHTML = topbar(`<div class="container" style="max-width:560px">
      <div class="lesson-top"><b>${style.emoji} ${style.cheer}</b></div>
      <div class="card center lesson-gate">
        <span class="lg-badge">NEW SKILL</span>
        <div class="big-emoji" style="margin:8px 0 2px">📖</div>
        <h2 style="margin-bottom:4px">${esc(data.question.skillName || 'A new skill')}</h2>
        <p class="muted" style="margin:8px auto 2px;max-width:26rem">${playful() ? 'Let’s learn it first with a quick lesson — then you’ll practice it! 💪' : 'Start with a short lesson that teaches this, then jump into the practice.'}</p>
        <div class="lg-steps"><span class="lg-step on">📖 Lesson</span><span class="lg-arrow">→</span><span class="lg-step">✅ Practice</span></div>
        <button class="btn green lg-go" id="lg-lesson">Start the lesson →</button>
        <div><button class="btn ghost small" id="lg-skip" style="margin-top:12px;color:var(--brand);border-color:var(--brand)">Skip to practice</button></div>
      </div>
    </div>`);
    wireChrome();
    $('#lg-lesson').onclick = () => { Sound.click(); location.hash = '#teach/' + teach.id; };
    $('#lg-skip').onclick = () => { Sound.click(); gatedSkills.add(data.skill && data.skill.id); renderQuestion(data); };
  }
  function renderQuestion(data) {
    const qn = data.question;
    const modeLabel = { boost: '💪 Power-Up (extra practice!)', learn: '🌱 New Challenge', review: '✨ Quick Review', retention: '🧠 Memory Check (keeping it sharp!)' }[data.mode] || '';
    const qStart = Date.now();
    // Per-question idempotency key so a double-tap / retry can't double-record this answer.
    const answerNonce = Math.random().toString(36).slice(2) + '-' + qStart.toString(36);
    let answered = false;
    // Typed-answer mode: ~30% of numeric math questions (grade 2+) ask the kid
    // to TYPE the answer, recall beats recognition for real mastery.
    const numericQ = qn.choices.every(c => /^-?\d+(\.\d+)?$/.test(String(c).trim()));
    const typed = subject === 'math' && numericQ && (State.me.kid.grade >= 2) && Math.random() < 0.3;
    // If we have a real lesson that teaches this exact skill, offer it right here.
    const teachLesson = (window.BP.lessonForSkill && data.skill) ? window.BP.lessonForSkill(subject, data.skill.id) : null;
    const lessonDone = lessonDoneFor(teachLesson);
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${focus ? '🎯 Focus Session: ' + esc(SUBJECT_STYLE[subject] === style ? subject.charAt(0).toUpperCase() + subject.slice(1) : subject) : style.emoji + ' ' + style.cheer}</b>
        ${focus ? '' : gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${focus ? `⏱ <span id="focus-left">${fmtLeft(session.endAt - Date.now())}</span> · ${session.n} answered` : `Question ${Math.min(session.n + 1, SESSION_LEN)} of ${SESSION_LEN}`}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)} · ${esc(modeLabel)}</span>
        ${teachLesson ? `<button class="btn ghost small learn-this" style="float:right;color:${style.color};border-color:${style.color};margin-left:6px" onclick="location.hash='#teach/${teachLesson.id}'">📖 ${lessonDone ? 'Lesson' : 'Learn this'}</button>` : ''}
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${teachLesson && !lessonDone ? `<div class="learn-banner" style="--lb:${style.color}" onclick="location.hash='#teach/${teachLesson.id}'">📖 <b>New to this skill?</b> Watch the quick lesson first <span class="lb-arrow">→</span></div>` : ''}
        ${qn.passage ? passageHTML(qn.passage, playful()) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        ${typed ? `<div class="typed-wrap">
          <input id="typed-in" class="typed-input" inputmode="decimal" autocomplete="off" placeholder="${playful() ? 'Type your answer!' : 'Your answer'}" aria-label="Type your answer">
          <button class="btn green" id="typed-go">Check ✓</button>
        </div>
        <p class="muted" style="margin-top:8px;font-size:.85rem">${playful() ? '🧠 No choices this time, show what you know!' : 'Free response, recall practice.'}</p>`
        : `<div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>`}
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Trust yourself, read it once more, slowly.')}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#home'">Exit</button>
        </div>
        <div class="too-tricky">
          <button class="tt-btn" id="tt-btn">${playful() ? '🐴 Too tricky? Try easier questions' : 'Too difficult? Step back a level'}</button>
          <button class="tt-btn tt-up" id="tt-up-btn">${playful() ? '🚀 Too easy? Level me up' : 'Too easy? Move up a level'}</button>
        </div>
        <div class="mastery-mini">Skill power: <span id="mastery-pct">${Math.round((data.skill.mastery || 0) * 100)}%</span>
          <div class="mastery-bar"><div id="mastery-fill" style="width:${(data.skill.mastery || 0) * 100}%"></div></div>
        </div>
      </div>
    </div>`);
    wireChrome();
    const vlang = subject === 'spanish' ? 'es-ES' : 'en-US';
    $('#say-btn').onclick = () => Voice.speak(qn.passage ? qn.prompt : (qn.voice || qn.prompt), vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    // Auto: read the STORY aloud for passages (delight for the littles), else the question
    if (qn.passage && pwords && Voice.auto) Voice.readAlong(pwords, vlang);
    else if (Voice.auto) Voice.speak(qn.voice || qn.prompt, vlang);
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    // Stepping the level is never a one-way trap: whichever way the child moves, the toast
    // offers an instant Undo, and both directions are always one tap away. This is the fix
    // for "the too-tricky button stranded her and there was no way back up."
    async function levelShift(delta) {
      Sound.click();
      const down = delta < 0;
      const btn = down ? $('#tt-btn') : $('#tt-up-btn');
      const orig = btn.textContent;
      $('#tt-btn').disabled = true; $('#tt-up-btn').disabled = true;
      btn.textContent = playful() ? (down ? '🐴 One sec…' : '🚀 One sec…') : 'Adjusting…';
      try {
        const r = await api(`/learn/${kidId}/level-shift/${subject}`, { method: 'POST', body: { delta } });
        const msg = playful()
          ? (down ? `🌈 Okay! Easier ${r.levelName} questions coming up.` : `🚀 Nice! Stepping up to ${r.levelName} questions.`)
          : `Level set to ${r.levelName}.`;
        toastAction(msg, playful() ? '↩︎ Undo' : 'Undo', () => levelShift(-delta));
        nextQuestion();
      } catch (e) {
        $('#tt-btn').disabled = false; $('#tt-up-btn').disabled = false; btn.textContent = orig;
      }
    }
    $('#tt-btn').onclick = () => levelShift(-1);
    $('#tt-up-btn').onclick = () => levelShift(1);
    // Keyboard: 1-4 answer, Enter = next, H = hint (great for desktop & teens)
    document.onkeydown = e => {
      if (document.querySelector('.celebrate')) return;
      const ti = document.activeElement && document.activeElement.id === 'typed-in';
      if (ti) { if (e.key === 'Enter') { const g = $('#typed-go'); if (g && !g.disabled) g.click(); } return; }
      if (e.key >= '1' && e.key <= '4') { const c = document.querySelectorAll('.choice')[Number(e.key) - 1]; if (c && !c.disabled) c.click(); }
      else if (e.key === 'Enter') { const nb = $('#next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      else if (e.key.toLowerCase() === 'h') { const hb = $('#hint-btn'); if (hb) hb.click(); }
    };

    async function settle(correct, chosen) {
      const fb = $('#feedback');
      const why = whyLine(subject, qn.skillName);
      if (correct) {
        Sound.correct(); Confetti.burst(40);
        const praise = (playful() ? PRAISE : PRAISE_TEEN)[Math.floor(Math.random() * (playful() ? PRAISE : PRAISE_TEEN).length)];
        fb.className = 'feedback good';
        fb.innerHTML = `<b>${praise}</b> ${esc(qn.explain || "")}${why ? `<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>` : ''}`;
        if (Voice.auto && playful()) Voice.speak(praise.replace(/[^\w\s'!¡.,á-úÁ-Ú-]/g, ''));
      } else {
        Sound.wrong();
        const enc = (playful() ? ENCOURAGE : ENCOURAGE_TEEN)[Math.floor(Math.random() * (playful() ? ENCOURAGE : ENCOURAGE_TEEN).length)];
        // Misconception-specific feedback: if the exact wrong answer they chose maps to a
        // known mistake, lead with the message that names THAT mistake — far more useful
        // than one generic explanation for every distractor.
        const diag = (qn.whyWrong && chosen != null && qn.whyWrong[String(chosen)]) || '';
        const teach = diag || qn.explain || qn.hint || '';
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>${enc}</b><br>${esc(teach)}`;
        // Big teaching moment: pop the explanation up LARGE, and make sure they saw it.
        const pop = document.createElement('div');
        pop.className = 'celebrate';
        pop.innerHTML = `<div class="explain-pop">
          <div class="big-emoji">${style.emoji}</div>
          <h2>${diag ? (playful() ? 'Let\'s look at that! 🔍' : 'Here\'s what happened') : (playful() ? 'Let\'s learn it! 💡' : 'Here\'s the idea')}</h2>
          <p class="explain-text">${diag ? esc(diag) + '<br>' : ''}The answer is <b>${esc(qn.choices[qn.answerIndex])}</b>.${diag ? '' : '<br>' + esc(qn.explain || qn.hint || '')}</p>
          ${why ? `<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>` : ''}
          <button class="btn sun" style="margin-top:14px">${playful() ? 'Got it! 👍' : 'Understood →'}</button>
        </div>`;
        pop.querySelector('button').onclick = () => { pop.remove(); Sound.click(); const nb = $('#next-btn'); if (nb) nb.focus(); };
        // Show the teaching moment IMMEDIATELY (not on a delay). While this .celebrate
        // overlay is up, the keydown guard blocks Enter→Next, so a fast tap can't skip
        // the explanation or drop a ghost overlay onto the next question.
        document.body.appendChild(pop); const gotIt = pop.querySelector('button'); if (gotIt) gotIt.focus();
        if (Voice.auto) Voice.speak(`${diag || ('The answer is ' + qn.choices[qn.answerIndex] + '. ' + (qn.explain || ''))}`, 'en-US');
      }
      session.n++; if (correct) session.correct++;
      try {
        const res = await api(`/learn/${kidId}/answer`, {
          method: 'POST',
          body: { subject, skillId: qn.skillId, correct, timeMs: Date.now() - qStart, difficulty: qn.difficulty, nonce: answerNonce }
        });
        session.xp += res.xpGained || 0;
        $('#mastery-pct').textContent = Math.round(res.mastery * 100) + '%';
        $('#mastery-fill').style.width = (res.mastery * 100) + '%';
        (res.events || []).forEach(ev => session.events.push(ev));
        const celebration = (res.events || []).find(ev => ev.type === 'levelup' || ev.type === 'badge' || ev.type === 'token');
        if (celebration) setTimeout(() => celebrate(celebration), 700);
      } catch (e) {
        // Trial/subscription lapsed mid-lesson: send them to the paywall instead of
        // silently celebrating work that was never recorded.
        if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
        // Session expired mid-lesson: back to kid login (retrying forever is a dead end).
        if (e.status === 401) { toast('Please log back in to keep your progress!'); location.hash = '#kid-login'; return; }
        /* otherwise keep playing even if the network hiccups */
      }
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); nextQuestion(); };
      // Only steal focus to Next when correct; on a wrong answer the teaching overlay
      // owns focus (its "Got it" button) until the child dismisses it.
      if (correct) $('#next-btn').focus();
    }

    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) { const _ar = document.querySelectorAll('.choice')[qn.answerIndex]; if (_ar) _ar.classList.add('answer-reveal'); }
      settle(correct, qn.choices[i]);
    });

    const tgo = $('#typed-go');
    if (tgo) {
      const tin = $('#typed-in');
      tin.focus();
      tgo.onclick = () => {
        if (answered) return;
        const val = tin.value.trim();
        if (!val) { tin.focus(); return; }
        answered = true;
        const correct = Number(val) === Number(qn.choices[qn.answerIndex]);
        tin.disabled = true; tgo.disabled = true;
        tin.classList.add(correct ? 'good' : 'bad');
        settle(correct);
      };
    }
  }

  function celebrate(ev) {
    const div = document.createElement('div');
    div.className = 'celebrate';
    // Never stack on top of the teaching popup (or another celebration) —
    // wait politely until the current overlay is dismissed.
    const showWhenClear = () => {
      if (document.querySelector('.celebrate')) { setTimeout(showWhenClear, 400); return; }
      document.body.appendChild(div);
    };
    if (ev.type === 'levelup') {
      Sound.levelup(); Confetti.burst(220);
      div.innerHTML = `<div class="big-emoji">🏆</div><h2>LEVEL UP!</h2><p style="font-size:1.2rem">You completed ${esc(ev.certificate || 'a level')}!<br>A certificate was added for you & your parents. 🎓</p><button class="btn sun">Keep Going →</button>`;
    } else if (ev.type === 'token') {
      Sound.badge(); Confetti.burst(80);
      div.innerHTML = `<div class="big-emoji">🎟️</div><h2>Play Token Earned!</h2><p style="font-size:1.2rem">5 correct answers = 1 token for the Play Zone! You have ${ev.tokens}. 🕹️</p><button class="btn sun">Sweet →</button>`;
    } else {
      Sound.badge(); Confetti.burst(120);
      div.innerHTML = `<div class="big-emoji">${ev.badge.emoji}</div><h2>New Badge!</h2><p style="font-size:1.2rem">${esc(ev.badge.name)}</p><button class="btn sun">Awesome →</button>`;
    }
    div.querySelector('button').onclick = () => div.remove();
    showWhenClear();
  }

  function summary() {
    if (focusTimer) clearInterval(focusTimer);
    const denom = focus ? Math.max(1, session.n) : SESSION_LEN;
    const pct = Math.round(session.correct / denom * 100);
    const mins = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const emoji = focus ? '🎯' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '🌱';
    const msg = focus
      ? (session.n >= 15 ? 'Focus session complete, that was real studying.' : 'Focus session complete.')
      : pct >= 80 ? 'Outstanding! Your brain is glowing!' : pct >= 60 ? 'Strong work, you\'re growing fast!' : 'Every try makes you smarter. Let\'s keep building!';
    Confetti.burst(focus ? 120 : pct >= 80 ? 200 : 80); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${msg}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${focus ? session.n : SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      ${focus ? `<p class="muted" style="margin:6px 0 2px">${session.n} questions in ${FOCUS_MIN} minutes${pct ? ` · ${pct}% accuracy` : ''}. ${pct >= 80 && session.n >= 15 ? 'Elite session. 🏆' : 'Consistency compounds, same time tomorrow?'}</p>` : ''}
      <button class="btn green" onclick="location.hash='#lesson/${subject}${focus ? '/focus' : ''}';location.reload()">${focus ? 'New Session 🎯' : 'Play Again 🔁'}</button>
      <button class="btn" style="margin-left:8px" onclick="location.hash='#home'">More Subjects →</button>
    </div></div>`);
    wireChrome();
  }

  await nextQuestion();
});

// ======================= exam prep (AP / Honors / Regents) =======================
// A separate advanced track. Practice never changes a learner's grade level or
// mastery — it's exam drilling with explanations. Reuses the lesson q-card look.
const EXAM_ORDER = ['AP', 'Honors', 'Regents'];
const EXAM_BLURB = {
  Regents: 'State test prep',
  AP: 'College-level AP practice',
  Honors: 'Honors-level challenge'
};
route('exam', async (trackId) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  // Advanced Track is for grade 8+ (same gate as the home tile) — a younger kid
  // deep-linking here goes home instead of into AP calculus.
  if ((State.me.kid.grade || 0) < 8) { location.hash = '#home'; return; }
  const kidId = State.me.kid.id;
  let tracks = [];
  try { tracks = (await api('/learn/tracks')).tracks || []; } catch (e) { tracks = []; }

  if (!trackId) {
    if (!tracks.length) {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px"><div class="card center">
        <div class="big-emoji">🎓</div><h2>The Advanced Track is warming up</h2>
        <p class="muted" style="margin:10px 0 18px">AP, Honors & college-level practice sets are being added. Check back soon!</p>
        <button class="btn green" onclick="location.hash='#home'">← Back home</button>
      </div></div>`);
      wireChrome(); return;
    }
    const groups = {};
    for (const t of tracks) { (groups[t.exam] = groups[t.exam] || []).push(t); }
    const sections = EXAM_ORDER.filter(e => groups[e]).map(exam => `
      <div class="exam-section">
        <div class="exam-sec-head"><span class="exam-badge exam-${exam.toLowerCase()}">${exam === 'Regents' ? 'State Prep' : exam}</span><span class="muted">${EXAM_BLURB[exam] || ''}</span></div>
        <div class="exam-grid">
          ${groups[exam].map(t => {
            const c = (SUBJECT_STYLE[t.subject] || {}).color || '#1A5C38';
            return `<button class="exam-card" data-track="${t.id}" style="--tc:${c}">
              <span class="exam-emoji">${t.emoji || '🎓'}</span>
              <b>${esc(t.name)}</b>
              <span class="exam-count">${t.count} questions</span>
            </button>`;
          }).join('')}
        </div>
      </div>`).join('');
    app().innerHTML = topbar(`<div class="container" style="max-width:820px">
      <div class="exam-hero">
        <img src="/logo-full-dark.png" alt="Gallop Learning Academy" class="exam-hero-logo">
        <div><h1 style="margin:0">Advanced Track</h1>
        <p class="muted" style="margin:4px 0 0">For students working ahead — college-level AP, Honors, and exam practice. Working here won't change your grade level; it's pure challenge.</p></div>
      </div>
      ${sections}
      <div style="margin-top:18px"><button class="btn ghost small on-page" onclick="location.hash='#home'">← Back home</button></div>
    </div>`);
    wireChrome();
    document.querySelectorAll('.exam-card').forEach(b => b.onclick = () => { Sound.click(); location.hash = '#exam/' + b.dataset.track; });
    return;
  }

  // ----- practice a specific track -----
  const track = tracks.find(t => t.id === trackId);
  if (!track) { location.hash = '#exam'; return; }
  const style = SUBJECT_STYLE[track.subject] || { color: '#1A5C38', emoji: '🎓' };
  const SESSION_LEN = 12;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), qStart: Date.now() };
  const vlang = track.subject === 'spanish' ? 'es-ES' : 'en-US';

  async function nextQuestion() {
    if (session.n >= SESSION_LEN) return summary();
    let data = null;
    for (let attempt = 0; attempt < 3 && !data; attempt++) {
      try { data = await api(`/learn/${kidId}/track/${trackId}/next`); }
      catch (e) { if (e.status === 402) return renderPaywall && renderPaywall(e.data && e.data.reason); data = null; await new Promise(r => setTimeout(r, 500)); }
    }
    if (!data || !data.question) {
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
        <div class="big-emoji">🎓</div><h2>Quick breather</h2>
        <p class="muted" style="margin:10px 0 18px">That question didn't load. Your progress is saved.</p>
        <button class="btn green" id="retry-q">Keep Going →</button>
        <button class="btn ghost small on-page" style="margin-left:8px" onclick="location.hash='#exam'">Pick another exam</button>
      </div></div>`);
      wireChrome(); $('#retry-q').onclick = () => { Sound.click(); nextQuestion(); }; return;
    }
    render(data.question);
  }

  function render(qn) {
    let answered = false;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${track.emoji || '🎓'} ${esc(track.name)}</b>
        ${gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${session.n}/${SESSION_LEN}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(track.exam)} · exam practice</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${qn.passage ? passageHTML(qn.passage, false) : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Work it through step by step.')}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#exam'">Exit</button>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, vlang);
    const pread = $('.passage-read'), pwords = $('.passage-words');
    if (pread && pwords) pread.onclick = () => { Sound.click(); Voice.readAlong(pwords, vlang); };
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    document.onkeydown = e => {
      if (document.querySelector('.celebrate')) return;
      if (e.key >= '1' && e.key <= '4') { const c = document.querySelectorAll('.choice')[Number(e.key) - 1]; if (c && !c.disabled) c.click(); }
      else if (e.key === 'Enter') { const nb = $('#next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      else if (e.key.toLowerCase() === 'h') { const hb = $('#hint-btn'); if (hb) hb.click(); }
    };

    async function settle(correct) {
      const fb = $('#feedback');
      if (correct) {
        Sound.correct(); Confetti.burst(36);
        fb.className = 'feedback good';
        fb.innerHTML = `<b>Correct! 🎯</b> ${esc(qn.explain || '')}`;
      } else {
        Sound.wrong();
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>Not quite.</b><br>${esc(qn.explain || '')}`;
        const pop = document.createElement('div');
        pop.className = 'celebrate';
        pop.innerHTML = `<div class="explain-pop">
          <div class="big-emoji">${track.emoji || '🎓'}</div>
          <h2>Here's the idea</h2>
          <p class="explain-text">The answer is <b>${esc(qn.choices[qn.answerIndex])}</b>.<br>${esc(qn.explain || qn.hint || '')}</p>
          <button class="btn sun" style="margin-top:14px">Understood →</button>
        </div>`;
        pop.querySelector('button').onclick = () => { pop.remove(); Sound.click(); const nb = $('#next-btn'); if (nb) nb.focus(); };
        // Show immediately so the keydown guard blocks Enter→Next until it's dismissed.
        document.body.appendChild(pop); const uB = pop.querySelector('button'); if (uB) uB.focus();
      }
      session.n++; if (correct) { session.correct++; }
      try {
        const res = await api(`/learn/${kidId}/track/answer`, { method: 'POST', body: { trackId, correct, timeMs: Date.now() - (session.qStart || session.startedAt) } });
        session.qStart = Date.now();
        session.xp += res.xpEarned || 0;
      } catch (e) {
        if (e.status === 402) { renderPaywall(e.data && e.data.reason); return; }
        if (e.status === 401) { toast('Please log back in to keep your progress!'); location.hash = '#kid-login'; return; }
        /* else keep going */
      }
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').onclick = () => { Sound.click(); nextQuestion(); };
      if (correct) $('#next-btn').focus();
    }

    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) { const _ar = document.querySelectorAll('.choice')[qn.answerIndex]; if (_ar) _ar.classList.add('answer-reveal'); }
      settle(correct);
    });
  }

  function summary() {
    const pct = Math.round(session.correct / SESSION_LEN * 100);
    const mins = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚';
    const msg = pct >= 80 ? `Exam-ready work on ${track.name}!` : pct >= 60 ? `Solid ${track.name} practice — keep sharpening.` : `Every rep counts. ${track.name} is tough — you're building it.`;
    Confetti.burst(pct >= 80 ? 200 : 90); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${esc(msg)}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      <button class="btn green" onclick="location.hash='#exam/${trackId}';location.reload()">Practice again 🔁</button>
      <button class="btn" style="margin-left:8px" onclick="location.hash='#exam'">Other exams →</button>
      <button class="btn ghost small on-page" style="margin-left:8px" onclick="location.hash='#home'">Home</button>
    </div></div>`);
    wireChrome();
  }

  await nextQuestion();
});

// ======================= report card =======================
// Per-subject pace status, makes the adaptive guardrails visible to parents.
function statusBadge(status) {
  const M = {
    'excelling': ['🚀 Excelling', 'st-excelling'],
    'on-track': ['✅ On track', 'st-ontrack'],
    'needs-support': ['🤝 Extra support', 'st-support'],
    'building': ['🌱 Getting started', 'st-building']
  };
  const m = M[status]; if (!m) return '';
  return `<span class="status-badge ${m[1]}">${m[0]}</span>`;
}
function statusNote(s) {
  if (s.status === 'excelling') return ' · <b style="color:#1f8a5f">has this down, so we\'re steadily raising the challenge</b>';
  if (s.status === 'needs-support') return ' · <b style="color:#C9A84C">we\'ve eased the difficulty and added extra practice here</b>';
  if (s.status === 'on-track') return ' · moving along at a healthy pace';
  return '';
}
// The status badge ("On track", "Excelling", "Extra support") is computed from the child's
// RECENT work (last ~15 answers), not their all-time average. So the headline number here
// must be that same recent figure — otherwise a green "On track" can sit next to a low
// all-time % and read as a contradiction (a parent-reported confusion we're fixing).
function accuracyLine(s) {
  const qn = `${s.questionsAnswered} question${s.questionsAnswered === 1 ? '' : 's'}`;
  if (s.recentAccuracy != null) {
    const recent = Math.round(s.recentAccuracy * 100);
    const allTime = s.accuracy != null ? Math.round(s.accuracy * 100) : null;
    const tail = (allTime != null && Math.abs(recent - allTime) >= 10)
      ? ` <span class="muted" style="font-size:.85rem">(${allTime}% across all their work)</span>` : '';
    return `${qn} · ${recent}% correct lately${tail}`;
  }
  if (s.accuracy != null) return `${qn} · ${Math.round(s.accuracy * 100)}% accuracy`;
  return `${qn} · just getting started`;
}

// Parent "Strengths & Future Paths" card, grows with the student. Emerging
// interests early, concrete career pathways in the high-school years.
function renderCareer(c, k) {
  const SUBCOL = { math: '#5b5bd6', english: '#0f9d76', science: '#2f78c2', spanish: '#d26440' };
  const SUBEMO = { math: '🔢', english: '📚', science: '🔬', spanish: '🌎' };
  const bandTitle = c.band === 'pathways' ? '🎯 Career Pathways' : c.band === 'explore' ? '🧭 Strengths & Career Explorer' : '🌱 Emerging Strengths';
  const intro = c.band === 'pathways'
    ? `Based on how ${esc(k.name)} is performing, here are career directions that fit their strengths, along with how to prepare for them in high school.`
    : c.band === 'explore'
    ? `${esc(k.name)}'s strengths are starting to point somewhere. Here's where these skills tend to lead, worth talking through together.`
    : `It's early, but ${esc(k.name)} is already building strengths. Here's a peek at where these skills can lead one day.`;
  if (!c.hasData) {
    return `<div class="card career-card">
      <div class="career-head"><h3>${bandTitle}</h3></div>
      <p class="muted" style="margin-top:6px">Once ${esc(k.name)} has answered a few questions in each subject, we'll start mapping their strengths to real-world paths right here. It gets more specific as they get older.</p>
    </div>`;
  }
  // strength bars (ranked subjects)
  const bars = c.ranked.map(s => `
    <div class="str-row">
      <span class="str-name">${SUBEMO[s.subject]} ${esc(s.label)}</span>
      <span class="str-bar"><span class="str-fill" style="width:${Math.round((s.score || 0) * 100)}%;background:${SUBCOL[s.subject]}"></span></span>
      <span class="str-pct">${Math.round((s.score || 0) * 100)}</span>
    </div>`).join('');
  const strengthChips = c.topStrengths.length
    ? `<p style="margin:2px 0 0"><b>Excelling in:</b> ${c.topStrengths.map(s => `<span class="pill strength">${esc(s.label)}</span>`).join(' ')}</p>` : '';
  const growth = c.growthAreas.length
    ? `<p style="margin:8px 0 0"><b>Room to grow:</b> ${c.growthAreas.map(s => `<span class="pill focus">${esc(s.label)}</span>`).join(' ')} <span class="muted" style="font-size:.85rem">${esc(c.growthAreas[0].why)}</span></p>` : '';
  const paths = c.pathways.map(p => `
    <div class="path-card">
      <div class="path-emoji">${p.emoji}</div>
      <div class="path-body">
        <div class="path-top"><b>${esc(p.title)}</b><span class="path-match" title="How well this fits ${esc(k.name)}'s current strengths">${Math.round(p.match * 100)}% match</span></div>
        <p class="path-why">${esc(p.why)}</p>
        ${c.band === 'pathways' ? `<p class="path-hs">🎓 <b>High-school focus:</b> ${esc(p.hs)}</p>` : ''}
      </div>
    </div>`).join('');
  return `<div class="card career-card">
    <div class="career-head"><h3>${bandTitle}</h3><span class="career-badge">${c.band === 'pathways' ? 'High School' : c.band === 'explore' ? 'Middle Years' : 'Early Years'}</span></div>
    <p class="muted" style="margin:4px 0 14px">${intro}</p>
    <div class="strength-panel">${bars}</div>
    ${strengthChips}
    ${growth}
    <h4 style="margin:18px 0 10px">${c.band === 'pathways' ? 'Pathways that fit these strengths' : 'Where these skills can lead'}</h4>
    <div class="path-grid">${paths}</div>
    <p class="muted" style="font-size:.78rem;margin-top:12px">These suggestions come from ${esc(k.name)}'s skill levels and accuracy across subjects. They sharpen as more work is completed and update automatically as ${esc(k.name)} grows.</p>
  </div>`;
}

route('report', async (kidId) => {
  const r = await api(`/learn/${kidId}/report`);
  const k = r.kid;
  const isParent = State.me.role === 'parent';
  app().innerHTML = topbar(`<div class="container">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <h2>${AVATARS[k.avatar] || '🦊'} ${esc(k.name)}'s Report Card</h2>
        <div>
          <button class="btn small no-print" onclick="window.print()">🖨️ Print</button>
          ${isParent ? `<button class="btn ghost small no-print" style="color:var(--brand);border-color:var(--brand)" onclick="location.hash='#parent'">← Dashboard</button>` : `<button class="btn green small no-print" onclick="location.hash='#home'">🏠 Home</button>`}
        </div>
      </div>
      <p class="muted">${r.pace.summer ? `☀️ ${esc(r.pace.note)}` : `${esc(r.pace.label)} · ${Math.round(r.pace.pctThroughYear * 100)}% through the year`} · ${r.weekAnswers} question${r.weekAnswers === 1 ? '' : 's'} this week (goal: ${k.weekly_goal * 10})</p>
      ${r.gallop && r.gallop.overall != null ? `
      <div class="gallop-hero">
        <div class="gh-num">${r.gallop.overall}</div>
        <div class="gh-meta">
          <b>Gallop Score</b>${r.gallop.deltas && r.gallop.deltas.overall > 0 ? ` <span class="gs-up">▲ +${r.gallop.deltas.overall} this week</span>` : ''}
          <span class="gh-sub">${esc(k.name)}'s all-subjects number. It climbs only with real understanding, never by lucky guesses.</span>
        </div>
      </div>
      ${isParent ? `<details class="gs-explain"><summary>What is a Gallop Score, and will it go up? 🐎</summary>
        <div class="gs-explain-body">
          <p>The Gallop Score is a single number, from <b>200 to 1200</b>, that sums up how much ${esc(k.name)} has truly learned across every subject. Think of it like a credit score for learning: one glanceable number that only moves up when the learning is real.</p>
          <p><b>Yes — it rises as they progress.</b> Two things push it up: unlocking new skills, and deepening the skills they already have. Harder, higher-grade skills are worth more points, and a skill only pays out its full value once ${esc(k.name)} has genuinely mastered it. That's why it can't be inflated by guessing or racing through — the only way up is understanding that sticks.</p>
          <p class="muted" style="font-size:.9rem;margin-bottom:0">Rough guide: ~200 is just starting out, ~700 is solid mid-elementary, and 1000+ is high-school-level command. Each subject shows its own score below, plus the school grade it lines up with.</p>
        </div>
      </details>` : ''}` : ''}
      ${isParent && r.gradeScale ? `<p class="muted" style="font-size:.8rem;margin-top:8px">Letter grades reflect accuracy · Scale: ${esc(r.gradeScale)}</p>` : ''}
      <div style="margin-top:18px">
      ${r.subjects.map(s => `
        <div class="subject-report">
          <div class="head">
            <h3>${SUBJECT_STYLE[s.subject].emoji} ${esc(s.label)} ${statusBadge(s.status)}</h3>
            <div class="subj-score">
              <div class="ss-num" style="color:${SUBJECT_STYLE[s.subject].color}">${s.gallopScore != null ? s.gallopScore : '—'}</div>
              <div class="ss-cap">Gallop Score${s.gallopScore != null && r.gallop.deltas && r.gallop.deltas[s.subject] > 0 ? ` · <span class="gs-up">+${r.gallop.deltas[s.subject]}</span>` : ''}</div>
              ${isParent && s.gradeEquiv ? `<div class="ss-grade">≈ ${esc(s.gradeEquiv.label)}${s.letter && s.letter !== '—' ? ` · ${esc(s.letter)}` : ''}</div>` : ''}
            </div>
          </div>
          ${s.placed ? `
            <p class="muted" style="margin:6px 0">${isParent ? `${accuracyLine(s)}${statusNote(s)}` : `${s.questionsAnswered} question${s.questionsAnswered === 1 ? '' : 's'} done. Keep it up, you're growing!`}</p>
            ${isParent && s.placementNote ? `<p class="place-note"><b>Why we started here:</b> ${esc(s.placementNote)}</p>` : ''}
            ${isParent && s.placementMissed && s.placementMissed.length ? `<p class="place-note" style="background:#fff6ec;border-color:#f0d9bd"><b>Missed on the placement quiz:</b> ${s.placementMissed.map(x => `<span class="pill focus">${esc(x)}</span>`).join(' ')} <span class="muted" style="font-size:.85rem">— these are just the concepts to keep an eye on; ${esc(k.name)} gets extra practice on them automatically.</span></p>` : ''}
            ${s.strengths.length ? `<p>💪 Strengths: ${s.strengths.map(x => `<span class="pill strength">${esc(x)}</span>`).join(' ')}</p>` : ''}
            ${s.focusAreas.length ? `<p style="margin-top:6px">🎯 Focus areas (getting extra help): ${s.focusAreas.map(x => `<span class="pill focus">${esc(x)}</span>`).join(' ')}</p>` : ''}
            ${isParent && s.skills && s.skills.length ? `
            <details class="skill-detail no-print">
              <summary>🔬 See all ${s.skills.length} skills</summary>
              <div class="skill-rows">
                ${s.skills.map(sk => `
                  <div class="skill-row">
                    <span class="sk-name">${esc(sk.name)}${sk.grade != null ? ` <span class="sk-grade">${sk.grade === 0 ? 'K' : 'G' + sk.grade}</span>` : ''}</span>
                    <span class="sk-meta">${sk.attempts} tries${sk.accuracy != null ? ' · ' + Math.round(sk.accuracy * 100) + '%' : ''}</span>
                    <span class="sk-bar"><span class="sk-fill ${sk.mastery >= 0.8 ? 'hi' : sk.mastery >= 0.45 ? 'mid' : 'lo'}" style="width:${Math.round(sk.mastery * 100)}%"></span></span>
                  </div>`).join('')}
              </div>
            </details>` : ''}
            ${isParent ? `<button class="btn ghost small no-print" style="margin-top:8px;color:#7f8c9b;border-color:#dfe6e9" data-retake="${s.subject}">🔄 Retake placement</button>` : ''}
          ` : `<p class="muted">No placement quiz yet. Jump in to find the right level.</p>`}
        </div>`).join('')}
      </div>
    </div>
    ${isParent && r.career ? renderCareer(r.career, k) : ''}
    ${isParent && r.history ? (() => {
      const H = r.history, max = Math.max(1, ...H.map(x => x.answers));
      const total = H.reduce((t, x) => t + x.answers, 0);
      const corr = H.reduce((t, x) => t + x.correct, 0);
      const activeDays = H.filter(x => x.answers > 0).length;
      const bars = H.map((x, i) => {
        const h = Math.round(x.answers / max * 70);
        const acc = x.answers ? x.correct / x.answers : 0;
        const col = !x.answers ? '#e3e0d8' : acc >= 0.8 ? '#1f8a5f' : acc >= 0.55 ? '#C9A84C' : '#d97b4f';
        return `<g><rect x="${i * 34 + 4}" y="${86 - h}" width="26" height="${Math.max(3, h)}" rx="4" fill="${col}"/>
          <text x="${i * 34 + 17}" y="99" font-size="8" text-anchor="middle" fill="#98a0af">${x.day.slice(8)}</text></g>`;
      }).join('');
      return `<div class="card">
        <h3>📈 Last 14 days</h3>
        <p class="muted" style="margin:4px 0 10px">${total} questions · ${total ? Math.round(corr / total * 100) : 0}% correct · active ${activeDays} of 14 days</p>
        <svg viewBox="0 0 480 104" style="width:100%;height:auto" role="img" aria-label="Daily activity chart">${bars}</svg>
        <p class="muted" style="font-size:.78rem;margin-top:6px">Bar height = questions answered · <span style="color:#1f8a5f">■</span> 80%+ correct · <span style="color:#C9A84C">■</span> 55–79% · <span style="color:#d97b4f">■</span> below 55%</p>
      </div>`;
    })() : ''}
    <div class="card">
      <h3>🏅 Badges</h3>
      <div class="badge-shelf" style="margin-top:10px">
        ${r.badges.length ? r.badges.map(b => `<div class="badge-item">${b.emoji} ${esc(b.name)}</div>`).join('') : '<p class="muted">Badges appear as you learn, the first one is one answer away!</p>'}
      </div>
    </div>
    <div class="card">
      <h3>🎓 Certificates</h3>
      <div style="margin-top:10px">
        ${r.certificates.length ? r.certificates.map(c => `
          <div class="cert" style="cursor:pointer" data-cert="${c.id}"><b>🎓 ${esc(c.title)}</b><br><span class="muted">Awarded ${esc(c.issued_at.slice(0, 10))} · tap to view & print the certificate 🖨️</span></div>`).join('')
        : '<p class="muted">Complete every skill in a grade level to earn a printable certificate!</p>'}
      </div>
    </div>
  </div>`);
  wireChrome();
  document.querySelectorAll('[data-cert]').forEach(el => el.onclick = () => { Sound.click(); location.hash = `#certificate/${kidId}/${el.dataset.cert}`; });
  document.querySelectorAll('[data-retake]').forEach(b => b.onclick = async () => {
    const sub = b.dataset.retake;
    if (!confirm(`Retake the ${sub} placement quiz? ${esc(k.name)} will re-do the short assessment next time they open ${sub}. Progress and badges are kept.`)) return;
    await api(`/learn/${kidId}/placement/${sub}/retake`, { method: 'POST', body: {} });
    Sound.badge();
    b.textContent = '✅ Placement reset. The quiz runs on the next visit.';
    b.disabled = true;
  });
});

// ======================= weekly fridge report =======================
route('weekly', async (kidId) => {
  const r = await api(`/learn/${kidId}/report`);
  const k = r.kid;
  const week = (r.history || []).slice(-7);
  const total = week.reduce((t, x) => t + x.answers, 0);
  const corr = week.reduce((t, x) => t + x.correct, 0);
  const acc = total ? Math.round(corr / total * 100) : 0;
  const activeDays = week.filter(x => x.answers > 0).length;
  const best = r.subjects.filter(s => s.placed && s.avgMastery != null).sort((a, b) => b.avgMastery - a.avgMastery)[0];
  const focusList = r.subjects.flatMap(s => s.focusAreas.map(f => `${f} (${s.label})`)).slice(0, 3);
  const strengthList = r.subjects.flatMap(s => s.strengths.map(f => `${f} (${s.label})`)).slice(0, 3);
  const max = Math.max(1, ...week.map(x => x.answers));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bars = week.map((x, i) => {
    const h = Math.round(x.answers / max * 60);
    const a2 = x.answers ? x.correct / x.answers : 0;
    const col = !x.answers ? '#e3e0d8' : a2 >= 0.8 ? '#1f8a5f' : a2 >= 0.55 ? '#C9A84C' : '#d97b4f';
    const dn = dayNames[new Date(x.day + 'T12:00:00Z').getUTCDay()];
    return `<g><rect x="${i * 64 + 10}" y="${72 - h}" width="44" height="${Math.max(3, h)}" rx="5" fill="${col}"/>
      <text x="${i * 64 + 32}" y="86" font-size="10" text-anchor="middle" fill="#7d8496">${dn}</text>
      <text x="${i * 64 + 32}" y="${66 - h}" font-size="10" text-anchor="middle" fill="#16213a" font-weight="700">${x.answers || ''}</text></g>`;
  }).join('');
  const stars = total >= 100 ? '🌟🌟🌟' : total >= 50 ? '🌟🌟' : total >= 15 ? '🌟' : '';
  app().innerHTML = topbar(`<div class="container" style="max-width:820px">
    <div class="cert-frame">
      <div class="cert-inner" style="padding:30px 34px 26px;text-align:left">
        <div style="display:flex;align-items:center;gap:14px;justify-content:space-between;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="/logo-roundel.png" alt="" style="width:58px;height:58px">
            <div><div class="cert-academy" style="font-size:.7rem">GALLOP LEARNING ACADEMY</div>
            <h2 style="margin:2px 0 0;font-family:var(--font-display)">${esc(k.name)}'s Week ${stars}</h2></div>
          </div>
          <div style="text-align:right;color:#7d8496;font-size:.85rem">${new Date(Date.now() - 6 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>🔥 ${k.streak}-day streak</div>
        </div>
        <div class="summary-stats" style="margin:16px 0 6px">
          <div class="sstat"><div class="n">${total}</div>questions</div>
          <div class="sstat"><div class="n">${acc}%</div>correct</div>
          <div class="sstat"><div class="n">${activeDays}/7</div>days active</div>
          ${best && State.me.role === 'parent' ? `<div class="sstat"><div class="n">${best.letter}</div>${esc(best.label)}</div>` : ''}
        </div>
        <svg viewBox="0 0 458 92" style="width:100%;height:auto;margin:8px 0">${bars}</svg>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
          <div><b style="color:#1f8a5f">💪 Shining at</b><br><span class="muted" style="font-size:.9rem">${strengthList.length ? strengthList.map(esc).join('<br>') : 'Building the basics, stars incoming!'}</span></div>
          <div><b style="color:#C9A84C">🎯 Working on</b><br><span class="muted" style="font-size:.9rem">${focusList.length ? focusList.map(esc).join('<br>') : 'No trouble spots this week!'}</span></div>
        </div>
        <p style="margin-top:16px;font-size:.85rem;color:#7d8496;border-top:1px dashed #ddd;padding-top:10px">${total >= 100 ? `Outstanding week, ${esc(k.name)}, over 100 questions! The gallop is real. 🐎` : total >= 50 ? `Great consistency, ${esc(k.name)}, keep that streak alive! 🐎` : total > 0 ? `Every question counts, ${esc(k.name)}, let's pick up the pace next week! 🐎` : `A fresh week awaits, first quest starts today! 🐎`}</p>
      </div>
    </div>
    <div class="center no-print" style="margin-top:16px">
      <button class="btn" onclick="window.print()">🖨️ Print for the Fridge</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#${State.me.role === 'parent' ? 'parent' : 'home'}'">← Back</button>
    </div>
  </div>`);
  wireChrome();
});

// ======================= printable certificate =======================
route('certificate', async (kidId, certId) => {
  const r = await api(`/learn/${kidId}/report`);
  const c = (r.certificates || []).find(x => String(x.id) === String(certId));
  if (!c) { location.hash = '#report/' + kidId; return; }
  const achievement = c.title.replace(' Complete!', '');
  const date = new Date(String(c.issued_at || '').replace(' ', 'T') + 'Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  app().innerHTML = topbar(`<div class="container" style="max-width:860px">
    <div class="cert-frame">
      <div class="cert-inner">
        <img src="/logo-roundel.png" alt="" class="cert-crest">
        <div class="cert-academy">GALLOP LEARNING ACADEMY</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-rule"></div>
        <p class="cert-line">This certifies that</p>
        <div class="cert-name">${esc(r.kid.name)}</div>
        <p class="cert-line">has completed the skills and lessons in</p>
        <div class="cert-achievement">${esc(achievement)}</div>
        <p class="cert-date">Awarded ${esc(date)}</p>
        <div class="cert-footer">
          <div class="cert-sig"><span class="cert-sigline"></span>Gallop Learning Academy</div>
          <div class="cert-sig"><span class="cert-sigline"></span>The Tutor That Knows Your Kid</div>
        </div>
      </div>
    </div>
    <div class="center no-print" style="margin-top:18px">
      <button class="btn" onclick="window.print()">🖨️ Print Certificate</button>
      <button class="btn ghost small" style="color:var(--brand);border-color:var(--brand);margin-left:8px" onclick="location.hash='#report/${kidId}'">← Back to Report</button>
    </div>
  </div>`);
  wireChrome();
});

// ======================= paywall =======================
function renderPaywall(reason) {
  // A wrong-answer teaching overlay must never sit on top of the paywall.
  document.querySelectorAll('.celebrate').forEach(el => el.remove());
  // Speak to the actual account state — a long-paying parent with a declined card
  // should not be told they were "on a free trial". The reason comes from the backend
  // 402 (single source of truth), so the child paywall matches the parent dashboard.
  // Fall back to the parent's own sub_status when a reason wasn't passed.
  const pstat = (State.me && State.me.role === 'parent' && State.me.parent) ? State.me.parent.sub_status : null;
  const r = reason || (pstat === 'past_due' ? 'past_due' : pstat === 'canceled' ? 'canceled' : 'trial_expired');
  const heading = r === 'past_due' ? 'There was a problem with the payment'
    : r === 'canceled' ? 'This subscription is canceled'
    : r === 'no_subscription' ? 'A subscription is needed'
    : 'The free trial has ended';
  app().innerHTML = topbar(`<div class="container" style="max-width:600px"><div class="card center">
    <img src="/logo-roundel.png" alt="" style="width:84px;height:84px">
    <h2 style="margin-top:10px">${heading}</h2>
    <p class="muted" style="margin:10px 0 4px"><b>Everything is saved</b>, streaks, skill levels, badges, and certificates are waiting exactly where you left off.</p>
    <p class="muted" style="margin:0 0 16px">Keep all four subjects, the adaptive tutor, the games arcade, buddies, and weekly parent reports, for less than a single week at a tutoring center.</p>
    ${State.me.role === 'parent'
      ? `<button class="btn green" id="sub-family">Family, $54/mo (up to 4 children)</button> <button class="btn" style="margin-left:8px" id="sub-solo">Solo, $34/mo</button>
         <p class="muted" style="margin-top:12px;font-size:.85rem">Billed monthly and renews automatically until you cancel. Cancel anytime in one click from your dashboard.</p>`
      : `<p><b>Ask your parent to log in and subscribe!</b></p><button class="btn" onclick="location.hash='#login'">Parent Login</button>`}
  </div></div>`);
  wireChrome();
  const fam = $('#sub-family'), solo = $('#sub-solo');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
}
async function checkout(plan) {
  try {
    const out = await api('/billing/checkout', { method: 'POST', body: { plan } });
    if (out.error) { toast(out.error); return; }
    if (out.demo) { await refreshMe(); Confetti.burst(150); Sound.levelup(); location.hash = '#parent'; }
    else if (out.url) location.href = out.url;
  } catch (e) {
    toast(e.message || 'Could not start checkout. Please try again in a moment.');
  }
}

// ======================= parent dashboard =======================
route('parent', async () => {
  await refreshMe();
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  if (State.me.role !== 'parent') { location.hash = '#login'; return; }
  const me = State.me;
  const p = me.parent;
  const trialDays = Math.max(0, Math.round((new Date(String(p.trial_ends || '').replace(' ', 'T') + 'Z') - Date.now()) / 86400000));
  const subLine = p.sub_status === 'active'
    ? `✅ ${esc((me.plans[p.sub_plan] || {}).name || 'Subscribed')} plan active`
    : p.sub_status === 'trial'
      ? (trialDays > 0 ? `⏳ Free trial, ${trialDays} day${trialDays === 1 ? '' : 's'} left` : '🔒 Trial ended')
      : `🔒 Subscription ${esc(p.sub_status)}`;

  const trialUrgent = p.sub_status === 'trial' && trialDays > 0 && trialDays <= 3;
  const trialEnded = p.sub_status === 'trial' && trialDays <= 0;
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>Welcome, ${esc(p.name)} 👋</h1><p>${subLine} ${me.billingMode === 'demo' ? '· <i>(demo billing, add Stripe keys to charge real cards)</i>' : ''}</p></div>
    ${trialUrgent ? `<div class="trial-banner">
      <div><b>⏳ Your free trial ends in ${trialDays} day${trialDays === 1 ? '' : 's'}.</b><br>
      <span>All progress, streaks, badges and certificates are saved, subscribing keeps the gallop going without missing a day.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-family">Family, $54/mo</button>
      <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.6);margin-left:8px" id="tb-solo">Solo, $34/mo</button></div>
    </div>` : ''}
    ${(trialEnded || p.sub_status === 'canceled') ? `<div class="trial-banner">
      <div><b>🔒 Your ${trialEnded ? 'free trial has ended' : 'subscription is canceled'}.</b><br>
      <span>Everything — progress, streaks, badges and certificates — is saved exactly where your child left off. Subscribe to jump right back in.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-family">Family, $54/mo</button>
      <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.6);margin-left:8px" id="tb-solo">Solo, $34/mo</button></div>
    </div>` : ''}
    ${p.sub_status === 'past_due' ? `<div class="trial-banner">
      <div><b>💳 Your last payment didn't go through.</b><br>
      <span>Update your card to keep your subscription active — you won't be charged twice.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-portal">Update payment method</button></div>
    </div>` : ''}
    <div class="dash-grid">
      <div class="card">
        <h3>👧 Your Learners</h3>
        <div id="kid-list" style="margin-top:12px">
          ${me.kids.length ? me.kids.map(k => `
            <div class="kid-row">
              <span class="avatar-sm">${avatarHTML(k)}</span>
              <div style="flex:1"><b>${esc(k.name)}</b><br><span class="muted" style="font-size:.85rem">Grade ${k.grade === 0 ? 'K' : k.grade} · 🔥${k.streak} streak · ⚡${k.xp} XP · ${esc(k.calendar_mode)}</span></div>
              <button class="btn green small" data-start="${k.id}">▶ Start</button>
              <button class="btn small" data-report="${k.id}">📊 Report</button>
              <button class="btn small" data-weekly="${k.id}" title="Printable weekly summary" aria-label="Printable weekly summary for ${esc(k.name)}">📄</button>
              <button class="btn small" data-edit="${k.id}" title="Edit learner" aria-label="Edit ${esc(k.name)}">✏️</button>
              <button class="btn coral small" data-del="${k.id}" title="Remove learner" aria-label="Remove ${esc(k.name)}">✕</button>
            </div>
            <div class="kid-edit" id="edit-${k.id}" style="display:none">
              <div class="ke-grid">
                <div><label>Name</label><input class="ke-name" value="${esc(k.name)}"></div>
                <div><label>Grade</label><select class="ke-grade">${['K', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g, i) => `<option value="${i}" ${k.grade === i ? 'selected' : ''}>${g === 'K' ? 'K' : g}</option>`).join('')}</select></div>
                <div><label>PIN</label><input class="ke-pin" maxlength="4" inputmode="numeric" placeholder="unchanged"></div>
                <div><label>Weekly goal</label><select class="ke-goal">${[6, 9, 12, 15, 20].map(g => `<option value="${g}" ${(k.weekly_goal || 12) === g ? 'selected' : ''}>${g * 10} answers/wk</option>`).join('')}</select></div>
                <div><label>Schedule</label><select class="ke-cal">${['traditional', 'yearround', 'homeschool'].map(c => `<option value="${c}" ${k.calendar_mode === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
              </div>
              <div class="error-msg ke-err"></div>
              <button class="btn small green" data-save-edit="${k.id}" style="margin-top:8px">Save ✓</button>
              <button class="btn ghost small" data-cancel-edit="${k.id}" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px;margin-top:8px">Cancel</button>
              <div class="ke-levels" id="levels-${k.id}"><p class="muted" style="font-size:.85rem">Loading levels…</p></div>
            </div>`).join('') : '<p class="muted">Add your first learner below! 👇</p>'}
        </div>
        <h4 style="margin-top:18px">Add a learner</h4>
        <label>Name</label><input id="nk-name" placeholder="e.g. Margaux">
        <label>Grade</label><select id="nk-grade">${['K', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g, i) => `<option value="${i}">${g === 'K' ? 'Kindergarten' : 'Grade ' + g}</option>`).join('')}</select>
        <label>4-digit PIN (their fun password)</label><input id="nk-pin" maxlength="4" inputmode="numeric" placeholder="e.g. 2019">
        <label>Schedule</label><select id="nk-cal">
          <option value="traditional">Traditional school year (Aug–Jun)</option>
          <option value="yearround">Year-round</option>
          <option value="homeschool">Homeschool (Sep–Jun)</option>
        </select>
        <label>Pick an avatar</label>
        <div class="avatar-pick" id="nk-avatars">${Object.entries(AVATARS).map(([k, e], i) => `<div class="avatar-opt${i === 0 ? ' sel' : ''}" data-a="${k}">${e}</div>`).join('')}</div>
        <p class="muted" style="font-size:.83rem;margin-top:6px">This is just their starting look, kids fully customize it in the Avatar Builder with hats, pets & worlds they buy with coins they earn by learning. 🎨</p>
        <label style="display:flex;align-items:flex-start;gap:9px;margin-top:14px;font-weight:500;cursor:pointer">
          <input type="checkbox" id="nk-consent" style="margin-top:3px;width:18px;height:18px;flex:none">
          <span style="font-size:.86rem;line-height:1.5">I am this child's parent or legal guardian, and I consent to Gallop collecting the limited information described in the <a href="/privacy" target="_blank" rel="noopener">Children's Privacy notice</a> to run their lessons.</span>
        </label>
        <div class="error-msg" id="nk-err"></div>
        <button class="btn green" style="margin-top:14px;width:100%" id="nk-go">Add Learner ✨</button>
      </div>
      <div>
        <div id="family-week"></div>
        <div class="card">
          <h3>💳 Subscription</h3>
          <p class="muted" style="margin:8px 0 14px">${subLine}</p>
          ${p.sub_status === 'active' ? `
            <button class="btn" style="width:100%" id="sub-portal">Manage Billing</button>`
          : p.sub_status === 'past_due' ? `
            <p class="muted" style="margin:0 0 12px">Your last payment didn't go through. Update your card to keep your subscription — you won't be charged twice.</p>
            <button class="btn green" style="width:100%" id="sub-portal">Update payment method</button>`
          : `
            <button class="btn green" style="width:100%" id="sub-family">Family, $54/mo (up to 4 children)</button>
            <button class="btn" style="width:100%;margin-top:8px" id="sub-solo">Solo, $34/mo (1 child)</button>
            <p class="muted center" style="margin-top:8px;font-size:.8rem">Billed monthly, renews automatically until canceled. Cancel anytime in one click.</p>`}
          <p class="muted center" style="margin-top:10px;font-size:.85rem">${me.billingMode === 'stripe' ? '🔒 Payments powered by Stripe' : me.billingMode === 'demo' ? 'Demo mode: subscribe activates instantly, no card needed.' : '🔒 Payments powered by Stripe'}</p>
        </div>
        <div class="card">
          <h3>🔐 Account</h3>
          <label>Current password</label><input id="cp-cur" type="password" autocomplete="current-password">
          <label>New password (8+ characters)</label><input id="cp-new" type="password" autocomplete="new-password">
          <div class="error-msg" id="cp-err"></div>
          <button class="btn small" style="margin-top:10px" id="cp-go">Change Password</button>
          <span id="cp-ok" style="margin-left:10px;color:#1f8a5f;font-weight:700;display:none">✓ Updated!</span>
        </div>
        <div class="card">
          <h3>🚀 How kids log in (any device)</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">1. Go to this site on any PC, Mac, or tablet<br>2. Tap <b>Child Login</b> → enter <b>${esc(p.email)}</b><br>3. They pick their avatar & enter their 4-digit PIN<br><br>That's it, progress syncs everywhere. 🎉</p>
        </div>
        <div class="card">
          <h3>💌 School Buddies</h3>
          <p class="muted" style="margin-top:8px">Connect your children with friends from school, <b>parent-approved only</b>. Children see each other's streaks & badges and send pre-written cheers. No open chat, ever.</p>
          <label>Create an invite code for</label>
          <select id="bd-kid">${me.kids.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select>
          <button class="btn small" style="margin-top:8px" id="bd-create">Create Code</button>
          <div id="bd-code" style="margin-top:8px;font-size:1.4rem;font-weight:700;letter-spacing:3px"></div>
          <label style="margin-top:14px">Got a code from another family?</label>
          <input id="bd-input" placeholder="e.g. 4F7A2C" maxlength="6" style="text-transform:uppercase">
          <label>Connect it to</label>
          <select id="bd-kid2">${me.kids.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select>
          <div class="error-msg" id="bd-err"></div>
          <button class="btn green small" style="margin-top:8px" id="bd-accept">Link Buddies ✨</button>
        </div>
        <div class="card">
          <h3>🧭 How the tutor works</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">Each subject starts with a short <b>placement quiz</b>, so a child can be working at a fourth-grade level in reading and a second-grade level in math at the same time. Every answer updates what we know about their skills. Strong ones move faster; shaky ones get gentler questions, more hints, and extra practice. Finishing a whole grade level earns a <b>certificate</b>. Correct answers also earn <b>play tokens</b> for the arcade, so the learning always comes first.</p>
        </div>
      </div>
    </div>
  </div>`);
  wireChrome();
  const bdc = $('#bd-create'), bda = $('#bd-accept');
  if (bdc) bdc.onclick = async () => {
    try { const r = await api('/buddies/invite', { method: 'POST', body: { kidId: Number($('#bd-kid').value) } }); $('#bd-code').textContent = '🎫 ' + r.code; Sound.badge(); }
    catch (e) { showError('#bd-err', e.message); }
  };
  if (bda) bda.onclick = async () => {
    try { const r = await api('/buddies/accept', { method: 'POST', body: { code: $('#bd-input').value, kidId: Number($('#bd-kid2').value) } }); $('#bd-input').value = ''; Sound.levelup(); Confetti.burst(100); alert('Connected with ' + r.buddyName + '! 🎉'); }
    catch (e) { showError('#bd-err', e.message); }
  };

  let avatar = 'fox';
  document.querySelectorAll('#nk-avatars .avatar-opt').forEach(el => el.onclick = () => {
    document.querySelectorAll('#nk-avatars .avatar-opt').forEach(x => x.classList.remove('sel'));
    el.classList.add('sel'); avatar = el.dataset.a; Sound.click();
  });
  $('#nk-go').onclick = async () => {
    try {
      const consentEl = $('#nk-consent');
      if (consentEl && !consentEl.checked) { showError('#nk-err', 'Please check the box to confirm parental consent.'); return; }
      const wasFirst = me.kids.length === 0;
      const kidName = $('#nk-name').value.trim();
      const r = await api('/kids', { method: 'POST', body: { name: kidName, grade: Number($('#nk-grade').value), pin: $('#nk-pin').value, avatar, calendar_mode: $('#nk-cal').value, consent: true } });
      Sound.badge();
      if (wasFirst) { timeToGallop(r.kidId, kidName); return; }
      navigate();
    } catch (e) { showError('#nk-err', e.message); }
  };
  async function enterKid(kidId, dest) {
    await api('/auth/enter-kid', { method: 'POST', body: { kidId } });
    await refreshMe();
    Sound.levelup();
    location.hash = dest || '#home';
    if (location.hash === (dest || '#home')) navigate();
  }
  // "Time to Gallop!", straight from signup into learning, no re-login needed.
  function timeToGallop(kidId, kidName) {
    Confetti.burst(180); Sound.levelup();
    const div = document.createElement('div');
    div.className = 'celebrate';
    div.innerHTML = `<img src="/logo-roundel.png" alt="" style="width:110px;height:110px"><h2>Time to Gallop!</h2>
      <p style="font-size:1.15rem;max-width:440px">${esc(kidName)} is all set up. The first stop in each subject is a short placement quiz that finds the right starting level for ${esc(kidName)}.</p>
      <button class="btn sun" id="tg-go" style="margin-top:6px">Start Learning as ${esc(kidName)} →</button>
      <button class="btn ghost" id="tg-later" style="margin-top:10px">I'll explore the dashboard first</button>`;
    div.querySelector('#tg-go').onclick = () => { div.remove(); enterKid(kidId, '#home'); };
    div.querySelector('#tg-later').onclick = () => { div.remove(); navigate(); };
    document.body.appendChild(div);
  }
  // Fresh signup with no learners yet? Point them at the one thing to do.
  if (State.onboard && !me.kids.length) {
    State.onboard = false;
    const div = document.createElement('div');
    div.className = 'celebrate';
    div.innerHTML = `<div class="big-emoji">👋</div><h2>Let's get started!</h2>
      <p style="font-size:1.15rem;max-width:420px">Welcome to Gallop Learning Academy! First step: add your learner, name, grade, and a 4-digit PIN they'll use to log in on any device.</p>
      <button class="btn sun">Add my learner →</button>`;
    div.querySelector('button').onclick = () => { div.remove(); const f = $('#nk-name'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.focus(); } };
    document.body.appendChild(div);
  }
  async function loadLevels(kidId) {
    const box = $('#levels-' + kidId);
    if (!box) return;
    try {
      const r = await api('/kids/' + kidId + '/levels');
      box.innerHTML = `<b style="font-size:.85rem">📚 Working levels <span class="muted" style="font-weight:400">(if a subject feels too hard, lower it, Gallop re-adapts from there)</span></b>
        <div class="lvl-rows">${r.levels.map(l => `
          <div class="lvl-row">
            <span class="lvl-sub">${esc(l.label)}</span>
            <span class="lvl-name muted">${esc(l.levelName)}</span>
            ${l.placed ? `<button class="btn ghost small lvl-btn" data-lvl-set="${kidId}:${l.subject}:${l.level - 1}" ${l.level <= 0 ? 'disabled' : ''}>− easier</button>
            <button class="btn ghost small lvl-btn" data-lvl-set="${kidId}:${l.subject}:${l.level + 1}" ${l.level >= l.max ? 'disabled' : ''}>harder +</button>` : ''}
          </div>`).join('')}</div>`;
      box.querySelectorAll('[data-lvl-set]').forEach(btn => btn.onclick = async () => {
        const [kid, subject, level] = btn.dataset.lvlSet.split(':');
        btn.disabled = true;
        try {
          const res = await api('/kids/' + kid + '/level', { method: 'POST', body: { subject, level: Number(level) } });
          Sound.badge(); toast(`${subject.charAt(0).toUpperCase() + subject.slice(1)} moved to ${res.levelName}.`);
          loadLevels(Number(kid));
        } catch (e) { btn.disabled = false; }
      });
    } catch (e) { box.innerHTML = ''; }
  }
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const el = $('#edit-' + b.dataset.edit);
    if (el) {
      const opening = el.style.display === 'none';
      el.style.display = opening ? 'block' : 'none'; Sound.click();
      if (opening) loadLevels(Number(b.dataset.edit));
    }
  });
  document.querySelectorAll('[data-cancel-edit]').forEach(b => b.onclick = () => { const el = $('#edit-' + b.dataset.cancelEdit); if (el) el.style.display = 'none'; });
  document.querySelectorAll('[data-save-edit]').forEach(b => b.onclick = async () => {
    const box = $('#edit-' + b.dataset.saveEdit);
    const body = {
      name: box.querySelector('.ke-name').value.trim(),
      grade: Number(box.querySelector('.ke-grade').value),
      weekly_goal: Number(box.querySelector('.ke-goal').value),
      calendar_mode: box.querySelector('.ke-cal').value
    };
    const pin = box.querySelector('.ke-pin').value.trim();
    if (pin) body.pin = pin;
    try {
      await api('/kids/' + b.dataset.saveEdit, { method: 'PATCH', body });
      Sound.badge(); navigate();
    } catch (e) { const err = box.querySelector('.ke-err'); err.textContent = e.message; err.classList.add('show'); }
  });
  document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => enterKid(Number(b.dataset.start)));
  document.querySelectorAll('[data-report]').forEach(b => b.onclick = () => location.hash = '#report/' + b.dataset.report);
  document.querySelectorAll('[data-weekly]').forEach(b => b.onclick = () => location.hash = '#weekly/' + b.dataset.weekly);
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (confirm('Remove this learner and all their progress?')) { await api('/kids/' + b.dataset.del, { method: 'DELETE' }); navigate(); }
  });
  const tbf = $('#tb-family'), tbs = $('#tb-solo'), tbp = $('#tb-portal');
  if (tbf) tbf.onclick = () => checkout('family');
  if (tbs) tbs.onclick = () => checkout('solo');
  if (tbp) tbp.onclick = async () => {
    try { const out = await api('/billing/portal', { method: 'POST' }); if (out.url) location.href = out.url; else toast('Billing portal unavailable right now.'); }
    catch (e) { toast(e.message || 'Could not open billing.'); }
  };
  const cpg = $('#cp-go');
  if (cpg) cpg.onclick = async () => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { current: $('#cp-cur').value, next: $('#cp-new').value } });
      $('#cp-cur').value = ''; $('#cp-new').value = ''; $('#cp-err').classList.remove('show');
      $('#cp-ok').style.display = 'inline'; Sound.badge();
      setTimeout(() => { const el = $('#cp-ok'); if (el) el.style.display = 'none'; }, 3000);
    } catch (e) { showError('#cp-err', e.message); }
  };
  const fam = $('#sub-family'), solo = $('#sub-solo'), portal = $('#sub-portal');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
  if (portal) portal.onclick = async () => {
    try { const o = await api('/billing/portal', { method: 'POST' }); if (o && o.url) location.href = o.url; else toast('Could not open billing.'); }
    catch (e) { toast(e.message || 'Could not open billing right now. Please try again in a moment.'); }
  };
  // Sibling leaderboard, only interesting with 2+ kids
  if (me.kids.length >= 2) {
    api('/family/stats').then(({ stats }) => {
      const medals = ['🥇', '🥈', '🥉', '🎗️'];
      const box = $('#family-week');
      if (!box) return;
      box.innerHTML = `<div class="card">
        <h3>🏆 This Week at Home</h3>
        <p class="muted" style="margin:4px 0 10px">Questions answered in the last 7 days, a little friendly sibling rivalry never hurt!</p>
        ${stats.map((s, i) => `
          <div class="kid-row">
            <span style="font-size:1.3rem">${medals[i] || '⭐'}</span>
            <span class="avatar-sm">${AVATARS[s.avatar] || '🦊'}</span>
            <div style="flex:1"><b>${esc(s.name)}</b><br><span class="muted" style="font-size:.83rem">${s.weekAnswers} answers${s.weekAccuracy != null ? ' · ' + s.weekAccuracy + '% correct' : ''} · 🔥${s.streak}</span></div>
          </div>`).join('')}
      </div>`;
    }).catch(() => {});
  }
});

// ======================= admin (owner) =======================
route('admin', async () => {
  await refreshMe();
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  if (State.me.role !== 'parent' || !State.me.parent.is_admin) { location.hash = '#parent'; return; }
  const d = await api('/admin/overview');
  const t = d.totals;
  const fmtDate = s => s ? s.slice(0, 10) : '—';
  const statusPill = st => st === 'active' ? '<span class="pill strength">active</span>' : st === 'trial' ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">trial</span>' : `<span class="pill focus">${esc(st)}</span>`;
  const maxSign = Math.max(1, ...d.signups.map(x => x.n));
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>🛡️ Gallop Command Center</h1><p>Owner dashboard, live business & learning metrics${t.testAccounts ? ` · <i>${t.testAccounts} dev/test account${t.testAccounts === 1 ? '' : 's'} hidden from all numbers</i>` : ''}</p></div>
    <div class="statband" style="margin-bottom:18px">
      <div><b>${t.parents}</b><span>Families</span></div>
      <div><b>${t.kids}</b><span>Learners</span></div>
      <div><b>$${d.mrr}</b><span>MRR (active subs)</span></div>
      <div><b>${d.byStatus.active || 0}</b><span>Paying</span></div>
      <div><b>${d.byStatus.trial || 0}</b><span>On trial</span></div>
    </div>
    <div class="dash-grid">
      <div>
        <div class="card">
          <h3>📚 Learning activity</h3>
          <div class="summary-stats" style="margin-top:10px">
            <div class="sstat"><div class="n">${t.answersToday}</div>today</div>
            <div class="sstat"><div class="n">${t.answersWeek}</div>this week</div>
            <div class="sstat"><div class="n">${t.answersAllTime}</div>all-time</div>
            <div class="sstat"><div class="n">${t.activeKidsWeek}</div>active kids/wk</div>
          </div>
          <p class="muted" style="margin-top:10px">🎓 ${t.certificates} certificate${t.certificates === 1 ? '' : 's'} earned platform-wide</p>
        </div>
        <div class="card">
          <h3>👧 Learners by grade band</h3>
          ${d.gradeBands.length ? d.gradeBands.map(b => `<div class="kid-row"><b style="min-width:50px">${b.band}</b><span class="sk-bar" style="flex:1"><span class="sk-fill hi" style="width:${Math.round(b.n / t.kids * 100)}%"></span></span><span class="muted">${b.n}</span></div>`).join('') : '<p class="muted">No learners yet.</p>'}
        </div>
        <div class="card">
          <h3>📈 Signups, last 14 days</h3>
          ${d.signups.length ? `<svg viewBox="0 0 480 80" style="width:100%;height:auto">${d.signups.map((x, i) => `<g><rect x="${i * 34 + 4}" y="${62 - Math.round(x.n / maxSign * 55)}" width="26" height="${Math.max(3, Math.round(x.n / maxSign * 55))}" rx="4" fill="#1f8a5f"/><text x="${i * 34 + 17}" y="76" font-size="8" text-anchor="middle" fill="#98a0af">${x.d.slice(5)}</text></g>`).join('')}</svg>` : '<p class="muted">No signups in the last 14 days.</p>'}
        </div>
      </div>
      <div>
        <div class="card">
          <h3>🧾 Recent families <a class="btn ghost small" style="float:right;color:var(--brand);border-color:var(--brand)" href="/api/admin/export.csv" download>⬇️ CSV</a></h3>
          <div style="margin-top:10px;overflow-x:auto">
            ${d.recent.map(p => `
              <div class="kid-row" style="flex-wrap:wrap">
                <div style="flex:1;min-width:180px"><b>${esc(p.name)}</b> ${statusPill(p.sub_status)}${p.sub_status === 'active' ? ` <span class="muted">$${p.sub_plan === 'solo' ? 34 : 54}/mo</span>` : ''} ${p.kids === 0 ? '<span class="pill focus">needs setup</span>' : p.weekAnswers === 0 ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">quiet this week</span>' : '<span class="pill strength">learning ✓</span>'}<br>
                  <span class="muted" style="font-size:.82rem">${esc(p.email)} · joined ${fmtDate(p.created_at)}${p.sub_status === 'trial' ? ` · trial ends ${fmtDate(p.trial_ends)}` : ''}</span></div>
                <div class="muted" style="font-size:.83rem;text-align:right">${p.kids} kid${p.kids === 1 ? '' : 's'}<br>${p.weekAnswers} ans/wk</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`);
  wireChrome();
});

// ======================= shared API for games.js =======================
window.BP = { $, app, esc, api, route, routes, navigate, topbar, wireChrome, showError, State, Sound, Voice, Music, Confetti, AVATARS, ITEM_EMOJI, avatarHTML, refreshMe };

// ======================= boot =======================
(async function boot() {
  try { await refreshMe(); } catch (e) { /* offline-ish */ }
  // preload speech voices (some browsers lazy-load)
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  // installable app (iPad home screen, Chromebook, etc.) + nudge to refresh when a new
  // version is deployed, so users (especially installed-PWA/phone) don't sit on stale code.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            const showToast = () => {
              const t = document.createElement('div');
              t.className = 'gallop-toast show';
              t.style.cursor = 'pointer';
              t.textContent = '✨ A new version is ready — tap to refresh';
              t.onclick = () => location.reload();
              document.querySelectorAll('.gallop-toast').forEach(x => x.remove());
              document.body.appendChild(t);
            };
            // Don't interrupt a child mid-lesson (tester finding #8). If they're inside a
            // lesson, teaching flow, placement, exam, or game, wait until they navigate out
            // before offering the refresh, so progress is never disrupted.
            const inActivity = () => /^#\/?(lesson|teach|placement|exam|play|game)/.test(location.hash || '');
            if (inActivity()) {
              const onLeave = () => { if (!inActivity()) { window.removeEventListener('hashchange', onLeave); showToast(); } };
              window.addEventListener('hashchange', onLeave);
            } else {
              showToast();
            }
          }
        });
      });
    }).catch(() => {});
  }
  // Handle the return from Stripe checkout so paying never dumps you on the homepage.
  const billing = new URLSearchParams(location.search).get('billing');
  if (billing) history.replaceState(null, '', location.pathname); // strip ?billing=… from the URL
  if (billing === 'success') {
    // The webhook that marks the account active can lag the redirect by a moment; re-check once.
    try {
      const notYet = () => State.me && State.me.role === 'parent' && State.me.parent && State.me.parent.sub_status !== 'active';
      if (notYet()) { await new Promise(r => setTimeout(r, 1600)); await refreshMe(); }
    } catch (e) {}
    location.hash = '#parent';
    setTimeout(() => { try { Confetti.burst(160); Sound.levelup(); } catch (e) {} }, 350);
  }
  // let games.js register its routes before first render
  setTimeout(navigate, 0);
})();
