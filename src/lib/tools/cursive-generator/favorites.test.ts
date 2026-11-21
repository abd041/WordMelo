import { describe, expect, it } from "vitest";
import { rememberedStyleId } from "./favorites";

const STYLE_IDS = ["script", "bold-script", "airy"];

describe("cursive copy history", () => {
  it("remembers real styles and the live script preview", () => {
    expect(rememberedStyleId("script", STYLE_IDS)).toBe("script");
    expect(rememberedStyleId("live-script", STYLE_IDS)).toBe("script");
  });

  it("does not store alphabet or unknown copies as styles", () => {
    expect(rememberedStyleId("alphabet-Mathematical Script A", STYLE_IDS)).toBeNull();
    expect(rememberedStyleId("alphabet-Bold Mathematical Script a", STYLE_IDS)).toBeNull();
    expect(rememberedStyleId("missing", STYLE_IDS)).toBeNull();
  });
});
