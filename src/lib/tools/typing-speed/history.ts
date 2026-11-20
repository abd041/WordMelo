import { DIFFICULTIES, DURATIONS, TYPING_MODES, type AttemptRecord, type TestSettings } from "./types";

export const HISTORY_KEY = "wordmelo:typing-speed:history";
export const MAX_RECENT = 12;

export interface StoredHistory {
  version: 1;
  recent: AttemptRecord[];
  best: Record<string, AttemptRecord>;
}

export function configKey(settings: Pick<TestSettings, "durationSec" | "difficulty" | "mode">): string {
  return `${settings.durationSec}-${settings.mode}-${settings.difficulty}`;
}

function isDuration(value: unknown): value is AttemptRecord["durationSec"] {
  return DURATIONS.includes(value as AttemptRecord["durationSec"]);
}

function isDifficulty(value: unknown): value is AttemptRecord["difficulty"] {
  return DIFFICULTIES.includes(value as AttemptRecord["difficulty"]);
}

function isMode(value: unknown): value is AttemptRecord["mode"] {
  return TYPING_MODES.includes(value as AttemptRecord["mode"]);
}

function isAttempt(value: unknown): value is AttemptRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.at === "string" &&
    isDuration(row.durationSec) &&
    isDifficulty(row.difficulty) &&
    isMode(row.mode) &&
    typeof row.netWpm === "number" &&
    Number.isFinite(row.netWpm) &&
    typeof row.grossWpm === "number" &&
    Number.isFinite(row.grossWpm) &&
    typeof row.accuracy === "number" &&
    Number.isFinite(row.accuracy)
  );
}

export function emptyHistory(): StoredHistory {
  return { version: 1, recent: [], best: {} };
}

export function parseHistory(raw: string | null): StoredHistory {
  if (!raw) return emptyHistory();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyHistory();
    const data = parsed as Record<string, unknown>;
    const recent = Array.isArray(data.recent) ? data.recent.filter(isAttempt).slice(0, MAX_RECENT) : [];
    const best: Record<string, AttemptRecord> = {};
    if (data.best && typeof data.best === "object") {
      for (const [key, value] of Object.entries(data.best as Record<string, unknown>)) {
        if (isAttempt(value)) best[key] = value;
      }
    }
    return { version: 1, recent, best };
  } catch {
    return emptyHistory();
  }
}

export function recordAttempt(history: StoredHistory, attempt: AttemptRecord): StoredHistory {
  const key = configKey(attempt);
  const currentBest = history.best[key];
  const best = { ...history.best };
  if (!currentBest || attempt.netWpm > currentBest.netWpm) {
    best[key] = attempt;
  }
  return {
    version: 1,
    recent: [attempt, ...history.recent].slice(0, MAX_RECENT),
    best,
  };
}

export function readHistory(storage: Pick<Storage, "getItem"> | null): StoredHistory {
  if (!storage) return emptyHistory();
  try {
    return parseHistory(storage.getItem(HISTORY_KEY));
  } catch {
    return emptyHistory();
  }
}

export function writeHistory(
  storage: Pick<Storage, "setItem"> | null,
  history: StoredHistory,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

export function clearHistory(storage: Pick<Storage, "removeItem"> | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
