// Gallop Learning Academy — transactional & lifecycle email.
//
// Provider: Resend (https://resend.com) via plain HTTPS — zero new dependencies.
// Configure with:
//   RESEND_API_KEY  = re_...            (required to actually send)
//   EMAIL_FROM      = "Gallop Learning Academy <support@learnwithgallop.com>" (default)
//   EMAIL_REPLY_TO  = support@learnwithgallop.com (default) — where replies land
//   APP_ORIGIN      = https://learnwithgallop.com (default)
//
// All client-facing mail (welcome, receipt, password reset, weekly report, nudges)
// sends FROM support@ and replies route to support@ so correspondence lands in the
// support mailbox. lin@ is the admin account (owns Resend/Render), not a from-address.
//
// Without RESEND_API_KEY every email is written to email_log with status 'queued'
// (a visible outbox, nothing silently lost) and the app behaves normally. Every
// send path is fire-and-forget with try/catch: email must NEVER break signup,
// checkout, or learning.
const https = require('https');
const crypto = require('crypto');
const db = require('./db');

const KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.EMAIL_FROM || 'Gallop Learning Academy <support@learnwithgallop.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@learnwithgallop.com';
const ORIGIN = process.env.APP_ORIGIN || 'https://learnwithgallop.com';

const configured = () => !!KEY;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// Bulk sends must stay under Resend's 10 requests/second cap, or the whole batch 429s and
// fails silently. ~180ms between sends ≈ 5-6/sec leaves headroom.
const SEND_GAP_MS = 180;

function unsubTokenFor(parentId) {
  const row = db.prepare('SELECT unsub_token FROM parents WHERE id=?').get(parentId);
  if (row && row.unsub_token) return row.unsub_token;
  const t = crypto.randomBytes(18).toString('hex');
  db.prepare('UPDATE parents SET unsub_token=? WHERE id=?').run(t, parentId);
  return t;
}

// ---------- shared layout ----------
const BRAND = '#1A5C38', GOLD = '#C9A84C';
function layout(bodyHtml, { unsubToken } = {}) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f4ee;font-family:Georgia,'Times New Roman',serif;color:#16213a">
  <div style="max-width:560px;margin:0 auto;padding:28px 18px">
    <div style="text-align:center;padding-bottom:18px">
      <img src="${ORIGIN}/logo-full.png" alt="Gallop Learning Academy" style="height:64px;width:auto">
    </div>
    <div style="background:#ffffff;border:1px solid #e7e3d8;border-radius:16px;padding:30px 28px;line-height:1.65;font-size:16px">
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:#8a8fa0;font-size:12px;line-height:1.6;margin-top:18px;font-family:Arial,sans-serif">
      Gallop Learning Academy · adaptive K–12 tutoring · <a href="${ORIGIN}" style="color:${BRAND}">learnwithgallop.com</a><br>
      Questions? Just reply — a real person answers.${unsubToken ? `<br><a href="${ORIGIN}/api/email/unsubscribe?t=${unsubToken}" style="color:#8a8fa0">Unsubscribe from progress &amp; tips emails</a>` : ''}
    </p>
  </div></body></html>`;
}
const btn = (href, label) => `<div style="text-align:center;margin:22px 0 6px"><a href="${href}" style="background:${BRAND};color:#fff;text-decoration:none;padding:13px 30px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold;display:inline-block">${label}</a></div>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- transport ----------
function sendEmail({ to, subject, html, kind = 'generic' }) {
  return new Promise((resolve) => {
    let logId = null;
    try { logId = db.prepare('INSERT INTO email_log (to_email, kind, subject, status) VALUES (?,?,?,?)').run(to, kind, subject, KEY ? 'sending' : 'queued').lastInsertRowid; } catch (e) {}
    if (!KEY) return resolve({ queued: true });
    const payload = JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html });
    const req = https.request({
      hostname: 'api.resend.com', path: '/emails', method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 15000
    }, resp => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => {
        const ok = resp.statusCode >= 200 && resp.statusCode < 300;
        try { if (logId) db.prepare('UPDATE email_log SET status=?, detail=? WHERE id=?').run(ok ? 'sent' : 'failed', ok ? null : `HTTP ${resp.statusCode}: ${d.slice(0, 300)}`, logId); } catch (e) {}
        resolve({ sent: ok });
      });
    });
    req.on('error', err => { try { if (logId) db.prepare('UPDATE email_log SET status=?, detail=? WHERE id=?').run('failed', String(err).slice(0, 300), logId); } catch (e) {} resolve({ sent: false }); });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(payload); req.end();
  });
}

