"use client";

import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Copy,
  Heart,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { FancyTextDecorations } from "@/components/tools/fancy-text/FancyTextDecorations";
import { FancyTextPreview } from "@/components/tools/fancy-text/FancyTextPreview";
import { FancyTextReversePanel } from "@/components/tools/fancy-text/FancyTextReversePanel";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  FANCY_STYLE_CATEGORIES,
  FANCY_STYLES,
  FEATURED_STYLE_IDS,
  type FancySortMode,
  filterFancyResults,
  generateAllFancyStyles,
  sortFancyResults,
  type FancyCategoryFilter,
} from "@/lib/tools/fancy-text";
import {
  pushRecentCopiedStyleId,
  readFavoriteStyleIds,
  readRecentCopiedStyleIds,
  toggleFavoriteStyleId,
  writeFavoriteStyleIds,
  writeRecentCopiedStyleIds,
} from "@/lib/tools/fancy-text/favorites";
import { cn, copyTextToClipboard } from "@/lib/utils";

const DEFAULT_SAMPLE = "Make your words stand out";

const EXAMPLE_PRESETS = [
  { id: "default", label: "Demo", value: DEFAULT_SAMPLE },
  { id: "name", label: "Name", value: "Alex Rivera" },
  { id: "bio", label: "Bio", value: "Creator · coffee · late nights" },
  {
    id: "caption",
    label: "Caption",
    value: "New drop — link in bio",
  },
] as const;

const INITIAL_VISIBLE = FEATURED_STYLE_IDS.length;

const MAX_COMPARE = 3;

