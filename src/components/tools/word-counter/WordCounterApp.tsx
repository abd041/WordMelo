"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ResetButton } from "@/components/ui/ResetButton";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import {
  computeTextStats,
  computeWordFrequencies,
  formatDuration,
  type TextStats,
} from "@/lib/tools/word-counter/count";

const SAMPLE_TEXT = `WordMelo helps writers measure drafts without sending text to a server.

Paste an essay, script, email, or blog post into this editor. The counters update as you type, including words, characters, sentences, and paragraph breaks.

Reading time assumes about ${siteConfig.readingWordsPerMinute} words per minute. Speaking time assumes about ${siteConfig.speakingWordsPerMinute} words per minute. Page estimates use about ${siteConfig.wordsPerPageEstimate} words per page — a common double-spaced manuscript approximation, not a print guarantee.`;

const EMPTY_STATS: TextStats = {
  words: 0,
  charactersWithSpaces: 0,
  charactersWithoutSpaces: 0,
  graphemes: 0,
  sentences: 0,
  paragraphs: 0,
  readingSeconds: 0,
  speakingSeconds: 0,
  estimatedPages: 0,
};

const FREQUENCY_DEBOUNCE_MS = 180;
const LARGE_TEXT_THRESHOLD = 20_000;
const FREQUENCY_PREVIEW = 12;

