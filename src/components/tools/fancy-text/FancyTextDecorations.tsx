"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DECORATION_CATEGORIES,
  FANCY_DECORATIONS,
  type FancyDecoration,
} from "@/lib/tools/fancy-text";
import { cn, copyTextToClipboard } from "@/lib/utils";

interface FancyTextDecorationsProps {
  text: string;
  onCopied?: (label: string) => void;
  onCopyFailed?: (output: string) => void;
}

export function FancyTextDecorations({
  text,
  onCopied,
  onCopyFailed,
}: FancyTextDecorationsProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | FancyDecoration["category"]
  >("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (activeCategory === "all") return FANCY_DECORATIONS;
    return FANCY_DECORATIONS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  async function handleCopy(item: FancyDecoration) {
    const output = item.wrap(text);
    const ok = await copyTextToClipboard(output);
    if (ok) {
      setCopiedId(item.id);
      onCopied?.(item.label);
      window.setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 1600);
    } else {
      onCopyFailed?.(output);
    }
  }

  return (
    <section
      aria-labelledby="fancy-decorations-heading"
      className="rounded-[1.15rem] border border-line bg-mint/30 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="fancy-decorations-heading"
            className="font-display text-xl font-semibold text-ink"
          >
            Decorative symbols
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Optional hearts, stars, and frames — separate from Unicode letter
            styles.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide decorations" : "Show decorations"}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="toolbar"
            aria-label="Decoration categories"
          >
            <button
              type="button"
              aria-pressed={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              className={cn(
                "min-h-11 shrink-0 rounded-control border px-3 text-sm font-medium",
                activeCategory === "all"
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line bg-surface text-ink-muted",
              )}
            >
              All
            </button>
            {DECORATION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-control border px-3 text-sm font-medium",
                  activeCategory === cat.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-line bg-surface text-ink-muted",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const preview = item.wrap(text);
              const isCopied = copiedId === item.id;
              return (
                <li key={item.id}>
                  <div className="flex h-full flex-col rounded-control border border-line bg-surface p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      {item.label}
                    </p>
                    <p className="mt-2 break-words text-base leading-7 text-ink">
                      {preview}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-3 min-h-11 self-start"
                      onClick={() => handleCopy(item)}
                      aria-label={`Copy ${item.label} decoration`}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" aria-hidden />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden />
                      )}
                      {isCopied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
