/* All copy and sample data. Scrim, its customers, people, prices and figures are placeholders. */

export const company = {
  name: "Scrim",
  legal: "Scrim Labs Ltd.",
  email: "boxoffice@scrim.example",
  address: ["14 King Street", "Bristol BS1 4EF"],
  socials: [
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Bluesky", href: "#" },
  ],
};

export const nav = [
  { label: "How it works", href: "#show" },
  { label: "Features", href: "#features" },
  { label: "Developers", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
];

export const hero = {
  presents: "Scrim presents",
  left: "Rehearse",
  right: "in production.",
  cta: "Start free",
  hint: "See the console",
};

/* The flag the show follows, and the guardrails watching it. */
export const flag = { key: "checkout-v2", name: "New checkout", env: "production" };

/*
  The console behind the curtain: one release, frozen halfway through its run.
  Nothing here changes with scroll; the scene moves the console, not its data.
*/
export const release = {
  share: 50,
  users: 62_424,
  audience: 124_800,
  /* the cue steps, and how many have run */
  steps: ["Team", "1%", "10%", "50%", "100%"],
  reached: 3,
  next: "100% on Friday at 09:00, if guardrails hold",
};

export const guardrails = [
  { name: "Error rate", value: "0.21%", band: "under 0.5%" },
  { name: "p95 latency", value: "186 ms", band: "under 220 ms" },
  { name: "Conversion", value: "+3.1%", band: "no drop" },
];

/* The show report, newest first. "Q" is Scrim calling a scheduled cue. */
export const showReport = [
  { who: "KT", text: "Kenji approved 50% for Production", time: "Wed 11:24" },
  { who: "Q", text: "Scheduled cue ran: 10% of users", time: "Wed 09:00" },
  { who: "Q", text: "Scheduled cue ran: 1% of users", time: "Tue 09:00" },
  { who: "AR", text: "Ana turned checkout-v2 on for Team", time: "Mon 16:40" },
];

/* The people in the console. */
export const people: Record<string, { name: string; tone: string }> = {
  AR: { name: "Ana Ruiz", tone: "bg-silk-200 text-silk-900" },
  KT: { name: "Kenji Tanaka", tone: "bg-mist-2 text-ink-2" },
};

/* What each card is for, shown when the console comes apart. */
export const callouts = {
  rollout: { n: "01", title: "Rollout", body: "Raise it in cues: your team, 1%, 10%, half, everyone. Schedule each one or call it yourself." },
  audience: { n: "02", title: "Audience", body: "Every user is hashed into a stable bucket, so raising the share only ever adds people." },
  guardrails: { n: "03", title: "Guardrails", body: "Pick the numbers that matter. If one leaves its band, the safety curtain drops on its own." },
  report: { n: "04", title: "Show report", body: "Every flip, who called it and why, written down like a stage manager's report." },
};

export const stageCopy = {
  label: "Behind the curtain",
  title: "One console for every release.",
  body: "Flags, rollouts, guardrails and the paper trail, in the one place your whole team can read.",
};

/* Everything else, numbered on from the show's five cues. */
export const featuresCopy = {
  before: "The rest of the show,",
  after: "on cue.",
  body: "Seven more tools, each doing one job, all reading the same flags.",
};
export const cues = [
  {
    q: "Q6",
    title: "Targeting",
    body: "Show it to people on the Pro plan, in Portugal and Spain, on iOS 18 or later. Rules read like sentences and preview who they match before you save.",
    demo: "targeting",
  },
  {
    q: "Q7",
    title: "Scheduled cues",
    body: "25% at nine on Tuesday, 50% on Wednesday if the guardrails held, everyone on Thursday. Write the run once and go to lunch.",
    demo: "schedule",
  },
  {
    q: "Q8",
    title: "Guardrails",
    body: "Pick the numbers that matter for this release. If one leaves its band, the safety curtain drops and the rollout waits for you.",
    demo: "guardrails",
  },
  {
    q: "Q9",
    title: "Two casts",
    body: "Run two versions on alternate seats and let conversion decide. Scrim says when the result is real, and when it is still noise.",
    demo: "casts",
  },
  {
    q: "Q10",
    title: "Approvals",
    body: "Changes to production need a second signature, the way a good stage manager wants one. Everything else moves as fast as you do.",
    demo: "approvals",
  },
  {
    q: "Q11",
    title: "Show reports",
    body: "Every flip, who called it, from where, and why, written down like a stage manager's report after every performance.",
    demo: "report",
  },
  {
    q: "Q12",
    title: "Strike",
    body: "When a flag has sat at 100% for thirty days, Scrim opens the pull request that takes it out of your code.",
    demo: "strike",
  },
] as const;

export type CueDemo = (typeof cues)[number]["demo"];

/* The rig: the SDK, in four languages. `{{flag}}` marks the flag key for highlighting. */
export const sdk = [
  {
    id: "ts",
    label: "TypeScript",
    code: `import { Scrim } from "@scrim/node";

const scrim = await Scrim.connect(process.env.SCRIM_KEY);

export function checkout(user: User) {
  if (scrim.isOn({{flag}}, { id: user.id, plan: user.plan })) {
    return renderCheckoutV2(user);
  }
  return renderCheckout(user);
}`,
  },
  {
    id: "py",
    label: "Python",
    code: `from scrim import Scrim

scrim = Scrim.connect(os.environ["SCRIM_KEY"])

def checkout(user):
    if scrim.is_on({{flag}}, {"id": user.id, "plan": user.plan}):
        return render_checkout_v2(user)
    return render_checkout(user)`,
  },
  {
    id: "go",
    label: "Go",
    code: `scrim, _ := scrimgo.Connect(os.Getenv("SCRIM_KEY"))

func Checkout(w http.ResponseWriter, u User) {
	if scrim.IsOn({{flag}}, scrimgo.User{ID: u.ID, Plan: u.Plan}) {
		renderCheckoutV2(w, u)
		return
	}
	renderCheckout(w, u)
}`,
  },
  {
    id: "swift",
    label: "Swift",
    code: `let scrim = try await Scrim.connect(key: Secrets.scrimKey)

func checkoutView(for user: User) -> some View {
    if scrim.isOn({{flag}}, user: .init(id: user.id, plan: user.plan)) {
        return AnyView(CheckoutV2(user: user))
    }
    return AnyView(Checkout(user: user))
}`,
  },
];

export const rigCopy = {
  label: "For developers",
  network: "A network round trip",
  local: "A Scrim check",
  body: "The SDK keeps your rules in memory and evaluates them on your own server, so asking costs a thousandth of a round trip.",
};

export const rigFacts = [
  { title: "Evaluated where you are", body: "Rules live in memory on your own server. No network call is made per check." },
  { title: "Changes in under 200 ms", body: "A change in the console streams to every connected SDK, worldwide, before you have let go of the mouse." },
  { title: "Fails safe", body: "If Scrim is ever unreachable, the SDK keeps the last rules it saw, and your code's defaults after that." },
];

export const sdkList = ["TypeScript", "Node", "Python", "Go", "Ruby", "Java", "Kotlin", "Swift", "Rust", ".NET", "PHP", "Elixir", "React", "Edge workers"];

export const notices = {
  rating: "4.9",
  teams: "2,400",
  quotes: [
    { stars: 5, quote: "We used to freeze deploys on Fridays. Now we ship on Fridays and nobody notices.", name: "Priya Raman", role: "VP Engineering, Halyard" },
    { stars: 5, quote: "The safety curtain came down at 2 a.m. and fixed it before I found my glasses.", name: "Tom Ekwueme", role: "On-call lead, Quayside" },
    { stars: 4, quote: "Finally, a flag tool our product managers use without asking an engineer.", name: "Marta Lindqvist", role: "Head of Product, Fernhill" },
    { stars: 5, quote: "Strike alone paid for it: 412 dead flags out of our code in one quarter.", name: "Dev Okafor", role: "Staff Engineer, Tidewell" },
    { stars: 5, quote: "Rollouts went from a meeting to a cue.", name: "Sana Qureshi", role: "CTO, Lumen & Lark" },
    { stars: 5, quote: "0.04 ms. I checked. Twice.", name: "Felix Brandt", role: "Platform Lead, Pilcrow" },
    { stars: 5, quote: "Two casts told us the new pricing page lost money before it cost us any.", name: "Aiko Mori", role: "Growth, Kettlebell" },
    { stars: 5, quote: "The show report is the first audit log our compliance team has ever praised.", name: "Rafael Duarte", role: "Security, Northlight Bank" },
  ],
};

/* Box office. Monthly users on the slider, and what each house size costs. */
export const houseSizes = [
  { users: 10_000, label: "10k" },
  { users: 25_000, label: "25k" },
  { users: 100_000, label: "100k" },
  { users: 250_000, label: "250k" },
  { users: 500_000, label: "500k" },
  { users: 1_000_000, label: "1M" },
  { users: 2_500_000, label: "2.5M" },
  { users: 5_000_000, label: "5M+" },
];

export const plans = [
  {
    id: "rehearsal",
    name: "Rehearsal",
    code: "RH",
    price: "Free",
    upTo: 25_000,
    note: "For a team finding its feet.",
    includes: ["Up to 25,000 monthly users", "5 teammates, 2 environments", "Targeting and staged rollouts", "Show reports kept 7 days"],
  },
  {
    id: "company",
    name: "Company",
    code: "CO",
    price: "From $120",
    upTo: 2_500_000,
    note: "For teams who ship every day.",
    includes: ["Up to 2.5 million monthly users", "Unlimited teammates and environments", "Guardrails and the safety curtain", "Two casts, approvals and Strike", "Show reports kept a year"],
  },
  {
    id: "house",
    name: "House",
    code: "HS",
    price: "Let's talk",
    upTo: Infinity,
    note: "For the big rooms.",
    includes: ["Any number of monthly users", "SSO, SCIM and audit export", "A relay you run inside your network", "99.99% uptime, in writing", "A named engineer who knows your setup"],
  },
];

/** Monthly price for a house size, in dollars; null for "let's talk". */
export function priceFor(users: number) {
  if (users <= 25_000) return 0;
  if (users > 2_500_000) return null;
  /* $120 covers the first 100k; then $0.80 per thousand, tapering to $0.40 past a million. */
  const first = 120;
  const mid = Math.max(0, Math.min(users, 1_000_000) - 100_000) * 0.0008;
  const top = Math.max(0, users - 1_000_000) * 0.0004;
  return Math.round((first + mid + top) / 10) * 10;
}

/* Questions, served the way Scrim serves features: each one behind its own flag. */
export const questions = [
  {
    key: "faq.deploy-tool",
    q: "Is Scrim a deploy tool?",
    a: "No. You keep deploying the way you do now. Scrim decides who sees what once the code is out there.",
  },
  {
    key: "faq.outage",
    q: "What happens if Scrim goes down?",
    a: "Your SDKs keep the last rules they received and carry on evaluating them locally. An SDK that has never connected uses the defaults written in your code.",
  },
  {
    key: "faq.page-speed",
    q: "Does it slow our pages down?",
    a: "No network call happens per check. Rules are evaluated in memory, in about 0.04 ms.",
  },
  {
    key: "faq.data-residency",
    q: "Where is our data kept?",
    a: "Rules and show reports live in the EU or the US, your choice. The user attributes you target on stay on your servers.",
  },
  {
    key: "faq.migration",
    q: "Can we move over from another flag tool?",
    a: "Yes. Scrim imports the JSON exports most flag tools produce, and the SDK can wrap your old one while you switch, flag by flag.",
  },
  {
    key: "faq.who-calls-cues",
    q: "Who calls the cues, engineering or product?",
    a: "Either. An engineer writes the flag once; after that anyone you allow can raise or lower it from the console, with approvals on production if you want them.",
  },
];

/* What the curtain falls on. */
export const closing = [
  { value: "2,400", label: "teams ship with Scrim" },
  { value: "1.2B", label: "flag checks a day" },
  { value: "0.8 s", label: "to roll back, worst case" },
  { value: "0", label: "Friday deploy freezes" },
];

export const curtainCall = {
  left: "Break",
  right: "a leg.",
  cta: "Start free",
  secondary: "Book a walkthrough",
};

export const footer = {
  groups: [
    { title: "Product", links: [...nav, { label: "Changelog", href: "#" }] },
    {
      title: "Developers",
      links: [
        { label: "Quickstart", href: "#" },
        { label: "SDKs", href: "#developers" },
        { label: "API", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Security", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ],
};
