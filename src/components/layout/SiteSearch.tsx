"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchPublishedTools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

interface SiteSearchProps {
  id?: string;
  className?: string;
  onNavigate?: () => void;
  /** Overlay keeps a fixed-height header from pushing the field out of view. */
  panel?: "overlay" | "inline";
}

export function SiteSearch({
  id = "site-search",
  className,
  onNavigate,
  panel = "inline",
}: SiteSearchProps) {
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchPublishedTools(query), [query]);
  const showPanel = query.trim().length > 0;

  useEffect(() => {
    if (!showPanel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuery("");
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setQuery("");
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [showPanel]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search tools
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search free text tools..."
          autoComplete="off"
          className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft focus:border-accent"
        />
      </div>

      {showPanel ? (
        <div
          role="listbox"
          aria-label="Search results"
          className={cn(
            "z-50 max-h-80 overflow-y-auto rounded-card border border-line bg-surface shadow-lift",
            panel === "overlay"
              ? "absolute left-0 right-0 top-[calc(100%+0.4rem)]"
              : "mt-2",
          )}
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">
              No published tools match “{query.trim()}”.
            </p>
          ) : (
            <ul>
              {results.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    role="option"
                    aria-selected="false"
                    className="block px-4 py-3 hover:bg-surface-sunken"
                    onClick={() => {
                      setQuery("");
                      onNavigate?.();
                    }}
                  >
                    <span className="font-medium text-ink">{tool.name}</span>
                    <span className="mt-0.5 block text-sm text-ink-muted">
                      {tool.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
