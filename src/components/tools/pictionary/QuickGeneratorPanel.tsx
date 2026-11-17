"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Check, Copy, Eye, EyeOff, Keyboard, RotateCcw, Shuffle } from "lucide-react";
import { FilterControls } from "@/components/tools/pictionary/FilterControls";
import { ShortcutDialog } from "@/components/tools/pictionary/ShortcutDialog";
import { WordListPanel } from "@/components/tools/pictionary/WordListPanel";
import { Button } from "@/components/ui/Button";
import {
  PICTIONARY_PROMPTS,
  countEligible,
  describeShortcutTarget,
  drawPrompt,
  getCategoryLabel,
  shortcutFromKey,
  type PictionaryPrompt,
  type PromptFilters,
} from "@/lib/tools/pictionary";
import { copyTextToClipboard } from "@/lib/utils";

interface QuickGeneratorPanelProps {
  active?: boolean;
  filters: PromptFilters;
  onFiltersChange: (next: PromptFilters) => void;
}

export function QuickGeneratorPanel({
  active = true,
  filters,
  onFiltersChange,
}: QuickGeneratorPanelProps) {
  const id = useId();
  const [prompt, setPrompt] = useState<PictionaryPrompt | null>(null);
  const [hidden, setHidden] = useState(false);
  const [usedIds, setUsedIds] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState("No drawing word yet.");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  const eligibleNow = countEligible(filters, filters.noRepeat ? usedIds : undefined);

  const draw = useCallback(() => {
    const result = drawPrompt(PICTIONARY_PROMPTS, filters, {
      usedIds: filters.noRepeat ? usedIds : undefined,
    });
    if (!result.prompt) {
      setPrompt(null);
      setMessage(result.message ?? "No prompts available.");
      setStatus(result.message ?? "No prompts available.");
      return;
    }
    setPrompt(result.prompt);
    setMessage(null);
    setCopyError(null);
    setUsedIds((prev) => {
      const next = new Set(prev);
      next.add(result.prompt!.id);
      return next;
    });
    const label = `${result.prompt.text}, ${result.prompt.difficulty}, ${getCategoryLabel(result.prompt.category)}`;
    setStatus(hidden ? "New drawing word ready and hidden." : `Drawing word: ${label}.`);
  }, [filters, hidden, usedIds]);

  const copyWord = useCallback(async () => {
    if (!prompt) return;
    const ok = await copyTextToClipboard(prompt.text);
    if (ok) {
      setCopied(true);
      setCopyError(null);
      setStatus(hidden ? "Copied the hidden word." : "Copied the drawing word.");
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      setCopyError("Could not copy. Check clipboard permissions and try again.");
    }
  }, [hidden, prompt]);

  useEffect(() => {
    if (!active || helpOpen) return;
    function onKey(event: KeyboardEvent) {
      const action = shortcutFromKey({
        key: event.key,
        code: event.code,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        target: describeShortcutTarget(event.target),
      });
      if (!action) return;
      if (action === "generate") {
        event.preventDefault();
        draw();
      } else if (action === "toggle-hidden" && prompt) {
        event.preventDefault();
        setHidden((value) => !value);
      } else if (action === "copy") {
        event.preventDefault();
        void copyWord();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, copyWord, draw, helpOpen, prompt]);

  function resetPool() {
    setUsedIds(new Set());
    setPrompt(null);
    setHidden(false);
    setMessage(null);
    setStatus("Word pool reset. Every matching prompt is eligible again.");
  }

  const wordVisible = Boolean(prompt) && !hidden;

  return (
    <div className="space-y-4">
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <FilterControls
        idPrefix={`${id}-quick-difficulty`}
        filters={filters}
        onChange={onFiltersChange}
        usedIds={usedIds}
        showCategories={false}
        showNoRepeat={false}
        compactDifficulty
      />

      <section aria-labelledby={`${id}-stage`} className="rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={`${id}-stage`} className="font-display text-lg font-semibold text-ink">
            Drawing word
          </h2>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 rounded-control px-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink"
            onClick={() => setHelpOpen(true)}
          >
            <Keyboard className="h-4 w-4" aria-hidden />
            Shortcuts
          </button>
        </div>

        <div className="mt-4 flex min-h-52 flex-col items-center justify-center rounded-[1.1rem] border border-line bg-paper px-4 py-8 text-center sm:min-h-60">
          {prompt && wordVisible ? (
            <div key={prompt.id} className="motion-safe:animate-fade-in">
              <p className="break-words font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                {prompt.text}
              </p>
              <p className="mt-4 text-sm font-medium text-ink-muted">
                <span className="capitalize">{prompt.difficulty}</span>
                <span className="mx-2 text-ink-soft" aria-hidden>
                  ·
                </span>
                <span>{getCategoryLabel(prompt.category)}</span>
                <span className="mx-2 text-ink-soft" aria-hidden>
                  ·
                </span>
                <span>Visible</span>
              </p>
            </div>
          ) : prompt ? (
            <div>
              <p className="font-display text-3xl font-semibold text-ink">Word hidden</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                The prompt stays off this screen until you reveal it. Hiding is visual only and is not encryption.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-display text-3xl font-semibold text-ink">Ready to draw</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                {message ?? "Generate a word from the curated list. Nothing is uploaded."}
              </p>
            </div>
          )}
        </div>

        {message && prompt === null ? (
          <p role="status" className="mt-3 text-sm text-ink-muted">
            {message}
          </p>
        ) : null}
        {copyError ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {copyError}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" size="lg" className="w-full sm:w-auto" onClick={draw} aria-keyshortcuts="Space N">
            <Shuffle className="h-4 w-4" aria-hidden />
            Generate New Word
          </Button>
          <Button type="button" variant="secondary" size="lg" disabled={!prompt} onClick={() => void copyWord()}>
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            Copy
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={!prompt}
            aria-pressed={hidden}
            onClick={() => {
              setHidden((value) => !value);
              setStatus(hidden ? "Drawing word revealed." : "Drawing word hidden.");
            }}
          >
            {hidden ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
            {hidden ? "Reveal Word" : "Hide Word"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={resetPool}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-soft" aria-live="polite">
          {eligibleNow.toLocaleString()} eligible
          {filters.noRepeat ? ` · ${usedIds.size} used this session` : ""}
          {" · "}Space or N for a new word
        </p>
      </section>

      <FilterControls
        idPrefix={`${id}-quick-filters`}
        filters={filters}
        onChange={onFiltersChange}
        usedIds={usedIds}
        showDifficulty={false}
      />

      <WordListPanel />

      <ShortcutDialog open={helpOpen} onClose={closeHelp} />
    </div>
  );
}
