-- ===========================================================================
-- hackathonlar.uz — aggregate views
-- PRD section 5 ("Never compute aggregates client-side by fetching all
-- reviews") and section 8 (anonymity is enforced at the view layer).
--
-- WHY THESE VIEWS ARE `security_invoker = false` (i.e. SECURITY DEFINER):
--   The base `public.reviews` table is deliberately unreadable by `anon` and
--   readable by `authenticated` only for their *own* rows, because it holds
--   `user_id` — the identity behind an anonymous review. The public surface is
--   therefore not the table but these views, which are the security boundary:
--   each one re-implements the visibility rule in its own WHERE clause
--   (`status = 'approved'`, `status = 'published'`) and strips identity before
--   it can ever reach a client. Making them `security_invoker = true` would
--   require granting `anon` direct SELECT on `reviews.user_id`, which is
--   exactly what PRD 5 forbids.
--   Admin-facing views additionally gate themselves on `has_admin_access()`.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Access helper used by the admin views (and, later, by RLS policies).
-- Deliberately *not* SECURITY DEFINER: `current_setting('role')` must be read
-- in the caller's context so PostgREST's `SET LOCAL ROLE service_role` is seen.
-- ---------------------------------------------------------------------------

create or replace function public.has_admin_access()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('role', true) = 'service_role', false)
      or public.is_admin();
$$;

comment on function public.has_admin_access is
  'True for the service role or for a signed-in profile with role = admin.';

grant execute on function public.has_admin_access() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- hackathon_stats — per-hackathon rollup over PUBLISHED reviews only.
-- Hidden (moderated) reviews are excluded from every aggregate, per PRD 8.
-- ---------------------------------------------------------------------------

create view public.hackathon_stats
with (security_invoker = false) as
select
  h.id                                                              as hackathon_id,
  count(r.id)::int                                                  as review_count,
  round(avg(r.overall), 2)                                          as avg_overall,
  round(avg(r.rating_organization), 2)                              as avg_organization,
  round(avg(r.rating_communication), 2)                             as avg_communication,
  round(avg(r.rating_judging), 2)                                   as avg_judging,
  round(avg(r.rating_prizes), 2)                                    as avg_prizes,
  round(avg(r.rating_venue), 2)                                     as avg_venue,
  count(*) filter (where round(r.overall) = 5)::int                 as dist_5,
  count(*) filter (where round(r.overall) = 4)::int                 as dist_4,
  count(*) filter (where round(r.overall) = 3)::int                 as dist_3,
  count(*) filter (where round(r.overall) = 2)::int                 as dist_2,
  count(*) filter (where round(r.overall) = 1)::int                 as dist_1
from public.hackathons h
left join public.reviews r
  on r.hackathon_id = h.id
 and r.status = 'published'
group by h.id;

comment on view public.hackathon_stats is
  'Review count, overall average, five per-category averages and a 5..1 histogram for every hackathon.';

-- ---------------------------------------------------------------------------
-- organizer_stats — the accountability scoreboard rollup (PRD 7.6).
-- Only approved hackathons and published reviews count.
-- ---------------------------------------------------------------------------

create view public.organizer_stats
with (security_invoker = false) as
select
  o.id                                                              as organizer_id,
  count(distinct h.id)::int                                         as hackathon_count,
  count(distinct h.id) filter (
    where coalesce(h.end_date, h.start_date) < current_date
  )::int                                                            as past_hackathon_count,
  count(distinct h.id) filter (where r.id is not null)::int         as rated_hackathon_count,
  count(r.id)::int                                                  as review_count,
  round(avg(r.overall), 2)                                          as avg_overall,
  round(avg(r.rating_organization), 2)                              as avg_organization,
  round(avg(r.rating_communication), 2)                             as avg_communication,
  round(avg(r.rating_judging), 2)                                   as avg_judging,
  round(avg(r.rating_prizes), 2)                                    as avg_prizes,
  round(avg(r.rating_venue), 2)                                     as avg_venue
from public.organizers o
left join public.hackathons h
  on h.organizer_id = o.id
 and h.status = 'approved'
left join public.reviews r
  on r.hackathon_id = h.id
 and r.status = 'published'
group by o.id;

comment on view public.organizer_stats is
  'Aggregate track record per organizer across all of their approved hackathons.';

-- ---------------------------------------------------------------------------
-- public_reviews — THE anonymity boundary (PRD 5, "the critical anonymity rule")
--
-- For `is_anonymous = true` rows the author id, display name and avatar are
-- replaced before they leave the database. There is no code path by which a
-- client can recover the author: `reviews` itself is not readable by `anon`,
-- and `authenticated` may only read its own rows.
--
-- `display_name` carries the Uzbek default label (uz is the site's default
-- locale). The UI branches on `is_anonymous` to render the ru/en label from the
-- next-intl catalogue, so the string is fully localized without putting locale
-- logic in the database.
-- ---------------------------------------------------------------------------

