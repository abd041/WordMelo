const cases = [
  {
    title: "Students",
    body: "Confirm essay and assignment length before submitting.",
  },
  {
    title: "Writers",
    body: "Keep articles and chapters within a clear word target.",
  },
  {
    title: "Creators",
    body: "Check captions and posts without leaving the browser.",
  },
  {
    title: "Professionals",
    body: "Time reports, briefs, and presentation scripts.",
  },
];

export function UseCases() {
  return (
    <section className="border-t border-line bg-surface py-12 sm:py-14">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:items-start">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
            Useful for everyday writing
          </h2>
          <p className="mt-3 text-[1.05rem] leading-7 text-ink-muted">
            Length checks for common drafts — essays, articles, captions, and
            presentations.
          </p>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {cases.map((item) => (
            <li
              key={item.title}
              className="grid gap-1 py-4 transition-colors duration-200 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
            >
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-accent">
                {item.title}
              </h3>
              <p className="text-[0.98rem] leading-7 text-ink-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
