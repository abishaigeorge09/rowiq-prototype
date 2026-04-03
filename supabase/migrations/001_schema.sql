-- RowIQ Prototype — Initial Schema
-- Run this in the Supabase SQL Editor for your new project.

create extension if not exists "uuid-ossp";

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists teams (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  invite_code  text not null unique,
  sport        text not null default 'Rowing',
  division     text,
  coach_id     uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- PROFILES  (extends auth.users — created automatically via trigger)
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('coach', 'athlete', 'superadmin')),
  name        text not null,
  email       text not null,
  team_id     uuid references teams(id) on delete set null,
  status      text not null default 'active' check (status in ('pending', 'active', 'rejected')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROSTER ATHLETES
-- The athletes array in the lineup tool — managed by coaches.
-- These are NOT necessarily Supabase auth users; they're the
-- people being assigned to boats.
-- ============================================================
create table if not exists roster_athletes (
  id           uuid primary key default uuid_generate_v4(),
  team_id      uuid not null references teams(id) on delete cascade,
  profile_id   uuid references profiles(id) on delete set null, -- set if athlete has an account
  name         text not null,
  email        text not null default '',
  position     text not null default 'Mid',
  color_index  int not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- LINEUP STATE  (current boat assignments per team)
-- One row per team. Upserted on every change.
-- ============================================================
create table if not exists lineup_state (
  id           uuid primary key default uuid_generate_v4(),
  team_id      uuid not null references teams(id) on delete cascade unique,
  boats        jsonb not null default '[]',
  published    boolean not null default false,
  publish_data jsonb,
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- PUBLISHED LINEUPS  (append-only snapshots)
-- ============================================================
create table if not exists published_lineups (
  id           uuid primary key default uuid_generate_v4(),
  team_id      uuid not null references teams(id) on delete cascade,
  title        text not null,
  date         text,
  time         text,
  note         text,
  published_at timestamptz not null default now(),
  boats        jsonb not null default '[]',
  results      jsonb
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists roster_athletes_team_idx on roster_athletes(team_id);
create index if not exists published_lineups_team_idx on published_lineups(team_id);
create index if not exists published_lineups_published_at_idx on published_lineups(published_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table teams             enable row level security;
alter table profiles          enable row level security;
alter table roster_athletes   enable row level security;
alter table lineup_state      enable row level security;
alter table published_lineups enable row level security;

-- Helper functions (security definer avoids RLS recursion)
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function get_my_team_id()
returns uuid language sql security definer stable as $$
  select team_id from profiles where id = auth.uid()
$$;

-- TEAMS
create policy "teams_select" on teams for select using (id = get_my_team_id());
create policy "teams_insert" on teams for insert with check (get_my_role() = 'coach');
create policy "teams_update" on teams for update using (coach_id = auth.uid());

-- PROFILES: own row + teammates
create policy "profiles_select" on profiles for select using (
  id = auth.uid() or team_id = get_my_team_id()
);
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- ROSTER ATHLETES: coaches can manage; athletes can read own team's
create policy "roster_athletes_select" on roster_athletes for select using (
  team_id = get_my_team_id()
);
create policy "roster_athletes_insert" on roster_athletes for insert with check (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);
create policy "roster_athletes_update" on roster_athletes for update using (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);
create policy "roster_athletes_delete" on roster_athletes for delete using (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);

-- LINEUP STATE: team can read; only coach can write
create policy "lineup_state_select" on lineup_state for select using (
  team_id = get_my_team_id()
);
create policy "lineup_state_insert" on lineup_state for insert with check (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);
create policy "lineup_state_update" on lineup_state for update using (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);

-- PUBLISHED LINEUPS: team can read; only coach can write
create policy "published_lineups_select" on published_lineups for select using (
  team_id = get_my_team_id()
);
create policy "published_lineups_insert" on published_lineups for insert with check (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);
create policy "published_lineups_update" on published_lineups for update using (
  get_my_role() = 'coach' and team_id = get_my_team_id()
);

-- ============================================================
-- SUPERADMIN: bypass RLS on profiles + teams for approval flow
-- ============================================================
create policy "superadmin_profiles_all" on profiles for all using (get_my_role() = 'superadmin');
create policy "superadmin_teams_all"    on teams    for all using (get_my_role() = 'superadmin');

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role, name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'athlete'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case
      when coalesce(new.raw_user_meta_data->>'role', 'athlete') = 'coach' then 'pending'
      else 'active'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Allow unauthenticated invite code lookup (athletes need this before creating account)
create policy "teams_invite_lookup" on teams for select using (true);
