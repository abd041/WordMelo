"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import {
  getPlannedTools,
  getPublishedTools,
  searchPublishedTools,
  shouldShowToolDirectorySearch,
  toolCategories,
} from "@/lib/tools/registry";
import type { ToolCategoryId } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const POPULAR_IDS = [
  "word-counter",
  "character-counter",
  "case-converter",
  "title-case-converter",
  "random-word-generator",
  "fancy-text-generator",
] as const;

const publishedTools = getPublishedTools();
const plannedTools = getPlannedTools();
const showSearch = shouldShowToolDirectorySearch();
const popularTools = POPULAR_IDS.map((id) =>
  publishedTools.find((tool) => tool.id === id),
).filter((tool): tool is (typeof publishedTools)[number] => Boolean(tool));

export function FeaturedTools() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategoryId | "all">("all");
  const [showRoadmap, setShowRoadmap] = useState(false);

  const filtered = useMemo(() => {
    const matched = showSearch ? searchPublishedTools(query) : publishedTools;
    if (category === "all") return matched;
    return matched.filter((tool) => tool.categoryId === category);
  }, [query, category]);

  const filtering = query.trim().length > 0 || category !== "all";

  function resetFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <section id="tools" className="scroll-mt-24 py-12 sm:py-14">
      <div className="container-page">
        {!filtering && popularTools.length > 0 ? (
          <div className="mb-12">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Popular tools
            </h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Six core tools for counting, case changes, and everyday writing.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {popularTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              All tools
            </h2>
            <p className="mt-3 text-ink-muted">
              Search by name or description, or filter by what you need to do.
            </p>
          </div>

          {showSearch ? (
            <div className="w-full max-w-md">
              <label htmlFor="tool-directory-search" className="sr-only">
                Search free text tools
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
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setQuery("");
                  }}
                  placeholder="Search free text tools..."
                  className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft focus:border-accent"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Tool categories"
        >
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
            className={cn(
              "h-10 rounded-control border px-3 text-sm font-semibold",
              category === "all"
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-surface text-ink-muted hover:text-ink",
            )}
          >
            All
          </button>
          {toolCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className={cn(
                "h-10 rounded-control border px-3 text-sm font-semibold",
                category === item.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {item.name}
            </button>
          ))}
          {filtering ? (
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 rounded-control px-3 text-sm font-semibold text-accent underline-offset-2 hover:underline"
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <p className="rounded-card border border-line bg-surface px-4 py-6 text-sm text-ink-muted">
              No tools match that search
              {category !== "all" ? " and category" : ""}. Try another word or
              reset the filters.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>

        {plannedTools.length > 0 ? (
          <div className="mt-10 rounded-card border border-line bg-surface/70 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-muted">
                {plannedTools.length} tools are planned and not yet available.
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
        ) : null}
      </div>
    </section>
  );
}
