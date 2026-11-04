import Link from "next/link";
import { getPublishedTools } from "@/lib/tools/registry";

interface RelatedToolsProps {
  currentToolId: string;
  /** Prefer these tool ids first; others follow. */
  preferredIds?: string[];
  /** Cap how many related tools are shown (default: all). */
  limit?: number;
}

export function RelatedTools({
  currentToolId,
  preferredIds = [],
  limit,
}: RelatedToolsProps) {
  const published = getPublishedTools().filter(
    (tool) => tool.id !== currentToolId,
  );

  const preferred = preferredIds
    .map((id) => published.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const preferredSet = new Set(preferred.map((t) => t.id));
  const rest = published.filter((t) => !preferredSet.has(t.id));
  const related =
    limit !== undefined
      ? [...preferred, ...rest].slice(0, limit)
      : [...preferred, ...rest];

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-tools-heading"
      className="surface-card p-6 sm:p-8"
    >
      <h2
        id="related-tools-heading"
        className="font-display text-2xl font-semibold text-ink"
      >
        Related tools
      </h2>
      <ul className="mt-4 space-y-3">
        {related.map((tool) => (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              {tool.name}
            </Link>
            <p className="text-sm text-ink-muted">{tool.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
