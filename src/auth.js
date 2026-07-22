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
  if (ok) syncAdminFlag(p);
  return ok ? p : null;
}

// The account whose email matches ADMIN_EMAIL (env) is the owner/admin.
function syncAdminFlag(p) {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  if (adminEmail && p.email === adminEmail && !p.is_admin) {
    db.prepare('UPDATE parents SET is_admin=1 WHERE id=?').run(p.id);
    p.is_admin = 1;
  }
}

function requireAdmin(req, res, next) {
  const s = getSession(req.cookies.bp_session);
  if (!s || s.kind !== 'parent') return res.status(401).json({ error: 'Not signed in' });
  const p = db.prepare('SELECT * FROM parents WHERE id=?').get(s.ref_id);
  if (!p) return res.status(401).json({ error: 'Account not found' });
  syncAdminFlag(p);
  if (!p.is_admin) return res.status(403).json({ error: 'Admin access only' });
  req.parent = p;
  next();
}

// Child PINs are hashed at rest (salted scrypt) so a DB/backup leak does not hand over
// usable child logins. verifyPin transparently accepts legacy plaintext PINs so existing
// accounts keep working; callers upgrade them to a hash on the next successful login.
function hashPin(pin) {
  const salt = crypto.randomBytes(8).toString('hex');
  const h = crypto.scryptSync(String(pin), salt, 32).toString('hex');
  return `s2$${salt}$${h}`;
}
function verifyPin(pin, stored) {
  if (stored == null) return false;
  const s = String(stored);
  if (s.startsWith('s2$')) {
    const parts = s.split('$');
    if (parts.length !== 3) return false;
    const cand = crypto.scryptSync(String(pin), parts[1], 32).toString('hex');
    const a = Buffer.from(cand), b = Buffer.from(parts[2]);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return s === String(pin); // legacy plaintext
}
function isLegacyPin(stored) { return stored != null && !String(stored).startsWith('s2$'); }

function setPassword(parentId, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.prepare('UPDATE parents SET password_hash=?, salt=? WHERE id=?').run(hash, salt, parentId);
}

function createSession(kind, refId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, kind, ref_id) VALUES (?,?,?)').run(token, kind, refId);
  return token;
}

// Absolute session lifetimes. A leaked/stale token should not be valid forever,
// especially on the shared family devices kids use.
const SESSION_TTL_DAYS = { parent: 90, kid: 30 };
function getSession(token) {
  if (!token) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token=?').get(token);
  if (!s) return null;
  const ttl = SESSION_TTL_DAYS[s.kind] || 30;
  // created_at is stored as UTC "YYYY-MM-DD HH:MM:SS"; append Z so it parses as UTC.
  const created = s.created_at ? new Date(s.created_at.replace(' ', 'T') + 'Z') : null;
  if (created && !isNaN(created) && (Date.now() - created.getTime()) > ttl * 86400000) {
    db.prepare('DELETE FROM sessions WHERE token=?').run(token);
    return null;
  }
  return s;
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

// Single source of truth for "can this account access paid content, and if not, WHY".
// Both the API gate (below) and any surface that renders access state should derive
// from this so the parent dashboard and the child paywall never disagree (a past-due
// parent must not see the child told "your free trial ended").
function entitlement(parent) {
  if (!parent) return { ok: false, reason: 'no_account', message: 'No account found.' };
  const trialOk = parent.sub_status === 'trial' && new Date(parent.trial_ends + 'Z') > new Date();
  if (parent.sub_status === 'active' || trialOk) return { ok: true, reason: 'active', message: '' };
  // Not entitled — name the exact reason so every surface can speak to it honestly.
  if (parent.sub_status === 'past_due') return { ok: false, reason: 'past_due', message: "There's a problem with the payment on this account. Ask a grown-up to update it to keep learning!" };
  if (parent.sub_status === 'canceled') return { ok: false, reason: 'canceled', message: 'This subscription was canceled. Ask a grown-up to reactivate it to keep learning!' };
  if (parent.sub_status === 'trial') return { ok: false, reason: 'trial_expired', message: 'The free trial has ended. Ask a grown-up to subscribe to keep learning!' };
  return { ok: false, reason: 'no_subscription', message: 'A subscription is needed to keep learning. Ask a grown-up to help!' };
}

// Subscription gate — trial or active lets you through
function requireActiveSub(req, res, next) {
  let parent = req.parent;
  if (!parent && req.kid) parent = db.prepare('SELECT * FROM parents WHERE id=?').get(req.kid.parent_id);
  if (!parent) return res.status(401).json({ error: 'No account' });
  const ent = entitlement(parent);
  if (ent.ok) return next();
  return res.status(402).json({ error: 'subscription_required', reason: ent.reason, message: ent.message });
}

module.exports = { createParent, verifyParent, setPassword, hashPin, verifyPin, isLegacyPin, createSession, getSession, destroySession, requireParent, requireKid, requireActiveSub, requireAdmin, syncAdminFlag, entitlement };
