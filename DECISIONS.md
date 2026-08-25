# Decisions

Every significant call made while building this that the PRD did not settle,
with the reasoning and — where it mattered — the measurement that decided it.

Ordered roughly by how much they shape the product.

> **Note on §0.1, §1 and §2.** The visual language has been rebuilt twice: once
> to lobstr.io's (§0.1, branch `reddish`) and once to the reference poster's
> (§0, branch `a-new-style`). The older entries are kept because their
> *reasoning* still constrains the current design even where their answers no
> longer apply — §0 says which parts had to be re-solved rather than dropped.

---

## 0. A dark canvas with light panels — and a token layer that inverts itself

**Decision:** rebuild the design language from the reference poster — near-black
canvas, light corner-notched panels, acid lime and violet, very wide uppercase
display type — and implement the inversion by **redeclaring contextual tokens
inside a `panel` utility** rather than doubling every component.

The poster was sampled programmatically (Playwright + canvas, regional modal
colour analysis) rather than eyeballed, which is what made the palette
measurable: `#1F1F1F` canvas, `#E1E1E1` panel, `#CCEC43` lime, `#8D58FF` violet.

### The architectural problem this design creates

Both previous systems had one context: dark ink on a light page. This one has
two — the page is dark, the panels on it are light — so `--color-ink` has to mean
opposite things in the same document. Doubling every utility (`text-ink` /
`text-panel-ink`) would have touched every component and stayed permanently
error-prone.

Tailwind v4 compiles `text-ink-2` to `color: var(--color-ink-2)`, so redeclaring
that variable inside a scope flips every descendant for free:

```css
@utility panel {
  --color-ink: #17170f;    /* #f4f3ef on the canvas */
  --color-good: #136a4f;   /* #0eab5f on the canvas */
  …
}
```

29 files kept using `text-ink-3` and `text-good` unchanged. The trade is that a
token can now be *wrong for its context* rather than merely wrong, which is a
subtler failure — so `palette.test.ts` parses both blocks and asserts that every
contextual token **has** a panel override. Adding one to `@theme` and forgetting
the override is a test failure, not a silent bug.

This bit immediately and for real: form controls were `bg-surface text-ink`, and
because `--color-surface` is the *light panel* colour while canvas
`--color-ink` is near-white, every filter control on the catalog page rendered
white-on-white. Controls are now transparent, which makes them
context-independent by construction.

### The palette is not shippable as measured

| Reference colour | Problem |
| --- | --- |
| `#CCEC43` lime | 12.28:1 on the canvas ✓ but **1.03:1** as text on a light panel |
| `#8D58FF` violet | fails AA in **both** contexts (3.90 / 3.23) and white-on-it fails too (4.22) |

- Lime ships unchanged but is **fill-only** — which is how the reference uses it.
- Violet is re-solved per role by constrained nearest-colour search: `#9569FF`
  canvas text (19 RGB units from the original), `#6229D9` panel text (74),
  `#8A51FC` fill under white text (8).
- The **contextual accent swaps hue**: lime on the canvas, violet inside a panel.
  Both are the reference's own colours; only the roles trade places. The result
  is an accent that is always legible with no component branching.
- A lime fill has 1.03:1 against a light panel, so anything filled lime **must**
  carry a 2px ink border or its boundary vanishes (WCAG 1.4.11). The test asserts
  the ratio *stays* below 3:1, so the rule keeps its justification.

The score scale was solved **twice**, once per context, to 5.5:1 on the canvas
(a minimally-passing colour on near-black reads muddy) and 4.5:1 on panels. Two
constraints beyond contrast: ≥55 RGB units between bands, and **≥90 units from
lime** — lime is a yellow-green one hue-step from both "good" and "mid", so
without it a score chip could read as a brand fill. An early solve pass had to
be rejected and redone: raw RGB distance let the optimiser cheat through the
low-luminance blue channel, turning "no reviews" purple and "mediocre" brown, so
hue windows and an achromatic constraint were added.

### What the tests caught that the eye did not

- `--color-ink-3` on `--color-accent-soft` measured **4.24:1**. The token matrix
  only covered ink against the three page *grounds*, never against the chip
  *tints* — Lighthouse found it first. The tint was darkened rather than the one
  call site patched, so now *any* ink tone is safe on *any* tint and a chip
  cannot be built wrong. The matrix was extended to cover it.
- `text-white` on the canvas danger fill: **3.00:1**. Now `text-paper`, which is
  contextual (5.50 canvas / 5.01 panel).
