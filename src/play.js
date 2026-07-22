// Play Zone API — avatar shop, game tokens & scores, safe buddies + cheers
const express = require('express');
const crypto = require('crypto');
const db = require('./db');
const auth = require('./auth');

const router = express.Router();

// ---------- avatar catalog (server is source of truth for prices) ----------
const AVATAR_CATALOG = {
  base: [
    { id: 'fox', emoji: '🦊', price: 0 }, { id: 'panda', emoji: '🐼', price: 0 },
    { id: 'dragon', emoji: '🐉', price: 0 }, { id: 'unicorn', emoji: '🦄', price: 0 },
    { id: 'robot', emoji: '🤖', price: 0 }, { id: 'astronaut', emoji: '🧑‍🚀', price: 0 },
    { id: 'tiger', emoji: '🐯', price: 0 }, { id: 'octopus', emoji: '🐙', price: 0 },
    { id: 'axolotl', emoji: '🦎', price: 30 }, { id: 'narwhal', emoji: '🦭', price: 30 },
    { id: 'phoenix', emoji: '🐦‍🔥', price: 60 }, { id: 'alien', emoji: '👽', price: 40 },
    { id: 'otter', emoji: '🦦', price: 70, rarity: 'epic' }, { id: 'wizard', emoji: '🧙', price: 70, rarity: 'epic' },
    { id: 'superhero', emoji: '🦸', price: 80, rarity: 'epic' }, { id: 'mermaid', emoji: '🧜‍♀️', price: 75, rarity: 'epic' },
    { id: 'trex', emoji: '🦖', price: 90, rarity: 'epic' }, { id: 'shark', emoji: '🦈', price: 65, rarity: 'rare' },
    { id: 'wolf', emoji: '🐺', price: 55, rarity: 'rare' }, { id: 'lion', emoji: '🦁', price: 55, rarity: 'rare' },
    { id: 'genie', emoji: '🧞', price: 120, rarity: 'legendary' }, { id: 'dragonlord', emoji: '🐲', price: 150, rarity: 'legendary' },
    { id: 'fairy', emoji: '🧚', price: 180, rarity: 'legendary' }, { id: 'merking', emoji: '🧜‍♂️', price: 200, rarity: 'legendary' },
    // People characters (cartoon-style)
    { id: 'princess', emoji: '👸', price: 40 }, { id: 'prince', emoji: '🤴', price: 40 },
    { id: 'artist', emoji: '🧑‍🎨', price: 35 }, { id: 'chef', emoji: '🧑‍🍳', price: 35 },
    { id: 'detective', emoji: '🕵️', price: 45, rarity: 'rare' }, { id: 'captain', emoji: '🧑‍✈️', price: 45, rarity: 'rare' },
    { id: 'rockstar', emoji: '🧑‍🎤', price: 50, rarity: 'rare' }, { id: 'scientist', emoji: '🧑‍🔬', price: 40 },
    { id: 'cowgirl', emoji: '🤠', price: 35 }, { id: 'farmer', emoji: '🧑‍🌾', price: 35 },
    { id: 'elf', emoji: '🧝', price: 60, rarity: 'epic' }, { id: 'vampire', emoji: '🧛', price: 65, rarity: 'epic' },
    // Cute cartoon animals
    { id: 'monkey', emoji: '🐵', price: 20 }, { id: 'rabbit', emoji: '🐰', price: 20 },
    { id: 'koala', emoji: '🐨', price: 25 }, { id: 'pig', emoji: '🐷', price: 20 },
    { id: 'frog', emoji: '🐸', price: 20 }, { id: 'cow', emoji: '🐮', price: 20 },
    { id: 'chick', emoji: '🐤', price: 15 }, { id: 'penguin', emoji: '🐧', price: 25 },
    { id: 'bear', emoji: '🐻', price: 25 }, { id: 'hamster', emoji: '🐹', price: 20 },
    { id: 'owl', emoji: '🦉', price: 30, rarity: 'rare' }, { id: 'hedgehog', emoji: '🦔', price: 30, rarity: 'rare' }
  ],
  hat: [
    { id: 'none', emoji: '', price: 0 }, { id: 'crown', emoji: '👑', price: 25 },
    { id: 'tophat', emoji: '🎩', price: 15 }, { id: 'cap', emoji: '🧢', price: 10 },
    { id: 'party', emoji: '🥳', price: 15 }, { id: 'grad', emoji: '🎓', price: 20 },
    { id: 'cowboy', emoji: '🤠', price: 15 }, { id: 'halo', emoji: '😇', price: 30 },
    { id: 'headphones', emoji: '🎧', price: 20 }, { id: 'flower', emoji: '🌺', price: 15 },
    { id: 'helmet', emoji: '⛑️', price: 15 }, { id: 'santa', emoji: '🎅', price: 30 },
    { id: 'headband', emoji: '🎽', price: 40, rarity: 'rare' }, { id: 'explorer', emoji: '🧭', price: 45, rarity: 'rare' },
    { id: 'wizardhat', emoji: '🧙‍♂️', price: 55, rarity: 'epic' }, { id: 'firecrown', emoji: '🔥', price: 90, rarity: 'legendary' },
    { id: 'rainbowhalo', emoji: '🌈', price: 100, rarity: 'legendary' }
  ],
  accessory: [
    { id: 'none', emoji: '', price: 0 }, { id: 'glasses', emoji: '👓', price: 10 },
    { id: 'sunglasses', emoji: '🕶️', price: 15 }, { id: 'bowtie', emoji: '🎀', price: 10 },
    { id: 'medal', emoji: '🏅', price: 20 }, { id: 'guitar', emoji: '🎸', price: 25 },
    { id: 'wand', emoji: '🪄', price: 25 }, { id: 'skateboard', emoji: '🛹', price: 20 },
    { id: 'trophy', emoji: '🏆', price: 35 }, { id: 'books', emoji: '📚', price: 15 },
    { id: 'soccer', emoji: '⚽', price: 15 }, { id: 'controller', emoji: '🎮', price: 25 },
    { id: 'kite', emoji: '🪁', price: 55, rarity: 'epic' }, { id: 'backpack', emoji: '🎒', price: 45, rarity: 'rare' },
    { id: 'jetpack', emoji: '🚀', price: 70, rarity: 'epic' }, { id: 'crystalball', emoji: '🔮', price: 60, rarity: 'epic' },
    { id: 'lightning', emoji: '⚡', price: 100, rarity: 'legendary' }, { id: 'diamond', emoji: '💎', price: 120, rarity: 'legendary' }
  ],
  bg: [
    { id: 'purple', emoji: '💜', price: 0 }, { id: 'rainbow', emoji: '🌈', price: 20 },
    { id: 'space', emoji: '🌌', price: 25 }, { id: 'beach', emoji: '🏖️', price: 20 },
    { id: 'castle', emoji: '🏰', price: 30 }, { id: 'volcano', emoji: '🌋', price: 30 },
    { id: 'city', emoji: '🌆', price: 20 }, { id: 'garden', emoji: '🌻', price: 15 },
    { id: 'sunset', emoji: '🌅', price: 20 }, { id: 'winter', emoji: '❄️', price: 25 },
    { id: 'spooky', emoji: '🎃', price: 30 }, { id: 'holiday', emoji: '🎄', price: 30 },
    { id: 'galaxy', emoji: '🌠', price: 50, rarity: 'epic' }, { id: 'aurora', emoji: '🌌', price: 60, rarity: 'epic' },
    { id: 'underwater', emoji: '🐠', price: 45, rarity: 'rare' }, { id: 'dragonlair', emoji: '🐉', price: 90, rarity: 'legendary' },
    { id: 'rainbowroad', emoji: '🌈', price: 100, rarity: 'legendary' }
  ],
  pet: [
    { id: 'none', emoji: '', price: 0 }, { id: 'pup', emoji: '🐶', price: 30 },
    { id: 'kitten', emoji: '🐱', price: 30 }, { id: 'bunny', emoji: '🐰', price: 25 },
    { id: 'turtle', emoji: '🐢', price: 25 }, { id: 'butterfly', emoji: '🦋', price: 20 },
    { id: 'dino', emoji: '🦕', price: 40 }, { id: 'sloth', emoji: '🦥', price: 35 },
    { id: 'owl', emoji: '🦉', price: 30 }, { id: 'hamster', emoji: '🐹', price: 25 },
    { id: 'parrot', emoji: '🦜', price: 30 }, { id: 'pony', emoji: '🐴', price: 45 },
    { id: 'babydragon', emoji: '🐲', price: 70, rarity: 'epic' }, { id: 'foxkit', emoji: '🦊', price: 40, rarity: 'rare' },
    { id: 'penguin', emoji: '🐧', price: 35, rarity: 'rare' }, { id: 'unicornpet', emoji: '🦄', price: 90, rarity: 'legendary' },
    { id: 'phoenixpet', emoji: '🔥', price: 110, rarity: 'legendary' }
  ]
};
const CHEER_LIST = [
  { id: 'fire', text: 'You’re on fire! 🔥' }, { id: 'fantastico', text: '¡Fantástico! 🌎' },
  { id: 'brain', text: 'Big brain energy! 🧠' }, { id: 'star', text: 'Superstar! ⭐' },
  { id: 'rocket', text: 'To the moon! 🚀' }, { id: 'clap', text: 'Amazing streak! 👏' },
  { id: 'race', text: 'On to the next badge! ⚡' }, { id: 'hi', text: 'Hi from your buddy! 👋' }
];
const GAMES = ['bakery', 'memory', 'wordsearch', 'code', 'art', 'lemonade', 'market', 'blitz'];
const GAME_NAMES = { bakery: 'Bakery Quest', memory: 'Memory Match', wordsearch: 'Word Search', code: 'Code Quest', room: 'Room Designer', art: 'Art Studio', lemonade: 'Lemonade Tycoon', market: 'Market Mogul', blitz: 'Lightning Round' };

