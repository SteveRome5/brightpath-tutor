/* Gallop Learning Academy SPA — vanilla JS, zero build step */
'use strict';

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
  const cfg = (k && k.avatar_config) || {};
  const base = AVATARS[cfg.base || (k && k.avatar)] || '🦊';
  const bg = cfg.bg && cfg.bg !== 'purple' ? ITEM_EMOJI[cfg.bg] || '' : '';
  const hat = cfg.hat && cfg.hat !== 'none' ? ITEM_EMOJI[cfg.hat] || '' : '';
  const acc = cfg.accessory && cfg.accessory !== 'none' ? ITEM_EMOJI[cfg.accessory] || '' : '';
  const pet = cfg.pet && cfg.pet !== 'none' ? ITEM_EMOJI[cfg.pet] || '' : '';
  return `<span class="av-wrap">${bg ? `<span class="av-bg">${bg}</span>` : ''}<span class="av-base">${base}</span>${hat ? `<span class="av-hat">${hat}</span>` : ''}${acc ? `<span class="av-acc">${acc}</span>` : ''}${pet ? `<span class="av-pet">${pet}</span>` : ''}</span>`;
}
// The Gallop track — our horse IS the progress bar 🐎
function gallopTrack(pct, label) {
  pct = Math.max(0, Math.min(100, pct));
  const flags = [25, 50, 75].map(f => `<span class="g-flag ${pct >= f ? 'passed' : ''}" style="left:${f}%">🚩</span>`).join('');
  return `<div class="gallop-wrap">${label ? `<span class="gallop-label">${esc(label)}</span>` : ''}<div class="gallop-rail"></div><div class="gallop-done" style="width:${pct}%"></div>${flags}<span class="g-finish">🏁</span><span class="gallop-horse ${pct >= 100 ? 'finished' : ''}" style="left:${Math.min(pct, 98)}%">🐎</span></div>`;
}
const SUBJECT_STYLE = {
  math: { color: '#6C5CE7', emoji: '🔢', cheer: 'Math Mission' },
  english: { color: '#00B894', emoji: '📚', cheer: 'Word Quest' },
  science: { color: '#0984E3', emoji: '🔬', cheer: 'Lab Time' },
  spanish: { color: '#E17055', emoji: '🌎', cheer: 'Spanish Adventure' }
};
const PRAISE = ['¡Fantástico!', 'Nailed it!', 'You’re on fire! 🔥', 'Brain power!', 'Boom! Correct!', 'Genius move!', 'Crushed it!', 'Superstar!'];
const ENCOURAGE = ['Almost! Every mistake grows your brain 🧠', 'Good try — let’s look at why:', 'So close! Here’s the trick:', 'No worries — even scientists mess up daily!'];
const PRAISE_TEEN = ['Correct.', 'Nice — exactly right.', 'Clean solve.', 'That’s it.', 'Solid.', 'Right on the first read.'];
const ENCOURAGE_TEEN = ['Not quite — here’s the reasoning:', 'Close. The key detail:', 'Miss logged. Why:', 'Wrong turn — walk it back:'];

// "When will I ever use this?" — answered on every single question.
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
      'Founders live in this math — margins, growth rates, break-even points.',
      'Investors use exactly this to compare companies and spot value.',
      'Engineers at SpaceX and Apple run these operations thousands of times a day.',
      'This is the math behind every budget, paycheck, and smart purchase you\'ll ever make.',
      'Data scientists — one of the best-paid careers — are built on this foundation.'
    ]
  },
  english: {
    young: [
      'Great readers become great leaders — words are how ideas travel! 📚',
      'Every movie, game, and book you love started with someone writing well. ✍️',
      'Knowing lots of words helps you say exactly what you mean!',
      'Reading fast and well makes EVERY other subject easier. 🚀'
    ],
    teen: [
      'CEOs say clear writing is the #1 skill they hire for.',
      'Persuasion — in essays, interviews, negotiations — is a superpower built here.',
      'Contracts, colleges, and careers all filter for people who read carefully.',
      'The best thinkers write well because writing IS thinking made visible.'
    ]
  },
  science: {
    young: [
      'Scientists ask "why?" just like you — that\'s how everything gets invented! 🔬',
      'Doctors use this science to help people feel better every day. 🩺',
      'Knowing how the world works makes you the smartest explorer around! 🌍',
      'Chefs use science — heat, mixing, freezing — every time they cook! 👩‍🍳'
    ],
    teen: [
      'Every medical breakthrough, clean-energy company, and rocket starts here.',
      'Scientific thinking — hypothesis, test, revise — is how you avoid being fooled.',
      'Biotech and climate tech are hiring the generation that masters this now.',
      'Understanding evidence beats believing headlines. That\'s a life skill.'
    ]
  },
  spanish: {
    young: [
      '¡Hola! Over 500 million people speak Spanish — that\'s a lot of new friends! 🌎',
      'Speaking two languages literally makes your brain stronger!',
      'You could order tacos in Mexico City all by yourself! 🌮'
    ],
    teen: [
      'Bilingual professionals out-earn monolingual peers in nearly every field.',
      'The U.S. has 42+ million Spanish speakers — bilingual = twice the market.',
      'Learning a language rewires your brain for better focus and memory. Proven.'
    ]
  }
};
// Topic-matched real-world lines — the shape question gets a BUILDER line, not a money line!
const WHY_TOPICS = {
  math: [
    { match: /shape|geometr|area|perimeter|angle|symmetr|volume/i,
      young: ['Builders use shapes to make houses and bridges strong! 🏗️', 'Artists and video game designers build whole worlds out of shapes! 🎮'],
      teen: ['Architects, engineers, and game developers work in geometry every day.', '3D printing, CAD design, graphics engines — it\'s all geometry.'] },
    { match: /money|coin|cent|dollar|change|percent|interest|discount|budget/i,
      young: ['This is how you make sure you get the right change at the store! 🪙', 'Kids who run lemonade stands use this to count their profit! 🍋'],
      teen: ['This is the math behind every budget, paycheck, and smart purchase.', 'Investors and founders live in percentages — margins, growth, interest.'] },
    { match: /clock|time|calendar|schedule/i,
      young: ['Reading clocks means you always know when the fun starts! ⏰', 'Pilots and train drivers read time like this to keep everyone safe!'],
      teen: ['Schedules, time zones, deadlines — adults run their lives on this.'] },
    { match: /fraction|ratio|divid|division/i,
      young: ['Chefs split recipes with fractions every single day! 👩‍🍳', 'Sharing pizza fairly with friends IS fractions! 🍕'],
      teen: ['Ratios drive recipes, medicine doses, and financial models.'] },
    { match: /graph|data|chart|probab|statist|mean|median/i,
      young: ['Sports announcers use stats like these during every game! 🏀', 'Weather forecasters use data to predict rain or shine! ⛅'],
      teen: ['Data science — one of the best-paid careers — is built on this.', 'Reading data correctly means nobody can fool you with a chart.'] },
    { match: /measur|length|weight|unit/i,
      young: ['Carpenters measure twice and cut once — just like this! 📏', 'Bakers measure ingredients so cookies come out perfect! 🍪'],
      teen: ['Engineering, medicine, construction — measurement is the foundation.'] }
  ],
  english: [
    { match: /read|comprehen|story|detail|main idea|inference/i,
      young: ['Great readers become great leaders — words are how ideas travel! 📚', 'Reading well makes EVERY other subject easier. 🚀'],
      teen: ['Careful reading is how you win at contracts, colleges, and careers.'] },
    { match: /vocab|word|synonym|antonym|prefix|suffix/i,
      young: ['Knowing lots of words helps you say exactly what you mean!', 'Word detectives can figure out ANY new word they meet! 🔍'],
      teen: ['A precise vocabulary is a negotiation and interview superpower.'] },
    { match: /grammar|sentence|punctuat|noun|verb|contraction/i,
      young: ['Clear sentences make sure everyone understands your great ideas! ✍️'],
      teen: ['CEOs say clear writing is the #1 skill they hire for.'] },
    { match: /writ|essay|persua|figurative|poet/i,
      young: ['Every movie, game, and book you love started with someone writing well!'],
      teen: ['Persuasion — essays, pitches, interviews — is a superpower built here.', 'The best thinkers write well, because writing IS thinking made visible.'] }
  ],
  science: [
    { match: /animal|plant|habitat|body|sense|living/i,
      young: ['Doctors and vets use this science to help people and pets! 🩺', 'Knowing how living things work makes you a nature explorer! 🌍'],
      teen: ['Medicine, biotech, and conservation careers all start right here.'] },
    { match: /matter|solid|liquid|gas|chemi|mix/i,
      young: ['Chefs use this science — heat, mixing, freezing — every time they cook! 👩‍🍳'],
      teen: ['Chemistry powers everything from clean water to phone batteries.'] },
    { match: /weather|space|earth|planet|rock|water cycle/i,
      young: ['Weather scientists use this to tell you when to grab an umbrella! ☔', 'Astronauts study this to explore space! 🚀'],
      teen: ['Climate science and space exploration are hiring this generation.'] },
    { match: /force|motion|energy|electric|magnet|physic/i,
      young: ['Roller coaster designers use this science to make rides thrilling AND safe! 🎢'],
      teen: ['Every rocket, EV, and power grid runs on these principles.'] }
  ],
  spanish: []
};
// XP ranks — every learner climbs the stable, Foal to Thoroughbred 🏇
const RANKS = [['Foal', 0], ['Pony Pal', 100], ['Trotter', 250], ['Canterer', 500], ['Galloper', 1000], ['Trailblazer', 2000], ['Champion', 4000], ['Legend', 8000], ['Thoroughbred', 15000]];
function rankFor(xp) {
  let cur = RANKS[0], next = null;
  for (const r of RANKS) { if (xp >= r[1]) cur = r; else { next = r; break; } }
  return { name: cur[0], at: cur[1], next: next ? { name: next[0], at: next[1] } : null };
}