export function WordCounterApp() {
  const editorId = useId();
  const statsId = useId();
  const summaryId = useId();
  const [text, setText] = useState("");
  const [showAllFrequencies, setShowAllFrequencies] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const deferredText = useDeferredValue(text);

  const liveStats = useMemo(
    () => (deferredText ? computeTextStats(deferredText) : EMPTY_STATS),
    [deferredText],
  );

  const [frequencies, setFrequencies] = useState<
    ReturnType<typeof computeWordFrequencies>
  >([]);

  useEffect(() => {
    if (!deferredText.trim()) {
      setFrequencies([]);
      setShowAllFrequencies(false);
      return;
    }

    const delay =
      deferredText.length > LARGE_TEXT_THRESHOLD
        ? FREQUENCY_DEBOUNCE_MS + 120
        : FREQUENCY_DEBOUNCE_MS;

    const timer = window.setTimeout(() => {
      startTransition(() => {
        setFrequencies(computeWordFrequencies(deferredText, 40));
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deferredText]);

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  function handleClear() {
    setText("");
    showFeedback("Editor cleared", "neutral");
  }

  function handleSample() {
    setText(SAMPLE_TEXT);
    showFeedback("Sample text loaded", "success");
  }

  const isEmpty = text.trim().length === 0;
  const visibleFrequencies = showAllFrequencies
    ? frequencies
    : frequencies.slice(0, FREQUENCY_PREVIEW);
  const maxFrequency = frequencies[0]?.count ?? 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        id={summaryId}
        className="surface-card flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">
            {liveStats.words.toLocaleString("en-US")}
          </span>{" "}
          words
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">
            {liveStats.charactersWithSpaces.toLocaleString("en-US")}
          </span>{" "}
          characters
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">
            {formatDuration(liveStats.readingSeconds)}
          </span>{" "}
          reading
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.9fr)] lg:gap-6">
        <section
          aria-labelledby={`${editorId}-label`}
          className="surface-card flex min-h-[24rem] flex-col overflow-hidden sm:min-h-[28rem]"
        >
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id={`${editorId}-label`}
                  className="font-sans text-base font-semibold text-ink"
                >
                  Text editor
                </h2>
                <p className="text-xs text-ink-muted">
                  Paste or type — counts update as you go
                </p>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSample}
                  className="shrink-0"
                >
                  Sample
                </Button>
                <CopyButton
                  text={text}
                  disabled={isEmpty}
                  onFeedback={showFeedback}
                />
                <DownloadButton
                  text={text}
                  disabled={isEmpty}
                  onFeedback={showFeedback}
                />
                <ResetButton onReset={handleClear} disabled={isEmpty} />
              </div>
            </div>
          </div>

          <label htmlFor={editorId} className="sr-only">
            Enter text to count words and characters
          </label>
          <textarea
            id={editorId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Start typing or paste your text here…"
            spellCheck
            className="min-h-[18rem] flex-1 resize-y bg-transparent px-4 py-4 font-serif text-base leading-7 text-ink placeholder:text-ink-soft sm:min-h-[22rem] sm:px-5 sm:text-[1.05rem]"
            aria-describedby={`${statsId} ${summaryId}`}
          />

          <div className="border-t border-line px-4 py-3 sm:px-5">
            <FeedbackMessage
              message={feedback?.message ?? null}
              tone={feedback?.tone}
              onDismiss={() => setFeedback(null)}
            />
            {isEmpty && !feedback ? (
              <p className="text-sm text-ink-muted">
                Empty draft — add text to see live statistics.
              </p>
            ) : null}
          </div>
        </section>

        <section aria-labelledby={statsId} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id={statsId}
              className="font-sans text-base font-semibold text-ink"
            >
              Live statistics
            </h2>
            <p className="text-xs text-ink-muted">
              Reading {siteConfig.readingWordsPerMinute} WPM · Speaking{" "}
              {siteConfig.speakingWordsPerMinute} WPM
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Words"
              value={liveStats.words.toLocaleString("en-US")}
              emphasis="primary"
              className="col-span-2"
            />
            <StatCard
              label="Characters"
              value={liveStats.charactersWithSpaces.toLocaleString("en-US")}
              hint="With spaces"
            />
            <StatCard
              label="Characters"
              value={liveStats.charactersWithoutSpaces.toLocaleString("en-US")}
              hint="Without spaces"
            />
            <StatCard
              label="Graphemes"
              value={liveStats.graphemes.toLocaleString("en-US")}
              hint="Perceived characters"
            />
            <StatCard
              label="Sentences"
              value={liveStats.sentences.toLocaleString("en-US")}
            />
            <StatCard
              label="Paragraphs"
              value={liveStats.paragraphs.toLocaleString("en-US")}
            />
            <StatCard
              label="Reading time"
              value={formatDuration(liveStats.readingSeconds)}
            />
            <StatCard
              label="Speaking time"
              value={formatDuration(liveStats.speakingSeconds)}
              className="col-span-2 sm:col-span-1"
            />
            <StatCard
              label="Est. pages"
              value={liveStats.estimatedPages.toLocaleString("en-US")}
              hint={`≈ ${siteConfig.wordsPerPageEstimate} words/page`}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </section>
      </div>

      <section
        aria-labelledby="frequency-heading"
        className="surface-card p-5 sm:p-6"
      >
        <div>
          <h2
            id="frequency-heading"
            className="font-sans text-base font-semibold text-ink"
          >
            Word frequency
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Most common words in this draft (case-insensitive). Large inputs
            update shortly after you pause typing.
          </p>
        </div>

        {frequencies.length === 0 ? (
          <p className="mt-5 text-sm text-ink-muted">
            Frequency breakdown appears once your text contains countable words.
          </p>
        ) : (
          <>
            <ol className="mt-5 space-y-2.5">
              {visibleFrequencies.map((item, index) => {
                const share =
                  liveStats.words > 0
                    ? Math.round((item.count / liveStats.words) * 1000) / 10
                    : 0;
                const barWidth =
                  maxFrequency > 0
                    ? Math.max(6, Math.round((item.count / maxFrequency) * 100))
                    : 0;

                return (
                  <li
                    key={`${item.word}-${item.count}-${index}`}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3"
                  >
                    <span className="text-xs tabular-nums text-ink-soft">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-medium text-ink">
                          {item.word}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                          {item.count} · {share}%
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {frequencies.length > FREQUENCY_PREVIEW ? (
              <button
                type="button"
                className="mt-4 text-sm font-medium text-accent hover:underline"
                onClick={() => setShowAllFrequencies((value) => !value)}
              >
                {showAllFrequencies
                  ? "Show fewer words"
                  : `Show all ${frequencies.length} words`}
              </button>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
