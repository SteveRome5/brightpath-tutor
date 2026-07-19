/* Gallop Learning Academy SPA — vanilla JS, zero build step */
'use strict';

// ======================= tiny helpers =======================
const $ = sel => document.querySelector(sel);
const app = () => $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
const ITEM_EMOJI = { crown: '👑', tophat: '🎩', cap: '🧢', party: '🥳', grad: '🎓', cowboy: '🤠', halo: '😇', glasses: '👓', sunglasses: '🕶️', bowtie: '🎀', medal: '🏅', guitar: '🎸', wand: '🪄', skateboard: '🛹', rainbow: '🌈', space: '🌌', beach: '🏖️', castle: '🏰', volcano: '🌋', city: '🌆', garden: '🌻', pup: '🐶', kitten: '🐱', bunny: '🐰', turtle: '🐢', butterfly: '🦋', dino: '🦕', sloth: '🦥' };
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
function whyLine(subject) {
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
  function speak(text, lang) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[🍎⭐🐤🎈🚗🐞🍓🐟🍪🐸\u{1F300}-\u{1FAFF}]/gu, ''));
      u.rate = 0.95; u.pitch = 1.05;
      if (lang) u.lang = lang;
      const voices = speechSynthesis.getVoices();
      if (lang && lang.startsWith('es')) {
        const v = voices.find(v => v.lang.startsWith('es'));
        if (v) u.voice = v;
      }
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
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.15 });
addEventListener('hashchange', navigate);

