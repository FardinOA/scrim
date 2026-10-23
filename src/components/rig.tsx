"use client";

import { useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { easeInOut, prefersStill, range, useScene } from "@/lib/scene";
import { flag, rigCopy, rigFacts, sdk, sdkList } from "@/lib/site";

/* A small highlighter: just enough to colour the four samples. */
const KEYWORDS = /\b(import|from|const|let|await|export|function|if|return|def|func|try|some|async)\b/;
const TOKEN = /("(?:[^"\\]|\\.)*"|\b(?:import|from|const|let|await|export|function|if|return|def|func|try|some|async)\b|\b[A-Za-z_][\w]*(?=\()|\{\{flag\}\})/g;

function Line({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((s) => s !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part === "{{flag}}")
          return (
            <span key={i} className="rounded-md bg-silk-100 px-1 py-px text-silk-900 shadow-[inset_0_0_0_1px_rgb(225_139_29/0.35)]">
              &quot;{flag.key}&quot;
            </span>
          );
        if (part.startsWith('"')) return <span key={i} className="text-silk-700">{part}</span>;
        if (KEYWORDS.test(part) && /^[a-z]+$/.test(part)) return <span key={i} className="text-silk-900">{part}</span>;
        if (/^[A-Za-z_]\w*$/.test(part) && text.includes(`${part}(`)) return <span key={i} className="text-ink">{part}</span>;
        return <span key={i} className="text-ink-2">{part}</span>;
      })}
    </>
  );
}

/** "40.00" down to "0.04", spending most of the scroll near the bottom where the drop is the point. */
const scrub = (t: number) => 40 * Math.pow(0.001, t);
const fmt = (v: number) => (v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(2));

export function Rig() {
  const sectionRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  useScene(
    sectionRef,
    (p) => {
      const t = prefersStill() ? 1 : easeInOut(range(p, 0.12, 0.42));
      const v = scrub(t);
      if (numRef.current) numRef.current.textContent = fmt(v);
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.004, v / 40).toFixed(4)})`;
    },
    { mode: "pass" },
  );

  const code = sdk[tab].code;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.replace("{{flag}}", `"${flag.key}"`));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; nothing to undo */
    }
  };

  return (
    <section ref={sectionRef} id="developers" aria-labelledby="rig-title" className="border-t border-ink/7 bg-paper py-[clamp(96px,12vw,168px)]">
      <div className="shell">
        <p className="label text-silk-800">{rigCopy.label}</p>
        <h2 id="rig-title" className="sr-only">
          A Scrim check takes 0.04 milliseconds
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="display num flex items-baseline text-[clamp(104px,19vw,280px)] leading-[0.82] text-ink md:col-span-8" aria-hidden="true">
            <span ref={numRef}>0.04</span>
            <span className="ml-[0.06em] text-[0.32em] text-silk-600">ms</span>
          </p>
          <p className="max-w-[24rem] text-[17px] leading-relaxed text-ink-2 md:col-span-4 md:pb-4">{rigCopy.body}</p>
        </div>

        {/* the comparison: the orange bar collapses with the number */}
        <div className="mt-[clamp(36px,4vw,56px)]">
          <div className="grid gap-3">
            <div>
              <div className="flex justify-between text-[14px] text-ink-2">
                <span>{rigCopy.network}</span>
                <span className="num font-mono text-[13px]">40 ms</span>
              </div>
              <span className="mt-2 block h-3 rounded-full bg-ink/10" />
            </div>
            <div>
              <div className="flex justify-between text-[14px] text-ink">
                <span className="font-semibold">{rigCopy.local}</span>
                <span className="num font-mono text-[13px] text-silk-800">0.04 ms</span>
              </div>
              <span className="mt-2 block h-3 overflow-hidden rounded-full bg-silk-100">
                <span ref={barRef} className="block h-full w-full origin-left rounded-full bg-silk-500" style={{ transform: "scaleX(0.004)" }} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(56px,7vw,96px)] grid gap-5 lg:grid-cols-12">
          {/* the code window */}
          <div className="card rise flex flex-col overflow-hidden lg:col-span-7">
            <div className="flex items-center justify-between gap-3 border-b border-ink/7 pl-2 pr-3">
              <div role="tablist" aria-label="SDK language" className="flex overflow-x-auto">
                {sdk.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === i}
                    onClick={() => setTab(i)}
                    className={cx("relative whitespace-nowrap px-3.5 py-3.5 text-[13.5px] transition-colors", tab === i ? "font-semibold text-ink" : "text-ink-3 hover:text-ink-2")}
                  >
                    {s.label}
                    <span className={cx("absolute inset-x-3.5 bottom-0 h-[2px] rounded-full bg-silk-500 transition-transform duration-300", tab === i ? "scale-x-100" : "scale-x-0")} />
                  </button>
                ))}
              </div>
              <button type="button" onClick={copy} className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-ink-2 shadow-[inset_0_0_0_1px_rgb(24_18_14/0.1)] transition-colors hover:text-ink">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre role="tabpanel" className="overflow-x-auto py-5 font-mono text-[13px] leading-[1.85] md:text-[13.5px]">
              {code.split("\n").map((l, i) => (
                <span key={`${tab}-${i}`} className="flex">
                  <span className="w-12 shrink-0 select-none pr-4 text-right text-ink-3/60">{i + 1}</span>
                  <span className="whitespace-pre pr-6">
                    <Line text={l} />
                  </span>
                </span>
              ))}
            </pre>
            {/* the editor's status bar */}
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-ink/7 bg-mist px-5 py-3 font-mono text-[11.5px] text-ink-3">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-silk-500" /> Connected to Production
              </span>
              <span>{flag.key} → true for 50%</span>
              <span className="ml-auto">p99 0.04 ms</span>
            </div>
          </div>

          {/* the three promises */}
          <ul className="grid gap-5 lg:col-span-5">
            {rigFacts.map((f, i) => (
              <li key={f.title} className="card rise flex gap-4 p-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-silk-100 font-mono text-[12px] text-silk-900">0{i + 1}</span>
                <div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ul className="reveal mt-8 flex flex-wrap gap-2" aria-label="SDKs">
          {sdkList.map((s) => (
            <li key={s} className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-2 shadow-[inset_0_0_0_1px_rgb(24_18_14/0.1)]">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
