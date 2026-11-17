import type { PictionaryPrompt, PromptFilters, TimerSeconds } from "./types";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 4;
export const DEFAULT_TOTAL_ROUNDS = 10;
export const MAX_TOTAL_ROUNDS = 50;
export const MAX_TEAM_NAME = 28;

export interface GameTeam {
  name: string;
  score: number;
}

export interface RoundRecord {
  round: number;
  teamIndex: number;
  promptId: string;
  promptText: string;
  outcome: "correct" | "skip";
}

export interface PlayingGame {
  phase: "playing";
  teams: GameTeam[];
  teamIndex: number;
  round: number;
  totalRounds: number;
  timerSeconds: TimerSeconds;
  filters: PromptFilters;
  prompt: PictionaryPrompt;
  usedIds: string[];
  history: RoundRecord[];
  /** True after Correct or Skip until the next prompt is active. */
  settled: boolean;
  poolExhausted: boolean;
}

export interface SummaryGame {
  phase: "summary";
  teams: GameTeam[];
  totalRounds: number;
  timerSeconds: TimerSeconds;
  filters: PromptFilters;
  history: RoundRecord[];
  roundsPlayed: number;
}

export type ActiveGame = PlayingGame | SummaryGame;

export interface GameSettings {
  teamNames: string[];
  timerSeconds: TimerSeconds;
  totalRounds: number;
  filters: PromptFilters;
}

export function defaultTeamName(index: number): string {
  return `Team ${String.fromCharCode(65 + index)}`;
}

export function sanitizeTeamName(raw: string, index: number): string {
  const cleaned = raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_TEAM_NAME);
  return cleaned.length > 0 ? cleaned : defaultTeamName(index);
}

export function normalizeTeamNames(names: readonly string[]): string[] | null {
  if (names.length < MIN_TEAMS || names.length > MAX_TEAMS) return null;
  return names.map((name, index) => sanitizeTeamName(name, index));
}

/** 0 means play until the group ends the game. */
export function normalizeTotalRounds(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TOTAL_ROUNDS;
  const rounded = Math.floor(value);
  if (rounded <= 0) return 0;
  return Math.min(MAX_TOTAL_ROUNDS, rounded);
}

export function beginGame(settings: GameSettings, prompt: PictionaryPrompt): PlayingGame | null {
  const names = normalizeTeamNames(settings.teamNames);
  if (!names) return null;
  return {
    phase: "playing",
    teams: names.map((name) => ({ name, score: 0 })),
    teamIndex: 0,
    round: 1,
    totalRounds: normalizeTotalRounds(settings.totalRounds),
    timerSeconds: settings.timerSeconds,
    filters: settings.filters,
    prompt,
    usedIds: [prompt.id],
    history: [],
    settled: false,
    poolExhausted: false,
  };
}

export interface RoundTransition {
  game: ActiveGame;
  changed: boolean;
  notice?: string;
}

function withPoint(teams: GameTeam[], teamIndex: number): GameTeam[] {
  return teams.map((team, index) =>
    index === teamIndex ? { ...team, score: team.score + 1 } : team,
  );
}

export function applyRoundOutcome(
  game: PlayingGame,
  outcome: "correct" | "skip",
  nextPrompt: PictionaryPrompt | null,
): RoundTransition {
  if (game.settled || game.poolExhausted) {
    return { game, changed: false };
  }

  const teams = outcome === "correct" ? withPoint(game.teams, game.teamIndex) : game.teams;
  const history: RoundRecord[] = [
    ...game.history,
    {
      round: game.round,
      teamIndex: game.teamIndex,
      promptId: game.prompt.id,
      promptText: game.prompt.text,
      outcome,
    },
  ];

  const finished = game.totalRounds > 0 && game.round >= game.totalRounds;
  if (finished) {
    const summary: SummaryGame = {
      phase: "summary",
      teams,
      totalRounds: game.totalRounds,
      timerSeconds: game.timerSeconds,
      filters: game.filters,
      history,
      roundsPlayed: history.length,
    };
    return {
      game: summary,
      changed: true,
      notice: outcome === "correct" ? "Point scored. Game complete." : "Round skipped. Game complete.",
    };
  }

  if (!nextPrompt) {
    const blocked: PlayingGame = {
      ...game,
      teams,
      history,
      settled: true,
      poolExhausted: true,
    };
    return {
      game: blocked,
      changed: true,
      notice:
        "You've used every word in this selection. Reset the word pool or change your filters.",
    };
  }

  const usedIds = game.usedIds.includes(nextPrompt.id)
    ? game.usedIds
    : [...game.usedIds, nextPrompt.id];

  const playing: PlayingGame = {
    ...game,
    teams,
    history,
    prompt: nextPrompt,
    usedIds,
    teamIndex: (game.teamIndex + 1) % game.teams.length,
    round: game.round + 1,
    settled: false,
    poolExhausted: false,
  };

  return {
    game: playing,
    changed: true,
    notice: outcome === "correct" ? "Point scored." : "Skipped. No point awarded.",
  };
}

export function continueAfterPoolReset(
  game: PlayingGame,
  nextPrompt: PictionaryPrompt,
): PlayingGame {
  return {
    ...game,
    prompt: nextPrompt,
    usedIds: [nextPrompt.id],
    teamIndex: (game.teamIndex + 1) % game.teams.length,
    round: game.round + 1,
    settled: false,
    poolExhausted: false,
  };
}

export function endGameEarly(game: PlayingGame): SummaryGame {
  return {
    phase: "summary",
    teams: game.teams,
    totalRounds: game.totalRounds,
    timerSeconds: game.timerSeconds,
    filters: game.filters,
    history: game.history,
    roundsPlayed: game.history.length,
  };
}

export function adjustScore(game: PlayingGame, teamIndex: number, delta: number): PlayingGame {
  if (!Number.isInteger(delta) || (delta !== 1 && delta !== -1)) return game;
  if (teamIndex < 0 || teamIndex >= game.teams.length) return game;
  return {
    ...game,
    teams: game.teams.map((team, index) =>
      index === teamIndex ? { ...team, score: Math.max(0, team.score + delta) } : team,
    ),
  };
}

export interface ScoreOutcome {
  kind: "win" | "tie";
  label: string;
  leaderIndexes: number[];
}

export function scoreOutcome(teams: readonly GameTeam[]): ScoreOutcome {
  const top = teams.reduce((max, team) => Math.max(max, team.score), 0);
  const leaders = teams
    .map((team, index) => ({ team, index }))
    .filter((entry) => entry.team.score === top);

  if (leaders.length !== 1) {
    return {
      kind: "tie",
      label: `${joinNames(leaders.map((entry) => entry.team.name))} tie`,
      leaderIndexes: leaders.map((entry) => entry.index),
    };
  }

  return {
    kind: "win",
    label: `${leaders[0]!.team.name} wins`,
    leaderIndexes: [leaders[0]!.index],
  };
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "Teams";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
