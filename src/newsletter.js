// Gallop Learning Academy — monthly newsletter engine.
//
// Autonomous, school-year-calendar-aware. Each calendar month the sweep drafts one
// newsletter tied to that month's theme and Gallop's mission (adaptive, standards-aligned
// K-12 tutoring across Math, English, Science, Spanish). The FIRST few go out as a DRAFT
// to the admin (Lin) for one-click approval; after that the system sends on its own.
//
// Content is AI-written when ANTHROPIC_API_KEY is set, with a strong hand-written
// fallback so it works either way. Dependency-free HTTPS, like mailer.js and support.js.
const https = require('https');
const crypto = require('crypto');
const db = require('./db');
const mailer = require('./mailer');

const AI_KEY = process.env.ANTHROPIC_API_KEY || '';
const AI_MODEL = process.env.SUPPORT_AI_MODEL || 'claude-haiku-4-5-20251001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lin@learnwithgallop.com';
const ORIGIN = process.env.APP_ORIGIN || 'https://learnwithgallop.com';
// How many newsletters go through admin approval before the system sends on its own.
const APPROVAL_COUNT = parseInt(process.env.NEWSLETTER_APPROVAL_COUNT || '2', 10);
const BRAND = '#1A5C38';

// ---- School-year calendar: each month's theme + a mission-aligned angle ----
const MONTH_THEMES = {
  1:  { season: 'January',  theme: 'Fresh-start habits', angle: 'A new year is a natural reset — a great moment to rebuild a short daily learning routine and set one goal per subject.' },
  2:  { season: 'February', theme: 'Midyear momentum',   angle: 'Midwinter is when routines slip. Small, consistent practice keeps skills warm and prevents the spring scramble.' },
  3:  { season: 'March',    theme: 'Spring testing prep', angle: 'State testing season is near. Steady review of grade-level standards beats last-minute cramming.' },
  4:  { season: 'April',    theme: 'Finishing strong',    angle: 'The last stretch of the school year is where gaps get closed. Focus on the concepts a child still finds tricky.' },
  5:  { season: 'May',      theme: 'Wrapping the year',   angle: 'As the year ends, celebrate growth and identify the two or three skills worth shoring up before summer.' },
  6:  { season: 'June',     theme: 'Beat the summer slide', angle: 'Kids can lose up to two months of learning over summer. Fifteen minutes a day keeps them sharp and ready.' },
  7:  { season: 'July',     theme: 'Summer learning, the fun way', angle: 'Summer is for low-pressure, playful practice — a little every few days keeps momentum without feeling like school.' },
  8:  { season: 'August',   theme: 'Back-to-school ready', angle: 'A new grade is coming. A quick placement check per subject makes sure your child starts at exactly the right level.' },
  9:  { season: 'September',theme: 'Building the routine', angle: 'The first weeks set the tone. A consistent 10-15 minute daily habit now pays off all year.' },
  10: { season: 'October',  theme: 'First-quarter check-in', angle: 'Report cards are landing. This is the moment to turn a "needs work" note into a plan, one skill at a time.' },
  11: { season: 'November', theme: 'Gratitude & grit',    angle: 'Persistence is a skill too. Celebrating effort — not just right answers — builds the confidence that carries kids through hard concepts.' },
  12: { season: 'December', theme: 'Keep the spark over break', angle: 'The holidays are busy, but a few short sessions over the long break prevent the January slump.' }
};

