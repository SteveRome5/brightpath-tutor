/* BrightPath SPA — vanilla JS, zero build step */
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

const AVATARS = { fox: '🦊', panda: '🐼', dragon: '🐉', unicorn: '🦄', robot: '🤖', astronaut: '🧑‍🚀', tiger: '🐯', octopus: '🐙' };
const SUBJECT_STYLE = {
  math: { color: '#6C5CE7', emoji: '🔢', cheer: 'Math Mission' },
  english: { color: '#00B894', emoji: '📚', cheer: 'Word Quest' },
  science: { color: '#0984E3', emoji: '🔬', cheer: 'Lab Time' },
  spanish: { color: '#E17055', emoji: '🌎', cheer: 'Spanish Adventure' }
};
const PRAISE = ['¡Fantástico!', 'Nailed it!', 'You’re on fire! 🔥', 'Brain power!', 'Boom! Correct!', 'Genius move!', 'Crushed it!', 'Superstar!'];
const ENCOURAGE = ['Almost! Every mistake grows your brain 🧠', 'Good try — let’s look at why:', 'So close! Here’s the trick:', 'No worries — even scientists mess up daily!'];

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
  let auto = localStorage.bp_autoread === '1';
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
  return {
    speak,
    get auto() { return auto; },
    toggleAuto() { auto = !auto; localStorage.bp_autoread = auto ? '1' : '0'; return auto; }
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
  const fn = routes[name] || routes.landing;
  try { await fn(...args); } catch (e) {
    if (e.status === 401) { location.hash = State.me.role === 'kid' ? '#kid-login' : '#login'; return; }
    if (e.status === 402) { renderPaywall(); return; }
    app().innerHTML = `<div class="container"><div class="card center"><h2>Oops! 🙈</h2><p class="muted">${esc(e.message)}</p><button class="btn" onclick="location.hash='#'">Go Home</button></div></div>`;
  }
  window.scrollTo(0, 0);
}
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
    <div class="logo" onclick="location.hash='#'"><span class="spark">🌟</span> BrightPath</div>
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
    <h1>The tutor that <em>knows</em> your kid 🌟</h1>
    <p>Adaptive K-12 learning in <b>Math, English, Science & Spanish</b> — with real-life examples, voice, sound, streaks and certificates. Like your favorite teacher, available every day.</p>
    <button class="btn sun" onclick="location.hash='${State.me.role === 'parent' ? '#parent' : '#signup'}'">Start Free 14-Day Trial</button>
    <button class="btn ghost" style="margin-left:8px" onclick="location.hash='#kid-login'">I'm a Kid — Let Me In! 🚀</button>
  </div>
  <div class="container">
    <div class="feature-grid">
      <div class="feature"><div class="femoji">🎯</div><h3>Places, then adapts</h3><p>A quick placement quiz finds each child's true level in <b>every subject separately</b> — an advanced reader can be a math beginner, and that's fine. Lessons auto-adjust with every answer.</p></div>
      <div class="feature"><div class="femoji">🍕</div><h3>Real-life learning</h3><p>Fractions with pizza slices, percentages at the sneaker sale, physics on the roller coaster. Kids see <b>why it matters</b>, not just how to bubble an answer.</p></div>
      <div class="feature"><div class="femoji">🧠</div><h3>More help when stuck</h3><p>Struggling on a skill? BrightPath slows down, gives friendlier hints, easier versions, and extra practice — like a patient teacher who never sighs.</p></div>
      <div class="feature"><div class="femoji">🏆</div><h3>Report cards & certificates</h3><p>Parents get honest progress reports with strengths and focus areas. Kids earn printable certificates when they complete a grade level.</p></div>
      <div class="feature"><div class="femoji">🗓️</div><h3>Follows your calendar</h3><p>Traditional school year, year-round, or homeschool schedule — weekly goals pace learning to your family's rhythm.</p></div>
      <div class="feature"><div class="femoji">💻</div><h3>Log in anywhere</h3><p>PC, Mac, iPad, or tablet — one family account, a fun PIN login for each kid, progress synced everywhere.</p></div>
    </div>
    <div class="card" style="margin-top:22px">
      <h2 class="center" style="margin-bottom:18px">Simple plans, whole-family value</h2>
      <div class="plans">
        <div class="plan"><h3>Solo Learner</h3><div class="price">$19<span style="font-size:1rem">/mo</span></div><p class="muted">1 child · all 4 subjects · full adaptive tutor</p></div>
        <div class="plan hot"><span class="tag">MOST POPULAR</span><h3>Family</h3><div class="price">$29<span style="font-size:1rem">/mo</span></div><p class="muted">Up to 4 children · all subjects · report cards & certificates</p></div>
      </div>
      <p class="center muted" style="margin-top:14px">14-day free trial · cancel anytime</p>
    </div>
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
      <div class="avatar-big">${AVATARS[k.avatar] || '🦊'}</div>
      <div>
        <h1>Hi ${esc(k.name)}! Ready to level up? ⚡</h1>
        <div class="stat-chips" style="margin-top:8px">
          <span class="chip">🔥 ${k.streak}-day streak</span>
          <span class="chip">⚡ ${k.xp} XP</span>
          <span class="chip">🪙 ${k.coins} coins</span>
        </div>
      </div>
      <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#report/${k.id}'">📊 My Progress</button>
      <button class="btn ghost small" id="autoread-btn">${Voice.auto ? '🗣️ Read-aloud ON' : '🗣️ Read-aloud off'}</button></div>
    </div>
    <div class="subject-grid">
      ${data.subjects.map(s => `
        <div class="subject-card" style="background:linear-gradient(135deg, ${s.color}, ${s.color}cc)" data-sub="${s.subject}" data-placed="${s.placed ? 1 : 0}">
          <div class="blob"></div>
          <div class="semoji">${s.emoji}</div>
          <h3>${esc(s.label)}</h3>
          <div class="lvl">${s.placed ? '📍 ' + esc(s.levelName) : '✨ Take placement quiz!'}</div>
          <button class="btn sun small" style="margin-top:14px">${s.placed ? 'Play →' : 'Find my level →'}</button>
        </div>`).join('')}
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
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, data.progress / 8 * 100)}%"></div></div>
      </div>
      <div class="q-card">
        <span class="q-skill" style="background:${style.color}">${esc(qn.skillName)}</span>
        <button class="btn ghost small" style="float:right;color:${style.color};border-color:${style.color}" id="say-btn">🔊 Read it</button>
        <div class="q-prompt">${esc(qn.prompt)}</div>
        <div class="choices">${qn.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        <p class="muted" style="margin-top:16px">No pressure — this just helps me pick perfect lessons for YOU. 💜</p>
      </div>
    </div>`);
    wireChrome();
    $('#say-btn').onclick = () => Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    if (Voice.auto) Voice.speak(qn.voice || qn.prompt, subject === 'spanish' ? 'es-ES' : 'en-US');
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.i);
      if (i === qn.answerIndex) Sound.correct(); else Sound.wrong();
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
        <div class="progress-track"><div class="progress-fill" style="width:${session.n / SESSION_LEN * 100}%"></div></div>
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
        fb.innerHTML = `<b>${PRAISE[Math.floor(Math.random() * PRAISE.length)]}</b> ${esc(qn.explain || '')}`;
      } else {
        Sound.wrong();
        fb.className = 'feedback bad';
        fb.innerHTML = `<b>${ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]}</b><br>${esc(qn.explain || '')}`;
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
        const celebration = (res.events || []).find(ev => ev.type === 'levelup' || ev.type === 'badge');
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
          <div class="cert"><b>🎓 ${esc(c.title)}</b><br><span class="muted">Awarded ${esc(c.issued_at.slice(0, 10))} · BrightPath Tutor certifies mastery of ${esc(c.title.replace(' Complete!', ''))}</span></div>`).join('')
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
          <h3>🧭 How the tutor works</h3>
          <p class="muted" style="margin-top:8px;line-height:1.6">Each subject starts with a <b>placement quiz</b> — so a child can be Grade 4 in reading and Grade 2 in math at the same time. Every answer updates skill mastery: strong skills advance faster, shaky skills get gentler questions, more hints, and extra reps. Master a whole grade level and they earn a <b>certificate</b> 🎓.</p>
        </div>
      </div>
    </div>
  </div>`);
  wireChrome();

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

// ======================= boot =======================
(async function boot() {
  try { await refreshMe(); } catch (e) { /* offline-ish */ }
  // preload speech voices (some browsers lazy-load)
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  navigate();
})();
