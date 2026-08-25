# Design System — hackathonlar.uz

> **Concept: The Scoreboard, in lobstr.io's voice.**
> This site is the honest sports page of Uzbekistan's hackathon scene. It is a
> *press* product, not a SaaS landing page: white ground, navy ink, one loud
> red, hard outlines instead of shadows, and **numbers treated as heroes**.
> Every screen should read like a match report — verdict first, evidence after.
>
> The visual language is derived from **lobstr.io**, measured from the live site
> rather than eyeballed: computed styles were pulled with Playwright and the
> palette, radii, border weights and type scale reproduced from those values.
> Where lobstr's own colours fail WCAG AA they are corrected, not copied — see
> §2.2 and `DECISIONS.md`.

This document is the single source of truth for anyone (human or agent) touching
UI. Tokens live in `src/app/globals.css` under `@theme`; do not hardcode values.

---

## 1. Hard bans (Section 9.1 of the PRD — instant failure)

| Banned | Why |
| --- | --- |
| Purple/indigo-on-white SaaS palette, `from-purple-500 to-pink-500` heroes | Default AI look |
| Glassmorphism, blurred colour blobs, floating frosted cards | Default AI look |
| Emoji as UI icons, ✨ anywhere | Icons are Lucide only. (One exception: the literal 🇺🇿 in the footer's "Made in Uzbekistan" line — it is content, not an icon.) |
| Inter / system-ui for headings | Headings are always `font-display` (Source Sans 3 at 900) |
| Centred-everything landing with three identical feature cards | We use asymmetric editorial grids |
| Default Tailwind blue links, default `shadow-lg` everywhere | Links are accent + underline; surfaces are separated by **outlines**, not blur |

---

## 2. Colour

Light theme only. White ground, navy ink, **one** accent — red.

### 2.1 Surfaces & ink

| Token | Hex | Use |
| --- | --- | --- |
| `--color-paper` | `#FFFFFF` | Page background |
| `--color-paper-2` | `#F7F8FC` | Alternating bands, inset wells, table stripes |
| `--color-paper-3` | `#EEEFF5` | The deepest ground — footers, filter rails |
| `--color-surface` | `#FFFFFF` | Cards, panels, modals |
| `--color-ink` | `#0A2540` | Primary text, headings, **card outlines** |
| `--color-ink-2` | `#2F4463` | Body copy, secondary text |
| `--color-ink-3` | `#626E81` | Meta, captions, placeholders |
| `--color-line` | `#E3E6EF` | Hairline 1px borders (default) |
| `--color-line-2` | `#C6CDDC` | Stronger dividers, input borders |
| `--color-numeral` | `#788298` | Large display figures only — ranks, counters (§2.5) |

The three grounds stack: `paper` → `paper-2` → `paper-3`, alternating band by
band down a page. Cards are always `surface` (pure white) so they lift off
`paper-2` and `paper-3` without needing a shadow.

### 2.2 Accent — lobstr red, corrected for contrast

`--color-accent: #DB0000`

lobstr.io's brand red is `#FF0000`. **We do not ship that value.** Measured, it
is `4.00:1` on white — it fails AA as link text, and white-on-`#FF0000` fails
just as hard for a solid primary button. Since practically every CTA on this
site is a solid red button with white text, shipping it would put an AA failure
on every page.

`#DB0000` is the nearest value on the same hue that clears the bar: **5.23:1**
on white in both directions, and 36 units away from `#FF0000` in RGB — close
enough that side by side they read as the same brand red.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-accent` | `#DB0000` | Links, primary buttons, focus ring, wordmark, eyebrows |
| `--color-accent-ink` | `#AD0000` | Hover / pressed |
| `--color-accent-soft` | `#FFECEC` | Tinted backgrounds, selected filter chips |

### 2.3 Score scale — used identically everywhere

The single most important consistency rule on the site. Any number derived from
a 1–5 rating is coloured by this scale, in every chip, bar, number and badge.

| Band | Token | Text hex | Tint hex | Contrast on white |
| --- | --- | --- | --- | --- |
| `>= 4.0` good | `--color-good` / `--color-good-soft` | `#347948` | `#EAF6EF` | 5.13:1 |
| `3.0 – 3.99` mid | `--color-mid` / `--color-mid-soft` | `#8F640E` | `#FDF4E3` | 5.14:1 |
| `< 3.0` bad | `--color-bad` / `--color-bad-soft` | `#A82A1F` | `#FDEBE9` | 6.96:1 |
| no reviews | `--color-none` / `--color-none-soft` | `#626E81` | `#EEEFF5` | 5.79:1 |

Implemented once in `src/lib/score.ts#scoreBand()`. Never re-derive inline.

**Why the "bad" red is not the brand red.** With a red accent the two would
collide, and "this button is important" would read identically to "this
hackathon was bad". `--color-bad` is therefore deliberately deeper and darker:
73 units from `--color-accent` in RGB, and lower luminance, so the brand colour
is always the one that comes forward. lobstr's own green (`#50B96F`, 2.47:1) and
slate (`#B5BACA`, 1.94:1) were rejected on the same contrast grounds and
re-solved to the values above.

### 2.4 Status colours (non-score)

`--color-danger #A82A1F`, `--color-warning #8F640E`, `--color-success #347948` —
deliberately the same three hues as the score bands, so a destructive action and
a bad rating share a colour while a destructive action and *submit* never do.

### 2.5 The numeral tone

`--color-numeral #788298` is the only token that does not clear 4.5:1. It is
allowed at **3:1 (AA-large)** because it is used exclusively for figures set in
`--text-h1` or larger — ranks, counters, the 404 numeral. `--text-h1`'s clamp
floor is 24px, which keeps the exemption legal at every viewport.

Every claim in this section is re-derived from `globals.css` on each test run by
`tests/unit/palette.test.ts`, including the type-scale floor above; Lighthouse
then confirms it against real rendered pixels (a11y **100** on all nine audited
routes).

---

## 3. Typography

**One family, four weights** — this is lobstr.io's typographic model, and it is
the reason their pages feel like a single voice rather than a headline pasted
onto body copy. Verified by reading the cmap of the shipped woff2 files for
**Latin + Latin Extended + Cyrillic** — and, critically, for the Uzbek *tutuq
belgisi*. That last check changed the answer; see §3.0.

| Role | Family | Token | Notes |
| --- | --- | --- | --- |
| Display / headings / numbers | **Source Sans 3** at 800–900 | `font-display` | Humanist grotesque. At 900 with `-0.04em` tracking it produces lobstr's very heavy, very tight headline. |
| Body / UI | **Source Sans 3** at 400–700 | `font-sans` | The same family, so nothing on the page is a stylistic stranger. |

lobstr's own stack resolves to a Source-Sans-class humanist; using the real
variable font gives us the identical texture with a genuine 900 weight and a
complete Cyrillic subset, which the Russian locale requires.

Both are self-hosted at build time via `next/font/google` (Next downloads the
files and serves them from our own origin — zero runtime requests to Google).
Italics are not downloaded; the design system never uses them.

**Rejected candidates and why** (checked live against the Google Fonts CSS2 API):
Space Grotesk, Sora and Archivo ship **no Cyrillic subset at all** — they would
break the entire Russian locale. Unbounded *does* have Cyrillic but its very
wide letterforms wrap badly for long Russian/Uzbek headlines at 375px, and 70%
of our traffic is mobile. Source Sans 3 carries `latin`, `latin-ext` **and**
`cyrillic`, which is what makes a single-family stack possible here at all.

### 3.0 The tutuq belgisi — re-verified after the font change

A declared `unicode-range` is **not** proof a glyph exists, so the shipped woff2
files are read directly with `fontkit` and the marks rendered in the live page.

Under the previous two-family stack this check was decisive: Geologica had no
`U+02BB` at all, so "Boʻlajak" came out as "Bo ʻlajak". **Source Sans 3 does not
have that gap.** Re-measured against the files Next actually emitted into
`.next/static/media`:

| codepoint | in Source Sans 3 `latin` | renders at 400 / 900 |
| --- | --- | --- |
| `U+02BB` modifier letter turned comma | present | tight, correct turned-comma |
| `U+02BC` modifier letter apostrophe | present | tight, straight apostrophe |
| `U+2018` / `U+2019` quotation marks | present | tight, correct turned-comma |

Advance widths are identical to two decimal places (11.20px at 900, ~8.5px at
400) and `.qa/reddish-glyphs.png` shows no gap on any row.

**All Uzbek copy nonetheless keeps `U+2018` for the tutuq belgisi in `o‘` / `g‘`
and `U+2019` for the standalone mark (`e’lon`, `ma’no`).** The typographic
constraint that forced that choice is gone; the choice is retained because it is
the prevailing convention on the Uzbek web, because it survives copy-paste into
editors that normalise quotes, and because the whole corpus is already normalised
to it and pinned by `tests/unit/localized-text.test.ts`. Mixing conventions
mid-corpus would be strictly worse than either one alone.

### 3.1 Scale

Fluid, mobile-first. Headline sizes are big and tight; body is generous.

| Token | Size | Line | Tracking | Use |
| --- | --- | --- | --- | --- |
| `text-display-1` | `clamp(2.5rem, 7.5vw, 5rem)` | `1.04` | `-0.04em` | Home hero only — weight **900** |
| `text-display-2` | `clamp(1.875rem, 4.5vw, 2.5rem)` | `1.1` | `-0.04em` | Page H1 — weight **900** |
| `text-h1` | `clamp(1.5rem, 3vw, 2rem)` | `1.15` | `-0.03em` | Section heads. **Floor is 24px by contract** (§2.5) |
| `text-h2` | `1.375rem` | `1.15` | `-0.015em` | Card titles, panels |
| `text-h3` | `1.0625rem` | `1.25` | `-0.01em` | Sub-heads |
| `text-body-lg` | `1.0625rem` | `1.65` | `0` | Lead paragraphs |
| `text-body` | `0.9375rem` | `1.65` | `0` | Default |
| `text-meta` | `0.8125rem` | `1.45` | `0` | Dates, counts, captions |
| `text-micro` | `0.6875rem` | `1.2` | `0.09em` | **Eyebrows** — always uppercase |

Numbers always use `font-variant-numeric: tabular-nums` (utility: `.tnum`) so
score columns align.

### 3.2 Eyebrow

The recurring editorial device: `text-micro uppercase tracking-[0.09em]` in
`--color-accent` or `--color-ink-3`, sitting directly above a display heading,
often with a 1px rule. Used on every section header on the site.

---

## 4. Geometry

### 4.1 Radius — one scale, sharp

`--radius-xs 4px` · `--radius-sm 6px` · `--radius-md 8px` · `--radius-lg 12px` ·
`--radius-xl 16px` · `--radius-full 999px` (avatars only)

Measured off lobstr.io, which runs a tight 6 / 8 / 12 ladder. Chips and badges
use `xs`/`sm`; inputs `sm`; buttons `md`; cards `lg`; large panels and modals
`xl`.

### 4.2 Borders & elevation

**Hard outlines and flat fills, never blurry shadows.** This is the single
most recognisable thing about lobstr.io's surfaces, and the whole reason the
site can sit on white without dissolving.

- Content cards use the `card-outline` utility: `bg-surface` + **2px `--color-ink`** + `rounded-lg`. A navy outline on white, no shadow at rest.
- Buttons carry a 2px border in their own colour, so a solid and an outline button occupy exactly the same box.
- `--shadow-lift`: `0 6px 20px -12px rgb(10 37 64 / 0.30)` — hover only, and barely visible.
- `--shadow-pop`: `0 24px 56px -28px rgb(10 37 64 / 0.35)` — modals / drawers only.

The old `--shadow-print` offset was removed: with 2px outlines everywhere it
read as a doubled border rather than a print offset.

Hover on a card: `border-color: --color-accent` + `--shadow-lift` +
`translateY(-2px)`. That is the entire interaction vocabulary.

### 4.3 Layout

- Container `--container-page: 75rem` (1200px), gutters `16 / 24 / 32px` at `base / md / lg`.
- Spacing uses the default Tailwind 4px scale.
- Section rhythm: `py-14 md:py-20`; a `1px` `--color-line` rule separates major bands.
- The catalog grid is `1 / 2 / 3` columns at `base / sm:640 / lg:1024`.

---

## 5. The signature component — `<ScoreMark>`

**One** score component, reused at every size. It is the brand.

```
 ┌─┬──────┐
 │▌│ 2.8  │  ★★★☆☆   14 sharh
 └─┴──────┘
  ▲   ▲       ▲        ▲
  │   │       │        └ review count (text-meta, ink-3)
  │   │       └ five stars, partial fill by fraction
  │   └ score, font-display 800, tabular-nums
  └ 3px left rule in the band colour — the scoreboard "cell"
```

Anatomy, in order: a **left rule** in the band colour, a **tinted cell**
(`--color-*-soft`) holding the **number** in the band colour, then optional
**stars**, then optional **count**.

| Size | Number | Cell | Stars | Where |
| --- | --- | --- | --- | --- |
| `xs` | `text-meta` 700 | 22px tall | hidden | Inline in dense lists, admin tables |
| `sm` | `text-h3` 800 | 28px | 12px | Hackathon cards, organizer cards |
| `md` | `text-h1` 800 | 40px | 16px | Review headers, organizer page |
| `lg` | `text-display-2` 800 | 64px | 20px | Hackathon detail score panel, home stats |

Companion parts, same colour logic:

- **`<ScoreBar>`** — 1px-bordered track (`--color-paper-2`), fill in band colour,
  `height 8px`, `rounded-xs`. Animates `width` from 0 on first view.
- **`<Stars>`** — Lucide `Star`, partial fill via a clipped overlay. Always has
  a text alternative (`aria-label="4.2 / 5"`), never emoji.
- **`<ScoreDistribution>`** — five stacked mini-bars, 5→1, counts right-aligned.

Zero-review state: band `none`, cell shows `—`, count reads "Hali sharh yoʻq".

---

## 6. Motion

Restrained, and only these four:

1. Score bars animate width on first view — `700ms cubic-bezier(.16,1,.3,1)`.
2. Home stats strip counts tick up once — `900ms`, `requestAnimationFrame`.
3. Card hover lift — `160ms ease-out`, `translateY(-2px)`.
4. Modal / drawer enter — `200ms` fade + `8px` rise.

Everything is wrapped in `@media (prefers-reduced-motion: reduce)` — bars and
counters snap straight to their final value, transforms are removed.

---

## 7. Iconography & imagery

- **Icons: `lucide-react` only.** Default `strokeWidth={1.75}`, size 16/18/20.
- **Covers:** `next/image` from Supabase Storage. When absent, the deterministic
  `<GeneratedCover>` (Section 9.6 of the PRD) renders an SVG derived from the
  slug hash: a geometric field of arcs/bars in two palette colours. Deterministic
  — same slug always yields the same cover. The six palettes draw **only** on
  navy, the accent red and the three grounds; the score colours are excluded so a
  cover can never imply a rating the hackathon has not earned (asserted by
  `tests/unit/generated-cover.test.ts`). No stock photos in seed data.
- **Organizer logos:** official sources only. Otherwise `<Monogram>` — the
  organizer's initials in `font-display` on an accent-derived tint, hue picked
  deterministically from the slug.

---

## 8. Wordmark & brand marks

`hackathonlar.uz` set solid in `font-display` **900**, `-0.04em`, entirely in
`--color-accent` — lobstr.io's wordmark is one weight, one colour, no lockup, and
copying that is what makes the header read as theirs. The **score chip mark** (a
`--radius-sm` red square containing a white star) is retained for the favicon,
the app icon and the OG card, where a text-only mark would be illegible at size.
Source of truth: `src/components/brand/Wordmark.tsx` and `public/brand/*.svg`.

---

## 9. Responsive & accessibility contract

- Breakpoints verified by Playwright screenshots at **375 / 768 / 1280 / 1536**.
- **No horizontal scroll at any width.** Tap targets **>= 44px**.
- Catalog filters become a **bottom-sheet drawer** below `md`.
- Hackathon detail gets a **sticky bottom CTA bar** below `md`.
- Semantic landmarks (`header`/`nav`/`main`/`footer`), every input `<label>`ed.
- Focus ring is on-brand and always visible:
  `outline: 2px solid var(--color-accent); outline-offset: 2px`.
- Colour is never the only signal: every score band also carries its number.
- Text contrast AA everywhere (measured values in §2, enforced by `tests/unit/palette.test.ts` and verified by Lighthouse: **a11y 100** on all nine audited routes).
