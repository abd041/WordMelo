"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  computeTextStats,
  formatDuration,
} from "@/lib/tools/word-counter/count";

const SAMPLE =
  "WordMelo makes everyday writing easier. Paste a draft here to see live word and character counts with reading time — privately in your browser.";

const EMPTY = {
  words: 0,
  charactersWithSpaces: 0,
  readingSeconds: 0,
};

export function MiniWordCounter() {
  const editorId = useId();
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);

  const stats = useMemo(() => {
    if (!deferred) return EMPTY;
    const full = computeTextStats(deferred);
    return {
      words: full.words,
      charactersWithSpaces: full.charactersWithSpaces,
      readingSeconds: full.readingSeconds,
    };
  }, [deferred]);

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-accent/20 bg-surface shadow-glow">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-mint to-accent-soft/40 px-4 py-3.5 sm:px-6 sm:py-4">
        <div>
          <p className="text-sm font-semibold text-ink sm:text-base">
            Live Word Counter
          </p>
          <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">
            Type or paste — counts update instantly
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-accent shadow-soft">
          Local only
        </span>
      </div>

      <div
        className="grid grid-cols-3 divide-x divide-line border-b border-line bg-mint/30"
        aria-live="polite"
        aria-atomic="true"
      >
        {[
          {
            label: "Words",
            value: stats.words.toLocaleString("en-US"),
          },
          {
            label: "Characters",
            value: stats.charactersWithSpaces.toLocaleString("en-US"),
          },
          {
            label: "Reading",
            value: formatDuration(stats.readingSeconds),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-2.5 py-3.5 text-center sm:px-4 sm:py-5"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink-muted sm:text-xs">
              {stat.label}
            </p>
            <p className="mt-1.5 font-sans text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-3xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <label htmlFor={editorId} className="sr-only">
        Try the Word Counter
      </label>
      <textarea
        id={editorId}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type or paste text to count words…"
        spellCheck
        rows={6}
        className="min-h-[10.5rem] w-full resize-y bg-transparent px-4 py-4 font-serif text-[1.05rem] leading-8 text-ink placeholder:text-ink-soft sm:min-h-[15rem] sm:px-6 sm:py-5 sm:text-lg sm:leading-8 lg:min-h-[17rem]"
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-4 py-3.5 sm:px-6 sm:py-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setText(SAMPLE)}
        >
          Sample text
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
        >
          Clear
        </Button>
        <Link
          href="/word-counter"
          className="ml-auto inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft hover:text-accent-hover"
        >
          Open full tool
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
