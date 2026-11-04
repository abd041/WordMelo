interface ToolHeaderProps {
  title: string;
  description: string;
  privacyNote?: string;
}

export function ToolHeader({
  title,
  description,
  privacyNote = "Text is processed locally in your browser and is not uploaded.",
}: ToolHeaderProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
        {description}
      </p>
      <p className="mt-3 inline-flex rounded-control bg-accent-soft px-3 py-1.5 text-sm text-accent">
        {privacyNote}
      </p>
    </header>
  );
}