create view public.public_reviews
with (security_invoker = false) as
select
  r.id,
  r.hackathon_id,
  h.slug                                                            as hackathon_slug,
  h.name                                                            as hackathon_name,
  h.cover_url                                                       as hackathon_cover_url,

  r.is_anonymous,
  case when r.is_anonymous then null else r.user_id end             as author_id,
  case when r.is_anonymous then 'Anonim ishtirokchi'
       else p.display_name end                                      as display_name,
  case when r.is_anonymous then null else p.avatar_url end          as avatar_url,

  r.rating_organization,
  r.rating_communication,
  r.rating_judging,
  r.rating_prizes,
  r.rating_venue,
  r.overall,

  r.title,
  r.body,
  r.pros,
  r.cons,
  r.participated_as,

  r.created_at,
  r.updated_at,
  r.edited_at,

  coalesce(v.helpful_count, 0)::int                                 as helpful_count,
  coalesce(v.viewer_has_voted, false)                               as viewer_has_voted,
  (r.user_id = (select auth.uid()))                                 as viewer_is_author,

  resp.body                                                         as response_body,
  resp.author_label                                                 as response_author_label,
  resp.created_at                                                   as response_created_at
from public.reviews r
join public.hackathons h
  on h.id = r.hackathon_id
 and h.status = 'approved'
join public.profiles p
  on p.id = r.user_id
left join lateral (
  select
    count(*)::int                                                   as helpful_count,
    bool_or(rv.user_id = (select auth.uid()))                       as viewer_has_voted
  from public.review_votes rv
  where rv.review_id = r.id
) v on true
left join public.official_responses resp
  on resp.review_id = r.id
where r.status = 'published';

comment on view public.public_reviews is
  'The ONLY public read surface for reviews. Strips author identity for anonymous reviews and hides moderated ones.';

-- ---------------------------------------------------------------------------
-- hackathon_cards — everything the catalog, home rails and detail page need in
-- one round trip: hackathon + organizer + own stats + the organizer''s
-- historical average (the "killer feature" on upcoming cards, PRD 7.1).
-- ---------------------------------------------------------------------------

create view public.hackathon_cards
with (security_invoker = false) as
select
  h.id,
  h.slug,
  h.name,
  h.organizer_id,
  h.description_uz,
  h.description_ru,
  h.description_en,
  h.city,
  h.format,
  h.start_date,
  h.end_date,
  -- Nullable-safe date handles for filtering and sorting. `effective_end_date`
  -- drives the Upcoming / Past tabs; `sort_date` drives "newest".
  coalesce(h.start_date, h.end_date)                                as effective_start_date,
  coalesce(h.end_date, h.start_date)                                as effective_end_date,
  coalesce(h.start_date, h.end_date, h.created_at::date)            as sort_date,
  h.prize_pool,
  h.tracks,
  h.website,
  h.telegram,
  h.registration_url,
  h.cover_url,
  h.created_at,

  o.slug                                                            as organizer_slug,
  o.name                                                            as organizer_name,
  o.logo_url                                                        as organizer_logo_url,

  coalesce(s.review_count, 0)                                       as review_count,
  s.avg_overall,
  s.avg_organization,
  s.avg_communication,
  s.avg_judging,
  s.avg_prizes,
  s.avg_venue,
  coalesce(s.dist_5, 0)                                             as dist_5,
  coalesce(s.dist_4, 0)                                             as dist_4,
  coalesce(s.dist_3, 0)                                             as dist_3,
  coalesce(s.dist_2, 0)                                             as dist_2,
  coalesce(s.dist_1, 0)                                             as dist_1,

  os.avg_overall                                                    as organizer_avg_overall,
  coalesce(os.review_count, 0)                                      as organizer_review_count,
  coalesce(os.rated_hackathon_count, 0)                             as organizer_rated_hackathon_count,
  coalesce(os.hackathon_count, 0)                                   as organizer_hackathon_count
from public.hackathons h
left join public.organizers o       on o.id = h.organizer_id
left join public.hackathon_stats s  on s.hackathon_id = h.id
left join public.organizer_stats os on os.organizer_id = h.organizer_id
where h.status = 'approved';

comment on view public.hackathon_cards is
  'Approved hackathons denormalized with organizer + score aggregates. The single read surface for the public catalog.';

-- ---------------------------------------------------------------------------
-- organizer_cards
-- ---------------------------------------------------------------------------

create view public.organizer_cards
with (security_invoker = false) as
select
  o.id,
  o.slug,
  o.name,
  o.logo_url,
  o.website,
  o.telegram,
  o.description_uz,
  o.description_ru,
  o.description_en,
  o.created_at,
  coalesce(s.hackathon_count, 0)                                    as hackathon_count,
  coalesce(s.past_hackathon_count, 0)                               as past_hackathon_count,
  coalesce(s.rated_hackathon_count, 0)                              as rated_hackathon_count,
  coalesce(s.review_count, 0)                                       as review_count,
  s.avg_overall,
  s.avg_organization,
  s.avg_communication,
  s.avg_judging,
  s.avg_prizes,
  s.avg_venue
from public.organizers o
left join public.organizer_stats s on s.organizer_id = o.id;

comment on view public.organizer_cards is 'Organizers denormalized with their aggregate track record.';

