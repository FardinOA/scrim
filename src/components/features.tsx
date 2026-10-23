import type { CSSProperties, ReactNode } from "react";
import { Avatar } from "@/components/console";
import { cx } from "@/lib/cx";
import { cues, featuresCopy, type CueDemo } from "@/lib/site";

/*
  Every card is scenery: it rises into place (.rise), and once it has (.in on
  the card, read through `group-[.in]:`), its piece of product plays its one
  small scene. Nothing loops.
*/

const d = (ms: number) => ({ transitionDelay: `${ms}ms` }) as CSSProperties;
const IN = "transition-[opacity,transform,width,background-color,color] duration-700 ease-[var(--ease-out-soft)]";

function Chip({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "orange" | "ink" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[12.5px]",
        tone === "orange" && "bg-silk-100 font-medium text-silk-900",
        tone === "ink" && "bg-ink font-medium text-cream",
        tone === "plain" && "bg-card text-ink-2 shadow-[0_0_0_1px_rgb(24_18_14/0.08)]",
      )}
    >
      {children}
    </span>
  );
}

/* Q6: a targeting rule, read like a sentence, with who it matches. */
function Targeting() {
  const rules = [
    ["plan", "is", ["Pro"]],
    ["country", "is one of", ["Portugal", "Spain"]],
    ["app version", "at least", ["iOS 18"]],
  ] as const;
  return (
    <div className="w-full max-w-[460px]">
      <p className="flex items-center gap-2 text-[13px] text-ink-2">
        Serve
        <span className="inline-flex h-5 w-9 items-center rounded-full bg-ink/12 p-0.5 transition-colors duration-500 group-[.in]:bg-silk-500" style={d(500)}>
          <span className="size-4 rounded-full bg-card shadow transition-transform duration-500 group-[.in]:translate-x-4" style={d(500)} />
        </span>
        to users where
      </p>
      <ul className="mt-3 grid gap-2">
        {rules.map(([attr, op, values], i) => (
          <li key={attr} className={cx("flex flex-wrap items-center gap-1.5 rounded-xl bg-card p-1.5 shadow-[0_0_0_1px_rgb(24_18_14/0.07)] opacity-40 group-[.in]:translate-x-0 group-[.in]:opacity-100", IN, "-translate-x-3")} style={d(650 + i * 140)}>
            <Chip>{attr}</Chip>
            <span className="px-1 font-mono text-[11.5px] text-ink-3">{op}</span>
            {values.map((v) => (
              <Chip key={v} tone="orange">
                {v}
              </Chip>
            ))}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
          <span className="block h-full w-[4%] rounded-full bg-silk-500 transition-[width] duration-1000 ease-[var(--ease-out-soft)] group-[.in]:w-[38%]" style={d(1100)} />
        </span>
        <span className="text-[12.5px] text-ink-2">
          <b className="num font-semibold text-ink">12,408</b> users match
        </span>
      </div>
    </div>
  );
}

/* Q7: the run, written once. */
function Schedule() {
  const stops = [
    { when: "Tue 09:00", what: "25%", note: "Ran", done: true },
    { when: "Wed 09:00", what: "50%", note: "If guardrails hold", done: true },
    { when: "Thu 09:00", what: "100%", note: "Waiting", done: false },
  ];
  return (
    <ol className="relative w-full max-w-[340px] pl-7">
      <span className="absolute bottom-3 left-[9px] top-3 w-px bg-ink/10" />
      <span className="absolute left-[9px] top-3 h-0 w-px bg-silk-500 transition-[height] duration-1000 ease-[var(--ease-out-soft)] group-[.in]:h-[58%]" style={d(500)} />
      {stops.map((s, i) => (
        <li key={s.when} className="relative flex items-center justify-between gap-3 py-2.5">
          <span
            className={cx("absolute -left-7 top-1/2 size-[19px] -translate-y-1/2 rounded-full border-2 bg-card transition-colors duration-500", s.done ? "border-ink/15 group-[.in]:border-silk-500 group-[.in]:bg-silk-500" : "border-ink/15")}
            style={d(600 + i * 260)}
          />
          <span>
            <span className="block font-mono text-[11.5px] text-ink-3">{s.when}</span>
            <span className="text-[14px] font-semibold text-ink">Raise to {s.what}</span>
          </span>
          <span className={cx("rounded-full px-2 py-0.5 text-[11.5px]", s.done ? "bg-silk-100 text-silk-900" : "bg-mist text-ink-3")}>{s.note}</span>
        </li>
      ))}
    </ol>
  );
}

/* Q8: a guardrail breach, and the safety curtain dropping on its own. */
function Guardrails() {
  const pts = [18, 20, 17, 21, 19, 22, 20, 23, 21, 24, 22, 26, 33, 46, 58];
  const w = 300;
  const h = 120;
  const x = (i: number) => (i / (pts.length - 1)) * w;
  const y = (v: number) => h - (v / 64) * h;
  const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <div className="relative w-full max-w-[340px]">
      <div className="flex items-baseline justify-between">
        <p className="text-[12.5px] text-ink-2">p95 latency</p>
        <p className="num text-[13px] font-semibold text-safety">251 ms</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 block w-full overflow-visible" aria-hidden="true">
        <rect x="0" y="0" width={w} height={y(32)} fill="rgb(207 61 37 / 0.06)" />
        <line x1="0" x2={w} y1={y(32)} y2={y(32)} stroke="rgb(207 61 37 / 0.5)" strokeDasharray="4 4" />
        <path d={line} fill="none" stroke="var(--color-silk-600)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" className="[stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[1400ms] ease-out group-[.in]:[stroke-dashoffset:0]" style={d(400)} />
        <circle cx={x(pts.length - 1)} cy={y(58)} r="4.5" fill="var(--color-safety)" className="opacity-0 transition-opacity duration-300 group-[.in]:opacity-100" style={d(1700)} />
      </svg>
      <div className={cx("absolute inset-x-0 -bottom-2 flex items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 shadow-[0_0_0_1px_rgb(207_61_37/0.2),0_16px_30px_-16px_rgb(207_61_37/0.5)] opacity-0 group-[.in]:translate-y-0 group-[.in]:opacity-100", IN, "translate-y-3")} style={d(1900)}>
        <span className="grid size-6 place-items-center rounded-full bg-safety text-[12px] font-bold text-white">!</span>
        <p className="text-[12.5px] leading-snug text-ink-2">
          <b className="font-semibold text-safety">Safety curtain down.</b> Rolled back to 0% in 0.8 s.
        </p>
      </div>
    </div>
  );
}

/* Q9: two versions on alternate seats. */
function Casts() {
  const casts = [
    { name: "Cast A", note: "Current checkout", rate: "3.1%", w: "62%", lead: false },
    { name: "Cast B", note: "New checkout", rate: "3.6%", w: "72%", lead: true },
  ];
  return (
    <div className="w-full max-w-[480px]">
      <ul className="grid gap-4">
        {casts.map((c, i) => (
          <li key={c.name}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span>
                <b className="font-semibold text-ink">{c.name}</b> <span className="text-ink-3">· {c.note}</span>
              </span>
              <span className={cx("num font-semibold", c.lead ? "text-silk-800" : "text-ink-2")}>{c.rate}</span>
            </div>
            <span className="mt-2 block h-3 overflow-hidden rounded-full bg-ink/7">
              <span className={cx("block h-full w-0 rounded-full transition-[width] duration-[1200ms] ease-[var(--ease-out-soft)]", c.lead ? "bg-silk-500 group-[.in]:w-[72%]" : "bg-ink/25 group-[.in]:w-[62%]")} style={d(500 + i * 200)} />
            </span>
          </li>
        ))}
      </ul>
      <p className={cx("mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-cream opacity-0 group-[.in]:translate-y-0 group-[.in]:opacity-100", IN, "translate-y-2")} style={d(1500)}>
        <span className="size-1.5 rounded-full bg-silk-400" />
        Cast B converts 16% better · 97% sure
      </p>
    </div>
  );
}

/* Q10: a second signature on production. */
function Approvals() {
  return (
    <div className="w-full max-w-[320px] rounded-2xl bg-card p-4 shadow-[0_0_0_1px_rgb(24_18_14/0.07),0_14px_30px_-20px_rgb(59_29_7/0.35)]">
      <div className="flex gap-3">
        <Avatar who="AR" size={30} />
        <p className="text-[12.5px] leading-snug text-ink-2">
          <b className="font-semibold text-ink">Ana Ruiz</b> wants to raise <span className="font-mono text-[11.5px] text-ink">checkout-v2</span> to 50% in Production.
        </p>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2 text-[12.5px] font-semibold">
        <span className="rounded-lg py-1.5 text-center text-ink-2 shadow-[inset_0_0_0_1px_rgb(24_18_14/0.12)]">Decline</span>
        <span className="rounded-lg bg-ink/10 py-1.5 text-center text-ink-3 transition-colors duration-500 group-[.in]:bg-silk-500 group-[.in]:text-ink" style={d(800)}>
          Approve
        </span>
      </div>
      <p className={cx("mt-3 flex items-center gap-2 border-t border-ink/7 pt-3 text-[12px] text-ink-3 opacity-0 group-[.in]:opacity-100", IN)} style={d(1300)}>
        <Avatar who="KT" size={20} /> Approved by Kenji · just now
      </p>
    </div>
  );
}

/* Q11: the paper trail. */
function Report() {
  const lines = [
    ["11:24", "KT", "approved 50% for Production"],
    ["11:31", "!", "p95 over band: rolled back to 0%"],
    ["12:05", "AR", "shipped #4471, resumed at 50%"],
  ] as const;
  return (
    <ol className="grid w-full max-w-[320px] gap-2.5">
      {lines.map(([t, who, text], i) => (
        <li key={t} className={cx("flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[0_0_0_1px_rgb(24_18_14/0.06)] opacity-0 group-[.in]:translate-y-0 group-[.in]:opacity-100", IN, "translate-y-2")} style={d(500 + i * 220)}>
          <span className="font-mono text-[11px] text-ink-3">{t}</span>
          {who === "!" ? <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-safety text-[11px] font-bold text-white">!</span> : <Avatar who={who} size={22} />}
          <span className="text-[12.5px] leading-snug text-ink-2">{text}</span>
        </li>
      ))}
    </ol>
  );
}

/* Q12: the pull request that takes a finished flag out of the code. */
function Strike() {
  const diff = [
    ["-", 'if (scrim.isOn("checkout-v2", user)) {'],
    ["-", "  return renderCheckoutV2(user);"],
    ["-", "}"],
    ["-", "return renderCheckout(user);"],
    ["+", "return renderCheckoutV2(user);"],
  ] as const;
  return (
    <div className="w-full max-w-[330px] overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_rgb(24_18_14/0.07),0_14px_30px_-20px_rgb(59_29_7/0.35)]">
      <div className="flex items-center justify-between gap-2 border-b border-ink/7 px-3.5 py-2.5">
        <p className="truncate text-[12.5px] font-semibold text-ink">
          <span className="font-mono font-normal text-ink-3">#482</span> Remove checkout-v2
        </p>
        <span className="rounded-full bg-silk-100 px-2 py-0.5 text-[11px] font-semibold text-silk-900">Open</span>
      </div>
      <pre className="px-0 py-2 font-mono text-[11px] leading-[1.75]">
        {diff.map(([sign, code], i) => (
          <span
            key={i}
            className={cx("block px-3.5 transition-colors duration-500", sign === "-" ? "text-ink-2 group-[.in]:bg-[#fbe6df] group-[.in]:text-[#9c2f1c]" : "text-ink-2 group-[.in]:bg-silk-100 group-[.in]:text-silk-900")}
            style={d(500 + i * 120)}
          >
            {sign} {code}
          </span>
        ))}
      </pre>
    </div>
  );
}

const DEMOS: Record<CueDemo, () => ReactNode> = {
  targeting: Targeting,
  schedule: Schedule,
  guardrails: Guardrails,
  casts: Casts,
  approvals: Approvals,
  report: Report,
  strike: Strike,
};

/* The bento: wide and narrow cards alternate, then a row of three. */
const SPANS = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
const DELAYS = [0, 120, 0, 120, 0, 120, 240];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="bg-paper py-[clamp(96px,12vw,168px)]">
      <div className="shell">
        <div className="reveal max-w-[980px]">
          <h2 id="features-title" className="display text-[clamp(42px,6.4vw,96px)] text-ink">
            {featuresCopy.before}
            <br />
            <span className="whitespace-nowrap">
              {/* the switch in the line flips on as the line arrives */}
              <span aria-hidden="true" className="relative top-[-0.06em] mr-[0.18em] inline-flex h-[0.62em] w-[1.12em] items-center rounded-full bg-ink/12 p-[0.07em] align-middle transition-colors delay-500 duration-700 [.in_&]:bg-silk-500">
                <span className="block aspect-square h-full rounded-full bg-card shadow-[0_2px_6px_rgb(59_29_7/0.25)] transition-transform delay-500 duration-700 ease-[var(--ease-out-soft)] [.in_&]:translate-x-[0.5em]" />
              </span>
              {featuresCopy.after}
            </span>
          </h2>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-2 md:text-[18px]">{featuresCopy.body}</p>
        </div>

        <div className="mt-[clamp(48px,6vw,80px)] grid gap-4 md:grid-cols-12 md:gap-5">
          {cues.map((c, i) => {
            const Demo = DEMOS[c.demo];
            return (
              <article key={c.q} className={cx("card group rise flex flex-col p-3 pb-6", SPANS[i])} style={{ ["--d" as string]: `${DELAYS[i]}ms` }}>
                <div className="well grid min-h-[250px] place-items-center px-6 py-8">
                  <Demo />
                </div>
                <div className="px-4 pt-6">
                  <p className="font-mono text-[11.5px] text-silk-700">{c.q}</p>
                  <h3 className="mt-1.5 text-[21px] font-semibold tracking-[-0.015em] text-ink">{c.title}</h3>
                  <p className="mt-2 max-w-[34rem] text-[15px] leading-relaxed text-ink-2">{c.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
