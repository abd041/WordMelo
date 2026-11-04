import type { ConvertOptions, TitleException, TitleStyleId } from "./types";
import {
  APA_SHORT_CONJUNCTIONS,
  APA_SHORT_PREPOSITIONS,
  ARTICLES,
  COORDINATING_CONJUNCTIONS,
  GENERAL_SMALL_WORDS,
  HYPHEN_PREFIXES,
  KNOWN_ACRONYMS,
  MLA_SUBORDINATING_CONJUNCTIONS,
  PREPOSITIONS,
} from "./words";

const LOCALE = "en-US";

const SUBTITLE_BREAK = /[:：]|—|(?:\s–\s)|(?:\s-\s)/u;

export const SAMPLE_TITLE =
  "the art of writing a great title: a guide to clear headlines";

/** Curated samples that expose real style-guide differences. */
export const SAMPLE_TITLES: Array<{ id: string; label: string; text: string }> =
  [
    {
      id: "subtitle",
      label: "Colon + subtitle",
      text: SAMPLE_TITLE,
    },
    {
      id: "prepositions",
      label: "Short vs long prepositions",
      text: "a room with a view about design",
    },
    {
      id: "hyphen",
      label: "Hyphen + brand",
      text: "self-report measures for the iphone and html api",
    },
    {
      id: "infinitive",
      label: "Infinitive to",
      text: "how to write headlines for the web",
    },
  ];

export const TXT_FILENAME = "WordMelo-title-case-converter.txt";

/** Soft batch-size guidance — conversion still runs beyond this. */
export const BATCH_SOFT_LIMIT = 500;

function toUpper(char: string): string {
  return char.toLocaleUpperCase(LOCALE);
}

function toLower(char: string): string {
  return char.toLocaleLowerCase(LOCALE);
}

function isLetter(char: string): boolean {
  return /\p{L}/u.test(char);
}

/** Lowercase letter cores only; strips edge punctuation for classification. */
export function coreWord(token: string): string {
  return toLowerCaseText(token.replace(/^[^\p{L}0-9]+|[^\p{L}0-9]+$/gu, ""));
}

export function toLowerCaseText(text: string): string {
  return Array.from(text, (ch) => (isLetter(ch) ? toLower(ch) : ch)).join("");
}

export function capitalizeToken(token: string): string {
  if (!token) return token;
  const chars = Array.from(token);
  let done = false;
  return chars
    .map((ch) => {
      if (!done && isLetter(ch)) {
        done = true;
        return toUpper(ch);
      }
      if (isLetter(ch)) return toLower(ch);
      return ch;
    })
    .join("");
}

function isAllCapsToken(token: string): boolean {
  const letters = Array.from(token).filter(isLetter);
  if (letters.length < 2) return false;
  return letters.every((ch) => ch === toUpper(ch) && ch !== toLower(ch));
}

function looksLikeAcronym(core: string, originalToken: string): boolean {
  if (!core) return false;
  if (KNOWN_ACRONYMS.has(core)) return true;
  return isAllCapsToken(originalToken) && core.length >= 2 && !core.includes("'");
}

function findException(
  core: string,
  exceptions: TitleException[] | undefined,
): TitleException | undefined {
  if (!exceptions?.length || !core) return undefined;
  return exceptions.find((ex) => toLowerCaseText(ex.match.trim()) === core);
}

