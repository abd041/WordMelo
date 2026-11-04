import { describe, expect, it } from "vitest";
import { formatTimer, remainingFromDeadline } from "./game-timer";

describe("game timer helpers", () => {
  it("formats mm:ss", () => {
    expect(formatTimer(0)).toBe("0:00");
    expect(formatTimer(59)).toBe("0:59");
    expect(formatTimer(60)).toBe("1:00");
    expect(formatTimer(125)).toBe("2:05");
  });

  it("derives remaining time from a deadline", () => {
    const snap = remainingFromDeadline(10_000, null, true, 7_250);
    expect(snap.remainingMs).toBe(2_750);
    expect(snap.remainingSec).toBe(3);
    expect(snap.expired).toBe(false);
  });

  it("uses paused remaining when not running", () => {
    const snap = remainingFromDeadline(null, 12_000, false, 99_000);
    expect(snap.remainingSec).toBe(12);
    expect(snap.expired).toBe(false);
  });

  it("marks expired at or past deadline", () => {
    const snap = remainingFromDeadline(5_000, null, true, 5_000);
    expect(snap.expired).toBe(true);
    expect(snap.remainingSec).toBe(0);
  });
});
