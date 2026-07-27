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
  let _curBest = 0; // best score to beat for the game currently being played
  async function gated(game, start) {
    try {
      const r = await api(`/play/${kidId()}/spend-token`, { method: 'POST', body: { game } });
      Sound.badge();
      _curBest = r.best || 0;
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
    // Show exactly what the server granted — never claim coins that weren't awarded
    // (e.g. the score POST failed offline, or no token play was open).
    let r = null;
    try { r = await api(`/play/${kidId()}/score`, { method: 'POST', body: { game, score } }); } catch (e) { r = null; }
    const coinsEarned = r ? (r.coinsEarned || 0) : 0;
    const isRecord = !!(r && r.isRecord);
    const best = r ? (r.best || score) : Math.max(_curBest, score);
    const firstPlay = !!(r && r.firstPlay);
    Confetti.burst(isRecord ? 220 : 150); Sound.levelup();
    if (isRecord) Confetti.burst(120);
    const wins = ((r && r.challengesWon) || []).map(w => `<p style="font-weight:700;margin-top:8px">⚡ You beat ${esc(w.fromName)}'s challenge of ${w.scoreToBeat}! +5 🪙</p>`).join('');
    // Personal-best banner: crown a new record, otherwise show the score to chase.
    const bestBanner = isRecord
      ? `<div class="hs-banner hs-new">🏆 NEW HIGH SCORE! You beat your old best of ${r.prevBest}!</div>`
      : firstPlay
        ? `<div class="hs-banner">🏅 Your first score: <b>${score}</b>. Play again and try to beat it!</div>`
        : score === best
          ? `<div class="hs-banner">🏅 You matched your best of <b>${best}</b> — so close to a record!</div>`
          : `<div class="hs-banner">🏅 Your best is <b>${best}</b> — only ${best - score} more to beat it. Try again!</div>`;
    app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
      <div class="big-emoji">${isRecord ? '👑' : '🏆'}</div><h2>${esc(title)}</h2>
      <div class="summary-stats"><div class="sstat"><div class="n">${score}</div>score</div><div class="sstat"><div class="n">${best}</div>🏅 best</div>${coinsEarned ? `<div class="sstat"><div class="n">+${coinsEarned}</div>🪙 coins</div>` : ''}</div>
      ${bestBanner}
      ${r ? '' : '<p class="muted" style="font-size:.85rem">Score will sync when you\'re back online.</p>'}
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
    await refreshMe();   // fresh settings + answered_today + game_seconds_today so the gate is accurate
    if (!gamesOn()) { toast('The games are turned off for now.'); location.hash = '#home'; return; }
    if (gamesTimeExhausted()) {
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center" style="padding:28px">
        <div class="big-emoji">⏰</div>
        <h2>That's your game time for today!</h2>
        <p class="muted" style="font-size:1.05rem">You've used your ${gamesTimeLimitMin()} minutes of games today. Come back tomorrow — the lessons are always open! 🌟</p>
        <button class="btn green" style="margin-top:10px" onclick="location.hash='#home'">Back to learning →</button>
      </div></div>`);
      wireChrome();
      return;
    }
    if (gamesGate() > 0 && gamesAnsweredToday() < gamesGate()) {
      const rem = gamesRemaining();
      app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center" style="padding:28px">
        <div class="big-emoji">🔒</div>
        <h2>A little more learning first!</h2>
        <p class="muted" style="font-size:1.05rem">Answer <b>${rem}</b> more question${rem === 1 ? '' : 's'} today and the Play Zone unlocks. You've got this! 🌟</p>
        <button class="btn green" style="margin-top:10px" onclick="location.hash='#home'">Let's learn →</button>
      </div></div>`);
      wireChrome();
      return;
    }
    const s = await api(`/play/${kidId()}/status`);
    const k = s.kid;
    // Every game carries a grade band so the arcade fits the player's age: the
    // youngest get playful money/drawing games; high-schoolers get the strategy and
    // speed games (Stable Street, Gallop Sprint, Robo Logic) instead of Lemonade or
    // the cupcake bakery. min/max are inclusive grade numbers (0 = Kindergarten).
    const grade = k.grade || 0;
    const CATALOG = [
      { id: 'market', emoji: '📈', name: 'Stable Street', desc: 'A 12-level investing career — level up by hitting profit targets while you master diversification, dollar-cost averaging, dividends & more. Progress saves.', min: 4, max: 12 },
      { id: 'blitz', emoji: '⚡', name: 'Gallop Sprint', desc: '60 seconds. Rapid-fire questions. Build a combo — beat your best!', min: 0, max: 12 },
      { id: 'code', emoji: '🤖', name: 'Robo Logic', desc: 'Program Robo the robot to reach the star — a fresh puzzle set every time.', min: 0, max: 12 },
      { id: 'wordsearch', emoji: '🔍', name: 'Word Roundup', desc: 'Hunt hidden words in the letter jungle.', min: 0, max: 12 },
      { id: 'memory', emoji: '🃏', name: 'Memory Meadow', desc: 'Flip cards, match pairs — Spanish words, math facts & more!', min: 0, max: 12 },
      { id: 'bakery', emoji: '🧁', name: 'Gallop Bakery', desc: 'Run the Gallop Bakery for a day — use real math to bake, price, and bank a profit!', min: 0, max: 8 },
      { id: 'lemonade', emoji: '🍋', name: "Sunny's Lemonade Stand", desc: 'Run your own stand — buy smart, price right, bank the profit!', min: 0, max: 8 },
      { id: 'art', emoji: '🎨', name: 'Doodle Barn', desc: 'Draw with step-by-step guides — so cute!', min: 0, max: 6 }
    ];
    const games = CATALOG.filter(g => grade >= g.min && grade <= g.max);
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
    await refreshMe();
    if (!gamesOn() || !gamesUnlocked()) { location.hash = '#play'; return; }  // respect the parent games toggle/gate/time-cap
    startGameClock();   // begin accruing game time toward the daily cap
    // Stable Street is a persistent, level-based career: opening the hub is free (progress
    // resume + level select), and a *token is spent per level* from inside the hub — so it
    // bypasses the one-token-per-open `gated()` wrapper the other arcade games use.
    if (which === 'market') {
      if (((State.me.kid && State.me.kid.grade) || 0) < 4) { toast('Stable Street unlocks in 4th grade! 📈'); location.hash = '#play'; return; }
      await startMarketHub();
      return;
    }
    const starters = { bakery: startBakery, memory: startMemory, wordsearch: startWordSearch, code: startCode, art: startArt, lemonade: startLemonade, blitz: startBlitz };
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
        <div class="lesson-top"><b>🃏 Memory Meadow — ${setLabel}</b><b>Moves: <span id="mem-moves">${moves}</span></b></div>
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
        <div class="lesson-top"><b>🔍 Word Roundup ${setName === 'spanish' ? '— 🌎 ¡en español!' : ''}</b><b>${found.size}/${placed.length} found</b></div>
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
  // A POOL of solvable puzzles grouped by tier. Each play draws a fresh set (2 easy,
  // 2 medium, 2 hard) in a random order within tier, so Robo Logic is different every
  // time instead of the same six levels. Every level here has a verified clear path.
  const CODE_POOL = {
    easy: [
      { size: 4, start: [3, 0], goal: [3, 3], walls: [], hint: 'Just march right!' },
      { size: 4, start: [3, 0], goal: [0, 3], walls: [], hint: 'Rights and ups!' },
      { size: 4, start: [0, 0], goal: [3, 3], walls: [], hint: 'Down and to the right!' },
      { size: 4, start: [3, 0], goal: [0, 3], walls: ['2,1', '1,2'], hint: 'Dodge the rocks!' },
      { size: 4, start: [3, 3], goal: [0, 0], walls: ['1,1'], hint: 'Head up and left!' },
      { size: 4, start: [0, 3], goal: [3, 0], walls: ['1,1'], hint: 'Down and to the left!' }
    ],
    medium: [
      { size: 5, start: [4, 0], goal: [0, 4], walls: ['3,1', '2,2', '1,3'], hint: 'Zig-zag like stairs!' },
      { size: 5, start: [4, 2], goal: [0, 2], walls: ['2,2', '2,1', '2,3'], hint: 'The wall blocks the middle — go around!' },
      { size: 5, start: [2, 0], goal: [2, 4], walls: ['2,2', '1,2', '3,2'], hint: 'Over or under the wall?' },
      { size: 5, start: [4, 0], goal: [0, 0], walls: ['3,1', '1,1'], hint: 'Climb the left edge!' },
      { size: 5, start: [0, 0], goal: [4, 4], walls: ['1,1', '2,2', '3,3'], hint: 'Step around the diagonal!' },
      { size: 5, start: [4, 4], goal: [0, 0], walls: ['3,2', '2,3'], hint: 'Up and left, dodge the rocks!' }
    ],
    hard: [
      { size: 6, start: [5, 0], goal: [0, 5], walls: ['4,1', '3,2', '2,3', '1,4'], hint: 'Long staircase — take your time!' },
      { size: 6, start: [0, 0], goal: [5, 5], walls: ['1,1', '2,2', '3,3', '4,4'], hint: 'Weave past the diagonal!' },
      { size: 6, start: [5, 2], goal: [0, 3], walls: ['3,2', '3,3', '2,2'], hint: 'Around the wall, then up!' },
      { size: 6, start: [5, 0], goal: [0, 0], walls: ['4,1', '2,1'], hint: 'Straight up the left wall!' }
    ]
  };
  const _cqShuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  function pickCodeLevels() {
    return [..._cqShuf(CODE_POOL.easy).slice(0, 2), ..._cqShuf(CODE_POOL.medium).slice(0, 2), ..._cqShuf(CODE_POOL.hard).slice(0, 2)];
  }
  const CQ_ARROWS = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
  function startCode() {
    let levelIdx = 0, program = [], score = 0;
    const CODE_LEVELS = pickCodeLevels();
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
        <div class="lesson-top"><b>🤖 Robo Logic — Level ${levelIdx + 1}/${CODE_LEVELS.length}${_curBest ? `<span class="hs-target">🏅 Best: ${_curBest}</span>` : ''}</b><b>Score: ${score}</b></div>
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
  // ======================= ART STUDIO =======================
  const ART_GUIDES = [
    { name: 'Cute Cat', emoji: '🐱', steps: ['Draw a big circle for the head', 'Add two triangle ears on top', 'Two big round eyes + tiny nose', 'Whiskers — 3 on each side!', 'Draw a smile & color it in!'] },
    { name: 'Happy Cupcake', emoji: '🧁', steps: ['Draw a wide cup shape (trapezoid)', 'Add vertical lines on the cup', 'Big fluffy cloud of frosting on top', 'Cherry + sprinkles!', 'Give it a smiley face!'] },
    { name: 'Rocket Ship', emoji: '🚀', steps: ['Tall oval body', 'Pointy triangle nose cone', 'Two fins at the bottom', 'Round window in the middle', 'Fire & stars behind it!'] },
    { name: 'Magic Flower', emoji: '🌸', steps: ['Small circle in the center', '5 big petals around it', 'Long stem going down', 'Two leaves on the stem', 'Add a ladybug friend!'] },
    { name: 'Puppy Dog', emoji: '🐶', steps: ['Draw a big rounded head', 'Two floppy ears hanging down', 'Big friendly eyes + an oval nose', 'A happy smile with the tongue out', 'Add a collar & color your pup!'] },
    { name: 'Friendly Tree', emoji: '🌳', steps: ['Two lines going up for the trunk', 'A big fluffy cloud shape on top', 'A few branches peeking out', 'Dot on little leaves for texture', 'Grass below & an apple or two!'] },
    { name: 'Juicy Apple', emoji: '🍎', steps: ['Draw a round apple shape', 'A little dip at the very top', 'A short stem in the dip', 'One leaf next to the stem', 'Shade one side darker so it shines!'] },
    { name: 'Bright Eye', emoji: '👁️', steps: ['Draw a long almond shape', 'A big circle inside for the iris', 'A smaller filled circle (the pupil)', 'A tiny white dot for a sparkle', 'Add eyelashes & soft shading!'] },
    { name: 'Calm Mandala', emoji: '🌀', steps: ['A dot right in the center', 'A small circle around the dot', 'Add petals all the way around', 'A bigger ring of shapes outside', 'Repeat the patterns & color it in!'] },
    { name: 'Fluffy Cloud', emoji: '☁️', steps: ['A wide bumpy top, like bubbles', 'Flatten the bottom into a line', 'Add a couple of smaller puffs', 'Soft, light strokes on the inside', 'A sun peeking out behind it!'] },
    { name: 'Cozy House', emoji: '🏠', steps: ['A big square for the walls', 'A triangle roof on top', 'A door and two windows', 'A chimney with a little smoke', 'Add a path, grass & a bright sun!'] },
    { name: 'Silly Robot', emoji: '🤖', steps: ['A box for the head', 'Two antennae with round tips', 'Big square eyes & a grid mouth', 'A rectangle body with buttons', 'Bolt on arms, legs & color it!'] },
    { name: 'Coffee Mug', emoji: '☕', steps: ['A tall rounded cup shape', 'A curved handle on one side', 'An oval rim across the top', 'Squiggly steam lines rising up', 'A heart on the front & color it!'] }
  ];
  function startArt() {
    let guide = null, color = '#e43b44', size = 2, drawing = false, last = null;
    // Retro 16-bit paint palette
    const COLORS = ['#e43b44', '#f77622', '#feae34', '#63c74d', '#0095e9', '#124e89', '#b55088', '#3a2e4d', '#ffffff', '#181818'];
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:760px">
        <div class="lesson-top"><b>🎨 Doodle Barn</b>${guide ? `<b>${guide.emoji} ${guide.name}</b>` : ''}</div>
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
      if (r < 0.6) return { t: `${a}²`, ans: a * a };
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
        <div class="lesson-top"><b>⚡ Gallop Sprint${_curBest ? `<span class="hs-target">🏅 Best: ${_curBest}</span>` : ''}</b><b>Score: <span id="bz-score">${score}</span></b></div>
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
    // A random "town event" each day changes demand (and sometimes cost), so no two
    // days — or two playthroughs — read the same. Kids learn to adapt their plan.
    const EVENTS = [
      { id: 'none', mult: 1, cost: 0, note: '' },
      { id: 'parade', mult: 1.7, cost: 0, note: '🎉 A parade is rolling through — big thirsty crowds today!' },
      { id: 'trip', mult: 1.4, cost: 0, note: '🚌 A school field trip stopped nearby — extra customers!' },
      { id: 'game', mult: 1.5, cost: 0, note: '⚽ The park has a big game today — expect a rush!' },
      { id: 'road', mult: 0.55, cost: 0, note: '🚧 Road work out front — fewer people are passing by.' },
      { id: 'rival', mult: 0.7, cost: 0, note: '🍹 A rival stand opened down the block — some customers wander off.' },
      { id: 'sugar', mult: 1, cost: 0.3, note: '🍬 Sugar prices spiked — each cup costs more to make today.' },
      { id: 'star', mult: 1.9, cost: 0, note: '⭐ A local star posted your stand online — huge crowd incoming!' }
    ];
    const pickEvent = () => Math.random() < 0.4 ? EVENTS[0] : EVENTS[1 + Math.floor(Math.random() * (EVENTS.length - 1))];
    const $$ = n => (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
    let day = 1, cash = 10, totalProfit = 0;
    let wx = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    let ev = pickEvent();
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
        <div class="lesson-top"><b>🍋 Sunny's Lemonade Stand</b><b>Day ${day}/${DAYS} · 💵 ${$$(cash)}</b></div>
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
        ${ev.note ? `<div class="lt-event">${ev.note}</div>` : ''}
        <div class="lt-row"><span class="lt-lbl">Cups to make <em>(${((CUP_COST + ev.cost) * 100).toFixed(0)}¢ each)</em></span>
          <div class="lt-seg" id="lt-cups">${[10, 20, 30, 40].map((n, i) => `<button data-cups="${n}" class="${cups === n ? 'on' : ''}" ${(i > 0 && n * (CUP_COST + ev.cost) > cash) ? 'disabled' : ''}>${n}</button>`).join('')}</div></div>
        <div class="lt-row"><span class="lt-lbl">Price per cup</span>
          <div class="lt-seg" id="lt-price">${[0.5, 1, 1.5, 2].map(p => `<button data-price="${p}" class="${price === p ? 'on' : ''}">$${p.toFixed(2)}</button>`).join('')}</div></div>
        <button class="btn green lt-open" id="lt-open" ${cups && price ? '' : 'disabled'}>Open the Stand →</button>`);
      document.querySelectorAll('[data-cups]').forEach(b => b.onclick = () => { cups = Number(b.dataset.cups); Sound.click(); renderPlan(msg); });
      document.querySelectorAll('[data-price]').forEach(b => b.onclick = () => { price = Number(b.dataset.price); Sound.click(); renderPlan(msg); });
      const ob = $('#lt-open'); if (ob) ob.onclick = runDay;
    }
    function runDay() {
      const priceFactor = { 0.5: 1.45, 1: 1.1, 1.5: 0.8, 2: 0.5 }[price];
      const demand = Math.max(0, Math.round(wx.base * ev.mult * priceFactor * (0.85 + Math.random() * 0.3)));
      const sold = Math.min(cups, demand);
      const cost = cups * (CUP_COST + ev.cost), revenue = sold * price, profit = revenue - cost;
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
      day++; cups = null; price = null; wx = WEATHER[Math.floor(Math.random() * WEATHER.length)]; ev = pickEvent(); phase = 'plan';
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

  // ======================= MARKET MOGUL — INVESTING CAREER =======================
  // A full, level-based investing game (grades 4+). Progress is saved on the server, so a
  // learner resumes their career across sessions and devices. Each level teaches ONE real
  // investing idea, gates advancement behind a profit target, and switches on a new market
  // variable so the game gets steadily trickier. Clear all ten to graduate a Gallop Investor.
  const MM_STOCKS = {
    hay:  { name: 'HayGrain Farms', short: 'HayGrain', emoji: '🌾', price: 20, wild: .05, color: '#4c9f45', sector: 'Food',    div: .06, rate: 0 },
    brew: { name: 'DailyBrew Coffee', short: 'DailyBrew', emoji: '☕', price: 18, wild: .06, color: '#9c6b3f', sector: 'Staples', div: .05, rate: 0 },
    sun:  { name: 'SunVolt Energy', short: 'SunVolt', emoji: '☀️', price: 30, wild: .10, color: '#C9A84C', sector: 'Energy',  div: .03, rate: 0 },
    pix:  { name: 'PixelPlay Games', short: 'PixelPlay', emoji: '🎮', price: 15, wild: .14, color: '#8e5cf7', sector: 'Games',   div: 0,   rate: -1 },
    cloud:{ name: 'CloudNine Tech', short: 'CloudNine', emoji: '☁️', price: 35, wild: .16, color: '#4a90d9', sector: 'Tech',    div: 0,   rate: -1 },
    vault:{ name: 'Vault Bank', short: 'Vault', emoji: '🏦', price: 40, wild: .07, color: '#4aa3c7', sector: 'Finance', div: .10, rate: 1 },
    nova: { name: 'Nova Rockets', short: 'Nova', emoji: '🚀', price: 50, wild: .22, color: '#eb5757', sector: 'Space',   div: 0,   rate: -1 },
    geno: { name: 'GenoMed Labs', short: 'GenoMed', emoji: '🧬', price: 25, wild: .28, color: '#d6559b', sector: 'Biotech', div: 0,  rate: 0 }
  };
  const MM_NEWS = {
    hay:  { good: ['HayGrain wins a huge grocery contract 🌾', 'Perfect growing season boosts HayGrain harvests'], bad: ['Drought hits HayGrain\'s biggest fields', 'HayGrain recalls a shipment of oats'] },
    brew: { good: ['DailyBrew opens 200 new cafés ☕', 'A viral drink sends DailyBrew sales soaring'], bad: ['Coffee-bean prices spike, squeezing DailyBrew', 'DailyBrew closes underperforming stores'] },
    sun:  { good: ['New law rewards clean energy, SunVolt cheers ☀️', 'SunVolt\'s new panel breaks an efficiency record'], bad: ['Cheap imported panels undercut SunVolt', 'Cloudy quarter dims SunVolt\'s earnings'] },
    pix:  { good: ['PixelPlay\'s new game hits #1 in downloads 🎮', 'PixelPlay announces a huge esports league'], bad: ['PixelPlay delays its biggest game launch', 'Players quit PixelPlay\'s buggy update'] },
    cloud:{ good: ['CloudNine signs a giant enterprise deal ☁️', 'CloudNine\'s AI tools win rave reviews'], bad: ['A cloud outage frustrates CloudNine\'s customers', 'A rival undercuts CloudNine on price'] },
    vault:{ good: ['Vault Bank raises its dividend as profits climb 🏦', 'Rising rates fatten Vault Bank\'s margins'], bad: ['Loan defaults tick up at Vault Bank', 'A fintech pulls customers from Vault Bank'] },
    nova: { good: ['Nova Rockets lands a satellite mega-contract 🚀', 'Nova\'s reusable rocket sticks the landing'], bad: ['Nova launch scrubbed, investors nervous', 'Nova loses a contract to a rival'] },
    geno: { good: ['GenoMed\'s new therapy aces its big trial 🧬', 'GenoMed wins fast-track approval'], bad: ['GenoMed\'s lead drug fails a key study', 'GenoMed burns cash as trials drag on'] }
  };
  // Ten levels. Each: a concept to teach, a profit target to clear, and the market variables
  // (flags) that turn on. Difficulty rises via bigger targets, wilder stocks, and new forces.
  const MM_LEVELS = [
    { n: 1, emoji: '🌱', name: 'First Trades', concept: 'Diversification',
      intro: 'Welcome to the Gallop Stock Exchange! A share is a tiny piece of a real company — buy it low, and if the company grows, so does your money. Each day a news headline drops that hints at what a stock might do. The first rule the pros live by: never put all your money in ONE stock. Spread it across several so a single bad day can\'t sink you.',
      tip: 'Spread your cash across the stocks — that\'s diversification. Watch the daily news for clues.',
      days: 12, start: 1000, targetPct: 15, stocks: ['hay', 'sun', 'pix'], flags: { news: true } },
    { n: 2, emoji: '📰', name: 'Reading the News', concept: 'News moves markets',
      intro: 'Every trading day a headline drops through the newswire, the TV, your phone, or the trading floor. Good news usually lifts a stock and bad news usually drops it — but not always! Markets surprise everyone. Use the news as a clue about tomorrow, never as a sure thing, and never bet everything on one headline.',
      tip: 'The news hints at tomorrow\'s move — but surprises happen. Stay diversified.',
      days: 12, start: 1000, targetPct: 22, stocks: ['hay', 'sun', 'pix', 'nova'], flags: { news: true } },
    { n: 3, emoji: '🔁', name: 'Steady Wins', concept: 'Dollar-Cost Averaging',
      intro: 'Nobody can buy at the exact bottom every time. So the pros use DOLLAR-COST AVERAGING: invest the same amount on a schedule, no matter the price. You automatically buy more shares when they\'re cheap and fewer when they\'re pricey — which keeps your average cost low. Flip on Auto-Invest and watch your average cost work for you.',
      tip: 'Turn on 🔁 Auto-Invest to buy a set amount every day — that is dollar-cost averaging.',
      days: 14, start: 1000, targetPct: 26, stocks: ['hay', 'sun', 'pix', 'nova'], flags: { news: true, dca: true } },
    { n: 4, emoji: '⚖️', name: 'Risk & Reward', concept: 'Risk vs reward',
      intro: 'Meet GenoMed — a biotech that can rocket OR crater. Wild stocks offer the biggest gains and the biggest losses. Calmer stocks grow slowly but steadily. A smart portfolio holds some of each, so you get real growth without betting the farm.',
      tip: 'Balance a wild stock (🧬🚀) with steady ones (🌾☀️). High reward always rides with high risk.',
      days: 14, start: 1200, targetPct: 30, stocks: ['hay', 'sun', 'pix', 'nova', 'geno'], flags: { news: true, dca: true } },
    { n: 5, emoji: '📉', name: 'The Crash', concept: 'Don\'t panic-sell',
      intro: 'Sooner or later, the whole market drops at once — a crash. It feels scary, but here\'s the secret the best investors know: crashes are temporary, and selling in a panic locks in your losses. Downturns are actually when stocks go ON SALE. Hold steady, and if you\'re brave, buy the dip.',
      tip: 'If a crash hits, DON\'T panic-sell. Markets recover — a dip can be a discount.',
      days: 16, start: 1500, targetPct: 18, stocks: ['hay', 'sun', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, crash: true } },
    { n: 6, emoji: '💸', name: 'Fees & Patience', concept: 'Costs of over-trading',
      intro: 'From now on, every trade costs a small $1 fee — just like the real world. Traders who buy and sell constantly bleed money on fees and often do WORSE than someone who picks well and waits. Patience is a strategy. Trade with purpose, not every single day.',
      tip: 'Each trade now costs $1. Don\'t over-trade — patience beats churning.',
      days: 16, start: 1500, targetPct: 30, stocks: ['hay', 'sun', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, fee: true } },
    { n: 7, emoji: '💰', name: 'Dividends', concept: 'Income & compounding',
      intro: 'Some companies share their profits with owners every day you hold them — that\'s a DIVIDEND. Even if the price barely moves, dividends quietly pay you just for holding. Reinvest them to buy more shares, and your money starts growing on its own growth. That snowball is called compounding.',
      tip: 'Hold 🏦🌾☕ to collect daily dividends, then reinvest them — that\'s compounding.',
      days: 18, start: 2000, targetPct: 34, stocks: ['hay', 'brew', 'sun', 'vault', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true } },
    { n: 8, emoji: '📊', name: 'Rates & Sectors', concept: 'Interest rates rotate sectors',
      intro: 'A central bank sets interest rates, and rates quietly push whole sectors up or down. When rates RISE, banks (🏦) tend to win while fast-growing tech (☁️🎮🚀) feels a headwind. When rates FALL, growth stocks catch fire. Watch the rate meter and tilt toward whatever the winds favor.',
      tip: 'Rates rising? Banks 🏦 like it, growth 🎮☁️🚀 struggles. Falling? The opposite. Watch the meter.',
      days: 18, start: 2000, targetPct: 38, stocks: ['brew', 'cloud', 'vault', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true, rates: true } },
    { n: 9, emoji: '🐂', name: 'Bull & Bear', concept: 'Market cycles',
      intro: 'Markets move in cycles: a BULL run when almost everything rises, then a BEAR stretch when it all sags. Nobody can predict the exact turn, so the winning move is to stay invested through both, keep dollar-cost averaging, and let the long climb carry you. Time IN the market beats timing the market.',
      tip: 'Ride the cycle — keep investing through bull AND bear. Time in beats timing.',
      days: 20, start: 2500, targetPct: 42, stocks: ['brew', 'cloud', 'vault', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true, rates: true, crash: true } },
    { n: 10, emoji: '🫧', name: 'The Bubble', concept: 'Don\'t chase the hype',
      intro: 'Every so often one stock catches fire — everyone piles in, the price balloons, and it feels like it will never stop. That\'s a BUBBLE, and every bubble eventually POPS. The investors who get burned are the ones who chase the hype all the way to the top. Enjoy the ride if you like, but take your profits before the crowd panics.',
      tip: 'One stock will balloon then POP. Ride it if you dare — but sell before it bursts. Never chase hype.',
      days: 20, start: 2500, targetPct: 38, stocks: ['hay', 'brew', 'sun', 'vault', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true, bubble: true } },
    { n: 11, emoji: '⚖️', name: 'The Rebalance', concept: 'Rebalancing',
      intro: 'When one stock soars, it can quietly become a huge slice of your money — and a huge risk if it turns. Smart investors REBALANCE: trim the winners and top up the laggards to keep a healthy spread. It feels backwards to sell what\'s winning, but it locks in gains and protects you from any single stock sinking the ship.',
      tip: 'Trim your biggest winner and spread it around — rebalancing keeps one stock from sinking you.',
      days: 22, start: 3000, targetPct: 46, stocks: ['brew', 'cloud', 'vault', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true, rates: true, crash: true } },
    { n: 12, emoji: '👑', name: 'The Long Game', concept: 'Put it all together',
      intro: 'This is it — the long game. Every force is live at once: news, fees, dividends, interest rates, crashes, and the pull of a bubble, across the whole market and the longest run yet. Use everything you\'ve learned: diversify, dollar-cost average, hold through the dips, mind your fees, collect your dividends, read the rate winds, and never chase the hype. Go the distance and you\'re a Certified Gallop Investor.',
      tip: 'Everything is on, and it\'s a marathon. Patience and a spread portfolio win. You\'ve got this.',
      days: 26, start: 3000, targetPct: 60, stocks: ['hay', 'brew', 'sun', 'cloud', 'vault', 'pix', 'nova', 'geno'], flags: { news: true, dca: true, fee: true, dividends: true, rates: true, crash: true, bubble: true } }
  ];
  const MM_GLOSSARY = [
    ['Share / Stock', 'A tiny piece of ownership in a company. Owning shares means you own a slice of that business.'],
    ['Diversification', 'Spreading your money across many investments so one bad one can\'t hurt you much.'],
    ['Dollar-Cost Averaging', 'Investing a fixed amount on a regular schedule, which keeps your average buy price low.'],
    ['Risk vs Reward', 'Investments that can gain the most can also lose the most. Balance bold picks with steady ones.'],
    ['Dividend', 'A share of a company\'s profits paid to shareholders, often regularly, just for holding the stock.'],
    ['Compounding', 'When your earnings start earning too — growth on top of growth. It snowballs over time.'],
    ['Bull Market', 'A stretch when prices are generally rising and optimism is high.'],
    ['Bear Market', 'A stretch when prices are generally falling. Historically, markets have always recovered eventually.'],
    ['Interest Rates', 'The cost of borrowing money, set by a central bank. Rate changes push sectors up or down.'],
    ['Buy the Dip', 'Buying good stocks after a drop, when they\'re effectively on sale — the opposite of panic-selling.']
  ];

  // The market news arrives through a different "channel" each day so it never feels stale —
  // a newspaper, a TV broadcast, a trading terminal, the radio, a phone alert, or a shout
  // from the floor. Same headline, fresh delivery. Each has its own styled card + nudge.
  const MM_SOURCES = [
    { id: 'paper', icon: '📰', label: 'The Wall Street Herald', ask: 'Read the headline — what might it mean for the price tomorrow?' },
    { id: 'tv', icon: '📺', label: 'Gallop Business News', ask: 'The anchor turns to you: how will the market react?' },
    { id: 'terminal', icon: '💻', label: 'Trading Terminal', ask: 'ALERT — weigh the impact before you trade.' },
    { id: 'radio', icon: '📻', label: 'Market Radio', ask: 'You catch it on the radio. What will you do?' },
    { id: 'phone', icon: '📱', label: 'Market Alert', ask: 'A breaking alert buzzes your phone. Think a day ahead.' },
    { id: 'floor', icon: '🔔', label: 'From the Trading Floor', ask: 'A trader shouts it across the floor. Stay a step ahead.' }
  ];
  function mmNewsCard(h) {
    const src = (h && h.src) || MM_SOURCES[0];
    const t = h.text, ask = src.ask;
    switch (src.id) {
      case 'paper': return `<div class="news-src news-paper"><div class="np-mast">${src.label}</div><div class="np-head">${t}</div><div class="np-sub">${ask}</div></div>`;
      case 'tv': return `<div class="news-src news-tv"><div class="tv-top"><span class="tv-live">● LIVE</span> ${src.label}</div><div class="tv-head">${t}</div><div class="tv-sub">${ask}</div></div>`;
      case 'terminal': return `<div class="news-src news-term"><div class="tm-line">&gt; ${src.label.toUpperCase()} :: MARKET FEED</div><div class="tm-head">${t}<span class="tm-cur">▋</span></div><div class="tm-sub">${ask}</div></div>`;
      case 'radio': return `<div class="news-src news-radio"><div class="rd-top">📻 ${src.label} · ON AIR</div><div class="rd-head">“${t}”</div><div class="rd-sub">${ask}</div></div>`;
      case 'phone': return `<div class="news-src news-phone"><div class="ph-top">${src.icon} ${src.label} · now</div><div class="ph-head">${t}</div><div class="ph-sub">${ask}</div></div>`;
      default: return `<div class="news-src news-floor"><div class="fl-top">${src.icon} ${src.label}</div><div class="fl-head">${t}</div><div class="fl-sub">${ask}</div></div>`;
    }
  }

  const MM_BLANK = { unlocked: 1, cleared: {}, best: {}, careerProfit: 0, graduated: false };
  async function mmLoadProgress() {
    try {
      const r = await api(`/play/${kidId()}/game-state/market`);
      const s = r && r.state;
      if (s && typeof s === 'object') return Object.assign({}, MM_BLANK, s, { cleared: s.cleared || {}, best: s.best || {} });
    } catch (e) {}
    return Object.assign({}, MM_BLANK, { cleared: {}, best: {} });
  }
  async function mmSaveProgress(p) {
    try { await api(`/play/${kidId()}/game-state/market`, { method: 'POST', body: { state: p } }); } catch (e) {}
  }
  const $$ = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mmStars = s => '★★★☆☆☆'.slice(3 - s, 6 - s); // s in 0..3 -> filled then hollow, length 3

  // ---- the career hub / level select (free to browse; a level costs 1 token to play) ----
  async function startMarketHub() {
    const progress = await mmLoadProgress();
    MM_LOOK = Object.assign({}, MM_LOOK_DEFAULT, progress.hero || {});
    if (!MM_OUTFIT_IDS.includes(MM_LOOK.outfit)) MM_LOOK.outfit = 'suit'; // retired casual outfits → business default
    if (!MM_NAMES.includes(MM_LOOK.name)) MM_LOOK.name = 'Buck';
    const total = MM_LEVELS.length;
    const clearedCount = Object.keys(progress.cleared).length;
    const starTotal = Object.values(progress.cleared).reduce((a, b) => a + b, 0);
    const current = Math.min(progress.unlocked, total);
    const cur = MM_LEVELS[current - 1];
    app().innerHTML = topbar(`<div class="container" style="max-width:720px">
      <div class="kid-header" style="margin-bottom:10px">
        <canvas id="mm-hub-hero" width="52" height="46" class="mm-hub-hero"></canvas>
        <div><h1 style="margin:0">📈 Stable Street</h1>
          <div class="muted" style="font-size:.9rem">${MM_LOOK.name}'s investing career — grow real money, one level at a time.</div>
        </div>
        <div style="margin-left:auto"><button class="btn ghost small" onclick="location.hash='#play'">← Play Zone</button></div>
      </div>
      <div class="mm-career">
        <div class="mm-cstat"><div class="n">${progress.graduated ? '🎓' : current}</div><div>${progress.graduated ? 'Graduate' : 'Current level'}</div></div>
        <div class="mm-cstat"><div class="n">${starTotal}<span style="color:#f4b740">★</span></div><div>Stars earned</div></div>
        <div class="mm-cstat"><div class="n">${clearedCount}/${total}</div><div>Levels cleared</div></div>
        <div class="mm-cstat"><div class="n">${'$' + Math.round(progress.careerProfit).toLocaleString()}</div><div>Career profit</div></div>
      </div>
      ${progress.graduated ? `<div class="mm-grad-banner">🎓 You\'re a Certified Gallop Investor! Replay any level to beat your stars, or keep sharpening your skills.</div>` : `
      <button class="btn green mm-continue" id="mm-continue">▶ ${clearedCount >= current ? 'Replay' : 'Continue'} — Level ${current}: ${cur.emoji} ${esc(cur.name)} <span class="mm-cost">1 🎟️</span></button>`}
      <div class="mm-levels">
        ${MM_LEVELS.map(L => {
          const stars = progress.cleared[L.n] || 0;
          const locked = L.n > progress.unlocked;
          return `<div class="mm-level-card${locked ? ' mm-locked' : ''}${stars ? ' mm-done' : ''}" data-lvl="${L.n}">
            <div class="mm-lvl-top"><span class="mm-lvl-num">${locked ? '🔒' : L.emoji}</span><span class="mm-lvl-stars">${stars ? `<span style="color:#f4b740">${mmStars(stars)}</span>` : (locked ? '' : '· · ·')}</span></div>
            <div class="mm-lvl-name">Lv ${L.n}: ${esc(L.name)}</div>
            <div class="mm-lvl-concept">${esc(L.concept)}</div>
            <div class="mm-lvl-goal">${locked ? 'Locked' : `🎯 +${L.targetPct}% in ${L.days} days`}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="center" style="margin-top:14px">
        <button class="btn" id="mm-customize">🎨 Customize your trader</button>
        <button class="btn" id="mm-notebook" style="margin-left:8px">📓 Investor's Notebook</button>
      </div>
      <p class="game-hint" style="font-size:.85rem;margin-top:10px">Each level costs 1 🎟️ to play. Hit the profit target to clear it and unlock the next. Your progress saves automatically.</p>
    </div>`);
    wireChrome();
    mmHeroInto('#mm-hub-hero', 'idle');
    const cont = $('#mm-continue'); if (cont) cont.onclick = () => mmPlayLevel(current, progress);
    document.querySelectorAll('.mm-level-card').forEach(el => el.onclick = () => {
      const n = Number(el.dataset.lvl);
      if (n > progress.unlocked) { toast('Clear the level before it to unlock this one! 🔒'); return; }
      mmPlayLevel(n, progress);
    });
    $('#mm-notebook').onclick = () => mmNotebook(progress);
    $('#mm-customize').onclick = () => mmCustomize(progress);
  }

  // Inclusive character creator: pick skin tone, hairstyle & hair color, with a live preview.
  function mmCustomize(progress) {
    const look = Object.assign({}, MM_LOOK_DEFAULT, progress.hero || {});
    if (!MM_OUTFIT_IDS.includes(look.outfit)) look.outfit = 'suit';
    if (!MM_NAMES.includes(look.name)) look.name = 'Buck';
    function draw() {
      const cv = $('#mm-cz-preview'); if (!cv) return;
      const ctx = pixelCtx(cv); ctx.clearRect(0, 0, cv.width, cv.height);
      mmHero(ctx, cv.width / 2, cv.height - 4, 3, 'cheer', 0, look);
    }
    function render() {
      app().innerHTML = topbar(`<div class="container" style="max-width:560px">
        <div class="lesson-top"><b>🎨 Your Trader</b><button class="btn ghost small" id="cz-back">← Back</button></div>
        <div class="card center" style="padding:18px">
          <div class="mm-cz-stage"><canvas id="mm-cz-preview" width="84" height="80"></canvas></div>
          <div class="mm-cz-name">${look.name}</div>
          <p class="muted" style="margin:2px 0 14px">Make your trader look like you!</p>
          <div class="mm-cz-row"><span class="mm-cz-label">Name</span>
            ${MM_NAMES.map(nm => `<button class="mm-cz-btn ${look.name === nm ? 'on' : ''}" data-name="${nm}">${nm}</button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Skin</span>
            ${MM_SKINS.map((sk, i) => `<button class="mm-cz-swatch ${look.skin === i ? 'on' : ''}" data-skin="${i}" style="background:${sk.m}"></button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Hair</span>
            ${MM_HAIRSTYLES.map(([id, lbl]) => `<button class="mm-cz-btn ${look.hair === id ? 'on' : ''}" data-hair="${id}">${lbl}</button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Hair color</span>
            ${Object.entries(MM_HAIRCOLORS).map(([id, c]) => `<button class="mm-cz-swatch ${look.hairColor === id ? 'on' : ''}" data-hc="${id}" style="background:${c}"></button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Outfit</span>
            ${MM_OUTFITS.map(([id, lbl]) => `<button class="mm-cz-btn ${look.outfit === id ? 'on' : ''}" data-outfit="${id}">${lbl}</button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Outfit color</span>
            ${Object.entries(MM_OUTFIT_COLORS).map(([id, c]) => `<button class="mm-cz-swatch ${look.outfitColor === id ? 'on' : ''}" data-oc="${id}" style="background:${c}"></button>`).join('')}
          </div>
          <div class="mm-cz-row"><span class="mm-cz-label">Glasses</span>
            ${MM_GLASSES.map(([id, lbl]) => `<button class="mm-cz-btn ${look.glasses === id ? 'on' : ''}" data-glass="${id}">${lbl}</button>`).join('')}
          </div>
          <button class="btn green" id="cz-save" style="margin-top:16px">Save my trader ✨</button>
        </div>
      </div>`);
      wireChrome();
      draw();
      document.querySelectorAll('[data-name]').forEach(b => b.onclick = () => { look.name = b.dataset.name; Sound.click(); render(); });
      document.querySelectorAll('[data-skin]').forEach(b => b.onclick = () => { look.skin = Number(b.dataset.skin); Sound.click(); render(); });
      document.querySelectorAll('[data-hair]').forEach(b => b.onclick = () => { look.hair = b.dataset.hair; Sound.click(); render(); });
      document.querySelectorAll('[data-hc]').forEach(b => b.onclick = () => { look.hairColor = b.dataset.hc; Sound.click(); render(); });
      document.querySelectorAll('[data-outfit]').forEach(b => b.onclick = () => { look.outfit = b.dataset.outfit; Sound.click(); render(); });
      document.querySelectorAll('[data-oc]').forEach(b => b.onclick = () => { look.outfitColor = b.dataset.oc; Sound.click(); render(); });
      document.querySelectorAll('[data-glass]').forEach(b => b.onclick = () => { look.glasses = b.dataset.glass; Sound.click(); render(); });
      $('#cz-back').onclick = () => startMarketHub();
      $('#cz-save').onclick = () => {
        progress.hero = { name: look.name, skin: look.skin, hair: look.hair, hairColor: look.hairColor, outfit: look.outfit, outfitColor: look.outfitColor, glasses: look.glasses };
        MM_LOOK = Object.assign({}, MM_LOOK_DEFAULT, progress.hero);
        mmSaveProgress(progress);
        Sound.badge(); Confetti.burst(80);
        startMarketHub();
      };
    }
    render();
  }

  function mmNotebook(progress) {
    const learned = MM_LEVELS.filter(L => progress.cleared[L.n]);
    app().innerHTML = topbar(`<div class="container" style="max-width:680px">
      <div class="lesson-top"><b>📓 Investor's Notebook</b><button class="btn ghost small" id="nb-back">← Back</button></div>
      <div class="card" style="padding:16px">
        <h3 style="margin-top:0">💡 Ideas you've learned</h3>
        ${learned.length ? learned.map(L => `<div class="nb-concept"><b>${L.emoji} ${esc(L.concept)}</b><p class="muted" style="margin:4px 0 0">${esc(L.tip)}</p></div>`).join('') : '<p class="muted">Clear levels to unlock the big investing ideas here — one per level.</p>'}
      </div>
      <div class="card" style="padding:16px;margin-top:12px">
        <h3 style="margin-top:0">📖 Glossary</h3>
        ${MM_GLOSSARY.map(([t, d]) => `<div class="nb-term"><b>${esc(t)}</b> — <span class="muted">${esc(d)}</span></div>`).join('')}
      </div>
    </div>`);
    wireChrome();
    $('#nb-back').onclick = () => startMarketHub();
  }

  // Spend a token, then run the chosen level. Friendly paywall if out of tokens.
  async function mmPlayLevel(n, progress) {
    try {
      const r = await api(`/play/${kidId()}/spend-token`, { method: 'POST', body: { game: 'market' } });
      Sound.badge();
      _curBest = r.best || 0;
      mmRunLevel(MM_LEVELS[n - 1], progress);
    } catch (e) {
      app().innerHTML = topbar(`<div class="container" style="max-width:520px"><div class="card center">
        <div class="big-emoji">🎟️</div><h2>You need a Play Token!</h2>
        <p class="muted" style="margin:10px 0 18px">${esc(e.data && e.data.message || 'Answer 5 questions correctly in any subject to earn one!')}</p>
        <button class="btn green" onclick="location.hash='#home'">Go Learn & Earn →</button>
        <button class="btn ghost small" style="margin-left:8px" id="mm-broke-back">Back</button>
      </div></div>`);
      wireChrome();
      const b = $('#mm-broke-back'); if (b) b.onclick = () => startMarketHub();
    }
  }

  // ---- concept card (the mini-lesson shown before each level) ----
  function mmRunLevel(L, progress) {
    app().innerHTML = topbar(`<div class="container" style="max-width:620px">
      <div class="mm-concept-card">
        <div class="mm-concept-head"><canvas id="mm-concept-hero" width="52" height="46" class="mm-concept-hero"></canvas><div class="mm-concept-emoji">${L.emoji}</div></div>
        <div class="mm-concept-kicker">Level ${L.n} · ${esc(L.concept)}</div>
        <h2 style="margin:.2em 0">${esc(L.name)}</h2>
        <p class="mm-concept-body">${esc(L.intro)}</p>
        <div class="mm-goal-box">🎯 Goal: turn <b>${$$(L.start)}</b> into <b>${$$(L.start * (1 + L.targetPct / 100))}</b> (+${L.targetPct}%) within <b>${L.days} days</b>.</div>
        <button class="btn green" id="mm-begin">Start Trading →</button>
      </div>
    </div>`);
    wireChrome();
    mmHeroInto('#mm-concept-hero', 'idle');
    $('#mm-begin').onclick = () => mmPlay(L, progress);
  }

  // ---- the actual level play loop ----
  function mmPlay(L, progress) {
    const F = L.flags;
    const stocks = L.stocks.map(id => Object.assign({}, MM_STOCKS[id], { id, hist: [MM_STOCKS[id].price] }));
    const target = L.start * (1 + L.targetPct / 100);
    let day = 1, cash = L.start;
    const shares = {}, spent = {}; stocks.forEach(s => { shares[s.id] = 0; spent[s.id] = 0; });
    let last = {}, headline = F.news ? mmNews() : null;
    let dcaOn = false, dcaPick = stocks[0].id;
    const dcaAmt = Math.max(20, Math.round(L.start / 25));
    let rate = 'steady', crashed = false, recover = 0, trades = 0, fees = 0, divTotal = 0;
    const feeAmt = F.fee ? 1 : 0;
    let tradesToday = 0;
    // bubble: pick the wildest stock as the "hype darling"; it balloons, then pops mid-level
    let bubbleStock = null, bubbleBurst = 0, bubblePopped = false;
    if (F.bubble) {
      bubbleStock = stocks.reduce((a, b) => (b.wild > a.wild ? b : a), stocks[0]).id;
      bubbleBurst = Math.max(4, Math.round(L.days * 0.6));
    }

    function mmNews() {
      const s = stocks[Math.floor(Math.random() * stocks.length)];
      const up = Math.random() < 0.5;
      const list = MM_NEWS[s.id][up ? 'good' : 'bad'];
      const src = MM_SOURCES[Math.floor(Math.random() * MM_SOURCES.length)]; // fresh delivery channel each day
      return { stock: s.id, up, text: list[Math.floor(Math.random() * list.length)], src };
    }
    function netWorth() { return cash + stocks.reduce((t, s) => t + shares[s.id] * s.price, 0); }
    function avgCost(id) { return shares[id] > 0 ? spent[id] / shares[id] : 0; }

    function chart() { return `<div class="mm-chart px-stage"><canvas id="mm-canvas" width="240" height="118"></canvas><span class="mm-ax mm-axhi" id="mm-hi"></span><span class="mm-ax mm-axlo" id="mm-lo"></span></div>`; }
    function drawChart() {
      const cv = $('#mm-canvas'); if (!cv) return;
      const ctx = pixelCtx(cv);
      const W = 240, H = 118, mL = 4, mR = 6, mT = 11, mB = 11;
      const days = stocks[0].hist.length;
      const all = stocks.flatMap(s => s.hist);
      let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.14 || 4; lo = Math.max(0, lo - pad); hi = hi + pad;
      const X = i => mL + (days <= 1 ? 0 : i / (days - 1) * (W - mL - mR));
      const Y = v => mT + (1 - (v - lo) / ((hi - lo) || 1)) * (H - mT - mB);
      PX.r(ctx, 0, 0, W, H, '#0e2c1c');
      PX.r(ctx, 0, 0, W, 1, '#2ea060'); PX.r(ctx, 0, H - 1, W, 1, '#124a2c');
      for (const f of [0, 0.5, 1]) { const y = Math.round(mT + f * (H - mT - mB)); for (let x = mL; x < W - mR; x += 4) PX.r(ctx, x, y, 2, 1, 'rgba(120,200,150,.16)'); }
      stocks.forEach(s => {
        ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.beginPath();
        s.hist.forEach((p, i) => { const x = X(i), y = Y(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke();
        const lx = X(days - 1), ly = Y(s.hist[days - 1]); PX.r(ctx, lx - 2, ly - 2, 5, 5, s.color); PX.r(ctx, lx - 1, ly - 1, 3, 3, '#fff');
      });
      const hiEl = $('#mm-hi'), loEl = $('#mm-lo');
      if (hiEl) hiEl.textContent = $$(hi);
      if (loEl) loEl.textContent = $$(lo);
    }

    function render(flash) {
      const nw = netWorth(), gain = nw - L.start;
      const pctToTarget = Math.max(0, Math.min(100, Math.round((nw - L.start) / (target - L.start) * 100)));
      const rateBadge = F.rates ? `<span class="mm-rate mm-rate-${rate}">${rate === 'rising' ? '📈 Rates rising' : rate === 'falling' ? '📉 Rates falling' : '➖ Rates steady'}</span>` : '';
      app().innerHTML = topbar(`<div class="container" style="max-width:680px">
        <div class="lesson-top"><b>${L.emoji} Lv ${L.n} · Day ${day}/${L.days}</b><b class="${gain >= 0 ? 'up' : 'down'}">${$$(nw)} ${gain >= 0 ? '▲' : '▼'} ${$$(Math.abs(gain))}</b></div>
        <div class="mm-target-wrap"><div class="mm-target-bar"><div class="mm-target-fill" style="width:${pctToTarget}%"></div></div><span class="mm-target-label">🎯 ${pctToTarget}% to goal (${$$(target)})</span></div>
        ${chart()}
        <div class="mm-legend">${stocks.map(s => `<span><i style="background:${s.color}"></i>${s.emoji} ${$$(s.price)}</span>`).join('')} ${rateBadge}</div>
        ${flash ? `<div class="news-flash mm-surprise">${flash}</div>` : ''}
        ${headline ? mmNewsCard(headline) : ''}
        ${F.dca ? `<div class="mm-dca ${dcaOn ? 'on' : ''}">
          <button class="mm-dca-toggle ${dcaOn ? 'on' : ''}" id="dca-toggle">🔁 Auto-Invest ${dcaOn ? 'ON' : 'OFF'}</button>
          <span class="mm-dca-desc">Buys <b>${$$(dcaAmt)}</b> of <select id="dca-pick">${stocks.map(s => `<option value="${s.id}" ${dcaPick === s.id ? 'selected' : ''}>${s.emoji} ${s.short}</option>`).join('')}</select> each day — that's dollar-cost averaging.</span>
        </div>` : ''}
        <div class="card" style="padding:12px">
          ${stocks.map(s => {
            const chg = last[s.id]; const val = shares[s.id] * s.price; const ac = avgCost(s.id);
            return `<div class="stock-row${headline && s.id === headline.stock ? ' mm-hot' : ''}">
              <span class="mm-dot" style="background:${s.color}"></span>
              <b class="mm-name">${s.emoji} ${s.short}${F.dividends && s.div ? ' <span class="mm-divtag" title="Pays a dividend">💰</span>' : ''}</b>
              <span class="mm-price">${$$(s.price)}</span>
              ${chg != null ? `<span class="${chg >= 0 ? 'up' : 'down'} mm-chg">${chg >= 0 ? '▲' : '▼'}${Math.abs(chg).toFixed(1)}%</span>` : '<span class="muted mm-chg">new</span>'}
              <span class="mm-hold">${shares[s.id] ? `×${shares[s.id]}${ac ? `<span class="mm-avg">avg ${$$(ac)}</span>` : ''}` : ''}</span>
              <span class="mm-actions">
                <button class="btn small green" data-buy="${s.id}" ${cash < s.price + feeAmt ? 'disabled' : ''}>Buy</button>
                <button class="btn small coral" data-sell="${s.id}" ${shares[s.id] < 1 ? 'disabled' : ''}>Sell</button>
              </span>
            </div>`;
          }).join('')}
          <div class="mm-foot">
            <span>💵 Cash <b>${$$(cash)}</b></span><span>📊 Stocks <b>${$$(nw - cash)}</b></span>
            <button class="btn sun small" id="next-day">${day === L.days ? 'Close the Market 🔔' : 'Next Day →'}</button>
          </div>
        </div>
        ${feeAmt ? `<p class="game-hint" style="font-size:.82rem">💸 Each trade costs ${$$(feeAmt)}. Trades so far: ${trades} · Fees paid: ${$$(fees)}. Don't over-trade!</p>` : ''}
        <p class="game-hint" style="font-size:.88rem">💡 ${esc(L.tip)}</p>
      </div>`);
      wireChrome();
      drawChart();
      const dt = $('#dca-toggle'); if (dt) dt.onclick = () => { dcaOn = !dcaOn; Sound.click(); render(flash); };
      const dp = $('#dca-pick'); if (dp) dp.onchange = () => { dcaPick = dp.value; };
      document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
        const s = stocks.find(x => x.id === b.dataset.buy);
        if (cash >= s.price + feeAmt) { cash -= s.price + feeAmt; shares[s.id] += 1; spent[s.id] += s.price; if (feeAmt) { fees += feeAmt; } trades++; Sound.click(); render(flash); }
      });
      document.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => {
        const s = stocks.find(x => x.id === b.dataset.sell);
        // Proceeds (price - fee) are always >= 0 since price >= 1 >= fee, so no up-front cash needed.
        if (shares[s.id] >= 1) { cash += s.price - feeAmt; spent[s.id] -= avgCost(s.id); shares[s.id] -= 1; if (feeAmt) { fees += feeAmt; } trades++; Sound.click(); render(flash); }
      });
      $('#next-day').onclick = advance;
    }

    function advance() {
      // dividends first (paid on shares held at the start of the day's close)
      if (F.dividends) {
        let paid = 0;
        stocks.forEach(s => { if (s.div && shares[s.id]) paid += shares[s.id] * s.div; });
        if (paid > 0) { cash += paid; divTotal += paid; }
      }
      // dollar-cost averaging: auto-buy a fixed dollar amount of the picked stock
      if (F.dca && dcaOn) {
        const s = stocks.find(x => x.id === dcaPick);
        const n = Math.floor(dcaAmt / (s.price + feeAmt));
        // Fee is per share, matching the manual buy path — so auto-investing doesn't dodge
        // trading costs (that would undercut the "fees hurt / don't over-trade" lesson).
        if (n > 0 && cash >= n * (s.price + feeAmt)) {
          cash -= n * (s.price + feeAmt); shares[s.id] += n; spent[s.id] += n * s.price; if (feeAmt) { fees += n * feeAmt; trades += n; }
        }
      }
      // interest-rate regime can shift
      if (F.rates && Math.random() < 0.30) { rate = ['rising', 'falling', 'steady'][Math.floor(Math.random() * 3)]; }
      const follows = Math.random() < 0.80;   // news is right ~80% of the time — surprises keep it honest
      let flash = null;
      // crash trigger (once per level, in the middle stretch)
      let crashing = false;
      if (F.crash && !crashed && day >= 3 && day <= L.days - 2 && Math.random() < 0.28) {
        crashing = true; crashed = true; recover = 3;
        flash = '📉 CRASH! The whole market is tumbling. Don\'t panic — downturns recover, and dips can be discounts. Hold steady (or buy the dip).';
      }
      for (const s of stocks) {
        let move = (Math.random() * 2 - 1) * s.wild;
        if (headline && s.id === headline.stock) {
          const dir = headline.up === follows ? 1 : -1;
          move = dir * (0.08 + Math.random() * 0.14);
          if (!follows && !flash) flash = '😮 Surprise! The market didn\'t react the way the news suggested. That happens for real — never bet everything on one headline.';
        }
        if (F.rates && s.rate) {
          const push = rate === 'rising' ? s.rate : rate === 'falling' ? -s.rate : 0;
          move += push * (0.015 + Math.random() * 0.03);
        }
        if (crashing) { move = -(0.14 + Math.random() * 0.20); }
        else if (recover > 0) { move += 0.01 + Math.random() * 0.035; }
        // the bubble darling detaches from reality: it balloons, then pops on the burst day
        if (F.bubble && s.id === bubbleStock) {
          if (day < bubbleBurst) {
            move = 0.05 + Math.random() * 0.06;
            if (day === bubbleBurst - 3 && !flash) flash = '🚀 Everyone is piling into ' + s.short + ' — it\'s rocketing! Thrilling... but nothing climbs forever. Think about taking profits.';
          } else if (day === bubbleBurst) {
            move = -(0.30 + Math.random() * 0.16);
            if (!bubblePopped) { bubblePopped = true; flash = '💥 The bubble POPPED! ' + s.short + ' came crashing down. Chasing a red-hot stock to the very top is how investors get burned — the smart money sold before the pop.'; }
          }
        }
        last[s.id] = move * 100;
        s.price = Math.max(1, Math.round(s.price * (1 + move) * 100) / 100);
        s.hist.push(s.price);
      }
      if (recover > 0 && !crashing) recover--;
      if (day === L.days) return finish();
      day++; if (F.news) headline = mmNews();
      Sound.badge();
      render(flash);
    }

    function finish() {
      const nw = netWorth(), gain = nw - L.start, pct = Math.round(gain / L.start * 100);
      const cleared = nw >= target;
      let stars = 0;
      if (cleared) stars = nw >= L.start * (1 + L.targetPct * 2 / 100) ? 3 : nw >= L.start * (1 + L.targetPct * 1.5 / 100) ? 2 : 1;
      const prevStars = progress.cleared[L.n] || 0;
      const firstClear = cleared && prevStars === 0;
      // update saved progress
      if (cleared) {
        progress.cleared[L.n] = Math.max(prevStars, stars);
        if (L.n === progress.unlocked && L.n < MM_LEVELS.length) progress.unlocked = L.n + 1;
        if (firstClear) progress.careerProfit = (progress.careerProfit || 0) + Math.max(0, Math.round(gain));
        if (Object.keys(progress.cleared).length >= MM_LEVELS.length) progress.graduated = true;
      }
      progress.best[L.n] = Math.max(progress.best[L.n] || 0, Math.round(nw));
      mmSaveProgress(progress);
      // record a high-score run too (coins, buddy challenges, best) — score = portfolio/10
      const score = Math.max(10, Math.round(nw / 10));
      api(`/play/${kidId()}/score`, { method: 'POST', body: { game: 'market', score } }).then(r => {
        if (r && r.coinsEarned) toast(`+${r.coinsEarned} 🪙`);
      }).catch(() => {});
      const nextL = MM_LEVELS[L.n]; // may be undefined at level 10
      const justGraduated = cleared && progress.graduated;

      // The results card — shown after the NES interlude on a win, or straight away on a miss.
      function showResult() {
        Confetti.burst(cleared ? 160 : 80); Sound.levelup();
        app().innerHTML = topbar(`<div class="container" style="max-width:560px"><div class="card center">
          <canvas id="mm-res-hero" width="60" height="52" class="mm-res-hero"></canvas>
          <h2>${justGraduated ? `${MM_LOOK.name} is a Certified Gallop Investor!` : cleared ? `Level ${L.n} cleared!` : 'So close — try again!'}</h2>
          ${cleared ? `<div class="mm-star-row">${'★'.repeat(stars)}<span class="mm-star-empty">${'★'.repeat(3 - stars)}</span></div>` : ''}
          <div class="summary-stats">
            <div class="sstat"><div class="n">${$$(nw)}</div>portfolio</div>
            <div class="sstat"><div class="n ${gain >= 0 ? 'up' : 'down'}">${gain >= 0 ? '+' : ''}${pct}%</div>return</div>
            ${F.dividends && divTotal ? `<div class="sstat"><div class="n">${$$(divTotal)}</div>💰 dividends</div>` : ''}
          </div>
          <div class="hs-banner ${cleared ? 'hs-new' : ''}">${cleared
            ? (justGraduated ? 'You cleared every level and mastered the market. Incredible work! 🎉' : `You beat the +${L.targetPct}% goal. ${nextL ? `Level ${nextL.n}: ${esc(nextL.name)} is unlocked!` : ''}`)
            : `You reached ${$$(nw)} — the goal was ${$$(target)}. Every pro has red days. Adjust your strategy and give it another go!`}</div>
          <p class="muted">${esc(cleared ? L.tip : L.intro.split('. ')[0] + '.')}</p>
          <div style="margin-top:14px">
            ${cleared && nextL ? `<button class="btn green" id="mm-next">Next Level →</button>` : ''}
            ${!cleared ? `<button class="btn green" id="mm-retry">Try Again (1 🎟️)</button>` : ''}
            <button class="btn" style="margin-left:8px" id="mm-hub">Market Hub</button>
          </div>
        </div></div>`);
        wireChrome();
        mmHeroInto('#mm-res-hero', cleared ? 'cheer' : 'idle');
        const nx = $('#mm-next'); if (nx) nx.onclick = () => mmPlayLevel(nextL.n, progress);
        const rt = $('#mm-retry'); if (rt) rt.onclick = () => mmPlayLevel(L.n, progress);
        $('#mm-hub').onclick = () => startMarketHub();
      }

      // Win → play the Punch-Out!!-style interlude (belt ceremony / themed scene), then the card.
      if (cleared) mmCutscene(mmSceneForLevel(L.n, justGraduated), showResult);
      else showResult();
    }

    render(null);
  }
  // ======================= MARKET MOGUL — NES CUTSCENES =======================
  // Punch-Out!!-style interludes. A little pixel trader ("Buck") climbs a Wall Street
  // career: every level clear ends with a championship-belt ceremony, and milestone
  // levels play a themed animated scene (1980s Mac desk → NYSE floor → surviving the
  // storm → ticker-tape parade → the limo → penthouse legend). Chiptune fanfares play
  // through the shared Sound engine. All drawn on the shared 16-bit pixel canvas.
  const SP = {
    night1: '#0b1030', night2: '#161a44', dusk: '#3a2a5c', beige: '#e8dcc0', beige2: '#d8c8a0',
    desk: '#8a5a2c', deskDk: '#6a3f18', mac: '#d8d2c0', macDk: '#a89e88', macScr: '#0e2c1c',
    green: '#2ea060', greenLt: '#5ff0a0', red: '#e05050', redLt: '#ff9090', white: '#f6f7fb',
    gold: '#f4c020', goldLt: '#ffe98a', goldDk: '#b8890c', sky: '#5c94fc', skyLt: '#8fb8ff',
    bldg: '#2a3550', bldgLt: '#3a4a70', bldgDay: '#6b7a99', win: '#f4d84a', street: '#20242e',
    ink: '#141824', cloud: '#8a94a8', cloudDk: '#69728a', sun: '#ffd23a', sunCore: '#fff0a0', col: '#e6e2d4'
  };
  const rnd = i => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };

  // --- inclusive character creator for the mascot ("Buck" is just the default look) ---
  // Kids pick a skin tone, a hairstyle, and a hair color so the trader can look like them.
  const MM_SKINS = [
    { m: '#ffd9b3', s: '#e8b088' }, { m: '#fcac6c', s: '#e0894c' }, { m: '#e0995c', s: '#c07a3c' },
    { m: '#b06a3c', s: '#8a4e28' }, { m: '#8a5028', s: '#6a3a18' }, { m: '#5e3620', s: '#442414' }
  ];
  const MM_HAIRCOLORS = { brown: '#4a2e12', black: '#171a1f', blonde: '#d6a84a', auburn: '#8a3b1a', gray: '#b8bcc4' };
  const MM_HAIRSTYLES = [['short', 'Short'], ['long', 'Long'], ['ponytail', 'Ponytail'], ['afro', 'Afro'], ['buzz', 'Buzz']];
  // Business-appropriate attire only — part of the lesson is "dress the part."
  const MM_OUTFITS = [['suit', 'Suit & tie'], ['blazer', 'Blazer'], ['dress', 'Dress']];
  const MM_OUTFIT_IDS = ['suit', 'blazer', 'dress'];
  const MM_OUTFIT_COLORS = { navy: '#2a3550', teal: '#1f7a70', purple: '#6a3f9c', berry: '#a83668', pink: '#d6559b', green: '#2f8a4e', slate: '#4a5568', amber: '#d2761f' };
  const MM_GLASSES = [['none', 'None'], ['glasses', 'Glasses'], ['sunglasses', 'Shades']];
  // Money-themed names — the kid picks their own (Buck & Penny lead; the rest keep it open).
  const MM_NAMES = ['Buck', 'Penny', 'Bill', 'Ruby', 'Cash', 'Sunny'];
  const MM_LOOK_DEFAULT = { name: 'Buck', skin: 1, hair: 'short', hairColor: 'brown', outfit: 'suit', outfitColor: 'navy', glasses: 'none' };
  let MM_LOOK = Object.assign({}, MM_LOOK_DEFAULT);

  // --- the mascot: a chunky pixel trader, drawn from a customizable look ---
  function mmHero(ctx, cx, feetY, s, pose, f, look) {
    const L = look || MM_LOOK;
    const SK = MM_SKINS[L.skin] || MM_SKINS[1];
    const HC = MM_HAIRCOLORS[L.hairColor] || MM_HAIRCOLORS.brown;
    const style = L.hair || 'short';
    const OC = MM_OUTFIT_COLORS[L.outfitColor] || MM_OUTFIT_COLORS.navy;
    const OCL = mix(OC, '#ffffff', 0.22);
    const outfit = L.outfit || 'suit';
    const P = { shirt: '#f6f7fb', skin: SK.m, skin2: SK.s, hair: HC, shoe: '#141824', ink: '#141824' };
    // outfit-derived details: pants color, tie, shirt V, neckline style, skirt
    let pants = OC, tie = null, shirtV = false, neck = 'plain', skirt = null;
    if (outfit === 'suit') { tie = '#f4c020'; shirtV = true; }
    else if (outfit === 'blazer') { shirtV = true; neck = 'collar'; pants = '#3a4150'; }
    else if (outfit === 'dress') { neck = 'round'; skirt = OC; pants = SK.m; }
    else if (outfit === 'hoodie') { neck = 'hood'; pants = '#35507a'; }
    else if (outfit === 'sweater') { neck = 'crew'; pants = '#3a4150'; }
    const R = (x, y, w, h, c) => PX.r(ctx, cx + x * s, feetY + y * s, w * s, h * s, c);
    const step = pose === 'walk' ? Math.floor(f / 8) % 2 : 0;
    const bob = pose === 'idle' ? (Math.floor(f / 22) % 2) : 0;
    const yo = -bob;
    // legs + shoes
    R(-3, -5 + yo, 2, 5, pants); R(1, -5 + yo, 2, 5, pants);
    if (step) { R(-4, -1 + yo, 3, 1, P.shoe); R(1, -1 + yo, 3, 1, P.shoe); }
    else { R(-3, -1 + yo, 3, 1, P.shoe); R(0, -1 + yo, 3, 1, P.shoe); }
    // a dress flares a skirt over the upper legs
    if (skirt) { R(-5, -6 + yo, 10, 2, skirt); R(-4, -7 + yo, 8, 1, skirt); }
    // long hair / ponytail fall BEHIND the shoulders (drawn before the torso)
    if (style === 'long') { R(-5, -19 + yo, 1, 12, P.hair); R(4, -19 + yo, 1, 12, P.hair); R(-5, -8 + yo, 2, 2, P.hair); R(3, -8 + yo, 2, 2, P.hair); }
    else if (style === 'ponytail') { R(4, -19 + yo, 2, 3, P.hair); R(5, -17 + yo, 2, 7, P.hair); }
    // torso (outfit color) + shoulder highlight
    R(-4, -12 + yo, 8, 7, OC); R(-4, -12 + yo, 8, 1, OCL);
    // necklines & details per outfit
    if (shirtV) R(-1, -12 + yo, 2, 5, P.shirt);
    if (neck === 'collar') { R(-2, -12 + yo, 1, 2, P.shirt); R(1, -12 + yo, 1, 2, P.shirt); }
    else if (neck === 'round') R(-1, -12 + yo, 2, 1, P.skin);
    else if (neck === 'crew') R(-1, -12 + yo, 2, 1, OCL);
    else if (neck === 'hood') { R(-4, -13 + yo, 8, 1, mix(OC, '#000000', 0.32)); R(-1, -12 + yo, 1, 3, P.shirt); R(1, -12 + yo, 1, 3, P.shirt); }
    if (tie) R(0, -11 + yo, 1, 5, tie);
    // arms (sleeves match the outfit)
    if (pose === 'cheer' || pose === 'hold') { R(-6, -18 + yo, 2, 6, OC); R(4, -18 + yo, 2, 6, OC); R(-6, -19 + yo, 2, 2, P.skin); R(4, -19 + yo, 2, 2, P.skin); }
    else { R(-6, -12 + yo, 2, 6, OC); R(4, -12 + yo, 2, 6, OC); R(-6, -7 + yo, 2, 2, P.skin); R(4, -7 + yo, 2, 2, P.skin); }
    // head
    R(-3, -19 + yo, 6, 7, P.skin);
    // front hair by style
    if (style === 'afro') { R(-4, -23 + yo, 8, 6, P.hair); R(-5, -21 + yo, 1, 5, P.hair); R(4, -21 + yo, 1, 5, P.hair); }
    else if (style === 'buzz') { R(-3, -20 + yo, 6, 1, P.hair); R(-3, -20 + yo, 1, 2, P.hair); R(2, -20 + yo, 1, 2, P.hair); }
    else if (style === 'long') { R(-3, -20 + yo, 6, 2, P.hair); R(-4, -20 + yo, 1, 6, P.hair); R(3, -20 + yo, 1, 6, P.hair); }
    else if (style === 'ponytail') { R(-3, -20 + yo, 6, 2, P.hair); R(-4, -19 + yo, 1, 3, P.hair); R(3, -19 + yo, 1, 2, P.hair); }
    else { R(-3, -20 + yo, 6, 2, P.hair); R(-4, -19 + yo, 1, 3, P.hair); R(3, -19 + yo, 1, 3, P.hair); }
    // eyes / glasses
    if (L.glasses === 'glasses') {
      R(-4, -16 + yo, 3, 2, '#cfe8f5'); R(1, -16 + yo, 3, 2, '#cfe8f5');
      R(-4, -17 + yo, 8, 1, '#20242e'); R(-1, -16 + yo, 2, 1, '#20242e');
      R(-3, -16 + yo, 1, 1, P.ink); R(2, -16 + yo, 1, 1, P.ink);
    } else if (L.glasses === 'sunglasses') {
      R(-4, -16 + yo, 3, 2, '#181c24'); R(1, -16 + yo, 3, 2, '#181c24');
      R(-4, -17 + yo, 8, 1, '#0c0e14'); R(-1, -16 + yo, 2, 1, '#0c0e14');
    } else {
      R(-2, -16 + yo, 1, 1, P.ink); R(1, -16 + yo, 1, 1, P.ink);
    }
    if (pose === 'cheer' || pose === 'hold') R(-1, -14 + yo, 2, 1, P.ink);
  }

  // --- a championship belt (the "belt on Little Mac" moment) ---
  function mmBelt(ctx, cx, cy, s, shine) {
    const R = (x, y, w, h, c) => PX.r(ctx, cx + x * s, cy + y * s, w * s, h * s, c);
    R(-15, -3, 30, 6, '#3a2a12'); R(-15, -3, 30, 1, '#5a4020');
    R(-8, -7, 16, 14, SP.goldDk); R(-7, -6, 14, 12, SP.gold); R(-7, -6, 14, 2, SP.goldLt);
    // star in the plate
    R(-1, -5, 2, 8, '#fff8d0'); R(-4, -2, 8, 2, '#fff8d0');
    PX.r(ctx, cx + (-2) * s, cy + (-4) * s, s, s, '#fff8d0'); PX.r(ctx, cx + (1) * s, cy + (-4) * s, s, s, '#fff8d0');
    PX.r(ctx, cx + (-2) * s, cy + (1) * s, s, s, '#fff8d0'); PX.r(ctx, cx + (1) * s, cy + (1) * s, s, s, '#fff8d0');
    if (shine != null) { const sx = -15 + Math.round(shine * 30); PX.r(ctx, cx + sx * s, cy - 7 * s, s, 14 * s, 'rgba(255,255,255,.5)'); }
  }

  function drawTicker(ctx, W, y, t) {
    PX.r(ctx, 0, y, W, 12, SP.ink); PX.r(ctx, 0, y, W, 1, '#2ea060');
    const span = W + 40, off = Math.floor(t / 22) % span;
    for (let i = 0; i < 22; i++) {
      let x = ((i * 34 - off) % span + span) % span - 20;
      const up = rnd(i) > .42;
      PX.r(ctx, x, y + 3, 9, 6, up ? SP.green : SP.red);
      PX.r(ctx, x + 10, y + 5, 3, 2, up ? SP.greenLt : SP.redLt);
    }
  }
  function drawSkyline(ctx, W, baseY, night) {
    const cols = [[6, 58], [36, 92], [66, 42], [92, 112], [128, 74], [160, 100], [196, 54], [224, 96]];
    cols.forEach(([x, h], i) => {
      PX.r(ctx, x, baseY - h, 26, h, night ? SP.bldg : SP.bldgDay);
      PX.r(ctx, x, baseY - h, 26, 1, night ? SP.bldgLt : '#8090b0');
      for (let wy = baseY - h + 6; wy < baseY - 6; wy += 10)
        for (let wx = x + 4; wx < x + 22; wx += 8)
          if (rnd(i * 9 + wx + wy) > .35) PX.r(ctx, wx, wy, 4, 5, night ? SP.win : '#cdd8ea');
    });
  }
  function drawConfetti(ctx, W, H, t, n) {
    const cols = ['#f4c020', '#5ff0a0', '#ff9090', '#8fb8ff', '#f6f7fb', '#d6559b'];
    for (let i = 0; i < (n || 40); i++) {
      const x = Math.round(((rnd(i) * W) + Math.sin(t / 600 + i) * 8) % W);
      const y = Math.round((rnd(i + 99) * H + t / 8 * (0.5 + rnd(i + 5))) % H);
      PX.r(ctx, x, y, 3, 3, cols[i % cols.length]);
    }
  }

  // ---- the six themed scenes + the generic belt ceremony ----
  const MM_SCENES = {
    belt: { title: 'LEVEL CLEARED!', dur: 2600, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .55 ? SP.night2 : '#0e2c1c');
        // spotlight
        ctx.fillStyle = 'rgba(255,240,180,.10)'; ctx.beginPath(); ctx.moveTo(W / 2, 12); ctx.lineTo(W / 2 - 60, H - 24); ctx.lineTo(W / 2 + 60, H - 24); ctx.closePath(); ctx.fill();
        const f = t / 16, showBelt = t > 700;
        mmHero(ctx, W / 2, H - 26, 3, t > 1200 ? 'cheer' : 'idle', f);
        if (showBelt) { const drop = Math.min(1, (t - 700) / 700); const by = 34 + drop * (H - 92); mmBelt(ctx, W / 2, by, 3, (t % 1400) / 1400); }
        for (let i = 0; i < 6; i++) { if ((t / 300 + i) % 6 < 3) { const a = i / 6 * 6.28; PX.r(ctx, W / 2 + Math.round(Math.cos(a) * 40), 40 + Math.round(Math.sin(a) * 14), 3, 3, SP.gold); } }
        drawTicker(ctx, W, H - 12, t);
      } },
    rookieDesk: { title: 'THE ROOKIE', dur: 3200, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .6 ? SP.beige : SP.beige2);
        PX.r(ctx, 0, H - 34, W, 4, SP.deskDk); PX.r(ctx, 0, H - 30, W, 18, SP.desk);
        // 1980s beige Macintosh
        const mx = 40, my = H - 82;
        PX.r(ctx, mx, my, 46, 50, SP.macDk); PX.r(ctx, mx + 1, my + 1, 44, 48, SP.mac);
        PX.r(ctx, mx + 6, my + 6, 34, 26, SP.macScr);
        // rising green line on the screen
        ctx.strokeStyle = SP.greenLt; ctx.lineWidth = 2; ctx.beginPath();
        const pts = Math.min(16, Math.floor(t / 120));
        for (let i = 0; i <= pts; i++) { const x = mx + 7 + i * 2, y = my + 28 - (i * 1.3 + Math.sin(i) * 2); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
        PX.r(ctx, mx + 8, my + 36, 30, 3, SP.macDk); // floppy slot
        if (Math.floor(t / 400) % 2) PX.r(ctx, mx + 38, my + 10, 2, 3, SP.greenLt); // cursor blink
        mmHero(ctx, mx + 78, H - 30, 3, (Math.floor(t / 500) % 2) ? 'cheer' : 'idle', t / 16);
        // little rising $ counter
        PX.text(ctx, '$' + Math.min(999, Math.floor(t / 6)), mx + 60, my + 6, SP.green, 8);
        drawTicker(ctx, W, H - 12, t);
      } },
    tradingFloor: { title: 'THE TRADING FLOOR', dur: 3400, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .5 ? SP.night1 : SP.night2);
        // NYSE columns
        for (const cx of [16, 210]) { PX.r(ctx, cx, 10, 30, H - 34, SP.col); PX.r(ctx, cx - 4, 6, 38, 5, SP.white); PX.r(ctx, cx - 4, H - 26, 38, 5, SP.white); }
        // the big board
        PX.r(ctx, 58, 16, 140, 60, '#05140c'); PX.r(ctx, 58, 16, 140, 2, SP.green);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
          const up = Math.sin(t / 300 + r * 2 + c) > 0;
          PX.r(ctx, 64 + c * 17, 22 + r * 13, 13, 9, up ? SP.green : SP.red);
        }
        // falling ticker tape
        for (let i = 0; i < 26; i++) { const x = Math.round(rnd(i) * W); const y = Math.round((rnd(i + 7) * H + t / 6) % (H - 20)); PX.r(ctx, x, y, 3, 6, i % 3 ? SP.white : SP.greenLt); }
        // Buck walks in from the left to center
        const hx = Math.min(W / 2, 24 + t / 26);
        mmHero(ctx, hx, H - 24, 3, hx < W / 2 ? 'walk' : 'cheer', t / 16);
        drawTicker(ctx, W, H - 12, t);
      } },
    stormCleared: { title: 'WEATHERED THE STORM', dur: 3400, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        const clear = Math.min(1, t / 1800);
        for (let y = 0; y < H; y++) { const c = y < H * .6 ? mix(SP.dusk, SP.sky, clear) : '#124a2c'; PX.r(ctx, 0, y, W, 1, c); }
        // sun grows in center
        const sr = 8 + clear * 14; PX.r(ctx, W / 2 - sr, 26 - sr / 2, sr * 2, sr, SP.sunCore); circle(ctx, W / 2, 30, sr, SP.sun); circle(ctx, W / 2, 30, sr - 3, SP.sunCore);
        // storm clouds slide off to the sides
        const off = clear * 90;
        cloud(ctx, 40 - off, 26); cloud(ctx, 150 + off, 20); cloud(ctx, 210 + off, 40);
        // recovery chart: dips then rises
        ctx.strokeStyle = SP.greenLt; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const x = 10 + i * (W - 20) / 40; const dip = Math.sin(i / 40 * 3.14) * 24; const rise = i * 0.5; const y = H - 40 - rise + (i < 20 ? dip : 0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
        mmHero(ctx, W / 2, H - 24, 3, clear > .7 ? 'cheer' : 'idle', t / 16);
        drawTicker(ctx, W, H - 12, t);
      } },
    tickerParade: { title: 'TICKER-TAPE PARADE', dur: 3400, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .62 ? SP.skyLt : '#7a869a');
        drawSkyline(ctx, W, H - 22, false);
        drawConfetti(ctx, W, H - 20, t, 60);
        // cheering crowd dots
        for (let i = 0; i < 22; i++) { const x = 6 + i * 11; const b = Math.sin(t / 200 + i) > 0 ? 0 : 2; PX.r(ctx, x, H - 20 + b, 5, 8, ['#2a3550', '#8a5a2c', '#4a2e12'][i % 3]); PX.r(ctx, x, H - 24 + b, 5, 4, SP.skin); }
        mmHero(ctx, W / 2, H - 26, 3, 'cheer', t / 16);
        drawTicker(ctx, W, H - 12, t);
      } },
    limo: { title: 'THE BIG LEAGUES', dur: 3600, fanfare: () => mmFanfare('level'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .5 ? SP.night1 : SP.night2);
        drawSkyline(ctx, W, H - 24, true);
        PX.r(ctx, 0, H - 22, W, 22, SP.street); PX.r(ctx, 0, H - 22, W, 1, '#3a4050');
        // limo drives in from the right to center
        const lx = Math.max(W / 2 - 6, W - t / 20);
        const carW = 96;
        PX.r(ctx, lx, H - 34, carW, 12, SP.ink); PX.r(ctx, lx + 14, H - 44, carW - 40, 10, SP.ink);
        for (let wx = lx + 18; wx < lx + carW - 24; wx += 12) PX.r(ctx, wx, H - 42, 8, 6, '#3a4a70');
        PX.r(ctx, lx + carW - 6, H - 30, 4, 3, SP.win); // headlight
        circle(ctx, lx + 16, H - 22, 5, '#0a0c10'); circle(ctx, lx + carW - 18, H - 22, 5, '#0a0c10');
        circle(ctx, lx + 16, H - 22, 2, '#555'); circle(ctx, lx + carW - 18, H - 22, 2, '#555');
        // Buck walks toward the limo
        const hx = Math.min(W / 2 - 40, 20 + t / 30);
        mmHero(ctx, hx, H - 22, 3, hx < W / 2 - 40 ? 'walk' : 'idle', t / 16);
        drawTicker(ctx, W, H - 12, t);
      } },
    legend: { title: 'WALL STREET LEGEND', dur: 4200, fanfare: () => mmFanfare('grad'),
      draw(ctx, W, H, t) {
        for (let y = 0; y < H; y++) PX.r(ctx, 0, y, W, 1, y < H * .55 ? SP.night1 : SP.night2);
        drawSkyline(ctx, W, H - 20, true);
        // fireworks
        const fw = [[60, 40, '#f4c020'], [130, 28, '#5ff0a0'], [200, 46, '#ff9090']];
        fw.forEach(([cx, cy, col], k) => { const ph = ((t / 1000 + k * .4) % 1); const r = ph * 20; for (let a = 0; a < 10; a++) { const an = a / 10 * 6.28; PX.r(ctx, cx + Math.round(Math.cos(an) * r), cy + Math.round(Math.sin(an) * r), 2, 2, ph < .85 ? col : SP.night2); } });
        drawConfetti(ctx, W, H - 18, t, 44);
        mmHero(ctx, W / 2, H - 24, 3, 'hold', t / 16);
        mmBelt(ctx, W / 2, H - 60, 3, (t % 1400) / 1400); // held overhead
        drawTicker(ctx, W, H - 12, t);
      } }
  };
  function mix(a, b, k) { const pa = hx2(a), pb = hx2(b); const r = Math.round(pa[0] + (pb[0] - pa[0]) * k), g = Math.round(pa[1] + (pb[1] - pa[1]) * k), bl = Math.round(pa[2] + (pb[2] - pa[2]) * k); return `rgb(${r},${g},${bl})`; }
  function hx2(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function circle(ctx, cx, cy, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.29); ctx.fill(); }
  function cloud(ctx, x, y) { PX.r(ctx, x, y, 30, 10, SP.cloud); PX.r(ctx, x + 6, y - 5, 18, 8, SP.cloud); PX.r(ctx, x, y, 30, 2, SP.cloudDk); }

  // NES chiptune fanfares (square-wave arpeggios) via the shared Sound engine.
  function mmFanfare(kind) {
    try {
      if (Sound.muted) return;
      const c = Sound.ctx(); let t = c.currentTime;
      const play = (f, d, g, type) => { if (!f) { t += d; return; } const o = c.createOscillator(), gn = c.createGain(); o.type = type || 'square'; o.frequency.value = f; gn.gain.setValueAtTime(g || .08, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(gn).connect(c.destination); o.start(t); o.stop(t + d + .02); t += d; };
      const N = { G4: 392, C5: 523, E5: 659, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G6: 1568 };
      if (kind === 'grad') {
        [[N.C5, .12], [N.E5, .12], [N.G5, .12], [N.C6, .18], [N.G5, .12], [N.C6, .3], [0, .08], [N.E6, .18], [N.G6, .4]].forEach(([f, d]) => play(f, d, .09));
      } else {
        [[N.G4, .1], [N.C5, .1], [N.E5, .1], [N.G5, .16], [N.E5, .1], [N.G5, .34]].forEach(([f, d]) => play(f, d, .08));
      }
    } catch (e) {}
  }

  function mmSceneForLevel(n, graduated) {
    if (graduated) return 'legend';
    return ({ 1: 'rookieDesk', 3: 'tradingFloor', 5: 'stormCleared', 7: 'tickerParade', 9: 'limo' })[n] || 'belt';
  }

  // Play an animated cutscene, then call onDone (which renders the results card).
  function mmCutscene(sceneId, onDone) {
    const scene = MM_SCENES[sceneId] || MM_SCENES.belt;
    app().innerHTML = topbar(`<div class="container" style="max-width:560px">
      <div class="mm-cutscene">
        <div class="mm-cut-frame"><canvas id="mm-cut" width="256" height="180"></canvas></div>
        <div class="mm-cut-title">${scene.title}</div>
        <div class="mm-cut-btns">
          <button class="btn green mm-cut-go" id="mm-cut-go" style="visibility:hidden">Continue →</button>
        </div>
        <button class="mm-cut-skip" id="mm-cut-skip">Skip ▸</button>
      </div>
    </div>`);
    wireChrome();
    const cv = $('#mm-cut'); if (!cv) { onDone(); return; }
    const ctx = pixelCtx(cv);
    let startTs = null, raf = null, done = false;
    try { scene.fanfare && scene.fanfare(); } catch (e) {}
    Confetti.burst(60);
    function endScene() { if (done) return; done = true; if (raf) cancelAnimationFrame(raf); onDone(); }
    const go = $('#mm-cut-go'), skip = $('#mm-cut-skip');
    if (go) go.onclick = () => { Sound.click(); endScene(); };
    if (skip) skip.onclick = () => { Sound.click(); endScene(); };
    function frame(ts) {
      if (!document.body.contains(cv)) return;   // route changed away — stop drawing
      if (startTs == null) startTs = ts;
      const t = ts - startTs;
      try { scene.draw(ctx, 256, 180, t); } catch (e) {}
      if (t > scene.dur && go && go.style.visibility === 'hidden') { go.style.visibility = 'visible'; go.classList.add('mm-cut-pop'); }
      if (!done) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  // Draw a static mascot into a small canvas (hub header, concept card) for continuity.
  function mmHeroInto(id, pose) {
    const cv = $(id); if (!cv) return;
    const ctx = pixelCtx(cv);
    ctx.clearRect(0, 0, cv.width, cv.height);
    mmHero(ctx, cv.width / 2, cv.height - 4, 2, pose || 'idle', 0);
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

    // A random occasion (same math, different story) so the order isn't the same
    // every play — one day it's a wedding, the next a soccer team or a festival.
    const OCCASIONS = [
      { who: 'A birthday party', place: 'a birthday party', for: 'the big day' },
      { who: 'A school', place: 'a school fair', for: 'the fair' },
      { who: 'A soccer team', place: 'a soccer tournament', for: 'the tournament' },
      { who: 'A wedding planner', place: 'a wedding', for: 'the reception' },
      { who: 'The town festival', place: 'the town festival', for: 'the festival' },
      { who: 'A food truck', place: 'a food truck', for: 'their big weekend' }
    ];
    const occ = pick(OCCASIONS);

    // Scene 1 — batch it (counting / multiplication / division)
    const s1 = band === 0
      ? { cap: `${occ.who} just called — they need cupcakes for ${occ.for}!`, q: `They want ${trays} bags with ${per} cupcakes in each bag. How many cupcakes is that in all?`, ans: String(order), dis: [order - per, order + per, per + trays], skill: 'multiplication', why: 'Bakers group things in trays and bags every day, that\'s what times tables are for.' }
      : { cap: `📋 ${occ.who} just ordered ${order} cupcakes for ${occ.for}!`, q: `Your trays hold ${per} cupcakes each. How many full trays do you need to bake ${order}?`, ans: String(order / per), dis: [order / per + 1, order / per - 1, Math.round(order / (per / 2))], skill: 'division', why: 'Every kitchen batches food into trays, division tells you how many batches to make.' };

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
        <div class="lesson-top"><b>🧁 Gallop Bakery — Order ${st.idx + 1} of 5</b><b>💰 ${money(st.seed - st.cost + st.revenue)}</b></div>
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
        <div class="lesson-top"><b>🧁 Gallop Bakery — Order 3 of 5</b><b>💰 ${money(st.seed - st.cost)}</b></div>
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
    // Custom photo uploads were removed for child privacy — illustrated avatars only.
    const grade = (State.me.kid && State.me.kid.grade) || 0;
    const canPhoto = false;
    let photo = null;
    // Read a picked file, cover-crop to a 256px square, re-encode as JPEG (strips
    // metadata), and shrink quality until the data URL fits the server's size cap.
    function processPhoto(file) {
      return new Promise((resolve, reject) => {
        if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type || '')) return reject(new Error('Please pick a JPG, PNG, or WebP image.'));
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const S = 256, c = document.createElement('canvas'); c.width = S; c.height = S;
          const ctx = c.getContext('2d');
          const side = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
          let q = 0.82, out = c.toDataURL('image/jpeg', q);
          while (out.length > 88000 && q > 0.4) { q -= 0.12; out = c.toDataURL('image/jpeg', q); }
          resolve(out);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
        img.src = url;
      });
    }
    function isOwned(s, item) { return item.price === 0 || owned.has(s + ':' + item.id); }
    function render() {
      const preview = { avatar_config: cfg, avatar_img: photo };
      app().innerHTML = topbar(`<div class="container" style="max-width:720px">
        <div class="lesson-top"><b>🎨 Avatar Builder</b><b>🪙 ${coins} coins</b></div>
        <div class="card center" style="padding:18px">
          <div class="avatar-big" style="width:130px;height:130px;font-size:5rem;margin:0 auto">${window.BP.avatarHTML(preview)}</div>
          <p class="muted" style="margin-top:8px">Earn coins by answering questions — spend them on style! 😎</p>
          ${canPhoto ? `<div class="av-photo-row">
            <input type="file" id="av-file" accept="image/png,image/jpeg,image/webp" hidden>
            <button class="btn small ghost on-page" id="av-upload">📷 ${photo ? 'Change Photo' : 'Upload a Photo'}</button>
            ${photo ? '<button class="btn small ghost on-page" id="av-remove" style="margin-left:6px">Use built-in avatar</button>' : ''}
            <p class="muted" style="font-size:.78rem;margin-top:8px">Use a photo of yourself or anything you like — your parent can see it too. JPG, PNG, or WebP.</p>
            <p class="muted" id="av-photo-msg" style="font-size:.8rem;margin-top:4px;display:none"></p>
          </div>` : ''}
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
      // Photo upload (grade 6+): pick → re-encode on-device → save → live preview.
      const fileIn = $('#av-file'), upBtn = $('#av-upload'), rmBtn = $('#av-remove'), pmsg = $('#av-photo-msg');
      const showMsg = (t, bad) => { if (pmsg) { pmsg.textContent = t; pmsg.style.display = 'block'; pmsg.style.color = bad ? '#c0392b' : ''; } };
      if (upBtn && fileIn) {
        upBtn.onclick = () => { Sound.click(); fileIn.click(); };
        fileIn.onchange = async () => {
          const file = fileIn.files && fileIn.files[0];
          if (!file) return;
          showMsg('Processing your photo…');
          try {
            const dataUrl = await processPhoto(file);
            await api(`/play/${kidId()}/avatar/photo`, { method: 'POST', body: { dataUrl } });
            photo = dataUrl;
            if (State.me.kid) State.me.kid.avatar_img = dataUrl;
            Sound.badge(); Confetti.burst(60); render();
          } catch (e) { Sound.wrong(); showMsg(e.message || 'Could not use that image.', true); }
        };
      }
      if (rmBtn) rmBtn.onclick = async () => {
        Sound.click();
        try { await api(`/play/${kidId()}/avatar/photo/clear`, { method: 'POST', body: {} }); } catch (e) {}
        photo = null;
        if (State.me.kid) State.me.kid.avatar_img = null;
        render();
      };
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
