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

## Text to adapt for the form

**Product:** DummyLab, a coaching dashboard for amateur and semi-professional League of Legends teams.

**What it does:** lets a coach manage teams and players, plan trainings, scrims and matches with each player's
availability, and see per-player and per-team statistics (win rate, KDA, CS per minute, damage and vision per
minute, champion pool) built from the match history of the players the coach added.

**API usage:** Account-V1 (Riot ID to PUUID, one call when adding a player), Match-V5 (match list, match and
timeline of the added players, imported in small batches on demand), League-V4 by PUUID (rank snapshot, cached
for 10 minutes). Static assets come from Data Dragon.

**Why it helps players:** it helps teams organise practice and track improvement over time.

## Open questions for Riot

- The 2013 API Terms say charging for access to Game Information needs prior written approval, while the
  current policies only require an approved or acknowledged product. Ask which applies to a subscription for
  team-management features.
- Retention: no maximum period is documented. State what is kept (see `/privacy`) and ask if any limit applies.
