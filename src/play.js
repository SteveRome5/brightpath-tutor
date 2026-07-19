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
    { id: 'phoenix', emoji: '🐦‍🔥', price: 60 }, { id: 'alien', emoji: '👽', price: 40 }
  ],
  hat: [
    { id: 'none', emoji: '', price: 0 }, { id: 'crown', emoji: '👑', price: 25 },
    { id: 'tophat', emoji: '🎩', price: 15 }, { id: 'cap', emoji: '🧢', price: 10 },
    { id: 'party', emoji: '🥳', price: 15 }, { id: 'grad', emoji: '🎓', price: 20 },
    { id: 'cowboy', emoji: '🤠', price: 15 }, { id: 'halo', emoji: '😇', price: 30 },
    { id: 'headphones', emoji: '🎧', price: 20 }, { id: 'flower', emoji: '🌺', price: 15 },
    { id: 'helmet', emoji: '⛑️', price: 15 }, { id: 'santa', emoji: '🎅', price: 30 }
  ],
  accessory: [
    { id: 'none', emoji: '', price: 0 }, { id: 'glasses', emoji: '👓', price: 10 },
    { id: 'sunglasses', emoji: '🕶️', price: 15 }, { id: 'bowtie', emoji: '🎀', price: 10 },
    { id: 'medal', emoji: '🏅', price: 20 }, { id: 'guitar', emoji: '🎸', price: 25 },
    { id: 'wand', emoji: '🪄', price: 25 }, { id: 'skateboard', emoji: '🛹', price: 20 },
    { id: 'trophy', emoji: '🏆', price: 35 }, { id: 'books', emoji: '📚', price: 15 },
    { id: 'soccer', emoji: '⚽', price: 15 }, { id: 'controller', emoji: '🎮', price: 25 }
  ],
  bg: [
    { id: 'purple', emoji: '💜', price: 0 }, { id: 'rainbow', emoji: '🌈', price: 20 },
    { id: 'space', emoji: '🌌', price: 25 }, { id: 'beach', emoji: '🏖️', price: 20 },
    { id: 'castle', emoji: '🏰', price: 30 }, { id: 'volcano', emoji: '🌋', price: 30 },
    { id: 'city', emoji: '🌆', price: 20 }, { id: 'garden', emoji: '🌻', price: 15 },
    { id: 'sunset', emoji: '🌅', price: 20 }, { id: 'winter', emoji: '❄️', price: 25 },
    { id: 'spooky', emoji: '🎃', price: 30 }, { id: 'holiday', emoji: '🎄', price: 30 }
  ],
  pet: [
    { id: 'none', emoji: '', price: 0 }, { id: 'pup', emoji: '🐶', price: 30 },
    { id: 'kitten', emoji: '🐱', price: 30 }, { id: 'bunny', emoji: '🐰', price: 25 },
    { id: 'turtle', emoji: '🐢', price: 25 }, { id: 'butterfly', emoji: '🦋', price: 20 },
    { id: 'dino', emoji: '🦕', price: 40 }, { id: 'sloth', emoji: '🦥', price: 35 },
    { id: 'owl', emoji: '🦉', price: 30 }, { id: 'hamster', emoji: '🐹', price: 25 },
    { id: 'parrot', emoji: '🦜', price: 30 }, { id: 'pony', emoji: '🐴', price: 45 }
  ]
};
const CHEER_LIST = [
  { id: 'fire', text: 'You’re on fire! 🔥' }, { id: 'fantastico', text: '¡Fantástico! 🌎' },
  { id: 'brain', text: 'Big brain energy! 🧠' }, { id: 'star', text: 'Superstar! ⭐' },
  { id: 'rocket', text: 'To the moon! 🚀' }, { id: 'clap', text: 'Amazing streak! 👏' },
  { id: 'race', text: 'Race you to the next badge! 🏁' }, { id: 'hi', text: 'Hi from your buddy! 👋' }
];
const GAMES = ['memory', 'wordsearch', 'code', 'room', 'art', 'lemonade', 'market', 'blitz'];
const GAME_NAMES = { memory: 'Memory Match', wordsearch: 'Word Search', code: 'Code Quest', room: 'Room Designer', art: 'Art Studio', lemonade: 'Lemonade Tycoon', market: 'Market Mogul', blitz: 'Lightning Round' };

function itemFor(slot, id) { return (AVATAR_CATALOG[slot] || []).find(i => i.id === id) || null; }
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
  res.json({ catalog: AVATAR_CATALOG, owned, config: safeJson(req.kid.avatar_config) || {}, coins: req.kid.coins });
});

router.post('/play/:kidId/avatar/buy', auth.requireKid, (req, res) => {
  const { slot, itemId } = req.body || {};
  const item = itemFor(slot, itemId);
  if (!item) return res.status(400).json({ error: 'Unknown item' });
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

router.post('/play/:kidId/spend-token', auth.requireKid, (req, res) => {
  const game = String((req.body || {}).game || '');
  if (!GAMES.includes(game)) return res.status(400).json({ error: 'Unknown game' });
  const kid = db.prepare('SELECT play_tokens FROM kids WHERE id=?').get(req.kid.id);
  if ((kid.play_tokens || 0) < 1) return res.status(402).json({ error: 'no_tokens', message: 'Answer 5 questions correctly in any subject to earn a play token! 🎟️' });
  db.prepare('UPDATE kids SET play_tokens = play_tokens - 1 WHERE id=?').run(req.kid.id);
  res.json({ ok: true, tokensLeft: (kid.play_tokens || 0) - 1 });
});

router.post('/play/:kidId/score', auth.requireKid, (req, res) => {
  const { game, score } = req.body || {};
  if (!GAMES.includes(String(game))) return res.status(400).json({ error: 'Unknown game' });
  const s = Math.max(0, Math.min(100000, Number(score) || 0));
  db.prepare('INSERT INTO game_scores (kid_id, game, score) VALUES (?,?,?)').run(req.kid.id, game, s);
  // small coin reward for finishing a game (not enough to beat lessons!)
  let coins = 2;
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
router.post('/buddies/:kidId/challenge', auth.requireKid, (req, res) => {
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

router.post('/buddies/:kidId/team-claim', auth.requireKid, (req, res) => {
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

router.post('/buddies/:kidId/cheer', auth.requireKid, (req, res) => {
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

module.exports = { router, CHEER_LIST, AVATAR_CATALOG };