// ======================= shared chrome =======================
function topbar(inner = '') {
  const me = State.me;
  let right = '';
  if (me.role === 'parent') right = `<button class="btn ghost small" onclick="location.hash='#parent'">Dashboard</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else if (me.role === 'kid') right = `<button class="btn ghost small" onclick="location.hash='#home'">My Subjects</button><button class="btn ghost small" id="logout-btn">Log out</button>`;
  else right = `<button class="btn ghost small" onclick="location.hash='#kid-login'">Kid Login</button><button class="btn sun small" onclick="location.hash='#login'">Parent Login</button>`;
  return `
  <div class="topbar">
    <div class="logo" onclick="location.hash='#'"><span class="spark">🐎</span> Gallop</div>
    <div class="right">
      <button class="btn ghost small" id="mute-btn" title="Sound effects">${Sound.muted ? '🔇' : '🔊'}</button>
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
    <button class="btn" onclick="location.hash='${State.me.role === 'parent' ? '#parent' : '#signup'}'">Start your 14-day free trial</button>
    <button class="btn ghost" style="margin-left:8px" onclick="location.hash='#kid-login'">Student sign-in</button>
    <div class="horse-runner">🐎</div>
  </div>
  <div class="container">
    <div class="statband reveal">
      <div><b>K–12</b><span>Every grade level</span></div>
      <div><b>4</b><span>Core subjects</span></div>
      <div><b>131</b><span>Skill areas</span></div>
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
      <div class="feature reveal"><h3>An experience that grows up</h3><p>A 1st grader gets color, sound, and celebration. An 11th grader gets a clean, serious study environment. Same engine, age-appropriate design.</p></div>
      <div class="feature reveal"><h3>Motivation, done right</h3><p>Correct answers earn tokens for a games arcade and coins for avatar customization. Learning is always the engine — play is the reward.</p></div>
      <div class="feature reveal"><h3>Safe connection</h3><p>Students connect only with buddies their parents approve, and encourage each other with pre-written cheers. No open chat, no strangers, ever.</p></div>
      <div class="feature reveal"><h3>Your schedule</h3><p>Traditional school year, year-round, or homeschool calendar — weekly goals pace the work to your family's rhythm, on any device.</p></div>
    </div>
    <div class="card reveal" style="margin-top:40px">
      <h2 class="center" style="margin-bottom:6px">Simple plans</h2>
      <p class="center muted" style="margin-bottom:20px">14-day free trial. Cancel anytime.</p>
      <div class="plans">
        <div class="plan"><h3>Solo</h3><div class="price">$19<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">One student · all four subjects · full adaptive tutor & reports</p></div>
        <div class="plan hot"><span class="tag">MOST POPULAR</span><h3>Family</h3><div class="price">$29<span style="font-size:1rem;font-family:var(--font-body)">/mo</span></div><p class="muted">Up to four students · all subjects · reports, certificates & buddies</p></div>
      </div>
    </div>
  </div>
  <div class="site-footer">© ${new Date().getFullYear()} Gallop Learning Academy · Adaptive tutoring for grades K–12<br>
    <a class="ig-link" href="https://instagram.com/learnwithgallop" target="_blank" rel="noopener">Follow us on Instagram — @learnwithgallop</a>
  </div>`);
  wireChrome();
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
    </div></div>`);
  wireChrome();
  $('#f-go').onclick = async () => {
    try {
      await api('/auth/signup', { method: 'POST', body: { name: $('#f-name').value, email: $('#f-email').value, password: $('#f-pass').value } });
      await refreshMe(); Sound.levelup(); location.hash = '#parent';
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
  const k = data.kid;
  app().innerHTML = topbar(`<div class="container">
    <div class="kid-header">
      <div class="avatar-big" onclick="location.hash='#avatar'" style="cursor:pointer" title="Customize me!">${avatarHTML(k)}</div>
      <div>
        <h1>${playful() ? `Hi ${esc(k.name)}! Ready to level up? ⚡` : `Welcome back, ${esc(k.name)}.`}</h1>
        <div class="stat-chips" style="margin-top:8px">
          <span class="chip">${playful() ? '🔥 ' : ''}${k.streak}-day streak</span>
          <span class="chip">${playful() ? '⚡ ' : ''}${k.xp} XP</span>
          <span class="chip">${playful() ? '🪙 ' : ''}${k.coins} coins</span>
          <span class="chip">${playful() ? '🎟️ ' : ''}${k.play_tokens || 0} tokens</span>
        </div>
      </div>
      <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#report/${k.id}'">${playful() ? '📊 ' : ''}My Progress</button>
      <button class="btn ghost small" id="autoread-btn">${Voice.auto ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'}</button></div>
    </div>
    <div class="week-gallop">
      <div class="wg-head"><span>${playful() ? '🏇 This week’s gallop' : 'This week'}</span><span>${data.weekAnswers || 0} / ${(k.weekly_goal || 12) * 10} answers</span></div>
      ${gallopTrack(Math.min(100, (data.weekAnswers || 0) / ((k.weekly_goal || 12) * 10) * 100))}
    </div>
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
    const data = await api(`/learn/${kidId}/placement/${subject}`, { method: 'POST', body: body || { reset: current === null } });
    if (data.done) return finish(data);
    current = data;
    render(data);
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
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
          <button class="choice idk" data-i="-1">🤷 ${playful() ? "I haven't learned this yet" : "Haven't covered this yet"}</button>
        </div>
        <p class="muted" style="margin-top:16px">${playful() ? 'No guessing needed! Saying "I haven\'t learned this yet" is a SMART answer — it helps me find lessons that fit you perfectly. 💜' : 'Skip anything you haven\'t covered — honest answers give you an accurate starting level.'}</p>
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
route('lesson', async (subject) => {
  if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
  const kidId = State.me.kid.id;
  const style = SUBJECT_STYLE[subject];
  const SESSION_LEN = 10;
  const session = { n: 0, correct: 0, xp: 0, startedAt: Date.now(), events: [] };

  async function nextQuestion() {
    if (session.n >= SESSION_LEN) return summary();
    const data = await api(`/learn/${kidId}/next/${subject}`);
    render(data);
  }

  function render(data) {
    const qn = data.question;
    const modeLabel = { boost: '💪 Power-Up (extra practice!)', learn: '🌱 New Challenge', review: '✨ Quick Review' }[data.mode] || '';
    const qStart = Date.now();
    let answered = false;
    app().innerHTML = topbar(`<div class="container lesson-wrap">
      <div class="lesson-top">
        <b>${style.emoji} ${style.cheer}</b>
        ${gallopTrack(session.n / SESSION_LEN * 100)}
        <b>${session.n}/${SESSION_LEN}</b>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)} · ${esc(modeLabel)}</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <div class="hint-box" id="hint-box">💡 ${esc(qn.hint || 'Trust yourself — read it once more, slowly.')}</div>
        <div class="feedback" id="feedback"></div>
        <div class="lesson-actions">
          <button class="btn sun small" id="hint-btn">💡 Hint</button>
          <button class="btn green" id="next-btn" style="display:none">Next →</button>
          <button class="btn ghost small" style="color:#7f8c9b;border-color:#dfe6e9;margin-left:auto" onclick="location.hash='#home'">Exit</button>
        </div>
        <div class="mastery-mini">Skill power: <span id="mastery-pct">${Math.round((data.skill.mastery || 0) * 100)}%</span>
          <div class="mastery-bar"><div id="mastery-fill" style="width:${(data.skill.mastery || 0) * 100}%"></div></div>
        </div>
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    if (Voice.auto) Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    $('#hint-btn').onclick = () => { $('#hint-box').classList.add('show'); Sound.click(); };

    document.querySelectorAll('.choice').forEach(b => b.onclick = async () => {
      if (answered) return; answered = true;
      const i = Number(b.dataset.i);
      const correct = i === qn.answerIndex;
      document.querySelectorAll('.choice').forEach(x => x.disabled = true);
      b.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) document.querySelectorAll('.choice')[qn.answerIndex].classList.add('reveal');
      const fb = $('#feedback');
      if (correct) {
        Sound.correct(); Confetti.burst(40);
        fb.className = 'feedback good';
        fb.innerHTML = `<b>${(playful() ? PRAISE : PRAISE_TEEN)[Math.floor(Math.random() * (playful() ? PRAISE : PRAISE_TEEN).length)]}</b> ${esc(qn.explain || "")}<div class="why-line">🌍 <b>Real world:</b> ${esc(whyLine(subject))}</div>`;
      } else {
        Sound.wrong();
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>${(playful() ? ENCOURAGE : ENCOURAGE_TEEN)[Math.floor(Math.random() * (playful() ? ENCOURAGE : ENCOURAGE_TEEN).length)]}</b><br>${esc(qn.explain || "")}<div class="why-line">🌍 <b>Real world:</b> ${esc(whyLine(subject))}</div>`;
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
    });
  }

  function celebrate(ev) {
    const div = document.createElement('div');
    div.className = 'celebrate';
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
    document.body.appendChild(div);
  }

  function summary() {
    const pct = Math.round(session.correct / SESSION_LEN * 100);
    const mins = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '🌱';
    const msg = pct >= 80 ? 'Outstanding! Your brain is glowing!' : pct >= 60 ? 'Strong work — you\'re growing fast!' : 'Every try makes you smarter. Let\'s keep building!';
    Confetti.burst(pct >= 80 ? 200 : 80); if (pct >= 60) Sound.levelup();
    app().innerHTML = topbar(`<div class="container lesson-wrap"><div class="card center">
      <div class="big-emoji">${emoji}</div>
      <h2>${msg}</h2>
      <div class="summary-stats">
        <div class="sstat"><div class="n">${session.correct}/${SESSION_LEN}</div>correct</div>
        <div class="sstat"><div class="n">+${session.xp}</div>XP earned</div>
        <div class="sstat"><div class="n">${mins}</div>min${mins > 1 ? 's' : ''}</div>
      </div>
      <button class="btn green" onclick="location.hash='#lesson/${subject}';location.reload()">Play Again 🔁</button>
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
      <p class="muted">${esc(r.pace.label)} · ${Math.round(r.pace.pctThroughYear * 100)}% through the year · ${r.weekAnswers} question${r.weekAnswers === 1 ? '' : 's'} this week (goal: ${k.weekly_goal * 10})</p>
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
          ` : `<p class="muted">Placement quiz not taken yet — jump in to find the right level!</p>`}
        </div>`).join('')}
      </div>
    </div>
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
          <div class="cert"><b>🎓 ${esc(c.title)}</b><br><span class="muted">Awarded ${esc(c.issued_at.slice(0, 10))} · Gallop Learning Academy certifies mastery of ${esc(c.title.replace(' Complete!', ''))}</span></div>`).join('')
        : '<p class="muted">Complete every skill in a grade level to earn a printable certificate!</p>'}
      </div>
    </div>
  </div>`);
  wireChrome();
});

