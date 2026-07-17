-- Afterglow database schema
-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  context text default '',
  phone text default '',
  email text default '',
  linkedin text default '',
  stage text default 'seed',           -- seed | sprout | budding | bloom
  timeline jsonb default '[]'::jsonb,  -- [{ id, dateISO, place, note, manual }]
  todos jsonb default '[]'::jsonb,     -- [{ id, text, done, channel }]
  contextNotes jsonb default '[]'::jsonb, -- forgotten details, not tied to a date
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: everyone can only ever see/change their own rows
alter table contacts enable row level security;

create policy "Users manage their own contacts"
  on contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at current on every change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at
  before update on contacts
  for each row execute function set_updated_at();