function applyExceptionSpelling(token: string, spelling: string): string {
  const match = token.match(/^([^\p{L}0-9]*)([\p{L}0-9'’.-]+)([^\p{L}0-9]*)$/u);
  if (!match) return spelling;
  return `${match[1]}${spelling}${match[3]}`;
}

interface WordDecisionContext {
  style: TitleStyleId;
  core: string;
  isFirst: boolean;
  isLast: boolean;
  isSegmentStart: boolean;
  hyphenIndex: number;
  hyphenCount: number;
  nextCore: string | null;
}

function isApaMinor(core: string): boolean {
  return (
    ARTICLES.has(core) ||
    APA_SHORT_CONJUNCTIONS.has(core) ||
    APA_SHORT_PREPOSITIONS.has(core)
  );
}

function shouldCapitalizeWord(ctx: WordDecisionContext): boolean {
  const { style, core, isFirst, isLast, isSegmentStart, hyphenIndex, hyphenCount } =
    ctx;

  if (!core) return false;

  if (style === "sentence") {
    return isFirst || isSegmentStart;
  }

  if (isFirst || isSegmentStart) return true;

  // Hyphenated follow-on segments
  if (hyphenCount > 1 && hyphenIndex > 0) {
    if (style === "apa7") return true; // Self-Report
    if (style === "mla9") return true;
    if (style === "ap-composition") return true;
    if (style === "chicago18") return true;
    if (style === "general") return true;
  }

  switch (style) {
    case "general": {
      if (isLast) return true;
      return !GENERAL_SMALL_WORDS.has(core);
    }
    case "apa7": {
      if (core.length >= 4) return true;
      return !isApaMinor(core);
    }
    case "mla9": {
      if (isLast) return true;
      if (MLA_SUBORDINATING_CONJUNCTIONS.has(core)) return true;
      if (ARTICLES.has(core)) return false;
      if (COORDINATING_CONJUNCTIONS.has(core)) return false;
      if (core === "to") return false;
      if (PREPOSITIONS.has(core)) return false;
      return true;
    }
    case "chicago18": {
      if (isLast) return true;
      if (ARTICLES.has(core)) return false;
      if (COORDINATING_CONJUNCTIONS.has(core)) return false;
      if (core === "to") return false;
      if (PREPOSITIONS.has(core)) {
        return core.length >= 5; // Chicago 18: five or more letters
      }
      return true;
    }
    case "ap-composition": {
      if (isLast) return true;
      if (ARTICLES.has(core)) return false;
      if (core === "to") return true; // capitalize infinitive “to”
      if (PREPOSITIONS.has(core) || COORDINATING_CONJUNCTIONS.has(core)) {
        return core.length >= 4;
      }
      return true;
    }
    default:
      return true;
  }
}

/**
 * Detect whether this whitespace-separated token starts a new title segment
 * (after colon / em dash / spaced en dash title break).
 */
function isNewSegmentStart(
  fullText: string,
  tokenOffset: number,
): boolean {
  if (tokenOffset <= 0) return true;
  const before = fullText.slice(0, tokenOffset);
  // Em dash or colon immediately before (allowing spaces)
  if (/[:：—]\s*$/u.test(before)) return true;
  // Spaced en dash or spaced hyphen used as a break
  if (/\s[–-]\s+$/u.test(before)) return true;
  // End punctuation starting a new heading segment (APA)
  if (/[.!?…]\s+$/u.test(before)) return true;
  return false;
}

function transformHyphenated(
  word: string,
  style: TitleStyleId,
  base: {
    isFirst: boolean;
    isLast: boolean;
    isSegmentStart: boolean;
    nextCore: string | null;
  },
  options: ConvertOptions,
): string {
  const parts = word.split("-");
  return parts
    .map((part, index) => {
      const core = coreWord(part);
      const exception = findException(core, options.exceptions);
      if (exception) {
        return applyExceptionSpelling(part, exception.spelling);
      }

      if (options.preserveAcronyms && looksLikeAcronym(core, part)) {
        if (KNOWN_ACRONYMS.has(core)) {
          return applyExceptionSpelling(part, core.toLocaleUpperCase(LOCALE));
        }
        if (isAllCapsToken(part)) return part;
      }

      // Chicago prefix compounds: capitalize following segment
      if (
        style === "chicago18" &&
        index > 0 &&
        HYPHEN_PREFIXES.has(coreWord(parts[0] ?? ""))
      ) {
        return capitalizeToken(part);
      }

      const capitalize = shouldCapitalizeWord({
        style,
        core,
        hyphenIndex: index,
        hyphenCount: parts.length,
        isFirst: base.isFirst && index === 0,
        isLast: base.isLast && index === parts.length - 1,
        isSegmentStart: base.isSegmentStart && index === 0,
        nextCore: base.nextCore,
      });

      return capitalize ? capitalizeToken(part) : toLowerCaseText(part);
    })
    .join("-");
}

function convertLine(
  line: string,
  style: TitleStyleId,
  options: ConvertOptions,
): string {
  if (!line) return line;

  if (style === "sentence") {
    return toSentenceCaseLine(line, options);
  }

  const matches = Array.from(line.matchAll(/[^\s]+/gu));
  if (matches.length === 0) return line;

  return line.replace(/[^\s]+/gu, (word, offset) => {
    const index = matches.findIndex((item) => item.index === offset);
    const isFirst = index === 0;
    const isLast = index === matches.length - 1;
    const isSegmentStart = isNewSegmentStart(line, offset);
    const nextCore =
      index < matches.length - 1
        ? coreWord(matches[index + 1]?.[0] ?? "")
        : null;

    return transformHyphenated(
      word,
      style,
      {
        isFirst,
        isLast,
        isSegmentStart: isFirst || isSegmentStart,
        nextCore,
      },
      options,
    );
  });
}

function toSentenceCaseLine(line: string, options: ConvertOptions): string {
  const lowered = toLowerCaseText(line);
  const chars = Array.from(lowered);
  let capitalizeNext = true;
  const out: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    if (capitalizeNext && isLetter(ch)) {
      out.push(toUpper(ch));
      capitalizeNext = false;
      continue;
    }
    out.push(ch);
    if (/[.!?…]/u.test(ch)) {
      capitalizeNext = true;
    }
  }

  let result = out.join("");

  // Re-apply exceptions / acronyms on tokens
  result = result.replace(/[^\s]+/gu, (word) => {
    const core = coreWord(word);
    const exception = findException(core, options.exceptions);
    if (exception) return applyExceptionSpelling(word, exception.spelling);
    if (options.preserveAcronyms && KNOWN_ACRONYMS.has(core)) {
      return applyExceptionSpelling(word, core.toLocaleUpperCase(LOCALE));
    }
    return word;
  });

  return result;
}

/**
 * Convert a single title (may contain internal newlines as part of one title).
 * Always starts from the original input — never re-title-cases a prior result.
 */
export function convertTitle(
  text: string,
  style: TitleStyleId,
  options: ConvertOptions = {},
): string {
  if (!text) return "";
  const opts: ConvertOptions = {
    preserveAcronyms: options.preserveAcronyms ?? true,
    exceptions: options.exceptions ?? [],
  };

  // Preserve exact line structure for single-title mode (newlines kept).
  return text
    .split(/(\r\n|\n|\r)/)
    .map((part) => {
      if (part === "\r\n" || part === "\n" || part === "\r") return part;
      return convertLine(part, style, opts);
    })
    .join("");
}

/**
 * Batch: one title per line. Blank lines preserved. CRLF normalized to \n in output.
 */
export function convertBatch(
  text: string,
  style: TitleStyleId,
  options: ConvertOptions = {},
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  return lines.map((line) => convertTitle(line, style, options));
}

export function convertAllStyles(
  text: string,
  styleIds: TitleStyleId[],
  options: ConvertOptions = {},
): Record<TitleStyleId, string> {
  const result = {} as Record<TitleStyleId, string>;
  for (const id of styleIds) {
    result[id] = convertTitle(text, id, options);
  }
  return result;
}

/** Exported for tests — Chicago 18 preposition length gate. */
export function chicagoPrepositionCapitalized(word: string): boolean {
  const core = coreWord(word);
  return PREPOSITIONS.has(core) && core.length >= 5;
}

export function isSubtitleSeparatorPresent(text: string): boolean {
  return SUBTITLE_BREAK.test(text);
}
