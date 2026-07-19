# Gallop Learning Academy 🐎

Adaptive K–12 tutoring in Math, English, Science & Spanish — live at [learnwithgallop.com](https://learnwithgallop.com).

A placement quiz finds each student's true level in every subject independently. Every answer then adapts what comes next: mastered skills accelerate, shaky skills get gentler questions, more hints, and extra reps. Kids earn play tokens for an arcade (including entrepreneurship games like Lemonade Tycoon and Market Mogul), coins for avatar customization, badges, certificates, and a daily quest streak. Parents get report cards, letter grades, and parent-approved-only buddy connections. Every answer ends with a real-world "why this matters" — built to raise critical thinkers.

## Stack

Node.js / Express 5 · better-sqlite3 (WAL) · vanilla JS SPA · Stripe subscriptions · PWA (installable on iPad)

## Run locally

```bash
npm install
node server.js
# → http://localhost:3000  (demo billing mode — no Stripe keys needed)
```

Environment (production): `STRIPE_SECRET_KEY`, `STRIPE_PRICE_SOLO`, `STRIPE_PRICE_FAMILY`, `STRIPE_WEBHOOK_SECRET`, `DATA_DIR`, `NODE_ENV=production`.

© Lotus Farms LLC. All rights reserved. This repository is source-available for transparency; the product and content are proprietary.
