import { cx } from "@/lib/cx";

/** The mark: a drape drawn back to its tiebacks, leaving the arch it opens. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("size-6", className)} aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M2 2h20v20H2zM7.2 22v-6.6C7.2 10.6 9.4 6.6 12 5.2c2.6 1.4 4.8 5.4 4.8 10.2V22z" />
    </svg>
  );
}

export function Wordmark({ className, markClassName = "text-silk-700" }: { className?: string; markClassName?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <Mark className={cx("size-[22px] transition-colors duration-500", markClassName)} />
      <span className="text-[23px] font-semibold leading-none tracking-[-0.045em]">Scrim</span>
    </span>
  );
}

export function Arrow({ className, dir = "right" }: { className?: string; dir?: "right" | "up" | "down" }) {
  const rotate = dir === "up" ? "-rotate-90" : dir === "down" ? "rotate-90" : "";
  return (
    <svg viewBox="0 0 16 16" className={cx("arrow", rotate, className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
