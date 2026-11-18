"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { compareTexts, MAX_INPUT_CHARS } from "@/lib/tools/text-compare/compare";
import {
  DIFF_FILENAME,
  HTML_FILENAME,
  MAX_RENDER_ROWS,
  TXT_FILENAME,
  clipboardFeedback,
  clipRows,
  comparisonHtml,
  comparisonReport,
  unifiedDiff,
  visibleSegments,
} from "@/lib/tools/text-compare/format";
import { countComparableWords, countLines } from "@/lib/tools/text-compare/segment";
import type {
  AlignedSegment,
  CompareResult,
  CompareSettings,
} from "@/lib/tools/text-compare/types";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

const EXAMPLE_A = `The quick brown fox jumps over the lazy dog.
Please review the draft carefully.
This line stays.
Remove this note.`;

const EXAMPLE_B = `The quick brown fox leaps over a lazy dog.
Please review the final draft carefully.
This line stays.
Add this note.
Thanks for reading.`;

const DEFAULT_SETTINGS: CompareSettings = {
  mode: "word",
  ignoreCase: false,
  ignoreWhitespace: false,
  ignoreEdgeSpace: false,
  ignoreEmptyLines: false,
  showUnchanged: true,
  showLineNumbers: true,
  wrap: true,
  view: "side",
};

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50";

const primaryClass =
  "inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

interface ComparedSnapshot {
  original: string;
  modified: string;
  mode: CompareSettings["mode"];
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoreEdgeSpace: boolean;
  ignoreEmptyLines: boolean;
}

