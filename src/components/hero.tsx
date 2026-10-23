"use client";

import { useEffect, useRef } from "react";
import { Drape } from "@/components/drape";
import { Arrow } from "@/components/mark";
import { cx } from "@/lib/cx";
import { hero } from "@/lib/site";
import { claimSilk } from "@/lib/tone";

/* The poster's measure, shared with the curtain call so the bookends match. */
export const POSTER_SHELL = "mx-auto w-full max-w-[1360px] px-[clamp(16px,3.4vw,44px)]";

/**
 * The hero: the silk drape, hung closed, with the headline printed on it. It
 * scrolls away like any other section; the folds still part toward the pointer.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const closed = useRef(0);

  /* the nav sits on cloth while the drape is under it */
  useEffect(() => {
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect();
      claimSilk("hero", !!r && r.bottom > 68);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      claimSilk("hero", false);
    };
  }, []);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative h-svh min-h-[560px] overflow-hidden bg-silk-950">
      <Drape openRef={closed} />

      <div className="absolute inset-x-0 top-[13svh] md:top-[12.5svh]">
        <div className={POSTER_SHELL}>
          <p className="label mb-[2.2svh] text-silk-300">{hero.presents}</p>
          <h1 id="hero-title" className="display text-[16vw] leading-[0.9] text-cream md:text-[min(12.4vw,23svh)]">
            {hero.left}
            <span className="sr-only"> {hero.right}</span>
          </h1>
        </div>
      </div>
      <p aria-hidden="true" className={cx(POSTER_SHELL, "display absolute inset-x-0 top-[50svh] text-right text-[16vw] leading-[0.9] text-ink md:top-[42svh] md:text-[min(12.4vw,23svh)]")}>
        {hero.right}
      </p>

      <div className="absolute bottom-[6svh] left-5 flex flex-wrap items-center gap-x-6 gap-y-3 md:left-[clamp(16px,3.4vw,44px)]">
        <a href="#pricing" className="btn btn-ink">
          {hero.cta} <Arrow />
        </a>
        <a href="#show" className="label inline-flex items-center gap-3 text-ink">
          <span className="relative block h-7 w-px overflow-hidden bg-ink/25">
            <span className="absolute inset-x-0 top-0 h-3 animate-[cue_1.8s_var(--ease-out-soft)_infinite] bg-ink" />
          </span>
          {hero.hint}
        </a>
      </div>
    </section>
  );
}
