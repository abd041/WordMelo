import {
  getBaseCodePoint,
  isEmojiLikeCluster,
  isWhitespaceCluster,
  splitGraphemes,
} from "./graphemes";
import { COMBINING } from "./maps";

/** Map each remappable single-codepoint cluster via a dictionary. */
export function mapWithDictionary(
  text: string,
  dictionary: Record<string, string>,
): string {
  return splitGraphemes(text)
    .map((cluster) => {
      if (isEmojiLikeCluster(cluster)) {
        return cluster;
      }
      // Allow dictionary remaps for ordinary spaces (e.g. fullwidth),
      // but never rewrite newlines/tabs via accidental lookups.
      if (cluster === "\n" || cluster === "\r" || cluster === "\t") {
        return cluster;
      }
      const mapped = dictionary[cluster];
      if (mapped !== undefined) return mapped;
      if (isWhitespaceCluster(cluster)) {
        return cluster;
      }
      // Multi-codepoint / combining clusters stay intact.
      const cp = getBaseCodePoint(cluster);
      if (cp === null) return cluster;
      const key = String.fromCodePoint(cp);
      return dictionary[key] ?? cluster;
    })
    .join("");
}

/**
 * Append a combining mark after each remappable base character.
 * Whitespace, newlines, and emoji clusters are preserved unchanged.
 */
export function applyCombiningMark(text: string, mark: string): string {
  return splitGraphemes(text)
    .map((cluster) => {
      if (!cluster) return cluster;
      if (isWhitespaceCluster(cluster) || isEmojiLikeCluster(cluster)) {
        return cluster;
      }
      const cp = getBaseCodePoint(cluster);
      if (cp === null) {
        // Already has combining marks or complex cluster — leave alone
        return cluster;
      }
      // Only decorate basic Latin letters/digits — never attach marks to
      // Arabic, Devanagari, CJK, or other scripts.
      const isLatinLetter =
        (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
      const isDigit = cp >= 0x30 && cp <= 0x39;
      if (!isLatinLetter && !isDigit) return cluster;
      return cluster + mark;
    })
    .join("");
}

/** Reverse grapheme order (for upside-down / mirror effects). */
export function reverseGraphemes(text: string): string {
  return splitGraphemes(text).reverse().join("");
}

/** Upside-down: reverse order then flip characters via dictionary. */
export function upsideDownTransform(
  text: string,
  dictionary: Record<string, string>,
): string {
  const flipped = splitGraphemes(text)
    .map((cluster) => {
      if (isEmojiLikeCluster(cluster) || isWhitespaceCluster(cluster)) {
        return cluster;
      }
      return dictionary[cluster] ?? cluster;
    })
    .reverse();
  return flipped.join("");
}

/** Insert a separator between non-whitespace graphemes. */
export function intersperse(text: string, separator: string): string {
  const parts = splitGraphemes(text);
  const out: string[] = [];
  let pendingSeparator = false;
  for (const cluster of parts) {
    if (isWhitespaceCluster(cluster)) {
      out.push(cluster);
      pendingSeparator = false;
      continue;
    }
    if (pendingSeparator) out.push(separator);
    out.push(cluster);
    pendingSeparator = true;
  }
  return out.join("");
}

/** Fullwidth-style vaporwave: map then add thin spaces between letters. */
export function vaporwaveTransform(
  text: string,
  fullwidthMap: Record<string, string>,
): string {
  const widened = mapWithDictionary(text, fullwidthMap);
  return intersperse(widened, "\u2009");
}

/** Wrap non-empty trimmed lines with decorative frame markers. */
export function frameTransform(
  text: string,
  left: string,
  right: string,
): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => {
      if (line.trim().length === 0) return line;
      return `${left}${line}${right}`;
    })
    .join("\n");
}

export function combiningUnderline(text: string): string {
  return applyCombiningMark(text, COMBINING.underline);
}

export function combiningDoubleUnderline(text: string): string {
  return applyCombiningMark(text, COMBINING.doubleUnderline);
}

export function combiningStrikethrough(text: string): string {
  return applyCombiningMark(text, COMBINING.strikethrough);
}

export function combiningOverline(text: string): string {
  return applyCombiningMark(text, COMBINING.overline);
}

export function combiningSlash(text: string): string {
  return applyCombiningMark(text, COMBINING.slash);
}

export function combiningDotBelow(text: string): string {
  return applyCombiningMark(text, COMBINING.dotBelow);
}
