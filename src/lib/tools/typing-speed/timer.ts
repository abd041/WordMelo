export interface TimerSnapshot {
  running: boolean;
  paused: boolean;
  expired: boolean;
  elapsedMs: number;
  remainingMs: number;
  started: boolean;
}

export interface TypingClock {
  snapshot: () => TimerSnapshot;
  start: () => TimerSnapshot;
  pause: () => TimerSnapshot;
  resume: () => TimerSnapshot;
  expire: () => TimerSnapshot;
  reset: (durationMs?: number) => TimerSnapshot;
  dispose: () => void;
}

export interface ClockOptions {
  durationMs: number;
  now?: () => number;
  onExpire?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createTypingClock(options: ClockOptions): TypingClock {
  const now = options.now ?? (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));
  let durationMs = Math.max(0, options.durationMs);
  let startedAt: number | null = null;
  let pausedAt: number | null = null;
  let hiddenMs = 0;
  let expired = false;
  let disposed = false;
  let notified = false;

  function rawElapsed(at: number): number {
    if (startedAt === null) return 0;
    const end = pausedAt ?? at;
    return Math.max(0, end - startedAt - hiddenMs);
  }

  function maybeExpire(at: number): void {
    if (expired || startedAt === null || pausedAt !== null) return;
    if (rawElapsed(at) >= durationMs) {
      expired = true;
      pausedAt = startedAt + durationMs + hiddenMs;
      if (!notified) {
        notified = true;
        options.onExpire?.();
      }
    }
  }

  function view(at = now()): TimerSnapshot {
    if (!disposed) maybeExpire(at);
    const elapsed = startedAt === null ? 0 : clamp(rawElapsed(at), 0, durationMs);
    return {
      running: startedAt !== null && pausedAt === null && !expired,
      paused: startedAt !== null && pausedAt !== null && !expired,
      expired,
      elapsedMs: elapsed,
      remainingMs: Math.max(0, durationMs - elapsed),
      started: startedAt !== null,
    };
  }

  return {
    snapshot: () => view(),
    start() {
      if (disposed || expired || startedAt !== null) return view();
      startedAt = now();
      pausedAt = null;
      hiddenMs = 0;
      return view();
    },
    pause() {
      if (disposed || expired || startedAt === null || pausedAt !== null) return view();
      pausedAt = now();
      return view();
    },
    resume() {
      if (disposed || expired || startedAt === null || pausedAt === null) return view();
      const at = now();
      hiddenMs += at - pausedAt;
      pausedAt = null;
      return view();
    },
    expire() {
      if (disposed || expired) return view();
      const at = now();
      if (startedAt === null) startedAt = at;
      expired = true;
      pausedAt = at;
      if (!notified) {
        notified = true;
        options.onExpire?.();
      }
      return view();
    },
    reset(nextDurationMs = durationMs) {
      durationMs = Math.max(0, nextDurationMs);
      startedAt = null;
      pausedAt = null;
      hiddenMs = 0;
      expired = false;
      notified = false;
      return view();
    },
    dispose() {
      disposed = true;
    },
  };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
