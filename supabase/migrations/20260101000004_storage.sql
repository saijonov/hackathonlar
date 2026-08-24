-- ===========================================================================
-- hackathonlar.uz — Storage buckets
-- PRD 12: "File uploads validated (mime, size), stored in a public bucket
-- scoped to covers/avatars only."
--
-- Size and MIME are enforced three times: in the browser (fast feedback), in
-- the server action's zod schema, and here at the bucket level, which is the
-- only one an attacker cannot skip.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers',  'covers',  true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Read: both buckets are public (they hold hackathon covers and avatars that
-- are rendered on public pages).
-- ---------------------------------------------------------------------------

create policy "cover and avatar images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('covers', 'avatars'));

-- ---------------------------------------------------------------------------
-- Write: a signed-in user may only write inside a folder named after their own
-- user id, e.g. covers/<uid>/<random>.webp. That keeps one user from
-- overwriting another's upload.
-- ---------------------------------------------------------------------------

create policy "users upload covers into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users manage their own covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users delete their own covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users manage their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admins (and the service role, which bypasses RLS entirely) may curate any
-- object — e.g. replacing a bad cover during moderation.
create policy "admins manage all cover and avatar objects"
  on storage.objects for all
  to authenticated
  using (bucket_id in ('covers', 'avatars') and public.is_admin())
  with check (bucket_id in ('covers', 'avatars') and public.is_admin());
