# Decisions

Every significant call made while building this that the PRD did not settle,
with the reasoning and — where it mattered — the measurement that decided it.

Ordered roughly by how much they shape the product.

---

## 1. The accent is cool, not the suggested "hot warm accent"

**Decision:** `--color-accent: #046D82`, a deep flag-blue/majolica teal.

The PRD recommended "a saturated orange-red or Uzbekistan-flag-adjacent green"
and left the call to me. Both create a collision. The score scale already owns
green (good), amber (mediocre) and red (bad), and those three hues appear on
every card, bar and chip on the site. A warm accent sits one hue-step from the
amber chip, so a brand button starts reading as a score. Uzbek-flag green
collides outright with "good".

A cool accent is unambiguous at every size, and cool-on-warm-paper is the
classic editorial tension. It also stays culturally grounded: it is the blue of
the Uzbek flag and of Samarkand tilework, not a generic SaaS blue.

Measured contrast: **5.30:1** on paper, **5.97:1** on white, **5.97:1** for
white text on the accent. All AA.

---

## 2. Typography: Geologica + IBM Plex Sans, chosen by reading font binaries

**Decision:** Geologica (display) + IBM Plex Sans (body).

The PRD suggested Space Grotesk, Archivo Expanded, Sora or Unbounded and asked
me to verify Cyrillic and Uzbek Latin coverage first. Checking the Google Fonts
CSS2 API:

| Family | Cyrillic subset |
| --- | --- |
| Space Grotesk | **none** |
| Sora | **none** |
| Archivo | **none** |
| Unbounded | yes |
| Geologica | yes |

Three of the four suggestions would have broken the entire Russian locale.
Between the two survivors, Unbounded's very wide letterforms wrap badly for long
Russian and Uzbek headlines at 375px, and 70%+ of traffic is mobile. Geologica
is a technical grotesque that reads like an instrument panel — right for a
scoreboard — and stays compact.

### 2a. The tutuq belgisi: U+2018, not U+02BB

**Decision:** Uzbek copy uses `U+2018` for `o‘`/`g‘` and `U+2019` for the
standalone mark.

A declared `unicode-range` is not proof a glyph exists. Google's CSS advertises
`U+02BB–02BC` in the `latin` subset of both families, but reading the cmap of
the woff2 files `next/font` actually downloaded (with `fontkit`) showed:

| codepoint | Geologica latin | IBM Plex Sans latin |
| --- | --- | --- |
| `U+02BB` turned comma | **absent** | present |
| `U+02BC` apostrophe | present | present |
| `U+2018` / `U+2019` | present | present |

Rendered side by side, `U+02BB` and `U+02BC` both leave a visible gap in Plex —
"Bo ʻlajak" instead of "Bo‘lajak". `U+2018` is the only mark that sits tight and
keeps the correct turned-comma shape in **both** faces at **every** weight, and
it is what most of the Uzbek web uses for exactly this reason. Enforced by a
unit test so it cannot regress.

---

## 3. Formatting is deterministic, because Chromium has no Uzbek locale data

**Decision:** dates, numbers and relative time are formatted from explicit
tables in `src/lib/format.ts`, not from `Intl`.

Asked for the same `uz` tag:

| | Node (full ICU) | Chromium |
| --- | --- | --- |
| number | `3,6` | `3.6` |
| date | `18-mar, 2026` | `2026 M03 18` |
| relative | `3 kun oldin` | `-3 d` |

So anything `Intl`-formatted in Uzbek renders correctly during SSR and then
either hydration-mismatches or degrades into `2026 M03 18` in the browser — for
the locale that is our default. This surfaced as a real React hydration error on
the home page's stats strip.

`Intl` is still used for Russian and English dates, which both engines format
identically. Relative time never touches `Intl` at all: it returns a message key
that next-intl renders from our own catalogue, which also gives correct Russian
plurals for free.

---

## 4. Anonymity is a database boundary, not a UI one

**Decision:** `public.reviews` is not granted to `anon` at all. The public read
surface is the `SECURITY DEFINER` view `public_reviews`.

The PRD requires that the raw `user_id` never reach the client for anonymous
reviews, "enforced at the view/RLS layer, not by hiding in UI". Two designs were
possible:

- `security_invoker = true` on the view + an RLS policy allowing public reads of
  published reviews. Rejected: that requires granting `anon` `SELECT` on
  `reviews.user_id`, which is exactly what must not happen.
- `security_invoker = false` (the default), with the view itself as the security
  boundary. Chosen. Each view re-implements the visibility rule in its own
  `WHERE` (`status = 'approved'`, `status = 'published'`) and strips identity
  before the row can leave Postgres.

