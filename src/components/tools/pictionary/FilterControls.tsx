"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PROMPT_CATEGORIES, PROMPT_STATS, countEligible } from "@/lib/tools/pictionary";
import type {
  DifficultyFilter,
  PromptCategoryId,
  PromptFilters,
} from "@/lib/tools/pictionary";
import { cn } from "@/lib/utils";

const DIFFICULTY_COPY: Record<
  DifficultyFilter,
  { label: string; blurb: string }
> = {
  mixed: { label: "Mixed", blurb: "Any drawing complexity." },
  easy: { label: "Easy", blurb: "Simple, familiar objects." },
  medium: { label: "Medium", blurb: "More detailed objects or combinations." },
  hard: { label: "Hard", blurb: "More complex shapes or structures." },
};

interface FilterControlsProps {
  filters: PromptFilters;
  onChange: (next: PromptFilters) => void;
  idPrefix: string;
  usedIds?: ReadonlySet<string>;
  defaultCategoriesOpen?: boolean;
  showDifficulty?: boolean;
  showCategories?: boolean;
  showNoRepeat?: boolean;
  compactDifficulty?: boolean;
}

export function FilterControls({
  filters,
  onChange,
  idPrefix,
  usedIds,
  defaultCategoriesOpen = false,
  showDifficulty = true,
  showCategories = true,
  showNoRepeat = true,
  compactDifficulty = false,
}: FilterControlsProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(defaultCategoriesOpen);
  const eligible = countEligible(filters, filters.noRepeat ? usedIds : undefined);

  function toggleCategory(id: PromptCategoryId) {
    const has = filters.categories.includes(id);
    const categories = has
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ ...filters, categories });
  }

  function selectAllCategories() {
    onChange({
      ...filters,
      categories: PROMPT_CATEGORIES.map((c) => c.id),
    });
  }

  function clearCategories() {
    onChange({ ...filters, categories: [] });
  }

  return (
    <div className="space-y-4">
      {showDifficulty ? <fieldset>
        <legend className="text-sm font-semibold text-ink">Difficulty</legend>
        <div className={compactDifficulty ? "mt-2 grid grid-cols-4 gap-1.5" : "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"}>
          {(Object.keys(DIFFICULTY_COPY) as DifficultyFilter[]).map((value) => {
            const meta = DIFFICULTY_COPY[value];
            const selected = filters.difficulty === value;
            return (
              <label
                key={value}
                className={cn(
                  "min-h-11 cursor-pointer rounded-[0.9rem] border transition-colors",
                  compactDifficulty ? "flex items-center justify-center px-1 py-2 text-center" : "px-3 py-2.5 text-left",
                  selected
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-paper text-ink hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name={`${idPrefix}-diff`}
                  className="sr-only"
                  checked={selected}
                  onChange={() => onChange({ ...filters, difficulty: value })}
                />
                <span className={cn("block font-semibold", compactDifficulty ? "text-xs sm:text-sm" : "text-sm")}>{meta.label}</span>
                {compactDifficulty ? null : (
                <span
                  className={cn(
                    "mt-0.5 block text-[0.7rem] leading-snug",
                    selected ? "text-accent/90" : "text-ink-soft",
                  )}
                >
                  {meta.blurb}
                </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset> : null}

      {showCategories ? <div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-control border border-line bg-paper px-3.5 py-3 text-left text-sm font-semibold text-ink hover:border-line-strong"
          aria-expanded={categoriesOpen}
          aria-controls={`${idPrefix}-categories`}
          onClick={() => setCategoriesOpen((o) => !o)}
        >
          <span>
            Categories
            <span className="ml-2 font-normal text-ink-soft">
              {filters.categories.length === 0
                ? "All allowed"
                : `${filters.categories.length} selected`}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-muted transition-transform",
              categoriesOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        <div
          id={`${idPrefix}-categories`}
          hidden={!categoriesOpen}
          className="mt-2 rounded-[1rem] border border-line/80 bg-mint/15 p-3"
        >
          <p className="text-xs text-ink-soft">
            Leave empty for every category. Counts come from the curated list of objects, plants, places, and nature. People and animals are not included.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
              onClick={selectAllCategories}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-xs font-semibold text-ink-muted underline-offset-2 hover:underline"
              onClick={clearCategories}
            >
              Clear selection
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROMPT_CATEGORIES.map((cat) => {
              const selected = filters.categories.includes(cat.id);
              const allMode = filters.categories.length === 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  title={cat.description}
                  aria-pressed={selected}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "min-h-11 rounded-control border px-2.5 py-2 text-left text-xs font-medium sm:text-sm",
                    selected
                      ? "border-accent bg-accent text-accent-foreground"
                      : allMode
                        ? "border-line bg-surface text-ink"
                        : "border-line bg-paper text-ink-muted",
                  )}
                >
                  <span className="block">{cat.label}</span>
                  <span className={cn("mt-0.5 block text-[0.7rem] font-normal", selected ? "text-accent-foreground/80" : "text-ink-soft")}>
                    {PROMPT_STATS.byCategory[cat.id].total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div> : null}

      {showNoRepeat ? <label className="flex items-start gap-3 rounded-control border border-line bg-paper px-3 py-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-line text-accent"
          checked={filters.noRepeat}
          onChange={(e) => onChange({ ...filters, noRepeat: e.target.checked })}
        />
        <span>
          <span className="block text-sm font-semibold text-ink">
            No-repeat session
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
            Skip prompt IDs already used this session. Changing filters recalculates
            the eligible pool; used IDs stay excluded until you reset.
          </span>
        </span>
      </label> : null}

      {showDifficulty && !compactDifficulty ? (
      <p className="text-xs text-ink-soft" aria-live="polite">
        Eligible prompts now: <strong className="text-ink">{eligible.toLocaleString()}</strong>
      </p>
      ) : null}
    </div>
  );
}
