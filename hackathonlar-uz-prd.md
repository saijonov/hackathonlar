# PRD — hackathonlar.uz

**Product:** Hackathonlar.uz — the first hackathon review and discovery platform in Uzbekistan
**Version:** 1.0 (one-shot build specification)
**Owner:** Said (Product Owner / sole admin)
**Domain:** hackathonlar.uz (already purchased, will be connected to Vercel)
**Audience of this document:** An autonomous AI coding agent (Claude Code) that will build, test, and deliver the entire platform in a single session without asking the user any questions.

---

## 0. Instructions for the Building Agent — READ FIRST

These rules override everything else and apply to the entire session:

1. **Full autonomy.** Do not ask the user any questions at any point. Every decision not covered by this PRD is yours to make. Make the choice a senior engineer at a top product company would make, write it down in `DECISIONS.md` at the repo root, and move on.
2. **Use skills and research.** Before writing frontend code, load and follow any available frontend design skill (e.g., `frontend-design`) to avoid generic AI-looking UI. When you are unsure about a library API, a Supabase feature, current best practice, or real-world data about Uzbek hackathons, use web search / web fetch, verify what you find on the official documentation or official source, then continue. Do not blindly use the first result — cross-check anything that will ship.
3. **Use subagents to parallelize and to keep the main context clean.** The main agent acts as orchestrator only. Delegate self-contained work packages (defined in Section 14) to subagents via the Task tool. Each subagent receives: the relevant PRD sections, the design system tokens, the DB schema, and a precise definition of done. The orchestrator integrates results, resolves conflicts, and owns the final quality bar.
4. **Testing is mandatory and non-negotiable.** The session is not finished until the full test plan in Section 15 passes. Never ask the user to test something for you. Run the build, run lint, run type checks, run unit tests, run Playwright end-to-end tests against a locally running app, and manually verify responsive layouts via Playwright screenshots at the specified breakpoints. Fix every failure yourself before declaring done.
5. **No placeholder junk.** No lorem ipsum, no "Feature 1 / Feature 2" cards, no broken image links, no `TODO` left in shipped code paths. Every visible string exists in all three languages. Seed data must be real, researched hackathons (Section 13).
6. **Deliverables at the end of the session:**
   - A running, fully tested Next.js application
   - `README.md` with setup, environment variables, and the short list of manual steps only a human can do (Google OAuth credentials, Supabase project creation if no env vars were provided, domain DNS)
   - `DECISIONS.md` logging every significant independent decision
   - `supabase/migrations/*.sql` + `supabase/seed.sql` so the database is fully reproducible
   - Passing test suite with a summary of what was tested

---

## 1. Background and Problem

Uzbekistan's hackathon scene is growing extremely fast: central bank hackathons, ministry-run competitions (transport, digital technologies), UNESCO youth events, presidential AI competitions, university and regional Digital Lab events, corporate hackathons. Participation is high and growing, but organizational quality is wildly inconsistent. Real problems participants face today:

- Organizers promise to announce finalists "soon" and never message the teams that didn't make it. Teams learn the final happened from a social media post.
- Judging criteria are opaque or change mid-event.
- Prizes are announced but delivered late or never.
- Logistics (venue, food, wifi, schedule) collapse during the event.
- There is **zero public accountability**. All feedback dies in private Telegram chats. New participants have no way to know which organizers respect their time.

**Hackathonlar.uz** fixes this: a public, structured, review platform where verified participants rate hackathons across concrete categories, and where everyone can discover upcoming events along with the track record of their organizers. It is the first platform of its kind in Uzbekistan.

## 2. Goals and Success Criteria

**Product goals (launch):**
- A participant can find any notable Uzbek hackathon from the last 12 months and read structured reviews of it in under 30 seconds from landing.
- Leaving a review takes under 2 minutes including login.
- Organizers can be compared at a glance via aggregate scores.
- The site looks and feels like a professionally designed product, not a template or an AI-generated demo. It must be credible enough to screenshot and share in Telegram channels.

