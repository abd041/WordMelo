/**
 * Elapsed-time timer using performance.now() (monotonic when available).
 * Interval callbacks only refresh display; remaining time is derived from deadlines.
 */

export function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

export interface TimerSnapshot {
  remainingMs: number;
  remainingSec: number;
  expired: boolean;
}

export function remainingFromDeadline(
  deadlineMs: number | null,
  pausedRemainingMs: number | null,
  running: boolean,
  clock = nowMs(),
): TimerSnapshot {
  if (!running && pausedRemainingMs !== null) {
    const remainingMs = Math.max(0, pausedRemainingMs);
    return {
      remainingMs,
      remainingSec: Math.ceil(remainingMs / 1000),
      expired: remainingMs <= 0,
    };
  }
  if (deadlineMs === null) {
    return { remainingMs: 0, remainingSec: 0, expired: true };
  }
  const remainingMs = Math.max(0, deadlineMs - clock);
  return {
    remainingMs,
    remainingSec: Math.ceil(remainingMs / 1000),
    expired: remainingMs <= 0,
  };
}

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
