"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { company, questions } from "@/lib/site";

function Switch({ on, onClick, label, controls, size = "md" }: { on: boolean; onClick: () => void; label: string; controls?: string; size?: "md" | "lg" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-controls={controls}
      onClick={onClick}
      className={cx(
        "relative inline-flex shrink-0 items-center rounded-full p-[3px] transition-colors duration-300",
        size === "lg" ? "h-8 w-[58px]" : "h-7 w-12",
        on ? "bg-silk-500" : "bg-ink/12 hover:bg-ink/20",
      )}
    >
      <span
        className={cx(
          "block aspect-square h-full rounded-full bg-card shadow-[0_2px_6px_rgb(59_29_7/0.25)] transition-transform duration-300 ease-[var(--ease-out-soft)]",
          on && (size === "lg" ? "translate-x-[26px]" : "translate-x-5"),
        )}
      />
    </button>
  );
}

/**
 * The questions, served the way Scrim serves a feature: each answer sits
 * behind its own flag. Switching one on rolls it out to you, with the line
 * the show report would write for it.
 */
export function Questions() {
  const [on, setOn] = useState<Set<number>>(() => new Set([0]));
  const all = on.size === questions.length;

  const flip = (i: number) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section id="questions" aria-labelledby="questions-title" className="border-t border-ink/7 bg-paper py-[clamp(96px,12vw,168px)]">
      <div className="shell">
        <div className="reveal flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="questions-title" className="display text-balance text-[clamp(42px,6vw,88px)] text-ink">
              Questions, behind flags.
            </h2>
            <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-ink-2">Every answer ships the way your features will. Switch a flag on to roll it out to yourself.</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-[0_0_0_1px_rgb(24_18_14/0.08)]">
            <div>
              <p className="label text-ink-3">Rolled out to you</p>
              <p className="num mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                {on.size} <span className="text-ink-3">of {questions.length}</span>
              </p>
            </div>
            <Switch size="lg" on={all} label="Turn every answer on" onClick={() => setOn(all ? new Set() : new Set(questions.map((_, i) => i)))} />
          </div>
        </div>

        <div className="card reveal mt-[clamp(40px,5vw,64px)] overflow-hidden">
          {/* the list header, as the console draws it */}
          <div className="flex items-center justify-between gap-4 border-b border-ink/7 bg-mist px-5 py-3 md:px-7">
            <p className="label text-ink-3">
              Flags <span className="text-ink-2">· help center</span>
            </p>
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
              <span className="size-1.5 rounded-full bg-silk-500" /> Production
            </p>
          </div>

          <ul>
            {questions.map((item, i) => {
              const isOn = on.has(i);
              return (
                <li key={item.key} className="relative border-b border-ink/7 last:border-b-0">
                  {/* the rollout bar: sweeps across the row as the answer goes out */}
                  <span className={cx("absolute inset-x-0 top-0 h-[2px] origin-left bg-silk-500 transition-transform ease-[var(--ease-out-soft)]", isOn ? "scale-x-100 duration-700" : "scale-x-0 duration-300")} />
                  <div className="flex items-center gap-4 px-5 py-5 md:gap-6 md:px-7">
                    <Switch on={isOn} onClick={() => flip(i)} label={item.q} controls={`answer-${i}`} />
                    <button type="button" onClick={() => flip(i)} className="min-w-0 flex-1 text-left" tabIndex={-1} aria-hidden="true">
                      <span className="block text-[17px] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[18px]">{item.q}</span>
                      <span className="mt-1 block font-mono text-[12px] text-ink-3">{item.key}</span>
                    </button>
                    <span className={cx("hidden shrink-0 rounded-full px-2.5 py-1 font-mono text-[11.5px] transition-colors duration-300 sm:inline-block", isOn ? "bg-silk-100 text-silk-900" : "bg-mist text-ink-3")}>{isOn ? "ON · 100%" : "OFF · 0%"}</span>
                  </div>
                  <div id={`answer-${i}`} className={cx("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-soft)]", isOn ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden" inert={!isOn}>
                      <div className={cx("pb-6 pl-[84px] pr-5 transition-[opacity,transform] duration-500 md:pl-[100px] md:pr-7", isOn ? "translate-y-0 opacity-100 delay-200" : "-translate-y-1 opacity-0")}>
                        <p className="max-w-[46rem] text-[16px] leading-relaxed text-ink-2">{item.a}</p>
                        <p className="mt-3 flex items-center gap-2 font-mono text-[11.5px] text-ink-3">
                          <span className="size-1.5 rounded-full bg-silk-500" />
                          Served to you · just now
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="reveal mt-6 text-[15px] text-ink-2">
          Something else?{" "}
          <a href={`mailto:${company.email}`} className="link font-medium text-ink">
            {company.email}
          </a>
        </p>
      </div>
    </section>
  );
}
