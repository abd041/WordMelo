import { countForMetric } from "./count";
import type { LimitMetric, LimitStatus } from "./types";

export const DEFAULT_LIMIT = 160;
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 100_000;
export const NEAR_LIMIT_RATIO = 0.9;

export function clampLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(value)));
}

export function parseLimitInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < MIN_LIMIT) return null;
  return clampLimit(n);
}

/**
 * Compute remaining / over-limit status for a chosen metric.
 * Remaining never goes negative; overflow uses “over”.
 * When grapheme segmentation is unavailable, state is `unavailable` (no fake used count).
 */
export function computeLimitStatus(
  text: string,
  limit: number,
  metric: LimitMetric,
): LimitStatus {
  const used = countForMetric(text, metric);

  if (used == null) {
    return {
      used: null,
      limit: Number.isFinite(limit) && limit >= MIN_LIMIT ? clampLimit(limit) : 0,
      remaining: null,
      over: null,
      ratio: null,
      state: "unavailable",
      metric,
      metricUnavailable: true,
    };
  }

  if (!Number.isFinite(limit) || limit < MIN_LIMIT) {
    return {
      used,
      limit: 0,
      remaining: 0,
      over: 0,
      ratio: 0,
      state: "invalid",
      metric,
    };
  }

  const safeLimit = clampLimit(limit);
  const remaining = Math.max(0, safeLimit - used);
  const over = Math.max(0, used - safeLimit);
  const ratio = Math.min(1, used / safeLimit);

  let state: LimitStatus["state"] = "ok";
  if (used > safeLimit) state = "over";
  else if (used >= Math.ceil(safeLimit * NEAR_LIMIT_RATIO)) state = "near";

  return {
    used,
    limit: safeLimit,
    remaining,
    over,
    ratio,
    state,
    metric,
  };
}

export const LIMIT_METRIC_OPTIONS: Array<{
  id: LimitMetric;
  label: string;
  shortLabel: string;
  blurb: string;
}> = [
  {
    id: "grapheme",
    label: "Visible characters (graphemes)",
    shortLabel: "Graphemes",
    blurb: "User-perceived characters — emoji sequences and combining marks.",
  },
  {
    id: "codePoint",
    label: "Unicode code points",
    shortLabel: "Code points",
    blurb: "One count per Unicode scalar value.",
  },
  {
    id: "utf16",
    label: "UTF-16 code units",
    shortLabel: "UTF-16",
    blurb: "JavaScript string length (surrogate pairs count as two).",
  },
];
