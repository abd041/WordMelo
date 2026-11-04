"use client";

import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ResetButton } from "@/components/ui/ResetButton";
import { Button } from "@/components/ui/Button";
import {
  BATCH_SOFT_LIMIT,
  COMPARE_STYLES,
  DEFAULT_BRAND_EXCEPTIONS,
  SAMPLE_TITLES,
  TITLE_STYLES,
  TXT_FILENAME,
  buildHighlightSegments,
  clearExceptionsStorage,
  convertBatch,
  convertTitle,
  countChangedTokens,
  getTitleStyle,
  loadExceptionsFromStorage,
  normalizeException,
  removeException,
  saveExceptionsToStorage,
  upsertException,
  type TitleException,
  type TitleStyleId,
} from "@/lib/tools/title-case";
import {
  countCharactersWithSpaces,
  countWords,
} from "@/lib/tools/word-counter/count";
import { cn, copyTextToClipboard } from "@/lib/utils";

type WorkspaceMode = "single" | "batch";

export function TitleCaseApp() {
  const inputId = useId();
  const resultId = useId();
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<TitleStyleId>("apa7");
  const [workspace, setWorkspace] = useState<WorkspaceMode>("single");
  const [highlight, setHighlight] = useState(true);
  const [preserveAcronyms, setPreserveAcronyms] = useState(true);
  const [exceptions, setExceptions] = useState<TitleException[]>(
    DEFAULT_BRAND_EXCEPTIONS,
  );
  const [persistExceptions, setPersistExceptions] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [exMatch, setExMatch] = useState("");
  const [exSpelling, setExSpelling] = useState("");
  /** Manual refine of the generated result; null means use engine output. */
  const [refinedResult, setRefinedResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  const deferredInput = useDeferredValue(input);
  const options = useMemo(
    () => ({ preserveAcronyms, exceptions }),
    [preserveAcronyms, exceptions],
  );

  const converted = useMemo(
    () => convertTitle(deferredInput, style, options),
    [deferredInput, style, options],
  );

  const batchLines = useMemo(
    () =>
      workspace === "batch"
        ? convertBatch(deferredInput, style, options)
        : [],
    [workspace, deferredInput, style, options],
  );

  const batchLineCount = useMemo(() => {
    if (workspace !== "batch" || !input) return 0;
    return input.split(/\r?\n/).length;
  }, [workspace, input]);

  // Only compute comparisons when the panel is open — major TBT win
  const comparisons = useMemo(() => {
    if (!compareOpen || !deferredInput.trim()) return [];
    return COMPARE_STYLES.map((meta) => ({
      meta,
      output: convertTitle(deferredInput, meta.id, options),
    }));
  }, [compareOpen, deferredInput, options]);

  const uniqueComparisonOutputs = useMemo(() => {
    const set = new Set(comparisons.map((c) => c.output));
    return set.size;
  }, [comparisons]);

  const highlightSegments = useMemo(
    () =>
      highlight && workspace === "single" && refinedResult === null
        ? buildHighlightSegments(deferredInput, converted)
        : [],
    [highlight, workspace, refinedResult, deferredInput, converted],
  );

  const changedCount = useMemo(
    () => countChangedTokens(highlightSegments),
    [highlightSegments],
  );

  const words = countWords(input);
  const chars = countCharactersWithSpaces(input);
  const activeStyle = getTitleStyle(style);
  const pending = deferredInput !== input;

  // Reset manual refine when engine input/style/options change
  useEffect(() => {
    setRefinedResult(null);
  }, [deferredInput, style, options]);

  useEffect(() => {
    const stored = loadExceptionsFromStorage();
    if (stored && stored.length > 0) {
      setExceptions(stored);
      setPersistExceptions(true);
    }
  }, []);

  useEffect(() => {
    if (!persistExceptions) return;
    saveExceptionsToStorage(exceptions);
  }, [exceptions, persistExceptions]);

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  function loadSample(text: string, label: string) {
    setInput(text);
    setRefinedResult(null);
    showFeedback(`Loaded sample: ${label}`, "success");
  }

  function handleClear() {
    setInput("");
    setRefinedResult(null);
    showFeedback("Editor cleared", "neutral");
  }

  function handleAddException() {
    const next = normalizeException(exMatch, exSpelling);
    if (!next) {
      showFeedback("Enter a single-token match and preferred spelling", "error");
      return;
    }
    setExceptions((list) => upsertException(list, next));
    setExMatch("");
    setExSpelling("");
    showFeedback(`Protected spelling added: ${next.spelling}`, "success");
  }

  async function copyText(text: string, label: string) {
    if (!text) {
      showFeedback("Nothing to copy", "neutral");
      return;
    }
    const ok = await copyTextToClipboard(text);
    if (ok) showFeedback(`Copied ${label}`, "success");
    else showFeedback("Could not copy — check clipboard permissions", "error");
  }

  const batchOutputText = batchLines.join("\n");
  const displayResult =
    workspace === "batch"
      ? batchOutputText
      : (refinedResult ?? converted);

  const comparisonExport = comparisons
    .map(({ meta, output }) => `${meta.shortLabel}: ${output}`)
    .join("\n");

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mode + counts */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Workspace mode"
          className="inline-flex rounded-control border border-line bg-surface p-1 shadow-soft"
        >
          {(
            [
              ["single", "Single title"],
              ["batch", "Batch lines"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={workspace === id}
              onClick={() => setWorkspace(id)}
              className={cn(
                "rounded-[0.55rem] px-3 py-1.5 text-sm font-semibold transition-colors",
                workspace === id
                  ? "bg-accent text-accent-foreground"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-soft" aria-live="polite">
          {words.toLocaleString("en-US")} words ·{" "}
          {chars.toLocaleString("en-US")} characters
          {workspace === "batch" && batchLineCount > 0
            ? ` · ${batchLineCount.toLocaleString("en-US")} lines`
            : ""}
          {pending ? " · Updating…" : ""}
        </p>
      </div>

      {/* Writing workspace */}
      <section className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
        <div className="border-b border-line bg-gradient-to-br from-mint/30 via-surface to-paper px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Editorial headline studio
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-ink sm:text-xl">
                {workspace === "batch" ? "Batch title editor" : "Title editor"}
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                {workspace === "batch"
                  ? "One title per line — each converts independently under the selected style."
                  : "Paste a title. Switching styles always re-reads this original input."}
              </p>
            </div>
            <ResetButton onReset={handleClear} disabled={!input} />
          </div>
          {workspace === "single" ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SAMPLE_TITLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample.text, sample.label)}
                  className="rounded-control border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {feedback ? (
          <div className="border-b border-line px-4 py-2.5 sm:px-5">
            <FeedbackMessage
              message={feedback.message}
              tone={feedback.tone}
              onDismiss={() => setFeedback(null)}
            />
          </div>
        ) : null}

        <label htmlFor={inputId} className="sr-only">
          {workspace === "batch"
            ? "Titles to capitalize, one per line"
            : "Title or headline to capitalize"}
        </label>
        <textarea
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            workspace === "batch"
              ? "how to write better headlines\na guide to modern web design\nthe future of online writing tools"
              : "Paste or type a title or headline…"
          }
          spellCheck
          className="min-h-[8.5rem] w-full resize-y bg-transparent px-4 py-3.5 font-sans text-base leading-relaxed text-ink outline-none placeholder:text-ink-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:min-h-[10rem] sm:px-5 sm:text-[1.05rem] sm:leading-7"
        />
        {workspace === "batch" && batchLineCount > BATCH_SOFT_LIMIT ? (
          <p className="border-t border-line px-4 py-2 text-xs text-ink-muted sm:px-5">
            Large batch ({batchLineCount.toLocaleString("en-US")} lines). Results
            still convert locally — keep the tab focused if the UI feels busy.
          </p>
        ) : null}
      </section>

      {/* Compact style selector — kept short so result stays nearby */}
      <section
        aria-labelledby="style-heading"
        className="rounded-[1.35rem] border border-line bg-surface p-3.5 shadow-soft sm:p-4"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Editorial style
            </p>
            <h2
              id="style-heading"
              className="font-display text-base font-semibold text-ink sm:text-lg"
            >
              Capitalization mode
            </h2>
          </div>
          <p className="text-xs text-ink-soft sm:max-w-xs sm:text-right">
            Separate rule profiles — not one shared small-word list.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Title capitalization style"
          className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6"
        >
          {TITLE_STYLES.map((meta) => {
            const selected = style === meta.id;
            return (
              <button
                key={meta.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-describedby={`style-desc-${meta.id}`}
                onClick={() => setStyle(meta.id)}
                className={cn(
                  "rounded-control border px-2.5 py-2 text-left transition-colors",
                  selected
                    ? "border-accent bg-accent-soft text-accent shadow-soft"
                    : "border-line bg-paper text-ink hover:border-line-strong",
                )}
              >
                <span className="block text-sm font-semibold leading-tight">
                  {meta.shortLabel}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[0.65rem] leading-snug",
                    selected ? "text-accent/85" : "text-ink-soft",
                  )}
                >
                  {meta.edition.includes("—")
                    ? meta.edition.split("—")[0]?.trim()
                    : meta.edition}
                </span>
              </button>
            );
          })}
        </div>
        <p
          id={`style-desc-${style}`}
          className="mt-2.5 text-sm text-ink-muted"
          aria-live="polite"
        >
          <span className="font-semibold text-ink">{activeStyle.label}</span>
          {" — "}
          {activeStyle.blurb}
          {style === "ap-composition"
            ? " Based on public composition-title summaries; confirm with your Stylebook for publication."
            : ""}
        </p>
      </section>

      {/* Prominent converted result */}
      <section
        aria-labelledby="title-result-heading"
        className="rounded-[1.35rem] border border-accent/20 bg-surface p-4 shadow-soft sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent">
              Converted result · {activeStyle.shortLabel}
            </p>
            <h2
              id="title-result-heading"
              className="mt-0.5 font-display text-lg font-semibold text-ink sm:text-xl"
            >
              {workspace === "batch" ? "Batch output" : "Capitalized title"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              text={displayResult}
              disabled={!displayResult}
              label="Copy result"
              onFeedback={(message, tone) =>
                showFeedback(message, tone ?? "neutral")
              }
            />
            <DownloadButton
              text={displayResult}
              filename={TXT_FILENAME}
              disabled={!displayResult}
              onFeedback={(message, tone) =>
                showFeedback(message, tone ?? "neutral")
              }
            />
            {workspace === "single" && converted ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput(converted);
                  setRefinedResult(null);
                  showFeedback(
                    "Result placed in editor — prefer switching styles from the original wording",
                    "neutral",
                  );
                }}
              >
                Use as input
              </Button>
            ) : null}
          </div>
        </div>

        {workspace === "single" ? (
          <div className="mt-4">
            {refinedResult !== null ? (
              <>
                <label htmlFor={resultId} className="sr-only">
                  Editable converted title
                </label>
                <textarea
                  id={resultId}
                  value={displayResult}
                  onChange={(e) => setRefinedResult(e.target.value)}
                  placeholder="Your capitalized title will appear here."
                  spellCheck
                  className="min-h-[5.5rem] w-full resize-y rounded-[1.1rem] border border-accent/15 bg-mint/25 px-4 py-4 font-sans text-lg leading-relaxed text-ink outline-none placeholder:text-ink-soft focus-visible:ring-2 focus-visible:ring-accent/40 sm:text-xl sm:leading-8"
                  aria-describedby="result-hint"
                />
              </>
            ) : highlight && highlightSegments.length > 0 && input ? (
              <p
                className="rounded-[1.1rem] border border-accent/15 bg-mint/25 px-4 py-4 font-sans text-lg leading-relaxed text-ink sm:text-xl sm:leading-8"
                aria-label="Converted title with capitalization changes highlighted"
              >
                {highlightSegments.map((seg, i) =>
                  seg.changed ? (
                    <mark
                      key={`${i}-${seg.text}`}
                      className="rounded-sm bg-accent-soft px-0.5 font-semibold text-accent underline decoration-accent/40 decoration-2 underline-offset-2"
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={`${i}-${seg.text}`}>{seg.text}</span>
                  ),
                )}
              </p>
            ) : (
              <p className="rounded-[1.1rem] border border-accent/15 bg-mint/25 px-4 py-4 font-sans text-lg leading-relaxed text-ink sm:text-xl sm:leading-8">
                {converted || (
                  <span className="text-ink-soft">
                    Your capitalized title will appear here.
                  </span>
                )}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
              <p id="result-hint">
                {refinedResult !== null
                  ? "Manual edit active — copy uses your refined text."
                  : changedCount > 0
                    ? `${changedCount} token${changedCount === 1 ? "" : "s"} changed capitalization. Highlights are visual only and are not copied.`
                    : input.trim()
                      ? "No capitalization changes for this style, or text already matched."
                      : "Enter a title above to convert."}
              </p>
              {converted ? (
                refinedResult !== null ? (
                  <button
                    type="button"
                    className="font-semibold text-accent underline-offset-2 hover:underline"
                    onClick={() => setRefinedResult(null)}
                  >
                    Reset to generated result
                  </button>
                ) : (
                  <button
                    type="button"
                    className="font-semibold text-accent underline-offset-2 hover:underline"
                    onClick={() => setRefinedResult(converted)}
                  >
                    Refine manually
                  </button>
                )
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="mt-4 max-h-[22rem] space-y-2 overflow-y-auto">
            {batchLines.length === 0 ? (
              <li className="text-sm text-ink-soft">
                Enter one title per line to convert a batch.
              </li>
            ) : (
              batchLines.map((line, index) => (
                <li
                  key={`batch-${index}`}
                  className="flex flex-col gap-2 rounded-control border border-line bg-paper px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-sans text-sm text-ink sm:text-base">
                    {line || (
                      <span className="text-ink-soft">(blank line)</span>
                    )}
                  </p>
                  {line ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void copyText(line, `line ${index + 1}`)}
                    >
                      Copy
                    </Button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-ink-muted">
            <input
              type="checkbox"
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
              disabled={workspace === "batch" || refinedResult !== null}
              className="rounded border-line"
            />
            Highlight changes
          </label>
          <label className="inline-flex items-center gap-2 text-ink-muted">
            <input
              type="checkbox"
              checked={preserveAcronyms}
              onChange={(e) => setPreserveAcronyms(e.target.checked)}
              className="rounded border-line"
            />
            Preserve acronyms
          </label>
        </div>
      </section>

      {/* Side-by-side comparison — deferred until opened */}
      <section className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5"
          aria-expanded={compareOpen}
          onClick={() => setCompareOpen((o) => !o)}
        >
          <div>
            <h2
              id="compare-heading"
              className="font-display text-lg font-semibold text-ink"
            >
              Side-by-side style comparison
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              APA, MLA, Chicago 18, and AP composition titles from one original
            </p>
          </div>
          <span aria-hidden className="text-lg text-ink-muted">
            {compareOpen ? "−" : "+"}
          </span>
        </button>
        {compareOpen ? (
          <div className="border-t border-line px-4 py-4 sm:px-5">
            {comparisons.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Enter a title to compare editorial outputs.
              </p>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-ink-muted">
                    {uniqueComparisonOutputs === 1
                      ? "All compared styles produce the same result for this title."
                      : `${uniqueComparisonOutputs} distinct outputs across ${comparisons.length} styles.`}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!comparisonExport}
                    onClick={() =>
                      void copyText(comparisonExport, "all comparisons")
                    }
                  >
                    Copy all
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {comparisons.map(({ meta, output }) => (
                    <article
                      key={meta.id}
                      className={cn(
                        "rounded-[1.15rem] border p-4",
                        meta.id === style
                          ? "border-accent/40 bg-mint/20"
                          : "border-line bg-paper",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-sans text-sm font-semibold text-ink">
                            {meta.label}
                          </h3>
                          <p className="text-xs text-ink-soft">{meta.edition}</p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!output}
                          onClick={() =>
                            void copyText(output, meta.shortLabel)
                          }
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="mt-3 font-sans text-base leading-relaxed text-ink">
                        {output || "—"}
                      </p>
                      <p className="mt-2 text-xs text-ink-soft">{meta.blurb}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      {/* Protected spellings */}
      <section className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((o) => !o)}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Protected spellings & settings
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Brands, acronyms, and optional browser-local exceptions
            </p>
          </div>
          <span aria-hidden className="text-lg text-ink-muted">
            {settingsOpen ? "−" : "+"}
          </span>
        </button>
        {settingsOpen ? (
          <div className="space-y-4 border-t border-line px-4 py-4 sm:px-5">
            <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={persistExceptions}
                onChange={(e) => {
                  const on = e.target.checked;
                  setPersistExceptions(on);
                  if (on) saveExceptionsToStorage(exceptions);
                  else clearExceptionsStorage();
                }}
                className="rounded border-line"
              />
              Remember protected spellings in this browser (not your titles)
            </label>

            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={exMatch}
                onChange={(e) => setExMatch(e.target.value)}
                placeholder="Match (e.g. iphone)"
                aria-label="Exception match token"
                className="rounded-control border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                type="text"
                value={exSpelling}
                onChange={(e) => setExSpelling(e.target.value)}
                placeholder="Spelling (e.g. iPhone)"
                aria-label="Preferred spelling"
                className="rounded-control border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <Button type="button" size="sm" onClick={handleAddException}>
                Add
              </Button>
            </div>

            <ul className="flex flex-wrap gap-2">
              {exceptions.map((ex) => (
                <li key={ex.match}>
                  <button
                    type="button"
                    onClick={() =>
                      setExceptions((list) => removeException(list, ex.match))
                    }
                    className="rounded-control border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:border-danger/40 hover:text-danger"
                    title="Remove exception"
                  >
                    {ex.match} → {ex.spelling} ×
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setExceptions(DEFAULT_BRAND_EXCEPTIONS);
                clearExceptionsStorage();
                setPersistExceptions(false);
                showFeedback("Protected spellings reset", "neutral");
              }}
            >
              Reset exceptions to defaults
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
