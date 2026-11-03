-- Indexes for the RLS policy on `match` (looks up player_match by match_id), cascades on
-- player deletes, and the period filter used by the stats functions.
create index if not exists player_match_match_idx on player_match (match_id);
create index if not exists event_participant_player_idx on event_participant (player_id);
create index if not exists match_ended_at_idx on match (ended_at desc);
