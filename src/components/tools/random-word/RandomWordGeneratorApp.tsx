"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Eraser,
  Heart,
  History,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  DEFAULT_FILTERS,
  EXACT_LENGTH_HINTS,
  MAX_WORD_COUNT,
  MIN_WORD_COUNT,
  QUICK_COUNTS,
  TXT_FILENAME,
  WORD_PRESETS,
  applyPreset,
  clampCount,
  clearHistory,
  generateWords,
  loadFavorites,
  loadHistory,
  loadVocabulary,
  normalizeLetter,
  pushHistory,
  toggleFavorite,
  validateLengthFilters,
  type GenerateResult,
  type HistoryRound,
  type VocabEntry,
  type WordFilters,
} from "@/lib/tools/random-word";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

type CopySep = "newline" | "comma";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const controlClass =
  "h-11 rounded-control border border-line bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

const chipClass = (active: boolean) =>
  cn(
    "inline-flex h-10 items-center justify-center rounded-control border px-3 text-sm font-medium transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-line bg-paper text-ink hover:border-line-strong hover:bg-mint/40",
  );

export function RandomWordGeneratorApp() {
  const formId = useId();
  const [filters, setFilters] = useState<WordFilters>(DEFAULT_FILTERS);
  const [entries, setEntries] = useState<VocabEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [usedWords, setUsedWords] = useState<Set<string>>(() => new Set());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRound[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedFavorites, setCopiedFavorites] = useState(false);
  const [copySep, setCopySep] = useState<CopySep>("newline");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const didAutoGenerate = useRef(false);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
    setHistory(loadHistory());
    let cancelled = false;
    setLoading(true);
    loadVocabulary()
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setLoadError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(
          "Could not load the vocabulary dataset. Refresh the page and try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showFeedback = useCallback(
    (message: string, tone: "success" | "error" | "neutral" = "neutral") => {
      setFeedback({ message, tone });
    },
    [],
  );

  const announce = useCallback((message: string) => {
    if (liveRef.current) liveRef.current.textContent = message;
  }, []);

  const runGenerate = useCallback(
    (nextFilters: WordFilters, mode: "generate" | "regenerate") => {
      if (!entries) return;
      const validation = validateLengthFilters(nextFilters);
      if (validation) {
        showFeedback(validation, "error");
        return;
      }

      const used =
        nextFilters.noRepeat && mode === "regenerate" ? usedWords : undefined;
      const generated = generateWords(entries, nextFilters, {
        usedWords: used,
      });

      setResult(generated);

      if (generated.words.length > 0) {
        setUsedWords((prev) => {
          const next = new Set(mode === "generate" ? [] : prev);
          for (const w of generated.words) next.add(w);
          return next;
        });
        setHistory((prev) => pushHistory(generated.words, prev));
        const msg =
          generated.message ??
          `Generated ${generated.words.length} word${generated.words.length === 1 ? "" : "s"}.`;
        showFeedback(msg, generated.exhausted ? "neutral" : "success");
        announce(msg);
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        const msg = generated.message ?? "No words match these filters.";
        showFeedback(msg, "neutral");
        announce(msg);
      }
    },
    [announce, entries, showFeedback, usedWords],
  );

  useEffect(() => {
    if (!entries || didAutoGenerate.current) return;
    didAutoGenerate.current = true;
    runGenerate(DEFAULT_FILTERS, "generate");
  }, [entries, runGenerate]);

  function updateFilter<K extends keyof WordFilters>(
    key: K,
    value: WordFilters[K],
  ) {
    setActivePreset(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handlePreset(id: string) {
    const next = applyPreset(id, filters);
    setFilters(next);
    setActivePreset(id);
    if (id === "vocabulary-practice" || id === "easy-words" || id === "creative-writing") {
      setAdvancedOpen(true);
    }
    if (entries) runGenerate(next, "generate");
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setActivePreset(null);
    setUsedWords(new Set());
    setResult(null);
    showFeedback("Filters reset", "neutral");
    if (entries) {
      window.setTimeout(() => runGenerate(DEFAULT_FILTERS, "generate"), 0);
    }
  }

  function handleClearResults() {
    setResult(null);
    showFeedback("Results cleared", "neutral");
  }

  function handleClearSession() {
    setUsedWords(new Set());
    setHistory(clearHistory());
    showFeedback("Session history cleared", "neutral");
  }

  function handleReuseRound(words: string[]) {
    setResult({
      words,
      poolSize: words.length,
      requested: words.length,
      exhausted: false,
      message: "Restored a previous round.",
    });
    showFeedback("Restored previous round", "success");
    setHistoryOpen(false);
  }

  async function handleCopyWord(word: string) {
    const ok = await copyTextToClipboard(word);
    if (ok) {
      setCopiedWord(word);
      showFeedback(`Copied “${word}”`, "success");
      window.setTimeout(() => {
        setCopiedWord((current) => (current === word ? null : current));
      }, 1600);
    } else {
      showFeedback("Could not copy — check clipboard permissions", "error");
    }
  }

  async function handleCopyAll() {
    if (!result?.words.length) {
      showFeedback("Nothing to copy", "neutral");
      return;
    }
    const text =
      copySep === "comma" ? result.words.join(", ") : result.words.join("\n");
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedAll(true);
      showFeedback(
        copySep === "comma"
          ? "Copied as comma-separated list"
          : "Copied all words (one per line)",
        "success",
      );
      window.setTimeout(() => setCopiedAll(false), 1600);
    } else {
      showFeedback("Could not copy — check clipboard permissions", "error");
    }
  }

  async function handleCopyFavorites() {
    if (!favorites.length) return;
    const ok = await copyTextToClipboard(favorites.join("\n"));
    if (ok) {
      setCopiedFavorites(true);
      showFeedback("Copied favorites", "success");
      window.setTimeout(() => setCopiedFavorites(false), 1600);
    } else {
      showFeedback("Could not copy — check clipboard permissions", "error");
    }
  }

  function handleDownload() {
    if (!result?.words.length) {
      showFeedback("Nothing to download", "neutral");
      return;
    }
    downloadTextFile(TXT_FILENAME, `${result.words.join("\n")}\n`);
    showFeedback(`Downloaded ${TXT_FILENAME}`, "success");
  }

  function handleFavorite(word: string) {
    setFavorites((prev) => {
      const next = toggleFavorite(word, prev);
      if (next.length > 0) setFavoritesOpen(true);
      return next;
    });
  }

  const busy = !entries || loading;

  return (
    <div className="space-y-5 sm:space-y-6">
      <p ref={liveRef} className="sr-only" aria-live="polite" />

      {feedback ? (
        <FeedbackMessage
          message={feedback.message}
          tone={feedback.tone}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {loadError ? (
        <div
          role="alert"
          className="rounded-[1.15rem] border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-ink"
        >
          {loadError}
        </div>
      ) : null}

      {/* Presets */}
      <section
        aria-labelledby={`${formId}-presets`}
        className="rounded-[1.25rem] border border-line bg-surface px-4 py-4 shadow-soft sm:px-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id={`${formId}-presets`}
              className="font-display text-lg font-semibold text-ink sm:text-xl"
            >
              Presets
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Apply real filter values you can edit afterward.
            </p>
          </div>
        </div>
        <div
          role="group"
          aria-label="Word generation presets"
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible"
        >
          {WORD_PRESETS.map((preset) => {
            const selected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset.id)}
                disabled={busy}
                title={preset.description}
                className={cn(
                  "shrink-0 rounded-control border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-foreground shadow-soft"
                    : "border-line bg-paper text-ink hover:border-line-strong hover:bg-mint/45",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-6">
        {/* Filters — second on mobile so results stay visible after generate */}
        <section
          aria-labelledby={`${formId}-filters`}
          className="order-2 rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft sm:p-5 lg:order-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={`${formId}-filters`}
                className="font-display text-lg font-semibold text-ink sm:text-xl"
              >
                Filters
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Essential controls first — open Advanced for more.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor={`${formId}-count`}
                className="block text-sm font-semibold text-ink"
              >
                Number of words
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  id={`${formId}-count`}
                  type="number"
                  min={MIN_WORD_COUNT}
                  max={MAX_WORD_COUNT}
                  step={1}
                  value={filters.count}
                  onChange={(e) =>
                    updateFilter("count", clampCount(Number(e.target.value)))
                  }
                  className={cn(controlClass, "w-[5.5rem]")}
                />
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateFilter("count", n)}
                      className={chipClass(filters.count === n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Word type</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ["all", "All"],
                    ["noun", "Nouns"],
                    ["verb", "Verbs"],
                    ["adjective", "Adjectives"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={cn(chipClass(filters.wordType === value), "cursor-pointer")}>
                    <input
                      type="radio"
                      name={`${formId}-type`}
                      className="sr-only"
                      checked={filters.wordType === value}
                      onChange={() => updateFilter("wordType", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">Word length</legend>
              <p className="mt-1 text-xs text-ink-soft">
                Letter count only — examples: 5 for five-letter words, 4–8 for a range.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["any", "Any"],
                    ["exact", "Exact"],
                    ["range", "Min–max"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={cn(chipClass(filters.lengthMode === value), "cursor-pointer")}>
                    <input
                      type="radio"
                      name={`${formId}-length`}
                      className="sr-only"
                      checked={filters.lengthMode === value}
                      onChange={() => updateFilter("lengthMode", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {filters.lengthMode === "exact" ? (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`${formId}-exact`} className="text-sm text-ink-muted">
                      Exact
                    </label>
                    <input
                      id={`${formId}-exact`}
                      type="number"
                      min={3}
                      max={14}
                      value={filters.exactLength}
                      onChange={(e) =>
                        updateFilter(
                          "exactLength",
                          Math.min(14, Math.max(3, Math.floor(Number(e.target.value) || 3))),
                        )
                      }
                      className={cn(controlClass, "w-24")}
                    />
                    <span className="text-sm text-ink-muted">letters</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {EXACT_LENGTH_HINTS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateFilter("exactLength", n)}
                        className={chipClass(filters.exactLength === n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {filters.lengthMode === "range" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label htmlFor={`${formId}-min`} className="text-sm text-ink-muted">
                    Min
                  </label>
                  <input
                    id={`${formId}-min`}
                    type="number"
                    min={3}
                    max={14}
                    value={filters.minLength}
                    onChange={(e) =>
                      updateFilter(
                        "minLength",
                        Math.min(14, Math.max(3, Math.floor(Number(e.target.value) || 3))),
                      )
                    }
                    className={cn(controlClass, "w-20")}
                  />
                  <label htmlFor={`${formId}-max`} className="text-sm text-ink-muted">
                    Max
                  </label>
                  <input
                    id={`${formId}-max`}
                    type="number"
                    min={3}
                    max={14}
                    value={filters.maxLength}
                    onChange={(e) =>
                      updateFilter(
                        "maxLength",
                        Math.min(14, Math.max(3, Math.floor(Number(e.target.value) || 3))),
                      )
                    }
                    className={cn(controlClass, "w-20")}
                  />
                </div>
              ) : null}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["start", "Starts with", "startsWith"] as const,
                  ["end", "Ends with", "endsWith"] as const,
                ]
              ).map(([suffix, label, key]) => (
                <div key={key}>
                  <label
                    htmlFor={`${formId}-${suffix}`}
                    className="block text-sm font-semibold text-ink"
                  >
                    {label}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <select
                      id={`${formId}-${suffix}`}
                      value={filters[key]}
                      onChange={(e) => updateFilter(key, e.target.value)}
                      className={cn(controlClass, "min-w-0 flex-1")}
                    >
                      <option value="">Any letter</option>
                      {LETTERS.map((letter) => (
                        <option key={letter} value={letter}>
                          {letter.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label={`${label} typed letter`}
                      value={filters[key]}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) {
                          updateFilter(key, "");
                          return;
                        }
                        updateFilter(key, normalizeLetter(raw.slice(-1)));
                      }}
                      placeholder="A–Z"
                      className={cn(
                        controlClass,
                        "w-16 uppercase tracking-[0.18em] placeholder:normal-case placeholder:tracking-normal",
                      )}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Optional · case-insensitive A–Z
                  </p>
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-control border border-line bg-paper px-3.5 py-3 text-left text-sm font-semibold text-ink hover:border-line-strong"
                aria-expanded={advancedOpen}
                aria-controls={`${formId}-advanced`}
                onClick={() => setAdvancedOpen((o) => !o)}
              >
                Advanced filters
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-ink-muted transition-transform",
                    advancedOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              <div
                id={`${formId}-advanced`}
                hidden={!advancedOpen}
                className="mt-3 space-y-5 rounded-[1rem] border border-line/80 bg-mint/20 p-3.5 sm:p-4"
              >
                <fieldset>
                  <legend className="text-sm font-semibold text-ink">Difficulty</legend>
                  <p className="mt-1 text-xs text-ink-soft">
                    Approximate bands from Google-10k frequency and word length — not a clinical scale.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        ["all", "All"],
                        ["easy", "Easy"],
                        ["medium", "Medium"],
                        ["hard", "Hard"],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value} className={cn(chipClass(filters.difficulty === value), "cursor-pointer")}>
                        <input
                          type="radio"
                          name={`${formId}-diff`}
                          className="sr-only"
                          checked={filters.difficulty === value}
                          onChange={() => updateFilter("difficulty", value)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-ink">
                    Vocabulary coverage
                  </legend>
                  <p className="mt-1 text-xs text-ink-soft">
                    Common ≈ Google 10k ranks. Extended adds rarer WordNet lemmas. All includes both.
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      [
                        ["common", "Common"],
                        ["extended", "Extended"],
                        ["all", "All words"],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value} className={cn(chipClass(filters.vocabulary === value), "cursor-pointer")}>
                        <input
                          type="radio"
                          name={`${formId}-vocab`}
                          className="sr-only"
                          checked={filters.vocabulary === value}
                          onChange={() => updateFilter("vocabulary", value)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 rounded-control border border-line bg-surface px-3 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-line text-accent focus-visible:ring-accent"
                    checked={filters.noRepeat}
                    onChange={(e) => updateFilter("noRepeat", e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      Skip previous rounds
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                      Each result list never contains duplicate words. When this is on,
                      Regenerate also skips words already used in this browser session
                      until the eligible pool runs out.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-1 shadow-lift"
                disabled={busy}
                onClick={() => runGenerate(filters, "generate")}
              >
                <Shuffle className="h-4 w-4" aria-hidden />
                Generate
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={busy || !result}
                onClick={() => runGenerate(filters, "regenerate")}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Regenerate
              </Button>
            </div>
          </div>
        </section>

        {/* Results — first on mobile */}
        <section
          ref={resultsRef}
          aria-labelledby={`${formId}-results`}
          className="order-1 rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft sm:p-5 lg:order-2 lg:sticky lg:top-24"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id={`${formId}-results`}
                className="font-display text-lg font-semibold text-ink sm:text-xl"
              >
                Results
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {loading
                  ? "Loading vocabulary…"
                  : result
                    ? `${result.words.length} of ${result.requested} requested · pool ${result.poolSize.toLocaleString()}`
                    : "Generate to see words"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(favorites.length > 0 || history.length > 0) && (
                <>
                  {favorites.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFavoritesOpen((o) => !o)}
                      aria-expanded={favoritesOpen}
                    >
                      <Star className="h-4 w-4" aria-hidden />
                      Favorites ({favorites.length})
                    </Button>
                  ) : null}
                  {history.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryOpen((o) => !o)}
                      aria-expanded={historyOpen}
                    >
                      <History className="h-4 w-4" aria-hidden />
                      History
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-line pb-4">
            <div
              role="group"
              aria-label="Copy format"
              className="inline-flex rounded-control border border-line p-0.5"
            >
              <button
                type="button"
                className={cn(
                  "rounded-[0.55rem] px-2.5 py-1.5 text-xs font-semibold",
                  copySep === "newline" ? "bg-accent-soft text-accent" : "text-ink-muted",
                )}
                onClick={() => setCopySep("newline")}
              >
                One per line
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-[0.55rem] px-2.5 py-1.5 text-xs font-semibold",
                  copySep === "comma" ? "bg-accent-soft text-accent" : "text-ink-muted",
                )}
                onClick={() => setCopySep("comma")}
              >
                Comma-separated
              </button>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleCopyAll()}
              disabled={!result?.words.length}
            >
              {copiedAll ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              Copy all
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!result?.words.length}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download TXT
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearResults}
              disabled={!result}
            >
              <Eraser className="h-4 w-4" aria-hidden />
              Clear
            </Button>
          </div>

          {favoritesOpen && favorites.length > 0 ? (
            <div className="mt-4 rounded-[1rem] border border-line bg-mint/25 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">Saved favorites</h3>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopyFavorites()}>
                    {copiedFavorites ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    Copy
                  </Button>
                </div>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {favorites.map((word) => (
                  <li key={word}>
                    <button
                      type="button"
                      onClick={() => handleFavorite(word)}
                      className="inline-flex items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 py-1.5 text-sm text-ink hover:border-line-strong"
                      aria-label={`Remove favorite ${word}`}
                    >
                      {word}
                      <span aria-hidden className="text-ink-soft">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {historyOpen && history.length > 0 ? (
            <div className="mt-4 rounded-[1rem] border border-line bg-paper p-3.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">Recent rounds</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearSession} aria-label="Clear history">
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Clear
                </Button>
              </div>
              <ul className="mt-2 space-y-2">
                {history.slice(0, 8).map((round) => (
                  <li key={round.at}>
                    <button
                      type="button"
                      onClick={() => handleReuseRound(round.words)}
                      className="w-full rounded-control border border-line/80 bg-surface px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      <span className="block text-[0.7rem] font-medium uppercase tracking-wide text-ink-soft">
                        {new Date(round.at).toLocaleString()} · restore
                      </span>
                      <span className="mt-0.5 block">{round.words.join(", ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result?.message && result.words.length === 0 ? (
            <div
              role="status"
              className="mt-6 rounded-[1rem] border border-dashed border-line bg-paper px-4 py-10 text-center"
            >
              <p className="text-base font-semibold text-ink">{result.message}</p>
              <p className="mt-2 text-sm text-ink-muted">
                Widen filters, or clear previous-round exclusions and try again.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                  Reset filters
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearSession}>
                  Reset session exclusions
                </Button>
              </div>
            </div>
          ) : null}

          {result && result.words.length > 0 ? (
            <ol className="mt-5 grid list-none grid-cols-1 gap-2.5 sm:grid-cols-2">
              {result.words.map((word, index) => {
                const favorited = favorites.includes(word);
                const justCopied = copiedWord === word;
                return (
                  <li
                    key={`${word}-${index}`}
                    className="group flex items-center gap-3 rounded-[1rem] border border-line bg-paper px-3.5 py-3.5 transition-colors hover:border-line-strong hover:bg-mint/20"
                  >
                    <span
                      className="w-7 shrink-0 text-sm tabular-nums text-ink-soft"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 break-words font-display text-xl font-semibold tracking-tight text-ink sm:text-[1.35rem]">
                      {word}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-control text-ink-muted hover:bg-mint/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      aria-label={
                        favorited ? `Remove ${word} from favorites` : `Favorite ${word}`
                      }
                      aria-pressed={favorited}
                      onClick={() => handleFavorite(word)}
                    >
                      <Heart
                        className={cn("h-[1.1rem] w-[1.1rem]", favorited && "fill-accent text-accent")}
                        aria-hidden
                      />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-control text-ink-muted hover:bg-mint/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      aria-label={`Copy ${word}`}
                      onClick={() => void handleCopyWord(word)}
                    >
                      {justCopied ? (
                        <Check className="h-[1.1rem] w-[1.1rem] text-accent" aria-hidden />
                      ) : (
                        <Copy className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {!loading && !result ? (
            <p className="mt-10 text-center text-base text-ink-muted">
              Press Generate to pick random English words.
            </p>
          ) : null}

          {usedWords.size > 0 ? (
            <p className="mt-5 text-xs text-ink-soft">
              Session exclusions: {usedWords.size.toLocaleString()} word
              {usedWords.size === 1 ? "" : "s"} used since last Generate.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
