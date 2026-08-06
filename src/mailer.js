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

// ---------- Onboarding drip: fill the quiet middle of the 7-day trial ----------
// Day-2 ACTIVATION nudge — tailored to how far the parent has gotten. The single biggest lever
// on trial→paid is getting the child actually set up and answering questions in the first days.
function sendOnboardActivate(parent, state) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kid = esc(state && state.kidName ? state.kidName : 'your child');
    let subject, body;
    if (!state || !state.hasKid) {
      subject = 'Your Gallop trial is running — let\'s add your child 🐎';
      body = `
        <h2 style="margin:0 0 12px;color:${BRAND}">Two minutes to set up, ${first} 🐎</h2>
        <p>Your free week is already ticking — and your child isn't set up yet. It's quick: just a name, grade, and a fun 4-digit PIN.</p>
        <p style="margin:12px 0 6px">The moment they're added, a short <b>placement quiz</b> finds their true level in Math, English, Science &amp; Spanish — no guessing, no wrong grade. Everything adapts from there.</p>
        ${btn(ORIGIN + '/#parent', 'Add your child (60 seconds)')}`;
    } else if (!state.active) {
      subject = `${kid} is set up — here's the first lesson`;
      body = `
        <h2 style="margin:0 0 12px;color:${BRAND}">Nice — ${kid} is ready to go 🎯</h2>
        <p>Hi ${first}! The best next step is the quick <b>placement quiz</b> — it finds ${kid}'s real starting level in each subject, then every lesson adjusts to keep them right at the edge of what they can do (that's where it clicks).</p>
        <p style="margin:12px 0 6px">Ten minutes is enough to see it work. Kids log in with <b>your email + their PIN</b> on any device.</p>
        ${btn(ORIGIN + '/#parent', 'Start the first lesson')}`;
    } else {
      subject = 'Great start! One thing parents love next';
      body = `
        <h2 style="margin:0 0 12px;color:${BRAND}">${kid} is off and running 🚀</h2>
        <p>Love to see it, ${first} — ${kid} is already answering questions. Two things worth a peek this week:</p>
        <p style="margin:8px 0">• <b>Your Parent Report</b> — strengths, gaps, and a printable certificate for the fridge.</p>
        <p style="margin:8px 0">• <b>The Lab &amp; Career Center</b> — where kids run a business, invest in a live market, and see where school subjects lead in real careers.</p>
        ${btn(ORIGIN + '/#parent', 'See your dashboard')}`;
    }
    const html = layout(body, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject, html, kind: 'onboard_activate' });
  } catch (e) { /* never throw from the scheduler */ }
}

// Day-4 VALUE email — show the parent what's happening "under the hood" and point them at the proof
// (the report). Reinforces why it's worth keeping mid-trial, before the "ending soon" ask.
function sendOnboardValue(parent, state) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kid = esc(state && state.kidName ? state.kidName : 'your child');
    const activeLine = (state && state.active)
      ? `<p style="margin:12px 0 0">You're already seeing it in action — every answer ${kid} gives is quietly retuning what comes next.</p>`
      : `<p style="margin:12px 0 0">Haven't had a chance to dive in yet? Even 10 minutes this week will show you what it can do.</p>`;
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">What Gallop is quietly doing for ${kid}</h2>
      <p>Hi ${first} — here's what's happening behind the scenes:</p>
      <p style="margin:8px 0"><b>It meets ${kid} exactly where they are.</b> Placement finds their true level in each subject, and every question nudges the next one easier or harder — so they're always working right at the edge of what they can do. That's where learning actually sticks.</p>
      <p style="margin:8px 0"><b>It's the whole picture.</b> Math, English, Science &amp; Spanish, K–12 — plus The Lab (run a business, invest in a live market) and a Career Center that connects today's lessons to real jobs. Correct answers earn arcade tokens, so practice powers the fun.</p>
      <p style="margin:8px 0"><b>You always know how it's going.</b> Your weekly Parent Report shows exactly where they're strong and where they need a hand.</p>
      ${activeLine}
      ${btn(ORIGIN + '/#parent', `See ${kid}'s progress`)}
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `What Gallop is quietly doing for ${kid}`, html, kind: 'onboard_value' });
  } catch (e) { /* never throw from the scheduler */ }
}

