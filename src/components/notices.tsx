"use client";

import { useRef } from "react";
import { prefersStill, useScene } from "@/lib/scene";
import { notices } from "@/lib/site";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" className={i < n ? "size-4 text-silk-500" : "size-4 text-ink/12"} aria-hidden="true">
          <path fill="currentColor" d="m8 1.2 2 4.3 4.7.5-3.5 3.2 1 4.6L8 11.5l-4.2 2.3 1-4.6L1.3 6l4.7-.5Z" />
        </svg>
      ))}
    </span>
  );
}

function Notice({ q, echo }: { q: (typeof notices.quotes)[number]; echo?: boolean }) {
  return (
    <figure aria-hidden={echo || undefined} className="card flex w-[min(78vw,400px)] shrink-0 flex-col justify-between p-7">
      <div>
        <Stars n={q.stars} />
        <blockquote className="mt-5 text-[20px] font-medium leading-[1.4] tracking-[-0.02em] text-ink">&ldquo;{q.quote}&rdquo;</blockquote>
      </div>
      <figcaption className="mt-7 flex items-center gap-3 border-t border-ink/7 pt-5">
        <span className="grid size-9 place-items-center rounded-full bg-silk-100 text-[12px] font-semibold text-silk-900">
          {q.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
        <span>
          <span className="block text-[14px] font-semibold text-ink">{q.name}</span>
          <span className="block text-[13px] text-ink-3">{q.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The notices, on two rows that slide past each other as you scroll: one
 * row's critics walking in from the right, the other's from the left.
 */
export function Notices() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useScene(
    sectionRef,
    (p) => {
      const t = prefersStill() ? 0.5 : p;
      if (rowA.current) rowA.current.style.transform = `translate3d(${((0.5 - t) * 34).toFixed(3)}%, 0, 0)`;
      if (rowB.current) rowB.current.style.transform = `translate3d(${((t - 0.5) * 34 - 12).toFixed(3)}%, 0, 0)`;
    },
    { mode: "pass", smooth: 5 },
  );

  const half = Math.ceil(notices.quotes.length / 2);

  return (
    <section ref={sectionRef} id="reviews" aria-labelledby="notices-title" className="overflow-hidden border-t border-ink/7 bg-paper py-[clamp(96px,12vw,168px)]">
      <div className="shell reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="notices-title" className="display text-balance text-[clamp(42px,6vw,88px)] text-ink">
          The notices are in.
        </h2>
        <div className="flex items-center gap-4 md:pb-3">
          <p className="display num text-[56px] leading-none text-ink">{notices.rating}</p>
          <div>
            <Stars n={5} />
            <p className="mt-1.5 text-[14px] text-ink-2">Average from {notices.teams} teams</p>
          </div>
        </div>
      </div>

      <div className="mt-[clamp(48px,6vw,80px)] grid gap-5">
        <div ref={rowA} className="flex gap-5 pl-[8vw] will-change-transform">
          {[...notices.quotes.slice(0, half), ...notices.quotes.slice(0, half)].map((q, i) => (
            <Notice key={i} q={q} echo={i >= half} />
          ))}
        </div>
        <div ref={rowB} className="flex gap-5 will-change-transform">
          {[...notices.quotes.slice(half), ...notices.quotes.slice(half)].map((q, i) => (
            <Notice key={i} q={q} echo={i >= notices.quotes.length - half} />
          ))}
        </div>
      </div>
    </section>
  );
}