// ---------- lifecycle emails ----------
function sendWelcomeTrial(parent) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">Welcome to Gallop, ${first}! 🐎</h2>
      <p>Your 7-day free trial has started — every subject, every feature, no card needed.</p>
      <p style="margin:14px 0 6px"><b>Getting the most out of your first week:</b></p>
      <p style="margin:6px 0">1. <b>Add your child</b> from your Parent Dashboard (name, grade, and a fun 4-digit PIN).</p>
      <p style="margin:6px 0">2. <b>Let them take the placement quiz</b> — it finds their true starting level in each subject on its own.</p>
      <p style="margin:6px 0">3. <b>Watch the weekly report</b> — you'll see exactly where they're strong and where they need a hand.</p>
      <p style="margin:14px 0 0">Correct answers earn play tokens for the arcade, so practice powers the fun — that's the whole trick.</p>
      ${btn(ORIGIN + '/#parent', 'Open your dashboard')}
    `, { unsubToken: unsubTokenFor(parent.id) });
    sendEmail({ to: parent.email, subject: 'Welcome to Gallop — your free week starts now 🐎', html, kind: 'welcome_trial' });
  } catch (e) { /* email must never break signup */ }
}

function sendWelcomePaid(parent, planName) {
  try {
    if (!parent || !parent.email) return; // subscription receipts always send (transactional)
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">You're in, ${first} — thank you! 🎉</h2>
      <p>Your <b>${esc(planName || 'Gallop')}</b> subscription is active. Everything your child earned in the trial — streaks, badges, levels, certificates — carries right on.</p>
      <p>A few things worth knowing:</p>
      <p style="margin:6px 0">• <b>Weekly summary:</b> a one-page view of progress lives in your dashboard (great on the fridge).</p>
      <p style="margin:6px 0">• <b>Any device:</b> kids log in with your email + their PIN on any computer or tablet.</p>
      <p style="margin:6px 0">• <b>Billing:</b> manage or cancel anytime in one click from the dashboard.</p>
      <p style="margin:14px 0 0">We're a family business — if anything ever feels off, reply to this email and a real person will fix it.</p>
      ${btn(ORIGIN + '/#parent', 'Go to your dashboard')}
    `, { unsubToken: unsubTokenFor(parent.id) });
    sendEmail({ to: parent.email, subject: 'Your Gallop subscription is active 🎉', html, kind: 'welcome_paid' });
  } catch (e) { /* never break the webhook */ }
}

