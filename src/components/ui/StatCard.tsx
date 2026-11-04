import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
  /** Elevates the primary metric (typically word count). */
  emphasis?: "primary" | "default";
}

export function StatCard({
  label,
  value,
  hint,
  className,
  emphasis = "default",
}: StatCardProps) {
  const isPrimary = emphasis === "primary";

  return (
    <div
      className={cn(
        "rounded-card border px-4 py-3",
        isPrimary
          ? "border-accent/25 bg-accent-soft/60 shadow-soft"
          : "border-line bg-surface shadow-soft",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isPrimary ? "text-accent" : "text-ink-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-sans font-semibold tabular-nums text-ink",
          isPrimary ? "text-3xl sm:text-[2rem]" : "text-2xl sm:text-[1.65rem]",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
