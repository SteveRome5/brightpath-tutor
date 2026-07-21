/* Gallop Learning Academy — Play Zone: games, avatar builder, buddies */
'use strict';
(() => {
  const { $, app, esc, api, route, navigate, topbar, wireChrome, showError, State, Sound, Voice, Confetti, AVATARS, ITEM_EMOJI, avatarHTML } = window.BP;

  const kidId = () => State.me.role === 'kid' ? State.me.kid.id : null;
  function needKid() { if (State.me.role !== 'kid') { location.hash = '#kid-login'; return true; } return false; }

  // ============================================================
  //  16-bit PIXEL ENGINE — shared by every arcade game.
  //  Games draw into a small low-res buffer; the browser scales it
  //  up with nearest-neighbour (image-rendering:pixelated) so every
  //  shape becomes a crisp chunky pixel — classic SNES look.
  // ============================================================
  const PX = {
    // filled pixel block (integer-snapped)
    r(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    // a single pixel
    p(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); },
    // sprite from rows of characters, mapped to colors ('.' or ' ' = transparent)
    spr(ctx, rows, x, y, map, s) {
      s = s || 1;
      for (let j = 0; j < rows.length; j++) { const row = rows[j]; for (let i = 0; i < row.length; i++) { const c = map[row[i]]; if (c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s); } } }
    },
    // horizontally-mirrored sprite (for walking left/right)
    sprFlip(ctx, rows, x, y, map, s) {
      s = s || 1; const w = rows[0].length;
      for (let j = 0; j < rows.length; j++) { const row = rows[j]; for (let i = 0; i < row.length; i++) { const c = map[row[i]]; if (c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x + (w - 1 - i) * s), Math.round(y + j * s), s, s); } } }
    },
    // pixel-font text drawn on the canvas
    text(ctx, str, x, y, c, size, align) { ctx.fillStyle = c; ctx.font = `${size || 8}px "Press Start 2P", monospace`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, Math.round(x), Math.round(y)); },
    // classic beveled panel (dark border, light inner highlight)
    panel(ctx, x, y, w, h, fill, dark, light) {
      PX.r(ctx, x, y, w, h, fill);
      PX.r(ctx, x, y, w, 1, light); PX.r(ctx, x, y, 1, h, light);
      PX.r(ctx, x, y + h - 1, w, 1, dark); PX.r(ctx, x + w - 1, y, 1, h, dark);
    },
    // 2px ordered-dither band between two colors (adds retro shading)
    dither(ctx, x, y, w, h, c) { ctx.fillStyle = c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { if (((i + j) & 1) === 0) ctx.fillRect(Math.round(x + i), Math.round(y + j), 1, 1); } }
  };
  // A shared retro palette (NES/SNES-flavoured).
  const PAL = {
    sky1: '#5c94fc', sky2: '#8fb8ff', skyHeat1: '#f8a03c', skyHeat2: '#ffce6b', skyGrey1: '#9aa6b4', skyGrey2: '#c2cbd6', skyDusk: '#3a2a5c',
    sun: '#fce000', sunCore: '#fff6b0', cloud: '#ffffff', cloudSh: '#c8d4e4',
    grass1: '#3ca03c', grass2: '#2c7c2c', dirt: '#c08444', walk: '#b8b8c0', walkSh: '#9090a0',
    wood: '#a4531c', woodDk: '#7a3a10', woodLt: '#c87a34', red: '#d82828', white: '#fcfcfc', ink: '#181828',
    skin: '#fcac6c', skin2: '#e08a4c', hair: '#5a3010', gold: '#fcd000', goldDk: '#c89000', green: '#20a050', greenDk: '#106030'
  };
  function pixelCtx(cv) { const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.webkitImageSmoothingEnabled = false; return g; }
  // Shared 8x20 pixel character. y = feet baseline. opts.hat: 'chef'. walk animates.
  function pixPerson(ctx, x, y, shirt, walk, ts, opts) {
    opts = opts || {}; const step = walk ? (Math.floor(ts / 130) % 2) : 0;
    PX.r(ctx, x - 3, y - 4, 2, 4, PAL.ink); PX.r(ctx, x + 1, y - 4, 2, 4, PAL.ink);
    if (walk && step) { PX.r(ctx, x - 4, y - 2, 1, 2, PAL.ink); PX.r(ctx, x + 3, y - 4, 1, 2, PAL.ink); }
    PX.r(ctx, x - 4, y - 12, 8, 8, shirt);
    PX.r(ctx, x - 5, y - 11, 1, 5, shirt); PX.r(ctx, x + 4, y - 11, 1, 5, shirt);
    PX.r(ctx, x - 3, y - 19, 6, 7, PAL.skin);
    if (!opts.hat) { PX.r(ctx, x - 3, y - 20, 6, 2, PAL.hair); PX.r(ctx, x - 4, y - 19, 1, 2, PAL.hair); PX.r(ctx, x + 3, y - 19, 1, 2, PAL.hair); }
    PX.p(ctx, x - 2, y - 16, PAL.ink); PX.p(ctx, x + 1, y - 16, PAL.ink);
    if (opts.hat === 'chef') { PX.r(ctx, x - 4, y - 21, 8, 2, PAL.white); PX.r(ctx, x - 3, y - 23, 6, 2, PAL.white); }
  }
  // Chunky 6x7 pixel star.
  function pixStar(ctx, x, y, col) { PX.r(ctx, x + 2, y, 2, 7, col); PX.r(ctx, x, y + 2, 6, 2, col); PX.p(ctx, x + 1, y + 1, col); PX.p(ctx, x + 4, y + 1, col); PX.p(ctx, x + 1, y + 5, col); PX.p(ctx, x + 4, y + 5, col); }

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
        <button class="btn ghost small" style="color:#1A5C38;border-color:#1A5C38;margin-left:8px" onclick="location.hash='#play'">Back</button>
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
      <p class="game-hint" style="margin-bottom:14px">Each game costs 1 🎟️ — every 5 correct answers in your lessons earns a new one. Learn to play! 💪</p>
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
    const starters = { bakery: startBakery, memory: startMemory, wordsearch: startWordSearch, code: startCode, art: startArt, lemonade: startLemonade, market: startMarket, blitz: startBlitz };
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
    const setLabel = setName === 'spanish' ? '🌎 Spanish' : setName === 'math' ? '🔢 Math Facts' : '📚 Words';
    const cardEl = i => document.querySelector(`.mem-card[data-i="${i}"]`);
    function setMoves() { const m = $('#mem-moves'); if (m) m.textContent = moves; }
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🃏 Memory Match — ${setLabel}</b><b>Moves: <span id="mem-moves">${moves}</span></b></div>
        <div class="mem-grid">
          ${cards.map((c, i) => `
            <button class="mem-card" data-i="${i}" aria-label="card">
              <div class="mem-inner">
                <div class="mem-face mem-front"><span>🐎</span></div>
                <div class="mem-face mem-back"><span>${esc(c.v)}</span></div>
              </div>
            </button>`).join('')}
        </div>
        <p class="game-hint">Flip two cards — match each picture or problem with its pair!</p>
      </div>`);
      wireChrome();
      document.querySelectorAll('.mem-card').forEach(el => el.onclick = () => flip(Number(el.dataset.i)));
    }
    function flip(i) {
      if (lock || flipped.includes(i) || matched.has(cards[i].p)) return;
      Sound.click();
      flipped.push(i);
      const el = cardEl(i); if (el) el.classList.add('is-up');
      if (flipped.length === 2) {
        moves++; setMoves();
        const [a, b] = flipped;
        if (cards[a].p === cards[b].p && a !== b) {
          matched.add(cards[a].p); Sound.correct(); flipped = [];
          setTimeout(() => { [a, b].forEach(k => { const e = cardEl(k); if (e) e.classList.add('is-matched'); }); Confetti.burst(24); }, 260);
          if (matched.size === 6) {
            const secs = Math.round((Date.now() - t0) / 1000);
            const score = Math.max(10, 200 - moves * 10 - secs);
            setTimeout(() => finishGame('memory', score, 'All pairs matched! 🧠', `${moves} moves in ${secs} seconds. Fewer moves = bigger score!`), 900);
          }
        } else {
          lock = true; Sound.wrong();
          setTimeout(() => {
            [a, b].forEach(k => { const e = cardEl(k); if (e) e.classList.add('is-wrong'); });
          }, 260);
          setTimeout(() => {
            [a, b].forEach(k => { const e = cardEl(k); if (e) e.classList.remove('is-up', 'is-wrong'); });
            flipped = []; lock = false;
          }, 950);
        }
      }
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
    const wordPos = {}; // word -> exact cells recorded AT PLACEMENT (never re-searched)
    for (const w of words) {
      for (let tries = 0; tries < 200; tries++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r0 = Math.floor(Math.random() * (size - (dr ? w.length : 1)));
        const c0 = Math.floor(Math.random() * (size - (dc ? w.length : 1)));
        let ok = true;
        for (let i = 0; i < w.length; i++) { const ch = grid[r0 + dr * i][c0 + dc * i]; if (ch && ch !== w[i]) { ok = false; break; } }
        if (!ok) continue;
        for (let i = 0; i < w.length; i++) grid[r0 + dr * i][c0 + dc * i] = w[i];
        wordPos[w] = Array.from({ length: w.length }, (_, i) => ({ r: r0 + dr * i, c: c0 + dc * i }));
        placed.push(w); break;
      }
    }
    const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = AZ[Math.floor(Math.random() * 26)];
    let found = new Set(), sel = [], t0 = Date.now(), justFound = null;
    function cellKey(r, c) { return r + ',' + c; }
    function render() {
      const justCells = justFound ? wordCells(justFound) : [];
      app().innerHTML = topbar(`<div class="container" style="max-width:640px">
        <div class="lesson-top"><b>🔍 Word Search ${setName === 'spanish' ? '— 🌎 ¡en español!' : ''}</b><b>${found.size}/${placed.length} found</b></div>
        <div class="ws-grid" style="grid-template-columns:repeat(${size},1fr)">
          ${grid.map((row, r) => row.map((ch, c) => {
            const inSel = sel.some(s => s.r === r && s.c === c);
            const inFound = [...found].some(w => wordCells(w).some(x => x.r === r && x.c === c));
            const isJust = justCells.some(x => x.r === r && x.c === c);
            return `<button class="ws-cell ${inFound ? 'found' : inSel ? 'sel' : ''}${isJust ? ' just' : ''}" data-r="${r}" data-c="${c}">${ch}</button>`;
          }).join('')).join('')}
        </div>
        <div class="badge-shelf" style="justify-content:center;margin-top:14px">
          ${placed.map(w => `<div class="badge-item ${found.has(w) ? 'ws-done' : ''}">${found.has(w) ? '✓ ' : ''}${w}</div>`).join('')}
        </div>
        <p class="game-hint">Tap the FIRST letter, then the LAST letter of a word!</p>
      </div>`);
      wireChrome();
      justFound = null;
      document.querySelectorAll('.ws-cell').forEach(el => el.onclick = () => pick(Number(el.dataset.r), Number(el.dataset.c)));
    }
    // Use the exact cells recorded when each word was placed — never re-derive from the
    // grid, or random filler letters could spell a word elsewhere and mark a correct tap wrong.
    function wordCells(w) { return wordPos[w] || []; }
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
          found.add(hit); justFound = hit; Sound.correct(); Confetti.burst(40);
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
  const CQ_ARROWS = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
  function startCode() {
    let levelIdx = 0, program = [], score = 0;
    let raf = null, robot = { r: 0, c: 0 }, anim = null, running = false, crashT = 0, winT = 0, particles = [], msg = null, blinkT = 0;
    const lvl = () => CODE_LEVELS[levelIdx];
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const glide = to => new Promise(res => { anim = { from: { ...robot }, to, t0: performance.now(), dur: 300, done: res }; });
    function burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * 3.2; particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.2, r: 2 + Math.random() * 2.5, life: 34, max: 34, col }); } }

    // 16-bit pixel sprites
    function drawStar(ctx, x, y, r, ts) {
      x = Math.round(x); y = Math.round(y); const s = Math.max(3, Math.round(r * 0.7)); const c = PAL.gold;
      PX.r(ctx, x - 1, y - s, 2, s * 2, c); PX.r(ctx, x - s, y - 1, s * 2, 2, c);
      const d = Math.round(s * 0.6); PX.r(ctx, x - d, y - d, 2, 2, c); PX.r(ctx, x + d - 1, y - d, 2, 2, c); PX.r(ctx, x - d, y + d - 1, 2, 2, c); PX.r(ctx, x + d - 1, y + d - 1, 2, 2, c);
      PX.r(ctx, x - 1, y - 1, 2, 2, '#fff2a8');
    }
    function drawRock(ctx, x, y, r) {
      x = Math.round(x); y = Math.round(y); const s = Math.round(r);
      PX.r(ctx, x - s, y - s / 2, s * 2, s, '#8b8f98'); PX.r(ctx, x - s + 2, y - s, s * 2 - 4, s / 2 + 1, '#8b8f98');
      PX.r(ctx, x - s, y - s / 2, s * 2, 1, '#a8adb6'); PX.r(ctx, x - s + 2, y - s / 2 + 1, s / 2, 1, 'rgba(255,255,255,.3)');
      PX.r(ctx, x - s, y + s / 2 - 1, s * 2, 1, '#6a6e76');
    }
    function drawRobot(ctx, x, y, r, ts) {
      x = Math.round(x); y = Math.round(y);
      const bw = Math.round(r * 1.7), bh = Math.round(r * 1.6), hw = bw >> 1, hh = bh >> 1;
      PX.r(ctx, x - hw, y + hh, bw, 2, 'rgba(0,0,0,.2)');
      PX.r(ctx, x - 1, y - hh - 4, 2, 4, PAL.gold); PX.r(ctx, x - 2, y - hh - 6, 4, 3, PAL.gold);
      PX.r(ctx, x - hw, y - hh, bw, bh, '#1f7a48');
      PX.r(ctx, x - hw, y - hh, bw, 1, '#2ea060'); PX.r(ctx, x - hw, y + hh - 1, bw, 1, '#124a2c');
      PX.r(ctx, x - hw, y - hh, 1, bh, '#124a2c'); PX.r(ctx, x + hw - 1, y - hh, 1, bh, '#124a2c');
      PX.r(ctx, x - hw + 3, y - hh + 3, bw - 6, Math.round(bh * 0.5), '#0e2c1c');
      const blink = (ts % 3200) < 140;
      if (blink) { PX.r(ctx, x - 5, y - 2, 3, 1, '#7fe3b0'); PX.r(ctx, x + 2, y - 2, 3, 1, '#7fe3b0'); }
      else { PX.r(ctx, x - 6, y - 4, 3, 3, '#7fe3b0'); PX.r(ctx, x + 3, y - 4, 3, 3, '#7fe3b0'); PX.p(ctx, x - 5, y - 3, '#0e2c1c'); PX.p(ctx, x + 4, y - 3, '#0e2c1c'); }
      PX.r(ctx, x - 3, y + 2, 6, 1, '#7fe3b0'); PX.p(ctx, x - 4, y + 1, '#7fe3b0'); PX.p(ctx, x + 3, y + 1, '#7fe3b0');
      PX.r(ctx, x - hw, y + hh, bw, 3, PAL.ink); PX.r(ctx, x - hw, y + hh, 2, 3, '#333'); PX.r(ctx, x + hw - 2, y + hh, 2, 3, '#333');
    }

    function draw(ctx, ts) {
      const L = lvl(), S = L.size, W = 160, cell = W / S;
      ctx.clearRect(0, 0, W, W);
      let sx = 0; if (crashT) { const dt = ts - crashT; if (dt < 420) sx = Math.round(Math.sin(dt / 20) * (1 - dt / 420) * 4); else crashT = 0; }
      ctx.save(); ctx.translate(sx, 0);
      for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) PX.r(ctx, c * cell, r * cell, cell + 1, cell + 1, (r + c) % 2 ? '#bfe8c8' : '#e8f4d8');
      for (const w of L.walls) { const [wr, wc] = w.split(',').map(Number); drawRock(ctx, wc * cell + cell / 2, wr * cell + cell / 2, cell * 0.3); }
      drawStar(ctx, L.goal[1] * cell + cell / 2, L.goal[0] * cell + cell / 2, cell * 0.3 * (1 + Math.sin(ts / 300) * 0.08), ts);
      let dr = robot.r, dc = robot.c;
      if (anim) { const k = Math.min(1, (ts - anim.t0) / anim.dur); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; dr = anim.from.r + (anim.to.r - anim.from.r) * e; dc = anim.from.c + (anim.to.c - anim.from.c) * e; if (k >= 1) { robot = anim.to; const d = anim.done; anim = null; if (d) d(); } }
      drawRobot(ctx, dc * cell + cell / 2, dr * cell + cell / 2 + Math.sin(ts / 180) * 1, cell * 0.3, ts);
      particles = particles.filter(p => { p.life--; p.x += p.vx; p.y += p.vy; p.vy += 0.16; if (p.life > 0) { ctx.globalAlpha = Math.max(0, p.life / p.max); PX.r(ctx, p.x, p.y, 2, 2, p.col); ctx.globalAlpha = 1; return true; } return false; });
      ctx.restore();
    }

    function loop() {
      const cv = $('#cq-canvas'); if (!cv) { cancelAnimationFrame(raf); return; }
      draw(pixelCtx(cv), performance.now());
      raf = requestAnimationFrame(loop);
    }

    async function execute() {
      if (running || !program.length) return; running = true; msg = null;
      document.querySelectorAll('.cq-key,#cq-run,#cq-undo,#cq-clear').forEach(b => b.disabled = true);
      const L = lvl(), cell = 160 / L.size; robot = { r: L.start[0], c: L.start[1] }; await wait(180);
      for (const cmd of program) {
        const [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[cmd];
        const nr = robot.r + dr, nc = robot.c + dc;
        if (nr < 0 || nc < 0 || nr >= L.size || nc >= L.size || L.walls.includes(nr + ',' + nc)) {
          crashT = performance.now(); Sound.wrong();
          burst(robot.c * cell + cell / 2, robot.r * cell + cell / 2, '#eb5757', 20);
          await wait(650); msg = { good: false, text: '💥 Crash! Robo bumped into something. Tweak the plan and try again.' }; render(); return;
        }
        await glide({ r: nr, c: nc });
      }
      if (robot.r === L.goal[0] && robot.c === L.goal[1]) {
        winT = performance.now(); const bonus = Math.max(15, 70 - program.length * 4); score += bonus;
        Sound.correct(); Confetti.burst(70); burst(robot.c * cell + cell / 2, robot.r * cell + cell / 2, '#C9A84C', 26);
        await wait(750); program = [];
        if (levelIdx === CODE_LEVELS.length - 1) { finishGame('code', score, 'Every level solved! 🤖', `Shorter programs earn bigger bonuses, just like real code. Final score ${score}!`); return; }
        levelIdx++; msg = { good: true, text: `⭐ Star reached! +${bonus} points. On to level ${levelIdx + 1}!` }; render();
      } else { Sound.wrong(); msg = { good: false, text: 'Robo stopped short of the star. Add a few more steps!' }; render(); }
    }

    function render() {
      const L = lvl();
      app().innerHTML = topbar(`<div class="container" style="max-width:520px">
        <div class="lesson-top"><b>🤖 Code Quest — Level ${levelIdx + 1}/${CODE_LEVELS.length}</b><b>Score: ${score}</b></div>
        <div class="cq-stage px-stage"><canvas id="cq-canvas" width="160" height="160"></canvas></div>
        <div class="cq-pad">
          <span></span><button class="cq-key" data-cmd="up">▲</button><span></span>
          <button class="cq-key" data-cmd="left">◀</button><button class="cq-key" data-cmd="down">▼</button><button class="cq-key" data-cmd="right">▶</button>
        </div>
        <div class="card cq-prog">
          <div class="cq-prog-head"><b>🧩 Robo's plan</b><span class="muted">💡 ${esc(L.hint)}</span></div>
          <div class="cq-steps" id="cq-steps">${program.length ? program.map(c => `<span class="cq-chip">${CQ_ARROWS[c]}</span>`).join('') : '<span class="muted">Tap the arrows to plan Robo\'s path to the star ⭐</span>'}</div>
          <div class="cq-actions">
            <button class="btn green" id="cq-run" ${program.length ? '' : 'disabled'}>▶ Run</button>
            <button class="btn ghost small" id="cq-undo" ${program.length ? '' : 'disabled'}>⤺ Undo</button>
            <button class="btn coral small" id="cq-clear" ${program.length ? '' : 'disabled'}>Clear</button>
          </div>
          ${msg ? `<div class="cq-feedback ${msg.good ? 'good' : 'bad'}">${esc(msg.text)}</div>` : ''}
        </div>
      </div>`);
      wireChrome();
      robot = { r: L.start[0], c: L.start[1] }; anim = null; running = false; crashT = 0; winT = 0; particles = [];
      document.querySelectorAll('.cq-key').forEach(b => b.onclick = () => { if (running) return; if (program.length < 24) { program.push(b.dataset.cmd); Sound.click(); render(); } });
      const run = $('#cq-run'); if (run) run.onclick = execute;
      const undo = $('#cq-undo'); if (undo) undo.onclick = () => { program.pop(); Sound.click(); render(); };
      const clr = $('#cq-clear'); if (clr) clr.onclick = () => { program = []; Sound.wrong(); render(); };
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
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
          <div style="margin-top:8px">${ROOM_CHALLENGES.map((c, i) => `<button class="btn ghost small" style="color:#1A5C38;border-color:${i === challengeIdx ? '#1A5C38' : '#ddd'};margin-right:6px" data-ch="${i}">${done.has(i) ? '✅' : ''} ${i === 0 ? 'Free' : 'Level ' + i}</button>`).join('')}</div>
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
    let guide = null, color = '#e43b44', size = 2, drawing = false, last = null;
    // Retro 16-bit paint palette
    const COLORS = ['#e43b44', '#f77622', '#feae34', '#63c74d', '#0095e9', '#124e89', '#b55088', '#3a2e4d', '#ffffff', '#181818'];
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
        <canvas id="art-canvas" class="px-stage" width="176" height="112"></canvas>
        <div class="center" style="margin-top:10px">
          ${COLORS.map(c => `<button class="paint ${color === c ? 'sel' : ''}" style="background:${c}" data-c="${c}"></button>`).join('')}
          <button class="btn ghost small" style="color:#1A5C38;border-color:#1A5C38" id="size-btn">✏️ ${size <= 1 ? 'Fine' : size <= 2 ? 'Medium' : 'Chunky'}</button>
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
      ctx.imageSmoothingEnabled = false;
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
      $('#size-btn').onclick = function () { size = size <= 1 ? 2 : size <= 2 ? 4 : 1; this.textContent = '✏️ ' + (size <= 1 ? 'Fine' : size <= 2 ? 'Medium' : 'Chunky'); };
      $('#clear-art').onclick = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); Sound.wrong(); };
      $('#save-art').onclick = () => {
        // upscale the low-res pixel art 5x with nearest-neighbour for a crisp export
        const big = document.createElement('canvas'); big.width = canvas.width * 5; big.height = canvas.height * 5;
        const bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(canvas, 0, 0, big.width, big.height);
        const a = document.createElement('a');
        a.download = 'my-gallop-art.png'; a.href = big.toDataURL('image/png'); a.click();
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
    const RING_C = 2 * Math.PI * 52; // r=52
    function ringDash(t) { return `${RING_C} ${RING_C}`; }
    function ringOffset(t) { return RING_C * (1 - t / DURATION); }
    let qn = makeQ();
    function render() {
      if (over) return;
      const ch = choicesFor(qn);
      const hot = timeLeft <= 10;
      app().innerHTML = topbar(`<div class="container" style="max-width:560px">
        <div class="lesson-top"><b>⚡ Lightning Round</b><b>Score: <span id="bz-score">${score}</span></b></div>
        <div class="bz-ringwrap">
          <svg class="bz-ring ${hot ? 'hot' : ''}" viewBox="0 0 120 120" width="132" height="132">
            <circle class="bz-ring-bg" cx="60" cy="60" r="52"></circle>
            <circle class="bz-ring-fg" cx="60" cy="60" r="52"
              stroke-dasharray="${ringDash(timeLeft)}" stroke-dashoffset="${ringOffset(timeLeft)}"></circle>
          </svg>
          <div class="bz-ring-num"><span id="bz-time">${timeLeft}</span><small>sec</small></div>
        </div>
        <div class="card center bz-card" style="padding:26px">
          <div class="combo-badge ${combo >= 3 ? 'show' : ''}" id="bz-combo">🔥 COMBO ×<span>${combo}</span></div>
          <div class="blitz-q" id="bz-q">${qn.t} = ?</div>
          <div class="blitz-choices">${ch.map(c => `<button class="btn blitz-btn" data-v="${c}">${c}</button>`).join('')}</div>
          <p class="muted" style="margin-top:12px">Combos of 3+ score <b>DOUBLE</b> points! 🔥</p>
        </div>
      </div>`);
      wireChrome();
      document.querySelectorAll('.blitz-btn').forEach(b => b.onclick = () => {
        if (over) return;
        answered++;
        const right = Number(b.dataset.v) === qn.ans;
        if (right) {
          correct++; combo++; best = Math.max(best, combo);
          const gain = combo >= 3 ? 20 : 10; score += gain;
          Sound.correct();
          b.classList.add('right');
          floatGain(b, '+' + gain);
          const card = document.querySelector('.bz-card'); if (card) { card.classList.remove('juice'); void card.offsetWidth; card.classList.add('juice'); }
          if (combo === 3) Confetti.burst(40);
          if (combo >= 3 && combo % 5 === 0) Confetti.burst(60);
        } else {
          combo = 0; Sound.wrong();
          b.classList.add('wrong');
          const card = document.querySelector('.bz-card'); if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
        }
        // brief pause so the tap feedback is visible before the next question
        setTimeout(() => { if (!over) { qn = makeQ(); render(); } }, right ? 140 : 260);
      });
    }
    function floatGain(anchor, text) {
      const f = document.createElement('div'); f.className = 'bz-float'; f.textContent = text;
      const wrap = document.querySelector('.bz-card'); if (!wrap) return;
      wrap.appendChild(f);
      setTimeout(() => f.remove(), 700);
    }
    timer = setInterval(() => {
      // player navigated away mid-game — stop cleanly
      if (!document.querySelector('.bz-ring')) { clearInterval(timer); over = true; return; }
      timeLeft--;
      const fg = document.querySelector('.bz-ring-fg');
      if (fg) fg.setAttribute('stroke-dashoffset', ringOffset(timeLeft));
      const svg = document.querySelector('.bz-ring');
      if (svg && timeLeft <= 10) svg.classList.add('hot');
      const num = document.querySelector('#bz-time');
      if (num) num.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer); over = true;
        finishGame('blitz', score, `${score} points in 60 seconds! ⚡`, `${correct}/${answered} correct · best combo ×${best}. Faster brains next round!`);
      }
    }, 1000);
    render();
  }

  // ======================= LEMONADE TYCOON (canvas) =======================
  // Entrepreneurship for every age: cost, price, demand, PROFIT — rendered as a
  // living illustrated storefront (weather, customers, coins) instead of a form.
  function startLemonade() {
    const DAYS = 5, CUP_COST = 0.5;
    const WEATHER = [
      { id: 'heat', label: 'Heat Wave', icon: '🔥', base: 44, sky: ['#ffd36b', '#ff9e5e'], hot: true },
      { id: 'sunny', label: 'Sunny', icon: '☀️', base: 28, sky: ['#8fd0ff', '#d9f2ff'], sun: true },
      { id: 'cloudy', label: 'Cloudy', icon: '⛅', base: 16, sky: ['#b7c4cf', '#dfe7ec'], cloud: true },
      { id: 'rainy', label: 'Rainy', icon: '🌧️', base: 7, sky: ['#7d8a99', '#aab6c2'], rain: true, cloud: true }
    ];
    const $$ = n => (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
    let day = 1, cash = 10, totalProfit = 0;
    let wx = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    let cups = null, price = null, phase = 'plan';
    // live scene state
    let raf = null, custs = [], coins = [], drops = [], soldCount = 0, cupsLeft = 0, sellEndCb = null;

    // ---------- 16-bit pixel scene (256x160 buffer, nearest-neighbour scaled) ----------
    const W = 256, H = 160, GY = 128; // ground line
    function pcircle(ctx, cx, cy, r, col) { ctx.fillStyle = col; for (let y = -r; y <= r; y++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - y * y))); ctx.fillRect(Math.round(cx - dx), Math.round(cy + y), dx * 2 + 1, 1); } }
    function pperson(ctx, x, y, shirt, walk, ts, keeper) {
      const step = walk ? (Math.floor(ts / 130) % 2) : 0;
      PX.r(ctx, x - 3, y - 4, 2, 4, PAL.ink); PX.r(ctx, x + 1, y - 4, 2, 4, PAL.ink);
      if (walk && step) { PX.r(ctx, x - 4, y - 2, 1, 2, PAL.ink); PX.r(ctx, x + 3, y - 4, 1, 2, PAL.ink); }
      PX.r(ctx, x - 4, y - 12, 8, 8, shirt);
      PX.r(ctx, x - 5, y - 11, 1, 5, shirt); PX.r(ctx, x + 4, y - 11, 1, 5, shirt);
      PX.r(ctx, x - 3, y - 19, 6, 7, PAL.skin);
      if (!keeper) { PX.r(ctx, x - 3, y - 20, 6, 2, PAL.hair); PX.r(ctx, x - 4, y - 19, 1, 2, PAL.hair); PX.r(ctx, x + 3, y - 19, 1, 2, PAL.hair); }
      PX.p(ctx, x - 2, y - 16, PAL.ink); PX.p(ctx, x + 1, y - 16, PAL.ink);
      if (keeper) { PX.r(ctx, x - 4, y - 21, 8, 2, PAL.white); PX.r(ctx, x - 3, y - 23, 6, 2, PAL.white); } // chef cap
    }
    function pcloud(ctx, x, y) { const c = wx.rain ? PAL.cloudSh : PAL.cloud; PX.r(ctx, x, y, 20, 6, c); PX.r(ctx, x + 4, y - 4, 12, 5, c); PX.r(ctx, x - 3, y + 2, 26, 4, c); }
    function sky(ctx, ts) {
      let a, b; if (wx.id === 'heat') { a = PAL.skyHeat1; b = PAL.skyHeat2; } else if (wx.id === 'sunny') { a = PAL.sky1; b = PAL.sky2; } else { a = PAL.skyGrey1; b = PAL.skyGrey2; }
      const band = GY - 40;
      PX.r(ctx, 0, 0, W, band * 0.5, a); PX.dither(ctx, 0, band * 0.5 - 6, W, 12, b); PX.r(ctx, 0, band * 0.5 + 6, W, band * 0.5, b);
      if (wx.sun || wx.hot) {
        pcircle(ctx, 42, 30, wx.hot ? 12 : 10, PAL.sun); pcircle(ctx, 40, 28, wx.hot ? 6 : 5, PAL.sunCore);
        for (let i = 0; i < 8; i++) { const a2 = i * Math.PI / 4 + ts / 3000; PX.r(ctx, 42 + Math.cos(a2) * 17 - 1, 30 + Math.sin(a2) * 17 - 1, 2, 2, PAL.sun); }
      }
      if (wx.cloud) { pcloud(ctx, 150 + (Math.sin(ts / 4000) * 6 | 0), 22); pcloud(ctx, 206 + (Math.cos(ts / 4500) * 6 | 0), 40); }
    }
    function ground(ctx) {
      for (let x = 0; x < W; x += 8) for (let y = GY - 40; y < GY; y += 8) PX.r(ctx, x, y, 8, 8, ((x + y) & 8) ? PAL.grass1 : PAL.grass2);
      for (const hx of [16, 208]) { PX.r(ctx, hx, GY - 48, 22, 16, '#d8c090'); PX.r(ctx, hx - 2, GY - 52, 26, 5, PAL.red); PX.r(ctx, hx + 4, GY - 44, 5, 5, '#6a4a2a'); }
      PX.r(ctx, 0, GY, W, H - GY, PAL.walk);
      PX.r(ctx, 0, GY, W, 1, PAL.walkSh);
      for (let x = 0; x < W; x += 24) PX.r(ctx, x, GY, 1, H - GY, PAL.walkSh);
    }
    function stand(ctx, ts) {
      const cx = 90, cy = 100, cw = 108, ch = 40;
      pperson(ctx, cx + 26, cy + 8, PAL.green, false, ts, true);
      // awning
      const ax = cx - 8, aw = cw + 16, seg = 8, sw = aw / seg;
      PX.r(ctx, ax, cy - 22, aw, 8, PAL.red);
      for (let i = 0; i < seg; i++) { PX.r(ctx, ax + i * sw, cy - 14, sw, 6, i % 2 ? PAL.white : PAL.red); PX.r(ctx, ax + i * sw + 1, cy - 8, sw - 2, 2, i % 2 ? PAL.white : PAL.red); }
      // counter
      PX.r(ctx, cx, cy, cw, ch, PAL.wood);
      for (let i = 1; i < 6; i++) PX.r(ctx, cx + Math.round(i * cw / 6), cy + 4, 1, ch - 4, PAL.woodDk);
      PX.r(ctx, cx - 4, cy - 4, cw + 8, 5, PAL.woodLt);
      PX.r(ctx, cx, cy + ch - 2, cw, 2, PAL.woodDk);
      // sign
      PX.panel(ctx, cx + 14, cy + 8, cw - 28, 15, PAL.white, PAL.woodDk, '#ffffff');
      PX.text(ctx, 'LEMONADE', cx + cw / 2, cy + 19, PAL.greenDk, 6, 'center');
      // pitcher + cups
      PX.r(ctx, cx + cw - 20, cy - 14, 14, 16, '#dff0ff'); PX.r(ctx, cx + cw - 18, cy - 10, 10, 10, PAL.gold); PX.r(ctx, cx + cw - 6, cy - 12, 3, 6, '#dff0ff');
      for (let i = 0; i < 3; i++) PX.r(ctx, cx + 6 + i * 2, cy - 9 - i * 2, 8, 11, '#f0ece0');
      // price tag
      PX.panel(ctx, cx + cw - 1, cy + 4, 22, 13, PAL.gold, PAL.goldDk, '#fff2a8');
      PX.text(ctx, price ? '$' + price.toFixed(2).replace('.00', '') : '?', cx + cw + 10, cy + 14, PAL.ink, 6, 'center');
    }
    function pcoin(ctx, c) { const w = Math.max(2, Math.round(Math.abs(Math.cos(c.t)) * 6)); PX.r(ctx, c.x - w / 2, c.y - 4, w, 8, PAL.gold); PX.r(ctx, c.x - w / 2, c.y - 4, w, 1, PAL.goldDk); PX.r(ctx, c.x - w / 2, c.y + 3, w, 1, PAL.goldDk); }
    function hud(ctx) {
      const sh = (s, x, y, col, sz, al) => { PX.text(ctx, s, x + 1, y + 1, 'rgba(0,0,0,.45)', sz, al); PX.text(ctx, s, x, y, col, sz, al); };
      sh('DAY ' + day + '/' + DAYS, 6, 13, PAL.white, 7, 'left');
      sh(wx.label.toUpperCase(), W / 2, 12, PAL.white, 6, 'center');
      PX.r(ctx, W - 18, 5, 12, 9, '#bfe0ff'); PX.r(ctx, W - 18, 9, 12, 5, PAL.gold);
      sh('$' + cash.toFixed(2), W - 22, 13, PAL.white, 7, 'right');
    }
    function scene(ctx, ts) {
      ctx.clearRect(0, 0, W, H);
      sky(ctx, ts); ground(ctx);
      if (wx.rain) drops.forEach(d => { PX.r(ctx, d.x, d.y, 1, 4, '#bcd8ff'); d.y += d.v; if (d.y > H) { d.y = -4; d.x = Math.random() * W | 0; } });
      custs.forEach(c => pperson(ctx, c.x, 138, c.col, c.walk, ts, false));
      stand(ctx, ts);
      coins.forEach(c => pcoin(ctx, c));
      hud(ctx);
    }
    function loop(now) {
      const cv = $('#lt-canvas'); if (!cv) { cancelAnimationFrame(raf); return; }
      const ts = now || 0;
      coins = coins.filter(c => { c.t += 0.3; c.p += 0.05; const jx = W - 12, jy = 11; c.x = c.sx + (jx - c.sx) * c.p; c.y = c.sy + (jy - c.sy) * c.p - Math.sin(c.p * Math.PI) * 34; return c.p < 1; });
      scene(pixelCtx(cv), ts);
      raf = requestAnimationFrame(loop);
    }

    // ---------- UI ----------
    function shell(inner) {
      app().innerHTML = topbar(`<div class="container" style="max-width:560px">
        <div class="lesson-top"><b>🍋 Lemonade Tycoon</b><b>Day ${day}/${DAYS} · 💵 ${$$(cash)}</b></div>
        <div class="lt-stage px-stage"><canvas id="lt-canvas" width="256" height="160"></canvas></div>
        <div class="card lt-panel">${inner}</div>
      </div>`);
      wireChrome();
      cancelAnimationFrame(raf);
      if (wx.rain && !drops.length) for (let i = 0; i < 60; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, v: 3 + Math.random() * 2 });
      if (!wx.rain) drops = [];
      raf = requestAnimationFrame(loop);
    }
    function renderPlan(msg) {
      custs = []; coins = [];
      shell(`
        ${msg ? `<div class="lt-recap">${msg}</div>` : `<p class="lt-tip">☀️ Hot days bring thirsty crowds · 🌧️ rain empties the street. Read the forecast and plan like an owner!</p>`}
        <div class="lt-row"><span class="lt-lbl">Cups to make <em>(50¢ each)</em></span>
          <div class="lt-seg" id="lt-cups">${[10, 20, 30, 40].map((n, i) => `<button data-cups="${n}" class="${cups === n ? 'on' : ''}" ${(i > 0 && n * CUP_COST > cash) ? 'disabled' : ''}>${n}</button>`).join('')}</div></div>
        <div class="lt-row"><span class="lt-lbl">Price per cup</span>
          <div class="lt-seg" id="lt-price">${[0.5, 1, 1.5, 2].map(p => `<button data-price="${p}" class="${price === p ? 'on' : ''}">$${p.toFixed(2)}</button>`).join('')}</div></div>
        <button class="btn green lt-open" id="lt-open" ${cups && price ? '' : 'disabled'}>Open the Stand →</button>`);
      document.querySelectorAll('[data-cups]').forEach(b => b.onclick = () => { cups = Number(b.dataset.cups); Sound.click(); renderPlan(msg); });
      document.querySelectorAll('[data-price]').forEach(b => b.onclick = () => { price = Number(b.dataset.price); Sound.click(); renderPlan(msg); });
      const ob = $('#lt-open'); if (ob) ob.onclick = runDay;
    }
    function runDay() {
      const priceFactor = { 0.5: 1.45, 1: 1.1, 1.5: 0.8, 2: 0.5 }[price];
      const demand = Math.max(0, Math.round(wx.base * priceFactor * (0.85 + Math.random() * 0.3)));
      const sold = Math.min(cups, demand);
      const cost = cups * CUP_COST, revenue = sold * price, profit = revenue - cost;
      phase = 'sell'; soldCount = 0; cupsLeft = cups; custs = []; coins = [];
      shell(`<p class="lt-tip lt-selling">🔔 Open for business… serving customers!</p>
        <div class="lt-live"><span id="lt-sold">0</span> sold · <span id="lt-left">${cups}</span> cups left</div>`);
      // animate `sold` customers arriving over ~3.6s
      let served = 0;
      const total = Math.max(sold, 1);
      const iv = setInterval(() => {
        if (!$('#lt-canvas')) { clearInterval(iv); return; }
        if (served >= sold) {
          clearInterval(iv);
          setTimeout(() => finishDay(cost, revenue, profit, sold, demand), 700);
          return;
        }
        served++;
        // spawn a customer that walks in, pays, leaves
        const col = ['#e8524e', '#4c86d6', '#8e5cf7', '#e59b3b', '#3aa76d'][served % 5];
        const c = { x: 272, col, walk: true, paid: false };
        custs.push(c);
        const walkIn = setInterval(() => {
          c.x -= 4;
          if (c.x <= 176) {
            c.x = 176; c.walk = false; clearInterval(walkIn);
            if (!c.paid) {
              c.paid = true; soldCount++; cupsLeft = Math.max(0, cupsLeft - 1);
              const so = $('#lt-sold'), le = $('#lt-left'); if (so) so.textContent = soldCount; if (le) le.textContent = cupsLeft;
              coins.push({ sx: 176, sy: 118, x: 176, y: 118, p: 0, t: 0 });
              Sound.badge();
              setTimeout(() => { c.walk = true; const out = setInterval(() => { c.x += 4; if (c.x > W + 16) { clearInterval(out); custs = custs.filter(z => z !== c); } }, 40); }, 300);
            }
          }
        }, 40);
      }, Math.min(520, 3600 / total));
    }
    function finishDay(cost, revenue, profit, sold, demand) {
      cash += profit; totalProfit += profit;
      if (profit > 0) { Sound.correct(); Confetti.burst(60); } else Sound.wrong();
      const wasted = cups - sold, missed = demand - sold;
      const lesson = profit <= 0 ? 'You spent more than you earned — a LOSS. When costs beat revenue, a business shrinks. Adjust and try again!'
        : missed > 0 ? `${missed} thirsty customers walked away — make MORE cups (or the demand supports a higher price)!`
        : wasted > 3 ? `${wasted} cups went to waste. Overmaking burns cash — match supply to demand.`
        : 'Supply met demand almost perfectly — that\'s pro-level planning!';
      const recap = `<b>Day ${day}:</b> ${cups} cups cost ${$$(cost)}, sold ${sold} at $${price.toFixed(2)} = revenue ${$$(revenue)}. <b class="${profit >= 0 ? 'lt-pos' : 'lt-neg'}">Profit ${$$(profit)}</b><br><span class="lt-eq">Revenue − Cost = Profit</span> · ${lesson}`;
      day++; cups = null; price = null; wx = WEATHER[Math.floor(Math.random() * WEATHER.length)]; phase = 'plan';
      if (day > DAYS) {
        cancelAnimationFrame(raf);
        const score = Math.max(10, Math.round(totalProfit * 10) + 50);
        finishGame('lemonade', score, totalProfit > 0 ? `You banked ${$$(totalProfit)} profit! 🍋` : 'Every founder has tough weeks!',
          `Total profit over ${DAYS} days: ${$$(totalProfit)}. Real founders do exactly this — watch costs, read demand, price smart.`);
        return;
      }
      renderPlan(recap);
    }
    renderPlan();
  }

  // ======================= MARKET MOGUL =======================
  // Stock market for grades 4+: read the news, think ahead, manage risk.
  function startMarket() {
    const STOCKS = [
      { id: 'hay', name: 'HayGrain Farms', short: 'HayGrain', emoji: '🌾', price: 20, wild: 0.05, color: '#4c9f45' },
      { id: 'sun', name: 'SunVolt Energy', short: 'SunVolt', emoji: '☀️', price: 30, wild: 0.10, color: '#C9A84C' },
      { id: 'pix', name: 'PixelPlay Games', short: 'PixelPlay', emoji: '🎮', price: 15, wild: 0.14, color: '#8e5cf7' },
      { id: 'nova', name: 'Nova Rockets', short: 'Nova', emoji: '🚀', price: 50, wild: 0.22, color: '#eb5757' }
    ];
    STOCKS.forEach(s => { s.hist = [s.price]; });
    const NEWS = {
      hay: { good: ['HayGrain wins a huge grocery contract 🌾', 'Perfect growing season boosts HayGrain harvests'], bad: ['Drought hits HayGrain\'s biggest fields', 'HayGrain recalls a shipment of oats'] },
      sun: { good: ['New law rewards clean energy, SunVolt cheers ☀️', 'SunVolt\'s new panel breaks an efficiency record'], bad: ['Cheap imported panels undercut SunVolt', 'Cloudy quarter dims SunVolt\'s earnings'] },
      pix: { good: ['PixelPlay\'s new game hits #1 in downloads 🎮', 'PixelPlay announces a huge esports league'], bad: ['PixelPlay delays its biggest game launch', 'Players quit PixelPlay\'s buggy update'] },
      nova: { good: ['Nova Rockets lands a satellite mega-contract 🚀', 'Nova\'s reusable rocket sticks the landing'], bad: ['Nova launch scrubbed, investors nervous', 'Nova loses a contract to a rival'] }
    };
    const ROUNDS = 8, START = 1000;
    let round = 1, cash = START, owned = { hay: 0, sun: 0, pix: 0, nova: 0 }, last = {}, headline = makeNews();
    const $$ = n => '$' + n.toFixed(2);
    function makeNews() {
      const s = STOCKS[Math.floor(Math.random() * STOCKS.length)];
      const up = Math.random() < 0.5;
      const list = NEWS[s.id][up ? 'good' : 'bad'];
      return { stock: s.id, up, text: list[Math.floor(Math.random() * list.length)] };
    }
    function netWorth() { return cash + STOCKS.reduce((t, s) => t + owned[s.id] * s.price, 0); }

    // 16-bit trading-terminal price chart, drawn on a low-res pixel canvas.
    function chart() { return `<div class="mm-chart px-stage"><canvas id="mm-canvas" width="240" height="118"></canvas></div>`; }
    function drawMMChart() {
      const cv = $('#mm-canvas'); if (!cv) return;
      const ctx = pixelCtx(cv);
      const W = 240, H = 118, mL = 4, mR = 6, mT = 11, mB = 11;
      const days = STOCKS[0].hist.length;
      const all = STOCKS.flatMap(s => s.hist);
      let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.14 || 4; lo = Math.max(0, lo - pad); hi = hi + pad;
      const X = i => mL + (days <= 1 ? 0 : i / (days - 1) * (W - mL - mR));
      const Y = v => mT + (1 - (v - lo) / ((hi - lo) || 1)) * (H - mT - mB);
      PX.r(ctx, 0, 0, W, H, '#0e2c1c');
      PX.r(ctx, 0, 0, W, 1, '#2ea060'); PX.r(ctx, 0, H - 1, W, 1, '#124a2c');
      for (const f of [0, 0.5, 1]) { const y = Math.round(mT + f * (H - mT - mB)); for (let x = mL; x < W - mR; x += 4) PX.r(ctx, x, y, 2, 1, 'rgba(120,200,150,.16)'); }
      STOCKS.forEach(s => {
        ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.beginPath();
        s.hist.forEach((p, i) => { const x = X(i), y = Y(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke();
        const lx = X(days - 1), ly = Y(s.hist[days - 1]); PX.r(ctx, lx - 2, ly - 2, 5, 5, s.color); PX.r(ctx, lx - 1, ly - 1, 3, 3, '#fff');
      });
      PX.text(ctx, $$(hi), mL + 1, mT - 2, 'rgba(200,230,210,.75)', 6, 'left');
      PX.text(ctx, $$(lo), mL + 1, H - 3, 'rgba(200,230,210,.75)', 6, 'left');
    }

    function render(flash, animate) {
      const nw = netWorth(), gain = nw - START;
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div class="lesson-top"><b>📈 Market Mogul — Day ${round}/${ROUNDS}</b><b class="${gain >= 0 ? 'up' : 'down'}">${$$(nw)} ${gain >= 0 ? '▲' : '▼'} ${$$(Math.abs(gain))}</b></div>
        ${chart()}
        <div class="mm-legend">${STOCKS.map(s => `<span><i style="background:${s.color}"></i>${s.emoji} ${$$(s.price)}</span>`).join('')}</div>
        ${flash ? `<div class="news-flash mm-surprise">${flash}</div>` : ''}
        <div class="news-flash">📰 <b>MARKET NEWS:</b> ${headline.text}<br><span style="font-weight:500;font-size:.9rem">Think ahead: what might this do to the price tomorrow?</span></div>
        <div class="card" style="padding:12px">
          ${STOCKS.map(s => {
            const chg = last[s.id]; const val = owned[s.id] * s.price;
            return `<div class="stock-row${s.id === headline.stock ? ' mm-hot' : ''}">
              <span class="mm-dot" style="background:${s.color}"></span>
              <b class="mm-name">${s.emoji} ${s.short}</b>
              <span class="mm-price">${$$(s.price)}</span>
              ${chg != null ? `<span class="${chg >= 0 ? 'up' : 'down'} mm-chg">${chg >= 0 ? '▲' : '▼'}${Math.abs(chg).toFixed(1)}%</span>` : '<span class="muted mm-chg">new</span>'}
              <span class="mm-hold">${owned[s.id] ? `×${owned[s.id]}` : ''}</span>
              <span class="mm-actions">
                <button class="btn small green" data-buy="${s.id}" ${cash < s.price ? 'disabled' : ''}>Buy</button>
                <button class="btn small coral" data-sell="${s.id}" ${owned[s.id] < 1 ? 'disabled' : ''}>Sell</button>
              </span>
            </div>`;
          }).join('')}
          <div class="mm-foot">
            <span>💵 Cash <b>${$$(cash)}</b></span><span>📊 Stocks <b>${$$(nw - cash)}</b></span>
            <button class="btn sun small" id="next-day">${round === ROUNDS ? 'Close the Market 🔔' : 'Next Day →'}</button>
          </div>
        </div>
        <p class="game-hint" style="font-size:.9rem">💡 Steady stocks (🌾) drift a little; wild ones (🚀) can rocket or crash. Spreading your money across several is how real investors survive a bad day.</p>
      </div>`);
      wireChrome();
      drawMMChart();
      document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
        const s = STOCKS.find(x => x.id === b.dataset.buy);
        if (cash >= s.price) { cash -= s.price; owned[s.id]++; Sound.click(); render(flash, false); }
      });
      document.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => {
        const s = STOCKS.find(x => x.id === b.dataset.sell);
        if (owned[s.id] > 0) { cash += s.price; owned[s.id]--; Sound.click(); render(flash, false); }
      });
      $('#next-day').onclick = advance;
    }
    function advance() {
      const follows = Math.random() < 0.85;
      let flash = null;
      for (const s of STOCKS) {
        let move = (Math.random() * 2 - 1) * s.wild;
        if (s.id === headline.stock) {
          const dir = headline.up === follows ? 1 : -1;
          move = dir * (0.08 + Math.random() * 0.14);
          if (!follows) flash = '😮 Surprise! The market did not react the way the news suggested. That happens for real, never bet everything on one headline.';
        }
        last[s.id] = move * 100;
        s.price = Math.max(1, Math.round(s.price * (1 + move) * 100) / 100);
        s.hist.push(s.price);
      }
      if (round === ROUNDS) {
        const nw = netWorth();
        const gain = nw - START;
        const pct = Math.round((gain / START) * 100);
        const score = Math.max(10, Math.round(nw / 10));
        finishGame('market', score, gain >= 0 ? `Portfolio: ${$$(nw)} — up ${pct}%! 📈` : `Portfolio: ${$$(nw)} — down ${Math.abs(pct)}% 📉`,
          gain >= 0 ? 'You read the news, spread your risk, and grew your money. That is investing, and you just did it for real.'
            : 'Losses teach the best lessons: diversify, do not chase one hot stock, and think a day ahead. Even the pros have red days!');
        return;
      }
      round++; headline = makeNews();
      Sound.badge();
      render(flash, true);
    }
    render(null, true);
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
    const money = n => (n < 0 ? '-$' : '$') + (Math.round(Math.abs(n) * 100) / 100).toFixed(2);
    // Build 4 DISTINCT choice strings. If distractors collide with the answer or
    // each other, fill with genuinely different numeric neighbours — never a
    // whitespace-padded copy of the answer (which looked identical on screen and
    // got marked wrong when tapped).
    const mc = (ans, distractors) => {
      ans = String(ans);
      const set = new Set([ans]);
      const out = [ans];
      const add = s => { if (s == null) return; s = String(s); if (!set.has(s)) { set.add(s); out.push(s); } };
      for (const d of distractors) { if (out.length >= 4) break; add(d); }
      if (out.length < 4) {
        const isMoney = ans.trim().charAt(0) === '$';
        const m = /-?\d+(?:\.\d+)?/.exec(ans);
        if (m) {
          const base = parseFloat(m[0]);
          const dec = isMoney ? 2 : (m[0].indexOf('.') >= 0 ? m[0].split('.')[1].length : 0);
          const fmt = v => isMoney ? '$' + v.toFixed(2) : (dec ? v.toFixed(dec) : String(Math.round(v)));
          const steps = isMoney ? [1, -1, 0.5, -0.5, 2, -2, 1.5, 3, 5, -1.5, 0.25] : [1, -1, 2, -2, 3, -3, 4, 5, -4, 10, 6];
          for (const s of steps) { if (out.length >= 4) break; const v = base + s; if (v >= 0 && Math.abs(v - base) > 1e-9) add(fmt(v)); }
        }
      }
      let k = 2; while (out.length < 4) { add(String(k)); k++; }
      return shuf(out.slice(0, 4));
    };

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
    // ---------- Canvas bakery scene ----------
    // ---------- 16-bit pixel bakery scene ----------
    let bqRaf = null, bqPuffs = [], bqShirt = '#4c86d6';
    const BQW = 256, BQH = 134;
    const BQ_COLS = ['#f7a8c4', '#a9e0c0', '#ffd98a', '#c3b0f0', '#8fd4ef'];
    function pcupcake(ctx, x, y, fc) {
      PX.r(ctx, x - 5, y, 10, 8, '#e0a060'); PX.r(ctx, x - 4, y + 8, 8, 1, '#b87840');
      PX.r(ctx, x - 3, y + 1, 1, 7, '#c88848'); PX.r(ctx, x + 1, y + 1, 1, 7, '#c88848');
      PX.r(ctx, x - 6, y - 5, 12, 6, fc); PX.r(ctx, x - 4, y - 8, 8, 4, fc); PX.r(ctx, x - 2, y - 10, 4, 3, fc);
      PX.r(ctx, x - 4, y - 4, 3, 2, 'rgba(255,255,255,.45)');
      PX.r(ctx, x - 1, y - 12, 3, 3, PAL.red); PX.p(ctx, x - 1, y - 12, '#ff9aac');
    }
    function drawBakery(ctx, ts) {
      const W = BQW, H = BQH; ctx.clearRect(0, 0, W, H);
      PX.r(ctx, 0, 0, W, H, '#ffe6c8'); PX.dither(ctx, 0, 42, W, 12, '#ffcfa0');
      for (let i = 0; i < W / 12 + 1; i++) { PX.r(ctx, i * 12, 0, 12, 4, '#ef8fb3'); PX.r(ctx, i * 12 + 3, 4, 6, 3, '#ef8fb3'); }
      PX.r(ctx, 22, 46, 72, 3, PAL.woodDk); PX.r(ctx, 162, 46, 72, 3, PAL.woodDk);
      for (let i = 0; i < 4; i++) { pcupcake(ctx, 34 + i * 18, 40, BQ_COLS[i % 5]); pcupcake(ctx, 174 + i * 18, 40, BQ_COLS[(i + 2) % 5]); }
      PX.panel(ctx, 96, 12, 64, 22, PAL.woodDk, '#4a2c0c', PAL.wood);
      PX.text(ctx, 'GALLOP', 128, 24, '#ffe8d6', 8, 'center'); PX.text(ctx, 'BAKERY', 128, 31, '#ffcfa8', 5, 'center');
      for (let i = 0; i < 5; i++) pixStar(ctx, 210 + i * 9, 16, i < st.stars ? PAL.gold : 'rgba(150,110,70,.4)');
      pixPerson(ctx, 58, 96, PAL.green, false, ts, { hat: 'chef' });
      PX.r(ctx, 8, 96, W - 16, 38, PAL.wood);
      PX.r(ctx, 4, 92, W - 8, 5, PAL.woodLt);
      for (let i = 1; i < 8; i++) PX.r(ctx, 8 + Math.round(i * (W - 16) / 8), 100, 1, 34, PAL.woodDk);
      PX.r(ctx, 8, 132, W - 16, 2, PAL.woodDk);
      const shown = Math.max(1, Math.min(6, st.made ? 6 : Math.round(st.idx / 5 * 6) + 1));
      for (let i = 0; i < shown; i++) pcupcake(ctx, 96 + i * 26, 104, BQ_COLS[i % 5]);
      if (bqPuffs.length < 6 && Math.random() < 0.08) bqPuffs.push({ x: 92 + (Math.random() * 150 | 0), y: 98, a: 5, r: 1 });
      bqPuffs = bqPuffs.filter(p => { p.y -= 0.4; p.a -= 0.05; p.r += 0.05; if (p.a > 0) { const s = Math.max(1, p.r | 0) + 1; PX.r(ctx, p.x, p.y, s, s, `rgba(255,255,255,${Math.min(0.5, p.a / 10)})`); return true; } return false; });
      PX.panel(ctx, W - 60, 60, 52, 14, PAL.green, PAL.greenDk, '#4cd080');
      PX.text(ctx, money(st.seed - st.cost + st.revenue), W - 34, 70, PAL.white, 6, 'center');
      pixPerson(ctx, 22, 130, bqShirt, false, ts);
    }
    function bqLoop(now) { const cv = $('#bq-canvas'); if (!cv) { cancelAnimationFrame(bqRaf); return; } drawBakery(pixelCtx(cv), now || 0); bqRaf = requestAnimationFrame(bqLoop); }
    function startBakeryScene() { cancelAnimationFrame(bqRaf); bqRaf = requestAnimationFrame(bqLoop); }
    function stage(caption, customer) {
      bqShirt = ['#e8524e', '#4c86d6', '#8e5cf7', '#e59b3b', '#3aa76d'][(caption || '').length % 5];
      return `<div class="bq-stage px-stage"><canvas id="bq-canvas" width="256" height="134"></canvas><div class="bq-bubble">${esc(caption)}</div></div>`;
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
      startBakeryScene();
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
      startBakeryScene();
      document.querySelectorAll('#bq-prices .choice').forEach(b => b.onclick = () => {
        const o = priceOpts[Number(b.dataset.i)];
        document.querySelectorAll('#bq-prices .choice').forEach(x => x.disabled = true);
        b.classList.add('correct');
        st.price = o.p;
        st.sold = Math.round(st.made * o.mult);
        st.revenue = Math.round(st.sold * o.p * 100) / 100;
        // The pricing decision earns the 5th star on a perfect run (any price is a valid
        // business choice, so it always counts while the run is still flawless).
        if (st.perfect) st.stars = Math.min(5, st.stars + 1);
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
        dis: [money(due), money(bill), money(Math.round((change + st.price) * 100) / 100)],
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
            dis: [money(Math.round((st.revenue + st.cost) * 100) / 100), money(st.revenue), money(st.cost)],
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
          ${Object.keys(SLOT_LABEL).map(s => `<button class="btn small ${s === slot ? 'sun' : 'ghost on-page'}" style="margin:3px" data-slot="${s}">${SLOT_LABEL[s]}</button>`).join('')}
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
        <button class="btn ghost small" class="btn ghost small on-page" style="margin-left:8px" onclick="location.hash='#home'">Back</button></div>
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
          <button class="btn ${machine === 'vending' ? 'sun' : 'ghost on-page'} small" style="margin:3px" data-machine="vending">🥤 Vending Machine</button>
          <button class="btn ${machine === 'shack' ? 'sun' : 'ghost on-page'} small" style="margin:3px" data-machine="shack">🍔 Snack Shack</button>
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
        <p class="game-hint" style="margin-top:8px">${machine === 'vending' ? 'Quick treats — earn coins by learning, then treat yourself! 🪙' : 'Fancier goodies for big coin-savers. Collect them all! 🏆'}</p>
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