// ======================= paywall =======================
function renderPaywall() {
  app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
    <div class="big-emoji">🔒</div>
    <h2>Your free trial has ended</h2>
    <p class="muted" style="margin:10px 0 18px">Subscribe to keep the learning adventure going — all 4 subjects, unlimited practice, report cards & certificates.</p>
    ${State.me.role === 'parent'
      ? `<button class="btn green" id="sub-family">Family — $29/mo</button> <button class="btn" id="sub-solo">Solo — $19/mo</button>`
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

  app().innerHTML = topbar(`<div class="container">
    <div style="color:#fff;margin-bottom:14px"><h1>Welcome, ${esc(p.name)} 👋</h1><p>${subLine} ${me.billingMode === 'demo' ? '· <i>(demo billing — add Stripe keys to charge real cards)</i>' : ''}</p></div>
    <div class="dash-grid">
      <div class="card">
        <h3>👧 Your Learners</h3>
        <div id="kid-list" style="margin-top:12px">
          ${me.kids.length ? me.kids.map(k => `
            <div class="kid-row">
              <span class="avatar-sm">${AVATARS[k.avatar] || '🦊'}</span>
              <div style="flex:1"><b>${esc(k.name)}</b><br><span class="muted" style="font-size:.85rem">Grade ${k.grade === 0 ? 'K' : k.grade} · 🔥${k.streak} streak · ⚡${k.xp} XP · ${esc(k.calendar_mode)}</span></div>
              <button class="btn small" data-report="${k.id}">📊 Report</button>
              <button class="btn coral small" data-del="${k.id}">✕</button>
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
        <div class="error-msg" id="nk-err"></div>
        <button class="btn green" style="margin-top:14px;width:100%" id="nk-go">Add Learner ✨</button>
      </div>
      <div>
        <div class="card">
          <h3>💳 Subscription</h3>
          <p class="muted" style="margin:8px 0 14px">${subLine}</p>
          ${p.sub_status !== 'active' ? `
            <button class="btn green" style="width:100%" id="sub-family">Family — $29/mo (up to 4 kids)</button>
            <button class="btn" style="width:100%;margin-top:8px" id="sub-solo">Solo — $19/mo (1 kid)</button>` : `
            <button class="btn" style="width:100%" id="sub-portal">Manage Billing</button>`}
          <p class="muted center" style="margin-top:10px;font-size:.85rem">${me.billingMode === 'stripe' ? 'Payments powered by Stripe' : 'Demo mode: clicking subscribe activates instantly, no card needed. Set STRIPE_SECRET_KEY to enable real payments.'}</p>
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
      await api('/kids', { method: 'POST', body: { name: $('#nk-name').value, grade: Number($('#nk-grade').value), pin: $('#nk-pin').value, avatar, calendar_mode: $('#nk-cal').value } });
      Sound.badge(); navigate();
    } catch (e) { showError('#nk-err', e.message); }
  };
  document.querySelectorAll('[data-report]').forEach(b => b.onclick = () => location.hash = '#report/' + b.dataset.report);
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (confirm('Remove this learner and all their progress?')) { await api('/kids/' + b.dataset.del, { method: 'DELETE' }); navigate(); }
  });
  const fam = $('#sub-family'), solo = $('#sub-solo'), portal = $('#sub-portal');
  if (fam) fam.onclick = () => checkout('family');
  if (solo) solo.onclick = () => checkout('solo');
  if (portal) portal.onclick = async () => { const o = await api('/billing/portal', { method: 'POST' }); location.href = o.url; };
});

// ======================= shared API for games.js =======================
window.BP = { $, app, esc, api, route, routes, navigate, topbar, wireChrome, showError, State, Sound, Voice, Confetti, AVATARS, ITEM_EMOJI, avatarHTML, refreshMe };

// ======================= boot =======================
(async function boot() {
  try { await refreshMe(); } catch (e) { /* offline-ish */ }
  // preload speech voices (some browsers lazy-load)
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  // let games.js register its routes before first render
  setTimeout(navigate, 0);
})();
