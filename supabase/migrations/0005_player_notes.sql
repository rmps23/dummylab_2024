-- Private coach notes and goals per player. Never exposed to players or on public pages.
create table player_note (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  player_id uuid not null references player (id) on delete cascade,
  kind text not null check (kind in ('note', 'goal')),
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'open' check (status in ('open', 'done')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index player_note_player_idx on player_note (player_id, created_at desc);

create function touch_player_note() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger player_note_touch before update on player_note
  for each row execute function touch_player_note();

alter table player_note enable row level security;

create policy "own player notes" on player_note for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from player p where p.id = player_id and p.owner_id = (select auth.uid()))
  );
