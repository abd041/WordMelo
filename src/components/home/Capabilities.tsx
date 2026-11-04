const metrics = [
  { title: "Word count", detail: "Draft length as you type" },
  { title: "Character count", detail: "With and without spaces" },
  { title: "Sentence count", detail: "For pacing checks" },
  { title: "Paragraph count", detail: "Structure at a glance" },
  { title: "Reading time", detail: "Documented WPM estimate" },
  { title: "Word frequency", detail: "Repeated words, ranked" },
];

export function Capabilities() {
  return (
    <section className="border-t border-line bg-mint/50 py-12 sm:py-14">
      <div className="container-page">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
              What the Word Counter measures
            </h2>
            <p className="mt-3 text-[1.05rem] leading-7 text-ink-muted">
              Practical checks in one private editor — not six separate tools.
            </p>
          </div>
        </div>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((item) => (
            <li
              key={item.title}
              className="bg-surface px-5 py-5 transition-colors duration-200 hover:bg-mint/60"
            >
              <h3 className="font-sans text-base font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
