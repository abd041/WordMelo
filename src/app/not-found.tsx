import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="pb-20 pt-16">
      <div className="container-page max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
          Page not found
        </h1>
        <p className="mt-4 text-ink-muted">
          That address is not part of the published WordMelo site. Planned tools
          do not have public pages until they are finished.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/">Go home</Button>
          <Button href="/word-counter" variant="secondary">
            Open Word Counter
          </Button>
        </div>
      </div>
    </div>
  );
}
