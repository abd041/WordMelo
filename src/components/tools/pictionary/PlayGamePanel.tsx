"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
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
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import {
  PICTIONARY_PROMPTS,
  TIMER_OPTIONS,
  drawPrompt,
  formatTimer,
  getCategoryLabel,
  nowMs,
  playTimerBeep,
  remainingFromDeadline,
  type PictionaryPrompt,
  type PromptFilters,
  type TimerSeconds,
} from "@/lib/tools/pictionary";
import { cn } from "@/lib/utils";

type Phase = "setup" | "playing" | "summary";
type ActiveTeam = "a" | "b";

interface PlayGamePanelProps {
  active?: boolean;
  filters: PromptFilters;
  onFiltersChange: (next: PromptFilters) => void;
}

export function PlayGamePanel({
  active = true,
  filters,
  onFiltersChange,
}: PlayGamePanelProps) {
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [round, setRound] = useState(1);
  const [targetRounds, setTargetRounds] = useState(0);
  const [activeTeam, setActiveTeam] = useState<ActiveTeam>("a");
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(60);
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [pausedRemainingMs, setPausedRemainingMs] = useState<number | null>(
    timerSeconds * 1000,
  );
  const [running, setRunning] = useState(false);
  const [displaySec, setDisplaySec] = useState<number>(timerSeconds);
  const [prompt, setPrompt] = useState<PictionaryPrompt | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [usedIds, setUsedIds] = useState<Set<string>>(() => new Set());
  const [muted, setMuted] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error" | "neutral";
  } | null>(null);
  const [history, setHistory] = useState<
    Array<{ round: number; team: ActiveTeam; prompt: string; correct: boolean }>
  >([]);

  const announceRef = useRef<HTMLParagraphElement>(null);
  const expiredRef = useRef(false);

  const pickPrompt = useCallback(
    (resetUsed: boolean) => {
      let nextUsed = resetUsed ? new Set<string>() : usedIds;
      const result = drawPrompt(PICTIONARY_PROMPTS, filters, {
        usedIds: filters.noRepeat && !resetUsed ? nextUsed : undefined,
      });
      if (!result.prompt) {
        setFeedback({
          message: result.message ?? "No prompts left",
          tone: "neutral",
        });
        setPrompt(null);
        return false;
      }
      setPrompt(result.prompt);
      nextUsed = new Set(resetUsed ? [] : usedIds);
      nextUsed.add(result.prompt.id);
      setUsedIds(nextUsed);
      setRevealed(false);
      setRoundLocked(false);
      return true;
    },
    [filters, usedIds],
  );

  function armTimer(seconds: number) {
    setRunning(false);
    setDeadlineMs(null);
    setPausedRemainingMs(seconds * 1000);
    setDisplaySec(seconds);
    expiredRef.current = false;
  }

  function startGame() {
    setScoreA(0);
    setScoreB(0);
    setRound(1);
    setActiveTeam("a");
    setHistory([]);
    setUsedIds(new Set());
    armTimer(timerSeconds);
    const ok = pickPrompt(true);
    if (ok) {
      setPhase("playing");
      setFeedback({
        message: "Pass the device to the drawer, then Reveal Prompt",
        tone: "success",
      });
    }
  }

  function endGame() {
    setRunning(false);
    setDeadlineMs(null);
    setPhase("summary");
    setFocusMode(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }

  function resetAll() {
    setRunning(false);
    setPhase("setup");
    setPrompt(null);
    setRevealed(false);
    setUsedIds(new Set());
    setHistory([]);
    setScoreA(0);
    setScoreB(0);
    setRound(1);
    setRoundLocked(false);
    setFocusMode(false);
    armTimer(timerSeconds);
  }

  // Display tick from deadline
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const snap = remainingFromDeadline(
        deadlineMs,
        pausedRemainingMs,
        running,
      );
      setDisplaySec(snap.remainingSec);
      if (running && snap.expired && !expiredRef.current) {
        expiredRef.current = true;
        setRunning(false);
        setDeadlineMs(null);
        setPausedRemainingMs(0);
        playTimerBeep(muted);
        if (announceRef.current) {
          announceRef.current.textContent = "Time is up";
        }
        setFeedback({ message: "Time is up — no automatic points", tone: "neutral" });
      }
    };
    tick();
    if (!running) return;
    const handle = window.setInterval(tick, 200);
    return () => window.clearInterval(handle);
  }, [running, deadlineMs, pausedRemainingMs, phase, muted]);

  // Pause when tab hidden (explicit policy)
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "hidden" && running) {
        const snap = remainingFromDeadline(deadlineMs, pausedRemainingMs, true);
        setRunning(false);
        setDeadlineMs(null);
        setPausedRemainingMs(snap.remainingMs);
        setFeedback({
          message: "Timer paused while this tab was hidden",
          tone: "neutral",
        });
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running, deadlineMs, pausedRemainingMs]);

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
      if (phase !== "playing") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        setRevealed((r) => !r);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, phase, focusMode]);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement && stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
        setFocusMode(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        setFocusMode((f) => !f);
      }
    } catch {
      setFocusMode((f) => !f);
      setFeedback({
        message: "Using on-page focus mode (fullscreen unavailable)",
        tone: "neutral",
      });
    }
  }

  function toggleTimer() {
    if (running) {
      const snap = remainingFromDeadline(deadlineMs, pausedRemainingMs, true);
      setRunning(false);
      setDeadlineMs(null);
      setPausedRemainingMs(snap.remainingMs);
      return;
    }
    const base =
      pausedRemainingMs !== null && pausedRemainingMs > 0
        ? pausedRemainingMs
        : timerSeconds * 1000;
    if (base <= 0) {
      armTimer(timerSeconds);
      setDeadlineMs(nowMs() + timerSeconds * 1000);
      setPausedRemainingMs(null);
      setRunning(true);
      expiredRef.current = false;
      return;
    }
    setDeadlineMs(nowMs() + base);
    setPausedRemainingMs(null);
    setRunning(true);
    expiredRef.current = false;
  }

  function advanceRound(scored: boolean) {
    if (targetRounds > 0 && round >= targetRounds) {
      if (scored || history.length > 0) {
        endGame();
        return;
      }
    }
    setRound((r) => r + 1);
    setActiveTeam((t) => (t === "a" ? "b" : "a"));
    armTimer(timerSeconds);
    pickPrompt(false);
    if (!scored) {
      setFeedback({ message: "Next round ready — reveal for the new drawer", tone: "neutral" });
    }
  }

  function markCorrect() {
    if (!prompt || roundLocked) return;
    setRoundLocked(true);
    if (activeTeam === "a") setScoreA((s) => s + 1);
    else setScoreB((s) => s + 1);
    setHistory((h) => [
      ...h,
      { round, team: activeTeam, prompt: prompt.text, correct: true },
    ]);
    setRunning(false);
    setDeadlineMs(null);
    setFeedback({ message: "Point scored", tone: "success" });
    if (announceRef.current) {
      announceRef.current.textContent = "Point scored";
    }
    advanceRound(true);
  }

  function skipPrompt() {
    if (!prompt || roundLocked) {
      armTimer(timerSeconds);
      pickPrompt(false);
      return;
    }
    setRoundLocked(true);
    setHistory((h) => [
      ...h,
      { round, team: activeTeam, prompt: prompt.text, correct: false },
    ]);
    setRunning(false);
    setDeadlineMs(null);
    setActiveTeam((t) => (t === "a" ? "b" : "a"));
    setRound((r) => r + 1);
    armTimer(timerSeconds);
    pickPrompt(false);
    setFeedback({ message: "Skipped — next team", tone: "neutral" });
  }

  const urgent = displaySec <= 10 && running;
  const immersive = focusMode || fullscreen;

  if (phase === "setup") {
    return (
      <section className="rounded-[1.35rem] border border-line bg-surface p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          Game setup
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Timed rounds with teams and secret prompts — no stakes, no soundtrack.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-team-a`} className="text-sm font-semibold text-ink">
              Team A name
            </label>
            <input
              id={`${id}-team-a`}
              maxLength={28}
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value.slice(0, 28) || "Team A")}
              className="mt-1.5 h-11 w-full rounded-control border border-line bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor={`${id}-team-b`} className="text-sm font-semibold text-ink">
              Team B name
            </label>
            <input
              id={`${id}-team-b`}
              maxLength={28}
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value.slice(0, 28) || "Team B")}
              className="mt-1.5 h-11 w-full rounded-control border border-line bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-ink">Round duration</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIMER_OPTIONS.map((sec) => (
              <label
                key={sec}
                className={cn(
                  "cursor-pointer rounded-control border px-3.5 py-2.5 text-sm font-semibold",
                  timerSeconds === sec
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-paper text-ink",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-timer`}
                  className="sr-only"
                  checked={timerSeconds === sec}
                  onChange={() => {
                    setTimerSeconds(sec);
                    armTimer(sec);
                  }}
                />
                {sec}s
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor={`${id}-target`} className="text-sm font-semibold text-ink">
            Optional target rounds
          </label>
          <input
            id={`${id}-target`}
            type="number"
            min={0}
            max={50}
            value={targetRounds}
            onChange={(e) =>
              setTargetRounds(
                Math.min(50, Math.max(0, Math.floor(Number(e.target.value) || 0))),
              )
            }
            className="mt-1.5 h-11 w-28 rounded-control border border-line bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <p className="mt-1 text-xs text-ink-soft">0 = play until you end the game</p>
        </div>

        <div className="mt-5">
          <FilterControls
            idPrefix={`${id}-play`}
            filters={filters}
            onChange={onFiltersChange}
            usedIds={usedIds}
          />
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="mt-6 w-full shadow-lift sm:w-auto"
          onClick={startGame}
        >
          <Play className="h-4 w-4" aria-hidden />
          Start Game
        </Button>
      </section>
    );
  }

  if (phase === "summary") {
    const winner =
      scoreA === scoreB
        ? "It's a tie"
        : scoreA > scoreB
          ? `${teamAName} wins`
          : `${teamBName} wins`;
    return (
      <section className="rounded-[1.35rem] border border-line bg-surface p-5 shadow-soft sm:p-7">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Game summary
        </h2>
        <p className="mt-2 text-lg text-ink-muted">{winner}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.1rem] border border-line bg-mint/35 px-4 py-6 text-center">
            <p className="truncate text-sm font-medium text-ink-muted">{teamAName}</p>
            <p className="mt-1 font-display text-4xl font-semibold text-ink">{scoreA}</p>
          </div>
          <div className="rounded-[1.1rem] border border-line bg-mint/35 px-4 py-6 text-center">
            <p className="truncate text-sm font-medium text-ink-muted">{teamBName}</p>
            <p className="mt-1 font-display text-4xl font-semibold text-ink">{scoreB}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-muted">Completed turns: {history.length}</p>
        {history.length > 0 ? (
          <ul className="mt-3 max-h-44 space-y-1.5 overflow-y-auto text-sm text-ink-muted">
            {history.slice(-12).map((entry, index) => (
              <li key={`${entry.round}-${index}`}>
                Round {entry.round}: {entry.prompt} —{" "}
                {entry.correct ? "correct" : "skipped"} (
                {entry.team === "a" ? teamAName : teamBName})
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" variant="primary" onClick={startGame}>
            Play Again
          </Button>
          <Button type="button" variant="secondary" onClick={resetAll}>
            New Game Setup
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={stageRef}
      className={cn(
        "space-y-4 rounded-[1.35rem] border border-line bg-surface p-4 shadow-soft sm:p-5",
        immersive &&
          "fixed inset-0 z-50 min-h-dvh overflow-y-auto rounded-none border-0 bg-paper p-5 sm:p-8",
      )}
    >
      <p ref={announceRef} className="sr-only" aria-live="polite" />

      {feedback ? (
        <FeedbackMessage
          message={feedback.message}
          tone={feedback.tone}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Round {round}
            {targetRounds > 0 ? ` / ${targetRounds}` : ""}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink sm:text-base">
            Drawing: {activeTeam === "a" ? teamAName : teamBName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            {muted ? "Muted" : "Beep on"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void toggleFullscreen()}>
            {immersive ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            {immersive ? "Exit focus" : "Focus mode"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.1rem] border border-line bg-paper px-4 py-4 text-center">
          <p className="truncate text-xs text-ink-soft">{teamAName}</p>
          <p className="font-display text-4xl font-semibold text-ink">{scoreA}</p>
        </div>
        <div
          className={cn(
            "rounded-[1.1rem] border px-4 py-4 text-center",
            urgent ? "border-danger/40 bg-danger/5" : "border-accent/35 bg-accent-soft/50",
          )}
          role="timer"
          aria-label={`Time remaining ${formatTimer(displaySec)}`}
        >
          <p className="text-xs text-ink-soft">Timer</p>
          <p
            className={cn(
              "font-display text-4xl font-semibold tabular-nums sm:text-5xl",
              urgent ? "text-danger" : "text-ink",
            )}
          >
            {formatTimer(displaySec)}
          </p>
        </div>
        <div className="rounded-[1.1rem] border border-line bg-paper px-4 py-4 text-center">
          <p className="truncate text-xs text-ink-soft">{teamBName}</p>
          <p className="font-display text-4xl font-semibold text-ink">{scoreB}</p>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-line bg-mint/25 px-4 py-10 text-center sm:px-8 sm:py-12">
        {prompt && revealed ? (
          <>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Draw this
            </p>
            <p className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
              {prompt.text}
            </p>
            <p className="mt-4 text-sm text-ink-muted">
              <span className="capitalize">{prompt.difficulty}</span>
              <span className="mx-2">·</span>
              {getCategoryLabel(prompt.category)}
            </p>
          </>
        ) : (
          <div>
            <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Prompt hidden
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
              Only the drawing player should reveal it. Hide again before facing the group, then start the timer.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => setRevealed((r) => !r)}
          disabled={!prompt}
        >
          {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {revealed ? "Hide Prompt" : "Reveal Prompt"}
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={toggleTimer}>
          {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          {running ? "Pause" : displaySec <= 0 ? "Restart Timer" : "Start Timer"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={markCorrect}
          disabled={!prompt || roundLocked}
        >
          <Check className="h-4 w-4" aria-hidden />
          Correct
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={skipPrompt}>
          <SkipForward className="h-4 w-4" aria-hidden />
          Skip
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => advanceRound(false)}
        >
          Next Round
        </Button>
      </div>

      <p className="text-xs text-ink-soft">
        Shortcuts: R reveal/hide · Esc exit focus mode
      </p>

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setScoreA((s) => Math.max(0, s - 1))}
        >
          {teamAName} −
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setScoreA((s) => s + 1)}>
          {teamAName} +
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setScoreB((s) => Math.max(0, s - 1))}
        >
          {teamBName} −
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setScoreB((s) => s + 1)}>
          {teamBName} +
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={endGame}>
          End Game
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </Button>
      </div>
    </div>
  );
}
