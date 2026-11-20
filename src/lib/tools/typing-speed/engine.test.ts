import { describe, expect, it } from "vitest";
import { applyTypedChange, createEngineState, pauseEngine, resumeEngine, completeEngine } from "./engine";
import { averageTokenLength, generatePassage } from "./generate";
import { clearHistory, emptyHistory, parseHistory, recordAttempt, configKey } from "./history";
import { computeMetrics, reconstructTyped, wpmFromChars, wpmSeries } from "./metrics";
import { createTypingClock, formatRemaining } from "./timer";
import type { TestSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { formatResultsText } from "./format";

const settings: TestSettings = { ...DEFAULT_SETTINGS, durationSec: 15, difficulty: "easy", mode: "words" };

describe("typing speed engine", () => {
  it("does not start until the first accepted character", () => {
    const state = createEngineState(settings, () => 0);
    expect(state.status).toBe("ready");
    expect(state.typed).toBe("");
    const same = applyTypedChange(state, "", 0);
    expect(same.started).toBe(false);
    expect(same.state.status).toBe("ready");
  });

  it("starts on the first matching insert", () => {
    const state = createEngineState(settings, () => 0);
    const first = state.passage[0]!;
    const next = applyTypedChange(state, first, 0);
    expect(next.started).toBe(true);
    expect(next.state.status).toBe("running");
    expect(next.state.typed).toBe(first);
    expect(next.state.events).toHaveLength(1);
  });

  it("marks a wrong character and keeps the caret on that position", () => {
    const state = createEngineState(settings, () => 0);
    const expected = state.passage[0]!;
    const wrong = expected === "x" ? "y" : "x";
    const next = applyTypedChange(state, wrong, 12);
    expect(next.state.events[0]).toMatchObject({ kind: "insert", match: false, received: wrong });
    const metrics = computeMetrics(next.state.events, next.state.typed, next.state.passage, 12);
    expect(metrics.incorrectInserts).toBe(1);
    expect(metrics.uncorrectedErrors).toBe(1);
    expect(metrics.currentlyCorrect).toBe(0);
  });

  it("treats backspace of a mistake as a corrected error without inflating accuracy", () => {
    const state = createEngineState(settings, () => 0);
    const expected = state.passage[0]!;
    const wrong = expected === "q" ? "z" : "q";
    const mistyped = applyTypedChange(state, wrong, 20).state;
    const cleared = applyTypedChange(mistyped, "", 40).state;
    expect(cleared.typed).toBe("");
    const fixed = applyTypedChange(cleared, expected, 60).state;
    const metrics = computeMetrics(fixed.events, fixed.typed, fixed.passage, 60);
    expect(metrics.incorrectInserts).toBe(1);
    expect(metrics.correctInserts).toBe(1);
    expect(metrics.correctedErrors).toBe(1);
    expect(metrics.uncorrectedErrors).toBe(0);
    expect(metrics.accuracy).toBe(50);
    expect(metrics.currentlyCorrect).toBe(1);
  });

  it("rejects paste and mid-string replacement", () => {
    const state = createEngineState(settings, () => 0);
    const paste = applyTypedChange(state, state.passage.slice(0, 8), 0, { paste: true });
    expect(paste.rejected).toBe("paste");
    expect(paste.state.typed).toBe("");
    const bulk = applyTypedChange(state, "abcdef", 0);
    expect(bulk.rejected).toBe("paste");
    const started = applyTypedChange(state, state.passage[0]!, 0).state;
    const replaced = applyTypedChange(started, "Z", 10);
    expect(replaced.rejected).toBe("paste");
    expect(replaced.state.typed).toBe(started.typed);
  });

  it("ignores composing updates and completed input", () => {
    const state = createEngineState(settings, () => 0);
    const composing = applyTypedChange(state, "a", 0, { composing: true });
    expect(composing.rejected).toBe("composing");
    const done = completeEngine(applyTypedChange(state, state.passage[0]!, 0).state);
    const after = applyTypedChange(done, `${done.typed}x`, 100);
    expect(after.rejected).toBe("completed");
    expect(after.state.typed).toBe(done.typed);
  });

  it("blocks input while paused and resumes later", () => {
    const running = applyTypedChange(createEngineState(settings, () => 0), "a", 0).state;
    const paused = pauseEngine({ ...running, status: "running" });
    const blocked = applyTypedChange(paused, `${paused.typed}b`, 50);
    expect(blocked.rejected).toBe("paused");
    const live = resumeEngine(paused);
    expect(live.status).toBe("running");
  });

  it("counts spaces and punctuation against the passage", () => {
    const sentence = createEngineState({ ...settings, mode: "sentences" }, () => 0);
    let current = sentence;
    const target = current.passage.slice(0, 12);
    for (const char of target) {
      current = applyTypedChange(current, `${current.typed}${char}`, 80).state;
    }
    expect(current.typed).toBe(target);
    expect(current.events.every((event) => event.kind === "insert")).toBe(true);
  });

  it("is case-sensitive", () => {
    const sentence = createEngineState({ ...settings, mode: "sentences", difficulty: "easy" }, () => 0);
    const first = sentence.passage[0]!;
    const flipped = first === first.toLowerCase() ? first.toUpperCase() : first.toLowerCase();
    if (flipped === first) return;
    const next = applyTypedChange(sentence, flipped, 5);
    expect(next.state.events[0]?.kind === "insert" && next.state.events[0].match).toBe(false);
  });

  it("keeps Unicode code points intact", () => {
    let current = {
      ...createEngineState(settings, () => 0),
      passage: "café",
    };
    for (const char of Array.from("café")) {
      current = applyTypedChange(current, `${current.typed}${char}`, 20).state;
    }
    expect(current.typed).toBe("café");
    expect(current.events.at(-1)).toMatchObject({ received: "é", match: true });
  });

  it("extends the passage instead of allowing overflow", () => {
    const short = {
      ...createEngineState(settings, () => 0),
      passage: "hi",
    };
    const first = applyTypedChange(short, "h", 0).state;
    const second = applyTypedChange(first, "hi", 10).state;
    const extra = applyTypedChange(second, "hix", 20);
    expect(extra.rejected).toBeNull();
    expect(extra.state.passage.length).toBeGreaterThan(2);
    expect(extra.state.typed.startsWith("hi")).toBe(true);
  });

  it("reset clears typed text, events, and status", () => {
    const started = applyTypedChange(createEngineState(settings, () => 0), "z", 0).state;
    expect(started.events.length).toBeGreaterThan(0);
    const fresh = createEngineState(settings, () => 0);
    expect(fresh.status).toBe("ready");
    expect(fresh.typed).toBe("");
    expect(fresh.events).toEqual([]);
    const metrics = computeMetrics(fresh.events, fresh.typed, fresh.passage, 0);
    expect(metrics.totalInserts).toBe(0);
    expect(metrics.netWpm).toBe(0);
  });

  it("replays the same events to the same typed string", () => {
    const state = createEngineState(settings, () => 0);
    let current = state;
    for (const char of state.passage.slice(0, 20)) {
      current = applyTypedChange(current, `${current.typed}${char}`, 30).state;
    }
    current = applyTypedChange(current, current.typed.slice(0, -1), 40).state;
    expect(reconstructTyped(current.events)).toBe(current.typed);
  });
});

describe("typing metrics", () => {
  it("uses five-character words and never goes negative", () => {
    expect(wpmFromChars(50, 60_000)).toBe(10);
    expect(wpmFromChars(0, 60_000)).toBe(0);
    expect(wpmFromChars(50, 0)).toBe(0);
    expect(wpmFromChars(250, 30_000)).toBe(100);
    const metrics = computeMetrics([], "", "abc", 1_000);
    expect(metrics.netWpm).toBe(0);
    expect(metrics.grossWpm).toBe(0);
    expect(metrics.accuracy).toBe(100);
  });

  it("caps accuracy at 100 and treats empty attempts as 100", () => {
    const perfect = computeMetrics(
      [
        { kind: "insert", atMs: 100, expected: "a", received: "a", match: true },
        { kind: "insert", atMs: 200, expected: "b", received: "b", match: true },
      ],
      "ab",
      "ab",
      1_000,
    );
    expect(perfect.accuracy).toBe(100);
    expect(perfect.netWpm).toBeGreaterThan(0);
  });

  it("builds a WPM series from real events only", () => {
    const events = Array.from({ length: 10 }, (_, index) => ({
      kind: "insert" as const,
      atMs: (index + 1) * 1_000,
      expected: "a",
      received: "a",
      match: true,
    }));
    const series = wpmSeries(events, "a".repeat(20), 10_000, 5_000);
    expect(series[0]).toEqual({ elapsedMs: 0, netWpm: 0, grossWpm: 0 });
    expect(series.some((sample) => sample.elapsedMs === 5_000)).toBe(true);
    expect(series.at(-1)?.elapsedMs).toBe(10_000);
    expect(series.every((sample) => sample.netWpm >= 0 && sample.grossWpm >= 0)).toBe(true);
  });
});

describe("typing clock", () => {
  it("does not run until start and expires from elapsed time, not tick count", () => {
    let t = 1_000;
    let expired = 0;
    const clock = createTypingClock({
      durationMs: 15_000,
      now: () => t,
      onExpire: () => {
        expired += 1;
      },
    });
    expect(clock.snapshot().started).toBe(false);
    expect(clock.snapshot().remainingMs).toBe(15_000);
    t += 8_000;
    expect(clock.snapshot().elapsedMs).toBe(0);
    clock.start();
    t += 15_000;
    const snap = clock.snapshot();
    expect(snap.expired).toBe(true);
    expect(snap.elapsedMs).toBe(15_000);
    expect(snap.remainingMs).toBe(0);
    expect(expired).toBe(1);
    t += 5_000;
    expect(clock.snapshot().elapsedMs).toBe(15_000);
  });

  it("excludes hidden time while paused", () => {
    let t = 0;
    const clock = createTypingClock({ durationMs: 30_000, now: () => t });
    clock.start();
    t += 4_000;
    clock.pause();
    t += 20_000;
    expect(clock.snapshot().elapsedMs).toBe(4_000);
    expect(clock.snapshot().paused).toBe(true);
    clock.resume();
    t += 1_000;
    expect(clock.snapshot().elapsedMs).toBe(5_000);
    expect(clock.snapshot().expired).toBe(false);
  });

  it("resets fully and formats remaining time", () => {
    let t = 0;
    const clock = createTypingClock({ durationMs: 60_000, now: () => t });
    clock.start();
    t += 10_000;
    clock.reset(15_000);
    expect(clock.snapshot()).toMatchObject({ started: false, elapsedMs: 0, remainingMs: 15_000 });
    expect(formatRemaining(15_000)).toBe("15s");
    expect(formatRemaining(65_000)).toBe("1:05");
  });
});

describe("passage generation", () => {
  it("changes material with difficulty and mode", () => {
    expect(averageTokenLength("words", "easy")).toBeLessThan(averageTokenLength("words", "hard"));
    expect(averageTokenLength("sentences", "easy")).toBeLessThan(averageTokenLength("sentences", "hard"));
    const easy = generatePassage({ mode: "words", difficulty: "easy" }, 400, () => 0);
    const hard = generatePassage({ mode: "words", difficulty: "hard" }, 400, () => 0);
    expect(easy).not.toBe(hard);
    expect(easy.includes(" ")).toBe(true);
    const sentences = generatePassage({ mode: "sentences", difficulty: "hard" }, 200, () => 0);
    expect(/[.,?"—:;()]/.test(sentences)).toBe(true);
  });
});

describe("history and export", () => {
  it("stores personal bests per configuration and ignores bad JSON", () => {
    const first = {
      at: "2026-01-01T00:00:00.000Z",
      durationSec: 60 as const,
      difficulty: "medium" as const,
      mode: "words" as const,
      netWpm: 40,
      grossWpm: 44,
      accuracy: 96,
    };
    const faster = { ...first, at: "2026-01-02T00:00:00.000Z", netWpm: 55 };
    const other = { ...first, durationSec: 15 as const, netWpm: 80 };
    const once = recordAttempt(emptyHistory(), first);
    const twice = recordAttempt(once, faster);
    const mixed = recordAttempt(twice, other);
    expect(mixed.best[configKey(first)]?.netWpm).toBe(55);
    expect(mixed.best[configKey(other)]?.netWpm).toBe(80);
    expect(mixed.recent).toHaveLength(3);
    expect(parseHistory("{not json")).toEqual(emptyHistory());
    expect(parseHistory(JSON.stringify({ recent: [{ wpm: 1 }], best: { x: 1 } }))).toEqual(emptyHistory());
    const memory: Record<string, string> = {};
    expect(clearHistory({ removeItem: (key) => delete memory[key] })).toBe(true);
  });

  it("formats a results report from real metrics", () => {
    const metrics = computeMetrics(
      [{ kind: "insert", atMs: 500, expected: "a", received: "a", match: true }],
      "a",
      "abc",
      15_000,
    );
    const text = formatResultsText(metrics, settings, { personalBest: 72 });
    expect(text).toContain("Net WPM");
    expect(text).toContain("15 seconds");
    expect(text).not.toContain("72 WPM\n96%");
  });
});