**Non-goals for v1 (explicitly out of scope):** organizer self-service dashboards, paid promotions, team matchmaking, ticketing/registration, mobile apps, Telegram login (nice future addition — note it in the roadmap section of README).

## 3. Users

1. **Participant (primary).** 16–30, student or junior/mid engineer, lives in Telegram, browses on a phone (assume 70%+ mobile traffic). Wants: check if a hackathon is worth their weekend; vent/praise after an event. Languages: Uzbek first, Russian second, some English.
2. **Visitor / lurker.** Reads ratings and reviews without an account. Must never hit a login wall while browsing.
3. **Organizer.** Reads their own reviews. In v1 they have no special account type; treat them as regular users. An "official response" mechanism is admin-mediated (Section 8).
4. **Admin (Said, single account).** Approves submitted hackathons, moderates reviews, can see the true identity behind anonymous reviews, can post official organizer responses, manages everything from a protected admin panel.

## 4. Tech Stack (decided — do not change)

- **Framework:** Next.js 15 (App Router, React Server Components, TypeScript strict mode)
- **Styling:** Tailwind CSS v4
- **Database + Auth:** Supabase (Postgres, Row Level Security, Supabase Auth with Google OAuth + email/password with email OTP verification)
- **i18n:** `next-intl` with locale prefix routing: `/uz` (default), `/ru`, `/en`
- **Icons:** `lucide-react` only. No emoji as UI icons.
- **Fonts:** self-hosted via `next/font`. Pick a distinctive pairing per Section 9 — explicitly NOT plain Inter-for-everything.
- **Images:** `next/image`; hackathon cover images stored in Supabase Storage; fallback generated cover (Section 9.6) when none uploaded.
- **Testing:** Vitest (unit) + Playwright (e2e + responsive screenshots)
- **Deployment target:** Vercel. The build must pass `next build` cleanly with zero type errors and zero ESLint errors.
- **Analytics:** `@vercel/analytics` (one-line include).

