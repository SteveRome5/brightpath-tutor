/* Gallop Learning Academy — Lessons: real teaching before practice.
   Every lesson moves through teaching "beats": a hook, the core idea with an
   analogy, something to SEE, a worked example, something to DO with your hands,
   and one thing to remember. It reads aloud for kids who learn by ear, shows
   pictures for kids who learn by eye, and lets everyone try it themselves. */
'use strict';
(() => {
  const BP = window.BP;
  const { $, app, esc, route, navigate, topbar, wireChrome, State, Sound, Voice, Confetti } = BP;
  const SUB = {
    math: { color: '#6C5CE7', emoji: '🔢', name: 'Math' },
    english: { color: '#00B894', emoji: '📚', name: 'English' },
    science: { color: '#0984E3', emoji: '🔬', name: 'Science' },
    spanish: { color: '#E17055', emoji: '🌎', name: 'Spanish' }
  };
  const stripEmoji = s => String(s || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();

  // ---------------------------------------------------------------------------
  // WIDGETS — each returns { html, wire(container, onDone) }. Visual widgets
  // just draw; interactive ones call onDone(true) when the child completes them.
  // ---------------------------------------------------------------------------
  function wedgePath(cx, cy, r, a0, a1) {
    const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
  }
  function fractionSVG(shape, parts, shadedSet, color, interactive) {
    const size = 180, cx = 90, cy = 90, r = 78;
    let cells = '';
    if (shape === 'bar') {
      const w = 168 / parts;
      for (let i = 0; i < parts; i++) {
        const on = shadedSet.has(i);
        cells += `<rect class="fw-cell" data-i="${i}" x="${6 + i * w}" y="40" width="${w - 2}" height="100" rx="6"
          fill="${on ? color : '#fff'}" stroke="${color}" stroke-width="2.5" style="cursor:${interactive ? 'pointer' : 'default'}"/>`;
      }
    } else { // pizza / circle
      for (let i = 0; i < parts; i++) {
        const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
        const on = shadedSet.has(i);
        cells += `<path class="fw-cell" data-i="${i}" d="${wedgePath(cx, cy, r, a0, a1)}"
          fill="${on ? color : '#fff'}" stroke="${color}" stroke-width="2.5" style="cursor:${interactive ? 'pointer' : 'default'}"/>`;
      }
    }
    return `<svg viewBox="0 0 ${size} ${size}" class="lw-svg" width="200" height="200" role="img">${cells}</svg>`;
  }
  const WIDGETS = {
    objects(spec) {
      const n = spec.n || 5, emoji = spec.emoji || '⭐';
      const items = Array.from({ length: n }, () => `<span class="lw-obj">${emoji}</span>`).join('');
      return { html: `<div class="lw-objects">${items}</div>` };
    },
    groups(spec) {
      const e = spec.emoji || '🍎';
      const g = (n) => `<div class="lw-group">${Array.from({ length: n }, () => `<span class="lw-obj">${e}</span>`).join('')}</div>`;
      return { html: `<div class="lw-groups">${g(spec.a || 2)}<span class="lw-plus">+</span>${g(spec.b || 3)}<span class="lw-plus">=</span><b class="lw-sum">${(spec.a || 2) + (spec.b || 3)}</b></div>` };
    },
    array(spec) {
      const rows = spec.rows || 3, cols = spec.cols || 4, e = spec.emoji || '🔵';
      let grid = '';
      for (let r = 0; r < rows; r++) grid += `<div class="lw-arow">${Array.from({ length: cols }, () => `<span>${e}</span>`).join('')}</div>`;
      return { html: `<div class="lw-array">${grid}</div><div class="lw-arraylabel">${rows} rows × ${cols} = <b>${rows * cols}</b></div>` };
    },
    fraction(spec) {
      const parts = spec.parts || 4, shaded = spec.shaded || 1;
      const set = new Set(Array.from({ length: shaded }, (_, i) => i));
      return { html: `<div class="lw-frac">${fractionSVG(spec.shape || 'pizza', parts, set, spec.color || '#6C5CE7', false)}<div class="lw-fraclabel"><b>${shaded}</b><span></span><b>${parts}</b></div></div>` };
    },
    numberline(spec) {
      const min = spec.min ?? 0, max = spec.max ?? 10, W = 320, pad = 16;
      const x = v => pad + (v - min) / (max - min) * (W - 2 * pad);
      let ticks = '';
      for (let v = min; v <= max; v++) ticks += `<g><line x1="${x(v)}" y1="34" x2="${x(v)}" y2="46" stroke="#8a94a3" stroke-width="2"/><text x="${x(v)}" y="62" font-size="11" text-anchor="middle" fill="#5b6478">${v}</text></g>`;
      let jump = '';
      if (spec.from != null && spec.to != null) {
        const x0 = x(spec.from), x1 = x(spec.to), mid = (x0 + x1) / 2;
        jump = `<path d="M${x0},34 Q${mid},${x1 > x0 ? 2 : 2} ${x1},34" fill="none" stroke="${spec.color || '#6C5CE7'}" stroke-width="3"/>
          <circle cx="${x1}" cy="34" r="6" fill="${spec.color || '#6C5CE7'}"/>
          <text x="${mid}" y="14" font-size="12" text-anchor="middle" fill="${spec.color || '#6C5CE7'}" font-weight="700">${spec.label || ('+' + (spec.to - spec.from))}</text>`;
      }
      const dot = spec.mark != null ? `<circle cx="${x(spec.mark)}" cy="40" r="7" fill="${spec.color || '#6C5CE7'}"/>` : '';
      return { html: `<svg viewBox="0 0 ${W} 72" class="lw-svg" width="340" role="img"><line x1="${pad}" y1="40" x2="${W - pad}" y2="40" stroke="#c7cdd6" stroke-width="3"/>${ticks}${jump}${dot}</svg>` };
    },
    sideBySide(spec) {
      const card = (c) => `<div class="lw-sbs-card" style="border-color:${c.color || '#c9971c'}"><div class="lw-sbs-emoji">${c.emoji || ''}</div><b>${esc(c.title || '')}</b><span>${esc(c.body || '')}</span></div>`;
      return { html: `<div class="lw-sbs">${(spec.cards || []).map(card).join('')}</div>` };
    },
    // ---- interactive ----
    tapcount(spec) {
      const n = spec.n || 6, e = spec.emoji || '🍓', target = spec.target || n;
      const items = Array.from({ length: n }, (_, i) => `<button class="lw-tap" data-i="${i}">${e}</button>`).join('');
      return {
        html: `<div class="lw-tapwrap"><div class="lw-tapcount" id="lw-count">0</div><div class="lw-taprow">${items}</div><p class="lw-tiphint">Tap each one and count out loud.</p></div>`,
        wire(box, onDone) {
          let c = 0; const seen = new Set();
          box.querySelectorAll('.lw-tap').forEach(b => b.onclick = () => {
            if (seen.has(b.dataset.i)) return; seen.add(b.dataset.i);
            c++; b.classList.add('done'); box.querySelector('#lw-count').textContent = c;
            Sound.click(); try { Voice.speak(String(c)); } catch (e) {}
            if (c >= target) { Sound.correct(); Confetti.burst(30); onDone(true); }
          });
        }
      };
    },
    shadeFraction(spec) {
      const parts = spec.parts || 3, target = spec.target || 1, color = spec.color || '#6C5CE7';
      return {
        html: `<div class="lw-frac">${fractionSVG(spec.shape || 'bar', parts, new Set(), color, true)}<p class="lw-tiphint">Tap to shade <b>${target}</b> of the <b>${parts}</b> equal pieces.</p></div>`,
        wire(box, onDone) {
          const set = new Set(); let done = false;
          box.querySelectorAll('.fw-cell').forEach(c => c.onclick = () => {
            if (done) return;
            const i = c.dataset.i;
            if (set.has(i)) { set.delete(i); c.setAttribute('fill', '#fff'); } else { set.add(i); c.setAttribute('fill', color); }
            Sound.click();
            if (set.size === target) { done = true; Sound.correct(); Confetti.burst(30); onDone(true); }
          });
        }
      };
    },
    buildNumber(spec) {
      const target = spec.target || 24;
      return {
        html: `<div class="lw-build">
          <div class="lw-build-cols">
            <div class="lw-build-col"><div class="lw-build-stack" id="lw-tens"></div><div class="lw-build-btns"><button class="lw-bt" data-k="tens" data-d="1">+ ten</button><button class="lw-bt ghost" data-k="tens" data-d="-1">−</button></div><span>Tens</span></div>
            <div class="lw-build-col"><div class="lw-build-stack" id="lw-ones"></div><div class="lw-build-btns"><button class="lw-bt" data-k="ones" data-d="1">+ one</button><button class="lw-bt ghost" data-k="ones" data-d="-1">−</button></div><span>Ones</span></div>
          </div>
          <div class="lw-build-read">You built: <b id="lw-built">0</b> &nbsp;·&nbsp; Goal: <b>${target}</b></div>
        </div>`,
        wire(box, onDone) {
          let tens = 0, ones = 0, done = false;
          const draw = () => {
            box.querySelector('#lw-tens').innerHTML = Array.from({ length: tens }, () => `<span class="lw-rod"></span>`).join('');
            box.querySelector('#lw-ones').innerHTML = Array.from({ length: ones }, () => `<span class="lw-cube"></span>`).join('');
            const v = tens * 10 + ones;
            box.querySelector('#lw-built').textContent = v;
            if (!done && v === target) { done = true; Sound.correct(); Confetti.burst(30); onDone(true); }
          };
          box.querySelectorAll('.lw-bt').forEach(b => b.onclick = () => {
            const d = Number(b.dataset.d);
            if (b.dataset.k === 'tens') tens = Math.max(0, Math.min(9, tens + d));
            else ones = Math.max(0, Math.min(9, ones + d));
            Sound.click(); draw();
          });
          draw();
        }
      };
    },
    tapPick(spec) {
      const opts = spec.options || [];
      return {
        html: `<div class="lw-pick">${opts.map((o, i) => `<button class="lw-pickbtn" data-i="${i}">${esc(o.label)}</button>`).join('')}<p class="lw-tiphint">${esc(spec.prompt || 'Tap the best answer.')}</p></div>`,
        wire(box, onDone) {
          let done = false;
          box.querySelectorAll('.lw-pickbtn').forEach((b, i) => b.onclick = () => {
            if (done) return;
            if (opts[i].correct) { done = true; b.classList.add('good'); Sound.correct(); Confetti.burst(24); onDone(true); }
            else { b.classList.add('bad'); Sound.wrong(); b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
          });
        }
      };
    },
    sortBuckets(spec) {
      const buckets = spec.buckets || [], items = spec.items || [];
      let pool = items.map((it, i) => `<button class="lw-chip" data-i="${i}" data-b="${it.bucket}">${esc(it.label)}</button>`).join('');
      const drop = buckets.map(b => `<div class="lw-bucket" data-b="${b.id}"><div class="lw-bucket-head">${esc(b.label)}</div><div class="lw-bucket-body" data-b="${b.id}"></div></div>`).join('');
      return {
        html: `<div class="lw-sort"><div class="lw-pool" id="lw-pool">${pool}</div><div class="lw-buckets">${drop}</div><p class="lw-tiphint">Tap an item, then tap the box it belongs in.</p></div>`,
        wire(box, onDone) {
          let sel = null, placed = 0, done = false;
          box.querySelectorAll('.lw-chip').forEach(c => c.onclick = () => {
            if (c.classList.contains('placed')) return;
            box.querySelectorAll('.lw-chip').forEach(x => x.classList.remove('sel'));
            sel = c; c.classList.add('sel'); Sound.click();
          });
          box.querySelectorAll('.lw-bucket').forEach(bk => bk.onclick = () => {
            if (!sel || done) return;
            if (sel.dataset.b === bk.dataset.b) {
              bk.querySelector('.lw-bucket-body').appendChild(sel);
              sel.classList.remove('sel'); sel.classList.add('placed'); sel = null; placed++; Sound.correct();
              if (placed >= items.length) { done = true; Confetti.burst(30); onDone(true); }
            } else { Sound.wrong(); bk.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 240 }); }
          });
        }
      };
    },
    highlight(spec) {
      const sentences = spec.sentences || [];
      return {
        html: `<div class="lw-highlight"><div class="lw-passage">${sentences.map((s, i) => `<span class="lw-sent" data-i="${i}">${esc(s.text)} </span>`).join('')}</div><p class="lw-tiphint">${esc(spec.prompt || 'Tap the sentence that tells the MAIN idea.')}</p></div>`,
        wire(box, onDone) {
          let done = false;
          box.querySelectorAll('.lw-sent').forEach((s, i) => s.onclick = () => {
            if (done) return;
            if (sentences[i].main) { done = true; s.classList.add('good'); Sound.correct(); Confetti.burst(24); onDone(true); }
            else { s.classList.add('bad'); Sound.wrong(); setTimeout(() => s.classList.remove('bad'), 500); }
          });
        }
      };
    }
  };

  function renderWidget(spec) {
    if (!spec || !WIDGETS[spec.w]) return null;
    return WIDGETS[spec.w](spec);
  }

  // ---------------------------------------------------------------------------
  // LESSON PLAYER
  // ---------------------------------------------------------------------------
  route('teach', async (lessonId) => {
    if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
    const lesson = BP.lessonById(lessonId);
    if (!lesson) { location.hash = '#home'; return; }
    const style = SUB[lesson.subject];
    const grade = (State.me.kid && State.me.kid.grade) || 0;
    const auto = grade <= 5; // younger kids get it read aloud automatically
    let i = 0;

    function narrate(step) {
      try {
        const text = step.say || stripEmoji([step.title, step.body, step.takeaway].filter(Boolean).join('. '));
        if (text) Voice.speak(text, lesson.subject === 'spanish' ? 'es-ES' : 'en-US');
      } catch (e) {}
    }

    function render() {
      const step = lesson.steps[i];
      const last = i === lesson.steps.length - 1;
      const w = step.widget ? renderWidget(step.widget) : null;
      const dots = lesson.steps.map((_, k) => `<span class="lp-dot ${k <= i ? 'on' : ''}"></span>`).join('');
      const kindLabel = { hook: 'The set-up', concept: 'The big idea', show: 'See it', example: 'Watch one', try: 'Your turn', recap: 'Remember this' }[step.kind] || '';
      let bodyHtml = '';
      if (step.kind === 'recap') {
        bodyHtml = `<div class="lp-recap"><div class="lp-recap-emoji">${step.emoji || '🎯'}</div><p class="lp-takeaway">${esc(step.takeaway || step.body || '')}</p></div>`;
      } else if (step.kind === 'example' && step.reveal) {
        bodyHtml = `${step.body ? `<p class="lp-body">${esc(step.body)}</p>` : ''}<div class="lp-reveal" id="lp-reveal">${step.reveal.map((r, k) => `<div class="lp-reveal-line" data-k="${k}" style="display:none">${esc(r)}</div>`).join('')}</div>`;
      } else {
        bodyHtml = `${step.body ? `<p class="lp-body">${esc(step.body)}</p>` : ''}${step.analogy ? `<p class="lp-analogy">💡 ${esc(step.analogy)}</p>` : ''}`;
      }
      app().innerHTML = topbar(`<div class="container lp-wrap" style="--sub:${style.color}">
        <div class="lp-top">
          <button class="btn ghost small" onclick="location.hash='#home'">✕ Exit</button>
          <div class="lp-progress">${dots}</div>
          <button class="btn ghost small" id="lp-say" title="Read aloud">🔊</button>
        </div>
        <div class="lp-card">
          <div class="lp-kind">${style.emoji} ${esc(style.name)} · ${kindLabel}</div>
          <h2 class="lp-title">${esc(step.title || lesson.title)}</h2>
          ${bodyHtml}
          ${w ? `<div class="lp-widget" id="lp-widget">${w.html}</div>` : ''}
          <div class="lp-actions">
            ${i > 0 ? `<button class="btn ghost" id="lp-back">← Back</button>` : '<span></span>'}
            <button class="btn green ${step.kind === 'try' ? 'lp-locked' : ''}" id="lp-next">${last ? "Let's practice this! →" : 'Next →'}</button>
          </div>
          ${step.kind === 'try' ? `<p class="lp-trynote" id="lp-trynote">Give it a try above to keep going.</p>` : ''}
        </div>
      </div>`);
      wireChrome();
      const nextBtn = $('#lp-next');
      const goNext = () => { Sound.click(); if (last) { try { localStorage['bp_lesson_' + lesson.id] = '1'; } catch (e) {} Sound.levelup(); Confetti.burst(120); location.hash = '#lesson/' + lesson.subject; } else { i++; render(); } };
      const goBack = () => { Sound.click(); i = Math.max(0, i - 1); render(); };
      if ($('#lp-back')) $('#lp-back').onclick = goBack;
      $('#lp-say').onclick = () => narrate(step);

      // worked example: reveal lines one at a time on Next taps
      if (step.kind === 'example' && step.reveal) {
        let shown = 0; const lines = document.querySelectorAll('.lp-reveal-line');
        nextBtn.textContent = 'Show me →';
        nextBtn.onclick = () => {
          if (shown < lines.length) { lines[shown].style.display = 'block'; lines[shown].animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300 }); shown++; Sound.click(); if (shown === lines.length) nextBtn.textContent = last ? "Let's practice this! →" : 'Next →'; }
          else goNext();
        };
      } else if (step.kind === 'try' && w && w.wire) {
        // lock Next until the activity is done
        nextBtn.classList.add('lp-locked');
        w.wire($('#lp-widget'), (ok) => {
          if (ok) {
            nextBtn.classList.remove('lp-locked');
            const note = $('#lp-trynote'); if (note) { note.textContent = 'Nice, you\'ve got it! Tap Next.'; note.classList.add('done'); }
            nextBtn.focus();
          }
        });
        nextBtn.onclick = () => { if (nextBtn.classList.contains('lp-locked')) { const note = $('#lp-trynote'); if (note) note.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 240 }); return; } goNext(); };
      } else {
        if (w && w.wire) w.wire($('#lp-widget'), () => {});
        nextBtn.onclick = goNext;
      }
      if (last) Confetti.burst(0); // no-op keep import
      if (auto) setTimeout(() => narrate(step), 250);
    }
    render();
  });

  // ---------------------------------------------------------------------------
  // LESSON CONTENT — crafted to teach, not just tell.
  // ---------------------------------------------------------------------------
  const L = {};
  L.math = [
    {
      id: 'l.count', skillId: 'm.k.count', subject: 'math', grade: 0, title: 'Counting Is Pointing and Saying',
      subtitle: 'The very first math skill, done right.',
      steps: [
        { kind: 'hook', title: 'How many puppies?', body: 'Somebody lets a bunch of puppies loose in the yard. Before you can play with them, you need to know: how many are there?', say: 'How many puppies are there? To find out, we count.' },
        { kind: 'concept', title: 'Counting has one rule', body: 'Touch each thing ONE time and say the next number. One touch, one number. Never skip, never double up.', analogy: 'It is like giving each puppy its own name tag: 1, 2, 3, 4, 5.', widget: { w: 'objects', n: 5, emoji: '🐶' }, say: 'Touch each thing one time and say the next number. One touch, one number.' },
        { kind: 'try', title: 'Your turn: count the strawberries', body: 'Tap each strawberry one time. Say the number out loud as you go.', widget: { w: 'tapcount', n: 6, emoji: '🍓', target: 6 }, say: 'Tap each strawberry one time and count out loud.' },
        { kind: 'recap', emoji: '👆', title: 'Remember this', takeaway: 'Counting is one touch, one number, in order. Point and say. That is it.', say: 'Counting is one touch, one number, in order.' }
      ]
    },
    {
      id: 'l.addput', skillId: 'm.k.add5', subject: 'math', grade: 0, title: 'Adding Is Putting Together',
      subtitle: 'What the plus sign really means.',
      steps: [
        { kind: 'hook', title: 'Two hands of apples', body: 'You are holding 2 apples in one hand and 3 in the other. A friend asks how many you have. Adding is how you answer.', say: 'You have 2 apples in one hand and 3 in the other. How many in all?' },
        { kind: 'concept', title: 'Plus means "put them together"', body: 'The plus sign just says: slide the two groups together and count them all as one big pile.', widget: { w: 'groups', a: 2, b: 3, emoji: '🍎' }, analogy: 'Two small piles become one bigger pile. That is all adding is.', say: 'The plus sign means put the two groups together and count them all.' },
        { kind: 'try', title: 'Your turn: count them all', body: 'Here are both groups pushed together. Tap each apple once and count the whole pile.', widget: { w: 'tapcount', n: 5, emoji: '🍎', target: 5 }, say: 'Tap each apple and count the whole pile.' },
        { kind: 'recap', emoji: '➕', title: 'Remember this', takeaway: 'Adding is just putting groups together and counting them all. 2 and 3 makes 5.', say: 'Adding is putting groups together and counting them all.' }
      ]
    },
    {
      id: 'l.place', skillId: 'm.1.place', subject: 'math', grade: 1, title: 'Place Value: The Power of Ten',
      subtitle: 'Why 24 is not just a 2 and a 4.',
      steps: [
        { kind: 'hook', title: 'A jar of 24 marbles', body: 'You want to count 24 marbles fast, without pointing to all 24. There is a trick grown-ups use every day: group them into tens.', say: 'How do you count 24 marbles fast? Group them into tens.' },
        { kind: 'concept', title: 'Tens and ones', body: 'Every 2-digit number is really a bundle count. In 24, the 2 means two bundles of ten, and the 4 means four leftover ones.', analogy: 'A ten is like a dime, and a one is like a penny. 24 is two dimes and four pennies.', widget: { w: 'numberline', min: 0, max: 30, mark: 24, color: '#6C5CE7' }, say: 'In twenty-four, the two means two tens, and the four means four ones.' },
        { kind: 'try', title: 'Your turn: build 24', body: 'Add tens and ones until you have built the number 24.', widget: { w: 'buildNumber', target: 24 }, say: 'Add tens and ones to build twenty-four.' },
        { kind: 'example', title: 'One more, together', body: 'Let us read the number 37 the smart way.', reveal: ['The 3 is in the tens place, so it means 3 tens, which is 30.', 'The 7 is in the ones place, so it means 7 ones.', '30 and 7 put together is 37.'] },
        { kind: 'recap', emoji: '🔟', title: 'Remember this', takeaway: 'The left digit counts tens, the right digit counts ones. That is how every number is built.', say: 'The left digit counts tens, the right digit counts ones.' }
      ]
    },
    {
      id: 'l.mult', skillId: 'm.3.mult', subject: 'math', grade: 3, title: 'Multiplication Is Rows and Columns',
      subtitle: 'A picture that makes times tables make sense.',
      steps: [
        { kind: 'hook', title: 'Chairs for the class', body: 'You are setting up chairs in 3 neat rows, with 4 chairs in each row. How many chairs is that? Counting one by one is slow. Multiplying is fast.', say: 'Three rows of four chairs. How many chairs? Multiplying is the fast way.' },
        { kind: 'concept', title: 'Times means "rows of"', body: '3 × 4 means "3 rows OF 4." Line them up in a rectangle and the answer is just how many are inside.', widget: { w: 'array', rows: 3, cols: 4, emoji: '🔵' }, analogy: 'Multiplication is adding the same number again and again, but arranged so you can see it: 4 + 4 + 4 = 12.', say: 'Three times four means three rows of four. Count the whole rectangle: twelve.' },
        { kind: 'try', title: 'Your turn: which is 2 × 5?', body: 'Two rows of five. Tap the answer.', widget: { w: 'tapPick', prompt: 'How many in 2 rows of 5?', options: [{ label: '7' }, { label: '10', correct: true }, { label: '25' }] }, say: 'Two rows of five. Which is the answer?' },
        { kind: 'recap', emoji: '✖️', title: 'Remember this', takeaway: 'Multiplication is rows of equal groups. Picture the rectangle and the answer is everything inside it.', say: 'Multiplication is rows of equal groups.' }
      ]
    },
    {
      id: 'l.frac', skillId: 'm.3.frac', subject: 'math', grade: 3, title: 'Fractions Are Fair Shares',
      subtitle: 'The whole idea behind fractions.',
      steps: [
        { kind: 'hook', title: 'The pizza problem', body: 'You and 3 friends order one pizza. Everybody is hungry and nobody wants to get cheated. How do you split it so it is totally fair?', say: 'You and three friends share one pizza. How do you split it fairly?' },
        { kind: 'concept', title: 'A fraction is fair-sharing, written down', body: 'Cut the pizza into 4 equal pieces. Each person gets 1 of those 4. We write that as 1 over 4.', analogy: 'The bottom number is how many equal pieces you cut. The top number is how many you take.', widget: { w: 'fraction', shape: 'pizza', parts: 4, shaded: 1 }, say: 'Cut it into four equal pieces. Each person gets one of the four. We write it one over four.' },
        { kind: 'show', title: 'More pieces, smaller shares', body: 'Cut the same pizza into 8 instead of 4, and each slice gets thinner. More pieces means each piece is smaller.', widget: { w: 'fraction', shape: 'pizza', parts: 8, shaded: 1 }, say: 'More pieces means each piece is smaller.' },
        { kind: 'try', title: 'Your turn: share the chocolate', body: 'Three friends share this chocolate bar fairly. Tap to shade ONE fair share.', widget: { w: 'shadeFraction', shape: 'bar', parts: 3, target: 1 }, say: 'Tap to shade one fair share for three friends.' },
        { kind: 'example', title: 'Reading a fraction', body: 'What does 3 over 4 mean?', reveal: ['The bottom is 4, so cut the whole into 4 equal parts.', 'The top is 3, so take 3 of those parts.', 'Three-fourths means you have 3 out of 4 equal pieces.'] },
        { kind: 'recap', emoji: '🍕', title: 'Remember this', takeaway: 'Bottom is how many equal pieces. Top is how many you have. That is a fraction.', say: 'Bottom, how many equal pieces. Top, how many you have.' }
      ]
    }
  ];
  L.english = [
    {
      id: 'l.mainidea', skillId: 'e.2.reading', subject: 'english', grade: 2, title: 'Finding the Main Idea',
      subtitle: 'What a whole paragraph is really about.',
      steps: [
        { kind: 'hook', title: 'The umbrella trick', body: 'A paragraph is like a family standing under one umbrella. Every sentence is a person. The MAIN idea is the umbrella that covers all of them.', say: 'The main idea is like an umbrella that covers every sentence in the paragraph.' },
        { kind: 'concept', title: 'Ask: what are they ALL about?', body: 'To find the main idea, do not grab the first fact you see. Ask what every sentence has in common. That shared thing is the main idea.', analogy: 'One sentence is a detail. The main idea is the big thing all the details are pointing at.', say: 'Ask what every sentence has in common. That shared thing is the main idea.' },
        { kind: 'try', title: 'Your turn: find the umbrella', body: 'Read these sentences. Tap the one that tells the MAIN idea.', widget: { w: 'highlight', prompt: 'Tap the sentence that covers all the others.', sentences: [{ text: 'Ants are amazing teamworkers.', main: true }, { text: 'Some ants find the food.' }, { text: 'Others carry it home.' }, { text: 'A few guard the nest.' }] }, say: 'Tap the sentence that covers all the others.' },
        { kind: 'example', title: 'Why the others are wrong', body: 'The other sentences are true, but each one is just a detail.', reveal: ['"Some ants find the food" is only ONE job.', '"Others carry it home" is only one more job.', 'Only "Ants are amazing teamworkers" covers every job at once. That is the umbrella.'] },
        { kind: 'recap', emoji: '☂️', title: 'Remember this', takeaway: 'The main idea is the umbrella that covers every sentence, not just one detail underneath it.', say: 'The main idea is the umbrella that covers every sentence.' }
      ]
    },
    {
      id: 'l.prefix', skillId: 'e.3.prefix', subject: 'english', grade: 3, title: 'Prefixes Are Word Math',
      subtitle: 'Unlock any word by adding up its parts.',
      steps: [
        { kind: 'hook', title: 'A word you have never seen', body: 'You read the word "unbreakable" and freeze. But you already know how to crack it. Big words are just small parts added together.', say: 'Big words are just small parts added together.' },
        { kind: 'concept', title: 'A prefix changes the front', body: 'A prefix is a little piece you glue to the FRONT of a word to change its meaning. "Un-" means not. So un + happy = not happy.', analogy: 'It is word math: un + kind = unkind. re + do = do again. pre + game = before the game.', say: 'Un means not. So un plus happy equals not happy. It is word math.' },
        { kind: 'try', title: 'Your turn: sort the prefixes', body: 'Tap a word, then tap the box that tells what its prefix means.', widget: { w: 'sortBuckets', buckets: [{ id: 'not', label: 'un- (not)' }, { id: 'again', label: 're- (again)' }], items: [{ label: 'unlock', bucket: 'not' }, { label: 'redo', bucket: 'again' }, { label: 'unfair', bucket: 'not' }, { label: 'repaint', bucket: 'again' }] }, say: 'Sort each word by what its prefix means.' },
        { kind: 'recap', emoji: '🔤', title: 'Remember this', takeaway: 'A prefix is glued to the front and changes the meaning. Break a big word into parts and add them up.', say: 'A prefix is glued to the front and changes the meaning.' }
      ]
    }
  ];
  L.science = [
    {
      id: 'l.matter', skillId: 's.2.matter', subject: 'science', grade: 2, title: 'Solid, Liquid, Gas',
      subtitle: 'The three states of everything, explained by a dance.',
      steps: [
        { kind: 'hook', title: 'Same water, three faces', body: 'Ice, a puddle, and steam are all the SAME water. So what makes them look so different? The secret is how the tiny bits inside are moving.', say: 'Ice, water, and steam are all the same stuff. What changes is how the tiny bits move.' },
        { kind: 'concept', title: 'It is all about the dance', body: 'Everything is made of tiny particles. In a SOLID they are packed tight and barely wiggle. In a LIQUID they slide past each other. In a GAS they zoom apart and fly everywhere.', widget: { w: 'sideBySide', cards: [{ emoji: '🧊', title: 'Solid', body: 'Packed tight, holds its shape.' }, { emoji: '💧', title: 'Liquid', body: 'Slides around, takes the cup\'s shape.' }, { emoji: '💨', title: 'Gas', body: 'Flies apart, fills the whole room.' }] }, analogy: 'Solid is a crowded elevator. Liquid is a busy hallway. Gas is kids let loose at recess.', say: 'In a solid the particles barely move. In a liquid they slide. In a gas they fly apart.' },
        { kind: 'try', title: 'Your turn: sort them', body: 'Tap each thing, then drop it in the right state of matter.', widget: { w: 'sortBuckets', buckets: [{ id: 's', label: '🧊 Solid' }, { id: 'l', label: '💧 Liquid' }, { id: 'g', label: '💨 Gas' }], items: [{ label: 'a brick', bucket: 's' }, { label: 'juice', bucket: 'l' }, { label: 'the air', bucket: 'g' }, { label: 'an ice cube', bucket: 's' }] }, say: 'Sort each thing into solid, liquid, or gas.' },
        { kind: 'recap', emoji: '🔬', title: 'Remember this', takeaway: 'Add heat and the dance speeds up: solid melts to liquid, liquid boils to gas. Same stuff, faster particles.', say: 'Add heat and the particles move faster. Solid melts to liquid, liquid boils to gas.' }
      ]
    },
    {
      id: 'l.daynight', skillId: 's.4.space', subject: 'science', grade: 4, title: 'Why We Have Day and Night',
      subtitle: 'The sun never actually "goes down."',
      steps: [
        { kind: 'hook', title: 'The sun did not move', body: 'It feels like the sun rises in the morning and sets at night. But here is the twist: the sun barely moves at all. WE are the ones spinning.', say: 'It feels like the sun rises and sets. But really, we are the ones spinning.' },
        { kind: 'concept', title: 'Earth is a spinning ball', body: 'Earth turns all the way around once every 24 hours. When your side faces the sun, it is day. When your side spins away, it is night.', analogy: 'Stand and slowly spin near a lamp. Your face is lit, then dark, then lit again. You did not turn the lamp off, you turned away from it.', widget: { w: 'sideBySide', cards: [{ emoji: '🌞', title: 'Facing the sun', body: 'Your side of Earth: daytime.' }, { emoji: '🌙', title: 'Spun away', body: 'Your side of Earth: nighttime.' }] }, say: 'Earth spins once every day. Facing the sun is daytime. Spun away is nighttime.' },
        { kind: 'try', title: 'Your turn', body: 'It is nighttime where you are. What is Earth doing?', widget: { w: 'tapPick', prompt: 'Why is it night?', options: [{ label: 'The sun turned off' }, { label: 'Our side of Earth spun away from the sun', correct: true }, { label: 'The moon blocks the sun every night' }] }, say: 'Why is it night?' },
        { kind: 'recap', emoji: '🌍', title: 'Remember this', takeaway: 'Day and night are not the sun moving. They are Earth spinning you toward the sun and then away from it.', say: 'Day and night are Earth spinning toward the sun and then away.' }
      ]
    }
  ];
  L.spanish = [
    {
      id: 'l.greet', skillId: 'sp.0.greetings', subject: 'spanish', grade: 0, title: 'Your First Spanish Words',
      subtitle: 'Say hello, thank you, and goodbye today.',
      steps: [
        { kind: 'hook', title: 'One word opens a door', body: 'Imagine meeting a new friend who speaks Spanish. One friendly word can turn a stranger into a buddy. Let us learn three.', say: 'One friendly word can turn a stranger into a friend. Let us learn three.' },
        { kind: 'concept', title: 'Hola, gracias, adiós', body: 'Hola means hello. Gracias means thank you. Adiós means goodbye. Say each one out loud after me.', widget: { w: 'sideBySide', cards: [{ emoji: '👋', title: 'Hola', body: 'Hello (OH-lah)' }, { emoji: '🙏', title: 'Gracias', body: 'Thank you (GRAH-syahs)' }, { emoji: '👋', title: 'Adiós', body: 'Goodbye (ah-DYOHS)' }] }, say: 'Hola. Gracias. Adiós.' },
        { kind: 'try', title: 'Your turn', body: 'Your new friend just helped you. What do you say?', widget: { w: 'tapPick', prompt: 'Which word means "thank you"?', options: [{ label: 'Hola' }, { label: 'Gracias', correct: true }, { label: 'Adiós' }] }, say: 'Which word means thank you?' },
        { kind: 'recap', emoji: '🌎', title: 'Remember this', takeaway: 'Hola to say hi, gracias to say thanks, adiós to say bye. Three words, and you can already be kind in Spanish.', say: 'Hola, gracias, adiós. You can already be kind in Spanish.' }
      ]
    },
    {
      id: 'l.serestar', skillId: 'sp.3.ser', subject: 'spanish', grade: 3, title: 'Ser vs. Estar: Forever vs. Right Now',
      subtitle: 'Spanish has two words for "is." Here is the trick.',
      steps: [
        { kind: 'hook', title: 'Two kinds of "is"', body: 'In English we say "is" for everything. Spanish is pickier. It has ser for things that stay true, and estar for things happening right now.', say: 'Spanish has two words for is. Ser for what stays true, estar for right now.' },
        { kind: 'concept', title: 'Forever vs. right now', body: 'Use SER for permanent things: who you are, where you are from. Use ESTAR for temporary things: how you feel, where you are standing.', analogy: 'Ser is your name tag. Estar is your mood ring. One does not change, one changes all day.', widget: { w: 'sideBySide', cards: [{ emoji: '🪪', title: 'SER', body: 'Lasting: "Soy Margaux." I am Margaux.' }, { emoji: '💍', title: 'ESTAR', body: 'Right now: "Estoy feliz." I am happy.' }] }, say: 'Ser is for lasting things. Estar is for how you feel right now.' },
        { kind: 'try', title: 'Your turn', body: '"I am tired" is a right-now feeling. Which verb do you use?', widget: { w: 'tapPick', prompt: 'I am tired (right now)...', options: [{ label: 'ser (Soy cansado)' }, { label: 'estar (Estoy cansado)', correct: true }] }, say: 'I am tired is a right now feeling. Which verb?' },
        { kind: 'recap', emoji: '🇪🇸', title: 'Remember this', takeaway: 'Ser is your name tag: lasting. Estar is your mood ring: right now. Feelings and locations use estar.', say: 'Ser is lasting, like a name tag. Estar is right now, like a mood ring.' }
      ]
    }
  ];

  window.GALLOP_LESSONS = L;
  BP.lessonsFor = (subject) => L[subject] || [];
  BP.lessonById = (id) => Object.values(L).flat().find(l => l.id === id);
  BP.lessonForSkill = (subject, skillId) => (L[subject] || []).find(l => l.skillId === skillId);
  const doneKey = id => 'bp_lesson_' + id;
  BP.lessonDone = id => { try { return localStorage[doneKey(id)] === '1'; } catch (e) { return false; } };

  // ---------------------------------------------------------------------------
  // LESSONS HUB — browse and pick a lesson to learn
  // ---------------------------------------------------------------------------
  route('learn', async (only) => {
    if (State.me.role !== 'kid') { location.hash = '#kid-login'; return; }
    const grade = (State.me.kid && State.me.kid.grade) || 0;
    const subjects = only && L[only] ? [only] : ['math', 'english', 'science', 'spanish'];
    const section = (sub) => {
      const list = (L[sub] || []).slice().sort((a, b) => a.grade - b.grade);
      if (!list.length) return '';
      const cards = list.map(l => {
        const near = Math.abs(l.grade - grade) <= 1;
        return `<div class="learn-card ${BP.lessonDone(l.id) ? 'ldone' : ''}" data-id="${l.id}" style="--sub:${SUB[sub].color}">
          <div class="learn-emoji">${SUB[sub].emoji}</div>
          <div class="learn-body"><b>${esc(l.title)}</b><span>${esc(l.subtitle || '')}</span>
            <span class="learn-meta">${l.grade === 0 ? 'Kindergarten' : 'Grade ' + l.grade}${near ? ' · just right for you' : ''}${BP.lessonDone(l.id) ? ' · ✓ learned' : ''}</span></div>
          <span class="learn-go">${BP.lessonDone(l.id) ? 'Review' : 'Learn'} →</span>
        </div>`;
      }).join('');
      return `<h3 class="learn-subhead" style="color:${SUB[sub].color}">${SUB[sub].emoji} ${SUB[sub].name}</h3><div class="learn-grid">${cards}</div>`;
    };
    app().innerHTML = topbar(`<div class="container">
      <div class="kid-header" style="margin-bottom:8px">
        <div><h1>📖 Lessons</h1><p class="muted" style="margin-top:4px">Short teaching moments. See it, hear it, try it. Then go practice.</p></div>
        <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#home'">← Home</button></div>
      </div>
      ${subjects.map(section).join('')}
    </div>`);
    wireChrome();
    document.querySelectorAll('.learn-card').forEach(c => c.onclick = () => { Sound.click(); location.hash = '#teach/' + c.dataset.id; });
  });
})();
