# hackathonlar.uz

**The first hackathon review and discovery platform in Uzbekistan.**

Uzbekistan runs a lot of hackathons and the organisational quality varies wildly.
Organisers promise to announce finalists "soon" and never message the teams that
did not make it. Judging criteria shift mid-event. Prizes arrive months late, or
never. All of that feedback currently dies in private Telegram chats, so a new
participant has no way to know whose weekend is worth committing to.

This site makes that record public and structured: verified participants rate a
hackathon across five concrete categories, and every organiser carries an
aggregate score across everything they have ever run.

---

## Contents

- [Stack](#stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Manual steps only a human can do](#manual-steps-only-a-human-can-do)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How the important parts work](#how-the-important-parts-work)
- [Testing](#testing)
- [Deploying to Vercel](#deploying-to-vercel)
- [Roadmap](#roadmap)

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, RSC, TypeScript `strict`) |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Database + Auth | Supabase (Postgres, RLS, Google OAuth + email/password with 6-digit OTP) |
| i18n | `next-intl`, locale-prefixed routes: `/uz` (default), `/ru`, `/en` |
| Icons | `lucide-react` only |
| Fonts | Geologica + IBM Plex Sans, self-hosted through `next/font` |
| Testing | Vitest (unit) + Playwright (e2e, security, responsive) |
| Analytics | `@vercel/analytics` |

Design decisions and their reasoning live in **[`DECISIONS.md`](./DECISIONS.md)**.
The visual system is specified in **[`docs/design-system.md`](./docs/design-system.md)**.
The latest full test run is recorded in **[`TEST-REPORT.md`](./TEST-REPORT.md)**.

---

## Quick start

Requirements: **Node 20+**, **pnpm 10+**, and **Docker** (for the local Supabase
stack).

```bash
pnpm install

# Boots Postgres, PostgREST, GoTrue, Storage and a local mail catcher in Docker,
# then applies every migration and both seed files.
pnpm db:start

# Copy the printed keys into .env.local (see the next section).
cp .env.example .env.local

pnpm dev            # http://localhost:3000
```

`pnpm db:start` prints an `ANON_KEY` and a `SERVICE_ROLE_KEY`. Paste them into
`.env.local`. Nothing else is needed to run the whole app locally — Google OAuth
is the only feature that needs real credentials, and the app degrades to a clear
message without them.

**Local sign-up really sends email.** The Supabase CLI runs
[Mailpit](http://127.0.0.1:54324) — open it to read the 6-digit confirmation
code during development.

### Demo accounts

`supabase/seed-demo.sql` (loaded automatically on `pnpm db:start` /
`pnpm db:reset`, **never in production**) creates six accounts:

- `demo1@example.invalid` … `demo6@example.invalid`
- password: `DemoParol2026`

They own the 25 demo reviews that make the score bars, histogram, ranking rails
and moderation queue non-empty during development.

---

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `http://127.0.0.1:54321` locally |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public by design; RLS is the real boundary |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server-only.** Never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | yes | Used for canonical URLs, hreflang, sitemap and OG images. Must match the deployed origin exactly, and it is baked into prerendered pages at **build** time |
| `ADMIN_EMAIL` | yes | The account promoted to admin by the seed |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Only needed for Google sign-in |

> `NEXT_PUBLIC_SITE_URL` is read during `next build`. Changing it later requires
> a redeploy, not just an env-var update.

---

## Manual steps only a human can do

Everything below needs a browser and an account somewhere. Nothing else is left.

### 1. Create the Supabase project and load the schema

```bash
pnpm supabase login
pnpm supabase link --project-ref <your-project-ref>
pnpm supabase db push                    # applies supabase/migrations/*.sql
```

Then load the researched catalogue — **`seed.sql` only**:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

> Never run `supabase/seed-demo.sql` against production. It creates fake
> accounts and fabricated reviews for local development only.

### 2. Google OAuth credentials

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services
   → Credentials → Create credentials → OAuth client ID → Web application**.
2. **Authorised JavaScript origins**
   - `https://hackathonlar.uz`
   - `http://localhost:3000` (for local testing)
3. **Authorised redirect URIs** — these point at *Supabase*, not at this app:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - `http://127.0.0.1:54321/auth/v1/callback` (for local testing)
4. Copy the client ID and secret into **Supabase dashboard → Authentication →
   Providers → Google**, and enable the provider.
5. Put the same values in `.env.local` / Vercel so the local stack matches.

The app's own callback (`/auth/callback`) is already implemented and is
deliberately *not* locale-prefixed, so the URL you register never changes.

### 3. Turn on email OTP in the hosted project

Local development already does this via `supabase/config.toml`. On the hosted
project, mirror it:

1. **Authentication → Providers → Email** → enable **Confirm email**.
2. **Authentication → Email Templates → Confirm signup** → replace the magic
   link with `{{ .Token }}` (copy the markup from
   `supabase/templates/confirmation.html`).
3. Do the same for **Reset password** using `supabase/templates/recovery.html`.
4. Configure a real SMTP provider — the built-in sender is rate-limited to a
   handful of emails per hour and is not usable in production.

Using a code rather than a magic link is deliberate: it keeps the user on the
page, so a half-written review is never lost to a redirect.

### 4. Make yourself an admin

Sign up through the site with the address in `ADMIN_EMAIL`, then run:

```sql
update public.profiles set role = 'admin'
 where id = (select id from auth.users where email = 'you@example.com');
```

`supabase/seed.sql` runs the same statement automatically, so re-running the
seed after signing up also works. There is no way to grant yourself admin from
the UI — column privileges prevent it, and a trigger blocks it as well.

### 5. Domain

1. Vercel → **Settings → Domains** → add `hackathonlar.uz`.
2. Point the DNS records Vercel shows you.
3. Set `NEXT_PUBLIC_SITE_URL=https://hackathonlar.uz` in Vercel and **redeploy**
   (see the note above about build-time baking).
4. Add `https://hackathonlar.uz/**` to **Supabase → Authentication → URL
   Configuration → Redirect URLs**, and set the Site URL.

### 6. Before launch

- Confirm or delete the seed entries marked `illustrative` — currently one:
  `nasa-space-apps-challenge-2026-tashkent`, whose Tashkent edition was not
  publicly confirmed at research time. `supabase/seed.sql` flags it in a comment.
- Double-check that no demo review reached production:
  `select count(*) from auth.users where email like '%@example.invalid';`
  must return `0`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm verify` | typecheck → lint → unit tests → build. Run before pushing |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright (builds and boots a production server first) |
| `pnpm lighthouse` | Mobile Lighthouse against `:3100`, fails under threshold |
| `pnpm db:start` / `db:stop` | Local Supabase stack |
| `pnpm db:reset` | Re-apply migrations + seeds from scratch |
| `pnpm db:types` | Regenerate `src/lib/supabase/database.types.ts` |
| `pnpm seed:generate` | Rebuild `seed.sql` / `seed-demo.sql` from `supabase/seed-data/*.json` |

---

## Project structure

```
src/
├── app/
│   ├── [locale]/            THE ROOT LAYOUT lives here (see the note in layout.tsx)
│   │   ├── hackathons/      catalog, detail, review form
│   │   ├── organizers/      index + accountability scoreboard
│   │   ├── admin/           moderation queue, reviews, reports, CRUD
│   │   ├── submit/ profile/ rules/ about/
│   │   └── [...rest]/       catch-all -> designed 404
│   ├── auth/callback/       OAuth code exchange (never locale-prefixed)
│   ├── opengraph-image.tsx  default social card
│   ├── sitemap.ts robots.ts
│   └── globals.css          all design tokens live here
├── components/              brand, ui, score, layout, hackathon, review, admin
├── lib/
│   ├── queries/             server-only reads; cached public + per-viewer overlay
│   ├── actions/             server actions (the only write path)
│   ├── supabase/            browser / server / service-role clients
│   ├── validation/          zod schemas shared by client and server
│   ├── score.ts             THE score language: bands, colours, maths
│   └── format.ts            deterministic dates and numbers
├── messages/                uz.json (source of truth), ru.json, en.json
└── i18n/                    next-intl routing, navigation, request config

supabase/
├── migrations/              schema → views → RLS → storage → policy fixes
├── seed-data/*.json         researched dataset with sources and confidence
├── seed.sql                 generated; production-safe, zero reviews
└── seed-demo.sql            generated; LOCAL ONLY
```

---

## How the important parts work

### Anonymity is enforced by the database, not the UI

`public.reviews` is **never granted to `anon`**, and `authenticated` may only
read its own rows. The public surface is the `public_reviews` view, which
replaces `author_id`, `display_name` and `avatar_url` before the row leaves
Postgres. There is no second door: the raw table, a column-level select, and a
`?author_id=eq.<uuid>` filter are all covered by tests in
`tests/e2e/security.spec.ts` and `tests/e2e/anonymity.spec.ts`.

Admins see the real author through `admin_reviews`, which gates itself on
`has_admin_access()` in SQL.

### Reading is never gated

There is no auth wall anywhere in the browse path. Signing in is required only
to write a review, vote, report or submit. When it is required, the dialog opens
*on top of* whatever you were doing — so a half-written review survives, and the
action re-submits itself once you are in. Drafts are also mirrored to
`localStorage`, so they survive a reload or an OAuth round trip.

### Caching

Public data is read through a cookie-less `anon` client wrapped in
`unstable_cache` with tags, so it is shared across visitors and revalidated on
write via `revalidateTag`. Anything viewer-specific (your votes, your review) is
fetched separately with the session client and merged in — that split is what
lets pages be cached without leaking one user's state to another.

### Score colours

`score >= 4` green, `3–3.99` amber, `< 3` red, no reviews grey. Implemented once
in `src/lib/score.ts#scoreBand()` and reused by every chip, bar, number, badge
and OG image. Never re-derive it inline.

---

## Testing

```bash
pnpm verify        # typecheck, lint, unit, build
pnpm test:e2e      # 76 Playwright tests
pnpm lighthouse    # mobile scores, fails under threshold
```

The e2e suite runs against a **production build** and a live local Supabase, and
it really does sign up through the UI, read the 6-digit code out of Mailpit, and
verify it. It cleans up after itself, so it can be run repeatedly without a
database reset.

See [`TEST-REPORT.md`](./TEST-REPORT.md) for the last full run, including the
Lighthouse numbers and the bugs the suite caught.

---

## Deploying to Vercel

1. Import the repository.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL` and the
   Google credentials.
3. Deploy. Build command and output are the Next.js defaults.
4. Enable **Web Analytics** in the Vercel dashboard (the `@vercel/analytics`
   script 404s locally, which is expected).

---

## Roadmap

Explicitly out of scope for v1, in rough priority order:

1. **Telegram login.** The audience lives in Telegram; it would remove most of
   the sign-up friction that the OTP flow currently absorbs.
2. **A Telegram channel bot** auto-posting new reviews and newly approved
   hackathons — the natural distribution channel for this content.
3. **Verified-participant badges** via certificate upload, to raise the cost of
   a fabricated review.
4. **Organiser accounts** so official responses stop being admin-mediated.
5. **Email digests** of upcoming hackathons, filtered by city and track.
6. **Regional expansion** to the rest of Central Asia once the Uzbek catalogue
   is dense enough to be useful.
