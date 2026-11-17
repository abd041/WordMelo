import { describe, expect, it } from "vitest";
import { layoutFromSettings } from "./layout";
import { contrastRatio, lowContrastColors, paletteById } from "./palettes";
import {
  PNG_FILENAME,
  SVG_FILENAME,
  buildWordCloudSvg,
  canCopyImage,
  pngPixelSize,
  resolvePngScale,
} from "./svg";

describe("word cloud export", () => {
  it("escapes user text and writes a sized svg", () => {
    const layout = layoutFromSettings(
      [{ text: `a<b>&"'`, count: 2, highlighted: false }],
      {
        shape: "rectangle",
        aspect: "square",
        font: "sans",
        minFont: 20,
        maxFont: 48,
        fontWeight: 600,
        rotation: "horizontal",
        spacing: 4,
        align: "center",
      },
      1,
    );
    const svg = buildWordCloudSvg(layout, {
      palette: "editorial",
      background: "#ffffff",
      transparent: false,
      customColor: null,
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 600,
    });
    expect(svg).toContain(`width="${layout.width}"`);
    expect(svg).toContain(`height="${layout.height}"`);
    expect(svg).toContain("a&lt;b&gt;&amp;&quot;&apos;");
    expect(svg).not.toContain("<script");
    expect(svg).toContain('fill="#ffffff"');
    const transparent = buildWordCloudSvg(layout, {
      palette: "editorial",
      background: "#ffffff",
      transparent: true,
      customColor: "#112233",
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 600,
    });
    expect(transparent).not.toContain("<rect");
    expect(transparent).toContain('fill="#112233"');
  });

  it("keeps png scale inside a pixel budget", () => {
    expect(resolvePngScale(1000, 1000, 2)).toEqual({ scale: 2, clamped: false });
    expect(pngPixelSize(1000, 1000, 2)).toEqual({ width: 2000, height: 2000 });
    const clamped = resolvePngScale(2000, 2000, 3);
    expect(clamped).toEqual({ scale: 1, clamped: true });
    expect(2000 * 2000 * clamped.scale * clamped.scale).toBeLessThanOrEqual(12_000_000);
  });

  it("reports clipboard image support only when the API exists", () => {
    expect(canCopyImage()).toBe(false);
    expect(PNG_FILENAME).toBe("wordmelo-word-cloud.png");
    expect(SVG_FILENAME).toBe("wordmelo-word-cloud.svg");
  });

  it("uses readable default palette colors on white", () => {
    const colors = paletteById("editorial").colors;
    expect(lowContrastColors(colors, "#ffffff")).toEqual([]);
    expect(contrastRatio("#0e6b66", "#ffffff")).toBeGreaterThan(4.5);
  });
});