The Supabase linter flags definer views generically; the reasoning is documented
at the top of `supabase/migrations/20260101000002_views.sql` so the next person
does not "fix" it.

Admin-facing views additionally gate themselves on `has_admin_access()`, so even
a widened grant returns zero rows to a normal user.

The localized label lives in the message catalogue, not the database: the view
returns the Uzbek default plus an `is_anonymous` flag, and the UI renders the
right language. Locale does not belong in Postgres.

---

## 5. Demo reviews live in a separate seed file

**Decision:** `seed.sql` ships **zero** reviews. Demo content is in
`seed-demo.sql`, loaded only locally.

The PRD allowed "at most 2–3 reviews attributed to an obvious demo account".
But the score bars, the 5→1 histogram, the top/lowest ranking rails (which need
≥3 reviews to qualify), the moderation queue and the report queue cannot be
developed, screenshotted or e2e-tested against three reviews.

Splitting the files gets both: production seed data contains no fabricated
opinion at all, while local development has 25 reviews spanning every score band
and moderation state. The demo accounts are named "Demo foydalanuvchi" on
`@example.invalid` addresses so their provenance is unmistakable, and the README
gives a one-line query to prove none reached production.

---

## 6. Seed data is generated from a researched JSON dataset

**Decision:** `supabase/seed-data/*.json` is the source of truth;
`scripts/generate-seed.mjs` produces the SQL.

Each record carries its `sources` and a `confidence` level, and the generator
writes those into the SQL as comments. Hand-maintaining provenance for 21
hackathons across 6 cities would rot immediately.

Research honesty rules that were applied: unconfirmed dates are `NULL`, never
guessed; `confidence` is recorded per record; and the single entry that could
not be corroborated (`nasa-space-apps-challenge-2026-tashkent` — the global
event is confirmed, its Tashkent edition was not) is marked `illustrative` and
flagged both in `seed.sql` and in the README's pre-launch checklist.

The umbrella "National AI Hackathon — Regional Stages" record was dropped in
favour of the four per-city stage records, which are the events participants
actually attended and can review.

---

## 7. `/` always resolves to `/uz`

**Decision:** `localeDetection: false`, with cookie handling in middleware.

next-intl's locale detection honours `Accept-Language`, which sent every English
browser to `/en` — the PRD says plainly that `/` redirects to `/uz`. Turning
detection off also disables the cookie, so the middleware reads `NEXT_LOCALE`
itself: the default is Uzbek, but an explicit choice made with the switcher is
still respected on the next unprefixed visit. Both behaviours are tested.

---

## 8. `app/[locale]/layout.tsx` is the root layout — there is no `app/layout.tsx`

**Decision:** delete the passthrough root layout.

With a passthrough `app/layout.tsx` present it becomes the root layout, and
because `<html>`/`<body>` live in the locale layout, Next had nowhere to put
generated head content. Measured: `document.querySelector('meta[name=description]').parentElement`
returned `BODY`, and Lighthouse scored SEO 91 with "Document does not have a
meta description" on every page.

Nothing needs a locale-less layout — robots, sitemap, the OG images and the auth
callback are all route handlers — so removing it is clean. A
`[locale]/[...rest]` catch-all covers unmatched paths with the designed 404.

Related: `htmlLimitedBots: /.*/ ` in `next.config.ts`. Next 15 streams metadata
after `</head>` for user agents it considers JS-capable. For a site whose whole
value is being findable and shareable, that is the wrong trade, and it costs
nothing here because every public page is prerendered.

---

## 9. `tailwind-merge` is configured with the project's scales

**Decision:** `extendTailwindMerge` in `src/lib/utils/cn.ts`.

Out of the box it only knows Tailwind's default scales, so it put `text-h3` (a
custom font size) and `text-white` (a colour) in the same conflict group and
dropped one of them. That shipped two visible bugs: primary buttons rendered
dark ink on the accent fill, and score numbers rendered at body size. Fixing it
once at the source beats a `!important` at each call site.

---

## 10. Every Tailwind `grid` declares an explicit base column count

**Decision:** `grid grid-cols-1 …` everywhere, never a bare `grid`.

A bare `grid` leaves `grid-template-columns: none`, whose implicit `auto` track
is sized to min-content and overflows its container. Tailwind's `grid-cols-N`
expands to `repeat(N, minmax(0, 1fr))`, which clamps the minimum to zero. This
caused real horizontal scroll on mobile — a 412px card in a 343px container.

---

## 11. The review form is a route, not a modal

**Decision:** `/hackathons/[slug]/review`.

