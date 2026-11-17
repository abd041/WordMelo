"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { FilterControls } from "@/components/tools/pictionary/FilterControls";
import { Button } from "@/components/ui/Button";
import {
  MUTE_STORAGE_KEY,
  PICTIONARY_PROMPTS,
  SESSION_STORAGE_KEY,
  TIMER_OPTIONS,
  adjustScore,
  applyRoundOutcome,
  beginGame,
  continueAfterPoolReset,
  createCountdown,
  defaultTeamName,
  describeShortcutTarget,
  drawPrompt,
  endGameEarly,
  formatTimer,
  getCategoryLabel,
  parseSession,
  playTimerBeep,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  scoreOutcome,
  serializeSession,
  type ActiveGame,
  type PlayingGame,
  type PromptFilters,
  type SavedPictionarySession,
  type TimerHandle,
  type TimerSeconds,
} from "@/lib/tools/pictionary";
import { cn } from "@/lib/utils";

interface PlayGamePanelProps {
  active?: boolean;
  filters: PromptFilters;
  onFiltersChange: (next: PromptFilters) => void;
}

const ROUND_OPTIONS = [5, 10, 15, 20, 0] as const;

export function PlayGamePanel({ active = true, filters, onFiltersChange }: PlayGamePanelProps) {
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<TimerHandle | null>(null);
  const gameRef = useRef<ActiveGame | null>(null);
  const mutedRef = useRef(true);
  const revealedRef = useRef(false);
  const lockRef = useRef(false);
  const warnedRef = useRef(false);

  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState(["Team A", "Team B", "Team C", "Team D"]);
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(60);
  const [totalRounds, setTotalRounds] = useState(10);
  const [game, setGame] = useState<ActiveGame | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [displaySec, setDisplaySec] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [saved, setSaved] = useState<SavedPictionarySession | null>(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  function commitGame(next: ActiveGame | null) {
    gameRef.current = next;
    setGame(next);
  }

  function persistPlaying(current: PlayingGame, remainingMs: number, isRevealed: boolean) {
    safeSetItem(
      localStorage,
      SESSION_STORAGE_KEY,
      serializeSession({
        version: 1,
        game: current,
        revealed: isRevealed,
        timerRemainingMs: remainingMs,
      }),
    );
  }

  function ensureTimer(durationMs: number) {
    if (!timerRef.current) {
      timerRef.current = createCountdown({
        durationMs,
        onChange: (state) => {
          setDisplaySec(state.remainingSec);
          setTimerRunning(state.running);
          if (state.running && state.remainingSec > 0 && state.remainingSec <= 10) {
            if (!warnedRef.current) {
              warnedRef.current = true;
              setAnnounce("Less than 10 seconds left");
            }
          } else if (state.remainingSec > 10) {
            warnedRef.current = false;
          }
        },
        onExpire: () => {
          setAnnounce("Time is up");
          setNotice("Time is up. No points were added.");
          playTimerBeep(mutedRef.current);
          const current = gameRef.current;
          if (current?.phase === "playing") {
            persistPlaying(current, 0, revealedRef.current);
          }
        },
      });
    } else {
      timerRef.current.reset(durationMs);
    }
    warnedRef.current = false;
    setDisplaySec(Math.ceil(durationMs / 1000));
    setTimerRunning(false);
  }

  useEffect(() => {
    const stored = safeGetItem(localStorage, SESSION_STORAGE_KEY);
    if (stored) setSaved(parseSession(stored, PICTIONARY_PROMPTS));
    const mutePref = safeGetItem(localStorage, MUTE_STORAGE_KEY);
    if (mutePref === "false") setMuted(false);
    return () => timerRef.current?.dispose();
  }, []);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "hidden" && timerRef.current?.snapshot().running) {
        const snap = timerRef.current.pause();
        setNotice("Timer paused because this tab was hidden.");
        const current = gameRef.current;
        if (current?.phase === "playing") {
          persistPlaying(current, snap.remainingMs, revealedRef.current);
        }
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    function onFs() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && focusMode && !document.fullscreenElement) {
        setFocusMode(false);
      }
      const current = gameRef.current;
      if (!current || current.phase !== "playing") return;
      const target = describeShortcutTarget(event.target);
      const tag = target.tagName?.toUpperCase();
      if (target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = event.key.toLowerCase();
      if (key === "h" || key === "r") {
        event.preventDefault();
        setRevealed((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, focusMode]);

  useEffect(() => {
    if (active || !timerRef.current?.snapshot().running) return;
    const snap = timerRef.current.pause();
    const current = gameRef.current;
    if (current?.phase === "playing") {
      persistPlaying(current, snap.remainingMs, revealedRef.current);
    }
    setNotice("Timer paused while Quick Generator is open.");
  }, [active]);

  useEffect(() => {
    if (!game || game.phase !== "playing") return;
    const remaining = timerRef.current?.snapshot().remainingMs ?? game.timerSeconds * 1000;
    persistPlaying(game, remaining, revealed);
  }, [game, revealed]);

  function toggleMute() {
    setMuted((value) => {
      const next = !value;
      safeSetItem(localStorage, MUTE_STORAGE_KEY, next ? "true" : "false");
      return next;
    });
  }

  function startGame() {
    const drawn = drawPrompt(PICTIONARY_PROMPTS, filters);
    if (!drawn.prompt) {
      setNotice(drawn.message ?? "No prompts match these filters.");
      return;
    }
    const next = beginGame(
      {
        teamNames: teamNames.slice(0, teamCount),
        timerSeconds,
        totalRounds,
        filters,
      },
      drawn.prompt,
    );
    if (!next) {
      setNotice("Choose 2 to 4 teams to start.");
      return;
    }
    setSaved(null);
    setRevealed(false);
    setFocusMode(false);
    commitGame(next);
    ensureTimer(timerSeconds * 1000);
    setNotice("Pass the device to the drawing team, then reveal the prompt.");
    setAnnounce("Game started. Prompt hidden.");
  }

  function restoreGame() {
    if (!saved) return;
    setRevealed(saved.revealed);
    commitGame(saved.game);
    ensureTimer(saved.timerRemainingMs);
    setSaved(null);
    setNotice("Game restored. The timer is paused.");
  }

  function startFresh() {
    safeRemoveItem(localStorage, SESSION_STORAGE_KEY);
    setSaved(null);
  }

  function settle(outcome: "correct" | "skip") {
    const current = gameRef.current;
    if (!current || current.phase !== "playing" || lockRef.current) return;
    if (current.settled || current.poolExhausted) return;
    lockRef.current = true;
    const drawn = drawPrompt(PICTIONARY_PROMPTS, current.filters, {
      usedIds: current.filters.noRepeat ? new Set(current.usedIds) : undefined,
    });
    const result = applyRoundOutcome(current, outcome, drawn.prompt);
    if (!result.changed) {
      lockRef.current = false;
      return;
    }
    timerRef.current?.pause();
    setRevealed(false);
    setNotice(result.notice ?? null);
    setAnnounce(result.notice ?? (outcome === "correct" ? "Point scored" : "Turn skipped"));
    commitGame(result.game);
    if (result.game.phase === "playing" && !result.game.poolExhausted) {
      timerRef.current?.reset(result.game.timerSeconds * 1000);
    }
    if (result.game.phase === "summary") {
      safeRemoveItem(localStorage, SESSION_STORAGE_KEY);
      setFocusMode(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    }
    window.setTimeout(() => {
      lockRef.current = false;
    }, 450);
  }

  function resetPoolAndContinue() {
    const current = gameRef.current;
    if (!current || current.phase !== "playing" || !current.poolExhausted) return;
    const excludingCurrent = drawPrompt(
      PICTIONARY_PROMPTS,
      { ...current.filters, noRepeat: true },
      { usedIds: new Set([current.prompt.id]) },
    );
    const fallback = excludingCurrent.prompt
      ? excludingCurrent
      : drawPrompt(PICTIONARY_PROMPTS, { ...current.filters, noRepeat: false });
    if (!fallback.prompt) {
      setNotice("No prompts match these filters.");
      return;
    }
    const next = continueAfterPoolReset(current, fallback.prompt);
    commitGame(next);
    setRevealed(false);
    timerRef.current?.reset(next.timerSeconds * 1000);
    setNotice(
      excludingCurrent.prompt
        ? "Word pool reset. Next round is ready."
        : "Only one prompt matches these filters, so it can repeat.",
    );
  }

  function exitGame() {
    const current = gameRef.current;
    if (!current || current.phase !== "playing") return;
    timerRef.current?.pause();
    commitGame(endGameEarly(current));
    safeRemoveItem(localStorage, SESSION_STORAGE_KEY);
    setFocusMode(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }

  function backToSetup() {
    timerRef.current?.pause();
    commitGame(null);
    setRevealed(false);
    setFocusMode(false);
    safeRemoveItem(localStorage, SESSION_STORAGE_KEY);
  }

  function bumpScore(teamIndex: number, delta: number) {
    const current = gameRef.current;
    if (!current || current.phase !== "playing") return;
    commitGame(adjustScore(current, teamIndex, delta));
  }

  function toggleTimer() {
    const timer = timerRef.current;
    if (!timer) return;
    if (timer.snapshot().running) {
      const snap = timer.pause();
      const current = gameRef.current;
      if (current?.phase === "playing") persistPlaying(current, snap.remainingMs, revealedRef.current);
      return;
    }
    timer.start();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement && stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
        setFocusMode(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        setFocusMode((value) => !value);
      }
    } catch {
      setFocusMode((value) => !value);
      setNotice("Using on-page focus mode because fullscreen is unavailable.");
    }
  }

  const immersive = focusMode || fullscreen;

  if (game?.phase === "summary") {
    const outcome = scoreOutcome(game.teams);
    return (
      <section className="rounded-[1.25rem] border border-line bg-surface p-5 shadow-soft sm:p-7">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">Game over</p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-ink">{outcome.label}</h2>
        <p className="mt-2 text-sm text-ink-muted">
          {game.roundsPlayed} {game.roundsPlayed === 1 ? "round" : "rounds"} played
          {game.totalRounds > 0 ? ` of ${game.totalRounds}` : ""}. A round is one team’s turn.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {game.teams.map((team, index) => (
            <li key={`${team.name}-${index}`} className="rounded-[1rem] border border-line bg-mint/40 px-4 py-5 text-center">
              <p className="truncate text-sm text-ink-muted">{team.name}</p>
              <p className="mt-1 font-display text-4xl font-semibold text-ink">{team.score}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {outcome.leaderIndexes.includes(index) ? (outcome.kind === "tie" ? "Tied" : "Winner") : "Final score"}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={startGame}>
            Play again
          </Button>
          <Button type="button" variant="secondary" onClick={backToSetup}>
            New game
          </Button>
        </div>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Play Pictionary</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          {teamCount} teams · {timerSeconds} seconds · {filters.difficulty} ·{" "}
          {filters.categories.length === 0 ? "all categories" : `${filters.categories.length} categories`} ·{" "}
          {totalRounds === 0 ? "no round limit" : `${totalRounds} rounds`}. A round is one team’s turn.
        </p>

        {saved ? (
          <div className="mt-4 rounded-control border border-line bg-paper p-3" role="status">
            <p className="text-sm text-ink">An unfinished game is saved in this browser.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={restoreGame}>
                Restore game
              </Button>
              <Button type="button" variant="secondary" onClick={startFresh}>
                Start fresh
              </Button>
            </div>
          </div>
        ) : null}

        {notice ? (
          <p role="status" className="mt-3 text-sm text-ink-muted">
            {notice}
          </p>
        ) : null}

        <Button type="button" size="lg" className="mt-5 w-full sm:w-auto" onClick={startGame}>
          <Play className="h-4 w-4" aria-hidden />
          Start game
        </Button>

        <details className="mt-5 rounded-control border border-line bg-paper p-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Customize game</summary>
          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Teams</legend>
              <div className="mt-2 flex gap-2">
                {[2, 3, 4].map((count) => (
                  <label
                    key={count}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-control border px-3 text-sm font-semibold",
                      teamCount === count ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-teams`}
                      className="sr-only"
                      checked={teamCount === count}
                      onChange={() => setTeamCount(count)}
                    />
                    {count}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              {teamNames.slice(0, teamCount).map((name, index) => (
                <div key={defaultTeamName(index)}>
                  <label htmlFor={`${id}-team-${index}`} className="text-sm font-semibold text-ink">
                    {defaultTeamName(index)} name
                  </label>
                  <input
                    id={`${id}-team-${index}`}
                    maxLength={28}
                    value={name}
                    onChange={(event) =>
                      setTeamNames((current) =>
                        current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)),
                      )
                    }
                    className="mt-1.5 h-11 w-full rounded-control border border-line bg-surface px-3 text-base text-ink"
                  />
                </div>
              ))}
            </div>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Timer</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIMER_OPTIONS.map((seconds) => (
                  <label
                    key={seconds}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-control border px-3 text-sm font-semibold",
                      timerSeconds === seconds ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-timer`}
                      className="sr-only"
                      checked={timerSeconds === seconds}
                      onChange={() => {
                        setTimerSeconds(seconds);
                        setDisplaySec(seconds);
                      }}
                    />
                    {seconds}s
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor={`${id}-rounds`} className="text-sm font-semibold text-ink">
                Rounds
              </label>
              <select
                id={`${id}-rounds`}
                value={totalRounds}
                onChange={(event) => setTotalRounds(Number(event.target.value))}
                className="mt-1.5 h-11 w-full max-w-xs rounded-control border border-line bg-surface px-3 text-base text-ink"
              >
                {ROUND_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value === 0 ? "No limit" : `${value} rounds`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-soft">A round is one team’s turn. No limit ends when you exit.</p>
            </div>
            <FilterControls idPrefix={`${id}-play`} filters={filters} onChange={onFiltersChange} />
          </div>
        </details>
      </section>
    );
  }

  const playing = game;
  const urgent = timerRunning && displaySec <= 10 && displaySec > 0;
  const activeName = playing.teams[playing.teamIndex]?.name ?? "Current team";

  return (
    <div
      ref={stageRef}
      className={cn(
        "space-y-4 rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft sm:p-5",
        immersive &&
          "fixed inset-0 z-50 overflow-y-auto rounded-none border-0 bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8",
      )}
    >
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Round {playing.round}
            {playing.totalRounds > 0 ? ` of ${playing.totalRounds}` : ""}
          </p>
          <h2 className="mt-1 truncate font-display text-2xl font-semibold text-ink">{activeName}</h2>
          <p className="text-sm text-ink-muted">Drawing now</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={toggleMute} aria-pressed={muted}>
            {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            {muted ? "Sound off" : "Sound on"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void toggleFullscreen()}>
            {immersive ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            {immersive ? "Exit focus" : "Focus"}
          </Button>
        </div>
      </div>

      <div
        role="timer"
        aria-live="off"
        aria-label={`Time remaining ${formatTimer(displaySec)}`}
        className={cn(
          "rounded-[1.1rem] border px-4 py-5 text-center",
          urgent ? "border-danger bg-danger/5" : "border-accent/30 bg-accent-soft/60",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {timerRunning ? "Time running" : displaySec <= 0 ? "Time is up" : "Timer paused"}
        </p>
        <p className={cn("mt-1 font-display text-6xl font-semibold tabular-nums", urgent ? "text-danger" : "text-ink")}>
          {formatTimer(displaySec)}
        </p>
        {urgent ? <p className="mt-1 text-sm font-semibold text-danger">Time is running out</p> : null}
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {playing.teams.map((team, index) => {
          const drawing = index === playing.teamIndex;
          return (
            <li key={`${team.name}-${index}`} className={cn("min-w-0 rounded-[1rem] border px-3 py-3", drawing ? "border-accent bg-mint/50" : "border-line bg-paper")}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">
                {drawing ? "Drawing" : "Waiting"}
              </p>
              <p className="truncate text-sm font-medium text-ink">{team.name}</p>
              <p className="font-display text-3xl font-semibold text-ink">{team.score}</p>
            </li>
          );
        })}
      </ul>

      <div className="rounded-[1.1rem] border border-line bg-paper px-4 py-8 text-center">
        {playing.poolExhausted ? (
          <div>
            <p className="font-display text-2xl font-semibold text-ink">Word pool used up</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              You&apos;ve used every word in this selection. Reset the word pool or end the game.
            </p>
          </div>
        ) : revealed ? (
          <div key={playing.prompt.id} className="motion-safe:animate-fade-in">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">Draw this</p>
            <p className="mt-2 break-words font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {playing.prompt.text}
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              <span className="capitalize">{playing.prompt.difficulty}</span>
              <span className="mx-2">·</span>
              {getCategoryLabel(playing.prompt.category)}
              <span className="mx-2">·</span>
              Visible
            </p>
          </div>
        ) : (
          <div>
            <p className="font-display text-3xl font-semibold text-ink">Prompt hidden</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              Only the drawing team should reveal it. Hide it again before the guessers look.
            </p>
          </div>
        )}
      </div>

      {notice ? (
        <p role="status" className="text-sm text-ink-muted">
          {notice}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button type="button" variant="secondary" className="col-span-2 sm:col-span-1" disabled={playing.poolExhausted} onClick={() => setRevealed((value) => !value)}>
          {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {revealed ? "Hide prompt" : "Reveal prompt"}
        </Button>
        <Button type="button" className="col-span-2 sm:col-span-1" onClick={toggleTimer} disabled={playing.poolExhausted}>
          {timerRunning ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          {timerRunning ? "Pause" : displaySec <= 0 ? "Restart timer" : "Start timer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => settle("correct")} disabled={playing.settled || playing.poolExhausted}>
          <Check className="h-4 w-4" aria-hidden />
          Correct
        </Button>
        <Button type="button" variant="secondary" onClick={() => settle("skip")} disabled={playing.settled || playing.poolExhausted}>
          <SkipForward className="h-4 w-4" aria-hidden />
          Skip
        </Button>
      </div>

      {playing.poolExhausted ? (
        <Button type="button" onClick={resetPoolAndContinue}>
          Reset word pool
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => settle("skip")} disabled={playing.settled || playing.poolExhausted}>
          Next round
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={exitGame}>
          Exit game
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={backToSetup}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Restart
        </Button>
      </div>

      <details className="rounded-control border border-line bg-paper px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Adjust scores</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {playing.teams.map((team, index) => (
            <div key={`${team.name}-adjust-${index}`} className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => bumpScore(index, -1)} aria-label={`Remove a point from ${team.name}`}>
                {team.name} −
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => bumpScore(index, 1)} aria-label={`Add a point to ${team.name}`}>
                {team.name} +
              </Button>
            </div>
          ))}
        </div>
      </details>
      <p className="text-xs text-ink-soft">The timer pauses if you leave this tab. H or R hides the prompt. Esc leaves focus mode.</p>
    </div>
  );
}