- A `<span>` used as a panel wrapper contained `<p>` elements. That is invalid
  HTML; the browser auto-closes the span and the panel silently collapses. `<a>`
  has a transparent content model, so the wrapper is a `<div>`. A DOM-nesting
  check now runs over all 9 routes.
- Horizontal overflow at three separate widths, each a different cause: the caps
  hero at 375px (**429px in a 343px box**), a long Russian button label at
  320px, and the whole desktop header at 1024px (a display-face "Добавить
  хакатон" measured **221px**). Fixed by lowering the display clamp floors,
  making `lg` button padding responsive, setting buttons in the *body* face, and
  moving the desktop header breakpoint from `lg` to `xl`. Now verified at 11
  widths x 18 routes x 3 locales.

### Costs, stated plainly

Two families instead of one costs roughly **4 Lighthouse perf points** (95–99 →
91–96, threshold 90). Measured, not assumed: fonts are not render-blocking and
load in ~30ms locally, so the cost is payload under simulated slow-4G.
Requesting three static cuts instead of the variable axis was tried and served
byte-for-byte the same 128KB. The wide display face is the identity here, so the
cost is accepted rather than designed away.

`clip-path` also constrains the interaction layer permanently: it crops focus
rings and clips box-shadows. Card links are therefore an unclipped `<a>` around a
clipped inner panel, buttons are pills rather than notched, and `card-lift` uses
`drop-shadow` on the wrapper so the shadow traces the notched silhouette.

Documented in full in `docs/design-system.md` §0, §2 and §4.

---

## 0.1 The visual language is lobstr.io's, measured — but its palette is not shippable as-is

**Decision:** reproduce lobstr.io's design language (white ground, `#0A2540`
navy ink, red accent, 2px navy card outlines, one very heavy type family, a
6/8/12 radius ladder) — but re-solve every colour that fails WCAG AA instead of
copying the hex.

lobstr.io's computed styles were extracted programmatically with Playwright
rather than eyeballed from screenshots, which is what made the failures
measurable in the first place. Three of their colours do not clear AA:

| lobstr colour | Role | Contrast on white | Verdict |
| --- | --- | --- | --- |
| `#FF0000` | brand red | **4.00:1** | fails as link text *and* as white-on-red |
| `#50B96F` | green | **2.47:1** | fails |
| `#B5BACA` | slate | **1.94:1** | fails |

`#FF0000` was the consequential one: nearly every CTA here is a solid red button
with white text, so shipping it would have put an AA failure on every page of
the site. Each was solved to the nearest value on the same hue that clears the
bar — `#DB0000` (5.23:1, only 36 RGB units from `#FF0000`), `#347948`,
`#626E81`. Side by side the reds read as the same brand colour.

**The second-order problem the restyle created.** The original palette put the
accent (teal) a long way from the score scale on purpose — see §1. Moving the
accent to red destroyed that separation: brand red and "bad score" red became
51 RGB units apart, close enough that at chip size a *submit* button and a
2.3-star verdict read as the same signal. So `--color-bad` was pushed deeper to
`#A82A1F` — 73 units from the accent, and lower luminance so the brand colour is
always the one that comes forward. §1's argument survived the restyle; only its
answer changed.

**Typography collapsed from two families to one.** lobstr runs a single
humanist grotesque at four weights, and that is a large part of why their pages
read as one voice; §2's two-family split works against that. Both Geologica and
IBM Plex Sans were replaced by **Source Sans 3** (400–900), which carries
`latin`, `latin-ext` *and* `cyrillic` — the coverage requirement from §2 is what
made a single-family stack viable at all. It also has a real `U+02BB`, which
Geologica lacked; the glyph audit was re-run against the new binaries and the
Uzbek `U+2018` convention deliberately kept anyway (`docs/design-system.md`
§3.0).

`tests/unit/palette.test.ts` re-derives all of this from `globals.css` on every
run — every ink/ground pair, every score-on-tint pair, the accent in both
directions, and the minimum RGB distance between the two reds. It also caught a
real defect the eye did not: `--color-numeral` at `#828EA8` measured 2.87:1 on
the darkest ground, under even the AA-large bar, and was re-solved to `#788298`.

Lighthouse then confirms the whole thing against rendered pixels:
**accessibility 100 on all nine audited routes.**

Documented in full in `docs/design-system.md` §2.

---

## 1. The accent is cool, not the suggested "hot warm accent" *(superseded by §0.1, then §0)*

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

## 2. Typography: Geologica + IBM Plex Sans, chosen by reading font binaries *(superseded by §0.1, then §0)*

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
