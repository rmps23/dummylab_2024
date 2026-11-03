# DummyLab

A coaching dashboard for **League of Legends** teams: manage rosters, plan trainings, scrims and matches with each player's availability, and track per-player and per-team stats pulled from the Riot Games API.

**Live demo:** _add the Vercel URL here_ (use the "Try the demo account" button, no sign-up needed)

<!-- Screenshots: docs/home.png, docs/schedule.png, docs/analytics.png -->

## Features

- **Accounts:** email/password sign-up and login with Supabase Auth, change email, delete account.
- **Teams and players:** add players by Riot ID (`gameName#tagLine`), verified against the Riot Account API.
- **Schedule:** month and week calendar with trainings, scrims and matches, weekly repeat, and a per-player availability matrix (available / maybe / unavailable) with a warning when fewer than five players can attend.
- **Analytics:** win rate, KDA, CS/min, damage/min, vision/min and kill participation per player and per team, most played champions, KDA trend, filterable by period and queue (solo, flex, clash, custom/scrims).
- **Match history and ranked:** import recent games per player (Match-V5 with timeline data at 10 and 20 minutes) and ranked entries (League-V4, by PUUID).
- **Dashboard home:** upcoming events, awaiting replies, latest games and solo queue ranks for the active team.
- **Demo account:** one-click login that never exposes credentials to the browser; the account is read-only for email and deletion and is reset daily.

## Stack

Next.js 14 (App Router) · React 18 · Tailwind CSS · MUI · Zustand · Supabase (Auth, Postgres, Row Level Security) · Riot Games API · date-fns · deployed on Vercel.

## How it's built

- The Riot API key stays on the server. Route handlers in `app/api` require a signed-in user, validate input, send the key in the `X-Riot-Token` header and retry on `429`.
- Match import runs server-side in small batches (`/api/players/[id]/sync`); the client calls it until everything is imported.
- Sessions use `@supabase/ssr` cookies, and `middleware.js` protects `/dashboard`.
- The schema, Row Level Security policies and stats functions live in `supabase/migrations`.
- State lives in small Zustand stores (`store/`); data access is in `hooks/`.

## Running locally

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor (or with `supabase db push`).
2. Copy `.env.example` to `.env.local` and fill it in:

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase, Project Settings > API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Same page. **Server only, never expose it.** |
   | `RIOT_API_KEY` | [developer.riotgames.com](https://developer.riotgames.com) (development keys expire every 24 hours) |
   | `DEMO_EMAIL`, `DEMO_PASSWORD` | Any credentials for the demo user |
   | `CRON_SECRET` | Any long random string |

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Optional: create the demo account and sample data with `node --env-file=.env.local scripts/seed-demo.mjs`.

## Deployment

Deploy to Vercel with the same environment variables. `vercel.json` schedules a daily cron that resets the demo account (`/api/cron/reset-demo`). In Supabase, add the site URL under Authentication > URL Configuration.

## Riot Games

DummyLab isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## History

This is a rewrite of the first version ([dummylab](https://github.com/rmps23/dummylab), 2023), which also had champion pool tracking and a team schedule.
