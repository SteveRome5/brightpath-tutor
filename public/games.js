/* Gallop Learning Academy — Play Zone: games, avatar builder, buddies */
'use strict';
(() => {
  const { $, app, esc, api, route, topbar, wireChrome, showError, State, Sound, Voice, Confetti, AVATARS, ITEM_EMOJI, avatarHTML } = window.BP;

  const kidId = () => State.me.role === 'kid' ? State.me.kid.id : null;
  function needKid() { if (State.me.role !== 'kid') { location.hash = '#kid-login'; return true; } return false; }

  // Spend a token, run the game; friendly paywall if broke
  async function gated(game, start) {
    try {
      const r = await api(`/play/${kidId()}/spend-token`, { method: 'POST', body: { game } });
      Sound.badge();
      start(r.tokensLeft);
    } catch (e) {
      app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
        <div class="big-emoji">🎟️</div><h2>You need a Play Token!</h2>
        <p class="muted" style="margin:10px 0 18px">${esc(e.data && e.data.message || 'Answer 5 questions correctly in any subject to earn one!')}</p>
        <button class="btn green" onclick="location.hash='#home'">Go Learn & Earn →</button>
        <button class="btn ghost small" style="color:#6C5CE7;border-color:#6C5CE7;margin-left:8px" onclick="location.hash='#play'">Back</button>
      </div></div>`);
      wireChrome();
    }
  }

  async function finishGame(game, score, title, lines) {
    try { await api(`/play/${kidId()}/score`, { method: 'POST', body: { game, score } }); } catch (e) {}
    Confetti.burst(150); Sound.levelup();
    app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
      <div class="big-emoji">🏆</div><h2>${esc(title)}</h2>
      <div class="summary-stats"><div class="sstat"><div class="n">${score}</div>score</div><div class="sstat"><div class="n">+2</div>🪙 coins</div></div>
      <p class="muted">${esc(lines || '')}</p>
      <div style="margin-top:14px">
        <button class="btn green" onclick="location.hash='#play'">Play Zone →</button>
        <button class="btn" style="margin-left:8px" onclick="location.hash='#home'">Back to Learning</button>
      </div>
    </div></div>`);
    wireChrome();
  }

  // ======================= PLAY ZONE HOME =======================
  route('play', async () => {
    if (needKid()) return;
    const s = await api(`/play/${kidId()}/status`);
    const k = s.kid;
    const games = [
      { id: 'memory', emoji: '🃏', name: 'Memory Match', desc: 'Flip cards, match pairs — Spanish words, math facts & more!' },
      { id: 'wordsearch', emoji: '🔍', name: 'Word Search', desc: 'Hunt hidden words in the letter jungle' },
      { id: 'code', emoji: '🤖', name: 'Code Quest', desc: 'Program Robo the robot to reach the star' },
      { id: 'room', emoji: '🏠', name: 'Room Designer', desc: 'Decorate rooms & crack area puzzles' },
      { id: 'art', emoji: '🎨', name: 'Art Studio', desc: 'Draw with step-by-step guides — so cute!' }
    ];
    app().innerHTML = topbar(`<div class="container">
      <div class="kid-header">
        <div class="avatar-big">${avatarHTML(k)}</div>
        <div><h1>🕹️ Play Zone</h1>
          <div class="stat-chips" style="margin-top:8px">
            <span class="chip">🎟️ ${k.play_tokens} tokens</span>
            <span class="chip">🪙 ${k.coins} coins</span>
            <span class="chip">📈 ${5 - (s.correctSinceToken % 5)} answers to next token</span>
          </div>
        </div>
        <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#home'">← Subjects</button></div>
      </div>
      <p style="color:#fff;opacity:.9;margin-bottom:14px">Each game costs 1 🎟️ — every 5 correct answers in your lessons earns a new one. Learn to play! 💪</p>
      <div class="subject-grid">
        ${games.map(g => `
          <div class="subject-card game-card" data-g="${g.id}">
            <div class="blob"></div>
            <div class="semoji">${g.emoji}</div>
            <h3>${g.name}</h3>
            <div class="lvl">${esc(g.desc)}</div>
            <div class="lvl" style="margin-top:6px;font-size:.85rem">🏅 Best: ${s.best[g.id].best} · Played ${s.best[g.id].plays}×</div>
            <button class="btn sun small" style="margin-top:12px">Play (1 🎟️) →</button>
          </div>`).join('')}
      </div>
    </div>`);
    wireChrome();
    document.querySelectorAll('.game-card').forEach(el => el.onclick = () => { Sound.click(); location.hash = '#game/' + el.dataset.g; });
  });

  // ======================= GAME DISPATCH =======================
  route('game', async (which) => {
    if (needKid()) return;
    const starters = { memory: startMemory, wordsearch: startWordSearch, code: startCode, room: startRoom, art: startArt };
    const fn = starters[which];
    if (!fn) { location.hash = '#play'; return; }
    await gated(which, fn);
  });

  // ======================= MEMORY MATCH =======================
  const MEMORY_SETS = {
    spanish: [['🐶', 'perro'], ['🐱', 'gato'], ['🍎', 'manzana'], ['💧', 'agua'], ['🥛', 'leche'], ['🧀', 'queso'], ['🐟', 'pez'], ['🐴', 'caballo'], ['🍞', 'pan'], ['🐦', 'pájaro']],
    math: [['3×4', '12'], ['6×7', '42'], ['8×8', '64'], ['9×6', '54'], ['12÷4', '3'], ['45÷9', '5'], ['7+8', '15'], ['16−9', '7'], ['5×9', '45'], ['11×11', '121']],
    words: [['🌞', 'sun'], ['🌈', 'rainbow'], ['🦋', 'butterfly'], ['🌊', 'ocean'], ['⭐', 'star'], ['🌸', 'flower'], ['🌙', 'moon'], ['🔥', 'fire'], ['❄️', 'snow'], ['🌳', 'tree']]
  };
  function startMemory() {
    const setName = ['spanish', 'math', 'words'][Math.floor(Math.random() * 3)];
    const pairs = MEMORY_SETS[setName].slice().sort(() => Math.random() - .5).slice(0, 6);
    const cards = pairs.flatMap(([a, b], i) => [{ v: a, p: i }, { v: b, p: i }]).sort(() => Math.random() - .5);
    let flipped = [], matched = new Set(), moves = 0, lock = false;
    const t0 = Date.now();
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🃏 Memory Match — ${setName === 'spanish' ? '🌎 Spanish' : setName === 'math' ? '🔢 Math Facts' : '📚 Words'}</b><b>Moves: ${moves}</b></div>
        <div class="mem-grid">
          ${cards.map((c, i) => `
            <button class="mem-card ${matched.has(c.p) ? 'matched' : flipped.includes(i) ? 'up' : ''}" data-i="${i}">
              <span>${matched.has(c.p) || flipped.includes(i) ? esc(c.v) : '❓'}</span>
            </button>`).join('')}
        </div>
        <p class="center" style="color:#fff;margin-top:14px">Match each picture or problem with its pair!</p>
      </div>`);
      wireChrome();
      document.querySelectorAll('.mem-card').forEach(el => el.onclick = () => flip(Number(el.dataset.i)));
    }
    function flip(i) {
      if (lock || flipped.includes(i) || matched.has(cards[i].p)) return;
      Sound.click();
      flipped.push(i);
      if (flipped.length === 2) {
        moves++;
        const [a, b] = flipped;
        if (cards[a].p === cards[b].p && a !== b) {
          matched.add(cards[a].p); Sound.correct(); Confetti.burst(30); flipped = [];
          if (matched.size === 6) {
            const secs = Math.round((Date.now() - t0) / 1000);
            const score = Math.max(10, 200 - moves * 10 - secs);
            setTimeout(() => finishGame('memory', score, 'All pairs matched! 🧠', `${moves} moves in ${secs} seconds. Fewer moves = bigger score!`), 600);
            render(); return;
          }
        } else {
          lock = true; Sound.wrong();
          setTimeout(() => { flipped = []; lock = false; render(); }, 900);
        }
      }
      render();
    }
    render();
  }

  // ======================= WORD SEARCH =======================
  const WS_WORDS = {
    little: ['CAT', 'SUN', 'DOG', 'STAR', 'MOON', 'FISH', 'TREE', 'BIRD', 'CAKE', 'FROG', 'BEAR', 'SHIP'],
    big: ['PLANET', 'ROCKET', 'CASTLE', 'DRAGON', 'GARDEN', 'BRIDGE', 'JUNGLE', 'WIZARD', 'PIRATE', 'VOLCANO'],
    spanish: ['GATO', 'PERRO', 'AGUA', 'ROJO', 'AZUL', 'CASA', 'LUNA', 'FLOR', 'LECHE', 'VERDE']
  };
  function startWordSearch() {
    const grade = State.me.kid.grade || 0;
    const setName = Math.random() < .34 ? 'spanish' : grade <= 2 ? 'little' : 'big';
    const size = grade <= 2 ? 8 : 10;
    const words = WS_WORDS[setName].slice().sort(() => Math.random() - .5).slice(0, 5).filter(w => w.length <= size);
    const grid = Array.from({ length: size }, () => Array(size).fill(''));
    const dirs = grade <= 2 ? [[0, 1], [1, 0]] : [[0, 1], [1, 0], [1, 1]];
    const placed = [];
    for (const w of words) {
      for (let tries = 0; tries < 200; tries++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r0 = Math.floor(Math.random() * (size - (dr ? w.length : 1)));
        const c0 = Math.floor(Math.random() * (size - (dc ? w.length : 1)));
        let ok = true;
        for (let i = 0; i < w.length; i++) { const ch = grid[r0 + dr * i][c0 + dc * i]; if (ch && ch !== w[i]) { ok = false; break; } }
        if (!ok) continue;
        for (let i = 0; i < w.length; i++) grid[r0 + dr * i][c0 + dc * i] = w[i];
        placed.push(w); break;
      }
    }
    const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = AZ[Math.floor(Math.random() * 26)];
    let found = new Set(), sel = [], t0 = Date.now();
    function cellKey(r, c) { return r + ',' + c; }
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🔍 Word Search ${setName === 'spanish' ? '— 🌎 ¡en español!' : ''}</b><b>${found.size}/${placed.length} found</b></div>
        <div class="ws-grid" style="grid-template-columns:repeat(${size},1fr)">
          ${grid.map((row, r) => row.map((ch, c) => {
            const inSel = sel.some(s => s.r === r && s.c === c);
            const inFound = [...found].some(w => wordCells(w).some(x => x.r === r && x.c === c));
            return `<button class="ws-cell ${inFound ? 'found' : inSel ? 'sel' : ''}" data-r="${r}" data-c="${c}">${ch}</button>`;
          }).join('')).join('')}
        </div>
        <div class="badge-shelf" style="justify-content:center;margin-top:14px">
          ${placed.map(w => `<div class="badge-item" style="${found.has(w) ? 'text-decoration:line-through;opacity:.5' : ''}">${w}</div>`).join('')}
        </div>
        <p class="center" style="color:#fff;margin-top:10px">Tap the FIRST letter, then the LAST letter of a word!</p>
      </div>`);
      wireChrome();
      document.querySelectorAll('.ws-cell').forEach(el => el.onclick = () => pick(Number(el.dataset.r), Number(el.dataset.c)));
    }
    const wordPos = {};
    function wordCells(w) {
      if (wordPos[w]) return wordPos[w];
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1]]) {
        let ok = true;
        for (let i = 0; i < w.length; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr >= size || cc >= size || grid[rr][cc] !== w[i]) { ok = false; break; }
        }
        if (ok) { wordPos[w] = Array.from({ length: w.length }, (_, i) => ({ r: r + dr * i, c: c + dc * i })); return wordPos[w]; }
      }
      return [];
    }
    function pick(r, c) {
      Sound.click();
      sel.push({ r, c });
      if (sel.length === 2) {
        const [a, b] = sel;
        const hit = placed.find(w => {
          const cells = wordCells(w);
          return cells.length && ((cells[0].r === a.r && cells[0].c === a.c && cells[cells.length - 1].r === b.r && cells[cells.length - 1].c === b.c) ||
            (cells[0].r === b.r && cells[0].c === b.c && cells[cells.length - 1].r === a.r && cells[cells.length - 1].c === a.c));
        });
        if (hit && !found.has(hit)) {
          found.add(hit); Sound.correct(); Confetti.burst(40);
          if (found.size === placed.length) {
            const secs = Math.round((Date.now() - t0) / 1000);
            setTimeout(() => finishGame('wordsearch', Math.max(20, 300 - secs), 'Every word found! 🔎', `Solved in ${secs} seconds!`), 500);
          }
        } else if (!hit) Sound.wrong();
        sel = [];
      }
      render();
    }
    render();
  }

  // ======================= CODE QUEST =======================
  const CODE_LEVELS = [
    { size: 4, start: [3, 0], goal: [3, 3], walls: [], hint: 'Just march right!' },
    { size: 4, start: [3, 0], goal: [0, 3], walls: [], hint: 'Rights and ups!' },
    { size: 4, start: [3, 0], goal: [0, 3], walls: ['2,1', '1,2'], hint: 'Dodge the rocks!' },
    { size: 5, start: [4, 0], goal: [0, 4], walls: ['3,1', '2,2', '1,3'], hint: 'Zig-zag like stairs!' },
    { size: 5, start: [4, 2], goal: [0, 2], walls: ['2,2', '2,1', '2,3'], hint: 'The wall blocks the middle — go around!' },
    { size: 5, start: [2, 0], goal: [2, 4], walls: ['2,2', '1,2', '3,2'], hint: 'Over or under the wall?' }
  ];
  function startCode() {
    let levelIdx = 0, program = [], score = 0;
    function lvl() { return CODE_LEVELS[levelIdx]; }
    function render(msg, robot) {
      const L = lvl();
      const pos = robot || L.start;
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🤖 Code Quest — Level ${levelIdx + 1}/${CODE_LEVELS.length}</b><b>Score: ${score}</b></div>
        <div class="code-grid" style="grid-template-columns:repeat(${L.size},1fr)">
          ${Array.from({ length: L.size }, (_, r) => Array.from({ length: L.size }, (_, c) => {
            const isRobot = pos[0] === r && pos[1] === c;
            const isGoal = L.goal[0] === r && L.goal[1] === c;
            const isWall = L.walls.includes(r + ',' + c);
            return `<div class="code-cell">${isRobot ? '🤖' : isGoal ? '⭐' : isWall ? '🪨' : ''}</div>`;
          }).join('')).join('')}
        </div>
        <div class="center" style="margin-top:12px">
          <button class="btn small" data-cmd="up">⬆️ Up</button>
          <button class="btn small" data-cmd="down">⬇️ Down</button>
          <button class="btn small" data-cmd="left">⬅️ Left</button>
          <button class="btn small" data-cmd="right">➡️ Right</button>
        </div>
        <div class="card" style="margin-top:12px;padding:14px">
          <b>My Program:</b> <span id="prog">${program.length ? program.map(c => ({ up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' })[c]).join(' ') : '<span class="muted">tap arrows to build it…</span>'}</span>
          <div style="margin-top:10px">
            <button class="btn green small" id="run-btn">▶️ RUN</button>
            <button class="btn coral small" id="clear-btn">🗑️ Clear</button>
            <span class="muted" style="margin-left:8px">💡 ${esc(L.hint)}</span>
          </div>
          ${msg ? `<div class="feedback ${msg.good ? 'good' : 'bad'}" style="display:block;margin-top:10px">${esc(msg.text)}</div>` : ''}
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => { if (program.length < 20) { program.push(b.dataset.cmd); Sound.click(); render(); } });
      $('#run-btn').onclick = run;
      $('#clear-btn').onclick = () => { program = []; Sound.wrong(); render(); };
    }
    async function run() {
      const L = lvl();
      let [r, c] = L.start;
      for (const cmd of program) {
        const [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[cmd];
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= L.size || nc >= L.size || L.walls.includes(nr + ',' + nc)) {
          Sound.wrong();
          render({ good: false, text: 'CRASH! 💥 Robo hit something. Debug your program and try again!' }, [r, c]);
          return;
        }
        r = nr; c = nc;
        render(null, [r, c]);
        await new Promise(res => setTimeout(res, 260));
      }
      if (r === L.goal[0] && c === L.goal[1]) {
        const bonus = Math.max(10, 60 - program.length * 5);
        score += bonus;
        Sound.correct(); Confetti.burst(60);
        program = [];
        if (levelIdx === CODE_LEVELS.length - 1) { finishGame('code', score, 'All levels programmed! 👩‍💻', 'Shorter programs earn bigger bonuses — just like real coding!'); return; }
        levelIdx++;
        render({ good: true, text: `⭐ Reached the star! +${bonus} points. Next level!` });
      } else {
        Sound.wrong();
        render({ good: false, text: 'Robo stopped before the star. Add more steps!' }, [r, c]);
      }
    }
    render();
  }

  // ======================= ROOM DESIGNER =======================
  const FURNITURE = ['🛏️', '🛋️', '🪑', '🪴', '📚', '🖼️', '🧸', '💡', '🎸', '🏀', '🖥️', '🐠'];
  const ROOM_CHALLENGES = [
    { text: 'Free build! Design your dream room. 🏠', check: null },
    { text: 'Challenge: place EXACTLY 12 items (a dozen decorations!)', check: g => g.filter(Boolean).length === 12 },
    { text: 'Challenge: fill a 3×3 SQUARE of items somewhere (area = 9!)', check: (g, W) => { for (let r = 0; r + 2 < 6; r++) for (let c = 0; c + 2 < W; c++) { let all = true; for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) if (!g[(r + dr) * W + (c + dc)]) all = false; if (all) return true; } return false; } },
    { text: 'Challenge: decorate the whole BORDER (perimeter power!)', check: (g, W) => { for (let c = 0; c < W; c++) if (!g[c] || !g[5 * W + c]) return false; for (let r = 0; r < 6; r++) if (!g[r * W] || !g[r * W + W - 1]) return false; return true; } }
  ];
  function startRoom() {
    const W = 8, H = 6;
    let grid = Array(W * H).fill(null), brush = FURNITURE[0], challengeIdx = 0, done = new Set([0]);
    function render() {
      const ch = ROOM_CHALLENGES[challengeIdx];
      const count = grid.filter(Boolean).length;
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div class="lesson-top"><b>🏠 Room Designer</b><b>${count} items placed</b></div>
        <div class="card" style="padding:14px;margin-bottom:10px">
          <b>${esc(ch.text)}</b>
          ${ch.check ? `<button class="btn sun small" style="margin-left:10px" id="check-btn">Check! ✓</button>` : ''}
          <div style="margin-top:8px">${ROOM_CHALLENGES.map((c, i) => `<button class="btn ghost small" style="color:#6C5CE7;border-color:${i === challengeIdx ? '#6C5CE7' : '#ddd'};margin-right:6px" data-ch="${i}">${done.has(i) ? '✅' : ''} ${i === 0 ? 'Free' : 'Level ' + i}</button>`).join('')}</div>
        </div>
        <div class="room-grid">
          ${grid.map((item, i) => `<button class="room-cell" data-i="${i}">${item || ''}</button>`).join('')}
        </div>
        <div class="center" style="margin-top:12px">
          ${FURNITURE.map(f => `<button class="furn ${brush === f ? 'sel' : ''}" data-f="${f}">${f}</button>`).join('')}
          <button class="furn ${brush === null ? 'sel' : ''}" data-f="">🧹</button>
        </div>
        <div class="center" style="margin-top:12px"><button class="btn green" id="done-btn">Finish & Save Room 🏁</button></div>
      </div>`);
      wireChrome();
      document.querySelectorAll('.room-cell').forEach(el => el.onclick = () => { grid[Number(el.dataset.i)] = brush || null; Sound.click(); render(); });
      document.querySelectorAll('.furn').forEach(el => el.onclick = () => { brush = el.dataset.f || null; Sound.click(); render(); });
      document.querySelectorAll('[data-ch]').forEach(el => el.onclick = () => { challengeIdx = Number(el.dataset.ch); render(); });
      const cb = $('#check-btn');
      if (cb) cb.onclick = () => {
        if (ch.check(grid, W)) { done.add(challengeIdx); Sound.correct(); Confetti.burst(80); render(); }
        else { Sound.wrong(); cb.textContent = 'Not yet — keep designing!'; setTimeout(render, 1200); }
      };
      $('#done-btn').onclick = () => finishGame('room', done.size * 50 + Math.min(count, 20), 'Interior design genius! 🛋️', `You completed ${done.size - 1} challenge${done.size === 2 ? '' : 's'} and placed ${count} items.`);
    }
    render();
  }

  // ======================= ART STUDIO =======================
  const ART_GUIDES = [
    { name: 'Cute Cat', emoji: '🐱', steps: ['Draw a big circle for the head', 'Add two triangle ears on top', 'Two big round eyes + tiny nose', 'Whiskers — 3 on each side!', 'Draw a smile & color it in!'] },
    { name: 'Happy Cupcake', emoji: '🧁', steps: ['Draw a wide cup shape (trapezoid)', 'Add vertical lines on the cup', 'Big fluffy cloud of frosting on top', 'Cherry + sprinkles!', 'Give it a smiley face!'] },
    { name: 'Rocket Ship', emoji: '🚀', steps: ['Tall oval body', 'Pointy triangle nose cone', 'Two fins at the bottom', 'Round window in the middle', 'Fire & stars behind it!'] },
    { name: 'Magic Flower', emoji: '🌸', steps: ['Small circle in the center', '5 big petals around it', 'Long stem going down', 'Two leaves on the stem', 'Add a ladybug friend!'] }
  ];
  function startArt() {
    let guide = null, color = '#6C5CE7', size = 6, drawing = false, last = null;
    const COLORS = ['#6C5CE7', '#00B894', '#0984E3', '#E17055', '#FDCB6E', '#FF7675', '#2d3436', '#fd79a8', '#ffffff'];
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:760px">
        <div class="lesson-top"><b>🎨 Art Studio</b>${guide ? `<b>${guide.emoji} ${guide.name}</b>` : ''}</div>
        ${!guide ? `<div class="card"><h3>Pick a drawing guide (or free draw!)</h3>
          <div class="badge-shelf" style="margin-top:12px">
            ${ART_GUIDES.map((g, i) => `<button class="btn small" data-g="${i}">${g.emoji} ${g.name}</button>`).join('')}
            <button class="btn sun small" data-g="-1">✏️ Free Draw</button>
          </div></div>` : ''}
        ${guide ? `<div class="card" style="padding:12px;margin-bottom:10px"><b>Steps:</b> ${guide.steps ? guide.steps.map((s, i) => `<span class="pill strength" style="margin:2px">${i + 1}. ${esc(s)}</span>`).join(' ') : 'Draw anything you dream up!'}</div>` : ''}
        ${guide ? `
        <canvas id="art-canvas" width="700" height="440"></canvas>
        <div class="center" style="margin-top:10px">
          ${COLORS.map(c => `<button class="paint ${color === c ? 'sel' : ''}" style="background:${c}" data-c="${c}"></button>`).join('')}
          <button class="btn ghost small" style="color:#6C5CE7;border-color:#6C5CE7" id="size-btn">✏️ ${size < 8 ? 'Thin' : size < 14 ? 'Medium' : 'THICK'}</button>
          <button class="btn coral small" id="clear-art">🗑️</button>
          <button class="btn green small" id="save-art">💾 Save My Art</button>
        </div>` : ''}
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
        const i = Number(b.dataset.g);
        guide = i === -1 ? { name: 'Free Draw', emoji: '✏️', steps: null } : ART_GUIDES[i];
        Sound.click(); render();
      });
      const canvas = $('#art-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pos = e => {
        const r = canvas.getBoundingClientRect();
        const p = e.touches ? e.touches[0] : e;
        return { x: (p.clientX - r.left) * canvas.width / r.width, y: (p.clientY - r.top) * canvas.height / r.height };
      };
      const start = e => { drawing = true; last = pos(e); e.preventDefault(); };
      const move = e => {
        if (!drawing) return;
        const p = pos(e);
        ctx.strokeStyle = color; ctx.lineWidth = size;
        ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        last = p; e.preventDefault();
      };
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
      canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false });
      addEventListener('mouseup', () => drawing = false); addEventListener('touchend', () => drawing = false);
      document.querySelectorAll('.paint').forEach(b => b.onclick = () => { color = b.dataset.c; Sound.click(); document.querySelectorAll('.paint').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); });
      $('#size-btn').onclick = function () { size = size < 8 ? 12 : size < 14 ? 20 : 6; this.textContent = '✏️ ' + (size < 8 ? 'Thin' : size < 14 ? 'Medium' : 'THICK'); };
      $('#clear-art').onclick = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); Sound.wrong(); };
      $('#save-art').onclick = () => {
        const a = document.createElement('a');
        a.download = 'my-gallop-art.png'; a.href = canvas.toDataURL('image/png'); a.click();
        finishGame('art', 100, 'Masterpiece saved! 🖼️', 'Your art downloaded to this device — show your family!');
      };
    }
    render();
  }

  // ======================= AVATAR BUILDER =======================
  route('avatar', async () => {
    if (needKid()) return;
    const data = await api(`/play/${kidId()}/avatar`);
    let cfg = { base: 'fox', hat: 'none', accessory: 'none', bg: 'purple', pet: 'none', ...(data.config || {}) };
    let coins = data.coins;
    const owned = new Set(data.owned);
    const SLOT_LABEL = { base: '🐾 Character', hat: '🎩 Hats', accessory: '✨ Accessories', bg: '🌈 Worlds', pet: '🐶 Pets' };
    let slot = 'base';
    function isOwned(s, item) { return item.price === 0 || owned.has(s + ':' + item.id); }
    function render() {
      const preview = { avatar_config: cfg };
      app().innerHTML = topbar(`<div class="container" style="max-width:720px">
        <div class="lesson-top"><b>🎨 Avatar Builder</b><b>🪙 ${coins} coins</b></div>
        <div class="card center" style="padding:18px">
          <div class="avatar-big" style="width:130px;height:130px;font-size:5rem;margin:0 auto">${window.BP.avatarHTML(preview)}</div>
          <p class="muted" style="margin-top:8px">Earn coins by answering questions — spend them on style! 😎</p>
        </div>
        <div class="center" style="margin:12px 0">
          ${Object.keys(SLOT_LABEL).map(s => `<button class="btn small ${s === slot ? 'sun' : 'ghost'}" style="${s !== slot ? 'color:#fff;border-color:rgba(255,255,255,.5);' : ''}margin:3px" data-slot="${s}">${SLOT_LABEL[s]}</button>`).join('')}
        </div>
        <div class="card"><div class="avatar-pick">
          ${data.catalog[slot].map(item => {
            const own = isOwned(slot, item);
            const equipped = cfg[slot] === item.id;
            return `<div class="avatar-opt ${equipped ? 'sel' : ''}" data-item="${item.id}" style="min-width:74px">
              <div style="font-size:2rem">${item.emoji || '🚫'}</div>
              <div style="font-size:.75rem;font-weight:700">${own ? (equipped ? 'Wearing ✓' : 'Owned') : '🪙 ' + item.price}</div>
            </div>`;
          }).join('')}
        </div></div>
        <div class="center"><button class="btn green" id="save-av">Save My Look ✨</button>
        <button class="btn ghost small" style="color:#fff;border-color:rgba(255,255,255,.5);margin-left:8px" onclick="location.hash='#home'">Back</button></div>
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { slot = b.dataset.slot; Sound.click(); render(); });
      document.querySelectorAll('.avatar-opt').forEach(el => el.onclick = async () => {
        const item = data.catalog[slot].find(i => i.id === el.dataset.item);
        if (isOwned(slot, item)) { cfg[slot] = item.id; Sound.click(); render(); return; }
        try {
          const r = await api(`/play/${kidId()}/avatar/buy`, { method: 'POST', body: { slot, itemId: item.id } });
          owned.add(slot + ':' + item.id);
          if (r.coins != null) coins = r.coins;
          cfg[slot] = item.id;
          Sound.badge(); Confetti.burst(50); render();
        } catch (e) {
          Sound.wrong();
          el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          el.querySelector('div:last-child').textContent = e.message.length > 24 ? 'Not enough 🪙 yet!' : e.message;
        }
      });
      $('#save-av').onclick = async () => {
        await api(`/play/${kidId()}/avatar/equip`, { method: 'POST', body: { config: cfg } });
        await window.BP.refreshMe();
        Sound.levelup(); Confetti.burst(120);
        location.hash = '#home';
      };
    }
    render();
  });

  // ======================= BUDDIES =======================
  route('buddies', async () => {
    if (needKid()) return;
    const data = await api(`/buddies/${kidId()}`);
    if (data.unseen) api(`/buddies/${kidId()}/seen`, { method: 'POST', body: {} });
    const cheerText = id => (data.cheers.find(c => c.id === id) || {}).text || '👋';
    app().innerHTML = topbar(`<div class="container" style="max-width:720px">
      <div class="lesson-top"><b>💌 My Buddies</b></div>
      ${data.buddies.length ? `
        <div class="subject-grid">
          ${data.buddies.map(b => `
            <div class="card center" style="margin-bottom:0">
              <div class="avatar-big" style="margin:0 auto">${avatarHTML(b)}</div>
              <h3 style="margin:8px 0 4px">${esc(b.name)}</h3>
              <p class="muted">🔥 ${b.streak}-day streak · ⚡ ${b.xp} XP · 🏅 ${b.badges} badges</p>
              <button class="btn sun small" style="margin-top:10px" data-cheer="${b.id}">Send a Cheer! 📣</button>
            </div>`).join('')}
        </div>` : `
        <div class="card center">
          <div class="big-emoji">🫂</div>
          <h2>No buddies yet!</h2>
          <p class="muted" style="margin:10px 0">Ask your parent to connect you with friends from school — they make an invite code in the Parent Dashboard.</p>
        </div>`}
      <div class="card" style="margin-top:16px">
        <h3>📬 Cheers for you</h3>
        <div style="margin-top:10px">
          ${data.inbox.length ? data.inbox.map(c => `
            <div class="kid-row">${AVATARS[c.from_avatar] || '🦊'} <b>${esc(c.from_name)}</b>: ${esc(cheerText(c.cheer_id))} <span class="muted" style="margin-left:auto;font-size:.8rem">${esc(c.ts.slice(5, 16))}</span></div>`).join('')
          : '<p class="muted">Cheers from your buddies will land here! 💌</p>'}
        </div>
      </div>
    </div>`);
    wireChrome();
    document.querySelectorAll('[data-cheer]').forEach(b => b.onclick = () => {
      const toKid = Number(b.dataset.cheer);
      const div = document.createElement('div');
      div.className = 'celebrate';
      div.innerHTML = `<h2>Pick a cheer! 📣</h2><div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:520px">
        ${data.cheers.map(c => `<button class="btn sun small" data-cid="${c.id}">${esc(c.text)}</button>`).join('')}</div>
        <button class="btn ghost" style="margin-top:10px">Cancel</button>`;
      div.querySelector('.btn.ghost').onclick = () => div.remove();
      div.querySelectorAll('[data-cid]').forEach(cb => cb.onclick = async () => {
        try { await api(`/buddies/${kidId()}/cheer`, { method: 'POST', body: { toKid, cheerId: cb.dataset.cid } }); Sound.correct(); Confetti.burst(60); }
        catch (e) { Sound.wrong(); }
        div.remove();
      });
      document.body.appendChild(div);
    });
  });
})();
