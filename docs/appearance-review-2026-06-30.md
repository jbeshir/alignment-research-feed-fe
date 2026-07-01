# Appearance Review — Alignment Feed (alignment-research-feed-fe)

Report-only. No FE code was changed. Ten lenses reviewed a 60-image gallery (16 base cells × light/dark
across feed-grid, feed-row, recommended grid/row, article detail, semantic-search, empty, hover, focus,
expanded, and skeleton states at 360/768/1280, plus deutan/protan/tritan/halation simulations of the
colour-critical 1280 cells). Run emphasis was **TEXT** (typography, micro-typography, text contrast,
halation, cross-scheme text). Findings: **60 raw** (4 critical, 20 high, 27 medium, 9 low) →
deduplicated to **17 proposals** below.

## Overall read
This is a genuinely competent, content-first reading UI: a calm warm-beige light theme, a coherent teal
accent, a designed empty state, 44px-ish touch targets, curly quotes/real ellipsis already in place, and
a focus ring on the primary controls. The craft gaps cluster in four places, and they are mostly **text**
gaps — exactly the run's emphasis:

1. **Perceptual (APCA) text contrast** is under-delivered even where WCAG passes — most importantly a
   single dark-mode secondary-text token (slate-400 on slate-800) reused across many screens, and small
   grey labels/badges in light mode. These are the run's headline issues.
2. **Type scale has sub-floor steps** — the list/row view drops body copy to ~14px and flattens the
   title-to-body size contrast to ~1×; small captions/labels/badges sit at ~12–13px.
3. **Resting-state affordance** is missing on icon buttons and inline toggles (they only "appear" on
   hover), and the **skeleton** loader has a dark-mode tone bug and causes a load-in reflow.
4. **Depth is entirely flat** (no shadow scale anywhere) and **dark mode** drifts cool/navy away from the
   warm light personality.

### ⚠️ Harness-influenced findings (discount — see end of report)
Offline capture used fixture thumbnails (scheme-independent `data:` SVG colour-blocks with labels like
"Gov"/"Safety" and a plain circle) in place of the live image API. Findings that sampled *those* blocks
are capture artifacts, **not** app defects: **04.1** (one of the four "critical" contrast hits),
**10.1** ("category colours not adapted for dark" — the real app's category header strips *do* have
dark variants), most of **Lens 6's** "two placeholder systems", and **09.3**. They are listed at the
end and excluded from the proposals below. This leaves **3 genuine critical contrast failures**, all
text, all real.

---

# ★ TEXT proposals (act on these first — run emphasis)

The proposals tagged **[TEXT]** below are P1, P2, P7, P8, P12-typo and P16. The two highest-value,
lowest-effort are P1 and P2 (token-level contrast fixes) and P16 (micro-typography quick wins).

---

# Quick wins (small, mostly token/CSS changes)