// Seasonal items appear only in their season (scarcity keeps the shop fresh);
// once owned, they're yours forever.
const SEASONS = { spooky: [9, 10], holiday: [11, 12], santa: [11, 12], winter: [12, 1, 2] };
function inSeason(id) {
  const s = SEASONS[id];
  if (!s) return true;
  return s.includes(new Date().getMonth() + 1);
}
function catalogFor(ownedSet) {
  const out = {};
  for (const slot of Object.keys(AVATAR_CATALOG)) {
    out[slot] = AVATAR_CATALOG[slot]
      .filter(i => inSeason(i.id) || ownedSet.has(slot + ':' + i.id))
      .map(i => SEASONS[i.id] ? { ...i, seasonal: true } : i);
  }
  return out;
}

function itemFor(slot, id) { return (AVATAR_CATALOG[slot] || []).find(i => i.id === id) || null; }

// ---------- Snack Shack & Vending Machine ----------
// Two coin sinks kids love: the Vending Machine (quick, cheap treats) and the
// Snack Shack (fancier, pricier goodies). Buying = a little collectible reward.
const SNACKS = {
  vending: [
    { id: 'chips', emoji: '🥔', name: 'Chips', price: 5 },
    { id: 'soda', emoji: '🥤', name: 'Fizzy Pop', price: 5 },
    { id: 'candy', emoji: '🍬', name: 'Candy', price: 4 },
    { id: 'choco', emoji: '🍫', name: 'Chocolate Bar', price: 6 },
    { id: 'pretzel', emoji: '🥨', name: 'Pretzel', price: 5 },
    { id: 'gum', emoji: '🍥', name: 'Bubble Gum', price: 3 },
    { id: 'cookie', emoji: '🍪', name: 'Cookie', price: 6 },
    { id: 'popcorn', emoji: '🍿', name: 'Popcorn', price: 7 },
    { id: 'lolli', emoji: '🍭', name: 'Lollipop', price: 4 },
    { id: 'juice', emoji: '🧃', name: 'Juice Box', price: 5 },
    { id: 'cracker', emoji: '🧀', name: 'Cheese Crackers', price: 6 },
    { id: 'water', emoji: '💧', name: 'Water', price: 2 },
    { id: 'grapes', emoji: '🍇', name: 'Grapes', price: 5 },
    { id: 'banana', emoji: '🍌', name: 'Banana', price: 4 },
    { id: 'apple', emoji: '🍏', name: 'Green Apple', price: 4 },
    { id: 'strawberry', emoji: '🍓', name: 'Strawberries', price: 6 },
    { id: 'rainbowpop', emoji: '🌈', name: 'Rainbow Pop', price: 8, rarity: 'rare' }
  ],
  shack: [
    { id: 'pizza', emoji: '🍕', name: 'Pizza Slice', price: 12 },
    { id: 'burger', emoji: '🍔', name: 'Burger', price: 14 },
    { id: 'fries', emoji: '🍟', name: 'Fries', price: 10 },
    { id: 'hotdog', emoji: '🌭', name: 'Hot Dog', price: 11 },
    { id: 'taco', emoji: '🌮', name: 'Taco', price: 12 },
    { id: 'icecream', emoji: '🍦', name: 'Ice Cream', price: 10 },
    { id: 'donut', emoji: '🍩', name: 'Donut', price: 9 },
    { id: 'cupcake', emoji: '🧁', name: 'Cupcake', price: 10 },
    { id: 'pancakes', emoji: '🥞', name: 'Pancakes', price: 13 },
    { id: 'sushi', emoji: '🍣', name: 'Sushi', price: 16, rarity: 'rare' },
    { id: 'ramen', emoji: '🍜', name: 'Ramen Bowl', price: 15, rarity: 'rare' },
    { id: 'pretzelbig', emoji: '🥐', name: 'Croissant', price: 11 },
    { id: 'shake', emoji: '🥤', name: 'Milkshake', price: 12 },
    { id: 'nachos', emoji: '🧀', name: 'Nachos', price: 13 },
    { id: 'cake', emoji: '🍰', name: 'Cake Slice', price: 14 },
    { id: 'watermelon', emoji: '🍉', name: 'Watermelon', price: 11 },
    { id: 'pie', emoji: '🥧', name: 'Fruit Pie', price: 12 },
    { id: 'burrito', emoji: '🌯', name: 'Burrito', price: 13 },
    { id: 'feast', emoji: '🍱', name: 'Bento Feast', price: 25, rarity: 'epic' },
    { id: 'sundae', emoji: '🍨', name: 'Giant Sundae', price: 30, rarity: 'epic' },
    { id: 'birthdaycake', emoji: '🎂', name: 'Birthday Cake', price: 40, rarity: 'epic' },
    { id: 'goldapple', emoji: '🍎', name: 'Golden Apple', price: 50, rarity: 'legendary' }
  ]
};
function snackFor(machine, id) { return (SNACKS[machine] || []).find(s => s.id === id) || null; }
function kidPublic(k) {
  return {
    id: k.id, name: k.name, avatar: k.avatar, avatar_config: safeJson(k.avatar_config),
    grade: k.grade, xp: k.xp, coins: k.coins, streak: k.streak, play_tokens: k.play_tokens || 0
  };
}
function safeJson(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }

