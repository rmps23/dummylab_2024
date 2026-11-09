-- Staff access: a coach (the team owner) can invite analysts, assistant coaches and viewers to a team.
--
-- Roles
--   owner  the account that created the team (team.owner_id). Everything, including players, billing-sensitive
--          settings, invites and deleting the team.
--   staff  reads everything about the team, creates and edits events and availability, keeps private notes.
--   viewer reads everything about the team, changes nothing.
--
-- Teams and players stay owner-only on purpose: plan limits are counted per owner, so only the owner adds to them.
-- Keep the staff seat numbers in sync with lib/plans.js.

create table team_member (
  team_id bigint not null references team (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('staff', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index team_member_user_idx on team_member (user_id);

-- Pending invitations. The token is a capability sent to one email address; accepting it needs a signed-in
-- account with that same address and goes through a server route (service role).
create table team_invite (
  id uuid primary key default gen_random_uuid(),
  team_id bigint not null references team (id) on delete cascade,
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null check (role in ('staff', 'viewer')),
  token text not null unique check (char_length(token) = 32),
  invited_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz
);
create index team_invite_team_idx on team_invite (team_id);

-- Access helpers. SECURITY DEFINER so policies can ask "is this person on the team" without recursing into RLS.
create function is_team_owner(t bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team where id = t and owner_id = auth.uid())
$$;

create function can_read_team(t bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team where id = t and owner_id = auth.uid())
      or exists (select 1 from team_member where team_id = t and user_id = auth.uid())
$$;

create function can_write_team(t bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team where id = t and owner_id = auth.uid())
      or exists (select 1 from team_member where team_id = t and user_id = auth.uid() and role = 'staff')
$$;

-- Pro status of the team's owner. Staff see the full history of a Pro team even on a free account of their own.
create function team_is_pro(t bigint) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce((select user_plan(owner_id) = 'pro' from team where id = t), false)
$$;

revoke execute on function is_team_owner(bigint), can_read_team(bigint), can_write_team(bigint), team_is_pro(bigint) from public, anon;
grant execute on function is_team_owner(bigint), can_read_team(bigint), can_write_team(bigint), team_is_pro(bigint) to authenticated;

alter table team_member enable row level security;
alter table team_invite enable row level security;

-- Members see their own seat and the owner sees every seat of the team. Seats are added only by the server.
create policy "see seats" on team_member for select to authenticated
  using (user_id = (select auth.uid()) or is_team_owner(team_id));
create policy "owner removes seats, members leave" on team_member for delete to authenticated
  using (user_id = (select auth.uid()) or is_team_owner(team_id));

create policy "owner manages invites" on team_invite for all to authenticated
  using (is_team_owner(team_id))
  with check (is_team_owner(team_id) and invited_by = (select auth.uid()));

-- Teams: everyone on the team reads, only the owner writes. ---------------------
drop policy "own teams" on team;
create policy "read team" on team for select to authenticated using (can_read_team(id));
create policy "owner inserts team" on team for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owner updates team" on team for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner deletes team" on team for delete to authenticated using (owner_id = (select auth.uid()));

-- Players
drop policy "own players" on player;
create policy "read players" on player for select to authenticated using (can_read_team(team_id));
create policy "owner writes players" on player for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and is_team_owner(team_id));

-- Match data of the team's players
drop policy "own player matches" on player_match;
create policy "read player matches" on player_match for select to authenticated
  using (exists (select 1 from player p where p.id = player_id and can_read_team(p.team_id)));

drop policy "matches of own players" on match;
create policy "read team matches" on match for select to authenticated
  using (exists (
    select 1 from player_match pm join player p on p.id = pm.player_id
    where pm.match_id = match.id and can_read_team(p.team_id)
  ));

drop policy "own rank" on rank_snapshot;
create policy "read team ranks" on rank_snapshot for select to authenticated
  using (exists (select 1 from player p where p.id = player_id and can_read_team(p.team_id)));

-- Events and availability: staff can edit them too.
drop policy "own events" on event;
create policy "read events" on event for select to authenticated using (can_read_team(team_id));
create policy "write events" on event for insert to authenticated
  with check (owner_id = (select auth.uid()) and can_write_team(team_id));
create policy "update events" on event for update to authenticated
  using (can_write_team(team_id)) with check (can_write_team(team_id));
create policy "delete events" on event for delete to authenticated using (can_write_team(team_id));

drop policy "own event participants" on event_participant;
create policy "read participants" on event_participant for select to authenticated
  using (exists (select 1 from event e where e.id = event_id and can_read_team(e.team_id)));
create policy "write participants" on event_participant for all to authenticated
  using (exists (select 1 from event e where e.id = event_id and can_write_team(e.team_id)))
  with check (
    exists (select 1 from event e where e.id = event_id and can_write_team(e.team_id))
    and exists (select 1 from player p join event e on e.team_id = p.team_id where p.id = player_id and e.id = event_id)
  );

-- Private notes stay private to their author, but staff can keep their own notes on the team's players.
drop policy "own player notes" on player_note;
create policy "own player notes" on player_note for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from player p where p.id = player_id and can_write_team(p.team_id))
  );

-- Staff seats are a plan limit: 0 on Free, 3 on Pro (members plus open invites, across the owner's teams).
create or replace function plan_limit(p_plan text, p_what text) returns int
language sql immutable as $$
  select case p_what
    when 'teams' then case p_plan when 'pro' then 5 else 1 end
    when 'players' then case p_plan when 'pro' then 100 else 10 end
    when 'notes' then case p_plan when 'pro' then 2000 else 20 end
    when 'staff' then case p_plan when 'pro' then 3 else 0 end
  end
$$;

create function enforce_staff_limit() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  owner uuid;
  used int;
begin
  select owner_id into owner from team where id = new.team_id;
  select
    (select count(*) from team_member m join team t on t.id = m.team_id where t.owner_id = owner)
    + (select count(*) from team_invite i join team t on t.id = i.team_id
        where t.owner_id = owner and i.accepted_at is null and i.revoked_at is null and i.expires_at > now())
  into used;
  if used >= plan_limit(user_plan(owner), 'staff') then
    raise exception 'plan_limit:staff';
  end if;
  return new;
end $$;

create trigger team_invite_staff_limit before insert on team_invite for each row execute function enforce_staff_limit();

-- Stats: the plan that decides the history window is the team owner's, not the viewer's.
create or replace function player_stats(
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
  where m.duration >= 300 -- ignore remakes
    and (p_team is null or p.team_id = p_team)
    and (p_player is null or pm.player_id = p_player)
    and m.ended_at >= case when my_plan() = 'pro' or team_is_pro(p.team_id) then coalesce(p_since, '-infinity'::timestamptz)
                           else greatest(coalesce(p_since, now() - interval '30 days'), now() - interval '30 days') end
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.player_id
$$;

create or replace function champion_stats(
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
  where m.duration >= 300 -- ignore remakes
    and (p_team is null or p.team_id = p_team)
    and (p_player is null or pm.player_id = p_player)
    and m.ended_at >= case when my_plan() = 'pro' or team_is_pro(p.team_id) then coalesce(p_since, '-infinity'::timestamptz)
                           else greatest(coalesce(p_since, now() - interval '30 days'), now() - interval '30 days') end
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.champion
  order by count(*) desc
$$;
