import { remainingFromDeadline, type TimerSnapshot } from "./game-timer";

export interface ClockTimer extends TimerSnapshot {
  running: boolean;
}

export interface TimerHandle {
  snapshot: () => ClockTimer;
  start: () => ClockTimer;
  pause: () => ClockTimer;
  reset: (durationMs: number) => ClockTimer;
  dispose: () => void;
}

type IntervalId = ReturnType<typeof setInterval>;

export interface CountdownOptions {
  durationMs: number;
  clock?: () => number;
  schedule?: (fn: () => void, ms: number) => IntervalId;
  cancel?: (id: IntervalId) => void;
  intervalMs?: number;
  onChange?: (state: ClockTimer) => void;
  onExpire?: () => void;
}

export function createCountdown(options: CountdownOptions): TimerHandle {
  const clock = options.clock ?? (() =>
    typeof performance !== "undefined" ? performance.now() : Date.now());
  const schedule = options.schedule ?? ((fn, ms) => setInterval(fn, ms));
  const cancel = options.cancel ?? ((id) => clearInterval(id));
  const intervalMs = options.intervalMs ?? 200;

  let durationMs = Math.max(0, options.durationMs);
  let deadline: number | null = null;
  let pausedMs = durationMs;
  let running = false;
  let handle: IntervalId | null = null;
  let expiredNotified = false;
  let disposed = false;

  function publish(extra?: Partial<ClockTimer>): ClockTimer {
    const snap = remainingFromDeadline(deadline, running ? null : pausedMs, running, clock());
    const state: ClockTimer = { ...snap, running, ...extra };
    options.onChange?.(state);
    return state;
  }

  function clearHandle() {
    if (handle !== null) {
      cancel(handle);
      handle = null;
    }
  }

  function tick() {
    if (disposed || !running || deadline === null) return;
    const snap = remainingFromDeadline(deadline, null, true, clock());
    if (snap.expired) {
      running = false;
      pausedMs = 0;
      deadline = null;
      clearHandle();
      publish({ remainingMs: 0, remainingSec: 0, expired: true, running: false });
      if (!expiredNotified) {
        expiredNotified = true;
        options.onExpire?.();
      }
      return;
    }
    publish(snap);
  }

  return {
    snapshot() {
      const snap = remainingFromDeadline(deadline, running ? null : pausedMs, running, clock());
      return { ...snap, running };
    },
    start() {
      if (disposed || running) return this.snapshot();
      if (pausedMs <= 0) pausedMs = durationMs;
      if (pausedMs <= 0) {
        return publish({ remainingMs: 0, remainingSec: 0, expired: true, running: false });
      }
      deadline = clock() + pausedMs;
      running = true;
      expiredNotified = false;
      clearHandle();
      handle = schedule(tick, intervalMs);
      return publish();
    },
    pause() {
      if (disposed || !running || deadline === null) return this.snapshot();
      const snap = remainingFromDeadline(deadline, null, true, clock());
      running = false;
      pausedMs = snap.remainingMs;
      deadline = null;
      clearHandle();
      return publish({ ...snap, running: false });
    },
    reset(nextDurationMs: number) {
      if (disposed) return this.snapshot();
      clearHandle();
      durationMs = Math.max(0, nextDurationMs);
      pausedMs = durationMs;
      deadline = null;
      running = false;
      expiredNotified = false;
      return publish({
        remainingMs: durationMs,
        remainingSec: Math.ceil(durationMs / 1000),
        expired: durationMs <= 0,
        running: false,
      });
    },
    dispose() {
      disposed = true;
      running = false;
      clearHandle();
    },
  };
}