function monthKey(date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; }
function themeFor(date) { return MONTH_THEMES[date.getUTCMonth() + 1]; }

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- Branded HTML wrapper (mirrors the transactional email look) ----
function wrap(innerHtml, unsubUrl) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f4ee;font-family:Georgia,'Times New Roman',serif;color:#16213a">
  <div style="max-width:600px;margin:0 auto;padding:26px 18px">
    <div style="text-align:center;padding-bottom:16px"><img src="${ORIGIN}/logo-full.png" alt="Gallop Learning Academy" style="height:60px;width:auto"></div>
    <div style="background:#fff;border:1px solid #e7e3d8;border-radius:16px;padding:28px 26px;line-height:1.65;font-size:16px">${innerHtml}
      <div style="text-align:center;margin-top:24px"><a href="${ORIGIN}/#home" style="background:${BRAND};color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold;display:inline-block">Open Gallop</a></div>
    </div>
    <p style="text-align:center;color:#8a8fa0;font-size:12px;line-height:1.6;margin-top:16px;font-family:Arial,sans-serif">
      Gallop Learning Academy · adaptive, standards-aligned K–12 tutoring · <a href="${ORIGIN}" style="color:${BRAND}">learnwithgallop.com</a><br>
      ${unsubUrl ? `<a href="${unsubUrl}" style="color:#8a8fa0">Unsubscribe</a>` : 'You are receiving Gallop learning tips.'}
    </p>
  </div></body></html>`;
}

// ---- AI drafting (JSON out), with a hand-written fallback ----
function callClaude(system, user) {
  return new Promise((resolve) => {
    if (!AI_KEY) return resolve(null);
    const payload = JSON.stringify({ model: AI_MODEL, max_tokens: 1200, system, messages: [{ role: 'user', content: user }] });
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: { 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) },
      timeout: 25000
    }, resp => { let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { const j = JSON.parse(d); resolve(j.content && j.content[0] && j.content[0].text || null); } catch (e) { resolve(null); } }); });
    req.on('error', () => resolve(null)); req.on('timeout', () => req.destroy());
    req.write(payload); req.end();
  });
}

async function generateContent(date) {
  const t = themeFor(date);
  const system = `You write the monthly parent newsletter for Gallop Learning Academy — adaptive, standards-aligned online tutoring for grades K-12 in Math, English, Science, and Spanish (self-paced software, not live tutors; aligned to Common Core, NGSS, and ACTFL). Gallop was built by two parents at their kitchen table for their own daughter. The newsletter should read like one of them actually wrote it: a real parent talking to other parents, not a brand or a bot.

Write a newsletter for ${t.season} on the theme "${t.theme}". Seasonal angle to weave in: ${t.angle}

