"use client";

import { useEffect, useRef } from "react";
import { Console, CONSOLE_H, CONSOLE_W, ConsoleCompact } from "@/components/console";
import { easeInOut, prefersStill, range, useScene } from "@/lib/scene";
import { stageCopy } from "@/lib/site";

/*
  The console arrives lying on the stage floor and hinges up to face you while
  the section scrolls into view. Once it is pinned (scene progress), it comes
  apart into its four cards and stays apart, holds, then scrolls on up the
  page still exploded. Phones only raise it.
*/
const WIDE = { apart: [0.1, 0.6] } as const;
const NARROW = { apart: [2, 3] } as const;

/* How far each card lifts toward the viewer (px, in the console's own units), and which way it drifts. */
const LIFT: Record<string, [number, number, number]> = {
  rollout: [150, -18, -16],
  audience: [240, 22, -20],
  guardrails: [100, -14, 18],
  report: [190, 24, 16],
};

/**
 * The console, as a set on a stage. Scroll raises it and takes it apart so
 * you can see what each piece does; its content never changes with scroll.
 */
export function Show() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  /* Fit the drawn console into the stage under the caption. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const gutter = Math.min(44, Math.max(16, W * 0.034));
      const s = Math.min((W - gutter * 2) / CONSOLE_W, (H - 236 - 32) / CONSOLE_H, 1.1);
      stage.style.setProperty("--cs", s.toFixed(4));
      stage.style.setProperty("--cw", `${Math.round(CONSOLE_W * s)}px`);
      stage.style.setProperty("--ch", `${Math.round(CONSOLE_H * s)}px`);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    fit();
    return () => ro.disconnect();
  }, []);

  useScene(
    sectionRef,
    (p) => {
      const stage = stageRef.current;
      if (!stage) return;
      const still = prefersStill();
      const T = window.innerWidth < 768 ? NARROW : WIDE;
      const ease = (span: readonly [number, number]) => (still ? (p >= span[0] ? 1 : 0) : easeInOut(range(p, span[0], span[1])));

      /* the set: lying on the stage floor, hinged up to face you as the section arrives */
      const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
      const enter = range(window.innerHeight - top, 0, window.innerHeight);
      const rise = still ? 1 : easeInOut(range(enter, 0.15, 1));
      const apart = ease(T.apart);
      stage.querySelectorAll<HTMLElement>("[data-rig]").forEach((rig) => {
        const rx = (1 - rise) * 72 + apart * 14;
        const ry = -apart * 20;
        const ty = (1 - rise) * 16 + apart * 2;
        const tx = -apart * 2.5;
        const s = 1 - apart * 0.16;
        rig.style.transform = `translate3d(${tx.toFixed(3)}%, ${ty.toFixed(3)}%, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`;
        rig.style.setProperty("--e", apart.toFixed(4));
      });
      stage.querySelectorAll<HTMLElement>("[data-layer]").forEach((layer) => {
        const [z, dx, dy] = LIFT[layer.dataset.layer ?? ""] ?? [0, 0, 0];
        layer.style.transform = apart > 0 ? `translate3d(${(dx * apart).toFixed(2)}px, ${(dy * apart).toFixed(2)}px, ${(z * apart).toFixed(2)}px)` : "";
      });
      if (captionRef.current) {
        const c = still ? 1 : range(enter, 0.05, 0.55);
        captionRef.current.style.opacity = c.toFixed(3);
        captionRef.current.style.transform = `translateY(${((1 - c) * 18).toFixed(2)}px)`;
      }
    },
    { mode: "pin", smooth: 6 },
  );

  return (
    <section ref={sectionRef} id="show" aria-labelledby="stage-title" className="relative h-[140svh] md:h-[260svh]">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden bg-paper">
        <div className="absolute inset-0 flex flex-col items-center px-4 pt-[88px] md:px-0 md:pt-[100px]">
          <div ref={captionRef} className="w-full opacity-0 md:w-[var(--cw)]">
            <div className="grid gap-x-10 gap-y-3 md:grid-cols-[1fr_minmax(0,21rem)] md:items-end">
              <div>
                <p className="label mb-3 text-silk-800">{stageCopy.label}</p>
                <h2 id="stage-title" className="display text-[clamp(34px,9vw,42px)] text-ink md:text-[clamp(40px,3.6vw,56px)]">
                  {stageCopy.title}
                </h2>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-2 md:pb-1.5 md:text-[16px]">{stageCopy.body}</p>
            </div>
          </div>

          <div className="mt-6 hidden md:mt-8 md:block" style={{ width: "var(--cw)", height: "var(--ch)" }}>
            <div style={{ width: CONSOLE_W, height: CONSOLE_H, transform: "scale(var(--cs, 1))", transformOrigin: "0 0", perspective: "2600px", perspectiveOrigin: "50% 20%" }}>
              <div data-rig className="h-full w-full origin-[50%_85%] [transform-style:preserve-3d] will-change-transform" style={{ transform: "translate3d(0, 16%, 0) rotateX(72deg)" }}>
                <Console />
              </div>
            </div>
          </div>
          <div className="mt-5 w-full max-w-[440px] md:hidden" style={{ perspective: "1200px", perspectiveOrigin: "50% 0%" }}>
            <div data-rig className="origin-[50%_90%] will-change-transform" style={{ transform: "translate3d(0, 16%, 0) rotateX(72deg)" }}>
              <ConsoleCompact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