// ---------- avatar ----------
router.get('/play/:kidId/avatar', auth.requireKid, (req, res) => {
  const owned = db.prepare('SELECT item_id FROM avatar_items WHERE kid_id=?').all(req.kid.id).map(r => r.item_id);
  res.json({ catalog: catalogFor(new Set(owned)), owned, config: safeJson(req.kid.avatar_config) || {}, coins: req.kid.coins });
});

router.post('/play/:kidId/avatar/buy', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { slot, itemId } = req.body || {};
  const item = itemFor(slot, itemId);
  if (!item) return res.status(400).json({ error: 'Unknown item' });
  if (!inSeason(item.id)) return res.status(400).json({ error: 'That item is out of season — it returns later in the year! ⏳' });
  const key = slot + ':' + itemId;
  const owned = db.prepare('SELECT 1 FROM avatar_items WHERE kid_id=? AND item_id=?').get(req.kid.id, key);
  if (owned) return res.json({ ok: true, alreadyOwned: true });
  const kid = db.prepare('SELECT coins FROM kids WHERE id=?').get(req.kid.id);
  if (kid.coins < item.price) return res.status(400).json({ error: `Need ${item.price - kid.coins} more coins — keep learning! 🪙` });
  db.prepare('UPDATE kids SET coins = coins - ? WHERE id=?').run(item.price, req.kid.id);
  db.prepare('INSERT INTO avatar_items (kid_id, item_id) VALUES (?,?)').run(req.kid.id, key);
  res.json({ ok: true, coins: kid.coins - item.price });
});