The PRD allowed either. A route is deep-linkable, back-button friendly, and a
five-category form with explainers needs real room at 375px. The important part
of the PRD's "trigger pattern" is preserved regardless: the auth dialog opens
*over* the form rather than navigating, so the draft is never unmounted, and the
submit retries itself once authentication succeeds. Drafts are additionally
mirrored to `localStorage` so they survive a reload or an OAuth round trip.

---

## 12. Admin writes use the service role behind `requireAdmin()`; admin reads use RLS

**Decision:** a split, rather than one mechanism for both.

The PRD allows "service-role or admin-role RLS policy". Reads go through
`admin_reviews` / `admin_hackathons` with the admin's own JWT, so the database
decides who is an admin — the page cannot get it wrong. Writes go through the
service role behind a server-side `requireAdmin()`, which keeps the write path
simple and avoids granting `authenticated` column privileges (like
`hackathons.status`) that a submitter must never have.

A `guard()` helper makes the ordering impossible to get wrong: forget it and the
action has no client to use.

---

## 13. Organiser creation during submission goes through the service role

**Decision:** RLS on `organizers` is admin-only for all mutations; the submit
flow creates one via a server action.

PRD 7.5 wants an inline "create new organizer" during submission, but granting
`authenticated` a blanket insert on `organizers` invites spam and duplicate
records — and a duplicate organiser silently splits the very track record this
site exists to keep honest. The server action validates, slugifies, de-duplicates
and rate-limits first. The picker also searches existing organisers *before*
offering to create one.

---

## 14. OG fonts are vendored, not fetched

**Decision:** two WOFF subsets (29KB total) committed under `src/assets/fonts/`
and read from disk.

Satori cannot read the woff2 that `next/font` self-hosts. Fetching from Google
at render time makes image generation — and the build, which prerenders
`/opengraph-image` — depend on a third-party CDN. Reading vendored files removes
that dependency entirely and saves a round trip on cold starts. Both subsets are
passed to Satori because a card mixes scripts: hackathon names are Latin, a
Russian organiser name is Cyrillic.

---

## 15. Fonts are not preloaded

**Decision:** `preload: false` on both families, `cyrillic-ext` dropped, IBM
Plex Sans cut from four static weights to two.

`next/font` emits a `<link rel="preload">` for every requested subset, so an
Uzbek page downloaded all 12 font files (~190KB) including Cyrillic it cannot
use. Mobile LCP was 4.1s against a 1.1s FCP. Without preloading, the browser
fetches subsets on demand from their `unicode-range`: `/uz` pulls Latin, `/ru`
pulls Cyrillic. Performance went from 87 to 91–95.

---

## 16. Rate limits are counted in Postgres

**Decision:** a `count(*)` over the last 24 hours, per PRD 8.

A covered index makes it genuinely cheap, and unlike an in-memory counter it
survives a redeploy and works across serverless instances. It is a spam
throttle, not a security boundary — the real boundaries are RLS and the unique
constraints.

---

## 17. Validation errors are codes, not sentences

**Decision:** zod messages are stable codes (`tooShort`, `dateOrder`, …) that
the UI renders through next-intl as `validation.<code>`; server actions return
`ActionErrorCode` rather than prose.

The alternative — English strings from zod and Postgres — would have been
untranslatable, and would have leaked database text to the browser. Adding a
locale now never means touching a schema.

---

## 18. Reviews are only possible once a hackathon has started

**Decision:** enforced in the `reviews` INSERT policy, not just the UI.

PRD 7.3 implies it ("For upcoming hackathons (no reviews possible yet)"). Since
the whole product is about trustworthy scores, a review of an event that has not
happened has to be impossible at the database level, not merely discouraged.

---

## 19. Ranking rails de-duplicate

**Decision:** a hackathon can appear in "highest rated" or "lowest rated", never
both, and the lowest column is hidden when there is nothing left to contrast.

With only a handful of hackathons above the review threshold, the two rails
listed the same events — which reads as a bug and undermines the point of the
split.

---

## 20. Things deliberately not done

- **A `frontend-design` skill.** The PRD asked me to load one if available; none
  was present in this environment. The craft guidance was instead written down
  explicitly in `docs/design-system.md` and enforced through the responsive and
  Lighthouse suites.
- **Load-more instead of pagination.** Real `<a href>` pagination gives every
  page of the catalog a crawlable, shareable URL. The PRD allowed either.
- **A separate `/hackathons/[slug]/reviews` route.** Reviews sit on the detail
  page, which keeps the verdict and the evidence on one screen and one URL.
- **Dark mode.** Not in the PRD, and the "warm paper" concept is a light-theme
  idea; a dark variant would need its own colour work rather than an inversion.
