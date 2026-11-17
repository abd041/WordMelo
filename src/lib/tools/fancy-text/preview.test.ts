import { describe, expect, it } from "vitest";
import { getFancyStyleById } from "./styles";
import {
  NAME_FRAMES,
  buildStyledName,
  nameSourceLine,
  renderPlatformPreview,
} from "./preview";

describe("renderPlatformPreview", () => {
  it("uses the platform's recommended style", () => {
    const preview = renderPlatformPreview("Alex", "instagram");
    expect(preview.styleId).toBe("script");
    expect(preview.output).toBe(getFancyStyleById("script")!.transform("Alex"));
  });

  it("can override the style without dropping the platform limit", () => {
    const preview = renderPlatformPreview("Alex", "discord", "bold-sans");
    expect(preview.styleId).toBe("bold-sans");
    expect(preview.limit).toBe(32);
    expect(preview.output).toBe(getFancyStyleById("bold-sans")!.transform("Alex"));
  });

  it("flags text past a typical username limit", () => {
    const preview = renderPlatformPreview("This name is definitely too long", "gaming");
    expect(preview.overLimit).toBe(true);
  });

  it("preserves emoji in the preview", () => {
    expect(renderPlatformPreview("Go 🚀", "general").output).toContain("🚀");
  });
});

describe("buildStyledName", () => {
  it("uses the first non-empty line", () => {
    expect(nameSourceLine("\n  Alex Rivera \nBio")).toBe("Alex Rivera");
  });

  it("wraps a styled name with the selected frame", () => {
    const stars = NAME_FRAMES.find((frame) => frame.id === "stars")!;
    const styled = getFancyStyleById("script")!.transform("Alex");
    expect(buildStyledName("Alex", "script", "stars")).toBe(
      `${stars.prefix}${styled}${stars.suffix}`,
    );
  });

  it("builds the bracketed fullwidth example", () => {
    const styled = getFancyStyleById("fullwidth")!.transform("Alex");
    expect(buildStyledName("Alex\nignore this line", "fullwidth", "brackets")).toBe(
      `『${styled}』`,
    );
  });

  it("returns an empty string when there is no name", () => {
    expect(buildStyledName("   \n", "script", "stars")).toBe("");
  });

  it("keeps characters the style cannot map", () => {
    expect(buildStyledName("Alex 🚀", "bold-sans", "none")).toContain("🚀");
  });
});
