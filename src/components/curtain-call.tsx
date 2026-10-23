"use client";

import { useEffect, useRef } from "react";
import { Drape } from "@/components/drape";
import { POSTER_SHELL } from "@/components/hero";
import { Arrow } from "@/components/mark";
import { prefersStill, range, useScene } from "@/lib/scene";
import { closing, curtainCall } from "@/lib/site";
import { claimSilk } from "@/lib/tone";

/**
 * The curtain call. The house numbers stand on a lit stage, then the same silk
 * drape falls over them, closed, with the send-off printed across it.
 */

/* Sine in-out: half the top speed of a cubic, so the drape never outruns the scroll. */
const glide = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

export function CurtainCall() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const closed = useRef(0);
  const away = useRef(true);
  const invalidate = useRef<(() => void) | null>(null);

  useEffect(() => () => claimSilk("call", false), []);

  useScene(
    sectionRef,
    (p) => {
      const still = prefersStill();
      const fall = still ? (p > 0.25 ? 1 : 0) : glide(range(p, 0.04, 0.62));
      away.current = fall <= 0;
      if (dropRef.current) {
        /* 118%: the drape plus the shadow it throws ahead of its hem */
        dropRef.current.style.transform = `translate3d(0, ${(-(1 - fall) * 118).toFixed(3)}%, 0)`;
        dropRef.current.style.visibility = fall <= 0 ? "hidden" : "";
      }
      /* the house lights go down on the stage as the drape comes in */
      if (stageRef.current) {
        stageRef.current.style.opacity = (1 - fall * 0.5).toFixed(3);
        stageRef.current.style.transform = `translate3d(0, ${(fall * 2.5).toFixed(3)}svh, 0)`;
      }
      invalidate.current?.();
      /* the nav sits on cloth while the fallen drape is still under it */
      const stageBottom = sectionRef.current?.getBoundingClientRect().bottom ?? 0;
      claimSilk("call", fall > 0.15 && stageBottom > 68);
      if (copyRef.current) {
        const c = still ? (fall >= 1 ? 1 : 0) : glide(range(p, 0.56, 0.74));
        copyRef.current.style.opacity = c.toFixed(3);
        copyRef.current.style.transform = `translate3d(0, ${((1 - c) * 14).toFixed(2)}px, 0)`;
        copyRef.current.style.visibility = c <= 0 ? "hidden" : "";
      }
    },
    { mode: "pin", smooth: 5 },
  );

  return (
    <section ref={sectionRef} id="curtain-call" aria-labelledby="call-title" className="relative h-[240svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-paper">
        {/* the stage, lit, before the drape comes down */}
        <div ref={stageRef} className="shell flex h-full flex-col justify-center will-change-[opacity,transform]">
          <p className="label text-silk-800">Curtain call</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/8 pt-10 md:grid-cols-4">
            {closing.map((c) => (
              <li key={c.label}>
                <p className="display num text-[clamp(52px,6.4vw,104px)] leading-[0.9] text-ink">{c.value}</p>
                <p className="mt-3 text-[15px] text-ink-2">{c.label}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* the drape, falling closed, with the send-off printed on it */}
        <div ref={dropRef} className="absolute inset-0 z-20 will-change-transform" style={{ transform: "translate3d(0, -118%, 0)", visibility: "hidden" }}>
          {/* the shadow ahead of the hem, so the leading edge lands soft rather than as a hard line */}
          <div className="pointer-events-none absolute inset-x-0 top-full h-[16svh] bg-linear-to-b from-ink/30 to-transparent" />
          <Drape openRef={closed} pausedRef={away} invalidateRef={invalidate} />
          <div className="pointer-events-none absolute inset-0">
            <h2 id="call-title" className="sr-only">
              {curtainCall.left} {curtainCall.right}
            </h2>
            <div aria-hidden="true" className="absolute inset-x-0 top-[13svh] md:top-[12.5svh]">
              <div className={POSTER_SHELL}>
                <p className="label mb-[2.2svh] text-silk-300">Scrim presents your next release</p>
                <p className="display text-[16vw] leading-[0.9] text-cream md:text-[min(12.4vw,23svh)]">{curtainCall.left}</p>
              </div>
            </div>
            <p aria-hidden="true" className={`${POSTER_SHELL} display absolute inset-x-0 top-[50svh] text-right text-[16vw] leading-[0.9] text-ink md:top-[42svh] md:text-[min(12.4vw,23svh)]`}>
              {curtainCall.right}
            </p>
          </div>
          <div ref={copyRef} className="absolute inset-0 will-change-[opacity,transform]" style={{ opacity: 0, visibility: "hidden" }}>
            <div className="absolute bottom-[6svh] left-5 flex flex-wrap items-center gap-x-6 gap-y-3 md:left-[clamp(16px,3.4vw,44px)]">
              <a href="#pricing" className="btn btn-ink">
                {curtainCall.cta} <Arrow />
              </a>
              <a href="#" className="link text-[15px] font-semibold text-ink">
                {curtainCall.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
