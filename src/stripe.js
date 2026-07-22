// Stripe subscriptions — test-mode ready.
// Set STRIPE_SECRET_KEY (sk_test_...), STRIPE_PRICE_SOLO / STRIPE_PRICE_FAMILY (price_...),
// and STRIPE_WEBHOOK_SECRET to go live. Without keys, the app runs in "demo billing" mode
// so the whole product is testable before you create a Stripe account.
const db = require('./db');

const KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = KEY ? require('stripe')(KEY) : null;
// Demo billing grants a paid plan with no payment — safe for local/testing only. It must
// never run in production, or any signed-in parent could grant themselves free access by
// clicking Subscribe. Allowed only when Stripe is unconfigured AND we are not in production
// (or an explicit opt-in flag is set).
const DEMO_BILLING_OK = !stripe && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_BILLING === '1');
if (!stripe && process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_BILLING !== '1') {
  console.warn('  ⚠  Stripe is not configured in production. Billing is DISABLED (no demo grants). Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET.');
}
if (stripe && !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('  ⚠  STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing. Webhooks will be REJECTED until it is configured (subscriptions will not activate).');
}

// Two tiers by number of learners. `envPrice` is the Stripe Price ID (price_...) set in Render.
// `available` is true in demo mode, or in Stripe mode only when that tier's Price ID is configured,
// so a tier never shows a "Subscribe" button it can't actually check out. Existing subscribers keep
// whatever Stripe price their subscription was created with; new prices only affect new checkouts.
const PLANS = {
  solo:   { name: 'Solo',   priceMonthly: 34, kids: 1, envPrice: process.env.STRIPE_PRICE_SOLO },
  family: { name: 'Family', priceMonthly: 54, kids: 4, envPrice: process.env.STRIPE_PRICE_FAMILY }
};
// Attach availability (computed once at load).
for (const key of Object.keys(PLANS)) PLANS[key].available = !KEY || !!PLANS[key].envPrice;

// Three honest states so the UI never shows dev-only copy to a real user:
//  'stripe'   — real payments configured
//  'demo'     — no keys AND demo grants allowed (local/dev only)
//  'disabled' — no keys in production (billing genuinely unavailable; fail closed)
// In production with Stripe unset, this returns 'disabled', so the parent UI shows neutral
// copy instead of leaking "demo billing / Set STRIPE_SECRET_KEY".
function billingMode() { return stripe ? 'stripe' : (DEMO_BILLING_OK ? 'demo' : 'disabled'); }

async function createCheckout(parent, plan, origin) {
  const planKey = PLANS[plan] ? plan : 'family';
  const p = PLANS[planKey];
  if (!stripe) {
    if (!DEMO_BILLING_OK) {
      return { error: 'Payments are not available right now. Please contact support@learnwithgallop.com.' };
    }
    // Demo mode (non-production only): activate instantly so the full product flow is testable
    db.prepare("UPDATE parents SET sub_status='active', sub_plan=? WHERE id=?").run(planKey, parent.id);
    return { demo: true, url: origin + '/?billing=success' };
  }
  if (!p.envPrice) {
    // Live mode but this tier's Stripe Price ID isn't configured yet — fail loudly instead of
    // creating a broken checkout session.
    return { error: `The ${p.name} plan is not available yet. Please try another plan or contact support@learnwithgallop.com.` };
  }
  let customerId = parent.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: parent.email, name: parent.name, metadata: { parent_id: String(parent.id) } });
    customerId = customer.id;
    db.prepare('UPDATE parents SET stripe_customer_id=? WHERE id=?').run(customerId, parent.id);
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: p.envPrice, quantity: 1 }],
    success_url: origin + '/?billing=success',
    cancel_url: origin + '/?billing=canceled',
    metadata: { parent_id: String(parent.id), plan }
  });
  return { url: session.url };
}

async function createPortal(parent, origin) {
  if (!stripe) return { demo: true, url: origin + '/#parent' };
  const session = await stripe.billingPortal.sessions.create({
    customer: parent.stripe_customer_id,
    return_url: origin + '/#parent'
  });
  return { url: session.url };
}

// Webhook: keeps sub_status in sync with Stripe
function webhookHandler(req, res) {
  if (!stripe) return res.json({ received: true, demo: true });
  // Never trust an unsigned webhook body. In Stripe mode the signing secret is mandatory:
  // without it, anyone could POST a forged "checkout.session.completed" and grant themselves
  // (or cancel a paying customer's) subscription. Reject rather than JSON.parse.
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Webhook not configured');
  }
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // Idempotency: Stripe may deliver the same event more than once (and out of order). Record
  // each event id first; if we've already processed it, acknowledge and stop so a re-delivery
  // never flips a subscription twice or re-sends the welcome email.
  try {
    const ins = db.prepare('INSERT OR IGNORE INTO webhook_events (event_id, type) VALUES (?,?)').run(event.id, event.type);
    if (ins.changes === 0) return res.json({ received: true, duplicate: true });
  } catch (e) { /* if the dedup store is unavailable, fall through and process (best effort) */ }
  const data = event.data && event.data.object;
  const setStatus = (customerId, status, plan) => {
    const row = db.prepare('SELECT id FROM parents WHERE stripe_customer_id=?').get(customerId);
    if (row) db.prepare('UPDATE parents SET sub_status=?, sub_plan=COALESCE(?, sub_plan) WHERE id=?').run(status, plan || null, row.id);
  };
  switch (event.type) {
    case 'checkout.session.completed': {
      setStatus(data.customer, 'active', data.metadata && data.metadata.plan);
      // Welcome-to-paid email (fire-and-forget; never fails the webhook)
      try {
        const mailer = require('./mailer');
        const row = db.prepare('SELECT * FROM parents WHERE stripe_customer_id=?').get(data.customer);
        if (row) mailer.sendWelcomePaid(row, (PLANS[(data.metadata && data.metadata.plan) || row.sub_plan] || {}).name);
      } catch (e) { /* ignore */ }
      break;
    }
    case 'invoice.payment_failed':
      setStatus(data.customer, 'past_due'); break;
    case 'customer.subscription.deleted':
      setStatus(data.customer, 'canceled'); break;
    case 'customer.subscription.updated':
      setStatus(data.customer, data.status === 'active' ? 'active' : data.status); break;
  }
  res.json({ received: true });
}

module.exports = { PLANS, billingMode, createCheckout, createPortal, webhookHandler };
