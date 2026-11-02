-- DummyLab schema. Run with the Supabase CLI (`supabase db push`) or paste it in the SQL editor.

create table role (
  id smallint primary key,
  name text not null,
  image_link text
);
insert into role (id, name) values
  (1, 'Top'), (2, 'Jungler'), (3, 'Mid'), (4, 'Bottom'), (5, 'Support');

create table team (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table player (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  team_id bigint not null references team (id) on delete cascade,
  role_id smallint not null references role (id),
  name text not null check (char_length(name) between 1 and 40),
  region text not null,
  riot_id text not null,
  riot_puuid text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (team_id, riot_puuid)
);
create index player_owner_idx on player (owner_id);
create index player_team_idx on player (team_id);

-- One row per Riot match; written by the server (service role) only.
create table match (
  id text primary key,
  queue_id int not null,
  patch text,
  duration int not null,
  ended_at timestamptz not null,
  draft jsonb not null default '[]'::jsonb
);

create table player_match (
  id bigint generated always as identity primary key,
  player_id uuid not null references player (id) on delete cascade,
  match_id text not null references match (id) on delete cascade,
  champion text not null,
  position text,
  win boolean not null,
  kills int not null default 0,
  deaths int not null default 0,
  assists int not null default 0,
  cs int not null default 0,
  gold int not null default 0,
  damage int not null default 0,
  damage_taken int not null default 0,
  vision_score int not null default 0,
  wards_placed int not null default 0,
  wards_killed int not null default 0,
  turret_kills int not null default 0,
  kill_part real,
  team_damage_pct real,
  items int[] not null default '{}',
  summoner_spells int[] not null default '{}',
  timeline jsonb not null default '{}'::jsonb,
  unique (player_id, match_id)
);
create index player_match_player_idx on player_match (player_id);

create table rank_snapshot (
  player_id uuid not null references player (id) on delete cascade,
  queue text not null,
  tier text,
  rank text,
  lp int,
  wins int,
  losses int,
  fetched_at timestamptz not null default now(),
  primary key (player_id, queue)
);

create table event (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  team_id bigint not null references team (id) on delete cascade,
  type text not null check (type in ('training', 'scrim', 'match', 'other')),
  title text not null check (char_length(title) between 1 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  opponent text,
  notes text,
  link text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index event_team_start_idx on event (team_id, starts_at);

create table event_participant (
  event_id bigint not null references event (id) on delete cascade,
  player_id uuid not null references player (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'available', 'maybe', 'unavailable')),
  note text,
  primary key (event_id, player_id)
);

-- New events start with every team player as "pending".
create function add_event_participants() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into event_participant (event_id, player_id)
  select new.id, p.id from player p where p.team_id = new.team_id
  on conflict do nothing;
  return new;
end $$;

create trigger event_participants_after_insert
  after insert on event for each row execute function add_event_participants();

-- Row level security ---------------------------------------------------------
alter table role enable row level security;
alter table team enable row level security;
alter table player enable row level security;
alter table match enable row level security;
alter table player_match enable row level security;
alter table rank_snapshot enable row level security;
alter table event enable row level security;
alter table event_participant enable row level security;

create policy "roles readable" on role for select to authenticated using (true);

create policy "own teams" on team for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "own players" on player for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from team t where t.id = team_id and t.owner_id = (select auth.uid()))
  );

create policy "own player matches" on player_match for select to authenticated
  using (exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid())));

create policy "matches of own players" on match for select to authenticated
  using (exists (
    select 1 from player_match pm join player p on p.id = pm.player_id
    where pm.match_id = match.id and p.owner_id = (select auth.uid())
  ));

create policy "own rank" on rank_snapshot for select to authenticated
  using (exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid())));

create policy "own events" on event for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from team t where t.id = team_id and t.owner_id = (select auth.uid()))
  );

create policy "own event participants" on event_participant for all to authenticated
  using (exists (select 1 from event e where e.id = event_id and e.owner_id = (select auth.uid())))
  with check (
    exists (select 1 from event e where e.id = event_id and e.owner_id = (select auth.uid()))
    and exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid()))
  );

-- Stats (security invoker: RLS applies) --------------------------------------
create function player_stats(
  p_team bigint default null,
  p_player uuid default null,
  p_since timestamptz default null,
  p_queue int default null
) returns table (
  player_id uuid, games bigint, wins bigint,
  kills bigint, deaths bigint, assists bigint,
  cs bigint, minutes numeric, damage bigint, vision bigint,
  avg_kill_part numeric
)
language sql stable security invoker as $$
  select pm.player_id,
         count(*), count(*) filter (where pm.win),
         sum(pm.kills), sum(pm.deaths), sum(pm.assists),
         sum(pm.cs), round(sum(m.duration) / 60.0, 1), sum(pm.damage), sum(pm.vision_score),
         round(avg(pm.kill_part)::numeric, 3)
  from player_match pm
  join match m on m.id = pm.match_id
  join player p on p.id = pm.player_id
  where (p_team is null or p.team_id = p_team)
    and (p_player is null or pm.player_id = p_player)
    and (p_since is null or m.ended_at >= p_since)
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.player_id
$$;

create function champion_stats(
  p_team bigint default null,
  p_player uuid default null,
  p_since timestamptz default null,
  p_queue int default null
) returns table (
  champion text, games bigint, wins bigint,
  kills bigint, deaths bigint, assists bigint
)
language sql stable security invoker as $$
  select pm.champion, count(*), count(*) filter (where pm.win),
         sum(pm.kills), sum(pm.deaths), sum(pm.assists)
  from player_match pm
  join match m on m.id = pm.match_id
  join player p on p.id = pm.player_id
  where (p_team is null or p.team_id = p_team)
    and (p_player is null or pm.player_id = p_player)
    and (p_since is null or m.ended_at >= p_since)
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.champion
  order by count(*) desc
$$;
