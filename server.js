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

// Stripe webhook needs the raw body — mount BEFORE json parser
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n  🐎 Gallop Learning Academy is running!`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  Billing mode: ${process.env.STRIPE_SECRET_KEY ? 'Stripe (' + (process.env.STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST' : 'LIVE') + ')' : 'demo (no Stripe keys set)'}\n`);
});