// ---------- trial conversion sequence (the "add a card before it ends" nudge) ----------
function sendTrialEnding(parent, daysLeft) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const when = daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`;
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${first}, your free trial ends ${when}</h2>
      <p>We hope this week showed you what Gallop can do for your family. To keep your child's lessons, streaks, badges, and progress going without a break, add a card before the trial ends.</p>
      <p style="margin:14px 0 6px"><b>Everything stays exactly where it is</b> — nothing your child earned is lost. It's $34/mo for one learner or $54/mo for the whole family (up to four), all four subjects included, and you can cancel in one click anytime.</p>
      ${btn(ORIGIN + '/#subscribe', 'Keep learning — choose a plan')}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">Not ready? No problem — do nothing and the trial simply ends, with no charge.</p>
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `Your Gallop free trial ends ${when}`, html, kind: 'trial_ending' });
  } catch (e) { /* never throw from the scheduler */ }
}

function sendTrialEnded(parent) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${first}, your free trial has ended</h2>
      <p>Your child's learning is paused for now — but everything they built is saved and waiting. Add a card and they pick up right where they left off, same level, same streak, same badges.</p>
      ${btn(ORIGIN + '/#subscribe', 'Reactivate in one click')}
      <p style="margin:16px 0 0">All four subjects, from $34/mo, cancel anytime. If Gallop wasn't the right fit, we'd genuinely love to know why — just reply and tell us.</p>
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: 'Your Gallop trial ended — pick up where you left off', html, kind: 'trial_ended' });
  } catch (e) { /* never throw from the scheduler */ }
}

// Sent when a child taps "email my parent to subscribe" from the paywall — recovery at the
// exact moment the trial blocks them.
function sendChildSubscribeRequest(parent, kid) {
  try {
    if (!parent || !parent.email) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kidName = esc(kid.name || 'Your child');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${kidName} wants to keep learning 🐎</h2>
      <p>Hi ${first} — ${kidName} just tried to keep going on Gallop and reached the end of your free trial. Everything they've built is saved. Add a card and they pick up right where they left off.</p>
      ${btn(ORIGIN + '/#subscribe', `Keep ${kidName} learning`)}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">All four subjects, from $34/mo, cancel anytime in one click.</p>
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `${kid.name} wants to keep learning on Gallop`, html, kind: 'child_request' });
  } catch (e) { /* never throw */ }
}

// Trial conversion sweep (called on a timer from server.js). For each trial account:
//  • when the trial has ~2 days or less left (but hasn't ended), send one "ending soon" email
//  • when the trial has ended (still on 'trial' status), send one "ended — reactivate" email
// Idempotent via email_log (each email sent at most once per account) and throttled.
async function trialSweep() {
  try {
    const parents = db.prepare("SELECT * FROM parents WHERE sub_status='trial' AND COALESCE(email_opt_out,0)=0 AND trial_ends IS NOT NULL").all();
    for (const p of parents) {
      let ends;
      try { ends = new Date(p.trial_ends.replace(' ', 'T') + 'Z'); } catch (e) { continue; }
      if (isNaN(ends)) continue;
      const msLeft = ends.getTime() - Date.now();
      const daysLeft = msLeft / 86400000;
      let sentSomething = false;
      if (msLeft <= 0) {
        const already = db.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind='trial_ended' AND status='sent' LIMIT 1").get(p.email);
        if (!already) { await sendTrialEnded(p); sentSomething = true; }
      } else if (daysLeft <= 2) {
        const already = db.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind='trial_ending' AND status='sent' LIMIT 1").get(p.email);
        if (!already) { await sendTrialEnding(p, Math.max(1, Math.round(daysLeft))); sentSomething = true; }
      }
      if (sentSomething) await sleep(SEND_GAP_MS);
    }
  } catch (e) { console.error('trialSweep error:', e.message); }
}

function sendNudge(parent, kid, daysIdle) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kidName = esc(kid.name || 'your learner');
    const streakLine = kid.streak >= 2 ? `<p style="margin:6px 0">Their <b>${kid.streak}-day streak</b> is waiting to be rescued — one quick session keeps it alive.</p>` : '';
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${kidName}'s tutor misses them 🐎</h2>
      <p>Hi ${first} — just a gentle nudge: <b>${kidName}</b> hasn't practiced in about ${daysIdle} days.</p>
      ${streakLine}
      <p style="margin:6px 0">Ten minutes is plenty. One short session keeps skills warm, and correct answers earn arcade tokens — so it rarely takes more than a reminder that the games are waiting.</p>
      ${btn(ORIGIN + '/#kid-login', `Send ${kidName} back in`)}
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `${kid.name}'s learning streak needs a quick rescue`, html, kind: 'nudge' });
  } catch (e) { /* never throw from the scheduler */ }
}

