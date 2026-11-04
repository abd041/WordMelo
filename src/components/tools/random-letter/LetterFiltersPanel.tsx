"use client";

import { useId, useState } from "react";
import {
  ALPHABET,
  parseCustomLetters,
  poolLabel,
  type LetterCaseMode,
  type LetterFilters,
  type PoolMode,
} from "@/lib/tools/random-letter";
import { cn } from "@/lib/utils";

interface LetterFiltersPanelProps {
  filters: LetterFilters;
  onChange: (next: LetterFilters) => void;
  usedCount?: number;
  compact?: boolean;
}

const POOL_OPTIONS: Array<{ id: PoolMode; label: string; blurb: string }> = [
  { id: "all", label: "A–Z", blurb: "Full alphabet" },
  { id: "vowels", label: "Vowels", blurb: "A E I O U" },
  { id: "consonants", label: "Consonants", blurb: "21 letters" },
  { id: "custom", label: "Custom", blurb: "Your set" },
];

const CASE_OPTIONS: Array<{ id: LetterCaseMode; label: string }> = [
  { id: "upper", label: "Uppercase" },
  { id: "lower", label: "Lowercase" },
  { id: "mixed", label: "Mixed" },
];

export function LetterFiltersPanel({
  filters,
  onChange,
  usedCount = 0,
  compact = false,
}: LetterFiltersPanelProps) {
  const id = useId();
  const [exclusionsOpen, setExclusionsOpen] = useState(
    filters.excluded.length > 0,
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState(
    filters.customLetters.join(""),
  );
  const [customError, setCustomError] = useState<string | null>(null);

  function setPool(poolMode: PoolMode) {
    onChange({ ...filters, poolMode });
  }

  function toggleExclude(letter: string) {
    const has = filters.excluded.includes(letter);
    onChange({
      ...filters,
      excluded: has
        ? filters.excluded.filter((l) => l !== letter)
        : [...filters.excluded, letter],
    });
  }

  function applyCustom(raw: string) {
    setCustomDraft(raw);
    const { letters, rejected } = parseCustomLetters(raw);
    if (rejected.length > 0 && letters.length === 0) {
      setCustomError("Use A–Z letters only (spaces or commas are fine).");
      onChange({ ...filters, customLetters: [] });
      return;
    }
    setCustomError(
      rejected.length > 0
        ? `Ignored unsupported characters: ${rejected.slice(0, 5).join(" ")}`
        : null,
    );
    onChange({ ...filters, customLetters: letters, poolMode: "custom" });
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Letter pool</p>
        <p className="text-xs text-ink-soft" aria-live="polite">
          {poolLabel(filters)}
          {usedCount > 0 ? ` · ${usedCount} used` : ""}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Letter pool"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {POOL_OPTIONS.map((opt) => {
          const selected = filters.poolMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPool(opt.id)}
              className={cn(
                "rounded-[0.9rem] border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-paper text-ink hover:border-line-strong",
              )}
            >
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[0.7rem] leading-snug",
                  selected ? "text-accent/90" : "text-ink-soft",
                )}
              >
                {opt.blurb}
              </span>
            </button>
          );
        })}
      </div>

      {filters.poolMode === "custom" ? (
        <div>
          <label
            htmlFor={`${id}-custom`}
            className="text-sm font-semibold text-ink"
          >
            Custom letters
          </label>
          <input
            id={`${id}-custom`}
            value={customDraft}
            onChange={(e) => applyCustom(e.target.value)}
            placeholder="e.g. ABCDE or R, S, T, L, N"
            className="mt-1.5 w-full rounded-control border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            autoComplete="off"
            spellCheck={false}
          />
          {customError ? (
            <p className="mt-1 text-xs text-danger" role="status">
              {customError}
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-soft">
              Duplicates are normalized. Digits and punctuation are rejected.
            </p>
          )}
        </div>
      ) : null}

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Case</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CASE_OPTIONS.map((opt) => {
            const selected = filters.caseMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ ...filters, caseMode: opt.id })}
                className={cn(
                  "rounded-control border px-3 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-line bg-paper text-ink hover:border-line-strong",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          className="mt-1"
          checked={filters.noRepeatSession}
          onChange={(e) =>
            onChange({ ...filters, noRepeatSession: e.target.checked })
          }
        />
        <span>
          <span className="font-medium">No repeats this session</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            Skips previously drawn base letters until you reset.
          </span>
        </span>
      </label>

      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-control border border-line bg-paper px-3.5 py-3 text-left text-sm font-semibold text-ink hover:border-line-strong"
          aria-expanded={exclusionsOpen}
          onClick={() => setExclusionsOpen((o) => !o)}
        >
          <span>
            Exclude letters
            <span className="ml-2 font-normal text-ink-soft">
              {filters.excluded.length === 0
                ? "None"
                : `${filters.excluded.length} excluded`}
            </span>
          </span>
          <span aria-hidden className="text-ink-muted">
            {exclusionsOpen ? "−" : "+"}
          </span>
        </button>
        {exclusionsOpen ? (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="text-xs font-semibold text-accent hover:underline"
                onClick={() =>
                  onChange({ ...filters, excluded: [...ALPHABET] })
                }
              >
                Exclude all
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-accent hover:underline"
                onClick={() => onChange({ ...filters, excluded: [] })}
              >
                Clear exclusions
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-accent hover:underline"
                onClick={() => onChange({ ...filters, excluded: [] })}
              >
                Reset to A–Z
              </button>
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Exclude letters A to Z"
            >
              {ALPHABET.map((letter) => {
                const excluded = filters.excluded.includes(letter);
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-pressed={excluded}
                    aria-label={`${excluded ? "Include" : "Exclude"} ${letter}`}
                    onClick={() => toggleExclude(letter)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors sm:h-9 sm:w-9",
                      excluded
                        ? "border-line bg-surface-sunken text-ink-soft line-through"
                        : "border-line bg-surface text-ink hover:border-accent",
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-control border border-dashed border-line bg-transparent px-3.5 py-2.5 text-left text-sm font-medium text-ink-muted hover:border-line-strong hover:text-ink"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <span>Advanced options</span>
          <span aria-hidden>{advancedOpen ? "−" : "+"}</span>
        </button>
        {advancedOpen ? (
          <div className="mt-3 space-y-3 rounded-[0.9rem] border border-line bg-paper/70 p-3.5">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1"
                checked={filters.yAsVowel}
                onChange={(e) =>
                  onChange({ ...filters, yAsVowel: e.target.checked })
                }
              />
              <span>
                <span className="font-medium">Count Y as a vowel</span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  Default treats Y as a consonant. Updates vowel and consonant
                  pools together.
                </span>
              </span>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