-- ---------------------------------------------------------------------------
-- platform_stats — the live numbers in the home hero strip (PRD 7.1).
-- ---------------------------------------------------------------------------

create view public.platform_stats
with (security_invoker = false) as
select
  (select count(*)::int from public.hackathons where status = 'approved')          as hackathon_count,
  (select count(*)::int
     from public.organizers o
    where exists (select 1 from public.hackathons h
                   where h.organizer_id = o.id and h.status = 'approved'))         as organizer_count,
  (select count(*)::int
     from public.reviews r
     join public.hackathons h on h.id = r.hackathon_id
    where r.status = 'published' and h.status = 'approved')                        as review_count,
  (select round(avg(r.overall), 2)
     from public.reviews r
     join public.hackathons h on h.id = r.hackathon_id
    where r.status = 'published' and h.status = 'approved')                        as avg_overall;

comment on view public.platform_stats is 'Single-row live totals for the home page stats strip.';

-- ---------------------------------------------------------------------------
-- Distinct filter facets for the catalog (cities / formats actually in use).
-- ---------------------------------------------------------------------------

create view public.hackathon_cities
with (security_invoker = false) as
select h.city, count(*)::int as hackathon_count
from public.hackathons h
where h.status = 'approved'
  and h.city is not null
group by h.city
order by count(*) desc, h.city asc;

comment on view public.hackathon_cities is 'Cities that currently have at least one approved hackathon — powers the catalog city filter.';

-- ===========================================================================
-- Admin surfaces. Each self-gates on has_admin_access(), so even if a grant
-- were widened by mistake a normal user still gets zero rows.
-- ===========================================================================

create view public.admin_reviews
with (security_invoker = false) as
select
  r.id,
  r.hackathon_id,
  h.slug                                                            as hackathon_slug,
  h.name                                                            as hackathon_name,
  r.user_id                                                         as author_id,
  p.display_name                                                    as author_display_name,
  p.avatar_url                                                      as author_avatar_url,
  u.email                                                           as author_email,
  r.is_anonymous,
  r.rating_organization,
  r.rating_communication,
  r.rating_judging,
  r.rating_prizes,
  r.rating_venue,
  r.overall,
  r.title,
  r.body,
  r.pros,
  r.cons,
  r.participated_as,
  r.status,
  r.created_at,
  r.updated_at,
  r.edited_at,
  coalesce(vc.helpful_count, 0)                                     as helpful_count,
  coalesce(rc.open_report_count, 0)                                 as open_report_count,
  rc.report_reasons,
  resp.id                                                           as response_id,
  resp.body                                                         as response_body,
  resp.author_label                                                 as response_author_label
from public.reviews r
join public.hackathons h on h.id = r.hackathon_id
join public.profiles p   on p.id = r.user_id
left join auth.users u   on u.id = r.user_id
left join lateral (
  select count(*)::int as helpful_count
  from public.review_votes rv where rv.review_id = r.id
) vc on true
left join lateral (
  select
    count(*)::int                                    as open_report_count,
    array_agg(rr.reason order by rr.created_at desc) as report_reasons
  from public.review_reports rr
  where rr.review_id = r.id and rr.status = 'open'
) rc on true
left join public.official_responses resp on resp.review_id = r.id
where public.has_admin_access();

comment on view public.admin_reviews is
  'Moderation view. Unlike public_reviews it ALWAYS resolves the true author, including for anonymous reviews (PRD 7.8).';

create view public.admin_hackathons
with (security_invoker = false) as
select
  h.id,
  h.slug,
  h.name,
  h.organizer_id,
  o.name                                                            as organizer_name,
  o.slug                                                            as organizer_slug,
  h.description_uz,
  h.description_ru,
  h.description_en,
  h.city,
  h.format,
  h.start_date,
  h.end_date,
  h.prize_pool,
  h.tracks,
  h.website,
  h.telegram,
  h.registration_url,
  h.cover_url,
  h.status,
  h.rejection_reason,
  h.submitted_by,
  sp.display_name                                                   as submitted_by_name,
  su.email                                                          as submitted_by_email,
  h.created_at,
  h.updated_at,
  coalesce(s.review_count, 0)                                       as review_count,
  s.avg_overall
from public.hackathons h
left join public.organizers o        on o.id = h.organizer_id
left join public.profiles sp         on sp.id = h.submitted_by
left join auth.users su              on su.id = h.submitted_by
left join public.hackathon_stats s   on s.hackathon_id = h.id
where public.has_admin_access();

comment on view public.admin_hackathons is 'All hackathons regardless of status, with submitter identity — the moderation queue.';

-- ===========================================================================
-- Grants. `auto_expose_new_tables` is off, so nothing is reachable through the
-- Data API unless it is granted here explicitly.
-- ===========================================================================

grant select on
  public.hackathon_stats,
  public.organizer_stats,
  public.public_reviews,
  public.hackathon_cards,
  public.organizer_cards,
  public.platform_stats,
  public.hackathon_cities
to anon, authenticated, service_role;

grant select on
  public.admin_reviews,
  public.admin_hackathons
to authenticated, service_role;
