import { roundStat } from "@/lib/tools/typing-speed/metrics";
import type { WpmSample } from "@/lib/tools/typing-speed/types";

export function WpmChart({ samples }: { samples: WpmSample[] }) {
  const width = 640;
  const height = 180;
  const pad = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxX = Math.max(1, ...samples.map((sample) => sample.elapsedMs));
  const maxY = Math.max(20, ...samples.map((sample) => Math.max(sample.netWpm, sample.grossWpm)));
  const x = (ms: number) => pad.left + (ms / maxX) * innerW;
  const y = (wpm: number) => pad.top + innerH - (wpm / maxY) * innerH;
  const net = samples.map((sample) => `${x(sample.elapsedMs)},${y(sample.netWpm)}`).join(" ");
  const gross = samples.map((sample) => `${x(sample.elapsedMs)},${y(sample.grossWpm)}`).join(" ");
  const last = samples[samples.length - 1];
  const summary = last
    ? `Net WPM moved from 0 to ${roundStat(last.netWpm)} over ${(last.elapsedMs / 1000).toFixed(0)} seconds. Gross WPM ended at ${roundStat(last.grossWpm)}.`
    : "No timing samples yet.";

  return (
    <figure className="mt-4">
      <figcaption className="sr-only">{summary}</figcaption>
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-full text-ink"
      >
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="currentColor" strokeOpacity="0.2" />
        <line
          x1={pad.left}
          y1={pad.top + innerH}
          x2={pad.left + innerW}
          y2={pad.top + innerH}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <text x={pad.left} y={12} className="fill-ink-muted" fontSize="11">
          WPM
        </text>
        <text x={pad.left + innerW} y={height - 8} textAnchor="end" className="fill-ink-muted" fontSize="11">
          Time
        </text>
        <polyline fill="none" stroke="var(--ink-soft)" strokeWidth="2" points={gross} />
        <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={net} />
      </svg>
      <p className="mt-2 text-sm text-ink-muted">
        Teal line: net WPM. Gray line: gross WPM. {summary}
      </p>
    </figure>
  );
}
