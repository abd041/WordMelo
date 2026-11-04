import { describe, expect, it } from "vitest";
import {
  pushRecentCopiedStyleId,
  toggleFavoriteStyleId,
} from "./favorites";

describe("toggleFavoriteStyleId", () => {
  it("adds a missing id", () => {
    expect(toggleFavoriteStyleId(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes an existing id", () => {
    expect(toggleFavoriteStyleId(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("pushRecentCopiedStyleId", () => {
  it("moves an id to the front", () => {
    expect(pushRecentCopiedStyleId(["a", "b"], "b")).toEqual(["b", "a"]);
  });

  it("dedupes and caps length at 12", () => {
    const ids = Array.from({ length: 12 }, (_, i) => `s${i}`);
    const next = pushRecentCopiedStyleId(ids, "new");
    expect(next[0]).toBe("new");
    expect(next).toHaveLength(12);
    expect(next).not.toContain("s11");
  });
});
