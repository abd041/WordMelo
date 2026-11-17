import { PROMPT_CATEGORIES } from "./categories";
import type { PlayingGame, RoundRecord } from "./game";
import { MAX_TEAMS, MIN_TEAMS } from "./game";
import type { PictionaryPrompt, PromptCategoryId, PromptFilters } from "./types";
import { TIMER_OPTIONS, type TimerSeconds } from "./types";

export const SESSION_VERSION = 1;
export const SESSION_STORAGE_KEY = "wordmelo.pictionary.game.v1";
export const MUTE_STORAGE_KEY = "wordmelo.pictionary.timerMuted.v1";
const MAX_SESSION_CHARS = 80_000;

export interface SavedPictionarySession {
  version: typeof SESSION_VERSION;
  game: PlayingGame;
  revealed: boolean;
  timerRemainingMs: number;
}

const CATEGORY_IDS = new Set<string>(PROMPT_CATEGORIES.map((category) => category.id));
const DIFFICULTIES = new Set(["easy", "medium", "hard", "mixed"]);

function isTimer(value: unknown): value is TimerSeconds {
  return typeof value === "number" && (TIMER_OPTIONS as readonly number[]).includes(value);
}

function isPromptFilters(value: unknown): value is PromptFilters {
  if (!value || typeof value !== "object") return false;
  const filters = value as PromptFilters;
  if (!DIFFICULTIES.has(filters.difficulty)) return false;
  if (typeof filters.noRepeat !== "boolean") return false;
  if (!Array.isArray(filters.categories)) return false;
  return filters.categories.every((id) => typeof id === "string" && CATEGORY_IDS.has(id));
}

function isRoundRecord(value: unknown): value is RoundRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as RoundRecord;
  return (
    Number.isInteger(record.round) &&
    record.round >= 1 &&
    Number.isInteger(record.teamIndex) &&
    record.teamIndex >= 0 &&
    record.teamIndex < MAX_TEAMS &&
    typeof record.promptId === "string" &&
    typeof record.promptText === "string" &&
    record.promptText.length > 0 &&
    record.promptText.length <= 80 &&
    (record.outcome === "correct" || record.outcome === "skip")
  );
}

export function parseSession(
  raw: unknown,
  prompts: readonly PictionaryPrompt[],
): SavedPictionarySession | null {
  try {
    const text = typeof raw === "string" ? raw : null;
    if (text !== null && text.length > MAX_SESSION_CHARS) return null;
    const data = text !== null ? (JSON.parse(text) as unknown) : raw;
    if (!data || typeof data !== "object") return null;
    const saved = data as Partial<SavedPictionarySession>;
    if (saved.version !== SESSION_VERSION) return null;
    if (typeof saved.revealed !== "boolean") return null;
    if (typeof saved.timerRemainingMs !== "number" || !Number.isFinite(saved.timerRemainingMs)) {
      return null;
    }
    const game = saved.game;
    if (!game || game.phase !== "playing") return null;
    if (!Array.isArray(game.teams) || game.teams.length < MIN_TEAMS || game.teams.length > MAX_TEAMS) {
      return null;
    }
    if (!isTimer(game.timerSeconds)) return null;
    if (saved.timerRemainingMs < 0 || saved.timerRemainingMs > game.timerSeconds * 1000) return null;
    if (!Number.isInteger(game.round) || game.round < 1 || game.round > 500) return null;
    if (!Number.isInteger(game.totalRounds) || game.totalRounds < 0 || game.totalRounds > 50) {
      return null;
    }
    if (!Number.isInteger(game.teamIndex) || game.teamIndex < 0 || game.teamIndex >= game.teams.length) {
      return null;
    }
    if (typeof game.settled !== "boolean" || typeof game.poolExhausted !== "boolean") return null;
    if (!isPromptFilters(game.filters)) return null;
    if (!Array.isArray(game.history) || game.history.length > 500 || !game.history.every(isRoundRecord)) {
      return null;
    }
    if (game.history.some((record) => record.teamIndex >= game.teams.length)) return null;

    const byId = new Map(prompts.map((prompt) => [prompt.id, prompt]));
    for (const team of game.teams) {
      if (!team || typeof team.name !== "string" || typeof team.score !== "number") return null;
      if (!Number.isFinite(team.score) || team.score < 0 || team.score > 999) return null;
      if (team.name.trim().length === 0 || team.name.length > 28) return null;
    }

    const prompt = game.prompt && byId.get(game.prompt.id);
    if (!prompt) return null;
    if (!Array.isArray(game.usedIds)) return null;
    const usedIds = game.usedIds.filter((id): id is string => typeof id === "string" && byId.has(id));
    if (!usedIds.includes(prompt.id)) usedIds.push(prompt.id);

    return {
      version: SESSION_VERSION,
      revealed: saved.revealed,
      timerRemainingMs: saved.timerRemainingMs,
      game: {
        phase: "playing",
        teams: game.teams.map((team) => ({
          name: team.name.trim(),
          score: Math.floor(team.score),
        })),
        teamIndex: game.teamIndex,
        round: game.round,
        totalRounds: game.totalRounds,
        timerSeconds: game.timerSeconds,
        filters: {
          difficulty: game.filters.difficulty,
          noRepeat: game.filters.noRepeat,
          categories: [...game.filters.categories] as PromptCategoryId[],
        },
        prompt,
        usedIds,
        history: game.history.map((record) => ({ ...record })),
        settled: game.settled,
        poolExhausted: game.poolExhausted,
      },
    };
  } catch {
    return null;
  }
}

export function serializeSession(session: SavedPictionarySession): string {
  return JSON.stringify(session);
}

export function safeSetItem(storage: Pick<Storage, "setItem">, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeGetItem(storage: Pick<Storage, "getItem">, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemoveItem(storage: Pick<Storage, "removeItem">, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    /* storage disabled */
  }
}
