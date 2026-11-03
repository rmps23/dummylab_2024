-- Personal links that let a player answer availability without an account.
-- The token is a capability: whoever has the link can answer for that one player, nothing else.
-- Public access goes through server routes that use the service role; coaches manage links via RLS.
create table player_invite (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references player (id) on delete cascade,
  token text not null unique check (char_length(token) = 32),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
create index player_invite_player_idx on player_invite (player_id);

alter table player_invite enable row level security;

create policy "own player invites" on player_invite for all to authenticated
  using (exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid())));
