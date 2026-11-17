import { describe, expect, it } from "vitest";
import { splitGraphemes } from "./graphemes";
import {
  BOLD_SERIF,
  CIRCLED,
  FULLWIDTH,
  ITALIC,
  SCRIPT,
  SMALL_CAPS,
  SUPERSCRIPT,
  UPSIDE_DOWN,
} from "./maps";
import {
  FANCY_STYLES,
  findDuplicateStyleOutputs,
  generateAllFancyStyles,
  getFancyStyleById,
  getFancyStyleCount,
} from "./styles";
import {
  combiningStrikethrough,
  combiningUnderline,
  frameTransform,
  intersperse,
  mapWithDictionary,
  reverseGraphemes,
  upsideDownTransform,
} from "./transform";

const SAMPLE = "Fancy Text 123";
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

describe("fancy text catalog", () => {
  it("exposes at least 40 styles", () => {
    expect(getFancyStyleCount()).toBeGreaterThanOrEqual(40);
  });

  it("has unique style ids", () => {
    const ids = FANCY_STYLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique style names", () => {
    const names = FANCY_STYLES.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("produces distinct outputs for a rich Latin sample", () => {
    const duplicates = findDuplicateStyleOutputs(
      "The Quick Brown Fox jumps 0123456789!",
    );
    expect(duplicates).toEqual([]);
  });
});

describe("mapWithDictionary", () => {
  it("returns empty for empty input", () => {
    expect(mapWithDictionary("", BOLD_SERIF)).toBe("");
  });

  it("maps uppercase and lowercase Latin letters", () => {
    const out = mapWithDictionary("Ab", BOLD_SERIF);
    expect(out).toBe("𝐀𝐛");
    expect(out).not.toBe("Ab");
  });

  it("maps digits where supported", () => {
    expect(mapWithDictionary("12", BOLD_SERIF)).toBe("𝟏𝟐");
  });

  it("preserves punctuation", () => {
    expect(mapWithDictionary("Hi!", BOLD_SERIF)).toBe("𝐇𝐢!");
  });

  it("preserves whitespace and newlines", () => {
    const input = "A B\nC\tD";
    const out = mapWithDictionary(input, BOLD_SERIF);
    expect(out).toContain(" ");
    expect(out).toContain("\n");
    expect(out).toContain("\t");
    expect(splitGraphemes(out).filter((g) => g === "\n")).toHaveLength(1);
  });

  it("preserves emoji and ZWJ sequences", () => {
    const family = "👨‍👩‍👧‍👦";
    const input = `Hi ${family}!`;
    const out = mapWithDictionary(input, BOLD_SERIF);
    expect(out).toContain(family);
    expect(out.startsWith("𝐇𝐢")).toBe(true);
  });

  it("does not delete unsupported scripts", () => {
    const input = "Hello 日本語 Привет العربية";
    const out = mapWithDictionary(input, BOLD_SERIF);
    expect(out).toContain("日本語");
    expect(out).toContain("Привет");
    expect(out).toContain("العربية");
    expect(out.length).toBeGreaterThanOrEqual(input.length);
  });

  it("leaves combining clusters intact rather than corrupting them", () => {
    const input = "e\u0301"; // e + combining acute
    const out = mapWithDictionary(input, BOLD_SERIF);
    expect(out).toBe(input);
  });

  it("handles italic special-case h", () => {
    expect(mapWithDictionary("h", ITALIC)).toBe("\u210e");
  });

  it("handles script exceptions", () => {
    expect(mapWithDictionary("B", SCRIPT)).toBe("\u212c");
    expect(mapWithDictionary("e", SCRIPT)).toBe("\u212f");
  });
});

describe("every style mapping", () => {
  it("transforms a non-empty Latin sample without throwing", () => {
    for (const style of FANCY_STYLES) {
      expect(() => style.transform(SAMPLE)).not.toThrow();
      const out = style.transform(SAMPLE);
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    }
  });

  it("returns empty string for empty input", () => {
    for (const style of FANCY_STYLES) {
      expect(style.transform("")).toBe("");
    }
  });

  it("preserves multiline structure for letter styles", () => {
    const input = "Line one\nLine two";
    for (const style of FANCY_STYLES) {
      const out = style.transform(input);
      expect(out.split("\n")).toHaveLength(2);
    }
  });

  it("does not strip emoji from any style", () => {
    const input = "Go 🚀 now";
    for (const style of FANCY_STYLES) {
      expect(style.transform(input)).toContain("🚀");
    }
  });

  it("keeps unsupported Urdu letters present", () => {
    const input = "اردو";
    for (const style of FANCY_STYLES) {
      const out = style.transform(input);
      for (const ch of input) {
        expect(out.includes(ch)).toBe(true);
      }
    }
  });

  it("keeps unsupported Arabic letters present", () => {
    const input = "مرحبا";
    for (const style of FANCY_STYLES) {
      const out = style.transform(input);
      // Frames wrap; others should still contain original letters
      for (const ch of input) {
        expect(out.includes(ch)).toBe(true);
      }
    }
  });
});

describe("combining and structural transforms", () => {
  it("adds underline combining marks", () => {
    const out = combiningUnderline("ab");
    expect(out).toContain("\u0332");
    expect(out.startsWith("a")).toBe(true);
  });

  it("adds strikethrough combining marks", () => {
    expect(combiningStrikethrough("X")).toContain("\u0336");
  });

  it("reverses grapheme order", () => {
    expect(reverseGraphemes("abc")).toBe("cba");
    expect(reverseGraphemes("a🚀c")).toBe("c🚀a");
  });

  it("upside-down flips and reverses", () => {
    const out = upsideDownTransform("ab", UPSIDE_DOWN);
    expect(out).toBe("qɐ");
  });

  it("frames non-empty lines only", () => {
    expect(frameTransform("hi", "【", "】")).toBe("【hi】");
    expect(frameTransform("a\n\nb", "「", "」")).toBe("「a」\n\n「b」");
  });

  it("intersperses separators without altering spaces", () => {
    expect(intersperse("ab cd", "·")).toBe("a·b c·d");
  });
});

describe("generateAllFancyStyles", () => {
  it("returns one result per style", () => {
    const results = generateAllFancyStyles("WordMelo");
    expect(results).toHaveLength(FANCY_STYLES.length);
    expect(results.every((r) => r.output.length > 0)).toBe(true);
  });

  it("handles long inputs without excessive slowdown", () => {
    const long = "WordMelo fancy text generator ".repeat(200);
    const start = performance.now();
    generateAllFancyStyles(long);
    const elapsed = performance.now() - start;
    // Wall-clock bound; keep loose enough for busy local Windows agents.
    expect(elapsed).toBeLessThan(5000);
  });
});

describe("lookup helpers", () => {
  it("finds styles by id", () => {
    expect(getFancyStyleById("bold-serif")?.name).toBe("Bold serif");
    expect(getFancyStyleById("missing")).toBeUndefined();
  });
});

describe("map coverage smoke checks", () => {
  it("bold serif maps every ASCII letter", () => {
    for (const ch of ALPHA) {
      expect(BOLD_SERIF[ch]).toBeDefined();
      expect(BOLD_SERIF[ch]).not.toBe(ch);
    }
  });

  it("circled maps letters and digits 0-9", () => {
    for (const ch of ALPHA) {
      expect(CIRCLED[ch]).toBeDefined();
    }
    for (const ch of DIGITS) {
      expect(CIRCLED[ch]).toBeDefined();
    }
  });

  it("fullwidth maps printable ASCII", () => {
    expect(FULLWIDTH["A"]).toBe("Ａ");
    expect(FULLWIDTH["!"]).toBe("！");
  });

  it("small caps maps lowercase latin", () => {
    for (const ch of "abcdefghijklmnopqrstuvwxyz") {
      expect(SMALL_CAPS[ch]).toBeDefined();
      expect(SMALL_CAPS[ch]).not.toBe(ch);
    }
  });

  it("superscript maps common digits", () => {
    expect(SUPERSCRIPT["2"]).toBe("²");
    expect(SUPERSCRIPT["n"]).toBe("ⁿ");
  });
});

describe("fullwidth space and newlines", () => {
  it("maps ordinary spaces to ideographic space", () => {
    expect(mapWithDictionary("A B", FULLWIDTH)).toBe("Ａ\u3000Ｂ");
  });

  it("preserves newlines while mapping letters", () => {
    expect(mapWithDictionary("A\nB", FULLWIDTH)).toBe("Ａ\nＢ");
  });
});

describe("featured sorting", () => {
  it("orders featured styles first", async () => {
    const { FEATURED_STYLE_IDS, sortFancyResults, generateAllFancyStyles } =
      await import("./styles");
    const sorted = sortFancyResults(
      generateAllFancyStyles("Test"),
      "featured",
    );
    expect(sorted.slice(0, FEATURED_STYLE_IDS.length).map((r) => r.style.id)).toEqual(
      [...FEATURED_STYLE_IDS],
    );
  });

  it("sorts alphabetically by style name", async () => {
    const { sortFancyResults, generateAllFancyStyles } = await import("./styles");
    const sorted = sortFancyResults(
      generateAllFancyStyles("Test"),
      "alphabetical",
    );
    const names = sorted.map((r) => r.style.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
  });
});

describe("unicode edge cases across styles", () => {
  const edgeCases = [
    "Café",
    "नमस्ते",
    "日本語",
    "مرحبا",
    "👩‍💻",
    "👍🏽",
    "a\u0301",
    "Hello\tWorld\nLine2",
  ];

  it("never deletes characters from edge-case inputs", () => {
    // These styles reorder or insert separators between graphemes by design.
    const structural = new Set([
      "reversed",
      "upside-down",
      "spaced",
      "dotted-sep",
      "vaporwave",
    ]);
    for (const input of edgeCases) {
      for (const style of FANCY_STYLES) {
        const out = style.transform(input);
        expect(out.length).toBeGreaterThan(0);
        if (!structural.has(style.id)) {
          if (input.includes("नमस्ते")) expect(out).toContain("नमस्ते");
          if (input.includes("日本語")) expect(out).toContain("日本語");
          if (input.includes("مرحبا")) expect(out).toContain("مرحبا");
        } else if (!style.id.includes("upside") && !style.id.includes("reversed")) {
          // Separator styles still keep each script grapheme present.
          for (const g of splitGraphemes("नमस्ते日本語مرحبا")) {
            if (input.includes(g)) expect(out).toContain(g);
          }
        }
        // Emoji clusters must survive every style (including flip/reverse).
        if (input.includes("👩‍💻")) expect(out).toContain("👩‍💻");
        if (input.includes("👍🏽")) expect(out).toContain("👍🏽");
        if (input.includes("\n")) expect(out).toContain("\n");
        if (input.includes("\t")) expect(out).toContain("\t");
      }
    }
  });

  it("maps digits independently for bold serif", () => {
    expect(mapWithDictionary(DIGITS, BOLD_SERIF)).toBe("𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗");
  });
});

describe("decorations are separate from alphabet styles", () => {
  it("does not inflate FANCY_STYLES with decoration ids", async () => {
    const { FANCY_DECORATIONS } = await import("./decorations");
    const styleIds = new Set(FANCY_STYLES.map((s) => s.id));
    for (const deco of FANCY_DECORATIONS) {
      expect(styleIds.has(deco.id)).toBe(false);
    }
  });
});
