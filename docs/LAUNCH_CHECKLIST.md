# Before charging anyone

Payments are **off**: `BILLING_ENABLED=false`, no live Stripe keys, and the Pro plan shows as "coming soon".
Do the list below in order. Prices and terms were checked in November 2026 and change often: re-read the source
before you rely on a number.

## 1. Riot Games (blocks everything)

- [ ] Register the product on the [Developer Portal](https://developer.riotgames.com) (**Register Product**) and wait for approval.
      Text and open questions: [RIOT_REGISTRATION.md](RIOT_REGISTRATION.md).
- [ ] Get a **production key** (a personal or development key may not power a public product). One product per key.
- [ ] Ask Riot whether a subscription is fine. The 2013 API Terms say charging for access to Game Information needs
      written approval; the current policies only require an approved product with a free tier. Pro is built around
      coach features (more teams, availability links, reports, notes) and not around reselling data, which keeps the risk low.
- [ ] Monetisation requires status **Approved** or **Acknowledged**, a free tier, and paid content that adds value
      ("transformative"). No gambling, no MMR/ELO calculators, no de-anonymising players.
- [ ] Ask Riot in the portal whether a coach tracking the players they add (not their own account) fits the approved use cases
      (the policy lists a player's own stats, tournaments, LFG and aggregates). Mention that scrims are custom games shown only
      inside the team, and that each player can be asked for consent through the availability link. RSO (Riot Sign On) is only
      available with a production key, and Riot contacts you about it once the key is approved.
- [ ] Never show custom (scrim) games publicly. Keep the Riot disclaimer visible (it is in every footer).
- [ ] Every new feature has to be audited through the product page. Staff invitations (migration 0008) and the new homepage are new since the last audit.
- [ ] Then set `RIOT_ENABLED=true` on Vercel and replace `RIOT_API_KEY` with the production key.

## 2. Legal pages

- [ ] Have `/terms` and `/privacy` reviewed (they are plain-language drafts). Add the legal entity or your name, a
      real contact email, and refund/cancellation terms for Pro.
- [ ] Decide who is the data controller. You store Riot IDs and match data of players who are not your users:
      keep the deletion path (`scripts/delete-player-data.mjs`) and a contact address that answers.
- [ ] If you sell to consumers in the EU, add the right of withdrawal wording and your VAT details to the checkout.

## 2b. Sign-in, email and spam (code is ready, switches are yours)

Follow [AUTH_AND_EMAIL.md](AUTH_AND_EMAIL.md):

- [ ] Buy a domain and verify it in Resend (emails cannot be sent from `vercel.app`).
- [ ] Turn on custom SMTP in Supabase and paste the branded templates from `supabase/email-templates/`.
- [ ] Set the Site URL and the `/auth/callback` redirect in Supabase, and turn on **Confirm email**.
- [ ] Create a Cloudflare Turnstile widget, set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, enable CAPTCHA in Supabase, then test "Try the demo".
- [ ] Test the full loop with a real inbox: sign up, confirm, sign out, reset the password, invite a staff member and accept.

## 3. Hosting and commercial terms

- [ ] **Vercel**: the Hobby plan is for personal, non-commercial use only. To charge, move to **Pro** (about $20 per user
      per month). [Plan terms](https://vercel.com/docs/plans/hobby).
- [ ] **Supabase**: the Free plan pauses projects with low activity after 7 days and caps the database at 500 MB. Pro is
      about $25 per month plus compute and is never auto-paused. [Pausing](https://supabase.com/docs/guides/platform/free-project-pausing).
      Confirm commercial use in Supabase's terms.
- [ ] Cheaper or free alternatives to evaluate before paying for both: Cloudflare Pages or Netlify for the Next.js app,
      Neon or a small VPS for Postgres (this would mean replacing Supabase Auth and RLS, so it is a real migration).
      Not evaluated here.
- [ ] Resend free plan is enough to start (verify a sending domain, then set `RESEND_FROM`).

## 4. Stripe (test mode first)

- [ ] Create two products in **test mode**: "DummyLab Pro" (3 EUR per month, 30 EUR per year) and "DummyLab Academy" (9 EUR per month, 90 EUR per year), each with a monthly and a yearly recurring price.
- [ ] Set `STRIPE_SECRET_KEY` (sk_test), `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_ACADEMY_MONTHLY`, `STRIPE_PRICE_ACADEMY_YEARLY` and `BILLING_ENABLED=true`.
- [ ] Add a webhook endpoint `https://<your-site>/api/billing/webhook` for `customer.subscription.created`,
      `customer.subscription.updated` and `customer.subscription.deleted`, and set `STRIPE_WEBHOOK_SECRET`.
      Locally: `stripe listen --forward-to localhost:3000/api/billing/webhook`.
- [ ] Enable the **customer portal** in Stripe (cancel, change card, invoices) and allow customers to **switch plans** between Pro and Academy: upgrades for people who already pay go through the portal.
- [ ] Test with card `4242 4242 4242 4242`: subscribe, see the plan switch to Pro, use the portal, cancel, see it fall back to Free.
- [ ] Activate the Stripe account (identity and bank details), then repeat with live keys. Review VAT collection
      (Stripe Tax or manual) with your accountant.

## 5. Database

- [ ] Run `supabase/migrations/0001` to `0008` in order. `0006` creates the plan limits, `0007` the notification settings and `0008` staff access (team members, invitations, staff seats) and `0009` the three plans (Free, Pro, Academy). The policies are tested in `tests/rls.test.js`.
- [ ] Run `node --env-file=.env.local scripts/seed-demo.mjs` so the demo account is Pro and has notes.
- [ ] Rotate the Supabase secret key and any key that was ever pasted in a chat or ticket.

## 6. Portugal: tax and invoicing

Not tax advice: confirm with a contabilista or the Autoridade Tributária.

- [ ] **Start the activity** at the Finanças (Portal das Finanças, início de atividade) with a CAE for software or web
      services, and register at Segurança Social as an independent worker if you are not already covered.
- [ ] **VAT**: the special exemption (article 53 of the CIVA) applies while the previous year's turnover is under
      €15,000 (the 2026 figure in the sources I found; check the current one). Invoices must carry the exemption
      note and the exemption reason code M10 in certified software. You cannot deduct VAT on expenses while exempt.
      Above the limit you move to the normal regime from 1 January of the following year.
- [ ] **EU customers**: selling digital services to consumers in other EU countries has its own VAT rules (One-Stop Shop,
      thresholds). Ask your accountant before the first foreign customer.
- [ ] **Invoicing**: issue a certified invoice or receipt for every payment. Stripe receipts are not enough on their own.
      Use certified invoicing software or the free Portal das Finanças invoicing, and decide whether to automate it.
- [ ] **Income tax (IRS)**: simplified regime is the default for independent workers; set aside part of each payment.

## 7. Operations

- [ ] A support email address and a response routine. Put it in the terms and privacy pages.
- [ ] Monitoring: point a free uptime monitor at `https://dummylab.vercel.app/api/health`. Watch Vercel logs and Stripe webhook
      failures. Error tracking (Sentry free plan) is **not set up yet**: it needs your account and a DSN. Backups: Supabase Pro
      daily backups or your own dump.
- [ ] Analytics: create an Umami account (cloud free plan) and set `NEXT_PUBLIC_ANALYTICS_SRC` and `NEXT_PUBLIC_ANALYTICS_ID`.
- [ ] Search: add the domain to Google Search Console and submit `/sitemap.xml`.
- [ ] While you stay on the free Supabase plan, keep the daily demo reset cron: its writes also stop the project pausing.
- [ ] Update the README link, screenshots and the About text once the price is live.

## Switches at a glance

| Variable | Off | On |
|---|---|---|
| `RIOT_ENABLED` | `false` (only `RIOT_ALLOWED_EMAILS`) | `true` after the production key |
| `BILLING_ENABLED` | `false` (Pro shows "coming soon") | `true` with Stripe keys and prices |
| `RESEND_API_KEY` | empty (email routes answer 503) | set, with a verified domain |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | empty (no widget) | set, plus CAPTCHA enabled in Supabase |
| `NEXT_PUBLIC_ANALYTICS_SRC` / `_ID` | empty (no analytics) | Umami script URL and website id |
