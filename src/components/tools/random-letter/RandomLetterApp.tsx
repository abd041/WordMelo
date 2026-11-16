"use client";

import { useState } from "react";
import { Dices, Layers3, Disc3 } from "lucide-react";
import { AlphabetWheelPanel } from "@/components/tools/random-letter/AlphabetWheelPanel";
import { InstantPickerPanel } from "@/components/tools/random-letter/InstantPickerPanel";
import { MultipleLettersPanel } from "@/components/tools/random-letter/MultipleLettersPanel";
import {
  DEFAULT_FILTERS,
  DEFAULT_MULTIPLE,
  LETTER_PRESETS,
  getPreset,
  type LetterFilters,
  type LetterPresetId,
  type MainTab,
  type MultipleSettings,
} from "@/lib/tools/random-letter";
import { cn } from "@/lib/utils";

const TABS: Array<{
  id: MainTab;
  label: string;
  blurb: string;
  Icon: typeof Dices;
}> = [
  {
    id: "instant",
    label: "Single Letter",
    blurb: "One large letter from A to Z.",
    Icon: Dices,
  },
  {
    id: "multiple",
    label: "Multiple Letters",
    blurb: "Batches, shuffle, and a text file.",
    Icon: Layers3,
  },
  {
    id: "wheel",
    label: "Alphabet Wheel",
    blurb: "Spin to a letter chosen first.",
    Icon: Disc3,
  },
];

export function RandomLetterApp() {
  const [tab, setTab] = useState<MainTab>("instant");
  const [filters, setFilters] = useState<LetterFilters>(DEFAULT_FILTERS);
  const [multiple, setMultiple] =
    useState<MultipleSettings>(DEFAULT_MULTIPLE);
  const [preferFocus, setPreferFocus] = useState(false);
  const [shuffleToken, setShuffleToken] = useState(0);

  function applyPreset(id: LetterPresetId) {
    const preset = getPreset(id);
    if (!preset) return;
    setFilters(preset.filters);
    if (preset.multiple) setMultiple(preset.multiple);
    setPreferFocus(Boolean(preset.focusPreferred));
    setTab(preset.tab);
    if (preset.shuffleAll) {
      // Defer so Multiple Letters mounts with updated filters before shuffling.
      window.setTimeout(() => setShuffleToken((t) => t + 1), 0);
    }
  }

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Random letter modes"
        className="grid gap-2 lg:grid-cols-3"
      >
        {TABS.map(({ id, label, blurb, Icon }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`letter-tab-${id}`}
              aria-selected={selected}
              aria-controls={`letter-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const idx = TABS.findIndex((t) => t.id === tab);
                  const next =
                    event.key === "ArrowRight"
                      ? TABS[(idx + 1) % TABS.length]!
                      : TABS[(idx - 1 + TABS.length) % TABS.length]!;
                  setTab(next.id);
                  document.getElementById(`letter-tab-${next.id}`)?.focus();
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

      <div className="rounded-[1.15rem] border border-line bg-surface px-4 py-3 shadow-soft sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Quick presets
          </p>
          <p className="text-[0.7rem] text-ink-soft">
            Applies shared filters without clearing session history in other modes.
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {LETTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.blurb}
              onClick={() => applyPreset(preset.id)}
              className="rounded-control border border-line bg-paper px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:bg-mint/45 sm:text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tabpanel"
        id="letter-panel-instant"
        aria-labelledby="letter-tab-instant"
        hidden={tab !== "instant"}
        aria-hidden={tab !== "instant"}
      >
        <InstantPickerPanel
          active={tab === "instant"}
          filters={filters}
          onFiltersChange={setFilters}
          preferFocus={preferFocus && tab === "instant"}
        />
      </div>
      <div
        role="tabpanel"
        id="letter-panel-multiple"
        aria-labelledby="letter-tab-multiple"
        hidden={tab !== "multiple"}
        aria-hidden={tab !== "multiple"}
      >
        <MultipleLettersPanel
          filters={filters}
          onFiltersChange={setFilters}
          settings={multiple}
          onSettingsChange={setMultiple}
          shuffleToken={shuffleToken}
        />
      </div>
      <div
        role="tabpanel"
        id="letter-panel-wheel"
        aria-labelledby="letter-tab-wheel"
        hidden={tab !== "wheel"}
        aria-hidden={tab !== "wheel"}
      >
        <AlphabetWheelPanel
          active={tab === "wheel"}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  );
}
