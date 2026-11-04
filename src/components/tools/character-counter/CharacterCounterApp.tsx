"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ResetButton } from "@/components/ui/ResetButton";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import {
  EMPTY_CHARACTER_STATS,
  LIMIT_METRIC_OPTIONS,
  LIMIT_PRESETS,
  SAMPLE_TEXT,
  TXT_FILENAME,
  UNICODE_DEMOS,
  analyzeCharacters,
  analyzeUnicodeDemo,
  clampLimit,
  computeLimitStatus,
  parseLimitInput,
  type LimitMetric,
  type UnicodeDemoId,
} from "@/lib/tools/character-counter";
import { cn } from "@/lib/utils";

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}

export function CharacterCounterApp() {
  const editorId = useId();
  const limitId = useId();
  const progressId = useId();
  const [text, setText] = useState("");
  const [limitInput, setLimitInput] = useState("160");
  const [limit, setLimit] = useState(160);
  const [metric, setMetric] = useState<LimitMetric>("grapheme");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [demoId, setDemoId] = useState<UnicodeDemoId>("emoji");
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  const deferredText = useDeferredValue(text);
  const statsPending = deferredText !== text;

  const stats = useMemo(
    () =>
      deferredText
        ? analyzeCharacters(deferredText)
        : EMPTY_CHARACTER_STATS,
    [deferredText],
  );

  const limitStatus = useMemo(
    () => computeLimitStatus(deferredText, limit, metric),
    [deferredText, limit, metric],
  );

  const demoStats = useMemo(() => analyzeUnicodeDemo(demoId), [demoId]);
  const activeDemo = UNICODE_DEMOS.find((d) => d.id === demoId)!;

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  function applyLimit(next: number) {
    const clamped = clampLimit(next);
    setLimit(clamped);
    setLimitInput(String(clamped));
  }

  function handleLimitBlur() {
    const parsed = parseLimitInput(limitInput);
    if (parsed == null) {
      setLimitInput(String(limit));
      showFeedback("Enter a limit between 1 and 100,000", "error");
      return;
    }
    applyLimit(parsed);
  }

  function handleClear() {
    setText("");
    showFeedback("Editor cleared", "neutral");
  }

  function handleSample() {
    setText(SAMPLE_TEXT);
    showFeedback("Sample text loaded", "success");
  }

  const progressPercent =
    limitStatus.ratio == null ? 0 : Math.round(limitStatus.ratio * 100);

  const progressLabel =
    limitStatus.state === "unavailable"
      ? "Grapheme counting unavailable in this browser"
      : limitStatus.state === "over"
        ? `${formatCount(limitStatus.used)} used · ${formatCount(limitStatus.over)} over limit`
        : `${formatCount(limitStatus.used)} used · ${formatCount(limitStatus.remaining)} remaining`;

  const metricMeta = LIMIT_METRIC_OPTIONS.find((o) => o.id === metric);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Compact primary summary — single hierarchy source for live counts */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[1.15rem] border border-line bg-surface px-4 py-3 shadow-soft sm:px-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {formatCount(stats.charactersWithSpaces)}
          </span>{" "}
          characters
          <span className="text-ink-soft"> (UTF-16)</span>
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {formatCount(stats.charactersWithoutSpaces)}
          </span>{" "}
          without whitespace
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {formatCount(stats.letters)}
          </span>{" "}
          letters
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {formatCount(stats.words)}
          </span>{" "}
          words
        </p>
        {statsPending ? (
          <p className="text-xs text-ink-soft" role="status">
            Updating…
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.95fr)] lg:items-start lg:gap-6">
        {/* Editor */}
        <section
          aria-labelledby={`${editorId}-label`}
          className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft"
        >
          <div className="border-b border-line bg-gradient-to-br from-mint/35 via-surface to-paper px-4 py-3.5 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  Writing workspace
                </p>
                <h2
                  id={`${editorId}-label`}
                  className="mt-0.5 font-display text-lg font-semibold text-ink sm:text-xl"
                >
                  Text editor
                </h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Paste or type — counts stay in your browser.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSample}
                >
                  Sample
                </Button>
                <CopyButton
                  text={text}
                  disabled={!text}
                  onFeedback={(message, tone) =>
                    showFeedback(message, tone ?? "neutral")
                  }
                />
                <DownloadButton
                  text={text}
                  filename={TXT_FILENAME}
                  disabled={!text}
                  onFeedback={(message, tone) =>
                    showFeedback(message, tone ?? "neutral")
                  }
                />
                <ResetButton
                  onReset={handleClear}
                  disabled={!text}
                  label="Clear"
                />
              </div>
            </div>
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

          <label htmlFor={editorId} className="sr-only">
            Text to count characters
          </label>
          <textarea
            id={editorId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text to count characters, letters, spaces, and Unicode length…"
            spellCheck
            className="min-h-[14rem] w-full resize-y bg-transparent px-4 py-4 font-sans text-base leading-relaxed text-ink outline-none placeholder:text-ink-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:min-h-[16rem] sm:px-5 sm:text-[1.05rem] sm:leading-7 lg:min-h-[18rem]"
          />
        </section>

        {/* Limit checker */}
        <aside
          aria-labelledby={`${limitId}-heading`}
          className="rounded-[1.35rem] border border-line bg-surface p-4 shadow-soft sm:p-5"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Writing limit
          </p>
          <h2
            id={`${limitId}-heading`}
            className="mt-0.5 font-display text-lg font-semibold text-ink sm:text-xl"
          >
            Character limit checker
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Draft against a custom length. Text is never truncated.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor={`${limitId}-input`}
                className="text-sm font-semibold text-ink"
              >
                Custom limit
              </label>
              <input
                id={`${limitId}-input`}
                type="number"
                min={1}
                max={100000}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onBlur={handleLimitBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="mt-1.5 w-full rounded-control border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-ink">
                Count metric
              </legend>
              <div
                role="radiogroup"
                aria-label="Limit count metric"
                className="mt-2 grid grid-cols-1 gap-1.5"
              >
                {LIMIT_METRIC_OPTIONS.map((opt) => {
                  const selected = metric === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMetric(opt.id)}
                      className={cn(
                        "rounded-control border px-3 py-2 text-left transition-colors",
                        selected
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-paper text-ink hover:border-line-strong",
                      )}
                    >
                      <span className="block text-sm font-semibold">
                        {opt.shortLabel}
                      </span>
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
            </fieldset>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                Quick presets
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LIMIT_PRESETS.filter((p) => p.kind === "generic").map(
                  (preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.blurb}
                      onClick={() => applyLimit(preset.limit)}
                      className={cn(
                        "rounded-control border px-2.5 py-1.5 text-xs font-semibold",
                        limit === preset.limit
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-line bg-paper text-ink hover:border-accent",
                      )}
                    >
                      {preset.label}
                    </button>
                  ),
                )}
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-soft">
                Writing guides (not fixed Google limits):
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {LIMIT_PRESETS.filter((p) => p.kind === "seo-guide").map(
                  (preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.blurb}
                      onClick={() => applyLimit(preset.limit)}
                      className={cn(
                        "rounded-control border px-2.5 py-1.5 text-xs font-semibold",
                        limit === preset.limit
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-paper text-ink-muted hover:border-line-strong",
                      )}
                    >
                      {preset.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[1.1rem] border border-accent/15 bg-mint/25 p-3.5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <p
                  id={progressId}
                  className={cn(
                    "text-sm font-semibold",
                    limitStatus.state === "over" ||
                      limitStatus.state === "unavailable"
                      ? "text-danger"
                      : limitStatus.state === "near"
                        ? "text-warning"
                        : "text-ink",
                  )}
                >
                  {progressLabel}
                </p>
                <p className="text-xs text-ink-soft">
                  Limit {formatCount(limitStatus.limit)}
                  {metricMeta ? ` · ${metricMeta.shortLabel}` : ""}
                </p>
              </div>
              <div
                className="mt-2.5 h-3 overflow-hidden rounded-full bg-surface-sunken"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  limitStatus.ratio == null ? undefined : progressPercent
                }
                aria-labelledby={progressId}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none",
                    limitStatus.state === "over" ||
                      limitStatus.state === "unavailable"
                      ? "bg-danger"
                      : limitStatus.state === "near"
                        ? "bg-warning"
                        : "bg-accent",
                  )}
                  style={{
                    width:
                      limitStatus.ratio == null
                        ? "0%"
                        : `${Math.min(100, progressPercent)}%`,
                  }}
                />
              </div>
              {limitStatus.state === "over" ? (
                <p className="mt-2 text-xs text-danger" role="status">
                  Over by {formatCount(limitStatus.over)}. Your text is kept —
                  shorten it only if you need to meet the limit.
                </p>
              ) : null}
              {limitStatus.state === "unavailable" ? (
                <p className="mt-2 text-xs text-danger" role="status">
                  Switch to code points or UTF-16, or use a browser with
                  Intl.Segmenter for grapheme limits.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Secondary statistics — not duplicating the summary strip labels */}
      <section aria-label="Detailed text statistics">
        <h2 className="font-display text-lg font-semibold text-ink">
          Detailed statistics
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Digits, whitespace, structure — primary character totals are in the
          summary above.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <StatCard label="Digits" value={formatCount(stats.digits)} />
          <StatCard
            label="Whitespace"
            value={formatCount(stats.whitespace)}
            hint="All Unicode whitespace"
          />
          <StatCard label="Lines" value={formatCount(stats.lines)} />
          <StatCard label="Paragraphs" value={formatCount(stats.paragraphs)} />
        </div>
      </section>

      {/* Advanced Unicode */}
      <section className="overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Unicode inspector
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Graphemes, code points, UTF-16 units, UTF-8 bytes
              {!stats.graphemesAvailable
                ? " · grapheme count unavailable"
                : ""}
            </p>
          </div>
          <span aria-hidden className="text-ink-muted">
            {advancedOpen ? "−" : "+"}
          </span>
        </button>
        {advancedOpen ? (
          <div className="space-y-5 border-t border-line px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              <StatCard
                label="Visible (graphemes)"
                value={
                  stats.graphemesAvailable
                    ? formatCount(stats.graphemes)
                    : "N/A"
                }
                hint={
                  stats.graphemesAvailable
                    ? "Intl.Segmenter"
                    : "Segmenter unavailable"
                }
                emphasis="primary"
              />
              <StatCard
                label="Code points"
                value={formatCount(stats.codePoints)}
                hint="Unicode scalars"
              />
              <StatCard
                label="UTF-16 units"
                value={formatCount(stats.utf16Units)}
                hint="JS string length"
              />
              <StatCard
                label="UTF-8 bytes"
                value={formatCount(stats.utf8Bytes)}
                hint="TextEncoder"
              />
              <StatCard
                label="Punctuation"
                value={formatCount(stats.punctuation)}
              />
              <StatCard label="Symbols" value={formatCount(stats.symbols)} />
              <StatCard
                label="Sentences"
                value={formatCount(stats.sentences)}
              />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Category counts (letters, digits, punctuation, symbols, whitespace)
              use Unicode properties and do not always sum to grapheme totals —
              combining marks and joined emoji can span multiple code points.
            </p>

            <div className="rounded-[1.1rem] border border-line bg-paper/80 p-4">
              <h3 className="text-sm font-semibold text-ink">
                Interactive Unicode example
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                Built-in samples only — not your editor text. Values come from
                the same counting engine.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {UNICODE_DEMOS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    aria-pressed={demoId === demo.id}
                    onClick={() => setDemoId(demo.id)}
                    className={cn(
                      "rounded-control border px-2.5 py-1.5 text-xs font-semibold",
                      demoId === demo.id
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-line bg-surface text-ink hover:border-accent",
                    )}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-mono text-lg text-ink">
                {activeDemo.text}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{activeDemo.blurb}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-ink-soft">Graphemes</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {demoStats.graphemesAvailable
                      ? formatCount(demoStats.graphemes)
                      : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Code points</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {formatCount(demoStats.codePoints)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">UTF-16</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {formatCount(demoStats.utf16Units)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">UTF-8 bytes</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {formatCount(demoStats.utf8Bytes)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
