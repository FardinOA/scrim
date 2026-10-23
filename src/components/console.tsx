import type { CSSProperties, ReactNode } from "react";
import { Mark } from "@/components/mark";
import { cx } from "@/lib/cx";
import { callouts, flag, guardrails, people, release, showReport } from "@/lib/site";

/** The console's drawn size. The scene scales it to fit the stage. */
export const CONSOLE_W = 1200;
export const CONSOLE_H = 760;

/*
  Where each card sits in the drawn console (x, y, w, h). The cards are
  separate layers over the shell so the scene can lift them apart in depth;
  the shell keeps an empty socket where each one belongs.
*/
const CARDS = {
  rollout: [252, 222, 574, 188],
  audience: [842, 222, 330, 188],
  guardrails: [252, 426, 574, 316],
  report: [842, 426, 330, 316],
} as const;

type CardId = keyof typeof CARDS;

/** A stable 0..1 bucket per user, the way flag SDKs hash a user id. */
function bucketOf(i: number, salt = 0) {
  let h = Math.imul(i * 73856093 ^ (salt + 1) * 19349663, 2654435761) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/* ---------------------------------------------------------------------------
   Small parts
   ------------------------------------------------------------------------ */

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cx("size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  flag: "M3.5 14V2.5M3.5 3h8l-1.6 2.6L11.5 8.2h-8",
  users: "M6 7.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM1.8 13.5c.5-2.3 2.2-3.6 4.2-3.6s3.7 1.3 4.2 3.6M10.8 2.6a2.3 2.3 0 0 1 0 4.4M12.2 9.9c1 .5 1.7 1.6 2 3.6",
  casts: "M5.5 2v4.2L2.6 12a1.2 1.2 0 0 0 1.1 1.8h8.6a1.2 1.2 0 0 0 1.1-1.8L10.5 6.2V2M4.5 2h7M4.2 9.5h7.6",
  shield: "M8 1.8 13 3.6v4c0 3-2.1 5.4-5 6.6-2.9-1.2-5-3.6-5-6.6v-4Z",
  report: "M4 1.8h5.5L12.5 5v9.2H4ZM9.2 1.8V5h3.3M6.2 8h4M6.2 10.6h4",
  sliders: "M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6M10 3v3M6 10v3",
  search: "M7.2 12a4.8 4.8 0 1 0 0-9.6 4.8 4.8 0 0 0 0 9.6ZM10.6 10.6 13.6 13.6",
  clock: "M8 14.2A6.2 6.2 0 1 0 8 1.8a6.2 6.2 0 0 0 0 12.4ZM8 4.6V8l2.2 1.4",
  chevron: "M4.5 6.2 8 9.8l3.5-3.6",
  more: "M3.5 8h.01M8 8h.01M12.5 8h.01",
};

export function Avatar({ who, size = 26 }: { who: string; size?: number }) {
  if (who === "Q")
    return (
      <span className="grid shrink-0 place-items-center rounded-full bg-ink text-silk-400" style={{ width: size, height: size }} title="Scrim">
        <Mark className="size-[52%]" />
      </span>
    );
  const p = people[who];
  return (
    <span className={cx("grid shrink-0 place-items-center rounded-full text-[10.5px] font-semibold", p?.tone)} style={{ width: size, height: size }} title={p?.name}>
      {who}
    </span>
  );
}

function CardHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function Stepper({ compact }: { compact?: boolean }) {
  const fill = release.reached / (release.steps.length - 1);
  return (
    <div className="relative">
      <div className={cx("absolute inset-x-[10%] h-[3px] rounded-full bg-ink/8", compact ? "top-[7px]" : "top-[9px]")}>
        <div className="h-full rounded-full bg-silk-500" style={{ width: `${fill * 100}%` }} />
      </div>
      <ol className="relative grid grid-cols-5">
        {release.steps.map((label, i) => {
          const done = i <= release.reached;
          return (
            <li key={label} className="flex flex-col items-center gap-2">
              <span className={cx("grid place-items-center rounded-full border-2", compact ? "size-4" : "size-5", done ? "border-silk-500 bg-silk-500" : "border-ink/15 bg-card")}>
                {done && <span className="size-1.5 rounded-full bg-card" />}
              </span>
              <span className={cx("font-mono text-[11px]", done ? "text-ink" : "text-ink-3")}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Every dot a user, lit when its bucket is under the rollout share. The first few are the team. */
function Audience({ cols, rows, pitch, r, team }: { cols: number; rows: number; pitch: number; r: number; team: number }) {
  const share = release.share / 100;
  return (
    <svg viewBox={`0 0 ${cols * pitch} ${rows * pitch}`} className="block w-full" aria-hidden="true">
      {Array.from({ length: cols * rows }, (_, i) => {
        const isTeam = i < team;
        return (
          <circle
            key={i}
            cx={(i % cols) * pitch + pitch / 2}
            cy={Math.floor(i / cols) * pitch + pitch / 2}
            r={r}
            fill={isTeam ? "var(--color-silk-800)" : bucketOf(i) < share ? "var(--color-silk-500)" : "rgb(24 18 14 / 0.09)"}
          />
        );
      })}
    </svg>
  );
}

/* Each guardrail's last week, calm and inside its band. */
const SERIES = guardrails.map((_, k) => Array.from({ length: 36 }, (_, i) => 0.42 + Math.sin(i * 1.7 + k * 2.1) * 0.12 + Math.sin(i * 0.43 + k * 4.2) * 0.16));

function Chart({ values, w, h }: { values: number[]; w: number; h: number }) {
  const step = w / (values.length - 1);
  const y = (v: number) => h - 3 - (Math.min(1.7, Math.max(0, v)) / 1.7) * (h - 6);
  const pts = values.map((v, i) => [i * step, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block overflow-visible" style={{ width: w, height: h }} aria-hidden="true">
      <line x1="0" x2={w} y1={y(1)} y2={y(1)} stroke="rgb(207 61 37 / 0.35)" strokeDasharray="3 3" />
      <path d={`${line} L${lx.toFixed(1)} ${h} L0 ${h} Z`} fill="var(--color-silk-500)" opacity="0.12" />
      <path d={line} fill="none" stroke="var(--color-silk-600)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="3" fill="var(--color-card)" stroke="var(--color-silk-600)" strokeWidth="1.6" />
    </svg>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inset-0 animate-ping rounded-full bg-silk-500 opacity-60" />
      <span className="relative size-1.5 rounded-full bg-silk-600" />
    </span>
  );
}

/* ---------------------------------------------------------------------------
   The four cards
   ------------------------------------------------------------------------ */

function RolloutCard() {
  return (
    <>
      <CardHead title="Rollout">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
          <Icon d={ICONS.clock} className="size-3.5" />
          Next: {release.next}
        </span>
      </CardHead>
      <div className="mt-3 flex items-end justify-between">
        <p className="display num text-[68px] leading-[0.85] text-ink">
          {release.share}
          <span className="text-[0.5em] text-silk-600">%</span>
        </p>
        <p className="pb-1 text-right text-[12.5px] text-ink-3">
          <span className="num font-semibold text-ink">{release.users.toLocaleString("en-US")}</span> of {release.audience.toLocaleString("en-US")} users
          <br />
          see the new checkout
        </p>
      </div>
      <div className="mt-5">
        <Stepper />
      </div>
    </>
  );
}

function AudienceCard() {
  return (
    <>
      <CardHead title="Audience">
        <span className="flex items-center gap-3 text-[11px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-silk-800" /> Team
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-silk-500" /> New
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-ink/12" /> Old
          </span>
        </span>
      </CardHead>
      <div className="mt-4">
        <Audience cols={29} rows={9} pitch={10} r={3.2} team={8} />
      </div>
      <p className="mt-3 text-[11.5px] text-ink-3">Each dot is about 480 users, bucketed by user id.</p>
    </>
  );
}

function GuardrailsCard() {
  return (
    <>
      <CardHead title="Guardrails">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2 py-0.5 text-[11.5px] font-medium text-ink-2">
          <Icon d={ICONS.shield} className="size-3" /> Safety curtain armed
        </span>
      </CardHead>
      <ul className="mt-2 divide-y divide-ink/6">
        {guardrails.map((g, i) => (
          <li key={g.name} className="grid grid-cols-[112px_minmax(0,1fr)_84px] items-center gap-4 py-3">
            <div>
              <p className="text-[12.5px] text-ink-2">{g.name}</p>
              <p className="num mt-0.5 text-[15px] font-semibold text-ink">{g.value}</p>
            </div>
            <Chart values={SERIES[i]} w={250} h={34} />
            <p className="text-right font-mono text-[10.5px] text-ink-3">{g.band}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function ReportCard() {
  return (
    <>
      <CardHead title="Show report">
        <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
          <LiveDot /> Live
        </span>
      </CardHead>
      <ol className="mt-4 grid gap-4">
        {showReport.map((r) => (
          <li key={r.text} className="flex gap-3">
            <Avatar who={r.who} size={26} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] leading-snug text-ink-2">{r.text}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-ink-3">{r.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

const CARD_BODY: Record<CardId, () => ReactNode> = {
  rollout: RolloutCard,
  audience: AudienceCard,
  guardrails: GuardrailsCard,
  report: ReportCard,
};

/* Which side of its card each callout hangs on when the console comes apart. */
const CALLOUT_SIDE: Record<CardId, "left" | "right"> = { rollout: "left", guardrails: "left", audience: "right", report: "right" };

/* ---------------------------------------------------------------------------
   The desktop console: a shell, and four cards as layers over it.
   ------------------------------------------------------------------------ */

function Shell() {
  return (
    <div className="absolute inset-0 flex overflow-hidden rounded-[22px] bg-card shadow-[0_0_0_1px_rgb(24_18_14/0.08),0_50px_100px_-50px_rgb(59_29_7/0.4)]">
      <aside className="flex w-[224px] shrink-0 flex-col border-r border-ink/7 bg-mist/70 px-4 py-5">
        <div className="flex items-center gap-2 px-2">
          <Mark className="size-[18px] text-silk-600" />
          <span className="text-[19px] font-semibold leading-none tracking-[-0.04em]">Scrim</span>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-xl bg-card px-3 py-2.5 shadow-[0_0_0_1px_rgb(24_18_14/0.07)]">
          <span className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-silk-500 text-[11px] font-bold text-ink">A</span>
            <span className="text-[13px] font-semibold">Acme Storefront</span>
          </span>
          <Icon d={ICONS.chevron} className="text-ink-3" />
        </div>
        <nav className="mt-6 grid gap-0.5 text-[13.5px]">
          {[
            { label: "Flags", icon: ICONS.flag, count: "48", active: true },
            { label: "Segments", icon: ICONS.users, count: "12" },
            { label: "Two casts", icon: ICONS.casts, count: "3" },
            { label: "Guardrails", icon: ICONS.shield },
            { label: "Show reports", icon: ICONS.report },
            { label: "Settings", icon: ICONS.sliders },
          ].map((n) => (
            <span key={n.label} className={cx("flex items-center gap-2.5 rounded-lg px-2.5 py-2", n.active ? "bg-card font-semibold text-ink shadow-[0_0_0_1px_rgb(24_18_14/0.06),0_2px_6px_-3px_rgb(59_29_7/0.2)]" : "text-ink-2")}>
              <Icon d={n.icon} className={n.active ? "text-silk-600" : "text-ink-3"} />
              <span className="flex-1">{n.label}</span>
              {n.count && <span className="font-mono text-[11px] text-ink-3">{n.count}</span>}
            </span>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-card p-3 shadow-[0_0_0_1px_rgb(24_18_14/0.07)]">
          <p className="text-[12px] font-semibold">Strike is ready</p>
          <p className="mt-1 text-[11.5px] leading-snug text-ink-3">4 flags have been at 100% for 30 days.</p>
          <span className="mt-2.5 inline-flex rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-cream">Review PRs</span>
        </div>
      </aside>

      <div className="relative min-w-0 flex-1">
        <header className="flex h-[58px] items-center justify-between border-b border-ink/7 px-7">
          <p className="flex items-center gap-2 text-[13px] text-ink-3">
            Acme Storefront <span className="text-ink/25">/</span> Flags <span className="text-ink/25">/</span> <span className="font-mono text-[12.5px] text-ink">{flag.key}</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="flex w-[200px] items-center gap-2 rounded-lg bg-mist px-3 py-1.5 text-[12.5px] text-ink-3">
              <Icon d={ICONS.search} className="size-3.5" /> Search flags
              <span className="ml-auto font-mono text-[10.5px]">⌘K</span>
            </span>
            <span className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold shadow-[inset_0_0_0_1px_rgb(24_18_14/0.1)]">
              <span className="size-1.5 rounded-full bg-silk-500" /> Production <Icon d={ICONS.chevron} className="size-3.5 text-ink-3" />
            </span>
            <span className="flex -space-x-1.5">
              <span className="rounded-full ring-2 ring-card">
                <Avatar who="AR" />
              </span>
              <span className="rounded-full ring-2 ring-card">
                <Avatar who="KT" />
              </span>
            </span>
          </div>
        </header>

        <div className="px-7 pt-[18px]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-mist px-2 py-0.5 font-mono text-[12px] text-ink-2">{flag.key}</span>
                <span className="rounded-md bg-silk-100 px-2 py-0.5 text-[11.5px] font-medium text-silk-900">Release</span>
              </div>
              <p className="mt-2.5 text-[22px] font-semibold tracking-[-0.01em]">{flag.name}</p>
              <p className="mt-0.5 text-[13px] text-ink-3">Single-page checkout with saved cards and wallet payments.</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-silk-100 px-2.5 py-1 text-[12px] font-semibold text-silk-900">
                <LiveDot /> Live
              </span>
              <span className="grid size-8 place-items-center rounded-lg text-ink-3 shadow-[inset_0_0_0_1px_rgb(24_18_14/0.08)]">
                <Icon d={ICONS.more} />
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-6 border-b border-ink/7 text-[13px]">
            {["Rollout", "Targeting", "Guardrails", "Show report", "Code"].map((t, i) => (
              <span key={t} className={cx("-mb-px border-b-2 pb-2.5", i === 0 ? "border-silk-600 font-semibold text-ink" : "border-transparent text-ink-3")}>
                {t}
                {t === "Guardrails" && <span className="ml-1.5 rounded bg-mist px-1 font-mono text-[10.5px]">3</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* the sockets the cards lift out of */}
      {(Object.keys(CARDS) as CardId[]).map((id) => {
        const [x, y, w, h] = CARDS[id];
        return <span key={id} className="absolute rounded-2xl border border-dashed border-ink/14 bg-mist/80" style={{ left: x, top: y, width: w, height: h }} />;
      })}
    </div>
  );
}

/**
 * The desktop console, built as a little 3D set: the shell at depth zero and
 * each card as its own layer (`data-layer`), with the callout it shows when
 * the scene lifts it apart (driven by `--e` on the root, 0..1).
 */
export function Console() {
  return (
    <div data-console className="relative [transform-style:preserve-3d]" style={{ width: CONSOLE_W, height: CONSOLE_H }}>
      <div data-shell className="absolute inset-0">
        <Shell />
      </div>
      {(Object.keys(CARDS) as CardId[]).map((id) => {
        const [x, y, w, h] = CARDS[id];
        const Body = CARD_BODY[id];
        const c = callouts[id];
        const side = CALLOUT_SIDE[id];
        return (
          <div key={id} data-layer={id} className="absolute [transform-style:preserve-3d]" style={{ left: x, top: y, width: w, height: h }}>
            <section
              className="h-full rounded-2xl bg-card p-5"
              style={{
                boxShadow:
                  "0 0 0 1px rgb(24 18 14 / 0.08), 0 calc(var(--e, 0) * 40px) calc(var(--e, 0) * 70px) calc(var(--e, 0) * -24px) rgb(59 29 7 / 0.35)",
              }}
            >
              <Body />
            </section>
            {/* the callout, hung off the card's outer side */}
            <div
              className={cx("pointer-events-none absolute top-6 flex items-start", side === "left" ? "right-full flex-row-reverse" : "left-full")}
              style={{ opacity: "clamp(0, calc((var(--e, 0) - 0.55) * 3.2), 1)" } as CSSProperties}
            >
              <span className="mt-[18px] h-px w-10 shrink-0 bg-silk-600" />
              <span className="mt-[15px] size-[7px] shrink-0 rounded-full border-[1.5px] border-silk-600 bg-card" />
              <div className={cx("w-[248px] rounded-2xl bg-card p-4 shadow-[0_0_0_1px_rgb(24_18_14/0.08),0_24px_48px_-24px_rgb(59_29_7/0.45)]", side === "left" ? "mr-2.5" : "ml-2.5")}>
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-silk-700">{c.n}</span>
                  <span className="text-[16px] font-semibold text-ink">{c.title}</span>
                </p>
                <p className="mt-1.5 text-[13.5px] leading-snug text-ink-2">{c.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The phone-sized console: the rollout, the audience and the guardrails.
   ------------------------------------------------------------------------ */

export function ConsoleCompact() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink/7 px-4 py-3">
        <span className="rounded-md bg-mist px-2 py-0.5 font-mono text-[12px] text-ink-2">{flag.key}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-silk-100 px-2.5 py-1 text-[12px] font-semibold text-silk-900">
          <LiveDot /> Live
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-end justify-between">
          <p className="display num text-[56px] leading-[0.85]">
            {release.share}
            <span className="text-[0.5em] text-silk-600">%</span>
          </p>
          <p className="pb-0.5 text-right text-[12px] text-ink-3">
            <span className="num font-semibold text-ink">{release.users.toLocaleString("en-US")}</span> users
            <br />
            see the new checkout
          </p>
        </div>
        <div className="mt-4">
          <Stepper compact />
        </div>
        <div className="mt-5 rounded-xl bg-mist p-3">
          <Audience cols={24} rows={6} pitch={12} r={3.7} team={6} />
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {guardrails.map((g) => (
            <li key={g.name} className="rounded-xl border border-ink/7 px-2.5 py-2">
              <p className="text-[10.5px] text-ink-3">{g.name}</p>
              <p className="num text-[13.5px] font-semibold">{g.value}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
