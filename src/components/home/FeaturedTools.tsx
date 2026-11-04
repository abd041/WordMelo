"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import {
  getPlannedTools,
  getPublishedTools,
  shouldShowToolDirectorySearch,
} from "@/lib/tools/registry";

const publishedTools = getPublishedTools();
const plannedTools = getPlannedTools();
const showSearch = shouldShowToolDirectorySearch();

export function FeaturedTools() {
  const [query, setQuery] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);

  const filtered = useMemo(() => {
    if (!showSearch) return publishedTools;
    const q = query.trim().toLowerCase();
    if (!q) return publishedTools;
    return publishedTools.filter((tool) =>
      [tool.name, tool.summary, ...tool.keywords]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <section id="tools" className="scroll-mt-24 py-12 sm:py-14">
      <div className="container-page">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Writing tools, ready when you are
            </h2>
            <p className="mt-3 text-ink-muted">
              Explore the tools currently available on WordMelo.
            </p>
          </div>

          {showSearch ? (
            <div className="w-full max-w-md">
              <label htmlFor="tool-directory-search" className="sr-only">
                Search available tools
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                  aria-hidden
                />
                <input
                  id="tool-directory-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search available tools…"
                  className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No available tools match that filter.
            </p>
          ) : filtered.length === 1 && filtered[0]?.id === "word-counter" ? (
            <article className="interactive-lift overflow-hidden rounded-[1.15rem] border border-accent/25 bg-surface shadow-lift">
              <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                <div className="p-6 sm:p-8 lg:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    Featured tool
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                    Word Counter
                  </h3>
                  <p className="mt-3 max-w-xl text-[1.05rem] leading-7 text-ink-muted">
                    A private editor for words, characters, sentences,
                    paragraphs, reading time, and word frequency.
                  </p>
                  <Link
                    href="/word-counter"
                    className="mt-7 inline-flex items-center gap-2 rounded-control bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-[background-color,box-shadow] duration-200 hover:bg-accent-hover hover:shadow-lift"
                  >
                    Open Word Counter
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="border-t border-line bg-gradient-to-br from-mint to-accent-soft/50 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <p className="text-sm font-semibold text-ink">
                    Includes
                  </p>
                  <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                    {[
                      "Live word & character counts",
                      "Sentence and paragraph totals",
                      "Reading and speaking estimates",
                      "Word frequency breakdown",
                      "Copy and TXT download",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  featured={tool.id === filtered[0]?.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-card border border-line bg-surface/70 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              More writing utilities are on the way.
              {plannedTools.length > 0
                ? ` ${plannedTools.length} tools are planned and not yet available.`
                : null}
            </p>
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
              aria-expanded={showRoadmap}
              onClick={() => setShowRoadmap((value) => !value)}
            >
              {showRoadmap ? "Hide roadmap" : "View roadmap"}
            </button>
          </div>
          {showRoadmap ? (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {plannedTools.map((tool) => (
                <li
                  key={tool.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-ink">{tool.name}</p>
                    <p className="text-sm text-ink-muted">{tool.summary}</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Planned
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