// Win-back + feedback — sent ~3 days AFTER the trial ended (the "reactivate now" trial_ended
// email has already gone out on day 0). Two jobs in one honest email: an easy door back in
// (everything's still saved), and a genuine "if it wasn't right, tell us why" ask so lapsed
// trials become product feedback instead of silence. No discount/promo — just a real invitation.
function sendWinback(parent, state) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const hasKid = !!(state && state.hasKid);
    const kid = esc(state && state.kidName ? state.kidName : 'your child');
    // Tailor the middle line to how far they actually got.
    let middle;
    if (state && state.active) {
      middle = `<p>${kid} had a real start on Gallop — every level, streak and badge they earned is still saved, exactly where they left it. One click and they're back at it.</p>`;
    } else if (hasKid) {
      middle = `<p>${kid} is all set up and waiting — the placement quiz and first lessons are one tap away, and nothing's been lost. It only takes ten minutes to see it click.</p>`;
    } else {
      middle = `<p>Your account's still here whenever you're ready — adding your child takes about a minute, and a short placement quiz finds their true level in Math, English, Science &amp; Spanish before the first lesson.</p>`;
    }
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">We saved your spot, ${first} 🐎</h2>
      ${middle}
      ${btn(ORIGIN + '/#subscribe', 'Pick up where you left off')}
      <p style="margin:18px 0 6px">And if Gallop wasn't the right fit — that's genuinely useful to us. <b>Just hit reply and tell us what was missing.</b> One line helps us build something your family would actually love, and we read every response.</p>
      <p style="margin:14px 0 0;font-size:14px;color:#5f6b7d">All four subjects, from $34/mo, cancel anytime.</p>
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `${first}, we saved ${hasKid ? kid + "'s" : 'your'} spot on Gallop`, html, kind: 'winback' });
  } catch (e) { /* never throw from the scheduler */ }
}

// Mid-trial PROGRESS SNAPSHOT for kids who are actually practicing — real numbers, a proud tone,
// a soft "keep it going" toward subscribing, and a one-line feedback ask. The core trial→paid lever
// for active families inside the short 7-day window.
function sendTrialProgress(parent, state, stats) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    if (!stats || !stats.total) return;   // only for kids with real activity
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kid = esc(state && state.kidName ? state.kidName : 'your child');
    const SUBJ = { math: 'Math', english: 'English', science: 'Science', spanish: 'Spanish', reading: 'Reading' };
    const strong = stats.bestSubject ? (SUBJ[stats.bestSubject] || stats.bestSubject) : null;
    const streakLine = stats.streak >= 2 ? `<p style="margin:8px 0">🔥 <b>${stats.streak}-day streak</b> — showing up is the whole game, and ${kid} is doing it.</p>` : '';
    const strongLine = strong
      ? `<p style="margin:8px 0">💪 Strongest so far: <b>${strong}</b> · ${stats.accuracy}% correct overall.</p>`
      : `<p style="margin:8px 0">✅ ${stats.accuracy}% correct so far — right in the learning zone.</p>`;
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${kid}'s first days on Gallop 🐎</h2>
      <p>Hi ${first} — a quick snapshot of what ${kid} has been up to:</p>
      <p style="margin:14px 0 4px;font-size:20px"><b>${stats.total}</b> questions answered · <b>${stats.accuracy}%</b> correct</p>
      ${strongLine}
      ${streakLine}
      <p style="margin:12px 0 0">Every one of those answers quietly retuned what came next, so ${kid} is always working right at the edge of what they can do — that's where it sticks.</p>
      <p style="margin:12px 0 0"><b>Your free week is going fast.</b> Keep it all — the levels, streak, and badges ${kid} has built — by subscribing before the trial ends. All four subjects, cancel anytime.</p>
      ${btn(ORIGIN + '/#parent', `See ${kid}'s full report`)}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">How's it going so far? Just hit reply and tell us — a real person reads every note.</p>
    `, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject: `${kid}'s progress on Gallop — ${stats.total} questions in 🎯`, html, kind: 'trial_progress' });
  } catch (e) { /* never throw from the scheduler */ }
}

