import type { CaseModeId } from "./modes";

/** US English casing locale for documented WordMelo case conversion. */
export const CASE_LOCALE = "en-US";

const TITLE_SMALL_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "by",
  "of",
  "in",
  "with",
  "as",
  "via",
  "per",
]);

function toUpper(char: string): string {
  return char.toLocaleUpperCase(CASE_LOCALE);
}

function toLower(char: string): string {
  return char.toLocaleLowerCase(CASE_LOCALE);
}

function isLetter(char: string): boolean {
  return /\p{L}/u.test(char);
}

function isUpperCaseLetter(char: string): boolean {
  return isLetter(char) && char === toUpper(char) && char !== toLower(char);
}

function isLowerCaseLetter(char: string): boolean {
  return isLetter(char) && char === toLower(char) && char !== toUpper(char);
}

/** Map over Unicode code points (preserves surrogate pairs). */
function mapCodePoints(
  text: string,
  mapper: (char: string, lettersSeen: number) => string,
): string {
  const chars = Array.from(text);
  let lettersSeen = 0;
  return chars
    .map((char) => {
      const next = mapper(char, lettersSeen);
      if (isLetter(char)) lettersSeen += 1;
      return next;
    })
    .join("");
}

export function toUpperCaseText(text: string): string {
  if (!text) return "";
  return text.toLocaleUpperCase(CASE_LOCALE);
}

export function toLowerCaseText(text: string): string {
  if (!text) return "";
  return text.toLocaleLowerCase(CASE_LOCALE);
}

/**
 * Common English abbreviations that end with a period but usually should not
 * start a new sentence. Heuristic — not exhaustive.
 */
const SENTENCE_ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "st",
  "vs",
  "etc",
  "eg",
  "ie",
  "approx",
  "dept",
  "est",
  "fig",
  "vol",
  "no",
]);

/**
 * Sentence case: lowercase the text, then capitalize the first letter of each
 * sentence. Sentence starts after `!`, `?`, newline, or `.` that is not a
 * recognized abbreviation. Opening quotes/brackets after a boundary are skipped
 * until the next letter. Not perfect linguistic segmentation.
 */
