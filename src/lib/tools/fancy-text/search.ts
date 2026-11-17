import type { FancyStyle, FancyStyleCategory, FancyStyleResult } from "./styles";

/**
 * Whole-query words that describe an intent, not a style name.
 * "cool text" should still find cool styles.
 */
const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "copy",
  "font",
  "fonts",
  "for",
  "generator",
  "of",
  "paste",
  "style",
  "styles",
  "text",
  "the",
  "to",
]);

/**
 * Explicit style ids for queries that do not appear in style names.
 * These are curated matches, not a match-everything keyword dump.
 */
export const STYLE_SEARCH_ALIASES: Record<string, readonly string[]> = {
  fancy: [
    "script",
    "bold-script",
    "fraktur",
    "bold-fraktur",
    "circled",
    "bubble",
    "vaporwave",
    "frame-sparkle",
    "frame-stars",
    "frame-hearts",
  ],
  instagram: [
    "script",
    "bold-script",
    "fullwidth",
    "vaporwave",
    "spaced",
    "small-caps",
    "frame-hearts",
    "frame-sparkle",
  ],
  tiktok: ["bold-sans", "bold-serif", "script", "circled", "bubble"],
  discord: [
    "fraktur",
    "bold-fraktur",
    "monospace",
    "double-struck",
    "frame-lenticular",
  ],
  gaming: [
    "fraktur",
    "bold-fraktur",
    "double-struck",
    "monospace",
    "squared",
    "negative-squared",
    "frame-lenticular",
  ],
  cute: [
    "script",
    "bold-script",
    "bubble",
    "circled",
    "frame-hearts",
    "frame-flowers",
    "frame-sparkle",
  ],
  aesthetic: ["fullwidth", "vaporwave", "spaced", "dotted-sep", "small-caps"],
  cool: [
    "vaporwave",
    "double-struck",
    "fraktur",
    "circled",
    "frame-stars",
    "dotted-sep",
    "bold-sans",
  ],
  bubble: ["bubble", "circled"],
  small: ["small-caps", "superscript", "subscript"],
  cursive: ["script", "bold-script"],
  gothic: ["fraktur", "bold-fraktur"],
  username: ["bold-sans", "script", "double-struck", "monospace", "circled"],
};

export type FancyCategoryFilter =
  | "all"
  | "favorites"
  | "recent"
  | FancyStyleCategory;

export function styleSearchHaystack(style: FancyStyle): string {
  return [style.name, style.description, style.category, ...style.keywords]
    .join(" ")
    .toLowerCase();
}

function tokenMatchesStyle(
  style: FancyStyle,
  token: string,
  haystack: string,
): boolean {
  if (haystack.includes(token)) return true;
  return STYLE_SEARCH_ALIASES[token]?.includes(style.id) ?? false;
}

/** True when a style should appear for this search box value. */
export function styleMatchesQuery(style: FancyStyle, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = styleSearchHaystack(style);
  if (haystack.includes(q)) return true;
  const tokens = q.split(/\s+/).filter((token) => token && !SEARCH_STOP_WORDS.has(token));
  if (tokens.length === 0) return false;
  return tokens.every((token) => tokenMatchesStyle(style, token, haystack));
}

export function filterFancyResults(
  results: readonly FancyStyleResult[],
  options: {
    query: string;
    category: FancyCategoryFilter;
    favoriteIds: readonly string[];
    recentIds: readonly string[];
  },
): FancyStyleResult[] {
  const favorites = new Set(options.favoriteIds);
  const recent = new Set(options.recentIds);
  return results.filter(({ style }) => {
    if (options.category === "favorites" && !favorites.has(style.id)) return false;
    if (options.category === "recent" && !recent.has(style.id)) return false;
    if (
      options.category !== "all" &&
      options.category !== "favorites" &&
      options.category !== "recent" &&
      style.category !== options.category
    ) {
      return false;
    }
    return styleMatchesQuery(style, options.query);
  });
}
