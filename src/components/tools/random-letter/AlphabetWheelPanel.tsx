"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { LetterFiltersPanel } from "@/components/tools/random-letter/LetterFiltersPanel";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  drawOne,
  eligiblePool,
  polarToCartesian,
  rotationToLandOn,
  segmentAngleDeg,
  type LetterFilters,
} from "@/lib/tools/random-letter";
import { cn } from "@/lib/utils";

interface AlphabetWheelPanelProps {
  active?: boolean;
  filters: LetterFilters;
  onFiltersChange: (next: LetterFilters) => void;
}

const WHEEL_SIZE = 320;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const OUTER_R = 148;
const INNER_R = 52;
const LABEL_R = 108;

function segmentPath(index: number, n: number): string {
  const seg = segmentAngleDeg(n);
  const start = index * seg;
  const end = (index + 1) * seg;
  const p1 = polarToCartesian(CX, CY, OUTER_R, start);
  const p2 = polarToCartesian(CX, CY, OUTER_R, end);
  const p3 = polarToCartesian(CX, CY, INNER_R, end);
  const p4 = polarToCartesian(CX, CY, INNER_R, start);
  const large = seg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export function AlphabetWheelPanel({
  active = true,
  filters,
  onFiltersChange,
}: AlphabetWheelPanelProps) {
  const id = useId();
  const [letter, setLetter] = useState<string | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [transitionOn, setTransitionOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const timerRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  const pool = useMemo(
    () =>
      eligiblePool(
        filters,
        filters.noRepeatSession ? used : undefined,
      ),
    [filters, used],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active && timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      setSpinning(false);
      setTransitionOn(false);
    }
  }, [active]);

  function spin() {
    if (spinning) return;
    const livePool = eligiblePool(
      filters,
      filters.noRepeatSession ? used : undefined,
    );
    const result = drawOne(filters, {
      usedBase: filters.noRepeatSession ? used : undefined,
    });
    if (!result.letters[0] || !result.bases[0]) {
      setFeedback({
        message: result.message ?? "No letters left on the wheel",
        tone: "neutral",
      });
      return;
    }

    const nextBase = result.bases[0];
    const nextLetter = result.letters[0];
    const index = livePool.indexOf(nextBase);
    if (index < 0) {
      setFeedback({
        message: "Selected letter is no longer eligible — reset the session.",
        tone: "error",
      });
      return;
    }

    setFeedback(null);
    setSpinning(true);

    if (reducedMotion) {
      const nextRot = rotationToLandOn(
        index,
        livePool.length,
        rotationRef.current,
        0,
      );
      rotationRef.current = nextRot;
      setTransitionOn(false);
      setRotation(nextRot);
      setLetter(nextLetter);
      setBase(nextBase);
      setUsed((prev) => new Set(prev).add(nextBase));
      setSpinning(false);
      return;
    }

    // Enable CSS transition, then apply target rotation on next frame.
    setTransitionOn(true);
    const nextRot = rotationToLandOn(
      index,
      livePool.length,
      rotationRef.current,
      4,
    );
    requestAnimationFrame(() => {
      rotationRef.current = nextRot;
      setRotation(nextRot);
    });

    timerRef.current = window.setTimeout(() => {
      setLetter(nextLetter);
      setBase(nextBase);
      setUsed((prev) => new Set(prev).add(nextBase));
      setSpinning(false);
      setTransitionOn(false);
      timerRef.current = null;
    }, 2400);
  }

  function reset() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSpinning(false);
    setTransitionOn(false);
    setUsed(new Set());
    setLetter(null);
    setBase(null);
    rotationRef.current = 0;
    setRotation(0);
    setFeedback({ message: "Wheel session reset", tone: "neutral" });
  }

  const n = Math.max(pool.length, 1);
  const showLabels = pool.length > 0 && pool.length <= 26;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section
        aria-labelledby={`${id}-stage`}
        className="rounded-[1.35rem] border border-line bg-surface p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Interactive wheel
            </p>
            <h2
              id={`${id}-stage`}
              className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              Alphabet wheel
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Letter chosen first — wheel lands on that exact segment.
            </p>
          </div>
          <p className="rounded-control border border-line bg-mint/35 px-2.5 py-1 text-xs font-medium text-ink">
            {pool.length === 1 ? "1 segment" : `${pool.length} segments`}
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

        <div className="relative mx-auto mt-6 flex max-w-[20rem] flex-col items-center">
          <div
            className="absolute -top-0.5 z-20 h-0 w-0 border-l-[11px] border-r-[11px] border-t-[18px] border-l-transparent border-r-transparent border-t-ink"
            aria-hidden
          />
          <div
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-full border-[5px] border-ink/10 bg-paper shadow-lift",
              transitionOn &&
                !reducedMotion &&
                "transition-transform duration-[2400ms] ease-out",
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {pool.length === 0 ? (
              <div className="flex h-full items-center justify-center bg-mint/30 text-sm text-ink-muted">
                Empty pool
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                className="h-full w-full"
                role="img"
                aria-label={`Wheel with ${pool.length} letters`}
              >
                {pool.map((l, i) => {
                  const fill = i % 2 === 0 ? "#0f766e" : "#115e59";
                  const mid =
                    i * segmentAngleDeg(n) + segmentAngleDeg(n) / 2;
                  const label = polarToCartesian(CX, CY, LABEL_R, mid);
                  const fontSize =
                    pool.length > 18 ? 11 : pool.length > 12 ? 13 : 15;
                  return (
                    <g key={l}>
                      <path d={segmentPath(i, n)} fill={fill} />
                      {showLabels ? (
                        <text
                          x={label.x}
                          y={label.y}
                          fill="#f8fafc"
                          fontSize={fontSize}
                          fontWeight="700"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${mid}, ${label.x}, ${label.y})`}
                        >
                          {l}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <circle
                  cx={CX}
                  cy={CY}
                  r={INNER_R - 2}
                  fill="#f7f4ef"
                  stroke="#e7e5e0"
                  strokeWidth="2"
                />
              </svg>
            )}
            <div className="pointer-events-none absolute inset-[32%] flex items-center justify-center rounded-full bg-paper/95 shadow-soft">
              <span className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {spinning && !reducedMotion ? "…" : (letter ?? "?")}
              </span>
            </div>
          </div>
        </div>

        <div
          className="mt-5 rounded-[1.1rem] border border-accent/20 bg-mint/30 px-4 py-3 text-center"
          aria-live="polite"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Selected letter
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {letter ?? (spinning ? "…" : "—")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {letter
              ? `Base ${base ?? letter.toUpperCase()} · fair sampler result`
              : spinning
                ? "Spinning to predetermined letter…"
                : "Press Spin Wheel or use keyboard Generate."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={spinning || pool.length === 0}
            onClick={spin}
          >
            <Shuffle className="h-4 w-4" aria-hidden />
            Spin Wheel
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset Session
          </Button>
        </div>
      </section>

      <aside className="rounded-[1.35rem] border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Wheel settings
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Labels update with the eligible pool. No-repeat removes used bases
          from future spins.
        </p>
        <div className="mt-4">
          <LetterFiltersPanel
            filters={filters}
            onChange={onFiltersChange}
            usedCount={filters.noRepeatSession ? used.size : 0}
          />
        </div>
      </aside>
    </div>
  );
}
