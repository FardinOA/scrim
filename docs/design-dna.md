# Scrim Design DNA

This file is the binding visual contract for the Scrim landing-page template. Scrim is an imaginary SaaS for feature flags and staged rollouts. A scrim is the theatre gauze that hides a set until it is lit from behind, and the product does the same with code: a feature is live in production but hidden, then shown to the team, then to 1%, then to everyone.

## Brief

Build a SaaS landing page from the **Silk Drape** background in the author's portfolio (`final-portfolio/components/iris/visuals/backgrounds/SilkField.tsx`), in its amber colour ramp, with scroll animation at the centre of the experience. The client's bar: the scroll scenes carry the product story on their own, and no section uses the hero, card-grid or section-header anatomy listed under "Genericness check" below.

### Direction calls from the client, during the build

These override anything earlier in this file's history.

1. **No dark sections.** A dark auditorium scene behind the curtain (seats lit by rollout share) was rejected. Everything past the drape sits on **pure white** with the silk's orange as the accent. No cream or tinted grounds.
2. **Inter Tight, not a display serif.** A condensed Didone (Imbue) was rejected. One family, Inter Tight, for headlines and text; Fragment Mono only for code and small data labels.
3. **Scroll moves the product, never its data.** A console whose numbers and states changed with scroll was rejected as poor UX. The console shows one fixed, healthy release; scroll moves it as an object (rises, comes apart, snaps back).
4. **A natural hero.** The drape no longer opens or flies out on scroll, and carries no paragraph: just the poster, the CTA and the pointer-parted folds. It scrolls away like any section.
5. **No ordinary FAQ.** The questions are a flag list: each answer is rolled out by its own switch.

## Register

- Serious ↔ playful: serious about engineering, with theatre as the one running joke (cues, show reports, the safety curtain, "Break a leg."). The joke never replaces a plain statement of what the product does.
- Quiet ↔ loud: loud at the two drapes and the console scene, quiet everywhere else.
- **Product argument: show the real tool.** Every section past the hero is built from the product's own UI, not illustrations of it.

Primary CTA: **Start free**, in the nav, on the drape, on the pricing ticket and at the curtain call. The one secondary action is "Book a walkthrough", at the curtain call.

## Category default analysis

| Common strategy in the category | Used here? | Why |
|---|---|---|
| Near-black UI with a purple or electric-blue gradient | No | White grounds, and the only gradient is the silk's own light, inside the drape |
| Centred headline over a floating, tilted dashboard screenshot | No | The hero is a poster printed on a curtain; the console is revealed behind it, lying on the stage floor, and raised by the scroll |
| Three feature cards with icons | No | A bento of seven cards, each holding a working piece of product UI |
| Logo wall | No | Customer names appear only as review attributions |
| Testimonial carousel | Reframed | Two rows of review cards that slide past each other with scroll, no controls |
| Three pricing cards, one "most popular" | No | One ticket priced by a slider, and a plain table with the matching plan lit |

## Evidence binding

| Decision | Evidence | Mechanism |
|---|---|---|
| The silk drape, shader intact | The brief names `SilkField.tsx` | Same folds, warp, ramp, pointer parting and reading guard, plus `u_open` |
| Orange accent on white | Client direction call 1; the ramp's `--color-silk-500` | Every "on" state and the main action use silk 500 |
| Inter Tight everywhere | Client direction call 2 | One `--font-sans-face` variable in `layout.tsx` |
| Console content fixed while it moves | Client direction call 3 | The scene writes transforms only (`data-rig`, `data-layer`); `release` in `site.ts` is constant |
| Tableau draw (arch-shaped opening) | Tableau curtains are drawn up and out to tiebacks | Each half's cloth is remapped into the space it has left, so its folds bunch and fan |
| Console raised from the floor | Theatre sets are flown or raised into place | rotateX 72° → 0 on a bottom hinge as the drape opens |
| Audience as dots lit by bucket | Flag SDKs hash each user into a stable bucket | A dot is lit when its hash is under the rollout share |
| Safety curtain | Theatres drop a fireproof iron curtain in an emergency | Name of the automatic rollback; shown as the guardrail breach toast |
| Cue numbers Q6–Q12, show reports, Strike | Stage-management vocabulary | Feature numbering, audit log name, stale-flag cleanup name |
| "Break a leg." at the curtain call | Theatre's good-luck send-off | Printed across the falling drape |

