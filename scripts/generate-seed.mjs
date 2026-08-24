#!/usr/bin/env node
/**
 * Generates supabase/seed.sql and supabase/seed-demo.sql from the researched
 * dataset in supabase/seed-data/.
 *
 * Run:  pnpm seed:generate
 *
 * Why generated rather than hand-written: the research data carries `sources`
 * and `confidence` per record, and those have to survive into the SQL as
 * comments so anyone auditing the seed can see where a fact came from. Doing
 * that by hand across 21 hackathons would rot immediately.
 *
 * Two outputs, deliberately separate (see DECISIONS.md):
 *   seed.sql       organizers + hackathons only. Zero reviews. Production-safe.
 *   seed-demo.sql  demo accounts + reviews for local development, visual QA and
 *                  e2e tests. NEVER run against production.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const seedDir = join(root, 'supabase');
const dataDir = join(seedDir, 'seed-data');

/** Stable UUIDv5-shaped id derived from a namespace + name. */
function uuidFrom(namespace, name) {
  const hex = createHash('sha1').update(`hackathonlar.uz:${namespace}:${name}`).digest('hex');
  const bytes = hex.slice(0, 32).split('');
  // Set version 5 and the RFC 4122 variant so the value is a well-formed UUID.
  bytes[12] = '5';
  bytes[16] = '8';
  const s = bytes.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}

const q = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);
const qDate = (value) => (value ? `'${value}'::date` : 'null');
const qArray = (values) =>
  !values || values.length === 0 ? `'{}'::text[]` : `array[${values.map(q).join(', ')}]::text[]`;

function wrapComment(text, width = 74) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map((l) => `--   ${l}`).join('\n');
}

// ---------------------------------------------------------------------------
// seed.sql — the real, researched catalogue
// ---------------------------------------------------------------------------