export function FancyTextGeneratorApp() {
  const editorId = useId();
  const searchId = useId();
  const sortId = useId();
  const studioRef = useRef<HTMLElement>(null);
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FancyCategoryFilter>("all");
  const [sortMode, setSortMode] = useState<FancySortMode>("featured");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentCopied, setRecentCopied] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  const deferredText = useDeferredValue(text);

  useEffect(() => {
    setFavorites(readFavoriteStyleIds());
    setRecentCopied(readRecentCopiedStyleIds());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    writeFavoriteStyleIds(favorites);
  }, [favorites, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    writeRecentCopiedStyleIds(recentCopied);
  }, [recentCopied, storageReady]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [query, category, sortMode]);

  useEffect(() => {
    if (!manualCopy) return;
    const field = manualCopyRef.current;
    if (!field) return;
    field.focus();
    field.select();
  }, [manualCopy]);

  const results = useMemo(
    () => generateAllFancyStyles(deferredText),
    [deferredText],
  );

  const filtered = useMemo(
    () =>
      filterFancyResults(results, {
        query,
        category,
        favoriteIds: favorites,
        recentIds: recentCopied,
      }),
    [results, query, category, favorites, recentCopied],
  );

  const ordered = useMemo(() => {
    let list = sortFancyResults(
      filtered,
      category === "recent" ? "recent" : sortMode,
      recentCopied,
    );
    if (category === "all" && sortMode === "featured" && favorites.length > 0) {
      const favSet = new Set(favorites);
      const favs = list.filter((r) => favSet.has(r.style.id));
      const rest = list.filter((r) => !favSet.has(r.style.id));
      list = [...favs, ...rest];
    }
    return list;
  }, [filtered, sortMode, recentCopied, category, favorites]);

  const visible = ordered.slice(0, visibleCount);
  const hasMore = ordered.length > visibleCount;
  const isEmptyInput = deferredText.length === 0;

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  async function handleCopy(styleId: string, output: string, styleName: string) {
    if (!output) {
      showFeedback("Enter text to copy a style", "neutral");
      return;
    }
    const ok = await copyTextToClipboard(output);
    if (ok) {
      setManualCopy(null);
      setCopiedId(styleId);
      setRecentCopied((current) => pushRecentCopiedStyleId(current, styleId));
      showFeedback(`Copied “${styleName}”`, "success");
      window.setTimeout(() => {
        setCopiedId((current) => (current === styleId ? null : current));
      }, 1800);
    } else {
      setCopiedId(null);
      setManualCopy(output);
      showFeedback(
        "Automatic copy was blocked. The text below is selected so you can copy it yourself.",
        "error",
      );
    }
  }

  function toggleCompare(styleId: string) {
    setCompareIds((current) => {
      if (current.includes(styleId)) {
        return current.filter((id) => id !== styleId);
      }
      if (current.length >= MAX_COMPARE) {
        showFeedback("Compare up to 3 styles. Remove one to add another.", "neutral");
        return current;
      }
      return [...current, styleId];
    });
  }

  function handleToggleFavorite(styleId: string) {
    setFavorites((current) => {
      const next = toggleFavoriteStyleId(current, styleId);
      const added = next.length > current.length;
      showFeedback(
        added ? "Saved to favorites" : "Removed from favorites",
        "neutral",
      );
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setSortMode("featured");
  }

  const filterChips: { id: FancyCategoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "favorites", label: "Favorites" },
    { id: "recent", label: "Recent" },
    ...FANCY_STYLE_CATEGORIES.map((item) => ({
      id: item.id,
      label: item.label,
    })),
  ];

  const compared = compareIds
    .map((id) => results.find((result) => result.style.id === id))
    .filter((result): result is (typeof results)[number] => Boolean(result));

  const lineCount = Math.max(1, text.split("\n").length);
  const textareaRows = Math.min(6, Math.max(2, lineCount));

  return (
    <div className="space-y-6 sm:space-y-7">
      <section
        ref={studioRef}
        id="style-studio"
        aria-labelledby="fancy-workspace-heading"
        className="scroll-mt-24 overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-soft"
      >
        <div className="flex flex-col gap-3 border-b border-line bg-mint/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h2
              id="fancy-workspace-heading"
              className="font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              Create Fancy Text in Seconds
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {`${FANCY_STYLES.length} Unicode styles · updates as you type`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={text === preset.value ? "primary" : "secondary"}
                size="sm"
                className="min-h-11"
                onClick={() => {
                  setText(preset.value);
                  showFeedback(`${preset.label} example loaded`, "success");
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              disabled={!text}
              onClick={() => {
                setText("");
                showFeedback("Editor cleared", "neutral");
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <label
          htmlFor={editorId}
          className="block px-4 pt-3 text-sm font-medium text-ink sm:px-5"
        >
          Your text
        </label>
        <textarea
          id={editorId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a name, bio, or caption…"
          spellCheck
          rows={textareaRows}
          className="max-h-[16rem] min-h-[4.5rem] w-full resize-y bg-transparent px-4 py-3.5 font-serif text-[1.08rem] leading-7 text-ink placeholder:text-ink-soft sm:px-5 sm:text-lg sm:leading-8"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-mint/30 px-4 py-2.5 sm:px-5">
          <p className="text-sm text-ink-muted">
            <span aria-live="polite">
              <span className="font-medium tabular-nums text-ink">
                {text.length.toLocaleString("en-US")}
              </span>{" "}
              characters
            </span>
            <span className="text-ink-soft"> · Unicode text, not an installed font</span>
          </p>
          <div className="min-h-[1.75rem] flex-1">
            <FeedbackMessage
              message={feedback?.message ?? null}
              tone={feedback?.tone}
              onDismiss={() => setFeedback(null)}
            />
          </div>
        </div>
        {manualCopy ? (
          <div className="border-t border-line px-4 py-3 sm:px-5">
            <p id="fancy-manual-copy-label" role="status" className="text-sm text-danger">
              Automatic copy was blocked. This is the exact output — select it
              and copy manually.
            </p>
            <textarea
              ref={manualCopyRef}
              readOnly
              aria-labelledby="fancy-manual-copy-label"
              value={manualCopy}
              rows={3}
              className="mt-2 min-h-11 w-full resize-y rounded-control border border-line bg-paper px-3 py-2 text-base text-ink"
            />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="fancy-results-heading" className="space-y-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="fancy-results-heading"
              className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]"
            >
              Explore Fancy Text Styles
            </h2>
            <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
              {isEmptyInput
                ? "Enter text to preview styles"
                : `${ordered.length} of ${FANCY_STYLES.length} styles`}
              {query.trim() ? ` · matching “${query.trim()}”` : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-56 lg:w-64">
              <label htmlFor={searchId} className="sr-only">
                Search fancy text styles
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bold, cursive, gothic, Instagram…"
                className="h-11 w-full rounded-control border border-line bg-surface pl-10 pr-11 text-sm text-ink placeholder:text-ink-soft"
              />
              {query ? (
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-control text-ink-soft hover:bg-surface-sunken hover:text-ink"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="sr-only">
                Sort styles
              </label>
              <select
                id={sortId}
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as FancySortMode)
                }
                className="h-11 rounded-control border border-line bg-surface px-3 text-sm text-ink"
              >
                <option value="featured">Featured first</option>
                <option value="alphabetical">A–Z</option>
                <option value="recent">Recently copied</option>
              </select>
              {(query || category !== "all" || sortMode !== "featured") && (
                <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={clearFilters}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="toolbar"
          aria-label="Style categories"
        >
          {filterChips.map((chip) => {
            const count =
              chip.id === "favorites"
                ? favorites.length
                : chip.id === "recent"
                  ? recentCopied.length
                  : null;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategory(chip.id)}
                aria-pressed={category === chip.id}
                className={cn(
                  "min-h-11 shrink-0 rounded-control border px-3 text-sm font-medium transition-colors duration-200",
                  category === chip.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-sunken hover:text-ink",
                )}
              >
                {chip.label}
                {count !== null ? (
                  <span className="ml-1.5 tabular-nums opacity-80">
                    ({count})
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="sr-only">
          Each preview is a Unicode version of your text: {deferredText}
        </p>
        <div className="space-y-3">
          {compared.length > 0 && !isEmptyInput ? (
            <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-sans text-sm font-semibold text-ink">
                  Comparing {compared.length} of {MAX_COMPARE} styles
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11"
                  onClick={() => setCompareIds([])}
                >
                  Clear comparison
                </Button>
              </div>
              <ul className="mt-3 grid gap-3 lg:grid-cols-3">
                {compared.map((result) => (
                  <li
                    key={result.style.id}
                    className="rounded-control border border-line bg-paper p-3"
                  >
                    <p className="text-sm font-semibold text-ink">{result.style.name}</p>
                    <p className="mt-2 max-h-28 overflow-auto break-words text-lg leading-7 text-ink [overflow-wrap:anywhere]">
                      {result.output}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 min-h-11"
                      onClick={() =>
                        handleCopy(result.style.id, result.output, result.style.name)
                      }
                    >
                      Copy
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {isEmptyInput ? (
            <div className="rounded-card border border-dashed border-line bg-mint/40 px-5 py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-accent" aria-hidden />
              <p className="mt-3 font-medium text-ink">
                Your styles will appear here
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Type above, or load a Name / Bio / Caption example.
              </p>
              <Button
                type="button"
                className="mt-4"
                size="sm"
                onClick={() => setText(DEFAULT_SAMPLE)}
              >
                Load demo text
              </Button>
            </div>
          ) : ordered.length === 0 ? (
            <div className="rounded-card border border-line bg-surface px-5 py-8 text-center">
              <p className="font-medium text-ink">No styles match</p>
              <p className="mt-1 text-sm text-ink-muted">
                {category === "favorites"
                  ? "Heart a style to save it on this device."
                  : category === "recent"
                    ? "Copy a style to build your recent list."
                    : "Try another category or clear search."}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {visible.map(({ style, output }, index) => {
                const isFav = favorites.includes(style.id);
                const isCopied = copiedId === style.id;
                const accentSurface = index % 2 === 1;
                return (
                  <li key={style.id}>
                    <article
                      className={cn(
                        "group flex h-full flex-col rounded-card border p-3.5 transition-[border-color,box-shadow] duration-200 sm:p-4",
                        accentSurface
                          ? "border-line bg-mint/35 hover:border-accent/25"
                          : "border-line bg-surface shadow-soft hover:border-accent/25 hover:shadow-lift",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-sans text-sm font-semibold text-ink">
                            {style.name}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                            {style.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(style.id)}
                          aria-label={
                            isFav
                              ? `Remove ${style.name} from favorites`
                              : `Save ${style.name} to favorites`
                          }
                          aria-pressed={isFav}
                          className={cn(
                            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border transition-colors duration-200",
                            isFav
                              ? "border-accent/30 bg-accent-soft text-accent"
                              : "border-line bg-surface text-ink-soft hover:bg-surface-sunken hover:text-ink",
                          )}
                        >
                          <Heart
                            className={cn("h-4 w-4", isFav && "fill-current")}
                            aria-hidden
                          />
                        </button>
                      </div>

                      <p
                        className="mt-3 max-h-36 min-h-12 overflow-auto break-words text-[1.2rem] leading-8 tracking-wide text-ink [overflow-wrap:anywhere] sm:text-[1.35rem] sm:leading-9"
                        lang="en"
                      >
                        <span className="sr-only">
                          {style.name} preview:{" "}
                        </span>
                        {output}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant={isCopied ? "secondary" : "primary"}
                          size="sm"
                          className="min-h-11 flex-1 sm:flex-none sm:min-w-[7.5rem]"
                          onClick={() =>
                            handleCopy(style.id, output, style.name)
                          }
                          aria-label={
                            isCopied
                              ? `${style.name} copied`
                              : `Copy ${style.name} style`
                          }
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4" aria-hidden />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden />
                          )}
                          {isCopied ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          type="button"
                          variant={compareIds.includes(style.id) ? "primary" : "secondary"}
                          size="sm"
                          className="min-h-11"
                          aria-pressed={compareIds.includes(style.id)}
                          onClick={() => toggleCompare(style.id)}
                        >
                          {compareIds.includes(style.id) ? "Compared" : "Compare"}
                        </Button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && !isEmptyInput ? (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setVisibleCount(ordered.length)}
              >
                {ordered.length === FANCY_STYLES.length
                  ? `Show all ${FANCY_STYLES.length} styles`
                  : `Show all ${ordered.length} matching styles`}
              </Button>
            </div>
          ) : null}

          {!isEmptyInput && ordered.length > 0 && !hasMore ? (
            <p className="text-center text-sm text-ink-soft">
              Showing all {ordered.length} matching styles
            </p>
          ) : null}
        </div>
      </section>

      <FancyTextPreview
        text={deferredText}
        onCopied={(label) => {
          setManualCopy(null);
          showFeedback(`Copied “${label}”`, "success");
        }}
        onCopyFailed={(output) => {
          setManualCopy(output);
          showFeedback(
            "Automatic copy was blocked. The text below is selected so you can copy it yourself.",
            "error",
          );
        }}
      />

      <FancyTextDecorations
        text={text}
        onCopied={(label) => {
          setManualCopy(null);
          showFeedback(`Copied “${label}”`, "success");
        }}
        onCopyFailed={(output) => {
          setManualCopy(output);
          showFeedback(
            "Automatic copy was blocked. The text below is selected so you can copy it yourself.",
            "error",
          );
        }}
      />

      <FancyTextReversePanel />

      <p className="text-center text-sm text-ink-muted">
        <a
          href="#style-studio"
          className="font-medium text-accent underline-offset-2 hover:underline"
          onClick={(event) => {
            event.preventDefault();
            const reduceMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            studioRef.current?.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "start",
            });
            document.getElementById(editorId)?.focus();
          }}
        >
          Back to editor
        </a>
      </p>
    </div>
  );
}
