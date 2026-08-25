# Design System — hackathonlar.uz

> **Concept: Trendbook.**
> A near-black canvas carrying light, corner-notched panels; acid lime and
> violet accents; very wide uppercase display type; pill buttons with hard
> borders. Editorial and loud, and still a scoreboard underneath — verdict
> first, evidence after.
>
> Derived from a reference poster, measured rather than eyeballed: the poster
> was sampled pixel-by-pixel with Playwright and its dominant colours recovered
> by regional modal analysis (`#1F1F1F` canvas, `#E1E1E1` panel, `#CCEC43` lime,
> `#8D58FF` violet). Where those colours fail WCAG AA they were re-solved, not
> copied — see §2.2 and `DECISIONS.md` §0.

This document is the single source of truth for anyone (human or agent) touching
UI. Tokens live in `src/app/globals.css`; do not hardcode values in JSX.

---

## 0. Two contexts — read this before editing anything

The page canvas is **dark** and the panels sitting on it are **light**. So "ink"
means two opposite things depending on where you are, and a colour that is
legible in one context can be invisible in the other.

Rather than doubling every utility, the `panel` utility **redeclares the
contextual tokens**:

```css
@utility panel {
  --color-ink: #17170f;   /* was #f4f3ef on the canvas */
  --color-good: #136a4f;  /* was #0eab5f */
  /* …every contextual token… */
  background-color: var(--color-paper);
  color: var(--color-ink-2);
}
```

Tailwind compiles `text-ink-2` to `color: var(--color-ink-2)`, so **every
descendant of a panel flips automatically** and no component needs to know
which context it is in. Write `text-ink-3`, `text-good`, `border-line` as
normal; they resolve correctly on both sides.

Two rules follow:

1. **Never use `bg-surface` outside a panel.** `--color-surface` is the *light*
   panel colour. On the canvas, `bg-surface text-ink` paints near-white text on
   a near-white fill. This was a real bug: it made every filter control on the
   catalog page invisible. Controls are transparent for exactly this reason
   (§4.4).
2. **Absolute tokens are never redeclared** — `--color-lime`, `--color-lime-ink`,
   `--color-violet-fill`, `--color-violet-ink`. They look the same everywhere,
   which is what lets a primary button be one colour site-wide.

`tests/unit/palette.test.ts` parses both blocks out of `globals.css` and runs
the whole contrast matrix against each context independently, plus asserts that
every contextual token *has* a panel override — so adding one to `@theme` and
forgetting the override is a test failure, not a silent bug.

---

## 1. Hard bans (Section 9.1 of the PRD — instant failure)

