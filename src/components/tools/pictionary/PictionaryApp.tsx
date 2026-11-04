"use client";

import { useState } from "react";
import { Pencil, Timer } from "lucide-react";
import { PlayGamePanel } from "@/components/tools/pictionary/PlayGamePanel";
import { QuickGeneratorPanel } from "@/components/tools/pictionary/QuickGeneratorPanel";
import { DEFAULT_FILTERS, type PromptFilters } from "@/lib/tools/pictionary";
import { cn } from "@/lib/utils";

type MainTab = "quick" | "play";

export function PictionaryApp() {
  const [tab, setTab] = useState<MainTab>("quick");
  const [filters, setFilters] = useState<PromptFilters>(DEFAULT_FILTERS);

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Pictionary modes"
        className="grid gap-2 sm:grid-cols-2"
      >
        {(
          [
            {
              id: "quick" as const,
              label: "Quick Word Generator",
              blurb: "Get one drawing prompt instantly.",
              Icon: Pencil,
            },
            {
              id: "play" as const,
              label: "Play Pictionary",
              blurb: "Play timed rounds with teams and scores.",
              Icon: Timer,
            },
          ] as const
        ).map(({ id, label, blurb, Icon }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`pictionary-tab-${id}`}
              aria-selected={selected}
              aria-controls={`pictionary-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  setTab(tab === "quick" ? "play" : "quick");
                }
              }}
              className={cn(
                "flex items-start gap-3 rounded-[1.15rem] border px-4 py-3.5 text-left transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-foreground shadow-soft"
                  : "border-line bg-surface text-ink hover:border-line-strong hover:bg-mint/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control",
                  selected ? "bg-white/15" : "bg-accent-soft text-accent",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold sm:text-base">
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-snug sm:text-sm",
                    selected ? "text-accent-foreground/85" : "text-ink-muted",
                  )}
                >
                  {blurb}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Keep both mounted so difficulty/categories and in-progress games persist. */}
      <div
        role="tabpanel"
        id="pictionary-panel-quick"
        aria-labelledby="pictionary-tab-quick"
        hidden={tab !== "quick"}
        aria-hidden={tab !== "quick"}
      >
        <QuickGeneratorPanel
          active={tab === "quick"}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      <div
        role="tabpanel"
        id="pictionary-panel-play"
        aria-labelledby="pictionary-tab-play"
        hidden={tab !== "play"}
        aria-hidden={tab !== "play"}
      >
        <PlayGamePanel
          active={tab === "play"}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  );
}