router.post('/play/:kidId/avatar/equip', auth.requireKid, (req, res) => {
  const cfg = req.body && req.body.config;
  if (!cfg || typeof cfg !== 'object') return res.status(400).json({ error: 'Bad config' });
  const clean = {};
  for (const slot of Object.keys(AVATAR_CATALOG)) {
    const id = cfg[slot];
    if (!id) continue;
    const item = itemFor(slot, id);
    if (!item) continue;
    if (item.price > 0) {
      const owned = db.prepare('SELECT 1 FROM avatar_items WHERE kid_id=? AND item_id=?').get(req.kid.id, slot + ':' + id);
      if (!owned) continue; // can't equip what you don't own
    }
    clean[slot] = id;
  }
  db.prepare('UPDATE kids SET avatar_config=?, avatar=COALESCE(?, avatar) WHERE id=?')
    .run(JSON.stringify(clean), clean.base || null, req.kid.id);
  res.json({ ok: true, config: clean });
});

// ---------- snacks ----------
router.get('/play/:kidId/snacks', auth.requireKid, (req, res) => {
  const owned = {};
  for (const r of db.prepare('SELECT snack_id, qty FROM snacks WHERE kid_id=?').all(req.kid.id)) owned[r.snack_id] = r.qty;
  const kid = db.prepare('SELECT coins FROM kids WHERE id=?').get(req.kid.id);
  const totals = db.prepare('SELECT COALESCE(SUM(qty),0) AS n FROM snacks WHERE kid_id=?').get(req.kid.id).n;
  res.json({ machines: SNACKS, owned, coins: kid.coins, totalSnacks: totals });
});

