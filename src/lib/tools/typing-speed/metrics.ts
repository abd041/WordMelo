import { CHARS_PER_WORD, type KeyEvent, type TypingMetrics, type WpmSample } from "./types";
import { units } from "./units";

export function minutesFromMs(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return elapsedMs / 60_000;
}

export function wpmFromChars(charCount: number, elapsedMs: number): number {
  const minutes = minutesFromMs(elapsedMs);
  if (minutes <= 0 || charCount <= 0) return 0;
  return charCount / CHARS_PER_WORD / minutes;
}

export function roundStat(value: number, digits = 0): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function currentMatchCounts(typed: string, passage: string): {
  currentlyCorrect: number;
  currentlyIncorrect: number;
} {
  const typedUnits = units(typed);
  const passageUnits = units(passage);
  let currentlyCorrect = 0;
  let currentlyIncorrect = 0;
  for (let index = 0; index < typedUnits.length; index += 1) {
    if (typedUnits[index] === passageUnits[index]) currentlyCorrect += 1;
    else currentlyIncorrect += 1;
  }
  return { currentlyCorrect, currentlyIncorrect };
}

export function computeMetrics(
  events: readonly KeyEvent[],
  typed: string,
  passage: string,
  elapsedMs: number,
): TypingMetrics {
  let correctInserts = 0;
  let incorrectInserts = 0;
  let correctedErrors = 0;
  for (const event of events) {
    if (event.kind === "insert") {
      if (event.match) correctInserts += 1;
      else incorrectInserts += 1;
    } else if (!event.wasMatch) {
      correctedErrors += 1;
    }
  }
  const totalInserts = correctInserts + incorrectInserts;
  const { currentlyCorrect, currentlyIncorrect } = currentMatchCounts(typed, passage);
  const safeElapsed = Math.max(0, elapsedMs);
  const grossWpm = wpmFromChars(totalInserts, safeElapsed);
  const netWpm = Math.max(0, wpmFromChars(currentlyCorrect, safeElapsed));
  const accuracy = totalInserts === 0 ? 100 : Math.min(100, (correctInserts / totalInserts) * 100);

  return {
    grossWpm,
    netWpm,
    accuracy,
    correctInserts,
    incorrectInserts,
    totalInserts,
    currentlyCorrect,
    currentlyIncorrect,
    correctedErrors,
    uncorrectedErrors: currentlyIncorrect,
    elapsedMs: safeElapsed,
  };
}

export function reconstructTyped(events: readonly KeyEvent[], untilMs = Number.POSITIVE_INFINITY): string {
  const buffer: string[] = [];
  for (const event of events) {
    if (event.atMs > untilMs) break;
    if (event.kind === "insert") buffer.push(event.received);
    else buffer.pop();
  }
  return buffer.join("");
}

export function wpmSeries(
  events: readonly KeyEvent[],
  passage: string,
  elapsedMs: number,
  intervalMs = 1_000,
): WpmSample[] {
  const samples: WpmSample[] = [{ elapsedMs: 0, netWpm: 0, grossWpm: 0 }];
  if (elapsedMs <= 0) return samples;
  const last = Math.max(intervalMs, Math.floor(elapsedMs / intervalMs) * intervalMs);
  for (let at = intervalMs; at <= last; at += intervalMs) {
    const typed = reconstructTyped(events, at);
    const metrics = computeMetrics(
      events.filter((event) => event.atMs <= at),
      typed,
      passage,
      at,
    );
    samples.push({ elapsedMs: at, netWpm: metrics.netWpm, grossWpm: metrics.grossWpm });
  }
  if (samples[samples.length - 1]?.elapsedMs !== elapsedMs) {
    const typed = reconstructTyped(events, elapsedMs);
    const metrics = computeMetrics(
      events.filter((event) => event.atMs <= elapsedMs),
      typed,
      passage,
      elapsedMs,
    );
    samples.push({ elapsedMs, netWpm: metrics.netWpm, grossWpm: metrics.grossWpm });
  }
  return samples;
}
