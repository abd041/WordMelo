"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  clipboardFeedback,
  exportFilename,
  markedListText,
  toCsv,
} from "@/lib/tools/alphabetizer/format";
import { countLines, MAX_INPUT_CHARS, splitItems } from "@/lib/tools/alphabetizer/parse";
import { MODE_LABELS, sortList } from "@/lib/tools/alphabetizer/sort";
import type { SortMode, SortResult, SortSettings } from "@/lib/tools/alphabetizer/types";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

const EXAMPLE = `The Great Gatsby
banana
Apple
apple
cherry
file10
file2
file1
John Smith
Alice Brown
David Wilson
-3
10
2.5
not-a-number`;

const DEFAULT_SETTINGS: SortSettings = {
  mode: "az",
  format: "lines",
  ignoreCase: false,
  ignorePunctuation: false,
  ignoreArticles: false,
  trimOutput: false,
  removeEmpty: false,
  removeDuplicates: false,
  numberOutput: false,
};

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50";

const primaryClass =
  "inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

const MODE_GROUPS: Array<{ legend: string; modes: SortMode[] }> = [
  { legend: "Alphabetical", modes: ["az", "za"] },
  { legend: "Numbers and natural", modes: ["numeric-asc", "numeric-desc", "natural-az", "natural-za"] },
  { legend: "Length and names", modes: ["length-asc", "length-desc", "last-name"] },
  { legend: "Reorder", modes: ["reverse", "shuffle"] },
];

