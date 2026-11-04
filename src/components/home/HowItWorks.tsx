const steps = [
  {
    step: "01",
    title: "Paste or type",
    body: "Use the homepage editor or open the full Word Counter.",
  },
  {
    step: "02",
    title: "Review live stats",
    body: "Words, characters, and reading time update as you edit.",
  },
  {
    step: "03",
    title: "Finish your draft",
    body: "Keep writing, copy the text, or download a TXT file.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line py-12 sm:py-14">
      <div className="container-page">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          How it works
        </h2>
        <ol className="mt-8 grid gap-0 sm:grid-cols-3">
          {steps.map((item, index) => (
            <li
              key={item.step}
              className="relative border-t border-line pt-5 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 first:sm:border-l-0 first:sm:pl-0"
            >
              <p className="font-display text-3xl font-semibold text-accent/35">
                {item.step}
              </p>
              <h3 className="mt-2 font-sans text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-ink-muted">
                {item.body}
              </p>
              {index < steps.length - 1 ? (
                <span
                  className="pointer-events-none absolute right-4 top-3 hidden h-px w-8 bg-line-strong lg:block"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
