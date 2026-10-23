import { Arrow, Wordmark } from "@/components/mark";
import { company, footer } from "@/lib/site";

/** Credits, the way a programme ends: who made it, and where to find them. */
export function Footer() {
  return (
    <footer className="relative bg-paper text-ink">
      <div className="shell pt-[clamp(64px,8vw,104px)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-ink-2">Feature flags and staged rollouts for teams who ship every day.</p>
          </div>
          <a href="#top" className="group inline-flex items-center gap-2 text-[14.5px] font-semibold text-ink transition-colors hover:text-silk-800">
            Back to curtain up <Arrow dir="up" className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="mt-12 border-t border-ink/8">
          {[...footer.groups, { title: "Elsewhere", links: company.socials }].map((g) => (
            <nav key={g.title} aria-label={g.title} className="grid gap-2 border-b border-ink/8 py-5 sm:grid-cols-[10rem_1fr] sm:items-baseline">
              <p className="label text-ink-3">{g.title}</p>
              <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-ink-2 transition-colors hover:text-silk-800">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 py-7 text-[13.5px] text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 {company.legal}, {company.address.join(", ")}. A sample company for this template.
          </p>
          <p>
            Created by{" "}
            <a href="https://fardin.website" target="_blank" rel="noopener" className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-silk-500">
              Fardin Omor Afnan
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
