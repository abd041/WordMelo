interface ToolInstructionsProps {
  title?: string;
  steps: string[];
}

export function ToolInstructions({
  title = "How to use this tool",
  steps,
}: ToolInstructionsProps) {
  return (
    <section aria-labelledby="tool-instructions-heading" className="surface-card p-6 sm:p-8">
      <h2
        id="tool-instructions-heading"
        className="font-display text-2xl font-semibold text-ink"
      >
        {title}
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-muted">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
