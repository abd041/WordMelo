"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ResetButton } from "@/components/ui/ResetButton";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  averageCharactersPerWord,
  averageWordsPerSentence,
  computeTextStats,
  countSentences,
  extractWords,
  formatDuration,
  type TextStats,
} from "@/lib/tools/word-counter/count";
import {
  clearStoredDraft,
  loadDraftPreference,
  persistDraft,
} from "@/lib/tools/word-counter/draft";
import { WORD_GOAL_PRESETS, wordGoalProgress } from "@/lib/tools/word-counter/goal";
import { analyzeKeywords, type KeywordAnalysis } from "@/lib/tools/word-counter/keywords";
import {
  scoreReadability,
  type ReadabilityResult,
} from "@/lib/tools/word-counter/readability";

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

const EMPTY_KEYWORDS: KeywordAnalysis = {
  rows: [],
  denominator: 0,
  phraseSize: 1,
  excludeStopWords: true,
};

const ANALYSIS_DEBOUNCE_MS = 180;
const LARGE_TEXT_THRESHOLD = 20_000;
const DRAFT_DEBOUNCE_MS = 400;

export function WordCounterApp() {
  const editorId = useId();
  const statsId = useId();
  const goalId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userEdited = useRef(false);
  const draftReady = useRef(false);

  const [text, setText] = useState("");
  const [undoText, setUndoText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const [goalOn, setGoalOn] = useState(false);
  const [goal, setGoal] = useState(500);
  const [customGoal, setCustomGoal] = useState("");
  const [phraseSize, setPhraseSize] = useState<1 | 2 | 3>(1);
  const [keywordLimit, setKeywordLimit] = useState<10 | 20>(10);
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [readingWpm, setReadingWpm] = useState<number>(siteConfig.readingWordsPerMinute);
  const [speakingWpm, setSpeakingWpm] = useState<number>(siteConfig.speakingWordsPerMinute);
  const [autosave, setAutosave] = useState(false);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordAnalysis>(EMPTY_KEYWORDS);
  const [readability, setReadability] = useState<ReadabilityResult | null>(null);

  const deferredText = useDeferredValue(text);

  const liveStats = useMemo(
    () =>
      deferredText
        ? computeTextStats(deferredText, {
            readingWpm,
            speakingWpm,
          })
        : EMPTY_STATS,
    [deferredText, readingWpm, speakingWpm],
  );

  useEffect(() => {
    try {
      const loaded = loadDraftPreference(window.localStorage);
      if (loaded.error) {
        setDraftNote("Browser storage is unavailable in this session.");
      } else if (loaded.enabled) {
        setAutosave(true);
        if (loaded.draft && !userEdited.current) {
          setText(loaded.draft);
          setDraftNote("Draft restored from this browser.");
        }
      }
    } catch {
      setDraftNote("Browser storage is unavailable in this session.");
    }
    draftReady.current = true;
  }, []);

  useEffect(() => {
    if (!draftReady.current || !autosave) return;
    const timer = window.setTimeout(() => {
      const result = persistDraft(window.localStorage, text);
      setDraftNote(
        result === "saved"
          ? "Draft saved on this device."
          : "Could not save the draft in this browser.",
      );
    }, DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [autosave, text]);

  useEffect(() => {
    if (!deferredText.trim()) {
      setKeywords({ ...EMPTY_KEYWORDS, phraseSize, excludeStopWords });
      setReadability(null);
      return;
    }

    const delay =
      deferredText.length > LARGE_TEXT_THRESHOLD
        ? ANALYSIS_DEBOUNCE_MS + 160
        : ANALYSIS_DEBOUNCE_MS;

    const timer = window.setTimeout(() => {
      startTransition(() => {
        const words = extractWords(deferredText);
        setKeywords(
          analyzeKeywords(words, {
            phraseSize,
            limit: keywordLimit,
            excludeStopWords,
          }),
        );
        setReadability(
          scoreReadability({
            text: deferredText,
            words,
            sentences: countSentences(deferredText),
          }),
        );
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deferredText, phraseSize, keywordLimit, excludeStopWords]);

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  function updateText(next: string) {
    userEdited.current = true;
    setText(next);
    if (next.length > 0) setUndoText(null);
  }

  function handleClear() {
    if (!text) return;
    setUndoText(text);
    userEdited.current = true;
    setText("");
    showFeedback("Text cleared", "neutral");
  }

  function handleUndo() {
    if (undoText == null) return;
    userEdited.current = true;
    setText(undoText);
    setUndoText(null);
    showFeedback("Draft restored", "success");
  }

  function confirmReplace(nextLabel: string) {
    if (!text.trim()) return true;
    return window.confirm(`Replace the current draft with ${nextLabel}?`);
  }

  function handleSample() {
    if (!confirmReplace("sample text")) return;
    updateText(SAMPLE_TEXT);
    showFeedback("Sample text loaded", "success");
  }

  async function handlePaste() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) {
        showFeedback("Clipboard is empty", "neutral");
        return;
      }
      if (!confirmReplace("clipboard text")) return;
      updateText(value);
      showFeedback("Clipboard text inserted", "success");
    } catch {
      showFeedback("Clipboard read was blocked. Paste with the keyboard instead.", "error");
    }
  }

  function handleSelectAll() {
    const field = textareaRef.current;
    if (!field) return;
    field.focus();
    field.select();
  }

  function handleAutosave(enabled: boolean) {
    setAutosave(enabled);
    if (!enabled) {
      const result = clearStoredDraft(window.localStorage);
      setDraftNote(
        result === "cleared"
          ? "Saved draft deleted from this browser."
          : "Could not delete the saved draft.",
      );
      return;
    }
    const result = persistDraft(window.localStorage, text);
    setDraftNote(
      result === "saved"
        ? "Autosave is on. The draft stays in this browser only."
        : "Could not turn on autosave in this browser.",
    );
    if (result === "error") setAutosave(false);
  }

  function applyCustomGoal() {
    const parsed = Number.parseInt(customGoal, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1_000_000) {
      showFeedback("Enter a goal between 1 and 1,000,000 words", "error");
      return;
    }
    setGoal(parsed);
    setGoalOn(true);
  }

  const isEmpty = text.trim().length === 0;
  const progress = goalOn ? wordGoalProgress(liveStats.words, goal) : null;
  const wordsPerSentence = averageWordsPerSentence(
    liveStats.words,
    liveStats.sentences,
  );
  const charactersPerWord = averageCharactersPerWord(
    liveStats.charactersWithoutSpaces,
    liveStats.words,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        className="surface-card flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-5"
      >
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {liveStats.words.toLocaleString("en-US")}
          </span>{" "}
          words
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {liveStats.charactersWithSpaces.toLocaleString("en-US")}
          </span>{" "}
          characters
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">
            {formatDuration(liveStats.readingSeconds)}
          </span>{" "}
          reading
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.9fr)] lg:gap-6">
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
                  Word counter tool
                </h2>
                <p className="text-xs text-ink-muted">
                  Paste or type — counts update as you go
                </p>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
                <Button type="button" variant="ghost" size="sm" onClick={handleSample} className="shrink-0">
                  Sample
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handlePaste} className="shrink-0">
                  Paste
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll} className="shrink-0">
                  Select all
                </Button>
                <CopyButton text={text} disabled={isEmpty} onFeedback={showFeedback} />
                <DownloadButton text={text} disabled={isEmpty} onFeedback={showFeedback} />
                <ResetButton onReset={handleClear} disabled={isEmpty} />
                {undoText != null ? (
                  <Button type="button" variant="secondary" size="sm" onClick={handleUndo} className="shrink-0">
                    Undo clear
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <label htmlFor={editorId} className="sr-only">
            Enter text to count words and characters
          </label>
          <textarea
            ref={textareaRef}
            id={editorId}
            value={text}
            onChange={(event) => updateText(event.target.value)}
            placeholder="Start typing or paste your text here to count words, characters, sentences, and more..."
            spellCheck
            className="min-h-[18rem] flex-1 resize-y bg-transparent px-4 py-4 font-serif text-base leading-8 text-ink placeholder:text-ink-soft sm:min-h-[22rem] sm:px-5 sm:text-[1.05rem]"
            aria-describedby={statsId}
          />

          <div className="space-y-3 border-t border-line px-4 py-3 sm:px-5">
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

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={goalId} className="text-sm font-semibold text-ink">
                  Word goal
                </h3>
                {goalOn ? (
                  <button
                    type="button"
                    className="text-sm font-medium text-accent hover:underline"
                    onClick={() => setGoalOn(false)}
                  >
                    Hide goal
                  </button>
                ) : null}
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Word goal presets">
                {WORD_GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={goalOn && goal === preset}
                    onClick={() => {
                      setGoal(preset);
                      setGoalOn(true);
                    }}
                    className={cn(
                      "h-9 shrink-0 rounded-control border px-3 text-sm font-semibold tabular-nums",
                      goalOn && goal === preset
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-surface text-ink-muted hover:text-ink",
                    )}
                  >
                    {preset.toLocaleString("en-US")}
                  </button>
                ))}
              </div>
              <form
                className="mt-2 flex flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyCustomGoal();
                }}
              >
                <label htmlFor={`${goalId}-custom`} className="text-sm text-ink-muted">
                  Custom
                </label>
                <input
                  id={`${goalId}-custom`}
                  inputMode="numeric"
                  value={customGoal}
                  onChange={(event) => setCustomGoal(event.target.value)}
                  placeholder="Words"
                  className="h-9 w-28 rounded-control border border-line bg-surface px-3 text-sm tabular-nums text-ink"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Set goal
                </Button>
              </form>
              {progress ? (
                <div className="mt-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <p className="font-semibold tabular-nums text-ink">
                      {progress.current.toLocaleString("en-US")} /{" "}
                      {progress.target.toLocaleString("en-US")} words
                    </p>
                    <p className="tabular-nums text-ink-muted">
                      {progress.percent.toLocaleString("en-US")}% complete
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={progress.target}
                    aria-valuenow={Math.min(progress.current, progress.target)}
                    aria-valuetext={
                      progress.excess > 0
                        ? `${progress.current} of ${progress.target} words, ${progress.excess} over the goal`
                        : `${progress.current} of ${progress.target} words, ${progress.percent}% complete`
                    }
                    aria-labelledby={goalId}
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-300"
                      style={{ width: `${progress.barPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {progress.status === "empty"
                      ? "Start writing toward this goal."
                      : progress.excess > 0
                        ? `${progress.excess.toLocaleString("en-US")} words over the goal.`
                        : progress.status === "complete"
                          ? "Goal reached."
                          : `${progress.remaining.toLocaleString("en-US")} words remaining.`}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-labelledby={statsId} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id={statsId} className="font-sans text-base font-semibold text-ink">
              Word and character statistics
            </h2>
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
            <StatCard label="Sentences" value={liveStats.sentences.toLocaleString("en-US")} />
            <StatCard label="Paragraphs" value={liveStats.paragraphs.toLocaleString("en-US")} />
            <StatCard label="Reading time" value={formatDuration(liveStats.readingSeconds)} />
            <StatCard label="Speaking time" value={formatDuration(liveStats.speakingSeconds)} />
            <StatCard
              label="Words / sentence"
              value={wordsPerSentence == null ? "—" : wordsPerSentence.toLocaleString("en-US")}
            />
            <StatCard
              label="Characters / word"
              value={charactersPerWord == null ? "—" : charactersPerWord.toLocaleString("en-US")}
              hint="Without spaces"
            />
            <StatCard
              label="Est. pages"
              value={liveStats.estimatedPages.toLocaleString("en-US")}
              hint={`≈ ${siteConfig.wordsPerPageEstimate} words/page`}
              className="col-span-2"
            />
          </div>

          <details className="surface-card px-4 py-3 text-sm">
            <summary className="cursor-pointer font-semibold text-ink">
              Reading pace and autosave
            </summary>
            <div className="mt-3 space-y-3">
              <p className="text-ink-muted">
                Defaults are {siteConfig.readingWordsPerMinute} words per minute
                for reading and {siteConfig.speakingWordsPerMinute} for speaking.
                Short text stays in seconds.
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="text-ink-muted">
                  Reading WPM
                  <input
                    type="number"
                    min={60}
                    max={400}
                    value={readingWpm}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (next >= 60 && next <= 400) setReadingWpm(next);
                    }}
                    className="mt-1 block h-9 w-24 rounded-control border border-line bg-surface px-2 tabular-nums text-ink"
                  />
                </label>
                <label className="text-ink-muted">
                  Speaking WPM
                  <input
                    type="number"
                    min={60}
                    max={400}
                    value={speakingWpm}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (next >= 60 && next <= 400) setSpeakingWpm(next);
                    }}
                    className="mt-1 block h-9 w-24 rounded-control border border-line bg-surface px-2 tabular-nums text-ink"
                  />
                </label>
              </div>
              <label className="flex items-start gap-2 text-ink">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={autosave}
                  onChange={(event) => handleAutosave(event.target.checked)}
                />
                <span>
                  Save this draft on this device
                  <span className="mt-1 block text-ink-muted">
                    Off by default. Text stays in browser storage, which is not
                    encrypted by WordMelo. Uncheck to delete it.
                  </span>
                </span>
              </label>
              {draftNote ? <p className="text-ink-muted">{draftNote}</p> : null}
            </div>
          </details>
        </section>
      </div>

      <section aria-labelledby="keyword-heading" className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="keyword-heading" className="font-sans text-base font-semibold text-ink">
              Keyword density analysis
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Density is the phrase count divided by every word, or every adjacent
              pair or triple, in this draft. It is not a ranking target.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {([1, 2, 3] as const).map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={phraseSize === size}
                onClick={() => setPhraseSize(size)}
                className={cn(
                  "h-9 rounded-control border px-3 text-sm font-semibold",
                  phraseSize === size
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink-muted",
                )}
              >
                {size === 1 ? "1 word" : `${size} words`}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={keywordLimit === 20}
              onClick={() => setKeywordLimit((value) => (value === 10 ? 20 : 10))}
              className="h-9 rounded-control border border-line px-3 text-sm font-semibold text-ink-muted"
            >
              {keywordLimit === 10 ? "Show top 20" : "Show top 10"}
            </button>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={excludeStopWords}
            onChange={(event) => setExcludeStopWords(event.target.checked)}
          />
          Hide common stop words
        </label>
        {keywords.rows.length === 0 ? (
          <p className="mt-5 text-sm text-ink-muted">
            Keyword rows appear once the draft has countable words.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[18rem] text-left text-sm">
              <caption className="sr-only">
                Top keywords and their share of {keywords.denominator.toLocaleString("en-US")}{" "}
                {phraseSize === 1 ? "words" : "phrases"}
              </caption>
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Keyword</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Count</th>
                  <th scope="col" className="py-2 font-medium">Density</th>
                </tr>
              </thead>
              <tbody>
                {keywords.rows.map((row) => (
                  <tr key={row.keyword} className="border-b border-line/70 last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium text-ink">{row.keyword}</th>
                    <td className="py-2 pr-3 tabular-nums text-ink-muted">{row.count.toLocaleString("en-US")}</td>
                    <td className="py-2 tabular-nums text-ink-muted">
                      {row.density == null ? "—" : `${row.density.toLocaleString("en-US")}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="readability-heading" className="surface-card p-5 sm:p-6">
        <h2 id="readability-heading" className="font-sans text-base font-semibold text-ink">
          Readability analysis
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Flesch Reading Ease and Flesch–Kincaid grade use an English syllable
          estimate. They describe reading difficulty, not writing quality or search ranking.
        </p>
        {!readability || !readability.available ? (
          <p className="mt-4 text-sm text-ink-muted">
            {readability?.reason ?? "Add a sentence to estimate readability."}
          </p>
        ) : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Reading ease</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">{readability.fleschEase}</dd>
              <p className="text-sm text-ink-muted">{readability.label}</p>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Grade level</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {readability.fleschGrade != null && readability.fleschGrade < 1
                  ? "Below grade 1"
                  : readability.fleschGrade}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Sentence length</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {readability.averageSentenceLength} words
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Word length</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {readability.averageWordLength} characters
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Estimated syllables</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {readability.syllables?.toLocaleString("en-US")}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
