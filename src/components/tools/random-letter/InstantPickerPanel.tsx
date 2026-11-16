"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Maximize2, Minimize2, Shuffle } from "lucide-react";
import { LetterFiltersPanel } from "@/components/tools/random-letter/LetterFiltersPanel";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  drawOne,
  eligiblePool,
  poolLabel,
  runSecureDraw,
  type LetterFilters,
} from "@/lib/tools/random-letter";
import { cn, copyTextToClipboard } from "@/lib/utils";

interface InstantPickerPanelProps {
  active?: boolean;
  filters: LetterFilters;
  onFiltersChange: (next: LetterFilters) => void;
  preferFocus?: boolean;
}

export function InstantPickerPanel({
  active = true,
  filters,
  onFiltersChange,
  preferFocus = false,
}: InstantPickerPanelProps) {
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [focusMode, setFocusMode] = useState(preferFocus);
  const [copied, setCopied] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);

  const poolSize = eligiblePool(
    filters,
    filters.noRepeatSession ? used : undefined,
  ).length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const generate = useCallback(() => {
    const result = runSecureDraw(() =>
      drawOne(filters, {
        usedBase: filters.noRepeatSession ? used : undefined,
      }),
    );
    if (!result.letters[0] || !result.bases[0]) {
      setLetter(null);
      setBase(null);
      setFeedback({
        message: result.message ?? "No letter available",
        tone: "neutral",
      });
      return;
    }
    const nextLetter = result.letters[0];
    const nextBase = result.bases[0];
    setLetter(nextLetter);
    setBase(nextBase);
    setRevealKey((k) => k + 1);
    if (filters.noRepeatSession) {
      setUsed((prev) => {
        const next = new Set(prev);
        next.add(nextBase);
        return next;
      });
    }
    setRecent((prev) => [nextLetter, ...prev].slice(0, 12));
    setFeedback(null);
  }, [filters, used]);

  useEffect(() => {
    if (preferFocus) setFocusMode(true);
  }, [preferFocus]);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON" ||
        tag === "A"
      ) {
        return;
      }
      if (event.key === "Escape" && focusMode) {
        setFocusMode(false);
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => undefined);
        }
        return;
      }
      if (event.code === "Space" || event.key.toLowerCase() === "g") {
        event.preventDefault();
        generate();
      }
      if (event.key.toLowerCase() === "c" && letter) {
        event.preventDefault();
        void handleCopy();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, focusMode, generate, letter]);

  async function handleCopy() {
    if (!letter) return;
    const ok = await copyTextToClipboard(letter);
    if (ok) {
      setCopied(true);
      setFeedback({ message: "Copied letter", tone: "success" });
      window.setTimeout(() => setCopied(false), 1400);
    } else {
      setFeedback({
        message: "Could not copy — check clipboard permissions",
        tone: "error",
      });
    }
  }

  function resetSession() {
    setUsed(new Set());
    setLetter(null);
    setBase(null);
    setRecent([]);
    setFeedback({
      message: "Session reset — all eligible letters available again",
      tone: "neutral",
    });
  }

  async function toggleFocus() {
    const next = !focusMode;
    setFocusMode(next);
    if (next) {
      try {
        await stageRef.current?.requestFullscreen?.();
      } catch {
        // In-page focus mode remains usable without Fullscreen API.
      }
    } else if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }

  return (
    <div
      ref={stageRef}
      className={cn(
        "grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
        focusMode &&
          "fixed inset-0 z-50 grid-cols-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_#e8f5f2_0%,_#f7f4ef_55%,_#f0ebe3_100%)] p-4 sm:p-8",
      )}
    >
      <section
        aria-labelledby={`${id}-stage`}
        className="overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-soft"
      >
        <div className="border-b border-line bg-gradient-to-br from-mint/50 via-surface to-paper px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Alphabet studio · Instant
              </p>
              <h2
                id={`${id}-stage`}
                className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl"
              >
                Letter stage
              </h2>
              <p className="mt-1 text-xs text-ink-soft sm:text-sm">
                {poolLabel(filters)}
                {filters.noRepeatSession
                  ? ` · ${poolSize} remaining`
                  : ""}
                {filters.noRepeatSession && used.size > 0
                  ? ` · ${used.size} used`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void toggleFocus()}
              aria-pressed={focusMode}
            >
              {focusMode ? (
                <Minimize2 className="h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden />
              )}
              {focusMode ? "Exit focus" : "Focus Mode"}
            </Button>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {feedback ? (
            <div className="mb-4">
              <FeedbackMessage
                message={feedback.message}
                tone={feedback.tone}
                onDismiss={() => setFeedback(null)}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative flex min-h-[14rem] flex-col items-center justify-center overflow-hidden rounded-[1.3rem] border border-accent/25 bg-[radial-gradient(circle_at_50%_30%,_#d9f0eb_0%,_#f7f4ef_62%,_#efe9df_100%)] px-4 py-10 sm:min-h-[16rem]",
              focusMode && "min-h-[42vh] border-accent/35 sm:min-h-[55vh]",
            )}
            aria-live="polite"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
              aria-hidden
            />

            {letter ? (
              <div className="relative text-center">
                <p
                  key={revealKey}
                  className={cn(
                    "font-display font-semibold leading-none tracking-tight text-ink",
                    focusMode
                      ? "text-[7.5rem] sm:text-[11rem]"
                      : "text-7xl sm:text-8xl md:text-9xl",
                    !reducedMotion && "animate-letter-reveal",
                  )}
                >
                  {letter}
                </p>
                <p className="mt-4 text-sm text-ink-muted">
                  Base letter <span className="font-semibold text-ink">{base}</span>
                </p>
              </div>
            ) : (
              <div className="relative max-w-md text-center">
                <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                  Ready to pick your first letter?
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                  Fair A–Z draws stay in your browser. Choose a pool, then generate.
                </p>
                <div className="mt-5">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={generate}
                  >
                    <Shuffle className="h-4 w-4" aria-hidden />
                    Generate Random Letter
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {letter ? (
              <Button type="button" variant="primary" size="lg" onClick={generate}>
                <Shuffle className="h-4 w-4" aria-hidden />
                Generate Again
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={!letter}
              onClick={() => void handleCopy()}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              Copy Letter
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={resetSession}>
              Reset Session
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Shortcuts: Space / G generate · C copy · Esc exit focus
          </p>

          {recent.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-ink">Recent draws</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {recent.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <button
                      type="button"
                      className="inline-flex h-10 min-w-10 items-center justify-center rounded-[0.85rem] border border-line bg-paper px-2.5 font-display text-base font-semibold text-ink transition-colors hover:border-accent hover:bg-mint/40"
                      onClick={() => void copyTextToClipboard(item)}
                      aria-label={`Copy recent letter ${item}`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
              {filters.noRepeatSession && used.size > 0 ? (
                <p className="mt-2 text-xs text-ink-soft">
                  Used bases this session: {[...used].sort().join(" ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {!focusMode ? (
        <aside className="rounded-[1.4rem] border border-line bg-surface p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Settings
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Pool, case, and exclusions apply to every Instant draw.
          </p>
          <div className="mt-4">
            <LetterFiltersPanel
              filters={filters}
              onChange={onFiltersChange}
              usedCount={filters.noRepeatSession ? used.size : 0}
            />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
