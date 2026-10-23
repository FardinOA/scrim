# Scrim

A landing page for a feature-flag and staged-rollout SaaS, built around the **Silk Drape** WebGL background: backlit silk in one amber ramp, from deep umber to pale gold, whose folds part toward the pointer. A scrim is the theatre gauze that hides a set until it is lit from behind; Scrim does the same with code.

The drape opens and closes the page. Everything between is white, with the silk's orange as the accent.

1. **The drape (hero):** a full-screen silk curtain with "Rehearse in production." printed on it, in the cloth's own light: cream on the umber, ink on the gold. The folds part toward the pointer. It scrolls away like any other section.
2. **The set rises:** the Scrim console arrives lying on the stage floor in perspective and hinges up to face you as its section scrolls into view.
3. **The set comes apart:** pinned, the console turns in 3D and its four cards (Rollout, Audience, Guardrails, Show report) lift off their sockets at different depths, each with a callout. They stay apart, and the section scrolls on with the console still exploded. The console's content never changes with scroll.
4. **Features:** a bento of seven cards, each a real piece of product UI (rule builder, schedule, guardrail breach, A/B result, approval, audit log, cleanup PR). Cards rise into place like scenery and play one small scene each. The headline's inline switch turns on as it arrives.
5. **Developers:** "40 ms" scrubs down to "0.04 ms" as you scroll, with a comparison bar collapsing alongside it, then a code window in four languages.
6. **Reviews:** two rows of notices sliding past each other with scroll.
7. **Pricing:** a ticket with a perforated orange stub. Slide to your monthly users and it reprints for the plan that fits; the table below lights that plan.
8. **Questions, behind flags:** each question is a feature flag in a console list. Switch one on and a rollout bar sweeps the row as its answer unfolds; a master switch rolls them all out.
9. **Curtain call:** the same drape falls closed over the closing numbers, with "Break a leg." printed across it.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static production build
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and Lenis for smooth scrolling (`src/components/smooth-scroll.tsx`). There is no animation library and there are no image files: the drape is a fragment shader, and everything else is HTML, CSS and SVG.

## How the scroll scenes work

`src/lib/scene.ts` has one hook, `useScene(ref, onFrame, { mode })`. It reports a section's scroll progress (0 to 1), eased toward the real position so motion feels weighted without hijacking the scroll. It only runs while the section is near the screen and stops once it settles. Scenes write transforms and CSS variables directly; React does not re-render while you scroll.

- `mode: "pin"` is for sticky stages (the console and the curtain call): 0 when the section's top meets the top of the screen, 1 when its bottom meets the bottom. The console also reads how far its section has entered the screen, which drives the rise.
- `mode: "pass"` is for normal sections (the developers' number and the reviews): 0 when the section enters from below, 1 when it leaves above.

The timelines are constants at the top of each scene: `WIDE` and `NARROW` in `show.tsx`, and the ranges in `curtain-call.tsx`. Cards and headlines marked `.rise` or `.reveal` are revealed once by `src/components/motion.tsx`.

With `prefers-reduced-motion`, Lenis and the scene smoothing are off, the console appears upright without coming apart, the closing drape is simply down, the number shows its final value and the review rows stay still.

## The drape

`src/components/drape.tsx` is the Silk Drape shader with one addition: `openRef` (0 closed, 1 drawn back to tiebacks). The page hangs it closed, but if you want a curtain that opens, raise `openRef` from a scroll scene: each half's cloth is remapped into the space it has left, so the folds bunch and fan along an arch, and the opening is transparent so the page behind shows through. `edgeAt()` gives the same curve in TypeScript, for keeping anything printed on the cloth in step. `guardSelector` keeps copy laid over the cloth readable by capping the silk's brightness under it.

The drape reads its colours from the `--color-silk-*` tokens, so recolouring the ramp in `globals.css` recolours the silk. With no WebGL, two flat gradient halves stand in and still draw back with the scroll. `src/lib/shader-surface.ts` handles the canvas, frame cap, off-screen pausing, the shared pointer and every failure path.

## Where things live

- `src/lib/site.ts`: all copy and sample data: hero, console state, callouts, features, SDK samples, reviews, plans and prices, questions, closing numbers
- `src/app/globals.css`: the palette (white, mist, ink and the silk ramp), cards, buttons, reveals, the ticket's notches
- `src/components/hero.tsx`: the drape and its poster
- `src/components/show.tsx`: the rising and exploding console
- `src/components/console.tsx`: the product UI, drawn at 1200 × 760 and scaled to fit, plus the phone version
- `src/components/features.tsx`: the bento and its seven product scenes
- `src/components/rig.tsx`: the scrubbed number and the code window
- `src/components/questions.tsx`: the questions behind flags
- `src/components/notices.tsx`, `pricing.tsx`, `curtain-call.tsx`, `footer.tsx`
- `docs/design-dna.md`: the reasoning behind the palette, type and scroll storyboard

## Making it yours

Change the copy and numbers in `src/lib/site.ts`. The orange is `--color-silk-500`, and the whole drape follows the `--color-silk-*` ramp. The font is set once in `src/app/layout.tsx`.

## Notes

Changes to the `@theme` block in `globals.css` may need a dev-server restart to show up.

## Credit

Created by [Fardin Omor Afnan](https://fardin.website).
