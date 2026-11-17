import { afterEach, describe, expect, it, vi } from "vitest";
import { createCountdown } from "./countdown";

describe("pictionary countdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down from a deadline and does not go negative", () => {
    vi.useFakeTimers();
    let now = 1_000;
    const seen: number[] = [];
    const timer = createCountdown({
      durationMs: 5_000,
      clock: () => now,
      onChange: (state) => seen.push(state.remainingMs),
    });
    timer.start();
    now = 4_200;
    vi.advanceTimersByTime(200);
    const snap = timer.snapshot();
    expect(snap.remainingMs).toBe(1_800);
    expect(snap.remainingSec).toBe(2);
    expect(snap.expired).toBe(false);
    expect(seen.some((value) => value < 0)).toBe(false);
    timer.dispose();
  });

  it("pauses and resumes without speeding up", () => {
    vi.useFakeTimers();
    let now = 0;
    const timer = createCountdown({ durationMs: 10_000, clock: () => now });
    timer.start();
    now = 1_500;
    const paused = timer.pause();
    expect(paused.running).toBe(false);
    expect(paused.remainingMs).toBe(8_500);
    now = 50_000;
    expect(timer.snapshot().remainingMs).toBe(8_500);
    timer.start();
    now = 50_400;
    vi.advanceTimersByTime(200);
    expect(timer.snapshot().remainingMs).toBe(8_100);
    timer.dispose();
  });

  it("expires once and ignores a second start interval", () => {
    vi.useFakeTimers();
    let now = 0;
    let intervals = 0;
    let expired = 0;
    const timer = createCountdown({
      durationMs: 1_000,
      clock: () => now,
      schedule: (fn) => {
        intervals += 1;
        return setInterval(fn, 200);
      },
      onExpire: () => {
        expired += 1;
      },
    });
    timer.start();
    timer.start();
    expect(intervals).toBe(1);
    now = 1_000;
    vi.advanceTimersByTime(200);
    expect(expired).toBe(1);
    expect(timer.snapshot().remainingSec).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(expired).toBe(1);
    timer.dispose();
  });

  it("stops ticking after dispose", () => {
    vi.useFakeTimers();
    let ticks = 0;
    const timer = createCountdown({
      durationMs: 5_000,
      clock: () => 0,
      onChange: () => {
        ticks += 1;
      },
    });
    timer.start();
    const afterStart = ticks;
    timer.dispose();
    vi.advanceTimersByTime(2000);
    expect(ticks).toBe(afterStart);
  });
});
