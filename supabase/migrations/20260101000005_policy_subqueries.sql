-- ===========================================================================
-- Fix: "Foydali" votes and reports were impossible on anyone else's review.
--
-- THE BUG
-- -------
-- The INSERT policies on review_votes and review_reports validated their
-- target with an inline subquery:
--
--     exists (select 1 from public.reviews r where r.id = review_id ...)
--
-- PostgreSQL applies row level security to tables referenced *inside* a policy
-- expression as well. `public.reviews` deliberately only lets a user see their
-- own rows, so that EXISTS was false for every review written by somebody
-- else — and the insert was rejected with 42501. In other words: a user could
-- only vote on, or report, their own review. Exactly backwards.
--
-- Confirmed against the running database before this migration was written:
--     select on someone else's review -> 0 rows
--     insert review_reports           -> 42501 new row violates RLS
--     insert review_votes             -> 42501 new row violates RLS
--
-- THE FIX
-- -------
-- Move each question into a SECURITY DEFINER function. It runs as the table
-- owner, so it can see every review, but it returns only a boolean — no row,
-- no author id, nothing that could deanonymise a review. The policies then ask
-- the function instead of querying the table directly.
-- ===========================================================================

-- Is this review one that the current user is allowed to mark helpful?
-- Published, on an approved hackathon, and not their own (PRD 8).
create or replace function public.review_is_votable(target_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.reviews r
    join public.hackathons h on h.id = r.hackathon_id
    where r.id = target_review_id
      and r.status = 'published'
      and h.status = 'approved'
      and r.user_id <> (select auth.uid())
  );
$$;

comment on function public.review_is_votable is
  'Boolean-only check used by the review_votes INSERT policy. SECURITY DEFINER so it can see published reviews the caller cannot read directly; it never returns row data.';

-- Is this review one that can be reported? Published and publicly visible.
-- Reporting your own review is pointless but harmless, so it is not blocked.
create or replace function public.review_is_reportable(target_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.reviews r
    join public.hackathons h on h.id = r.hackathon_id
    where r.id = target_review_id
      and r.status = 'published'
      and h.status = 'approved'
  );
$$;

comment on function public.review_is_reportable is
  'Boolean-only check used by the review_reports INSERT policy. See review_is_votable for why this must be SECURITY DEFINER.';

revoke all on function public.review_is_votable(uuid) from public;
revoke all on function public.review_is_reportable(uuid) from public;
grant execute on function public.review_is_votable(uuid) to authenticated, service_role;
grant execute on function public.review_is_reportable(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Re-create the two policies against the helpers.
-- ---------------------------------------------------------------------------

drop policy if exists "users vote once, and never on their own review" on public.review_votes;

create policy "users vote once, and never on their own review"
  on public.review_votes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.review_is_votable(review_id)
  );

drop policy if exists "users report a published review" on public.review_reports;

create policy "users report a published review"
  on public.review_reports for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.review_is_reportable(review_id)
  );
