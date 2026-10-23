"use client";

import { useEffect, useRef, type RefObject } from "react";

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
/** Where v sits between from and to, as 0..1. */
export const range = (v: number, from: number, to: number) => clamp((v - from) / (to - from));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const prefersStill = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Blend two #rrggbb colours. */
export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(mix((pa >> shift) & 255, (pb >> shift) & 255, t));
  return `rgb(${ch(16)} ${ch(8)} ${ch(0)})`;
}

type SceneOptions = {
  /** "pin": 0 when the section's top meets the viewport top, 1 when its bottom meets the viewport bottom (sticky stages).
   *  "pass": 0 when its top enters from below, 1 when its bottom leaves above. */
  mode?: "pin" | "pass";
  /** How quickly the eased value catches up with the scroll position, per second. */
  smooth?: number;
};

/**
 * Drives a scroll scene. Calls onFrame with the section's eased progress, only
 * while it is near the viewport and only until the value settles, so idle
 * pages do no work. Scenes write CSS variables and text directly; React only
 * re-renders when a scene changes beat.
 */
export function useScene(ref: RefObject<HTMLElement | null>, onFrame: (p: number) => void, { mode = "pin", smooth = 7 }: SceneOptions = {}) {
  const frame = useRef(onFrame);
  useEffect(() => {
    frame.current = onFrame;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = prefersStill();
    let raf = 0;
    let last = 0;
    let near = false;

    const target = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return mode === "pin" ? clamp(-r.top / Math.max(1, r.height - vh)) : clamp((vh - r.top) / (vh + r.height));
    };
    let cur = target();

    const tick = (now: number) => {
      const t = target();
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      cur = still ? t : cur + (t - cur) * (1 - Math.exp((-smooth * dt) / 1000));
      const settled = Math.abs(t - cur) < 0.0002;
      if (settled) cur = t;
      frame.current(cur);
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (near && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        kick();
      },
      { rootMargin: "30% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    frame.current(cur);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [ref, mode, smooth]);
}

/** Scrolls so that a pinned section shows progress p. */
export function scrollToProgress(el: HTMLElement, p: number) {
  const top = el.getBoundingClientRect().top + window.scrollY + p * (el.offsetHeight - window.innerHeight);
  if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.4 });
  else window.scrollTo({ top, behavior: prefersStill() ? "auto" : "smooth" });
}
