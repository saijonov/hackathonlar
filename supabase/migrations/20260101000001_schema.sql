-- ===========================================================================
-- hackathonlar.uz — core schema
-- PRD section 5 (Data Model).
--
-- Conventions used throughout:
--   * every table has created_at timestamptz not null default now()
--   * every mutable table has updated_at maintained by a trigger
--   * enum-ish columns are text + CHECK (keeps PostgREST/TS generation simple
--     and lets us add values without an ALTER TYPE migration lock)
--   * RLS is enabled here but *policies* live in ..._rls.sql
-- ===========================================================================

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at is
  'Generic BEFORE UPDATE trigger that stamps updated_at.';

-- ---------------------------------------------------------------------------
-- profiles — extends auth.users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 2 and 60),
  avatar_url    text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Public profile for every auth.users row.';
comment on column public.profiles.role is
  'user | admin. Only the service role may change this (see RLS + the guard trigger).';

-- Answers "is the caller an admin?" without recursing into profiles RLS.
-- SECURITY DEFINER + a pinned search_path is the standard Supabase pattern.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin is
  'True when the current request is authenticated as a profile with role = admin.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Belt and braces on top of RLS: even a mis-written policy cannot let a
-- non-admin escalate their own role. Only the service role bypasses this.
-- Deliberately NOT security definer: it must observe the *caller's* role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and current_user not in ('postgres', 'supabase_admin', 'service_role')
     and not public.is_admin()
  then
    raise exception 'Only an administrator may change profile roles'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update of role on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Profile bootstrap: create a profile whenever a user signs up.
-- Covers Google OAuth (full_name / name / avatar_url in raw_user_meta_data)
-- and email+password sign-up (display_name we pass in options.data).
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  candidate text;
begin
  candidate := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );

  -- display_name has a 2..60 CHECK; make absolutely sure we satisfy it.
  candidate := left(coalesce(candidate, 'Ishtirokchi'), 60);
  if char_length(candidate) < 2 then
    candidate := 'Ishtirokchi';
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    candidate,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizers
-- ---------------------------------------------------------------------------

