# 🚀 Launching BrightPath on romeedge.com

## Where things stand

- **The app is finished and production-hardened** (secure cookies, proxy-aware HTTPS, Render blueprint included).
- **romeedge.com is currently a Wix site.** Wix can only host pages, not apps — so the app will live on Render (a app-hosting service, ~$7/mo) and your domain will point at it. You keep the domain; the old racing site simply gets replaced.
- Payments will run through Stripe **under your LLC**, as proper monthly subscriptions created inside the app's checkout — every charge maps to a family account with real logins. (Standalone payment links can't unlock accounts automatically, so we won't use those.)

## The 10-minute launch session (I drive, you approve)

Grab me when you're at the computer and say "let's launch." With your browser connected I'll walk it click-by-click:

1. **Render account** (render.com) — sign up with your email, add a card ($7/mo Starter).
2. **Deploy** — I hand Render the code via the included blueprint; it builds and gives us a live URL like brightpath-tutor.onrender.com within minutes.
3. **Custom domain** — in Render we add romeedge.com + www.romeedge.com; in your Wix account (Domains → DNS records) we set the A record and CNAME Render shows us. The site flips over within an hour, HTTPS certificate is automatic.
4. **Stripe (LLC)** — in your Stripe dashboard: create two subscription products at the prices shown on the site, **Solo $34/mo and Family $54/mo** (these must match the app copy exactly, or customers get charged a different amount than advertised). Copy the two price IDs + secret key **and the webhook signing secret (`STRIPE_WEBHOOK_SECRET`)** into Render's environment settings, and add the webhook at `https://learnwithgallop.com/api/billing/webhook`. Note: in production the app now **requires** Stripe keys to charge (no demo-billing fallback), and webhooks without the signing secret are rejected, so subscriptions only activate once `STRIPE_WEBHOOK_SECRET` is set.
5. **Smoke test** — we create your real parent account, add Margaux, and run one lesson live on romeedge.com.

## Monthly costs when live

- Render Starter: $7/mo (app + database)
- Domain renewal: whatever Wix charges yearly (you may be able to cancel the Wix *site* plan and keep just the domain — we'll check in your account)
- Stripe: no monthly fee; 2.9% + 30¢ per transaction

## Later (optional, not needed for launch)

- A kid-friendlier domain (e.g. brightpathtutor.com, ~$12/yr) can be added alongside romeedge.com anytime.
- Terms of Service + Privacy Policy pages — worth having before marketing broadly since the users are children (COPPA: the parent creates the account and consents, which the flow already does, but written policies make it proper). I can draft these.
- Automatic database backups off Render's disk.