Include: a short, warm, specific intro tied to the season; 2-3 concrete learning tips a parent can genuinely use this month (name a real situation — homework at the kitchen table, a times-table that won't stick, the summer slump — not vague advice); and one brief, low-key note on how Gallop helps. Keep it skimmable, about 250-350 words.

SOUND LIKE A HUMAN, NOT AN AI. Specifically:
- Plain, direct language and contractions. Vary sentence length; a few short, punchy sentences help.
- Concrete over abstract. One vivid, specific detail beats three generic lines.
- A little warmth and personality, like a parent who's been through it.
- NO emojis. NO hype or salesy language.
- Avoid the usual AI tells: don't use "dive in," "unlock," "empower," "foster," "nurture," "elevate," "game-changer," "seamless," "in today's world," "let's face it," "whether you're X or Y," "it's not just X, it's Y," "at the end of the day," or "remember,". Don't open with a rhetorical question. Don't overuse em-dashes or the rule of three. Don't end with a tidy wrap-up line like "Ultimately" or "In conclusion." Don't stack transitions like "Moreover" and "Furthermore."
- Don't be relentlessly upbeat or perfectly balanced. Real writing has rhythm and a point of view.

Respond with STRICT JSON only:
{"subject": "<a subject line a real person would actually write — specific, not clickbait, no emojis>", "sections": [{"heading": "<short, plain heading>", "body": "<1-2 short paragraphs of plain text>"}]}`;
  const raw = await callClaude(system, `Write the ${t.season} newsletter now.`);
  if (raw) {
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const o = JSON.parse(m[0]);
        if (o.subject && Array.isArray(o.sections) && o.sections.length) {
          const inner = o.sections.map(s => `<h3 style="color:${BRAND};margin:18px 0 6px">${esc(s.heading)}</h3><div>${esc(s.body).replace(/\n\n/g, '</div><div style="margin-top:8px">').replace(/\n/g, '<br>')}</div>`).join('');
          return { subject: String(o.subject).slice(0, 160), html: inner, theme: t.theme, ai: true };
        }
      }
    } catch (e) { /* fall through to template */ }
  }
  return fallbackContent(t);
}

// Hand-written fallback so a newsletter always goes out even with no AI key / on AI error.
function fallbackContent(t) {
  const inner = `
    <h2 style="color:${BRAND};margin:0 0 10px">${esc(t.theme)}</h2>
    <p>Hi from all of us at Gallop! ${esc(t.angle)}</p>
    <h3 style="color:${BRAND};margin:18px 0 6px">Three small things that help this month</h3>
    <p><b>1. Keep it short and daily.</b> Ten to fifteen minutes a day beats an hour once a week — consistency is what makes skills stick.</p>
    <p><b>2. Follow the struggle, not the grade.</b> When a concept feels tricky, that's the one worth a few extra minutes. Gallop spots those automatically and gives your child more practice right where they need it.</p>
    <p><b>3. Celebrate effort.</b> Praising the trying — not just the right answer — is what builds the confidence to tackle harder work.</p>
    <h3 style="color:${BRAND};margin:18px 0 6px">How Gallop fits in</h3>
    <p>Every child works at their real level in each subject, with a short lesson before the practice and questions that adapt as they go — all mapped to Common Core, NGSS, and ACTFL standards. A few minutes this ${esc(t.season)} keeps them moving forward.</p>`;
  return { subject: `Gallop: ${t.theme} — small steps for ${t.season}`, html: inner, theme: t.theme, ai: false };
}

// ---- Recipients: newsletter signups + parents who haven't opted out (deduped) ----
function unsubTokenForSub(email) {
  const row = db.prepare('SELECT unsub_token FROM newsletter_subs WHERE email=?').get(email);
  if (row && row.unsub_token) return row.unsub_token;
  const t = crypto.randomBytes(16).toString('hex');
  db.prepare('UPDATE newsletter_subs SET unsub_token=? WHERE email=?').run(t, email);
  return t;
}
// Exclude QA/smoke-test and reserved example addresses so a real send never wastes attempts
// on them (Resend rejects example.com outright) and the "sent to N" count reflects real people.
const isTestEmail = (e) => /@(gallop\.test|gallop-test\.com|example\.(com|org|net)|test\.com)$/i.test(String(e || ''));
function recipients() {
  const map = new Map();
  for (const s of db.prepare('SELECT email FROM newsletter_subs').all()) {
    if (s.email && !isTestEmail(s.email)) map.set(s.email.toLowerCase(), { email: s.email, kind: 'sub' });
  }
  for (const p of db.prepare("SELECT id, email FROM parents WHERE COALESCE(email_opt_out,0)=0").all()) {
    if (p.email && !isTestEmail(p.email) && !map.has(p.email.toLowerCase())) map.set(p.email.toLowerCase(), { email: p.email, kind: 'parent', id: p.id });
  }
  return [...map.values()];
}

function unsubUrlFor(r) {
  if (r.kind === 'parent') return `${ORIGIN}/api/email/unsubscribe?t=${mailer.unsubTokenFor(r.id)}`;
  return `${ORIGIN}/api/newsletter/unsubscribe?t=${unsubTokenForSub(r.email)}`;
}

// Send an approved/auto newsletter to the whole list. Returns count sent.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Send throttled so we never exceed Resend's 10 requests/second cap — otherwise a bulk
// send 429s and every email silently fails. ~150ms/send ≈ 6-7/sec leaves headroom, and a
// single retry after a pause rescues any transient failure. Awaited by callers.
async function sendToSubscribers(nl) {
  const list = recipients();
  let n = 0;
  for (const r of list) {
    try {
      // Idempotent: if this address already got the newsletter successfully in the last day,
      // skip it. Makes a re-run safe (only the ones that failed get another attempt — no dupes).
      const already = db.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind='newsletter' AND status='sent' AND created_at > datetime('now','-1 day') LIMIT 1").get(r.email);
      if (already) { n++; continue; }
      const html = wrap(nl.body_html, unsubUrlFor(r));
      let res = await mailer.sendEmail({ to: r.email, subject: nl.subject, html, kind: 'newsletter' });
      let tries = 0;
      while (res && res.sent === false && tries < 3) {   // rescue transient failures with backoff
        await sleep(1500);
        res = await mailer.sendEmail({ to: r.email, subject: nl.subject, html, kind: 'newsletter' });
        tries++;
      }
      if (res && (res.sent === true || res.queued)) n++;
      await sleep(200);                            // ~5 req/sec — comfortably under Resend's 10/sec
    } catch (e) { /* one bad address never stops the send */ }
  }
  db.prepare("UPDATE newsletters SET status='sent', recipients=?, sent_at=datetime('now') WHERE id=?").run(n, nl.id);
  return n;
}

// Notify the admin that a newsletter draft is ready to review/approve.
function notifyApproval(nl) {
  try {
    const preview = wrap(nl.body_html, null);
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#16213a">
      <div style="max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:${BRAND}">A newsletter draft is ready 📝</h2>
        <p><b>Subject:</b> ${esc(nl.subject)}</p>
        <p>Review, edit, and send it (or discard) from your dashboard — it will not go to subscribers until you approve it.</p>
        <p><a href="${ORIGIN}/#admin" style="background:${BRAND};color:#fff;text-decoration:none;padding:11px 24px;border-radius:999px;font-weight:bold;display:inline-block">Review & send</a></p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
        <p style="color:#7f8c9b;font-size:13px">Preview below:</p>
        ${preview}
      </div></body></html>`;
    // Notify every owner (both founders), not just the single ADMIN_EMAIL, so a draft
    // ready for review reaches whoever is actually managing the newsletter.
    const owners = [...new Set([
      ...String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean),
      'lin@learnwithgallop.com', 'steve.jerome5@gmail.com'
    ])];
    for (const to of owners) mailer.sendEmail({ to, subject: `Newsletter draft ready: ${nl.subject}`, html, kind: 'newsletter_approval' });
  } catch (e) { /* never throw */ }
}

function sentCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM newsletters WHERE status='sent'").get().n;
}

// Create this month's draft if it doesn't exist yet. Returns the row (or existing).
async function ensureDraft(date, { force = false } = {}) {
  const mk = monthKey(date);
  const existing = db.prepare('SELECT * FROM newsletters WHERE month_key=?').get(mk);
  if (existing && !force) return existing;
  const content = await generateContent(date);
  const mode = sentCount() < APPROVAL_COUNT ? 'approval' : 'auto';
  if (existing) {
    db.prepare("UPDATE newsletters SET subject=?, body_html=?, theme=?, mode=?, status='draft' WHERE id=?")
      .run(content.subject, content.html, content.theme, mode, existing.id);
    return db.prepare('SELECT * FROM newsletters WHERE id=?').get(existing.id);
  }
  const info = db.prepare("INSERT INTO newsletters (month_key, subject, body_html, theme, status, mode) VALUES (?,?,?,?, 'draft', ?)")
    .run(mk, content.subject, content.html, content.theme, mode);
  return db.prepare('SELECT * FROM newsletters WHERE id=?').get(info.lastInsertRowid);
}

// The autonomous monthly runner. Idempotent: one newsletter per calendar month.
// approval mode -> draft + notify admin (no subscriber send). auto mode -> send immediately.
async function monthlySweep(now = new Date()) {
  try {
    if (!mailer.configured()) return;                       // no provider yet -> do nothing
    const mk = monthKey(now);
    const existing = db.prepare('SELECT * FROM newsletters WHERE month_key=?').get(mk);
    if (existing) return;                                   // already handled this month
    const nl = await ensureDraft(now);
    if (nl.mode === 'auto') { await sendToSubscribers(nl); }
    else { notifyApproval(nl); }
  } catch (e) { console.error('newsletter monthlySweep error:', e.message); }
}

module.exports = { monthlySweep, ensureDraft, sendToSubscribers, notifyApproval, recipients, themeFor, monthKey, wrap, generateContent, unsubTokenForSub, sentCount, APPROVAL_COUNT };