create table public.organizers (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name            text not null check (char_length(name) between 2 and 140),
  logo_url        text,
  website         text,
  telegram        text,
  description_uz  text,
  description_ru  text,
  description_en  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.organizers is
  'Companies / agencies / universities that run hackathons. The accountability scoreboard is per organizer.';

create trigger organizers_set_updated_at
  before update on public.organizers
  for each row execute function public.set_updated_at();

create index organizers_name_trgm_idx
  on public.organizers using gin (name extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- hackathons
-- ---------------------------------------------------------------------------

create table public.hackathons (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name             text not null check (char_length(name) between 2 and 160),
  organizer_id     uuid references public.organizers (id) on delete set null,
  description_uz   text check (description_uz is null or char_length(description_uz) <= 6000),
  description_ru   text check (description_ru is null or char_length(description_ru) <= 6000),
  description_en   text check (description_en is null or char_length(description_en) <= 6000),
  city             text check (city is null or char_length(city) <= 80),
  format           text not null default 'offline' check (format in ('offline', 'online', 'hybrid')),
  start_date       date,
  end_date         date,
  prize_pool       text check (prize_pool is null or char_length(prize_pool) <= 120),
  tracks           text[] not null default '{}'::text[],
  website          text,
  telegram         text,
  registration_url text,
  cover_url        text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 500),
  submitted_by     uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint hackathons_date_order
    check (start_date is null or end_date is null or end_date >= start_date),
  -- At least one language must carry a description (PRD 7.5).
  constraint hackathons_has_description
    check (
      coalesce(nullif(trim(description_uz), ''), nullif(trim(description_ru), ''), nullif(trim(description_en), ''))
      is not null
    ),
  -- An "online" hackathon has no city; offline/hybrid should name one.
  constraint hackathons_city_matches_format
    check (format <> 'online' or city is null)
);

comment on table public.hackathons is
  'Hackathons. Only status = approved rows are ever visible to the public (RLS + the *_cards views).';
comment on column public.hackathons.tracks is 'Free-form track/nomination labels, not translated.';

create trigger hackathons_set_updated_at
  before update on public.hackathons
  for each row execute function public.set_updated_at();

create index hackathons_status_idx        on public.hackathons (status);
create index hackathons_organizer_idx     on public.hackathons (organizer_id);
create index hackathons_start_date_idx    on public.hackathons (start_date desc nulls last);
create index hackathons_city_idx          on public.hackathons (city) where city is not null;
create index hackathons_format_idx        on public.hackathons (format);
create index hackathons_submitted_by_idx  on public.hackathons (submitted_by) where submitted_by is not null;
create index hackathons_name_trgm_idx
  on public.hackathons using gin (name extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

create table public.reviews (
  id                    uuid primary key default gen_random_uuid(),
  hackathon_id          uuid not null references public.hackathons (id) on delete cascade,
  user_id               uuid not null references public.profiles (id) on delete cascade,

  -- Planning, schedule, logistics running on time.
  rating_organization   smallint not null check (rating_organization between 1 and 5),
  -- Updates before / during / after — including notifying non-finalists.
  rating_communication  smallint not null check (rating_communication between 1 and 5),
  -- Transparency and fairness of judging.
  rating_judging        smallint not null check (rating_judging between 1 and 5),
  -- Prizes as promised, delivered on time.
  rating_prizes         smallint not null check (rating_prizes between 1 and 5),
  -- Venue / platform, food, wifi, comfort.
  rating_venue          smallint not null check (rating_venue between 1 and 5),

  overall numeric generated always as (
    (rating_organization + rating_communication + rating_judging + rating_prizes + rating_venue) / 5.0
  ) stored,

  title            text not null check (char_length(title) between 5 and 100),
  body             text not null check (char_length(body) between 50 and 3000),
  pros             text check (pros is null or char_length(pros) <= 500),
  cons             text check (cons is null or char_length(cons) <= 500),

  is_anonymous     boolean not null default false,
  participated_as  text not null default 'participant'
                     check (participated_as in ('participant', 'finalist', 'winner', 'mentor', 'volunteer')),
  status           text not null default 'published' check (status in ('published', 'hidden')),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  edited_at        timestamptz,

  constraint reviews_one_per_user_per_hackathon unique (hackathon_id, user_id)
);

comment on table public.reviews is
  'One review per (hackathon, user). Never expose user_id to the public API — read through public.public_reviews.';
comment on column public.reviews.is_anonymous is
  'When true the public view hides the author entirely. Admins still see the real profile.';
comment on column public.reviews.edited_at is
  'Set the first time a published review''s content changes; drives the "Tahrirlangan" marker.';

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Stamp edited_at only when the *content* changes (not on moderation toggles).
create or replace function public.mark_review_edited()
returns trigger
language plpgsql
as $$
begin
  if (new.title, new.body, new.pros, new.cons,
      new.rating_organization, new.rating_communication, new.rating_judging,
      new.rating_prizes, new.rating_venue, new.participated_as, new.is_anonymous)
     is distinct from
     (old.title, old.body, old.pros, old.cons,
      old.rating_organization, old.rating_communication, old.rating_judging,
      old.rating_prizes, old.rating_venue, old.participated_as, old.is_anonymous)
  then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

create trigger reviews_mark_edited
  before update on public.reviews
  for each row execute function public.mark_review_edited();

create index reviews_hackathon_idx on public.reviews (hackathon_id);
create index reviews_user_idx      on public.reviews (user_id);
create index reviews_published_idx on public.reviews (hackathon_id, created_at desc) where status = 'published';

-- ---------------------------------------------------------------------------
-- review_votes — "Foydali" (helpful)
-- ---------------------------------------------------------------------------

create table public.review_votes (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint review_votes_one_per_user unique (review_id, user_id)
);

create index review_votes_review_idx on public.review_votes (review_id);

-- ---------------------------------------------------------------------------
-- review_reports
-- ---------------------------------------------------------------------------

create table public.review_reports (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  reason     text not null check (char_length(reason) between 3 and 500),
  status     text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint review_reports_one_per_user unique (review_id, user_id)
);

create index review_reports_review_idx on public.review_reports (review_id);
create index review_reports_open_idx   on public.review_reports (created_at desc) where status = 'open';

-- ---------------------------------------------------------------------------
-- official_responses — admin-mediated organizer replies (PRD 8)
-- ---------------------------------------------------------------------------

create table public.official_responses (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null unique references public.reviews (id) on delete cascade,
  body         text not null check (char_length(body) between 10 and 2000),
  author_label text not null check (char_length(author_label) between 2 and 120),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.official_responses is
  'One optional official organizer response per review. Written by an admin on the organizer''s behalf (v1 has no organizer accounts).';

create trigger official_responses_set_updated_at
  before update on public.official_responses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS on. Every policy is defined in the RLS migration.
-- ---------------------------------------------------------------------------

alter table public.profiles           enable row level security;
alter table public.organizers         enable row level security;
alter table public.hackathons         enable row level security;
alter table public.reviews            enable row level security;
alter table public.review_votes       enable row level security;
alter table public.review_reports     enable row level security;
alter table public.official_responses enable row level security;