function whyLine(subject, skillName) {
  const topics = WHY_TOPICS[subject] || [];
  const hit = skillName ? topics.find(t => t.match.test(skillName)) : null;
  if (hit) { const list = playful() ? hit.young : (hit.teen.length ? hit.teen : hit.young); return list[Math.floor(Math.random() * list.length)]; }
  const bank = WHY[subject];
  if (!bank) return '';
  const list = playful() ? bank.young : bank.teen;
  return list[Math.floor(Math.random() * list.length)];
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
    toggle() { muted = !muted; localStorage.bp_muted = muted ? '1' : '0'; return muted; }
  };
})();

// ======================= voice (read-aloud) =======================
const Voice = (() => {
  let pref = localStorage.bp_autoread; // '1' on, '0' off, undefined = smart default
  // Pick the most natural, friendly voice the device has (default robots are boring!)
  function bestVoice(lang) {
    const voices = speechSynthesis.getVoices();
    const base = (lang || 'en').split('-')[0];
    const pool = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(base));
    const favorites = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Ava', 'Karen', 'Moira', 'Google UK English Female', 'Monica', 'Paulina', 'Google español'];
    for (const f of favorites) { const v = pool.find(v => v.name.includes(f)); if (v) return v; }
    return pool.find(v => /female|natural/i.test(v.name)) || pool[0] || null;
  }
  function speak(text, lang) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[🍎⭐🐤🎈🚗🐞🍓🐟🍪🐸\u{1F300}-\u{1FAFF}]/gu, ''));
      // Little kids get a bouncy, upbeat storyteller voice; teens get a calm natural one.
      const young = (() => { try { return State.me && State.me.kid && State.me.kid.grade <= 5; } catch (e) { return false; } })();
      u.rate = young ? 0.92 : 1.0;
      u.pitch = young ? 1.25 : 1.0;
      if (lang) u.lang = lang;
      const v = bestVoice(lang || 'en-US');
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* voice unsupported — fine */ }
  }
  function currentAuto() {
    if (pref === '1') return true;
    if (pref === '0') return false;
    // Smart default: little kids (K–2) get questions read aloud automatically.
    try { const k = State.me && State.me.kid; return !!(k && k.grade <= 2); } catch (e) { return false; }
  }
  return {
    speak,
    get auto() { return currentAuto(); },
    toggleAuto() { const next = !currentAuto(); pref = next ? '1' : '0'; localStorage.bp_autoread = pref; return next; }
  };
})();

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
function route(name, fn) { routes[name] = fn; }
async function navigate() {
  const hash = location.hash.replace(/^#\/?/, '') || 'landing';
  const [name, ...args] = hash.split('/');
  speechSynthesis && speechSynthesis.cancel();
  document.onkeydown = null;
  document.querySelectorAll('.celebrate').forEach(el => el.remove());
  applyTheme();
  const fn = routes[name] || routes.landing;
  try { await fn(...args); } catch (e) {
    if (e.status === 401) { location.hash = State.me.role === 'kid' ? '#kid-login' : '#login'; return; }
    if (e.status === 402) { renderPaywall(); return; }
    app().innerHTML = `<div class="container"><div class="card center"><h2>Oops! 🙈</h2><p class="muted">${esc(e.message)}</p><button class="btn" onclick="location.hash='#'">Go Home</button></div></div>`;
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObs.observe(el));
  });
}
// Any celebration overlay: tapping the backdrop (not a button/link) dismisses it.
// Kids tap everywhere — never let a popup feel stuck.
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
  let right = '';
  if (me.role === 'parent') right = `${me.parent && me.parent.is_admin ? `<button class="btn ghost small" onclick="location.hash='#admin'">🛡️ Admin</button>` : ''}<button class="btn ghost small" onclick="location.hash='#parent'">Dashboard</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else if (me.role === 'kid') right = `<button class="btn ghost small" onclick="location.hash='#home'">My Subjects</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else right = `<button class="btn ghost small" onclick="location.hash='#kid-login'">Kid Login</button><button class="btn sun small" onclick="location.hash='#login'">Parent Login</button>`;
  return `
  <div class="topbar">
    <div class="logo" onclick="location.hash='#'"><img src="/logo.svg" alt="Gallop" class="logo-img"> Gallop</div>
    <div class="right">
      <button class="btn ghost small" id="mute-btn" title="Sound effects" aria-label="Toggle sound effects">${Sound.muted ? '🔇' : '🔊'}</button>
      ${right}
    </div>
  </div>${inner}`;
}
function wireChrome() {
  const mb = $('#mute-btn');
  if (mb) mb.onclick = () => { mb.textContent = Sound.toggle() ? '🔇' : '🔊'; };
  const lb = $('#logout-btn');
  if (lb) lb.onclick = async () => { await api('/auth/logout', { method: 'POST' }); await refreshMe(); location.hash = '#'; };
}
function showError(id, msg) { const el = $(id); if (el) { el.textContent = msg; el.classList.add('show'); } }

