"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Check, Copy, Shuffle, SkipForward } from "lucide-react";
import { FilterControls } from "@/components/tools/pictionary/FilterControls";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  PICTIONARY_PROMPTS,
  countEligible,
  drawPrompt,
  getCategoryLabel,
  type PictionaryPrompt,
  type PromptFilters,
} from "@/lib/tools/pictionary";
import { cn, copyTextToClipboard } from "@/lib/utils";

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
  const [usedIds, setUsedIds] = useState<Set<string>>(() => new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const eligibleNow = countEligible(
    filters,
    filters.noRepeat ? usedIds : undefined,
  );

  const draw = useCallback(() => {
    const result = drawPrompt(PICTIONARY_PROMPTS, filters, {
      usedIds: filters.noRepeat ? usedIds : undefined,
    });

    if (result.prompt) {
      setPrompt(result.prompt);
      setMessage(null);
      setUsedIds((prev) => {
        const next = new Set(prev);
        next.add(result.prompt!.id);
        return next;
      });
      setRecent((prev) =>
        [result.prompt!.text, ...prev.filter((t) => t !== result.prompt!.text)].slice(
          0,
          8,
        ),
      );
      setFeedback({
        message: `${Math.max(0, result.poolSize - 1).toLocaleString()} eligible left after this draw`,
        tone: "success",
      });
    } else {
      setPrompt(null);
      setMessage(result.message ?? "No prompts available");
      setFeedback({
        message: result.message ?? "No prompts available",
        tone: "neutral",
      });
    }
  }, [filters, usedIds]);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.code === "Space") {
        event.preventDefault();
        draw();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, draw]);

  async function handleCopy() {
    if (!prompt) return;
    const ok = await copyTextToClipboard(prompt.text);
    if (ok) {
      setCopied(true);
      setFeedback({ message: "Copied prompt", tone: "success" });
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      setFeedback({
        message: "Could not copy — check clipboard permissions",
        tone: "error",
      });
    }
  }

  function handleResetSession() {
    setUsedIds(new Set());
    setPrompt(null);
    setRecent([]);
    setMessage(null);
    setFeedback({ message: "Session reset — all prompts eligible again", tone: "neutral" });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
      {/* Prompt stage — primary */}
      <section
        aria-labelledby={`${id}-stage`}
        className="rounded-[1.35rem] border border-line bg-surface p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Draw this
            </p>
            <h2
              id={`${id}-stage`}
              className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              Drawing prompt
            </h2>
          </div>
          <p className="text-xs text-ink-soft" aria-live="polite">
            {eligibleNow.toLocaleString()} eligible · {usedIds.size} used
          </p>
        </div>

        {feedback ? (
          <div className="mt-3">
            <FeedbackMessage
              message={feedback.message}
              tone={feedback.tone}
              onDismiss={() => setFeedback(null)}
            />
          </div>
        ) : null}

        {prompt ? (
          <div className="mt-6 rounded-[1.25rem] border border-accent/25 bg-gradient-to-b from-mint/50 to-paper px-5 py-12 text-center sm:px-8 sm:py-14">
            <p className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {prompt.text}
            </p>
            <p className="mt-5 text-sm font-medium text-ink-muted sm:text-base">
              <span className="capitalize">{prompt.difficulty}</span>
              <span className="mx-2 text-ink-soft">·</span>
              {getCategoryLabel(prompt.category)}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.25rem] border border-dashed border-line bg-paper px-5 py-14 text-center sm:py-16">
            <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Ready when you are
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              {message ??
                "Press Generate Prompt for a family-friendly drawing word from the curated list."}
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-6 shadow-lift"
              onClick={draw}
            >
              <Shuffle className="h-4 w-4" aria-hidden />
              Generate Prompt
            </Button>
            <p className="mt-3 text-xs text-ink-soft">Shortcut: Space</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {prompt ? (
            <Button type="button" variant="primary" size="lg" onClick={draw}>
              <SkipForward className="h-4 w-4" aria-hidden />
              Next Prompt
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={!prompt}
            onClick={() => void handleCopy()}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            Copy Prompt
          </Button>
          {prompt ? (
            <Button type="button" variant="ghost" size="lg" onClick={draw}>
              <Shuffle className="h-4 w-4" aria-hidden />
              Generate
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="lg" onClick={handleResetSession}>
            Reset Session
          </Button>
        </div>

        {recent.length > 0 ? (
          <div className="mt-6 border-t border-line pt-4">
            <h3 className="text-sm font-semibold text-ink">Recent this session</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {recent.map((text) => (
                <li
                  key={text}
                  className="rounded-control border border-line bg-paper px-2.5 py-1 text-xs text-ink-muted"
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* Filters */}
      <section className="rounded-[1.35rem] border border-line bg-surface p-4 shadow-soft sm:p-5 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Curated non-living subjects only.
        </p>
        <div className="mt-4">
          <FilterControls
            idPrefix={`${id}-quick`}
            filters={filters}
            onChange={onFiltersChange}
            usedIds={usedIds}
          />
        </div>
        {eligibleNow === 0 ? (
          <div
            role="status"
            className={cn(
              "mt-4 rounded-control border border-dashed border-line bg-paper px-3 py-3 text-sm text-ink-muted",
            )}
          >
            No eligible prompts with these filters and session exclusions. Clear
            categories, switch difficulty, or reset the session.
          </div>
        ) : null}
      </section>
    </div>
  );
}