## Material and colour

- **Silk:** the drape shader, unchanged from the portfolio piece apart from `u_open`. It appears twice: the hero and the curtain call.
- **White:** `#FFFFFF` page and cards. **Mist** `#F7F6F5` for wells inside cards, **mist-2** `#EEEDEB` for quiet fills.
- **Ink:** `#18120E`, `#4B4541`, `#827B76`, with a trace of the umber so it sits with the silk.
- **Silk ramp:** 950 `#3B1D07` … 500 `#F09F30` (the orange) … 300 `#FEC574` … 50 `#FBF3E4`.
- **Safety red:** `#CF3D25`, only where a guardrail trips.

Roles: **orange (silk 500)** is "on": the main action on white, lit audience dots, reached cue steps, chart lines, the ticket stub. Silk 800 carries small accent text on white (5.6:1). Ink buttons carry the main action on the pale foot of the drape. Shadows are warmed toward umber.

## Type

- **Inter Tight** 600 at −0.045em for headlines and big numerals; 400–600 for text and UI.
- **Fragment Mono** for flag keys, code, timestamps and the small uppercase labels.

## Composition

- Section headers vary in shape: a poster printed on the drape (hero), a caption above the console, a headline with an inline switch (features), a scrubbed numeral (developers), a headline with a rating to its right (reviews), a centred pricing headline over a ticket, and a title with a live rollout counter and master switch (questions).
- Grounds are white throughout; sections are separated by hairlines, not bands of colour.
- No decorative fills: no glows, no grain, no pattern wallpaper. The only texture is the silk, where a real curtain has it.

## Scroll storyboard

1. **Drape.** A static hero; only the pointer moves the cloth.
2. **The set rises** while its section scrolls in: the console lies on the stage floor (rotateX 72°) and hinges up to face the viewer.
3. **The set comes apart (pinned, 0.08–0.36, holds to 0.66).** The console turns (rotateX 14°, rotateY −20°); its four cards lift to depths of 100–240 px off dashed sockets, with callouts on leader lines.
4. **Snap back (0.66–0.90).**
5. **Features:** each card stands up from its bottom edge (rotateX 26° → 0) and plays one product scene once.
6. **Developers:** 40 → 0.04 ms on a logarithmic scrub, with the bar collapsing in step.
7. **Reviews:** two rows translate in opposite directions with scroll.
8. **Questions:** switches roll answers out, a bar sweeping each row.
9. **Curtain call:** the drape falls closed over the closing numbers; the CTA fades in once it has landed.

Phones skip step 3; reduced motion snaps every step to its end state.

## Genericness check (64-ai-aesthetic-detector, re-run on the rendered page)

- **Cluster 1, SaaS-generic: 1 counted** (a product mockup is the stage's subject). It is introduced by the curtain, raised from the floor and taken apart, not floated at an angle beside a headline. No dark base, no orb, no glass; the only gradient is the silk's light.
- **Cluster 2, template-generic: 0–1.** No eyebrow pill, no centred headline and subhead in the hero, no solid+outline pair, no icon grid, no carousel controls. The FAQ expands, but as flag switches with rollout states rather than an accordion of chevrons. The footer is credits rows.
- **Cluster 3, motion-generic: pass.** A set hinges up and explodes in depth, cards stand up, a number scrubs, rows counter-slide, rollout bars sweep and a curtain falls; small fade-ups are reserved for headlines.
- **Cluster 4, pricing-generic: pass.** One ticket and one table.
- Verdict: **PASS**.
