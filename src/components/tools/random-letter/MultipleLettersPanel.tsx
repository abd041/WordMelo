"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Download, Shuffle } from "lucide-react";
import { LetterFiltersPanel } from "@/components/tools/random-letter/LetterFiltersPanel";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  TXT_FILENAME,
  clampCount,
  drawMany,
  eligiblePool,
  formatLetters,
  poolLabel,
  runSecureDraw,
  shuffleAlphabet,
  type LetterFilters,
  type MultipleSettings,
  type OutputSeparator,
} from "@/lib/tools/random-letter";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

interface MultipleLettersPanelProps {
  filters: LetterFilters;
  onFiltersChange: (next: LetterFilters) => void;
  settings: MultipleSettings;
  onSettingsChange: (next: MultipleSettings) => void;
  /** Increment to trigger an alphabet shuffle. */
  shuffleToken?: number;
}

const QUICK_COUNTS = [5, 10, 15, 26, 50, 100];
const SEPARATORS: Array<{ id: OutputSeparator; label: string }> = [
  { id: "space", label: "Spaces" },
  { id: "comma", label: "Commas" },
  { id: "newline", label: "Lines" },
  { id: "joined", label: "Joined" },
];

export function MultipleLettersPanel({
  filters,
  onFiltersChange,
  settings,
  onSettingsChange,
  shuffleToken = 0,
}: MultipleLettersPanelProps) {
  const id = useId();
  const [letters, setLetters] = useState<string[]>([]);
  const [bases, setBases] = useState<string[]>([]);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const lastShuffle = useRef(0);

  const poolSize = eligiblePool(
    filters,
    filters.noRepeatSession ? used : undefined,
  ).length;

  useEffect(() => {
    if (!shuffleToken || shuffleToken === lastShuffle.current) return;
    lastShuffle.current = shuffleToken;
    const result = runSecureDraw(() => shuffleAlphabet(filters));
    setLetters(result.letters);
    setBases(result.bases);
    setFeedback(
      result.message
        ? { message: result.message, tone: "neutral" }
        : {
            message: `Shuffled ${result.letters.length} letters`,
            tone: "success",
          },
    );
  }, [shuffleToken, filters]);

  function generate(shuffle = false) {
    const result = runSecureDraw(() =>
      shuffle
        ? shuffleAlphabet(filters)
        : drawMany(filters, settings, {
            usedBase: filters.noRepeatSession ? used : undefined,
          }),
    );

    if (result.letters.length === 0) {
      setLetters([]);
      setBases([]);
      setFeedback({
        message: result.message ?? "No letters available",
        tone: "neutral",
      });
      return;
    }

    setLetters(result.letters);
    setBases(result.bases);
    if (filters.noRepeatSession) {
      setUsed((prev) => {
        const next = new Set(prev);
        for (const b of result.bases) next.add(b);
        return next;
      });
    }
    setFeedback(
      result.message
        ? { message: result.message, tone: "neutral" }
        : {
            message: `Generated ${result.letters.length} letter${result.letters.length === 1 ? "" : "s"}`,
            tone: "success",
          },
    );
  }

  async function handleCopy() {
    if (letters.length === 0) return;
    const text = formatLetters(letters, settings.separator);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      setFeedback({ message: "Copied all letters", tone: "success" });
      window.setTimeout(() => setCopied(false), 1400);
    } else {
      setFeedback({
        message: "Could not copy — check clipboard permissions",
        tone: "error",
      });
    }
  }

  function handleDownload() {
    if (letters.length === 0) return;
    downloadTextFile(
      TXT_FILENAME,
      formatLetters(letters, settings.separator),
    );
    setFeedback({ message: `Downloaded ${TXT_FILENAME}`, tone: "success" });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section
        aria-labelledby={`${id}-stage`}
        className="overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-soft"
      >
        <div className="border-b border-line bg-gradient-to-br from-mint/40 via-surface to-paper px-5 py-4 sm:px-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Alphabet studio · Batch
          </p>
          <h2
            id={`${id}-stage`}
            className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl"
          >
            Multiple letters
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {poolLabel(filters)} · quantity {settings.count}
            {filters.noRepeatSession ? ` · ${poolSize} remaining` : ""}
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {feedback ? (
            <div className="mb-4">
              <FeedbackMessage
                message={feedback.message}
                tone={feedback.tone}
                onDismiss={() => setFeedback(null)}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${id}-count`}
                className="text-sm font-semibold text-ink"
              >
                Quantity (1–100)
              </label>
              <input
                id={`${id}-count`}
                type="number"
                min={1}
                max={100}
                value={settings.count}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    count: clampCount(Number(e.target.value)),
                  })
                }
                className="mt-1.5 w-full rounded-control border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      onSettingsChange({ ...settings, count: n })
                    }
                    className={cn(
                      "rounded-control border px-2.5 py-1 text-xs font-semibold",
                      settings.count === n
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line text-ink-muted hover:border-line-strong",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Output format</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SEPARATORS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={settings.separator === s.id}
                    onClick={() =>
                      onSettingsChange({ ...settings, separator: s.id })
                    }
                    className={cn(
                      "rounded-control border px-2.5 py-1.5 text-xs font-semibold",
                      settings.separator === s.id
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-line text-ink hover:border-line-strong",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={settings.uniqueInBatch}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      uniqueInBatch: e.target.checked,
                    })
                  }
                />
                <span>
                  <span className="font-medium">Unique within batch</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    No duplicate bases in this result. Max equals eligible pool
                    size ({poolSize}).
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => generate(false)}
            >
              <Shuffle className="h-4 w-4" aria-hidden />
              Generate
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => generate(true)}
            >
              Shuffle pool
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={letters.length === 0}
              onClick={() => void handleCopy()}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              Copy All
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={letters.length === 0}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download TXT
            </Button>
          </div>

          <div
            className="mt-6 min-h-[11rem] rounded-[1.2rem] border border-accent/15 bg-[linear-gradient(180deg,#f7f4ef_0%,#f3f0ea_100%)] p-4"
            aria-live="polite"
          >
            {letters.length === 0 ? (
              <div className="flex min-h-[9rem] flex-col items-center justify-center text-center">
                <p className="font-display text-lg font-semibold text-ink">
                  Results workspace
                </p>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                  Choose a quantity and press Generate. Unique mode never
                  silently repeats letters.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {letters.length} letter{letters.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Tap a tile to copy one letter
                  </p>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {letters.map((letter, index) => (
                    <li key={`${bases[index]}-${index}`}>
                      <button
                        type="button"
                        onClick={() => void copyTextToClipboard(letter)}
                        aria-label={`Copy letter ${letter}`}
                        className="inline-flex h-12 min-w-12 items-center justify-center rounded-[0.9rem] border border-line bg-surface px-2.5 font-display text-xl font-semibold text-ink shadow-soft transition-colors hover:border-accent hover:bg-mint/35"
                      >
                        {letter}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 break-all rounded-control border border-line bg-paper/80 px-3 py-2.5 font-mono text-sm text-ink-muted">
                  {formatLetters(letters, settings.separator)}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <aside className="rounded-[1.4rem] border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Pool &amp; filters
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Unique-in-batch and session no-repeat are separate controls.
        </p>
        <div className="mt-4">
          <LetterFiltersPanel
            filters={filters}
            onChange={onFiltersChange}
            usedCount={filters.noRepeatSession ? used.size : 0}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => {
            setUsed(new Set());
            setLetters([]);
            setBases([]);
            setFeedback({
              message: "Session reset",
              tone: "neutral",
            });
          }}
        >
          Reset session
        </Button>
      </aside>
    </div>
  );
}