// ======================= landing =======================
route('landing', async () => {
  if (State.me.role === 'kid') { location.hash = '#home'; return; }
  app().innerHTML = topbar(`
  <div class="hero">
    <div class="eyebrow">Adaptive K–12 Tutoring · Math · English · Science · Spanish</div>
    <h1>A personal tutor for every child, at every level.</h1>
    <p>Gallop Learning Academy places each student precisely — subject by subject — then adapts every lesson to how they actually learn. Real-world teaching, honest progress reports, and a curriculum that grows up with your child.</p>
    <button class="btn" onclick="location.hash='${State.me.role === 'parent' ? '#parent' : '#signup'}'">Start your 7-day free trial</button>
    <button class="btn ghost" style="margin-left:8px" onclick="location.hash='#demo'">Try a sample lesson</button>
    <button class="btn ghost" style="margin-left:8px" onclick="location.hash='#kid-login'">Student sign-in</button>
    <div class="horse-runner">🐎</div>
  </div>
  <div class="container">
    <div class="statband reveal">
      <div><b>K–12</b><span>Every grade level</span></div>
      <div><b>4</b><span>Core subjects</span></div>
      <div><b>131</b><span>Skill areas</span></div>
      <div><b>8</b><span>Learning games</span></div>
      <div><b>1:1</b><span>Adaptive pacing</span></div>
    </div>
    <h2 class="section-title reveal">How it works</h2>
    <p class="section-sub">Three principles, borrowed from the best teachers you ever had.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">01 — PLACE</div><h3>Find the true starting line</h3><p>A short placement assessment measures each subject independently. A strong reader who's average in math starts exactly where she should — in both.</p></div>
      <div class="feature reveal"><div class="fnum">02 — ADAPT</div><h3>Adjust with every answer</h3><p>Mastered skills accelerate and deepen. Shaky skills get gentler questions, clearer hints, and extra repetition — automatically, without shame.</p></div>
      <div class="feature reveal"><div class="fnum">03 — PROGRESS</div><h3>Prove it, then advance</h3><p>Students level up only when every skill in a grade is demonstrated. Parents see letter grades, strengths, and focus areas. Certificates mark real milestones.</p></div>
    </div>
    <h2 class="section-title reveal">We're raising critical thinkers</h2>
    <p class="section-sub">Every child asks "when will I ever use this?" We answer it on every single question — and build toward the adult they'll become.</p>
    <div class="feature-grid">
      <div class="feature reveal"><div class="fnum">GRADES K–5</div><h3>Little entrepreneurs</h3><p>Second-grade addition becomes lemonade-stand economics: buy supplies, set a price, count the profit. Math isn't a worksheet — it's how the world actually works.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 6–8</div><h3>Real decisions</h3><p>Percentages become discounts and interest. Reading becomes spotting a weak argument. Science becomes testing claims instead of believing them.</p></div>
      <div class="feature reveal"><div class="fnum">GRADES 9–12</div><h3>Future founders & investors</h3><p>Teens run a virtual portfolio in our stock-market game, reading news and managing risk. Algebra becomes margin math. Essays become pitches. School becomes a head start.</p></div>
    </div>
    <h2 class="section-title reveal">The curriculum</h2>
    <p class="section-sub">Every concept taught through the real world — money, sports, cooking, travel, technology.</p>
    <div class="subject-strip">
      <div class="sub reveal" style="background:var(--math)"><h4>Mathematics</h4><p>Counting to pre-calculus. Lemonade-stand arithmetic, sale-rack percentages, roller-coaster physics of functions.</p></div>
      <div class="sub reveal" style="background:var(--english)"><h4>English</h4><p>Phonics to rhetoric and college-level analysis. Reading that builds thinkers, grammar that builds writers.</p></div>
      <div class="sub reveal" style="background:var(--science)"><h4>Science</h4><p>Five senses to chemistry and physics. Why the mirror fogs, why the soda can sweats, how vaccines train the body.</p></div>
      <div class="sub reveal" style="background:var(--spanish)"><h4>Spanish</h4><p>First greetings to real fluency. Order in a Madrid café by month two — conjugation follows conversation.</p></div>
    </div>
    <h2 class="section-title reveal">Built for families</h2>
    <div class="feature-grid">
      <div class="feature reveal"><h3>An experience that grows up</h3><p>A 1st grader gets big friendly type, read-aloud questions, and celebrations. A teen gets 15-minute Focus Sessions in a clean, serious study environment. Same engine, age-appropriate design.</p></div>
      <div class="feature reveal"><h3>Motivation, done right</h3><p>Daily quests, streaks, an 8-game arcade (tokens earned by learning), and avatar customization with coins. Play is always the reward — learning is always the engine.</p></div>
      <div class="feature reveal"><h3>Safe, social learning</h3><p>Parent-approved buddies only. Kids send pre-written cheers, race each other's high scores, and team up on weekly goals where both win. No open chat, no strangers, ever.</p></div>
      <div class="feature reveal"><h3>Proof on the fridge</h3><p>Printable Certificates of Mastery, a weekly one-page report, a 14-day activity chart, and per-skill mastery bars — you'll always know exactly how it's going.</p></div>
    </div>
    <div class="card reveal" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:6px">Simple plans</h2>
      <p class="center muted" style="margin-bottom:20px">7-day free trial. Cancel anytime.</p>
      <p class="center" style="margin:-8px 0 20px;font-weight:600">Tutoring centers charge $150–200 per month <i>per subject</i>. Gallop covers all four — for less than one week of Kumon.</p>
      <div class="plans">
        <div class="plan"><h3>Solo</h3><div class="price">$29<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">One student · all four subjects · full adaptive tutor & reports</p></div>
        <div class="plan hot"><span class="tag">MOST POPULAR</span><h3>Family</h3><div class="price">$49<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">Up to four students · all subjects · reports, certificates & buddies</p></div>
      </div>
    </div>
  </div>
  <div class="site-footer">© ${new Date().getFullYear()} Gallop Learning Academy · Adaptive tutoring for grades K–12<br>
    <a class="ig-link" href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">Follow us on Instagram — @learnwithgallop</a><br>
    <a href="#terms" style="color:inherit;opacity:.8">Terms of Service</a> · <a href="#privacy" style="color:inherit;opacity:.8">Privacy Policy</a>
  </div>`);
  wireChrome();
});

// ======================= legal =======================
function legalPage(title, bodyHTML) {
  app().innerHTML = topbar(`<div class="container" style="max-width:760px">
    <div class="card" style="line-height:1.7">
      <h2>${title}</h2>
      <p class="muted" style="margin:6px 0 18px">Last updated: July 19, 2026 · Gallop Learning Academy is operated by Lotus Farms LLC.</p>
      ${bodyHTML}
      <p style="margin-top:22px"><button class="btn ghost small" style="color:#1f5e46;border-color:#1f5e46" onclick="location.hash='#'">← Back to home</button></p>
    </div></div>`);
  wireChrome();
}
route('terms', async () => legalPage('Terms of Service', `
  <h3 style="margin-top:14px">1. The service</h3>
  <p>Gallop Learning Academy ("Gallop") is an online adaptive learning program for students in grades K–12, covering Math, English, Science, and Spanish. Subscriptions are purchased by a parent or legal guardian ("you"), who creates and manages learner profiles for their children.</p>
  <h3 style="margin-top:14px">2. Accounts & responsibility</h3>
  <p>You must be 18 or older to create an account. You are responsible for the accuracy of the information you provide, for keeping your password secure, and for all activity under your account. Learner profiles are for children in your care.</p>
  <h3 style="margin-top:14px">3. Subscriptions, trials & cancellation</h3>
  <p>New accounts receive a free trial (currently 7 days) with full access. After the trial, continued access requires a paid subscription (currently Solo $29/month or Family $49/month), billed monthly through Stripe until canceled. You can cancel anytime from the Parent Dashboard's "Manage Billing" — cancellation stops future charges and access continues through the period already paid. Prices may change with notice; changes never apply retroactively to a period you've already paid for.</p>
  <h3 style="margin-top:14px">4. Acceptable use</h3>
  <p>Don't share accounts beyond your household, attempt to disrupt the service, or use the content for anything other than personal, non-commercial education. The buddies feature connects children only through parent-created invite codes; misuse of it may result in account termination.</p>
  <h3 style="margin-top:14px">5. Educational content</h3>
  <p>Gallop supplements — it does not replace — school instruction, and makes no guarantee of specific academic outcomes. Progress reports, letter grades, and certificates are informal measures generated by our adaptive engine.</p>
  <h3 style="margin-top:14px">6. Disclaimers & liability</h3>
  <p>The service is provided "as is." To the maximum extent permitted by law, Lotus Farms LLC's total liability for any claim related to the service is limited to the amount you paid us in the twelve months before the claim arose.</p>
  <h3 style="margin-top:14px">7. Changes & contact</h3>
  <p>We may update these terms; material changes will be posted on this page with a new date. Questions: <b>support@learnwithgallop.com</b> or Instagram <b>@learnwithgallop</b>.</p>
`));
route('privacy', async () => legalPage('Privacy Policy', `
  <p><b>The short version:</b> we collect the minimum needed to run the tutor, we never sell data, we never show ads, and children's data exists only inside a parent-controlled account.</p>
  <h3 style="margin-top:14px">1. What we collect</h3>
  <p><b>From parents:</b> name, email address, password (stored as a salted hash — we cannot read it), and subscription status. Payments are processed by Stripe; we never see or store card numbers.</p>
  <p><b>About learners (children):</b> the first name, grade, avatar, and 4-digit PIN a parent enters, plus learning activity generated by use (answers, skill mastery, badges, game scores). We do not collect a child's email, phone number, precise location, photos, or free-form messages — the buddies feature uses only pre-written cheers.</p>
  <h3 style="margin-top:14px">2. Children's privacy (COPPA)</h3>
  <p>Gallop is designed for use by children <i>under a parent's account and consent</i>. Children cannot create accounts, cannot make purchases, and cannot communicate in free text with anyone. Learner profiles are created, managed, and deletable only by the parent. Deleting a learner (Parent Dashboard) permanently deletes that child's data; deleting your account deletes everything. Parents may contact us at any time to review or delete their child's information.</p>
  <h3 style="margin-top:14px">3. How data is used</h3>
  <p>Solely to operate the service: placing students at the right level, adapting lessons, generating progress reports for parents, and maintaining streaks/rewards. We do not sell or rent personal information, we do not use it for advertising, and we share it only with the processors that run the service (hosting, payments) under their own strict obligations.</p>
  <h3 style="margin-top:14px">4. Security & retention</h3>
  <p>All traffic is encrypted (HTTPS). Passwords are hashed with scrypt. Data is retained while your account is active and deleted when you delete a learner or your account.</p>
  <h3 style="margin-top:14px">5. Contact</h3>
  <p>Privacy questions or data requests: <b>support@learnwithgallop.com</b>. We're a family business — a real person answers.</p>
`));