router.post('/play/:kidId/snacks/buy', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { machine, snackId } = req.body || {};
  const snack = snackFor(machine, snackId);
  if (!snack) return res.status(400).json({ error: 'Unknown snack' });
  const kid = db.prepare('SELECT coins FROM kids WHERE id=?').get(req.kid.id);
  if (kid.coins < snack.price) return res.status(400).json({ error: `Need ${snack.price - kid.coins} more coins — keep learning! 🪙` });
  db.prepare('UPDATE kids SET coins = coins - ? WHERE id=?').run(snack.price, req.kid.id);
  db.prepare(`INSERT INTO snacks (kid_id, snack_id, qty, last_bought) VALUES (?,?,1,datetime('now'))
    ON CONFLICT(kid_id, snack_id) DO UPDATE SET qty = qty + 1, last_bought = datetime('now')`).run(req.kid.id, snack.id);
  const qty = db.prepare('SELECT qty FROM snacks WHERE kid_id=? AND snack_id=?').get(req.kid.id, snack.id).qty;
  res.json({ ok: true, coins: kid.coins - snack.price, snack: { ...snack, machine }, qty });
});

// ---------- games ----------
router.get('/play/:kidId/status', auth.requireKid, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=?').get(req.kid.id);
  const best = {};
  for (const g of GAMES) {
    const row = db.prepare('SELECT MAX(score) AS s, COUNT(*) AS n FROM game_scores WHERE kid_id=? AND game=?').get(kid.id, g);
    best[g] = { best: row.s || 0, plays: row.n || 0 };
  }
  res.json({ kid: kidPublic(kid), best, correctSinceToken: kid.correct_since_token || 0 });
});

