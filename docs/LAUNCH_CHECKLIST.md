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
- [ ] Never show custom (scrim) games publicly. Keep the Riot disclaimer visible (it is in every footer).
- [ ] Every new feature has to be audited through the product page.
- [ ] Then set `RIOT_ENABLED=true` on Vercel and replace `RIOT_API_KEY` with the production key.

## 2. Legal pages

- [ ] Have `/terms` and `/privacy` reviewed (they are plain-language drafts). Add the legal entity or your name, a
      real contact email, and refund/cancellation terms for Pro.
- [ ] Decide who is the data controller. You store Riot IDs and match data of players who are not your users:
      keep the deletion path (`scripts/delete-player-data.mjs`) and a contact address that answers.
- [ ] If you sell to consumers in the EU, add the right of withdrawal wording and your VAT details to the checkout.

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

- [ ] Create the product "DummyLab Pro" with two recurring prices (€9 per month, €90 per year) in **test mode**.
- [ ] Set `STRIPE_SECRET_KEY` (sk_test), `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `BILLING_ENABLED=true`.
- [ ] Add a webhook endpoint `https://<your-site>/api/billing/webhook` for `customer.subscription.created`,
      `customer.subscription.updated` and `customer.subscription.deleted`, and set `STRIPE_WEBHOOK_SECRET`.
      Locally: `stripe listen --forward-to localhost:3000/api/billing/webhook`.
- [ ] Enable the **customer portal** in Stripe (cancel, change card, invoices).
- [ ] Test with card `4242 4242 4242 4242`: subscribe, see the plan switch to Pro, use the portal, cancel, see it fall back to Free.
- [ ] Activate the Stripe account (identity and bank details), then repeat with live keys. Review VAT collection
      (Stripe Tax or manual) with your accountant.

## 5. Database

- [ ] Run `supabase/migrations/0001` to `0007` in order. `0006` creates the plan limits and `0007` the notification settings.
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
- [ ] Monitoring: Vercel logs and Stripe webhook failures. Backups: Supabase Pro daily backups or your own dump.
- [ ] Update the README link, screenshots and the About text once the price is live.

## Switches at a glance

| Variable | Off | On |
|---|---|---|
| `RIOT_ENABLED` | `false` (only `RIOT_ALLOWED_EMAILS`) | `true` after the production key |
| `BILLING_ENABLED` | `false` (Pro shows "coming soon") | `true` with Stripe keys and prices |
| `RESEND_API_KEY` | empty (email routes answer 503) | set, with a verified domain |
