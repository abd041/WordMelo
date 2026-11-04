const FAVORITES_KEY = "wordmelo:cursive-generator:favorites";
const RECENT_KEY = "wordmelo:cursive-generator:recent-copied";
const MAX_RECENT = 12;

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, values: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Storage may be disabled — fail silently.
  }
}

export function readFavoriteStyleIds(): string[] {
  return readJsonArray(FAVORITES_KEY);
}

export function writeFavoriteStyleIds(ids: string[]): void {
  writeJsonArray(FAVORITES_KEY, ids);
}

export function toggleFavoriteStyleId(
  ids: string[],
  styleId: string,
): string[] {
  return ids.includes(styleId)
    ? ids.filter((id) => id !== styleId)
    : [...ids, styleId];
}

export function readRecentCopiedStyleIds(): string[] {
  return readJsonArray(RECENT_KEY);
}

export function writeRecentCopiedStyleIds(ids: string[]): void {
  writeJsonArray(RECENT_KEY, ids.slice(0, MAX_RECENT));
}

export function pushRecentCopiedStyleId(
  ids: string[],
  styleId: string,
): string[] {
  const next = [styleId, ...ids.filter((id) => id !== styleId)].slice(
    0,
    MAX_RECENT,
  );
  return next;
}
