# Testing DummyLab before launch

Use a **separate Supabase project for testing** (the free plan is fine). Never test with the project you will launch on:
the demo reset, test accounts and test invitations would end up in your real data.

## 1. Set up (about 20 minutes)

1. Supabase: create a project. In the SQL editor run `supabase/migrations/0001` to `0008` in order.
2. Supabase > Authentication > URL Configuration: Site URL `http://localhost:3000`, and add
   `http://localhost:3000/auth/callback` to the redirect URLs.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API)
   - `DEMO_EMAIL`, `DEMO_PASSWORD`, `CRON_SECRET`: anything you like
   - Optional, for the Riot import: `RIOT_API_KEY` (development key, expires every 24 hours) and
     `RIOT_ALLOWED_EMAILS=<your email>`
   - Leave `BILLING_ENABLED=false`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the analytics variables empty for now.
4. `node --env-file=.env.local scripts/seed-demo.mjs`, then `npm run dev` and open http://localhost:3000.

Supabase's built-in email sender works for testing but only sends a few emails per hour. If you hit that, turn
**Confirm email** off in Providers > Email while you test everything else, and test the emails separately (section 3).

## 2. Walk through the app

| Area | What to do | Expected |
|---|---|---|
| Demo | Home page > "Try the demo" | Lands on the dashboard with a sample team, win rate, form, events |
| Demo limits | Settings as the demo user | Email change, account deletion and invitations are switched off |
| Sign up | Create an account with an email you own | Asked to check email (or signed in if confirmation is off) |
| Sign in | Sign out, sign in again | Back on the dashboard; a wrong password shows an error |
| Empty state | New account, dashboard | "Get started" steps, no errors |
| Team and players | Create a team, add players (by name if Riot is off) | Free plan: a 2nd team and an 11th player are refused with a clear message |
| Schedule | Create a training and a scrim, set availability | Dots and "x/5 available" update; warning when fewer than 5 |
| Notes | Add notes and goals to a player | Saved; only you see them |
| Analytics and history | Open them with the demo account | Numbers, champion pool, trend; filters work |
| Mobile | Browser at 390 px wide, every page | No sideways scroll, bottom navigation works, buttons are easy to tap |
| Keyboard | Tab through the home page and a dialog | Visible focus, Esc closes dialogs |
| Legal | Footer links | Terms, Privacy and the Riot disclaimer are visible on every page |

## 3. Emails and accounts (needs real inboxes)

| Flow | Steps | Expected |
|---|---|---|
| Confirmation | Sign up with confirmation on, open the email link | Signed in on the dashboard. A second click on the same link: "expired" message |
| Resend | On "Check your email", press "Send the email again" | A new email arrives |
| Password reset | "Forgot your password?", open the link, choose a password | Signed in; old password no longer works. Reusing the link shows "expired" |
| Honeypot | In dev tools, type text in the hidden "Website" field and submit sign-up | Looks like it worked, but no account is created |

## 4. Staff and invitations (use two accounts)

Staff seats are a **Pro** feature. To test them on a free account, set the account to Pro in the SQL editor:

```sql
insert into account (user_id, plan, status)
select id, 'pro', 'active' from auth.users where email = 'YOUR-OWNER-EMAIL';
```

| Step | Expected |
|---|---|
| Owner: Settings > Staff, invite a second email as Staff | Link shown (and emailed if Resend is set up) |
| Open the link signed out | Sign in or create an account, then back on the invitation |
| Open it with the wrong account | "Wrong account" message |
| Accept as the invited person | Team appears in their dashboard, labelled STAFF |
| Staff: create an event, change availability | Works. No add/edit/delete for players or teams |
| Invite a third person as Viewer | Viewer sees everything; "New event" is disabled |
| Owner: remove the staff member | They lose access immediately |
| Free account: try to invite | Refused: "Inviting staff is a Pro feature" |

## 5. Riot (optional, needs a development key)

With `RIOT_ALLOWED_EMAILS` set to your own email: add a real Riot ID, import matches, check stats. Stop the dev server
and break the key on purpose to see the "cannot reach Riot" message instead of a crash. Development keys may not power a
public product: keep `RIOT_ENABLED=false` on anything online.

## 6. Production-like check

1. Vercel: deploy the branch as a **preview** with the test Supabase variables (not the production ones).
2. Run through section 2 again on the preview URL.
3. Share the preview link on LinkedIn Post Inspector, WhatsApp and Discord to check the preview image.
4. `GET /api/health` should answer `{"ok":true,...}`.

## 7. Automated checks (already run for every commit)

```bash
npm test        # 92 tests, including the Row Level Security policies on a real Postgres (PGlite)
npm run lint
npm run build
```

Note down anything odd with the page and what you did: that is enough for me to reproduce and fix it.
