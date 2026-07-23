// Gallop Learning Academy — inbound support@ auto-responder.
//
// Polls the support@ mailbox over IMAP, and for each NEW parent email runs it through
// the same AI brain (src/support.js): safe questions get an auto-reply from support@,
// anything sensitive (refunds, cancellations, billing, complaints, legal, safety) is
// escalated to the admin dashboard with a one-click draft — never auto-sent.
//
// Dormant until SUPPORT_IMAP_USER + SUPPORT_IMAP_PASSWORD are set (a Google app password),
// so deploying this changes nothing until the mailbox is connected. Runs from a timer in
// server.js. The mail libraries are lazy-required so the app always boots even if they're
// somehow unavailable.
//
// SAFETY: inbound email is untrusted content. support.js forbids the model from following
// instructions inside a message or taking any account/billing action, and auto-send fires
// only for non-sensitive questions answered confidently. Loop/junk guards below stop us
// replying to ourselves, to no-reply addresses, to bounces, or to autoresponders.
const db = require('./db');
const support = require('./support');
const mailer = require('./mailer');

const HOST = process.env.SUPPORT_IMAP_HOST || 'imap.gmail.com';
const PORT = parseInt(process.env.SUPPORT_IMAP_PORT || '993', 10);
const USER = process.env.SUPPORT_IMAP_USER || '';
const PASS = process.env.SUPPORT_IMAP_PASSWORD || '';
const MAX_PER_RUN = parseInt(process.env.SUPPORT_IMAP_BATCH || '20', 10);

const configured = () => !!(USER && PASS);
let running = false;

// Strip quoted reply history / forwarded blocks so the AI sees only the new message.
function stripQuoted(text) {
  const lines = String(text || '').split(/\r?\n/);
  const out = [];
  for (const ln of lines) {
    if (/^\s*>/.test(ln)) break;
    if (/^\s*On .+wrote:\s*$/.test(ln)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(ln)) break;
    if (/^_{5,}\s*$/.test(ln)) break;
    if (/^\s*From:\s.+@/.test(ln)) break;
    out.push(ln);
  }
  return out.join('\n').trim();
}

function isJunkSender(email) {
  return /(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notification|noreply)/i.test(email);
}

// Parse a raw From header ("Jane Parent <jane@example.com>" or "jane@example.com")
// into { email, name }. Used by the webhook path (Apps Script sends the raw header).
function parseFrom(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(.*?)<([^>]+)>\s*$/);
  if (m) return { name: m[1].replace(/(^["'\s]+|["'\s]+$)/g, '').trim(), email: m[2].trim().toLowerCase() };
  return { name: '', email: s.toLowerCase() };
}

// Core: process ONE inbound support message. Shared by the IMAP poller and the Apps
// Script webhook. Returns { action: 'auto_sent'|'escalated'|'skipped', reason? } and
// performs the send/escalation. Callers handle marking the source message read.
async function processInbound({ fromEmail, fromName, subject, body, messageId }) {
  fromEmail = String(fromEmail || '').toLowerCase();
  subject = String(subject || '').slice(0, 300);
  messageId = String(messageId || '').slice(0, 250);
  if (!messageId) messageId = 'msg-' + Math.abs(hashStr(fromEmail + subject + (body || '').slice(0, 200)));

  if (!fromEmail) return { action: 'skipped', reason: 'no-sender' };
  if (isJunkSender(fromEmail)) return { action: 'skipped', reason: 'junk-sender' };
  if (/@learnwithgallop\.com$/i.test(fromEmail)) return { action: 'skipped', reason: 'self' };
  if (db.prepare('SELECT id FROM support_tickets WHERE message_id=?').get(messageId)) return { action: 'skipped', reason: 'duplicate' };

  let clean = stripQuoted(body || '');
  if (!clean) clean = String(body || '').slice(0, 6000);
  clean = clean.slice(0, 6000);
  if (!clean && !subject) return { action: 'skipped', reason: 'empty' };

  const draft = await support.draftEmailReply({ fromName, subject, body: clean });
  const status = draft.autoSend ? 'auto_sent' : 'escalated';
  const info = db.prepare(
    `INSERT INTO support_tickets (source, from_email, from_name, subject, question, ai_reply, category, status, message_id, handled_at)
     VALUES ('email', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(fromEmail, fromName || '', subject, clean, draft.reply, draft.category, status, messageId, draft.autoSend ? new Date().toISOString() : null);

  if (draft.autoSend) {
    mailer.sendSupportReply(fromEmail, subject, draft.reply);
    return { action: 'auto_sent' };
  }
  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id=?').get(info.lastInsertRowid);
  mailer.sendSupportEscalation(ticket);
  return { action: 'escalated' };
}

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; }

async function handleMessage(simpleParser, client, uid, source) {
  const parsed = await simpleParser(source);
  const markSeen = async () => { try { await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true }); } catch (e) {} };
  // Skip autoresponders/newsletters/lists at the IMAP layer (the webhook path relies on
  // the Apps Script's own Gmail filters + these same guards inside processInbound).
  try {
    const h = parsed.headers;
    if (h && ((h.get('auto-submitted') && h.get('auto-submitted') !== 'no') || h.get('x-autoreply') || h.get('x-autorespond') || h.get('list-id') || h.get('list-unsubscribe'))) { await markSeen(); return; }
  } catch (e) {}
  const fromObj = parsed.from && parsed.from.value && parsed.from.value[0];
  await processInbound({
    fromEmail: fromObj ? fromObj.address : '',
    fromName: fromObj ? (fromObj.name || '') : '',
    subject: parsed.subject || '',
    body: parsed.text || '',
    messageId: parsed.messageId || ('uid-' + uid)
  });
  await markSeen();
}

async function pollOnce() {
  if (!configured() || running) return;
  running = true;
  let ImapFlow, simpleParser;
  try { ({ ImapFlow } = require('imapflow')); ({ simpleParser } = require('mailparser')); }
  catch (e) { console.error('[inbound] mail libraries unavailable:', e.message); running = false; return; }

  const client = new ImapFlow({ host: HOST, port: PORT, secure: true, auth: { user: USER, pass: PASS }, logger: false, emitLogs: false });
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = await client.search({ seen: false }, { uid: true });
      const batch = (uids || []).slice(0, MAX_PER_RUN);
      for (const uid of batch) {
        try {
          const msg = await client.fetchOne(uid, { source: true }, { uid: true });
          if (msg && msg.source) await handleMessage(simpleParser, client, uid, msg.source);
        } catch (e) { console.error('[inbound] message', uid, 'error:', e.message); }
      }
      if ((uids || []).length > MAX_PER_RUN) console.log(`[inbound] processed ${MAX_PER_RUN} of ${uids.length} unseen; rest next run`);
    } finally { lock.release(); }
  } catch (e) {
    console.error('[inbound] poll error:', e.message);
  } finally {
    try { await client.logout(); } catch (e) {}
    running = false;
  }
}

// Webhook-connected? (Apps Script bridge — the Workspace-friendly path when IMAP app
// passwords aren't available.)
const webhookConfigured = () => !!process.env.SUPPORT_INBOUND_TOKEN;

module.exports = { pollOnce, configured, webhookConfigured, processInbound, parseFrom };
