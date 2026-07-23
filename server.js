// BrightPath Tutor — full-stack server
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const routes = require('./src/routes');
const { webhookHandler } = require('./src/stripe');

const app = express();
const PORT = process.env.PORT || 3000;
// Behind a hosting proxy (Render/Railway/Fly), trust X-Forwarded-* so
// secure cookies and req.protocol work correctly over HTTPS.
// Always trust the first proxy hop: Render fronts the app with exactly one proxy, and
// req.ip must resolve to the real client for the rate limiter to be unspoofable.
app.set('trust proxy', 1);

// Security headers (dependency-free). The SPA relies on inline onclick/style attributes,
// so script/style must allow 'unsafe-inline'; the remaining directives still block
// clickjacking, MIME sniffing, plugin/object embeds, and cross-origin data exfiltration.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'"
  ].join('; '));
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Stripe webhook needs the raw body — mount BEFORE json parser
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

// QA / staging launchpad — mounts ONLY when QA_MODE=1 and QA_KEY are set (i.e. on the
// isolated staging service). Never active on production unless explicitly enabled there.
const qa = require('./src/qa');
if (qa.enabled()) {
  app.use('/qa', qa.buildRouter());
  console.log('[qa] staging launchpad enabled at /qa');
}

app.use(express.static(path.join(__dirname, 'public')));

// Legal pages as real, crawlable URLs (ad review + search engines need standalone pages,
// not #hash routes). The SPA keeps its #privacy/#terms aliases for in-app navigation.
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));

// SPA fallback
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Lapsed-practice nudges: hourly sweep, only when an email provider is configured
// (otherwise we'd mark kids as nudged while the emails sit in the queue unsent).
const mailer = require('./src/mailer');
if (mailer.configured()) {
  setInterval(() => mailer.nudgeSweep(), 60 * 60 * 1000).unref?.();
  setTimeout(() => mailer.nudgeSweep(), 90 * 1000).unref?.();
  // Weekly parent report — autonomous. Runs every 6h; the email_log 7-day de-dup means each
  // parent gets at most one digest per week no matter how often the timer fires or restarts.
  setInterval(() => mailer.weeklyReportSweep(), 6 * 60 * 60 * 1000).unref?.();
  setTimeout(() => mailer.weeklyReportSweep(), 120 * 1000).unref?.();

  // Trial conversion sequence — "your trial ends soon / has ended, add a card." Checked every
  // 3h; idempotent via email_log so each account gets each nudge at most once. This is the
  // core trial→paid lever, so it runs independently of whether the child is active.
  setInterval(() => mailer.trialSweep(), 3 * 60 * 60 * 1000).unref?.();
  setTimeout(() => mailer.trialSweep(), 150 * 1000).unref?.();

  // Monthly newsletter — autonomous & school-year-calendar themed. Checked daily; the
  // one-row-per-month guard makes it idempotent, so it drafts/sends exactly once a month.
  // The first NEWSLETTER_APPROVAL_COUNT go to the admin as a draft for approval; then it
  // sends on its own.
  const newsletter = require('./src/newsletter');
  setInterval(() => newsletter.monthlySweep(), 24 * 60 * 60 * 1000).unref?.();
  setTimeout(() => newsletter.monthlySweep(), 150 * 1000).unref?.();
}

// Inbound support@ auto-responder — polls the support mailbox over IMAP and answers or
// escalates each new parent email. Dormant until SUPPORT_IMAP_USER + SUPPORT_IMAP_PASSWORD
// are set, so this is a no-op until the mailbox is connected.
const inbound = require('./src/inbound');
if (inbound.configured()) {
  setInterval(() => inbound.pollOnce(), 2 * 60 * 1000).unref?.();
  setTimeout(() => inbound.pollOnce(), 40 * 1000).unref?.();
  console.log('[inbound] support@ auto-responder enabled');
}

// Automated database backups — every 6 hours, plus one shortly after boot. Timestamped
// snapshots land on the persistent disk (DATA_DIR/backups) and survive redeploys.
const db = require('./src/db');
if (typeof db.backupNow === 'function') {
  setInterval(() => db.backupNow(), 6 * 60 * 60 * 1000).unref?.();
  setTimeout(() => db.backupNow(), 60 * 1000).unref?.();
}

app.listen(PORT, () => {
  console.log(`\n  🐎 Gallop Learning Academy is running!`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  Billing mode: ${process.env.STRIPE_SECRET_KEY ? 'Stripe (' + (process.env.STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE') + ')' : 'demo (no Stripe keys set)'}\n`);
});
