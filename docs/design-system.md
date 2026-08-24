# Design System — hackathonlar.uz

> **Concept: The Scoreboard.**
> This site is the honest sports page of Uzbekistan's hackathon scene. It is a
> *press* product, not a SaaS landing page: warm paper, near-black ink, one
> disciplined accent, a strong grid, and **numbers treated as heroes**.
> Every screen should read like a match report — verdict first, evidence after.

This document is the single source of truth for anyone (human or agent) touching
UI. Tokens live in `src/app/globals.css` under `@theme`; do not hardcode values.

---

## 1. Hard bans (Section 9.1 of the PRD — instant failure)

| Banned | Why |
| --- | --- |
| Purple/indigo-on-white SaaS palette, `from-purple-500 to-pink-500` heroes | Default AI look |
| Glassmorphism, blurred colour blobs, floating frosted cards | Default AI look |
| Emoji as UI icons, ✨ anywhere | Icons are Lucide only. (One exception: the literal 🇺🇿 in the footer's "Made in Uzbekistan" line — it is content, not an icon.) |
| Inter / system-ui for headings | Headings are always `font-display` |
| Centred-everything landing with three identical feature cards | We use asymmetric editorial grids |
| Default Tailwind blue links, default `shadow-lg` everywhere | Links are accent + underline; shadows are near-invisible |

---

## 2. Colour

Light theme only. Warm paper ground, warm near-black ink, **one** accent.

### 2.1 Surfaces & ink

| Token | Hex | Use |
| --- | --- | --- |
| `--color-paper` | `#F5F1E8` | Page background. Warm ivory — never `#fff` |
| `--color-paper-2` | `#EFEADD` | Alternating bands, inset wells, table stripes |
| `--color-surface` | `#FFFFFF` | Cards, panels, modals |
| `--color-ink` | `#16130F` | Primary text, headings |
| `--color-ink-2` | `#4A443B` | Body copy, secondary text |
| `--color-ink-3` | `#7C7466` | Meta, captions, placeholders |
| `--color-line` | `#E2DACA` | Hairline 1px borders (default) |
| `--color-line-2` | `#CFC5AF` | Stronger dividers, input borders |

### 2.2 Accent — "Registon Blue"

`--color-accent: #046D82`

A deep, desaturated take on the blue of the Uzbek flag and of Samarkand
majolica tilework. **Why a cool accent and not the "hot orange" the PRD
suggested:** the score scale already owns green / amber / red. A warm accent
would sit one hue-step away from the amber "mediocre" chip and the red "bad"
chip, and the eye would read a brand button as a score. A cool accent is
unambiguous at every size, and cool-on-warm-paper is the classic editorial
tension. Documented in `DECISIONS.md`.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-accent` | `#046D82` | Links, primary buttons, focus ring, `.uz` in wordmark, eyebrows |
| `--color-accent-ink` | `#03505F` | Hover / pressed |
| `--color-accent-soft` | `#E1EEF2` | Tinted backgrounds, selected filter chips |

Contrast (measured): `#046D82` on paper = **5.30:1**, on white = **5.97:1**;
white on `#046D82` = **5.97:1**. All AA for normal text.

### 2.3 Score scale — used identically everywhere

The single most important consistency rule on the site. Any number derived from
a 1–5 rating is coloured by this scale, in every chip, bar, number and badge.

| Band | Token | Text hex | Tint hex | Contrast on paper |
| --- | --- | --- | --- | --- |
| `>= 4.0` good | `--color-good` / `--color-good-soft` | `#14683F` | `#DFEDE4` | 6.04:1 |
| `3.0 – 3.99` mid | `--color-mid` / `--color-mid-soft` | `#8A5A05` | `#F6E8CC` | 5.29:1 |
| `< 3.0` bad | `--color-bad` / `--color-bad-soft` | `#A82219` | `#F7E0DD` | 6.41:1 |
| no reviews | `--color-none` / `--color-none-soft` | `#7C7466` | `#EBE5D7` | 4.63:1 |

Implemented once in `src/lib/score.ts#scoreBand()`. Never re-derive inline.

### 2.4 Status colours (non-score)

`--color-danger #A82219`, `--color-warning #8A5A05`, `--color-success #14683F` —
deliberately the same three hues so the palette stays tight.

---

## 3. Typography

Two families, both verified for **Latin + Latin Extended + Cyrillic + Cyrillic
Extended** and, critically, **U+02BB MODIFIER LETTER TURNED COMMA** (the Uzbek
*tutuq belgisi* in `oʻ` / `gʻ`).

| Role | Family | Token | Notes |
| --- | --- | --- | --- |
| Display / headings / numbers | **Geologica** (variable 100–900) | `font-display` | Technical grotesque, tall x-height, squarish counters — reads like an instrument panel. |
| Body / UI | **IBM Plex Sans** (400/500/600/700) | `font-sans` | Humanist, excellent Cyrillic, editorial credibility. Body only. |

Both are self-hosted at build time via `next/font/google` (Next downloads the
files and serves them from our own origin — zero runtime requests to Google).

**Rejected candidates and why** (checked live against the Google Fonts CSS2 API):
Space Grotesk, Sora and Archivo ship **no Cyrillic subset at all** — they would
break the entire Russian locale. Unbounded *does* have Cyrillic but its very
wide letterforms wrap badly for long Russian/Uzbek headlines at 375px, and 70%
of our traffic is mobile.

### 3.1 Scale

Fluid, mobile-first. Headline sizes are big and tight; body is generous.

| Token | Size | Line | Tracking | Use |
| --- | --- | --- | --- | --- |
| `text-display-1` | `clamp(2.5rem, 7.5vw, 4.25rem)` | `0.95` | `-0.035em` | Home hero only |
| `text-display-2` | `clamp(1.875rem, 4.5vw, 2.75rem)` | `1.02` | `-0.025em` | Page H1 |
| `text-h1` | `clamp(1.5rem, 3vw, 2rem)` | `1.1` | `-0.02em` | Section heads |
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

`--radius-xs 2px` · `--radius-sm 4px` · `--radius-md 8px` · `--radius-lg 12px` ·
`--radius-xl 16px` · `--radius-full 999px` (avatars only)

Chips and badges use `xs`/`sm`; buttons and inputs `md`; cards `lg`; large
panels and modals `xl`. Sharper than Tailwind's defaults on purpose — press,
not app.

### 4.2 Borders & elevation

**Crisp 1px borders and flat fills, never blurry shadows.** Cards are
`bg-surface border border-line rounded-lg`.

- `--shadow-lift`: `0 1px 0 rgb(22 19 15 / 0.03), 0 6px 16px -10px rgb(22 19 15 / 0.18)` — hover only.
- `--shadow-pop`: `0 20px 48px -24px rgb(22 19 15 / 0.28)` — modals / drawers only.
- `--shadow-print`: `3px 3px 0 0 var(--color-ink)` — the signature "print offset". Used on **at most one element per screen** (the primary hero CTA). Never decorative.

Hover on a card: `border-color: --color-line-2` + `--shadow-lift` + `translateY(-2px)`. That is the entire interaction vocabulary.

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
  slug hash: a geometric field of arcs/bars in two palette colours with the
  hackathon name set in Geologica. Deterministic — same slug always yields the
  same cover. No stock photos in seed data.
- **Organizer logos:** official sources only. Otherwise `<Monogram>` — the
  organizer's initials in `font-display` on an accent-derived tint, hue picked
  deterministically from the slug.

---

## 8. Wordmark & brand marks

`hackathonlar` in `font-display` 700 `-0.04em` `--color-ink`, then `.uz` in
`--color-accent`. Preceded by the **score chip mark**: a `--radius-sm` square
filled `--color-accent` containing a white star — the same star that scores the
site. Source of truth: `src/components/brand/Wordmark.tsx` and
`public/brand/*.svg`; favicon and default OG image are generated from it.

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
- Text contrast AA everywhere (measured values in §2).