// ---------- password reset (transactional; always sends) ----------
function sendPasswordReset(parent, resetUrl) {
  try {
    if (!parent || !parent.email) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">Reset your password 🔐</h2>
      <p>Hi ${first} — we got a request to reset the password for your Gallop account.</p>
      <p>Click the button below to choose a new password. This link works once and expires in 1 hour.</p>
      ${btn(esc(resetUrl), 'Reset my password')}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>
    `);
    sendEmail({ to: parent.email, subject: 'Reset your Gallop password', html, kind: 'password_reset' });
  } catch (e) { /* never throw from an auth flow */ }
}

// ---------- weekly parent report (autonomous digest) ----------
function sendWeeklyReport(parent, summary) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kidBlocks = summary.kids.map(k => {
      const subjLines = k.subjects.map(s =>
        `<tr><td style="padding:4px 10px 4px 0;color:#16213a">${esc(s.label)}</td>
         <td style="padding:4px 0;color:#5f6b7d">${s.answers} answered · ${s.accuracy != null ? Math.round(s.accuracy * 100) + '%' : '—'}${s.delta > 0 ? ` · <span style="color:#1f8a5f">▲ +${s.delta}</span>` : ''}</td></tr>`
      ).join('');
      return `<div style="margin:14px 0;padding:14px 16px;background:#f9f7f1;border-radius:12px">
        <p style="margin:0 0 6px"><b style="color:${BRAND}">${esc(k.name)}</b> — ${k.weekAnswers} question${k.weekAnswers === 1 ? '' : 's'} this week${k.gallop != null ? ` · Gallop Score ${k.gallop}` : ''}</p>
        ${subjLines ? `<table style="border-collapse:collapse;font-size:14px">${subjLines}</table>` : '<p style="margin:0;color:#5f6b7d;font-size:14px">No practice logged this week — a quick session gets them going again.</p>'}
        ${k.focus ? `<p style="margin:8px 0 0;font-size:14px">🎯 Worth a look together: <b>${esc(k.focus)}</b></p>` : ''}
      </div>`;
    }).join('');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${first}, here's this week in learning 📊</h2>
      <p>A quick snapshot of how your ${summary.kids.length === 1 ? 'learner is' : 'learners are'} doing. The full, interactive report is always in your dashboard.</p>
      ${kidBlocks}
      ${btn(ORIGIN + '/#parent', 'Open the full report')}
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: 'Your weekly Gallop learning report 📊', html, kind: 'weekly_report' });
  } catch (e) { /* a report email must never break anything */ }
}

// ---------- lapsed-practice sweep (called hourly from server.js) ----------
// One nudge per lapse: a kid qualifies when their last activity (or account creation,
// for never-started kids) is 48h–7d old, and we haven't nudged since that activity.
async function nudgeSweep() {
  try {
    const rows = db.prepare(`
      SELECT k.id, k.name, k.streak, k.parent_id, k.last_nudge_at, k.created_at,
             (SELECT MAX(ts) FROM activity_log a WHERE a.kid_id = k.id) AS last_ts
      FROM kids k`).all();
    for (const k of rows) {
      const anchor = k.last_ts || k.created_at;
      if (!anchor) continue;
      const idleMs = Date.now() - Date.parse(anchor.replace(' ', 'T') + 'Z');
      const idleDays = idleMs / 86400000;
      if (idleDays < 2 || idleDays > 7) continue;                       // the 48h–7d window
      if (k.last_nudge_at && Date.parse(k.last_nudge_at.replace(' ', 'T') + 'Z') > Date.parse(anchor.replace(' ', 'T') + 'Z')) continue; // already nudged this lapse
      const parent = db.prepare('SELECT * FROM parents WHERE id=?').get(k.parent_id);
      if (!parent || parent.email_opt_out) continue;
      if (parent.sub_status !== 'active' && parent.sub_status !== 'trial') continue; // don't nudge lapsed/canceled accounts
      // Send first; only record the nudge if it actually went out, so a failed send retries
      // next run instead of silently burning this lapse's one nudge.
      const res = await sendNudge(parent, k, Math.round(idleDays));
      if (res && (res.sent === true || res.queued)) {
        db.prepare("UPDATE kids SET last_nudge_at=datetime('now') WHERE id=?").run(k.id);
      }
      await sleep(SEND_GAP_MS);                                          // stay under Resend's 10/sec
    }
  } catch (e) { console.error('nudgeSweep error:', e.message); }
}

// Weekly report sweep: sends each active/trial parent one digest per week, fully
// autonomously. Restart-safe and idempotent via the email_log (a parent who already has a
// 'weekly_report' logged in the last 7 days is skipped), so it can run on a frequent timer
// without ever double-sending. Only emails parents whose learners actually did work this
// week — dormant accounts aren't pestered.
const REPORT_SUBJECTS = [['math', 'Math'], ['english', 'English'], ['science', 'Science'], ['spanish', 'Spanish']];
async function weeklyReportSweep() {
  try {
    const content = require('./content');
    const parents = db.prepare(`SELECT * FROM parents WHERE (sub_status='active' OR sub_status='trial') AND COALESCE(email_opt_out,0)=0`).all();
    for (const p of parents) {
      // Only a *successfully sent* report counts as "already sent" — a prior failure should retry.
      const already = db.prepare(`SELECT 1 FROM email_log WHERE to_email=? AND kind='weekly_report' AND status='sent' AND created_at > datetime('now','-6 days') LIMIT 1`).get(p.email);
      if (already) continue;
      const kids = db.prepare('SELECT * FROM kids WHERE parent_id=?').all(p.id);
      if (!kids.length) continue;
      const kidSummaries = kids.map(k => {
        const week = db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts>=datetime('now','-7 days')`).get(k.id).n;
        const subjects = REPORT_SUBJECTS.map(([sub, label]) => {
          const r = db.prepare(`SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND subject=? AND ts>=datetime('now','-7 days')`).get(k.id, sub);
          return { label, answers: r.n || 0, accuracy: r.n ? (r.c || 0) / r.n : null, delta: 0 };
        }).filter(s => s.answers > 0);
        const snap = db.prepare(`SELECT score FROM score_snapshots WHERE kid_id=? AND subject='overall' ORDER BY day DESC LIMIT 1`).get(k.id);
        let focus = null;
        try {
          const fr = db.prepare(`SELECT skill_id, subject FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<0.4 ORDER BY mastery ASC LIMIT 1`).get(k.id);
          if (fr) { const sk = content.getSkill(fr.subject, fr.skill_id); focus = sk ? sk.name : null; }
        } catch (e) {}
        return { name: k.name, weekAnswers: week, subjects, gallop: snap ? snap.score : null, focus };
      });
      if (!kidSummaries.some(k => k.weekAnswers > 0)) continue; // don't email dormant accounts
      await sendWeeklyReport(p, { kids: kidSummaries });
      await sleep(SEND_GAP_MS);                                   // stay under Resend's 10/sec
    }
  } catch (e) { console.error('weeklyReportSweep error:', e.message); }
}

