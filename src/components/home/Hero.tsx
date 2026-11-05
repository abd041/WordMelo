import { Button } from "@/components/ui/Button";
import { MiniWordCounter } from "@/components/home/MiniWordCounter";
import { getPublishedTools } from "@/lib/tools/registry";

export function Hero() {
  const primaryTool = getPublishedTools()[0];

  return (
    <section className="relative overflow-hidden border-b border-line bg-paper-glow">
      <div className="container-page grid items-center gap-8 py-11 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-[4.5rem]">
        <div className="animate-fade-up max-w-xl lg:max-w-none">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:text-sm">
            Free online writing utilities
          </p>
          <h1 className="mt-4 font-display text-[2.15rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3rem]">
            Free Online Text & Writing Tools
          </h1>
          <p className="mt-5 max-w-lg text-[1.05rem] leading-8 text-ink-muted sm:text-lg sm:leading-8">
            Count words, convert text, format titles, and generate words with
            fast, free online tools.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primaryTool ? (
              <Button href={primaryTool.href} size="lg" className="shadow-glow">
                Use Free Word Counter
              </Button>
            ) : null}
            <Button href="/#tools" variant="secondary" size="lg">
              Explore Available Tools
            </Button>
          </div>
          <p className="mt-5 text-sm leading-6 text-ink-muted">
            Text stays in your browser. No account required.
          </p>
        </div>

        <div
          className="animate-fade-up min-w-0 lg:pl-2"
          style={{ animationDelay: "70ms" }}
        >
          <MiniWordCounter />
        </div>
      </div>
    </section>
  );
}
