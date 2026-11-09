# Sign-in, email and anti-spam setup

The code is ready. These switches are on your side and are all off or harmless until you do them.

## 1. Emails from your own domain

1. Buy a domain (about 10 EUR a year). A subdomain of one you own also works.
2. [Resend](https://resend.com): add the domain, copy the DNS records to your DNS provider, wait for "Verified".
3. Vercel: set `RESEND_FROM=DummyLab <hello@yourdomain>` and `RESEND_API_KEY`. This is for the weekly report and manual sends.
4. Supabase, **Authentication > Emails > SMTP Settings**: enable custom SMTP with the Resend SMTP details
   (host `smtp.resend.com`, port 465, user `resend`, password = your API key, sender = the same address).
   Without this, Supabase sends from its own address and only a few emails per hour.

## 2. Branded Supabase emails

In **Authentication > Emails > Templates** paste the files from `supabase/email-templates/`:

| Template in Supabase | File |
|---|---|
| Confirm signup | `confirm-signup.html` |
| Reset password | `reset-password.html` |
| Magic link | `magic-link.html` |
| Change email address | `change-email.html` |

## 3. Redirect URLs

**Authentication > URL Configuration**: set Site URL to `https://dummylab.vercel.app` and add
`https://dummylab.vercel.app/auth/callback` (and `http://localhost:3000/auth/callback` for development) to the redirect list.
Turn on **Confirm email** under Providers > Email.

## 4. Spam protection (Cloudflare Turnstile, free)

1. Cloudflare dashboard > Turnstile > add a widget for your domain. Copy the site key and the secret.
2. Vercel: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>`. The widget then appears on the forms.
3. Supabase **Authentication > Attack Protection**: enable CAPTCHA, provider Turnstile, paste the secret.

Heads up: Supabase applies CAPTCHA to every password sign-in, including the server-side one used by the demo account
(`/api/demo-login`). After enabling it, click "Try the demo" on the live site. If it fails with a captcha error, tell me and
I will switch the demo to a server-created session. Until the secret is set in Supabase, the widget is only a front-end check.

The sign-up form also has a hidden honeypot field and asks for at least 8 characters. Both work without any account.

## 5. Uptime check

`GET /api/health` answers 200 when the app and the database respond, and 503 otherwise. Point a free monitor at it
(UptimeRobot, Better Stack). The daily demo reset already writes to the database, which also keeps the free Supabase
project from pausing for inactivity: do not remove it while you are on the free plan.
