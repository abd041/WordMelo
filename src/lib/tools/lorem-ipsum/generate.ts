import { CLASSIC_LOREM_PASSAGE, CLASSIC_LOREM_WORDS } from "./classic";
import { createCryptoRandomInt, type RandomIntFn } from "./rng";
import {
  PARAGRAPH_WORD_RANGES,
  QUANTITY_LIMITS,
  type GenerateOptions,
  type GeneratedDocument,
  type GenerationMode,
  type ParagraphLength,
} from "./types";
import {
  LOREM_VOCABULARY,
  UI_FORM_PHRASES,
  UI_LABELS,
} from "./vocabulary";

function clampQuantity(mode: GenerationMode, quantity: number): number {
  const limits = QUANTITY_LIMITS[mode];
  if (!Number.isFinite(quantity)) return limits.default;
  return Math.min(limits.max, Math.max(limits.min, Math.floor(quantity)));
}

function baseDoc(
  partial: Omit<
    GeneratedDocument,
    "exactUtf16" | "preferCompleteWords" | "actualUtf16Length"
  > &
    Partial<
      Pick<
        GeneratedDocument,
        "exactUtf16" | "preferCompleteWords" | "actualUtf16Length"
      >
    >,
): GeneratedDocument {
  return {
    ...partial,
    exactUtf16: partial.exactUtf16 ?? true,
    preferCompleteWords: partial.preferCompleteWords ?? false,
    actualUtf16Length: partial.actualUtf16Length ?? null,
  };
}