function buildSeed(data) {
  const out = [];
  const counts = data.hackathons.reduce((acc, h) => {
    acc[h.confidence] = (acc[h.confidence] ?? 0) + 1;
    return acc;
  }, {});
  const illustrative = data.hackathons.filter((h) => h.confidence === 'illustrative');

  out.push(`-- ===========================================================================
-- hackathonlar.uz — seed data
--
-- GENERATED FILE. Edit supabase/seed-data/hackathons.json and run
-- \`pnpm seed:generate\` instead of editing this file by hand.
--
-- Provenance
-- ----------
-- Every organizer and hackathon below was researched from public sources on
-- ${data._meta.research_date}. The \`sources:\` comment above each record lists where the
-- facts came from. Fields that could not be corroborated are NULL — they are
-- never guessed. Confidence breakdown:
--     verified     ${String(counts.verified ?? 0).padStart(2)}   corroborated on an official site or by two reputable sources
--     partial      ${String(counts.partial ?? 0).padStart(2)}   the event definitely exists; some fields remain uncertain
--     illustrative ${String(counts.illustrative ?? 0).padStart(2)}   could NOT be corroborated — see the warning below
--
${
  illustrative.length
    ? `-- !! ILLUSTRATIVE ENTRIES — REVIEW BEFORE PUBLIC LAUNCH !!
${illustrative
  .map((h) => `--     ${h.slug}\n${wrapComment(h.notes ?? '')}`)
  .join('\n')}
-- Delete them, or confirm them, before the site goes public. They are included
-- because the PRD asks for upcoming events and only these were findable.
--`
    : '-- No illustrative entries: every record is corroborated.'
}
--
-- NO REVIEWS ARE SEEDED HERE, BY DESIGN.
-- The credibility of this platform depends on never fabricating an opinion.
-- Demo reviews for local development live in seed-demo.sql, are attributed to
-- accounts literally named "Demo foydalanuvchi", and must never be loaded into
-- production. See README "Manual steps".
-- ===========================================================================

begin;
`);

  out.push(`
-- ---------------------------------------------------------------------------
-- Organizers (${data.organizers.length})
-- ---------------------------------------------------------------------------
`);

  for (const org of data.organizers) {
    const id = uuidFrom('organizer', org.slug);
    if (org.sources?.length) {
      out.push(`-- sources: ${org.sources.join(' | ')}`);
    }
    out.push(`insert into public.organizers (id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en)
values (
  ${q(id)}, ${q(org.slug)}, ${q(org.name)},
  ${q(org.logo_url)}, ${q(org.website)}, ${q(org.telegram)},
  ${q(org.description_uz)},
  ${q(org.description_ru)},
  ${q(org.description_en)}
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website = excluded.website,
  telegram = excluded.telegram,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en;
`);
  }

  out.push(`
-- ---------------------------------------------------------------------------
-- Hackathons (${data.hackathons.length})
-- All seeded as status = 'approved': they are researched, not user-submitted.
-- ---------------------------------------------------------------------------
`);

  for (const h of data.hackathons) {
    const id = uuidFrom('hackathon', h.slug);
    const organizerId = uuidFrom('organizer', h.organizer_slug);
    out.push(`-- [${h.confidence}] ${h.name}`);
    if (h.notes) out.push(wrapComment(h.notes));
    if (h.sources?.length) out.push(`-- sources: ${h.sources.join(' | ')}`);
    out.push(`insert into public.hackathons (
  id, slug, name, organizer_id,
  description_uz, description_ru, description_en,
  city, format, start_date, end_date,
  prize_pool, tracks, website, telegram, registration_url,
  cover_url, status
) values (
  ${q(id)}, ${q(h.slug)}, ${q(h.name)}, ${q(organizerId)},
  ${q(h.description_uz)},
  ${q(h.description_ru)},
  ${q(h.description_en)},
  ${q(h.city)}, ${q(h.format)}, ${qDate(h.start_date)}, ${qDate(h.end_date)},
  ${q(h.prize_pool)}, ${qArray(h.tracks)}, ${q(h.website)}, ${q(h.telegram)}, ${q(h.registration_url)},
  null, 'approved'
)
on conflict (slug) do update set
  name = excluded.name,
  organizer_id = excluded.organizer_id,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  description_en = excluded.description_en,
  city = excluded.city,
  format = excluded.format,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  prize_pool = excluded.prize_pool,
  tracks = excluded.tracks,
  website = excluded.website,
  telegram = excluded.telegram,
  registration_url = excluded.registration_url,
  status = excluded.status;
`);
  }

  out.push(`
-- ---------------------------------------------------------------------------
-- Admin bootstrap (PRD 7.8 / 16.3)
--
-- Promotes the profile whose email matches the ADMIN_EMAIL environment
-- variable. It is a no-op until that person has actually signed up, so it is
-- safe to run before or after the first sign-in — re-run it once they have.
--
-- Manual equivalent, if you would rather not use the env var:
--     update public.profiles set role = 'admin'
--      where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------------

do $seed$
declare
  admin_email text := coalesce(nullif(current_setting('app.admin_email', true), ''), 'admin@hackathonlar.uz');
  promoted    int;
begin
  update public.profiles p
     set role = 'admin'
    from auth.users u
   where u.id = p.id
     and lower(u.email) = lower(admin_email);

  get diagnostics promoted = row_count;

  if promoted > 0 then
    raise notice 'Promoted % profile(s) to admin for %', promoted, admin_email;
  else
    raise notice 'No profile found for % yet — sign up with that email, then re-run this statement.', admin_email;
  end if;
end
$seed$;

commit;
`);

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// seed-demo.sql — local-only demo accounts and reviews
// ---------------------------------------------------------------------------

function buildDemoSeed(demo) {
  const out = [];

  out.push(`-- ===========================================================================
-- hackathonlar.uz — DEMO DATA. LOCAL DEVELOPMENT ONLY.
--
-- GENERATED FILE. Edit supabase/seed-data/demo-reviews.json and run
-- \`pnpm seed:generate\`.
--
-- !! DO NOT RUN THIS AGAINST PRODUCTION !!
--
-- Every account created here is named "Demo foydalanuvchi N" and uses an
-- @example.invalid address precisely so that a fabricated opinion can never be
-- mistaken for a real participant's. These rows exist so that the score bars,
-- rating histogram, ranking rails, moderation queue and report queue have
-- something to render during development, visual QA and end-to-end tests.
--
-- To remove everything this file created:
--     delete from auth.users where email like '%@example.invalid';
-- (reviews, votes, reports and profiles cascade)
-- ===========================================================================

begin;

-- Password for every demo account: ${demo.password}
`);

  const userIds = {};
  for (const user of demo.users) {
    const id = uuidFrom('demo-user', user.key);
    userIds[user.key] = id;
    out.push(`-- ${user.display_name} <${user.email}>
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', ${q(id)}, 'authenticated', 'authenticated',
  ${q(user.email)}, extensions.crypt(${q(demo.password)}, extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', ${q(user.display_name)}),
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), ${q(id)},
  jsonb_build_object('sub', ${q(id)}, 'email', ${q(user.email)}, 'email_verified', true),
  'email', ${q(id)}, now(), now(), now()
)
on conflict (provider_id, provider) do nothing;
`);
  }

  out.push(`
-- The auth trigger creates profiles automatically; make the display names
-- explicit anyway so a re-run repairs them.
`);
  for (const user of demo.users) {
    out.push(`update public.profiles set display_name = ${q(user.display_name)} where id = ${q(userIds[user.key])};`);
  }

  out.push(`
-- ---------------------------------------------------------------------------
-- Reviews (${demo.reviews.length})
-- ---------------------------------------------------------------------------
`);

  for (const review of demo.reviews) {
    const reviewId = uuidFrom('demo-review', `${review.hackathon_slug}:${review.user}`);
    const userId = userIds[review.user];
    if (!userId) throw new Error(`Unknown demo user "${review.user}"`);
    out.push(`insert into public.reviews (
  id, hackathon_id, user_id,
  rating_organization, rating_communication, rating_judging, rating_prizes, rating_venue,
  title, body, pros, cons, is_anonymous, participated_as, status, created_at, updated_at
)
select ${q(reviewId)}, h.id, ${q(userId)},
  ${review.ratings.organization}, ${review.ratings.communication}, ${review.ratings.judging},
  ${review.ratings.prizes}, ${review.ratings.venue},
  ${q(review.title)},
  ${q(review.body)},
  ${q(review.pros)}, ${q(review.cons)},
  ${review.is_anonymous ? 'true' : 'false'}, ${q(review.participated_as)}, ${q(review.status ?? 'published')},
  now() - interval '${review.days_ago} days', now() - interval '${review.days_ago} days'
from public.hackathons h
where h.slug = ${q(review.hackathon_slug)}
on conflict (id) do nothing;
`);
  }

  if (demo.votes?.length) {
    out.push(`
-- Helpful votes
`);
    for (const vote of demo.votes) {
      out.push(`insert into public.review_votes (review_id, user_id)
values (${q(uuidFrom('demo-review', `${vote.hackathon_slug}:${vote.review_user}`))}, ${q(userIds[vote.voter])})
on conflict (review_id, user_id) do nothing;`);
    }
    out.push('');
  }

  if (demo.reports?.length) {
    out.push(`
-- Open reports, so the admin report queue is not empty during QA
`);
    for (const report of demo.reports) {
      out.push(`insert into public.review_reports (review_id, user_id, reason)
values (${q(uuidFrom('demo-review', `${report.hackathon_slug}:${report.review_user}`))}, ${q(userIds[report.reporter])}, ${q(report.reason)})
on conflict (review_id, user_id) do nothing;`);
    }
    out.push('');
  }

  if (demo.official_responses?.length) {
    out.push(`
-- Official organizer responses (admin-authored, PRD 8)
`);
    for (const response of demo.official_responses) {
      out.push(`insert into public.official_responses (review_id, body, author_label)
values (
  ${q(uuidFrom('demo-review', `${response.hackathon_slug}:${response.review_user}`))},
  ${q(response.body)},
  ${q(response.author_label)}
)
on conflict (review_id) do update set body = excluded.body, author_label = excluded.author_label;`);
    }
    out.push('');
  }

  out.push(`
-- A pending submission and a rejected one, so /admin has a non-empty queue and
-- /profile can show every submission state.
`);
  for (const submission of demo.submissions ?? []) {
    const id = uuidFrom('demo-hackathon', submission.slug);
    out.push(`insert into public.hackathons (
  id, slug, name, organizer_id, description_uz, description_ru, description_en,
  city, format, start_date, end_date, prize_pool, tracks, website, telegram,
  registration_url, status, rejection_reason, submitted_by
)
select ${q(id)}, ${q(submission.slug)}, ${q(submission.name)}, o.id,
  ${q(submission.description_uz)}, ${q(submission.description_ru)}, ${q(submission.description_en)},
  ${q(submission.city)}, ${q(submission.format)}, ${qDate(submission.start_date)}, ${qDate(submission.end_date)},
  ${q(submission.prize_pool)}, ${qArray(submission.tracks)}, ${q(submission.website)}, ${q(submission.telegram)},
  ${q(submission.registration_url)}, ${q(submission.status)}, ${q(submission.rejection_reason)}, ${q(userIds[submission.submitted_by])}
from public.organizers o
where o.slug = ${q(submission.organizer_slug)}
on conflict (slug) do nothing;
`);
  }

  out.push(`commit;\n`);
  return out.join('\n');
}

// ---------------------------------------------------------------------------

const data = JSON.parse(readFileSync(join(dataDir, 'hackathons.json'), 'utf8'));
const demo = JSON.parse(readFileSync(join(dataDir, 'demo-reviews.json'), 'utf8'));

writeFileSync(join(seedDir, 'seed.sql'), buildSeed(data));
writeFileSync(join(seedDir, 'seed-demo.sql'), buildDemoSeed(demo));

console.log(
  `seed.sql:      ${data.organizers.length} organizers, ${data.hackathons.length} hackathons\n` +
    `seed-demo.sql: ${demo.users.length} demo accounts, ${demo.reviews.length} reviews, ` +
    `${demo.submissions?.length ?? 0} submissions`,
);
