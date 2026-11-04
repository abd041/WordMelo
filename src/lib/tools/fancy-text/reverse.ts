/**
 * Best-effort reverse mapping from recognized fancy Unicode letters/digits
 * back to plain Latin ASCII. Unsupported symbols are preserved.
 */

import * as maps from "./maps";
import { isEmojiLikeCluster, splitGraphemes } from "./graphemes";
import { COMBINING } from "./maps";

function invertMap(forward: Record<string, string>): Record<string, string> {
  const reverse: Record<string, string> = {};
  for (const [plain, fancy] of Object.entries(forward)) {
    // Prefer first mapping if collisions exist (e.g. small-caps upper/lower).
    if (reverse[fancy] === undefined) {
      reverse[fancy] = plain;
    }
  }
  return reverse;
}

/**
 * Upside-down is excluded: many flip targets collide with plain ASCII
 * (e.g. p↔d), which would corrupt already-plain text.
 */
const FORWARD_MAPS = [
  maps.BOLD_SERIF,
  maps.BOLD_SANS,
  maps.ITALIC,
  maps.BOLD_ITALIC,
  maps.SANS,
  maps.SANS_ITALIC,
  maps.SANS_BOLD_ITALIC,
  maps.SCRIPT,
  maps.BOLD_SCRIPT,
  maps.FRAKTUR,
  maps.BOLD_FRAKTUR,
  maps.DOUBLE_STRUCK,
  maps.MONOSPACE,
  maps.FULLWIDTH,
  maps.SMALL_CAPS,
  maps.CIRCLED,
  maps.NEGATIVE_CIRCLED,
  maps.SQUARED,
  maps.NEGATIVE_SQUARED,
  maps.PARENTHESIZED,
  maps.SUPERSCRIPT,
  maps.SUBSCRIPT,
] as const;

function isBasicLatinAlnum(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined || Array.from(ch).length !== 1) return false;
  return (
    (cp >= 0x30 && cp <= 0x39) ||
    (cp >= 0x41 && cp <= 0x5a) ||
    (cp >= 0x61 && cp <= 0x7a)
  );
}

const REVERSE_LOOKUP: Record<string, string> = (() => {
  const merged: Record<string, string> = {};
  for (const forward of FORWARD_MAPS) {
    const inverted = invertMap(forward);
    for (const [fancy, plain] of Object.entries(inverted)) {
      // Never remap plain ASCII letters/digits — avoids corrupting normal text.
      if (isBasicLatinAlnum(fancy)) continue;
      if (merged[fancy] === undefined) {
        merged[fancy] = plain;
      }
    }
  }
  return merged;
})();

const STRIP_COMBINING = new Set<string>(Object.values(COMBINING));

/**
 * Convert supported fancy Unicode characters to plain Latin where mapped.
 * Does not claim universal reversibility. Emoji and unknown symbols stay.
 */
export function fancyTextToPlain(text: string): string {
  if (!text) return "";

  return splitGraphemes(text)
    .map((cluster) => {
      if (isEmojiLikeCluster(cluster)) return cluster;

      // Strip known decorative combining marks attached to a base character
      const points = Array.from(cluster);
      if (points.length > 1) {
        const base = points[0]!;
        const rest = points.slice(1);
        const onlyKnownMarks = rest.every((mark) => STRIP_COMBINING.has(mark));
        if (onlyKnownMarks) {
          const mappedBase = REVERSE_LOOKUP[base] ?? base;
          return mappedBase;
        }
      }

      return REVERSE_LOOKUP[cluster] ?? cluster;
    })
    .join("");
}

export function getReverseLookupSize(): number {
  return Object.keys(REVERSE_LOOKUP).length;
}
