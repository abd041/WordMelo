import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  priority?: boolean;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-baseline gap-0 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl",
        className,
      )}
      aria-label="WordMelo home"
    >
      <span>Word</span>
      <span className="text-accent transition-colors group-hover:text-accent-hover">
        Melo
      </span>
    </Link>
  );
}
