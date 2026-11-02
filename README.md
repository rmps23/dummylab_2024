# DummyLab

A management dashboard for **League of Legends** team coaches: keep your teams and players in one place and pull each player's ranked data and match history straight from the Riot Games API.

> Work in progress. Teams, players and match history are working; the schedule and analytics pages are planned next.

## Features

- **Accounts** – sign up and log in with Supabase Auth; change email or delete the account from settings.
- **Teams** – create, edit and remove teams.
- **Players** – add players by Riot ID (`gameName#tagLine`), verified against the Riot Account API before they're saved.
- **Match history** – recent matches, match details and timelines per player (Match-V5), plus ranked entries (League-V4).
- **Regions** – switch the region used for Riot API calls.

## Stack

Next.js 14 (App Router) · React 18 · Tailwind CSS · MUI · Zustand · Supabase (Auth + Postgres) · Riot Games API

## How it's built

- Riot API calls go through Next.js route handlers in `app/api`, so the API key stays on the server.
- Client state (teams, players, user, region) lives in small Zustand stores in `store/`.
- Data fetching and mutations are kept in reusable hooks under `hooks/`.

## Running locally

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_RIOT_API_KEY=...
```

```bash
npm install
npm run dev
```

## History

This is a rewrite of the first version ([dummylab](https://github.com/rmps23/dummylab), 2023), which also had champion pool tracking and a team schedule calendar.
