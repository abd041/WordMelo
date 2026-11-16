import { describe, expect, it } from "vitest";
import {
  convertCase,
  toAlternatingCase,
  toCamelCase,
  toCapitalizeEachWord,
  toInverseCase,
  toKebabCase,
  toLowerCaseText,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCaseText,
  tokenizeForIdentifier,
} from "./convert";
import {
  CASE_MODE_EXAMPLE_SOURCE,
  CASE_MODE_GROUPS,
  CASE_MODES,
  getCaseModesByGroup,
} from "./modes";

describe("case mode catalog", () => {
  it("exposes 11 conversion modes", () => {
    expect(CASE_MODES).toHaveLength(11);
  });

  it("has unique mode ids", () => {
    const ids = CASE_MODES.map((mode) => mode.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("groups everyday and developer modes", () => {
    expect(CASE_MODE_GROUPS).toHaveLength(2);
    expect(getCaseModesByGroup("everyday")).toHaveLength(7);
    expect(getCaseModesByGroup("developer")).toHaveLength(4);
  });

  it("generates live example previews for every mode", () => {
    for (const mode of CASE_MODES) {
      const preview = convertCase(CASE_MODE_EXAMPLE_SOURCE, mode.id);
      expect(preview.length).toBeGreaterThan(0);
    }
    // Title Case lowers small middle words; Capitalize Each Word does not.
    expect(convertCase("a guide to the stars", "title")).toBe(
      "A Guide to the Stars",
    );
    expect(convertCase("a guide to the stars", "capitalize-words")).toBe(
      "A Guide To The Stars",
    );
  });
});

describe("empty and trivial input", () => {
  it("returns empty string for empty input across all modes", () => {
    for (const mode of CASE_MODES) {
      expect(convertCase("", mode.id)).toBe("");
    }
  });

  it("handles single letters", () => {
    expect(toUpperCaseText("a")).toBe("A");
    expect(toLowerCaseText("A")).toBe("a");
    expect(toCapitalizeEachWord("a")).toBe("A");
  });
});

describe("uppercase and lowercase", () => {
  it("converts mixed English text", () => {
    expect(toUpperCaseText("Hello World")).toBe("HELLO WORLD");
    expect(toLowerCaseText("Hello World")).toBe("hello world");
  });

  it("preserves punctuation, digits, spaces, and newlines", () => {
    const sample = "A-1, ok!\nNext";
    expect(toUpperCaseText(sample)).toBe("A-1, OK!\nNEXT");
    expect(toLowerCaseText(sample)).toBe("a-1, ok!\nnext");
  });

  it("handles accented Latin letters", () => {
    expect(toUpperCaseText("café")).toBe("CAFÉ");
    expect(toLowerCaseText("CAFÉ")).toBe("café");
  });

  it("uppercases Turkish-insensitive en-US i", () => {
    expect(toUpperCaseText("istanbul")).toBe("ISTANBUL");
  });
});

describe("sentence case", () => {
  it("capitalizes the first letter and after sentence endings", () => {
    expect(toSentenceCase("hello world. next line!")).toBe(
      "Hello world. Next line!",
    );
  });

  it("capitalizes after newlines", () => {
    expect(toSentenceCase("one\ntwo")).toBe("One\nTwo");
  });

  it("preserves multiple spaces", () => {
    expect(toSentenceCase("hi.  there")).toBe("Hi.  There");
  });

  it("does not treat common abbreviations as sentence ends", () => {
    expect(toSentenceCase("meet dr. adams today.")).toBe(
      "Meet dr. adams today.",
    );
    expect(toSentenceCase("ask mr. smith next.")).toBe("Ask mr. smith next.");
  });

  it("does not restore acronyms that were typed in all caps", () => {
    expect(toSentenceCase("NASA OPENED AN OFFICE.")).toBe(
      "Nasa opened an office.",
    );
  });

  it("capitalizes after genuine sentence periods", () => {
    expect(toSentenceCase("done. next task.")).toBe("Done. Next task.");
  });
});

describe("title case", () => {
  it("capitalizes major words and lowers small middle words", () => {
    expect(toTitleCase("the lord of the rings")).toBe("The Lord of the Rings");
  });

  it("capitalizes hyphenated compounds", () => {
    expect(toTitleCase("a well-known author")).toBe("A Well-Known Author");
  });

  it("preserves apostrophes and capitalizes the first letter only", () => {
    // WordMelo title case capitalizes the first letter of each word token;
    // letters after apostrophes stay lowercase (not Chicago/AP name rules).
    expect(toTitleCase("o'clock rules")).toBe("O'clock Rules");
  });
});

describe("capitalize each word", () => {
  it("capitalizes whitespace-separated words", () => {
    expect(toCapitalizeEachWord("hello beautiful world")).toBe(
      "Hello Beautiful World",
    );
  });

  it("preserves tabs and newlines as separators", () => {
    expect(toCapitalizeEachWord("one\ttwo\nthree")).toBe("One\tTwo\nThree");
  });
});

describe("alternating case", () => {
  it("starts with lowercase and skips non-letters", () => {
    expect(toAlternatingCase("Hello!")).toBe("hElLo!");
    expect(toAlternatingCase("A1B2C")).toBe("a1B2c");
  });
});

describe("inverse case", () => {
  it("swaps upper and lower Latin letters", () => {
    expect(toInverseCase("Hello World")).toBe("hELLO wORLD");
  });

  it("leaves digits and punctuation unchanged", () => {
    expect(toInverseCase("Abc-123!")).toBe("aBC-123!");
  });
});

describe("programming identifier modes", () => {
  it("tokenizes spaces, hyphens, underscores, and camel boundaries", () => {
    expect(tokenizeForIdentifier("hello_world-test")).toEqual([
      "hello",
      "world",
      "test",
    ]);
    expect(tokenizeForIdentifier("getHTTPResponse")).toEqual([
      "get",
      "http",
      "response",
    ]);
  });

  it("builds camelCase", () => {
    expect(toCamelCase("Hello World")).toBe("helloWorld");
    expect(toCamelCase("convert-to_camel")).toBe("convertToCamel");
  });

  it("builds PascalCase", () => {
    expect(toPascalCase("hello world")).toBe("HelloWorld");
  });

  it("builds snake_case", () => {
    expect(toSnakeCase("Hello World")).toBe("hello_world");
  });

  it("builds kebab-case", () => {
    expect(toKebabCase("Hello World")).toBe("hello-world");
  });

  it("drops most punctuation from identifier tokens", () => {
    expect(toSnakeCase("hello, world!")).toBe("hello_world");
  });
});

describe("convertCase dispatcher", () => {
  it("routes every mode", () => {
    const sample = "Hello World";
    expect(convertCase(sample, "uppercase")).toBe("HELLO WORLD");
    expect(convertCase(sample, "lowercase")).toBe("hello world");
    expect(convertCase(sample, "sentence")).toBe("Hello world");
    expect(convertCase(sample, "title")).toBe("Hello World");
    expect(convertCase(sample, "capitalize-words")).toBe("Hello World");
    expect(convertCase(sample, "alternating")).toBe("hElLo WoRlD");
    expect(convertCase(sample, "inverse")).toBe("hELLO wORLD");
    expect(convertCase(sample, "camel")).toBe("helloWorld");
    expect(convertCase(sample, "pascal")).toBe("HelloWorld");
    expect(convertCase(sample, "snake")).toBe("hello_world");
    expect(convertCase(sample, "kebab")).toBe("hello-world");
  });

  it("always converts from the provided input (mode switching safety)", () => {
    const original = "Make TEXT Clear";
    const upper = convertCase(original, "uppercase");
    expect(convertCase(original, "lowercase")).toBe("make text clear");
    expect(convertCase(upper, "lowercase")).toBe("make text clear");
  });
});

describe("unicode and edge cases", () => {
  it("preserves emoji and ZWJ sequences in text modes", () => {
    const input = "Hello 👩‍💻 world";
    expect(toUpperCaseText(input)).toContain("👩‍💻");
    expect(toLowerCaseText(input)).toContain("👩‍💻");
    expect(toAlternatingCase(input)).toContain("👩‍💻");
    expect(toInverseCase(input)).toContain("👩‍💻");
  });

  it("preserves combining marks attached to Latin letters for case flips", () => {
    const input = "e\u0301"; // e + combining acute
    expect(toUpperCaseText(input).startsWith("E")).toBe(true);
  });

  it("does not delete Arabic, Devanagari, or CJK text", () => {
    const input = "مرحبا नमस्ते 日本語";
    for (const mode of CASE_MODES) {
      const out = convertCase(input, mode.id);
      if (mode.kind === "text") {
        expect(out).toContain("مرحبا");
        expect(out).toContain("नमस्ते");
        expect(out).toContain("日本語");
      } else {
        expect(out.length).toBeGreaterThan(0);
      }
    }
  });

  it("preserves URLs reasonably in text modes", () => {
    const url = "Visit https://WordMelo.com/path today";
    expect(toLowerCaseText(url)).toContain("https://wordmelo.com/path");
    expect(toUpperCaseText(url)).toContain("HTTPS://WORDMELO.COM/PATH");
  });

  it("handles Windows and Unix newlines", () => {
    expect(toUpperCaseText("a\r\nb")).toBe("A\r\nB");
    expect(toSentenceCase("one.\r\ntwo")).toContain("\r");
  });

  it("handles long input without throwing", () => {
    const long = "WordMelo case converter sample. ".repeat(400);
    expect(() => convertCase(long, "title")).not.toThrow();
    expect(convertCase(long, "snake").includes("_")).toBe(true);
  });
});
