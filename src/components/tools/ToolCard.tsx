import Link from "next/link";
import {
  AlignLeft,
  CaseSensitive,
  Cloud,
  Binary,
  Hash,
  Italic,
  Pencil,
  Sparkles,
  Type,
  WandSparkles,
  WholeWord,
} from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const icons = {
  counter: Hash,
  characters: Binary,
  case: CaseSensitive,
  title: Type,
  fancy: Sparkles,
  cursive: Italic,
  random: WandSparkles,
  pictionary: Pencil,
  letter: WholeWord,
  lorem: AlignLeft,
  cloud: Cloud,
} as const;

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
  featured?: boolean;
}

export function ToolCard({ tool, className, featured = false }: ToolCardProps) {
  const Icon = icons[tool.icon];
  const href = tool.status === "published" ? tool.href : null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-control",
            featured
              ? "bg-accent text-accent-foreground"
              : "bg-accent-soft text-accent",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {tool.status === "planned" ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-muted">
            Planned
          </span>
        ) : (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Available now
          </span>
        )}
      </div>
      <h3
        className={cn(
          "mt-4 font-sans font-semibold text-ink",
          featured ? "text-xl sm:text-2xl" : "text-lg",
        )}
      >
        {tool.name}
      </h3>
      <p
        className={cn(
          "mt-2 leading-relaxed text-ink-muted",
          featured ? "text-base" : "text-sm",
        )}
      >
        {tool.summary}
      </p>
      {href ? (
        <span className="mt-5 inline-flex text-sm font-semibold text-accent">
          {tool.id === "word-counter"
            ? "Open Word Counter"
            : tool.id === "character-counter"
              ? "Open Character Counter"
              : tool.id === "fancy-text-generator"
                ? "Open Fancy Text Generator"
                : tool.id === "case-converter"
                  ? "Open Case Converter"
                  : tool.id === "title-case-converter"
                    ? "Open Title Case Converter"
                    : tool.id === "cursive-generator"
                      ? "Open Cursive Generator"
                      : tool.id === "random-word-generator"
                        ? "Open Random Word Generator"
                        : tool.id === "pictionary-word-generator"
                          ? "Open Pictionary Word Generator"
                          : tool.id === "random-letter-generator"
                            ? "Open Random Letter Generator"
                            : tool.id === "lorem-ipsum-generator"
                              ? "Open Lorem Ipsum Generator"
                              : tool.id === "word-cloud-generator"
                                ? "Open Word Cloud Generator"
                                : "Open tool"}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </span>
      ) : (
        <span className="mt-4 inline-flex text-sm text-ink-soft">
          Coming in a future release
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "surface-card group block transition-shadow hover:shadow-lift focus-visible:shadow-lift",
          featured ? "border-accent/20 p-6 sm:p-7 md:col-span-2 xl:col-span-2" : "p-5",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn("surface-card block p-5 opacity-90", className)}
      aria-disabled="true"
    >
      {content}
    </div>
  );
}
