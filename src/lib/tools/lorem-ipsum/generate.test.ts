import { describe, expect, it } from "vitest";
import { countWords } from "@/lib/tools/word-counter/count";
import { CLASSIC_OPENING_PHRASE, CLASSIC_LOREM_PASSAGE } from "./classic";
import {
  documentToHtmlBody,
  documentToMarkdown,
  downloadFilenameFor,
  serializeDocument,
} from "./format";
import { documentToPlainText, generateLorem } from "./generate";
import { createSeededRandomInt } from "./rng";
import { LOREM_PRESETS, presetsByGroup } from "./presets";
import { QUANTITY_LIMITS } from "./types";
import { LOREM_VOCABULARY } from "./vocabulary";

const rng = () => createSeededRandomInt(42);

function emptyMeta() {
  return {
    exactUtf16: true as const,
    preferCompleteWords: false as const,
    actualUtf16Length: null as number | null,
  };
}

describe("paragraph generation", () => {
  it("produces the requested paragraph count", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 3,
      paragraphLength: "short",
      classicOpening: false,
      randomInt: rng(),
    });
    expect(doc.paragraphs).toHaveLength(3);
    expect(doc.paragraphs.every((p) => p.length > 0)).toBe(true);
  });

  it("starts with classic opening when enabled", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 2,
      paragraphLength: "medium",
      classicOpening: true,
      randomInt: rng(),
    });
    expect(doc.paragraphs[0]!.startsWith("Lorem ipsum")).toBe(true);
  });

  it("does not repeat classic opening on every paragraph", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 3,
      paragraphLength: "medium",
      classicOpening: true,
      randomInt: rng(),
    });
    expect(doc.paragraphs[0]!.startsWith("Lorem ipsum")).toBe(true);
    expect(doc.paragraphs[1]!.startsWith("Lorem ipsum")).toBe(false);
    expect(doc.paragraphs[2]!.startsWith("Lorem ipsum")).toBe(false);
  });

  it("clamps paragraph quantity to limits", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 9999,
      randomInt: rng(),
    });
    expect(doc.paragraphs).toHaveLength(QUANTITY_LIMITS.paragraphs.max);
  });

  it("avoids identical neighboring paragraphs for variable length", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 5,
      paragraphLength: "variable",
      classicOpening: false,
      randomInt: createSeededRandomInt(88),
    });
    for (let i = 1; i < doc.paragraphs.length; i += 1) {
      expect(doc.paragraphs[i]).not.toBe(doc.paragraphs[i - 1]);
    }
  });
});

describe("sentence generation", () => {
  it("produces the requested sentence count", () => {
    const doc = generateLorem({
      mode: "sentences",
      quantity: 10,
      classicOpening: false,
      randomInt: rng(),
    });
    const text = documentToPlainText(doc);
    const ends = text.match(/[.!?]/g) ?? [];
    expect(ends.length).toBe(10);
  });

  it("capitalizes sentence starts", () => {
    const doc = generateLorem({
      mode: "sentences",
      quantity: 5,
      classicOpening: false,
      randomInt: rng(),
    });
    const parts = documentToPlainText(doc).split(/(?<=[.!?])\s+/);
    for (const part of parts) {
      expect(part.charAt(0)).toMatch(/[A-Z]/);
    }
  });
});

describe("word generation", () => {
  it("produces exactly the requested word count", () => {
    const doc = generateLorem({
      mode: "words",
      quantity: 100,
      classicOpening: false,
      randomInt: rng(),
    });
    const text = documentToPlainText(doc);
    expect(countWords(text)).toBe(100);
  });

  it("uses classic words first when opening is enabled", () => {
    const doc = generateLorem({
      mode: "words",
      quantity: 5,
      classicOpening: true,
      randomInt: rng(),
    });
    const text = documentToPlainText(doc).toLowerCase();
    expect(text.startsWith("lorem ipsum dolor sit amet")).toBe(true);
    expect(doc.classicOpeningAbbreviated).toBe(true);
  });
});

