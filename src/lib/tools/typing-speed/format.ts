import { roundStat } from "./metrics";
import type { TestSettings, TypingMetrics } from "./types";

export const TXT_FILENAME = "wordmelo-typing-speed-results.txt";

export function modeLabel(mode: TestSettings["mode"]): string {
  return mode === "sentences" ? "Sentences" : "Words";
}

export function difficultyLabel(difficulty: TestSettings["difficulty"]): string {
  if (difficulty === "easy") return "Easy";
  if (difficulty === "hard") return "Hard";
  return "Medium";
}

export function formatResultsText(
  metrics: TypingMetrics,
  settings: TestSettings,
  extra?: { personalBest?: number | null },
): string {
  const lines = [
    "WordMelo typing speed test",
    `Mode: ${modeLabel(settings.mode)}`,
    `Difficulty: ${difficultyLabel(settings.difficulty)}`,
    `Duration: ${settings.durationSec} seconds`,
    `Elapsed: ${(metrics.elapsedMs / 1000).toFixed(1)} seconds`,
    `Net WPM: ${roundStat(metrics.netWpm)}`,
    `Gross WPM: ${roundStat(metrics.grossWpm)}`,
    `Accuracy: ${roundStat(metrics.accuracy, 1)}%`,
    `Correct characters: ${metrics.currentlyCorrect}`,
    `Incorrect characters: ${metrics.currentlyIncorrect}`,
    `Corrected errors: ${metrics.correctedErrors}`,
    `Uncorrected errors: ${metrics.uncorrectedErrors}`,
    `Accepted keystrokes: ${metrics.totalInserts}`,
  ];
  if (typeof extra?.personalBest === "number") {
    lines.push(`Personal best for this setup: ${roundStat(extra.personalBest)} WPM`);
  }
  lines.push("", "Scores are measured in your browser. Typed text is not stored.");
  return lines.join("\n");
}
