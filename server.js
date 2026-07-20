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
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

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
app.use(express.static(path.join(__dirname, 'public')));

// Legal pages as real, crawlable URLs (ad review + search engines need standalone pages,
// not #hash routes). The SPA keeps its #privacy/#terms aliases for in-app navigation.
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));

// SPA fallback
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n  🐎 Gallop Learning Academy is running!`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  Billing mode: ${process.env.STRIPE_SECRET_KEY ? 'Stripe (' + (process.env.STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE') + ')' : 'demo (no Stripe keys set)'}\n`);
});
