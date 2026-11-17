"use client";

import { useState } from "react";
import { Pencil, Timer } from "lucide-react";
import { PlayGamePanel } from "@/components/tools/pictionary/PlayGamePanel";
import { PrintCardsPanel } from "@/components/tools/pictionary/PrintCardsPanel";
import { QuickGeneratorPanel } from "@/components/tools/pictionary/QuickGeneratorPanel";
import { DEFAULT_FILTERS, type PromptFilters } from "@/lib/tools/pictionary";
import { cn } from "@/lib/utils";

type MainTab = "quick" | "play";

export function PictionaryApp() {
  const [tab, setTab] = useState<MainTab>("quick");
  const [filters, setFilters] = useState<PromptFilters>(DEFAULT_FILTERS);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div
        role="tablist"
        aria-label="Pictionary modes"
        className="grid grid-cols-2 gap-1 rounded-control border border-line bg-surface-sunken p-1"
      >
        {(
          [
            { id: "quick" as const, label: "Quick Generator", Icon: Pencil },
            { id: "play" as const, label: "Play Pictionary", Icon: Timer },
          ] as const
        ).map(({ id, label, Icon }) => {
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
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
                  return;
                }
                event.preventDefault();
                const next =
                  event.key === "Home" ? "quick" : event.key === "End" ? "play" : tab === "quick" ? "play" : "quick";
                setTab(next);
                document.getElementById(`pictionary-tab-${next}`)?.focus();
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.6rem] px-2 py-2 text-center text-sm font-semibold leading-tight sm:text-base",
                selected ? "bg-surface text-ink shadow-soft" : "text-ink-muted hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0">{label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="pictionary-panel-quick"
        aria-labelledby="pictionary-tab-quick"
        hidden={tab !== "quick"}
      >
        <QuickGeneratorPanel active={tab === "quick"} filters={filters} onFiltersChange={setFilters} />
      </div>
      <div
        role="tabpanel"
        id="pictionary-panel-play"
        aria-labelledby="pictionary-tab-play"
        hidden={tab !== "play"}
      >
        <PlayGamePanel active={tab === "play"} filters={filters} onFiltersChange={setFilters} />
      </div>

      <PrintCardsPanel />
    </div>
  );
}