export function toSentenceCase(text: string): string {
  if (!text) return "";
  const lower = toLowerCaseText(text);
  const chars = Array.from(lower);
  let capitalizeNext = true;
  let wordBuffer = "";
  const out: string[] = [];

  for (const char of chars) {
    if (capitalizeNext && isLetter(char)) {
      out.push(toUpper(char));
      capitalizeNext = false;
      wordBuffer = char;
      continue;
    }

    out.push(char);

    if (isLetter(char)) {
      wordBuffer += char;
      continue;
    }

    if (char === "!" || char === "?" || char === "\n") {
      capitalizeNext = true;
      wordBuffer = "";
      continue;
    }

    if (/\s/u.test(char)) {
      wordBuffer = "";
      continue;
    }

    if (char === ".") {
      const isAbbrev = SENTENCE_ABBREVIATIONS.has(wordBuffer);
      capitalizeNext = !isAbbrev;
      wordBuffer = "";
      continue;
    }

    // Opening quotes/brackets after a boundary should not cancel capitalization.
    if (!/[“”"'"‘’(\[{«‹]/u.test(char)) {
      wordBuffer = "";
    }
  }

  return out.join("");
}

function capitalizeWordToken(token: string): string {
  const chars = Array.from(token);
  let done = false;
  return chars
    .map((char) => {
      if (!done && isLetter(char)) {
        done = true;
        return toUpper(char);
      }
      if (isLetter(char)) return toLower(char);
      return char;
    })
    .join("");
}

function coreLettersLower(token: string): string {
  return toLowerCaseText(token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""));
}

/**
 * Title Case (WordMelo general policy — not AP/APA/Chicago):
 * - Capitalize first and last words
 * - Lowercase a fixed list of small words unless first/last
 * - Capitalize each segment of hyphenated compounds
 * - Preserve multiple spaces and non-letter punctuation around words
 */
export function toTitleCase(text: string): string {
  if (!text) return "";

  const matches = Array.from(text.matchAll(/[^\s]+/gu));
  if (matches.length === 0) return text;

  return text.replace(/[^\s]+/gu, (word, offset) => {
    const index = matches.findIndex((item) => item.index === offset);
    const isFirst = index === 0;
    const isLast = index === matches.length - 1;
    const parts = word.split("-");

    return parts
      .map((part, partIndex) => {
        const core = coreLettersLower(part);
        const isHyphenated = parts.length > 1;
        const keepSmall =
          !isFirst &&
          !isLast &&
          !isHyphenated &&
          partIndex === 0 &&
          TITLE_SMALL_WORDS.has(core);

        if (keepSmall) return toLowerCaseText(part);
        return capitalizeWordToken(part);
      })
      .join("-");
  });
}

/** Capitalize the first letter of each whitespace-separated word. */
export function toCapitalizeEachWord(text: string): string {
  if (!text) return "";
  return text.replace(/[^\s]+/gu, (word) => capitalizeWordToken(word));
}

/**
 * Alternating case: letters alternate lower/upper starting with lowercase.
 * Non-letters do not advance the alternation index.
 */
export function toAlternatingCase(text: string): string {
  if (!text) return "";
  return mapCodePoints(text, (char, lettersSeen) => {
    if (!isLetter(char)) return char;
    return lettersSeen % 2 === 0 ? toLower(char) : toUpper(char);
  });
}

/** Swap case for cased letters; leave caseless scripts unchanged. */
export function toInverseCase(text: string): string {
  if (!text) return "";
  return mapCodePoints(text, (char) => {
    if (isLowerCaseLetter(char)) return toUpper(char);
    if (isUpperCaseLetter(char)) return toLower(char);
    return char;
  });
}

/**
 * Tokenize for programming-style identifiers.
 * Splits on whitespace, underscores, hyphens, path separators, and camelCase boundaries.
 * Other punctuation is treated as a separator and removed from tokens.
 */
export function tokenizeForIdentifier(text: string): string[] {
  if (!text.trim()) return [];

  const normalized = text
    .replace(/([a-z0-9])([A-Z])/gu, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .replace(/[_\-./\\]+/gu, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ");

  return normalized
    .split(/\s+/u)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => toLowerCaseText(token));
}

function capitalizeAsciiWord(word: string): string {
  if (!word) return word;
  const chars = Array.from(word);
  const first = chars[0]!;
  return toUpper(first) + chars.slice(1).map(toLower).join("");
}

export function toCamelCase(text: string): string {
  const tokens = tokenizeForIdentifier(text);
  if (tokens.length === 0) return "";
  return tokens[0]! + tokens.slice(1).map(capitalizeAsciiWord).join("");
}

export function toPascalCase(text: string): string {
  const tokens = tokenizeForIdentifier(text);
  return tokens.map(capitalizeAsciiWord).join("");
}

export function toSnakeCase(text: string): string {
  return tokenizeForIdentifier(text).join("_");
}

export function toKebabCase(text: string): string {
  return tokenizeForIdentifier(text).join("-");
}

export function convertCase(text: string, mode: CaseModeId): string {
  switch (mode) {
    case "uppercase":
      return toUpperCaseText(text);
    case "lowercase":
      return toLowerCaseText(text);
    case "sentence":
      return toSentenceCase(text);
    case "title":
      return toTitleCase(text);
    case "capitalize-words":
      return toCapitalizeEachWord(text);
    case "alternating":
      return toAlternatingCase(text);
    case "inverse":
      return toInverseCase(text);
    case "camel":
      return toCamelCase(text);
    case "pascal":
      return toPascalCase(text);
    case "snake":
      return toSnakeCase(text);
    case "kebab":
      return toKebabCase(text);
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