describe("exact character generation", () => {
  it("produces exact UTF-16 length", () => {
    for (const n of [1, 7, 50, 280, CLASSIC_LOREM_PASSAGE.length]) {
      const doc = generateLorem({
        mode: "characters",
        quantity: n,
        classicOpening: false,
        randomInt: rng(),
      });
      const text = documentToPlainText(doc);
      expect(text.length).toBe(n);
      expect(doc.exactUtf16).toBe(true);
      expect(doc.actualUtf16Length).toBe(n);
    }
  });

  it("abbreviates classic opening for short character budgets", () => {
    const doc = generateLorem({
      mode: "characters",
      quantity: 11,
      classicOpening: true,
      randomInt: rng(),
    });
    const text = documentToPlainText(doc);
    expect(text.length).toBe(11);
    expect(text).toBe(CLASSIC_LOREM_PASSAGE.slice(0, 11));
    expect(doc.classicOpeningAbbreviated).toBe(true);
  });

  it("prefer complete words may undershoot and is not labeled exact", () => {
    const doc = generateLorem({
      mode: "characters",
      quantity: 47,
      classicOpening: false,
      preferCompleteWords: true,
      randomInt: createSeededRandomInt(3),
    });
    const text = documentToPlainText(doc);
    expect(text.length).toBeLessThanOrEqual(47);
    expect(doc.preferCompleteWords).toBe(true);
    expect(doc.actualUtf16Length).toBe(text.length);
    if (text.length !== 47) {
      expect(doc.exactUtf16).toBe(false);
    }
    // Whole words only — no trailing partial token mid-ASCII word
    expect(text).not.toMatch(/\s$/);
    const tokens = text.split(/\s+/);
    expect(tokens.every((t) => t.length > 0)).toBe(true);
  });

  it("never splits a surrogate pair when truncating (ASCII corpus stays safe)", () => {
    const doc = generateLorem({
      mode: "characters",
      quantity: 160,
      classicOpening: true,
      randomInt: rng(),
    });
    const text = documentToPlainText(doc);
    expect(text.length).toBe(160);
    // Round-trip through encodeURIComponent proves valid UTF-16
    expect(() => encodeURIComponent(text)).not.toThrow();
  });
});

describe("format serialization", () => {
  it("preserves content when switching formats", () => {
    const doc = generateLorem({
      mode: "paragraphs",
      quantity: 2,
      classicOpening: true,
      randomInt: createSeededRandomInt(7),
    });
    const plain = serializeDocument(doc, "plain");
    const md = serializeDocument(doc, "markdown");
    const html = serializeDocument(doc, "html");
    const body = documentToHtmlBody(doc);

    expect(plain).toBe(md);
    expect(plain).toBe(documentToMarkdown(doc));
    expect(html).toContain("<p>");
    expect(html).toContain("</p>");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(body);
    expect(html).not.toContain("<script");
    for (const p of doc.paragraphs) {
      expect(plain).toContain(p);
    }
  });

  it("styled HTML includes a style block; clean does not", () => {
    const doc = generateLorem({
      mode: "words",
      quantity: 8,
      classicOpening: false,
      randomInt: rng(),
    });
    const clean = serializeDocument(doc, "html", "clean");
    const styled = serializeDocument(doc, "html", "styled");
    expect(clean).not.toContain("<style>");
    expect(styled).toContain("<style>");
    expect(documentToHtmlBody(doc)).toBe(
      clean.match(/<body>\s*([\s\S]*?)\s*<\/body>/)?.[1]?.trim(),
    );
  });

  it("escapes HTML special characters in body text", () => {
    const doc = {
      paragraphs: ['Test <tag> & "quotes"'],
      mode: "words" as const,
      requestedQuantity: 1,
      classicOpening: false,
      classicOpeningAbbreviated: false,
      textKind: "lorem" as const,
      ...emptyMeta(),
    };
    const html = serializeDocument(doc, "html");
    expect(html).toContain("&lt;tag&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;quotes&quot;");
  });

  it("uses correct download filenames", () => {
    expect(downloadFilenameFor("plain")).toBe("WordMelo-lorem-ipsum.txt");
    expect(downloadFilenameFor("html")).toBe("WordMelo-lorem-ipsum.html");
    expect(downloadFilenameFor("markdown")).toBe("WordMelo-lorem-ipsum.md");
  });
});

describe("presets", () => {
  it("each preset produces non-empty output with correct text kind", () => {
    for (const preset of LOREM_PRESETS) {
      const doc = generateLorem({
        ...preset.options,
        randomInt: createSeededRandomInt(99),
      });
      expect(documentToPlainText(doc).trim().length).toBeGreaterThan(0);
      expect(doc.textKind).toBe(preset.options.textKind ?? "lorem");
      expect(doc.mode).toBe(preset.options.mode);
    }
  });

  it("groups Lorem Ipsum and English UI presets separately", () => {
    const lorem = presetsByGroup("lorem");
    const ui = presetsByGroup("ui");
    expect(lorem.length).toBeGreaterThanOrEqual(4);
    expect(ui.length).toBeGreaterThanOrEqual(2);
    expect(ui.every((p) => p.options.textKind === "ui-english")).toBe(true);
    expect(lorem.every((p) => p.options.textKind !== "ui-english")).toBe(true);
  });
});

