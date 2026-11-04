const FAVORITES_KEY = "wordmelo.random-word.favorites.v1";
const HISTORY_KEY = "wordmelo.random-word.history.v1";
const MAX_HISTORY = 20;
const MAX_FAVORITES = 100;

function canUseStorage(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const k = "__wm_rw_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadFavorites(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((w): w is string => typeof w === "string" && /^[a-z]+$/i.test(w))
      .map((w) => w.toLowerCase())
      .slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

export function saveFavorites(words: string[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(words.slice(0, MAX_FAVORITES)),
    );
  } catch {
    /* quota / private mode */
  }
}

export function toggleFavorite(word: string, current: string[]): string[] {
  const w = word.toLowerCase();
  const next = current.includes(w)
    ? current.filter((x) => x !== w)
    : [w, ...current.filter((x) => x !== w)].slice(0, MAX_FAVORITES);
  saveFavorites(next);
  return next;
}

export interface HistoryRound {
  at: number;
  words: string[];
}

export function loadHistory(): HistoryRound[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (r): r is HistoryRound =>
          !!r &&
          typeof r === "object" &&
          typeof (r as HistoryRound).at === "number" &&
          Array.isArray((r as HistoryRound).words),
      )
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function pushHistory(words: string[], current: HistoryRound[]): HistoryRound[] {
  if (words.length === 0) return current;
  const next = [{ at: Date.now(), words: words.slice() }, ...current].slice(
    0,
    MAX_HISTORY,
  );
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function clearHistory(): HistoryRound[] {
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }
  return [];
}