/** Avoid consecutive duplicates and recent repeats (bounded retries). */
function pickWord(
  rng: RandomIntFn,
  recent: string[],
  pool: readonly string[] = LOREM_VOCABULARY,
): string {
  const avoid = new Set(recent.slice(-3));
  let word = pool[rng(pool.length)]!;
  let guard = 0;
  while (avoid.has(word) && pool.length > avoid.size && guard < 12) {
    word = pool[rng(pool.length)]!;
    guard += 1;
  }
  return word;
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function sentenceEnd(rng: RandomIntFn): string {
  const roll = rng(24);
  if (roll === 0) return "!";
  if (roll <= 2) return "?";
  return ".";
}

function sentenceWordCount(rng: RandomIntFn): number {
  // Mix short / medium / longer sentences for visual variety
  const band = rng(10);
  if (band < 3) return 5 + rng(4); // 5–8
  if (band < 8) return 9 + rng(6); // 9–14
  return 15 + rng(5); // 15–19
}

/**
 * Build a sentence with light structural variation (connectors / trailing clauses).
 * Not authentic Latin grammar — visual placeholder only.
 */
function buildSentence(
  rng: RandomIntFn,
  wordBudget?: number,
  recentSentences: string[] = [],
): string {
  const count = Math.max(4, wordBudget ?? sentenceWordCount(rng));
  const words: string[] = [];
  const recent: string[] = [];
  const structure = rng(4); // 0 plain · 1 mid connector · 2 trail · 3 lead

  let slots = count;
  if (structure === 3 && count >= 6) {
    const lead = ["Nam", "Sed", "Ut", "Cum", "Quisque"][rng(5)]!;
    words.push(lead);
    recent.push(lead.toLowerCase());
    slots -= 1;
  }

  const midAt =
    structure === 1 && slots >= 7 ? Math.floor(slots / 2) : -1;

  for (let i = 0; i < slots; i += 1) {
    if (i === midAt) {
      const connector = ["et", "sed", "aut", "vel", "nec"][rng(5)]!;
      words.push(connector);
      recent.push(connector);
      continue;
    }
    const w = pickWord(rng, recent);
    words.push(w);
    recent.push(w);
  }

  if (structure === 2 && words.length >= 6) {
    words[words.length - 1] = ["vitae", "elit", "nunc", "semper"][rng(4)]!;
  }

  if (words[0]) words[0] = capitalize(words[0]!.toLowerCase());

  let sentence = `${words.join(" ")}${sentenceEnd(rng)}`;
  let guard = 0;
  while (recentSentences.includes(sentence) && guard < 4) {
    const alt = pickWord(rng, recent);
    words[words.length - 1] = alt;
    recent.push(alt);
    if (words[0]) words[0] = capitalize(words[0]!.toLowerCase());
    sentence = `${words.join(" ")}${sentenceEnd(rng)}`;
    guard += 1;
  }

  return sentence;
}

function paragraphWordTarget(
  length: ParagraphLength,
  rng: RandomIntFn,
): number {
  if (length === "variable") {
    const keys = Object.keys(PARAGRAPH_WORD_RANGES) as Array<
      keyof typeof PARAGRAPH_WORD_RANGES
    >;
    const key = keys[rng(keys.length)]!;
    const range = PARAGRAPH_WORD_RANGES[key];
    return range.min + rng(range.max - range.min + 1);
  }
  const range = PARAGRAPH_WORD_RANGES[length];
  return range.min + rng(range.max - range.min + 1);
}

function buildParagraph(
  rng: RandomIntFn,
  length: ParagraphLength,
  recentParagraphs: string[],
): string {
  const target = paragraphWordTarget(length, rng);
  const sentences: string[] = [];
  let wordsUsed = 0;
  while (wordsUsed < target) {
    const remaining = target - wordsUsed;
    const nextCount = Math.min(
      remaining,
      Math.max(4, Math.min(sentenceWordCount(rng), remaining)),
    );
    sentences.push(buildSentence(rng, nextCount, sentences));
    wordsUsed += nextCount;
  }
  let paragraph = sentences.join(" ");
  let guard = 0;
  while (recentParagraphs.includes(paragraph) && guard < 3) {
    sentences[sentences.length - 1] = buildSentence(
      rng,
      undefined,
      sentences.slice(0, -1),
    );
    paragraph = sentences.join(" ");
    guard += 1;
  }
  return paragraph;
}

function takeClassicWords(count: number): string[] {
  if (count <= 0) return [];
  if (count >= CLASSIC_LOREM_WORDS.length) {
    return [...CLASSIC_LOREM_WORDS];
  }
  return CLASSIC_LOREM_WORDS.slice(0, count);
}

function wordsToSentenceish(words: string[]): string {
  if (words.length === 0) return "";
  const text = words
    .map((w, i) => (i === 0 ? capitalize(w.toLowerCase()) : w.toLowerCase()))
    .join(" ");
  return `${text}.`;
}

function fillWords(
  rng: RandomIntFn,
  count: number,
  classicOpening: boolean,
): { words: string[]; classicOpeningAbbreviated: boolean } {
  if (count <= 0) return { words: [], classicOpeningAbbreviated: false };

  if (!classicOpening) {
    const words: string[] = [];
    const recent: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const w = pickWord(rng, recent);
      words.push(w);
      recent.push(w);
    }
    return { words, classicOpeningAbbreviated: false };
  }

  const classic = takeClassicWords(count);
  if (classic.length >= count) {
    return {
      words: classic.slice(0, count),
      classicOpeningAbbreviated: count < CLASSIC_LOREM_WORDS.length,
    };
  }

  const words = [...classic];
  const recent = words.slice(-3);
  while (words.length < count) {
    const w = pickWord(rng, recent);
    words.push(w);
    recent.push(w);
  }
  return { words, classicOpeningAbbreviated: false };
}

function generateParagraphs(
  quantity: number,
  length: ParagraphLength,
  classicOpening: boolean,
  rng: RandomIntFn,
): GeneratedDocument {
  const paragraphs: string[] = [];
  let classicOpeningAbbreviated = false;

  for (let i = 0; i < quantity; i += 1) {
    if (i === 0 && classicOpening) {
      const classicWords = CLASSIC_LOREM_WORDS.length;
      const target = paragraphWordTarget(length, rng);
      if (length === "short" && target < classicWords) {
        paragraphs.push(wordsToSentenceish(takeClassicWords(target)));
        classicOpeningAbbreviated = true;
      } else if (target <= classicWords) {
        paragraphs.push(CLASSIC_LOREM_PASSAGE);
      } else {
        const extraSentences: string[] = [];
        let wordsUsed = classicWords;
        while (wordsUsed < target) {
          const remaining = target - wordsUsed;
          const nextCount = Math.min(
            remaining,
            Math.max(4, Math.min(sentenceWordCount(rng), remaining)),
          );
          extraSentences.push(buildSentence(rng, nextCount, extraSentences));
          wordsUsed += nextCount;
        }
        paragraphs.push(
          [CLASSIC_LOREM_PASSAGE, ...extraSentences].join(" "),
        );
      }
    } else {
      paragraphs.push(buildParagraph(rng, length, paragraphs));
    }
  }

  return baseDoc({
    paragraphs,
    mode: "paragraphs",
    requestedQuantity: quantity,
    classicOpening,
    classicOpeningAbbreviated,
    textKind: "lorem",
  });
}