// Second, warmer get-started nudge ~mid-trial for families who STILL haven't practiced. The 7-day
// window is short, so one more gentle push before the "ending soon" ask meaningfully lifts activation.
function sendOnboardActivate2(parent, state) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kid = esc(state && state.kidName ? state.kidName : 'your child');
    let subject, body;
    if (!state || !state.hasKid) {
      subject = `${first}, your free week is half over — let's add your child`;
      body = `
        <h2 style="margin:0 0 12px;color:${BRAND}">Your free week is half over, ${first} 🐎</h2>
        <p>No child added yet — and it only takes about a minute (name, grade, a fun 4-digit PIN). The moment they're in, a short placement quiz finds their real level in Math, English, Science &amp; Spanish, and everything adapts from there.</p>
        ${btn(ORIGIN + '/#parent', 'Add your child (60 seconds)')}`;
    } else {
      subject = `${first}, let's get ${kid} started before your week's up`;
      body = `
        <h2 style="margin:0 0 12px;color:${BRAND}">Let's get ${kid} started, ${first} 🎯</h2>
        <p>${kid} is all set up but hasn't taken a lesson yet — and your free week is already halfway through. Ten minutes is enough to see it work: they log in with <b>your email + their PIN</b> on any device, and the placement quiz does the rest.</p>
        ${btn(ORIGIN + '/#parent', `Start ${kid}'s first lesson`)}`;
    }
    const html = layout(body, { unsubToken: unsubTokenFor(parent.id) });
    return sendEmail({ to: parent.email, subject, html, kind: 'onboard_nudge2' });
  } catch (e) { /* never throw */ }
}

