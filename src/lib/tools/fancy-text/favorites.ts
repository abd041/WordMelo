const FAVORITES_KEY = "wordmelo:fancy-text:favorites";
const RECENT_KEY = "wordmelo:fancy-text:recent-copied";
const MAX_RECENT = 12;

function readStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStringArray(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Quota or private mode — ignore
  }
}

export function readFavoriteStyleIds(): string[] {
  return readStringArray(FAVORITES_KEY);
}

export function writeFavoriteStyleIds(ids: string[]): void {
  writeStringArray(FAVORITES_KEY, ids);
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
  return readStringArray(RECENT_KEY);
}

export function writeRecentCopiedStyleIds(ids: string[]): void {
  writeStringArray(RECENT_KEY, ids.slice(0, MAX_RECENT));
}

/** Move a style id to the front of the recent-copied list. */
export function pushRecentCopiedStyleId(
  ids: string[],
  styleId: string,
): string[] {
  return [styleId, ...ids.filter((id) => id !== styleId)].slice(0, MAX_RECENT);
}
