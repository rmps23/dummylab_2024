# Riot product registration checklist

DummyLab uses the Riot Games API. A development or personal key may not power a public product, so Riot
features are off by default for everyone except allow-listed accounts (`RIOT_ALLOWED_EMAILS`) until a
production key is approved (then set `RIOT_ENABLED=true`).

Rules checked against the [General Policies](https://developer.riotgames.com/policies/general) and the
[portal docs](https://developer.riotgames.com/docs/portal) (re-read them before submitting; they change).

## Before you submit

- [ ] Website complete and public: landing, privacy policy (`/privacy`), terms (`/terms`), working demo.
- [ ] Riot disclaimer visible in the app (footer of every page).
- [ ] A free tier exists. Paid features must add value on top of the data (planning, notes, reports), not resell it.
- [ ] No MMR/ELO calculators, no hidden-information tools, no de-anonymising of players.
- [ ] Custom (scrim) games are never shown publicly.
- [ ] Key stays on the server (`RIOT_API_KEY`), HTTPS only, one product per production key.
- [ ] 429 responses are honoured (`Retry-After`), per-user rate limits are in place.
- [ ] A way to delete a player's data on request: `scripts/delete-player-data.mjs <puuid>`.

## Where to register

Developer Portal > **Register Product** > choose the project type, fill the form, verify the product. Riot's
Developer Relations reviews it. Each new feature must also be audited through the product page.

## Status

- Production application submitted on 2026-11-09: App ID 904656, URL verified with `public/riot.txt`, status **Pending Review**.
- A support ticket was sent with the monetization note and three questions: monetization needs, the coach-follows-added-players
  use case, and whether a player opt-in is enough for custom (scrim) games or RSO is required.
- Riot data import stays off for public accounts (`RIOT_ENABLED=false`) until the product is Approved.

## What the policy says that matters here

Source: the League of Legends Developer API Policy on the support site.

- Monetization needs status Approved or Acknowledged, a free tier, content that is transformative, and a fair price. Subscriptions are
  an accepted way to charge. No betting or gambling.
- No MMR or ELO calculators, no de-anonymising players, no historic Riot IDs.
- A player's custom match history may not be shown publicly unless the player opts in; otherwise it is for that player only (RSO).
  DummyLab stores and shows custom games (queue 0) only for players who opt in through their availability link (migration 0010),
  and deletes them when the player turns it off.
- Listed approved use cases are a player's own stats, tournaments, LFG and aggregates. A coach following the players they add is not
  listed: that is why the question was sent.
- RSO (Riot Sign On) needs a production key; Riot contacts the developer in the portal after approval.

## Text used in the form

**Product:** DummyLab. **URL:** https://dummylab.vercel.app. **Game:** League of Legends. **Tournaments:** No.

**Description:** a coaching and team-management tool for amateur and semi-professional teams and academies. A coach adds the players of their own
team by Riot ID, plans trainings, scrims and matches with each player's availability, and sees per-player and per-team statistics built from
those players' match history. Coaches can invite staff. APIs: Account-V1 (Riot ID to PUUID), Match-V5 (match list, match, timeline, imported in
small batches on demand, Retry-After honoured, per-user and shared rate limits) and League-V4 by PUUID (rank snapshot). Static data from
Data Dragon. No tournaments, betting or MMR estimation. Free plan permanent; paid plans (3 and 9 euros per month) only add capacity and
convenience and only cover running costs; payments stay off until Approved.

## If Riot answers

- Approved or Acknowledged: set `RIOT_ENABLED=true` and replace `RIOT_API_KEY` with the production key on Vercel, then follow
  LAUNCH_CHECKLIST.md section 4 (Stripe).
- If Riot asks for RSO: players would link their own Riot account (consent by design) and custom games would be shown only with it.
- If Riot asks for changes to the description or features, update the product page: every new feature has to be audited there.
