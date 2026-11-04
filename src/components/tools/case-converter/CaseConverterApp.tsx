"use client";

import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownUp,
  Check,
  Copy,
  Download,
  Eraser,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  CASE_MODE_EXAMPLE_SOURCE,
  CASE_MODE_GROUPS,
  type CaseModeId,
  convertCase,
  getCaseMode,
  getCaseModesByGroup,
} from "@/lib/tools/case-converter";
import {
  countCharactersWithSpaces,
  countWords,
} from "@/lib/tools/word-counter/count";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

const SAMPLE_TEXT = `Welcome to WordMelo — a free online Case Converter.

Paste a DRAFT here to convert UPPERCASE to lowercase, fix Title Case headlines, or shape camelCase identifiers. Try hyphenated phrases like well-known tools, and note that Dr. Adams stays intact in Sentence case.`;

export function CaseConverterApp() {
  const inputId = useId();
  const outputId = useId();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CaseModeId>("uppercase");
  const [undoInput, setUndoInput] = useState<string | null>(null);
  const [copied, setCopied] = useState<"output" | "input" | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  const exactOutput = useMemo(() => convertCase(input, mode), [input, mode]);
  const output = useDeferredValue(exactOutput);
  const activeMode = getCaseMode(mode);
  const modePreview = useMemo(
    () => convertCase(CASE_MODE_EXAMPLE_SOURCE, mode),
    [mode],
  );

  const inputWords = countWords(input);
  const inputChars = countCharactersWithSpaces(input);
  const outputWords = countWords(output);
  const outputChars = countCharactersWithSpaces(output);
  const lineCount = Math.max(1, input.split("\n").length);
  const textareaRows = Math.min(12, Math.max(5, lineCount + 2));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "c") {
        event.preventDefault();
        const text = convertCase(input, mode);
        void (async () => {
          if (!text) {
            showFeedback("Nothing to copy from converted text", "neutral");
            return;
          }
          const ok = await copyTextToClipboard(text);
          if (ok) {
            setCopied("output");
            showFeedback("Copied converted text", "success");
            window.setTimeout(() => {
              setCopied((current) => (current === "output" ? null : current));
            }, 1800);
          } else {
            showFeedback(
              "Could not copy — check clipboard permissions",
              "error",
            );
          }
        })();
      } else if (key === "s") {
        event.preventDefault();
        setInput(SAMPLE_TEXT);
        setUndoInput(null);
        showFeedback("Sample text loaded", "success");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [input, mode]);

  function showFeedback(
    message: string,
    tone: "success" | "error" | "neutral" = "neutral",
  ) {
    setFeedback({ message, tone });
  }

  async function handleCopy(
    target: "output" | "input",
    text: string,
    label: string,
  ) {
    if (!text) {
      showFeedback(`Nothing to copy from ${label}`, "neutral");
      return;
    }
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(target);
      showFeedback(`Copied ${label}`, "success");
      window.setTimeout(() => {
        setCopied((current) => (current === target ? null : current));
      }, 1800);
    } else {
      showFeedback("Could not copy — check clipboard permissions", "error");
    }
  }

  function handleDownload() {
    const text = convertCase(input, mode);
    if (!text) {
      showFeedback("Convert some text before downloading", "neutral");
      return;
    }
    downloadTextFile("WordMelo-case-converter.txt", text);
    showFeedback("Download started", "success");
  }

  function handleUseAsInput() {
    const text = convertCase(input, mode);
    if (!text) {
      showFeedback("No output to move into the input", "neutral");
      return;
    }
    setUndoInput(input);
    setInput(text);
    showFeedback("Output replaced input — Undo available", "success");
  }

  function handleUndoReplace() {
    if (undoInput === null) return;
    setInput(undoInput);
    setUndoInput(null);
    showFeedback("Restored previous input", "neutral");
  }

  function handleClear() {
    setInput("");
    setUndoInput(null);
    showFeedback("Editor cleared", "neutral");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section
        aria-labelledby="case-modes-heading"
        className="rounded-[1.15rem] border border-accent/20 bg-surface p-3.5 shadow-glow sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2
              id="case-modes-heading"
              className="font-sans text-base font-semibold text-ink"
            >
              Conversion mode
            </h2>
            <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
              <span className="font-medium text-ink">{activeMode.label}</span>
              {" — "}
              {activeMode.description}
            </p>
            <p className="mt-1 break-all font-serif text-sm text-accent sm:text-base">
              <span className="sr-only">Example: </span>
              {CASE_MODE_EXAMPLE_SOURCE} → {modePreview}
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Local only
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {CASE_MODE_GROUPS.map((group) => {
            const modes = getCaseModesByGroup(group.id);
            return (
              <div key={group.id}>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {group.label}
                  </h3>
                  <span className="text-xs text-ink-soft">{group.blurb}</span>
                </div>
                <div
                  role="radiogroup"
                  aria-label={group.label}
                  className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4"
                >
                  {modes.map((item) => {
                    const selected = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${item.label}. ${item.description}. Example: ${convertCase(CASE_MODE_EXAMPLE_SOURCE, item.id)}`}
                        onClick={() => setMode(item.id)}
                        className={cn(
                          "rounded-control border px-2.5 py-2 text-left transition-colors duration-200",
                          selected
                            ? "border-accent bg-accent text-accent-foreground shadow-soft"
                            : "border-line bg-paper text-ink hover:border-line-strong hover:bg-mint/60",
                        )}
                      >
                        <span className="block text-[0.82rem] font-semibold leading-5 sm:text-sm">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Shortcuts: Alt+C copy output · Alt+S load sample
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <section
          aria-labelledby="case-input-heading"
          className="flex min-h-0 flex-col overflow-hidden rounded-[1.15rem] border border-line bg-surface shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-mint/40 px-3.5 py-2.5 sm:px-4">
            <h2
              id="case-input-heading"
              className="font-sans text-sm font-semibold text-ink"
            >
              Original text
            </h2>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInput(SAMPLE_TEXT);
                  setUndoInput(null);
                  showFeedback("Sample text loaded", "success");
                }}
              >
                Sample
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!input}
                onClick={handleClear}
              >
                <Eraser className="h-4 w-4" aria-hidden />
                Clear
              </Button>
            </div>
          </div>

          <label htmlFor={inputId} className="sr-only">
            Text to convert
          </label>
          {input.length === 0 ? (
            <p className="border-b border-dashed border-line bg-mint/20 px-3.5 py-2 text-sm text-ink-muted sm:px-4">
              Paste a paragraph, headline, or identifier — output updates as you
              type.
            </p>
          ) : null}
          <textarea
            id={inputId}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (undoInput !== null) setUndoInput(null);
            }}
            placeholder="Type or paste text to convert case…"
            spellCheck
            rows={textareaRows}
            className="min-h-[10rem] w-full flex-1 resize-y bg-transparent px-3.5 py-3 font-serif text-[1.05rem] leading-7 text-ink placeholder:text-ink-soft sm:min-h-[12rem] sm:px-4 sm:text-lg sm:leading-8"
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-mint/25 px-3.5 py-2 text-sm text-ink-muted sm:px-4">
            <span>
              <span className="font-medium tabular-nums text-ink">
                {inputWords.toLocaleString("en-US")}
              </span>{" "}
              words ·{" "}
              <span className="font-medium tabular-nums text-ink">
                {inputChars.toLocaleString("en-US")}
              </span>{" "}
              chars
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto"
              disabled={!input}
              onClick={() => handleCopy("input", input, "original text")}
              aria-label={
                copied === "input" ? "Original text copied" : "Copy original text"
              }
            >
              {copied === "input" ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied === "input" ? "Copied" : "Copy original"}
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="case-output-heading"
          className="flex min-h-0 flex-col overflow-hidden rounded-[1.15rem] border border-accent/20 bg-surface shadow-glow"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-gradient-to-r from-mint to-accent-soft/40 px-3.5 py-2.5 sm:px-4">
            <div className="min-w-0">
              <h2
                id="case-output-heading"
                className="font-sans text-sm font-semibold text-ink"
              >
                Converted output
              </h2>
              <p className="truncate text-xs text-ink-muted">
                {activeMode.label}
                {activeMode.kind === "programming"
                  ? " · separators rewritten"
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!exactOutput}
                onClick={() =>
                  handleCopy("output", exactOutput, "converted text")
                }
                aria-label={
                  copied === "output"
                    ? "Converted text copied"
                    : "Copy converted text"
                }
              >
                {copied === "output" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied === "output" ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!exactOutput}
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!exactOutput}
                onClick={handleUseAsInput}
                aria-label="Replace original text with converted output"
              >
                <ArrowDownUp className="h-4 w-4" aria-hidden />
                Use as input
              </Button>
              {undoInput !== null ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUndoReplace}
                  aria-label="Undo last use as input"
                >
                  <Undo2 className="h-4 w-4" aria-hidden />
                  Undo
                </Button>
              ) : null}
            </div>
          </div>

          <label htmlFor={outputId} className="sr-only">
            Converted text output
          </label>
          <textarea
            id={outputId}
            value={output}
            readOnly
            rows={textareaRows}
            placeholder="Converted text appears here…"
            className="min-h-[10rem] w-full flex-1 resize-y bg-transparent px-3.5 py-3 font-serif text-[1.05rem] leading-7 text-ink placeholder:text-ink-soft sm:min-h-[12rem] sm:px-4 sm:text-lg sm:leading-8"
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-mint/25 px-3.5 py-2 text-sm text-ink-muted sm:px-4">
            <span>
              <span className="font-medium tabular-nums text-ink">
                {outputWords.toLocaleString("en-US")}
              </span>{" "}
              words ·{" "}
              <span className="font-medium tabular-nums text-ink">
                {outputChars.toLocaleString("en-US")}
              </span>{" "}
              chars
              {activeMode.kind === "programming" && input && outputWords !== inputWords
                ? " · counts may change"
                : ""}
            </span>
            <div className="ml-auto min-h-[1.75rem]">
              <FeedbackMessage
                message={feedback?.message ?? null}
                tone={feedback?.tone}
                onDismiss={() => setFeedback(null)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
