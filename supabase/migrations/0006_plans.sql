-- Plans and limits, enforced in the database so they cannot be bypassed from the browser.
-- Keep the numbers in sync with lib/plans.js.

create table account (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table account enable row level security;
-- Users can read their own row; only the server (service role, via the Stripe webhook) writes it.
create policy "read own account" on account for select to authenticated
  using (user_id = (select auth.uid()));

-- Effective plan of a user. The demo account counts as Pro so visitors can see every feature.
create function user_plan(uid uuid) returns text
language sql stable security definer set search_path = public, auth as $$
  select case
    when exists (
      select 1 from auth.users u
      where u.id = uid and coalesce((u.raw_app_meta_data ->> 'is_demo')::boolean, false)
    ) then 'pro'
    when exists (
      select 1 from account a
      where a.user_id = uid
        and a.plan = 'pro'
        and a.status in ('active', 'trialing', 'past_due')
        and (a.current_period_end is null or a.current_period_end > now())
    ) then 'pro'
    else 'free'
  end
$$;
revoke execute on function user_plan(uuid) from public, anon, authenticated;

create function my_plan() returns text
language sql stable security definer set search_path = public as $$
  select user_plan(auth.uid())
$$;
revoke execute on function my_plan() from public, anon;
grant execute on function my_plan() to authenticated;

create function plan_limit(p_plan text, p_what text) returns int
language sql immutable as $$
  select case p_what
    when 'teams' then case p_plan when 'pro' then 5 else 1 end
    when 'players' then case p_plan when 'pro' then 100 else 10 end
    when 'notes' then case p_plan when 'pro' then 2000 else 20 end
  end
$$;

create function enforce_plan_limits() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  owner uuid;
  plan text;
  used int;
begin
  if tg_table_name = 'team' then
    owner := new.owner_id;
    select count(*) into used from team where owner_id = owner;
    if used >= plan_limit(user_plan(owner), 'teams') then
      raise exception 'plan_limit:teams';
    end if;
  elsif tg_table_name = 'player' then
    owner := new.owner_id;
    select count(*) into used from player where owner_id = owner;
    if used >= plan_limit(user_plan(owner), 'players') then
      raise exception 'plan_limit:players';
    end if;
  elsif tg_table_name = 'player_note' then
    owner := new.owner_id;
    select count(*) into used from player_note where owner_id = owner;
    if used >= plan_limit(user_plan(owner), 'notes') then
      raise exception 'plan_limit:notes';
    end if;
  elsif tg_table_name = 'player_invite' then
    select p.owner_id into owner from player p where p.id = new.player_id;
    if user_plan(owner) <> 'pro' then
      raise exception 'plan_limit:invites';
    end if;
  end if;
  return new;
end $$;

create trigger team_plan_limit before insert on team for each row execute function enforce_plan_limits();
create trigger player_plan_limit before insert on player for each row execute function enforce_plan_limits();
create trigger player_note_plan_limit before insert on player_note for each row execute function enforce_plan_limits();
create trigger player_invite_plan_limit before insert on player_invite for each row execute function enforce_plan_limits();

-- Stats history: Free sees the last 30 days, Pro sees everything.
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
    and m.ended_at >= case when my_plan() = 'pro' then coalesce(p_since, '-infinity'::timestamptz)
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
    and m.ended_at >= case when my_plan() = 'pro' then coalesce(p_since, '-infinity'::timestamptz)
                           else greatest(coalesce(p_since, now() - interval '30 days'), now() - interval '30 days') end
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.champion
  order by count(*) desc
$$;
