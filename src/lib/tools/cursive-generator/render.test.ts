import { describe, expect, it } from "vitest";
import { CURSIVE_FONTS, DEFAULT_CURSIVE_FONT_ID, getCursiveFont } from "./fonts";
import {
  PNG_DOWNLOAD_FILENAME,
  computeAutoContentSize,
  DEFAULT_HANDWRITING_OPTIONS,
  HANDWRITING_BACKGROUNDS,
  HANDWRITING_COLORS,
  resolveFont,
} from "./render";
import {
  pushRecentCopiedStyleId,
  toggleFavoriteStyleId,
} from "./favorites";
import { HANDWRITING_PRESETS, getHandwritingPreset } from "./presets";
import { CURSIVE_STYLE_GROUPS } from "./styles";

describe("cursive fonts catalog", () => {
  it("ships 4–8 distinct OFL handwriting fonts", () => {
    expect(CURSIVE_FONTS.length).toBeGreaterThanOrEqual(4);
    expect(CURSIVE_FONTS.length).toBeLessThanOrEqual(8);
    const ids = new Set(CURSIVE_FONTS.map((f) => f.id));
    const families = new Set(CURSIVE_FONTS.map((f) => f.family));
    expect(ids.size).toBe(CURSIVE_FONTS.length);
    expect(families.size).toBe(CURSIVE_FONTS.length);
  });

  it("points each font at a public woff2 and license path", () => {
    for (const font of CURSIVE_FONTS) {
      expect(font.woff2Path).toMatch(/^\/fonts\/cursive\/.+\.woff2$/);
      expect(font.licensePath).toContain("/fonts/cursive/licenses/");
      expect(font.label.length).toBeGreaterThan(2);
      expect(font.category).toBeTruthy();
    }
  });

  it("resolves the default font", () => {
    expect(getCursiveFont(DEFAULT_CURSIVE_FONT_ID)?.id).toBe(
      DEFAULT_CURSIVE_FONT_ID,
    );
    expect(resolveFont("missing").id).toBe(CURSIVE_FONTS[0]!.id);
  });
});

describe("handwriting layout helpers", () => {
  it("computes auto, square, landscape, and portrait sizes", () => {
    const auto = computeAutoContentSize({
      contentWidth: 200,
      contentHeight: 80,
      padding: 40,
      layout: "auto",
      maxWidth: 1600,
      maxHeight: 1600,
    });
    expect(auto.width).toBe(280);
    expect(auto.height).toBe(160);
    expect(auto.clipped).toBe(false);

    const square = computeAutoContentSize({
      contentWidth: 100,
      contentHeight: 50,
      padding: 20,
      layout: "square",
      maxWidth: 1600,
      maxHeight: 1600,
    });
    expect(square.width).toBe(square.height);
    expect(square.width).toBeGreaterThanOrEqual(240);

    const landscape = computeAutoContentSize({
      contentWidth: 100,
      contentHeight: 40,
      padding: 10,
      layout: "landscape",
      maxWidth: 1600,
      maxHeight: 1600,
    });
    expect(landscape.width).toBeGreaterThanOrEqual(640);

    const portrait = computeAutoContentSize({
      contentWidth: 40,
      contentHeight: 100,
      padding: 10,
      layout: "portrait",
      maxWidth: 1600,
      maxHeight: 1600,
    });
    expect(portrait.height).toBeGreaterThanOrEqual(640);
  });

  it("marks clipped when exceeding max dimensions", () => {
    const result = computeAutoContentSize({
      contentWidth: 5000,
      contentHeight: 5000,
      padding: 40,
      layout: "auto",
      maxWidth: 800,
      maxHeight: 600,
    });
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.clipped).toBe(true);
  });

  it("exposes backgrounds including transparency and preset colors", () => {
    expect(HANDWRITING_BACKGROUNDS.some((b) => b.id === "transparent")).toBe(
      true,
    );
    expect(
      HANDWRITING_BACKGROUNDS.find((b) => b.id === "transparent")?.fill,
    ).toBeNull();
    expect(HANDWRITING_COLORS.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_HANDWRITING_OPTIONS.backgroundId).toBe("cream");
    expect(PNG_DOWNLOAD_FILENAME).toBe("WordMelo-cursive-writing.png");
  });
});

describe("cursive favorites helpers", () => {
  it("toggles favorites and recent lists", () => {
    expect(toggleFavoriteStyleId([], "script")).toEqual(["script"]);
    expect(toggleFavoriteStyleId(["script"], "script")).toEqual([]);
    expect(pushRecentCopiedStyleId(["a", "b"], "c")[0]).toBe("c");
    expect(pushRecentCopiedStyleId(["c", "a"], "c")[0]).toBe("c");
  });
});

describe("handwriting presets", () => {
  it("exposes 3–5 real setting presets with known fonts", () => {
    expect(HANDWRITING_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(HANDWRITING_PRESETS.length).toBeLessThanOrEqual(5);
    for (const preset of HANDWRITING_PRESETS) {
      expect(getCursiveFont(preset.fontId)).toBeTruthy();
      expect(preset.fontSize).toBeGreaterThanOrEqual(28);
      expect(preset.padding).toBeGreaterThanOrEqual(16);
      expect(
        HANDWRITING_BACKGROUNDS.some((b) => b.id === preset.backgroundId),
      ).toBe(true);
    }
    expect(getHandwritingPreset("minimal-name")?.fontId).toBe("satisfy");
  });
});

describe("style group honesty", () => {
  it("labels Unicode alphabets separately from decorative designs", () => {
    expect(CURSIVE_STYLE_GROUPS[0]?.label).toMatch(/Unicode/i);
    expect(CURSIVE_STYLE_GROUPS[1]?.label).toMatch(/Decorative/i);
  });
});
