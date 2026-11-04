import { Lock, Sparkles, Zap } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Instant results",
    body: "Counts update as you type.",
  },
  {
    icon: Lock,
    title: "Browser privacy",
    body: "Analysis stays on your device.",
  },
  {
    icon: Sparkles,
    title: "Free to use",
    body: "No account for the Word Counter.",
  },
];

export function ValueStrip() {
  return (
    <section className="border-b border-line bg-surface py-7 sm:py-8">
      <div className="container-page grid gap-5 sm:grid-cols-3 sm:gap-6">
        {values.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <item.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-sans text-sm font-semibold text-ink">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm leading-6 text-ink-muted">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