function generateSentences(
  quantity: number,
  classicOpening: boolean,
  rng: RandomIntFn,
): GeneratedDocument {
  const sentences: string[] = [];
  let classicOpeningAbbreviated = false;

  if (classicOpening && quantity > 0) {
    const classicSentences = CLASSIC_LOREM_PASSAGE.split(/(?<=[.!?])\s+/).filter(
      Boolean,
    );
    if (quantity <= classicSentences.length) {
      sentences.push(...classicSentences.slice(0, quantity));
      classicOpeningAbbreviated = quantity < classicSentences.length;
    } else {
      sentences.push(...classicSentences);
      while (sentences.length < quantity) {
        sentences.push(buildSentence(rng, undefined, sentences));
      }
    }
  } else {
    for (let i = 0; i < quantity; i += 1) {
      sentences.push(buildSentence(rng, undefined, sentences));
    }
  }

  return baseDoc({
    paragraphs: [sentences.join(" ")],
    mode: "sentences",
    requestedQuantity: quantity,
    classicOpening,
    classicOpeningAbbreviated,
    textKind: "lorem",
  });
}

function generateWords(
  quantity: number,
  classicOpening: boolean,
  rng: RandomIntFn,
): GeneratedDocument {
  const { words, classicOpeningAbbreviated } = fillWords(
    rng,
    quantity,
    classicOpening,
  );
  return baseDoc({
    paragraphs: [words.join(" ")],
    mode: "words",
    requestedQuantity: quantity,
    classicOpening,
    classicOpeningAbbreviated,
    textKind: "lorem",
  });
}

/**
 * UTF-16 length generation. Corpus is ASCII Latin-root tokens, so
 * code units equal code points for this output.
 */
function generateCharacters(
  quantity: number,
  classicOpening: boolean,
  preferCompleteWords: boolean,
  rng: RandomIntFn,
): GeneratedDocument {
  if (quantity <= 0) {
    return baseDoc({
      paragraphs: [""],
      mode: "characters",
      requestedQuantity: 0,
      classicOpening,
      classicOpeningAbbreviated: false,
      textKind: "lorem",
      exactUtf16: true,
      preferCompleteWords,
      actualUtf16Length: 0,
    });
  }

  let classicOpeningAbbreviated = false;
  let buffer = "";

  if (classicOpening) {
    if (CLASSIC_LOREM_PASSAGE.length >= quantity) {
      if (preferCompleteWords) {
        // Take whole classic words that fit
        const parts: string[] = [];
        let len = 0;
        for (const w of CLASSIC_LOREM_WORDS) {
          const piece = parts.length === 0 ? capitalize(w) : ` ${w}`;
          if (len + piece.length > quantity) break;
          parts.push(parts.length === 0 ? capitalize(w) : w);
          len += piece.length;
        }
        buffer = parts.join(" ");
        classicOpeningAbbreviated = true;
        return baseDoc({
          paragraphs: [buffer],
          mode: "characters",
          requestedQuantity: quantity,
          classicOpening,
          classicOpeningAbbreviated,
          textKind: "lorem",
          exactUtf16: buffer.length === quantity,
          preferCompleteWords: true,
          actualUtf16Length: buffer.length,
        });
      }
      buffer = CLASSIC_LOREM_PASSAGE.slice(0, quantity);
      classicOpeningAbbreviated = true;
      return baseDoc({
        paragraphs: [buffer],
        mode: "characters",
        requestedQuantity: quantity,
        classicOpening,
        classicOpeningAbbreviated,
        textKind: "lorem",
        exactUtf16: true,
        preferCompleteWords: false,
        actualUtf16Length: buffer.length,
      });
    }
    buffer = CLASSIC_LOREM_PASSAGE;
  }

  const recent: string[] = [];
  while (buffer.length < quantity) {
    const w = pickWord(rng, recent);
    recent.push(w);
    const piece = buffer.length === 0 ? capitalize(w) : ` ${w}`;
    if (buffer.length + piece.length <= quantity) {
      buffer += piece;
      continue;
    }
    if (preferCompleteWords) {
      // Stop before exceeding — approximate length
      break;
    }
    const need = quantity - buffer.length;
    if (need > 0) {
      buffer += piece.trimStart().slice(0, need);
    }
    break;
  }

  if (!preferCompleteWords) {
    while (buffer.length < quantity) {
      buffer += pickWord(rng, recent).charAt(0) || "a";
    }
    if (buffer.length > quantity) {
      buffer = buffer.slice(0, quantity);
    }
  }

  return baseDoc({
    paragraphs: [buffer],
    mode: "characters",
    requestedQuantity: quantity,
    classicOpening,
    classicOpeningAbbreviated,
    textKind: "lorem",
    exactUtf16: buffer.length === quantity,
    preferCompleteWords,
    actualUtf16Length: buffer.length,
  });
}

