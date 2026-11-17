import { describe, expect, it } from "vitest";
import {
  adjustScore,
  applyRoundOutcome,
  beginGame,
  continueAfterPoolReset,
  defaultTeamName,
  endGameEarly,
  normalizeTeamNames,
  normalizeTotalRounds,
  scoreOutcome,
  type PlayingGame,
} from "./game";
import type { PictionaryPrompt } from "./types";
import { DEFAULT_FILTERS } from "./types";

function prompt(id: string, text = id): PictionaryPrompt {
  return { id, text, category: "tools", difficulty: "easy" };
}

function start(totalRounds = 10, names = ["Alpha", "Beta"]): PlayingGame {
  const game = beginGame(
    {
      teamNames: names,
      timerSeconds: 60,
      totalRounds,
      filters: DEFAULT_FILTERS,
    },
    prompt("p1", "Hammer"),
  );
  if (!game) throw new Error("expected a game");
  return game;
}

describe("pictionary game state", () => {
  it("starts from defaults with a hidden-ready prompt and zero scores", () => {
    const game = start();
    expect(game.round).toBe(1);
    expect(game.totalRounds).toBe(10);
    expect(game.timerSeconds).toBe(60);
    expect(game.teams.map((team) => team.score)).toEqual([0, 0]);
    expect(game.teams.map((team) => team.name)).toEqual(["Alpha", "Beta"]);
    expect(game.prompt.text).toBe("Hammer");
    expect(game.settled).toBe(false);
  });

  it("uses custom team names and fills a blank name", () => {
    expect(normalizeTeamNames(["  Blue  ", ""])).toEqual(["Blue", defaultTeamName(1)]);
    expect(normalizeTeamNames(["Only one"])).toBeNull();
    expect(normalizeTeamNames(["A", "B", "C", "D", "E"])).toBeNull();
    const game = beginGame(
      {
        teamNames: ["<Red>", "Gold", "Green"],
        timerSeconds: 30,
        totalRounds: 4,
        filters: DEFAULT_FILTERS,
      },
      prompt("p9", "Wrench"),
    );
    expect(game?.teams.map((team) => team.name)).toEqual(["Red", "Gold", "Green"]);
  });

  it("rotates teams and awards one point for a correct guess", () => {
    let game = start(4, ["A", "B", "C", "D"]);
    const next = applyRoundOutcome(game, "correct", prompt("p2", "Saw"));
    expect(next.changed).toBe(true);
    game = next.game as PlayingGame;
    expect(game.teams[0]?.score).toBe(1);
    expect(game.teams.slice(1).every((team) => team.score === 0)).toBe(true);
    expect(game.teamIndex).toBe(1);
    expect(game.round).toBe(2);
    expect(game.prompt.id).toBe("p2");
  });

  it("does not award a point for skip and still rotates", () => {
    const game = start();
    const next = applyRoundOutcome(game, "skip", prompt("p2", "Saw"));
    const playing = next.game as PlayingGame;
    expect(playing.teams.every((team) => team.score === 0)).toBe(true);
    expect(playing.history[0]?.outcome).toBe("skip");
    expect(playing.teamIndex).toBe(1);
    expect(next.notice).toMatch(/No point/);
  });

  it("ignores a second outcome after the round is already settled", () => {
    const blocked = applyRoundOutcome(start(3), "correct", null).game as PlayingGame;
    expect(blocked.poolExhausted).toBe(true);
    expect(blocked.teams[0]?.score).toBe(1);
    const again = applyRoundOutcome(blocked, "correct", prompt("p2"));
    expect(again.changed).toBe(false);
    expect((again.game as PlayingGame).teams[0]?.score).toBe(1);
    const skipped = applyRoundOutcome(blocked, "skip", prompt("p2"));
    expect(skipped.changed).toBe(false);
    expect((skipped.game as PlayingGame).teams[0]?.score).toBe(1);
  });

  it("finishes on the last round, including a tie", () => {
    let game = start(2);
    game = applyRoundOutcome(game, "correct", prompt("p2")).game as PlayingGame;
    const done = applyRoundOutcome(game, "correct", prompt("p3"));
    expect(done.game.phase).toBe("summary");
    if (done.game.phase !== "summary") return;
    expect(done.game.roundsPlayed).toBe(2);
    expect(done.game.teams.map((team) => team.score)).toEqual([1, 1]);
    expect(scoreOutcome(done.game.teams)).toMatchObject({ kind: "tie", label: "Alpha and Beta tie" });
  });

  it("names a single winner and a three-team tie", () => {
    expect(scoreOutcome([{ name: "Alpha", score: 2 }, { name: "Beta", score: 1 }])).toMatchObject({
      kind: "win",
      label: "Alpha wins",
    });
    expect(
      scoreOutcome([
        { name: "Alpha", score: 1 },
        { name: "Beta", score: 1 },
        { name: "Gamma", score: 1 },
      ]).label,
    ).toBe("Alpha, Beta, and Gamma tie");
  });

  it("ends early without adding a point and can restart from zero", () => {
    const playing = applyRoundOutcome(start(), "correct", prompt("p2")).game as PlayingGame;
    const summary = endGameEarly(playing);
    expect(summary.roundsPlayed).toBe(1);
    expect(summary.teams[0]?.score).toBe(1);
    const restarted = start();
    expect(restarted.teams.every((team) => team.score === 0)).toBe(true);
    expect(restarted.round).toBe(1);
    expect(restarted.history).toEqual([]);
  });

  it("continues after the word pool is reset", () => {
    const blocked = applyRoundOutcome(start(), "skip", null).game as PlayingGame;
    const continued = continueAfterPoolReset(blocked, prompt("p8", "Ladder"));
    expect(continued.poolExhausted).toBe(false);
    expect(continued.prompt.text).toBe("Ladder");
    expect(continued.round).toBe(2);
    expect(continued.teams.every((team) => team.score === 0)).toBe(true);
  });

  it("clamps manual score adjustments at zero", () => {
    const game = start();
    expect(adjustScore(game, 0, -1).teams[0]?.score).toBe(0);
    expect(adjustScore(game, 0, 1).teams[0]?.score).toBe(1);
    expect(adjustScore(game, 0, 5)).toBe(game);
  });

  it("normalizes the round limit", () => {
    expect(normalizeTotalRounds(10)).toBe(10);
    expect(normalizeTotalRounds(0)).toBe(0);
    expect(normalizeTotalRounds(80)).toBe(50);
    expect(normalizeTotalRounds(Number.NaN)).toBe(10);
  });
});
