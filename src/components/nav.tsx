"use client";

import { useEffect, useState } from "react";
import { Arrow, Wordmark } from "@/components/mark";
import { cx } from "@/lib/cx";
import { nav } from "@/lib/site";
import { onSilk } from "@/lib/tone";

/**
 * Cream and see-through while a drape covers the top of the screen; frosted
 * paper with ink type everywhere the stage is lit.
 */
export function Nav() {
  const [silk, setSilk] = useState(true);
  const [menu, setMenu] = useState(false);

  useEffect(() => onSilk(setSilk), []);

  const onCloth = silk && !menu;

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500",
        onCloth ? "text-cream" : "bg-paper/82 text-ink shadow-[0_1px_0_rgb(24_18_14/0.06)] backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1360px] items-center justify-between gap-6 px-[clamp(16px,3.4vw,44px)]">
        <a href="#top" aria-label="Scrim, back to the top">
          <Wordmark markClassName={onCloth ? "text-silk-400" : "text-silk-600"} />
        </a>

        <nav aria-label="Main" className={cx("hidden items-center gap-8 text-[14.5px] md:flex", onCloth ? "text-cream/80" : "text-ink-2")}>
          {nav.map((l) => (
            <a key={l.href} href={l.href} className={cx("transition-colors", onCloth ? "hover:text-silk-300" : "hover:text-ink")}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a href="#" className={cx("text-[14.5px] transition-colors", onCloth ? "text-cream/80 hover:text-silk-300" : "text-ink-2 hover:text-ink")}>
            Sign in
          </a>
          <a href="#pricing" className={cx("btn h-10 px-[18px] text-[14px]", onCloth ? "btn-gold" : "btn-orange")}>
            Start free <Arrow />
          </a>
        </div>

        <button type="button" className="flex h-11 items-center gap-2 text-[14px] font-medium md:hidden" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
          {menu ? "Close" : "Menu"}
          <span className="relative block h-2.5 w-5" aria-hidden="true">
            <span className={cx("absolute inset-x-0 top-0 h-px bg-current transition-transform", menu && "translate-y-[5px] rotate-45")} />
            <span className={cx("absolute inset-x-0 bottom-0 h-px bg-current transition-transform", menu && "-translate-y-[4px] -rotate-45")} />
          </span>
        </button>
      </div>

      <div id="mobile-menu" hidden={!menu} className="border-t border-ink/8 md:hidden">
        <nav aria-label="Mobile" className="grid gap-1 px-4 py-4">
          {nav.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="display py-1.5 text-[36px] text-ink">
              {l.label}
            </a>
          ))}
          <a href="#pricing" onClick={() => setMenu(false)} className="btn btn-orange mt-4 w-full">
            Start free <Arrow />
          </a>
        </nav>
      </div>
    </header>
  );
}
