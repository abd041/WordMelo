export interface FaqItem {
  question: string;
  answer: string;
}

interface ToolFAQProps {
  title?: string;
  items: FaqItem[];
}

export function ToolFAQ({ title = "Common questions", items }: ToolFAQProps) {
  return (
    <section
      aria-labelledby="tool-faq-heading"
      className="rounded-[1.15rem] border border-line bg-surface p-6 shadow-soft sm:p-8"
    >
      <h2
        id="tool-faq-heading"
        className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]"
      >
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line">
        {items.map((item) => (
          <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
            <summary className="cursor-pointer list-none font-medium text-ink transition-colors hover:text-accent marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-ink-soft transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