// A finish-coin credit exists only for games that were actually STARTED with a token —
// stops scripted /score spam from minting coins without playing.
const _openPlays = new Map(); // `${kidId}:${game}` -> count of un-scored token spends

router.post('/play/:kidId/spend-token', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const game = String((req.body || {}).game || '');
  if (!GAMES.includes(game)) return res.status(400).json({ error: 'Unknown game' });
  const kid = db.prepare('SELECT play_tokens FROM kids WHERE id=?').get(req.kid.id);
  if ((kid.play_tokens || 0) < 1) return res.status(402).json({ error: 'no_tokens', message: 'Answer 5 questions correctly in any subject to earn a play token! 🎟️' });
  db.prepare('UPDATE kids SET play_tokens = play_tokens - 1 WHERE id=?').run(req.kid.id);
  const k = `${req.kid.id}:${game}`;
  _openPlays.set(k, Math.min(3, (_openPlays.get(k) || 0) + 1));
  res.json({ ok: true, tokensLeft: (kid.play_tokens || 0) - 1 });
});

router.post('/play/:kidId/score', auth.requireKid, (req, res) => {
  const { game, score } = req.body || {};
  if (!GAMES.includes(String(game))) return res.status(400).json({ error: 'Unknown game' });
  const s = Math.max(0, Math.min(100000, Number(score) || 0));
  db.prepare('INSERT INTO game_scores (kid_id, game, score) VALUES (?,?,?)').run(req.kid.id, game, s);
  // Small coin reward for finishing a game — but only if a token was spent to start it.
  // (In-memory: after a server restart the first finish just misses its 2 coins; harmless.)
  const pk = `${req.kid.id}:${game}`;
  const openCount = _openPlays.get(pk) || 0;
  let coins = 0;
  if (openCount > 0) {
    _openPlays.set(pk, openCount - 1);
    coins = 2;
  }
  // Did this score beat an open buddy challenge?
  const beaten = [];
  const open = db.prepare(`SELECT * FROM challenges WHERE to_kid=? AND game=? AND status='open' AND created_at > datetime('now','-7 days')`).all(req.kid.id, game);
  for (const ch of open) {
    if (s > ch.score_to_beat) {
      db.prepare("UPDATE challenges SET status='won', resolved_at=datetime('now') WHERE id=?").run(ch.id);
      coins += 5;
      const from = db.prepare('SELECT name FROM kids WHERE id=?').get(ch.from_kid);
      beaten.push({ fromName: from ? from.name : 'your buddy', scoreToBeat: ch.score_to_beat });
    }
  }
  db.prepare('UPDATE kids SET coins = coins + ? WHERE id=?').run(coins, req.kid.id);
  res.json({ ok: true, coinsEarned: coins, challengesWon: beaten });
});

// ---------- buddy challenges (safe, async, no chat) ----------
router.post('/buddies/:kidId/challenge', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { toKid, game } = req.body || {};
  if (!GAMES.includes(String(game))) return res.status(400).json({ error: 'Unknown game' });
  const [a, b] = [Math.min(req.kid.id, Number(toKid)), Math.max(req.kid.id, Number(toKid))];
  if (!db.prepare('SELECT 1 FROM buddies WHERE kid_a=? AND kid_b=?').get(a, b)) return res.status(403).json({ error: 'Not buddies' });
  const best = db.prepare('SELECT MAX(score) AS s FROM game_scores WHERE kid_id=? AND game=?').get(req.kid.id, game);
  if (!best.s) return res.status(400).json({ error: 'Play that game first to set a score to beat! 🎮' });
  const dup = db.prepare(`SELECT 1 FROM challenges WHERE from_kid=? AND to_kid=? AND game=? AND status='open' AND created_at > datetime('now','-7 days')`).get(req.kid.id, Number(toKid), game);
  if (dup) return res.status(400).json({ error: 'You already have an open challenge with them in that game!' });
  db.prepare('INSERT INTO challenges (from_kid, to_kid, game, score_to_beat) VALUES (?,?,?,?)').run(req.kid.id, Number(toKid), game, best.s);
  res.json({ ok: true, scoreToBeat: best.s });
});