| Banned | Why |
| --- | --- |
| Purple/indigo-on-white SaaS palette, `from-purple-500 to-pink-500` heroes | Default AI look |
| Glassmorphism, blurred colour blobs, floating frosted cards | Default AI look |
| Emoji as UI icons, ✨ anywhere | Icons are Lucide only. (One exception: the literal 🇺🇿 in the footer's "Made in Uzbekistan" line — it is content, not an icon.) |
| Inter / system-ui for headings | Headings are always `font-display` (Unbounded 700–800) |
| Centred-everything landing with three identical feature cards | We use asymmetric editorial grids |
| Default Tailwind blue links, default `shadow-lg` everywhere | Links are accent + underline; panels are separated by **shape** (the corner notch), not blur |

---

## 2. Colour

Dark theme only (`color-scheme: dark` on `html`, `light` on `.panel`).

### 2.1 Canvas tokens (`:root`)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-paper` | `#1F1F1F` | Page canvas — the measured poster ground |
| `--color-paper-2` | `#171717` | Alternating bands |
| `--color-paper-3` | `#101010` | Deepest ground — footer |
| `--color-surface` | `#E1E1E1` | **The light panel.** Only valid inside `panel` |
| `--color-ink` | `#F4F3EF` | Headings, primary text |
| `--color-ink-2` | `#B5B4AE` | Body copy |
| `--color-ink-3` | `#93928C` | Meta, captions, placeholders |
| `--color-line` / `-2` | `#343433` / `#4E4E4C` | Hairlines / stronger dividers |
| `--color-numeral` | `#6C6C69` | Large display figures only (§2.5) |

### 2.2 Accents — lime and violet, corrected for contrast

The reference uses lime as a **fill** and violet as a **decorative seal**.
Measured, neither is shippable unchanged:

| Reference colour | As text on canvas | As text on panel | White on it |
| --- | --- | --- | --- |
| `#CCEC43` lime | **12.28:1** ✓ | **1.03:1** ✗ | — |
| `#8D58FF` violet | 3.90:1 ✗ | 3.23:1 ✗ | 4.22:1 ✗ |

So:

- **Lime ships unchanged, but is fill-only.** It is unusable as text on a light
  panel, which is exactly how the reference uses it too.
- **Violet is re-solved per role**, each the nearest colour to `#8D58FF` that
  clears AA: `#9569FF` as canvas text (19 RGB units away), `#6229D9` as panel
  text (74), `#8A51FC` as a fill under white text (8).
- **The contextual accent swaps hue between contexts**: `--color-accent` is lime
  on the canvas and violet inside a panel. Both are the reference's own colours;
  only the roles trade places, and the result is an accent that is always
  legible without any component branching.

A lime fill has only **1.03:1** against a light panel, so **anything filled lime
must also carry a 2px ink border** or its boundary vanishes (WCAG 1.4.11). That
is not styling — `Button`'s `primary` variant depends on it, and
`palette.test.ts` asserts the ratio stays below 3:1 so the rule keeps its
justification.

### 2.3 Score scale — solved twice, once per context

| Band | Canvas | Panel |
| --- | --- | --- |
| `>= 4.0` good | `#0EAB5F` / tint `#12291E` | `#136A4F` / tint `#D9EFE4` |
| `3.0–3.99` mid | `#E08A00` / tint `#2E2209` | `#974600` / tint `#F6E6CF` |
| `< 3.0` bad | `#FF6132` / tint `#33120C` | `#B3242A` / tint `#F7DCDC` |
| no reviews | `#959595` / tint `#282828` | `#5D5D5D` / tint `#EAEAEA` |

Canvas variants are solved to **5.5:1**, not 4.5 — a minimally-passing colour on
near-black reads as muddy. Panel variants are solved to 4.5:1. Each band is held
≥55 RGB units from the others and **≥90 units from the lime fill**: lime is a
yellow-green sitting one hue-step from both "good" and "mid", and without that
constraint a score chip could read as a brand fill.

Panel tints are *lighter* than the panel ground, canvas tints are *darker* than
the canvas. On a mid-grey panel a darker tint cannot carry text that is itself
only 4.5:1 on the ground, so the chip has to go up, not down.

Implemented once in `src/lib/score.ts#scoreBand()`. Never re-derive inline.

### 2.4 Status colours (non-score)

`--color-danger`, `--color-warning`, `--color-success` alias the score bands in
both contexts, so a destructive action and a bad rating share a colour while a
destructive action and *submit* (lime) never do.

A filled danger button takes `text-paper`, not `text-white`: white on the canvas
`#FF6132` measures **3.00:1**. `text-paper` is contextual and gives 5.50:1 on the
canvas and 5.01:1 on the panel.

### 2.5 The numeral tone

`--color-numeral` is the only token allowed below 4.5:1. It is held to **3:1
(AA-large)** because it renders exclusively at `--text-h1` or larger — ranks,
counters, the 404 numeral. `--text-h1`'s clamp floor is 24px, which keeps the
exemption legal at every viewport, and the test asserts that floor.

Every claim in this section is re-derived from `globals.css` on each test run,
in both contexts, including the ink-on-tint matrix — a gap that let a real
`4.24:1` failure through to Lighthouse before it was closed. Lighthouse then
confirms against rendered pixels: **a11y 100 on all nine audited routes**.

---

## 3. Typography

**Two families.** The reference's display type is far wider and heavier than any
text face reaches — that width *is* the identity — while its body copy is a plain
narrow grotesque. One family cannot do both ends: forcing it yields either a limp
headline or unreadable body copy.

| Role | Family | Token | Notes |
| --- | --- | --- | --- |
| Display / headings | **Unbounded** (variable, used 600–800) | `font-display` | Wide geometric grotesque. Usually uppercase via `display-caps`. |
| Body / UI / buttons | **Onest** (variable) | `font-sans` | Neutral grotesque with first-class Cyrillic. |

Both were checked against the Google Fonts CSS2 API before being chosen. Space
Grotesk — the obvious pick for the technical look — still ships **no Cyrillic at
all** and would break the Russian locale outright.

```
Unbounded   cyrillic-ext · cyrillic · latin-ext · latin · vietnamese
Onest       cyrillic-ext · cyrillic · latin-ext · latin
```

**Buttons use `font-sans`, not `font-display`.** The reference sets its pill
labels in the plain grotesque, and the width matters: a display-face "Добавить
хакатон" measured **221px**, which overflowed the header at 1024px. Unbounded's
width also pushed the desktop header breakpoint from `lg` to `xl` — at 1024px
the nav, locale switcher and two CTAs no longer fit, so that width now gets the
compact header.

The two-family stack costs roughly **4 Lighthouse perf points** against the
single-family system it replaced (95–99 → 91–96, threshold 90). Measured, not
assumed: the fonts are not render-blocking and load in ~30ms locally; the cost
is payload under simulated slow-4G. Requesting three static cuts instead of the
variable axis was tried and served byte-for-byte the same 128KB.

### 3.0 The tutuq belgisi — re-verified for the new pair

A declared `unicode-range` is **not** proof a glyph exists, so the woff2 files
Next actually emitted into `.next/static/media` are read with `fontkit` and the
marks then rendered in the live page.

| codepoint | Unbounded (display) | Onest (body) |
| --- | --- | --- |
| `U+02BB` modifier letter turned comma | present | **absent** |
| `U+02BC` modifier letter apostrophe | present | **absent** |
| `U+2018` / `U+2019` quotation marks | present | present |

**This makes the `U+2018` convention load-bearing again.** Under the previous
single-family system both marks existed and the choice rested on convention
alone. Onest has no `U+02BB`, so any Uzbek copy using it would fall back to
another face mid-word — measured at **7.02px against Onest's own 8.84px**, and
visibly a different mark in `.qa/new-glyphs.png`. That is the same class of bug
as the original "Bo ʻlajak" gap, one font later.

**So all Uzbek copy uses `U+2018` for the tutuq belgisi in `o‘` / `g‘` and
`U+2019` for the standalone mark (`e’lon`, `ma’no`)** — now for a hard
typographic reason on top of it being the prevailing convention on the Uzbek web.
The whole corpus is normalised to it and pinned by
`tests/unit/localized-text.test.ts`.

### 3.1 Scale

Fluid, mobile-first. Headline sizes are big and tight; body is generous.

| Token | Size | Line | Tracking | Use |
| --- | --- | --- | --- | --- |
| `text-display-1` | `clamp(1.5rem, 6.6vw, 4.5rem)` | `1.02` | `-0.02em` | Home hero only — weight **800** |
| `text-display-2` | `clamp(1.375rem, 4.4vw, 2.75rem)` | `1.08` | `-0.015em` | Page H1 — weight **800** |
| `text-h1` | `clamp(1.5rem, 3vw, 2rem)` | `1.18` | `-0.01em` | Section heads. **Floor is 24px by contract** (§2.5) |

The display floors are low on purpose. Unbounded is wide and these headings are
set in caps, so a single long word ("O‘ZBEKISTONDAGI", "МАРКЕТОЛОГИ") can exceed
a 343px mobile content box by itself — the hero measured **429px in a 343px box**
before this was fixed. `display-caps` also carries `overflow-wrap: anywhere` as a
last-resort backstop, because no amount of clamping helps once one word is wider
than the line.
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

### 4.1 Radius — nearly square, because the notch does the work

`--radius-xs 2px` · `--radius-sm 4px` · `--radius-md 6px` · `--radius-lg 8px` ·
`--radius-xl 10px` · `--radius-full 999px`

Panels are effectively rectangles: the **corner notch** is the shape signature,
not rounding. Buttons are fully round pills.

### 4.2 The notch — and where it must not go

```
┌──────────────────────┐
│                      │
│   panel notch-br     │
│                      │
│                   ╲  │   ← --notch, default 26px
└────────────────────╲─┘
```

Implemented as `clip-path`, not a pseudo-element, so the cut is real — the dark
canvas shows through it — and survives any background the panel carries. Sizes:
`notch-size-sm` (14px), default (26px), `notch-size-lg` (40px). `notch-r` cuts
both right-hand corners for hero-scale panels.

**Two hard constraints, both from `clip-path` semantics:**

1. **Never notch a focusable element.** `clip-path` crops its focus ring. Card
   links are therefore structured as an unclipped `<a>` wrapping a clipped inner
   panel, so the ring draws on the outer rectangle. Buttons are pills for the
   same reason — the shape language stops at the panel edge.
2. **Hover lift is a `filter`, not a `box-shadow`.** A box-shadow on a clipped
   element is clipped away with everything else. `card-lift` applies
   `drop-shadow` to the *unclipped wrapper*, which traces the notched
   silhouette. Apply it to the parent, never to the panel itself.

### 4.4 Controls are transparent

Inputs, selects and textareas are `bg-transparent` with a 2px border — never a
fill. Beyond style this is what makes them context-independent: they inherit
light border + light text on the canvas, dark + dark inside a panel, with no
variant for either. See §0 rule 1 for what filling them broke.

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
  — same slug always yields the same cover. The six palettes draw **only** on the
  canvas, the light panel and the two accent fills; the score colours are
  excluded so a cover can never imply a rating the hackathon has not earned
  (asserted by `tests/unit/generated-cover.test.ts`). No stock photos in seed
  data.
- **Organizer logos:** official sources only. Otherwise `<Monogram>` — the
  organizer's initials in `font-display` on an accent-derived tint, hue picked
  deterministically from the slug.

---

## 8. Wordmark & brand marks

`hackathonlar.uz` set solid in `font-display` **800**, `-0.03em`, in
`--color-accent` — so lime on the canvas, violet if it ever lands in a panel.

The icon half of the identity is the **starburst seal** (`<Starburst>`): a
16-spike violet star at a 0.79 inner/outer ratio, which is the proportion that
reads as "seal" rather than "sun" or "explosion". It is generated from that
ratio rather than hand-drawn so every instance matches, and it is decorative —
`aria-hidden`, with any label inside repeated in real text by the caller. It
drives the favicon, the app icon and the OG card, where a text-only mark would
be illegible. Source: `src/components/brand/{Wordmark,Starburst}.tsx` and
`public/brand/*.svg`.

---

## 9. Responsive & accessibility contract

- Breakpoints verified by Playwright at **320 / 360 / 375 / 414 / 640 / 768 / 1024 / 1152 / 1280 / 1536 / 1920** — 11 widths x 18 routes x 3 locales, 198 checks, all clean.
- **No horizontal scroll at any width.** Tap targets **>= 44px**.
- Catalog filters become a **bottom-sheet drawer** below `md`.
- Hackathon detail gets a **sticky bottom CTA bar** below `md`.
- Semantic landmarks (`header`/`nav`/`main`/`footer`), every input `<label>`ed.
- Focus ring is on-brand and always visible:
  `outline: 2px solid var(--color-accent); outline-offset: 2px`.
- Colour is never the only signal: every score band also carries its number.
- Text contrast AA everywhere, **in both contexts** (measured values in §2, enforced by `tests/unit/palette.test.ts` and verified by Lighthouse: **a11y 100** on all nine audited routes).
- DOM nesting is checked too: a `<span>` cannot hold flow content, and a span that gets auto-closed silently collapses whatever panel styling it carried.
