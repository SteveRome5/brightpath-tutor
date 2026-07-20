/* Gallop Learning Academy — Play Zone: games, avatar builder, buddies */
'use strict';
(() => {
  const { $, app, esc, api, route, navigate, topbar, wireChrome, showError, State, Sound, Voice, Confetti, AVATARS, ITEM_EMOJI, avatarHTML } = window.BP;

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
    let r = { coinsEarned: 2, challengesWon: [] };
    try { r = await api(`/play/${kidId()}/score`, { method: 'POST', body: { game, score } }); } catch (e) {}
    Confetti.burst(150); Sound.levelup();
    const wins = (r.challengesWon || []).map(w => `<p style="font-weight:700;margin-top:8px">⚡ You beat ${esc(w.fromName)}'s challenge of ${w.scoreToBeat}! +5 🪙</p>`).join('');
    app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
      <div class="big-emoji">🏆</div><h2>${esc(title)}</h2>
      <div class="summary-stats"><div class="sstat"><div class="n">${score}</div>score</div><div class="sstat"><div class="n">+${r.coinsEarned || 2}</div>🪙 coins</div></div>
      ${wins}
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
      { id: 'bakery', emoji: '🧁', name: 'Bakery Quest', desc: 'Run the Gallop Bakery for a day — use real math to bake, price, and bank a profit!' },
      { id: 'blitz', emoji: '⚡', name: 'Lightning Round', desc: '60 seconds. Rapid-fire questions. Build a combo — beat your best!' },
      { id: 'lemonade', emoji: '🍋', name: 'Lemonade Tycoon', desc: 'Run your own stand — buy smart, price right, bank the profit!' },
      { id: 'memory', emoji: '🃏', name: 'Memory Match', desc: 'Flip cards, match pairs — Spanish words, math facts & more!' },
      { id: 'wordsearch', emoji: '🔍', name: 'Word Search', desc: 'Hunt hidden words in the letter jungle' },
      { id: 'code', emoji: '🤖', name: 'Code Quest', desc: 'Program Robo the robot to reach the star' },
      { id: 'room', emoji: '🏠', name: 'Room Designer', desc: 'Decorate rooms & crack area puzzles' },
      { id: 'art', emoji: '🎨', name: 'Art Studio', desc: 'Draw with step-by-step guides — so cute!' }
    ];
    if ((k.grade || 0) >= 4) games.unshift({ id: 'market', emoji: '📈', name: 'Market Mogul', desc: 'Read the news, manage risk, grow $1,000 on the Gallop Stock Exchange' });
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
            <div class="lvl" style="margin-top:6px;font-size:.85rem">🏅 Best: ${(s.best[g.id] || {}).best || 0} · Played ${(s.best[g.id] || {}).plays || 0}×</div>
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
    const starters = { bakery: startBakery, memory: startMemory, wordsearch: startWordSearch, code: startCode, room: startRoom, art: startArt, lemonade: startLemonade, market: startMarket, blitz: startBlitz };
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

  // ======================= LIGHTNING ROUND =======================
  // 60-second rapid-fire, grade-adaptive, combo multiplier. Pure adrenaline + math facts.
  function startBlitz() {
    const grade = State.me.kid.grade || 0;
    const DURATION = 60;
    let score = 0, combo = 0, best = 0, answered = 0, correct = 0, timeLeft = DURATION, timer = null, over = false;
    function makeQ() {
      const r = Math.random();
      if (grade <= 1) {
        const a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9);
        return r < 0.5 ? { t: `${a} + ${b}`, ans: a + b } : { t: `${Math.max(a, b)} − ${Math.min(a, b)}`, ans: Math.max(a, b) - Math.min(a, b) };
      }
      if (grade <= 3) {
        const a = 2 + Math.floor(Math.random() * 10), b = 2 + Math.floor(Math.random() * 10);
        return r < 0.4 ? { t: `${a} + ${b + 10}`, ans: a + b + 10 } : r < 0.7 ? { t: `${a + 10} − ${b}`, ans: a + 10 - b } : { t: `${a} × ${Math.min(b, 5)}`, ans: a * Math.min(b, 5) };
      }
      if (grade <= 6) {
        const a = 3 + Math.floor(Math.random() * 10), b = 3 + Math.floor(Math.random() * 9);
        return r < 0.5 ? { t: `${a} × ${b}`, ans: a * b } : { t: `${a * b} ÷ ${a}`, ans: b };
      }
      const a = 4 + Math.floor(Math.random() * 13), b = 4 + Math.floor(Math.random() * 12);
      if (r < 0.35) return { t: `${a} × ${b}`, ans: a * b };
      if (r < 0.6) return { t: `${a}² `, ans: a * a };
      if (r < 0.8) return { t: `${a * b} ÷ ${b}`, ans: a };
      const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      return { t: `${pct}% of ${a * 20}`, ans: a * 20 * pct / 100 };
    }
    function choicesFor(qn) {
      const set = new Set([qn.ans]);
      let guard = 0;
      while (set.size < 4 && guard++ < 40) {
        const d = qn.ans + [-10, -3, -2, -1, 1, 2, 3, 10][Math.floor(Math.random() * 8)];
        if (d >= 0 && d !== qn.ans) set.add(d);
      }
      let filler = qn.ans + guard;
      while (set.size < 4) { filler++; if (!set.has(filler)) set.add(filler); }
      return [...set].sort(() => Math.random() - .5);
    }
    let qn = makeQ();
    function render() {
      if (over) return;
      const ch = choicesFor(qn);
      const pct = timeLeft / DURATION * 100;
      app().innerHTML = topbar(`<div class="container" style="max-width:560px">
        <div class="lesson-top"><b>⚡ Lightning Round</b><b>Score: ${score}</b></div>
        <div class="blitz-timer"><div class="blitz-fill ${timeLeft <= 10 ? 'hot' : ''}" style="width:${pct}%"></div></div>
        <div class="card center" style="padding:26px">
          ${combo >= 3 ? `<div class="combo-badge">🔥 COMBO ×${combo}</div>` : ''}
          <div class="blitz-q">${qn.t} = ?</div>
          <div class="blitz-choices">${ch.map(c => `<button class="btn blitz-btn" data-v="${c}">${c}</button>`).join('')}</div>
          <p class="muted" style="margin-top:12px">⏱️ ${timeLeft}s — combos of 3+ score DOUBLE points!</p>
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('.blitz-btn').forEach(b => b.onclick = () => {
        answered++;
        if (Number(b.dataset.v) === qn.ans) {
          correct++; combo++; best = Math.max(best, combo);
          score += combo >= 3 ? 20 : 10;
          Sound.correct(); if (combo === 3) Confetti.burst(40);
        } else { combo = 0; Sound.wrong(); }
        qn = makeQ(); render();
      });
    }
    timer = setInterval(() => {
      // player navigated away mid-game — stop cleanly
      if (!document.querySelector('.blitz-timer')) { clearInterval(timer); over = true; return; }
      timeLeft--;
      const fill = document.querySelector('.blitz-fill');
      if (fill) { fill.style.width = (timeLeft / DURATION * 100) + '%'; if (timeLeft <= 10) fill.classList.add('hot'); }
      const label = document.querySelector('.card .muted');
      if (label) label.innerHTML = `⏱️ ${timeLeft}s — combos of 3+ score DOUBLE points!`;
      if (timeLeft <= 0) {
        clearInterval(timer); over = true;
        finishGame('blitz', score, `${score} points in 60 seconds! ⚡`, `${correct}/${answered} correct · best combo ×${best}. Faster brains next round!`);
      }
    }, 1000);
    render();
  }

  // ======================= LEMONADE TYCOON =======================
  // Entrepreneurship for every age: cost, price, demand, PROFIT.
  function startLemonade() {
    const DAYS = 5, CUP_COST = 0.5;
    const WEATHER = [
      { label: 'Sunny ☀️', base: 28 }, { label: 'HEAT WAVE 🥵', base: 44 },
      { label: 'Cloudy ⛅', base: 16 }, { label: 'Rainy 🌧️', base: 7 }
    ];
    let day = 1, cash = 10, totalProfit = 0, wx = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    let cups = null, price = null;
    const $$ = n => '$' + n.toFixed(2);
    function plan(msg) {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🍋 Lemonade Tycoon — Day ${day}/${DAYS}</b><b>💵 ${$$(cash)}</b></div>
        ${msg ? `<div class="news-flash">${msg}</div>` : ''}
        <div class="card" style="padding:18px">
          <h3 style="margin-bottom:4px">Today's forecast: ${wx.label}</h3>
          <p class="muted" style="margin-bottom:14px">Hot days = thirsty customers. Rainy days = empty streets. Plan like a real business owner!</p>
          <b>1) How many cups will you make? (each costs 50¢ in lemons & sugar)</b>
          <div style="margin:8px 0 14px">${[10, 20, 30, 40].map(n => `<button class="btn small ${cups === n ? 'sun' : 'ghost'}" style="margin:3px;${cups !== n ? 'color:#1f5e46;border-color:#1f5e46' : ''}" data-cups="${n}" ${n * CUP_COST > cash ? 'disabled' : ''}>${n} cups (${$$(n * CUP_COST)})</button>`).join('')}</div>
          <b>2) What price per cup?</b>
          <div style="margin:8px 0 14px">${[0.5, 1, 1.5, 2].map(p => `<button class="btn small ${price === p ? 'sun' : 'ghost'}" style="margin:3px;${price !== p ? 'color:#1f5e46;border-color:#1f5e46' : ''}" data-price="${p}">${$$(p)}</button>`).join('')}</div>
          <button class="btn green" id="open-btn" ${cups && price ? '' : 'disabled'}>Open the Stand! 🏁</button>
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-cups]').forEach(b => b.onclick = () => { cups = Number(b.dataset.cups); Sound.click(); plan(msg); });
      document.querySelectorAll('[data-price]').forEach(b => b.onclick = () => { price = Number(b.dataset.price); Sound.click(); plan(msg); });
      const ob = $('#open-btn'); if (ob) ob.onclick = sell;
    }
    function sell() {
      const priceFactor = { 0.5: 1.45, 1: 1.1, 1.5: 0.8, 2: 0.5 }[price];
      const demand = Math.max(0, Math.round(wx.base * priceFactor * (0.85 + Math.random() * 0.3)));
      const sold = Math.min(cups, demand);
      const cost = cups * CUP_COST, revenue = sold * price, profit = revenue - cost;
      cash += profit; totalProfit += profit;
      if (profit > 0) { Sound.correct(); Confetti.burst(60); } else Sound.wrong();
      const wasted = cups - sold, missed = demand - sold;
      const lesson = profit <= 0 ? 'You spent more than you earned — that\'s a LOSS. Real businesses fail when costs beat revenue. Adjust and try again!'
        : missed > 0 ? `${missed} thirsty customers walked away — you could have made MORE cups (or charged more)!`
        : wasted > 3 ? `${wasted} cups went to waste. Making too much costs money — matching supply to demand is the secret!`
        : 'Nearly perfect planning — supply met demand. That\'s how pros run a business!';
      const recap = `<b>Day ${day} results:</b> made ${cups} cups (cost ${$$(cost)}), sold ${sold} at ${$$(price)} → revenue ${$$(revenue)}. <b>Profit: ${$$(profit)}</b> 💡 Revenue − Cost = Profit. ${lesson}`;
      day++;
      cups = null; price = null; wx = WEATHER[Math.floor(Math.random() * WEATHER.length)];
      if (day > DAYS) {
        const score = Math.max(10, Math.round(totalProfit * 10) + 50);
        finishGame('lemonade', score, totalProfit > 0 ? `You banked ${$$(totalProfit)} profit! 🍋` : 'Every entrepreneur has tough weeks!',
          `Total profit over ${DAYS} days: ${$$(totalProfit)}. Real founders do exactly this: watch costs, read demand, set smart prices.`);
        return;
      }
      plan(recap);
    }
    plan();
  }

  // ======================= MARKET MOGUL =======================
  // Stock market for grades 4+: read the news, think ahead, manage risk.
  function startMarket() {
    const STOCKS = [
      { id: 'hay', name: 'HayGrain Farms', emoji: '🌾', price: 20, wild: 0.05 },
      { id: 'sun', name: 'SunVolt Energy', emoji: '☀️', price: 30, wild: 0.10 },
      { id: 'pix', name: 'PixelPlay Games', emoji: '🎮', price: 15, wild: 0.14 },
      { id: 'nova', name: 'Nova Rockets', emoji: '🚀', price: 50, wild: 0.22 }
    ];
    const NEWS = {
      hay: { good: ['HayGrain wins a huge grocery contract 🌾', 'Perfect growing season boosts HayGrain harvests'], bad: ['Drought hits HayGrain\'s biggest fields', 'HayGrain recalls a shipment of oats'] },
      sun: { good: ['New law rewards clean energy — SunVolt cheers ☀️', 'SunVolt\'s new panel breaks an efficiency record'], bad: ['Cheap imported panels undercut SunVolt', 'Cloudy quarter dims SunVolt\'s earnings'] },
      pix: { good: ['PixelPlay\'s new game hits #1 in downloads 🎮', 'PixelPlay announces a huge esports league'], bad: ['PixelPlay delays its biggest game launch', 'Players quit PixelPlay\'s buggy update'] },
      nova: { good: ['Nova Rockets lands a satellite mega-contract 🚀', 'Nova\'s reusable rocket sticks the landing'], bad: ['Nova launch scrubbed — investors nervous', 'Nova loses a contract to a rival'] }
    };
    const ROUNDS = 8;
    let round = 1, cash = 1000, owned = { hay: 0, sun: 0, pix: 0, nova: 0 }, last = {}, headline = makeNews();
    const $$ = n => '$' + n.toFixed(2);
    function makeNews() {
      const s = STOCKS[Math.floor(Math.random() * STOCKS.length)];
      const up = Math.random() < 0.5;
      const list = NEWS[s.id][up ? 'good' : 'bad'];
      return { stock: s.id, up, text: list[Math.floor(Math.random() * list.length)] };
    }
    function netWorth() { return cash + STOCKS.reduce((t, s) => t + owned[s.id] * s.price, 0); }
    function render(flash) {
      const nw = netWorth();
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div class="lesson-top"><b>📈 Market Mogul — Day ${round}/${ROUNDS}</b><b>Net worth: ${$$(nw)}</b></div>
        ${flash ? `<div class="news-flash">${flash}</div>` : ''}
        <div class="news-flash">📰 <b>MARKET NEWS:</b> ${headline.text}<br><span style="font-weight:500;font-size:.9rem">Think: what will this do to the price tomorrow?</span></div>
        <div class="card" style="padding:14px">
          ${STOCKS.map(s => {
            const chg = last[s.id];
            return `<div class="stock-row">
              <span style="font-size:1.4rem">${s.emoji}</span>
              <b style="min-width:130px">${s.name}</b>
              <span>${$$(s.price)}</span>
              ${chg != null ? `<span class="${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(1)}%</span>` : '<span class="muted">—</span>'}
              <span style="margin-left:auto">own: <b>${owned[s.id]}</b></span>
              <button class="btn small green" data-buy="${s.id}" ${cash < s.price ? 'disabled' : ''}>Buy</button>
              <button class="btn small coral" data-sell="${s.id}" ${owned[s.id] < 1 ? 'disabled' : ''}>Sell</button>
            </div>`;
          }).join('')}
          <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap">
            <span>💵 Cash: <b>${$$(cash)}</b></span><span>📊 Stocks: <b>${$$(nw - cash)}</b></span>
            <button class="btn sun small" style="margin-left:auto" id="next-day">${round === ROUNDS ? 'Close the Market 🔔' : 'Next Day →'}</button>
          </div>
        </div>
        <p class="center" style="color:#fff;opacity:.85;margin-top:10px">💡 Steady stocks move a little. Wild stocks (🚀) can jump — or crash. Smart investors don't put everything in one place.</p>
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
        const s = STOCKS.find(x => x.id === b.dataset.buy);
        if (cash >= s.price) { cash -= s.price; owned[s.id]++; Sound.click(); render(flash); }
      });
      document.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => {
        const s = STOCKS.find(x => x.id === b.dataset.sell);
        if (owned[s.id] > 0) { cash += s.price; owned[s.id]--; Sound.click(); render(flash); }
      });
      $('#next-day').onclick = advance;
    }
    function advance() {
      // News usually (not always!) moves the price — markets can surprise you.
      const follows = Math.random() < 0.85;
      let flash = null;
      for (const s of STOCKS) {
        let move = (Math.random() * 2 - 1) * s.wild;
        if (s.id === headline.stock) {
          const dir = headline.up === follows ? 1 : -1;
          move = dir * (0.08 + Math.random() * 0.14);
          if (!follows) flash = '😮 Surprise! The market didn\'t react the way the news suggested. That happens in real markets too — never bet everything on one headline.';
        }
        last[s.id] = move * 100;
        s.price = Math.max(1, s.price * (1 + move));
      }
      if (round === ROUNDS) {
        const nw = netWorth();
        const gain = nw - 1000;
        const score = Math.max(10, Math.round(nw / 10));
        finishGame('market', score, gain >= 0 ? `Portfolio: ${$$(nw)} — you MADE ${$$(gain)}! 📈` : `Portfolio: ${$$(nw)} — down ${$$(-gain)} 📉`,
          gain >= 0 ? 'You read news, took smart risks, and grew your money. That\'s investing — and now you\'ve done it.'
            : 'Losses teach the best lessons: diversify, don\'t chase one hot stock, and think a day ahead. Pros lose sometimes too!');
        return;
      }
      round++; headline = makeNews();
      Sound.badge();
      render(flash);
    }
    render();
  }

  // ======================= BAKERY QUEST =======================
  // "Why do I need this?" answered by DOING it: you run a real bakery for a day, and every
  // real task (batching, scaling a recipe, pricing, making change, counting profit) is solved
  // with the exact math the child is learning. Scales by grade so it fits a 1st grader or a
  // 9th grader. Each step ends by naming the skill AND where it's used in real life.
  function startBakery() {
    const grade = (State.me.kid && State.me.kid.grade) || 3;
    const band = grade <= 1 ? 0 : grade <= 3 ? 1 : grade <= 5 ? 2 : 3;
    const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
    const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
    // 4 unique choice strings, padded if a distractor collides
    const mc = (ans, distractors) => { const set = new Set([ans]); for (const d of distractors) { if (set.size >= 4) break; if (d != null && String(d) !== ans) set.add(String(d)); } let k = 1; while (set.size < 4) { set.add(ans + ' '.repeat(k)); k++; } return shuf([...set]); };

    const st = { seed: 50, cost: 0, revenue: 0, made: 0, sold: 0, price: 0, stars: 0, idx: 0, perfect: true };

    // ---------- Build the day's scenes for this grade band ----------
    const per = band === 0 ? 6 : 12;                    // cupcakes per tray
    const trays = R(2, 4);
    const order = per * trays;                           // total cupcakes ordered
    const unit = band === 0 ? 1 : pick([0.6, 0.7, 0.8]); // ingredient cost per cupcake
    st.made = order;
    const ingredientCost = Math.round(order * unit * 100) / 100; // spent when you bake (price step)
    const makesBase = band <= 1 ? per : 6;              // recipe yield
    const flourBase = band <= 1 ? 3 : 2;               // cups of flour for the base recipe
    const mult = order / makesBase;
    const flourNeeded = mult * flourBase;

    const customers = ['🧑', '👩', '👨', '🧑‍🦱', '👵', '🧒', '👧', '🧑‍🦰'];

    // Scene 1 — batch it (counting / multiplication / division)
    const s1 = band === 0
      ? { cap: `A birthday party orders ${order} cupcakes! You already made ${order - R(2, 4)}. Wait, let's keep it simple:`, q: `The party wants ${trays} bags with ${per} cupcakes in each bag. How many cupcakes is that in all?`, ans: String(order), dis: [order - per, order + per, per + trays], skill: 'multiplication', why: 'Bakers group things in trays and bags every day, that\'s what times tables are for.' }
      : { cap: `📋 A school just ordered ${order} cupcakes for a fair!`, q: `Your trays hold ${per} cupcakes each. How many full trays do you need to bake ${order}?`, ans: String(order / per), dis: [order / per + 1, order / per - 1, Math.round(order / (per / 2))], skill: 'division', why: 'Every kitchen batches food into trays, division tells you how many batches to make.' };

    // Scene 2 — scale the recipe (addition / ratios / fractions)
    const s2 = band === 0
      ? { cap: `🥣 Time to mix the batter.`, q: `One bowl of batter uses ${flourBase} cups of flour. You need ${trays} bowls. How many cups of flour in all?`, ans: String(flourBase * trays), dis: [flourBase + trays, flourBase * trays + 1, flourBase * (trays - 1)], skill: 'repeated addition', why: 'Doubling and tripling a recipe is real math cooks use every single day.' }
      : { cap: `🥣 Your recipe card is for a small batch, but this order is big.`, q: `The recipe makes ${makesBase} cupcakes with ${flourBase} cups of flour. For ${order} cupcakes, how many cups of flour do you need?`, ans: String(flourNeeded), dis: [flourNeeded + flourBase, flourNeeded - flourBase, flourBase * (order / makesBase) + 1], skill: 'ratios & scaling', why: 'This is THE reason recipes and ratios matter: scale it wrong and the whole batch is ruined.' };

    // costs are now spent
    // Scene 3 — set the price (strategic choice, simulated demand)
    const fair = Math.max(band === 0 ? 2 : unit + 0.7, unit * 2);
    const priceOpts = band === 0
      ? [{ label: '$2 each (cheap)', p: 2, mult: 1.0 }, { label: '$3 each (fair)', p: 3, mult: 1.0 }, { label: '$6 each (steep)', p: 6, mult: 0.5 }]
      : [{ label: money(Math.round((unit + 0.2) * 100) / 100) + ' each (barely above cost)', p: Math.round((unit + 0.2) * 100) / 100, mult: 1.0 },
         { label: money(Math.round((unit + 0.9) * 100) / 100) + ' each (fair markup)', p: Math.round((unit + 0.9) * 100) / 100, mult: 1.0 },
         { label: money(Math.round((unit + 2.5) * 100) / 100) + ' each (pricey)', p: Math.round((unit + 2.5) * 100) / 100, mult: 0.55 }];

    // Scene 5 — profit (subtraction / margin)

    // ---------- Hand-drawn SVG bakery ----------
    function cupcake(x, y, s) {
      return `<g transform="translate(${x},${y}) scale(${s})">
        <path d="M-15 2 L15 2 L11 26 L-11 26 Z" fill="#e7c9a0"/>
        <path d="M-15 2 L15 2 L14 8 L-14 8 Z" fill="#d3a878"/>
        <path d="M-17 3 q3 -15 8 -15 q3 -8 9 -3 q7 -2 8 8 q6 3 1 10 Z" fill="#f7a8c4"/>
        <path d="M-11 0 q2 -9 6 -9 q4 -6 8 0 q5 3 2 9 Z" fill="#ffc2da"/>
        <circle cx="1" cy="-9" r="3.5" fill="#e2445c"/><circle cx="0" cy="-10" r="1.2" fill="#fff" opacity=".7"/>
      </g>`;
    }
    function stage(caption, customer, mood) {
      const shown = Math.min(6, Math.max(0, st.made && st.idx > 0 ? 6 : Math.round((st.idx) / 5 * 6)));
      let cakes = ''; for (let i = 0; i < 6; i++) cakes += cupcake(70 + i * 62, 176, i < Math.max(1, shown) ? 1 : 0.001);
      const starRow = '★★★★★'.split('').map((s, i) => `<tspan fill="${i < st.stars ? '#ffd23f' : 'rgba(255,255,255,.35)'}">★</tspan>`).join('');
      return `<div class="bq-stage">
        <svg viewBox="0 0 480 260" width="100%" style="display:block">
          <defs>
            <linearGradient id="bqsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8d6"/><stop offset="1" stop-color="#ffd0b0"/></linearGradient>
            <linearGradient id="bqwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9764a"/><stop offset="1" stop-color="#9c5f38"/></linearGradient>
          </defs>
          <rect x="0" y="0" width="480" height="260" fill="url(#bqsky)"/>
          <rect x="0" y="0" width="480" height="16" fill="#ef8fb3"/>
          ${Array.from({ length: 12 }).map((_, i) => `<rect x="${i * 42}" y="0" width="21" height="16" fill="${i % 2 ? '#ef8fb3' : '#f8bcd4'}"/>`).join('')}
          <rect x="150" y="34" width="180" height="46" rx="10" fill="#7a4a2b"/>
          <text x="240" y="55" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#ffe8d6" font-weight="700">GALLOP</text>
          <text x="240" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#ffd0b0">· BAKERY ·</text>
          <text x="404" y="44" font-size="17">${starRow ? '' : ''}</text>
          <text x="360" y="44" font-size="15" font-family="Fredoka,sans-serif">${starRow}</text>
          <rect x="20" y="150" width="440" height="14" rx="4" fill="#caa06f"/>
          <rect x="20" y="164" width="440" height="70" fill="url(#bqwood)"/>
          <rect x="20" y="150" width="440" height="84" fill="none"/>
          <rect x="30" y="158" width="420" height="42" rx="8" fill="#fff" opacity=".16"/>
          ${cakes}
          <g transform="translate(392,150)"><rect x="0" y="-4" width="70" height="34" rx="6" fill="#3d7a5a"/><text x="35" y="18" text-anchor="middle" font-size="15" fill="#fff" font-family="Fredoka,sans-serif" font-weight="700">${money(st.seed - st.cost + st.revenue)}</text></g>
          <text x="70" y="140" font-size="46">${customer || '🧑'}</text>
        </svg>
        <div class="bq-bubble">${esc(caption)}</div>
      </div>`;
    }

    // ---------- Skill scene ----------
    function renderSkill(sc, customer) {
      const choices = mc(sc.ans, sc.dis.map(String));
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🧁 Bakery Quest — Order ${st.idx + 1} of 5</b><b>💰 ${money(st.seed - st.cost + st.revenue)}</b></div>
        ${stage(sc.cap, customer)}
        <div class="card bq-card">
          <p class="bq-q">${esc(sc.q)}</p>
          <div class="choices" id="bq-choices">
            ${choices.map((c, i) => `<button class="choice" data-c="${esc(c)}">${esc(c)}</button>`).join('')}
          </div>
          <div id="bq-feed"></div>
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('#bq-choices .choice').forEach(b => b.onclick = () => {
        const correct = b.dataset.c === sc.ans;
        document.querySelectorAll('#bq-choices .choice').forEach(x => x.disabled = true);
        if (correct) {
          b.classList.add('correct'); Sound.correct(); Confetti.burst(28);
          if (st.perfect) st.stars = Math.min(5, st.stars + 1);
          $('#bq-feed').innerHTML = `<div class="bq-good">✅ ${esc(sc.why)}</div><button class="btn green" id="bq-next" style="margin-top:12px">Next →</button>`;
        } else {
          b.classList.add('wrong'); st.perfect = false; Sound.wrong();
          document.querySelectorAll('#bq-choices .choice').forEach(x => { if (x.dataset.c === sc.ans) x.classList.add('answer-reveal'); });
          $('#bq-feed').innerHTML = `<div class="bq-bad">The answer is <b>${esc(sc.ans)}</b>. ${esc(sc.why)}</div><button class="btn green" id="bq-next" style="margin-top:12px">Keep going →</button>`;
        }
        $('#bq-next').onclick = () => { Sound.click(); st.perfect = true; st.idx++; step(); };
      });
    }

    // ---------- Price scene (a real business decision) ----------
    function renderPrice() {
      st.cost = ingredientCost; // ingredients are paid for now that the batch is baked
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🧁 Bakery Quest — Order 3 of 5</b><b>💰 ${money(st.seed - st.cost)}</b></div>
        ${stage(`Your ${st.made} cupcakes are baked and cooling. Ingredients cost you ${money(st.cost)}. Now the big decision every shop owner makes: what do you charge?`, '🧑‍🍳')}
        <div class="card bq-card">
          <p class="bq-q">Pick your price per cupcake. Charge too little and you barely make money, too much and fewer people buy. What's smart?</p>
          <div class="choices" id="bq-prices">
            ${priceOpts.map((o, i) => `<button class="choice" data-i="${i}">${esc(o.label)}</button>`).join('')}
          </div>
          <div id="bq-feed"></div>
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('#bq-prices .choice').forEach(b => b.onclick = () => {
        const o = priceOpts[Number(b.dataset.i)];
        document.querySelectorAll('#bq-prices .choice').forEach(x => x.disabled = true);
        b.classList.add('correct');
        st.price = o.p;
        st.sold = Math.round(st.made * o.mult);
        st.revenue = Math.round(st.sold * o.p * 100) / 100;
        Sound.badge(); Confetti.burst(24);
        const soldOut = st.sold >= st.made;
        $('#bq-feed').innerHTML = `<div class="bq-good">At ${money(o.p)} each, you sold <b>${st.sold}</b> of ${st.made} cupcakes${soldOut ? ' — sold out! 🎉' : ' (some went unsold).'}<br>Money brought in: <b>${money(st.revenue)}</b>. Pricing is a real trade-off every business balances.</div><button class="btn green" id="bq-next" style="margin-top:12px">Ring it up →</button>`;
        $('#bq-next').onclick = () => { Sound.click(); st.perfect = true; st.idx++; step(); };
      });
    }

    // ---------- Make change (scene 4) ----------
    function renderChange(customer) {
      const q = band === 0 ? 1 : band === 1 ? R(1, 2) : band === 2 ? R(2, 3) : R(2, 4);
      const due = Math.round(st.price * q * 100) / 100;
      // Always hand over a standard bill that actually covers the purchase (never negative change).
      const bill = due <= 5 ? 5 : due <= 10 ? 10 : due <= 20 ? 20 : Math.ceil(due / 5) * 5;
      const change = Math.round((bill - due) * 100) / 100;
      const sc = {
        cap: `A neighbor wants ${q} cupcakes to take home.`,
        q: `${q} cupcakes at ${money(st.price)} each is ${money(due)}. They hand you a ${money(bill)} bill. How much change do you give back?`,
        ans: money(change),
        dis: [money(bill - Math.round(st.price * q * 100) / 100 + st.price), money(due), money(bill - st.price)],
        skill: 'subtraction with money', why: 'Making change fast and correct is real work at every register, and it keeps customers trusting you.'
      };
      renderSkill(sc, customer);
    }

    // ---------- Results ----------
    function renderResult() {
      const profit = Math.round((st.revenue - st.cost) * 100) / 100;
      const score = Math.max(10, Math.round((st.revenue) + st.stars * 20));
      let title, line;
      if (band >= 3) {
        const margin = st.revenue > 0 ? Math.round((profit / st.revenue) * 100) : 0;
        title = profit >= 0 ? `Profit: ${money(profit)} (${margin}% margin) 🧁` : `Down ${money(-profit)} today 📉`;
        line = `You brought in ${money(st.revenue)} and spent ${money(st.cost)}. Profit = revenue − costs = ${money(profit)}. That margin is exactly how real founders judge a business.`;
      } else {
        title = profit >= 0 ? `You made ${money(profit)} profit! 🧁` : `You lost ${money(-profit)} today 📉`;
        line = profit >= 0 ? `Money in (${money(st.revenue)}) minus money out (${money(st.cost)}) = ${money(profit)} profit. That's how every shop knows if the day worked!` : `Costs (${money(st.cost)}) were more than sales (${money(st.revenue)}). Next time price a little higher or waste less, that's real business thinking.`;
      }
      finishGame('bakery', score, title, line + (st.stars === 5 ? ' ⭐ Perfect run, five-star baker!' : ''));
    }

    // ---------- Step machine (renderSkill/renderPrice bump st.idx then call step) ----------
    function step() {
      switch (st.idx) {
        case 0: return renderSkill(s1, pick(customers));
        case 1: return renderSkill(s2, '🧑‍🍳');
        case 2: return renderPrice();
        case 3: return renderChange(pick(customers));
        case 4: {
          const profit = Math.round((st.revenue - st.cost) * 100) / 100;
          return renderSkill({
            cap: 'The shop is closing. Time to count the day.',
            q: `You brought in ${money(st.revenue)} and your ingredients cost ${money(st.cost)}. What was your profit today?`,
            ans: money(profit),
            dis: [money(st.revenue + st.cost), money(st.revenue), money(profit + st.cost)],
            skill: 'subtraction', why: 'Profit = money in minus money out. It\'s the number that tells you if a business actually works.'
          }, '🧑‍🍳');
        }
        default: return renderResult();
      }
    }
    step();
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
            const rar = item.rarity ? ` rar-${item.rarity}` : '';
            return `<div class="avatar-opt${rar} ${equipped ? 'sel' : ''}" data-item="${item.id}" style="min-width:74px;position:relative">
              ${item.seasonal ? '<span class="limited-tag">⏳ LIMITED</span>' : (item.rarity ? `<span class="rar-tag rar-tag-${item.rarity}">${item.rarity === 'legendary' ? '★ LEGENDARY' : item.rarity === 'epic' ? '◆ EPIC' : '● RARE'}</span>` : '')}
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

  // ======================= SNACK SHACK & VENDING =======================
  route('snacks', async () => {
    if (needKid()) return;
    const data = await api(`/play/${kidId()}/snacks`);
    let coins = data.coins;
    const owned = { ...data.owned };
    let machine = 'vending';
    const RAR_LABEL = { rare: '● RARE', epic: '◆ EPIC', legendary: '★ LEGENDARY' };
    function render() {
      const list = data.machines[machine];
      const totalOwned = Object.values(owned).reduce((a, b) => a + b, 0);
      app().innerHTML = topbar(`<div class="container" style="max-width:760px">
        <div class="kid-header" style="margin-bottom:14px">
          <div><h1>🍿 Snack Shack</h1>
            <div class="stat-chips" style="margin-top:8px">
              <span class="chip">🪙 ${coins} coins</span>
              <span class="chip">🎒 ${totalOwned} snacks collected</span>
            </div>
          </div>
          <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#home'">← Home</button></div>
        </div>
        <div class="center" style="margin-bottom:14px">
          <button class="btn ${machine === 'vending' ? 'sun' : 'ghost'} small" style="${machine !== 'vending' ? 'color:#fff;border-color:rgba(255,255,255,.5);' : ''}margin:3px" data-machine="vending">🥤 Vending Machine</button>
          <button class="btn ${machine === 'shack' ? 'sun' : 'ghost'} small" style="${machine !== 'shack' ? 'color:#fff;border-color:rgba(255,255,255,.5);' : ''}margin:3px" data-machine="shack">🍔 Snack Shack</button>
        </div>
        <div class="vending ${machine === 'shack' ? 'is-shack' : ''}">
          <div class="vending-head">${machine === 'vending' ? '🥤 GALLOP SNACKS' : '🍔 THE SNACK SHACK'}</div>
          <div class="vending-grid">
            ${list.map(sn => {
              const cnt = owned[sn.id] || 0;
              const rar = sn.rarity ? ` rar-${sn.rarity}` : '';
              return `<div class="snack-slot${rar}" data-snack="${sn.id}">
                ${sn.rarity ? `<span class="rar-tag rar-tag-${sn.rarity}">${RAR_LABEL[sn.rarity]}</span>` : ''}
                ${cnt ? `<span class="snack-count">×${cnt}</span>` : ''}
                <div class="snack-emoji">${sn.emoji}</div>
                <div class="snack-name">${esc(sn.name)}</div>
                <button class="btn sun snack-buy" data-snack="${sn.id}">🪙 ${sn.price}</button>
              </div>`;
            }).join('')}
          </div>
          <div class="vending-tray"><div class="vending-slot-mouth"></div><div id="drop-zone"></div></div>
        </div>
        <div class="snack-muncher">
          <div class="avatar-big muncher-av" id="muncher-av">${avatarHTML(State.me.kid)}</div>
          <div class="muncher-caption muted">${playful() ? 'Buy a snack and watch me eat it! 😋' : 'Buy a snack to feed your avatar'}</div>
        </div>
        <p class="center" style="color:#fff;opacity:.9;margin-top:8px">${machine === 'vending' ? 'Quick treats — earn coins by learning, then treat yourself! 🪙' : 'Fancier goodies for big coin-savers. Collect them all! 🏆'}</p>
      </div>`);
      wireChrome();
      document.querySelectorAll('[data-machine]').forEach(b => b.onclick = () => { machine = b.dataset.machine; Sound.click(); render(); });
      document.querySelectorAll('.snack-buy').forEach(btn => btn.onclick = async (ev) => {
        ev.stopPropagation();
        const sn = data.machines[machine].find(s => s.id === btn.dataset.snack);
        try {
          const r = await api(`/play/${kidId()}/snacks/buy`, { method: 'POST', body: { machine, snackId: sn.id } });
          coins = r.coins; owned[sn.id] = r.qty;
          Sound.correct();
          const mav = $('#muncher-av'); if (mav) mav.scrollIntoView({ behavior: 'smooth', block: 'center' });
          dropSnack(sn.emoji);
          // update this slot's chips live without a full re-render (keeps the drop visible)
          $('.stat-chips').children[0].textContent = `🪙 ${coins} coins`;
          const totNow = Object.values(owned).reduce((a, b) => a + b, 0);
          if ($('.stat-chips').children[1]) $('.stat-chips').children[1].textContent = `🎒 ${totNow} snacks collected`;
          const slot = document.querySelector(`.snack-slot[data-snack="${sn.id}"]`);
          let badge = slot.querySelector('.snack-count');
          if (!badge) { badge = document.createElement('span'); badge.className = 'snack-count'; slot.appendChild(badge); }
          badge.textContent = '×' + r.qty;
        } catch (e) {
          Sound.wrong();
          btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 280 });
          btn.textContent = 'Need more 🪙';
          setTimeout(() => { btn.textContent = '🪙 ' + sn.price; }, 1400);
        }
      });
    }
    function dropSnack(emoji) {
      const zone = $('#drop-zone');
      if (!zone) return;
      const el = document.createElement('div');
      el.className = 'snack-drop'; el.textContent = emoji;
      zone.appendChild(el);
      el.animate([
        { transform: 'translateY(-140px) scale(.6) rotate(0deg)', opacity: 0 },
        { transform: 'translateY(-40px) scale(1) rotate(20deg)', opacity: 1, offset: .5 },
        { transform: 'translateY(0) scale(1.15) rotate(-8deg)', opacity: 1, offset: .8 },
        { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 }
      ], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      Confetti.burst(20);
      // After it lands in the tray, the avatar reaches over and eats it 😋
      setTimeout(() => feedAvatar(emoji, el), 800);
    }
    function feedAvatar(emoji, trayEl) {
      const av = $('#muncher-av');
      if (!av) { if (trayEl) trayEl.remove(); return; }
      const flyer = document.createElement('div');
      flyer.className = 'snack-flyer'; flyer.textContent = emoji;
      document.body.appendChild(flyer);
      const from = (trayEl || av).getBoundingClientRect();
      const to = av.getBoundingClientRect();
      flyer.style.left = from.left + from.width / 2 - 18 + 'px';
      flyer.style.top = from.top + from.height / 2 - 18 + 'px';
      if (trayEl) trayEl.remove();
      const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      const dyReal = (to.top + to.height / 2) - (from.top + from.height / 2);
      flyer.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dyReal * 0.5 - 30}px) scale(1.2) rotate(180deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${dx}px, ${dyReal}px) scale(.3) rotate(360deg)`, opacity: 0 }
      ], { duration: 650, easing: 'cubic-bezier(.5,-0.2,.7,1)' }).onfinish = () => {
        flyer.remove();
        // Chomp! avatar bounces and a "yum" pops
        av.animate([
          { transform: 'scale(1)' }, { transform: 'scale(1.25) rotate(-6deg)' },
          { transform: 'scale(.9) rotate(4deg)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }
        ], { duration: 550, easing: 'ease-out' });
        Sound.correct();
        const yum = document.createElement('div');
        yum.className = 'yum-pop'; yum.textContent = ['Yum! 😋', 'Mmm! 😋', 'Delicious! 🤤', 'Nom nom! 😸', 'Tasty! 😻'][Math.floor(Math.random() * 5)];
        const p = av.getBoundingClientRect();
        yum.style.left = p.left + p.width / 2 + 'px'; yum.style.top = p.top - 8 + 'px';
        document.body.appendChild(yum);
        yum.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-24px) scale(1)', opacity: 1, offset: .4 }, { transform: 'translate(-50%,-46px) scale(1)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).onfinish = () => yum.remove();
      };
    }
    render();
  });

  // ======================= TROPHY CASE / BADGE BOOK =======================
  const RANK_LADDER = [['Foal', 0], ['Pony Pal', 100], ['Explorer', 250], ['Ranger', 500], ['Galloper', 1000], ['Trailblazer', 2000], ['Pathfinder', 4000], ['Legend', 8000], ['Mustang', 15000]];
  const CAT_META = {
    milestone: { name: 'Milestones', emoji: '🎯' }, streak: { name: 'Streaks', emoji: '🔥' },
    subject: { name: 'Subject Explorer', emoji: '🧭' }, mastery: { name: 'Mastery', emoji: '⭐' },
    xp: { name: 'XP & Rank', emoji: '⚡' }, collector: { name: 'Collector', emoji: '💎' }
  };
  const RAR_NAME = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
  route('trophies', async () => {
    if (needKid()) return;
    const d = await api(`/learn/${kidId()}/achievements`);
    const cats = {};
    d.badges.forEach(b => { (cats[b.cat] = cats[b.cat] || []).push(b); });
    // rank ladder progress
    let cur = RANK_LADDER[0], next = null;
    for (const r of RANK_LADDER) { if (d.xp >= r[1]) cur = r; else { next = r; break; } }
    const rankPct = next ? Math.round((d.xp - cur[1]) / (next[1] - cur[1]) * 100) : 100;

    function badgeCell(b) {
      const rar = ` rar-${b.rarity}`;
      const pct = Math.round(b.cur / b.goal * 100);
      return `<div class="badge-cell ${b.earned ? 'earned' + rar : 'locked'}" data-badge="${b.id}" title="${esc(b.name)}: ${esc(b.desc || '')}">
        <div class="badge-emoji">${b.earned ? b.emoji : '🔒'}</div>
        <div class="badge-name">${esc(b.name)}</div>
        <div class="badge-desc">${esc(b.desc || '')}</div>
        ${b.earned ? `<div class="badge-rar rar-tag-${b.rarity}">${RAR_NAME[b.rarity]}</div>`
          : `<div class="badge-prog"><div class="badge-prog-fill" style="width:${pct}%"></div></div><div class="badge-prog-txt">${b.cur}/${b.goal}</div>`}
      </div>`;
    }
    app().innerHTML = topbar(`<div class="container" style="max-width:900px">
      <div class="kid-header" style="margin-bottom:14px">
        <div><h1>🏆 Trophy Case</h1>
          <div class="stat-chips" style="margin-top:8px">
            <span class="chip">🏅 ${d.earnedCount}/${d.totalBadges} badges</span>
            <span class="chip">🎓 ${d.certificates.length} certificate${d.certificates.length === 1 ? '' : 's'}</span>
            <span class="chip">⚡ ${d.xp} XP</span>
          </div>
        </div>
        <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#home'">← Home</button></div>
      </div>

      <!-- RANK LADDER -->
      <div class="card trophy-rank">
        <div class="tr-top"><b>🏇 Rank: ${cur[0]}</b>${next ? `<span class="muted">${next[1] - d.xp} XP to ${next[0]}</span>` : '<span class="muted">Top rank reached! 👑</span>'}</div>
        <div class="rank-bar"><div class="rank-bar-fill" style="width:${rankPct}%"></div></div>
        <div class="rank-ladder">${RANK_LADDER.map(r => `<div class="rl-node ${d.xp >= r[1] ? 'on' : ''}" title="${r[0]} · ${r[1]} XP"><span class="rl-dot"></span><span class="rl-name">${r[0]}</span></div>`).join('')}</div>
      </div>

      <!-- NEXT GOALS -->
      ${d.nextGoals.length ? `<div class="card next-goals">
        <h3 style="margin-bottom:12px">🎯 ${playful() ? 'Chase these next!' : 'Next goals'}</h3>
        <div class="ng-grid">${d.nextGoals.map(g => `
          <div class="ng-card rar-${g.rarity}">
            <div class="ng-emoji">${g.emoji}</div>
            <div class="ng-body"><b>${esc(g.name)}</b><span class="muted">${esc(g.desc)}</span>
              <div class="badge-prog"><div class="badge-prog-fill" style="width:${Math.round(g.cur / g.goal * 100)}%"></div></div>
              <span class="ng-count">${g.cur} / ${g.goal}</span>
            </div>
          </div>`).join('')}</div>
      </div>` : ''}

      <!-- COLLECTION LEGEND -->
      <div class="card">
        <h3 style="margin-bottom:10px">📖 ${playful() ? 'Badge Book' : 'Badge Collection'}</h3>
        <div class="rar-legend">${d.rarityCounts.map(rc => `<span class="rar-leg-item"><span class="rar-dot rar-tag-${rc.rarity}"></span>${RAR_NAME[rc.rarity]} <b>${rc.earned}/${rc.total}</b></span>`).join('')}</div>
        ${Object.keys(CAT_META).filter(c => cats[c]).map(c => `
          <div class="badge-cat">
            <div class="badge-cat-head">${CAT_META[c].emoji} ${CAT_META[c].name} <span class="muted">${cats[c].filter(b => b.earned).length}/${cats[c].length}</span></div>
            <div class="badge-grid">${cats[c].map(badgeCell).join('')}</div>
          </div>`).join('')}
      </div>

      <!-- CERTIFICATES SHELF -->
      ${d.certificates.length ? `<div class="card">
        <h3 style="margin-bottom:12px">🎓 Certificate Shelf</h3>
        <div class="cert-shelf">${d.certificates.map(c => `
          <div class="cert-mini" data-cert="${c.id}">
            <div class="cert-mini-seal">🏅</div>
            <b>${esc(c.title)}</b><span class="muted">${esc(c.subject)} · ${c.issued_at.slice(0, 10)}</span>
          </div>`).join('')}</div>
      </div>` : `<div class="card center"><p class="muted">🎓 Earn certificates by mastering a whole grade level in a subject — they'll line up here!</p></div>`}
    </div>`);
    wireChrome();
    document.querySelectorAll('[data-cert]').forEach(el => el.onclick = () => { Sound.click(); location.hash = '#certificate/' + kidId() + '/' + el.dataset.cert; });
    document.querySelectorAll('.badge-cell.earned').forEach(el => el.onclick = () => { Sound.badge(); el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15) rotate(-4deg)' }, { transform: 'scale(1)' }], { duration: 400 }); });
  });

  // ======================= BUDDIES =======================
  route('buddies', async () => {
    if (needKid()) return;
    const data = await api(`/buddies/${kidId()}`);
    if (data.unseen) api(`/buddies/${kidId()}/seen`, { method: 'POST', body: {} });
    const cheerText = id => (data.cheers.find(c => c.id === id) || {}).text || '👋';
    const inc = (data.challenges || {}).incoming || [];
    const out = (data.challenges || {}).outgoing || [];
    app().innerHTML = topbar(`<div class="container" style="max-width:720px">
      <div class="lesson-top"><b>💌 My Buddies</b></div>
      ${inc.length ? `<div class="card" style="border:2px solid var(--accent)">
        <h3>⚡ Challenges for you!</h3>
        ${inc.map(c => `<div class="kid-row">⚡ <b>${esc(c.fromName)}</b> challenges you: beat <b>${c.scoreToBeat}</b> in ${esc(c.gameName)}!
          <button class="btn sun small" style="margin-left:auto" onclick="location.hash='#game/${c.game}'">Accept! →</button></div>`).join('')}
        <p class="muted" style="margin-top:8px;font-size:.85rem">Beat the score within 7 days to win +5 bonus coins!</p>
      </div>` : ''}
      ${data.buddies.length ? `
        <div class="subject-grid">
          ${data.buddies.map(b => `
            <div class="card center" style="margin-bottom:0">
              <div class="avatar-big" style="margin:0 auto">${avatarHTML(b)}</div>
              <h3 style="margin:8px 0 4px">${esc(b.name)}</h3>
              <p class="muted">🔥 ${b.streak}-day streak · ⚡ ${b.xp} XP · 🏅 ${b.badges} badges</p>
              ${b.team ? `<div class="team-goal ${b.team.done && !b.team.claimed ? 'ready' : ''}">
                <div class="tg-head">🏇 Team Gallop: <b>${Math.min(b.team.combined, b.team.goal)}/${b.team.goal}</b> answers this week</div>
                <div class="tg-bar"><div class="tg-fill" style="width:${Math.min(100, b.team.combined / b.team.goal * 100)}%"></div></div>
                ${b.team.claimed ? '<div class="tg-note">✅ Team bonus collected — new goal next week!</div>'
                  : b.team.done ? `<button class="btn sun small" style="margin-top:6px" data-teamclaim="${b.id}">Collect team bonus! +${b.team.reward} 🪙 each</button>`
                  : `<div class="tg-note">Answer questions together — you BOTH win ${b.team.reward} coins!</div>`}
              </div>` : ''}
              <button class="btn sun small" style="margin-top:10px" data-cheer="${b.id}">Cheer 📣</button>
              <button class="btn green small" style="margin-top:10px" data-challenge="${b.id}" data-bname="${esc(b.name)}">Challenge ⚡</button>
            </div>`).join('')}
        </div>` : `
        <div class="card center">
          <div class="big-emoji">🫂</div>
          <h2>No buddies yet!</h2>
          <p class="muted" style="margin:10px 0">Ask your parent to connect you with friends from school — they make an invite code in the Parent Dashboard.</p>
        </div>`}
      ${out.length ? `<div class="card" style="margin-top:16px">
        <h3>🚀 Your challenges sent</h3>
        ${out.map(c => `<div class="kid-row">${c.status === 'won' ? '😮' : '⏳'} You dared <b>${esc(c.toName)}</b> to beat <b>${c.scoreToBeat}</b> in ${esc(c.gameName)} — ${c.status === 'won' ? `they DID it! Time for a rematch!` : 'still waiting…'}</div>`).join('')}
      </div>` : ''}
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
    document.querySelectorAll('[data-teamclaim]').forEach(b => b.onclick = async () => {
      try {
        await api(`/buddies/${kidId()}/team-claim`, { method: 'POST', body: { buddyId: Number(b.dataset.teamclaim) } });
        Sound.levelup(); Confetti.burst(160);
        await window.BP.refreshMe();
        navigate();
      } catch (e) { Sound.wrong(); }
    });
    document.querySelectorAll('[data-challenge]').forEach(b => b.onclick = () => {
      const toKid = Number(b.dataset.challenge), bname = b.dataset.bname;
      const names = data.games || {};
      const div = document.createElement('div');
      div.className = 'celebrate';
      div.innerHTML = `<h2>⚡ Challenge ${esc(bname)}!</h2>
        <p style="max-width:460px">Pick a game — your BEST score becomes the target. If ${esc(bname)} beats it within 7 days, they win 5 bonus coins (then you rematch!).</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:560px">
          ${Object.keys(names).map(g => `<button class="btn sun small" data-g="${g}">${esc(names[g])}</button>`).join('')}</div>
        <div id="ch-msg" style="margin-top:10px;font-weight:700"></div>
        <button class="btn ghost" style="margin-top:10px">Cancel</button>`;
      div.querySelector('.btn.ghost').onclick = () => div.remove();
      div.querySelectorAll('[data-g]').forEach(gb => gb.onclick = async () => {
        try {
          const r = await api(`/buddies/${kidId()}/challenge`, { method: 'POST', body: { toKid, game: gb.dataset.g } });
          Sound.badge(); Confetti.burst(80);
          div.querySelector('#ch-msg').textContent = `Challenge sent! ${bname} must beat ${r.scoreToBeat}. ⚡`;
          setTimeout(() => { div.remove(); navigate(); }, 1600);
        } catch (e) { Sound.wrong(); div.querySelector('#ch-msg').textContent = e.message; }
      });
      document.body.appendChild(div);
    });
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