export function TextCompareApp() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [settings, setSettings] = useState<CompareSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [compared, setCompared] = useState<ComparedSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Paste two texts, then press Compare Text.");
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const revealRef = useRef(false);
  const baseId = useId();

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!manualCopy) return;
    manualCopyRef.current?.focus();
    manualCopyRef.current?.select();
  }, [manualCopy]);

  useEffect(() => {
    if (!revealRef.current || !result) return;
    revealRef.current = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [result]);

  const originalCounts = useMemo(() => countsFor(original), [original]);
  const modifiedCounts = useMemo(() => countsFor(modified), [modified]);
  const stale =
    result !== null &&
    compared !== null &&
    (compared.original !== original ||
      compared.modified !== modified ||
      compared.mode !== settings.mode ||
      compared.ignoreCase !== settings.ignoreCase ||
      compared.ignoreWhitespace !== settings.ignoreWhitespace ||
      compared.ignoreEdgeSpace !== settings.ignoreEdgeSpace ||
      compared.ignoreEmptyLines !== settings.ignoreEmptyLines);

  function updateSetting<Key extends keyof CompareSettings>(key: Key, value: CompareSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function runCompare(nextOriginal: string, nextModified: string, nextSettings: CompareSettings) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    revealRef.current = true;
    setBusy(true);
    setStatus("Comparing…");
    setManualCopy(null);
    timerRef.current = window.setTimeout(() => {
      const next = compareTexts(nextOriginal, nextModified, nextSettings);
      setResult(next);
      setCompared({
        original: nextOriginal,
        modified: nextModified,
        mode: nextSettings.mode,
        ignoreCase: nextSettings.ignoreCase,
        ignoreWhitespace: nextSettings.ignoreWhitespace,
        ignoreEdgeSpace: nextSettings.ignoreEdgeSpace,
        ignoreEmptyLines: nextSettings.ignoreEmptyLines,
      });
      setBusy(false);
      setStatus(next.warning ?? "Comparison ready.");
    }, 0);
  }

  async function copyEditor(id: string, value: string, label: string) {
    const copied = await copyTextToClipboard(value);
    setManualCopy(null);
    if (copied) {
      setStatus(`${label} copied.`);
      return;
    }
    const field = document.getElementById(id);
    if (field instanceof HTMLTextAreaElement) {
      field.focus();
      field.select();
    }
    setStatus(`Copy failed. ${label} is selected so you can copy it manually.`);
  }

  async function copyReport() {
    if (!result || stale) return;
    const report = comparisonReport(result, settings);
    const feedback = clipboardFeedback(await copyTextToClipboard(report));
    setStatus(feedback.message);
    setManualCopy(feedback.failed ? report : null);
  }

  function download(kind: "txt" | "diff" | "html") {
    if (!result || stale) return;
    try {
      if (kind === "txt") {
        downloadTextFile(TXT_FILENAME, comparisonReport(result, settings));
      } else if (kind === "diff") {
        downloadTextFile(DIFF_FILENAME, unifiedDiff(original, modified), "text/plain;charset=utf-8");
      } else {
        downloadTextFile(HTML_FILENAME, comparisonHtml(result, settings), "text/html;charset=utf-8");
      }
      setStatus("Comparison downloaded.");
      setManualCopy(null);
    } catch {
      setStatus("The download could not be started in this browser.");
    }
  }

  const rows = result ? visibleSegments(result.segments, settings.showUnchanged) : [];
  const clipped = clipRows(rows, MAX_RENDER_ROWS);
  const renderedRows = clipped.shownRows;
  const liveStatus = stale
    ? "Your text or comparison settings changed. Compare again to update the results."
    : status;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <Editor
          id={`${baseId}-text-a`}
          title="Original text"
          label="Text A, original text"
          placeholder="Paste your original text here..."
          value={original}
          counts={originalCounts}
          onChange={setOriginal}
          onCompare={() => runCompare(original, modified, settings)}
          onCopy={() => void copyEditor(`${baseId}-text-a`, original, "Original text")}
          onClear={() => {
            setOriginal("");
            setStatus("Original text cleared.");
          }}
        />
        <Editor
          id={`${baseId}-text-b`}
          title="Modified text"
          label="Text B, modified text"
          placeholder="Paste your updated version here..."
          value={modified}
          counts={modifiedCounts}
          onChange={setModified}
          onCompare={() => runCompare(original, modified, settings)}
          onCopy={() => void copyEditor(`${baseId}-text-b`, modified, "Modified text")}
          onClear={() => {
            setModified("");
            setStatus("Modified text cleared.");
          }}
        />
      </div>

      <p className="text-sm text-ink-muted">
        Press Ctrl+Enter or Cmd+Enter in either editor to compare. Comparison uses the first{" "}
        {MAX_INPUT_CHARS.toLocaleString("en-US")} characters of each side.
      </p>

      <section className="surface-card p-4 sm:p-5" aria-labelledby={`${baseId}-settings`}>
        <h2 id={`${baseId}-settings`} className="font-display text-xl font-semibold text-ink">
          Comparison settings
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Comparison mode</legend>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <ModeOption
                name={`${baseId}-mode`}
                checked={settings.mode === "word"}
                label="Words"
                onSelect={() => updateSetting("mode", "word")}
              />
              <ModeOption
                name={`${baseId}-mode`}
                checked={settings.mode === "line"}
                label="Lines"
                onSelect={() => updateSetting("mode", "line")}
              />
              <ModeOption
                name={`${baseId}-mode`}
                checked={settings.mode === "character"}
                label="Characters"
                onSelect={() => updateSetting("mode", "character")}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Result view</legend>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <ModeOption
                name={`${baseId}-view`}
                checked={settings.view === "side"}
                label="Side-by-side"
                onSelect={() => updateSetting("view", "side")}
              />
              <ModeOption
                name={`${baseId}-view`}
                checked={settings.view === "unified"}
                label="Unified"
                onSelect={() => updateSetting("view", "unified")}
              />
            </div>
          </fieldset>
        </div>
        <details className="mt-4 rounded-control border border-line bg-paper px-3 py-2">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-ink">
            Advanced comparison settings
          </summary>
          <p className="mt-1 text-sm text-ink-muted">
            These options change how text is matched. They do not edit the text in the boxes.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Check
              label="Ignore capitalization"
              checked={settings.ignoreCase}
              onChange={(checked) => updateSetting("ignoreCase", checked)}
            />
            <Check
              label="Ignore whitespace differences"
              checked={settings.ignoreWhitespace}
              onChange={(checked) => updateSetting("ignoreWhitespace", checked)}
            />
            <Check
              label="Ignore leading and trailing spaces"
              checked={settings.ignoreEdgeSpace}
              onChange={(checked) => updateSetting("ignoreEdgeSpace", checked)}
            />
            <Check
              label="Ignore empty lines"
              checked={settings.ignoreEmptyLines}
              onChange={(checked) => updateSetting("ignoreEmptyLines", checked)}
            />
            <Check
              label="Show unchanged sections"
              checked={settings.showUnchanged}
              onChange={(checked) => updateSetting("showUnchanged", checked)}
            />
            <Check
              label="Show line numbers"
              checked={settings.showLineNumbers}
              onChange={(checked) => updateSetting("showLineNumbers", checked)}
            />
            <Check
              label="Wrap long lines"
              checked={settings.wrap}
              onChange={(checked) => updateSetting("wrap", checked)}
            />
          </div>
        </details>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryClass}
          disabled={busy}
          onClick={() => runCompare(original, modified, settings)}
        >
          {busy ? "Comparing…" : "Compare Text"}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setOriginal(modified);
            setModified(original);
            setStatus("Texts swapped.");
          }}
        >
          Swap Texts
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setOriginal("");
            setModified("");
            setResult(null);
            setCompared(null);
            setManualCopy(null);
            setStatus("Both texts cleared.");
          }}
        >
          Clear Both
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setOriginal(EXAMPLE_A);
            setModified(EXAMPLE_B);
            runCompare(EXAMPLE_A, EXAMPLE_B, settings);
          }}
        >
          Load Example
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            setStatus("Comparison settings reset.");
          }}
        >
          Reset comparison settings
        </button>
      </div>

      <p id={`${baseId}-status`} role="status" className="text-sm text-ink">
        {liveStatus}
      </p>

      {result ? (
        <section ref={resultsRef} className="surface-card p-4 sm:p-5" aria-labelledby={`${baseId}-results`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id={`${baseId}-results`} className="font-display text-xl font-semibold text-ink">
              Comparison results
            </h2>
            <p className="text-sm text-ink-muted">
              {result.detail === "word"
                ? "Word units"
                : result.detail === "line"
                  ? "Line units"
                  : "Character units"}
              {result.detail !== settings.mode ? " (reduced detail)" : ""}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label={result.partial ? "Similarity (included text)" : "Similarity"}
              value={result.stats.similarity === null ? "Not available" : `${result.stats.similarity}%`}
            />
            <Stat label="Added" value={String(result.stats.added)} />
            <Stat label="Removed" value={String(result.stats.removed)} />
            <Stat label="Replaced" value={String(result.stats.changed)} />
            <Stat label="Unchanged" value={String(result.stats.unchanged)} />
            <Stat label="Words in Text A" value={String(result.stats.originalWords)} />
            <Stat label="Words in Text B" value={String(result.stats.modifiedWords)} />
          </dl>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Similarity is 2 × matching units ÷ (units in Text A + units in Text B). It describes this
            alignment after the selected options. It is not a meaning score or a plagiarism score.
            An incomplete alignment does not show a score. A partial score covers only the included
            characters. Word counts use the comparison’s letter-and-number pattern.
          </p>
          {result.warning ? (
            <p className="mt-3 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-ink" role="alert">
              {result.warning}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={primaryClass} disabled={stale} onClick={() => void copyReport()}>
              Copy results
            </button>
            <button type="button" className={buttonClass} disabled={stale} onClick={() => download("txt")}>
              Download TXT
            </button>
            <button type="button" className={buttonClass} disabled={stale} onClick={() => download("diff")}>
              Download Diff
            </button>
            <button type="button" className={buttonClass} disabled={stale} onClick={() => download("html")}>
              Download HTML
            </button>
          </div>
          {stale ? (
            <p className="mt-2 text-sm text-ink-muted">
              Downloads stay off until you compare again, so a file cannot describe the previous text.
            </p>
          ) : null}

          {manualCopy ? (
            <div className="mt-3">
              <p id={`${baseId}-manual`} className="text-sm text-danger">
                Automatic copy was blocked. This report is selected so you can copy it yourself.
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

          <p className="sr-only">
            {result.stats.added} added, {result.stats.removed} removed, {result.stats.changed} replaced,{" "}
            {result.stats.unchanged} unchanged. Similarity{" "}
            {result.stats.similarity === null ? "not available" : `${result.stats.similarity} percent`}.
            {result.partial ? " This comparison does not include text past the character limit." : ""}
          </p>

          {renderedRows.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Nothing to show with the current display options.</p>
          ) : settings.view === "unified" ? (
            <div className="mt-4 overflow-x-auto rounded-control border border-line">
              <ol className="min-w-0">
                {renderedRows.map((segment, index) => (
                  <li key={index} className="border-b border-line/70 last:border-b-0">
                    <DiffBlock segment={segment} settings={settings} unified />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-control border border-line">
              <div className="hidden border-b border-line bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted md:grid md:grid-cols-2 md:gap-3">
                <p>Original</p>
                <p>Modified</p>
              </div>
              <ol>
                {renderedRows.map((segment, index) => (
                  <li
                    key={index}
                    className="grid grid-cols-1 border-b border-line/70 last:border-b-0 md:grid-cols-2"
                  >
                    {segment.type === "gap" ? (
                      <div className="md:col-span-2">
                        <DiffBlock segment={segment} settings={settings} />
                      </div>
                    ) : (
                      <>
                        <DiffBlock segment={segment} settings={settings} side="left" />
                        <DiffBlock segment={segment} settings={settings} side="right" />
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {clipped.hidden > 0 ? (
            <p className="mt-3 text-sm text-warning">
              Showing {clipped.shown.toLocaleString("en-US")} of {clipped.total.toLocaleString("en-US")}{" "}
              sections. The download includes every section from this comparison.
            </p>
          ) : null}
        </section>
      ) : (
        <section ref={resultsRef} className="surface-card p-4 sm:p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Ready to compare your text?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Paste two versions above, then select Compare Text to highlight the differences.
          </p>
        </section>
      )}
    </div>
  );
}

function countsFor(text: string) {
  return {
    characters: text.length,
    words: countComparableWords(text),
    lines: countLines(text),
  };
}

function Editor({
  id,
  title,
  label,
  placeholder,
  value,
  counts,
  onChange,
  onCompare,
  onCopy,
  onClear,
}: {
  id: string;
  title: string;
  label: string;
  placeholder: string;
  value: string;
  counts: { characters: number; words: number; lines: number };
  onChange: (value: string) => void;
  onCompare: () => void;
  onCopy: () => void;
  onClear: () => void;
}) {
  return (
    <section className="surface-card flex h-full flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink-muted">
          {counts.characters.toLocaleString("en-US")} characters · {counts.words.toLocaleString("en-US")}{" "}
          words · {counts.lines.toLocaleString("en-US")} lines
        </p>
      </div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            onCompare();
          }
        }}
        placeholder={placeholder}
        spellCheck
        className="mt-3 min-h-52 w-full flex-1 resize-y rounded-control border border-line bg-paper px-3 py-3 text-base leading-7 text-ink"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={onCopy}>
          Copy text
        </button>
        <button type="button" className={buttonClass} onClick={onClear}>
          Clear text
        </button>
      </div>
    </section>
  );
}

function ModeOption({
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
      <dd className="mt-1 font-display text-2xl font-semibold text-ink">{value}</dd>
    </div>
  );
}

function DiffBlock({
  segment,
  settings,
  side,
  unified = false,
}: {
  segment: AlignedSegment;
  settings: CompareSettings;
  side?: "left" | "right";
  unified?: boolean;
}) {
  const wrap = settings.wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre";
  if (segment.type === "gap") {
    return (
      <p className="min-h-11 bg-warning/15 px-3 py-2 text-sm text-ink">
        Not aligned. This part exceeded the processing limit, so it is not shown as an exact change.
      </p>
    );
  }

  if (unified) {
    if (segment.type === "replace") {
      return (
        <div>
          <DiffLine kind="delete" text={segment.left} line={segment.leftLine} settings={settings} wrap={wrap} />
          <DiffLine kind="insert" text={segment.right} line={segment.rightLine} settings={settings} wrap={wrap} />
        </div>
      );
    }
    const kind = segment.type === "equal" ? "equal" : segment.type;
    const text = segment.type === "insert" ? segment.right : segment.left;
    const line = segment.type === "insert" ? segment.rightLine : segment.leftLine;
    return <DiffLine kind={kind} text={text} line={line} settings={settings} wrap={wrap} />;
  }

  const showingLeft = side === "left";
  if (segment.type === "equal") {
    return (
      <DiffLine
        kind="equal"
        text={showingLeft ? segment.left : segment.right}
        line={showingLeft ? segment.leftLine : segment.rightLine}
        settings={settings}
        wrap={wrap}
        caption={showingLeft ? "Original" : "Modified"}
      />
    );
  }
  if (segment.type === "delete") {
    return showingLeft ? (
    <DiffLine kind="delete" text={segment.left} line={segment.leftLine} settings={settings} wrap={wrap} caption="Original" />
  ) : (
    <EmptySide label="No text on this side" caption="Modified" />
  );
  }
  if (segment.type === "insert") {
    return showingLeft ? (
      <EmptySide label="No text on this side" caption="Original" />
    ) : (
      <DiffLine kind="insert" text={segment.right} line={segment.rightLine} settings={settings} wrap={wrap} caption="Modified" />
    );
  }
  return showingLeft ? (
    <DiffLine kind="replace" text={segment.left} line={segment.leftLine} settings={settings} wrap={wrap} caption="Original" />
  ) : (
    <DiffLine kind="replace" text={segment.right} line={segment.rightLine} settings={settings} wrap={wrap} replaced caption="Modified" />
  );
}

function EmptySide({ label, caption }: { label: string; caption: string }) {
  return (
    <p className="min-h-11 px-3 py-2 text-sm text-ink-soft">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted md:hidden">
        {caption}
      </span>
      {label}
    </p>
  );
}

function DiffLine({
  kind,
  text,
  line,
  settings,
  wrap,
  replaced = false,
  caption,
}: {
  kind: "equal" | "delete" | "insert" | "replace";
  text: string;
  line: number | null;
  settings: CompareSettings;
  wrap: string;
  replaced?: boolean;
  caption?: string;
}) {
  const marker = kind === "insert" || replaced ? "+" : kind === "delete" || kind === "replace" ? "−" : "";
  const name =
    kind === "insert" ? "Added" : kind === "delete" ? "Removed" : kind === "replace" ? "Replaced" : "Unchanged";
  const Tag = kind === "insert" || replaced ? "ins" : kind === "delete" ? "del" : "span";
  return (
    <p
      className={cn(
        "min-h-11 px-3 py-2 text-sm leading-6 text-ink",
        wrap,
        kind === "insert"
          ? "bg-success/10"
          : kind === "delete"
            ? "bg-danger/10"
            : kind === "replace"
              ? "bg-warning/15"
              : "",
      )}
    >
      {caption ? (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted md:hidden">
          {caption}
        </span>
      ) : null}
      {settings.showLineNumbers && line ? (
        <span className="mr-2 inline-block min-w-8 font-mono text-xs text-ink-muted">{line}</span>
      ) : null}
      <span className="mr-2 inline-block w-4 font-semibold" aria-hidden="true">
        {marker}
      </span>
      <span className="sr-only">{name}: </span>
      <Tag className="no-underline">{text.length > 0 ? text : "Empty"}</Tag>
    </p>
  );
}
