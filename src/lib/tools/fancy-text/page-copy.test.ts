import { describe, expect, it } from "vitest";
import { getPublishedTools } from "@/lib/tools/registry";
import { absoluteUrl } from "@/lib/seo";
import {
  FANCY_DESCRIPTION,
  FANCY_FAQS,
  FANCY_H1,
  FANCY_PATH,
  FANCY_TITLE,
} from "./page-copy";
import { getFancyStyleCount } from "./styles";

describe("fancy text page copy", () => {
  it("uses the intended title, description, and H1", () => {
    expect(FANCY_TITLE).toBe(
      "Fancy Text Generator – Copy & Paste Fonts | WordMelo",
    );
    expect(FANCY_TITLE.length).toBeLessThanOrEqual(60);
    expect(FANCY_DESCRIPTION).toBe(
      "Generate fancy text with 42 stylish Unicode fonts. Copy and paste bold, cursive, gothic, and aesthetic text for Instagram, TikTok, Discord, and more.",
    );
    expect(FANCY_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(FANCY_H1).toBe("Fancy Text Generator – Copy & Paste Stylish Fonts");
    expect(getFancyStyleCount()).toBe(42);
  });

  it("answers the core questions once each", () => {
    const questions = FANCY_FAQS.map((item) => item.question);
    expect(new Set(questions).size).toBe(questions.length);
    expect(questions).toContain("What is a fancy text generator?");
    expect(questions).toContain("Can I convert fancy text back to normal text?");
    expect(FANCY_FAQS.length).toBeGreaterThanOrEqual(8);
    expect(FANCY_FAQS.every((item) => item.answer.length > 40)).toBe(true);
  });

  it("keeps a single indexable canonical path in the sitemap", () => {
    expect(absoluteUrl(FANCY_PATH)).toBe(
      "https://wordmelo.com/fancy-text-generator",
    );
    const matches = getPublishedTools().filter((tool) => tool.href === FANCY_PATH);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.status).toBe("published");
  });
});