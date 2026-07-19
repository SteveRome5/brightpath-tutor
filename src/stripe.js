// Stripe subscriptions — test-mode ready.
// Set STRIPE_SECRET_KEY (sk_test_...), STRIPE_PRICE_SOLO / STRIPE_PRICE_FAMILY (price_...),
// and STRIPE_WEBHOOK_SECRET to go live. Without keys, the app runs in "demo billing" mode
// so the whole product is testable before you create a Stripe account.
const db = require('./db');

const KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = KEY ? require('stripe')(KEY) : null;

const PLANS = {
  solo:   { name: 'Solo Learner',  priceMonthly: 19, kids: 1,  envPrice: process.env.STRIPE_PRICE_SOLO },
  family: { name: 'Family',        priceMonthly: 29, kids: 4,  envPrice: process.env.STRIPE_PRICE_FAMILY }
};

function billingMode() { return stripe ? 'stripe' : 'demo'; }

async function createCheckout(parent, plan, origin) {
  const p = PLANS[plan] || PLANS.family;
  if (!stripe) {
    // Demo mode: activate instantly so the full product flow is testable
    db.prepare("UPDATE parents SET sub_status='active', sub_plan=? WHERE id=?").run(plan, parent.id);
    return { demo: true, url: origin + '/?billing=success' };
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