export function AlphabetizerApp() {
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<SortSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<SortResult | null>(null);
  const [sortedFrom, setSortedFrom] = useState<{ input: string; settings: SortSettings } | null>(null);
  const [status, setStatus] = useState("Paste a list, then press Sort My List.");
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (!manualCopy) return;
    manualCopyRef.current?.focus();
    manualCopyRef.current?.select();
  }, [manualCopy]);

  const stale =
    result !== null &&
    sortedFrom !== null &&
    (sortedFrom.input !== input || JSON.stringify(sortedFrom.settings) !== JSON.stringify(settings));

  const inputCounts = useMemo(
    () => ({
      characters: input.length,
      lines: countLines(input),
      items: splitItems(input, settings.format).length,
    }),
    [input, settings.format],
  );

  function updateSetting<Key extends keyof SortSettings>(key: Key, value: SortSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function runSort() {
    const next = sortList(input, settings);
    setResult(next);
    setSortedFrom({ input, settings });
    setManualCopy(null);
    setStatus(
      next.truncated
        ? "Sort ready. This is a partial result because the list exceeded the character limit."
        : `${MODE_LABELS[settings.mode]} ready.`,
    );
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setStatus("Pasted from the clipboard.");
      inputRef.current?.focus();
    } catch {
      setStatus("Paste failed. Use your keyboard shortcut to paste into Your List.");
      inputRef.current?.focus();
    }
  }

  async function copyInput() {
    const copied = await copyTextToClipboard(input);
    if (copied) {
      setStatus("Original list copied.");
      setManualCopy(null);
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.select();
    setStatus("Copy failed. Your List is selected so you can copy it manually.");
  }

  async function copyResult() {
    if (!result || stale) return;
    const payload = markedListText(result);
    const feedback = clipboardFeedback(await copyTextToClipboard(payload), result.truncated);
    setStatus(feedback.message);
    setManualCopy(feedback.failed ? payload : null);
  }

  function download(kind: "txt" | "csv") {
    if (!result || stale) return;
    try {
      const filename = exportFilename(kind, result.truncated);
      if (kind === "txt") downloadTextFile(filename, `${markedListText(result)}\n`);
      else downloadTextFile(filename, toCsv(result.items, { partial: result.truncated }), "text/csv;charset=utf-8");
      setStatus(
        result.truncated ? "Partial sorted list downloaded." : "Sorted list downloaded.",
      );
      setManualCopy(null);
    } catch {
      setStatus("The download could not be started in this browser.");
    }
  }

  const primaryLabel =
    settings.mode === "shuffle"
      ? result && !stale
        ? "Regenerate Shuffle"
        : "Shuffle My List"
      : "Sort My List";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <section className="surface-card flex h-full flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-ink">Your List</h2>
            <p className="text-sm text-ink-muted">
              {inputCounts.characters.toLocaleString("en-US")} characters ·{" "}
              {inputCounts.lines.toLocaleString("en-US")} lines ·{" "}
              {inputCounts.items.toLocaleString("en-US")} items
            </p>
          </div>
          <label htmlFor={`${baseId}-input`} className="sr-only">
            List to alphabetize
          </label>
          <textarea
            ref={inputRef}
            id={`${baseId}-input`}
            value={input}
            placeholder="Paste words, names, or lines here — one item per line..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                runSort();
              }
            }}
            spellCheck
            className="mt-3 min-h-52 w-full flex-1 resize-y rounded-control border border-line bg-paper px-3 py-3 text-base leading-7 text-ink"
          />
          {input.length > MAX_INPUT_CHARS ? (
            <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-ink" role="alert">
              Your list is {input.length.toLocaleString("en-US")} characters. Sorting will use the
              first {MAX_INPUT_CHARS.toLocaleString("en-US")} characters and omit an incomplete last
              item. Live counts above are for the full paste; the sort summary reports processed
              items.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={() => void paste()}>
              Paste
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                setInput("");
                setStatus("List cleared.");
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                setInput(EXAMPLE);
                setStatus("Example list loaded.");
              }}
            >
              Load Example
            </button>
            <button type="button" className={buttonClass} onClick={() => void copyInput()}>
              Copy list
            </button>
          </div>
        </section>

        <section className="surface-card flex h-full flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-ink">Sorted Results</h2>
            <p className="text-sm text-ink-muted">
              {result ? `${result.stats.outputItems.toLocaleString("en-US")} items` : "No results yet"}
            </p>
          </div>
          <label htmlFor={`${baseId}-output`} className="sr-only">
            Sorted results
          </label>
          <textarea
            ref={resultsRef}
            id={`${baseId}-output`}
            readOnly
            value={result?.text ?? ""}
            placeholder="Sorted results will appear here."
            className="mt-3 min-h-52 w-full flex-1 resize-y rounded-control border border-line bg-paper px-3 py-3 text-base leading-7 text-ink"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={primaryClass} disabled={!result || stale} onClick={() => void copyResult()}>
              Copy Results
            </button>
            <button type="button" className={buttonClass} disabled={!result || stale} onClick={() => download("txt")}>
              Download TXT
            </button>
            <button type="button" className={buttonClass} disabled={!result || stale} onClick={() => download("csv")}>
              Download CSV
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={!result}
              onClick={() => {
                setResult(null);
                setSortedFrom(null);
                setManualCopy(null);
                setStatus("Results cleared.");
              }}
            >
              Clear Results
            </button>
          </div>
        </section>
      </div>

      <section className="surface-card p-4 sm:p-5" aria-labelledby={`${baseId}-modes`}>
        <h2 id={`${baseId}-modes`} className="font-display text-xl font-semibold text-ink">
          Sorting method
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {MODE_GROUPS.map((group) => (
            <fieldset key={group.legend}>
              <legend className="text-sm font-semibold text-ink">{group.legend}</legend>
              <div className="mt-2 flex flex-col gap-2">
                {group.modes.map((mode) => (
                  <label
                    key={mode}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-3 text-sm font-semibold",
                      settings.mode === mode
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-surface text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${baseId}-mode`}
                      checked={settings.mode === mode}
                      onChange={() => updateSetting("mode", mode)}
                    />
                    {MODE_LABELS[mode]}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-ink">Input format</legend>
          <p className="mt-1 text-sm text-ink-muted">
            Comma and semicolon splitting is simple delimiter text, not quoted CSV.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {([
              ["lines", "One item per line"],
              ["comma", "Comma-separated"],
              ["semicolon", "Semicolon-separated"],
            ] as const).map(([format, label]) => (
              <FormatOption
                key={format}
                name={`${baseId}-format`}
                checked={settings.format === format}
                label={label}
                onSelect={() => updateSetting("format", format)}
              />
            ))}
          </div>
        </fieldset>

        <details className="mt-4 rounded-control border border-line bg-paper px-3 py-2">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-ink">
            Advanced options
          </summary>
          <p className="mt-1 text-sm text-ink-muted">
            Matching options change sort keys only, except Trim output, Remove empty items, Remove
            duplicates, and Number the sorted list, which change the result text.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Check
              label="Ignore capitalization"
              checked={settings.ignoreCase}
              onChange={(checked) => updateSetting("ignoreCase", checked)}
            />
            <Check
              label="Ignore punctuation"
              checked={settings.ignorePunctuation}
              onChange={(checked) => updateSetting("ignorePunctuation", checked)}
            />
            <Check
              label="Ignore leading A, An, or The"
              checked={settings.ignoreArticles}
              onChange={(checked) => updateSetting("ignoreArticles", checked)}
            />
            <Check
              label="Trim leading and trailing spaces"
              checked={settings.trimOutput}
              onChange={(checked) => updateSetting("trimOutput", checked)}
            />
            <Check
              label="Remove empty items"
              checked={settings.removeEmpty}
              onChange={(checked) => updateSetting("removeEmpty", checked)}
            />
            <Check
              label="Remove duplicate lines"
              checked={settings.removeDuplicates}
              onChange={(checked) => updateSetting("removeDuplicates", checked)}
            />
            <Check
              label="Number the sorted list"
              checked={settings.numberOutput}
              onChange={(checked) => updateSetting("numberOutput", checked)}
            />
          </div>
        </details>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={primaryClass} onClick={runSort}>
          {primaryLabel}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            setStatus("Sorting options reset.");
          }}
        >
          Reset options
        </button>
      </div>
      <p className="text-sm text-ink-muted">
        Press Ctrl+Enter or Cmd+Enter in Your List to sort. Lists longer than{" "}
        {MAX_INPUT_CHARS.toLocaleString("en-US")} characters are sorted only up to that limit.
      </p>
      <p id={`${baseId}-status`} role="status" className="text-sm text-ink">
        {stale
          ? "Your text or sorting settings changed. Sort again to update the results."
          : status}
      </p>

      {result ? (
        <section className="surface-card p-4 sm:p-5" aria-labelledby={`${baseId}-stats`}>
          <h2 id={`${baseId}-stats`} className="font-display text-xl font-semibold text-ink">
            Sort summary
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Total items in paste"
              value={String(result.stats.totalInputItems)}
            />
            <Stat label="Processed items" value={String(result.stats.inputItems)} />
            <Stat label="Output items" value={String(result.stats.outputItems)} />
            <Stat label="Duplicates removed" value={String(result.stats.duplicatesRemoved)} />
            <Stat label="Empty items removed" value={String(result.stats.emptyRemoved)} />
            <Stat label="Method" value={MODE_LABELS[result.stats.mode]} />
          </dl>
          {result.truncated ? (
            <p className="mt-3 text-sm text-ink-muted">
              Live counts on Your List are the full paste (
              {result.stats.totalCharacters.toLocaleString("en-US")} characters). This sort used{" "}
              {result.stats.processedCharacters.toLocaleString("en-US")} characters.
            </p>
          ) : null}
          {result.warning ? (
            <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-ink" role="alert">
              {result.warning}
            </p>
          ) : null}
          {stale ? (
            <p className="mt-3 text-sm text-ink-muted">
              Copy and download stay off until you sort again, so a file cannot describe the previous list.
            </p>
          ) : null}
          {manualCopy ? (
            <div className="mt-3">
              <p id={`${baseId}-manual`} className="text-sm text-danger">
                Automatic copy was blocked. This list is selected so you can copy it yourself.
              </p>
              <textarea
                ref={manualCopyRef}
                readOnly
                aria-labelledby={`${baseId}-manual`}
                value={manualCopy}
                rows={6}
                className="mt-2 w-full resize-y rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink"
              />
            </div>
          ) : null}
        </section>
      ) : (
        <section className="surface-card p-4 sm:p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Ready to alphabetize?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Paste a list into Your List, choose a sorting method, then select Sort My List. Load
            Example if you want a sample with names, numbers, and repeated words.
          </p>
        </section>
      )}
    </div>
  );
}

function FormatOption({
  name,
  checked,
  label,
  onSelect,
}: {
  name: string;
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-3 text-sm font-semibold",
        checked ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} />
      {label}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-line bg-paper px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
