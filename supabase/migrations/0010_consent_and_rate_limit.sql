-- 1. Player consent for custom (scrim) games, and 2. a rate limiter shared by every server instance.
--
-- Riot's policy says a player's custom match history may not be shown publicly unless the player opts in. Coaches
-- only see it inside their own team, but we ask each player anyway: no consent, no custom games (queue 0) stored or shown.

alter table player
  add column custom_games_consent boolean not null default false,
  add column custom_games_consent_at timestamptz;

-- Only the server (through the player's personal link) may change the consent. A coach editing a player, or
-- creating one, can never set it: the values are put back.
create function guard_player_consent() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.custom_games_consent := false;
      new.custom_games_consent_at := null;
    elsif new.custom_games_consent is distinct from old.custom_games_consent
       or new.custom_games_consent_at is distinct from old.custom_games_consent_at then
      new.custom_games_consent := old.custom_games_consent;
      new.custom_games_consent_at := old.custom_games_consent_at;
    end if;
  end if;
  return new;
end $$;

create trigger player_consent_guard before insert or update on player
  for each row execute function guard_player_consent();

-- The demo account's players are fictional: they consent, so the sample scrims stay visible.
update player set custom_games_consent = true, custom_games_consent_at = now()
where owner_id in (select id from auth.users where coalesce((raw_app_meta_data ->> 'is_demo')::boolean, false));

-- Custom games (queue 0) are hidden unless the player consented. Everything else is unchanged from 0008.
-- The queue is read through a SECURITY DEFINER helper: the two policies below would otherwise call each other
-- (match -> player_match -> match) and Postgres would stop with "infinite recursion detected in policy".
create function match_queue(m text) returns int
language sql stable security definer set search_path = public as $$
  select queue_id from match where id = m
$$;
revoke execute on function match_queue(text) from public, anon;
grant execute on function match_queue(text) to authenticated;

drop policy "read player matches" on player_match;
create policy "read player matches" on player_match for select to authenticated
  using (exists (
    select 1 from player p
    where p.id = player_match.player_id and can_read_team(p.team_id)
      and (match_queue(player_match.match_id) <> 0 or p.custom_games_consent)
  ));

drop policy "read team matches" on match;
create policy "read team matches" on match for select to authenticated
  using (exists (
    select 1 from player_match pm join player p on p.id = pm.player_id
    where pm.match_id = match.id and can_read_team(p.team_id)
      and (match.queue_id <> 0 or p.custom_games_consent)
  ));

-- When a player withdraws consent, their stored custom games are deleted (server only).
create function purge_custom_games(p_player uuid) returns int
language plpgsql security definer set search_path = public as $$
declare removed int;
begin
  with gone as (
    delete from player_match pm using match m
    where pm.player_id = p_player and m.id = pm.match_id and m.queue_id = 0
    returning pm.match_id
  )
  select count(*) into removed from gone;
  delete from match m where m.queue_id = 0 and not exists (select 1 from player_match pm where pm.match_id = m.id);
  return removed;
end $$;
revoke execute on function purge_custom_games(uuid) from public, anon, authenticated;
grant execute on function purge_custom_games(uuid) to service_role;

-- Shared rate limiter (fixed window). The in-memory limiter only sees one serverless instance; this one sees them all.
create table rate_limit_hit (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);
alter table rate_limit_hit enable row level security; -- no policies: only the service role can touch it

create function rate_limit_check(p_key text, p_limit int, p_window_seconds int)
returns table (ok boolean, retry_after int)
language plpgsql security definer set search_path = public as $$
declare
  h int;
  ws timestamptz;
begin
  insert into rate_limit_hit as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning r.hits, r.window_start into h, ws;

  if random() < 0.02 then
    delete from rate_limit_hit where window_start < now() - interval '1 day';
  end if;

  ok := h <= p_limit;
  retry_after := case when ok then 0 else greatest(1, ceil(p_window_seconds - extract(epoch from now() - ws))::int) end;
  return next;
end $$;
revoke execute on function rate_limit_check(text, int, int) from public, anon, authenticated;
grant execute on function rate_limit_check(text, int, int) to service_role;
