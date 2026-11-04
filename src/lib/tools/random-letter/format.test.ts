import { describe, expect, it } from "vitest";
import { formatLetters } from "./format";

describe("letter formatting", () => {
  it("formats separators correctly", () => {
    const letters = ["A", "B", "C"];
    expect(formatLetters(letters, "space")).toBe("A B C");
    expect(formatLetters(letters, "comma")).toBe("A, B, C");
    expect(formatLetters(letters, "newline")).toBe("A\nB\nC");
    expect(formatLetters(letters, "joined")).toBe("ABC");
  });
});
