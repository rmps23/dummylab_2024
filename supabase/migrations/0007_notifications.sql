-- Per-team notification settings (Pro): Discord reminders and the weekly email report.
alter table team
  add column discord_webhook_url text
    check (discord_webhook_url is null or discord_webhook_url ~ '^https://(discord|discordapp)\.com/api/webhooks/[0-9]{15,25}/[A-Za-z0-9_-]{20,100}$'),
  add column report_email text check (report_email is null or report_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column weekly_report boolean not null default false;

-- Setting any of them requires the Pro plan (clearing them is always allowed).
create function enforce_team_notifications_pro() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if (new.discord_webhook_url is not null and new.discord_webhook_url is distinct from old.discord_webhook_url)
     or (new.report_email is not null and new.report_email is distinct from old.report_email)
     or (new.weekly_report and not old.weekly_report) then
    if user_plan(new.owner_id) <> 'pro' then
      raise exception 'plan_limit:notifications';
    end if;
  end if;
  return new;
end $$;

create trigger team_notifications_pro before update on team
  for each row execute function enforce_team_notifications_pro();