function generateUiEnglish(
  mode: GenerationMode,
  quantity: number,
  rng: RandomIntFn,
): GeneratedDocument {
  if (mode === "words" || mode === "characters") {
    const labels: string[] = [];
    while (
      labels.length < Math.max(1, Math.min(quantity, UI_LABELS.length * 3))
    ) {
      labels.push(UI_LABELS[rng(UI_LABELS.length)]!);
      if (mode === "words" && labels.length >= quantity) break;
    }
    if (mode === "words") {
      return baseDoc({
        paragraphs: [labels.slice(0, quantity).join(" · ")],
        mode,
        requestedQuantity: quantity,
        classicOpening: false,
        classicOpeningAbbreviated: false,
        textKind: "ui-english",
      });
    }
    const joined = labels.join(" · ");
    const text =
      joined.length >= quantity
        ? joined.slice(0, quantity)
        : joined.padEnd(quantity, ".");
    return baseDoc({
      paragraphs: [text.slice(0, quantity)],
      mode,
      requestedQuantity: quantity,
      classicOpening: false,
      classicOpeningAbbreviated: false,
      textKind: "ui-english",
      exactUtf16: text.slice(0, quantity).length === quantity,
      actualUtf16Length: text.slice(0, quantity).length,
    });
  }

  if (mode === "sentences") {
    const sentences: string[] = [];
    while (sentences.length < quantity) {
      sentences.push(UI_FORM_PHRASES[rng(UI_FORM_PHRASES.length)]!);
    }
    return baseDoc({
      paragraphs: [sentences.join(" ")],
      mode,
      requestedQuantity: quantity,
      classicOpening: false,
      classicOpeningAbbreviated: false,
      textKind: "ui-english",
    });
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < quantity; i += 1) {
    const count = 2 + rng(3);
    const parts: string[] = [];
    for (let j = 0; j < count; j += 1) {
      parts.push(UI_FORM_PHRASES[rng(UI_FORM_PHRASES.length)]!);
    }
    paragraphs.push(parts.join(" "));
  }
  return baseDoc({
    paragraphs,
    mode: "paragraphs",
    requestedQuantity: quantity,
    classicOpening: false,
    classicOpeningAbbreviated: false,
    textKind: "ui-english",
  });
}

export function generateLorem(options: GenerateOptions): GeneratedDocument {
  const mode = options.mode;
  const quantity = clampQuantity(mode, options.quantity);
  const rng = options.randomInt ?? createCryptoRandomInt();
  const classicOpening = Boolean(options.classicOpening);
  const paragraphLength: ParagraphLength = options.paragraphLength ?? "medium";
  const textKind = options.textKind ?? "lorem";
  const preferCompleteWords = Boolean(options.preferCompleteWords);

  if (textKind === "ui-english") {
    return generateUiEnglish(mode, quantity, rng);
  }

  switch (mode) {
    case "paragraphs":
      return generateParagraphs(quantity, paragraphLength, classicOpening, rng);
    case "sentences":
      return generateSentences(quantity, classicOpening, rng);
    case "words":
      return generateWords(quantity, classicOpening, rng);
    case "characters":
      return generateCharacters(
        quantity,
        classicOpening,
        preferCompleteWords,
        rng,
      );
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

/** Plain-text body: paragraphs separated by a blank line. */
export function documentToPlainText(doc: GeneratedDocument): string {
  return doc.paragraphs.join("\n\n");
}

export function countDocumentWords(doc: GeneratedDocument): number {
  return doc.paragraphs
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