// Trial conversion + onboarding sweep (timer from server.js). Per trial account, at most one email
// per sweep: day ~2 ACTIVATION, day ~4 (active → PROGRESS report; inactive → 2nd get-started nudge),
// ~2 days left "ending soon", ended "reactivate", then ~3 days after that a win-back + feedback ask.
// Idempotent via email_log (each kind sent once per account) and throttled.
async function trialSweep() {
  try {
    const { isComp } = require('./auth');
    const parents = db.prepare("SELECT * FROM parents WHERE sub_status='trial' AND COALESCE(email_opt_out,0)=0 AND trial_ends IS NOT NULL").all();
    const sentBefore = (email, kind) => !!db.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind=? AND status='sent' LIMIT 1").get(email, kind);
    for (const p of parents) {
      if (isComp(p)) continue;   // comp/founder accounts never expire, so never nudge them to subscribe
      let ends;
      try { ends = new Date(p.trial_ends.replace(' ', 'T') + 'Z'); } catch (e) { continue; }
      if (isNaN(ends)) continue;
      const msLeft = ends.getTime() - Date.now();
      const daysLeft = msLeft / 86400000;
      let sentSomething = false;
      if (msLeft <= 0) {
        if (!sentBefore(p.email, 'trial_ended')) { await sendTrialEnded(p); sentSomething = true; }
        else if ((-msLeft / 86400000) >= 3 && !sentBefore(p.email, 'winback')) {
          // ~3 days after the trial lapsed: one win-back + feedback email. Build just enough
          // state to personalize (guarded so a schema hiccup can't break the sweep).
          const wstate = { hasKid: false, active: false, kidName: null };
          try {
            const kc = db.prepare('SELECT COUNT(*) AS n FROM kids WHERE parent_id=?').get(p.id);
            wstate.hasKid = !!(kc && kc.n > 0);
            const k1 = db.prepare('SELECT name FROM kids WHERE parent_id=? ORDER BY id LIMIT 1').get(p.id);
            if (k1 && k1.name) wstate.kidName = k1.name;
            const ac = db.prepare('SELECT COUNT(*) AS n FROM activity_log a JOIN kids k ON a.kid_id=k.id WHERE k.parent_id=?').get(p.id);
            wstate.active = !!(ac && ac.n > 0);
          } catch (e) {}
          await sendWinback(p, wstate); sentSomething = true;
        }
      } else if (daysLeft <= 2) {
        if (!sentBefore(p.email, 'trial_ending')) { await sendTrialEnding(p, Math.max(1, Math.round(daysLeft))); sentSomething = true; }
      } else {
        // Quiet middle of the trial — onboarding drip keyed off signup date (day ~2 and ~4).
        let daysSince = null;
        try { const c = new Date(String(p.created_at).replace(' ', 'T') + 'Z'); if (!isNaN(c)) daysSince = (Date.now() - c.getTime()) / 86400000; } catch (e) {}
        if (daysSince != null) {
          // Onboarding state (guarded — a schema hiccup must never break the sweep).
          const state = { hasKid: false, active: false, kidName: null };
          try {
            const kc = db.prepare('SELECT COUNT(*) AS n FROM kids WHERE parent_id=?').get(p.id);
            state.hasKid = !!(kc && kc.n > 0);
            const k1 = db.prepare('SELECT name FROM kids WHERE parent_id=? ORDER BY id LIMIT 1').get(p.id);
            if (k1 && k1.name) state.kidName = k1.name;
            const ac = db.prepare('SELECT COUNT(*) AS n FROM activity_log a JOIN kids k ON a.kid_id=k.id WHERE k.parent_id=?').get(p.id);
            state.active = !!(ac && ac.n > 0);
          } catch (e) {}
          if (daysSince >= 1.5 && !sentBefore(p.email, 'onboard_activate')) {
            await sendOnboardActivate(p, state); sentSomething = true;
          } else if (daysSince >= 3.5 && sentBefore(p.email, 'onboard_activate')) {
            if (state.active) {
              // Kid is practicing → personalized progress snapshot (convert + feedback).
              if (!sentBefore(p.email, 'trial_progress')) {
                let stats = null;
                try {
                  const row = db.prepare('SELECT COUNT(*) AS n, SUM(a.correct) AS c FROM activity_log a JOIN kids k ON a.kid_id=k.id WHERE k.parent_id=?').get(p.id);
                  const total = (row && row.n) || 0, correct = (row && row.c) || 0;
                  let best = null;
                  const subj = db.prepare('SELECT a.subject AS s, COUNT(*) AS n, SUM(a.correct) AS c FROM activity_log a JOIN kids k ON a.kid_id=k.id WHERE k.parent_id=? GROUP BY a.subject').all(p.id);
                  subj.forEach(r => { const acc = r.n ? r.c / r.n : 0; if (r.n >= 5 && (!best || acc > best.acc)) best = { s: r.s, acc }; });
                  if (!best && subj.length) { const m = subj.slice().sort((a, b) => b.n - a.n)[0]; best = { s: m.s, acc: m.n ? m.c / m.n : 0 }; }
                  const sr = db.prepare('SELECT MAX(streak) AS ms FROM kids WHERE parent_id=?').get(p.id);
                  stats = { total, correct, accuracy: total ? Math.round(correct / total * 100) : 0, bestSubject: best ? best.s : null, streak: (sr && sr.ms) || 0 };
                } catch (e) {}
                await sendTrialProgress(p, state, stats); sentSomething = true;
              }
            } else if (!sentBefore(p.email, 'onboard_nudge2')) {
              // Still hasn't practiced → one more warmer get-started nudge.
              await sendOnboardActivate2(p, state); sentSomething = true;
            }
          }
        }
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

// ---------- COPPA email-plus: verify the parent's email before any child data is collected ----------
function sendEmailVerification(parent, verifyUrl) {
  try {
    if (!parent || !parent.email) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">Confirm your email to get started 🐎</h2>
      <p>Hi ${first} — thanks for starting a Gallop free trial!</p>
      <p>Before you add your child and we collect any of their information, we ask the parent or guardian to confirm this email address. This is how we verify parental consent, in line with the Children's Online Privacy Protection Act (COPPA).</p>
      ${btn(esc(verifyUrl), 'Confirm my email &amp; consent')}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">This link is single-use and just for you. If you didn't start a Gallop trial, you can safely ignore this email — no learner will be created and no child information will be collected.</p>
    `);
    sendEmail({ to: parent.email, subject: 'Confirm your email to start your Gallop trial', html, kind: 'email_verification' });
  } catch (e) { /* email must never break signup */ }
}

// The "plus" in email-plus: a delayed confirming email sent AFTER consent is captured, so the
// parent has a clear record and a chance to object if they didn't authorize it.
function sendConsentConfirmed(parent) {
  try {
    if (!parent || !parent.email) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">Consent confirmed ✅</h2>
      <p>Hi ${first} — thanks. Your email is confirmed, and we've recorded your consent as the parent or guardian to create a learner profile and collect the limited information described in our <a href="${ORIGIN}/privacy" style="color:${BRAND}">Privacy Policy</a>.</p>
      <p>You're all set to add your child from your Parent Dashboard. You can review exactly what's collected, export it, or withdraw consent at any time from the dashboard.</p>
      ${btn(ORIGIN + '/#parent', 'Go to my dashboard')}
      <p style="margin:16px 0 0;font-size:14px;color:#5f6b7d">If you did NOT authorize this, reply to this email right away (a real person answers) and we'll remove the account and any data.</p>
    `);
    sendEmail({ to: parent.email, subject: 'Your Gallop consent is confirmed', html, kind: 'consent_confirmed' });
  } catch (e) { /* never throw */ }
}

// ---------- weekly parent report (autonomous digest) ----------
function sendWeeklyReport(parent, summary) {
  try {
    if (!parent || !parent.email || parent.email_opt_out) return;
    const first = esc((parent.name || '').split(' ')[0] || 'there');
    const kidBlocks = summary.kids.map(k => {
      const subjLines = k.subjects.map(s =>
        `<tr><td style="padding:4px 10px 4px 0;color:#16213a">${esc(s.label)}</td>
         <td style="padding:4px 0;color:#5f6b7d">${s.answers} answered · ${s.accuracy != null ? Math.round(s.accuracy * 100) + '%' : '—'} correct</td></tr>`
      ).join('');
      // Wins this week: a completed grade (certificate) is the headline; badges and streaks reinforce it.
      const wins = [];
      (k.certsWon || []).forEach(t => wins.push(`🎓 <b>${esc(t)}</b>`));
      if (k.badgesWon > 0) wins.push(`🏅 ${k.badgesWon} new badge${k.badgesWon === 1 ? '' : 's'}`);
      if (k.streak >= 3) wins.push(`🔥 ${k.streak}-day streak`);
      const gallopBit = k.gallop != null
        ? ` · Gallop Score <b>${k.gallop}</b>${k.gallopDelta > 0 ? ` <span style="color:#1f8a5f;font-weight:700">▲ +${k.gallopDelta} this week</span>` : ''}`
        : '';
      return `<div style="margin:14px 0;padding:14px 16px;background:#f9f7f1;border-radius:12px">
        <p style="margin:0 0 6px"><b style="color:${BRAND};font-size:15px">${esc(k.name)}</b> — ${k.weekAnswers} question${k.weekAnswers === 1 ? '' : 's'} this week${gallopBit}</p>
        ${wins.length ? `<p style="margin:0 0 8px;font-size:14px;color:#1f6b43">🎉 This week: ${wins.join(' · ')}</p>` : ''}
        ${subjLines ? `<table style="border-collapse:collapse;font-size:14px">${subjLines}</table>` : '<p style="margin:0;color:#5f6b7d;font-size:14px">No practice logged this week — a quick session gets them going again.</p>'}
        ${k.focus ? `<p style="margin:8px 0 0;font-size:14px">🎯 Worth a look together: <b>${esc(k.focus)}</b> — they get extra practice on it automatically.</p>` : ''}
      </div>`;
    }).join('');
    // Family headline: total questions + standout win, so the value lands in the first line.
    const totalQ = summary.kids.reduce((t, k) => t + (k.weekAnswers || 0), 0);
    const anyCert = summary.kids.some(k => (k.certsWon || []).length);
    const headline = anyCert
      ? `A big week — a grade was completed! Here's the full picture. 🎉`
      : totalQ > 0
        ? `${totalQ} question${totalQ === 1 ? '' : 's'} answered this week. Here's how it's going. 📊`
        : `A quick snapshot of where things stand. 📊`;
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">${first}, here's this week in learning 📊</h2>
      <p>${headline}</p>
      ${kidBlocks}
      <p style="font-size:13px;color:#8a94a3;margin:14px 0 0">Every number here comes from questions your ${summary.kids.length === 1 ? 'child' : 'children'} actually answered — and matches your dashboard exactly. The Gallop Score only rises with real, lasting understanding.</p>
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
      const adaptive = require('./adaptive');
      const kidSummaries = kids.map(k => {
        const week = db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND ts>=datetime('now','-7 days')`).get(k.id).n;
        const subjects = REPORT_SUBJECTS.map(([sub, label]) => {
          // Accuracy excludes optional Advanced Track (AP/honors), matching the dashboard/report.
          const r = db.prepare(`SELECT COUNT(*) AS n, SUM(correct) AS c FROM activity_log WHERE kid_id=? AND subject=? AND skill_id NOT LIKE 'track:%' AND ts>=datetime('now','-7 days')`).get(k.id, sub);
          const all = db.prepare(`SELECT COUNT(*) AS n FROM activity_log WHERE kid_id=? AND subject=? AND ts>=datetime('now','-7 days')`).get(k.id, sub);
          return { label, answers: all.n || 0, accuracy: r.n ? (r.c || 0) / r.n : null };
        }).filter(s => s.answers > 0);
        // Canonical growth number, straight from the same report the dashboard shows.
        let gallop = null, gallopDelta = null;
        try { const card = adaptive.reportCard(k.id); if (card.gallop) { gallop = card.gallop.overall; gallopDelta = (card.gallop.deltas && card.gallop.deltas.overall) || null; } } catch (e) {}
        // Concrete wins this week — the strongest proof the program is working.
        const certsWon = db.prepare(`SELECT title FROM certificates WHERE kid_id=? AND issued_at>=datetime('now','-7 days') ORDER BY issued_at DESC`).all(k.id).map(c => c.title);
        const badgesWon = db.prepare(`SELECT COUNT(*) AS n FROM badges WHERE kid_id=? AND earned_at>=datetime('now','-7 days')`).get(k.id).n || 0;
        let focus = null;
        try {
          const fr = db.prepare(`SELECT skill_id, subject FROM skill_state WHERE kid_id=? AND attempts>=3 AND mastery<0.4 ORDER BY mastery ASC LIMIT 1`).get(k.id);
          if (fr) { const sk = content.getSkill(fr.subject, fr.skill_id); focus = sk ? sk.name : null; }
        } catch (e) {}
        return { name: k.name, weekAnswers: week, subjects, gallop, gallopDelta, certsWon, badgesWon, streak: k.streak || 0, focus };
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

// A school/educator submitted the "Book a demo / request pricing" form. Notify the team so
// they can follow up. Never throws — a failed notification must not break the thank-you.
function sendSchoolLead(lead) {
  try {
    const to = process.env.SCHOOLS_LEAD_EMAIL || ADMIN_EMAIL;
    const rows = [
      ['School / organization', lead.school],
      ['Contact name', lead.name],
      ['Email', lead.email],
      ['Phone', lead.phone],
      ['Role', lead.role],
      ['Approx. students', lead.students],
      ['Interested in', lead.interest],
      ['Message', lead.message]
    ].filter(r => r[1]);
    const table = rows.map(([k, v]) =>
      `<tr><td style="vertical-align:top;padding:4px 12px 4px 0;color:#5b6478;white-space:nowrap"><b>${esc(k)}</b></td><td style="padding:4px 0">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`).join('');
    const html = layout(`
      <h2 style="margin:0 0 12px;color:${BRAND}">New school inquiry 🏫</h2>
      <table style="border-collapse:collapse;font-size:.95rem">${table}</table>
      <p style="margin:16px 0 0;color:#5b6478;font-size:.88rem">Reply directly to <b>${esc(lead.email || '')}</b> to follow up.</p>
    `);
    return sendEmail({ to, subject: `School inquiry: ${lead.school || lead.name || 'new lead'}`, html, kind: 'school_lead' });
  } catch (e) { return Promise.resolve({ sent: false }); }
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

module.exports = { configured, sendEmail, sendWelcomeTrial, sendWelcomePaid, sendPasswordReset, sendEmailVerification, sendConsentConfirmed, sendWeeklyReport, sendTrialEnding, sendTrialEnded, sendChildSubscribeRequest, sendOnboardActivate, sendOnboardActivate2, sendOnboardValue, sendTrialProgress, sendWinback, nudgeSweep, weeklyReportSweep, trialSweep, unsubTokenFor, sendSupportEscalation, sendSupportReply, sendSchoolLead };
