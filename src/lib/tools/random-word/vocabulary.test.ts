import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { POS_ADJECTIVE, POS_NOUN, POS_VERB } from "./types";
import {
  parseVocabularyPayload,
  type VocabularyPayload,
} from "./vocabulary";

const vocabPath = path.join(
  process.cwd(),
  "public/data/random-words/vocabulary.json",
);
const statsPath = path.join(process.cwd(), "public/data/random-words/stats.json");
const licensePath = path.join(
  process.cwd(),
  "public/data/random-words/LICENSE-WORDNET.txt",
);
const sourcesPath = path.join(
  process.cwd(),
  "src/lib/tools/random-word/DATA_SOURCES.md",
);

describe("vocabulary dataset", () => {
  it("ships a substantial licensed vocabulary file", () => {
    expect(fs.existsSync(vocabPath)).toBe(true);
    expect(fs.existsSync(licensePath)).toBe(true);
    expect(fs.existsSync(sourcesPath)).toBe(true);
    const sources = fs.readFileSync(sourcesPath, "utf8");
    expect(sources).toMatch(/WordNet/);
    expect(sources).toMatch(/google-10000/i);
    expect(sources).toMatch(/CC0/);
  });

  it(
    "parses valid unique alphabetic entries with POS metadata",
    () => {
      const payload = JSON.parse(
        fs.readFileSync(vocabPath, "utf8"),
      ) as VocabularyPayload;
      const entries = parseVocabularyPayload(payload);
      expect(entries.length).toBeGreaterThan(5000);

      const seen = new Set<string>();
      let nouns = 0;
      let verbs = 0;
      let adjectives = 0;
      let malformed = 0;

      for (const entry of entries) {
        if (!/^[a-z]+$/.test(entry.word) || entry.word.length < 3 || entry.word.length > 14) {
          malformed += 1;
          continue;
        }
        if (seen.has(entry.word)) malformed += 1;
        seen.add(entry.word);
        if ((entry.pos & (POS_NOUN | POS_VERB | POS_ADJECTIVE)) === 0) malformed += 1;
        if (entry.pos & POS_NOUN) nouns += 1;
        if (entry.pos & POS_VERB) verbs += 1;
        if (entry.pos & POS_ADJECTIVE) adjectives += 1;
        if (entry.difficulty !== 0 && entry.difficulty !== 1 && entry.difficulty !== 2) {
          malformed += 1;
        }
      }

      expect(malformed).toBe(0);

      const stats = JSON.parse(fs.readFileSync(statsPath, "utf8")) as {
        total: number;
        nouns: number;
        verbs: number;
        adjectives: number;
      };
      expect(entries.length).toBe(stats.total);
      expect(nouns).toBe(stats.nouns);
      expect(verbs).toBe(stats.verbs);
      expect(adjectives).toBe(stats.adjectives);
      expect(nouns).toBeGreaterThan(1000);
      expect(verbs).toBeGreaterThan(500);
      expect(adjectives).toBeGreaterThan(500);
    },
    30_000,
  );
});
