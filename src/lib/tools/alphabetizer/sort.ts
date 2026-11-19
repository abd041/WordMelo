import { graphemeLength, MAX_INPUT_CHARS, prepareInput, splitItems } from "./parse";
import type { RandomInt, SortMode, SortResult, SortSettings } from "./types";

const ARTICLE = /^(an|the|a)\s+/iu;
const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const TRAILING_PUNCT = /[\p{P}\p{S}]+$/u;

interface WorkItem {
  original: string;
  display: string;
  index: number;
}

export const MODE_LABELS: Record<SortMode, string> = {
  az: "Alphabetical A–Z",
  za: "Alphabetical Z–A",
  "numeric-asc": "Numbers, smallest to largest",
  "numeric-desc": "Numbers, largest to smallest",
  "natural-az": "Natural A–Z",
  "natural-za": "Natural Z–A",
  "length-asc": "Shortest to longest",
  "length-desc": "Longest to shortest",
  "last-name": "Last name A–Z",
  reverse: "Reverse current order",
  shuffle: "Shuffle",
};

export function defaultRandomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function sortList(
  input: string,
  settings: SortSettings,
  randomInt: RandomInt = defaultRandomInt,
): SortResult {
  const prepared = prepareInput(input, settings.format);
  const totalInputItems = splitItems(input, settings.format).length;
  const rawItems = splitItems(prepared.text, settings.format);
  const emptyRemoved = settings.removeEmpty
    ? rawItems.filter((item) => item.trim() === "").length
    : 0;
  const kept = settings.removeEmpty ? rawItems.filter((item) => item.trim() !== "") : rawItems;
  const unique = settings.removeDuplicates ? uniqueFirst(kept, settings.ignoreCase) : kept;
  const duplicatesRemoved = kept.length - unique.length;

  const work: WorkItem[] = unique.map((original, index) => ({
    original,
    display: settings.trimOutput ? original.trim() : original,
    index,
  }));

  const ordered = orderItems(work, settings, randomInt);
  const numbered = settings.numberOutput
    ? ordered.map((item, index) => `${index + 1}. ${item.display}`)
    : ordered.map((item) => item.display);

  const warnings: string[] = [];
  if (prepared.truncated) {
    const incomplete = prepared.droppedIncompleteItem
      ? " The last incomplete item was omitted so it was not sorted as a full line."
      : "";
    warnings.push(
      `This sort is partial. Only the first ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters were used. ${prepared.omitted.toLocaleString("en-US")} characters were excluded.${incomplete} Your list has ${totalInputItems.toLocaleString("en-US")} items; ${rawItems.length.toLocaleString("en-US")} complete items were processed.`,
    );
  }
  if (settings.mode.startsWith("numeric") && work.some((item) => parseNumber(item.display) === null)) {
    warnings.push(
      "Lines that are not signed numbers stay after the numeric values and are ordered alphabetically. They are not treated as zero.",
    );
  }
  if (settings.mode === "last-name") {
    warnings.push(
      "Last-name order uses the last whitespace-separated word. Suffixes and multi-part family names may need a manual check.",
    );
  }
  if (settings.format !== "lines") {
    warnings.push(
      "Comma and semicolon splitting is simple delimiter text, not quoted CSV. Names that contain the delimiter will split.",
    );
  }

  return {
    items: numbered,
    text: numbered.join("\n"),
    stats: {
      inputItems: rawItems.length,
      outputItems: numbered.length,
      duplicatesRemoved,
      emptyRemoved,
      mode: settings.mode,
      totalCharacters: prepared.totalCharacters,
      processedCharacters: prepared.processedCharacters,
      totalInputItems,
      droppedIncompleteItem: prepared.droppedIncompleteItem,
    },
    warning: warnings.length > 0 ? warnings.join(" ") : null,
    truncated: prepared.truncated,
  };
}