## P1 — [TEXT] Fix the dark-mode secondary-text token (slate-400 → slate-300+)  · CRITICAL · effort S
- **Area/theme:** Colour & contrast (Lens 4); cross-cell (Lens 10). *Merge priority #1.*
- **What:** Replace the `dark:text-slate-400` secondary token (#94a3b8 on the slate-800 #1e293b card)
  with `slate-300` or lighter, globally, and re-verify with **APCA**, not WCAG. Give dark bullet/body
  text headroom too (slate-200) since it sits only 0.7 Lc above the floor.
- **Where:** dark mode, recurring across ≥4 components/screens — KEY POINTS label, inactive row tabs
  (Summary/Implication), row excerpt/summary body, detail-page byline & "← Back to feed" link.
- **Why:** WCAG 5.70:1 *passes* but APCA **Lc −48.3** — far below the Lc 75 body floor; this is the
  classic dark-mode polarity trap WCAG doesn't catch. Severity-floor rule makes sub-Lc75 critical.
- **Evidence:** `recommended-row__expanded__1280__dark.png`, `detail__default__1280__dark.png`
  (findings 04.4, 04.6).
- **Impact:** Fixes the single widest-reach readability defect in the product in one token change.

## P2 — [TEXT] Raise low-contrast small text in light mode (overline label + category tag)  · CRITICAL · effort S
- **Area/theme:** Colour & contrast (Lens 4). *Merge priority #1.*
- **What:** Darken the "KEY POINTS"/"IMPLICATIONS" overline ink (slate-500-ish → slate-600/700) and the
  category tag-pill ink (e.g. the red-900 "Deception & Misalignment" tag → a deeper red, or lighten the
  pill). Verify **APCA Lc ≥ 75**, not just WCAG.
- **Where:** detail Analysis block overline (light); card/header category tag pills (light).
- **Why:** Overline is WCAG **4.36:1 (fails AA)** *and* APCA Lc 64; tag pill is WCAG 7.26:1 (passes) but
  APCA **Lc 69.7** — both below the Lc 75 text floor.
- **Evidence:** `detail__default__1280__light.png`, `recommended-row__expanded__1280__light.png`,
  `feed-grid__default__1280__light.png` (findings 04.2, 04.3).
- **Impact:** Removes the remaining genuine sub-floor light-mode text; pairs with P1 for full text-contrast coverage.

## P3 — Liked thumbs-up icon fails 3:1 non-text contrast (light mode)  · HIGH · effort S
- **Area/theme:** Colour & contrast (Lens 4, non-text SC 1.4.11). *Merge priority #1/#2.*
- **What:** Darken the active green glyph (green-700 → green-800) or lighten its pill fill so the
  icon-to-pill ratio clears 3:1. Dark mode already passes (5.91:1) — light-mode-only regression.
- **Where:** selected thumbs-up state on cards/rows (light).
- **Why:** Icon ink (22,163,74) on pill (215,236,223) = **2.66:1**, below the 3:1 graphical floor.
- **Evidence:** `feed-grid__hover-thumb__1280__light.png` (finding 04.5).
- **Impact:** The primary feedback control reads clearly in its most important (engaged) state.

## P4 — [TEXT] Constrain the detail Analysis measure to ~65–70ch  · MEDIUM · effort S
- **Area/theme:** Typography (Lens 1, criterion 7). *Merge priority #3.*
- **What:** Cap the Analysis summary/implication column to ~640–720px (the page already uses `max-w-prose`
  on some children — apply it consistently / tighten it).
- **Where:** `detail` Analysis paragraph (both schemes), runs ~84–89ch today.
- **Why:** >80ch causes eye-tracking return-sweep errors (Bringhurst 45–75ch).
- **Evidence:** `detail__default__1280__light.png` (finding 01.7).
- **Impact:** Comfortable long-form reading on the one screen meant for sustained reading.

## P5 — Detail-page category tag loses its teal in dark mode (cross-cell regression)  · HIGH · effort S
- **Area/theme:** Cross-cell consistency (Lens 10). *Merge priority #4.*
- **What:** Reuse the category-colour-aware badge used by feed/row for the detail "Analysis" tag instead
  of a separate neutral-styled pill.
- **Where:** `detail` Analysis tag — dark mode only. The *same* article's badge is correctly teal in
  feed-grid and recommended-row dark cells; light-mode detail is also correct.
- **Why:** Dark detail tag renders neutral off-white (245,245,245) on a pill (31,37,45) nearly invisible
  against the card (28,35,45) — a themed element silently un-themes in exactly one scheme on one screen.
- **Evidence:** `detail__default__1280__dark.png` vs `detail__default__1280__light.png` vs
  `feed-grid__default__1280__dark.png` (finding 10.2).
- **Impact:** Restores category recognisability and removes a near-invisible control in dark mode.

## P6 — Skeleton polish: dark-mode tone bug + load-in reflow  · HIGH · effort S (tone) / M (height)
- **Area/theme:** Component states (Lens 7), cross-cell (Lens 10), brand (Lens 9). *Merge priority #2/#4.*
- **What:** (a) Drive the skeleton thumbnail block from the same slate shimmer token as its sibling bars
  (it currently uses a warm stone-brown #292524 against cool slate siblings). (b) Reserve the loaded
  card's real height (~401 CSS px) in the skeleton so the grid doesn't jump ~52px when content arrives.
- **Where:** `skeleton` (dark for the tone bug; both schemes for the height).
- **Why:** Two-tone skeleton reads as a styling bug; height delta reflows every subsequent row (state
  transition coherence, Lens 7 crit 10).
- **Evidence:** `feed-skeleton__loading__1280__dark.png`, `semantic-search__results__1280__light.png`
  (findings 07.4, 07.5, 09.6, 10.3).
- **Impact:** Loading feels intentional and stops content-shift.

## P7 — Spacing: small grid/rhythm inconsistencies  · HIGH · effort S
- **Area/theme:** Spacing systems (Lens 2). *Merge priority #5.*
- **What:** (a) Use one gap value across the row's Summary/Key Points/Implication/Similar links (today
  18–19px then 29px). (b) Match the "KEY POINTS" label-to-first-bullet gap to the inter-bullet gap.
  (c) Vertically centre the empty-state block (today ~73px above vs ~196px below). (d) Round the detail
  header→Analysis gap (28.5px) to a grid value (32px).
- **Where:** recommended/feed row expander; empty state; detail.
- **Why:** Off-4pt-grid values and a repeating group using two gaps break spacing rhythm.
- **Evidence:** `recommended-row__expanded__1280__{light,dark}.png`, `feed-empty__empty__1280__light.png`,
  `detail__default__1280__light.png` (findings 02.1–02.4).
- **Impact:** Tightens the most non-designer-visible craft signal cheaply.

## P8 — [TEXT] Micro-typography quick wins  · HIGH · effort S
- **Area/theme:** Micro-typography (Lens 8). *Merge priority #9 (but cheap + high TEXT signal).*
- **What:** (a) Prevent single-word **widows** on clamped card titles (non-breaking space before the last
  word, or slight clamp-width tune). (b) Truncate category badges at **word boundaries** with a minimum
  visible-character guarantee (today "Deception &…", "Governance & Po…", "AI Ca…" cut mid-word/at the
  ampersand). (c) Keep author names and dates as atomic units (`white-space: nowrap`/nbsp) so "Evelyn
  Park" and "May 9, 2026" don't break across lines in row view. (d) Add `letter-spacing: 0.05–0.08em` to
  the all-caps "KEY POINTS"/"IMPLICATIONS FOR AI ALIGNMENT" overlines.
- **Where:** card titles (all grids), category badges (all viewports), row meta line, detail overlines.
- **Why:** Widows, mid-word truncation, split atomic units, and unspaced all-caps are conspicuous in
  production screenshots (Bringhurst; truncation quality).
- **Evidence:** `feed-grid__default__{1280,768,360}__light.png`, `feed-row__default__1280__light.png`,
  `detail__default__1280__light.png` (findings 08.1–08.6).
- **Impact:** High "attention to detail" signal for very little code.
- *Note:* Lens 8 explicitly verified and **passed** curly quotes/apostrophes and the real `…` glyph — keep them.

## P9 — Real-app imagery quick fixes  · MEDIUM · effort S
- **Area/theme:** Imagery & iconography (Lens 6). *Merge priority #8.*
- **What:** (a) Give the no-thumbnail `ThumbnailPlaceholder` a tinted (category-accent) dark-mode fill
  instead of near-black `stone-800` with a faint icon. (b) Overlay a centred play affordance on video
  thumbnails rather than only a small corner play-triangle. (c) Either unify the neutral fallback glyph
  or pair source-specific glyphs with a label.
- **Where:** cards/rows with no image; video (YouTube) cards; both schemes.
- **Why:** Faint near-black placeholder reads as a load failure in dark; video is indistinguishable at
  scanning speed; document-vs-speechbubble glyphs are ambiguous at avatar scale.
- **Evidence:** `feed-grid__default__1280__dark.png`, `feed-grid__default__1280__light.png`
  (findings 06.5, 06.6, 06.7). *(See harness note re: 06.1–06.4/06.8.)*
- **Impact:** Better scannability and a less "broken" dark placeholder.

## P10 — Halation & CVD touch-ups  · LOW–MEDIUM · effort S
- **Area/theme:** Colour & contrast (Lens 4, halation + tritan). *Merge priority #1 (low sev tail).*
- **What:** (a) Use a slightly dimmer off-white for the large detail **H1** specifically (its size
  amplifies halation bloom on dark). (b) For category colour-coding, ensure hue is not the *only* scanning
  cue (it isn't — text labels exist) and nudge 2–3 colliding category hues apart on a tritan axis (vary
  lightness/chroma) for the colour-as-fast-scan affordance.
- **Where:** detail H1 (dark); category header system.
- **Why:** Halation bloom on the most prominent heading; teal/indigo/blue and amber/crimson converge
  under tritanopia.
- **Evidence:** `detail__default__1280__dark__halation.png`, `feed-grid__default__1280__light__tritan.png`
  (findings 04.8, 04.7). *(Category dark-adaptation itself is fine in the real app — see harness note.)*
- **Impact:** Comfort for astigmatic/CVD users; the category labels already provide the non-colour signal.

---

# Structural (larger design/system changes)

## P11 — [TEXT-adjacent] Lift sub-floor type and restore list-view hierarchy  · HIGH · effort M
- **Area/theme:** Typography (Lens 1). *Merge priority #3.*
- **What:** (a) Raise the **row/list excerpt** from ~14px to 16px (`text-base`) — it's the primary
  readable content. (b) Make the **row title** at least one step larger than the excerpt (it's currently
  the *same* ~14px, so heading-to-body size ratio ≈1.0× vs the required ≥1.5×). (c) Lift small
  captions/labels/badges/date/byline off the 12–13px range to a clean 14px step. Hold the 16px body /
  14px secondary floors at *every* breakpoint.
- **Where:** feed-row & recommended-row primarily; card date/byline/badges across grids.
- **Why:** Body floor (16px), secondary floor (14px), and heading-to-body contrast (≥1.5×) are hard rules
  judged by size, not by apparent legibility.
- **Evidence:** `feed-row__default__1280__light.png`, `feed-row__default__360__light.png`,
  `feed-grid__default__1280__light.png` (findings 01.1–01.6).
- **Impact:** The list view becomes genuinely readable and regains a clear title→body hierarchy. (Marked
  structural because it's a type-scale pass, not a one-line change.)

## P12 — Affordance: make icon buttons & inline toggles look interactive at rest  · HIGH · effort M
- **Area/theme:** Component polish & states (Lens 7). *Merge priority #2.*
- **What:** Give the thumbs-up/down buttons and the header settings gear a persistent low-contrast
  hit-area (subtle rounded tint or 1px border) instead of revealing it only on `:hover`. Give the
  inactive row toggles (Summary/Implication/Similar) a resting affordance (outline/underline) so they
  don't read as static text; reserve the solid fill for the active one. Bump the thumbs hit-area
  comfortably past 44×44 (target 48) rather than sitting at ~45.
- **Where:** card footers, header, row expander — all viewports, both schemes; matters most on touch.
- **Why:** On touch there is no hover, so today these controls give *zero* affordance until tapped
  (affordance legibility + touch-target craft).
- **Evidence:** `feed-grid__default__1280__{light,dark}.png`, `feed-grid__hover-thumb__1280__light.png`,
  `recommended-row__expanded__1280__{light,dark}.png` (findings 07.1, 07.2, 07.3, 07.6).
- **Impact:** Discoverability of the core feedback and expand actions, especially on mobile.

## P13 — Introduce a depth/elevation system  · HIGH · effort M–L
- **Area/theme:** Depth, elevation, shadow, border, radius (Lens 5). *Merge priority #7.*
- **What:** Add a small **shadow scale** (resting 1–2px/4–8px-blur tinted shadow for cards; a larger step
  for hover/raised) — there is currently **no shadow anywhere**, including on hover. In dark mode express
  elevation through a clearly perceptible **lightness step** (target ~10–15%) rather than the current faint
  delta. Resolve the dark-only lightness split between the detail article card and Analysis panel (make it
  deliberate in both schemes or drop it). Make the **focus-ring offset** construction identical in both
  schemes (the offset band is present in light, absent in dark). Increase **card radius** from ~5px to
  ~8–12px so it isn't pinched relative to the card footprint, and add one intermediate radius step.
- **Where:** all card surfaces, hover/focus states, detail panels; both schemes.
- **Why:** Flat fill-only separation gives no z-hierarchy; dark elevation is near-imperceptible; radius
  reads pinched next to the pill-radius search/badges.
- **Evidence:** `feed-grid__default__1280__{light,dark}.png`, `feed-grid__hover-thumb__1280__light.png`,
  `detail__default__1280__{light,dark}.png`, `feed-grid__focus-details__1280__{light,dark}.png`
  (findings 05.1–05.5).
- **Impact:** The UI gains material depth and a crafted hover/elevation language; biggest single
  "feels designed" upgrade.

## P14 — Detail-page & responsive layout coherence  · HIGH · effort M–L
- **Area/theme:** Layout & composition (Lens 3). *Merge priority #6.*
- **What:** (a) **Mobile tab strip**: at 360px the All/Recommended/…/AI-Assistant nav is clipped mid-label
  with no scroll affordance (worse than overflow — options vanish silently). Make it horizontally
  scrollable with an edge-fade/scroll-snap, or collapse to a select below the tablet breakpoint.
  (b) **Detail page grid**: the narrow centred article column and the full-width "Similar Articles" grid
  read as two different grids stacked — align them to one max-width/gutter system. (c) Cap the oversized
  decorative hero block (shallower aspect ratio) so analysis content isn't pushed far below the fold.
  (d) Widen the row description measure / add secondary metadata to use the empty right half of each row.
  (e) Align the semantic-search input panel to the app's centred content rhythm.
- **Where:** 360 nav; detail (1280/360); feed-row; semantic-search initial.
- **Why:** Responsive reflow must not silently hide nav; one page should read as one grid; chrome
  shouldn't dominate a content-first reader.
- **Evidence:** `feed-grid__default__360__light.png`, `detail__default__{1280,360}__both`,
  `feed-row__default__1280__light.png`, `semantic-search__initial__1280__light.png`
  (findings 03.1–03.3, 03.6, 03.7).
- **Impact:** (a) is the highest-impact item here — it restores access to half the primary nav on mobile.

## P15 — Brand & dark-mode tone cohesion  · MEDIUM · effort M
- **Area/theme:** Brand/tone cohesion (Lens 9). *Merge priority #10.*
- **What:** (a) Unify the **teal token**: the "Find Related Research" primary button (#7aaca4/#144844) and
  the dark-mode "Log Out" border/text (#14b8a6) drift from the canonical accent #0f766e used by
  "Read Article"/"Clear search" — apply one token everywhere and decide whether Log Out is brand or neutral
  (consistently across schemes). (b) Shift **dark-mode surfaces** from cool navy-slate (#1e293b) toward a
  **warm charcoal** so dark mode keeps the calm warm-paper personality the warm-beige light theme + serif
  hero establish, instead of reading as a generic cool dev-tool theme. (c) Extend the serif-italic
  editorial cue to at least one content-bearing element (e.g. the detail H1 or Analysis pull-quotes) so it
  isn't a homepage-only flourish.
- **Where:** primary buttons, auth control, all dark surfaces, headings.
- **Why:** Per-component hex drift muddies the brand in aggregate; the warm→cool jump between schemes
  breaks personality continuity; the editorial personality never reaches the reading experience.
- **Evidence:** `semantic-search__initial__1280__both`, `feed-grid__default__1280__{light,dark}.png`,
  `detail__default__1280__{light,dark}.png` (findings 09.1, 09.2, 09.4, 09.5).
- **Impact:** A cohesive, on-brand light/dark pair and a recognisable single accent.

---

# ⚠️ Harness-influenced findings — excluded from the proposals above
These were produced by the offline capture's fixture thumbnails (scheme-independent `data:` SVG
colour-blocks with abbreviated labels and an empty circle) standing in for the live image API. They do
**not** reflect app code and should be disregarded when acting on this report:

- **04.1** ("category colour-block badge text fails Lc75" — the 'Gov'/'Safety'/'Capab'/'Risk' labels are
  fixture-SVG text, not app category badges). → This removes one of the four raw "critical" findings;
  the **3 genuine criticals are P1 and P2**.
- **10.1** ("category banner colours identical light↔dark, not desaturated") — the fixture SVGs are
  scheme-independent. The **real** category header strips (`getCategoryHeaderColor`) *do* define explicit
  dark variants (e.g. teal-50 → teal-950/40), so the app already adapts category colour for dark mode.
- **Lens 6 06.1 / 06.2 / 06.3 / 06.4 / 06.8** ("two incompatible placeholder systems", "empty circle reads
  as missing asset") — the colour-block-with-label treatment is the fixture SVG; the app's genuine
  no-image component is the single `ThumbnailPlaceholder` (source icon). The real, kept imagery items are
  in **P9**.
- **09.3** ("Interpretability colour block == brand teal #0f766e") — sampled the fixture thumbnail colour,
  not the app category header. (A latent "teal category accent vs brand teal" question may still be worth a
  glance, but it is not evidenced here.)
- **03.4** (thumbnail-vs-no-thumbnail "checkerboard" weight) and **04.7** (saturated-block tritan collapse)
  are partly fixture-pattern dependent; the underlying principles are noted in P9/P10 but the magnitude is
  not reliable from this capture.

---

## Method note
Real Remix routes/components rendered offline via a **data-layer-only** harness (fixtures + auth stub);
no styling/layout/component code was altered, so all non-thumbnail pixels are the genuine app. Reviewers
applied numeric floors (sub-12px text, WCAG AA, APCA Lc 75, 3:1 non-text) as hard rules and computed
contrast from sampled colours. See `RENDER-PLAN.md` for the matrix and `findings/` for the raw per-lens JSON.
