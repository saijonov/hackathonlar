-- ===========================================================================
-- hackathonlar.uz — Row Level Security policies + Data API grants
-- PRD sections 5, 8 and 12.
--
-- Two rules govern this file:
--   1. Nothing is reachable through PostgREST unless BOTH a GRANT and a POLICY
--      allow it (`auto_expose_new_tables` is off in supabase/config.toml).
--   2. `public.reviews` is never granted to `anon` at all. Anonymous-review
--      identity therefore cannot leak even if a policy were mis-written — the
--      public path is exclusively `public.public_reviews`.
--
-- Admin *writes* go through the service-role client behind a server-side
-- `requireAdmin()` check (see src/lib/auth/guards.ts). The admin policies below
-- are defence in depth and back the `has_admin_access()` admin views.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- PRD 5: "everyone can read display_name, avatar_url". Enforced with
-- column-level grants so `role` is not part of the anonymous read surface.
grant select (id, display_name, avatar_url, created_at) on public.profiles to anon;
grant select (id, display_name, avatar_url, role, created_at, updated_at) on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "admins update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Rows are created by the on_auth_user_created trigger (SECURITY DEFINER), so
-- no INSERT policy is required for either public role.

-- ---------------------------------------------------------------------------
-- organizers
-- ---------------------------------------------------------------------------

grant select on public.organizers to anon, authenticated;
grant insert, update, delete on public.organizers to authenticated;
grant all on public.organizers to service_role;

create policy "organizers are publicly readable"
  on public.organizers for select
  to anon, authenticated
  using (true);

create policy "only admins create organizers"
  on public.organizers for insert
  to authenticated
  with check (public.is_admin());

create policy "only admins update organizers"
  on public.organizers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "only admins delete organizers"
  on public.organizers for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- hackathons
-- ---------------------------------------------------------------------------

grant select on public.hackathons to anon, authenticated;
-- Column-limited INSERT: a submitter can never set `status` or
-- `rejection_reason`, so a submission always lands as 'pending' (the default).
grant insert (
  slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url, cover_url,
  submitted_by
) on public.hackathons to authenticated;
grant update, delete on public.hackathons to authenticated;
grant all on public.hackathons to service_role;

-- Anonymous visitors see approved hackathons only. Signed-in users additionally
-- see their own pending/rejected submissions (needed by /profile, PRD 7.5).
create policy "approved hackathons are public"
  on public.hackathons for select
  to anon
  using (status = 'approved');

create policy "users read approved, own and (if admin) all hackathons"
  on public.hackathons for select
  to authenticated
  using (
    status = 'approved'
    or submitted_by = (select auth.uid())
    or public.is_admin()
  );

create policy "users submit hackathons for moderation"
  on public.hackathons for insert
  to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'pending'
  );

create policy "only admins edit hackathons"
  on public.hackathons for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "only admins delete hackathons"
  on public.hackathons for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews
--
-- NOTE THE ABSENCE OF ANY GRANT TO `anon`. This is the anonymity guarantee.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

create policy "users read their own reviews; admins read all"
  on public.reviews for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_admin()
  );

-- A review may only be written by its author, only on an approved hackathon,
-- and only once the hackathon has actually started (PRD 7.3: upcoming
-- hackathons cannot be reviewed yet).
create policy "users write their own review on a started hackathon"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'published'
    and exists (
      select 1
      from public.hackathons h
      where h.id = hackathon_id
        and h.status = 'approved'
        and coalesce(h.start_date, h.end_date) <= current_date
    )
  );

-- Users may edit their own review. `status = 'published'` on both sides means a
-- review an admin has hidden cannot be edited back into visibility.
create policy "users edit their own visible review"
  on public.reviews for update
  to authenticated
  using (user_id = (select auth.uid()) and status = 'published')
  with check (user_id = (select auth.uid()) and status = 'published');

create policy "admins moderate any review"
  on public.reviews for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "users delete their own review"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- ---------------------------------------------------------------------------
-- review_votes — "Foydali"
-- ---------------------------------------------------------------------------

grant select, insert, delete on public.review_votes to authenticated;
grant all on public.review_votes to service_role;

create policy "users read their own votes; admins read all"
  on public.review_votes for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "users vote once, and never on their own review"
  on public.review_votes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.reviews r
      join public.hackathons h on h.id = r.hackathon_id
      where r.id = review_id
        and r.status = 'published'
        and h.status = 'approved'
        and r.user_id <> (select auth.uid())
    )
  );

create policy "users retract their own vote"
  on public.review_votes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- review_reports
-- ---------------------------------------------------------------------------

grant select, insert on public.review_reports to authenticated;
grant update, delete on public.review_reports to authenticated;
grant all on public.review_reports to service_role;

create policy "users read their own reports; admins read all"
  on public.review_reports for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "users report a published review"
  on public.review_reports for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.reviews r where r.id = review_id and r.status = 'published'
    )
  );

create policy "only admins resolve reports"
  on public.review_reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "only admins delete reports"
  on public.review_reports for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- official_responses — publicly readable, admin-authored (PRD 5 / 8)
-- ---------------------------------------------------------------------------

grant select on public.official_responses to anon, authenticated;
grant insert, update, delete on public.official_responses to authenticated;
grant all on public.official_responses to service_role;

create policy "official responses are publicly readable"
  on public.official_responses for select
  to anon, authenticated
  using (true);

create policy "only admins write official responses"
  on public.official_responses for insert
  to authenticated
  with check (public.is_admin());

create policy "only admins edit official responses"
  on public.official_responses for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "only admins delete official responses"
  on public.official_responses for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Hard stop: make absolutely sure nothing above accidentally exposed `reviews`
-- (or the raw author id) to anonymous callers.
-- ---------------------------------------------------------------------------

revoke all on public.reviews from anon;
revoke all on public.review_votes from anon;
revoke all on public.review_reports from anon;

do $$
begin
  if exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'reviews'
      and grantee = 'anon'
  ) then
    raise exception 'SECURITY: anon must never hold a grant on public.reviews';
  end if;
end;
$$;
