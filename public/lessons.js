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
    english: { color: '#00B894', emoji: '📚', name: 'English & Reading' },
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
      const card = (c) => `<div class="lw-sbs-card" style="border-color:${c.color || '#C9A84C'}"><div class="lw-sbs-emoji">${c.emoji || ''}</div><b>${esc(c.title || '')}</b><span>${esc(c.body || '')}</span></div>`;
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
    // Read-aloud is strictly OPT-IN (the 🔊 toggle) — even for the littles. Auto-playing
    // synthesized speech broke the "never auto-plays audio" promise parents rely on.
    const auto = grade <= 5 && Voice.auto;
    let i = 0;

    function narrate(step) {
      try {
        // Read EXACTLY what's on screen (never a separate script — kids follow along
        // word-for-word), and always in English: Spanish lessons are written in English
        // with Spanish vocabulary, and an es-ES voice mangles the English around it.
        const text = stripEmoji([step.title, step.body, step.takeaway].filter(Boolean).join('. '));
        if (text) Voice.speak(text, 'en-US');
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
  const L = {
    "math": [
      {
        "id": "l.count",
        "skillId": "m.k.count",
        "subject": "math",
        "grade": 0,
        "title": "Counting Is Pointing and Saying",
        "subtitle": "The very first math skill, done right.",
        "steps": [
          {
            "kind": "hook",
            "title": "How many puppies?",
            "body": "Somebody lets a bunch of puppies loose in the yard. Before you can play with them, you need to know: how many are there?",
            "say": "How many puppies are there? To find out, we count."
          },
          {
            "kind": "concept",
            "title": "Counting has one rule",
            "body": "Touch each thing ONE time and say the next number. One touch, one number. Never skip, never double up.",
            "analogy": "It is like giving each puppy its own name tag: 1, 2, 3, 4, 5.",
            "widget": {
              "w": "objects",
              "n": 5,
              "emoji": "🐶"
            },
            "say": "Touch each thing one time and say the next number. One touch, one number."
          },
          {
            "kind": "try",
            "title": "Your turn: count the strawberries",
            "body": "Tap each strawberry one time. Say the number out loud as you go.",
            "widget": {
              "w": "tapcount",
              "n": 6,
              "emoji": "🍓",
              "target": 6
            },
            "say": "Tap each strawberry one time and count out loud."
          },
          {
            "kind": "recap",
            "emoji": "👆",
            "title": "Remember this",
            "takeaway": "Counting is one touch, one number, in order. Point and say. That is it.",
            "say": "Counting is one touch, one number, in order."
          }
        ]
      },
      {
        "id": "l.addput",
        "skillId": "m.k.add5",
        "subject": "math",
        "grade": 0,
        "title": "Adding Is Putting Together",
        "subtitle": "What the plus sign really means.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two hands of apples",
            "body": "You are holding 2 apples in one hand and 3 in the other. A friend asks how many you have. Adding is how you answer.",
            "say": "You have 2 apples in one hand and 3 in the other. How many in all?"
          },
          {
            "kind": "concept",
            "title": "Plus means \"put them together\"",
            "body": "The plus sign just says: slide the two groups together and count them all as one big pile.",
            "widget": {
              "w": "groups",
              "a": 2,
              "b": 3,
              "emoji": "🍎"
            },
            "analogy": "Two small piles become one bigger pile. That is all adding is.",
            "say": "The plus sign means put the two groups together and count them all."
          },
          {
            "kind": "try",
            "title": "Your turn: count them all",
            "body": "Here are both groups pushed together. Tap each apple once and count the whole pile.",
            "widget": {
              "w": "tapcount",
              "n": 5,
              "emoji": "🍎",
              "target": 5
            },
            "say": "Tap each apple and count the whole pile."
          },
          {
            "kind": "recap",
            "emoji": "➕",
            "title": "Remember this",
            "takeaway": "Adding is just putting groups together and counting them all. 2 and 3 makes 5.",
            "say": "Adding is putting groups together and counting them all."
          }
        ]
      },
      {
        "id": "l.mkcompare",
        "skillId": "m.k.compare",
        "subject": "math",
        "grade": 0,
        "title": "More or Less?",
        "subtitle": "Which pile is bigger?",
        "steps": [
          {
            "kind": "hook",
            "title": "The snack race",
            "body": "Your friend has a pile of strawberries. You have one lonely frog. Who has more? You already know, without even counting.",
            "say": "Your friend has a big pile of strawberries. You have one frog. Who has more?"
          },
          {
            "kind": "concept",
            "title": "More means a bigger pile",
            "body": "Put the two groups side by side. The one that reaches farther, the one with the taller pile, has MORE. The smaller pile has LESS.",
            "analogy": "It is like two towers of blocks. The taller tower has more blocks, every time.",
            "say": "The group with the taller pile has more. Eight strawberries is more than one frog.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🍓",
                  "title": "8 strawberries",
                  "body": "A big pile.",
                  "color": "#e23b5a"
                },
                {
                  "emoji": "🐸",
                  "title": "1 frog",
                  "body": "Just one.",
                  "color": "#3ba55c"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Sometimes you have to look closely",
            "body": "When the piles are close, line them up and count. Five cookies and six cookies look almost the same, but six is more.",
            "say": "When the piles are close, count them. Six cookies is more than five cookies.",
            "widget": {
              "w": "objects",
              "n": 6,
              "emoji": "🍪"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: which is more?",
            "body": "One group has 5 strawberries. The other has 6 cookies. Tap the group that has MORE.",
            "say": "One group has five strawberries. The other has six cookies. Which has more?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which group has MORE?",
              "options": [
                {
                  "label": "5 strawberries 🍓"
                },
                {
                  "label": "6 cookies 🍪",
                  "correct": true
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "More is the bigger pile. When they are close, count, and the bigger number has more.",
            "emoji": "🍓",
            "takeaway": "More is the bigger pile. When two piles are close, line them up and count, then the bigger number wins."
          }
        ]
      },
      {
        "id": "l.mkshapes",
        "skillId": "m.k.shapes",
        "subject": "math",
        "grade": 0,
        "title": "Shape Detective",
        "subtitle": "Spotting shapes hiding in real things.",
        "steps": [
          {
            "kind": "hook",
            "title": "Shapes are everywhere",
            "body": "A clock is a circle. A window is a square. Once you start looking, you will see shapes hiding inside everyday things all day long.",
            "say": "A clock is a circle. A window is a square. Shapes hide inside everyday things."
          },
          {
            "kind": "concept",
            "title": "Match the thing to its shape",
            "body": "A kite has four corners that stretch out, so it is a diamond. A football is longer than it is tall and rounded at the ends, so it is an oval.",
            "analogy": "An oval is a circle that got gently squished, like a stretched-out egg.",
            "say": "A kite is a diamond. A football is an oval, like a stretched circle.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪁",
                  "title": "Kite",
                  "body": "A diamond.",
                  "color": "#4a7fd6"
                },
                {
                  "emoji": "🏈",
                  "title": "Football",
                  "body": "An oval.",
                  "color": "#8a5a2b"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the shape",
            "body": "Look at the football. Which shape does it match?",
            "say": "What shape is a football? Circle, oval, or square?",
            "widget": {
              "w": "tapPick",
              "prompt": "What shape is a football 🏈?",
              "options": [
                {
                  "label": "circle"
                },
                {
                  "label": "oval",
                  "correct": true
                },
                {
                  "label": "square"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Detective steps",
            "body": "How do we know a kite is a diamond?",
            "reveal": [
              "Count the corners. A kite has 4 pointy corners.",
              "Look at the sides. They slant in to meet at top and bottom.",
              "Four corners that point out like that make a diamond."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A kite is a diamond. A football is an oval. Find the shape hiding inside real things.",
            "emoji": "🪁",
            "takeaway": "A kite is a diamond. A football is an oval, a squished circle. Look at real things and find the shape inside."
          }
        ]
      },
      {
        "id": "l.place",
        "skillId": "m.1.place",
        "subject": "math",
        "grade": 1,
        "title": "Place Value: The Power of Ten",
        "subtitle": "Why 24 is not just a 2 and a 4.",
        "steps": [
          {
            "kind": "hook",
            "title": "A jar of 24 marbles",
            "body": "You want to count 24 marbles fast, without pointing to all 24. There is a trick grown-ups use every day: group them into tens.",
            "say": "How do you count 24 marbles fast? Group them into tens."
          },
          {
            "kind": "concept",
            "title": "Tens and ones",
            "body": "Every 2-digit number is really a bundle count. In 24, the 2 means two bundles of ten, and the 4 means four leftover ones.",
            "analogy": "A ten is like a dime, and a one is like a penny. 24 is two dimes and four pennies.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 30,
              "mark": 24,
              "color": "#6C5CE7"
            },
            "say": "In twenty-four, the two means two tens, and the four means four ones."
          },
          {
            "kind": "try",
            "title": "Your turn: build 24",
            "body": "Add tens and ones until you have built the number 24.",
            "widget": {
              "w": "buildNumber",
              "target": 24
            },
            "say": "Add tens and ones to build twenty-four."
          },
          {
            "kind": "example",
            "title": "One more, together",
            "body": "Let us read the number 37 the smart way.",
            "reveal": [
              "The 3 is in the tens place, so it means 3 tens, which is 30.",
              "The 7 is in the ones place, so it means 7 ones.",
              "30 and 7 put together is 37."
            ]
          },
          {
            "kind": "recap",
            "emoji": "🔟",
            "title": "Remember this",
            "takeaway": "The left digit counts tens, the right digit counts ones. That is how every number is built.",
            "say": "The left digit counts tens, the right digit counts ones."
          }
        ]
      },
      {
        "id": "l.m1add20",
        "skillId": "m.1.add20",
        "subject": "math",
        "grade": 1,
        "title": "Addition to 20",
        "subtitle": "When you get more, you count on.",
        "steps": [
          {
            "kind": "hook",
            "title": "More tacos",
            "body": "Nia has 7 tacos on her plate. Then someone hands her 5 more. She does not want to start counting from one. There is a faster way.",
            "say": "Nia has seven tacos. She gets five more. How many now?"
          },
          {
            "kind": "concept",
            "title": "Start at the big number, count on",
            "body": "Hold the first number in your head. Then count up once for each new one you get. Seven, then eight, nine, ten, eleven, twelve.",
            "analogy": "It is like already being on step 7 of a staircase, then climbing 5 more steps. You do not walk back to the bottom first.",
            "say": "Start at seven. Count on five more. Eight, nine, ten, eleven, twelve.",
            "widget": {
              "w": "groups",
              "a": 7,
              "b": 5,
              "emoji": "🌮"
            }
          },
          {
            "kind": "show",
            "title": "Same trick, new snack",
            "body": "Ava has 7 strawberries and gets 4 more. Start at 7, count on 4: eight, nine, ten, eleven. That is 11.",
            "say": "Ava has seven strawberries and gets four more. Eight, nine, ten, eleven. Eleven.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 15,
              "mark": 11,
              "from": 7,
              "to": 11,
              "label": "+4",
              "color": "#e23b5a"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: count on",
            "body": "Ava has 7 strawberries. She gets 4 more. How many now?",
            "say": "Seven strawberries and four more. How many now?",
            "widget": {
              "w": "tapPick",
              "prompt": "7 strawberries and 4 more. How many?",
              "options": [
                {
                  "label": "10"
                },
                {
                  "label": "11",
                  "correct": true
                },
                {
                  "label": "12"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Start at the bigger number and count on. Do not start over at one.",
            "emoji": "🌮",
            "takeaway": "To add, start at the bigger number and count on for each one you get. No need to start over at one."
          }
        ]
      },
      {
        "id": "l.m1sub20",
        "skillId": "m.1.sub20",
        "subject": "math",
        "grade": 1,
        "title": "Subtraction to 20",
        "subtitle": "When some go away, you count back.",
        "steps": [
          {
            "kind": "hook",
            "title": "Balloons that got away",
            "body": "Jayden is holding 10 balloons. He lets go for one second and 2 float up into the sky. How many is he still holding?",
            "say": "Jayden had ten balloons. Two floated away. How many are left?"
          },
          {
            "kind": "concept",
            "title": "Take away, then count what stays",
            "body": "Subtraction means some go away. Start at your number and count backward once for each one that leaves. Ten, then nine, eight. Eight are left.",
            "analogy": "It is like walking DOWN a staircase. Every balloon that floats off is one step down.",
            "say": "Start at ten. Count back two. Nine, eight. Eight are left.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 12,
              "mark": 8,
              "from": 10,
              "to": 8,
              "label": "-2",
              "color": "#4a7fd6"
            }
          },
          {
            "kind": "show",
            "title": "When a lot float away",
            "body": "Ava had 11 balloons and 8 float away. That is a big jump down. Count back from 11 eight times and you land on 3.",
            "say": "Ava had eleven balloons and eight floated away. Counting back, she has three left.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 12,
              "mark": 3,
              "from": 11,
              "to": 3,
              "label": "-8",
              "color": "#4a7fd6"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: count back",
            "body": "Ava had 11 balloons. 8 floated away. How many are left?",
            "say": "Eleven balloons and eight float away. How many are left?",
            "widget": {
              "w": "tapPick",
              "prompt": "11 balloons, 8 float away. How many left?",
              "options": [
                {
                  "label": "2"
                },
                {
                  "label": "3",
                  "correct": true
                },
                {
                  "label": "4"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Start at your number and count back for each one that goes away. That is what is left.",
            "emoji": "🎈",
            "takeaway": "To subtract, start at your number and count backward once for each one that goes away. What you land on is what is left."
          }
        ]
      },
      {
        "id": "l.m1time",
        "skillId": "m.1.time",
        "subject": "math",
        "grade": 1,
        "title": "Clock Reader",
        "subtitle": "Reading the two hands on a clock.",
        "steps": [
          {
            "kind": "hook",
            "title": "When is popcorn time?",
            "body": "The movie starts when the clock says a special time. But which hand tells the hour, and which tells the minutes? Let us crack the code.",
            "say": "The clock has two hands. Which one tells the hour?"
          },
          {
            "kind": "concept",
            "title": "Little hand: hour. Big hand: minutes",
            "body": "The short hand points to the hour. When the long hand points straight up to 12, it is o'clock. Little hand on 10, big hand on 12, means 10:00.",
            "analogy": "The little hand is the hour, like a slow, short turtle. The big hand is a tall, fast rabbit racing around for the minutes.",
            "say": "The little hand is the hour. The big hand on twelve means o'clock. Ten o'clock.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐢",
                  "title": "Little hand",
                  "body": "The hour. Points to 10.",
                  "color": "#3ba55c"
                },
                {
                  "emoji": "🐇",
                  "title": "Big hand",
                  "body": "The minutes. On 12 means o'clock.",
                  "color": "#4a7fd6"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "When the big hand points to 6",
            "body": "When the big hand points to 6, it is half past, the :30. Little hand near 7, big hand on 6, means 7:30.",
            "say": "Big hand on twelve is o'clock. Big hand on six is thirty.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🕕",
                  "title": "Big hand on 12",
                  "body": "o'clock, like 10:00.",
                  "color": "#4a7fd6"
                },
                {
                  "emoji": "🕡",
                  "title": "Big hand on 6",
                  "body": "thirty, like 7:30.",
                  "color": "#e2953b"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: read the clock",
            "body": "Little hand is on 10. Big hand is on 12. What time is it?",
            "say": "Little hand on ten, big hand on twelve. What time is it?",
            "widget": {
              "w": "tapPick",
              "prompt": "Little hand on 10, big hand on 12. What time?",
              "options": [
                {
                  "label": "10:00",
                  "correct": true
                },
                {
                  "label": "12:10"
                },
                {
                  "label": "10:30"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Little hand is the hour. Big hand on twelve is o'clock. Big hand on six is thirty.",
            "emoji": "🕙",
            "takeaway": "Little hand tells the hour. Big hand on 12 means o'clock, and big hand on 6 means thirty."
          }
        ]
      },
      {
        "id": "l.m1coins",
        "skillId": "m.1.coins",
        "subject": "math",
        "grade": 1,
        "title": "Counting Coins in Your Piggy Bank",
        "subtitle": "Every coin has a secret number of pennies inside.",
        "steps": [
          {
            "kind": "hook",
            "title": "The piggy bank puzzle",
            "body": "You shake your piggy bank and out slide some dimes, nickels, and pennies. You want to know one thing: how many cents do you really have?",
            "say": "You empty your piggy bank and want to know how many cents you have."
          },
          {
            "kind": "concept",
            "title": "Each coin is worth a stack of pennies",
            "body": "A penny is 1 cent. A nickel is 5 cents. A dime is 10 cents. So one dime is like a little stack of 10 pennies hiding in one coin.",
            "analogy": "Coins are pennies in disguise. A dime is 10 pennies wearing one coat, a nickel is 5 pennies wearing one coat.",
            "say": "A penny is one cent. A nickel is five cents. A dime is ten cents.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🟤",
                  "title": "Penny",
                  "body": "1 cent"
                },
                {
                  "emoji": "⚪",
                  "title": "Nickel",
                  "body": "5 cents"
                },
                {
                  "emoji": "⚫",
                  "title": "Dime",
                  "body": "10 cents"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Count each kind, then add",
            "body": "Say you have 2 dimes and 2 pennies. The dimes make 20 cents. The pennies make 2 cents. Put them together to get 22 cents.",
            "say": "Two dimes make twenty cents. Two pennies make two cents. Together that is twenty two cents."
          },
          {
            "kind": "try",
            "title": "Your turn: count the piggy bank",
            "body": "Your piggy bank has 3 dimes, 0 nickels, and 1 penny. How many cents is that?",
            "say": "Three dimes make thirty cents. One penny makes one cent. How many cents in all?",
            "widget": {
              "w": "tapPick",
              "prompt": "3 dimes, 0 nickels, 1 penny",
              "options": [
                {
                  "label": "31¢",
                  "correct": true
                },
                {
                  "label": "13¢"
                },
                {
                  "label": "4¢"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 4 dimes, 0 nickels, 3 pennies",
            "body": "Count each kind of coin, then add the totals.",
            "reveal": [
              "4 dimes: four tens is 40 cents.",
              "0 nickels: nothing to add, still 40 cents.",
              "3 pennies: three ones is 3 cents.",
              "40 + 3 = 43 cents."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Dimes are ten, nickels are five, pennies are one. Count each pile, then add them up.",
            "emoji": "🐷",
            "takeaway": "A dime is 10 cents, a nickel is 5 cents, a penny is 1 cent. Count each kind, then add the piles together."
          }
        ]
      },
      {
        "id": "l.m2add100",
        "skillId": "m.2.add100",
        "subject": "math",
        "grade": 2,
        "title": "Adding Two-Digit Numbers",
        "subtitle": "When the ones pile gets too big, trade up.",
        "steps": [
          {
            "kind": "hook",
            "title": "The lemonade money",
            "body": "Ruby's lemonade stand earned 18 cents in the morning and 13 cents in the afternoon. She wants her total before she counts it wrong.",
            "say": "Ruby earned eighteen cents in the morning and thirteen cents in the afternoon. What is her total?"
          },
          {
            "kind": "concept",
            "title": "Add the ones, then the tens",
            "body": "Line up the numbers. Add the ones first. If the ones make 10 or more, you carry one ten over to the tens place.",
            "analogy": "Ten loose pennies is heavy and messy, so you trade them for one dime and slide it over to the tens pile. That trade is called carrying.",
            "say": "Add the ones first. If they reach ten or more, carry a ten over to the tens.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "1️⃣",
                  "title": "Ones first",
                  "body": "8 + 3 = 11"
                },
                {
                  "emoji": "🔁",
                  "title": "Carry the ten",
                  "body": "Keep 1, carry 1"
                },
                {
                  "emoji": "🔟",
                  "title": "Tens next",
                  "body": "1 + 1 + 1 = 3"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Watch the jump on the number line",
            "body": "Start at 18. Jump forward 13. You land on 31. That is the same as 18 plus 13.",
            "say": "Start at eighteen, jump forward thirteen, and you land on thirty one.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 40,
              "from": 18,
              "to": 31,
              "label": "+13"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: Nia's stand",
            "body": "Nia earned 48 cents in the morning and 16 cents in the afternoon. What is her total?",
            "say": "Forty eight plus sixteen. Add the ones, carry if you need to, then add the tens.",
            "widget": {
              "w": "tapPick",
              "prompt": "48 + 16 = ?",
              "options": [
                {
                  "label": "64¢",
                  "correct": true
                },
                {
                  "label": "54¢"
                },
                {
                  "label": "614¢"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 48 + 16",
            "body": "Take it one place at a time.",
            "reveal": [
              "Ones: 8 + 6 = 14. Write 4, carry 1 ten.",
              "Tens: 4 + 1 = 5, plus the carried 1 makes 6.",
              "Put them together: 64 cents."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Ones first. If they reach ten, carry a ten. Then add the tens.",
            "emoji": "🍋",
            "takeaway": "Add the ones first. If they hit 10 or more, carry one ten over. Then add the tens."
          }
        ]
      },
      {
        "id": "l.m2sub100",
        "skillId": "m.2.sub100",
        "subject": "math",
        "grade": 2,
        "title": "Subtracting Two-Digit Numbers",
        "subtitle": "When the top ones are too small, borrow a ten.",
        "steps": [
          {
            "kind": "hook",
            "title": "Pages left to read",
            "body": "Your book has 52 pages. You read 13 of them under the blanket with a flashlight. How many pages are still waiting for you?",
            "say": "Your book has fifty two pages and you read thirteen. How many pages are left?"
          },
          {
            "kind": "concept",
            "title": "Subtract the ones, borrow if you must",
            "body": "Subtract the ones first. If the top ones are too small, borrow one ten from the tens place and hand it to the ones as 10.",
            "analogy": "It is like breaking a dime into 10 pennies so you have enough pennies to hand back. You lose one dime but gain 10 pennies. That is borrowing.",
            "say": "Subtract the ones first. If the top is too small, borrow a ten and turn it into ten ones.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔎",
                  "title": "Look at ones",
                  "body": "2 minus 3 won't go"
                },
                {
                  "emoji": "🔁",
                  "title": "Borrow a ten",
                  "body": "12 minus 3 = 9"
                },
                {
                  "emoji": "🔟",
                  "title": "Tens left",
                  "body": "4 minus 1 = 3"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "See it hop back on the number line",
            "body": "Start at 52. Hop back 13. You land on 39. Those are the pages still left.",
            "say": "Start at fifty two, hop back thirteen, and you land on thirty nine.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 60,
              "from": 52,
              "to": 39,
              "label": "-13"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the big book",
            "body": "A book has 84 pages. You have read 13 of them. How many pages are left?",
            "say": "Eighty four minus thirteen. Subtract the ones, then the tens.",
            "widget": {
              "w": "tapPick",
              "prompt": "84 − 13 = ?",
              "options": [
                {
                  "label": "71",
                  "correct": true
                },
                {
                  "label": "97"
                },
                {
                  "label": "61"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 52 − 13",
            "body": "One place at a time, and borrow when the top is too small.",
            "reveal": [
              "Ones: 2 minus 3 won't go, so borrow a ten. Now it is 12 minus 3 = 9.",
              "Tens: the 5 became 4 after borrowing. 4 minus 1 = 3.",
              "Put them together: 39 pages left."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Ones first. If the top is too small, borrow a ten. Then subtract the tens.",
            "emoji": "🔦",
            "takeaway": "Subtract the ones first. If the top is too small, borrow a ten and turn it into 10 ones. Then subtract the tens."
          }
        ]
      },
      {
        "id": "l.m2skip",
        "skillId": "m.2.skip",
        "subject": "math",
        "grade": 2,
        "title": "Skip Counting",
        "subtitle": "Jump by the same amount every time.",
        "steps": [
          {
            "kind": "hook",
            "title": "Why count one at a time?",
            "body": "Counting 5, 10, 15, 20 is way faster than 1, 2, 3, 4. Skip counting lets you jump ahead in even steps instead of crawling.",
            "say": "Counting by fives is faster than counting by ones. You jump ahead in even steps."
          },
          {
            "kind": "concept",
            "title": "Keep adding the same jump",
            "body": "To count by 5s, add 5 each time. To count by 10s, add 10 each time. The jump never changes, you just keep making it.",
            "analogy": "It is like hopping across stepping stones that are all the same distance apart. Every hop is exactly the same size.",
            "say": "To count by fives, add five each time. Every jump is the same size.",
            "widget": {
              "w": "numberline",
              "min": 20,
              "max": 35,
              "from": 30,
              "to": 35,
              "label": "+5"
            }
          },
          {
            "kind": "show",
            "title": "Counting by 5s",
            "body": "Watch the pattern: 20, then 25, then 30. Each number is 5 more than the one before it.",
            "say": "Twenty, twenty five, thirty. Each one is five more than the last."
          },
          {
            "kind": "try",
            "title": "Your turn: what comes next?",
            "body": "Count by 5s: 20, 25, 30, ___. What number comes next?",
            "say": "Twenty, twenty five, thirty, and then? Add five to thirty.",
            "widget": {
              "w": "tapPick",
              "prompt": "20, 25, 30, ___",
              "options": [
                {
                  "label": "35",
                  "correct": true
                },
                {
                  "label": "31"
                },
                {
                  "label": "40"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: counting by 10s",
            "body": "Find the next number in 20, 30, 40, ___.",
            "reveal": [
              "The jump each time is 10.",
              "Take the last number, 40, and add 10.",
              "40 + 10 = 50, so the next number is 50."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Skip counting means adding the same jump every time. By fives add five, by tens add ten.",
            "emoji": "🦘",
            "takeaway": "Skip counting means adding the same jump every time. By 5s add 5, by 10s add 10, and keep going."
          }
        ]
      },
      {
        "id": "l.m2change",
        "skillId": "m.2.change",
        "subject": "math",
        "grade": 2,
        "title": "Making Change",
        "subtitle": "How much money comes back to you.",
        "steps": [
          {
            "kind": "hook",
            "title": "The smoothie at grandma's",
            "body": "A smoothie costs 47 cents. You hand over 50 cents. The person behind the counter owes you some money back. How much?",
            "say": "A smoothie costs forty seven cents and you pay with fifty cents. How much do you get back?"
          },
          {
            "kind": "concept",
            "title": "Change is what's left over",
            "body": "Change is the money you paid minus the price. Take what you handed over and subtract the cost. What remains comes back to you.",
            "analogy": "Think of it as the gap between the price and the money on the counter. Change is exactly the size of that gap.",
            "say": "Change is what you paid minus the price. From forty seven up to fifty is three.",
            "widget": {
              "w": "numberline",
              "min": 40,
              "max": 50,
              "from": 47,
              "to": 50,
              "label": "+3"
            }
          },
          {
            "kind": "show",
            "title": "Paying with a dollar",
            "body": "A dollar is 100 cents. If a smoothie costs 83 cents, your change is 100 minus 83, which is 17 cents.",
            "say": "A dollar is one hundred cents. One hundred minus eighty three is seventeen cents."
          },
          {
            "kind": "try",
            "title": "Your turn: change from a dollar",
            "body": "At the beach a smoothie costs 83 cents. You pay with a dollar, which is 100 cents. How much change do you get?",
            "say": "One hundred cents minus eighty three cents. How much change comes back?",
            "widget": {
              "w": "tapPick",
              "prompt": "100¢ − 83¢ = ?",
              "options": [
                {
                  "label": "17¢",
                  "correct": true
                },
                {
                  "label": "23¢"
                },
                {
                  "label": "83¢"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: pay 50¢ for a 47¢ smoothie",
            "body": "Subtract the price from what you paid.",
            "reveal": [
              "You paid 50 cents. The smoothie costs 47 cents.",
              "50 minus 47 = 3.",
              "So you get 3 cents back in your pocket."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Change is what you paid minus the price. A dollar is one hundred cents.",
            "emoji": "🥤",
            "takeaway": "Change is what you paid minus the price. Remember a dollar is 100 cents when you subtract."
          }
        ]
      },
      {
        "id": "l.m2groups",
        "skillId": "m.2.groups",
        "subject": "math",
        "grade": 2,
        "title": "Equal Groups: The Start of Multiplying",
        "subtitle": "Same number in every group means you can skip-count fast.",
        "steps": [
          {
            "kind": "hook",
            "title": "Filling party bags",
            "body": "You are making party bags for your friends. You put the SAME number of marbles in each bag so nobody feels cheated. Now you need to know how many marbles you used in all.",
            "say": "You are filling party bags with the same number of marbles in each one. How many did you use in all?"
          },
          {
            "kind": "concept",
            "title": "Equal groups means you can skip-count",
            "body": "When every group holds the same amount, you do not have to count one by one. You count by that amount. Four bags with four marbles each is four groups of four.",
            "analogy": "Think of egg cartons. Every row holds the same number of eggs, so you count by the row, not egg by egg.",
            "say": "When every group has the same amount, count by that amount. Four groups of four is four, eight, twelve, sixteen.",
            "widget": {
              "w": "array",
              "rows": 4,
              "cols": 4,
              "emoji": "🔵"
            }
          },
          {
            "kind": "show",
            "title": "A smaller batch",
            "body": "Five bags with two stickers in each is five groups of two. Count by twos: two, four, six, eight, ten.",
            "say": "Five groups of two. Count by twos: two, four, six, eight, ten. That is ten.",
            "widget": {
              "w": "array",
              "rows": 5,
              "cols": 2,
              "emoji": "⭐"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: count the bags",
            "body": "You make 4 bags with 4 marbles in each. Count 4 groups of 4. How many marbles in all?",
            "say": "Four bags with four marbles in each. Count four, eight, twelve, sixteen. How many in all?",
            "widget": {
              "w": "tapPick",
              "prompt": "4 bags, 4 marbles in each. How many in all?",
              "options": [
                {
                  "label": "8"
                },
                {
                  "label": "12"
                },
                {
                  "label": "16",
                  "correct": true
                },
                {
                  "label": "20"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "5 groups of 2",
            "body": "How many stickers in 5 bags of 2?",
            "reveal": [
              "There are 5 groups, and each group has 2.",
              "Skip-count by two: 2, 4, 6, 8, 10.",
              "5 groups of 2 is 10. That is 5 times 2."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Equal groups let you skip-count. That is the start of multiplying.",
            "emoji": "🎉",
            "takeaway": "Equal groups let you skip-count instead of counting one by one. Groups of a number is the start of multiplying."
          }
        ]
      },
      {
        "id": "l.m2measure",
        "skillId": "m.2.measure",
        "subject": "math",
        "grade": 2,
        "title": "Measure It: Picking the Right Size",
        "subtitle": "Match the object to a size that makes sense.",
        "steps": [
          {
            "kind": "hook",
            "title": "The silly guess",
            "body": "Imagine someone says a giraffe is 25 centimeters tall. That is about the size of your shoe. A giraffe is way taller than that. Good estimating means your guess feels right.",
            "say": "Someone guesses a giraffe is twenty five centimeters, about the size of a shoe. That cannot be right. A good estimate feels right."
          },
          {
            "kind": "concept",
            "title": "Small things use centimeters, big things use meters",
            "body": "A centimeter is about the width of your fingernail. A meter is about the length of a big step or a door's width. Pick the unit that fits the object.",
            "analogy": "Centimeters are for hand-size things like a shoe or a crayon. Meters are for you-size and bigger things like a door or a giraffe.",
            "say": "Centimeters are for small things like a shoe, about twenty five centimeters. Meters are for big things like a giraffe, about five meters.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👟",
                  "title": "Centimeters (cm)",
                  "body": "Small things. A shoe is about 25 cm."
                },
                {
                  "emoji": "🦒",
                  "title": "Meters (m)",
                  "body": "Big things. A giraffe is about 5 m."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Line them up",
            "body": "A giraffe is about 5 meters, taller than a room. A shoe is about 25 centimeters, about as long as your forearm. The number and the unit both have to make sense together.",
            "say": "A giraffe is about five meters, taller than a room. A shoe is about twenty five centimeters."
          },
          {
            "kind": "try",
            "title": "Your turn: best estimate",
            "body": "About how tall is a giraffe? Pick the estimate that makes sense.",
            "say": "About how tall is a giraffe? Pick the estimate that makes sense.",
            "widget": {
              "w": "tapPick",
              "prompt": "About how tall is a giraffe?",
              "options": [
                {
                  "label": "5 centimeters"
                },
                {
                  "label": "5 meters",
                  "correct": true
                },
                {
                  "label": "25 centimeters"
                },
                {
                  "label": "100 meters"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Centimeters for small things, meters for big things. Make sure the guess feels right.",
            "emoji": "📏",
            "takeaway": "Centimeters for hand-size things, meters for people-size and bigger. Check that both the number and the unit feel right."
          }
        ]
      },
      {
        "id": "l.mult",
        "skillId": "m.3.mult",
        "subject": "math",
        "grade": 3,
        "title": "Multiplication Is Rows and Columns",
        "subtitle": "A picture that makes times tables make sense.",
        "steps": [
          {
            "kind": "hook",
            "title": "Chairs for the class",
            "body": "You are setting up chairs in 3 neat rows, with 4 chairs in each row. How many chairs is that? Counting one by one is slow. Multiplying is fast.",
            "say": "Three rows of four chairs. How many chairs? Multiplying is the fast way."
          },
          {
            "kind": "concept",
            "title": "Times means \"rows of\"",
            "body": "3 × 4 means \"3 rows OF 4.\" Line them up in a rectangle and the answer is just how many are inside.",
            "widget": {
              "w": "array",
              "rows": 3,
              "cols": 4,
              "emoji": "🔵"
            },
            "analogy": "Multiplication is adding the same number again and again, but arranged so you can see it: 4 + 4 + 4 = 12.",
            "say": "Three times four means three rows of four. Count the whole rectangle: twelve."
          },
          {
            "kind": "try",
            "title": "Your turn: which is 2 × 5?",
            "body": "Two rows of five. Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "How many in 2 rows of 5?",
              "options": [
                {
                  "label": "7"
                },
                {
                  "label": "10",
                  "correct": true
                },
                {
                  "label": "25"
                }
              ]
            },
            "say": "Two rows of five. Which is the answer?"
          },
          {
            "kind": "recap",
            "emoji": "✖️",
            "title": "Remember this",
            "takeaway": "Multiplication is rows of equal groups. Picture the rectangle and the answer is everything inside it.",
            "say": "Multiplication is rows of equal groups."
          }
        ]
      },
      {
        "id": "l.frac",
        "skillId": "m.3.frac",
        "subject": "math",
        "grade": 3,
        "title": "Fractions Are Fair Shares",
        "subtitle": "The whole idea behind fractions.",
        "steps": [
          {
            "kind": "hook",
            "title": "The pizza problem",
            "body": "You and 3 friends order one pizza. Everybody is hungry and nobody wants to get cheated. How do you split it so it is totally fair?",
            "say": "You and three friends share one pizza. How do you split it fairly?"
          },
          {
            "kind": "concept",
            "title": "A fraction is fair-sharing, written down",
            "body": "Cut the pizza into 4 equal pieces. Each person gets 1 of those 4. We write that as 1 over 4.",
            "analogy": "The bottom number is how many equal pieces you cut. The top number is how many you take.",
            "widget": {
              "w": "fraction",
              "shape": "pizza",
              "parts": 4,
              "shaded": 1
            },
            "say": "Cut it into four equal pieces. Each person gets one of the four. We write it one over four."
          },
          {
            "kind": "show",
            "title": "More pieces, smaller shares",
            "body": "Cut the same pizza into 8 instead of 4, and each slice gets thinner. More pieces means each piece is smaller.",
            "widget": {
              "w": "fraction",
              "shape": "pizza",
              "parts": 8,
              "shaded": 1
            },
            "say": "More pieces means each piece is smaller."
          },
          {
            "kind": "try",
            "title": "Your turn: share the chocolate",
            "body": "Three friends share this chocolate bar fairly. Tap to shade ONE fair share.",
            "widget": {
              "w": "shadeFraction",
              "shape": "bar",
              "parts": 3,
              "target": 1
            },
            "say": "Tap to shade one fair share for three friends."
          },
          {
            "kind": "example",
            "title": "Reading a fraction",
            "body": "What does 3 over 4 mean?",
            "reveal": [
              "The bottom is 4, so cut the whole into 4 equal parts.",
              "The top is 3, so take 3 of those parts.",
              "Three-fourths means you have 3 out of 4 equal pieces."
            ]
          },
          {
            "kind": "recap",
            "emoji": "🍕",
            "title": "Remember this",
            "takeaway": "Bottom is how many equal pieces. Top is how many you have. That is a fraction.",
            "say": "Bottom, how many equal pieces. Top, how many you have."
          }
        ]
      },
      {
        "id": "l.m3div",
        "skillId": "m.3.div",
        "subject": "math",
        "grade": 3,
        "title": "Division Is Fair Sharing",
        "subtitle": "Splitting a pile into equal groups.",
        "steps": [
          {
            "kind": "hook",
            "title": "The cupcake split",
            "body": "You baked 45 cupcakes and 5 friends are coming over. Everyone should get the same amount so it stays fair. How many does each friend get?",
            "say": "You have forty five cupcakes to share equally among five friends. How many does each one get?"
          },
          {
            "kind": "concept",
            "title": "Division undoes equal groups",
            "body": "Sharing 45 cupcakes among 5 friends means finding how many go in each group. Ask: 5 times what makes 45? The answer is 9.",
            "analogy": "Division is dealing out cards. You go around the circle giving one to each person until the pile is gone, and count what each person holds.",
            "say": "Sharing forty five among five friends. Five times nine is forty five, so each friend gets nine.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧁",
                  "title": "Share 45 by 5",
                  "body": "Split 45 cupcakes into 5 equal groups."
                },
                {
                  "emoji": "✖️",
                  "title": "Think times",
                  "body": "5 times 9 is 45, so each gets 9."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Multiplication is the key",
            "body": "Every division fact hides a multiplication fact. To do 20 divided by 4, ask 4 times what is 20. It is 5, so each friend gets 5 strawberries.",
            "say": "Twenty divided by four. Four times five is twenty, so each friend gets five.",
            "widget": {
              "w": "array",
              "rows": 4,
              "cols": 5,
              "emoji": "🍓"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: share the strawberries",
            "body": "20 strawberries shared equally among 4 friends. How many does each friend get?",
            "say": "Twenty strawberries shared equally among four friends. How many does each friend get?",
            "widget": {
              "w": "tapPick",
              "prompt": "20 strawberries, 4 friends, equal shares. How many each?",
              "options": [
                {
                  "label": "4"
                },
                {
                  "label": "5",
                  "correct": true
                },
                {
                  "label": "6"
                },
                {
                  "label": "16"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "45 divided by 5",
            "body": "How many cupcakes per friend?",
            "reveal": [
              "You want 45 split into 5 equal groups.",
              "Ask: 5 times what equals 45?",
              "5 times 9 is 45, so each friend gets 9."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Division is fair sharing. Ask what times the number of groups gives the total.",
            "emoji": "🧁",
            "takeaway": "Division is fair sharing. To find each share, ask what times the number of groups gives the total."
          }
        ]
      },
      {
        "id": "l.m3area",
        "skillId": "m.3.area",
        "subject": "math",
        "grade": 3,
        "title": "Area and Perimeter",
        "subtitle": "Inside space versus the fence around it.",
        "steps": [
          {
            "kind": "hook",
            "title": "Building a garden",
            "body": "You are designing a garden out of grass blocks. You need to know two things: how many grass blocks fill the inside, and how many fence blocks go all the way around.",
            "say": "You are building a block garden. How many grass blocks fill the inside, and how many fence blocks go around the outside?"
          },
          {
            "kind": "concept",
            "title": "Area fills, perimeter surrounds",
            "body": "Area is all the squares INSIDE. You find it by multiplying the two sides. Perimeter is the distance AROUND the edge. You find it by adding up all four sides.",
            "analogy": "Area is the carpet that covers the whole floor. Perimeter is the baseboard trim that runs around the wall.",
            "say": "Area is the space inside, so multiply the two sides. Perimeter is the distance around, so add all four sides.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🟩",
                  "title": "AREA",
                  "body": "Inside blocks. Multiply: width x length."
                },
                {
                  "emoji": "🟫",
                  "title": "PERIMETER",
                  "body": "Fence around. Add all 4 sides."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Area of the garden",
            "body": "A garden 3 blocks wide and 6 blocks long has 3 rows of 6. Multiply: 3 times 6 is 18 grass blocks inside.",
            "say": "Three blocks wide and six long. Three times six is eighteen grass blocks inside.",
            "widget": {
              "w": "array",
              "rows": 3,
              "cols": 6,
              "emoji": "🟩"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: count the fence",
            "body": "A garden is 2 blocks wide and 6 blocks long. Add all four sides for the perimeter: 2 plus 6 plus 2 plus 6.",
            "say": "A garden two wide and six long. Add two plus six plus two plus six. How many fence blocks go around?",
            "widget": {
              "w": "tapPick",
              "prompt": "Garden 2 wide, 6 long. How many fence blocks go around?",
              "options": [
                {
                  "label": "12"
                },
                {
                  "label": "14"
                },
                {
                  "label": "16",
                  "correct": true
                },
                {
                  "label": "18"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Perimeter of a 2 by 6 garden",
            "body": "How many fence blocks?",
            "reveal": [
              "The four sides are 2, 6, 2, and 6.",
              "Add them: 2 plus 6 is 8, plus 2 is 10, plus 6 is 16.",
              "The perimeter is 16 fence blocks."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Area, multiply the sides for the inside. Perimeter, add all four sides for the fence.",
            "emoji": "🟩",
            "takeaway": "Area is inside space, so multiply the sides. Perimeter is the fence around, so add all four sides."
          }
        ]
      },
      {
        "id": "l.m3word",
        "skillId": "m.3.word",
        "subject": "math",
        "grade": 3,
        "title": "Word Problem Power",
        "subtitle": "Do the groups first, then add the extra.",
        "steps": [
          {
            "kind": "hook",
            "title": "Marbles plus a gift",
            "body": "Ava buys 5 packs of marbles with 5 in each pack. Then a friend gives her 5 more as a gift. A good problem solver does these in the right order instead of grabbing every number and adding.",
            "say": "Ava buys five packs of marbles with five in each, then gets five more as a gift. What is the total?"
          },
          {
            "kind": "concept",
            "title": "Multiply the groups, then add the extra",
            "body": "Packs with the same amount in each are equal groups, so you multiply. The gift is a separate pile you add on at the end. Groups first, then the extra.",
            "analogy": "It is like packing a lunchbox. First you multiply how many snacks fit in each row, then you toss in the one treat mom added on top.",
            "say": "First multiply the packs, five times five is twenty five. Then add the five gift marbles to get thirty.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✖️",
                  "title": "Step 1: Groups",
                  "body": "5 packs of 5 = 25 marbles."
                },
                {
                  "emoji": "➕",
                  "title": "Step 2: Extra",
                  "body": "Add the 5 gift marbles = 30."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Watch the order matter",
            "body": "If you added everything first you would get the wrong answer. Multiply the equal groups, THEN add the gift. That order keeps you right.",
            "say": "Multiply the equal groups first, then add the gift. The order keeps your answer right."
          },
          {
            "kind": "try",
            "title": "Your turn: LEGO bricks",
            "body": "Mateo buys 4 packs of LEGO bricks with 6 in each pack, then gets 7 more as a gift. First 4 times 6, then add 7. What is the total?",
            "say": "Four packs of six is twenty four, plus seven more. What is the total?",
            "widget": {
              "w": "tapPick",
              "prompt": "4 packs of 6, plus 7 more. Total bricks?",
              "options": [
                {
                  "label": "24"
                },
                {
                  "label": "28"
                },
                {
                  "label": "31",
                  "correct": true
                },
                {
                  "label": "17"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Ava's marbles",
            "body": "5 packs of 5, plus a gift of 5.",
            "reveal": [
              "The packs are equal groups: 5 times 5 is 25.",
              "The gift is extra: add 5 to the 25.",
              "25 plus 5 is 30 marbles in all."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Multiply the equal groups first, then add the extra. Order matters.",
            "emoji": "🧩",
            "takeaway": "In two-step problems, multiply the equal groups first, then add the extra. Order matters."
          }
        ]
      },
      {
        "id": "l.m4multibig",
        "skillId": "m.4.multibig",
        "subject": "math",
        "grade": 4,
        "title": "Multiplying Bigger Numbers",
        "subtitle": "How to multiply past your times tables.",
        "steps": [
          {
            "kind": "hook",
            "title": "The stadium section",
            "body": "You are counting seats in your section. Every row holds 12 fans, and there are 6 rows. Counting one seat at a time would take all game, so there has to be a faster way.",
            "say": "Every row holds twelve fans, and there are six rows. How many seats in all?"
          },
          {
            "kind": "concept",
            "title": "Break the big number apart",
            "body": "To do 12 times 6, split the 12 into 10 and 2. Multiply each piece by 6, then add the pieces back together.",
            "analogy": "It is like paying with a ten and two ones. You count the ten first, then the coins, then push it all into one pile.",
            "say": "Split twelve into ten and two. Ten times six is sixty. Two times six is twelve. Sixty plus twelve is seventy-two.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "10 × 6",
                  "body": "sixty",
                  "color": "#2563eb"
                },
                {
                  "title": "2 × 6",
                  "body": "twelve",
                  "color": "#16a34a"
                },
                {
                  "title": "add them",
                  "body": "60 + 12 = 72",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "See it as a rectangle",
            "body": "The seats make a rectangle: 6 rows down and 12 seats across. Six rows of twelve seats is seventy-two in all.",
            "say": "Six rows of twelve seats. That is seventy-two seats in all.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Rows",
                  "body": "6 rows",
                  "color": "#2563eb"
                },
                {
                  "title": "Across",
                  "body": "12 seats",
                  "color": "#16a34a"
                },
                {
                  "title": "Total",
                  "body": "6 × 12 = 72",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the next section",
            "body": "A row seats 17 fans and there are 9 rows. Break it up: 10 times 9 is 90, and 7 times 9 is 63. What is 90 plus 63?",
            "say": "Ten times nine is ninety. Seven times nine is sixty-three. Ninety plus sixty-three is what?",
            "widget": {
              "w": "tapPick",
              "prompt": "17 × 9 = ?",
              "options": [
                {
                  "label": "143"
                },
                {
                  "label": "153",
                  "correct": true
                },
                {
                  "label": "163"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 17 × 9",
            "body": "Watch how the split works step by step.",
            "reveal": [
              "Split 17 into 10 and 7.",
              "10 × 9 = 90 and 7 × 9 = 63.",
              "Add the pieces: 90 + 63 = 153 seats."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Break it into tens and ones, multiply each piece, then add them back together.",
            "emoji": "🏟️",
            "takeaway": "Break the big number into tens and ones, multiply each piece, then add the pieces back together."
          }
        ]
      },
      {
        "id": "l.m4longdiv",
        "skillId": "m.4.longdiv",
        "subject": "math",
        "grade": 4,
        "title": "Long Division: Sharing Into Equal Groups",
        "subtitle": "How many groups fit, with nothing left over.",
        "steps": [
          {
            "kind": "hook",
            "title": "Packing the controllers",
            "body": "The game studio has 60 controllers to ship, and each box holds exactly 5. You need to know how many boxes to grab before you start packing.",
            "say": "Sixty controllers, five in each box. How many boxes do you need?"
          },
          {
            "kind": "concept",
            "title": "Division asks: how many groups?",
            "body": "Dividing means splitting a total into equal groups. 60 divided by 5 asks how many groups of 5 fit inside 60.",
            "analogy": "It is the backwards of multiplication. Multiply fills the boxes, divide asks how many boxes you filled.",
            "say": "Sixty divided by five asks how many groups of five fit inside sixty. The answer is twelve.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Total",
                  "body": "60 controllers",
                  "color": "#2563eb"
                },
                {
                  "title": "Each box",
                  "body": "holds 5",
                  "color": "#16a34a"
                },
                {
                  "title": "Boxes",
                  "body": "60 ÷ 5 = 12",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Bigger numbers, one place at a time",
            "body": "For 248 divided by 8, work left to right. 8 goes into 24 three times, then into the 8 one time. That gives 31.",
            "say": "Eight goes into twenty-four three times, then into eight one time. That makes thirty-one.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "24 ÷ 8",
                  "body": "3",
                  "color": "#2563eb"
                },
                {
                  "title": "8 ÷ 8",
                  "body": "1",
                  "color": "#16a34a"
                },
                {
                  "title": "Answer",
                  "body": "31 boxes",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The studio ships 248 controllers in boxes of 8. How many boxes do they need?",
            "say": "Two hundred forty-eight divided by eight. How many boxes?",
            "widget": {
              "w": "tapPick",
              "prompt": "248 ÷ 8 = ?",
              "options": [
                {
                  "label": "24"
                },
                {
                  "label": "31",
                  "correct": true
                },
                {
                  "label": "38"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 248 ÷ 8",
            "body": "Take it one place at a time.",
            "reveal": [
              "8 goes into 2 zero times, so look at 24.",
              "8 goes into 24 three times, exactly. Write 3.",
              "Bring down the 8. 8 goes into 8 one time. The answer is 31 boxes."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Division counts how many equal groups fit. Work one place at a time.",
            "emoji": "📦",
            "takeaway": "Division counts how many equal groups fit. Work the big numbers one place at a time, left to right."
          }
        ]
      },
      {
        "id": "l.m4equivfrac",
        "skillId": "m.4.equivfrac",
        "subject": "math",
        "grade": 4,
        "title": "Equivalent Fractions",
        "subtitle": "Different fractions, same amount.",
        "steps": [
          {
            "kind": "hook",
            "title": "The recipe remix",
            "body": "Your recipe needs 3/4 cup of flour, but your only measuring cup is split into twelfths. You need a fraction with 12 on the bottom that is still exactly 3/4.",
            "say": "Your recipe needs three fourths cup, but your cup is split into twelfths. What fraction equals three fourths?"
          },
          {
            "kind": "concept",
            "title": "Cut every piece the same way",
            "body": "If you cut each of the 4 pieces into 3 smaller pieces, you now have 12 pieces and 9 of them are shaded. It is the same flour, just more cuts.",
            "analogy": "It is like trading a 1-dollar bill for four quarters. The number changed, the money did not.",
            "say": "Cut each of the four pieces into three. Now there are twelve pieces and nine are shaded. Three fourths equals nine twelfths.",
            "widget": {
              "w": "fraction",
              "shape": "bar",
              "parts": 12,
              "shaded": 9
            }
          },
          {
            "kind": "show",
            "title": "The shortcut: multiply top and bottom",
            "body": "You do not have to draw it. Multiply the top and the bottom by the same number. 3/4 times 3/3 gives 9/12.",
            "say": "Multiply the top and the bottom by the same number. Three fourths times three over three is nine twelfths.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Start",
                  "body": "3/4",
                  "color": "#2563eb"
                },
                {
                  "title": "Times 3/3",
                  "body": "3×3 over 4×3",
                  "color": "#16a34a"
                },
                {
                  "title": "Equal",
                  "body": "9/12",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: shade the match",
            "body": "A recipe needs 1/2 cup, but your cup shows eighths. Shade 4 of the 8 parts to show the fraction equal to 1/2.",
            "say": "One half equals how many eighths? Shade four of the eight parts.",
            "widget": {
              "w": "shadeFraction",
              "shape": "bar",
              "parts": 8,
              "target": 4
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 1/2 = ?/8",
            "body": "Turn one half into eighths.",
            "reveal": [
              "The bottom went from 2 to 8, which is times 4.",
              "Do the same to the top: 1 × 4 = 4.",
              "So 1/2 equals 4/8. Same amount, more pieces."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Multiply the top and bottom by the same number, and the fraction stays equal.",
            "emoji": "👩‍🍳",
            "takeaway": "Multiply the top and bottom by the same number and the fraction stays equal. Different pieces, same amount."
          }
        ]
      },
      {
        "id": "l.m4decimals",
        "skillId": "m.4.decimals",
        "subject": "math",
        "grade": 4,
        "title": "Decimals Are Just Money",
        "subtitle": "Reading the dot at self-checkout.",
        "steps": [
          {
            "kind": "hook",
            "title": "Beep at self-checkout",
            "body": "You scan a snack and the screen shows 5 dollars and 15 cents. To type it in, you need to know where the dot goes and what comes after it.",
            "say": "The snack is five dollars and fifteen cents. How do you write that with a decimal point?"
          },
          {
            "kind": "concept",
            "title": "The dot splits dollars from cents",
            "body": "Everything left of the dot is whole dollars. Everything right of the dot is cents, always two digits. So 5 dollars and 15 cents is 5 point 1 5.",
            "analogy": "The decimal point is the little fence between your dollars and your loose change.",
            "say": "Left of the dot is whole dollars. Right of the dot is cents. Five dollars and fifteen cents is five point one five.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Left of dot",
                  "body": "5 whole dollars",
                  "color": "#2563eb"
                },
                {
                  "title": "Right of dot",
                  "body": "15 cents",
                  "color": "#16a34a"
                },
                {
                  "title": "Written",
                  "body": "$5.15",
                  "color": "#d97706"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Cents are hundredths",
            "body": "There are 100 cents in a dollar, so 15 cents is 15 out of 100. That is why we say 5 and 15 hundredths, written $5.15.",
            "say": "There are one hundred cents in a dollar, so fifteen cents is fifteen hundredths. Five and fifteen hundredths."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "You scan a snack for 9 dollars and 22 cents. How is that written as a decimal?",
            "say": "Nine dollars and twenty-two cents. Which one is right?",
            "widget": {
              "w": "tapPick",
              "prompt": "9 dollars and 22 cents = ?",
              "options": [
                {
                  "label": "$9.022"
                },
                {
                  "label": "$9.22",
                  "correct": true
                },
                {
                  "label": "$92.2"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 9 dollars, 22 cents",
            "body": "Place each part around the dot.",
            "reveal": [
              "Whole dollars go left of the dot: 9.",
              "Cents go right of the dot, two digits: 22.",
              "Put them together: $9.22."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The decimal point is the fence between dollars and cents. Dollars left, two cent digits right.",
            "emoji": "🧾",
            "takeaway": "The decimal point is the fence between dollars and cents. Dollars on the left, two cent-digits on the right."
          }
        ]
      },
      {
        "id": "l.m4factors",
        "skillId": "m.4.factors",
        "subject": "math",
        "grade": 4,
        "title": "Factors: The Numbers That Fit Evenly",
        "subtitle": "Splitting into equal groups with nothing left over.",
        "steps": [
          {
            "kind": "hook",
            "title": "Boxing the cupcakes",
            "body": "You baked 16 cupcakes and want to pack them into equal boxes with none left over. Some box sizes work perfectly, and some leave a lonely cupcake behind.",
            "say": "Sixteen cupcakes packed into equal boxes with none left over. Which box sizes work?"
          },
          {
            "kind": "concept",
            "title": "A factor divides with no leftovers",
            "body": "A factor of 16 is a number that splits 16 into equal groups with nothing remaining. 4 works because 16 divided by 4 is exactly 4 boxes.",
            "analogy": "A factor fits like a puzzle piece that leaves no gap. If even one cupcake is left over, that size is not a factor.",
            "say": "Sixteen cupcakes make a four by four grid. Four boxes of four, none left over. Four is a factor of sixteen.",
            "widget": {
              "w": "array",
              "rows": 4,
              "cols": 4,
              "emoji": "🧁"
            }
          },
          {
            "kind": "show",
            "title": "Test a size that does NOT fit",
            "body": "Try boxes of 5. 16 divided by 5 is 3 boxes with 1 cupcake left over. Because there is a leftover, 5 is not a factor of 16.",
            "say": "Boxes of five leave one cupcake over, so five is not a factor. Boxes of four leave nothing, so four is.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Boxes of 4",
                  "body": "16 ÷ 4 = 4, none left. Factor.",
                  "color": "#16a34a"
                },
                {
                  "title": "Boxes of 5",
                  "body": "16 ÷ 5 = 3 r 1. Not a factor.",
                  "color": "#dc2626"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: 36 cupcakes",
            "body": "You have 36 cupcakes to split into equal boxes with none left over. Which box size works?",
            "say": "Thirty-six cupcakes, equal boxes, none left over. Which box size works?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which is a factor of 36?",
              "options": [
                {
                  "label": "5"
                },
                {
                  "label": "7"
                },
                {
                  "label": "9",
                  "correct": true
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: is 9 a factor of 36?",
            "body": "Check for a leftover.",
            "reveal": [
              "Split 36 into boxes of 9.",
              "36 ÷ 9 = 4 boxes, exactly.",
              "No cupcakes left over, so 9 is a factor of 36."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A factor divides evenly with nothing left over. A leftover means it is not a factor.",
            "emoji": "🧁",
            "takeaway": "A factor divides a number into equal groups with nothing left over. If there is a leftover, it is not a factor."
          }
        ]
      },
      {
        "id": "l.m5fracops",
        "skillId": "m.5.fracops",
        "subject": "math",
        "grade": 5,
        "title": "Adding Fractions With the Same Bottom",
        "subtitle": "When the pieces are the same size, just count them.",
        "steps": [
          {
            "kind": "hook",
            "title": "The pizza party",
            "body": "One pizza is cut into 6 equal slices. You eat 1 slice and your cousin eats 1 slice. How much of the pizza did the two of you eat together?",
            "say": "One pizza is cut into six equal slices. You eat one and your cousin eats one. How much did you eat together?"
          },
          {
            "kind": "concept",
            "title": "Same-size pieces just add up",
            "body": "When two fractions have the same bottom number, the pieces are the same size. So you add the top numbers and keep the bottom the same.",
            "analogy": "It is like counting slices. One slice plus one slice is two slices, and each slice is still one sixth of the pizza.",
            "say": "When the bottoms match, the pieces are the same size. Add the tops and keep the bottom. One slice plus one slice is two slices.",
            "widget": {
              "w": "groups",
              "a": 1,
              "b": 1,
              "emoji": "🍕"
            }
          },
          {
            "kind": "show",
            "title": "The bottom does not change",
            "body": "1/6 + 1/6 = 2/6. The 6 stays because the slices are still sixths. Only the count of slices went up.",
            "say": "One sixth plus one sixth is two sixths. The bottom stays six because the slices are still sixths.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "➕",
                  "title": "Add the tops",
                  "body": "1 + 1 = 2 slices"
                },
                {
                  "emoji": "🔒",
                  "title": "Keep the bottom",
                  "body": "Still sixths, so 6"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "You eat 9/12 of a pizza and your cousin eats 2/12. Add the tops and keep the bottom. How much together?",
            "say": "Nine twelfths plus two twelfths. Add the tops, keep the bottom. How much together?",
            "widget": {
              "w": "tapPick",
              "prompt": "9/12 + 2/12 = ?",
              "options": [
                {
                  "label": "11/12",
                  "correct": true
                },
                {
                  "label": "11/24"
                },
                {
                  "label": "7/12"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Add 9/12 + 2/12 step by step.",
            "reveal": [
              "The bottoms match, both are twelfths, so the pieces are the same size.",
              "Add the top numbers: 9 + 2 = 11.",
              "Keep the bottom the same: 12. The answer is 11/12."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Same bottom? Add the tops, keep the bottom.",
            "emoji": "🍕",
            "takeaway": "When the bottoms are the same, add the top numbers and keep the bottom. The pieces do not change size."
          }
        ]
      },
      {
        "id": "l.m5decops",
        "skillId": "m.5.decops",
        "subject": "math",
        "grade": 5,
        "title": "Adding Money and Decimals",
        "subtitle": "Line up the dots and add like normal.",
        "steps": [
          {
            "kind": "hook",
            "title": "Lunch line math",
            "body": "Tacos cost $2.45 and a smoothie costs $1.15. You hand over your money. What is the total you owe?",
            "say": "Tacos cost two dollars and forty five cents. A smoothie costs one dollar and fifteen cents. What is the total?"
          },
          {
            "kind": "concept",
            "title": "Stack the decimal points",
            "body": "Write the numbers so the decimal points line up in one straight column. Then add each column like you always do, and drop the point straight down.",
            "analogy": "The decimal point is like the seam on a coin sorter. Line the seams up so cents land under cents and dollars under dollars.",
            "say": "Line up the decimal points in a straight column. Add each column, then bring the point straight down.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌮",
                  "title": "Tacos",
                  "body": "$2.45"
                },
                {
                  "emoji": "🥤",
                  "title": "Smoothie",
                  "body": "$1.15"
                },
                {
                  "emoji": "🟰",
                  "title": "Total",
                  "body": "$3.60"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why lining up matters",
            "body": "Cents go under cents, dollars under dollars. 45 cents plus 15 cents is 60 cents, and 2 dollars plus 1 dollar is 3 dollars.",
            "say": "Cents under cents, dollars under dollars. Forty five cents plus fifteen cents is sixty cents. Two dollars plus one dollar is three dollars.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 5,
              "mark": 3,
              "from": 2,
              "to": 3,
              "label": "+$1"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Tacos cost $7.42 and a smoothie costs $3.00. Line up the points and add. What is the total?",
            "say": "Seven dollars and forty two cents plus three dollars. Line up the points and add. What is the total?",
            "widget": {
              "w": "tapPick",
              "prompt": "$7.42 + $3.00 = ?",
              "options": [
                {
                  "label": "$10.42",
                  "correct": true
                },
                {
                  "label": "$7.72"
                },
                {
                  "label": "$10.72"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Add $7.42 + $3.00.",
            "reveal": [
              "Stack them with the decimal points lined up: 7.42 over 3.00.",
              "Add the cents: 42 + 00 = 42 cents.",
              "Add the dollars: 7 + 3 = 10. Bring the point down: $10.42."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Line up the dots, add, and bring the point straight down.",
            "emoji": "🌮",
            "takeaway": "Line up the decimal points, add each column, and drop the point straight down into the answer."
          }
        ]
      },
      {
        "id": "l.m5volume",
        "skillId": "m.5.volume",
        "subject": "math",
        "grade": 5,
        "title": "Volume of a Box",
        "subtitle": "How much can it hold? Multiply all three.",
        "steps": [
          {
            "kind": "hook",
            "title": "Filling the aquarium",
            "body": "You are filling a fish tank that is 4 feet long, 6 feet wide, and 4 feet tall. How many cubic feet of water will it take to fill it up?",
            "say": "You are filling a fish tank that is four feet long, six feet wide, and four feet tall. How much water fills it?"
          },
          {
            "kind": "concept",
            "title": "Stack the layers",
            "body": "Volume is length times width times height. First find how many cubes cover the bottom, then stack that layer up for the height.",
            "analogy": "Think of packing the tank with 1-foot sugar cubes. One layer covers the floor, then you stack layers to the top.",
            "say": "Volume is length times width times height. Cover the floor with cubes, then stack that layer up to the top.",
            "widget": {
              "w": "array",
              "rows": 4,
              "cols": 6,
              "emoji": "🧊"
            }
          },
          {
            "kind": "show",
            "title": "One layer, then stack it",
            "body": "The floor is 4 × 6 = 24 cubes. The tank is 4 layers tall, so 24 × 4 = 96 cubic feet.",
            "say": "The floor is four times six, which is twenty four cubes. Stack it four high. Twenty four times four is ninety six cubic feet.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🟦",
                  "title": "One floor layer",
                  "body": "4 × 6 = 24 cubes"
                },
                {
                  "emoji": "📚",
                  "title": "Stack 4 high",
                  "body": "24 × 4 = 96"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A different aquarium is 5 × 3 × 5 feet. Multiply all three sides. How many cubic feet of water fills it?",
            "say": "This tank is five by three by five. Multiply all three sides. How many cubic feet?",
            "widget": {
              "w": "tapPick",
              "prompt": "5 × 3 × 5 = ? cubic feet",
              "options": [
                {
                  "label": "75",
                  "correct": true
                },
                {
                  "label": "13"
                },
                {
                  "label": "45"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Find the volume of a 5 × 3 × 5 tank.",
            "reveal": [
              "Multiply the first two sides for one layer: 5 × 3 = 15.",
              "Multiply by the height to stack the layers: 15 × 5 = 75.",
              "The tank holds 75 cubic feet of water."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Volume is length times width times height.",
            "emoji": "🐠",
            "takeaway": "Volume is length times width times height. Cover the floor with cubes, then stack the layers up."
          }
        ]
      },
      {
        "id": "l.m5oop",
        "skillId": "m.5.oop",
        "subject": "math",
        "grade": 5,
        "title": "Multiply Before You Add",
        "subtitle": "The order you do math in changes the answer.",
        "steps": [
          {
            "kind": "hook",
            "title": "Video game score",
            "body": "You start with 6 points. Then you defeat 6 monsters, each worth 3 points. Your score is 6 + 6 × 3. What is the real total?",
            "say": "You start with six points. Then you defeat six monsters, each worth three points. Six plus six times three. What is the total?"
          },
          {
            "kind": "concept",
            "title": "Grouping happens first",
            "body": "Multiplication is a shortcut for groups, so it happens before adding. Do 6 × 3 first, then add the 6 you started with.",
            "analogy": "Multiplying is bagging the monster points into a bundle. You bundle first, then drop the bundle onto your starting score.",
            "say": "Multiplication happens before adding. Do six times three first, which is eighteen. Then add the six you started with.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "1️⃣",
                  "title": "First: multiply",
                  "body": "6 × 3 = 18"
                },
                {
                  "emoji": "2️⃣",
                  "title": "Then: add",
                  "body": "18 + 6 = 24"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "See the trap",
            "body": "If you added left to right you would get 6 + 6 = 12, then 12 × 3 = 36. That is wrong. Multiply first to get the true 24.",
            "say": "If you just went left to right you would get thirty six, and that is wrong. Multiply first to get the true answer, twenty four.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✅",
                  "title": "Right way",
                  "body": "6 + (6 × 3) = 24",
                  "color": "#2e7d32"
                },
                {
                  "emoji": "❌",
                  "title": "Wrong way",
                  "body": "(6 + 6) × 3 = 36",
                  "color": "#c62828"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "You have 3 points, then defeat 7 monsters worth 5 points each: 3 + 7 × 5. Multiply first, then add.",
            "say": "Three plus seven times five. Multiply first, then add. What is the total?",
            "widget": {
              "w": "tapPick",
              "prompt": "3 + 7 × 5 = ?",
              "options": [
                {
                  "label": "38",
                  "correct": true
                },
                {
                  "label": "50"
                },
                {
                  "label": "35"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Solve 3 + 7 × 5.",
            "reveal": [
              "Find the multiplication and do it first: 7 × 5 = 35.",
              "Now add the number you started with: 35 + 3 = 38.",
              "The score is 38."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Multiply before you add.",
            "emoji": "🎮",
            "takeaway": "Multiplication comes before addition. Bundle the groups first, then add. 6 + 6 × 3 is 24, not 36."
          }
        ]
      },
      {
        "id": "l.m6ratio",
        "skillId": "m.6.ratio",
        "subject": "math",
        "grade": 6,
        "title": "Scaling Up a Recipe",
        "subtitle": "Ratios grow, but the recipe stays the same.",
        "steps": [
          {
            "kind": "hook",
            "title": "The trail mix rule",
            "body": "A recipe says 5 cups of nuts for every 3 cups of raisins. You want a big batch and pour in 20 cups of nuts. How many cups of raisins keep it tasting right?",
            "say": "The recipe is five cups of nuts for every three cups of raisins. You pour in twenty cups of nuts. How many cups of raisins?"
          },
          {
            "kind": "concept",
            "title": "Scale both by the same number",
            "body": "A ratio like 5 to 3 stays the same as long as you multiply both parts by the same number. Grow the nuts and the raisins together.",
            "analogy": "It is like a photocopy set to enlarge. Everything gets bigger by the same amount, so the picture never looks stretched.",
            "say": "A ratio stays the same when you multiply both parts by the same number. Grow the nuts and raisins together.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥜",
                  "title": "Nuts",
                  "body": "5 → 20 (times 4)"
                },
                {
                  "emoji": "🍇",
                  "title": "Raisins",
                  "body": "3 → ? (times 4)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Find the scale factor first",
            "body": "Ask what turns 5 into 20. Since 5 × 4 = 20, the scale factor is 4. Now do the same to the raisins: 3 × 4 = 12.",
            "say": "Ask what turns five into twenty. Five times four is twenty, so the scale factor is four. Then three times four is twelve raisins.",
            "widget": {
              "w": "array",
              "rows": 3,
              "cols": 4,
              "emoji": "🍇"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A recipe uses 4 cups of nuts for every 4 cups of raisins. You use 24 cups of nuts. Find the scale factor, then the raisins.",
            "say": "Four to four, and you use twenty four cups of nuts. Find the scale factor, then the raisins.",
            "widget": {
              "w": "tapPick",
              "prompt": "4 : 4 with 24 cups of nuts → how many raisins?",
              "options": [
                {
                  "label": "24",
                  "correct": true
                },
                {
                  "label": "6"
                },
                {
                  "label": "12"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Solve 4 : 4 scaled to 24 cups of nuts.",
            "reveal": [
              "Find the scale factor: 4 × ? = 24, so the factor is 6.",
              "Multiply the raisins by the same 6: 4 × 6 = 24.",
              "You need 24 cups of raisins."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Multiply both parts of a ratio by the same number to keep it the same.",
            "emoji": "🥜",
            "takeaway": "To keep a ratio the same, multiply both parts by the same number. Find the scale factor, then apply it to the other part."
          }
        ]
      },
      {
        "id": "l.m6percent",
        "skillId": "m.6.percent",
        "subject": "math",
        "grade": 6,
        "title": "Percent Power",
        "subtitle": "How to take a piece of any price.",
        "steps": [
          {
            "kind": "hook",
            "title": "The 10% off sign",
            "body": "Sneakers cost $50 and the sign says 10% off. The cashier says you save $5. How did she figure that out so fast?",
            "say": "Sneakers cost fifty dollars, ten percent off. You save five dollars. How did the cashier know that so fast?"
          },
          {
            "kind": "concept",
            "title": "Percent means out of 100",
            "body": "Percent means per hundred. So 10% means 10 out of every 100. To find a percent of a number, turn the percent into a decimal and multiply.",
            "analogy": "Think of a dollar as 100 pennies. One percent is one penny out of that dollar, so ten percent is ten pennies, a dime.",
            "say": "Percent means out of one hundred. Ten percent is zero point one zero. Multiply zero point one zero by fifty to get five dollars.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💯",
                  "title": "The percent",
                  "body": "10% = 10 out of 100 = 0.10"
                },
                {
                  "emoji": "✖️",
                  "title": "The move",
                  "body": "0.10 × 50 = 5 dollars saved"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Same trick, bigger tip",
            "body": "Dinner costs $150 and you leave a 60% tip. Turn 60% into 0.60, then multiply: 0.60 × 150 = 90. The tip is $90.",
            "say": "For a sixty percent tip on one hundred fifty dollars, multiply zero point six zero by one hundred fifty to get ninety dollars."
          },
          {
            "kind": "try",
            "title": "Your turn: the sale price",
            "body": "A jacket costs $50 and is 10% off. How many dollars do you save?",
            "say": "A fifty dollar jacket is ten percent off. How many dollars do you save?",
            "widget": {
              "w": "tapPick",
              "prompt": "10% off of $50 saves you how much?",
              "options": [
                {
                  "label": "$5",
                  "correct": true
                },
                {
                  "label": "$10"
                },
                {
                  "label": "$50"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: the 60% tip",
            "body": "Find 60% of $150.",
            "reveal": [
              "Change the percent to a decimal: 60% becomes 0.60.",
              "Multiply by the amount: 0.60 × 150.",
              "That equals 90, so the tip is $90."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Percent means out of one hundred. Turn it into a decimal, then multiply.",
            "emoji": "💰",
            "takeaway": "Percent means out of 100. Turn the percent into a decimal, then multiply by the number."
          }
        ]
      },
      {
        "id": "l.m6integers",
        "skillId": "m.6.integers",
        "subject": "math",
        "grade": 6,
        "title": "Negative Numbers",
        "subtitle": "What happens when you go below zero.",
        "steps": [
          {
            "kind": "hook",
            "title": "The cold night",
            "body": "It is 8° outside. Overnight the temperature drops 17 degrees. The morning number is below zero. How far below?",
            "say": "It is eight degrees outside, then it drops seventeen degrees overnight. The new number is below zero. How far?"
          },
          {
            "kind": "concept",
            "title": "Zero is not the bottom",
            "body": "The number line keeps going past zero into negative numbers. When you subtract more than you have, you cross zero and land on the other side.",
            "analogy": "It is like a thermometer. When it gets cold enough, the red line drops below the zero mark instead of stopping there.",
            "say": "The number line keeps going past zero into the negatives. Start at eight and drop seventeen. You land on negative nine.",
            "widget": {
              "w": "numberline",
              "min": -12,
              "max": 12,
              "mark": -9,
              "from": 8,
              "to": -9,
              "label": "-17"
            }
          },
          {
            "kind": "show",
            "title": "Count down past zero",
            "body": "From 8, going down 17 steps: you use 8 steps to reach zero, then 9 more steps below it. That leaves you at -9.",
            "say": "From eight, eight steps gets you to zero, then nine more steps below zero lands you at negative nine."
          },
          {
            "kind": "try",
            "title": "Your turn: another cold night",
            "body": "It is 14° outside, then the temperature drops 15 degrees. What is the new temperature?",
            "say": "It is fourteen degrees, then it drops fifteen degrees. What is the new temperature?",
            "widget": {
              "w": "tapPick",
              "prompt": "14 − 15 = ?",
              "options": [
                {
                  "label": "-1°",
                  "correct": true
                },
                {
                  "label": "1°"
                },
                {
                  "label": "-29°"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 8 minus 17",
            "body": "Start at 8, drop 17.",
            "reveal": [
              "First drop 8 degrees to reach exactly 0.",
              "You still have 9 more degrees to drop past zero.",
              "9 below zero is written -9, so the answer is -9°."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Subtract more than you have and you cross zero into the negatives. Count how far past zero you land.",
            "emoji": "⛄",
            "takeaway": "When you subtract more than you have, you cross zero into negative numbers. Count how far past zero you go."
          }
        ]
      },
      {
        "id": "l.m6expr",
        "skillId": "m.6.expr",
        "subject": "math",
        "grade": 6,
        "title": "Expressions & Variables",
        "subtitle": "A letter that stands for a number.",
        "steps": [
          {
            "kind": "hook",
            "title": "The dog-walking business",
            "body": "You charge $11 just for showing up, plus $8 for each walk. If you do 2 walks today, what do you get paid?",
            "say": "You charge eleven dollars to show up, plus eight dollars for each walk. If you do two walks, what do you get paid?"
          },
          {
            "kind": "concept",
            "title": "A variable is a blank to fill in",
            "body": "In 11 + 8w, the letter w stands for the number of walks. It is a blank waiting for a number. When you know w, you slide it in.",
            "analogy": "The w is like a jersey number that changes each game. The rule stays the same, you just plug in today's number.",
            "say": "In eleven plus eight w, the letter w stands for the number of walks. When you know w, you slide it in.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📝",
                  "title": "The rule",
                  "body": "11 + 8w"
                },
                {
                  "emoji": "🐕",
                  "title": "Today",
                  "body": "w = 2 walks"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Multiply before you add",
            "body": "8w means 8 times w. With w = 2, that is 8 × 2 = 16. Do the multiplying first, then add the 11 to get 27.",
            "say": "Eight w means eight times w. Eight times two is sixteen. Multiply first, then add eleven to get twenty seven."
          },
          {
            "kind": "try",
            "title": "Your turn: a different price",
            "body": "Now you charge $12 plus $11 per walk, so 12 + 11w. If w = 2, what do you earn?",
            "say": "You charge twelve dollars plus eleven dollars per walk. If w equals two, what do you earn?",
            "widget": {
              "w": "tapPick",
              "prompt": "12 + 11w when w = 2",
              "options": [
                {
                  "label": "$34",
                  "correct": true
                },
                {
                  "label": "$46"
                },
                {
                  "label": "$25"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 11 + 8w",
            "body": "Find 11 + 8w when w = 2.",
            "reveal": [
              "Replace w with 2: 11 + 8 × 2.",
              "Multiply first: 8 × 2 = 16.",
              "Then add: 11 + 16 = 27 dollars."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A variable is a blank you fill with a number. Plug it in, multiply first, then add.",
            "emoji": "🐕",
            "takeaway": "A variable is a blank you fill with a number. Plug it in, multiply first, then add."
          }
        ]
      },
      {
        "id": "l.m7proportion",
        "skillId": "m.7.proportion",
        "subject": "math",
        "grade": 7,
        "title": "Proportions & Unit Rates",
        "subtitle": "Find the price of one, then scale up.",
        "steps": [
          {
            "kind": "hook",
            "title": "The smoothie order",
            "body": "5 smoothies cost $10. Your friend wants 8 smoothies at the same price. What will 8 cost?",
            "say": "Five smoothies cost ten dollars. How much would eight smoothies cost at the same rate?"
          },
          {
            "kind": "concept",
            "title": "Find the price of just one",
            "body": "The unit rate is the price of a single item. Divide the total by how many you got: $10 ÷ 5 = $2 for one smoothie. That one number unlocks any amount.",
            "analogy": "It is like knowing the price of one baseball card. Once you know one, you can find the cost of any stack.",
            "say": "The unit rate is the price of one. Ten dollars divided by five is two dollars each.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥤",
                  "title": "The deal",
                  "body": "5 smoothies = $10"
                },
                {
                  "emoji": "1️⃣",
                  "title": "Unit rate",
                  "body": "$10 ÷ 5 = $2 each"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Scale up to any number",
            "body": "Once one smoothie is $2, multiply by however many you want. For 8 smoothies: $2 × 8 = $16.",
            "say": "One smoothie is two dollars, so eight smoothies is two times eight, which is sixteen dollars."
          },
          {
            "kind": "try",
            "title": "Your turn: a pricier stand",
            "body": "At another stand, 5 smoothies cost $20. At the same rate, how much do 7 smoothies cost?",
            "say": "Five smoothies cost twenty dollars. At the same rate, how much do seven smoothies cost?",
            "widget": {
              "w": "tapPick",
              "prompt": "5 smoothies = $20, so 7 smoothies = ?",
              "options": [
                {
                  "label": "$28",
                  "correct": true
                },
                {
                  "label": "$35"
                },
                {
                  "label": "$24"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 8 smoothies",
            "body": "5 smoothies cost $10. Find the cost of 8.",
            "reveal": [
              "Find one smoothie: $10 ÷ 5 = $2 each.",
              "Multiply by how many you want: $2 × 8.",
              "That equals $16 for 8 smoothies."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Divide to find the price of one, then multiply to scale up to any amount.",
            "emoji": "🥤",
            "takeaway": "Find the unit rate, the price of one, by dividing. Then multiply to scale up to any amount."
          }
        ]
      },
      {
        "id": "l.m7equation",
        "skillId": "m.7.equation",
        "subject": "math",
        "grade": 7,
        "title": "Solving Equations",
        "subtitle": "Undo the steps to free the x.",
        "steps": [
          {
            "kind": "hook",
            "title": "The escape-room lock",
            "body": "The lock shows 4x + 16 = 44. The door only opens when you find x. What number is hiding?",
            "say": "The escape room lock shows four x plus sixteen equals forty four. Find x and the door opens."
          },
          {
            "kind": "concept",
            "title": "Undo it, in reverse order",
            "body": "x got multiplied by 4, then 16 was added. To free x, undo those steps backward: first subtract 16 from both sides, then divide both sides by 4.",
            "analogy": "It is like untying your shoes. You undo the last knot first, in the opposite order you tied it.",
            "say": "Undo the steps backward. First subtract sixteen from both sides, then divide both sides by four.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "➖",
                  "title": "Step 1",
                  "body": "Subtract 16: 4x = 28"
                },
                {
                  "emoji": "➗",
                  "title": "Step 2",
                  "body": "Divide by 4: x = 7"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Keep both sides equal",
            "body": "Whatever you do to one side, do to the other, so the scale stays balanced. Subtract 16 from both sides: 4x + 16 − 16 = 44 − 16, which is 4x = 28.",
            "say": "Whatever you do to one side, do to the other. Subtract sixteen from both sides to get four x equals twenty eight."
          },
          {
            "kind": "try",
            "title": "Your turn: crack the lock",
            "body": "Solve 4x + 19 = 47. What is x?",
            "say": "Solve four x plus nineteen equals forty seven. What is x?",
            "widget": {
              "w": "tapPick",
              "prompt": "4x + 19 = 47, so x = ?",
              "options": [
                {
                  "label": "7",
                  "correct": true
                },
                {
                  "label": "8"
                },
                {
                  "label": "16"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: 4x + 16 = 44",
            "body": "Solve for x.",
            "reveal": [
              "Subtract 16 from both sides: 4x = 28.",
              "Divide both sides by 4: x = 28 ÷ 4.",
              "That gives x = 7, and the door opens."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Undo in reverse. Subtract first, then divide, and do the same to both sides.",
            "emoji": "🔐",
            "takeaway": "Undo the operations in reverse: subtract first, then divide. Do the same thing to both sides."
          }
        ]
      },
      {
        "id": "l.m7prob",
        "skillId": "m.7.prob",
        "subject": "math",
        "grade": 7,
        "title": "Probability: Counting Your Chances",
        "subtitle": "How likely something is, written as a fraction.",
        "steps": [
          {
            "kind": "hook",
            "title": "The claw machine",
            "body": "You spot one red plushie in a machine packed with blue ones. You get one grab. What are the odds the claw comes up red?",
            "say": "You spot one red plushie in a machine full of blue ones. What are the odds you grab the red one?"
          },
          {
            "kind": "concept",
            "title": "Wanted over total",
            "body": "Probability is a fraction. The top is how many outcomes you want. The bottom is how many outcomes there are in all.",
            "analogy": "Think of raffle tickets in a hat. Your chance is your tickets over all the tickets in the hat.",
            "say": "The top is how many you want. The bottom is how many there are in all.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🎯",
                  "title": "Top",
                  "body": "How many you want (red = 1)"
                },
                {
                  "emoji": "🧺",
                  "title": "Bottom",
                  "body": "How many total (1 + 3 = 4)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Count everything first",
            "body": "1 red plus 3 blue is 4 plushies total. One of them is red, so the chance of red is 1 out of 4.",
            "say": "One red plus three blue is four total. The chance of red is one out of four.",
            "widget": {
              "w": "fraction",
              "shape": "bar",
              "parts": 4,
              "shaded": 1
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A machine has 3 red, 4 blue, and 4 green plushies. What is the chance of grabbing a red one?",
            "say": "Three red, four blue, four green. What is the chance of red?",
            "widget": {
              "w": "tapPick",
              "prompt": "3 red, 4 blue, 4 green. Chance of red?",
              "options": [
                {
                  "label": "3/11",
                  "correct": true
                },
                {
                  "label": "3/8"
                },
                {
                  "label": "1/3"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Work it out",
            "body": "Chance of red with 3 red, 4 blue, 4 green.",
            "reveal": [
              "Add every plushie: 3 + 4 + 4 = 11 total.",
              "You want red, and there are 3 red.",
              "Chance of red is 3 out of 11, written 3/11."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Probability is wanted over total. Count them all for the bottom, count the ones you want for the top.",
            "emoji": "🎯",
            "takeaway": "Probability is wanted over total. Count all the outcomes for the bottom, count the ones you want for the top."
          }
        ]
      },
      {
        "id": "l.m7rational",
        "skillId": "m.7.rational",
        "subject": "math",
        "grade": 7,
        "title": "Multiplying With Negatives",
        "subtitle": "Why going down 2 a minute lands you below zero.",
        "steps": [
          {
            "kind": "hook",
            "title": "The submarine dive",
            "body": "Your sub sinks 2 meters every minute. After 5 minutes, how far below the surface are you?",
            "say": "Your submarine sinks two meters every minute. After five minutes, how far below the surface are you?"
          },
          {
            "kind": "concept",
            "title": "Down is negative",
            "body": "Going down means a negative change. Sinking 2 meters a minute is -2 each minute. Do that 5 times and it adds up.",
            "analogy": "It is like losing 2 dollars a day. Five days of that is not a small dent, it is 10 dollars gone.",
            "say": "Going down is negative. Sinking two meters a minute is negative two each minute, five times over.",
            "widget": {
              "w": "numberline",
              "min": -12,
              "max": 2,
              "mark": -10,
              "color": "#2563eb"
            }
          },
          {
            "kind": "show",
            "title": "Negative times positive",
            "body": "-2 meters, repeated 5 times, is -2 × 5 = -10. A negative times a positive gives a negative.",
            "say": "Negative two, five times, is negative ten. A negative times a positive is negative.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⬇️",
                  "title": "Rate",
                  "body": "-2 meters each minute"
                },
                {
                  "emoji": "⏱️",
                  "title": "Time",
                  "body": "5 minutes"
                },
                {
                  "emoji": "🌊",
                  "title": "Depth",
                  "body": "-2 × 5 = -10 meters"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Same sub, but now it dives for 6 minutes at -2 meters per minute. What is -2 × 6?",
            "say": "Descend two meters a minute for six minutes. What is negative two times six?",
            "widget": {
              "w": "tapPick",
              "prompt": "Descend 2 meters/min for 6 min: -2 × 6 = ?",
              "options": [
                {
                  "label": "-12",
                  "correct": true
                },
                {
                  "label": "12"
                },
                {
                  "label": "-8"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Work it out",
            "body": "Find the depth change for 6 minutes.",
            "reveal": [
              "The sub sinks 2 meters each minute, so the rate is -2.",
              "It dives for 6 minutes: -2 × 6.",
              "Two times six is twelve, and down is negative, so -12 meters."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A negative times a positive is negative. Down two a minute for six minutes is negative twelve.",
            "emoji": "🌊",
            "takeaway": "A negative times a positive is negative. Down 2 a minute for 6 minutes is -12."
          }
        ]
      },
      {
        "id": "l.m8linear",
        "skillId": "m.8.linear",
        "subject": "math",
        "grade": 8,
        "title": "Linear Equations: Start Plus Rate",
        "subtitle": "Reading y = mx + b like a bill.",
        "steps": [
          {
            "kind": "hook",
            "title": "The streaming bill",
            "body": "A service charges $10 just to join, then $3 every month. What will you owe after 2 months?",
            "say": "A streaming service charges ten dollars to join, then three dollars every month. What do you owe after two months?"
          },
          {
            "kind": "concept",
            "title": "A one-time fee plus a monthly rate",
            "body": "The equation y = 3x + 10 has two parts. The 10 is the join fee you pay once. The 3 is charged for each month x.",
            "analogy": "It is like a gym: pay a sign-up fee once, then a set amount every month you stay.",
            "say": "The ten is the join fee paid once. The three is charged for every month.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🎟️",
                  "title": "+ 10",
                  "body": "Join fee, paid one time"
                },
                {
                  "emoji": "📅",
                  "title": "3x",
                  "body": "$3 for each month x"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Plug in the months",
            "body": "After 2 months, x is 2. Multiply first: 3 × 2 = 6. Then add the join fee: 6 + 10 = 16.",
            "say": "After two months, three times two is six, plus ten is sixteen dollars.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 20,
              "mark": 16,
              "color": "#16a34a"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A different service costs $6 to join plus $8 a month, so y = 8x + 6. What do you pay after 3 months?",
            "say": "y equals eight x plus six. What do you pay after three months?",
            "widget": {
              "w": "tapPick",
              "prompt": "y = 8x + 6, after x = 3 months",
              "options": [
                {
                  "label": "$30",
                  "correct": true
                },
                {
                  "label": "$24"
                },
                {
                  "label": "$42"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Work it out",
            "body": "Find y for y = 8x + 6 when x = 3.",
            "reveal": [
              "Put 3 in for x: 8 × 3 + 6.",
              "Multiply before you add: 8 × 3 = 24.",
              "Now add the join fee: 24 + 6 = 30 dollars."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "In y equals m x plus b, multiply the rate by x first, then add the starting fee.",
            "emoji": "📺",
            "takeaway": "In y = mx + b, multiply the rate by x first, then add the starting fee. Times before plus."
          }
        ]
      },
      {
        "id": "l.m8slope",
        "skillId": "m.8.slope",
        "subject": "math",
        "grade": 8,
        "title": "Slope: Rise Over Run",
        "subtitle": "How steep a ramp really is.",
        "steps": [
          {
            "kind": "hook",
            "title": "The skate ramp",
            "body": "A ramp starts at the point (0, 2) and climbs to (3, 5). How steep is it? That steepness is the slope.",
            "say": "A skate ramp climbs from the point zero, two up to three, five. How steep is it?"
          },
          {
            "kind": "concept",
            "title": "Rise over run",
            "body": "Slope is how much you go UP divided by how much you go ACROSS. Up is the rise, across is the run.",
            "analogy": "It is like climbing stairs: how tall each step is compared to how deep it is. Taller for the same depth means steeper.",
            "say": "Slope is the rise, how far up, divided by the run, how far across.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⬆️",
                  "title": "Rise",
                  "body": "Change in y: 5 - 2 = 3"
                },
                {
                  "emoji": "➡️",
                  "title": "Run",
                  "body": "Change in x: 3 - 0 = 3"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Do the subtraction",
            "body": "Rise is 5 - 2 = 3. Run is 3 - 0 = 3. Slope is 3 over 3, which is 1.",
            "say": "Rise is three, run is three, so the slope is three over three, which is one.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 5,
              "mark": 1,
              "color": "#7c3aed"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A ramp goes from (1, 0) to (2, 4). What is its slope?",
            "say": "A ramp goes from one, zero to two, four. What is its slope?",
            "widget": {
              "w": "tapPick",
              "prompt": "Slope from (1, 0) to (2, 4)?",
              "options": [
                {
                  "label": "4",
                  "correct": true
                },
                {
                  "label": "1/4"
                },
                {
                  "label": "2"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Work it out",
            "body": "Find the slope from (1, 0) to (2, 4).",
            "reveal": [
              "Rise is the change in y: 4 - 0 = 4.",
              "Run is the change in x: 2 - 1 = 1.",
              "Slope is rise over run: 4 over 1 = 4."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Slope is rise over run, the change in y divided by the change in x.",
            "emoji": "🛹",
            "takeaway": "Slope is rise over run: change in y divided by change in x. Bigger slope means steeper."
          }
        ]
      },
      {
        "id": "l.m8expon",
        "skillId": "m.8.expon",
        "subject": "math",
        "grade": 8,
        "title": "Exponents: Repeated Multiplying",
        "subtitle": "Why viral videos explode so fast.",
        "steps": [
          {
            "kind": "hook",
            "title": "The video goes viral",
            "body": "You post a clip. Each round, every person who has it shares with 2 new people. After 3 rounds, how many people is that?",
            "say": "You post a clip. Each round, everyone shares it with two new people. After three rounds, how many people is that?"
          },
          {
            "kind": "concept",
            "title": "An exponent counts the multiplies",
            "body": "2^3 means multiply 2 by itself 3 times: 2 × 2 × 2. The big number is what you multiply, the small number is how many times.",
            "analogy": "It is not adding, it is doubling on top of doubling. Each round multiplies the last, so it climbs fast.",
            "say": "Two to the third means two times two times two. The base is what you multiply, the power is how many times.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔢",
                  "title": "Base 2",
                  "body": "The number you multiply"
                },
                {
                  "emoji": "🔁",
                  "title": "Power 3",
                  "body": "Multiply it 3 times over"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Step by step",
            "body": "2 × 2 is 4. Then 4 × 2 is 8. So 2^3 = 8.",
            "say": "Two times two is four. Four times two is eight. So two to the third is eight.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 10,
              "mark": 8,
              "color": "#db2777"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Now 5 people each share with 5 new people for 3 rounds, which is 5^3. What is 5^3?",
            "say": "Five to the third is five times five times five. What is it?",
            "widget": {
              "w": "tapPick",
              "prompt": "5^3 = 5 × 5 × 5 = ?",
              "options": [
                {
                  "label": "125",
                  "correct": true
                },
                {
                  "label": "15"
                },
                {
                  "label": "25"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Work it out",
            "body": "Find 5^3.",
            "reveal": [
              "5^3 means 5 × 5 × 5.",
              "Multiply two of them first: 5 × 5 = 25.",
              "Then times the last 5: 25 × 5 = 125."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "An exponent means multiply the base by itself that many times. Two to the third is eight, five to the third is one hundred twenty five.",
            "emoji": "📱",
            "takeaway": "An exponent means multiply the base by itself that many times. 2^3 is 8, and 5^3 is 125."
          }
        ]
      },
      {
        "id": "l.m8pythag",
        "skillId": "m.8.pythag",
        "subject": "math",
        "grade": 8,
        "title": "The Pythagorean Theorem: The Diagonal Shortcut",
        "subtitle": "Two sides give away the third.",
        "steps": [
          {
            "kind": "hook",
            "title": "The corner-cutter",
            "body": "A grassy field is 3 meters one way and 4 meters the other. Everybody walks the two edges, but there is a worn path straight across the corner. How long is that shortcut?",
            "say": "A field is three meters one way and four meters the other. How long is the diagonal shortcut across the corner?"
          },
          {
            "kind": "concept",
            "title": "The two short sides build the long one",
            "body": "In any right triangle, square the two short sides, add them, and that equals the square of the longest side. We write it a squared plus b squared equals c squared. The longest side, c, is always across from the square corner.",
            "analogy": "Think of the two short sides as two amounts of money. You cash them both in as squares, add the piles, and the total is the square of the diagonal.",
            "say": "Square the two short sides, add them, and you get the square of the longest side. A squared plus b squared equals c squared.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📐",
                  "title": "a and b",
                  "body": "The two legs on the square corner: 3 and 4."
                },
                {
                  "emoji": "🎯",
                  "title": "c",
                  "body": "The diagonal across from the corner. This is what you find."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Working the field",
            "body": "Three squared is 9. Four squared is 16. Add them to get 25. The diagonal is the number that squares to 25, and that is 5.",
            "say": "Three squared is nine, four squared is sixteen, nine plus sixteen is twenty five. Five times five is twenty five, so the diagonal is five meters.",
            "widget": {
              "w": "array",
              "rows": 3,
              "cols": 4,
              "emoji": "🟩"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the ladder",
            "body": "A 25-foot ladder leans on a wall. Its top reaches 24 feet up. The ladder is c, the wall height is one leg. Since 625 minus 576 is 49, how far is the base from the wall?",
            "say": "The ladder is twenty five, the wall height is twenty four. Six twenty five minus five seventy six is forty nine. What is the square root of forty nine?",
            "widget": {
              "w": "tapPick",
              "prompt": "Base distance from the wall (the square root of 49)",
              "options": [
                {
                  "label": "1 ft"
                },
                {
                  "label": "7 ft",
                  "correct": true
                },
                {
                  "label": "49 ft"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why we subtract for a leg",
            "body": "When you know c and one leg, you subtract instead of add.",
            "reveal": [
              "c is the whole diagonal, so c squared is 25 times 25, which is 625.",
              "One leg is 24, so its square is 576. Take it away: 625 minus 576 is 49.",
              "The missing leg is the square root of 49, which is 7 feet."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A squared plus b squared equals c squared. Add to find the diagonal, subtract to find a leg, then take the square root.",
            "emoji": "📐",
            "takeaway": "a squared plus b squared equals c squared. Add the two legs to find the diagonal, subtract to find a missing leg, then take the square root."
          }
        ]
      },
      {
        "id": "l.m9multistep",
        "skillId": "m.9.multistep",
        "subject": "math",
        "grade": 9,
        "title": "Multi-Step Equations: Clean Up, Then Solve",
        "subtitle": "Untangle before you undo.",
        "steps": [
          {
            "kind": "hook",
            "title": "The knotted rope",
            "body": "An equation with parentheses is like a rope with a knot in it. You cannot just pull, you have to loosen the knot first. Then solving is easy.",
            "say": "An equation with parentheses is like a knotted rope. Loosen the knot first, then it pulls straight."
          },
          {
            "kind": "concept",
            "title": "Distribute, combine, then isolate",
            "body": "First multiply out the parentheses. Then combine the matching x terms. Only after it is tidy do you move numbers across to get x alone.",
            "analogy": "It is like cleaning a desk before homework. Spread out the parentheses, stack the like terms into one pile, then do the actual work.",
            "say": "First distribute, then combine like terms, then isolate x.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "1️⃣",
                  "title": "Distribute",
                  "body": "5(x + 4) becomes 5x + 20."
                },
                {
                  "emoji": "2️⃣",
                  "title": "Combine",
                  "body": "5x minus 2x becomes 3x."
                },
                {
                  "emoji": "3️⃣",
                  "title": "Isolate",
                  "body": "3x = 15, so x = 5."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Solve 5 times (x plus 4) minus 2x equals 35. After distributing you get 5x plus 20 minus 2x, which is 3x plus 20 equals 35. What is x?",
            "say": "Three x plus twenty equals thirty five. Subtract twenty to get three x equals fifteen. What is x?",
            "widget": {
              "w": "tapPick",
              "prompt": "3x + 20 = 35, so x = ?",
              "options": [
                {
                  "label": "3"
                },
                {
                  "label": "5",
                  "correct": true
                },
                {
                  "label": "11"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked all the way",
            "body": "Solve 5(x + 4) − 2x = 35.",
            "reveal": [
              "Distribute the 5: 5x + 20 − 2x = 35.",
              "Combine 5x and −2x: 3x + 20 = 35.",
              "Subtract 20 from both sides: 3x = 15.",
              "Divide both sides by 3: x = 5."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Distribute, combine, isolate. Untangle before you pull.",
            "emoji": "🪢",
            "takeaway": "Distribute, combine like terms, then isolate x. Untangle the knot before you pull the rope."
          }
        ]
      },
      {
        "id": "l.m9systems",
        "skillId": "m.9.systems",
        "subject": "math",
        "grade": 9,
        "title": "Systems of Equations: Add to Cancel",
        "subtitle": "Two clues, one price.",
        "steps": [
          {
            "kind": "hook",
            "title": "The ticket window",
            "body": "An adult ticket plus a kid ticket costs 11 dollars. And an adult ticket minus a kid ticket is negative 1. From those two clues alone, you can find each price.",
            "say": "An adult plus a kid ticket is eleven dollars. An adult minus a kid is negative one. Find each price from those two clues."
          },
          {
            "kind": "concept",
            "title": "Stack them and add",
            "body": "Line the two equations up and add them straight down. The kid ticket has a plus in one and a minus in the other, so it cancels out. You are left with just adult tickets.",
            "analogy": "It is like a tug of war. The two kid-ticket terms pull equal and opposite, so they vanish, leaving only the adult on the rope.",
            "say": "Add the two equations straight down. Plus kid and minus kid cancel, leaving two times the adult equals ten.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "➕",
                  "title": "Equation 1",
                  "body": "adult + kid = 11"
                },
                {
                  "emoji": "➖",
                  "title": "Equation 2",
                  "body": "adult − kid = −1"
                },
                {
                  "emoji": "🟰",
                  "title": "Add them",
                  "body": "2 × adult = 10"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Finish it",
            "body": "Two adult tickets cost 10 dollars, so one adult ticket is 5 dollars. Put that back: 5 plus kid is 11, so the kid ticket is 6.",
            "say": "Two adult tickets are ten dollars, so one adult is five dollars. Then the kid ticket is six."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "New show. Adult plus kid is 5 dollars, and adult minus kid is negative 3. Add the equations: 2 times adult is 2. What is one adult ticket?",
            "say": "Adding gives two times the adult equals two. What is one adult ticket?",
            "widget": {
              "w": "tapPick",
              "prompt": "2 × adult = 2, so adult = ?",
              "options": [
                {
                  "label": "$1",
                  "correct": true
                },
                {
                  "label": "$2"
                },
                {
                  "label": "$4"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Add the equations to cancel the opposite terms, then solve for what is left.",
            "emoji": "🎫",
            "takeaway": "When one variable is plus in one equation and minus in the other, add the equations to cancel it, then solve for what is left."
          }
        ]
      },
      {
        "id": "l.m9quadratic",
        "skillId": "m.9.quadratic",
        "subject": "math",
        "grade": 9,
        "title": "Factoring Quadratics: The Number Pair",
        "subtitle": "Find two numbers that agree twice.",
        "steps": [
          {
            "kind": "hook",
            "title": "The matchmaking puzzle",
            "body": "To factor x squared plus 3x plus 2, you are hunting for two numbers. But they have to pass two tests at once, and only one pair does.",
            "say": "To factor x squared plus three x plus two, hunt for two numbers that pass two tests at once."
          },
          {
            "kind": "concept",
            "title": "Multiply to the last, add to the middle",
            "body": "The two numbers must multiply to the last number and add to the middle number. For x squared plus 3x plus 2, they multiply to 2 and add to 3.",
            "analogy": "It is like a lock with two dials. One dial is the product, the other is the sum. The right pair clicks both dials at the same time.",
            "say": "The two numbers multiply to the last number and add to the middle number. Here, multiply to two and add to three.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✖️",
                  "title": "Multiply",
                  "body": "The pair times each other equals 2."
                },
                {
                  "emoji": "➕",
                  "title": "Add",
                  "body": "The pair added together equals 3."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Test the pair",
            "body": "Try 1 and 2. One times two is 2, which matches the last number. One plus two is 3, which matches the middle. Both dials click, so it factors as (x plus 1)(x plus 2).",
            "say": "One times two is two, and one plus two is three. Both tests pass, so it is x plus one times x plus two."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Factor x squared plus 5x plus 4. You need a pair that multiplies to 4 and adds to 5. Which pair works?",
            "say": "You need two numbers that multiply to four and add to five. Which pair works?",
            "widget": {
              "w": "tapPick",
              "prompt": "Multiply to 4, add to 5",
              "options": [
                {
                  "label": "2 and 2"
                },
                {
                  "label": "4 and 1",
                  "correct": true
                },
                {
                  "label": "3 and 1"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Checking 4 and 1",
            "body": "Why 4 and 1 is the answer.",
            "reveal": [
              "Multiply test: 4 times 1 is 4, which matches the last term.",
              "Add test: 4 plus 1 is 5, which matches the middle term.",
              "Both pass, so x squared plus 5x plus 4 factors as (x + 4)(x + 1)."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Two numbers that multiply to the last and add to the middle. That pair is your answer.",
            "emoji": "🔒",
            "takeaway": "Find two numbers that multiply to the last term and add to the middle term. The pair that clicks both dials is your factoring."
          }
        ]
      },
      {
        "id": "l.m9inequal",
        "skillId": "m.9.inequal",
        "subject": "math",
        "grade": 9,
        "title": "Inequalities: At Least Means Round Up",
        "subtitle": "When a decimal answer meets the real world.",
        "steps": [
          {
            "kind": "hook",
            "title": "The concert fund",
            "body": "You babysit for 11 dollars an hour and need at least 58 dollars for a ticket. Whole hours only, nobody pays for a fraction of an hour. How many hours do you have to work?",
            "say": "You earn eleven dollars an hour and need at least fifty eight dollars. Whole hours only. How many must you work?"
          },
          {
            "kind": "concept",
            "title": "Divide, then push up to a whole hour",
            "body": "Set it up as 11 times hours is at least 58. Divide 58 by 11 and you get about 5.3. But 5 hours is not quite enough, so you must round up to the next whole hour.",
            "analogy": "It is like filling a jar to a line. If 5 scoops fall short of the line, you cannot stop there. You add one more, even if it overfills a little.",
            "say": "Fifty eight divided by eleven is about five point three. Five hours is not enough, so round up to six.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "➗",
                  "title": "Divide",
                  "body": "58 ÷ 11 ≈ 5.3 hours."
                },
                {
                  "emoji": "⬆️",
                  "title": "Round up",
                  "body": "5 hours falls short, so go to 6."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why not just 5",
            "body": "Five hours earns 55 dollars, which is still short of 58. Six hours earns 66 dollars, which clears the goal. So 6 is the smallest whole number that works.",
            "say": "Five hours is fifty five dollars, still short. Six hours is sixty six dollars, which is enough. So the answer is six."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Now you earn 10 dollars an hour and need at least 76 dollars. Divide: 76 divided by 10 is 7.6. Round up to whole hours. How many hours?",
            "say": "Seventy six divided by ten is seven point six. Round up to a whole hour. How many hours?",
            "widget": {
              "w": "tapPick",
              "prompt": "76 ÷ 10 = 7.6, round up to whole hours",
              "options": [
                {
                  "label": "7 hours"
                },
                {
                  "label": "8 hours",
                  "correct": true
                },
                {
                  "label": "76 hours"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "With at least and whole units, divide, then round up. A decimal still needs the next full hour.",
            "emoji": "⬆️",
            "takeaway": "With at least and whole units, divide and then round UP, because a decimal like 5.3 still means you need the next full hour."
          }
        ]
      },
      {
        "id": "l.m10angles",
        "skillId": "m.10.angles",
        "subject": "math",
        "grade": 10,
        "title": "Supplementary Angles Add to 180",
        "subtitle": "Two angles that finish a straight line.",
        "steps": [
          {
            "kind": "hook",
            "title": "The kickstand",
            "body": "A bike leans against a wall and the kickstand hits the flat ground. On one side of the leg the angle looks small, on the other side it looks wide. Together they cover the whole straight ground.",
            "say": "A bike leg on flat ground makes two angles, and together they cover the whole straight line."
          },
          {
            "kind": "concept",
            "title": "A straight line is 180 degrees",
            "body": "When two angles sit together on a straight line, they always add up to 180 degrees. We call them supplementary. If you know one, you subtract from 180 to get the other.",
            "analogy": "180 degrees is a full straight line, like a flat table edge. Two angles split that edge, so whatever one takes, the other gets the rest.",
            "say": "Two angles on a straight line add to one hundred eighty. Know one, subtract from one hundred eighty for the other.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📐",
                  "title": "One angle",
                  "body": "Say it is 23 degrees.",
                  "color": "#2563eb"
                },
                {
                  "emoji": "➕",
                  "title": "Its partner",
                  "body": "180 − 23 = 157 degrees.",
                  "color": "#16a34a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Always subtract from 180",
            "body": "One angle is 71 degrees. The straight line is 180. So the partner is 180 minus 71, which is 109 degrees.",
            "say": "One angle is seventy one. One hundred eighty minus seventy one is one hundred nine.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 180,
              "mark": 71
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Two supplementary angles sit on a straight line. One is 110 degrees. What is the other?",
            "say": "One angle is one hundred ten degrees. What is its supplement?",
            "widget": {
              "w": "tapPick",
              "prompt": "One angle is 110°. Its supplement is…",
              "options": [
                {
                  "label": "70°",
                  "correct": true
                },
                {
                  "label": "90°"
                },
                {
                  "label": "250°"
                },
                {
                  "label": "10°"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "One supplementary angle is 71 degrees. Find the other.",
            "reveal": [
              "Supplementary means the two angles add to 180.",
              "So subtract: 180 − 71.",
              "The other angle is 109 degrees."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Supplementary angles add to one hundred eighty. Subtract from one hundred eighty to find the missing one.",
            "emoji": "📏",
            "takeaway": "Supplementary angles make a straight line, so they add to 180. To find the missing one, do 180 minus the angle you know."
          }
        ]
      },
      {
        "id": "l.m10triangles",
        "skillId": "m.10.triangles",
        "subject": "math",
        "grade": 10,
        "title": "The Angles of a Triangle Add to 180",
        "subtitle": "Why the third angle is never a mystery.",
        "steps": [
          {
            "kind": "hook",
            "title": "The sail",
            "body": "A sailboat's sail is a triangle. You can measure two of its corners with a protractor, but the top corner is way up high and hard to reach. Good news: you never need to climb up there.",
            "say": "A sail is a triangle. Two corners are easy to measure, but you never need to climb up for the third."
          },
          {
            "kind": "concept",
            "title": "Every triangle totals 180",
            "body": "In any triangle, the three angles always add up to 180 degrees. So if you know two of them, add those two and subtract from 180 to get the third.",
            "analogy": "Think of 180 degrees as a full budget the triangle must spend. Two corners already spent their share, and the third corner gets exactly what is left over.",
            "say": "The three angles of any triangle add to one hundred eighty. Add the two you know, subtract from one hundred eighty.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⛵",
                  "title": "Two known",
                  "body": "65° and 57°.",
                  "color": "#2563eb"
                },
                {
                  "emoji": "❓",
                  "title": "The third",
                  "body": "180 − 65 − 57 = 58°.",
                  "color": "#16a34a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Add, then subtract",
            "body": "Angles are 31 degrees and 74 degrees. Add them to get 105. Then 180 minus 105 is 75 degrees for the third angle.",
            "say": "Thirty one plus seventy four is one hundred five. One hundred eighty minus one hundred five is seventy five."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A triangle has angles of 40 degrees and 60 degrees. What is the third angle?",
            "say": "A triangle has angles forty and sixty. What is the third angle?",
            "widget": {
              "w": "tapPick",
              "prompt": "Angles 40° and 60°. The third angle is…",
              "options": [
                {
                  "label": "80°",
                  "correct": true
                },
                {
                  "label": "100°"
                },
                {
                  "label": "90°"
                },
                {
                  "label": "70°"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "A sail has angles 65 degrees and 57 degrees. Find the third.",
            "reveal": [
              "All three angles add to 180.",
              "Add the two you know: 65 + 57 = 122.",
              "Subtract: 180 − 122 = 58 degrees."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Every triangle adds to one hundred eighty. Add the two you know, subtract from one hundred eighty.",
            "emoji": "⛵",
            "takeaway": "Every triangle's angles add to 180. Add the two you know, then subtract from 180 to find the last one."
          }
        ]
      },
      {
        "id": "l.m10circles",
        "skillId": "m.10.circles",
        "subject": "math",
        "grade": 10,
        "title": "Area and Circumference of a Circle",
        "subtitle": "Two formulas, and when to use each.",
        "steps": [
          {
            "kind": "hook",
            "title": "Pizza and fence",
            "body": "For a round pizza, you care about the topping that fills it: that is area. For a round pool, you might care about the fence around the edge: that is circumference. Same circle, two different questions.",
            "say": "Pizza filling is area. Fence around a pool is circumference. Same circle, two questions."
          },
          {
            "kind": "concept",
            "title": "Two formulas",
            "body": "Area is pi times the radius squared. Circumference, the distance around, is pi times the diameter. The radius reaches from the center to the edge. The diameter goes all the way across, so it is two radii.",
            "analogy": "Area fills the inside like sauce and cheese. Circumference wraps the outside like the crust. One is stuffing, one is wrapping.",
            "say": "Area is pi times radius squared. Circumference is pi times diameter.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🍕",
                  "title": "Area",
                  "body": "π × r². Fills the inside.",
                  "color": "#dc2626"
                },
                {
                  "emoji": "⭕",
                  "title": "Circumference",
                  "body": "π × d. Wraps the edge.",
                  "color": "#2563eb"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Squaring the radius",
            "body": "A pizza has radius 3. Area is pi times 3 squared. Three squared is 9, so the area is 9 pi square units. Squaring means the radius times itself, not times two.",
            "say": "Radius three. Three squared is nine, so the area is nine pi square units.",
            "widget": {
              "w": "array",
              "rows": 3,
              "cols": 3,
              "emoji": "🟥"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A round pool has diameter 28 units. Find its circumference in terms of pi. Use circumference equals pi times diameter.",
            "say": "A pool has diameter twenty eight. What is its circumference?",
            "widget": {
              "w": "tapPick",
              "prompt": "Diameter 28. Circumference = π × d = …",
              "options": [
                {
                  "label": "28π",
                  "correct": true
                },
                {
                  "label": "14π"
                },
                {
                  "label": "784π"
                },
                {
                  "label": "56π"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "A pizza has radius 3 units. Find its area in terms of pi.",
            "reveal": [
              "Area = π × r².",
              "Square the radius: 3² = 9.",
              "Area = 9π square units."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Area is pi r squared, the filling. Circumference is pi times diameter, the crust.",
            "emoji": "🍕",
            "takeaway": "Area is pi times radius squared, the filling. Circumference is pi times diameter, the crust around the edge."
          }
        ]
      },
      {
        "id": "l.m10similar",
        "skillId": "m.10.similar",
        "subject": "math",
        "grade": 10,
        "title": "Similar Figures and Scale",
        "subtitle": "How a map turns centimeters into kilometers.",
        "steps": [
          {
            "kind": "hook",
            "title": "The shrunk world",
            "body": "A map is the real world shrunk down evenly. Every road, river, and city got smaller by the same amount. If you know how much smaller, you can turn any map length back into the real distance.",
            "say": "A map is the real world shrunk down evenly. Find how much it shrank and you can undo it."
          },
          {
            "kind": "concept",
            "title": "Find the scale factor",
            "body": "Similar figures have the same shape at different sizes, linked by one number called the scale factor. Divide a real length by its map length to find it. Then multiply any map length by that factor.",
            "analogy": "The scale factor is like a photocopier setting. If everything came out at 200 percent, then every single line is exactly two times its original.",
            "say": "Divide the real length by the map length to get the scale factor, then multiply any map length by it.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🗺️",
                  "title": "On the map",
                  "body": "6 cm road.",
                  "color": "#2563eb"
                },
                {
                  "emoji": "🌍",
                  "title": "In real life",
                  "body": "12 km, so factor is 12 ÷ 6 = 2.",
                  "color": "#16a34a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Use the factor",
            "body": "On that same map the factor is 2. A road that is 8 cm on the map is really 8 times 2, which is 16 km. Same factor for every road.",
            "say": "The factor is two. An eight centimeter road is eight times two, sixteen kilometers."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "On a map, a 7 cm road is really 35 km. So the factor is 35 divided by 7, which is 5. A 9 cm road is really how many km?",
            "say": "The factor is five. A nine centimeter road is really how many kilometers?",
            "widget": {
              "w": "tapPick",
              "prompt": "Factor is 5. A 9 cm road is really…",
              "options": [
                {
                  "label": "45 km",
                  "correct": true
                },
                {
                  "label": "14 km"
                },
                {
                  "label": "63 km"
                },
                {
                  "label": "40 km"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "A 6 cm map road is 12 km. Find the real length of an 8 cm road.",
            "reveal": [
              "Find the scale factor: 12 ÷ 6 = 2.",
              "Every centimeter is 2 real km.",
              "Multiply: 8 × 2 = 16 km."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Find the scale factor by dividing real by map, then multiply every map length by it.",
            "emoji": "🗺️",
            "takeaway": "Similar figures share one scale factor. Divide real by map to find it, then multiply any map length by that same factor."
          }
        ]
      },
      {
        "id": "l.m11functions",
        "skillId": "m.11.functions",
        "subject": "math",
        "grade": 11,
        "title": "Evaluating a Function",
        "subtitle": "Plug the number in, follow the order.",
        "steps": [
          {
            "kind": "hook",
            "title": "The diving machine",
            "body": "A diver's depth follows a rule. You feed the rule a number of seconds and it gives back a depth. The rule is a machine: put a number in, get one number out.",
            "say": "A function is a machine. Put a number in, get one number out."
          },
          {
            "kind": "concept",
            "title": "f(5) means put 5 in for x",
            "body": "When you see f of 5, it means replace every x in the rule with 5, then compute. Follow order of operations: square first, then multiply, then subtract.",
            "analogy": "The x is an empty slot, like a vending machine coin slot. f of 5 means you drop a 5 into every slot and let the machine run.",
            "say": "f of five means replace x with five, then square first, multiply, and subtract.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🤿",
                  "title": "The rule",
                  "body": "f(x) = 1x² − 3.",
                  "color": "#2563eb"
                },
                {
                  "emoji": "➡️",
                  "title": "Put in 5",
                  "body": "1(5)² − 3.",
                  "color": "#16a34a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Square before you multiply",
            "body": "For f of 5 with 1x squared minus 3: five squared is 25, times 1 is 25, minus 3 is 22. Square the number before touching the rest.",
            "say": "Five squared is twenty five, times one is twenty five, minus three is twenty two."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Use f of x equals 3x squared minus 6. Find f of 2. Square the 2 first, then multiply by 3, then subtract 6.",
            "say": "For f of x equals three x squared minus six, find f of two.",
            "widget": {
              "w": "tapPick",
              "prompt": "f(x) = 3x² − 6. Find f(2).",
              "options": [
                {
                  "label": "6",
                  "correct": true
                },
                {
                  "label": "30"
                },
                {
                  "label": "0"
                },
                {
                  "label": "12"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Given f of x equals 1x squared minus 3, find f of 5.",
            "reveal": [
              "Replace x with 5: 1(5)² − 3.",
              "Square first: 5² = 25.",
              "Multiply then subtract: 25 − 3 = 22."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Drop the number into every x, square first, then multiply and subtract.",
            "emoji": "🤿",
            "takeaway": "To evaluate f of a number, drop that number into every x, square first, then multiply and subtract."
          }
        ]
      },
      {
        "id": "l.m11exponential",
        "skillId": "m.11.exponential",
        "subject": "math",
        "grade": 11,
        "title": "Exponential Growth: Doubling Adds Up Fast",
        "subtitle": "Why growth that multiplies leaves growth that adds in the dust.",
        "steps": [
          {
            "kind": "hook",
            "title": "The channel that explodes",
            "body": "Your channel has 100 subscribers. Every month that number doubles. It feels slow at first, then one day it is huge. How many after 3 months?",
            "say": "Your channel has one hundred subscribers, and every month it doubles. How many after three months?"
          },
          {
            "kind": "concept",
            "title": "Doubling multiplies, it does not add",
            "body": "Each month you do not add the same amount. You multiply by 2. Month by month: 100, then 200, then 400, then 800.",
            "analogy": "Adding is climbing stairs one step at a time. Doubling is folding a piece of paper: each fold is twice the last, so the stack rockets up.",
            "say": "Each month you multiply by two, not add. One hundred, two hundred, four hundred, eight hundred.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Start",
                  "body": "100 subscribers"
                },
                {
                  "title": "After 1 mo",
                  "body": "100 × 2 = 200"
                },
                {
                  "title": "After 3 mo",
                  "body": "100 × 2 × 2 × 2 = 800"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The shortcut",
            "body": "Doubling 3 times is the same as multiplying by 2 three times, which is times 8. So 100 × 8 = 800. After 4 months it would be times 16.",
            "say": "Doubling three times means times eight. Doubling four times means times sixteen.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "3 doublings",
                  "body": "2 × 2 × 2 = 8, so ×8"
                },
                {
                  "title": "4 doublings",
                  "body": "2 × 2 × 2 × 2 = 16, so ×16"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Start at 100 subscribers, doubling every month. How many after 2 months?",
            "say": "Start at one hundred, doubling for two months. How many?",
            "widget": {
              "w": "tapPick",
              "prompt": "100 doubling for 2 months (100 × 2 × 2)",
              "options": [
                {
                  "label": "300"
                },
                {
                  "label": "400",
                  "correct": true
                },
                {
                  "label": "200"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Start at 200, doubling every month. How many after 4 months?",
            "reveal": [
              "Doubling 4 times means multiply by 2 four times: 2 × 2 × 2 × 2 = 16.",
              "So the total is 200 × 16.",
              "200 × 16 = 3200 subscribers."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Doubling multiplies instead of adds, so it starts slow and then explodes.",
            "emoji": "📈",
            "takeaway": "Doubling multiplies, so it starts slow and then explodes. Doubling n times just means multiply by 2 to the n."
          }
        ]
      },
      {
        "id": "l.m11logs",
        "skillId": "m.11.logs",
        "subject": "math",
        "grade": 11,
        "title": "Logarithms: The Exponent Detective",
        "subtitle": "A log just asks one question: what power do I need?",
        "steps": [
          {
            "kind": "hook",
            "title": "The earthquake question",
            "body": "Earthquake scales grow in powers, so scientists ask backward questions like: 3 raised to what power gives 27? That backward question is a logarithm.",
            "say": "Three raised to what power gives twenty seven? Answering that is what a logarithm does."
          },
          {
            "kind": "concept",
            "title": "A log undoes an exponent",
            "body": "log base 3 of 27 asks: what exponent turns 3 into 27? Since 3 × 3 × 3 = 27, the answer is 3.",
            "analogy": "An exponent is locking a door: 3 to the 3rd power builds 27. A log is the key that undoes it and tells you the exponent was 3.",
            "say": "Log base three of twenty seven asks what power turns three into twenty seven. It is three, because three times three times three is twenty seven.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Exponent",
                  "body": "3 to the 3rd = 27"
                },
                {
                  "title": "Log (undo it)",
                  "body": "log base 3 of 27 = 3"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Climb the powers of 3",
            "body": "To find a log base 3, just count the powers until you hit the number. 3 to the 1 is 3, to the 2 is 9, to the 3 is 27, to the 4 is 81.",
            "say": "Three to the third is twenty seven, so the log is three. Three to the fourth is eighty one, so the log is four.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "3^3",
                  "body": "27, so log = 3"
                },
                {
                  "title": "3^4",
                  "body": "81, so log = 4"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "What is log base 3 of 9? Ask yourself: 3 to what power equals 9?",
            "say": "What is log base three of nine? Three to what power equals nine?",
            "widget": {
              "w": "tapPick",
              "prompt": "log base 3 of 9",
              "options": [
                {
                  "label": "2",
                  "correct": true
                },
                {
                  "label": "3"
                },
                {
                  "label": "9"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "What is log base 3 of 81?",
            "reveal": [
              "The log asks: 3 to what power equals 81?",
              "Count the powers of 3: 3, 9, 27, 81. That is four steps.",
              "So 3 to the 4th power is 81, and log base 3 of 81 = 4."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A logarithm asks for the missing exponent: b to what power gives n.",
            "emoji": "🔑",
            "takeaway": "A logarithm is just asking for the missing exponent. log base b of n means: b to what power gives n?"
          }
        ]
      },
      {
        "id": "l.m11poly",
        "skillId": "m.11.poly",
        "subject": "math",
        "grade": 11,
        "title": "Adding Polynomials: Combine Like Terms",
        "subtitle": "Only add things that are truly the same kind.",
        "steps": [
          {
            "kind": "hook",
            "title": "Sorting the grocery bag",
            "body": "You cannot add 4 apples and 5 oranges into one number. You keep apples with apples. Polynomials work the exact same way.",
            "say": "You cannot add four apples and five oranges into one number. You keep apples with apples."
          },
          {
            "kind": "concept",
            "title": "Like terms are the same kind",
            "body": "In a polynomial, the x squared terms are the apples and the x terms are the oranges. Add the numbers in front, but only within the same kind.",
            "analogy": "x squared and x are two different fruits. You add the 4x squared and 1x squared together, and the 5x and 6x together, never across.",
            "say": "Add the x squared terms together and the x terms together, but never mix the two kinds.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "x² terms",
                  "body": "4x² + 1x² = 5x²"
                },
                {
                  "title": "x terms",
                  "body": "5x + 6x = 11x"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Just add the coefficients",
            "body": "The number in front is called the coefficient. To combine like terms, add those numbers and keep the variable part exactly the same.",
            "say": "Add the coefficients of each kind and keep the variable part the same.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Line up",
                  "body": "(4x² + 5x) + (1x² + 6x)"
                },
                {
                  "title": "Add each kind",
                  "body": "(4+1)x² + (5+6)x = 5x² + 11x"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Simplify (2x² + 3x) + (5x² + 1x). Add the x squared terms, then the x terms.",
            "say": "Simplify two x squared plus three x, plus five x squared plus one x.",
            "widget": {
              "w": "tapPick",
              "prompt": "(2x² + 3x) + (5x² + 1x)",
              "options": [
                {
                  "label": "7x² + 4x",
                  "correct": true
                },
                {
                  "label": "10x² + 4x"
                },
                {
                  "label": "7x² + 3x"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Simplify (4x² + 6x) + (4x² + 4x).",
            "reveal": [
              "Add the x squared terms: 4x² + 4x² = 8x².",
              "Add the x terms: 6x + 4x = 10x.",
              "Put them together: 8x² + 10x."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Combine like terms only. Add the x squared terms together and the x terms together.",
            "emoji": "🍎",
            "takeaway": "Combine like terms only: add the x squared terms together and the x terms together. Apples with apples."
          }
        ]
      },
      {
        "id": "l.m12trig",
        "skillId": "m.12.trig",
        "subject": "math",
        "grade": 12,
        "title": "Trig Values You Just Know",
        "subtitle": "The special angles that unlock the Ferris wheel.",
        "steps": [
          {
            "kind": "hook",
            "title": "The Ferris wheel height",
            "body": "To find how high a Ferris wheel seat is, engineers feed the angle into sine, cosine, and tangent. A few angles come up so often you should know them cold.",
            "say": "To find a seat's height on a Ferris wheel, you feed the angle into sine, cosine, and tangent. A few angles you should just know."
          },
          {
            "kind": "concept",
            "title": "Cosine at 0 and tangent at 45",
            "body": "At 0 degrees, cosine is 1, its biggest value. At 45 degrees the right triangle is perfectly balanced, so tangent, which is the ratio of the two legs, is exactly 1.",
            "analogy": "Tangent is rise over run. At 45 degrees you go up exactly as much as you go across, like a perfect staircase, so the ratio is 1.",
            "say": "Cosine of zero degrees is one. Tangent of forty five degrees is one.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "cos(0°)",
                  "body": "= 1"
                },
                {
                  "title": "tan(45°)",
                  "body": "= 1"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why 45 gives 1",
            "body": "Tangent equals opposite over adjacent. At 45 degrees those two sides are equal, and any number divided by itself is 1.",
            "say": "Tangent is opposite over adjacent. At forty five degrees those sides are equal, and equal divided by equal is one.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "The legs",
                  "body": "opposite = adjacent"
                },
                {
                  "title": "The ratio",
                  "body": "equal ÷ equal = 1"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The Ferris wheel starts at 0 degrees. What is cos(0°)?",
            "say": "What is cosine of zero degrees?",
            "widget": {
              "w": "tapPick",
              "prompt": "cos(0°)",
              "options": [
                {
                  "label": "1",
                  "correct": true
                },
                {
                  "label": "0"
                },
                {
                  "label": "45"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "What is tan(45°)?",
            "reveal": [
              "Tangent means opposite side over adjacent side.",
              "At 45 degrees the two legs of the triangle are equal in length.",
              "Equal over equal is 1, so tan(45°) = 1."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Cosine of zero is one, and tangent of forty five is one because rise equals run.",
            "emoji": "🎡",
            "takeaway": "Memorize the anchors: cos(0°) = 1 and tan(45°) = 1, because at 45 degrees rise equals run."
          }
        ]
      },
      {
        "id": "l.m12sequences",
        "skillId": "m.12.sequences",
        "subject": "math",
        "grade": 12,
        "title": "Arithmetic Sequences: Same Step Every Time",
        "subtitle": "Find any term without counting them all.",
        "steps": [
          {
            "kind": "hook",
            "title": "The stadium rows",
            "body": "Row 1 of a stadium has 8 seats. Every row back adds 5 more. You need row 5 without walking up and counting each row. There is a shortcut.",
            "say": "Row one has eight seats, and every row back adds five more. How many seats are in row five?"
          },
          {
            "kind": "concept",
            "title": "Start, plus equal steps",
            "body": "This is an arithmetic sequence: a starting value plus the same jump each time. Row 1 is 8, and each new row adds 5: 8, 13, 18, 23, 28.",
            "analogy": "It is a staircase where every step is the same height. To reach a step, take the ground floor and add one step height for each stair you climb.",
            "say": "Start at eight, then add five each row: eight, thirteen, eighteen, twenty three, twenty eight.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 30,
              "from": 8,
              "to": 13,
              "label": "+5"
            }
          },
          {
            "kind": "show",
            "title": "The jump shortcut",
            "body": "From row 1 to row 5 is 4 jumps, not 5. So take the start and add 4 jumps of 5: 8 + 4 × 5 = 28.",
            "say": "From row one to row five is four jumps. Eight plus four times five is twenty eight.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Count the jumps",
                  "body": "Row 1 to row 5 = 4 jumps"
                },
                {
                  "title": "Compute",
                  "body": "8 + 4 × 5 = 28 seats"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Row 1 has 10 seats and each row adds 3. How many seats in row 4? Remember, row 1 to row 4 is 3 jumps.",
            "say": "Row one has ten seats and each row adds three. How many in row four?",
            "widget": {
              "w": "tapPick",
              "prompt": "Start 10, add 3 each row, find row 4",
              "options": [
                {
                  "label": "19",
                  "correct": true
                },
                {
                  "label": "22"
                },
                {
                  "label": "16"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example",
            "body": "Row 1 has 9 seats and each row adds 2. How many seats in row 6?",
            "reveal": [
              "From row 1 to row 6 is 5 jumps.",
              "Each jump adds 2, so that is 5 × 2 = 10.",
              "Add to the start: 9 + 10 = 19 seats."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Take the start, and add one fewer jumps than the term number, times the step size.",
            "emoji": "🏟️",
            "takeaway": "For an arithmetic sequence, take the start and add one fewer jumps than the term number, times the step size."
          }
        ]
      },
      {
        "id": "l.m12limits",
        "skillId": "m.12.limits",
        "subject": "math",
        "grade": 12,
        "title": "Limits: The Value You're Headed Toward",
        "subtitle": "What a function approaches, even where it breaks.",
        "steps": [
          {
            "kind": "hook",
            "title": "The number the road points to",
            "body": "You drive toward a town, but a bridge is out one mile before you arrive. You can never stand on the town square. Yet anyone watching knows exactly which town you were headed for.",
            "say": "You are driving toward a town, but a bridge is out just before you arrive. You never reach it, yet everyone can tell exactly where you were headed. That target is a limit."
          },
          {
            "kind": "concept",
            "title": "A limit is the target, not the stop",
            "body": "For x squared minus 4, over x minus 2, plugging in 2 gives zero over zero, a broken bridge. But the top factors into x minus 2 times x plus 2, so the x minus 2 cancels. You are left with x plus 2, which heads to 4.",
            "analogy": "Canceling the x minus 2 is the detour around the broken bridge. Same destination, you just skip the one spot where the road is out.",
            "say": "Plugging in two gives zero over zero, a broken bridge. But the top factors into x minus two times x plus two, so the x minus two cancels. That leaves x plus two, and as x approaches two, x plus two approaches four.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚧",
                  "title": "Plug in x = 2",
                  "body": "Gives 0 over 0. Road is out.",
                  "color": "#e07a5f"
                },
                {
                  "emoji": "🛣️",
                  "title": "Factor and cancel",
                  "body": "(x-2)(x+2)/(x-2) = x+2",
                  "color": "#3d9a74"
                },
                {
                  "emoji": "🏁",
                  "title": "Now let x go to 2",
                  "body": "x + 2 goes to 2 + 2 = 4",
                  "color": "#3d6ea5"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Watch it on the number line",
            "body": "Slide x closer and closer to 2 from either side. The value x plus 2 slides closer and closer to 4. It never has to land on 2 to show you the answer.",
            "say": "As x creeps toward two from both sides, the output x plus two creeps toward four.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 6,
              "mark": 4,
              "color": "#3d6ea5"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Try x squared minus 25, over x minus 5. The top factors into x minus 5 times x plus 5, so the x minus 5 cancels and leaves x plus 5. What does that approach as x goes to 5?",
            "say": "After canceling, you have x plus five. As x approaches five, x plus five approaches ten.",
            "widget": {
              "w": "tapPick",
              "prompt": "As x approaches 5, (x squared minus 25) / (x minus 5) approaches:",
              "options": [
                {
                  "label": "0"
                },
                {
                  "label": "5"
                },
                {
                  "label": "10",
                  "correct": true
                },
                {
                  "label": "25"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "The whole move, start to finish",
            "body": "Here is the full detour on the first one.",
            "reveal": [
              "Try plugging in: (2 squared minus 4) over (2 minus 2) is 0 over 0. Undefined, so factor.",
              "Factor the top: x squared minus 4 is (x minus 2)(x plus 2).",
              "Cancel the shared x minus 2: you are left with x plus 2.",
              "Let x approach 2: x plus 2 approaches 4. The limit is 4."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A limit is where the function is headed, not where it lands. When you get zero over zero, factor, cancel, then plug in.",
            "emoji": "🏁",
            "takeaway": "A limit is where the function is headed, not where it lands. When you hit 0 over 0, factor and cancel, then plug the number in."
          }
        ]
      },
      {
        "id": "l.m12vectors",
        "skillId": "m.12.vectors",
        "subject": "math",
        "grade": 12,
        "title": "Adding Vectors: Follow One Trip With Another",
        "subtitle": "Two moves, one total displacement.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two hops of the drone",
            "body": "A drone flies one leg, then a second leg without stopping. You do not care about the corner it turned. You only care where it ended up compared to where it started.",
            "say": "A drone flies one leg, then a second leg. You only care where it ends up compared to where it started."
          },
          {
            "kind": "concept",
            "title": "Add the rights, add the ups",
            "body": "A vector like 5, 4 means go 5 right and 4 up. To add two vectors, add their right numbers together and their up numbers together, separately. Rights with rights, ups with ups.",
            "analogy": "It is like tracking money in two envelopes. You never mix the right envelope with the up envelope. Each envelope just adds its own kind.",
            "say": "A vector five, four means five right and four up. To add two vectors, add the right numbers, then add the up numbers, kept separate. Five plus five is ten. Four plus two is six. The total is ten, six.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "➡️",
                  "title": "Right (x) parts",
                  "body": "5 + 5 = 10",
                  "color": "#3d6ea5"
                },
                {
                  "emoji": "⬆️",
                  "title": "Up (y) parts",
                  "body": "4 + 2 = 6",
                  "color": "#3d9a74"
                },
                {
                  "emoji": "🚁",
                  "title": "Total",
                  "body": "⟨10, 6⟩",
                  "color": "#e07a5f"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The drone flies 6, 6 then 1, 2. Add the right parts, then add the up parts. What is the total displacement vector?",
            "say": "Six plus one is seven. Six plus two is eight. The total is seven, eight.",
            "widget": {
              "w": "tapPick",
              "prompt": "⟨6, 6⟩ + ⟨1, 2⟩ = ?",
              "options": [
                {
                  "label": "⟨7, 8⟩",
                  "correct": true
                },
                {
                  "label": "⟨6, 12⟩"
                },
                {
                  "label": "⟨7, 12⟩"
                },
                {
                  "label": "⟨12, 8⟩"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Step by step",
            "body": "Add 5, 4 then 5, 2.",
            "reveal": [
              "Line up the parts: first vector is ⟨5, 4⟩, second is ⟨5, 2⟩.",
              "Add the right (x) parts: 5 + 5 = 10.",
              "Add the up (y) parts: 4 + 2 = 6.",
              "Total displacement is ⟨10, 6⟩."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "To add vectors, add the matching parts. Rights with rights, ups with ups.",
            "emoji": "🚁",
            "takeaway": "To add vectors, add matching parts: rights with rights, ups with ups. ⟨a, b⟩ + ⟨c, d⟩ = ⟨a+c, b+d⟩."
          }
        ]
      }
    ],
    "english": [
      {
        "id": "l.ekletters",
        "skillId": "e.k.letters",
        "subject": "english",
        "grade": 0,
        "title": "Every Letter Has a Sound",
        "subtitle": "Listen for the sound a word starts and ends with.",
        "steps": [
          {
            "kind": "hook",
            "title": "Words are made of sounds",
            "body": "Say the word bus out loud, slow. B... u... s. Your mouth makes three little sounds, and each one has a letter.",
            "say": "Say the word bus out loud, slow. Buh, uh, sss. Each little sound has a letter."
          },
          {
            "kind": "concept",
            "title": "First sound, last sound",
            "body": "A word is like a train. The first sound is the front car. The last sound is the caboose at the end.",
            "analogy": "The first sound leads the way, the last sound is the very end you hear as the word stops.",
            "say": "Kite starts with the kuh sound, that is K. Bus ends with the sss sound, that is S.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪁",
                  "title": "kite starts with K",
                  "body": "Kuh... kite. K leads the train."
                },
                {
                  "emoji": "🚌",
                  "title": "bus ends with S",
                  "body": "bus... sss. S is the caboose."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Stretch the word out",
            "body": "To find the last sound, say the word slow and stop on the very end. Buuuu-sss. The end is sss, so the letter is S.",
            "say": "Say the word slow and stop on the very end. Buuus. The end sound is sss, the letter S."
          },
          {
            "kind": "try",
            "title": "Your turn: last sound",
            "body": "Say bus slowly and listen for the very last sound. Which letter makes it?",
            "say": "Say bus slowly. Which letter makes the last sound?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which letter makes the LAST sound in bus?",
              "options": [
                {
                  "label": "B"
                },
                {
                  "label": "S",
                  "correct": true
                },
                {
                  "label": "U"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Say the word slow. First sound in front, last sound at the end. Match the sound to the letter.",
            "emoji": "🚂",
            "takeaway": "Say the word slow. The first sound is the front of the train, the last sound is the caboose. Match each sound to its letter."
          }
        ]
      },
      {
        "id": "l.ekrhyme",
        "skillId": "e.k.rhyme",
        "subject": "english",
        "grade": 0,
        "title": "Words That Rhyme",
        "subtitle": "Words that sound the same at the end.",
        "steps": [
          {
            "kind": "hook",
            "title": "The bear on a chair",
            "body": "The bear sat on a chair. Say bear, then chair. Hear how they end the same way? That is a rhyme, and it makes the sentence fun to say.",
            "say": "The bear sat on a chair. Bear, chair. They end the same way. That is a rhyme."
          },
          {
            "kind": "concept",
            "title": "Rhymes match at the end",
            "body": "Rhyming words can start different but finish the same. Tree and bee both end with the eee sound.",
            "analogy": "Rhyming words are like socks that match. The tops can be different colors, but the ends are the same.",
            "say": "Tree and bee both end with the eee sound, so they rhyme.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌳",
                  "title": "tree",
                  "body": "ends with eee"
                },
                {
                  "emoji": "🐝",
                  "title": "bee",
                  "body": "ends with eee"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the rhyme",
            "body": "Which word ends the same way as tree?",
            "say": "Which word rhymes with tree?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which word rhymes with tree?",
              "options": [
                {
                  "label": "bee",
                  "correct": true
                },
                {
                  "label": "cat"
                },
                {
                  "label": "sun"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Rhyming words match at the end. Listen to the last sound.",
            "emoji": "🧦",
            "takeaway": "Rhyming words match at the end, like tree and bee. Listen to the last sound to find the pair."
          }
        ]
      },
      {
        "id": "l.eksight",
        "skillId": "e.k.sight",
        "subject": "english",
        "grade": 0,
        "title": "Sight Words You Just Know",
        "subtitle": "Little words you spot without sounding out.",
        "steps": [
          {
            "kind": "hook",
            "title": "The words that pop up everywhere",
            "body": "Some words show up in almost every sentence: to, help, like, you. You see them so often that you learn to just know them by sight.",
            "say": "Some words show up everywhere, like to, help, and like. You learn to just know them by sight."
          },
          {
            "kind": "concept",
            "title": "Read the whole sentence first",
            "body": "When a word is missing, read the sentence and let your ear pick the word that fits. Can you ___ me? Your ear hears help.",
            "analogy": "A missing word is like a missing puzzle piece. Look at the space around it and the right piece is easy to see.",
            "say": "Read the whole sentence and let your ear pick the word that fits. Can you help me. I like to play.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🤝",
                  "title": "Can you help me?",
                  "body": "help fits the space"
                },
                {
                  "emoji": "🌳",
                  "title": "I like to play.",
                  "body": "to fits the space"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: fill the space",
            "body": "Read it out loud: I like ___ play outside. Which little word fits?",
            "say": "I like blank play outside. Which little word fits?",
            "widget": {
              "w": "tapPick",
              "prompt": "I like ___ play outside.",
              "options": [
                {
                  "label": "to",
                  "correct": true
                },
                {
                  "label": "the"
                },
                {
                  "label": "it"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Sight words are little words you know by heart. Read the whole sentence and pick the word that fits.",
            "emoji": "⭐",
            "takeaway": "Sight words are the little words you know by heart. Read the whole sentence and pick the word that fits the space."
          }
        ]
      },
      {
        "id": "l.ekstory",
        "skillId": "e.k.story",
        "subject": "english",
        "grade": 0,
        "title": "Clues in a Little Story",
        "subtitle": "Stories tell you more than the words say.",
        "steps": [
          {
            "kind": "hook",
            "title": "Be a story detective",
            "body": "A story leaves clues, like a bowl, some flour, and a hot oven. Put the clues together and you can tell what is happening.",
            "say": "A story leaves clues. Put them together and you can tell what is happening."
          },
          {
            "kind": "concept",
            "title": "Add the clues together",
            "body": "If two friends are mixing flour, cracking eggs, and pouring batter into a pan, all the clues point to one thing: they are making a cake.",
            "analogy": "Clues are like footprints. One footprint tells you a little, but a whole trail shows you exactly where it goes.",
            "say": "Flour, eggs, a pan, a hot oven. All the clues point to making a cake.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥣",
                  "title": "Clues",
                  "body": "flour, eggs, a pan, a hot oven"
                },
                {
                  "emoji": "🎂",
                  "title": "Answer",
                  "body": "they are making a cake"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Clues about time",
            "body": "Stories also tell you when. If the sun is coming up and everyone is waking, it is morning.",
            "say": "If the sun is coming up and everyone is waking, it is morning."
          },
          {
            "kind": "try",
            "title": "Your turn: read the clue",
            "body": "The sun is up in the sky and the birds just woke up. What time of day is it?",
            "say": "The sun is coming up and everyone is waking. What time of day is it?",
            "widget": {
              "w": "tapPick",
              "prompt": "The sun is coming up and everyone is waking. What time of day is it?",
              "options": [
                {
                  "label": "morning",
                  "correct": true
                },
                {
                  "label": "night"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Be a story detective. Add up the clues and they tell you what is happening.",
            "emoji": "🔎",
            "takeaway": "Be a story detective. Add up the clues in the story and they tell you what is happening."
          }
        ]
      },
      {
        "id": "l.e1vowels",
        "skillId": "e.1.vowels",
        "subject": "english",
        "grade": 1,
        "title": "Vowel Power",
        "subtitle": "Five special letters, and their two sounds.",
        "steps": [
          {
            "kind": "hook",
            "title": "The letters every word needs",
            "body": "Five letters are so important that almost every word has at least one: a, e, i, o, u. They are called the vowels.",
            "say": "Five letters are in almost every word. A, e, i, o, u. They are the vowels."
          },
          {
            "kind": "concept",
            "title": "Short sound and long sound",
            "body": "Each vowel has two sounds. The short a says ah, like in cat. The long a says its own name, ay, like in cake.",
            "analogy": "The long vowel sound is easy to spot: the vowel simply says its own name, the way it does when you sing the alphabet.",
            "say": "Short a says ah, like cat. Long a says ay, its own name, like cake.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐱",
                  "title": "short a",
                  "body": "cat says ah"
                },
                {
                  "emoji": "🎂",
                  "title": "long a",
                  "body": "cake says ay, its own name"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Count the vowels",
            "body": "Point to each one and count: a, e, i, o, u. That is five vowels in the whole alphabet.",
            "say": "A, e, i, o, u. That is five vowels.",
            "widget": {
              "w": "objects",
              "n": 5,
              "emoji": "🔤"
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the long a",
            "body": "Long a says its own name, ay, like in cake. Which word has that sound?",
            "say": "Which word has a long a sound like cake?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which word has a LONG a sound like in cake?",
              "options": [
                {
                  "label": "rain",
                  "correct": true
                },
                {
                  "label": "cat"
                },
                {
                  "label": "hop"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Five vowels: a, e, i, o, u. When a vowel says its own name, that is the long sound.",
            "emoji": "🔤",
            "takeaway": "There are five vowels: a, e, i, o, u. When a vowel says its own name, that is the long sound."
          }
        ]
      },
      {
        "id": "l.e1sentence",
        "skillId": "e.1.sentence",
        "subject": "english",
        "grade": 1,
        "title": "Sentence Sense",
        "subtitle": "What makes a sentence whole, and how to end it.",
        "steps": [
          {
            "kind": "hook",
            "title": "The car with no brakes",
            "body": "Imagine a car zooming down the street with no way to stop. A telling sentence is like that car. The period is the brake that lets it stop.",
            "say": "A telling sentence is like a car zooming down the street. The period is the brake that lets it stop."
          },
          {
            "kind": "concept",
            "title": "A sentence needs a who and a what",
            "body": "A complete sentence tells WHO or what it is about, and WHAT they do. If it has both, it is whole.",
            "analogy": "Think of a sentence like a photo of an action: you see who is in it, and you see what they are doing.",
            "say": "A complete sentence tells who it is about and what they do. The puppy runs fast. The puppy is the who. Runs fast is the what.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐶",
                  "title": "WHO",
                  "body": "The puppy"
                },
                {
                  "emoji": "🏃",
                  "title": "WHAT",
                  "body": "runs fast."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The period is the stop sign",
            "body": "A telling sentence gives us a fact, so it ends with a period. The period says: this thought is done.",
            "say": "A telling sentence gives a fact, so it ends with a period. We planted a garden, period. The period says this thought is done.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✅",
                  "title": "With a period",
                  "body": "We planted a garden."
                },
                {
                  "emoji": "🚗",
                  "title": "No stop yet",
                  "body": "We planted a garden"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: pick the whole sentence",
            "body": "One of these tells WHO and WHAT and stops with a period. Tap it.",
            "say": "Tap the complete sentence. Look for a who, a what, and a period.",
            "widget": {
              "w": "tapPick",
              "prompt": "Which one is a complete sentence?",
              "options": [
                {
                  "label": "The puppy runs fast.",
                  "correct": true
                },
                {
                  "label": "the fast little"
                },
                {
                  "label": "runs fast"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A whole sentence tells who and what. A telling sentence stops with a period.",
            "emoji": "🛑",
            "takeaway": "A whole sentence tells WHO and WHAT. A telling sentence hits the brakes with a period."
          }
        ]
      },
      {
        "id": "l.e1reading",
        "skillId": "e.1.reading",
        "subject": "english",
        "grade": 1,
        "title": "Story Detective",
        "subtitle": "Reading the clues a story leaves for you.",
        "steps": [
          {
            "kind": "hook",
            "title": "Follow the footprints",
            "body": "A good reader is like a detective. The story leaves clues, and you follow them to figure out what really happened.",
            "say": "A good reader is like a detective. The story leaves clues, and you follow them to find out what happened."
          },
          {
            "kind": "concept",
            "title": "Clues add up to an answer",
            "body": "When the story says Lily planted a seed, watered it every day, and then a sunflower grew, the clues point right at the answer.",
            "analogy": "Clues are like breadcrumbs on a trail. Line them up and they lead straight to the answer.",
            "say": "Lily planted a seed. She watered it every day. A sunflower grew tall. The clues point right at the answer. A sunflower grew.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌱",
                  "title": "Clue",
                  "body": "Planted a seed"
                },
                {
                  "emoji": "💧",
                  "title": "Clue",
                  "body": "Watered every day"
                },
                {
                  "emoji": "🌻",
                  "title": "Answer",
                  "body": "A sunflower grew"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Some clues are loud",
            "body": "A story might not say the tower fell. But when a baby crawls over and you read CRASH, that loud clue tells you the tower came down.",
            "say": "Sometimes a clue is loud. Ben built a tall tower. His baby sister crawled over. Crash. That loud clue tells you the tower came down."
          },
          {
            "kind": "try",
            "title": "Your turn: crack the clue",
            "body": "Ben built a tower up to his chin. His baby sister crawled over. CRASH! Tap what probably happened.",
            "say": "Ben built a tall tower. His baby sister crawled over. Crash. Tap what probably happened.",
            "widget": {
              "w": "tapPick",
              "prompt": "What probably happened?",
              "options": [
                {
                  "label": "His sister knocked the tower down",
                  "correct": true
                },
                {
                  "label": "Ben went to sleep"
                },
                {
                  "label": "The tower grew taller"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The answer is hiding in the clues. Follow them like a detective.",
            "emoji": "🔍",
            "takeaway": "The answer is hiding in the clues. Read the words, follow the breadcrumbs, and you will find it."
          }
        ]
      },
      {
        "id": "l.e1story",
        "skillId": "e.1.story",
        "subject": "english",
        "grade": 1,
        "title": "Story Friends",
        "subtitle": "Why characters do what they do.",
        "steps": [
          {
            "kind": "hook",
            "title": "Everybody has a reason",
            "body": "When you grab an umbrella, there is a reason: it is raining. Story friends are the same. Everything they do has a because behind it.",
            "say": "When you grab an umbrella, there is a reason. It is raining. Story friends are the same. Everything they do has a because behind it."
          },
          {
            "kind": "concept",
            "title": "Because links what happens to why",
            "body": "Ana built a fort inside. Why? Because it was rainy outside. The rain is the reason, and the fort is what she did about it.",
            "analogy": "Think of because as a rope tying two things together: the reason on one end, the action on the other.",
            "say": "Ana built a fort inside. Why? Because it was rainy outside. The rain is the reason. The fort is what she did about it.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌧️",
                  "title": "Because",
                  "body": "It was rainy outside"
                },
                {
                  "emoji": "⛺",
                  "title": "So she",
                  "body": "built a fort inside"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Watch what things become",
            "body": "Stories also show how things change. A seed gets planted and watered, and by the end it has become a tall sunflower.",
            "say": "Stories show how things change. A little seed was planted and watered, and it became a tall sunflower.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌰",
                  "title": "Start",
                  "body": "A little seed"
                },
                {
                  "emoji": "🌻",
                  "title": "Became",
                  "body": "A tall sunflower"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the reason",
            "body": "It was rainy outside, so Ana stayed in. Tap WHY she built a fort inside.",
            "say": "Tap why Ana built a fort inside.",
            "widget": {
              "w": "tapPick",
              "prompt": "Why did Ana build a fort inside?",
              "options": [
                {
                  "label": "because it was rainy outside",
                  "correct": true
                },
                {
                  "label": "because it was her birthday"
                },
                {
                  "label": "because she was sleepy"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "To know why a character did something, look for the because. The reason is always close by.",
            "emoji": "⛺",
            "takeaway": "To know why a character did something, look for the because. The reason is always close by."
          }
        ]
      },
      {
        "id": "l.mainidea",
        "skillId": "e.2.reading",
        "subject": "english",
        "grade": 2,
        "title": "Finding the Main Idea",
        "subtitle": "What a whole paragraph is really about.",
        "steps": [
          {
            "kind": "hook",
            "title": "The umbrella trick",
            "body": "A paragraph is like a family standing under one umbrella. Every sentence is a person. The MAIN idea is the umbrella that covers all of them.",
            "say": "The main idea is like an umbrella that covers every sentence in the paragraph."
          },
          {
            "kind": "concept",
            "title": "Ask: what are they ALL about?",
            "body": "To find the main idea, do not grab the first fact you see. Ask what every sentence has in common. That shared thing is the main idea.",
            "analogy": "One sentence is a detail. The main idea is the big thing all the details are pointing at.",
            "say": "Ask what every sentence has in common. That shared thing is the main idea."
          },
          {
            "kind": "try",
            "title": "Your turn: find the umbrella",
            "body": "Read these sentences. Tap the one that tells the MAIN idea.",
            "widget": {
              "w": "highlight",
              "prompt": "Tap the sentence that covers all the others.",
              "sentences": [
                {
                  "text": "Ants are amazing teamworkers.",
                  "main": true
                },
                {
                  "text": "Some ants find the food."
                },
                {
                  "text": "Others carry it home."
                },
                {
                  "text": "A few guard the nest."
                }
              ]
            },
            "say": "Tap the sentence that covers all the others."
          },
          {
            "kind": "example",
            "title": "Why the others are wrong",
            "body": "The other sentences are true, but each one is just a detail.",
            "reveal": [
              "\"Some ants find the food\" is only ONE job.",
              "\"Others carry it home\" is only one more job.",
              "Only \"Ants are amazing teamworkers\" covers every job at once. That is the umbrella."
            ]
          },
          {
            "kind": "recap",
            "emoji": "☂️",
            "title": "Remember this",
            "takeaway": "The main idea is the umbrella that covers every sentence, not just one detail underneath it.",
            "say": "The main idea is the umbrella that covers every sentence."
          }
        ]
      },
      {
        "id": "l.e2nounsverbs",
        "skillId": "e.2.nounsverbs",
        "subject": "english",
        "grade": 2,
        "title": "Nouns & Verbs",
        "subtitle": "Naming the thing and describing the thing.",
        "steps": [
          {
            "kind": "hook",
            "title": "Point at it",
            "body": "If you can point at it, touch it, or name it, you found a noun. A noun is a person, a place, or a thing.",
            "say": "If you can point at it, touch it, or name it, you found a noun. A noun is a person, a place, or a thing."
          },
          {
            "kind": "concept",
            "title": "Nouns name, describing words color it in",
            "body": "In the gray kitten, kitten is the noun, the thing. Gray is the describing word. It tells us what kind of kitten.",
            "analogy": "The noun is the plain outline in a coloring book. A describing word is the crayon that fills it in.",
            "say": "In the gray kitten, kitten is the noun, the thing. Gray is the describing word. It tells what kind of kitten.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐱",
                  "title": "Noun",
                  "body": "kitten (the thing)"
                },
                {
                  "emoji": "🎨",
                  "title": "Describes it",
                  "body": "gray (what kind)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Spot the noun in a sentence",
            "body": "In My skateboard is under the porch, skateboard is a noun because it is a thing. Porch is a noun too, because it is a place.",
            "say": "In my skateboard is under the porch, skateboard is a noun because it is a thing. Porch is a noun too, because it is a place."
          },
          {
            "kind": "try",
            "title": "Your turn: find the describing word",
            "body": "In The gray kitten sleeps in a warm basket, tap the word that DESCRIBES the kitten.",
            "say": "In the gray kitten sleeps in a warm basket, tap the word that describes the kitten.",
            "widget": {
              "w": "tapPick",
              "prompt": "Which word describes the kitten?",
              "options": [
                {
                  "label": "gray",
                  "correct": true
                },
                {
                  "label": "kitten"
                },
                {
                  "label": "sleeps"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A noun names a person, place, or thing. A describing word tells what kind.",
            "emoji": "🎨",
            "takeaway": "A noun names a person, place, or thing. A describing word tells what kind, like the crayon that colors it in."
          }
        ]
      },
      {
        "id": "l.e2contractions",
        "skillId": "e.2.contractions",
        "subject": "english",
        "grade": 2,
        "title": "Contraction Action",
        "subtitle": "Squishing two words into one, with an apostrophe.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two words hold hands",
            "body": "Sometimes two words get squished into one to say it faster. The little apostrophe shows where a letter jumped out.",
            "say": "Sometimes two words get squished into one to say it faster. A little apostrophe shows where a letter jumped out."
          },
          {
            "kind": "concept",
            "title": "It is becomes it's",
            "body": "Take it is. Push the words together and drop the i in is. Put an apostrophe where it left. Now you have it's.",
            "analogy": "The apostrophe is like a bookmark showing the exact spot a letter used to be.",
            "say": "Take it is. Push the words together and drop the i in is. Put an apostrophe where it left. Now you have it's.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧩",
                  "title": "Two words",
                  "body": "it + is"
                },
                {
                  "emoji": "✂️",
                  "title": "Squished",
                  "body": "it's"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Careful: its is different",
            "body": "It's with an apostrophe means it is. But its with no apostrophe means belonging to it, like the dog wagged its tail.",
            "say": "It's with an apostrophe means it is. But its with no apostrophe means belonging to it, like the dog wagged its tail.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🟰",
                  "title": "it's",
                  "body": "means it is"
                },
                {
                  "emoji": "🐾",
                  "title": "its",
                  "body": "belonging to it"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: fill the blank",
            "body": "You want to say It is snowing. Tap the contraction that fits: ___ snowing!",
            "say": "You want to say it is snowing. Tap the contraction that fits the blank, snowing.",
            "widget": {
              "w": "tapPick",
              "prompt": "Which fits: ___ snowing!",
              "options": [
                {
                  "label": "It's",
                  "correct": true
                },
                {
                  "label": "Its"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "It's with an apostrophe always means it is. If you cannot say it is, do not use the apostrophe.",
            "emoji": "✂️",
            "takeaway": "It's with an apostrophe always means it is. If you cannot say it is, do not use the apostrophe."
          }
        ]
      },
      {
        "id": "l.e2vocab",
        "skillId": "e.2.vocab",
        "subject": "english",
        "grade": 2,
        "title": "Reading the Clues Around a Word",
        "subtitle": "How to figure out a big word you have never seen.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word you don't know",
            "body": "You are reading along and you hit a giant word like JUBILANT. You have never seen it. Do you stop? No. You look at the words around it.",
            "say": "You are reading and you hit a big word you have never seen, like jubilant. You do not stop. You look at the words around it."
          },
          {
            "kind": "concept",
            "title": "The words nearby are clues",
            "body": "A hard word almost never stands alone. The sentence around it drops clues about what it means. Read the whole sentence, then guess.",
            "analogy": "A tricky word is like a stranger at a party. You do not know their name yet, but who they are standing with tells you a lot about them.",
            "say": "A hard word almost never stands alone. Her team won the championship. Winning feels great, so jubilant must mean extremely happy.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🏆",
                  "title": "The clue",
                  "body": "her team WON the championship"
                },
                {
                  "emoji": "😄",
                  "title": "The meaning",
                  "body": "JUBILANT = extremely happy"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: use the clue",
            "body": "Lena felt JUBILANT when her team won the championship. What does jubilant mean?",
            "say": "Lena felt jubilant when her team won the championship. What does jubilant mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Jubilant means...",
              "options": [
                {
                  "label": "extremely happy",
                  "correct": true
                },
                {
                  "label": "very tired"
                },
                {
                  "label": "a little hungry"
                },
                {
                  "label": "kind of scared"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "When a word is new, read the whole sentence and grab the clues around it.",
            "emoji": "🔎",
            "takeaway": "When a word is new, read the whole sentence and grab the clues around it. Jubilant means bursting with happiness."
          }
        ]
      },
      {
        "id": "l.e2stories",
        "skillId": "e.2.stories",
        "subject": "english",
        "grade": 2,
        "title": "What Happens Next in a Story",
        "subtitle": "Following the order of events, step by step.",
        "steps": [
          {
            "kind": "hook",
            "title": "The caterpillar's big change",
            "body": "A caterpillar eats and eats, then wraps itself in a little case called a chrysalis. Then something amazing happens inside. But what, and in what order?",
            "say": "A caterpillar eats and eats, then wraps itself in a case called a chrysalis. Then something amazing happens inside."
          },
          {
            "kind": "concept",
            "title": "Stories happen in order",
            "body": "Every story moves in steps. First one thing, then the next, then the next. To answer questions, follow the steps in order.",
            "analogy": "A story is like climbing stairs. You cannot jump to the top. Each step comes right after the one below it.",
            "say": "Every story moves in steps. First an egg, then a caterpillar, then a chrysalis, then it changes inside, and last a butterfly.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥚",
                  "title": "First",
                  "body": "egg, then caterpillar"
                },
                {
                  "emoji": "🐛",
                  "title": "Then",
                  "body": "builds a chrysalis"
                },
                {
                  "emoji": "🦋",
                  "title": "Last",
                  "body": "changes inside, then a butterfly"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: what happens next?",
            "body": "The caterpillar just built its chrysalis. What happens right AFTER that?",
            "say": "The caterpillar just built its chrysalis. What happens right after that?",
            "widget": {
              "w": "tapPick",
              "prompt": "Right after the chrysalis is built...",
              "options": [
                {
                  "label": "Its body changes inside",
                  "correct": true
                },
                {
                  "label": "It lays an egg"
                },
                {
                  "label": "It starts eating leaves again"
                },
                {
                  "label": "It flies away as a butterfly"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Stories go in order like climbing stairs. Follow the steps one at a time.",
            "emoji": "🦋",
            "takeaway": "Stories go in order like climbing stairs. To find what happens next, follow the steps one at a time."
          }
        ]
      },
      {
        "id": "l.prefix",
        "skillId": "e.3.prefix",
        "subject": "english",
        "grade": 3,
        "title": "Prefixes Are Word Math",
        "subtitle": "Unlock any word by adding up its parts.",
        "steps": [
          {
            "kind": "hook",
            "title": "A word you have never seen",
            "body": "You read the word \"unbreakable\" and freeze. But you already know how to crack it. Big words are just small parts added together.",
            "say": "Big words are just small parts added together."
          },
          {
            "kind": "concept",
            "title": "A prefix changes the front",
            "body": "A prefix is a little piece you glue to the FRONT of a word to change its meaning. \"Un-\" means not. So un + happy = not happy.",
            "analogy": "It is word math: un + kind = unkind. re + do = do again. pre + game = before the game.",
            "say": "Un means not. So un plus happy equals not happy. It is word math."
          },
          {
            "kind": "try",
            "title": "Your turn: sort the prefixes",
            "body": "Tap a word, then tap the box that tells what its prefix means.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "not",
                  "label": "un- (not)"
                },
                {
                  "id": "again",
                  "label": "re- (again)"
                }
              ],
              "items": [
                {
                  "label": "unlock",
                  "bucket": "not"
                },
                {
                  "label": "redo",
                  "bucket": "again"
                },
                {
                  "label": "unfair",
                  "bucket": "not"
                },
                {
                  "label": "repaint",
                  "bucket": "again"
                }
              ]
            },
            "say": "Sort each word by what its prefix means."
          },
          {
            "kind": "recap",
            "emoji": "🔤",
            "title": "Remember this",
            "takeaway": "A prefix is glued to the front and changes the meaning. Break a big word into parts and add them up.",
            "say": "A prefix is glued to the front and changes the meaning."
          }
        ]
      },
      {
        "id": "l.e3synant",
        "skillId": "e.3.synant",
        "subject": "english",
        "grade": 3,
        "title": "Same or Opposite: Synonyms and Antonyms",
        "subtitle": "Two ways words can be related.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two words, one meaning",
            "body": "Brave and courageous are different words, but they mean almost the same thing. English is full of word twins like this, and also word enemies.",
            "say": "Brave and courageous are different words, but they mean almost the same thing."
          },
          {
            "kind": "concept",
            "title": "Twins and opposites",
            "body": "A SYNONYM means the same, like brave and courageous. An ANTONYM means the opposite, like brave and afraid.",
            "analogy": "A synonym is a twin who dresses differently. An antonym is that twin's enemy, standing on the other side of the room.",
            "say": "A synonym means the same, like brave and courageous. An antonym means the opposite, like brave and afraid.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👯",
                  "title": "SYNONYM",
                  "body": "same meaning: brave = courageous"
                },
                {
                  "emoji": "↔️",
                  "title": "ANTONYM",
                  "body": "opposite: brave vs. afraid"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: sort the words",
            "body": "Look at the word GENEROUS. Sort each word into synonym (same) or antonym (opposite).",
            "say": "Look at the word generous. Sort each word into synonym, meaning the same, or antonym, meaning the opposite.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "syn",
                  "label": "Synonym of generous"
                },
                {
                  "id": "ant",
                  "label": "Antonym of generous"
                }
              ],
              "items": [
                {
                  "label": "giving",
                  "bucket": "syn"
                },
                {
                  "label": "kind",
                  "bucket": "syn"
                },
                {
                  "label": "selfish",
                  "bucket": "ant"
                },
                {
                  "label": "greedy",
                  "bucket": "ant"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Synonyms mean the same. Antonyms are opposites.",
            "emoji": "🔀",
            "takeaway": "Synonyms are twins that mean the same. Antonyms are opposites. Generous and selfish are opposites."
          }
        ]
      },
      {
        "id": "l.e3reading",
        "skillId": "e.3.reading",
        "subject": "english",
        "grade": 3,
        "title": "Reading Between the Lines",
        "subtitle": "Why authors say what they say, and what causes what.",
        "steps": [
          {
            "kind": "hook",
            "title": "Nothing is there by accident",
            "body": "\"Recycling one can saves enough energy to run a TV for three hours.\" An author did not drop that fact by luck. They put it there for a reason.",
            "say": "Recycling one can saves enough energy to run a T V for three hours. An author did not drop that fact by luck. They put it there for a reason."
          },
          {
            "kind": "concept",
            "title": "A fact can be a tool",
            "body": "Authors pick facts on purpose. Often a surprising fact is there to convince you to care or to change your mind.",
            "analogy": "A fact in a sentence is like a nail in a wall. The author put it exactly where they need it to hold something up.",
            "say": "Authors pick facts on purpose. A surprising fact is often there to convince you to care.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "♻️",
                  "title": "The fact",
                  "body": "one can = 3 hours of TV energy"
                },
                {
                  "emoji": "🎯",
                  "title": "The reason",
                  "body": "to convince you recycling matters"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the reason",
            "body": "Why would an author include the fact about recycling one can?",
            "say": "Why would an author include the fact about recycling one can?",
            "widget": {
              "w": "tapPick",
              "prompt": "The author included this fact...",
              "options": [
                {
                  "label": "to convince readers that recycling matters",
                  "correct": true
                },
                {
                  "label": "to teach how a TV is built"
                },
                {
                  "label": "to sell more soda cans"
                },
                {
                  "label": "to explain what energy is"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Careful reading finds the cause",
            "body": "The recipe said one CUP of sugar. Milo added one BAG. The cookies came out like candy bricks. What caused that?",
            "reveal": [
              "The recipe asked for one cup of sugar.",
              "Milo used a whole bag, which is way more than one cup.",
              "Too much sugar made the cookies hard as bricks. Reading carefully finds the cause."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Authors choose facts for a reason, often to persuade you. Read closely to find what caused what.",
            "emoji": "♻️",
            "takeaway": "Authors choose facts for a reason, often to persuade you. And reading closely shows you what caused what."
          }
        ]
      },
      {
        "id": "l.e3homophones",
        "skillId": "e.3.homophones",
        "subject": "english",
        "grade": 3,
        "title": "Homophones: Same Sound, Different Word",
        "subtitle": "How to pick the right spelling every time.",
        "steps": [
          {
            "kind": "hook",
            "title": "Sound-alike trap",
            "body": "There, their, and they're all sound exactly the same out loud. But only one is right in each sentence, and the spelling is the whole clue.",
            "say": "There, their, and they're all sound exactly the same out loud. But only one is right in each sentence."
          },
          {
            "kind": "concept",
            "title": "Same sound, different job",
            "body": "Homophones sound alike but mean different things. To pick the right one, ask what the word is DOING in the sentence.",
            "analogy": "Homophones are like triplets with the same voice. You cannot tell them apart by sound. You tell them apart by what each one does.",
            "say": "Homophones sound alike but mean different things. There is a place. Their means it belongs to them.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📍",
                  "title": "THERE",
                  "body": "a place: over there"
                },
                {
                  "emoji": "🎒",
                  "title": "THEIR",
                  "body": "ownership: their bags"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: pick the right word",
            "body": "\"Let's meet at the park over ___.\" Which spelling is correct?",
            "say": "Let us meet at the park over there. Which spelling is correct? The park is a place, so there.",
            "widget": {
              "w": "tapPick",
              "prompt": "Let's meet at the park over ___.",
              "options": [
                {
                  "label": "there",
                  "correct": true
                },
                {
                  "label": "their"
                },
                {
                  "label": "they're"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Homophones sound the same but do different jobs. Ask what the word is doing in the sentence.",
            "emoji": "🎯",
            "takeaway": "Homophones sound the same but do different jobs. There is a place, their means it belongs to them. Ask what the word is doing."
          }
        ]
      },
      {
        "id": "l.e3passages",
        "skillId": "e.3.passages",
        "subject": "english",
        "grade": 3,
        "title": "Read Like a Detective",
        "subtitle": "The answer is always hiding in the passage.",
        "steps": [
          {
            "kind": "hook",
            "title": "The buried acorn",
            "body": "A squirrel buries a hundred acorns for winter, then forgets where half of them are. Years later, a row of oak trees is growing right where it dug. How did that happen?",
            "say": "A squirrel buries acorns for winter, then forgets half of them. Years later, oak trees grow right where it dug. How did that happen?"
          },
          {
            "kind": "concept",
            "title": "Go back and dig",
            "body": "When a passage asks how or why something happened, do not guess from memory. Go back to the words and find the sentence that answers it.",
            "analogy": "The passage is a map with the answer buried in it. A good reader does not guess where the treasure is, they walk back to the spot and dig.",
            "say": "When a passage asks how or why, do not guess. Go back to the words and find the sentence that answers it.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🤔",
                  "title": "Guessing",
                  "body": "Answering from memory or a hunch."
                },
                {
                  "emoji": "🔎",
                  "title": "Detective",
                  "body": "Going back to find the exact sentence."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Cause and effect",
            "body": "Most how and why answers are a cause and its effect. The squirrel forgets the acorns, that is the cause. The acorns grow into trees, that is the effect.",
            "say": "Most how and why answers are a cause and its effect. The squirrel forgets the acorns, and the acorns grow into trees.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐿️",
                  "title": "Cause",
                  "body": "The squirrel forgets buried acorns."
                },
                {
                  "emoji": "🌳",
                  "title": "Effect",
                  "body": "The acorns sprout into trees."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: dig for the answer",
            "body": "The passage says squirrels bury acorns, then forget where many of them are. Tap the answer to: How do squirrels help forests grow?",
            "say": "Squirrels bury acorns, then forget where many of them are. How do squirrels help forests grow?",
            "widget": {
              "w": "tapPick",
              "prompt": "How do squirrels help forests grow?",
              "options": [
                {
                  "label": "They forget buried acorns, which grow into trees",
                  "correct": true
                },
                {
                  "label": "They eat every acorn they can find"
                },
                {
                  "label": "They chase birds out of the trees"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "When a passage asks how or why, go back and find the exact sentence. Do not guess, dig.",
            "emoji": "🔎",
            "takeaway": "When a passage asks how or why, go back and find the exact sentence. Do not guess, dig."
          }
        ]
      },
      {
        "id": "l.e4figurative",
        "skillId": "e.4.figurative",
        "subject": "english",
        "grade": 4,
        "title": "Alliteration and Personification",
        "subtitle": "Two tricks writers use to make words come alive.",
        "steps": [
          {
            "kind": "hook",
            "title": "The house that groaned",
            "body": "You step into an old house and the floorboards groan under your feet. A floor cannot really groan, so why does that one word make the whole place feel creepy and alive?",
            "say": "You step into an old house and the floorboards groan under your feet. A floor cannot really groan, so why does that word make the place feel creepy and alive?"
          },
          {
            "kind": "concept",
            "title": "Two writer's tools",
            "body": "Alliteration repeats the first sound of words that are close together. Personification gives a thing feelings or actions that only people or animals can have.",
            "analogy": "Alliteration is a drumbeat you hear, like Peter Piper picked a peck. Personification is a mask on an object, so a floor can groan and the wind can whisper.",
            "say": "Alliteration repeats the first sound of nearby words. Personification gives a thing feelings or actions only a living creature can have.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥁",
                  "title": "Alliteration",
                  "body": "Same first sound: Peter Piper picked peppers."
                },
                {
                  "emoji": "🎭",
                  "title": "Personification",
                  "body": "A thing acts alive: the floorboards groaned."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why writers bother",
            "body": "Alliteration makes a line fun to say and easy to remember. Personification builds a feeling, so a groaning floor makes the house feel alive and a little creepy.",
            "say": "Alliteration makes a line fun to say and easy to remember. Personification builds a feeling, so a groaning floor makes the house feel alive and a little creepy."
          },
          {
            "kind": "try",
            "title": "Your turn: sort the tricks",
            "body": "Drop each line into the box that names its trick.",
            "say": "Drop each line into the box that names its trick, alliteration or personification.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "allit",
                  "label": "Alliteration"
                },
                {
                  "id": "person",
                  "label": "Personification"
                }
              ],
              "items": [
                {
                  "label": "Peter Piper picked a peck of peppers",
                  "bucket": "allit"
                },
                {
                  "label": "The old floorboards groaned",
                  "bucket": "person"
                },
                {
                  "label": "Silly Sally sang softly",
                  "bucket": "allit"
                },
                {
                  "label": "The wind whispered through the trees",
                  "bucket": "person"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Alliteration repeats first sounds like a drumbeat. Personification lets a thing act alive, like a floor that groans.",
            "emoji": "🎭",
            "takeaway": "Alliteration repeats first sounds like a drumbeat. Personification lets a thing act alive, like a floor that groans."
          }
        ]
      },
      {
        "id": "l.e4mainidea",
        "skillId": "e.4.mainidea",
        "subject": "english",
        "grade": 4,
        "title": "Main Idea and Details",
        "subtitle": "Which details belong, and which one wandered off.",
        "steps": [
          {
            "kind": "hook",
            "title": "The team photo",
            "body": "Imagine a paragraph about how exercise strengthens the brain. Every sentence should be on that team. But one sentence sneaks in and says running shoes come in many colors. It does not belong.",
            "say": "Imagine a paragraph about how exercise strengthens the brain. Every sentence should be on that team, but one sneaks in about shoe colors. It does not belong."
          },
          {
            "kind": "concept",
            "title": "Details must serve the main idea",
            "body": "The main idea is what the whole paragraph is about. A supporting detail proves or explains that idea. If a sentence does not connect to the main idea, it is off topic.",
            "analogy": "The main idea is the team. Every detail wears the same jersey. A sentence in the wrong jersey does not belong on the field.",
            "say": "The main idea is what the whole paragraph is about. A supporting detail proves or explains it. A sentence that does not connect is off topic.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧠",
                  "title": "Main idea",
                  "body": "Exercise strengthens the brain."
                },
                {
                  "emoji": "✅",
                  "title": "Supporting detail",
                  "body": "Kids focus better after playing."
                },
                {
                  "emoji": "❌",
                  "title": "Off topic",
                  "body": "Running shoes come in many colors."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Test each sentence",
            "body": "Read a detail, then ask: does this help prove the main idea? Focus better after playing supports the idea that recess helps learning. Shoe colors do not.",
            "say": "Read a detail, then ask, does this help prove the main idea? Focusing better after playing supports it. Shoe colors do not."
          },
          {
            "kind": "try",
            "title": "Your turn: find the odd one out",
            "body": "The main idea is: Exercise strengthens the brain. Tap the detail that does NOT belong.",
            "say": "The main idea is that exercise strengthens the brain. Tap the detail that does not belong.",
            "widget": {
              "w": "tapPick",
              "prompt": "Which detail does NOT belong?",
              "options": [
                {
                  "label": "Running shoes come in many colors",
                  "correct": true
                },
                {
                  "label": "Exercise sends more oxygen to the brain"
                },
                {
                  "label": "Kids remember more after they move around"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Every supporting detail wears the main idea's jersey. If a sentence does not prove the main idea, it is off topic.",
            "emoji": "🧠",
            "takeaway": "Every supporting detail wears the main idea's jersey. If a sentence does not prove the main idea, it is off topic."
          }
        ]
      },
      {
        "id": "l.e4context",
        "skillId": "e.4.context",
        "subject": "english",
        "grade": 4,
        "title": "Context Clues",
        "subtitle": "Figure out a hard word from the words around it.",
        "steps": [
          {
            "kind": "hook",
            "title": "The hikers who kept stopping",
            "body": "You read: the trail was so arduous that even the fittest hikers stopped to rest five times. You have never seen the word arduous, but you already have a good guess. How?",
            "say": "You read that the trail was so arduous that even the fittest hikers stopped to rest five times. You have never seen the word arduous, but you already have a good guess. How?"
          },
          {
            "kind": "concept",
            "title": "The nearby words tell on it",
            "body": "You do not need a dictionary. The other words in the sentence leave clues about what the hard word means. Fit hikers resting five times means the trail was very hard.",
            "analogy": "A hard word is a stranger at a party. You do not know the stranger, but you watch who they stand with. Arduous stands next to tired hikers, so it means very hard and tiring.",
            "say": "You do not need a dictionary. The other words leave clues. Fit hikers resting five times means the trail was very hard and tiring.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥾",
                  "title": "The clue",
                  "body": "Fit hikers rest five times."
                },
                {
                  "emoji": "💡",
                  "title": "The meaning",
                  "body": "Arduous = very difficult and tiring."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "One more",
            "body": "Read: the crowd's cheers were deafening; players could not hear the coach two feet away. The clue is that people could not hear from two feet away. So deafening means extremely loud.",
            "say": "The crowd's cheers were deafening, so loud that players could not hear the coach two feet away. That clue tells you deafening means extremely loud."
          },
          {
            "kind": "try",
            "title": "Your turn: use the clue",
            "body": "The trail was so ARDUOUS that even the fittest hikers stopped to rest five times. Tap what arduous means.",
            "say": "The trail was so arduous that even the fittest hikers stopped to rest five times. What does arduous mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Arduous means…",
              "options": [
                {
                  "label": "very difficult and tiring",
                  "correct": true
                },
                {
                  "label": "short and easy"
                },
                {
                  "label": "flat and smooth"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Do not skip a hard word. Read the words around it for clues, they almost always give the meaning away.",
            "emoji": "💡",
            "takeaway": "Do not skip a hard word. Read the words around it for clues, they almost always give the meaning away."
          }
        ]
      },
      {
        "id": "l.e5idioms",
        "skillId": "e.5.idioms",
        "subject": "english",
        "grade": 5,
        "title": "Idioms and Expressions",
        "subtitle": "When the words say one thing but mean another.",
        "steps": [
          {
            "kind": "hook",
            "title": "A test made of cake?",
            "body": "Your friend walks out of a math test and says it was a piece of cake. There was no cake in the room. So what did she actually mean?",
            "say": "Your friend walks out of a math test and says it was a piece of cake. There was no cake in the room, so what did she actually mean?"
          },
          {
            "kind": "concept",
            "title": "An idiom hides its real meaning",
            "body": "An idiom is a phrase whose meaning is not the literal words. Piece of cake has nothing to do with dessert. It means something was very easy.",
            "analogy": "An idiom is a gift box. The wrapping paper is the words, easy to see. The real meaning is the present inside, and you have to open it.",
            "say": "An idiom is a phrase whose meaning is not the literal words. Piece of cake has nothing to do with dessert. It means something was very easy.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🎁",
                  "title": "The words",
                  "body": "It was a piece of cake."
                },
                {
                  "emoji": "✅",
                  "title": "The real meaning",
                  "body": "It was very easy."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "How to unwrap one",
            "body": "When a phrase makes no sense literally, do not read it word by word. Think about how the person feels, then pick the meaning that fits.",
            "say": "When a phrase makes no sense literally, do not read it word by word. Think about how the person feels, then pick the meaning that fits."
          },
          {
            "kind": "try",
            "title": "Your turn: unwrap the idiom",
            "body": "That test was a piece of cake. Tap what it really means.",
            "say": "That test was a piece of cake. What does it really mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "\"That test was a piece of cake\" means…",
              "options": [
                {
                  "label": "it was very easy",
                  "correct": true
                },
                {
                  "label": "the test was about baking"
                },
                {
                  "label": "it was long and hard"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "An idiom means more than its words. Piece of cake means easy, so unwrap the phrase to find the real meaning.",
            "emoji": "🍰",
            "takeaway": "An idiom means more than its words. Piece of cake means easy, so unwrap the phrase to find the real meaning."
          }
        ]
      },
      {
        "id": "l.e5grammar",
        "skillId": "e.5.grammar",
        "subject": "english",
        "grade": 5,
        "title": "Its vs. It's: The Apostrophe Trap",
        "subtitle": "Two tiny words that trip up almost everybody.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word that fools grown-ups",
            "body": "You write \"The library lends its books.\" A little voice says put an apostrophe. That voice is wrong, and here is why.",
            "say": "The library lends its books. A little voice tells you to add an apostrophe. That voice is wrong. Let me show you why."
          },
          {
            "kind": "concept",
            "title": "One means owns, one means it is",
            "body": "ITS shows something belongs to it, like his or her. IT'S is short for it is. The apostrophe is standing in for the missing i in is.",
            "analogy": "The apostrophe is a tiny pinch. It squeezes two words into one and stands in for the letters pulled out. No squeeze, no apostrophe.",
            "say": "Its, with no apostrophe, means it owns something, like his or her. It's, with an apostrophe, is short for it is. The apostrophe is standing in for the missing letter.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📚",
                  "title": "ITS",
                  "body": "Owns it: The dog wagged its tail.",
                  "color": "#2e7d5b"
                },
                {
                  "emoji": "✂️",
                  "title": "IT'S",
                  "body": "It is: It's raining today.",
                  "color": "#b5532a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The swap test",
            "body": "Stuck? Try reading it as \"it is.\" If the sentence still makes sense, use it's. If it sounds silly, use its.",
            "say": "Here is the test. Read the sentence with the words it is. If it still makes sense, use the apostrophe version. If it sounds silly, use its."
          },
          {
            "kind": "try",
            "title": "Your turn: fill the blank",
            "body": "The library lets students borrow ___ books for two weeks. The books belong to the library. Which word fits?",
            "say": "The library lets students borrow blank books for two weeks. The books belong to the library. Which word fits?",
            "widget": {
              "w": "tapPick",
              "prompt": "The library lets students borrow ___ books for two weeks.",
              "options": [
                {
                  "label": "its",
                  "correct": true
                },
                {
                  "label": "it's"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why its wins here",
            "body": "Let's use the swap test on the sentence.",
            "reveal": [
              "Try it is: the library lets students borrow it is books. That sounds silly.",
              "So it is not short for anything here. The books belong to the library.",
              "Belonging with no cut word means its, with no apostrophe."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The apostrophe is a tiny knife. It only cuts it is down to it's. If nothing is being cut, use its.",
            "emoji": "✂️",
            "takeaway": "The apostrophe is a tiny knife that only cuts it is down to it's. If nothing is being cut, use its."
          }
        ]
      },
      {
        "id": "l.e5pov",
        "skillId": "e.5.pov",
        "subject": "english",
        "grade": 5,
        "title": "Point of View and Mood: The Author's Two Dials",
        "subtitle": "Who is telling the story, and how it makes you feel.",
        "steps": [
          {
            "kind": "hook",
            "title": "Same story, different camera",
            "body": "\"I couldn't believe my eyes when I opened the box.\" You are seeing this through one person's eyes, not floating above the whole scene. That choice has a name.",
            "say": "I couldn't believe my eyes when I opened the box. You are seeing this through one person's eyes, not floating above the whole scene. That choice has a name."
          },
          {
            "kind": "concept",
            "title": "First person: the I camera",
            "body": "When a story uses I, me, and my, the narrator is inside the story telling you their own experience. That is called first person point of view.",
            "analogy": "First person is a helmet camera. You only see what the person wearing it sees, and you hear their thoughts.",
            "say": "When a story uses I, me, and my, the narrator is inside the story telling you what happened to them. That is first person. Think of a helmet camera. You only see what that one person sees.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🎥",
                  "title": "First person",
                  "body": "I opened the box.",
                  "color": "#2e5b8a"
                },
                {
                  "emoji": "🛰️",
                  "title": "Third person",
                  "body": "She opened the box.",
                  "color": "#7a5aa0"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The second dial: mood",
            "body": "Authors also pick words to make you feel something. Fog, a graveyard, and a creaking gate are chosen to make a scene feel spooky, not cheerful.",
            "say": "Authors also pick words to make you feel something. Fog, a graveyard, and a creaking gate are chosen to make a scene feel spooky, not cheerful. That feeling is called mood."
          },
          {
            "kind": "try",
            "title": "Your turn: build a spooky mood",
            "body": "Which sentence sets a SPOOKY mood?",
            "say": "Which sentence sets a spooky mood?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which sentence sets a spooky mood?",
              "options": [
                {
                  "label": "Fog crawled over the graveyard as the gate creaked open.",
                  "correct": true
                },
                {
                  "label": "Sunlight warmed the picnic blanket by the lake."
                },
                {
                  "label": "The puppy chased the ball across the bright yard."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Spotting the point of view",
            "body": "How do we know this sentence is first person? \"I couldn't believe my eyes when I opened the box.\"",
            "reveal": [
              "Hunt for the pronouns: I, and my.",
              "Those are words the narrator uses for themselves.",
              "A narrator inside the story using I and my means first person point of view."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "First person is the I camera. The narrator is inside the story. Mood is the feeling the author's word choices give you.",
            "emoji": "🎥",
            "takeaway": "First person is the I camera: the narrator is inside the story. Mood is the feeling the author's word choices give you."
          }
        ]
      },
      {
        "id": "l.e5reading",
        "skillId": "e.5.reading",
        "subject": "english",
        "grade": 5,
        "title": "Passage Power: Reading for the Why",
        "subtitle": "The answer is hiding in the passage. Here is how to catch it.",
        "steps": [
          {
            "kind": "hook",
            "title": "The detective move",
            "body": "A test asks WHY octopuses prefer crawling to swimming. You did not know that this morning. But the passage told you, if you read like a detective.",
            "say": "A test asks why octopuses prefer crawling to swimming. You did not know that this morning. But the passage told you, if you read like a detective."
          },
          {
            "kind": "concept",
            "title": "Match the question to the clue",
            "body": "A good answer is not a guess. It is a fact the passage actually gave you. When a question asks why, hunt for the sentence that explains the reason.",
            "analogy": "The passage is the crime scene and the right answer is the fingerprint. You do not invent it, you find where it was left behind.",
            "say": "A good answer is not a guess. It is a fact the passage actually gave you. When a question asks why, hunt for the sentence that explains the reason. The passage is the crime scene and the answer is the fingerprint.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐙",
                  "title": "The clue in the text",
                  "body": "An octopus's main heart stops beating when it swims.",
                  "color": "#5a4a8a"
                },
                {
                  "emoji": "🔎",
                  "title": "The conclusion",
                  "body": "So crawling is safer and easier for it.",
                  "color": "#2e7d5b"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: use the clue",
            "body": "The passage says an octopus's main heart stops beating when it swims. Based on that, why might an octopus prefer crawling?",
            "say": "The passage says an octopus's main heart stops beating when it swims. Based on that, why might an octopus prefer crawling?",
            "widget": {
              "w": "tapPick",
              "prompt": "Why might an octopus prefer crawling to swimming?",
              "options": [
                {
                  "label": "Its main heart stops when it swims, so crawling is safer.",
                  "correct": true
                },
                {
                  "label": "Octopuses cannot swim at all."
                },
                {
                  "label": "Crawling helps them change color faster."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Another detective case",
            "body": "A passage says: \"Sarah noticed kids had nowhere to buy cheap sneakers, so she started selling them.\" When did Sarah's business begin?",
            "reveal": [
              "Find the first thing that set it off: she noticed a need.",
              "The passage says nobody was serving that need.",
              "So her business began when she noticed a need nobody was serving."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Do not guess the answer, find it. The right choice is the one the passage backs up with an actual clue.",
            "emoji": "🔎",
            "takeaway": "Do not guess the answer, find it. The right choice is the one the passage backs up with an actual clue."
          }
        ]
      },
      {
        "id": "l.e6theme",
        "skillId": "e.6.theme",
        "subject": "english",
        "grade": 6,
        "title": "Theme: The Message Behind the Pattern",
        "subtitle": "What the whole story is trying to teach you.",
        "steps": [
          {
            "kind": "hook",
            "title": "Why the same thing keeps happening",
            "body": "In one novel, every character who lies ends up in a bigger and bigger mess. That is not an accident. The author is telling you something on purpose.",
            "say": "In one novel, every character who lies ends up in a bigger and bigger mess. That is not an accident. The author is telling you something on purpose."
          },
          {
            "kind": "concept",
            "title": "A theme is the lesson underneath",
            "body": "The theme is the author's message about life, like a lesson the whole story teaches. You find it by noticing what keeps happening, not one single event.",
            "analogy": "A pattern is footprints in the snow. One footprint tells you nothing, but a whole trail shows you exactly where the author is walking.",
            "say": "The theme is the author's message about life, like a lesson the whole story teaches. You find it by noticing what keeps happening, not one single event. A pattern is like footprints in the snow. One footprint tells you nothing, but a whole trail shows you where the author is walking.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐾",
                  "title": "The pattern",
                  "body": "Liars keep getting into worse trouble.",
                  "color": "#8a5a2a"
                },
                {
                  "emoji": "💡",
                  "title": "The theme",
                  "body": "Dishonesty creates growing consequences.",
                  "color": "#2e5b8a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Theme is not the topic",
            "body": "A topic is one word, like honesty or courage. A theme is a full sentence about it, like \"Dishonesty creates growing consequences.\"",
            "say": "Careful. A topic is one word, like honesty or courage. A theme is a full sentence about it, like dishonesty creates growing consequences."
          },
          {
            "kind": "try",
            "title": "Your turn: name the theme",
            "body": "A girl fails her first three skateboard competitions but keeps practicing and finally lands her trick. What is the theme?",
            "say": "A girl fails her first three skateboard competitions but keeps practicing and finally lands her trick. What is the theme?",
            "widget": {
              "w": "tapPick",
              "prompt": "What is the theme of the skateboard story?",
              "options": [
                {
                  "label": "Perseverance pays off.",
                  "correct": true
                },
                {
                  "label": "Skateboarding is dangerous."
                },
                {
                  "label": "Competitions are unfair to beginners."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "How to build a theme",
            "body": "Trace the pattern in the skateboard story.",
            "reveal": [
              "She fails, again and again. That is the pattern of setbacks.",
              "She keeps practicing instead of quitting.",
              "She finally succeeds, so the message is that perseverance pays off."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Follow the pattern of what keeps happening, then say it as a full sentence lesson about life. That is the theme.",
            "emoji": "🐾",
            "takeaway": "Follow the pattern of what keeps happening, then say it as a full-sentence lesson about life. That is the theme."
          }
        ]
      },
      {
        "id": "l.e6vocab",
        "skillId": "e.6.vocab",
        "subject": "english",
        "grade": 6,
        "title": "Context Clues: Let the Sentence Tell You",
        "subtitle": "How to figure out a hard word without a dictionary.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word you don't know yet",
            "body": "You read: \"The library was a SANCTUARY for Amir, quiet, safe, and completely his.\" You may not know sanctuary, but the sentence just handed you the answer.",
            "say": "You read: the library was a sanctuary for Amir, quiet, safe, and completely his. You may not know the word sanctuary, but the sentence just handed you the answer."
          },
          {
            "kind": "concept",
            "title": "The nearby words are clues",
            "body": "Context clues are the words around a hard word that hint at its meaning. Good writers often place the clue right next to the mystery word.",
            "analogy": "A hard word is a stranger at a party. You learn who they are by looking at the friends standing next to them.",
            "say": "Context clues are the words around a hard word that hint at its meaning. Good writers often place the clue right next to the mystery word. A hard word is like a stranger at a party. You learn who they are by looking at the friends standing next to them.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❓",
                  "title": "Mystery word",
                  "body": "sanctuary",
                  "color": "#7a5aa0"
                },
                {
                  "emoji": "🧩",
                  "title": "The clues beside it",
                  "body": "quiet, safe, completely his",
                  "color": "#2e7d5b"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: use the clues",
            "body": "The library was a SANCTUARY for Amir, quiet, safe, and completely his. Sanctuary means…",
            "say": "The library was a sanctuary for Amir, quiet, safe, and completely his. What does sanctuary mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Sanctuary means…",
              "options": [
                {
                  "label": "a place of safety and peace",
                  "correct": true
                },
                {
                  "label": "a loud and crowded place"
                },
                {
                  "label": "a place where you pay for books"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Walking through the clues",
            "body": "Gather the clue words and see where they point.",
            "reveal": [
              "The words nearby are quiet, safe, and completely his.",
              "All three point to a calm, protected place of his own.",
              "So sanctuary means a place of safety and peace."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Before you reach for a dictionary, read the words around the hard word. They usually give the meaning away.",
            "emoji": "🧩",
            "takeaway": "Before you reach for a dictionary, read the words around the hard word. They usually give the meaning away."
          }
        ]
      },
      {
        "id": "l.e6commas",
        "skillId": "e.6.commas",
        "subject": "english",
        "grade": 6,
        "title": "Apostrophes and Talking on Paper",
        "subtitle": "Where the little marks go, and why it matters.",
        "steps": [
          {
            "kind": "hook",
            "title": "Whose bowls?",
            "body": "You write \"the dogs bowls were empty.\" One dog? Three dogs? A tiny mark decides. Punctuation is how the reader knows exactly what you mean.",
            "say": "You write the dogs bowls were empty. One dog, or three dogs? A tiny mark decides."
          },
          {
            "kind": "concept",
            "title": "The apostrophe is an ownership tag",
            "body": "An apostrophe shows something belongs to someone. Put it right after the owner. If the owner is ONE dog, write dog's. If the owners are MANY dogs, the s is already there, so the apostrophe goes after it: dogs'.",
            "analogy": "Think of the apostrophe as a hook you clip onto the owner. Clip it after whoever owns the thing, then add the s only if it is not already there.",
            "say": "For one dog, write dog, apostrophe, s. For many dogs, the s is already there, so put the apostrophe after it: dogs, apostrophe.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐕",
                  "title": "One owner",
                  "body": "the dog's bowl (apostrophe, then s)"
                },
                {
                  "emoji": "🐕",
                  "title": "Many owners",
                  "body": "the dogs' bowls (s already there, apostrophe after)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Punctuation lives inside the quotes",
            "body": "When a character speaks, wrap their exact words in quotation marks. The period, question mark, or exclamation point that belongs to what they said goes INSIDE the closing quote.",
            "say": "The exclamation point belongs to what Marco shouted, so it goes inside the closing quotation mark.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✅",
                  "title": "Correct",
                  "body": "\"Watch out!\" shouted Marco."
                },
                {
                  "emoji": "❌",
                  "title": "Wrong",
                  "body": "\"Watch out\"! shouted Marco."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: fix the bowls",
            "body": "Three dogs share the empty bowls. Where does the apostrophe go?",
            "say": "Three dogs own the bowls. The s is already there, so the apostrophe goes after it. Which one is right?",
            "widget": {
              "w": "tapPick",
              "prompt": "The three ___ bowls were empty.",
              "options": [
                {
                  "label": "dog's bowls"
                },
                {
                  "label": "dogs' bowls",
                  "correct": true
                },
                {
                  "label": "dogs bowls'"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Reading a line of dialogue",
            "body": "How do you punctuate Marco shouting a warning?",
            "reveal": [
              "His exact words go in quotation marks: \"Watch out\".",
              "The exclamation point belongs to what he shouted, so it goes inside: \"Watch out!\"",
              "Then tell who spoke: \"Watch out!\" shouted Marco."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Clip the apostrophe after the owner: one dog's, many dogs'. And the speaker's punctuation stays inside the quotes.",
            "emoji": "🖊️",
            "takeaway": "Clip the apostrophe right after the owner: one dog's, many dogs'. And a speaker's punctuation stays inside the quotes."
          }
        ]
      },
      {
        "id": "l.e7evidence",
        "skillId": "e.7.evidence",
        "subject": "english",
        "grade": 7,
        "title": "Reading Between the Lines",
        "subtitle": "What the clues prove, and what they only seem to prove.",
        "steps": [
          {
            "kind": "hook",
            "title": "The torn pages",
            "body": "A lab notebook's last entry is dated the day before the fire. Every page after is blank, but three pages have been torn out. Nobody told you what happened. Yet you already suspect something.",
            "say": "A lab notebook's last entry is the day before a fire. The rest is blank, but three pages were torn out. What do you suspect?"
          },
          {
            "kind": "concept",
            "title": "An inference is evidence plus reasoning",
            "body": "You don't just repeat what the text says. You add what you already know and draw a careful conclusion the clues support.",
            "analogy": "Fresh footprints in the snow. You never saw the person, but you can tell someone just walked by. That is an inference.",
            "say": "Footprints in the snow. You never saw the person, but you can tell someone walked by. That is an inference: the clue plus your reasoning.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👣",
                  "title": "The clue",
                  "body": "Torn pages, dated near the fire"
                },
                {
                  "emoji": "🔍",
                  "title": "The inference",
                  "body": "Someone removed evidence written near that time"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The trap: together is not the same as caused",
            "body": "Two things can rise at the same time without one causing the other. Ice cream sales and swimming accidents both climb in July. Ice cream is not drowning anyone. A hidden third thing, hot summer weather, drives both.",
            "say": "Ice cream sales and swimming accidents both rise in July. Ice cream is not the cause. Hot summer weather drives both. Correlation is not causation.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🍦",
                  "title": "Correlation",
                  "body": "Two things rise together"
                },
                {
                  "emoji": "☀️",
                  "title": "The real cause",
                  "body": "A hidden factor moves both"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the hidden cause",
            "body": "A town notices that when ice cream sales go up, swimming accidents go up too. What is really going on?",
            "say": "Ice cream sales and swimming accidents rise together. What is really causing both?",
            "widget": {
              "w": "tapPick",
              "prompt": "Ice cream sales and swimming accidents rise together. Why?",
              "options": [
                {
                  "label": "Eating ice cream causes swimming accidents"
                },
                {
                  "label": "Hot summer weather makes both go up",
                  "correct": true
                },
                {
                  "label": "Swimming makes people crave ice cream"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Working the notebook clue",
            "body": "What can you safely infer from the torn pages?",
            "reveal": [
              "The last entry is dated the day before the fire, so someone was writing right up to that point.",
              "Blank pages alone would just mean the work stopped.",
              "But three pages were torn out, so someone deliberately removed evidence written near the time of the fire."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Infer from the clues plus your reasoning. And remember, two things happening together does not prove one caused the other.",
            "emoji": "🔍",
            "takeaway": "Infer from the clues plus your reasoning, but remember: two things happening together does not prove one caused the other."
          }
        ]
      },
      {
        "id": "l.e7clauses",
        "skillId": "e.7.clauses",
        "subject": "english",
        "grade": 7,
        "title": "Sentences That Flow",
        "subtitle": "Matching parts and joining ideas smoothly.",
        "steps": [
          {
            "kind": "hook",
            "title": "The sentence that trips",
            "body": "\"She loves hiking, to swim, and paint.\" Read it out loud. It stumbles. Nothing is misspelled, yet your ear knows something is off.",
            "say": "She loves hiking, to swim, and paint. Read it aloud. It stumbles, even though nothing is misspelled."
          },
          {
            "kind": "concept",
            "title": "Parallel structure: same job, same form",
            "body": "When you list things in a sentence, each item should wear the same grammatical form. All -ing words, or all plain verbs. Mixing forms breaks the rhythm.",
            "analogy": "Dancers in a line all doing the same step. If one throws in a different move, the whole line looks broken. Words in a list should match like that.",
            "say": "Dancers in a line all do the same step. Words in a list should match too. Hiking, swimming, and painting. All the same form.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❌",
                  "title": "Not parallel",
                  "body": "hiking, to swim, and paint"
                },
                {
                  "emoji": "✅",
                  "title": "Parallel",
                  "body": "hiking, swimming, and painting"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Joining two ideas into one",
            "body": "Two short sentences can clash: \"The lab was closed. We needed the microscope.\" A word like although links the clash into a single smooth sentence and shows the tension between them.",
            "say": "Although the lab was closed, we needed the microscope. The word although links the two clashing ideas into one smooth sentence.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔹",
                  "title": "Two choppy bits",
                  "body": "The lab was closed. We needed the microscope."
                },
                {
                  "emoji": "🔗",
                  "title": "One smooth sentence",
                  "body": "Although the lab was closed, we needed the microscope."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: pick the parallel one",
            "body": "Only one of these lists matches all its parts. Tap it.",
            "say": "Which sentence keeps all its parts in the same form? Tap the parallel one.",
            "widget": {
              "w": "tapPick",
              "prompt": "Which sentence uses parallel structure correctly?",
              "options": [
                {
                  "label": "She loves hiking, swimming, and painting.",
                  "correct": true
                },
                {
                  "label": "She loves hiking, to swim, and painting."
                },
                {
                  "label": "She loves to hike, swimming, and paint."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Combining smoothly",
            "body": "How do you join \"The lab was closed.\" and \"We needed the microscope.\"?",
            "reveal": [
              "The two ideas clash: closed, but still needed.",
              "Start with a word that signals that clash: Although.",
              "Although the lab was closed, we needed the microscope."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Keep list items in the same form for parallel rhythm. Use words like although to join clashing ideas into one clean sentence.",
            "emoji": "🪢",
            "takeaway": "Keep list items in the same form for parallel rhythm, and use words like although to join clashing ideas into one clean sentence."
          }
        ]
      },
      {
        "id": "l.e7vocab",
        "skillId": "e.7.vocab",
        "subject": "english",
        "grade": 7,
        "title": "Cracking Big Words",
        "subtitle": "Use the sentence to unlock the meaning.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word you don't know",
            "body": "You hit the word disparate mid-sentence and freeze. Good news: you rarely need a dictionary. The sentence around it is quietly handing you clues.",
            "say": "You hit a word like disparate and freeze. But the sentence around it is quietly handing you clues."
          },
          {
            "kind": "concept",
            "title": "The sentence gives it away",
            "body": "Writers usually plant hints near a hard word: an example, a contrast, or a definition tucked right beside it. Read the whole sentence and ask what would make sense here.",
            "analogy": "It is like guessing what's in a wrapped gift by shaking the box and feeling the shape. You never open it, but the clues around it tell you plenty.",
            "say": "Disparate: one result showed growth, the other decay, so it means fundamentally different. Consensus: after two hours they finally agreed, so it means general agreement.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧪",
                  "title": "DISPARATE",
                  "body": "\"one showed growth, the other decay\" means fundamentally different"
                },
                {
                  "emoji": "🤝",
                  "title": "CONSENSUS",
                  "body": "\"after two hours they finally agreed\" means general agreement"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Two words worth owning",
            "body": "Disparate describes things that are distinctly unlike each other. Consensus is a general agreement a group reaches. Notice how each one's meaning was sitting right there in its sentence.",
            "say": "Disparate means fundamentally different. Consensus means general agreement across a group.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "↔️",
                  "title": "Disparate",
                  "body": "fundamentally different, not alike"
                },
                {
                  "emoji": "✅",
                  "title": "Consensus",
                  "body": "general agreement across a group"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: read the clues",
            "body": "\"The committee reached a consensus after two hours of discussion.\" What does consensus mean?",
            "say": "The committee reached a consensus after two hours. What does consensus mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Consensus means…",
              "options": [
                {
                  "label": "general agreement",
                  "correct": true
                },
                {
                  "label": "a long argument with no ending"
                },
                {
                  "label": "a single person's opinion"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Cracking disparate",
            "body": "\"The two lab results were disparate, one showed growth, the other decay.\"",
            "reveal": [
              "The sentence gives an example right after the word.",
              "One result grew, the other decayed, so those results are total opposites.",
              "Disparate must mean fundamentally different."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Don't panic at a big word. Mine the sentence for clues. Disparate means fundamentally different. Consensus means general agreement.",
            "emoji": "🔑",
            "takeaway": "Don't panic at a big word. Mine the sentence for clues. Disparate means fundamentally different; consensus means general agreement."
          }
        ]
      },
      {
        "id": "l.e8argument",
        "skillId": "e.8.argument",
        "subject": "english",
        "grade": 8,
        "title": "Spotting the Trick in an Argument",
        "subtitle": "Name the tactic and it loses its grip.",
        "steps": [
          {
            "kind": "hook",
            "title": "\"Everyone already has one\"",
            "body": "An ad says, \"Everyone at school already has one, don't be left out.\" It never tells you the product is good. It just makes you scared of being the odd one out.",
            "say": "An ad says, everyone at school already has one, don't be left out. It never says the product is good. It just makes you afraid of being left out."
          },
          {
            "kind": "concept",
            "title": "Persuaders use tactics. Name them.",
            "body": "Weak arguments lean on tricks instead of reasons. Two common ones: bandwagon pressures you to join the crowd, and straw man attacks a twisted version of what someone actually said.",
            "analogy": "It is like knowing how a magic trick works. Once you can name the move, the illusion stops fooling you.",
            "say": "Bandwagon pressures you to join the crowd. Straw man twists what someone said, then attacks the twisted version. Name the move and it stops fooling you.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚌",
                  "title": "Bandwagon",
                  "body": "\"Everyone's doing it, so should you.\""
                },
                {
                  "emoji": "🥤",
                  "title": "Straw Man",
                  "body": "Twist the person's view, then attack the fake version."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Straw man up close",
            "body": "\"My opponent wants to cut the arts budget. Clearly he hates creativity.\" Wanting to trim a budget is not the same as hating creativity. The speaker built a fake, easier target and knocked that down instead.",
            "say": "My opponent wants to cut the arts budget, so clearly he hates creativity. That twists his real position into a fake one that is easier to attack. That is a straw man."
          },
          {
            "kind": "try",
            "title": "Your turn: sort the tactics",
            "body": "Drag each statement into the trick it uses.",
            "say": "Sort each statement. Is it bandwagon, joining the crowd, or straw man, twisting what someone really said?",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "wagon",
                  "label": "Bandwagon"
                },
                {
                  "id": "straw",
                  "label": "Straw Man"
                }
              ],
              "items": [
                {
                  "label": "Everybody's buying these sneakers, so you should too.",
                  "bucket": "wagon"
                },
                {
                  "label": "All the popular kids already use this app.",
                  "bucket": "wagon"
                },
                {
                  "label": "She wants a later curfew, so clearly she wants total chaos.",
                  "bucket": "straw"
                },
                {
                  "label": "He voted to fund libraries? So he thinks we should waste money.",
                  "bucket": "straw"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Catching the straw man",
            "body": "\"My opponent wants to cut the arts budget. Clearly he hates creativity.\"",
            "reveal": [
              "His real position: spend less on the arts budget.",
              "The speaker swaps that for a fake, extreme version: he hates creativity.",
              "Then he attacks the fake version. That distortion is a straw man."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Bandwagon pushes you to follow the crowd. Straw man attacks a twisted version of the real point. Name the tactic and you take back control.",
            "emoji": "🎭",
            "takeaway": "Bandwagon pushes you to follow the crowd. Straw man attacks a twisted version of the real point. Name the tactic and you take back control."
          }
        ]
      },
      {
        "id": "l.e8voice",
        "skillId": "e.8.voice",
        "subject": "english",
        "grade": 8,
        "title": "Say It Straight: Active Voice & Economy",
        "subtitle": "Strong writing wastes no words, and knows when to hide the doer.",
        "steps": [
          {
            "kind": "hook",
            "title": "The text you actually send",
            "body": "You would never text a friend, \"The bus was missed by me.\" You text, \"I missed the bus.\" Fewer words, more punch. Good writing works the same way.",
            "say": "You would never text, the bus was missed by me. You text, I missed the bus. Fewer words, more punch."
          },
          {
            "kind": "concept",
            "title": "Active voice puts the doer first",
            "body": "In active voice, the doer acts: subject, then verb, then the rest. Passive voice flips it so the action happens TO the subject, and it usually costs extra words.",
            "analogy": "Active voice is a person throwing a ball. Passive voice is a ball being thrown by a person. Same event, but one lets you see who did it right away.",
            "say": "Active voice is a person throwing a ball. Passive voice is a ball being thrown by a person. Same event, but active shows the doer first.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🏃",
                  "title": "Active",
                  "body": "She sprinted home. (doer first, 3 words)",
                  "color": "#2e7d32"
                },
                {
                  "emoji": "🐌",
                  "title": "Passive",
                  "body": "Home was sprinted to by her. (doer buried, 6 words)",
                  "color": "#8d6e63"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "But passive has one real job",
            "body": "Sometimes you do not know the doer, or the doer does not matter. Then passive is the honest choice, because the action is the point.",
            "say": "Use passive when you do not know the doer, like my bike was stolen, or when the doer does not matter, like the samples were tested overnight.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚲",
                  "title": "Doer unknown",
                  "body": "My bike was stolen. (You have no idea who took it.)",
                  "color": "#1565c0"
                },
                {
                  "emoji": "💊",
                  "title": "Doer unimportant",
                  "body": "The samples were tested overnight. (Who tested them does not matter.)",
                  "color": "#6a1b9a"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: pick the tightest line",
            "body": "All three mean the same thing. Which one shows the best word economy, full picture in the fewest words?",
            "say": "All three mean the same thing. Which one shows the best word economy?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which shows the best word economy?",
              "options": [
                {
                  "label": "She sprinted home.",
                  "correct": true
                },
                {
                  "label": "In a hurry, she ran all the way back to her house."
                },
                {
                  "label": "Home was where she quickly ran to."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "When is passive actually better?",
            "body": "Look at this sentence: My bike was stolen.",
            "reveal": [
              "You do not know who stole it, so you cannot name a doer.",
              "The important part is what happened to the bike, not the thief.",
              "So passive voice is the right call here, because the action matters more than the actor."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Default to active voice and cut extra words. Reach for passive only when the doer is unknown or does not matter.",
            "emoji": "✂️",
            "takeaway": "Default to active voice and cut extra words: economy is power. Reach for passive only when the doer is unknown or does not matter."
          }
        ]
      },
      {
        "id": "l.e8reading",
        "skillId": "e.8.reading",
        "subject": "english",
        "grade": 8,
        "title": "Close Reading: Headlines Sell, Methods Tell",
        "subtitle": "How to read past a headline that is working you.",
        "steps": [
          {
            "kind": "hook",
            "title": "\"Chocolate makes you smarter?\"",
            "body": "A headline screams that chocolate boosts your brain. The actual study tested twelve people for one afternoon. The headline did not lie exactly, it just made a tiny result sound huge.",
            "say": "A headline screams that chocolate boosts your brain. The actual study tested twelve people for one afternoon. The headline made a tiny result sound huge."
          },
          {
            "kind": "concept",
            "title": "A headline is an ad, not the article",
            "body": "Headlines are written to win your click, so they stretch small or shaky findings into bold promises. The careful truth lives lower down, in how the study was actually done.",
            "analogy": "A headline is the movie trailer: all the explosions, none of the slow parts. To know what really happened, you have to watch the whole film, which is the methods.",
            "say": "A headline is the movie trailer, all explosions and no slow parts. To know what really happened, read the methods, which is the whole film.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📣",
                  "title": "Headline",
                  "body": "\"Chocolate Makes You Smarter!\"",
                  "color": "#c62828"
                },
                {
                  "emoji": "🔬",
                  "title": "The method",
                  "body": "12 people, one afternoon, small effect",
                  "color": "#2e7d32"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Two headlines, same study",
            "body": "Watch how the same finding gets sold two different ways. One exaggerates, one reports.",
            "say": "One headline exaggerates a weak finding to attract clicks. The other reports what the study actually found.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚨",
                  "title": "Headline A",
                  "body": "\"Chocolate Boosts Brainpower!\"",
                  "color": "#c62828"
                },
                {
                  "emoji": "📄",
                  "title": "Headline B",
                  "body": "\"Small Study Finds Minor Memory Effect\"",
                  "color": "#1565c0"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: spot the click-bait",
            "body": "Both headlines describe the exact same twelve-person study. What does the first one do that the second does not?",
            "say": "Both headlines describe the same twelve person study. What does the first one do that the second does not?",
            "widget": {
              "w": "tapPick",
              "prompt": "\"Chocolate Boosts Brainpower!\" vs. \"Small Study Finds Minor Memory Effect\"",
              "options": [
                {
                  "label": "Exaggerates a weak finding to attract clicks",
                  "correct": true
                },
                {
                  "label": "Reports the sample size honestly"
                },
                {
                  "label": "Adds new evidence the study did not have"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Headlines sell, methods tell. Read past the headline before you believe the promise.",
            "emoji": "🍫",
            "takeaway": "Headlines sell, methods tell. Read past the headline and ask how the study was actually done before you believe the promise."
          }
        ]
      },
      {
        "id": "l.e9literary",
        "skillId": "e.9.literary",
        "subject": "english",
        "grade": 9,
        "title": "Reading the Clues: Foreshadowing & Symbol",
        "subtitle": "Why a repeated detail is never an accident.",
        "steps": [
          {
            "kind": "hook",
            "title": "The drawer that keeps coming up",
            "body": "In the first chapter, the author mentions a locked drawer. Then again. Then a third time. Your gut says: that drawer is going to matter. Trust that gut.",
            "say": "In the first chapter, the author mentions a locked drawer. Then again. Then a third time. That drawer is going to matter."
          },
          {
            "kind": "concept",
            "title": "Repeated details are loaded guns",
            "body": "Writers choose every detail on purpose. When something keeps reappearing, the author is planting foreshadowing, a quiet hint that this thing will pay off later.",
            "analogy": "There is an old stage rule: if a gun is hanging on the wall in Act One, it must go off by Act Three. A detail the author keeps polishing is that gun.",
            "say": "There is an old stage rule. If a gun hangs on the wall in Act One, it must go off by Act Three. A detail the author keeps polishing is that gun.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔒",
                  "title": "Mentioned 3 times",
                  "body": "The locked drawer",
                  "color": "#5d4037"
                },
                {
                  "emoji": "💥",
                  "title": "Attentive reader thinks",
                  "body": "Foreshadowing: it will matter later",
                  "color": "#c62828"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Symbols: when an object means more",
            "body": "Sometimes a detail is not a hint about plot, it stands for a bigger idea. A story about restless teens opens: \"The town's only stoplight blinked yellow, as it had for fifty years.\"",
            "say": "A story about restless teens opens: the town's only stoplight blinked yellow, as it had for fifty years. That light stands for a town where nothing changes.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚦",
                  "title": "On the surface",
                  "body": "One yellow light, blinking for 50 years",
                  "color": "#f9a825"
                },
                {
                  "emoji": "🕰️",
                  "title": "What it stands for",
                  "body": "A town that is stuck, where nothing changes",
                  "color": "#455a64"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: read the stoplight",
            "body": "Fifty years, same yellow blink, the town's only light. What does the stoplight most likely symbolize?",
            "say": "Fifty years, same yellow blink. What does the stoplight most likely symbolize?",
            "widget": {
              "w": "tapPick",
              "prompt": "\"The town's only stoplight blinked yellow, as it had for fifty years.\" The stoplight most likely symbolizes...",
              "options": [
                {
                  "label": "The town's unchanging, stuck-in-time nature",
                  "correct": true
                },
                {
                  "label": "A dangerous, poorly maintained intersection"
                },
                {
                  "label": "The narrator's fear of driving"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A repeated detail is foreshadowing, a loaded gun. An object that carries a bigger idea is a symbol. Notice both.",
            "emoji": "🔍",
            "takeaway": "A detail the author keeps repeating is foreshadowing, a loaded gun. An ordinary object that carries a bigger idea is a symbol. Attentive readers notice both."
          }
        ]
      },
      {
        "id": "l.e9vocab",
        "skillId": "e.9.vocab",
        "subject": "english",
        "grade": 9,
        "title": "College-Bound Vocab: Perfunctory & Deliberate",
        "subtitle": "Two words about HOW something is done.",
        "steps": [
          {
            "kind": "hook",
            "title": "The \"good job\" that stung",
            "body": "The teacher said \"good job\" without even looking up from her desk. The whole class deflated. It was praise on paper, but there was clearly no care behind it.",
            "say": "The teacher said good job without even looking up. The whole class deflated. There was clearly no care behind it."
          },
          {
            "kind": "concept",
            "title": "Perfunctory: going through the motions",
            "body": "Perfunctory means done without care or enthusiasm, just to check a box. The action happens, but the heart is missing.",
            "analogy": "Perfunctory is a cashier saying \"have a nice day\" to the wall behind you. The words are there, the meaning is not.",
            "say": "Perfunctory means done without care or enthusiasm, just to check a box. It is a cashier saying have a nice day to the wall behind you.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "😐",
                  "title": "Perfunctory",
                  "body": "\"Good job.\" (said without looking up)",
                  "color": "#78909c"
                },
                {
                  "emoji": "🔥",
                  "title": "The opposite",
                  "body": "Heartfelt, careful, genuine",
                  "color": "#e65100"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Deliberate: slow on purpose",
            "body": "Different word, different flavor. When the committee moved at a deliberate pace, reporters got frustrated wanting instant answers. Deliberate means careful and unhurried, measured on purpose.",
            "say": "Deliberate means careful and unhurried, measured on purpose. The committee's deliberate pace frustrated reporters who wanted instant answers.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧭",
                  "title": "Deliberate",
                  "body": "Careful, unhurried, measured on purpose",
                  "color": "#1565c0"
                },
                {
                  "emoji": "⚡",
                  "title": "Not this",
                  "body": "Rushed, careless, snap decision",
                  "color": "#c62828"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: which word fits?",
            "body": "\"The teacher's ______ 'good job,' said without looking up, deflated the class.\" Which word means done without care or enthusiasm?",
            "say": "The teacher's blank good job, said without looking up, deflated the class. Which word means done without care or enthusiasm?",
            "widget": {
              "w": "tapPick",
              "prompt": "Perfunctory means...",
              "options": [
                {
                  "label": "done without care or enthusiasm",
                  "correct": true
                },
                {
                  "label": "careful and slow on purpose"
                },
                {
                  "label": "loud and full of excitement"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Perfunctory is going through the motions with no care. Deliberate is careful and unhurried, slow on purpose.",
            "emoji": "📚",
            "takeaway": "Perfunctory means going through the motions with no care. Deliberate means careful and unhurried, slow on purpose. Both describe HOW an action is done, in opposite spirits."
          }
        ]
      },
      {
        "id": "l.e10rhetoric",
        "skillId": "e.10.rhetoric",
        "subject": "english",
        "grade": 10,
        "title": "Rhetoric: How Words Win People Over",
        "subtitle": "Ethos, and the rhythm of contrast and repetition.",
        "steps": [
          {
            "kind": "hook",
            "title": "\"I've worked here 22 years\"",
            "body": "A nurse steps up to the microphone and opens with one line: \"I've worked in this hospital for 22 years.\" Before she argues anything, the room already leans in. Why?",
            "say": "A nurse opens with one line. I have worked in this hospital for twenty two years. Before she argues anything, the room already leans in. Why?"
          },
          {
            "kind": "concept",
            "title": "Ethos: earn trust first",
            "body": "Ethos is persuasion through credibility. Before people accept your point, they ask, why should I trust you? Naming your experience answers that in advance.",
            "analogy": "Ethos is showing your ID at the door. Twenty-two years on the job is a badge that says, I actually know this field, so listen.",
            "say": "Ethos is persuasion through credibility. It is like showing your ID at the door. Twenty two years on the job says, I know this field, so listen.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪪",
                  "title": "Ethos (credibility)",
                  "body": "\"I've worked here 22 years.\" Trust me, I know this.",
                  "color": "#1565c0"
                },
                {
                  "emoji": "❤️",
                  "title": "Not the same as",
                  "body": "Pathos: appealing to your emotions",
                  "color": "#c62828"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Contrast + repetition = an anthem",
            "body": "Listen to this rhythm: \"They told us to wait. We built. They told us to quit. We built.\" The repeated \"We built\" against their orders turns a point into a drumbeat of defiance.",
            "say": "They told us to wait. We built. They told us to quit. We built. The repeated we built turns a point into a drumbeat of defiance.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🗣️",
                  "title": "They told us...",
                  "body": "to wait / to quit (the pushback)",
                  "color": "#8d6e63"
                },
                {
                  "emoji": "🧱",
                  "title": "We built.",
                  "body": "Repeated, defiant, rhythmic",
                  "color": "#2e7d32"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the technique",
            "body": "\"They told us to wait. We built. They told us to quit. We built.\" Where does the persuasive power come from?",
            "say": "They told us to wait. We built. They told us to quit. We built. Where does the persuasive power come from?",
            "widget": {
              "w": "tapPick",
              "prompt": "The power of \"They told us to wait. We built. They told us to quit. We built.\" comes from...",
              "options": [
                {
                  "label": "Contrast + repetition creating rhythm and defiance",
                  "correct": true
                },
                {
                  "label": "Naming the speaker's years of experience"
                },
                {
                  "label": "Citing statistics and expert studies"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why that rhythm works",
            "body": "Break down the anthem line.",
            "reveal": [
              "The contrast sets \"they told us\" against \"we built\" so two sides face off.",
              "The repetition of \"We built\" hammers the same answer no matter the pressure.",
              "Parallel contrast turns an argument into an anthem, something a crowd can feel and chant."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Ethos wins trust by proving you know your field. Contrast plus repetition turns a plain argument into an anthem.",
            "emoji": "📢",
            "takeaway": "Ethos wins trust by proving you know your field. Contrast plus repetition builds rhythm and defiance, turning a plain argument into an anthem."
          }
        ]
      },
      {
        "id": "l.e10vocab",
        "skillId": "e.10.vocab",
        "subject": "english",
        "grade": 10,
        "title": "Words That Do a Job",
        "subtitle": "Pragmatic and exemplary, decoded.",
        "steps": [
          {
            "kind": "hook",
            "title": "The group project",
            "body": "Your team has one weekend to finish. One person wants the dream version with fireworks. One person just asks, what can we actually build by Sunday? Two moods, two words.",
            "say": "Your team has one weekend. One person wants the dream version. One person asks what you can actually finish. Two moods, two words."
          },
          {
            "kind": "concept",
            "title": "Pragmatic vs. idealistic",
            "body": "Pragmatic means practical and realistic, focused on what actually works. Its opposite is idealistic, focused on the perfect version in your head.",
            "analogy": "Idealistic draws the dream house. Pragmatic checks the budget and builds the one you can afford this year.",
            "say": "Pragmatic means practical and realistic, focused on what actually works. Idealistic means the perfect version in your head.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🏗️",
                  "title": "PRAGMATIC",
                  "body": "What actually works. Realistic compromises.",
                  "color": "#2f855a"
                },
                {
                  "emoji": "☁️",
                  "title": "IDEALISTIC",
                  "body": "The perfect version, even if it can't happen.",
                  "color": "#805ad5"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Exemplary sets the standard",
            "body": "Exemplary means so excellent it serves as an example. Think of the one lab notebook the teacher photocopies and says, do it like this.",
            "say": "Exemplary means so excellent it serves as an example. It sets the standard everyone else copies.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⭐",
                  "title": "EXEMPLARY",
                  "body": "So good it becomes the model.",
                  "color": "#b7791f"
                },
                {
                  "emoji": "📄",
                  "title": "ORDINARY",
                  "body": "Fine, but nobody copies it.",
                  "color": "#718096"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The negotiation required PRAGMATIC compromises rather than idealistic demands. What does pragmatic mean here?",
            "say": "The negotiation required pragmatic compromises rather than idealistic demands. What does pragmatic mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Pragmatic means…",
              "options": [
                {
                  "label": "practical and realistic",
                  "correct": true
                },
                {
                  "label": "stubborn and angry"
                },
                {
                  "label": "perfect and flawless"
                },
                {
                  "label": "secret and hidden"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Reading a hard word from its sentence",
            "body": "Her exemplary lab notebook became the model shown to every new student. What is exemplary?",
            "reveal": [
              "The notebook is shown to every new student, so it is being held up as a standard.",
              "A thing held up as the standard is one others should copy.",
              "Exemplary means so excellent it serves as an example."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Pragmatic asks what actually works. Exemplary is so good it becomes the example.",
            "emoji": "⭐",
            "takeaway": "Pragmatic asks what actually works. Exemplary is so good it becomes the example. Let the sentence show you the meaning."
          }
        ]
      },
      {
        "id": "l.e10reading",
        "skillId": "e.10.reading",
        "subject": "english",
        "grade": 10,
        "title": "Reading What the Author Is Doing",
        "subtitle": "Rhetoric is a move, not just a message.",
        "steps": [
          {
            "kind": "hook",
            "title": "The judo flip",
            "body": "In judo you don't block the shove, you grab it and use the force against the pusher. Good writers do this with objections. They take the argument against them and swing it into the argument for them.",
            "say": "In judo you don't block the shove, you use its force against the pusher. Good writers do the same thing with objections."
          },
          {
            "kind": "concept",
            "title": "Turning an objection into a justification",
            "body": "When Kennedy says we go to the Moon not because it is easy but because it is hard, he takes the strongest complaint, it's too hard, and makes it the reason to try.",
            "analogy": "The objection is a punch thrown at him. Instead of dodging, he catches it and points it back as his best reason.",
            "say": "Kennedy takes the strongest complaint, it's too hard, and makes it the reason to try. He transforms an objection into a justification.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥊",
                  "title": "THE OBJECTION",
                  "body": "\"It's too hard.\"",
                  "color": "#c53030"
                },
                {
                  "emoji": "🌙",
                  "title": "THE FLIP",
                  "body": "\"Hard is exactly why we should.\"",
                  "color": "#2b6cb0"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Science as checking, not a stack of facts",
            "body": "When failed replications come out, a careful writer doesn't call science broken. They reframe it: the checking that caught the error IS science working.",
            "analogy": "A smoke alarm going off is not the house failing. It is the safety system doing its job.",
            "say": "Failed replications are not science failing. The checking that catches errors is science self-correcting. That reframe is the whole move."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Kennedy frames the difficulty of the goal as the very reason to attempt it. This rhetorical move works by…",
            "say": "Kennedy frames the difficulty as the reason to attempt the goal. How does this rhetorical move work?",
            "widget": {
              "w": "tapPick",
              "prompt": "How does the move work?",
              "options": [
                {
                  "label": "transforming an objection into a justification",
                  "correct": true
                },
                {
                  "label": "hiding the difficulty from the audience"
                },
                {
                  "label": "proving the goal is actually easy"
                },
                {
                  "label": "changing the subject to avoid the problem"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Spotting the reframe",
            "body": "A researcher calls failed replications evidence of science working. Why?",
            "reveal": [
              "A failed replication means someone re-tested a claim and it didn't hold up.",
              "Re-testing and catching weak claims is exactly what science is supposed to do.",
              "So the failure is really evidence of science's self-correcting process, not proof it is broken."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Watch what the author does, not just what they say. The sharpest move catches the objection and turns it into the reason.",
            "emoji": "🥋",
            "takeaway": "Watch what the author DOES, not just what they say. The sharpest move is judo: catch the objection and swing it into your reason."
          }
        ]
      },
      {
        "id": "l.e11analysis",
        "skillId": "e.11.analysis",
        "subject": "english",
        "grade": 11,
        "title": "Juxtaposition: Meaning From Contrast",
        "subtitle": "Two things, side by side, on purpose.",
        "steps": [
          {
            "kind": "hook",
            "title": "The photo that says everything",
            "body": "A photographer shoots a diamond necklace resting on a cracked, dirty hand. Nobody writes a caption. The two things touching each other already make the point.",
            "say": "A photographer shoots a diamond necklace on a cracked, dirty hand. No caption needed. The two things touching already make the point."
          },
          {
            "kind": "concept",
            "title": "Juxtapose means place side by side for contrast",
            "body": "When an author juxtaposes two things, they set them right next to each other so the difference does the talking. The meaning lives in the gap between them.",
            "analogy": "Put a candle next to the Sun and the candle looks tiny. You didn't shrink the candle, the contrast did.",
            "say": "To juxtapose is to place two things side by side for contrast, so the difference does the talking.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💎",
                  "title": "CHANDELIERS",
                  "body": "Crystal dripping, pure opulence.",
                  "color": "#b7791f"
                },
                {
                  "emoji": "📱",
                  "title": "GUESTS, BORED",
                  "body": "Checking phones, unmoved.",
                  "color": "#718096"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "What the contrast argues",
            "body": "Chandeliers dripping crystal over guests who checked their phones, bored. The riches sit right beside the apathy, and that closeness makes a claim: wealth does not guarantee fulfillment.",
            "say": "Opulence sits right beside boredom. That closeness argues that wealth does not guarantee fulfillment."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "An author places a lavish wedding feast right beside a famine outside the gates. The juxtaposition most suggests…",
            "say": "An author places a lavish wedding feast beside a famine outside the gates. What does the juxtaposition suggest?",
            "widget": {
              "w": "tapPick",
              "prompt": "The contrast suggests…",
              "options": [
                {
                  "label": "the indifference of the rich to the suffering nearby",
                  "correct": true
                },
                {
                  "label": "that weddings are usually expensive"
                },
                {
                  "label": "that the famine will soon end"
                },
                {
                  "label": "that the author enjoys describing food"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "How to read any juxtaposition",
            "body": "Feast inside, famine outside. What is the author doing?",
            "reveal": [
              "Name the two things placed side by side: plenty inside, starvation outside.",
              "Ask what feeling the contrast forces: excess feels ugly next to need.",
              "State the point the proximity makes: it critiques indifference to nearby suffering."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Juxtaposition means side by side for contrast. The meaning lives in the gap between the two things.",
            "emoji": "💎",
            "takeaway": "Juxtaposition means side by side for contrast. When an author sets two opposites touching, the meaning is in the gap between them."
          }
        ]
      },
      {
        "id": "l.e11satvocab",
        "skillId": "e.11.satvocab",
        "subject": "english",
        "grade": 11,
        "title": "SAT Words: Laconic and Redacted",
        "subtitle": "Few words, and words removed.",
        "steps": [
          {
            "kind": "hook",
            "title": "The one-word answer",
            "body": "You ask your friend how the huge interview went. They text back one word: \"Fine.\" That single word tells you the person is done talking. That style has a name.",
            "say": "You ask how the big interview went. Your friend texts back one word, Fine. That style has a name."
          },
          {
            "kind": "concept",
            "title": "Laconic means using very few words",
            "body": "Laconic describes speech that is brief to the point of bluntness. A laconic person says the minimum and stops.",
            "analogy": "Most people answer in paragraphs. A laconic person answers in a single dry word, like a text with the read receipt already off.",
            "say": "Laconic means using very few words, brief to the point of bluntness.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🗿",
                  "title": "LACONIC",
                  "body": "\"Fine.\" End of interview.",
                  "color": "#2b6cb0"
                },
                {
                  "emoji": "💬",
                  "title": "TALKATIVE",
                  "body": "Three paragraphs about their day.",
                  "color": "#dd6b20"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Redacted means content removed before release",
            "body": "A redacted document has parts edited out, often blacked out, to hide sensitive information before anyone reads it.",
            "analogy": "Picture a leaked report with fat black bars over the names. Someone censored it on purpose before it went public.",
            "say": "Redacted means edited to remove sensitive content, often blacked out, before the document is released.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🖊️",
                  "title": "REDACTED",
                  "body": "Paragraphs blacked out before release.",
                  "color": "#1a202c"
                },
                {
                  "emoji": "📖",
                  "title": "UNREDACTED",
                  "body": "The full text, nothing hidden.",
                  "color": "#2f855a"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The CIA report was heavily REDACTED, with entire paragraphs blacked out. Redacted means…",
            "say": "The CIA report was heavily redacted, entire paragraphs blacked out. What does redacted mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Redacted means…",
              "options": [
                {
                  "label": "edited to remove sensitive content",
                  "correct": true
                },
                {
                  "label": "written using very few words"
                },
                {
                  "label": "printed in large quantities"
                },
                {
                  "label": "translated into another language"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Let the sentence give you the clue",
            "body": "His laconic reply, \"Fine,\" ended the interview. What is laconic?",
            "reveal": [
              "The reply is one word, Fine, and it ends the whole interview.",
              "One word that shuts a conversation down is extremely brief.",
              "So laconic means using very few words, blunt and short."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Laconic is few words, like a one word text. Redacted is words removed, like black bars over a document.",
            "emoji": "🖊️",
            "takeaway": "Laconic is few words, like a one-word text. Redacted is words removed, like black bars over a document. Short versus hidden."
          }
        ]
      },
      {
        "id": "l.e12synthesis",
        "skillId": "e.12.synthesis",
        "subject": "english",
        "grade": 12,
        "title": "Building an Argument From Sources",
        "subtitle": "Weigh, then build.",
        "steps": [
          {
            "kind": "hook",
            "title": "Three witnesses, one case",
            "body": "You are arguing about the newest phone chip. Three voices show up: a 2024 peer-reviewed study, a 1998 textbook, and a viral post. They can't all carry the same weight.",
            "say": "You are arguing about the newest phone chip. Three sources show up. They can't all carry the same weight."
          },
          {
            "kind": "concept",
            "title": "Weigh sources by date, rigor, and fit",
            "body": "For a claim about current technology, the 2024 peer-reviewed study leads because it is recent and vetted. The 1998 textbook still gives solid background. The viral post gets dropped, no vetting, no reliability.",
            "analogy": "You are casting roles. The study is your lead witness, the textbook is the background narrator, and the viral post never makes the cut.",
            "say": "Lead with the 2024 study because it is recent and vetted. Use the textbook for background. Drop the viral post.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔬",
                  "title": "2024 STUDY",
                  "body": "Recent and vetted. Lead witness.",
                  "color": "#2f855a"
                },
                {
                  "emoji": "📚",
                  "title": "1998 TEXTBOOK",
                  "body": "Dated but solid. Background.",
                  "color": "#b7791f"
                },
                {
                  "emoji": "📱",
                  "title": "VIRAL POST",
                  "body": "Unvetted. Drop it.",
                  "color": "#c53030"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Qualifiers make a claim stronger",
            "body": "Phrases like in most cases and the evidence suggests are not weak hedging. They match the claim to exactly how much you can prove, so a skeptic can't knock it over with one exception.",
            "analogy": "A qualifier is like fitting a claim to its true size. Say all instead of most and one counterexample topples you. Say most and you still stand.",
            "say": "Qualifiers like in most cases match the claim to exactly what the evidence supports, so one exception can't topple it."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Qualifiers such as \"in most cases\" and \"the evidence suggests\" make an academic claim…",
            "say": "Qualifiers such as in most cases and the evidence suggests make an academic claim what?",
            "widget": {
              "w": "tapPick",
              "prompt": "Qualifiers make a claim…",
              "options": [
                {
                  "label": "more defensible and precise",
                  "correct": true
                },
                {
                  "label": "weaker and less honest"
                },
                {
                  "label": "longer but meaningless"
                },
                {
                  "label": "impossible to disagree with"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Ordering the three sources",
            "body": "How should you build the argument about current tech?",
            "reveal": [
              "Rank by date, rigor, and fit: the 2024 peer-reviewed study wins on all three.",
              "Lead with that study, then use the 1998 textbook only for background context.",
              "Drop the viral post entirely, since nothing verifies it, then phrase your claim with a qualifier so it stays defensible."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Weigh sources by date, rigor, and fit, then build. Lead with the strongest and let qualifiers size your claim to the evidence.",
            "emoji": "🔬",
            "takeaway": "Weigh sources by date, rigor, and fit before you build. Lead with the strongest, and let qualifiers size your claim to the evidence."
          }
        ]
      },
      {
        "id": "l.e12style",
        "skillId": "e.12.style",
        "subject": "english",
        "grade": 12,
        "title": "Style: Precision Over Habit",
        "subtitle": "Two moves that separate polished prose from lazy prose.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word that trips up scientists",
            "body": "A researcher writes \"the data suggests a link.\" Her editor circles it in red. She is a genius in the lab, but this one word gives her away every time. Which word, and why?",
            "say": "A researcher writes the data suggests a link. Her editor circles one word in red. Which word gives her away?"
          },
          {
            "kind": "concept",
            "title": "Data is a plural, like scissors",
            "body": "In formal writing, \"data\" is traditionally plural. One fact is a datum; many facts are data. So it takes a plural verb: the data suggest, not the data suggests.",
            "analogy": "Think of \"data\" like \"scissors\" or \"people.\" You would never say the scissors is sharp or the people is loud. Data works the same way in careful prose.",
            "say": "In formal writing, data is traditionally plural. One fact is a datum. Many facts are data. So the data suggest, not the data suggests. Think of it like scissors or people.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "1️⃣",
                  "title": "Datum",
                  "body": "One single fact. Singular.",
                  "color": "#c7d2fe"
                },
                {
                  "emoji": "🔢",
                  "title": "Data",
                  "body": "Many facts. \"The data suggest.\"",
                  "color": "#a7f3d0"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Know your reader",
            "body": "Usage is shifting, and in casual writing many people treat data as singular. But in a formal paper, a lab report, or an academic journal, the plural is expected. Match the room you are writing for.",
            "say": "Usage is shifting. In casual writing, data as singular is common. But in formal papers, the plural is still expected. Match your reader."
          },
          {
            "kind": "try",
            "title": "Your turn: formal writing",
            "body": "You are writing a formal research paper. Which sentence follows the traditional rule?",
            "say": "You are writing a formal research paper. Which sentence follows the traditional rule?",
            "widget": {
              "w": "tapPick",
              "prompt": "Choose the formally correct sentence.",
              "options": [
                {
                  "label": "The data suggest a clear trend.",
                  "correct": true
                },
                {
                  "label": "The data suggests a clear trend."
                },
                {
                  "label": "The datas suggest a clear trend."
                }
              ]
            }
          },
          {
            "kind": "concept",
            "title": "\"Omit needless words\" is not \"omit words\"",
            "body": "Strunk's famous rule does not mean strip out all detail or make everything short. It means every word that stays must earn its place. Cut the dead weight, keep what carries meaning.",
            "analogy": "It is like packing a backpack for a long hike. You do not leave the water and the map behind to travel light. You leave the extra phone charger and the third pair of jeans. Concision serves the journey, it does not starve it.",
            "say": "Omit needless words does not mean strip out all detail. It means every word that stays must earn its place. Like packing a backpack, you drop the dead weight, not the water and the map.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❌",
                  "title": "Misreading",
                  "body": "Strip all detail, make it tiny."
                },
                {
                  "emoji": "✅",
                  "title": "The real rule",
                  "body": "Every remaining word must earn its place."
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Cutting the dead weight",
            "body": "Watch how concision sharpens a sentence without gutting it.",
            "reveal": [
              "Wordy: \"Due to the fact that it was raining, we made the decision to postpone.\"",
              "\"Due to the fact that\" is four words doing one word's job: replace it with \"Because.\"",
              "\"Made the decision to\" is padding: replace it with \"decided.\"",
              "Tight: \"Because it was raining, we decided to postpone.\" Same meaning, no wasted words."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "In formal writing, data is plural. The data suggest. And omitting needless words means every word earns its place, not cutting meaning to be short.",
            "emoji": "✂️",
            "takeaway": "In formal writing, data is plural: the data suggest. And concision means every word earns its place, not that you cut meaning to be short."
          }
        ]
      }
    ],
    "science": [
      {
        "id": "l.sksenses",
        "skillId": "s.k.senses",
        "subject": "science",
        "grade": 0,
        "title": "Your Five Senses",
        "subtitle": "How your body learns about the world.",
        "steps": [
          {
            "kind": "hook",
            "title": "Soup on the stove",
            "body": "Grandma's soup is bubbling on the stove in the other room. You cannot see it yet, but you already know it is dinner. How?",
            "say": "Grandma's soup is bubbling in the other room. You cannot see it yet, but you already know it is there. How?"
          },
          {
            "kind": "concept",
            "title": "Five senses, five tools",
            "body": "Your body has five helpers that tell you about the world. Eyes see, ears hear, a nose smells, a tongue tastes, and skin feels.",
            "analogy": "Your senses are like five little scouts. Each one runs out, finds something, and reports back to you.",
            "say": "You have five helpers. Eyes see, ears hear, a nose smells, a tongue tastes, and skin feels.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👁️",
                  "title": "Eyes",
                  "body": "See colors and shapes"
                },
                {
                  "emoji": "👃",
                  "title": "Nose",
                  "body": "Smells things in the air"
                },
                {
                  "emoji": "👂",
                  "title": "Ears",
                  "body": "Hear sounds"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The soup, solved",
            "body": "The warm soup sends its smell floating through the air. Your nose catches it first, even before your eyes can see the pot.",
            "say": "The warm soup sends its smell floating through the air, and your nose catches it first.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🍲",
                  "title": "The smell floats",
                  "body": "It drifts through the air"
                },
                {
                  "emoji": "👃",
                  "title": "Your nose catches it",
                  "body": "Smell tells you: dinner"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the red apple",
            "body": "You find a shiny red apple. Which sense tells you that it is red?",
            "say": "You find a shiny red apple. Which sense tells you it is red?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which sense tells you the apple is red?",
              "options": [
                {
                  "label": "Sight, with your eyes",
                  "correct": true
                },
                {
                  "label": "Smell, with your nose"
                },
                {
                  "label": "Hearing, with your ears"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Each sense has its own job. Your nose smells, and your eyes see colors.",
            "emoji": "👃",
            "takeaway": "Each sense has its own job. Your nose smells, and your eyes see colors like red."
          }
        ]
      },
      {
        "id": "l.skanimals",
        "skillId": "s.k.animals",
        "subject": "science",
        "grade": 0,
        "title": "Animal Friends",
        "subtitle": "Every animal has a clever trick.",
        "steps": [
          {
            "kind": "hook",
            "title": "The animal with a house on its back",
            "body": "Imagine carrying your whole house wherever you go. One little animal really does this, and it never gets lost.",
            "say": "Imagine carrying your whole house wherever you go. One little animal really does that."
          },
          {
            "kind": "concept",
            "title": "Animals have special bodies",
            "body": "Animals are built to live their own way. A snail wears its shell like a home, and a spider spins a web to catch bugs.",
            "analogy": "A snail's shell is like a backpack tent. Home goes wherever the snail goes.",
            "say": "A snail wears its shell like a home, and a spider spins a web to catch bugs.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐌",
                  "title": "Snail",
                  "body": "Carries its shell home"
                },
                {
                  "emoji": "🕷️",
                  "title": "Spider",
                  "body": "Spins a web to catch food"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: who spins a web?",
            "body": "One animal builds a silky web to catch flying bugs for food. Which one?",
            "say": "One animal builds a silky web to catch flying bugs. Which one?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which animal builds a web to catch food?",
              "options": [
                {
                  "label": "A spider",
                  "correct": true
                },
                {
                  "label": "A snail"
                },
                {
                  "label": "A fish"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A snail carries its shell home. A spider spins a web to catch food.",
            "emoji": "🐌",
            "takeaway": "A snail carries its shell home on its back. A spider spins a web to catch its food."
          }
        ]
      },
      {
        "id": "l.skweather",
        "skillId": "s.k.weather",
        "subject": "science",
        "grade": 0,
        "title": "Weather Watch",
        "subtitle": "The sun and the seasons.",
        "steps": [
          {
            "kind": "hook",
            "title": "Step into the sunshine",
            "body": "Walk out of the shade into the sunshine. Your face feels bright, and it also feels something else. Warm.",
            "say": "Walk out of the shade into the sunshine. Your face feels bright, and it also feels warm."
          },
          {
            "kind": "concept",
            "title": "The sun gives two gifts",
            "body": "The sun does two big jobs. It gives us light so we can see, and it gives us warmth that heats the whole planet.",
            "analogy": "The sun is like a giant lamp and a giant heater in one. It lights up the day and warms it up too.",
            "say": "The sun gives us light so we can see, and warmth that heats the whole planet.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💡",
                  "title": "Light",
                  "body": "So we can see"
                },
                {
                  "emoji": "🔥",
                  "title": "Warmth",
                  "body": "Heats the whole planet"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The seasons take turns",
            "body": "The year has four seasons that always come in the same order. After cold winter comes spring, when flowers start to bloom.",
            "say": "After cold winter comes spring, when flowers start to bloom.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❄️",
                  "title": "Winter",
                  "body": "Cold comes first"
                },
                {
                  "emoji": "🌷",
                  "title": "Spring",
                  "body": "Flowers bloom next"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: what comes after winter?",
            "body": "Winter is cold. Which season comes next, when flowers start to bloom?",
            "say": "Winter is cold. Which season comes next, when flowers bloom?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which season comes after winter?",
              "options": [
                {
                  "label": "Spring",
                  "correct": true
                },
                {
                  "label": "Fall"
                },
                {
                  "label": "Winter again"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The sun gives light and warmth. After winter comes spring.",
            "emoji": "☀️",
            "takeaway": "The sun gives light and warmth. After winter comes spring, when flowers wake up."
          }
        ]
      },
      {
        "id": "l.s1plants",
        "skillId": "s.1.plants",
        "subject": "science",
        "grade": 1,
        "title": "How Plants Grow",
        "subtitle": "What plants need, and how they change.",
        "steps": [
          {
            "kind": "hook",
            "title": "The bare tree",
            "body": "In fall, a tree drops every single leaf until its branches are bare. It looks like it might be gone for good. But it is only resting.",
            "say": "In fall, a tree drops every leaf until its branches are bare. But it is only resting."
          },
          {
            "kind": "concept",
            "title": "Spring wakes the tree up",
            "body": "When spring warmth arrives, the tree wakes up. Tiny buds swell on the branches and burst open into fresh new leaves.",
            "analogy": "Winter is like a long nap for the tree. Spring is the warm morning that wakes it, and new buds and leaves are it stretching awake.",
            "say": "When spring warmth arrives, tiny buds burst open into fresh new leaves.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌳",
                  "title": "Fall",
                  "body": "Leaves drop, branches go bare"
                },
                {
                  "emoji": "🌸",
                  "title": "Spring",
                  "body": "New buds and leaves grow back"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Plants need care to live",
            "body": "A plant is a living thing, so it needs water. Forget to water a bean plant for two weeks and it droops and dries out.",
            "say": "A plant needs water. With no water for two weeks, it droops and dries out.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌱",
                  "title": "With water",
                  "body": "Stands up green and strong"
                },
                {
                  "emoji": "🥀",
                  "title": "No water",
                  "body": "Droops and dries out"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: what grows back?",
            "body": "A tree lost all its leaves in fall. When spring comes, what grows back on the branches?",
            "say": "A tree lost its leaves in fall. When spring comes, what grows back?",
            "widget": {
              "w": "tapPick",
              "prompt": "What grows back on the tree in spring?",
              "options": [
                {
                  "label": "New leaves and buds",
                  "correct": true
                },
                {
                  "label": "Nothing, it stays bare"
                },
                {
                  "label": "Snow and ice"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Spring wakes a tree with new leaves. And every plant needs water to live.",
            "emoji": "🌸",
            "takeaway": "Spring warmth wakes a tree, and new buds and leaves grow back. And every plant needs water, or it droops and dries out."
          }
        ]
      },
      {
        "id": "l.s1animals1",
        "skillId": "s.1.animals1",
        "subject": "science",
        "grade": 1,
        "title": "Animal Homes and Bodies",
        "subtitle": "Bodies built for the job.",
        "steps": [
          {
            "kind": "hook",
            "title": "Breathing underwater",
            "body": "You have to hold your breath underwater. A fish never does. It swims all day and breathes the whole time. What is its secret?",
            "say": "You hold your breath underwater, but a fish never does. What is its secret?"
          },
          {
            "kind": "concept",
            "title": "Gills are a fish's breathing tool",
            "body": "A fish has gills on the sides of its head. Water flows through the gills, and the gills pull oxygen out of the water so the fish can breathe.",
            "analogy": "Gills are like a strainer that catches the good part. Water passes through, and the gills keep the oxygen the fish needs.",
            "say": "A fish has gills that pull oxygen out of the water so it can breathe.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐟",
                  "title": "Fish gills",
                  "body": "Take oxygen from water"
                },
                {
                  "emoji": "👦",
                  "title": "Your lungs",
                  "body": "Take oxygen from air"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Bodies built for the home",
            "body": "Each animal's body is built for how it lives. A mole lives underground, so it has wide, shovel-like paws made for digging tunnels.",
            "say": "A mole lives underground, so it has wide shovel-like paws made for digging.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐟",
                  "title": "Fish",
                  "body": "Gills for breathing in water"
                },
                {
                  "emoji": "🐾",
                  "title": "Mole",
                  "body": "Shovel paws for digging"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the best digger",
            "body": "One animal has wide, shovel-shaped paws that are perfect for digging tunnels underground. Which one?",
            "say": "One animal has shovel-shaped paws perfect for digging tunnels. Which one?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which animal is best built to dig tunnels underground?",
              "options": [
                {
                  "label": "A mole",
                  "correct": true
                },
                {
                  "label": "A fish"
                },
                {
                  "label": "A bird"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A fish uses gills to take oxygen from water. A mole uses shovel paws to dig.",
            "emoji": "🐟",
            "takeaway": "A fish uses gills to take in oxygen from water. A mole uses shovel paws to dig its tunnel home. Bodies are built for the job."
          }
        ]
      },
      {
        "id": "l.matter",
        "skillId": "s.2.matter",
        "subject": "science",
        "grade": 2,
        "title": "Solid, Liquid, Gas",
        "subtitle": "The three states of everything, explained by a dance.",
        "steps": [
          {
            "kind": "hook",
            "title": "Same water, three faces",
            "body": "Ice, a puddle, and steam are all the SAME water. So what makes them look so different? The secret is how the tiny bits inside are moving.",
            "say": "Ice, water, and steam are all the same stuff. What changes is how the tiny bits move."
          },
          {
            "kind": "concept",
            "title": "It is all about the dance",
            "body": "Everything is made of tiny particles. In a SOLID they are packed tight and barely wiggle. In a LIQUID they slide past each other. In a GAS they zoom apart and fly everywhere.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧊",
                  "title": "Solid",
                  "body": "Packed tight, holds its shape."
                },
                {
                  "emoji": "💧",
                  "title": "Liquid",
                  "body": "Slides around, takes the cup's shape."
                },
                {
                  "emoji": "💨",
                  "title": "Gas",
                  "body": "Flies apart, fills the whole room."
                }
              ]
            },
            "analogy": "Solid is a crowded elevator. Liquid is a busy hallway. Gas is kids let loose at recess.",
            "say": "In a solid the particles barely move. In a liquid they slide. In a gas they fly apart."
          },
          {
            "kind": "try",
            "title": "Your turn: sort them",
            "body": "Tap each thing, then drop it in the right state of matter.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "s",
                  "label": "🧊 Solid"
                },
                {
                  "id": "l",
                  "label": "💧 Liquid"
                },
                {
                  "id": "g",
                  "label": "💨 Gas"
                }
              ],
              "items": [
                {
                  "label": "a brick",
                  "bucket": "s"
                },
                {
                  "label": "juice",
                  "bucket": "l"
                },
                {
                  "label": "the air",
                  "bucket": "g"
                },
                {
                  "label": "an ice cube",
                  "bucket": "s"
                }
              ]
            },
            "say": "Sort each thing into solid, liquid, or gas."
          },
          {
            "kind": "recap",
            "emoji": "🔬",
            "title": "Remember this",
            "takeaway": "Add heat and the dance speeds up: solid melts to liquid, liquid boils to gas. Same stuff, faster particles.",
            "say": "Add heat and the particles move faster. Solid melts to liquid, liquid boils to gas."
          }
        ]
      },
      {
        "id": "l.s2habitats",
        "skillId": "s.2.habitats",
        "subject": "science",
        "grade": 2,
        "title": "Habitats: Every Animal Has a Home",
        "subtitle": "Every animal has a home that fits just right.",
        "steps": [
          {
            "kind": "hook",
            "title": "Every animal has a home",
            "body": "A fish lives in water. A bird builds a nest in a tree. A polar bear lives where it snows. Every animal has a special home with the food, water, and weather it needs. That special home is called a HABITAT.",
            "say": "A fish lives in water. A bird builds a nest in a tree. A polar bear lives where it snows. Every animal has a special home called a habitat."
          },
          {
            "kind": "concept",
            "title": "A habitat is a perfect-fit home",
            "body": "A habitat gives an animal or plant what it needs: the right water, food, and weather. A cactus is built to save water, so it grows best in a hot, dry desert.",
            "analogy": "A habitat is like the right shoe. A snow boot is great in snow and terrible at the beach. The habitat has to fit.",
            "say": "A habitat gives a living thing the water, food, and weather it needs. A cactus saves water, so it grows best in a hot, dry desert.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌵",
                  "title": "Cactus",
                  "body": "Saves water, loves a hot dry desert."
                },
                {
                  "emoji": "🐸",
                  "title": "Frog",
                  "body": "Needs water nearby, lives by ponds."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The animal that lives in two homes",
            "body": "A frog is special. It starts life as a tadpole swimming in water, then grows legs and hops onto land. Animals that live in water AND on land are called amphibians.",
            "say": "A frog starts as a tadpole in water, then hops onto land. Animals that live in water and on land are called amphibians.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌊",
                  "title": "In water",
                  "body": "Baby: a tadpole with a tail."
                },
                {
                  "emoji": "🌿",
                  "title": "On land",
                  "body": "Grown: a frog with legs."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the animal group",
            "body": "A frog can live in water and on land. What do we call animals like this?",
            "say": "A frog lives in water and on land. What do we call animals like this?",
            "widget": {
              "w": "tapPick",
              "prompt": "An animal that lives in water AND on land is a…",
              "options": [
                {
                  "label": "amphibian",
                  "correct": true
                },
                {
                  "label": "desert plant"
                },
                {
                  "label": "fish"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A habitat is a perfect fit home. Cactuses fit dry deserts, and frogs that live in water and on land are amphibians.",
            "emoji": "🌵",
            "takeaway": "A habitat is a perfect-fit home. Cactuses fit hot, dry deserts. Frogs live in water and land, so they are amphibians."
          }
        ]
      },
      {
        "id": "l.s3forces",
        "skillId": "s.3.forces",
        "subject": "science",
        "grade": 3,
        "title": "Forces: Heavy Things Need Bigger Pushes",
        "subtitle": "Why the loaded wagon fights back.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two wagons, one hill",
            "body": "You grab an empty wagon and push. It rolls easy. Then you pile it full of bricks and push again. Suddenly your legs burn and it barely moves. Same wagon, so what changed?",
            "say": "An empty wagon rolls easy. Load it with bricks and it barely moves. What changed?"
          },
          {
            "kind": "concept",
            "title": "More mass, more force",
            "body": "A force is a push or a pull. The more stuff something is made of, its mass, the more force you need to move it. Bricks add lots of mass, so the full wagon needs a bigger push.",
            "analogy": "It is like pushing a friend on a swing. One little kid, easy push. A grown-up on the swing, you have to shove much harder.",
            "say": "A force is a push or a pull. More mass needs more force. The wagon full of bricks needs a bigger push than the empty one.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🛒",
                  "title": "Empty wagon",
                  "body": "Little mass, small push moves it."
                },
                {
                  "emoji": "🧱",
                  "title": "Full of bricks",
                  "body": "Big mass, needs a bigger push."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: which needs more force?",
            "body": "You have two wagons. One is empty, one is packed with bricks. Which one needs MORE force to push?",
            "say": "One wagon is empty, one is full of bricks. Which needs more force to push?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which wagon needs MORE force to get moving?",
              "options": [
                {
                  "label": "the wagon full of bricks",
                  "correct": true
                },
                {
                  "label": "the empty wagon"
                },
                {
                  "label": "they need the exact same push"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Thinking it through",
            "body": "How do we know the full wagon wins?",
            "reveal": [
              "Bricks add mass, so the full wagon has more mass than the empty one.",
              "More mass always needs more force to move.",
              "So the full wagon needs the bigger push."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "More mass needs more force. Heavier things take bigger pushes to get moving.",
            "emoji": "🧱",
            "takeaway": "More mass needs more force. Heavier things take bigger pushes to get moving."
          }
        ]
      },
      {
        "id": "l.s3life",
        "skillId": "s.3.life",
        "subject": "science",
        "grade": 3,
        "title": "Metamorphosis: A Total Body Makeover",
        "subtitle": "How a caterpillar becomes a butterfly.",
        "steps": [
          {
            "kind": "hook",
            "title": "Same animal?",
            "body": "A fat, crawling caterpillar and a flying butterfly look like two totally different animals. But they are the same creature. One grew into the other.",
            "say": "A crawling caterpillar and a flying butterfly look completely different, but they are the same animal. One grew into the other."
          },
          {
            "kind": "concept",
            "title": "A big body change has a name",
            "body": "When an animal changes its whole body shape as it grows up, that is called metamorphosis. The caterpillar builds a chrysalis, and inside it rebuilds into a butterfly.",
            "analogy": "It is less like getting taller and more like a house being knocked down and rebuilt into something brand new on the same spot.",
            "say": "When an animal changes its whole body shape as it grows up, that is called metamorphosis. The caterpillar rebuilds inside a chrysalis and comes out a butterfly.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐛",
                  "title": "Caterpillar",
                  "body": "Crawls and eats leaves."
                },
                {
                  "emoji": "🛡️",
                  "title": "Chrysalis",
                  "body": "Rebuilds inside a hard case."
                },
                {
                  "emoji": "🦋",
                  "title": "Butterfly",
                  "body": "Flies and drinks nectar."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the change",
            "body": "A caterpillar changes into a butterfly. This big body change is called…",
            "say": "A caterpillar changes into a butterfly. This big body change is called what?",
            "widget": {
              "w": "tapPick",
              "prompt": "A caterpillar changing into a butterfly is called…",
              "options": [
                {
                  "label": "metamorphosis",
                  "correct": true
                },
                {
                  "label": "hibernation"
                },
                {
                  "label": "migration"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Metamorphosis is a total body makeover. A caterpillar rebuilds itself into a butterfly.",
            "emoji": "🦋",
            "takeaway": "Metamorphosis is a total body makeover. A caterpillar rebuilds itself into a butterfly."
          }
        ]
      },
      {
        "id": "l.daynight",
        "skillId": "s.4.space",
        "subject": "science",
        "grade": 4,
        "title": "Why We Have Day and Night",
        "subtitle": "The sun never actually \"goes down.\"",
        "steps": [
          {
            "kind": "hook",
            "title": "The sun did not move",
            "body": "It feels like the sun rises in the morning and sets at night. But here is the twist: the sun barely moves at all. WE are the ones spinning.",
            "say": "It feels like the sun rises and sets. But really, we are the ones spinning."
          },
          {
            "kind": "concept",
            "title": "Earth is a spinning ball",
            "body": "Earth turns all the way around once every 24 hours. When your side faces the sun, it is day. When your side spins away, it is night.",
            "analogy": "Stand and slowly spin near a lamp. Your face is lit, then dark, then lit again. You did not turn the lamp off, you turned away from it.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌞",
                  "title": "Facing the sun",
                  "body": "Your side of Earth: daytime."
                },
                {
                  "emoji": "🌙",
                  "title": "Spun away",
                  "body": "Your side of Earth: nighttime."
                }
              ]
            },
            "say": "Earth spins once every day. Facing the sun is daytime. Spun away is nighttime."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "It is nighttime where you are. What is Earth doing?",
            "widget": {
              "w": "tapPick",
              "prompt": "Why is it night?",
              "options": [
                {
                  "label": "The sun turned off"
                },
                {
                  "label": "Our side of Earth spun away from the sun",
                  "correct": true
                },
                {
                  "label": "The moon blocks the sun every night"
                }
              ]
            },
            "say": "Why is it night?"
          },
          {
            "kind": "recap",
            "emoji": "🌍",
            "title": "Remember this",
            "takeaway": "Day and night are not the sun moving. They are Earth spinning you toward the sun and then away from it.",
            "say": "Day and night are Earth spinning toward the sun and then away."
          }
        ]
      },
      {
        "id": "l.s4matter",
        "skillId": "s.4.matter",
        "subject": "science",
        "grade": 4,
        "title": "Matter & Energy: Changing and Moving",
        "subtitle": "How puddles disappear and how sound reaches your ears.",
        "steps": [
          {
            "kind": "hook",
            "title": "The vanishing puddle",
            "body": "You see a puddle on the sidewalk in the morning. By the afternoon sun, it is gone. Nobody drank it and nobody wiped it up. So where did the water go?",
            "say": "A puddle sits on the sidewalk in the morning, and by afternoon it is gone. Where did the water go?"
          },
          {
            "kind": "concept",
            "title": "Heat turns liquid into gas",
            "body": "The sun's heat turned the liquid water into an invisible gas called water vapor that floated into the air. When a liquid turns into a gas, we call that evaporation.",
            "analogy": "The water did not disappear. It turned into a gas and spread out into the air, like steam rising off a hot cup of cocoa.",
            "say": "The sun's heat turned the liquid water into an invisible gas called water vapor. When a liquid turns into a gas, that is evaporation.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💧",
                  "title": "Liquid",
                  "body": "Water you can see and pour."
                },
                {
                  "emoji": "☀️",
                  "title": "Add heat",
                  "body": "The sun warms the water."
                },
                {
                  "emoji": "💨",
                  "title": "Gas",
                  "body": "Becomes vapor, floats into the air."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Sound is a shaky ride",
            "body": "Energy moves too. When something makes a sound, it makes the air vibrate, meaning wiggle back and forth. Those wiggles travel through the air until they reach your ears.",
            "analogy": "It is like a bumper hit at one end of a line of dominoes. The wiggle passes along until it reaches you.",
            "say": "When something makes a sound, it makes the air vibrate, wiggling back and forth. Those wiggles travel through the air to your ears."
          },
          {
            "kind": "try",
            "title": "Your turn: finish the science",
            "body": "Fill in the missing word about evaporation.",
            "say": "Evaporation happens when a liquid turns into a what?",
            "widget": {
              "w": "tapPick",
              "prompt": "Evaporation happens when a liquid turns into a…",
              "options": [
                {
                  "label": "gas",
                  "correct": true
                },
                {
                  "label": "solid"
                },
                {
                  "label": "rock"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Heat makes liquid evaporate into a gas. Sound travels by making the air vibrate.",
            "emoji": "💨",
            "takeaway": "Heat makes liquid evaporate into a gas. Sound travels by making the air vibrate."
          }
        ]
      },
      {
        "id": "l.s5body",
        "skillId": "s.5.body",
        "subject": "science",
        "grade": 5,
        "title": "Your Amazing Body: Germs and Breath",
        "subtitle": "Why we wash our hands and what our lungs really do.",
        "steps": [
          {
            "kind": "hook",
            "title": "The invisible hitchhikers",
            "body": "You touch a doorknob, a phone, a railing. Tiny living things called germs are on those surfaces, way too small to see. If they get into your body, they can make you sick.",
            "say": "You touch doorknobs and phones covered in tiny germs, too small to see. If they get into your body, they can make you sick."
          },
          {
            "kind": "concept",
            "title": "Soap sweeps germs away",
            "body": "Before you eat, germs on your hands can hop onto your food and ride into your body. Washing with soap and water sweeps those germs down the drain first.",
            "analogy": "Soap is like a broom for your hands. It sweeps the invisible germs away before they can hitch a ride on your snack.",
            "say": "Before you eat, germs on your hands can hop onto your food. Washing with soap sweeps them away before they make you sick.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🦠",
                  "title": "Before washing",
                  "body": "Germs sit on your hands."
                },
                {
                  "emoji": "🧼",
                  "title": "After washing",
                  "body": "Soap sweeps them down the drain."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Every breath is a trade",
            "body": "Your lungs do a swap all day. They take in the oxygen your body needs from fresh air, and they push out carbon dioxide, the used-up gas your body is done with.",
            "analogy": "Your lungs are like a trading post: fresh oxygen in, old carbon dioxide out, on every single breath.",
            "say": "Your lungs take in the oxygen your body needs, and push out carbon dioxide, the used up gas. Fresh in, old out, every breath.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🫁",
                  "title": "Breathe in",
                  "body": "Take in oxygen you need."
                },
                {
                  "emoji": "💨",
                  "title": "Breathe out",
                  "body": "Push out carbon dioxide."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the lungs' job",
            "body": "What is the main job of your lungs?",
            "say": "What is the main job of your lungs?",
            "widget": {
              "w": "tapPick",
              "prompt": "Your lungs' job is to…",
              "options": [
                {
                  "label": "take in oxygen and push out carbon dioxide",
                  "correct": true
                },
                {
                  "label": "pump blood around your body"
                },
                {
                  "label": "break down the food you eat"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Wash your hands to sweep away germs. Your lungs take in oxygen and push out carbon dioxide.",
            "emoji": "🫁",
            "takeaway": "Wash your hands to sweep away germs before they make you sick. Your lungs take in oxygen and push out carbon dioxide."
          }
        ]
      },
      {
        "id": "l.s5ecosystems",
        "skillId": "s.5.ecosystems",
        "subject": "science",
        "grade": 5,
        "title": "Food Chains and Who Sits on Top",
        "subtitle": "How energy moves through an ecosystem, and where the hunters land.",
        "steps": [
          {
            "kind": "hook",
            "title": "Nobody eats the hawk",
            "body": "A hawk drops out of the sky and grabs a snake. That snake had just swallowed a mouse. The mouse had been nibbling seeds. Four living things, one line. Who is left standing at the end?",
            "say": "A hawk grabs a snake that ate a mouse that ate seeds. Who is left standing at the end?"
          },
          {
            "kind": "concept",
            "title": "A food chain is an energy relay",
            "body": "Energy starts in the plant and gets passed along each time something eats something else. Seeds go to mouse, mouse goes to snake, snake goes to hawk. Nothing hunts the hawk, so it sits at the top.",
            "analogy": "A food chain is a relay race with the baton being energy. The top predator is the last runner, the one nobody can catch.",
            "say": "Energy passes along the chain. The hawk is the last one, so it is the top predator.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌱",
                  "title": "Seeds",
                  "body": "Make their own food from sunlight."
                },
                {
                  "emoji": "🐭",
                  "title": "Mouse eats seeds",
                  "body": "Then a snake eats the mouse."
                },
                {
                  "emoji": "🦅",
                  "title": "Hawk",
                  "body": "Eats the snake. Nothing eats the hawk."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Some animals leave instead of starving",
            "body": "When winter kills the plants and freezes the ponds, some animals do not tough it out. Geese fly hundreds of miles south to where food and warmth still are. That seasonal trip is called migration.",
            "say": "Geese fly south for winter to find food and warmth. That seasonal travel is called migration.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪿",
                  "title": "Migration",
                  "body": "Traveling with the seasons for food and warmth."
                },
                {
                  "emoji": "❄️",
                  "title": "Why",
                  "body": "Winter takes the food away, so they follow it."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the top predator",
            "body": "In the chain seeds to mouse to snake to hawk, which animal is the top predator?",
            "say": "Which animal is the top predator in this food chain?",
            "widget": {
              "w": "tapPick",
              "prompt": "Who is the top predator in this food chain?",
              "options": [
                {
                  "label": "the mouse"
                },
                {
                  "label": "the snake"
                },
                {
                  "label": "the hawk",
                  "correct": true
                },
                {
                  "label": "the seeds"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The top predator sits at the end of the chain. Traveling with the seasons is migration.",
            "emoji": "🦅",
            "takeaway": "Energy travels up a food chain, and the top predator sits at the end where nothing hunts it. When winter takes the food, some animals migrate to follow it."
          }
        ]
      },
      {
        "id": "l.s6cells",
        "skillId": "s.6.cells",
        "subject": "science",
        "grade": 6,
        "title": "Cells: Life's LEGO Bricks",
        "subtitle": "Why living things are built from tiny cells, and what runs the show inside.",
        "steps": [
          {
            "kind": "hook",
            "title": "Why isn't a cell the size of a beach ball?",
            "body": "Every part of you is built from cells too small to see. It would seem easier to be made of a few giant ones. So why does nature keep them microscopic?",
            "say": "Every part of you is built from cells too small to see. Why does nature keep them so tiny?"
          },
          {
            "kind": "concept",
            "title": "Small means fast delivery",
            "body": "A cell has to pull food and oxygen in through its surface and push waste out. In a tiny cell every spot inside is close to the surface, so supplies arrive fast. In a huge cell the middle would starve waiting.",
            "analogy": "Think of a small studio apartment versus a warehouse. In the studio the fridge is three steps away. In the warehouse you would hike a mile for a snack.",
            "say": "In a tiny cell every part is close to the surface, so materials move in and out fast enough.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🟢",
                  "title": "Tiny cell",
                  "body": "Inside is close to the surface, supplies arrive fast."
                },
                {
                  "emoji": "🔴",
                  "title": "Giant cell",
                  "body": "The middle is too far from the surface, it starves."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The vault that holds the blueprints",
            "body": "Inside almost every cell is a rounded control center called the nucleus. It stores the cell's DNA, the instruction manual for building and running the whole cell.",
            "say": "The nucleus is the control center that stores the cell's DNA, its instruction manual.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧬",
                  "title": "DNA",
                  "body": "The instruction manual for the cell."
                },
                {
                  "emoji": "🔒",
                  "title": "Nucleus",
                  "body": "The vault that protects and holds the DNA."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: find the DNA's home",
            "body": "Which structure holds a cell's DNA, its instruction manual?",
            "say": "Which structure holds a cell's DNA?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which structure holds a cell's DNA?",
              "options": [
                {
                  "label": "the cell wall"
                },
                {
                  "label": "the nucleus",
                  "correct": true
                },
                {
                  "label": "the surface membrane"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Cells stay tiny for fast supply runs, and the nucleus holds the DNA.",
            "emoji": "🧬",
            "takeaway": "Cells stay tiny so materials cross the short distance in and out fast enough, and the nucleus guards the DNA like a vault of blueprints."
          }
        ]
      },
      {
        "id": "l.s6body",
        "skillId": "s.6.body",
        "subject": "science",
        "grade": 6,
        "title": "Human Body Systems",
        "subtitle": "How your bones hold you up and your muscles make you move.",
        "steps": [
          {
            "kind": "hook",
            "title": "What actually lifts your arm?",
            "body": "You decide to raise your hand, and it goes up. Nothing pushes it from below. So what did the work, and what did it pull on?",
            "say": "You raise your hand and it goes up. What did the work, and what did it pull on?"
          },
          {
            "kind": "concept",
            "title": "Muscles pull, they never push",
            "body": "A muscle moves a bone by contracting, which means getting shorter and tighter. That short muscle pulls the bone along. To let go, the muscle relaxes and lengthens again.",
            "analogy": "A muscle is like a tug-of-war rope. It can only pull the bone toward it, never shove it away. That is why muscles come in pairs.",
            "say": "A muscle moves a bone by contracting, getting shorter to pull it, then relaxing to let go.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💪",
                  "title": "Contract",
                  "body": "Muscle shortens and pulls the bone."
                },
                {
                  "emoji": "🫳",
                  "title": "Relax",
                  "body": "Muscle lengthens and lets the bone return."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The frame those muscles pull on",
            "body": "Muscles need something firm to pull against. Your bones and the joints where they meet form the skeletal system, the frame that supports you and shields organs like your heart and brain.",
            "say": "Bones and joints form the skeletal system, which supports you and protects your organs.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🦴",
                  "title": "Skeletal system",
                  "body": "Bones and joints that support and protect you."
                },
                {
                  "emoji": "🧠",
                  "title": "Protection",
                  "body": "The skull guards the brain, ribs guard the heart and lungs."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: how do muscles move bones?",
            "body": "Muscles move your bones by doing what?",
            "say": "Muscles move your bones by doing what?",
            "widget": {
              "w": "tapPick",
              "prompt": "Muscles move your bones by...",
              "options": [
                {
                  "label": "contracting and relaxing",
                  "correct": true
                },
                {
                  "label": "blowing air into them"
                },
                {
                  "label": "turning into bone"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Muscles pull bones by contracting and relaxing. Bones and joints make the skeletal system.",
            "emoji": "💪",
            "takeaway": "Muscles move bones by contracting to pull and relaxing to let go, all working against the frame of the skeletal system."
          }
        ]
      },
      {
        "id": "l.s7chemistry",
        "skillId": "s.7.chemistry",
        "subject": "science",
        "grade": 7,
        "title": "Chemistry Basics",
        "subtitle": "How to read a chemical formula, and the rule no reaction can break.",
        "steps": [
          {
            "kind": "hook",
            "title": "What does the little 2 mean?",
            "body": "Water is written H2O, with a small 2 tucked after the H. That tiny number is not decoration. It is telling you exactly how the molecule is built.",
            "say": "Water is written H two O. That small two after the H is telling you how the molecule is built."
          },
          {
            "kind": "concept",
            "title": "The little number counts atoms",
            "body": "In a formula, the small number after a letter tells how many of that atom you have. In H2O the 2 goes with the H, so there are two hydrogen atoms, plus one oxygen. Two hydrogen and one oxygen make one water molecule.",
            "analogy": "A formula is a recipe card. H2O means two scoops of hydrogen and one scoop of oxygen. Change the count and you change the whole dish.",
            "say": "The small number counts atoms. In H two O the two means two hydrogen atoms, plus one oxygen.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔵",
                  "title": "H2",
                  "body": "Two hydrogen atoms."
                },
                {
                  "emoji": "🔴",
                  "title": "O",
                  "body": "One oxygen atom."
                },
                {
                  "emoji": "💧",
                  "title": "H2O",
                  "body": "Together they make one water molecule."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Nothing disappears in a reaction",
            "body": "When chemicals react, atoms just get rearranged into new combinations. None are created and none are destroyed, so the total mass before equals the total mass after. This is conservation of mass.",
            "say": "In a reaction atoms only rearrange. None are lost, so the total mass stays the same.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⚖️",
                  "title": "Before",
                  "body": "All the atoms, some total mass."
                },
                {
                  "emoji": "⚖️",
                  "title": "After",
                  "body": "Same atoms rearranged, exact same mass."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: read the formula",
            "body": "In H2O, the small number 2 means there are two atoms of what?",
            "say": "In H two O, the two means two atoms of what?",
            "widget": {
              "w": "tapPick",
              "prompt": "In H2O, the 2 means two atoms of...",
              "options": [
                {
                  "label": "oxygen"
                },
                {
                  "label": "hydrogen",
                  "correct": true
                },
                {
                  "label": "water"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Checking conservation of mass",
            "body": "Two hydrogen molecules react with one oxygen molecule to make water. Does mass change?",
            "reveal": [
              "Count the atoms before: four hydrogen atoms and two oxygen atoms.",
              "After the reaction you get two water molecules, still four hydrogen and two oxygen atoms.",
              "Same atoms, just rearranged, so the total mass stays exactly the same."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The little number counts atoms. In a reaction mass is conserved, nothing is lost.",
            "emoji": "⚖️",
            "takeaway": "The small number in a formula counts atoms, so H2O has two hydrogen. And in any reaction atoms only rearrange, so the total mass stays the same."
          }
        ]
      },
      {
        "id": "l.s7earth",
        "skillId": "s.7.earth",
        "subject": "science",
        "grade": 7,
        "title": "Earth Science",
        "subtitle": "The journey of a water drop, and why the ground suddenly shakes.",
        "steps": [
          {
            "kind": "hook",
            "title": "The same water, over and over",
            "body": "The rain hitting your window has fallen before, maybe on dinosaurs. Earth keeps recycling the same water in a loop that never stops. What are the steps of that loop?",
            "say": "The rain on your window has fallen before, maybe on dinosaurs. Earth recycles the same water in a loop."
          },
          {
            "kind": "concept",
            "title": "The water cycle in four moves",
            "body": "The sun heats water into invisible vapor, that is evaporation. High up it cools into cloud droplets, that is condensation. The clouds get heavy and drop rain or snow, that is precipitation. Then it gathers in rivers and oceans, that is collection.",
            "analogy": "It is like a pot of soup with a lid. Steam rises, beads on the cold lid, then drips back down. Earth does the same thing on a giant scale.",
            "say": "Evaporation, then condensation, then precipitation, then collection. The step after condensation is precipitation.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "☀️",
                  "title": "Evaporation",
                  "body": "Sun turns water into vapor."
                },
                {
                  "emoji": "☁️",
                  "title": "Condensation",
                  "body": "Vapor cools into clouds."
                },
                {
                  "emoji": "🌧️",
                  "title": "Precipitation",
                  "body": "Clouds drop rain or snow."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why the ground lurches",
            "body": "Earth's crust is broken into giant slabs called tectonic plates. Along cracks called faults they grind against each other, but friction snags them. Stress builds until they suddenly slip, and that lurch is an earthquake.",
            "say": "Tectonic plates get stuck along faults. Stress builds until they suddenly slip past each other, and that is an earthquake.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧱",
                  "title": "Stress builds",
                  "body": "Plates are stuck by friction along a fault."
                },
                {
                  "emoji": "⚡",
                  "title": "Sudden slip",
                  "body": "They lurch past each other and the ground shakes."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: fill the missing step",
            "body": "The water cycle goes evaporation, condensation, then what, then collection?",
            "say": "Evaporation, condensation, then what, then collection?",
            "widget": {
              "w": "tapPick",
              "prompt": "Evaporation, condensation, ___, collection",
              "options": [
                {
                  "label": "precipitation (rain or snow)",
                  "correct": true
                },
                {
                  "label": "evaporation again"
                },
                {
                  "label": "an earthquake"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "After condensation comes precipitation. Earthquakes come from plates suddenly slipping.",
            "emoji": "🌧️",
            "takeaway": "The water cycle runs evaporation, condensation, precipitation, collection. And most earthquakes happen when stuck tectonic plates suddenly slip past each other."
          }
        ]
      },
      {
        "id": "l.s8physics",
        "skillId": "s.8.physics",
        "subject": "science",
        "grade": 8,
        "title": "Every Push Pushes Back",
        "subtitle": "Newton's 3rd Law, and the machines that use it.",
        "steps": [
          {
            "kind": "hook",
            "title": "How does a swimmer move?",
            "body": "A swimmer's hands shove the water backward, behind them. Yet the swimmer shoots forward. The water is behind them, so what is pushing them ahead?",
            "say": "A swimmer pushes water backward, but moves forward. What pushes them ahead?"
          },
          {
            "kind": "concept",
            "title": "Forces come in pairs",
            "body": "Newton's Third Law says every push comes with an equal push back the other way. Push the water backward, and the water pushes you forward just as hard.",
            "analogy": "It is like pushing off a wall on a skateboard. You push the wall, the wall pushes you, and you roll away.",
            "say": "Every push has an equal push back. Push the water backward, and the water pushes you forward just as hard.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🖐️",
                  "title": "Action",
                  "body": "Swimmer pushes water BACKWARD."
                },
                {
                  "emoji": "🏊",
                  "title": "Reaction",
                  "body": "Water pushes swimmer FORWARD, just as hard."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "A machine that trades force",
            "body": "A lever, like a seesaw, is a simple machine. Push down far from the pivot and you can lift a heavy load on the short side with much less force.",
            "analogy": "That is how a small kid can lift a bigger kid on a seesaw by sitting farther out.",
            "say": "A lever lets you move a heavy load with less force. That is how a small kid lifts a bigger one on a seesaw.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧒",
                  "title": "Little force, long side",
                  "body": "You push down far from the middle."
                },
                {
                  "emoji": "🪨",
                  "title": "Big load, short side",
                  "body": "The heavy load lifts with less effort."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the rocket",
            "body": "A rocket shoots hot gas straight DOWN out of its engine. Which way does the rocket go?",
            "say": "A rocket pushes gas down. Which way does the rocket move?",
            "widget": {
              "w": "tapPick",
              "prompt": "Gas pushes down. The rocket moves…",
              "options": [
                {
                  "label": "Down, the same way as the gas"
                },
                {
                  "label": "Up, the equal and opposite reaction",
                  "correct": true
                },
                {
                  "label": "It stays still"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Every push has an equal push back. Push water back, you go forward.",
            "emoji": "🏊",
            "takeaway": "Every action has an equal and opposite reaction. Push water back, you go forward. A lever trades a small force over a long side for a big lift on the short side."
          }
        ]
      },
      {
        "id": "l.s8waves",
        "skillId": "s.8.waves",
        "subject": "science",
        "grade": 8,
        "title": "Counting Waves: Frequency",
        "subtitle": "Why some sounds are high and some are low.",
        "steps": [
          {
            "kind": "hook",
            "title": "High voice, low voice",
            "body": "A tiny bird chirps a high squeaky note. A big truck rumbles a low deep note. Both are sound waves, so what makes one high and one low?",
            "say": "A bird chirps high, a truck rumbles low. Both are sound waves. What makes the difference?"
          },
          {
            "kind": "concept",
            "title": "Count the waves per second",
            "body": "Frequency is how many waves pass a point each second. Squeeze the waves close together and more pass by each second, so the frequency is higher.",
            "analogy": "It is like fence posts flying past a train window. Posts packed close means more fly by each second, the same way tight waves mean higher frequency.",
            "say": "Frequency is how many waves pass a point each second. More waves per second means higher frequency.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔊",
                  "title": "High frequency",
                  "body": "Many waves per second = high pitch, bluer light."
                },
                {
                  "emoji": "🔉",
                  "title": "Low frequency",
                  "body": "Few waves per second = low pitch, redder light."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: name the trait",
            "body": "A scientist counts how many waves go past a buoy every second. That number has a name.",
            "say": "The number of waves passing a point each second is the wave's what?",
            "widget": {
              "w": "tapPick",
              "prompt": "The number of waves passing a point each second is the wave's…",
              "options": [
                {
                  "label": "frequency",
                  "correct": true
                },
                {
                  "label": "color"
                },
                {
                  "label": "speed"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Frequency is how many waves pass each second. Higher frequency, higher pitch, bluer light.",
            "emoji": "🌈",
            "takeaway": "Frequency is how many waves pass each second. Higher frequency means higher pitch in sound and bluer color in light."
          }
        ]
      },
      {
        "id": "l.s9biology",
        "skillId": "s.9.biology",
        "subject": "science",
        "grade": 9,
        "title": "You Are a Genetic Remix",
        "subtitle": "Where your traits really come from.",
        "steps": [
          {
            "kind": "hook",
            "title": "Mom's eyes, Dad's smile",
            "body": "People say you have your mom's eyes and your dad's smile. That is not just a saying. It is written in your cells.",
            "say": "People say you have your mom's eyes and your dad's smile. That is written in your cells."
          },
          {
            "kind": "concept",
            "title": "One set from each parent",
            "body": "You get one set of chromosomes from your mother and one set from your father. Half of your DNA comes from each parent, mixed together into one new person.",
            "analogy": "It is like making a playlist by pulling half the songs from your mom's library and half from your dad's. The mix is nobody else's, it is yours.",
            "say": "You get one set of chromosomes from each parent. Half of your DNA comes from your mother and half from your father.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👩",
                  "title": "From mother",
                  "body": "One set of chromosomes, half your DNA."
                },
                {
                  "emoji": "👨",
                  "title": "From father",
                  "body": "One set of chromosomes, half your DNA."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: why the mix matters",
            "body": "Offspring get one set of chromosomes from each parent. Because of that mixing, they…",
            "say": "Offspring get one set of chromosomes from each parent. Because of that, they do what?",
            "widget": {
              "w": "tapPick",
              "prompt": "Getting one set from each parent means offspring…",
              "options": [
                {
                  "label": "share traits with both parents",
                  "correct": true
                },
                {
                  "label": "look exactly like the mother only"
                },
                {
                  "label": "have no traits from either parent"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Half your DNA comes from each parent, so you share traits with both. That mix is you.",
            "emoji": "🧬",
            "takeaway": "Half your DNA comes from each parent. Mixing two sets makes a unique combination that shares traits with both. That mix is you."
          }
        ]
      },
      {
        "id": "l.s9chem",
        "skillId": "s.9.chem",
        "subject": "science",
        "grade": 9,
        "title": "The Periodic Table Is a Family Tree",
        "subtitle": "Why columns matter, and where atoms go.",
        "steps": [
          {
            "kind": "hook",
            "title": "A grid, not a random pile",
            "body": "The periodic table looks like a messy grid of boxes. But the layout is a code, and the columns hold a big secret.",
            "say": "The periodic table looks like a messy grid, but the columns hold a secret."
          },
          {
            "kind": "concept",
            "title": "Same column, same behavior",
            "body": "Elements in the same column are called a group. They tend to react in similar ways, because they have the same number of outer electrons.",
            "analogy": "A column is like a family. Family members act alike because they were raised the same way, and grouped elements behave alike because their outer electrons match.",
            "say": "Elements in the same column are a group. They react in similar ways because their outer electrons match.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👪",
                  "title": "A column = a group",
                  "body": "Same outer electrons, similar reactions."
                },
                {
                  "emoji": "🧪",
                  "title": "Example",
                  "body": "Sodium and potassium sit together and both react hard with water."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "In a reaction, nothing vanishes",
            "body": "When atoms react, they only get rearranged into new combinations. No atom is created and none is destroyed, so the total mass stays exactly the same.",
            "analogy": "It is like snapping LEGO bricks into a new shape. Same bricks, new build, nothing added or thrown away.",
            "say": "In a reaction, atoms are only rearranged. None are created or destroyed, so the mass stays the same.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧱",
                  "title": "Before",
                  "body": "The same atoms, in one arrangement."
                },
                {
                  "emoji": "⚖️",
                  "title": "After",
                  "body": "Same atoms rearranged, same total mass."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: what happens to atoms?",
            "body": "You burn wood and it turns to ash and gas. What happened to the atoms?",
            "say": "In a chemical reaction, what happens to the atoms?",
            "widget": {
              "w": "tapPick",
              "prompt": "In a chemical reaction, atoms are…",
              "options": [
                {
                  "label": "rearranged, never created or destroyed",
                  "correct": true
                },
                {
                  "label": "destroyed, so mass disappears"
                },
                {
                  "label": "created out of nothing"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Same column, same family, react alike. Atoms are only rearranged, never created or destroyed.",
            "emoji": "👪",
            "takeaway": "Same column means same chemical family, so they react alike. And in any reaction atoms are just rearranged, never created or destroyed, so mass stays the same."
          }
        ]
      },
      {
        "id": "l.s10chem2",
        "skillId": "s.10.chem2",
        "subject": "science",
        "grade": 10,
        "title": "Catalysts: The Reaction Coach",
        "subtitle": "How to speed up a reaction without using anything up.",
        "steps": [
          {
            "kind": "hook",
            "title": "The reaction that won't hurry",
            "body": "Some reactions crawl along too slowly to be useful. Your body needs to break down food in seconds, not days. How does it speed things up?",
            "say": "Some reactions are too slow to be useful. How does your body speed them up?"
          },
          {
            "kind": "concept",
            "title": "A helper that stays behind",
            "body": "A catalyst speeds up a reaction by lowering the energy needed to get it going. It helps every step, but it is not used up, so at the end it is unchanged.",
            "analogy": "A catalyst is like a coach at a game. The coach makes the team play faster and better, but the coach never gets used up or leaves the field.",
            "say": "A catalyst speeds up a reaction by lowering the energy needed. It is not used up, so at the end it is unchanged.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐢",
                  "title": "Without catalyst",
                  "body": "High energy needed, slow reaction."
                },
                {
                  "emoji": "🏃",
                  "title": "With catalyst",
                  "body": "Less energy needed, fast reaction, coach unchanged."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the catalyst's job",
            "body": "An enzyme in your gut helps break down food fast, then is ready to help again. What is a catalyst's job?",
            "say": "What is a catalyst's job in a reaction?",
            "widget": {
              "w": "tapPick",
              "prompt": "A catalyst's job in a reaction is to…",
              "options": [
                {
                  "label": "speed it up without being used up",
                  "correct": true
                },
                {
                  "label": "slow it down and get consumed"
                },
                {
                  "label": "become part of the final product"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why the coach is never gone",
            "body": "Follow what a catalyst does from start to finish.",
            "reveal": [
              "The reaction is slow because it needs a lot of energy to start.",
              "The catalyst lowers that energy, so the reaction goes faster.",
              "The catalyst is released again at the end, unchanged and ready to help the next batch."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A catalyst speeds up a reaction by lowering the energy needed, and it comes out unchanged, never used up.",
            "emoji": "🧑‍🔬",
            "takeaway": "A catalyst is a reaction coach. It speeds things up by lowering the energy needed, and it comes out unchanged at the end, never used up."
          }
        ]
      },
      {
        "id": "l.s10evolution",
        "skillId": "s.10.evolution",
        "subject": "science",
        "grade": 10,
        "title": "Fossils: Messages From Deep Time",
        "subtitle": "How rock keeps a record of life.",
        "steps": [
          {
            "kind": "hook",
            "title": "A bone in the cliff",
            "body": "A hiker splits open a gray rock and finds the outline of a fish that no river near here has held for millions of years. How does a dead fish end up printed in stone?",
            "say": "A hiker cracks open a rock and finds a fish that has been gone for millions of years. How did it get into the stone?"
          },
          {
            "kind": "concept",
            "title": "A fossil is a time capsule",
            "body": "When an organism dies and gets buried fast, minerals slowly replace its hard parts. What is left is a fossil, a record of a living thing from long ago.",
            "analogy": "A fossil is like a footprint left in wet cement. The foot is long gone, but the shape proves something was really there.",
            "say": "A fossil is like a footprint pressed into wet cement. The animal is gone, but the shape proves it was really there.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐟",
                  "title": "Long ago",
                  "body": "A living organism dies and is buried."
                },
                {
                  "emoji": "🪨",
                  "title": "Today",
                  "body": "We dig up its fossil in rock."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Deeper rock, older life",
            "body": "Fossils stack in layers. The deeper the layer, the older the fossil. So fossils do not just show one creature, they show the story of life changing over deep time.",
            "say": "Fossils stack in layers. The deeper the layer, the older the fossil, so they show life changing across millions of years.",
            "widget": {
              "w": "numberline",
              "min": 0,
              "max": 300,
              "mark": 66,
              "color": "#7c5cff"
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Think about what a fossil actually proves. Tap the best answer.",
            "say": "Fossils give scientists evidence of what? Tap the best answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "Fossils give scientists evidence of...",
              "options": [
                {
                  "label": "organisms that lived long ago",
                  "correct": true
                },
                {
                  "label": "the weather next week"
                },
                {
                  "label": "how many people live in a city"
                },
                {
                  "label": "the temperature of the Sun"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A fossil is a record in stone of a living thing from long ago.",
            "emoji": "🦕",
            "takeaway": "A fossil is a record in stone of an organism that lived long ago. Read the layers and you read the history of life."
          }
        ]
      },
      {
        "id": "l.s11physics2",
        "skillId": "s.11.physics2",
        "subject": "science",
        "grade": 11,
        "title": "Waves and Newton's Third Law",
        "subtitle": "Two rules that run the physical world.",
        "steps": [
          {
            "kind": "hook",
            "title": "The rocket and the guitar",
            "body": "A rocket has nothing to push against in space, yet it climbs. Tighten a guitar string and the note gets higher. Two different mysteries, two physics rules.",
            "say": "A rocket climbs with nothing to push on, and a tighter guitar string sounds higher. Two mysteries, two rules."
          },
          {
            "kind": "concept",
            "title": "Frequency is waves per second",
            "body": "A wave's frequency is how many full waves pass a point each second. We measure it in hertz, written Hz. More waves per second means higher frequency.",
            "analogy": "Frequency is like counting cars that pass a stop sign in one second. More cars per second, higher frequency. For sound that means higher pitch, and for light it means bluer color.",
            "say": "Frequency is how many full waves pass each second, measured in hertz. More waves per second means higher pitch for sound and bluer color for light.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐢",
                  "title": "Low frequency",
                  "body": "Few waves per second. Low pitch."
                },
                {
                  "emoji": "🐇",
                  "title": "High frequency",
                  "body": "Many waves per second. High pitch."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Every push pushes back",
            "body": "Newton's Third Law says every action force has an equal and opposite reaction force. The rocket pushes gas down, so the gas pushes the rocket up.",
            "analogy": "Step off a skateboard and it shoots backward. You pushed it, it pushed you. Forces always come in pairs.",
            "say": "Newton's Third Law says every action force has an equal and opposite reaction force. The rocket pushes gas down, so the gas pushes the rocket up.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚀",
                  "title": "Action",
                  "body": "Rocket pushes gas DOWN."
                },
                {
                  "emoji": "⬆️",
                  "title": "Reaction",
                  "body": "Gas pushes rocket UP."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: frequency",
            "body": "What does a wave's frequency actually measure? Tap the best answer.",
            "say": "What does a wave's frequency measure? Tap the best answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "A wave's FREQUENCY measures...",
              "options": [
                {
                  "label": "how many waves pass per second (Hz)",
                  "correct": true
                },
                {
                  "label": "how tall the wave is"
                },
                {
                  "label": "how far the wave travels total"
                },
                {
                  "label": "the color of the water"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: Newton's Third Law",
            "body": "Finish the law. For every action there is an equal and opposite...",
            "say": "For every action there is an equal and opposite what? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "For every action there is an equal and opposite...",
              "options": [
                {
                  "label": "reaction",
                  "correct": true
                },
                {
                  "label": "distance"
                },
                {
                  "label": "silence"
                },
                {
                  "label": "temperature"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Frequency counts waves per second in hertz. And every push comes with an equal and opposite push back.",
            "emoji": "🚀",
            "takeaway": "Frequency counts waves per second in hertz. Newton's Third Law says every push comes with an equal and opposite push back."
          }
        ]
      },
      {
        "id": "l.s11chem",
        "skillId": "s.11.chem",
        "subject": "science",
        "grade": 11,
        "title": "The Mole: A Chemist's Counting Word",
        "subtitle": "How to count things too tiny to see.",
        "steps": [
          {
            "kind": "hook",
            "title": "Counting the uncountable",
            "body": "A single drop of water holds more atoms than there are stars you could ever see. You cannot count them one by one. So chemists invented a smarter unit.",
            "say": "One drop of water holds an unimaginable number of atoms. Chemists needed a smarter way to count them."
          },
          {
            "kind": "concept",
            "title": "A mole is a huge fixed number",
            "body": "A dozen always means 12. A mole always means about 6.02 times ten to the twenty third particles. That number is called Avogadro's number.",
            "analogy": "A mole is the chemist's dozen. Say dozen and everyone knows 12. Say mole and every chemist knows 6.02 times ten to the twenty third.",
            "say": "A dozen always means twelve. A mole always means about six point oh two times ten to the twenty third particles. That is Avogadro's number.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥚",
                  "title": "1 dozen",
                  "body": "= 12 things"
                },
                {
                  "emoji": "⚛️",
                  "title": "1 mole",
                  "body": "= 6.02 × 10²³ particles"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "One mole of any substance contains about 6.02 times ten to the twenty third of what? Tap the answer.",
            "say": "One mole of any substance contains about six point oh two times ten to the twenty third of what? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "One mole of any substance contains about 6.02 × 10²³...",
              "options": [
                {
                  "label": "particles",
                  "correct": true
                },
                {
                  "label": "grams"
                },
                {
                  "label": "liters"
                },
                {
                  "label": "degrees"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why bother with moles?",
            "body": "Say a reaction needs equal numbers of two kinds of atoms.",
            "reveal": [
              "One mole of carbon has 6.02 × 10²³ atoms.",
              "One mole of oxygen also has 6.02 × 10²³ atoms.",
              "So counting in moles lets chemists match particles without ever counting one atom."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "A mole is the chemist's dozen. One mole is about six point oh two times ten to the twenty third particles.",
            "emoji": "🔢",
            "takeaway": "A mole is the chemist's dozen. One mole is about 6.02 times ten to the twenty third particles, no matter the substance."
          }
        ]
      },
      {
        "id": "l.s12advanced",
        "skillId": "s.12.advanced",
        "subject": "science",
        "grade": 12,
        "title": "Natural Selection and CRISPR",
        "subtitle": "How traits spread, and how we now edit them.",
        "steps": [
          {
            "kind": "hook",
            "title": "The moths that turned dark",
            "body": "In smoky old cities, pale moths on soot-covered trees got eaten by birds while dark moths hid perfectly. A few generations later, most moths were dark. Nothing told them to change. So what did?",
            "say": "When trees turned black with soot, pale moths got eaten and dark moths survived. Soon most moths were dark. What caused that change?"
          },
          {
            "kind": "concept",
            "title": "Helpful traits win the numbers game",
            "body": "Natural selection means organisms with helpful traits survive and reproduce more. Their offspring inherit those traits, so the trait spreads through the population over time.",
            "analogy": "Think of it like a slow tournament. A tiny advantage does not win one round loudly, it just wins slightly more often, and after many rounds that edge takes over.",
            "say": "Natural selection means organisms with helpful traits survive and reproduce more, so their offspring inherit the trait and it spreads over generations.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🦋",
                  "title": "Helpful trait",
                  "body": "Survives, has more offspring. Trait spreads."
                },
                {
                  "emoji": "🪶",
                  "title": "Harmful trait",
                  "body": "Fewer survive, fewer offspring. Trait fades."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Now we can edit the code directly",
            "body": "Nature edits traits slowly by selection. CRISPR is a tool that lets scientists edit specific genes in DNA on purpose, like molecular scissors that cut at an exact spot.",
            "analogy": "If DNA is a long document, CRISPR is find-and-replace. It locates one exact line and changes it, instead of rewriting the whole book.",
            "say": "CRISPR lets scientists edit specific genes in DNA on purpose. It works like find and replace, changing one exact spot instead of the whole code.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧬",
                  "title": "DNA",
                  "body": "The full instruction code."
                },
                {
                  "emoji": "✂️",
                  "title": "CRISPR",
                  "body": "Cuts and edits one exact gene."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: natural selection",
            "body": "Finish the idea. Natural selection means organisms with helpful traits...",
            "say": "Natural selection means organisms with helpful traits do what? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "Natural selection means organisms with helpful traits...",
              "options": [
                {
                  "label": "survive and reproduce more, spreading those traits",
                  "correct": true
                },
                {
                  "label": "choose to change their own bodies"
                },
                {
                  "label": "always live forever"
                },
                {
                  "label": "disappear from the population"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: CRISPR",
            "body": "What does CRISPR technology let scientists do? Tap the answer.",
            "say": "What does CRISPR let scientists do? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "CRISPR technology lets scientists...",
              "options": [
                {
                  "label": "edit specific genes in DNA",
                  "correct": true
                },
                {
                  "label": "cool down the whole planet"
                },
                {
                  "label": "count atoms in a mole"
                },
                {
                  "label": "measure a wave's frequency"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Natural selection spreads helpful traits because survivors reproduce more. CRISPR edits specific genes directly, like molecular scissors.",
            "emoji": "🧬",
            "takeaway": "Natural selection spreads helpful traits because survivors reproduce more. CRISPR lets us edit specific genes directly, like molecular scissors."
          }
        ]
      },
      {
        "id": "l.s12earth",
        "skillId": "s.12.earth",
        "subject": "science",
        "grade": 12,
        "title": "Sunlight In, Heat Trapped",
        "subtitle": "How energy reaches Earth and why the planet is warming.",
        "steps": [
          {
            "kind": "hook",
            "title": "93 million miles of empty space",
            "body": "The Sun sits across an almost perfect vacuum, yet its energy still reaches your skin. There is no air out there to carry heat. So how does the energy make the trip?",
            "say": "The Sun is millions of miles away across empty space, with no air to carry heat. So how does its energy reach us?"
          },
          {
            "kind": "concept",
            "title": "Energy travels as radiation",
            "body": "Most of the Sun's energy reaches Earth as radiation, which is light and other electromagnetic waves. Radiation needs no air or matter, so it crosses empty space with ease.",
            "analogy": "Radiation is like a text message. It does not need a road or a wire between phones, it just travels as a wave and arrives.",
            "say": "Most of the Sun's energy reaches Earth as radiation, which is light and other electromagnetic waves. Radiation needs no air, so it crosses empty space.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "☀️",
                  "title": "Sun",
                  "body": "Sends out radiation (light)."
                },
                {
                  "emoji": "🌍",
                  "title": "Earth",
                  "body": "Absorbs it 8 minutes later."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Why the planet is heating up",
            "body": "Earth radiates heat back toward space. Carbon dioxide from burning fossil fuels traps more of that heat, strengthening the greenhouse effect and raising global temperatures.",
            "analogy": "Extra carbon dioxide is like adding blankets. The Sun's warmth still comes in, but more of Earth's heat cannot get back out.",
            "say": "Carbon dioxide from burning fossil fuels traps more of Earth's heat, like adding blankets, so global temperatures rise.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🏭",
                  "title": "Burn fossil fuels",
                  "body": "Releases extra CO₂."
                },
                {
                  "emoji": "🌡️",
                  "title": "Result",
                  "body": "More heat trapped, temperatures rise."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: the Sun's energy",
            "body": "How does most of the Sun's energy reach Earth? Tap the answer.",
            "say": "How does most of the Sun's energy reach Earth? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "Most of the Sun's energy reaches Earth as...",
              "options": [
                {
                  "label": "radiation (light)",
                  "correct": true
                },
                {
                  "label": "sound waves"
                },
                {
                  "label": "wind blowing from the Sun"
                },
                {
                  "label": "warm ocean water"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: rising temperatures",
            "body": "Rising global temperatures are linked mainly to increased what? Tap the answer.",
            "say": "Rising global temperatures are linked mainly to increased what? Tap the answer.",
            "widget": {
              "w": "tapPick",
              "prompt": "Rising global temperatures are linked mainly to increased...",
              "options": [
                {
                  "label": "carbon dioxide from burning fossil fuels",
                  "correct": true
                },
                {
                  "label": "oxygen from plants"
                },
                {
                  "label": "distance from the Sun"
                },
                {
                  "label": "salt in the ocean"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The Sun's energy arrives as radiation. Extra carbon dioxide from burning fossil fuels traps heat and warms the planet.",
            "emoji": "☀️",
            "takeaway": "The Sun's energy arrives as radiation. Extra carbon dioxide from burning fossil fuels traps Earth's heat and warms the planet."
          }
        ]
      }
    ],
    "spanish": [
      {
        "id": "l.greet",
        "skillId": "sp.0.greetings",
        "subject": "spanish",
        "grade": 0,
        "title": "Your First Spanish Words",
        "subtitle": "Say hello, thank you, and goodbye today.",
        "steps": [
          {
            "kind": "hook",
            "title": "One word opens a door",
            "body": "Imagine meeting a new friend who speaks Spanish. One friendly word can turn a stranger into a buddy. Let us learn three.",
            "say": "One friendly word can turn a stranger into a friend. Let us learn three."
          },
          {
            "kind": "concept",
            "title": "Hola, gracias, adiós",
            "body": "Hola means hello. Gracias means thank you. Adiós means goodbye. Say each one out loud after me.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👋",
                  "title": "Hola",
                  "body": "Hello (OH-lah)"
                },
                {
                  "emoji": "🙏",
                  "title": "Gracias",
                  "body": "Thank you (GRAH-syahs)"
                },
                {
                  "emoji": "👋",
                  "title": "Adiós",
                  "body": "Goodbye (ah-DYOHS)"
                }
              ]
            },
            "say": "Hola. Gracias. Adiós."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Your new friend just helped you. What do you say?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which word means \"thank you\"?",
              "options": [
                {
                  "label": "Hola"
                },
                {
                  "label": "Gracias",
                  "correct": true
                },
                {
                  "label": "Adiós"
                }
              ]
            },
            "say": "Which word means thank you?"
          },
          {
            "kind": "recap",
            "emoji": "🌎",
            "title": "Remember this",
            "takeaway": "Hola to say hi, gracias to say thanks, adiós to say bye. Three words, and you can already be kind in Spanish.",
            "say": "Hola, gracias, adiós. You can already be kind in Spanish."
          }
        ]
      },
      {
        "id": "l.sp0numbers",
        "skillId": "sp.0.numbers",
        "subject": "spanish",
        "grade": 0,
        "title": "Números: Counting to Ten",
        "subtitle": "The same numbers you know, with brand-new names.",
        "steps": [
          {
            "kind": "hook",
            "title": "At the taco stand",
            "body": "You walk up to the taquería and you are hungry. You want 4 tacos. To get exactly 4, you need the Spanish word for it.",
            "say": "You want four tacos. To ask for them, you need the number in Spanish."
          },
          {
            "kind": "concept",
            "title": "New names for numbers you already know",
            "body": "You already know how to count. In Spanish the numbers just get new names: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.",
            "analogy": "Think of a friend who has a nickname. Same person, different name. Four is still four, we just call it cuatro.",
            "say": "One is uno. Two is dos. Three is tres. Four is cuatro. Five is cinco. Six is seis. Seven is siete. Eight is ocho. Nine is nueve. Ten is diez.",
            "widget": {
              "w": "numberline",
              "min": 1,
              "max": 10
            }
          },
          {
            "kind": "show",
            "title": "Meet cuatro and siete",
            "body": "These two show up a lot. Cuatro is 4. Siete is 7.",
            "say": "Cuatro is four. Siete is seven.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌮",
                  "title": "cuatro",
                  "body": "the number 4"
                },
                {
                  "emoji": "🛒",
                  "title": "siete",
                  "body": "the number 7"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: order the tacos",
            "body": "You want 4 tacos. Tap the Spanish word for 4.",
            "say": "You want four tacos. Which word is four?",
            "widget": {
              "w": "tapPick",
              "prompt": "What is 4 in Spanish?",
              "options": [
                {
                  "label": "dos"
                },
                {
                  "label": "cuatro",
                  "correct": true
                },
                {
                  "label": "siete"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Same numbers, new names. Cuatro is four. Siete is seven.",
            "emoji": "🌮",
            "takeaway": "The numbers are the same, only the names change. Cuatro is 4 and siete is 7."
          }
        ]
      },
      {
        "id": "l.sp0colors",
        "skillId": "sp.0.colors",
        "subject": "spanish",
        "grade": 0,
        "title": "Colores: Naming Colors",
        "subtitle": "The colors in your crayon box, in Spanish.",
        "steps": [
          {
            "kind": "hook",
            "title": "Coloring the sun",
            "body": "You are drawing a bright sunny day. You reach for the crayon to color the sun. In Spanish, that color is amarillo.",
            "say": "You want to color the sun. That color in Spanish is amarillo."
          },
          {
            "kind": "concept",
            "title": "A color word is just a label",
            "body": "Every color has a Spanish name. Rojo is red, azul is blue, and when you mix red and blue you get morado, which is purple.",
            "analogy": "Mixing paint proves it: red plus blue makes purple. In Spanish, rojo plus azul makes morado.",
            "say": "Rojo is red. Azul is blue. Mix them and you get morado, which is purple.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🔴",
                  "title": "rojo",
                  "body": "red",
                  "color": "#e53935"
                },
                {
                  "emoji": "🔵",
                  "title": "azul",
                  "body": "blue",
                  "color": "#1e88e5"
                },
                {
                  "emoji": "🟣",
                  "title": "morado",
                  "body": "purple",
                  "color": "#8e24aa"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "And the sunny one",
            "body": "Amarillo is yellow, like the sun and a banana.",
            "say": "Amarillo is yellow.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌞",
                  "title": "amarillo",
                  "body": "yellow",
                  "color": "#fdd835"
                },
                {
                  "emoji": "🟢",
                  "title": "verde",
                  "body": "green",
                  "color": "#43a047"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: mix the colors",
            "body": "You mix red and blue and get morado. What color is that in English?",
            "say": "Red and blue make morado. What color is that in English?",
            "widget": {
              "w": "tapPick",
              "prompt": "Morado means…",
              "options": [
                {
                  "label": "green"
                },
                {
                  "label": "purple",
                  "correct": true
                },
                {
                  "label": "yellow"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Rojo red, azul blue, morado purple, amarillo yellow.",
            "emoji": "🟣",
            "takeaway": "Rojo is red, azul is blue, morado is purple, and amarillo is yellow like the sun."
          }
        ]
      },
      {
        "id": "l.sp1family",
        "skillId": "sp.1.family",
        "subject": "spanish",
        "grade": 1,
        "title": "La Familia: Your People",
        "subtitle": "The words for the people who love you.",
        "steps": [
          {
            "kind": "hook",
            "title": "The family photo",
            "body": "You are showing a friend a photo of your family. You point at each person. In Spanish, you already almost know two of the words.",
            "say": "You point at your family in a photo. Two of the words will sound familiar."
          },
          {
            "kind": "concept",
            "title": "Mamá and papá sound like home",
            "body": "Mamá means mom and papá means dad. Say them out loud and they sound a lot like the words you already use.",
            "analogy": "These are the very first words babies say all over the world: mama and papa. Spanish just adds a little stress at the end.",
            "say": "Mamá means mom. Papá means dad.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👩",
                  "title": "mamá",
                  "body": "mom"
                },
                {
                  "emoji": "👨",
                  "title": "papá",
                  "body": "dad"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Aunt and uncle: watch the last letter",
            "body": "La tía is your aunt, your mom's or dad's sister. El tío is your uncle. The a means girl and the o means boy.",
            "analogy": "Same word, one letter flips: tía for a girl, tío for a boy.",
            "say": "La tía is aunt. El tío is uncle. The a is for a girl, the o is for a boy.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👧",
                  "title": "tía",
                  "body": "aunt (ends in a)"
                },
                {
                  "emoji": "👦",
                  "title": "tío",
                  "body": "uncle (ends in o)"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: match your family",
            "body": "Drag each Spanish word to the person it names.",
            "say": "Match each Spanish word to the right person.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "mom",
                  "label": "mom"
                },
                {
                  "id": "dad",
                  "label": "dad"
                },
                {
                  "id": "aunt",
                  "label": "aunt"
                }
              ],
              "items": [
                {
                  "label": "mamá",
                  "bucket": "mom"
                },
                {
                  "label": "papá",
                  "bucket": "dad"
                },
                {
                  "label": "tía",
                  "bucket": "aunt"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Mamá mom, papá dad, tía aunt, tío uncle.",
            "emoji": "👨‍👩‍👧",
            "takeaway": "Mamá is mom, papá is dad, la tía is aunt, and el tío is uncle. The a is for a girl and the o is for a boy."
          }
        ]
      },
      {
        "id": "l.sp1animals",
        "skillId": "sp.1.animals",
        "subject": "spanish",
        "grade": 1,
        "title": "Los Animales: Naming Animals",
        "subtitle": "The animals you know, in Spanish.",
        "steps": [
          {
            "kind": "hook",
            "title": "At the park",
            "body": "A friendly dog runs up wagging its tail and wanting to play fetch. In Spanish you would call it el perro.",
            "say": "A dog runs up to play. In Spanish, that dog is el perro."
          },
          {
            "kind": "concept",
            "title": "Every animal has a Spanish name",
            "body": "El perro is the dog and el gato is the cat. The little word el just means the.",
            "analogy": "El is like a name tag that says the. El perro is the dog, el gato is the cat.",
            "say": "El perro is the dog. El gato is the cat.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐕",
                  "title": "el perro",
                  "body": "the dog"
                },
                {
                  "emoji": "🐈",
                  "title": "el gato",
                  "body": "the cat"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "One you can almost read",
            "body": "El elefante is the elephant, huge and gray with a long trunk. Say it slowly and you can hear the English word hiding inside.",
            "analogy": "Elefante and elephant are twins that dressed a little differently. Same animal, almost the same word.",
            "say": "El elefante is the elephant.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐘",
                  "title": "el elefante",
                  "body": "the elephant"
                },
                {
                  "emoji": "🐦",
                  "title": "el pájaro",
                  "body": "the bird"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: match the animals",
            "body": "Drag each Spanish word to the right animal.",
            "say": "Match each Spanish word to the right animal.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "dog",
                  "label": "🐕 dog"
                },
                {
                  "id": "cat",
                  "label": "🐈 cat"
                },
                {
                  "id": "eleph",
                  "label": "🐘 elephant"
                }
              ],
              "items": [
                {
                  "label": "perro",
                  "bucket": "dog"
                },
                {
                  "label": "gato",
                  "bucket": "cat"
                },
                {
                  "label": "elefante",
                  "bucket": "eleph"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "El perro dog, el gato cat, el elefante elephant.",
            "emoji": "🐘",
            "takeaway": "El perro is the dog, el gato is the cat, and el elefante is the elephant."
          }
        ]
      },
      {
        "id": "l.sp1food",
        "skillId": "sp.1.food",
        "subject": "spanish",
        "grade": 1,
        "title": "La Comida: Food and Drinks",
        "subtitle": "What to say when you are hungry or thirsty.",
        "steps": [
          {
            "kind": "hook",
            "title": "Snack time",
            "body": "You have a plate of warm cookies and you are thirsty. You want a cold glass of milk to go with them. In Spanish that is la leche.",
            "say": "You want milk with your cookies. In Spanish, milk is la leche."
          },
          {
            "kind": "concept",
            "title": "Two things you drink every day",
            "body": "La leche is milk and el agua is water. These are two of the first food words you will use.",
            "analogy": "Picture your lunch tray: the milk carton is la leche, the water cup is el agua.",
            "say": "La leche is milk. El agua is water.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🥛",
                  "title": "la leche",
                  "body": "milk"
                },
                {
                  "emoji": "💧",
                  "title": "el agua",
                  "body": "water"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: pour the milk",
            "body": "Cookies taste great with la leche. What does leche mean?",
            "say": "Cookies go great with la leche. What does leche mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Leche means…",
              "options": [
                {
                  "label": "water"
                },
                {
                  "label": "milk",
                  "correct": true
                },
                {
                  "label": "bread"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Thirsty? Ask for water",
            "body": "How do you say water when you are thirsty?",
            "reveal": [
              "You are thirsty, so you want something to drink.",
              "The Spanish word for water is agua.",
              "El agua means water, the drink that fills your cup."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "La leche is milk. El agua is water.",
            "emoji": "🥛",
            "takeaway": "La leche is milk and el agua is water, the two drinks you reach for most."
          }
        ]
      },
      {
        "id": "l.sp2days",
        "skillId": "sp.2.days",
        "subject": "spanish",
        "grade": 2,
        "title": "Days of the Week in Spanish",
        "subtitle": "Seven day names, and the trick to remember them.",
        "steps": [
          {
            "kind": "hook",
            "title": "When is the party?",
            "body": "Your cousin in Mexico texts that the party is on sábado. If you do not know the day names, you might show up on the wrong day.",
            "say": "Your cousin says the party is on sabado. Do you know which day that is?"
          },
          {
            "kind": "concept",
            "title": "Monday is the moon's day",
            "body": "The week starts with lunes, which is Monday. Listen closely: lunes sounds like luna, the Spanish word for moon.",
            "analogy": "Lunes hides the moon inside it. Luna, lunes. Monday is moon-day.",
            "say": "Lunes is Monday, and it sounds like luna, the moon. Then come martes, miercoles, jueves, and viernes.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌙",
                  "title": "lunes",
                  "body": "Monday, from luna, the moon"
                },
                {
                  "emoji": "📅",
                  "title": "martes, miércoles",
                  "body": "Tuesday, Wednesday"
                },
                {
                  "emoji": "📅",
                  "title": "jueves, viernes",
                  "body": "Thursday, Friday"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The two best days",
            "body": "Sábado is Saturday and domingo is Sunday. Together they are el fin de semana, the weekend. No school.",
            "say": "Sabado is Saturday and domingo is Sunday. Together they are the fin de semana, the weekend.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⚽",
                  "title": "sábado",
                  "body": "Saturday"
                },
                {
                  "emoji": "😴",
                  "title": "domingo",
                  "body": "Sunday"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: school days or weekend?",
            "body": "Sort each day. Does it belong to the school week, or to the weekend?",
            "say": "Sort each day. Is it a school day, or part of the weekend?",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "semana",
                  "label": "School days"
                },
                {
                  "id": "finde",
                  "label": "Weekend"
                }
              ],
              "items": [
                {
                  "label": "lunes",
                  "bucket": "semana"
                },
                {
                  "label": "viernes",
                  "bucket": "semana"
                },
                {
                  "label": "sábado",
                  "bucket": "finde"
                },
                {
                  "label": "domingo",
                  "bucket": "finde"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Lunes is Monday, like luna the moon. Sabado and domingo make the weekend.",
            "emoji": "🌙",
            "takeaway": "Lunes is Monday because luna means moon. Sábado and domingo are the weekend, el fin de semana."
          }
        ]
      },
      {
        "id": "l.sp2body",
        "skillId": "sp.2.body",
        "subject": "spanish",
        "grade": 2,
        "title": "Naming Your Body in Spanish",
        "subtitle": "The words for the parts you use all day.",
        "steps": [
          {
            "kind": "hook",
            "title": "At the doctor in Spain",
            "body": "The doctor asks you to raise la mano and open wide to check los dientes. If you know the words, you know exactly what to do.",
            "say": "The doctor asks about la mano and los dientes. Do you know which parts those are?"
          },
          {
            "kind": "concept",
            "title": "Point to it as you say it",
            "body": "La mano is your hand, the part with five fingers. Los dientes are your teeth, the white ones you brush every day.",
            "analogy": "Match each Spanish word to something your body already does. La mano waves. Los dientes bite an apple.",
            "say": "La mano is your hand, with five fingers. Los dientes are your teeth, the ones you brush.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✋",
                  "title": "la mano",
                  "body": "hand, has five fingers"
                },
                {
                  "emoji": "🦷",
                  "title": "los dientes",
                  "body": "teeth, you brush them"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: which part is it?",
            "body": "Los dientes are white and you brush them every morning. What are they?",
            "say": "Los dientes are white and you brush them. What are they in English?",
            "widget": {
              "w": "tapPick",
              "prompt": "Los dientes are white and you brush them. They are your…",
              "options": [
                {
                  "label": "teeth",
                  "correct": true
                },
                {
                  "label": "hand"
                },
                {
                  "label": "foot"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Reading a body word",
            "body": "How do you figure out la mano?",
            "reveal": [
              "La mano is one part, so it takes la for the.",
              "It is the part with five fingers that you wave.",
              "La mano means hand."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "La mano is your hand. Los dientes are your teeth.",
            "emoji": "✋",
            "takeaway": "La mano is your hand with five fingers. Los dientes are your teeth that you brush."
          }
        ]
      },
      {
        "id": "l.sp2phrases",
        "skillId": "sp.2.phrases",
        "subject": "spanish",
        "grade": 2,
        "title": "¡Salud! and Other Handy Phrases",
        "subtitle": "What to say when a friend sneezes.",
        "steps": [
          {
            "kind": "hook",
            "title": "Achoo!",
            "body": "You are sitting with your friend from Colombia and she sneezes. Everyone looks at you. What do you say?",
            "say": "Your friend sneezes. Everyone waits for you to say something. What is it?"
          },
          {
            "kind": "concept",
            "title": "One word: health",
            "body": "In Spanish you say ¡Salud! after a sneeze. Salud means health, so you are really wishing the person good health.",
            "analogy": "In English we say bless you. In Spanish they skip straight to the wish: health to you. Salud.",
            "say": "After a sneeze you say salud. It means health. You also say it as a toast, like cheers.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🤧",
                  "title": "Someone sneezes",
                  "body": "You say: ¡Salud!"
                },
                {
                  "emoji": "🥤",
                  "title": "A toast with drinks",
                  "body": "You also say: ¡Salud!"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: say the right thing",
            "body": "Your friend sneezes right next to you. What do you say?",
            "say": "Your friend sneezes. Do you say salud, hola, or adios?",
            "widget": {
              "w": "tapPick",
              "prompt": "Your friend sneezes. You say…",
              "options": [
                {
                  "label": "¡Salud!",
                  "correct": true
                },
                {
                  "label": "¡Hola!"
                },
                {
                  "label": "¡Adiós!"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "After a sneeze, say salud. It means health.",
            "emoji": "🤧",
            "takeaway": "After a sneeze, say ¡Salud! It means health, and you use the same word for a toast, like cheers."
          }
        ]
      },
      {
        "id": "l.serestar",
        "skillId": "sp.3.ser",
        "subject": "spanish",
        "grade": 3,
        "title": "Ser vs. Estar: Forever vs. Right Now",
        "subtitle": "Spanish has two words for \"is.\" Here is the trick.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two kinds of \"is\"",
            "body": "In English we say \"is\" for everything. Spanish is pickier. It has ser for things that stay true, and estar for things happening right now.",
            "say": "Spanish has two words for is. Ser for what stays true, estar for right now."
          },
          {
            "kind": "concept",
            "title": "Forever vs. right now",
            "body": "Use SER for permanent things: who you are, where you are from. Use ESTAR for temporary things: how you feel, where you are standing.",
            "analogy": "Ser is your name tag. Estar is your mood ring. One does not change, one changes all day.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪪",
                  "title": "SER",
                  "body": "Lasting: \"Soy Margaux.\" I am Margaux."
                },
                {
                  "emoji": "💍",
                  "title": "ESTAR",
                  "body": "Right now: \"Estoy feliz.\" I am happy."
                }
              ]
            },
            "say": "Ser is for lasting things. Estar is for how you feel right now."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "\"I am tired\" is a right-now feeling. Which verb do you use?",
            "widget": {
              "w": "tapPick",
              "prompt": "I am tired (right now)...",
              "options": [
                {
                  "label": "ser (Soy cansado)"
                },
                {
                  "label": "estar (Estoy cansado)",
                  "correct": true
                }
              ]
            },
            "say": "I am tired is a right now feeling. Which verb?"
          },
          {
            "kind": "recap",
            "emoji": "🇪🇸",
            "title": "Remember this",
            "takeaway": "Ser is your name tag: lasting. Estar is your mood ring: right now. Feelings and locations use estar.",
            "say": "Ser is lasting, like a name tag. Estar is right now, like a mood ring."
          }
        ]
      },
      {
        "id": "l.sp3ar",
        "skillId": "sp.3.ar",
        "subject": "spanish",
        "grade": 3,
        "title": "Present Tense: -AR Verbs",
        "subtitle": "Swap the ending to match who is doing it.",
        "steps": [
          {
            "kind": "hook",
            "title": "One verb, many people",
            "body": "Bailar means to dance. But I dance, you dance, and we dance are not all said the same way in Spanish. The word changes.",
            "say": "Bailar means to dance. But the word changes depending on who is dancing."
          },
          {
            "kind": "concept",
            "title": "Drop -ar, snap on the ending",
            "body": "Take an -ar verb and drop the -ar. That leaves the stem. Then add the ending that matches the person doing the action.",
            "analogy": "The verb is like a phone. The stem is the phone itself, and each person clicks on a different case. Yo gets -o, tú gets -as, nosotros gets -amos.",
            "say": "Drop the a r. Then, for yo add o, for tu add a s, for nosotros add a m o s.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧍",
                  "title": "yo",
                  "body": "add -o (yo bailo)"
                },
                {
                  "emoji": "👉",
                  "title": "tú",
                  "body": "add -as (tú bailas)"
                },
                {
                  "emoji": "👥",
                  "title": "nosotros",
                  "body": "add -amos (nosotros bailamos)"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Conjugate bailar with nosotros",
            "body": "How do we say we dance?",
            "reveal": [
              "Start with bailar, to dance.",
              "Drop the -ar to get the stem bail-.",
              "Nosotros takes -amos, so bail plus amos is bailamos."
            ]
          },
          {
            "kind": "try",
            "title": "Your turn: cook it up",
            "body": "Cocinar means to cook. Conjugate it for tú: tú ___",
            "say": "Cocinar means to cook. What is the tu form? Tu what?",
            "widget": {
              "w": "tapPick",
              "prompt": "cocinar (to cook) with tú: tú ___",
              "options": [
                {
                  "label": "cocinas",
                  "correct": true
                },
                {
                  "label": "cocino"
                },
                {
                  "label": "cocinamos"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Drop a r. Yo gets o, tu gets a s, nosotros gets a m o s.",
            "emoji": "💃",
            "takeaway": "Drop -ar, then add the ending: yo -o, tú -as, nosotros -amos. Tú cocinas, nosotros bailamos."
          }
        ]
      },
      {
        "id": "l.sp4questions",
        "skillId": "sp.4.questions",
        "subject": "spanish",
        "grade": 4,
        "title": "Spanish Question Words",
        "subtitle": "The upside-down mark and the words that ask.",
        "steps": [
          {
            "kind": "hook",
            "title": "The mark that warns you",
            "body": "In Spanish, a question opens with an upside-down mark: ¿. It appears before you even read the sentence. Why put it there?",
            "say": "Spanish questions start with an upside down mark. Why would you put it at the very beginning?"
          },
          {
            "kind": "concept",
            "title": "A heads-up sign for your voice",
            "body": "The ¿ tells you a question is coming before you read it. So your voice knows to lift into a question tone from the very first word.",
            "analogy": "It is like a road sign that says curve ahead. You slow down before the curve, not during it. The ¿ warns your voice before the words.",
            "say": "The upside down mark signals a question is coming before you read it, so your voice is ready. Que means what, donde means where, cuanto means how much.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❓",
                  "title": "¿Qué?",
                  "body": "What?"
                },
                {
                  "emoji": "📍",
                  "title": "¿Dónde?",
                  "body": "Where?"
                },
                {
                  "emoji": "💰",
                  "title": "¿Cuánto?",
                  "body": "How much?"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: at the shop",
            "body": "You are buying a souvenir and you ask ¿Cuánto cuesta? What are you asking?",
            "say": "You ask cuanto cuesta at a shop. What does it mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "¿Cuánto cuesta? means…",
              "options": [
                {
                  "label": "How much does it cost?",
                  "correct": true
                },
                {
                  "label": "Where is it?"
                },
                {
                  "label": "What is your name?"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The upside down mark warns you a question is coming. Cuanto cuesta means how much does it cost.",
            "emoji": "❓",
            "takeaway": "The ¿ warns you a question is coming so your voice is ready. ¿Cuánto cuesta? means how much does it cost?"
          }
        ]
      },
      {
        "id": "l.sp4gustar",
        "skillId": "sp.4.gustar",
        "subject": "spanish",
        "grade": 4,
        "title": "Me Gusta: Saying What You Like",
        "subtitle": "Two little words for likes and dislikes.",
        "steps": [
          {
            "kind": "hook",
            "title": "At the lunch table",
            "body": "A new friend from Mexico points at your snack and asks, \"¿Te gusta el chocolate?\" You want to answer, but first you need to know what she just asked.",
            "say": "Your friend asks, te gusta el chocolate? What is she asking you?"
          },
          {
            "kind": "concept",
            "title": "Me is me, te is you",
            "body": "\"Me gusta\" means I like it. \"Te gusta\" means you like it. The word \"gusta\" stays the same. Only the little word in front changes who we are talking about.",
            "analogy": "Think of \"gusta\" as a gift box that says 'is pleasing'. \"Me\" puts your name on the box, \"te\" puts the other person's name on it.",
            "say": "Me gusta means I like it. Te gusta means you like it. Me gusta el chocolate. Te gusta el fútbol.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🍫",
                  "title": "Me gusta",
                  "body": "I like it. Me gusta el chocolate."
                },
                {
                  "emoji": "⚽",
                  "title": "Te gusta",
                  "body": "You like it. ¿Te gusta el fútbol?"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Turn it into a question",
            "body": "To ask instead of tell, just add the question marks and your voice goes up at the end. \"¿Te gusta el fútbol?\" means Do you like soccer?",
            "say": "Te gusta el fútbol, with your voice going up, means do you like soccer?"
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Your friend asks, \"¿Te gusta el fútbol?\" What is she asking?",
            "say": "Te gusta el fútbol. What is she asking?",
            "widget": {
              "w": "tapPick",
              "prompt": "¿Te gusta el fútbol?",
              "options": [
                {
                  "label": "Do you like soccer?",
                  "correct": true
                },
                {
                  "label": "I like soccer."
                },
                {
                  "label": "Where is the soccer ball?"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Me gusta, I like it. Te gusta, you like it.",
            "emoji": "🍫",
            "takeaway": "Me gusta is I like it. Te gusta is you like it. Same gusta, just swap who is out front."
          }
        ]
      },
      {
        "id": "l.sp5eri",
        "skillId": "sp.5.eri",
        "subject": "spanish",
        "grade": 5,
        "title": "-ER and -IR Verbs: The Yo Form",
        "subtitle": "How to say what I do.",
        "steps": [
          {
            "kind": "hook",
            "title": "Talking about yourself",
            "body": "You want to tell your abuela, \"I live in Texas\" and \"I write to you.\" In Spanish the verb ending has to change so it means I. How?",
            "say": "You want to say I live and I write. The verb ending has to change. Here is how."
          },
          {
            "kind": "concept",
            "title": "Drop the ending, add -o",
            "body": "Verbs like vivir (to live) and escribir (to write) end in -ir. To say what I do, take off the ending and add -o. Vivir becomes vivo. Escribir becomes escribo.",
            "analogy": "The verb is like a jacket. To make it fit you, you swap the collar. Take off -er or -ir, snap on -o, and now it means yo, which is I.",
            "say": "Take off the ending and add o. Vivir becomes vivo. Escribir becomes escribo. Comer becomes como.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🏠",
                  "title": "vivir → vivo",
                  "body": "yo vivo = I live"
                },
                {
                  "emoji": "✏️",
                  "title": "escribir → escribo",
                  "body": "yo escribo = I write"
                },
                {
                  "emoji": "🍽️",
                  "title": "comer → como",
                  "body": "yo como = I eat"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The trick both share",
            "body": "Good news: -er and -ir verbs use the same yo ending. Whether it ends in -er or -ir, the yo form ends in -o.",
            "say": "Both er and ir verbs end in o for the yo form."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The verb vivir means to live. How do you say \"I live\"? Fill in: yo ___",
            "say": "Vivir means to live. How do you say yo, blank?",
            "widget": {
              "w": "tapPick",
              "prompt": "vivir (to live), yo ___",
              "options": [
                {
                  "label": "vivo",
                  "correct": true
                },
                {
                  "label": "vives"
                },
                {
                  "label": "vivir"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: escribir",
            "body": "How do you say \"I write\"?",
            "reveal": [
              "Start with escribir, which means to write.",
              "Drop the -ir ending. That leaves escrib.",
              "Add -o for yo: yo escribo. That is I write."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "For er and ir verbs, yo ends in o. Vivo, escribo, como.",
            "emoji": "✏️",
            "takeaway": "For -er and -ir verbs, the yo form drops the ending and adds -o. Vivo, escribo, como."
          }
        ]
      },
      {
        "id": "l.sp5daily",
        "skillId": "sp.5.daily",
        "subject": "spanish",
        "grade": 5,
        "title": "La Rutina Diaria: Your Day in Spanish",
        "subtitle": "Wake up, go to school, and the words for when.",
        "steps": [
          {
            "kind": "hook",
            "title": "A morning you already know",
            "body": "Every day you wake up, eat, and head to school. A Spanish pen pal writes about the exact same morning. Learn a few key phrases and you can read her whole day.",
            "say": "Your pen pal writes about her morning, waking up and going to school. Here are the words to read it."
          },
          {
            "kind": "concept",
            "title": "Me despierto and the clock",
            "body": "\"Me despierto\" means I wake up. Add \"a las siete\" and you get I wake up at seven. \"A las\" tells the hour.",
            "analogy": "\"Me despierto\" is your alarm going off. \"A las siete\" is the number the clock shows when it rings.",
            "say": "Me despierto means I wake up. A las siete means at seven. Me despierto a las siete, I wake up at seven.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "⏰",
                  "title": "Me despierto",
                  "body": "I wake up"
                },
                {
                  "emoji": "🕖",
                  "title": "a las siete",
                  "body": "at seven o'clock"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Before and after",
            "body": "To say when something happens, use \"después de\" for after and \"antes de\" for before. \"Después de la escuela\" means after school.",
            "say": "Después de means after. Antes de means before. Después de la escuela, after school."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Your pen pal writes, \"Después de la escuela.\" What does that mean?",
            "say": "Después de la escuela. What does it mean?",
            "widget": {
              "w": "tapPick",
              "prompt": "Después de la escuela",
              "options": [
                {
                  "label": "after school",
                  "correct": true
                },
                {
                  "label": "before school"
                },
                {
                  "label": "at school"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Me despierto, I wake up. A las siete, at seven. Después de, after.",
            "emoji": "⏰",
            "takeaway": "Me despierto is I wake up, a las siete is at seven, and después de means after. Now you can read a whole morning."
          }
        ]
      },
      {
        "id": "l.sp6adjectives",
        "skillId": "sp.6.adjectives",
        "subject": "spanish",
        "grade": 6,
        "title": "Adjective Agreement: Words That Match",
        "subtitle": "Why fast can be rápido, rápida, or rápidos.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word that changes clothes",
            "body": "In English, fast is just fast: fast car, fast dogs, no change. In Spanish the word for fast changes its ending to match the noun. Miss the match and it sounds wrong.",
            "say": "In Spanish the word for fast changes its ending to match the noun it describes."
          },
          {
            "kind": "concept",
            "title": "Match gender and number",
            "body": "A Spanish adjective copies the noun in two ways: masculine or feminine, and singular or plural. \"Coche\" is masculine and singular, so fast is \"rápido\": el coche rápido.",
            "analogy": "The adjective is like a partner in a group photo. It wears the same outfit as the noun it stands next to, matching both the gender, masculine or feminine, and the number, singular or plural.",
            "say": "El coche rápido, masculine singular, ends in o. Los perros rápidos, masculine plural, ends in os. La moto rápida, feminine singular, ends in a.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚗",
                  "title": "el coche rápido",
                  "body": "masculine singular → -o"
                },
                {
                  "emoji": "🐕",
                  "title": "los perros rápidos",
                  "body": "masculine plural → -os"
                },
                {
                  "emoji": "🚙",
                  "title": "la moto rápida",
                  "body": "feminine singular → -a"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Plural adds an -s",
            "body": "One masculine thing ends in -o. More than one masculine thing ends in -os. \"Los perros\" is masculine and plural, so fast becomes \"rápidos.\"",
            "say": "One masculine thing ends in o. More than one ends in os. Los perros rápidos."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "\"Los perros ___\" means the fast dogs. Perros is masculine and plural. Which ending fits?",
            "say": "Los perros, blank. The fast dogs. Masculine and plural. Which ending?",
            "widget": {
              "w": "tapPick",
              "prompt": "Los perros ___ (the fast dogs)",
              "options": [
                {
                  "label": "rápidos",
                  "correct": true
                },
                {
                  "label": "rápido"
                },
                {
                  "label": "rápidas"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Worked example: the fast car",
            "body": "How do you say the fast car?",
            "reveal": [
              "The noun is coche, which is masculine and singular.",
              "Masculine singular takes the -o ending.",
              "So fast is rápido: el coche rápido."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Match the noun. O for masculine singular, os for masculine plural.",
            "emoji": "🐕",
            "takeaway": "The adjective must match the noun: -o for masculine singular, -os for masculine plural. Coche rápido, perros rápidos."
          }
        ]
      },
      {
        "id": "l.sp6commands",
        "skillId": "sp.6.commands",
        "subject": "spanish",
        "grade": 6,
        "title": "Mandatos: Telling People What To Do",
        "subtitle": "Please sit down, open your books, and other commands.",
        "steps": [
          {
            "kind": "hook",
            "title": "The teacher takes charge",
            "body": "A teacher wants the whole class to open their books, and to ask one student politely to sit down. Both are commands, but they are not shaped the same way.",
            "say": "A teacher tells the class to open their books and asks one student to sit down. Both are commands."
          },
          {
            "kind": "concept",
            "title": "One person versus the whole group",
            "body": "To one friend, use the tú command: \"Siéntate, por favor\" means Please sit down. To a group, teachers use the ustedes command: \"Abran los libros\" means Open your books.",
            "analogy": "A command is like a coach's whistle. One short blast for a single player, siéntate. A different blast for the whole team, abran.",
            "say": "Siéntate, por favor, means please sit down, to one person. Abran los libros means open your books, to the group.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪑",
                  "title": "Siéntate, por favor",
                  "body": "To one person: Please sit down"
                },
                {
                  "emoji": "📖",
                  "title": "Abran los libros",
                  "body": "To the group: Open your books"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Por favor keeps it polite",
            "body": "Adding \"por favor\" softens a command into a polite request. \"Siéntate, por favor\" is warmer than just \"Siéntate.\"",
            "say": "Adding por favor makes a command polite. Siéntate, por favor."
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "A teacher wants the whole class to open their books. What does she say?",
            "say": "The teacher tells the class to open their books. What does she say?",
            "widget": {
              "w": "tapPick",
              "prompt": "Telling the class: \"Open your books\"",
              "options": [
                {
                  "label": "Abran los libros",
                  "correct": true
                },
                {
                  "label": "Siéntate, por favor"
                },
                {
                  "label": "Me gusta el libro"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Siéntate, por favor, to one person. Abran los libros, to the whole group.",
            "emoji": "📖",
            "takeaway": "Siéntate, por favor is a polite command to one person. Abran los libros is a command to the whole group."
          }
        ]
      },
      {
        "id": "l.sp7preterite",
        "skillId": "sp.7.preterite",
        "subject": "spanish",
        "grade": 7,
        "title": "El Pretérito: Talking About Yesterday",
        "subtitle": "How to say what you already did.",
        "steps": [
          {
            "kind": "hook",
            "title": "So, what did you do?",
            "body": "Your friend texts you: what did you do yesterday? Did you watch the movie? To answer in Spanish, you need the past tense, the pretérito.",
            "say": "Your friend asks, what did you do yesterday? Did you watch the movie? To answer, you need the past tense, the preterito."
          },
          {
            "kind": "concept",
            "title": "The preterite is a photo, not a video",
            "body": "The pretérito is for actions that already finished, one snapshot in the past. To say YOU did something, change the ending. For -ar verbs you add -aste. For -er and -ir verbs you add -iste.",
            "analogy": "Present tense is a video playing now. The pretérito is a photo of something that already happened and is over.",
            "say": "The preterite is a finished action, a photo of the past. For a r verbs, the tu ending is aste, like miraste. For e r and i r verbs, the ending is iste, like viste, you saw.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🅰️",
                  "title": "-AR verbs",
                  "body": "mirar to watch, becomes miraste, you watched"
                },
                {
                  "emoji": "🅴",
                  "title": "-ER / -IR verbs",
                  "body": "ver to see, becomes viste, you saw"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Some verbs break the rules",
            "body": "A few common verbs are irregular. Hacer means to do or make, but in the pretérito the yo form is hice and the tú form is hiciste. So did you do it becomes hiciste.",
            "say": "Some verbs are irregular. Hacer, to do, becomes iciste. So, what did you do, is que iciste tu.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✅",
                  "title": "Regular",
                  "body": "ver, viste, you saw or watched"
                },
                {
                  "emoji": "⚡",
                  "title": "Irregular",
                  "body": "hacer, hiciste, you did or made"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Fill the blank: ¿Qué ___ tú ayer? That means what did you do yesterday. Which form of hacer fits?",
            "say": "What did you do yesterday. Que blank tu ayer. Which form of acer fits?",
            "widget": {
              "w": "tapPick",
              "prompt": "¿Qué ___ tú ayer? (What did you do yesterday?)",
              "options": [
                {
                  "label": "haces (that is present: you do now)"
                },
                {
                  "label": "hiciste (you did, preterite)",
                  "correct": true
                },
                {
                  "label": "hacer (the plain verb, to do)"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Building the answer",
            "body": "Let's finish the movie question: ¿___ tú la película?",
            "reveal": [
              "The verb for to see or watch is ver, an -er verb.",
              "For tú in the preterite, -er verbs take the ending -iste.",
              "Ver plus -iste gives viste, so it is ¿Viste tú la película? Did you watch the movie?"
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The preterite is a finished action. For tu, a r verbs end in aste, and e r and i r verbs end in iste.",
            "emoji": "🎬",
            "takeaway": "The pretérito is a finished action. For tú, -ar verbs end in -aste and -er/-ir verbs end in -iste. Watch for irregulars like hiciste."
          }
        ]
      },
      {
        "id": "l.sp7places",
        "skillId": "sp.7.places",
        "subject": "spanish",
        "grade": 7,
        "title": "En la Ciudad: Finding Your Way",
        "subtitle": "Ask where things are and know what each place is for.",
        "steps": [
          {
            "kind": "hook",
            "title": "New city, one question",
            "body": "You are walking around a Spanish town and you really need a restroom. You cannot point forever. You need one clear question.",
            "say": "You are in a Spanish town and you need a restroom. You need one clear question."
          },
          {
            "kind": "concept",
            "title": "¿Dónde está...? asks where something is",
            "body": "To ask where a place is, start with ¿Dónde está and add the place. To ask where the bathroom is, you say ¿Dónde está el baño?",
            "analogy": "Think of ¿Dónde está...? as a key that unlocks any location. You just snap the place name onto the end.",
            "say": "To ask where a place is, say donde esta, then the place. Where is the bathroom is, donde esta el banyo?",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚻",
                  "title": "¿Dónde está el baño?",
                  "body": "Where is the bathroom?"
                },
                {
                  "emoji": "📚",
                  "title": "¿Dónde está la biblioteca?",
                  "body": "Where is the library?"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Know what each place is for",
            "body": "Vocabulary matters too. La biblioteca is the library, the place to borrow and read books. Do not mix it up with a librería, which is a bookstore where you buy them.",
            "say": "La biblioteca is the library, where you borrow and read books. El restaurante is where you eat a meal.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📖",
                  "title": "La biblioteca",
                  "body": "Library: borrow and read books"
                },
                {
                  "emoji": "🍽️",
                  "title": "El restaurante",
                  "body": "Restaurant: eat a meal"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: match each place",
            "body": "Sort each place by what you go there to do.",
            "say": "Sort each place by what you go there to do.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "read",
                  "label": "📚 Borrow and read books"
                },
                {
                  "id": "wash",
                  "label": "🚻 Use the restroom"
                },
                {
                  "id": "eat",
                  "label": "🍽️ Eat a meal"
                }
              ],
              "items": [
                {
                  "label": "la biblioteca",
                  "bucket": "read"
                },
                {
                  "label": "el baño",
                  "bucket": "wash"
                },
                {
                  "label": "el restaurante",
                  "bucket": "eat"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Donde esta, plus a place, asks where it is. And la biblioteca is the library.",
            "emoji": "🗺️",
            "takeaway": "¿Dónde está...? plus a place asks where it is. And la biblioteca is the library, where you borrow and read books."
          }
        ]
      },
      {
        "id": "l.sp8convo",
        "skillId": "sp.8.convo",
        "subject": "spanish",
        "grade": 8,
        "title": "Real Conversations, Not Textbook Spanish",
        "subtitle": "The little words locals actually say.",
        "steps": [
          {
            "kind": "hook",
            "title": "The word you hear a hundred times",
            "body": "You land in Spain and everyone keeps saying one word: vale, vale, vale. It is not in your vocab list, but you hear it constantly. What does it mean?",
            "say": "You land in Spain and everyone keeps saying, vale, vale. What does it mean?"
          },
          {
            "kind": "concept",
            "title": "Vale means okay, got it",
            "body": "In Spain, vale is how people say okay or got it. It is the glue of everyday talk, used to agree, confirm, or say sure.",
            "analogy": "Vale is Spain's version of okay. It is the little nod you give when everything is settled.",
            "say": "In Spain, vale means okay, or got it. It is the little nod that says everything is settled.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "👍",
                  "title": "Vale",
                  "body": "Okay / got it (very common in Spain)"
                },
                {
                  "emoji": "🙏",
                  "title": "Por favor",
                  "body": "Please, to stay polite"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Asking for the check politely",
            "body": "At a restaurant, waiters do not rush you. When you are ready to pay, you ask for it. La cuenta means the check, and adding por favor keeps it polite: La cuenta, por favor.",
            "say": "La cuenta means the check. To ask for it politely, say, la cuenta, por favor. The check, please.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧾",
                  "title": "La cuenta",
                  "body": "The check or bill"
                },
                {
                  "emoji": "😊",
                  "title": "La cuenta, por favor",
                  "body": "The check, please"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "Dinner is over and you want to pay. What do you say to the waiter?",
            "say": "Dinner is over and you want to pay. What do you say to the waiter?",
            "widget": {
              "w": "tapPick",
              "prompt": "You want the check. You politely say...",
              "options": [
                {
                  "label": "La cuenta, por favor",
                  "correct": true
                },
                {
                  "label": "¿Dónde está el baño?"
                },
                {
                  "label": "Vale, vale"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "In Spain, vale means okay. And to pay, you say, la cuenta, por favor.",
            "emoji": "💬",
            "takeaway": "In Spain, vale means okay or got it. And to pay, you ask La cuenta, por favor, the check, please."
          }
        ]
      },
      {
        "id": "l.sp8travel",
        "skillId": "sp.8.travel",
        "subject": "spanish",
        "grade": 8,
        "title": "De Viaje: When Things Go Sideways",
        "subtitle": "Two phrases that rescue any traveler.",
        "steps": [
          {
            "kind": "hook",
            "title": "Wrong turn in a strange city",
            "body": "You took a wrong turn, the map app died, and nothing looks familiar. You need to tell a stranger, quickly and clearly, that you are lost.",
            "say": "You took a wrong turn and nothing looks familiar. You need to tell someone that you are lost."
          },
          {
            "kind": "concept",
            "title": "Estoy perdido means I am lost",
            "body": "Being lost is a right-now situation, so you use estar. Estoy perdido means I am lost. A girl says estoy perdida, changing the ending to -a.",
            "analogy": "Perdido works like a mood you are in this moment, so it pairs with estoy, the right-now I am.",
            "say": "Being lost is happening right now, so use estar. Estoy perdido means I am lost. A girl says estoy perdida.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🧭",
                  "title": "Estoy perdido",
                  "body": "I am lost (boy speaking)"
                },
                {
                  "emoji": "🗺️",
                  "title": "Estoy perdida",
                  "body": "I am lost (girl speaking)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Asking someone to slow down",
            "body": "When a local answers too fast to follow, you ask them to slow down. Despacio means slowly. Más despacio, por favor means slower, please.",
            "say": "When someone speaks too fast, ask them to slow down. Mas despacio, por favor, means slower, please.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🐢",
                  "title": "Más despacio",
                  "body": "More slowly / slower"
                },
                {
                  "emoji": "🙏",
                  "title": "Más despacio, por favor",
                  "body": "Slower, please"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "The directions are coming at you way too fast. Fill the blank: Más ___, por favor.",
            "say": "The directions are too fast. Mas blank, por favor. Which word means slower?",
            "widget": {
              "w": "tapPick",
              "prompt": "Más ___, por favor. (Slower, please.)",
              "options": [
                {
                  "label": "despacio (slowly)",
                  "correct": true
                },
                {
                  "label": "perdido (lost)"
                },
                {
                  "label": "rápido (fast)"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Estoy perdido means I am lost. And mas despacio, por favor, asks someone to speak slower.",
            "emoji": "🐢",
            "takeaway": "Estoy perdido means I am lost. And Más despacio, por favor asks someone to speak slower."
          }
        ]
      },
      {
        "id": "l.sp9subjunctive",
        "skillId": "sp.9.subjunctive",
        "subject": "spanish",
        "grade": 9,
        "title": "The Subjunctive: For Wishes, Not Facts",
        "subtitle": "Spanish has a special mood for things that aren't certain.",
        "steps": [
          {
            "kind": "hook",
            "title": "Hoping for sun",
            "body": "There is a big trip tomorrow and you say, I hope the weather is good. But you cannot control the weather. It is a wish, not a fact. Spanish marks that difference with a whole different verb form.",
            "say": "You say, I hope the weather is good tomorrow. But it is a wish, not a fact. Spanish marks that with a different verb form."
          },
          {
            "kind": "concept",
            "title": "Certain vs. uncertain",
            "body": "When something is a fact you know, you use the normal indicative. When it is a wish, a doubt, or something uncertain, you switch to the subjunctive. Espero que, I hope that, opens the door to uncertainty, so it triggers the subjunctive.",
            "analogy": "The indicative is solid ground you can stand on. The subjunctive is the wobbly bridge of maybe, wishes and doubts that have not happened yet.",
            "say": "A fact you know uses the indicative. A wish or doubt uses the subjunctive. Espero que, I hope that, triggers the subjunctive.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🪨",
                  "title": "Indicative (certain)",
                  "body": "Sé que estudias. I know you study."
                },
                {
                  "emoji": "🌉",
                  "title": "Subjunctive (uncertain)",
                  "body": "Espero que estudies. I hope you study."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Building the weather wish",
            "body": "The idiom for good weather is hace buen tiempo, from the verb hacer. After espero que, hacer changes to its subjunctive form, haga. So you say Espero que haga buen tiempo mañana.",
            "say": "The weather idiom is ace buen tiempo. After espero que, acer becomes its subjunctive form, aga. Espero que aga buen tiempo mañana.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "☀️",
                  "title": "Fact",
                  "body": "Hace buen tiempo. The weather is good."
                },
                {
                  "emoji": "🤞",
                  "title": "Wish",
                  "body": "Espero que haga buen tiempo. I hope the weather is good."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: spot the fact",
            "body": "Three of these express a wish or doubt, so they need the subjunctive. One is a plain fact and needs NO subjunctive. Which one?",
            "say": "Three of these are wishes or doubts. One is a plain fact. Which one needs no subjunctive?",
            "widget": {
              "w": "tapPick",
              "prompt": "Which sentence needs NO subjunctive?",
              "options": [
                {
                  "label": "Sé que estudias mucho. (I know you study a lot)",
                  "correct": true
                },
                {
                  "label": "Espero que estudies mucho. (I hope you study a lot)"
                },
                {
                  "label": "Dudo que estudies mucho. (I doubt you study a lot)"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Why Sé que stays normal",
            "body": "Look at Sé que estudias mucho.",
            "reveal": [
              "Saber, to know, states something you are certain about.",
              "Certainty stands on solid ground, so it uses the indicative, estudias.",
              "Only wishes and doubts, like Espero que or Dudo que, cross into the subjunctive."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Facts you know stay indicative. Wishes and doubts, like espero que, trigger the subjunctive.",
            "emoji": "🌉",
            "takeaway": "Facts you know stay indicative. Wishes and doubts, like Espero que and Dudo que, trigger the subjunctive, such as haga."
          }
        ]
      },
      {
        "id": "l.sp9conditional",
        "skillId": "sp.9.conditional",
        "subject": "spanish",
        "grade": 9,
        "title": "El Condicional: The Polite \"Would\"",
        "subtitle": "How Spanish softens a request or an opinion.",
        "steps": [
          {
            "kind": "hook",
            "title": "Asking without demanding",
            "body": "You need a stranger to help carry a box. \"Ayúdame\" sounds like an order. There is a gentler way that means \"Could you...?\" and it makes people want to say yes.",
            "say": "You need help carrying a box. There is a gentler way to ask that means Could you, and it makes people want to say yes."
          },
          {
            "kind": "concept",
            "title": "The conditional is the -ía ending",
            "body": "To say \"would\" in Spanish, you usually keep the whole infinitive and add the ending -ía. Hablar becomes hablaría, comer becomes comería.",
            "analogy": "Think of -ía as a cushion you glue onto the end of a verb. It softens the landing, so a command turns into a polite maybe.",
            "say": "To say would, keep the infinitive and add the ending ía. Ablar becomes ablaría. Comer becomes comería.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🗣️",
                  "title": "Command",
                  "body": "Ayúdame. Help me. (blunt)"
                },
                {
                  "emoji": "🛋️",
                  "title": "Conditional",
                  "body": "¿Podría ayudarme? Could you help me? (soft)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Two verbs you will meet a lot",
            "body": "Poder and decir have short irregular stems, but they still take -ía. Poder gives podría (could), and decir gives diría (would say).",
            "say": "Poder gives podría, could. Decir gives diría, would say. Both keep the ía ending.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🙏",
                  "title": "podría",
                  "body": "from poder: ¿Podría ayudarme? Could you help me?"
                },
                {
                  "emoji": "💬",
                  "title": "diría",
                  "body": "from decir: Yo diría que sí. I would say yes."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: ask politely",
            "body": "You want to say \"Could you help me, please?\" Which word fills the blank? \"¿___ ayudarme, por favor?\"",
            "say": "You want to say Could you help me, please. Which word fills the blank? Podría ayudarme, por favor?",
            "widget": {
              "w": "tapPick",
              "prompt": "¿___ ayudarme, por favor? (Could you help me?)",
              "options": [
                {
                  "label": "Puede (you can, blunt)"
                },
                {
                  "label": "Podría (could you, polite)",
                  "correct": true
                },
                {
                  "label": "Poder (to be able)"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Softening an opinion",
            "body": "How do you gently say \"I would say it is a good idea\"?",
            "reveal": [
              "Start with decir, to say. Its conditional stem is dir-.",
              "Add the conditional ending -ía: dir + ía = diría.",
              "Yo diría que es una buena idea. I would say that it is a good idea, offered gently."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "The conditional adds ía to soften a verb. Podría means could you. Diría means I would say.",
            "emoji": "🛋️",
            "takeaway": "The conditional adds -ía to soften a verb. Podría means could you, and diría means I would say. It turns orders into polite maybes."
          }
        ]
      },
      {
        "id": "l.sp10reading",
        "skillId": "sp.10.reading",
        "subject": "spanish",
        "grade": 10,
        "title": "Reading Clues: Aunque and Porque",
        "subtitle": "Little connector words carry the whole meaning.",
        "steps": [
          {
            "kind": "hook",
            "title": "The rain that did not stop the game",
            "body": "A soccer final is played in the pouring rain and nobody leaves. To understand why, you do not need to know soccer. You need two small Spanish words.",
            "say": "A soccer final is played in the pouring rain and nobody leaves. To understand why, you need two small Spanish words."
          },
          {
            "kind": "concept",
            "title": "Aunque sets up a surprise",
            "body": "Aunque means although or even though. It warns you that what comes next goes against expectations, like a speed bump before a twist.",
            "analogy": "Aunque is a yield sign. It tells you: an obstacle is coming, but the sentence pushes through it anyway.",
            "say": "Aunque means although or even though. It warns you the next part goes against expectations, like a speed bump before a twist.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🌧️",
                  "title": "aunque",
                  "body": "although / even though. Aunque llovía... Even though it was raining..."
                },
                {
                  "emoji": "➡️",
                  "title": "porque",
                  "body": "because. ...porque era la final. ...because it was the final."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Porque gives you the reason",
            "body": "When a question asks ¿Por qué? (why?), hunt for porque (because) in the text. The words right after porque are your answer.",
            "say": "When a question asks por qué, why, hunt for porque, because, in the text. The words right after porque are your answer.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "❓",
                  "title": "¿Por qué?",
                  "body": "Two words: the question why."
                },
                {
                  "emoji": "✅",
                  "title": "porque",
                  "body": "One word: the answer, because."
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: read and answer",
            "body": "Read: \"Aunque llovía, el partido continuó porque era la final del campeonato.\" ¿Por qué continuó el partido?",
            "say": "Read: Aunque llovía, el partido continuó porque era la final del campeonato. Por qué continuó el partido? Why did the game continue?",
            "widget": {
              "w": "tapPick",
              "prompt": "¿Por qué continuó el partido? (Why did the game continue?)",
              "options": [
                {
                  "label": "Porque llovía (because it was raining)"
                },
                {
                  "label": "Porque era la final del campeonato (because it was the championship final)",
                  "correct": true
                },
                {
                  "label": "Porque los jugadores estaban cansados (because the players were tired)"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Aunque means although, it sets up a surprise. Porque means because, it gives the reason.",
            "emoji": "⚽",
            "takeaway": "Aunque means although, it sets up a surprise. Porque means because, it gives the reason. Find porque and you find the answer."
          }
        ]
      },
      {
        "id": "l.sp10idioms",
        "skillId": "sp.10.idioms",
        "subject": "spanish",
        "grade": 10,
        "title": "Modismos: When Words Don't Mean What They Say",
        "subtitle": "Two Spanish expressions you cannot translate word by word.",
        "steps": [
          {
            "kind": "hook",
            "title": "\"You're pulling my hair\"?",
            "body": "A friend says \"me estás tomando el pelo.\" Word for word that is \"you are taking my hair.\" Nobody is touching anyone's hair. So what is really going on?",
            "say": "A friend says me estás tomando el pelo. Word for word that is you are taking my hair. So what is really going on?"
          },
          {
            "kind": "concept",
            "title": "An idiom is a package deal",
            "body": "A modismo is a group of words whose meaning you cannot build from the pieces. You have to learn the whole phrase as one unit.",
            "analogy": "In English, \"pulling your leg\" has nothing to do with legs. Spanish idioms work the same way, the picture is a costume for a hidden meaning.",
            "say": "A modismo is a group of words whose meaning you cannot build from the pieces. In English, pulling your leg has nothing to do with legs. Spanish idioms work the same way.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "💇",
                  "title": "tomar el pelo",
                  "body": "Literally: take the hair. Really: to tease, to pull your leg."
                },
                {
                  "emoji": "🌳",
                  "title": "irse por las ramas",
                  "body": "Literally: go off into the branches. Really: to go off topic, avoid the point."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Picture the tree",
            "body": "Irse por las ramas paints someone climbing out onto the branches instead of staying by the trunk. The trunk is the main point, the branches are distractions.",
            "analogy": "Imagine asking a simple question and watching the person wander out to every little twig except the one that answers you.",
            "say": "Irse por las ramas paints someone climbing out onto the branches instead of staying by the trunk. The trunk is the main point, the branches are distractions."
          },
          {
            "kind": "try",
            "title": "Your turn: sort the situations",
            "body": "Read each situation and drop it under the idiom it matches.",
            "say": "Read each situation and drop it under the idiom it matches. Is it tomar el pelo, teasing, or irse por las ramas, going off topic?",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "pelo",
                  "label": "tomar el pelo (tease)"
                },
                {
                  "id": "ramas",
                  "label": "irse por las ramas (go off topic)"
                }
              ],
              "items": [
                {
                  "label": "Your cousin swears school is closed, then laughs, it was a joke.",
                  "bucket": "pelo"
                },
                {
                  "label": "You ask a yes-or-no question and get a ten-minute story about the weather.",
                  "bucket": "ramas"
                },
                {
                  "label": "A friend keeps joking that you won a prize you never won.",
                  "bucket": "pelo"
                },
                {
                  "label": "The speaker never actually reaches the point of the meeting.",
                  "bucket": "ramas"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Tomar el pelo means to tease. Irse por las ramas means to wander off the point. Learn idioms as whole packages.",
            "emoji": "🌳",
            "takeaway": "Tomar el pelo means to tease or pull your leg. Irse por las ramas means to wander off the point. Learn idioms as whole packages, never word by word."
          }
        ]
      },
      {
        "id": "l.sp11advanced",
        "skillId": "sp.11.advanced",
        "subject": "spanish",
        "grade": 11,
        "title": "Por vs. Para and the Passive Voice",
        "subtitle": "Two advanced structures that trip up almost everyone.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two words, one English \"for\"",
            "body": "Por and para both translate as \"for,\" but they are not interchangeable. Pick the wrong one and a native speaker notices instantly. There is a clean way to keep them straight.",
            "say": "Por and para both translate as for, but they are not interchangeable. There is a clean way to keep them straight."
          },
          {
            "kind": "concept",
            "title": "Para points forward to a goal",
            "body": "Use para for purpose: the goal, the destination, the reason you are doing something. \"In order to\" is almost always para.",
            "analogy": "Para is an arrow aimed at a target ahead of you. Por is an arrow pointing back at a cause behind you.",
            "say": "Use para for purpose: the goal or the reason you are doing something. In order to is almost always para. Para is an arrow aimed forward at a target. Por points back at a cause.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🎯",
                  "title": "para = purpose",
                  "body": "Trabajo para ganar dinero. I work in order to earn money."
                },
                {
                  "emoji": "🔙",
                  "title": "por = cause/exchange",
                  "body": "Gracias por tu ayuda. Thanks for (because of) your help."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "The passive voice: ser + past participle",
            "body": "In the passive voice the subject receives the action instead of doing it. Spanish builds it with ser plus a past participle, and por names who did it.",
            "analogy": "Active is \"the chef cooked the meal.\" Passive flips the spotlight: \"the meal was cooked,\" the doer steps into the background behind por.",
            "say": "In the passive voice the subject receives the action. Spanish builds it with ser plus a past participle, and por names who did it. El libro fue escrito por una autora chilena. The book was written by a Chilean author.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "✍️",
                  "title": "Passive",
                  "body": "El libro fue escrito por una autora chilena. The book was written by a Chilean author."
                },
                {
                  "emoji": "🔧",
                  "title": "The formula",
                  "body": "ser (fue) + past participle (escrito) + por + doer"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: purpose or not?",
            "body": "\"I work in order to earn money.\" Which word expresses that purpose? \"Trabajo ___ ganar dinero.\"",
            "say": "I work in order to earn money. Which word expresses that purpose? Trabajo, blank, ganar dinero.",
            "widget": {
              "w": "tapPick",
              "prompt": "Trabajo ___ ganar dinero. (I work in order to earn money.)",
              "options": [
                {
                  "label": "por"
                },
                {
                  "label": "para",
                  "correct": true
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Spotting the passive",
            "body": "Why is \"El libro fue escrito por una autora chilena\" passive?",
            "reveal": [
              "The subject, el libro, does not act. It receives the action of being written.",
              "Fue is ser in the past, and escrito is the past participle of escribir.",
              "Ser plus past participle is the passive voice, and por una autora chilena tells us who did it."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Para points forward to a purpose. The passive voice is ser plus a past participle, with por naming who did it.",
            "emoji": "🎯",
            "takeaway": "Para points forward to a purpose (in order to). The passive voice is ser plus a past participle, with por naming who did the action."
          }
        ]
      },
      {
        "id": "l.sp11professional",
        "skillId": "sp.11.professional",
        "subject": "spanish",
        "grade": 11,
        "title": "Español Profesional: Email That Sounds Polished",
        "subtitle": "The exact phrases used in real Spanish business writing.",
        "steps": [
          {
            "kind": "hook",
            "title": "The email that gets a yes",
            "body": "You are writing to a manager in Spanish. You need to attach a file and ask for a couple more days. Casual translations sound clumsy. Professionals reach for set phrases.",
            "say": "You are writing to a manager in Spanish. You need to attach a file and ask for a couple more days. Professionals reach for set phrases."
          },
          {
            "kind": "concept",
            "title": "\"Adjunto el documento\"",
            "body": "To say you are attaching a file, the standard business phrase is \"Adjunto el documento.\" Adjunto literally means \"attached,\" and it opens the sentence cleanly.",
            "analogy": "It is the Spanish version of the fixed English line \"Please find attached.\" You do not reinvent it, you reuse it every time.",
            "say": "To say you are attaching a file, the standard business phrase is Adjunto el documento. It is the Spanish version of Please find attached. You reuse it every time.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "📎",
                  "title": "Professional",
                  "body": "Adjunto el documento. I am attaching the document."
                },
                {
                  "emoji": "🙅",
                  "title": "Too casual",
                  "body": "Te mando el archivo. (fine with friends, not formal)"
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Ask with the conditional to stay polite",
            "body": "To request a short delay, use \"¿Sería posible extender el plazo unos días?\" Sería is the conditional of ser, and it makes the request soft and courteous. Plazo means deadline.",
            "analogy": "\"Sería posible...\" is like knocking before entering. It asks permission instead of announcing a demand.",
            "say": "To request a short delay, use Sería posible extender el plazo unos días? Sería is the conditional of ser, and it makes the request soft and courteous. Plazo means deadline.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚪",
                  "title": "Courteous",
                  "body": "¿Sería posible extender el plazo unos días? Would it be possible to extend the deadline a few days?"
                },
                {
                  "emoji": "❌",
                  "title": "Blunt",
                  "body": "Necesito más tiempo. (sounds demanding)"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: attach the file",
            "body": "You want to write \"I am attaching the document\" in a professional email. Which sentence is correct?",
            "say": "You want to write I am attaching the document in a professional email. Which sentence is correct?",
            "widget": {
              "w": "tapPick",
              "prompt": "\"I am attaching the document\" (professional email)",
              "options": [
                {
                  "label": "Adjunto el documento.",
                  "correct": true
                },
                {
                  "label": "Aquí tienes el papel."
                },
                {
                  "label": "Te paso la cosa esa."
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Use Adjunto el documento to attach a file, and Sería posible extender el plazo unos días to politely ask for more time.",
            "emoji": "📎",
            "takeaway": "Use \"Adjunto el documento\" to attach a file, and \"¿Sería posible extender el plazo unos días?\" to politely ask for more time. Set phrases make you sound professional."
          }
        ]
      },
      {
        "id": "l.sp12fluency",
        "skillId": "sp.12.fluency",
        "subject": "spanish",
        "grade": 12,
        "title": "Sounding Fluent, Not Just Correct",
        "subtitle": "The words that make Spanish sound advanced.",
        "steps": [
          {
            "kind": "hook",
            "title": "The interview question",
            "body": "You are in a job interview, in Spanish, and they ask: ¿Cuáles son sus fortalezas? What are your strengths? A shrug and \"soy bueno\" will not get you the job. Fluent Spanish has a gear for moments like this.",
            "say": "In a Spanish job interview they ask, cuáles son sus fortalezas. What are your strengths? You need the advanced gear."
          },
          {
            "kind": "concept",
            "title": "Fluency is having a higher gear",
            "body": "A beginner says the idea. A fluent speaker frames it. Instead of \"soy organizado\", you say \"Considero que soy una persona organizada y responsable.\" Same idea, more polished frame.",
            "analogy": "It is like a bike with gears. Basic Spanish is one gear that always works. Fluency is shifting up: same road, smoother and more powerful.",
            "say": "A beginner says, soy organizado. A fluent speaker frames it: considero que soy una persona organizada y responsable.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "🚲",
                  "title": "Low gear",
                  "body": "Soy organizado."
                },
                {
                  "emoji": "🏎️",
                  "title": "High gear",
                  "body": "Considero que soy una persona organizada y responsable."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Connectors are the gears of an essay",
            "body": "Writing works the same way. Cheap connectors like \"pero\" (but) sound casual. Essay-level connectors like \"no obstante\" mean nevertheless or however, and they make an argument sound mature.",
            "say": "In writing, no obstante means nevertheless or however. Sin embargo means however. Por lo tanto means therefore.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "no obstante",
                  "body": "nevertheless / however"
                },
                {
                  "title": "sin embargo",
                  "body": "however"
                },
                {
                  "title": "por lo tanto",
                  "body": "therefore"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn",
            "body": "You are reading a Spanish essay and hit the phrase \"no obstante\". What does it mean?",
            "say": "In an essay, no obstante means what?",
            "widget": {
              "w": "tapPick",
              "prompt": "In an essay, \"no obstante\" means…",
              "options": [
                {
                  "label": "nevertheless / however",
                  "correct": true
                },
                {
                  "label": "therefore / so"
                },
                {
                  "label": "for example"
                },
                {
                  "label": "in the end"
                }
              ]
            }
          },
          {
            "kind": "example",
            "title": "Building an interview answer",
            "body": "How to answer ¿Cuáles son sus fortalezas? like a fluent speaker.",
            "reveal": [
              "Start with a formal frame: Considero que soy una persona… (I consider myself a person who is…)",
              "Add two concrete traits: …organizada y responsable. (organized and responsible.)",
              "Full answer: Considero que soy una persona organizada y responsable. That is interview-ready Spanish."
            ]
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Fluency is a higher gear. Frame your ideas and use connectors like no obstante, nevertheless.",
            "emoji": "💼",
            "takeaway": "Fluency is a higher gear: frame your ideas (Considero que soy…) and use essay connectors like no obstante, which means nevertheless."
          }
        ]
      },
      {
        "id": "l.sp12register",
        "skillId": "sp.12.register",
        "subject": "spanish",
        "grade": 12,
        "title": "Register: Reading the Room in Spanish",
        "subtitle": "The same idea, dressed for the occasion.",
        "steps": [
          {
            "kind": "hook",
            "title": "Two disagreements",
            "body": "You disagree with someone. To a friend you might say \"no, para nada.\" But in a formal meeting, that same bluntness sounds rude. Spanish, like a closet, has clothes for every occasion.",
            "say": "You disagree with someone. To a friend, no problem. In a formal meeting, blunt sounds rude. Spanish has a different outfit for each setting."
          },
          {
            "kind": "concept",
            "title": "Register is your outfit",
            "body": "Register means how formal your language is. Casual is for friends. Formal is for interviews, professors, and meetings. To disagree formally, you soften it: \"Con todo respeto, no estoy de acuerdo.\" With all due respect, I disagree.",
            "analogy": "Register is like clothing. Flip-flops are fine at the beach and wrong at a wedding. \"No estoy de acuerdo\" is the same words, and \"con todo respeto\" is the jacket you put over it.",
            "say": "To disagree formally, soften it: con todo respeto, no estoy de acuerdo. With all due respect, I disagree.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "emoji": "😎",
                  "title": "Casual",
                  "body": "No, para nada."
                },
                {
                  "emoji": "🤵",
                  "title": "Formal",
                  "body": "Con todo respeto, no estoy de acuerdo."
                }
              ]
            }
          },
          {
            "kind": "show",
            "title": "Casual has regional flavor: vos",
            "body": "In Argentina and parts of Central America, informal speech uses \"vos\" instead of \"tú\". This is called voseo. So instead of \"tú tienes\", they say \"vos tenés\".",
            "say": "In Argentina and parts of Central America, informal speech uses vos instead of tú. Instead of tú tienes, they say vos tenés. This is called voseo.",
            "widget": {
              "w": "sideBySide",
              "cards": [
                {
                  "title": "Standard tú",
                  "body": "tú tienes"
                },
                {
                  "title": "Voseo (Argentina)",
                  "body": "vos tenés"
                }
              ]
            }
          },
          {
            "kind": "try",
            "title": "Your turn: sort the register",
            "body": "Drag each phrase into the setting where it fits.",
            "say": "Sort each phrase into formal or casual.",
            "widget": {
              "w": "sortBuckets",
              "buckets": [
                {
                  "id": "formal",
                  "label": "Formal"
                },
                {
                  "id": "casual",
                  "label": "Casual"
                }
              ],
              "items": [
                {
                  "label": "Con todo respeto, no estoy de acuerdo",
                  "bucket": "formal"
                },
                {
                  "label": "¿Cómo está usted?",
                  "bucket": "formal"
                },
                {
                  "label": "¿Qué onda?",
                  "bucket": "casual"
                },
                {
                  "label": "vos tenés razón",
                  "bucket": "casual"
                }
              ]
            }
          },
          {
            "kind": "recap",
            "title": "Remember this",
            "say": "Register is your outfit. Soften formal disagreement with con todo respeto, and casual vos replaces tú in Argentina.",
            "emoji": "🧥",
            "takeaway": "Register is your outfit. Soften formal disagreement with \"Con todo respeto\", and remember that casual \"vos\" replaces \"tú\" in Argentina, the voseo."
          }
        ]
      }
    ]
  };

  window.GALLOP_LESSONS = L;
  BP.lessonsFor = (subject) => L[subject] || [];
  BP.lessonById = (id) => Object.values(L).flat().find(l => l.id === id);
  // Bank-backed skills without a lesson of their own borrow the sibling lesson that
  // teaches the same concept, so the lesson-before-practice flow covers them too.
  const LESSON_ALIAS = {
    'm.3.multimeadow': 'm.3.mult', 'm.4.fracpizza': 'm.4.equivfrac', 'm.5.decimoney': 'm.5.decops',
    'm.6.ratesreal': 'm.6.ratio', 'm.7.datadetect': 'm.7.prob', 'm.8.funcstories': 'm.8.slope',
    'm.8.prealgebra': 'm.7.equation', 'm.10.trig': 'm.10.triangles', 'm.11.explog': 'm.11.exponential',
    'm.11.statistics': 'm.7.prob', 'm.11.precalc': 'm.11.functions', 'm.12.calculus': 'm.12.limits',
    'e.1.rhyme': 'e.k.rhyme', 'e.3.storydet': 'e.3.reading', 'e.5.figlang': 'e.4.figurative',
    'e.7.argument': 'e.7.evidence', 'e.8.themevoice': 'e.8.voice', 'e.11.litanalysis': 'e.11.analysis',
    's.1.weather': 's.k.weather', 's.4.ecosystems': 's.5.ecosystems', 's.7.matter': 's.7.chemistry',
    's.8.space': 's.4.space', 's.9.genetics': 's.9.biology', 's.11.physics': 's.11.physics2',
    'sp.1.colors': 'sp.0.colors', 'sp.3.family': 'sp.1.family', 'sp.5.verbs': 'sp.5.eri',
    'sp.6.routine': 'sp.5.daily', 'sp.8.culture': 'sp.8.travel', 'sp.10.subjunctive': 'sp.9.subjunctive'
  };
  BP.lessonForSkill = (subject, skillId) => {
    const list = L[subject] || [];
    const direct = list.find(l => l.skillId === skillId);
    if (direct) return direct;
    const alias = LESSON_ALIAS[skillId];
    return alias ? list.find(l => l.skillId === alias) : undefined;
  };
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
      <div class="learn-tabs">
        <button class="learn-tab ${!only ? 'active' : ''}" onclick="location.hash='#learn'">All subjects</button>
        ${['math', 'english', 'science', 'spanish'].map(s => `<button class="learn-tab ${only === s ? 'active' : ''}" style="--sub:${SUB[s].color}" onclick="location.hash='#learn/${s}'">${SUB[s].emoji} ${SUB[s].name}</button>`).join('')}
      </div>
      <input id="learn-search" class="learn-search" type="search" placeholder="🔍 Search lessons… (fractions, verbs, planets)" aria-label="Search lessons">
      ${subjects.map(section).join('')}
      <p id="learn-none" class="muted center" style="display:none;margin-top:18px">No lessons match that — try a shorter word like "add" or "read".</p>
    </div>`);
    wireChrome();
    document.querySelectorAll('.learn-card').forEach(c => c.onclick = () => { Sound.click(); location.hash = '#teach/' + c.dataset.id; });
    // Live search: filter lesson cards by title/subtitle/grade so a parent can jump
    // straight to "story problems" or "subtraction" without scrolling four subjects.
    const sIn = $('#learn-search');
    if (sIn) sIn.oninput = () => {
      const t = sIn.value.trim().toLowerCase();
      let shown = 0;
      document.querySelectorAll('.learn-card').forEach(c => {
        const hit = !t || c.textContent.toLowerCase().includes(t);
        c.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      document.querySelectorAll('.learn-subhead, .learn-grid').forEach(el => {
        if (el.classList.contains('learn-grid')) {
          const any = [...el.querySelectorAll('.learn-card')].some(c => c.style.display !== 'none');
          el.style.display = any ? '' : 'none';
          if (el.previousElementSibling && el.previousElementSibling.classList.contains('learn-subhead')) el.previousElementSibling.style.display = any ? '' : 'none';
        }
      });
      const none = $('#learn-none'); if (none) none.style.display = shown ? 'none' : 'block';
    };
  });
})();
