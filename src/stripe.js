// Stripe subscriptions — test-mode ready.
// Set STRIPE_SECRET_KEY (sk_test_...), STRIPE_PRICE_SOLO / STRIPE_PRICE_FAMILY (price_...),
// and STRIPE_WEBHOOK_SECRET to go live. Without keys, the app runs in "demo billing" mode
// so the whole product is testable before you create a Stripe account.
const db = require('./db');

const KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = KEY ? require('stripe')(KEY) : null;

// Three tiers by number of learners. `envPrice` is the Stripe Price ID (price_...) set in Render.
// `available` is true in demo mode, or in Stripe mode only when that tier's Price ID is configured,
// so a tier never shows a "Subscribe" button it can't actually check out. Existing subscribers keep
// whatever Stripe price their subscription was created with; new prices only affect new checkouts.
const PLANS = {
  solo:   { name: 'Solo',   priceMonthly: 34, kids: 1, envPrice: process.env.STRIPE_PRICE_SOLO },
  family: { name: 'Family', priceMonthly: 54, kids: 4, envPrice: process.env.STRIPE_PRICE_FAMILY }
};
// Attach availability (computed once at load).
for (const key of Object.keys(PLANS)) PLANS[key].available = !KEY || !!PLANS[key].envPrice;

function billingMode() { return stripe ? 'stripe' : 'demo'; }

async function createCheckout(parent, plan, origin) {
  const planKey = PLANS[plan] ? plan : 'family';
  const p = PLANS[planKey];
  if (!stripe) {
    // Demo mode: activate instantly so the full product flow is testable
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
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = process.env.STRIPE_WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  const data = event.data && event.data.object;
  const setStatus = (customerId, status, plan) => {
    const row = db.prepare('SELECT id FROM parents WHERE stripe_customer_id=?').get(customerId);
    if (row) db.prepare('UPDATE parents SET sub_status=?, sub_plan=COALESCE(?, sub_plan) WHERE id=?').run(status, plan || null, row.id);
  };
  switch (event.type) {
    case 'checkout.session.completed':
      setStatus(data.customer, 'active', data.metadata && data.metadata.plan); break;
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
