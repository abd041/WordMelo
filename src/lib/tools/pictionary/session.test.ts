import { describe, expect, it } from "vitest";
import { beginGame, type PlayingGame } from "./game";
import { PICTIONARY_PROMPTS } from "./prompts";
import {
  parseSession,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  serializeSession,
  type SavedPictionarySession,
} from "./session";
import { DEFAULT_FILTERS } from "./types";

function saved(overrides: Partial<PlayingGame> = {}): SavedPictionarySession {
  const game = beginGame(
    {
      teamNames: ["Alpha", "Beta"],
      timerSeconds: 60,
      totalRounds: 10,
      filters: DEFAULT_FILTERS,
    },
    PICTIONARY_PROMPTS[0]!,
  );
  if (!game) throw new Error("expected game");
  return {
    version: 1,
    revealed: false,
    timerRemainingMs: 45000,
    game: { ...game, ...overrides },
  };
}

describe("pictionary session recovery", () => {
  it("round-trips a valid playing session and uses the dataset prompt", () => {
    const session = saved();
    const parsed = parseSession(serializeSession(session), PICTIONARY_PROMPTS);
    expect(parsed?.game.prompt).toEqual(PICTIONARY_PROMPTS[0]);
    expect(parsed?.game.teams[0]?.name).toBe("Alpha");
    expect(parsed?.timerRemainingMs).toBe(45000);
    expect(parsed?.revealed).toBe(false);
  });

  it("rejects invalid, old, and incomplete stored data", () => {
    expect(parseSession("not-json", PICTIONARY_PROMPTS)).toBeNull();
    expect(parseSession("", PICTIONARY_PROMPTS)).toBeNull();
    expect(parseSession("{", PICTIONARY_PROMPTS)).toBeNull();
    expect(parseSession(JSON.stringify({ version: 0 }), PICTIONARY_PROMPTS)).toBeNull();
    expect(parseSession(JSON.stringify({ version: 1 }), PICTIONARY_PROMPTS)).toBeNull();

    const missingPrompt = saved();
    missingPrompt.game = { ...missingPrompt.game, prompt: { ...missingPrompt.game.prompt, id: "missing" } };
    expect(parseSession(serializeSession(missingPrompt), PICTIONARY_PROMPTS)).toBeNull();

    const badScore = saved();
    badScore.game = {
      ...badScore.game,
      teams: [{ name: "Alpha", score: -1 }, { name: "Beta", score: 0 }],
    };
    expect(parseSession(serializeSession(badScore), PICTIONARY_PROMPTS)).toBeNull();

    const badTimer = saved();
    badTimer.timerRemainingMs = 999999;
    expect(parseSession(serializeSession(badTimer), PICTIONARY_PROMPTS)).toBeNull();

    expect(parseSession("x".repeat(80_001), PICTIONARY_PROMPTS)).toBeNull();
  });

  it("survives disabled storage and a full quota", () => {
    const throwing = {
      getItem() {
        throw new Error("disabled");
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {
        throw new Error("disabled");
      },
    };
    expect(safeGetItem(throwing, "key")).toBeNull();
    expect(safeSetItem(throwing, "key", "value")).toBe(false);
    expect(() => safeRemoveItem(throwing, "key")).not.toThrow();
  });
});
