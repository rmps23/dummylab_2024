-- Players can exist without a linked Riot account (Riot lookups are optional and may be disabled).
alter table player alter column riot_id drop not null;
alter table player alter column riot_puuid drop not null;

-- When the last player_match pointing at a match is deleted, delete the match too, so deleting a
-- player (or their data on request) leaves no orphaned game data behind.
create or replace function delete_orphan_match() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from match m
  where m.id = old.match_id
    and not exists (select 1 from player_match pm where pm.match_id = m.id);
  return old;
end $$;

drop trigger if exists player_match_orphan_cleanup on player_match;
create trigger player_match_orphan_cleanup
  after delete on player_match for each row execute function delete_orphan_match();
