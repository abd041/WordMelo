import { extendPassage, generatePassage } from "./generate";
import type { KeyEvent, RandomInt, RejectReason, TestSettings, TestStatus } from "./types";
import { commonPrefixLength, units } from "./units";

export interface EngineState {
  status: TestStatus;
  settings: TestSettings;
  passage: string;
  typed: string;
  events: KeyEvent[];
}

export interface ApplyResult {
  state: EngineState;
  rejected: RejectReason | null;
  started: boolean;
}

export function createEngineState(
  settings: TestSettings,
  randomInt: RandomInt,
): EngineState {
  return {
    status: "ready",
    settings,
    passage: generatePassage(settings, undefined, randomInt),
    typed: "",
    events: [],
  };
}

export function resetEngineState(
  settings: TestSettings,
  randomInt: RandomInt,
): EngineState {
  return createEngineState(settings, randomInt);
}

export function applyTypedChange(
  state: EngineState,
  nextValue: string,
  elapsedMs: number,
  options: { paste?: boolean; composing?: boolean } = {},
): ApplyResult {
  if (state.status === "completed") {
    return { state, rejected: "completed", started: false };
  }
  if (state.status === "paused") {
    return { state, rejected: "paused", started: false };
  }
  if (options.composing) {
    return { state, rejected: "composing", started: false };
  }
  if (options.paste) {
    return { state, rejected: "paste", started: false };
  }

  const previous = units(state.typed);
  const next = units(nextValue);
  const prefix = commonPrefixLength(previous, next);
  const deleted = previous.slice(prefix);
  const inserted = next.slice(prefix);

  if (deleted.length > 0 && inserted.length > 0) {
    return { state, rejected: "paste", started: false };
  }
  if (inserted.length > 1) {
    return { state, rejected: "paste", started: false };
  }

  let passage = state.passage;
  const typedUnits = previous.slice();
  const events = state.events.slice();
  const atMs = Math.max(0, elapsedMs);

  for (const removed of deleted.slice().reverse()) {
    typedUnits.pop();
    const expected = units(passage)[typedUnits.length] ?? "";
    events.push({
      kind: "backspace",
      atMs,
      removed,
      wasMatch: removed === expected,
    });
  }

  for (const received of inserted) {
    passage = extendPassage(passage, typedUnits.length, state.settings);
    const expected = units(passage)[typedUnits.length] ?? "";
    if (!expected) break;
    typedUnits.push(received);
    events.push({
      kind: "insert",
      atMs,
      expected,
      received,
      match: received === expected,
    });
  }

  const typed = typedUnits.join("");
  const started = state.status === "ready" && events.length > state.events.length && inserted.length > 0;
  const status: TestStatus = started ? "running" : state.status;

  return {
    state: {
      ...state,
      status,
      passage,
      typed,
      events,
    },
    rejected: null,
    started,
  };
}

export function completeEngine(state: EngineState): EngineState {
  if (state.status === "completed") return state;
  return { ...state, status: "completed" };
}

export function pauseEngine(state: EngineState): EngineState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused" };
}

export function resumeEngine(state: EngineState): EngineState {
  if (state.status !== "paused") return state;
  return { ...state, status: "running" };
}

export function replayEvents(events: readonly KeyEvent[]): string {
  const buffer: string[] = [];
  for (const event of events) {
    if (event.kind === "insert") buffer.push(event.received);
    else buffer.pop();
  }
  return buffer.join("");
}
