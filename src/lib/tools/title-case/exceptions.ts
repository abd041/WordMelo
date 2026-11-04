import type { TitleException } from "./types";

export const DEFAULT_BRAND_EXCEPTIONS: TitleException[] = [
  { match: "iphone", spelling: "iPhone" },
  { match: "ebay", spelling: "eBay" },
  { match: "github", spelling: "GitHub" },
  { match: "wordmelo", spelling: "WordMelo" },
  { match: "next.js", spelling: "Next.js" },
];

export const EXCEPTIONS_STORAGE_KEY = "wordmelo-title-case-exceptions-v1";

export function normalizeException(
  match: string,
  spelling: string,
): TitleException | null {
  const m = match.trim();
  const s = spelling.trim();
  if (!m || !s) return null;
  if (/\s/u.test(m)) return null; // whole-token only
  if (m.length > 64 || s.length > 64) return null;
  return { match: m, spelling: s };
}

export function upsertException(
  list: TitleException[],
  next: TitleException,
): TitleException[] {
  const key = next.match.toLocaleLowerCase("en-US");
  const without = list.filter(
    (item) => item.match.toLocaleLowerCase("en-US") !== key,
  );
  return [...without, next];
}

export function removeException(
  list: TitleException[],
  match: string,
): TitleException[] {
  const key = match.toLocaleLowerCase("en-US");
  return list.filter((item) => item.match.toLocaleLowerCase("en-US") !== key);
}

export function loadExceptionsFromStorage(): TitleException[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EXCEPTIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const cleaned: TitleException[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as TitleException).match === "string" &&
        typeof (item as TitleException).spelling === "string"
      ) {
        const normalized = normalizeException(
          (item as TitleException).match,
          (item as TitleException).spelling,
        );
        if (normalized) cleaned.push(normalized);
      }
    }
    return cleaned;
  } catch {
    return null;
  }
}

export function saveExceptionsToStorage(list: TitleException[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(EXCEPTIONS_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function clearExceptionsStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(EXCEPTIONS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