// ---------- buddies (parent-gated invites, kid-safe cheers) ----------
// Parent creates an invite code for one of their kids
router.post('/buddies/invite', auth.requireParent, (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number((req.body || {}).kidId), req.parent.id);
  if (!kid) return res.status(404).json({ error: 'Learner not found' });
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  db.prepare('INSERT INTO buddy_invites (code, kid_id) VALUES (?,?)').run(code, kid.id);
  res.json({ ok: true, code });
});

// The other parent redeems the code for one of THEIR kids
router.post('/buddies/accept', auth.requireParent, (req, res) => {
  const { code, kidId } = req.body || {};
  const invite = db.prepare("SELECT * FROM buddy_invites WHERE code=? AND created_at > datetime('now','-14 days')").get(String(code || '').trim().toUpperCase());
  if (!invite) return res.status(404).json({ error: 'Invite code not found (codes last 14 days).' });
  const myKid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(Number(kidId), req.parent.id);
  if (!myKid) return res.status(404).json({ error: 'Learner not found' });
  if (myKid.id === invite.kid_id) return res.status(400).json({ error: 'A kid can’t buddy themselves! 😄' });
  const [a, b] = [Math.min(myKid.id, invite.kid_id), Math.max(myKid.id, invite.kid_id)];
  try { db.prepare('INSERT INTO buddies (kid_a, kid_b) VALUES (?,?)').run(a, b); } catch (e) { /* already buddies */ }
  db.prepare('DELETE FROM buddy_invites WHERE code=?').run(invite.code);
  const other = db.prepare('SELECT name FROM kids WHERE id=?').get(invite.kid_id);
  res.json({ ok: true, buddyName: other ? other.name : 'buddy' });
});

