export const DURATIONS = [15, 30, 60, 120] as const;
export type DurationSec = (typeof DURATIONS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const TYPING_MODES = ["words", "sentences"] as const;
export type TypingMode = (typeof TYPING_MODES)[number];

export type TestStatus = "ready" | "running" | "paused" | "completed";

export interface TestSettings {
  durationSec: DurationSec;
  difficulty: Difficulty;
  mode: TypingMode;
}

export type KeyEvent =
  | {
      kind: "insert";
      atMs: number;
      expected: string;
      received: string;
      match: boolean;
    }
  | {
      kind: "backspace";
      atMs: number;
      removed: string;
      wasMatch: boolean;
    };

export type RejectReason = "paste" | "completed" | "composing" | "paused";

export interface TypingMetrics {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctInserts: number;
  incorrectInserts: number;
  totalInserts: number;
  currentlyCorrect: number;
  currentlyIncorrect: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  elapsedMs: number;
}

export interface WpmSample {
  elapsedMs: number;
  netWpm: number;
  grossWpm: number;
}

export interface AttemptRecord {
  at: string;
  durationSec: DurationSec;
  difficulty: Difficulty;
  mode: TypingMode;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
}

export type RandomInt = (maxExclusive: number) => number;

export const CHARS_PER_WORD = 5;
export const DEFAULT_SETTINGS: TestSettings = {
  durationSec: 60,
  difficulty: "medium",
  mode: "words",
};