function uniqueFirst(items: string[], ignoreCase: boolean): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of items) {
    const key = ignoreCase ? item.trim().toLocaleLowerCase("en-US") : item.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function orderItems(items: WorkItem[], settings: SortSettings, randomInt: RandomInt): WorkItem[] {
  if (settings.mode === "reverse") return [...items].reverse();
  if (settings.mode === "shuffle") return shuffle(items, randomInt);

  const collator = new Intl.Collator("en", {
    usage: "sort",
    sensitivity: settings.ignoreCase ? "accent" : "variant",
    ignorePunctuation: settings.ignorePunctuation,
    numeric: false,
  });
  return [...items].sort((left, right) => {
    const compared = compareItems(left, right, settings, collator);
    if (compared !== 0) return compared;
    return left.index - right.index;
  });
}

function compareItems(
  left: WorkItem,
  right: WorkItem,
  settings: SortSettings,
  collator: Intl.Collator,
): number {
  if (settings.mode === "numeric-asc" || settings.mode === "numeric-desc") {
    return compareNumeric(
      left.display,
      right.display,
      collator,
      settings.mode === "numeric-desc" ? -1 : 1,
    );
  }
  if (settings.mode === "natural-az" || settings.mode === "natural-za") {
    const natural = compareNatural(
      sortKey(left.display, settings),
      sortKey(right.display, settings),
      collator,
    );
    return settings.mode === "natural-za" ? -natural : natural;
  }
  if (settings.mode === "length-asc" || settings.mode === "length-desc") {
    const gap = graphemeLength(left.display) - graphemeLength(right.display);
    if (gap !== 0) return settings.mode === "length-desc" ? -gap : gap;
    return collator.compare(sortKey(left.display, settings), sortKey(right.display, settings));
  }
  if (settings.mode === "last-name") {
    const last = collator.compare(
      sortKey(lastName(left.display), settings),
      sortKey(lastName(right.display), settings),
    );
    if (last !== 0) return last;
    return collator.compare(sortKey(left.display, settings), sortKey(right.display, settings));
  }
  const alphabetical = collator.compare(
    sortKey(left.display, settings),
    sortKey(right.display, settings),
  );
  return settings.mode === "za" ? -alphabetical : alphabetical;
}

export function sortKey(value: string, settings: Pick<SortSettings, "ignoreArticles">): string {
  let key = value.trim();
  if (settings.ignoreArticles) key = key.replace(ARTICLE, "");
  return key;
}

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!NUMERIC.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function lastName(value: string): string {
  const tokens = value.trim().split(/\s+/u).filter(Boolean);
  if (tokens.length === 0) return "";
  const last = tokens[tokens.length - 1] ?? "";
  return last.replace(TRAILING_PUNCT, "");
}

function compareNumeric(
  left: string,
  right: string,
  collator: Intl.Collator,
  direction: 1 | -1,
): number {
  const leftNumber = parseNumber(left);
  const rightNumber = parseNumber(right);
  if (leftNumber === null && rightNumber === null) return collator.compare(left.trim(), right.trim());
  if (leftNumber === null) return 1;
  if (rightNumber === null) return -1;
  if (leftNumber < rightNumber) return -1 * direction;
  if (leftNumber > rightNumber) return 1 * direction;
  return 0;
}

function compareNatural(left: string, right: string, collator: Intl.Collator): number {
  const leftParts = naturalParts(left);
  const rightParts = naturalParts(right);
  const limit = Math.min(leftParts.length, rightParts.length);
  for (let index = 0; index < limit; index += 1) {
    const a = leftParts[index]!;
    const b = rightParts[index]!;
    if (a.type !== b.type) return a.type === "num" ? -1 : 1;
    if (a.type === "num" && b.type === "num") {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      continue;
    }
    if (a.type === "text" && b.type === "text") {
      const compared = collator.compare(a.value, b.value);
      if (compared !== 0) return compared;
    }
  }
  return leftParts.length - rightParts.length;
}

function naturalParts(value: string): Array<{ type: "num"; value: number } | { type: "text"; value: string }> {
  const parts: Array<{ type: "num"; value: number } | { type: "text"; value: string }> = [];
  const tokens = value.split(/(\d+)/u);
  for (const token of tokens) {
    if (!token) continue;
    if (/^\d+$/u.test(token)) parts.push({ type: "num", value: Number(token) });
    else parts.push({ type: "text", value: token });
  }
  return parts;
}

function shuffle(items: WorkItem[], randomInt: RandomInt): WorkItem[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    const current = next[index]!;
    next[index] = next[swap]!;
    next[swap] = current;
  }
  return next;
}
