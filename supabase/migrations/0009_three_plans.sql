-- Three plans: Free, Pro (a coach) and Academy (several rosters and a staff). Keep the numbers in sync with lib/plans.js.
--
--                Free   Pro   Academy
--   teams          1      3      10
--   players       10     50     200
--   notes         20   2000    2000
--   staff seats    0      1       5
--
-- Everything that used to ask "is this account Pro?" now asks "is it paid?" (anything but free).

alter table account drop constraint account_plan_check;
alter table account add constraint account_plan_check check (plan in ('free', 'pro', 'academy'));

-- Effective plan of a user. The demo account counts as Academy so visitors can see every feature.
create or replace function user_plan(uid uuid) returns text
language sql stable security definer set search_path = public, auth as $$
  select case
    when exists (
      select 1 from auth.users u
      where u.id = uid and coalesce((u.raw_app_meta_data ->> 'is_demo')::boolean, false)
    ) then 'academy'
    else coalesce((
      select a.plan from account a
      where a.user_id = uid
        and a.plan in ('pro', 'academy')
        and a.status in ('active', 'trialing', 'past_due')
        and (a.current_period_end is null or a.current_period_end > now())
    ), 'free')
  end
$$;

create or replace function plan_limit(p_plan text, p_what text) returns int
language sql immutable as $$
  select case p_what
    when 'teams' then case p_plan when 'academy' then 10 when 'pro' then 3 else 1 end
    when 'players' then case p_plan when 'academy' then 200 when 'pro' then 50 else 10 end
    when 'notes' then case p_plan when 'academy' then 2000 when 'pro' then 2000 else 20 end
    when 'staff' then case p_plan when 'academy' then 5 when 'pro' then 1 else 0 end
  end
$$;

create or replace function enforce_plan_limits() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  owner uuid;
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
    if user_plan(owner) = 'free' then
      raise exception 'plan_limit:invites';
    end if;
  end if;
  return new;
end $$;

create or replace function enforce_team_notifications_pro() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if (new.discord_webhook_url is not null and new.discord_webhook_url is distinct from old.discord_webhook_url)
     or (new.report_email is not null and new.report_email is distinct from old.report_email)
     or (new.weekly_report and not old.weekly_report) then
    if user_plan(new.owner_id) = 'free' then
      raise exception 'plan_limit:notifications';
    end if;
  end if;
  return new;
end $$;

-- Whether the team's owner pays for anything. Staff see the full history of a paid team even on a free account.
create or replace function team_is_pro(t bigint) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce((select user_plan(owner_id) <> 'free' from team where id = t), false)
$$;

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
    and m.ended_at >= case when my_plan() <> 'free' or team_is_pro(p.team_id) then coalesce(p_since, '-infinity'::timestamptz)
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
    and m.ended_at >= case when my_plan() <> 'free' or team_is_pro(p.team_id) then coalesce(p_since, '-infinity'::timestamptz)
                           else greatest(coalesce(p_since, now() - interval '30 days'), now() - interval '30 days') end
    and (p_queue is null or m.queue_id = p_queue)
  group by pm.champion
  order by count(*) desc
$$;
