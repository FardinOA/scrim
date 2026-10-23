"use client";

import { useEffect } from "react";

/**
 * One controller for trigger-once reveals, so components stay declarative:
 * every .reveal and .rise gets .in when it enters the viewport, staggered
 * against its revealing siblings (--d). Children animate off the parent's .in.
 */
export function Motion() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .rise"));
    targets.forEach((el) => {
      if (el.style.getPropertyValue("--d")) return;
      const sibs = Array.from(el.parentElement?.children ?? []).filter((c) => c.classList.contains("reveal") || c.classList.contains("rise"));
      el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 6) * 90}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return null;
}