**Environment handling:** Expect `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. If they are absent in the build environment, attempt `supabase start` (local Docker stack) and run against it; if Docker is unavailable, still complete the full build with migrations + seed files ready, mock the Supabase client behind an interface for unit tests, run e2e tests against whatever data layer is available, and document the exact remaining setup commands in README. Never let missing credentials stop you from finishing and testing everything that can be tested.

## 5. Data Model

Create these tables via SQL migrations. All tables get `created_at timestamptz default now()`. Enable RLS on every table.

**profiles** — extends `auth.users`
- `id uuid PK references auth.users`
- `display_name text not null`
- `avatar_url text`
- `role text not null default 'user'` — `'user' | 'admin'`
- RLS: everyone can read `display_name, avatar_url`; user updates own row; role changeable only via service role.

**organizers**
- `id uuid PK`, `slug text unique`, `name text`, `logo_url text`, `website text`, `telegram text`, `description_uz/ru/en text`
- Aggregates (computed, see views below): average score across all their hackathons, hackathon count, review count.

**hackathons**
- `id uuid PK`, `slug text unique not null`
- `name text not null` (proper names are not translated)
- `organizer_id uuid references organizers`
- `description_uz text`, `description_ru text`, `description_en text`
- `city text` (nullable for online), `format text not null` — `'offline' | 'online' | 'hybrid'`
- `start_date date`, `end_date date`
- `prize_pool text` (free text, e.g. "100 000 000 so'm"), `tracks text[]`
- `website text`, `telegram text`, `registration_url text`
- `cover_url text`
- `status text not null default 'pending'` — `'pending' | 'approved' | 'rejected'`
- `submitted_by uuid references profiles`
- RLS: anonymous/authenticated read only `status = 'approved'`; authenticated users insert with `status = 'pending'`; only admin updates status/edits.

**reviews**
- `id uuid PK`, `hackathon_id uuid references hackathons`, `user_id uuid not null references profiles`
- Category ratings, each `smallint not null check between 1 and 5`:
  - `rating_organization` (planning, schedule, logistics running on time)
  - `rating_communication` (updates before/during/after, notifying non-finalists!)
  - `rating_judging` (transparency and fairness of judging)
  - `rating_prizes` (prizes as promised, delivered on time)
  - `rating_venue` (venue/platform, food, wifi, comfort — for online events this means platform experience)
- `overall numeric generated always as ((rating_organization + rating_communication + rating_judging + rating_prizes + rating_venue) / 5.0) stored`
- `title text not null` (max 100 chars), `body text not null` (max 3000 chars)
- `pros text`, `cons text` (each optional, max 500)
- `is_anonymous boolean not null default false`
- `participated_as text` — `'participant' | 'finalist' | 'winner' | 'mentor' | 'volunteer'`
- `status text not null default 'published'` — `'published' | 'hidden'` (admin moderation)
- `unique (hackathon_id, user_id)` — one review per user per hackathon; users may edit their review (keep `updated_at`).
- **RLS — the critical anonymity rule:** public reads go through a **view** `public_reviews` that returns `display_name = 'Anonim ishtirokchi' / 'Анонимный участник' / 'Anonymous participant'` and `avatar_url = null` whenever `is_anonymous = true`. The raw `reviews.user_id` must never be exposed to the client for anonymous reviews. The admin panel (service-role or admin-role RLS policy) sees the real profile for every review. Users can read/edit/delete their own review regardless of anonymity.

**review_votes** — `review_id`, `user_id`, `unique(review_id, user_id)`; "Foydali" (helpful) votes; count shown on each review.

**review_reports** — `review_id`, `user_id`, `reason text`; surfaces in admin panel.

**official_responses** — `review_id unique`, `body text`, `author_label text` (e.g. "CBU jamoasi rasmiy javobi"); insert/edit admin-only, publicly readable. Rendered inline under the review.

**Aggregation:** create SQL views (or use Supabase computed queries) for per-hackathon aggregates: review count, overall average, and per-category averages — used for score bars. Same rollup per organizer. Never compute aggregates client-side by fetching all reviews.

## 6. Authentication Specification

- **Browsing is 100% public.** Home, hackathon lists, hackathon detail pages, all reviews, ratings, organizer pages — no login required, ever. Never gate reading behind auth.
- **Login is required exactly for:** writing/editing a review, voting helpful, reporting a review, submitting a hackathon.
- **Trigger pattern:** when a logged-out user taps "Sharh yozish" (Write a review), open the auth modal in-place; after successful auth, return them to the exact review form they were opening — do not dump them on the homepage. Preserve any draft text typed before login (keep the form state client-side).
- **Methods (both required):**
  1. **Google OAuth** — one tap, via Supabase Auth. This is the promoted, visually primary option.
  2. **Email + password** — sign-up collects email + password + display name; Supabase sends a 6-digit email OTP (`signInWithOtp`/verify flow or email confirmation code — use Supabase's current recommended email OTP verification; research the current API before implementing). Include password reset via email.
- After first login, create the `profiles` row automatically (Postgres trigger on `auth.users` insert — standard Supabase pattern).
- Session handling with `@supabase/ssr` cookies; middleware refresh; protect server actions with server-side session checks — never trust client state alone.
- Google OAuth credentials cannot be created by the agent: stub with env vars `GOOGLE_CLIENT_ID/SECRET`, make the button render and the flow code-complete, and put precise console setup steps (redirect URLs included) in README under "Manual steps".

## 7. Pages and Features

All routes are locale-prefixed (`/uz/...`, `/ru/...`, `/en/...`). `/` redirects to `/uz`. Locale switcher in header persists choice in a cookie.

### 7.1 Home `/`
- **Hero:** one strong headline stating the mission (e.g. UZ: "O'zbekistondagi hakatonlar haqida haqiqiy fikrlar"), one sub-line, one primary CTA ("Hakatonlarni ko'rish") and secondary ("Hakaton qo'shish"). A live stats strip: total hackathons, total reviews, average platform score — real numbers from DB.
- **Upcoming hackathons** rail (start_date >= today, approved): cards with cover, name, dates, city/format badge, organizer logo, and — the killer feature — the organizer's historical average score shown right on the upcoming card ("Tashkilotchi reytingi: 3.2 ★ oldingi 4 ta hakaton bo'yicha").
- **Recently reviewed** section: latest 6 reviews as compact cards (hackathon name, stars, review title, first ~120 chars, reviewer name or anonymous label, time ago).
- **Top rated / lowest rated** split section (min 3 reviews to qualify) — this drives the accountability narrative.
- **How it works**: 3 steps, tight copy.
- Footer: about, rules/guidelines page link, contact (Telegram), language switcher, "Made in Uzbekistan 🇺🇿" line.

### 7.2 Hackathon catalog `/hackathons`
- Responsive card grid. Each card: cover (or generated fallback), name, organizer, dates, city + format badge, star score + review count, top category (best) and weakest category as tiny chips.
- **Filters** (URL-driven, shareable): status tab (Bo'lajak / O'tgan / Hammasi), city, format, organizer, minimum rating. **Sort:** newest, highest rated, lowest rated, most reviewed. **Search** by name/organizer with debounced input — server-side `ilike` search is fine for v1.
- Pagination or "load more" (choose one, implement it properly with server components).
- Empty states designed, not blank (illustrated, with CTA to submit a hackathon).

### 7.3 Hackathon detail `/hackathons/[slug]`
- **Header block:** cover, name, organizer (linked), dates, city/format, prize pool, tracks as chips, external links (site, Telegram, registration if upcoming).
- **Score panel:** big overall number (e.g. 2.8) + stars + review count, then five horizontal bars, one per category with its average — communication scoring 1.5/5 should be instantly visible and damning. Add a small rating distribution (5→1 histogram).
- **Reviews list:** sorted by helpful votes then recency. Each review: reviewer (name+avatar or anonymous label), participated_as badge, per-category mini-stars on expand, title, body, pros/cons blocks, helpful button with count, report flag, "Tahrirlangan" marker if edited, official response block if present.
- **Write review CTA** — sticky/prominent. Opens the review form (7.4).
- For upcoming hackathons (no reviews possible yet): show organizer's past record instead ("Bu tashkilotchining oldingi hakatonlari" with linked scored cards).
- SEO: full SSR, unique meta title/description, OpenGraph image (generate a dynamic OG image with name + score via `next/og`), JSON-LD `Event` + `AggregateRating` structured data.

### 7.4 Review form (modal or dedicated route `/hackathons/[slug]/review`)
- Five category ratings as tappable star rows, each with a one-line explainer of what it measures (translated). All five required.
- Title, body (with min length 50 chars for body to force substance), optional pros/cons, participated_as select.
- **Anonymous toggle** with honest microcopy: "Ismingiz saytda ko'rinmaydi. Moderator suiiste'mollikni oldini olish uchun muallifni ko'ra oladi." (Your name won't be shown publicly. The moderator can see the author to prevent abuse.) Mirror in RU/EN.
- Client + server validation (zod). Optimistic UI on submit. If the user already reviewed, form loads in edit mode.

### 7.5 Submit hackathon `/submit`
- Auth-required form: name, organizer (search existing organizers + inline "create new organizer" mini-form), dates, city, format, description (at least one language required; user picks which), links, optional cover upload (Supabase Storage, validate type/size ≤ 2MB, strip EXIF not required).
- On submit → `status='pending'`, success screen: "Rahmat! Moderatsiyadan so'ng e'lon qilinadi."
- Show the user their pending submissions on their profile page.

### 7.6 Organizer page `/organizers/[slug]`
- Logo, name, links, description, aggregate score, per-category averages across all their hackathons, and the list of their hackathons (past + upcoming) as cards. This page is the accountability scoreboard — make it excellent.

### 7.7 User profile `/profile` (own, auth required)
- Display name + avatar edit, list of my reviews (with anonymity status visible to me), my hackathon submissions with status, logout.

### 7.8 Admin panel `/admin` (role = 'admin' only; server-side guarded)
- **Moderation queue:** pending hackathon submissions with full preview → approve (edit-then-approve inline) / reject with optional reason.
- **Reviews table:** all reviews including hidden; **true author always visible here even for anonymous reviews**; hide/unhide toggle; reported reviews surfaced on top with report reasons.
- **Official responses:** attach/edit an official organizer response to any review.
- **Organizers & hackathons CRUD**, including creating hackathons directly (skips moderation).
- Plain, dense, fast UI — the admin panel may be utilitarian; the design ambition of Section 9 applies to the public site.
- Seed the admin: promote the profile whose email equals env `ADMIN_EMAIL` via a documented SQL statement in the seed file.

### 7.9 Static pages
- `/rules` — review guidelines (be honest, be specific, no insults, no fabrications; admin may hide rule-breaking content) in all three languages.
- `/about` — mission, why this exists, contact. Short, confident copy.

## 8. Moderation, Anonymity, and Anti-abuse

- One review per user per hackathon (DB constraint).
- Anonymous reviews: public sees the localized "Anonymous participant" label; the client payload must not contain the author's id/name (enforced at the view/RLS layer, not by hiding in UI).
- Report flow → admin queue. Admin can hide reviews (`status='hidden'`), which removes them from public views and from aggregates.
- Basic rate limits via server actions: max 5 reviews and 3 hackathon submissions per user per day (enforce server-side with a cheap count query).
- Honest legal posture: reviews are user opinions; the rules page states this. Keep review structure factual by design (category scores) — this is the platform's defense.

## 9. Design System — the Anti-Generic Mandate

This is where the build lives or dies. The user's explicit requirement: the site must NOT look AI-generated or template-like. Load the frontend design skill before starting and follow its craft guidance. Then apply these constraints:

### 9.1 Banned (instant failure if present)
- Purple/indigo-on-white default SaaS look, `bg-gradient-to-r from-purple-500 to-pink-500` style hero gradients
- Glassmorphism cards floating on blurred blobs
- Emoji as icons, sparkles ✨ anywhere
- Inter/system font for headings
- Centered-everything landing template with three identical feature cards and stock illustration people
- Default Tailwind blue links and default shadows everywhere

### 9.2 Direction (required)
- **Concept:** an editorial "scoreboard/press" identity — the site is the honest sports page of Uzbekistan's hackathon scene. Confident typography, strong grid, numbers treated as heroes (big scores, big stats).
- **Typography:** a characterful grotesque or display face for headings (e.g. Space Grotesk, Archivo Expanded, Sora, Unbounded — pick ONE after checking full Cyrillic + Uzbek Latin coverage incl. oʻ/gʻ/ʻ characters; verify coverage before committing) paired with a highly readable text face (e.g. Inter or IBM Plex Sans — body only). Big, tight headline sizes; generous whitespace.
- **Color:** light theme. Paper-like warm background (not pure #fff), near-black ink text, ONE bold accent used with discipline (recommend a hot warm accent — e.g. saturated orange-red or Uzbekistan-flag-adjacent green used sharply; your call, document it), plus semantic scale for scores: score ≥4 green, 3–3.9 amber, <3 red — used consistently in every score chip, bar, and number across the site.
- **Score visual language:** design ONE signature score component (number + stars + bar) and reuse it everywhere at different sizes. This becomes the brand.
- **Cards & borders:** crisp 1px borders and flat fills over blurry shadows; subtle hover lift; rounded corners consistent (pick one radius scale).
- **Motion:** restrained — bars animate to value on first view, counts tick up on the home stats strip, nothing else moves gratuitously. Respect `prefers-reduced-motion`.
- **Logo/wordmark:** typographic wordmark "hackathonlar.uz" with a distinctive touch (e.g. the ".uz" in accent color, or a star/score mark integrated). Build as SVG in the repo. Also generate favicon + OG default image from it.

### 9.3 Assets policy
- Icons: Lucide only.
- Photography/covers: only if genuinely needed; source from Unsplash (license-free) via their CDN URLs after verifying each image loads; prefer the generated fallback covers (9.6) for seed data over random stock photos.
- Organizer logos in seed data: fetch official logos only from official sites/channels where clearly available; when uncertain, use a designed monogram fallback (organizer initials on accent background) instead of a wrong or low-res logo. Never hotlink from random image results.

### 9.4 Responsiveness (hard requirement)
Design mobile-first. Must be verified (screenshots via Playwright) at 375px, 768px, 1280px, 1536px. No horizontal scroll at any breakpoint, tap targets ≥44px, filters collapse into a bottom sheet/drawer on mobile, sticky mobile CTA on hackathon detail.

### 9.5 Accessibility
Semantic HTML, labelled inputs, focus states visible and on-brand, color contrast AA for text, stars have text alternatives ("4.2 / 5").

### 9.6 Generated fallback covers
Deterministic SVG cover generated from hackathon name (name set in the display face over a geometric pattern derived from the slug hash, using the design palette). This keeps the catalog looking intentional even with zero uploaded images.

## 10. Internationalization

- Locales: `uz` (Uzbek, Latin script — default), `ru`, `en`. All UI strings via `next-intl` message files; zero hardcoded strings in components.
- Write all three message files with natural, native-quality copy — Uzbek is the primary voice (casual-professional "siz" register), Russian and English full parity. Proper nouns and hackathon names stay as-is.
- Dates localized per locale (`Intl.DateTimeFormat`). Locale-aware metadata + `hreflang` alternates for SEO.
- Hackathon/organizer descriptions: show the locale's version if present, otherwise fall back uz → ru → en with a subtle "(uz)" tag.

## 11. Non-functional Requirements

- Lighthouse (mobile) on home and a hackathon detail page: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95. Run it (via Playwright/Lighthouse CI or `npx lighthouse` headless) and record scores in the final report.
- All public pages server-rendered; catalog/detail data cached with sensible `revalidate` (60s is fine).
- `sitemap.xml` + `robots.txt` generated, covering all approved hackathon and organizer pages in all locales.
- Type-safe end to end: generated Supabase types (`supabase gen types`) used across the app; `strict: true`; no `any` in shipped code.
- Graceful errors: designed 404 and error pages, empty states everywhere lists can be empty.

## 12. Security

- RLS on every table; verify with tests that: anon cannot read pending hackathons; anon cannot resolve anonymous reviewers' identity from any exposed endpoint/payload; non-admin cannot mutate status fields; a user cannot review twice or edit others' reviews.
- All mutations via server actions with session + zod validation; service-role key used server-side only, never shipped to client.
- File uploads validated (mime, size), stored in a public bucket scoped to covers/avatars only.

## 13. Seed Data (real research required)

Research and seed **8–12 real hackathons held in Uzbekistan in 2025–2026**, e.g.: the Central Bank of Uzbekistan hackathon, the National Transport Hackathon 2026 (Tashkent), UNESCO Youth Hackathon 2026, President Tech Award / national AI competition, AICA AI Hackathon, IT Park / Digital Lab regional hackathons (e.g. Samarkand), Red Bull Basement Uzbekistan — verify each via web search: correct name, organizer, dates, city, tracks, prize pool where public, official links. Create the matching organizer records (CBU, relevant ministries/agencies, IT Park, UNESCO, etc.).
- Add 2–3 plausible **upcoming** entries only if real ones are found in research; otherwise mark clearly in seed comments which entries are illustrative.
- **Do NOT seed fake reviews presented as real users.** Ship with zero reviews, or at most 2–3 reviews attributed to an obvious demo account (display name "Demo foydalanuvchi") that the README tells the admin to delete before launch. The platform's credibility depends on never fabricating opinions.

## 14. Subagent Workflow (build plan)

Orchestrator stays lean: it owns the repo scaffold, design tokens, DB schema, integration, and final QA. Delegate in phases; parallelize within a phase only when work packages don't touch the same files.

- **Phase 0 — Orchestrator:** scaffold Next.js + Tailwind + next-intl + Supabase clients; write design tokens (colors, type scale, radii, the signature score component spec) into `docs/design-system.md`; write migrations + RLS + views + seed skeleton; generate DB types. Everything downstream imports from this foundation.
- **Phase 1 — parallel subagents:**
  - *Agent A — Data & API layer:* server actions, queries, aggregates, rate limits, RLS verification tests.
  - *Agent B — Auth:* Supabase auth flows (Google + email OTP), modal, middleware, profile bootstrap trigger.
  - *Agent C — Design foundation:* shared UI components (score component, cards, stars input, badges, nav/footer, fallback cover generator) strictly per tokens.
  - *Agent D — i18n & copy:* all three message files, natural copy for every string incl. rules/about pages.
- **Phase 2 — parallel subagents (consume Phase 1 outputs):**
  - *Agent E — Public pages:* home, catalog + filters, hackathon detail, organizer page.
  - *Agent F — Contribution flows:* review form, submit hackathon, profile.
  - *Agent G — Admin panel.*
- **Phase 3 — Orchestrator:** integration, SEO/OG/sitemap, polish pass against Section 9 (personally review screenshots of every page — if it looks generic, iterate), then the full test plan.

Give each subagent an explicit file-ownership list to prevent merge conflicts. The orchestrator reviews every subagent's output before integrating.

## 15. Test Plan (must fully pass before declaring done)

1. **Static:** `tsc --noEmit`, ESLint, `next build` — zero errors.
2. **Unit (Vitest):** rating aggregation math, review validation (zod schemas, min lengths, 1–5 bounds), fallback cover determinism, locale fallback logic for descriptions.
3. **E2E (Playwright), against the running app:**
   - Browse home → catalog → filter by city → open hackathon → read reviews, all logged out (no auth wall anywhere).
   - Attempt to write review logged out → auth modal appears → sign up with email+password (+ OTP step mocked/local) → returned to review form → submit review with all 5 categories → review appears with correct stars and updates the aggregate.
   - Anonymous review flow → public page shows "Anonymous participant" and payload contains no author identity; admin panel shows the real author.
   - Duplicate review attempt → blocked with friendly error; edit flow works.
   - Submit hackathon → appears in admin queue → approve → appears publicly.
   - Helpful vote (once only), report review → visible in admin.
   - Locale switch uz→ru→en on the same page: all strings translate, dates localize, URL prefix changes.
   - 404 page, empty states.
4. **Responsive proof:** Playwright screenshots of home, catalog, hackathon detail, review form at 375 / 768 / 1280 / 1536 px; orchestrator visually inspects each for overflow, broken layout, and generic-ness.
5. **Security checks:** direct Supabase queries as anon confirming RLS (pending hackathons hidden, anonymous identity unreachable, cross-user edits rejected).
6. **Lighthouse** per Section 11, scores recorded.
7. Produce `TEST-REPORT.md` summarizing everything run and its result.

## 16. Manual Steps After the Build (document these in README; the only human-required items)

1. Create the Supabase project (if not pre-provisioned), run migrations + seed, set env vars in Vercel.
2. Create Google OAuth credentials in Google Cloud Console; add authorized redirect URIs (Supabase callback + localhost); paste into Supabase Auth settings.
3. Set `ADMIN_EMAIL`, sign up with it, run the documented promote-to-admin SQL.
4. Point hackathonlar.uz DNS to Vercel; add domain in Vercel; set all three locale domains in metadata config.
5. Delete demo reviews (if any) before public launch.

## 17. Roadmap (README section, not to be built now)

Telegram login and a Telegram channel bot auto-posting new reviews; verified-participant badges via certificate upload; organizer accounts with self-service responses; email digests of upcoming hackathons; regional expansion (Central Asia).

---

**Definition of done:** every feature in Section 7 implemented in all three locales, Section 9 design bar met (orchestrator-reviewed screenshots), Section 15 fully green, deliverables from Section 0.6 present. Do not stop early; do not ask the user anything.
