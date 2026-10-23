"use client";

import { useState } from "react";
import { Arrow, Mark } from "@/components/mark";
import { cx } from "@/lib/cx";
import { houseSizes, plans, priceFor } from "@/lib/site";

const STUB = 236;

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cx("size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.4 2.9 2.8 6.1-6.4" />
    </svg>
  );
}

/**
 * Pricing as one ticket: slide to the size of your audience and the ticket
 * reprints itself for the plan that fits. The table under it says what each
 * plan includes, with the one on the ticket lit.
 */
export function Pricing() {
  const [step, setStep] = useState(3);
  const size = houseSizes[step];
  const plan = plans.find((p) => size.users <= p.upTo) ?? plans[plans.length - 1];
  const price = priceFor(size.users);
  const fill = (step / (houseSizes.length - 1)) * 100;

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="border-t border-ink/7 bg-paper py-[clamp(96px,12vw,168px)]">
      <div className="shell">
        <div className="reveal mx-auto max-w-[760px] text-center">
          <h2 id="pricing-title" className="display text-balance text-[clamp(42px,6vw,88px)] text-ink">
            Priced by the size of your audience.
          </h2>
          <p className="mx-auto mt-6 max-w-[32rem] text-[17px] leading-relaxed text-ink-2">Every plan has unlimited flags. Move the slider to the number of people who use your product in a month.</p>
        </div>

        {/* the ticket */}
        <div className="rise mx-auto mt-[clamp(48px,6vw,80px)] max-w-[1000px] [filter:drop-shadow(0_1px_1px_rgb(24_18_14/0.08))_drop-shadow(0_30px_40px_rgb(59_29_7/0.16))]">
          <div
            className="ticket relative grid overflow-hidden rounded-[26px] bg-card md:grid-cols-[1fr_var(--stub)]"
            style={{ ["--stub" as string]: `${STUB}px` }}
          >
            <div className="p-7 md:p-10">
              <div className="flex items-center justify-between gap-4">
                <p className="label text-ink-3">Admit your whole team</p>
                <p className="label text-ink-3">No. {plan.code}-{String(size.users).slice(0, 4)}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <p key={plan.id} className="display beat-in text-[clamp(52px,6vw,80px)] leading-[0.9] text-ink">
                  {plan.name}
                </p>
                <p className="pb-1 text-right">
                  <span className="display num text-[clamp(36px,4vw,52px)] leading-none text-ink">{price === null ? "Let's talk" : price === 0 ? "Free" : `$${price.toLocaleString("en-US")}`}</span>
                  {price !== null && price > 0 && <span className="ml-1 text-[15px] text-ink-3">/ month</span>}
                </p>
              </div>

              <div className="mt-8 rounded-2xl bg-mist p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="audience" className="text-[14px] font-medium text-ink-2">
                    Monthly users
                  </label>
                  <output htmlFor="audience" className="num text-[22px] font-semibold tracking-[-0.01em] text-ink">
                    {size.label}
                  </output>
                </div>
                <input
                  id="audience"
                  type="range"
                  min={0}
                  max={houseSizes.length - 1}
                  step={1}
                  value={step}
                  onChange={(e) => setStep(+e.target.value)}
                  className="range mt-3"
                  style={{ ["--fill" as string]: `${fill}%` }}
                  aria-valuetext={`${size.label} monthly users`}
                />
                <div className="mt-1 flex justify-between font-mono text-[10.5px] text-ink-3">
                  {houseSizes.map((h) => (
                    <span key={h.label}>{h.label}</span>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-[14px] text-ink-3">{plan.note}</p>
            </div>

            {/* the stub, past the perforation */}
            <div className="relative flex flex-col justify-between gap-8 bg-silk-500 p-7 text-ink md:p-8">
              <span className="absolute inset-y-6 left-0 hidden border-l-2 border-dashed border-ink/25 md:block" />
              <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-ink/25 md:hidden" />
              <div className="flex items-center justify-between">
                <Mark className="size-7 text-ink" />
                <p className="label text-ink/70">Scrim</p>
              </div>
              <div>
                <p className="label text-ink/70">Seat</p>
                <p className="display num text-[44px] leading-[0.9]">{size.label}</p>
              </div>
              <a href="#" className="btn btn-ink w-full">
                {plan.id === "house" ? "Talk to us" : "Start free"} <Arrow />
              </a>
            </div>
          </div>
        </div>

        {/* what each plan includes */}
        <div className="reveal mx-auto mt-6 grid max-w-[1000px] overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgb(24_18_14/0.08)] md:grid-cols-3">
          {plans.map((p) => {
            const on = p.id === plan.id;
            return (
              <div key={p.id} className={cx("relative p-7 transition-colors duration-500 md:[&+&]:border-l md:[&+&]:border-ink/8 max-md:[&+&]:border-t max-md:[&+&]:border-ink/8", on ? "bg-silk-50" : "bg-card")}>
                <span className={cx("absolute inset-x-0 top-0 h-[3px] origin-left bg-silk-500 transition-transform duration-500", on ? "scale-x-100" : "scale-x-0")} />
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[18px] font-semibold text-ink">{p.name}</h3>
                  <p className="text-[14px] text-ink-3">{p.price}</p>
                </div>
                <ul className="mt-5 grid gap-2.5">
                  {p.includes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                      <Check className={on ? "text-silk-700" : "text-ink-3"} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
