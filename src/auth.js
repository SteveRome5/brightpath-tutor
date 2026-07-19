// Auth — parent accounts (email+password) and kid profiles (avatar + 4-digit PIN)
const crypto = require('crypto');
const db = require('./db');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createParent(email, name, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  // trial_ends set explicitly (7-day trial) — existing DBs may carry an old schema default
  const info = db.prepare("INSERT INTO parents (email, name, password_hash, salt, trial_ends) VALUES (?,?,?,?, datetime('now', '+7 days'))")
    .run(email.toLowerCase().trim(), name.trim(), hash, salt);
  return info.lastInsertRowid;
}

function verifyParent(email, password) {
  const p = db.prepare('SELECT * FROM parents WHERE email=?').get(email.toLowerCase().trim());
  if (!p) return null;
  const hash = hashPassword(password, p.salt);
  const ok = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(p.password_hash));
  return ok ? p : null;
}

function createSession(kind, refId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, kind, ref_id) VALUES (?,?,?)').run(token, kind, refId);
  return token;
}

function getSession(token) {
  if (!token) return null;
  return db.prepare('SELECT * FROM sessions WHERE token=?').get(token) || null;
}

function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(token);
}

// Express middleware
function requireParent(req, res, next) {
  const s = getSession(req.cookies.bp_session);
  if (!s || s.kind !== 'parent') return res.status(401).json({ error: 'Not signed in' });
  req.parent = db.prepare('SELECT * FROM parents WHERE id=?').get(s.ref_id);
  if (!req.parent) return res.status(401).json({ error: 'Account not found' });
  next();
}

function requireKid(req, res, next) {
  const s = getSession(req.cookies.bp_session);
  if (s && s.kind === 'kid') {
    req.kid = db.prepare('SELECT * FROM kids WHERE id=?').get(s.ref_id);
    if (req.kid) return next();
  }
  // Parents may act on behalf of their kids (e.g., preview mode)
  if (s && s.kind === 'parent') {
    const kidId = Number(req.params.kidId || req.body.kidId || req.query.kidId);
    if (kidId) {
      const kid = db.prepare('SELECT * FROM kids WHERE id=? AND parent_id=?').get(kidId, s.ref_id);
      if (kid) { req.kid = kid; return next(); }
    }
  }
  return res.status(401).json({ error: 'Not signed in as a learner' });
}

// Subscription gate — trial or active lets you through
function requireActiveSub(req, res, next) {
  let parent = req.parent;
  if (!parent && req.kid) parent = db.prepare('SELECT * FROM parents WHERE id=?').get(req.kid.parent_id);
  if (!parent) return res.status(401).json({ error: 'No account' });
  const trialOk = parent.sub_status === 'trial' && new Date(parent.trial_ends + 'Z') > new Date();
  if (parent.sub_status === 'active' || trialOk) return next();
  return res.status(402).json({ error: 'subscription_required', message: 'Your free trial has ended. Subscribe to keep learning!' });
}

module.exports = { createParent, verifyParent, createSession, getSession, destroySession, requireParent, requireKid, requireActiveSub };