// ---------- AI support: escalation to a human + sending an approved reply ----------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lin@learnwithgallop.com';

// Notify the admin (Lin) that a support question needs a person, with the AI's
// suggested reply pre-drafted so it can be sent from the dashboard in one click.
function sendSupportEscalation(ticket) {
  try {
    const q = esc(ticket.question || '').replace(/\n/g, '<br>');
    const draft = esc(ticket.ai_reply || '(no draft)').replace(/\n/g, '<br>');
    const who = esc(ticket.from_name || 'A parent') + (ticket.from_email ? ` (${esc(ticket.from_email)})` : '');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">A support message needs you 📨</h2>
      <p style="margin:0 0 4px"><b>From:</b> ${who}</p>
      ${ticket.subject ? `<p style="margin:0 0 4px"><b>Subject:</b> ${esc(ticket.subject)}</p>` : ''}
      <p style="margin:0 0 4px"><b>Category:</b> ${esc(ticket.category || 'review')}</p>
      <div style="margin:12px 0;padding:12px 14px;background:#f9f7f1;border-radius:10px"><b>Their message</b><br>${q}</div>
      <div style="margin:12px 0;padding:12px 14px;background:#f2f7f4;border-radius:10px"><b>Suggested reply (draft)</b><br>${draft}</div>
      <p style="margin:14px 0 0">Open the dashboard to send, edit, or dismiss it — one click.</p>
      ${btn(ORIGIN + '/#admin', 'Review & send')}
    `);
    sendEmail({ to: ADMIN_EMAIL, subject: `Support: ${ticket.subject || 'new message from a parent'}`, html, kind: 'support_escalation' });
  } catch (e) { /* escalation email must never throw */ }
}

// Send a support reply to the parent, from support@, so their reply threads back to support.
function sendSupportReply(toEmail, subject, replyText) {
  try {
    if (!toEmail) return { sent: false };
    const body = esc(replyText || '').replace(/\n/g, '<br>');
    const html = layout(`<div style="line-height:1.65">${body}</div>`);
    const subj = /^re:/i.test(subject || '') ? subject : `Re: ${subject || 'your question'}`;
    return sendEmail({ to: toEmail, subject: subj, html, kind: 'support_reply' });
  } catch (e) { return { sent: false }; }
}

module.exports = { configured, sendEmail, sendWelcomeTrial, sendWelcomePaid, sendPasswordReset, sendWeeklyReport, sendTrialEnding, sendTrialEnded, sendChildSubscribeRequest, nudgeSweep, weeklyReportSweep, trialSweep, unsubTokenFor, sendSupportEscalation, sendSupportReply };