describe("vocabulary quality", () => {
  it("has no empty or whitespace-only tokens", () => {
    expect(LOREM_VOCABULARY.length).toBeGreaterThan(40);
    for (const token of LOREM_VOCABULARY) {
      expect(token.trim()).toBe(token);
      expect(token.length).toBeGreaterThan(0);
      expect(token).toMatch(/^[a-z]+$/i);
    }
  });
});

describe("exact counts", () => {
  it("counts classic opening words inside the requested word total", () => {
    for (const quantity of [1, 10, 100, 1000, 5000]) {
      const doc = generateLorem({
        mode: "words",
        quantity,
        classicOpening: true,
        seed: quantity,
      });
      expect(countWords(documentToPlainText(doc))).toBe(quantity);
      if (quantity >= 5) {
        expect(documentToPlainText(doc).toLowerCase().startsWith("lorem ipsum dolor sit amet")).toBe(true);
      }
    }
  });

  it("hits exact UTF-16 lengths", () => {
    for (const quantity of [1, 10, 50, 100, 150, 500, 1000]) {
      const doc = generateLorem({
        mode: "characters",
        quantity,
        classicOpening: false,
        seed: quantity,
      });
      expect(documentToPlainText(doc).length).toBe(quantity);
      expect(doc.exactUtf16).toBe(true);
    }
  });
});

describe("list generation", () => {
  it("returns the requested number of items", () => {
    const doc = generateLorem({
      mode: "lists",
      quantity: 6,
      listStyle: "ordered",
      listItemLength: "short",
      classicOpening: true,
      seed: 4,
    });
    expect(doc.paragraphs).toHaveLength(6);
    expect(doc.paragraphs.every((item) => item.trim().length > 0)).toBe(true);
    expect(doc.paragraphs[0]!.toLowerCase().startsWith("lorem ipsum")).toBe(true);
    const plain = documentToPlainText(doc);
    expect(plain.startsWith("1. ")).toBe(true);
    expect(plain).toContain("\n2. ");
    expect(serializeDocument(doc, "html")).toContain("<ol>");
    expect(serializeDocument(doc, "html")).toContain("<li>");
    expect(serializeDocument(doc, "markdown")).toContain("1. ");
  });

  it("escapes list item text in HTML", () => {
    const html = serializeDocument(
      {
        paragraphs: ["Use <b> & quotes"],
        mode: "lists",
        listStyle: "unordered",
        requestedQuantity: 1,
        classicOpening: false,
        classicOpeningAbbreviated: false,
        textKind: "lorem",
        exactUtf16: true,
        preferCompleteWords: false,
        actualUtf16Length: null,
      },
      "html",
    );
    expect(html).toContain("<ul>");
    expect(html).toContain("&lt;b&gt;");
    expect(html).not.toContain("<b>");
  });
});

describe("seeded generation option", () => {
  it("repeats when the seed and settings match", () => {
    const first = documentToPlainText(
      generateLorem({ mode: "paragraphs", quantity: 2, paragraphLength: "short", seed: 77 }),
    );
    const second = documentToPlainText(
      generateLorem({ mode: "paragraphs", quantity: 2, paragraphLength: "short", seed: 77 }),
    );
    expect(first).toBe(second);
    const other = documentToPlainText(
      generateLorem({ mode: "paragraphs", quantity: 2, paragraphLength: "short", seed: 78 }),
    );
    expect(other).not.toBe(first);
  });
});

describe("deterministic RNG", () => {
  it("repeats with the same seed", () => {
    const a = documentToPlainText(
      generateLorem({
        mode: "sentences",
        quantity: 5,
        randomInt: createSeededRandomInt(123),
      }),
    );
    const b = documentToPlainText(
      generateLorem({
        mode: "sentences",
        quantity: 5,
        randomInt: createSeededRandomInt(123),
      }),
    );
    expect(a).toBe(b);
  });
});

describe("classic phrase", () => {
  it("exports the familiar opening phrase constant", () => {
    expect(CLASSIC_OPENING_PHRASE.toLowerCase()).toContain("lorem ipsum");
  });
});