// ---------- Team Gallop: co-op weekly goal per buddy pair ----------
const TEAM_GOAL = 100;       // combined answers in the last 7 days
const TEAM_REWARD = 10;      // coins for EACH kid
function weekKey() { return db.prepare("SELECT strftime('%Y-%W','now') AS w").get().w; }
function teamProgress(kidId, buddyId) {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE kid_id IN (?,?) AND ts >= datetime('now','-7 days')`).get(kidId, buddyId);
  const [a, b] = [Math.min(kidId, buddyId), Math.max(kidId, buddyId)];
  const claimed = db.prepare('SELECT 1 FROM team_rewards WHERE kid_a=? AND kid_b=? AND week=?').get(a, b, weekKey());
  return { combined: row.n || 0, goal: TEAM_GOAL, reward: TEAM_REWARD, done: (row.n || 0) >= TEAM_GOAL, claimed: !!claimed };
}

router.post('/buddies/:kidId/team-claim', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const buddyId = Number((req.body || {}).buddyId);
  const [a, b] = [Math.min(req.kid.id, buddyId), Math.max(req.kid.id, buddyId)];
  if (!db.prepare('SELECT 1 FROM buddies WHERE kid_a=? AND kid_b=?').get(a, b)) return res.status(403).json({ error: 'Not buddies' });
  const t = teamProgress(req.kid.id, buddyId);
  if (!t.done) return res.status(400).json({ error: `Team goal not reached yet — ${t.combined}/${t.goal} answers this week!` });
  if (t.claimed) return res.json({ ok: true, alreadyClaimed: true });
  db.prepare('INSERT INTO team_rewards (kid_a, kid_b, week) VALUES (?,?,?)').run(a, b, weekKey());
  db.prepare('UPDATE kids SET coins = coins + ? WHERE id IN (?,?)').run(TEAM_REWARD, a, b);
  res.json({ ok: true, coinsEach: TEAM_REWARD });
});

// Kid: list buddies with friendly stats + cheer inbox
router.get('/buddies/:kidId', auth.requireKid, (req, res) => {
  const rows = db.prepare('SELECT * FROM buddies WHERE kid_a=? OR kid_b=?').all(req.kid.id, req.kid.id);
  const buddies = rows.map(r => {
    const otherId = r.kid_a === req.kid.id ? r.kid_b : r.kid_a;
    const k = db.prepare('SELECT * FROM kids WHERE id=?').get(otherId);
    if (!k) return null;
    const badges = db.prepare('SELECT COUNT(*) AS n FROM badges WHERE kid_id=?').get(otherId).n;
    return { id: k.id, name: k.name, avatar: k.avatar, avatar_config: safeJson(k.avatar_config), streak: k.streak, xp: k.xp, badges, team: teamProgress(req.kid.id, otherId) };
  }).filter(Boolean);
  const inbox = db.prepare(`SELECT c.id, c.cheer_id, c.seen, c.ts, k.name AS from_name, k.avatar AS from_avatar
    FROM cheers c JOIN kids k ON k.id = c.from_kid WHERE c.to_kid=? ORDER BY c.id DESC LIMIT 30`).all(req.kid.id);
  const incoming = db.prepare(`SELECT ch.*, k.name AS from_name FROM challenges ch JOIN kids k ON k.id=ch.from_kid
    WHERE ch.to_kid=? AND ch.status='open' AND ch.created_at > datetime('now','-7 days') ORDER BY ch.id DESC LIMIT 10`).all(req.kid.id)
    .map(c => ({ id: c.id, game: c.game, gameName: GAME_NAMES[c.game] || c.game, scoreToBeat: c.score_to_beat, fromName: c.from_name }));
  const outgoing = db.prepare(`SELECT ch.*, k.name AS to_name FROM challenges ch JOIN kids k ON k.id=ch.to_kid
    WHERE ch.from_kid=? AND ch.created_at > datetime('now','-7 days') ORDER BY ch.id DESC LIMIT 10`).all(req.kid.id)
    .map(c => ({ id: c.id, game: c.game, gameName: GAME_NAMES[c.game] || c.game, scoreToBeat: c.score_to_beat, toName: c.to_name, status: c.status }));
  res.json({ buddies, cheers: CHEER_LIST, inbox, unseen: inbox.filter(c => !c.seen).length, challenges: { incoming, outgoing }, games: GAME_NAMES });
});

router.post('/buddies/:kidId/cheer', auth.requireKid, auth.requireActiveSub, (req, res) => {
  const { toKid, cheerId } = req.body || {};
  if (!CHEER_LIST.find(c => c.id === cheerId)) return res.status(400).json({ error: 'Unknown cheer' });
  const [a, b] = [Math.min(req.kid.id, Number(toKid)), Math.max(req.kid.id, Number(toKid))];
  const linked = db.prepare('SELECT 1 FROM buddies WHERE kid_a=? AND kid_b=?').get(a, b);
  if (!linked) return res.status(403).json({ error: 'Not buddies' });
  // gentle rate limit: max 20 cheers/day per kid
  const today = db.prepare("SELECT COUNT(*) AS n FROM cheers WHERE from_kid=? AND ts > datetime('now','-1 day')").get(req.kid.id).n;
  if (today >= 20) return res.status(429).json({ error: 'You’ve sent lots of cheers today — back to learning! 😄' });
  db.prepare('INSERT INTO cheers (from_kid, to_kid, cheer_id) VALUES (?,?,?)').run(req.kid.id, Number(toKid), cheerId);
  res.json({ ok: true });
});

router.post('/buddies/:kidId/seen', auth.requireKid, (req, res) => {
  db.prepare('UPDATE cheers SET seen=1 WHERE to_kid=?').run(req.kid.id);
  res.json({ ok: true });
});

module.exports = { router, CHEER_LIST, AVATAR_CATALOG, SNACKS };