// ======================= demo lesson (no signup!) =======================
const DEMO_QUESTIONS = [
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 2', skill: 'Money Math',
    prompt: 'You buy a snack for 65¢ and pay with $1. How much change do you get?', choices: ['35¢', '45¢', '25¢', '65¢'], answer: 0,
    hint: 'Count up from 65 to 100.', explain: '100 − 65 = 35. You get 35¢ back.', why: 'This is how you make sure you get the right change at the store! 🪙' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 3', skill: 'Word Detective',
    prompt: 'The dog was ENORMOUS — it barely fit through the door! Enormous means…', choices: ['very big', 'very loud', 'very furry', 'very fast'], answer: 0,
    hint: 'It barely FIT through the door.', explain: 'Enormous = huge, giant, very big!', why: 'Knowing lots of words helps you say exactly what you mean!' },
  { subject: 'science', emoji: '🔬', color: '#1a9e63', grade: 'Grade 2', skill: 'States of Matter',
    prompt: 'The bathroom mirror fogs up during a hot shower. That fog comes from water turning into a…', choices: ['gas, then back to tiny drops', 'solid', 'rock', 'rainbow'], answer: 0,
    hint: 'Steam rises from hot water…', explain: 'Hot water evaporates into vapor (a gas), then condenses on the cool mirror!', why: 'Chefs use this science — heat, mixing, freezing — every time they cook! 👩‍🍳' },
  { subject: 'spanish', emoji: '🌎', color: '#d4522a', grade: 'Beginner', skill: 'Los Colores',
    prompt: 'A stop sign 🛑 is "rojo". Rojo means…', choices: ['red', 'blue', 'round', 'stop'], answer: 0,
    hint: 'What color is a stop sign?', explain: '¡Sí! Rojo = red.', why: 'Over 500 million people speak Spanish — that\'s a lot of new friends! 🌎' },
  { subject: 'math', emoji: '🔢', color: '#0a84c1', grade: 'Grade 5', skill: 'Percent Power',
    prompt: 'A $40 video game is 25% off. What do you pay?', choices: ['$30', '$25', '$35', '$10'], answer: 0,
    hint: '25% of 40 is 10.', explain: '25% of $40 = $10 off → $30.', why: 'Smart shoppers and founders both live in percentages.' },
  { subject: 'english', emoji: '📚', color: '#7a3fb8', grade: 'Grade 6', skill: 'Figurative Language',
    prompt: '"I\'ve told you a MILLION times to clean your room!" This is…', choices: ['hyperbole (huge exaggeration)', 'a plain fact', 'a simile (compares with like/as)', 'onomatopoeia (a sound word)'], answer: 0,
    hint: 'Was it really a million?', explain: 'Hyperbole exaggerates for effect.', why: 'Great writers use these tools — and great readers spot them.' }
];
route('demo', async () => {
  let idx = 0, correct = 0;
  function render() {
    if (idx >= DEMO_QUESTIONS.length) {
      Confetti.burst(200); Sound.levelup();
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
        <div class="big-emoji">🐎</div>
        <h2>${correct}/${DEMO_QUESTIONS.length} — and that's just a sample!</h2>
        <p class="muted" style="margin:12px 0 6px">The real tutor goes much further: a placement quiz finds your child's exact level in each subject, every answer adapts what comes next, and correct answers earn tokens for the games arcade.</p>
        <p class="muted" style="margin-bottom:18px">All four subjects. Every grade K–12. $29/month.</p>
        <button class="btn green" onclick="location.hash='#signup'">Start 7-Day Free Trial →</button>
        <button class="btn ghost small" style="color:#1f5e46;border-color:#1f5e46;margin-left:8px" onclick="location.hash='#'">Back</button>
      </div></div>`);
      wireChrome();
      return;
    }
    const qn = DEMO_QUESTIONS[idx];
    let answered = false;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top"><b>${qn.emoji} Sample lesson — see how Gallop teaches</b>${gallopTrack(idx / DEMO_QUESTIONS.length * 100)}<b>${idx + 1}/${DEMO_QUESTIONS.length}</b></div>
      <div class="q-card">
        <span class="q-skill" style="background:${qn.color}">${esc(qn.skill)} · ${esc(qn.grade)}</span>
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
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
      const ok = i === qn.answer;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) document.querySelectorAll('.choice')[qn.answer].classList.add('reveal');
      const fb = $('#feedback');
      if (ok) { correct++; Sound.correct(); Confetti.burst(40); fb.className = 'feedback good'; }
      else { Sound.wrong(); fb.className = 'feedback bad'; }
      fb.innerHTML = `<b>${ok ? 'Nailed it!' : 'Almost —'}</b> ${esc(qn.explain)}<div class="why-line">🌍 <b>Real world:</b> ${esc(qn.why)}</div>`;
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
      <label>Password (6+ characters)</label><input id="f-pass" type="password">
      <div class="error-msg" id="f-err"></div>
      <button class="btn green" style="margin-top:18px;width:100%" id="f-go">Start Free Trial →</button>
      <p class="muted center" style="margin-top:12px">Already have an account? <a href="#login">Log in</a></p>
      <p class="muted center" style="margin-top:8px;font-size:.8rem">By signing up you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
    </div></div>`);
  wireChrome();
  $('#f-go').onclick = async () => {
    try {
      await api('/auth/signup', { method: 'POST', body: { name: $('#f-name').value, email: $('#f-email').value, password: $('#f-pass').value } });
      await refreshMe(); Sound.levelup(); State.onboard = true; location.hash = '#parent';
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
      <p class="muted center" style="margin-top:12px">New here? <a href="#signup">Create an account</a> · <a href="#kid-login">Kid login</a></p>
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

// ======================= kid login =======================
route('kid-login', async () => {
  app().innerHTML = topbar(`<div class="container" style="max-width:520px">
    <div class="card center">
      <div class="big-emoji">🚀</div>
      <h2>Kid Launch Pad</h2>
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
      if (!kids.length) return showError('#k-err', 'No learners yet — ask your parent to add you!');
      $('#k-kids').innerHTML = '<h3>Who are you?</h3><div class="avatar-pick" style="margin-top:10px">' +
        kids.map(k => `<div class="avatar-opt" data-id="${k.id}" title="${esc(k.name)}">${AVATARS[k.avatar] || '🦊'}<div style="font-size:.8rem;font-weight:700">${esc(k.name)}</div></div>`).join('') + '</div>';
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
        : rec.type === 'more' ? (playful() ? `Keep the ${s.label} roll going 🔥` : `${s.label}: keep the momentum`)
        : (playful() ? `Fresh ${s.label} adventure awaits ✨` : `${s.label}: nothing logged today`);
      const sub = rec.type === 'place' ? (playful() ? 'A quick quiz finds your perfect starting spot.' : 'Short adaptive assessment — a few minutes.')
        : rec.type === 'boost' ? (playful() ? 'A few wins here and your skill power jumps!' : 'Targeted reps where mastery is lowest.')
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
    ${(k.grade >= 6 && data.subjects.some(s => s.placed)) ? `
    <div class="focus-launch">
      <div><b>🎯 Focus Session</b><span class="muted-inv"> — 15 minutes, one subject, zero distractions. Serious progress, tracked.</span></div>
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
      <div class="zone-card" onclick="location.hash='#play'"><span class="zemoji">🕹️</span><b>${playful() ? 'Play Zone' : 'Arcade'}</b><span class="muted">${playful() ? 'Games cost 1 🎟️ — earn tokens by learning!' : 'Break games — 1 token each, earned by correct answers'}</span></div>
      <div class="zone-card" onclick="location.hash='#avatar'"><span class="zemoji">🎨</span><b>${playful() ? 'My Avatar' : 'Avatar'}</b><span class="muted">${playful() ? 'Spend coins on hats, pets & worlds' : 'Customize your profile with earned coins'}</span></div>
      <div class="zone-card" onclick="location.hash='#buddies'"><span class="zemoji">💌</span><b>Buddies</b><span class="muted">${playful() ? 'Cheer on your friends!' : 'See your crew’s streaks and send props'}</span></div>
    </div>
  </div>`);
  wireChrome();
  $('#autoread-btn').onclick = () => { $('#autoread-btn').textContent = Voice.toggleAuto() ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'; };
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
      div.innerHTML = `<img src="/logo-roundel.svg" alt="" style="width:100px;height:100px">
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
      if (e.status === 402) { renderPaywall(); return; }
      app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
        <div class="big-emoji">🐎</div><h2>Quick hiccup!</h2>
        <p class="muted" style="margin:10px 0 18px">That didn't load. Tap below to continue your placement quiz.</p>
        <button class="btn green" id="retry-p">Continue →</button>
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
        ${qn.passage ? `<div class="passage-box"><span class="passage-tag">📖 ${playful() ? 'Read the story' : 'Read the passage'}</span>${esc(qn.passage)}</div>` : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
          <button class="choice idk" data-i="-1">🤷 ${playful() ? "I haven't learned this yet" : "Haven't covered this yet"}</button>
        </div>
        ${data.progress === 0 ? `<p class="muted" style="margin-top:16px">${playful() ? 'No guessing needed! Saying "I haven\'t learned this yet" is a SMART answer — it helps me find lessons that fit you.' : 'Skip anything you haven\'t covered — honest answers give you an accurate starting level.'}</p>` : ''}
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    if (Voice.auto) Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.i);
      if (i === -1) Sound.click(); else if (i === qn.answerIndex) Sound.correct(); else Sound.wrong();
      step({ answerIndex: i, questionAnswerIndex: qn.answerIndex, probeGrade: data.probeGrade });
    });
  }
  function finish(data) {
    Sound.levelup(); Confetti.burst(160);
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">🎯</div>
      <h2>Level found: ${esc(data.levelName)}!</h2>
      <p class="muted" style="margin:10px 0 20px">Your ${esc(subject)} adventure starts right at YOUR level — not too easy, not too hard. Just right.</p>
      <button class="btn green" onclick="location.hash='#lesson/${subject}'">Start Learning →</button>
      <button class="btn ghost small" style="color:#6C5CE7;border-color:#6C5CE7;margin-left:8px" onclick="location.hash='#home'">Back Home</button>
    </div></div>`);
    wireChrome();
  }
  await step(null);
});

// ======================= lesson player =======================
route('lesson', async (subject, mode) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  const focus = mode === 'focus';
  const FOCUS_MIN = 15;
  const SESSION_LEN = focus ? 9999 : 10;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), events: [], endAt: focus ? Date.now() + FOCUS_MIN * 60000 : null };
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
      const data = await api(`/learn/${kidId}/next/${subject}`);
      render(data);
    } catch (e) {
      if (e.status === 402) { renderPaywall(); return; }
      // Never leave a kid stuck: one auto-retry, then a friendly tap-to-retry card.
      try {
        await new Promise(r => setTimeout(r, 800));
        const data = await api(`/learn/${kidId}/next/${subject}`);
        render(data);
      } catch (e2) {
        app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
          <div class="big-emoji">🐎</div><h2>Whoa — quick water break!</h2>
          <p class="muted" style="margin:10px 0 18px">The next question didn't load. Your progress is saved — tap below to keep going.</p>
          <button class="btn green" id="retry-q">Keep Going →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:8px" onclick="location.hash='#home'">Back to Subjects</button>
        </div></div>`);
        wireChrome();
        $('#retry-q').onclick = () => { Sound.click(); nextQuestion(); };
      }
    }
  }

  function render(data) {
    const qn = data.question;
    const modeLabel = { boost: '💪 Power-Up (extra practice!)', learn: '🌱 New Challenge', review: '✨ Quick Review', retention: '🧠 Memory Check (keeping it sharp!)' }[data.mode] || '';
    const qStart = Date.now();
    let answered = false;
    // Typed-answer mode: ~30% of numeric math questions (grade 2+) ask the kid
    // to TYPE the answer — recall beats recognition for real mastery.
    const numericQ = qn.choices.every(c => /^-?\d+(\.\d+)?$/.test(String(c).trim()));
    const typed = subject === 'math' && numericQ && (State.me.kid.grade >= 2) && Math.random() < 0.3;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${focus ? '🎯 Focus Session — ' + esc(SUBJECT_STYLE[subject] === style ? subject.charAt(0).toUpperCase() + subject.slice(1) : subject) : style.emoji + ' ' + style.cheer}</b>
        ${focus ? '' : gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${focus ? `⏱ <span id="focus-left">${fmtLeft(session.endAt - Date.now())}</span> · ${session.n} answered` : session.n + '/' + SESSION_LEN}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)} · ${esc(modeLabel)}</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        ${qn.passage ? `<div class="passage-box"><span class="passage-tag">📖 ${playful() ? 'Read the story' : 'Read the passage'}</span>${esc(qn.passage)}</div>` : ''}
        <div class="q-prompt">${esc(qn.prompt)}</div>
        ${typed ? `<div class="typed-wrap">
          <input id="typed-in" class="typed-input" inputmode="decimal" autocomplete="off" placeholder="${playful() ? 'Type your answer!' : 'Your answer'}" aria-label="Type your answer">
          <button class="btn green" id="typed-go">Check ✓</button>
        </div>
        <p class="muted" style="margin-top:8px;font-size:.85rem">${playful() ? '🧠 No choices this time — show what you know!' : 'Free response — recall practice.'}</p>`
        : `<div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>`}
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Trust yourself — read it once more, slowly.')}</div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#home'">Exit</button>
        </div>
        <div class="too-tricky"><button class="tt-btn" id="tt-btn">${playful() ? '🐴 Whoa — too tricky? Gallop back to easier questions' : 'Too difficult? Step back a level'}</button></div>
        <div class="mastery-mini">Skill power: <span id="mastery-pct">${Math.round((data.skill.mastery || 0) * 100)}%</span>
          <div class="mastery-bar"><div id="mastery-fill" style="width:${(data.skill.mastery || 0) * 100}%"></div></div>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    if (Voice.auto) Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };
    $('#tt-btn').onclick = async () => {
      Sound.click();
      const btn = $('#tt-btn'); btn.disabled = true; btn.textContent = playful() ? '🐴 Galloping back…' : 'Adjusting…';
      try {
        const r = await api(`/learn/${kidId}/level-shift/${subject}`, { method: 'POST', body: { delta: -1 } });
        toast(playful() ? `🌈 No worries! We galloped back to ${r.levelName} questions. You've got this!` : `Level adjusted to ${r.levelName}.`);
        nextQuestion();
      } catch (e) { btn.disabled = false; btn.textContent = playful() ? '🐴 Whoa — too tricky? Gallop back to easier questions' : 'Too difficult? Step back a level'; }
    };
    // Keyboard: 1-4 answer, Enter = next, H = hint (great for desktop & teens)
    document.onkeydown = e => {
      if (document.querySelector('.celebrate')) return;
      const ti = document.activeElement && document.activeElement.id === 'typed-in';
      if (ti) { if (e.key === 'Enter') { const g = $('#typed-go'); if (g && !g.disabled) g.click(); } return; }
      if (e.key >= '1' && e.key <= '4') { const c = document.querySelectorAll('.choice')[Number(e.key) - 1]; if (c && !c.disabled) c.click(); }
      else if (e.key === 'Enter') { const nb = $('#next-btn'); if (nb && nb.style.display !== 'none') nb.click(); }
      else if (e.key.toLowerCase() === 'h') { const hb = $('#hint-btn'); if (hb) hb.click(); }
    };

    async function settle(correct) {
      const fb = $('#feedback');
      const why = whyLine(subject, qn.skillName);
      if (correct) {
        Sound.correct(); Confetti.burst(40);
        const praise = (playful() ? PRAISE : PRAISE_TEEN)[Math.floor(Math.random() * (playful() ? PRAISE : PRAISE_TEEN).length)];
        fb.className = 'feedback good';
        fb.innerHTML = `<b>${praise}</b> ${esc(qn.explain || "")}<div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>`;
        if (Voice.auto && playful()) Voice.speak(praise.replace(/[^\w\s'!¡.,á-úÁ-Ú-]/g, ''));
      } else {
        Sound.wrong();
        const enc = (playful() ? ENCOURAGE : ENCOURAGE_TEEN)[Math.floor(Math.random() * (playful() ? ENCOURAGE : ENCOURAGE_TEEN).length)];
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>${enc}</b><br>${esc(qn.explain || "")}`;
        // Big teaching moment: pop the explanation up LARGE, and make sure they saw it.
        const pop = document.createElement('div');
        pop.className = 'celebrate';
        pop.innerHTML = `<div class="explain-pop">
          <div class="big-emoji">${style.emoji}</div>
          <h2>${playful() ? 'Let\'s learn it! 💡' : 'Here\'s the idea'}</h2>
          <p class="explain-text">The answer is <b>${esc(qn.choices[qn.answerIndex])}</b>.<br>${esc(qn.explain || qn.hint || '')}</p>
          <div class="why-line">🌍 <b>Real world:</b> ${esc(why)}</div>
          <button class="btn sun" style="margin-top:14px">${playful() ? 'Got it! 👍' : 'Understood →'}</button>
        </div>`;
        pop.querySelector('button').onclick = () => { pop.remove(); Sound.click(); };
        setTimeout(() => { document.body.appendChild(pop); const b = pop.querySelector('button'); if (b) b.focus(); }, 650);
        if (Voice.auto) Voice.speak(`The answer is ${qn.choices[qn.answerIndex]}. ${qn.explain || ''}`, 'en-US');
      }
      session.n++; if (correct) session.correct++;
      try {
        const res = await api(`/learn/${kidId}/answer`, {
          method: 'POST',
          body: { subject, skillId: qn.skillId, correct, timeMs: Date.now() - qStart, difficulty: qn.difficulty }
        });
        session.xp += res.xpGained || 0;
        $('#mastery-pct').textContent = Math.round(res.mastery * 100) + '%';
        $('#mastery-fill').style.width = (res.mastery * 100) + '%';
        (res.events || []).forEach(ev => session.events.push(ev));
        const celebration = (res.events || []).find(ev => ev.type === 'levelup' || ev.type === 'badge' || ev.type === 'token');
        if (celebration) setTimeout(() => celebrate(celebration), 700);
      } catch (e) { /* keep playing even if network hiccups */ }
      $('#next-btn').style.display = 'inline-flex';
      $('#next-btn').focus();
      $('#next-btn').onclick = () => { Sound.click(); nextQuestion(); };
    }

    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) document.querySelectorAll('.choice')[qn.answerIndex].classList.add('reveal');
      settle(correct);
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
      ? (session.n >= 15 ? 'Focus session complete — that was real studying.' : 'Focus session complete.')
      : pct >= 80 ? 'Outstanding! Your brain is glowing!' : pct >= 60 ? 'Strong work — you\'re growing fast!' : 'Every try makes you smarter. Let\'s keep building!';
    Confetti.burst(focus ? 120 : pct >= 80 ? 200 : 80); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${msg}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${focus ? session.n : SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      ${focus ? `<p class="muted" style="margin:6px 0 2px">${session.n} questions in ${FOCUS_MIN} minutes${pct ? ` · ${pct}% accuracy` : ''}. ${pct >= 80 && session.n >= 15 ? 'Elite session. 🏆' : 'Consistency compounds — same time tomorrow?'}</p>` : ''}
      <button class="btn green" onclick="location.hash='#lesson/${subject}${focus ? '/focus' : ''}';location.reload()">${focus ? 'New Session 🎯' : 'Play Again 🔁'}</button>
      <button class="btn" style="margin-left:8px" onclick="location.hash='#home'">More Subjects →</button>
    </div></div>`);
    wireChrome();
  }

  await nextQuestion();
});

// ======================= report card =======================
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
          ${isParent ? `<button class="btn ghost small no-print" style="color:#6C5CE7;border-color:#6C5CE7" onclick="location.hash='#parent'">← Dashboard</button>` : ''}
        </div>
      </div>
      <p class="muted">${r.pace.summer ? `☀️ ${esc(r.pace.note)}` : `${esc(r.pace.label)} · ${Math.round(r.pace.pctThroughYear * 100)}% through the year`} · ${r.weekAnswers} question${r.weekAnswers === 1 ? '' : 's'} this week (goal: ${k.weekly_goal * 10})</p>
      <div style="margin-top:18px">
      ${r.subjects.map(s => `
        <div class="subject-report">
          <div class="head">
            <h3>${SUBJECT_STYLE[s.subject].emoji} ${esc(s.label)} <span class="muted" style="font-size:.9rem">· working at ${esc(s.levelName)}</span></h3>
            <div class="letter" style="color:${SUBJECT_STYLE[s.subject].color}">${esc(s.letter)}</div>
          </div>
          ${s.placed ? `
            <p class="muted" style="margin:6px 0">${s.questionsAnswered} question${s.questionsAnswered === 1 ? '' : 's'} · ${s.accuracy != null ? Math.round(s.accuracy * 100) + '% accuracy' : 'just getting started'}</p>
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
          ` : `<p class="muted">Placement quiz not taken yet — jump in to find the right level!</p>`}
        </div>`).join('')}
      </div>
    </div>
    ${isParent && r.history ? (() => {
      const H = r.history, max = Math.max(1, ...H.map(x => x.answers));
      const total = H.reduce((t, x) => t + x.answers, 0);
      const corr = H.reduce((t, x) => t + x.correct, 0);
      const activeDays = H.filter(x => x.answers > 0).length;
      const bars = H.map((x, i) => {
        const h = Math.round(x.answers / max * 70);
        const acc = x.answers ? x.correct / x.answers : 0;
        const col = !x.answers ? '#e3e0d8' : acc >= 0.8 ? '#1f8a5f' : acc >= 0.55 ? '#c9971c' : '#d97b4f';
        return `<g><rect x="${i * 34 + 4}" y="${86 - h}" width="26" height="${Math.max(3, h)}" rx="4" fill="${col}"/>
          <text x="${i * 34 + 17}" y="99" font-size="8" text-anchor="middle" fill="#98a0af">${x.day.slice(8)}</text></g>`;
      }).join('');
      return `<div class="card">
        <h3>📈 Last 14 days</h3>
        <p class="muted" style="margin:4px 0 10px">${total} questions · ${total ? Math.round(corr / total * 100) : 0}% correct · active ${activeDays} of 14 days</p>
        <svg viewBox="0 0 480 104" style="width:100%;height:auto" role="img" aria-label="Daily activity chart">${bars}</svg>
        <p class="muted" style="font-size:.78rem;margin-top:6px">Bar height = questions answered · <span style="color:#1f8a5f">■</span> 80%+ correct · <span style="color:#c9971c">■</span> 55–79% · <span style="color:#d97b4f">■</span> below 55%</p>
      </div>`;
    })() : ''}
    <div class="card">
      <h3>🏅 Badges</h3>
      <div class="badge-shelf" style="margin-top:10px">
        ${r.badges.length ? r.badges.map(b => `<div class="badge-item">${b.emoji} ${esc(b.name)}</div>`).join('') : '<p class="muted">Badges appear as you learn — the first one is one answer away!</p>'}
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
    if (!confirm(`Retake the ${sub} placement quiz? ${esc(k.name)} will re-do the short assessment next time they open ${sub} — progress and badges are kept.`)) return;
    await api(`/learn/${kidId}/placement/${sub}/retake`, { method: 'POST', body: {} });
    Sound.badge();
    b.textContent = '✅ Placement reset — quiz runs on next visit';
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
    const col = !x.answers ? '#e3e0d8' : a2 >= 0.8 ? '#1f8a5f' : a2 >= 0.55 ? '#c9971c' : '#d97b4f';
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
            <img src="/logo-roundel.svg" alt="" style="width:58px;height:58px">
            <div><div class="cert-academy" style="font-size:.7rem">GALLOP LEARNING ACADEMY</div>
            <h2 style="margin:2px 0 0;font-family:var(--font-display)">${esc(k.name)}'s Week ${stars}</h2></div>
          </div>
          <div style="text-align:right;color:#7d8496;font-size:.85rem">${new Date(Date.now() - 6 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>🔥 ${k.streak}-day streak</div>
        </div>
        <div class="summary-stats" style="margin:16px 0 6px">
          <div class="sstat"><div class="n">${total}</div>questions</div>
          <div class="sstat"><div class="n">${acc}%</div>correct</div>
          <div class="sstat"><div class="n">${activeDays}/7</div>days active</div>
          ${best ? `<div class="sstat"><div class="n">${best.letter}</div>${esc(best.label)}</div>` : ''}
        </div>
        <svg viewBox="0 0 458 92" style="width:100%;height:auto;margin:8px 0">${bars}</svg>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
          <div><b style="color:#1f8a5f">💪 Shining at</b><br><span class="muted" style="font-size:.9rem">${strengthList.length ? strengthList.map(esc).join('<br>') : 'Building the basics — stars incoming!'}</span></div>
          <div><b style="color:#c9971c">🎯 Working on</b><br><span class="muted" style="font-size:.9rem">${focusList.length ? focusList.map(esc).join('<br>') : 'No trouble spots this week!'}</span></div>
        </div>
        <p style="margin-top:16px;font-size:.85rem;color:#7d8496;border-top:1px dashed #ddd;padding-top:10px">${total >= 100 ? `Outstanding week, ${esc(k.name)} — over 100 questions! The gallop is real. 🐎` : total >= 50 ? `Great consistency, ${esc(k.name)} — keep that streak alive! 🐎` : total > 0 ? `Every question counts, ${esc(k.name)} — let's pick up the pace next week! 🐎` : `A fresh week awaits — first quest starts today! 🐎`}</p>
      </div>
    </div>
    <div class="center no-print" style="margin-top:16px">
      <button class="btn" onclick="window.print()">🖨️ Print for the Fridge</button>
      <button class="btn ghost small" style="color:#1f5e46;border-color:#1f5e46;margin-left:8px" onclick="location.hash='#${State.me.role === 'parent' ? 'parent' : 'home'}'">← Back</button>
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
  const date = new Date(c.issued_at + 'Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  app().innerHTML = topbar(`<div class="container" style="max-width:860px">
    <div class="cert-frame">
      <div class="cert-inner">
        <img src="/logo-roundel.svg" alt="" class="cert-crest">
        <div class="cert-academy">GALLOP LEARNING ACADEMY</div>
        <div class="cert-title">Certificate of Mastery</div>
        <div class="cert-rule"></div>
        <p class="cert-line">This certifies that</p>
        <div class="cert-name">${esc(r.kid.name)}</div>
        <p class="cert-line">has demonstrated complete mastery of every skill in</p>
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
      <button class="btn ghost small" style="color:#1f5e46;border-color:#1f5e46;margin-left:8px" onclick="location.hash='#report/${kidId}'">← Back to Report</button>
    </div>
  </div>`);
  wireChrome();
});

// ======================= paywall =======================
function renderPaywall() {
  app().innerHTML = topbar(`<div class="container" style="max-width:600px"><div class="card center">
    <img src="/logo-roundel.svg" alt="" style="width:84px;height:84px">
    <h2 style="margin-top:10px">Your free trial has ended</h2>
    <p class="muted" style="margin:10px 0 4px"><b>Everything is saved</b> — streaks, skill levels, badges, and certificates are waiting exactly where you left off.</p>
    <p class="muted" style="margin:0 0 16px">Keep all 4 subjects, the adaptive tutor, the games arcade, buddies, and weekly parent reports — for less than one week of a tutoring center.</p>
    ${State.me.role === 'parent'
      ? `<button class="btn green" id="sub-family">Family — $49/mo (up to 4 kids)</button> <button class="btn" style="margin-left:8px" id="sub-solo">Solo — $29/mo</button>
         <p class="muted" style="margin-top:12px;font-size:.85rem">Cancel anytime from your dashboard.</p>`
      : `<p><b>Ask your parent to log in and subscribe!</b></p><button class="btn" onclick="location.hash='#login'">Parent Login</button>`}
  </div></div>`);
  wireChrome();
  const fam = $('#sub-family'), solo = $('#sub-solo');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
}
async function checkout(plan) {
  const out = await api('/billing/checkout', { method: 'POST', body: { plan } });
  if (out.demo) { await refreshMe(); Confetti.burst(150); Sound.levelup(); location.hash = '#parent'; }
  else location.href = out.url;
}

// ======================= parent dashboard =======================
route('parent', async () => {
  await refreshMe();
  if (State.me.role !== 'parent') { location.hash = '#login'; return; }
  const me = State.me;
  const p = me.parent;
  const trialDays = Math.max(0, Math.ceil((new Date(p.trial_ends + 'Z') - Date.now()) / 86400000));
  const subLine = p.sub_status === 'active'
    ? `✅ ${esc((me.plans[p.sub_plan] || {}).name || 'Subscribed')} plan active`
    : p.sub_status === 'trial'
      ? (trialDays > 0 ? `⏳ Free trial — ${trialDays} day${trialDays === 1 ? '' : 's'} left` : '🔒 Trial ended')
      : `🔒 Subscription ${esc(p.sub_status)}`;

  const trialUrgent = p.sub_status === 'trial' && trialDays > 0 && trialDays <= 3;
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>Welcome, ${esc(p.name)} 👋</h1><p>${subLine} ${me.billingMode === 'demo' ? '· <i>(demo billing — add Stripe keys to charge real cards)</i>' : ''}</p></div>
    ${trialUrgent ? `<div class="trial-banner">
      <div><b>⏳ Your free trial ends in ${trialDays} day${trialDays === 1 ? '' : 's'}.</b><br>
      <span>All progress, streaks, badges and certificates are saved — subscribing keeps the gallop going without missing a day.</span></div>
      <div style="white-space:nowrap"><button class="btn sun" id="tb-family">Family — $49/mo</button>
      <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.6);margin-left:8px" id="tb-solo">Solo — $29/mo</button></div>
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
              <button class="btn small" data-weekly="${k.id}" title="Printable weekly summary">📄</button>
              <button class="btn small" data-edit="${k.id}" title="Edit learner">✏️</button>
              <button class="btn coral small" data-del="${k.id}">✕</button>
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
        <p class="muted" style="font-size:.83rem;margin-top:6px">This is just their starting look — kids fully customize it in the Avatar Builder with hats, pets & worlds they buy with coins they earn by learning. 🎨</p>
        <div class="error-msg" id="nk-err"></div>
        <button class="btn green" style="margin-top:14px;width:100%" id="nk-go">Add Learner ✨</button>
      </div>
      <div>
        <div id="family-week"></div>
        <div class="card">
          <h3>💳 Subscription</h3>
          <p class="muted" style="margin:8px 0 14px">${subLine}</p>
          ${p.sub_status !== 'active' ? `
            <button class="btn green" style="width:100%" id="sub-family">Family — $49/mo (up to 4 kids)</button>
            <button class="btn" style="width:100%;margin-top:8px" id="sub-solo">Solo — $29/mo (1 kid)</button>` : `
            <button class="btn" style="width:100%" id="sub-portal">Manage Billing</button>`}
          <p class="muted center" style="margin-top:10px;font-size:.85rem">${me.billingMode === 'stripe' ? 'Payments powered by Stripe' : 'Demo mode: clicking subscribe activates instantly, no card needed. Set STRIPE_SECRET_KEY to enable real payments.'}</p>
        </div>
        <div class="card">
          <h3>🔐 Account</h3>
          <label>Current password</label><input id="cp-cur" type="password" autocomplete="current-password">
          <label>New password (6+ characters)</label><input id="cp-new" type="password" autocomplete="new-password">
          <div class="error-msg" id="cp-err"></div>
          <button class="btn small" style="margin-top:10px" id="cp-go">Change Password</button>
          <span id="cp-ok" style="margin-left:10px;color:#1f8a5f;font-weight:700;display:none">✓ Updated!</span>
        </div>
        <div class="card">
          <h3>🚀 How kids log in (any device)</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">1. Go to this site on any PC, Mac, or tablet<br>2. Tap <b>Kid Login</b> → enter <b>${esc(p.email)}</b><br>3. They pick their avatar & enter their 4-digit PIN<br><br>That's it — progress syncs everywhere. 🎉</p>
        </div>
        <div class="card">
          <h3>💌 School Buddies</h3>
          <p class="muted" style="margin-top:8px">Connect your kids with friends from school — <b>parent-approved only</b>. Kids see each other's streaks & badges and send pre-written cheers. No open chat, ever.</p>
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
          <p class="muted" style="margin-top:8px;line-height:1.6">Each subject starts with a <b>placement quiz</b> — so a child can be Grade 4 in reading and Grade 2 in math at the same time. Every answer updates skill mastery: strong skills advance faster, shaky skills get gentler questions, more hints, and extra reps. Master a whole grade level and they earn a <b>certificate</b> 🎓. Correct answers also earn <b>play tokens</b> for the games in the Play Zone — learning first, always.</p>
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
      const wasFirst = me.kids.length === 0;
      const kidName = $('#nk-name').value.trim();
      const r = await api('/kids', { method: 'POST', body: { name: kidName, grade: Number($('#nk-grade').value), pin: $('#nk-pin').value, avatar, calendar_mode: $('#nk-cal').value } });
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
  // "Time to Gallop!" — straight from signup into learning, no re-login needed.
  function timeToGallop(kidId, kidName) {
    Confetti.burst(180); Sound.levelup();
    const div = document.createElement('div');
    div.className = 'celebrate';
    div.innerHTML = `<img src="/logo-roundel.svg" alt="" style="width:110px;height:110px"><h2>Time to Gallop!</h2>
      <p style="font-size:1.15rem;max-width:440px">${esc(kidName)} is all set up. Jump straight in — the first stop in each subject is a friendly placement quiz that finds ${esc(kidName)}'s perfect starting level.</p>
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
      <p style="font-size:1.15rem;max-width:420px">Welcome to Gallop Learning Academy! First step: add your learner — name, grade, and a 4-digit PIN they'll use to log in on any device.</p>
      <button class="btn sun">Add my learner →</button>`;
    div.querySelector('button').onclick = () => { div.remove(); const f = $('#nk-name'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.focus(); } };
    document.body.appendChild(div);
  }
  async function loadLevels(kidId) {
    const box = $('#levels-' + kidId);
    if (!box) return;
    try {
      const r = await api('/kids/' + kidId + '/levels');
      box.innerHTML = `<b style="font-size:.85rem">📚 Working levels <span class="muted" style="font-weight:400">(if a subject feels too hard, lower it — Gallop re-adapts from there)</span></b>
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
  const tbf = $('#tb-family'), tbs = $('#tb-solo');
  if (tbf) tbf.onclick = () => checkout('family');
  if (tbs) tbs.onclick = () => checkout('solo');
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
  if (portal) portal.onclick = async () => { const o = await api('/billing/portal', { method: 'POST' }); location.href = o.url; };
  // Sibling leaderboard — only interesting with 2+ kids
  if (me.kids.length >= 2) {
    api('/family/stats').then(({ stats }) => {
      const medals = ['🥇', '🥈', '🥉', '🎗️'];
      const box = $('#family-week');
      if (!box) return;
      box.innerHTML = `<div class="card">
        <h3>🏆 This Week at Home</h3>
        <p class="muted" style="margin:4px 0 10px">Questions answered in the last 7 days — a little friendly sibling rivalry never hurt!</p>
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
  if (State.me.role !== 'parent' || !State.me.parent.is_admin) { location.hash = '#parent'; return; }
  const d = await api('/admin/overview');
  const t = d.totals;
  const fmtDate = s => s ? s.slice(0, 10) : '—';
  const statusPill = st => st === 'active' ? '<span class="pill strength">active</span>' : st === 'trial' ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">trial</span>' : `<span class="pill focus">${esc(st)}</span>`;
  const maxSign = Math.max(1, ...d.signups.map(x => x.n));
  app().innerHTML = topbar(`<div class="container">
    <div class="dash-welcome" style="margin-bottom:14px"><h1>🛡️ Gallop Command Center</h1><p>Owner dashboard — live business & learning metrics${t.testAccounts ? ` · <i>${t.testAccounts} dev/test account${t.testAccounts === 1 ? '' : 's'} hidden from all numbers</i>` : ''}</p></div>
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
          <h3>📈 Signups — last 14 days</h3>
          ${d.signups.length ? `<svg viewBox="0 0 480 80" style="width:100%;height:auto">${d.signups.map((x, i) => `<g><rect x="${i * 34 + 4}" y="${62 - Math.round(x.n / maxSign * 55)}" width="26" height="${Math.max(3, Math.round(x.n / maxSign * 55))}" rx="4" fill="#1f8a5f"/><text x="${i * 34 + 17}" y="76" font-size="8" text-anchor="middle" fill="#98a0af">${x.d.slice(5)}</text></g>`).join('')}</svg>` : '<p class="muted">No signups in the last 14 days.</p>'}
        </div>
      </div>
      <div>
        <div class="card">
          <h3>🧾 Recent families <a class="btn ghost small" style="float:right;color:#1f5e46;border-color:#1f5e46" href="/api/admin/export.csv" download>⬇️ CSV</a></h3>
          <div style="margin-top:10px;overflow-x:auto">
            ${d.recent.map(p => `
              <div class="kid-row" style="flex-wrap:wrap">
                <div style="flex:1;min-width:180px"><b>${esc(p.name)}</b> ${statusPill(p.sub_status)}${p.sub_status === 'active' ? ` <span class="muted">$${p.sub_plan === 'family' ? 49 : 29}/mo</span>` : ''} ${p.kids === 0 ? '<span class="pill focus">needs setup</span>' : p.weekAnswers === 0 ? '<span class="pill" style="background:#fdf3d7;color:#7a5b00">quiet this week</span>' : '<span class="pill strength">learning ✓</span>'}<br>
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
window.BP = { $, app, esc, api, route, routes, navigate, topbar, wireChrome, showError, State, Sound, Voice, Confetti, AVATARS, ITEM_EMOJI, avatarHTML, refreshMe };

// ======================= boot =======================
(async function boot() {
  try { await refreshMe(); } catch (e) { /* offline-ish */ }
  // preload speech voices (some browsers lazy-load)
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  // installable app (iPad home screen, Chromebook, etc.)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  // let games.js register its routes before first render
  setTimeout(navigate, 0);
})();
