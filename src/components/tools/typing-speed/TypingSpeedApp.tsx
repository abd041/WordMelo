"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { PassageView } from "@/components/tools/typing-speed/PassageView";
import { WpmChart } from "@/components/tools/typing-speed/WpmChart";
import {
  applyTypedChange,
  completeEngine,
  createEngineState,
  pauseEngine,
  resumeEngine,
  type EngineState,
} from "@/lib/tools/typing-speed/engine";
import { difficultyLabel, formatResultsText, modeLabel, TXT_FILENAME } from "@/lib/tools/typing-speed/format";
import { defaultRandomInt } from "@/lib/tools/typing-speed/generate";
import {
  clearHistory,
  configKey,
  readHistory,
  recordAttempt,
  writeHistory,
  type StoredHistory,
} from "@/lib/tools/typing-speed/history";
import { computeMetrics, roundStat, wpmSeries } from "@/lib/tools/typing-speed/metrics";
import { createTypingClock, formatRemaining, type TypingClock } from "@/lib/tools/typing-speed/timer";
import {
  DEFAULT_SETTINGS,
  DIFFICULTIES,
  DURATIONS,
  TYPING_MODES,
  type AttemptRecord,
  type Difficulty,
  type DurationSec,
  type TestSettings,
  type TypingMode,
} from "@/lib/tools/typing-speed/types";
import { cn, copyTextToClipboard, downloadTextFile } from "@/lib/utils";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50";
const primaryClass =
  "inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function TypingSpeedApp() {
  const baseId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<TypingClock | null>(null);
  const composingRef = useRef(false);
  const engineRef = useRef<EngineState | null>(null);
  const recordedRef = useRef(false);
  const [settings, setSettings] = useState<TestSettings>(DEFAULT_SETTINGS);
  const [engine, setEngine] = useState<EngineState>(() => createEngineState(DEFAULT_SETTINGS, defaultRandomInt));
  engineRef.current = engine;
  const [remainingMs, setRemainingMs] = useState(DEFAULT_SETTINGS.durationSec * 1000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [message, setMessage] = useState("Click the passage and start typing. The timer begins on your first character.");
  const [saveScores, setSaveScores] = useState(true);
  const [history, setHistory] = useState<StoredHistory>(() => readHistory(null));
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const [inputEpoch, setInputEpoch] = useState(0);

  const metrics = useMemo(
    () => computeMetrics(engine.events, engine.typed, engine.passage, elapsedMs),
    [engine.events, engine.typed, engine.passage, elapsedMs],
  );

  const samples = useMemo(
    () => (engine.status === "completed" ? wpmSeries(engine.events, engine.passage, metrics.elapsedMs) : []),
    [engine.status, engine.events, engine.passage, metrics.elapsedMs],
  );

  const best = history.best[configKey(settings)] ?? null;

  const bootClock = useCallback((next: TestSettings, onExpire: () => void) => {
    clockRef.current?.dispose();
    clockRef.current = createTypingClock({
      durationMs: next.durationSec * 1000,
      onExpire,
    });
    setRemainingMs(next.durationSec * 1000);
    setElapsedMs(0);
  }, []);

  const finish = useCallback(() => {
    setEngine((current) => {
      if (current.status === "completed") return current;
      return completeEngine(current);
    });
  }, []);

  const restart = useCallback(
    (nextSettings = settings, note = "New test ready. Type to begin.") => {
      const fresh = createEngineState(nextSettings, defaultRandomInt);
      recordedRef.current = false;
      engineRef.current = fresh;
      setEngine(fresh);
      setCopied(null);
      setMessage(note);
      setInputEpoch((value) => value + 1);
      bootClock(nextSettings, finish);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [bootClock, finish, settings],
  );

  useEffect(() => {
    bootClock(DEFAULT_SETTINGS, finish);
    setHistory(readHistory(storage()));
    return () => clockRef.current?.dispose();
    // Clock is rebuilt on Restart; this effect only boots and loads history once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const snap = clockRef.current?.snapshot();
      if (!snap) return;
      setRemainingMs(snap.remainingMs);
      if (snap.started) setElapsedMs(snap.elapsedMs);
      if (snap.expired) finish();
    }, 100);
    return () => window.clearInterval(id);
  }, [finish]);

  useEffect(() => {
    const box = passageRef.current;
    const caret = box?.querySelector("[data-caret='true']");
    if (!box || !(caret instanceof HTMLElement)) return;
    const boxRect = box.getBoundingClientRect();
    const caretRect = caret.getBoundingClientRect();
    if (caretRect.bottom > boxRect.bottom) box.scrollTop += caretRect.bottom - boxRect.bottom + 12;
    if (caretRect.top < boxRect.top) box.scrollTop -= boxRect.top - caretRect.top + 12;
  }, [engine.typed]);

  useEffect(() => {
    function onVisibility() {
      const clock = clockRef.current;
      if (!clock) return;
      if (document.hidden) {
        if (clock.pause().paused) {
          setEngine((current) => pauseEngine(current));
          setMessage("Paused while this tab is in the background. Return here to continue the same attempt.");
        }
      } else if (clock.resume().running) {
        setEngine((current) => resumeEngine(current));
        setMessage("Test resumed.");
        inputRef.current?.focus();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (engine.status !== "completed" || recordedRef.current) return;
    recordedRef.current = true;
    const snap = clockRef.current?.snapshot();
    const elapsed = snap?.elapsedMs ?? elapsedMs;
    const finalMetrics = computeMetrics(engine.events, engine.typed, engine.passage, elapsed);
    setElapsedMs(elapsed);
    setMessage("Time is up. Review your results or start a new test.");
    if (!saveScores || finalMetrics.totalInserts === 0) return;
    const attempt: AttemptRecord = {
      at: new Date().toISOString(),
      durationSec: engine.settings.durationSec,
      difficulty: engine.settings.difficulty,
      mode: engine.settings.mode,
      netWpm: roundStat(finalMetrics.netWpm),
      grossWpm: roundStat(finalMetrics.grossWpm),
      accuracy: roundStat(finalMetrics.accuracy, 1),
    };
    setHistory((current) => {
      const next = recordAttempt(current, attempt);
      writeHistory(storage(), next);
      return next;
    });
  }, [engine, elapsedMs, saveScores]);

  function applyInput(value: string, opts?: { paste?: boolean }) {
    const clock = clockRef.current;
    const current = engineRef.current;
    if (!clock || !current) return;
    const before = clock.snapshot();
    const elapsed = before.started ? before.elapsedMs : 0;
    const result = applyTypedChange(current, value, elapsed, {
      paste: opts?.paste,
      composing: composingRef.current,
    });
    if (result.rejected === "paste") {
      setMessage("Pasting is disabled. This test only counts characters you type.");
      if (inputRef.current) inputRef.current.value = current.typed;
      return;
    }
    if (result.rejected) {
      if (inputRef.current) inputRef.current.value = current.typed;
      return;
    }
    if (result.started) clock.start();
    engineRef.current = result.state;
    setEngine(result.state);
    if (inputRef.current) inputRef.current.value = result.state.typed;
  }

  function updateSettings<Key extends keyof TestSettings>(key: Key, value: TestSettings[Key]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    restart(next, "Settings updated. A new test is ready.");
  }

  async function copyResults() {
    if (engine.status !== "completed") return;
    const text = formatResultsText(metrics, engine.settings, { personalBest: best?.netWpm ?? null });
    const ok = await copyTextToClipboard(text);
    setCopied(ok ? "ok" : "fail");
    setMessage(ok ? "Results copied." : "Copy failed. You can select the results text instead.");
  }

  function downloadResults() {
    if (engine.status !== "completed") return;
    downloadTextFile(TXT_FILENAME, `${formatResultsText(metrics, engine.settings, { personalBest: best?.netWpm ?? null })}\n`);
    setMessage("Results downloaded.");
  }

  const liveWpm = elapsedMs < 500 ? 0 : roundStat(metrics.netWpm);
  const liveAccuracy = roundStat(metrics.accuracy, 1);
  const timeLabel = engine.status === "ready" ? formatRemaining(settings.durationSec * 1000) : formatRemaining(remainingMs);

  return (
    <div className="flex flex-col gap-6">
      <section className="surface-card p-4 sm:p-5" aria-labelledby={`${baseId}-settings`}>
        <h2 id={`${baseId}-settings`} className="font-display text-xl font-semibold text-ink">
          Test setup
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Duration</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <Choice
                  key={duration}
                  name={`${baseId}-duration`}
                  checked={settings.durationSec === duration}
                  label={`${duration}s`}
                  onSelect={() => updateSettings("durationSec", duration as DurationSec)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Mode</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPING_MODES.map((mode) => (
                <Choice
                  key={mode}
                  name={`${baseId}-mode`}
                  checked={settings.mode === mode}
                  label={modeLabel(mode as TypingMode)}
                  onSelect={() => updateSettings("mode", mode as TypingMode)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Difficulty</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTIES.map((difficulty) => (
                <Choice
                  key={difficulty}
                  name={`${baseId}-difficulty`}
                  checked={settings.difficulty === difficulty}
                  label={difficultyLabel(difficulty as Difficulty)}
                  onSelect={() => updateSettings("difficulty", difficulty as Difficulty)}
                />
              ))}
            </div>
          </fieldset>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Changing setup starts a new attempt. 60 seconds is the default. Hidden tabs pause the clock so
          background throttling cannot inflate WPM.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="WPM" value={engine.status === "ready" ? "—" : String(liveWpm)} hint="Net, matching characters" />
        <Stat label="Accuracy" value={engine.status === "ready" ? "—" : `${liveAccuracy}%`} hint="Keystroke accuracy" />
        <Stat label="Time" value={timeLabel} hint={engine.status === "paused" ? "Paused" : "Remaining"} />
      </div>

      <section className="surface-card relative p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-ink">Typing passage</h2>
          <p className="text-sm text-ink-muted">
            {modeLabel(settings.mode)} · {difficultyLabel(settings.difficulty)} · {settings.durationSec}s
          </p>
        </div>
        <div
          ref={passageRef}
          className="relative min-h-52 max-h-[min(28rem,50vh)] overflow-y-auto rounded-control border border-line bg-paper px-4 py-4 sm:min-h-64 sm:px-5 sm:py-5"
        >
          <PassageView passage={engine.passage} typed={engine.typed} active={engine.status !== "completed"} />
          <label htmlFor={`${baseId}-input`} className="sr-only">
            Type the passage shown. The timer starts on the first character. Pasting is disabled.
          </label>
          <textarea
            key={inputEpoch}
            ref={inputRef}
            id={`${baseId}-input`}
            defaultValue=""
            disabled={engine.status === "completed"}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="done"
            aria-describedby={`${baseId}-status`}
            onWheel={(event) => {
              passageRef.current?.scrollBy({ top: event.deltaY });
            }}
            onPaste={(event) => {
              event.preventDefault();
              applyInput(engine.typed, { paste: true });
            }}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={(event) => {
              composingRef.current = false;
              applyInput(event.currentTarget.value);
            }}
            onChange={(event) => {
              if (composingRef.current) return;
              applyInput(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
              if (event.key === "Escape") {
                event.preventDefault();
                inputRef.current?.blur();
              }
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                restart();
              }
            }}
            className="absolute inset-0 z-10 h-full w-full resize-none rounded-control bg-transparent text-base text-transparent caret-transparent"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={primaryClass} onClick={() => inputRef.current?.focus()}>
            Focus typing
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => restart(settings, "Test restarted. Type to begin.")}
          >
            {engine.status === "completed" ? "Try Again" : "Restart"}
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => restart(settings, "New passage ready. Type to begin.")}
          >
            New Test
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Shortcuts: click or tab to focus, Escape to leave the box, Ctrl+Enter or Cmd+Enter to restart.
          Paste is blocked during the test.
        </p>
        <p id={`${baseId}-status`} role="status" className="mt-2 text-sm text-ink">
          {message}
        </p>
      </section>

      {engine.status === "completed" ? (
        <section className="surface-card p-4 sm:p-6" aria-labelledby={`${baseId}-results`}>
          <h2 id={`${baseId}-results`} className="font-display text-xl font-semibold text-ink">
            Your typing speed
          </h2>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <p className="font-display text-5xl font-semibold text-ink">{roundStat(metrics.netWpm)} WPM</p>
            <p className="text-2xl font-semibold text-accent">{roundStat(metrics.accuracy, 1)}% Accuracy</p>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Mini label="Gross WPM" value={String(roundStat(metrics.grossWpm))} />
            <Mini label="Duration" value={`${engine.settings.durationSec}s`} />
            <Mini label="Correct characters" value={String(metrics.currentlyCorrect)} />
            <Mini label="Incorrect characters" value={String(metrics.currentlyIncorrect)} />
            <Mini label="Corrected errors" value={String(metrics.correctedErrors)} />
            <Mini label="Uncorrected errors" value={String(metrics.uncorrectedErrors)} />
            <Mini label="Keystrokes" value={String(metrics.totalInserts)} />
            <Mini
              label="Setup"
              value={`${modeLabel(engine.settings.mode)} · ${difficultyLabel(engine.settings.difficulty)}`}
            />
          </dl>
          {best ? (
            <p className="mt-3 text-sm text-ink-muted">
              Personal best for this duration, mode, and difficulty: {best.netWpm} WPM ({best.accuracy}% accuracy).
            </p>
          ) : null}
          <WpmChart samples={samples} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={primaryClass} onClick={() => restart(settings)}>
              Try Again
            </button>
            <button type="button" className={buttonClass} onClick={() => restart(settings, "New passage ready.")}>
              New Test
            </button>
            <button type="button" className={buttonClass} onClick={() => void copyResults()}>
              Copy Results
            </button>
            <button type="button" className={buttonClass} onClick={downloadResults}>
              Download TXT
            </button>
          </div>
          {copied === "fail" ? (
            <p className="mt-2 text-sm text-danger">Copy was blocked. Select and copy the downloaded text instead.</p>
          ) : null}
        </section>
      ) : null}

      <section className="surface-card p-4 sm:p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Scores on this device</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Optional history stores only WPM, accuracy, duration, mode, and date — never the text you typed.
        </p>
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={saveScores}
            onChange={(event) => setSaveScores(event.target.checked)}
          />
          Save recent scores and personal bests in this browser
        </label>
        {history.recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No saved attempts yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line text-sm">
            {history.recent.map((row) => (
              <li key={row.at} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-ink">
                  {row.netWpm} WPM · {row.accuracy}% · {modeLabel(row.mode)} · {difficultyLabel(row.difficulty)} ·{" "}
                  {row.durationSec}s
                </span>
                <span className="text-ink-muted">{new Date(row.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={`${buttonClass} mt-3`}
          onClick={() => {
            clearHistory(storage());
            setHistory(readHistory(null));
            setMessage("Saved scores cleared on this device.");
          }}
        >
          Clear History
        </button>
      </section>
    </div>
  );
}

function Choice({
  name,
  checked,
  label,
  onSelect,
}: {
  name: string;
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-3 text-sm font-semibold",
        checked ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} />
      {label}
    </label>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-line bg-paper px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
