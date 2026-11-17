import fs from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedTools } from "@/lib/tools/registry";
import { diverseSample } from "./examples";
import {
  PICTIONARY_DESCRIPTION,
  PICTIONARY_FAQS,
  PICTIONARY_H1,
  PICTIONARY_KEYWORDS,
  PICTIONARY_PATH,
  PICTIONARY_TITLE,
} from "./page-copy";
import { PICTIONARY_PROMPTS } from "./prompts";

describe("pictionary page metadata", () => {
  it("uses the intended title, description, canonical, and index rules", () => {
    expect(PICTIONARY_TITLE).toBe(
      "Pictionary Word Generator (Easy, Medium & Hard) | WordMelo",
    );
    expect(PICTIONARY_TITLE.length).toBeLessThanOrEqual(60);
    expect(PICTIONARY_DESCRIPTION).toBe(
      "Generate random Pictionary words for kids and adults. Choose easy, medium or hard drawing prompts, use the timer, and play free with teams.",
    );
    expect(PICTIONARY_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(PICTIONARY_H1).toBe("Pictionary Word Generator – Free Random Words to Draw");
    expect(PICTIONARY_KEYWORDS).toContain("pictionary word generator");

    const metadata = createPageMetadata({
      title: PICTIONARY_TITLE,
      description: PICTIONARY_DESCRIPTION,
      path: PICTIONARY_PATH,
    });
    expect(metadata.title).toBe(PICTIONARY_TITLE);
    expect(metadata.description).toBe(PICTIONARY_DESCRIPTION);
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/pictionary-word-generator",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: PICTIONARY_TITLE,
      description: PICTIONARY_DESCRIPTION,
      url: "https://wordmelo.com/pictionary-word-generator",
    });
  });

  it("is in the sitemap once and links only to published tools", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("pictionary-word-generator"));
    expect(urls).toEqual(["https://wordmelo.com/pictionary-word-generator"]);
    const published = new Set(getPublishedTools().map((tool) => tool.href));
    expect(published.has("/pictionary-word-generator")).toBe(true);
    expect(published.has("/random-word-generator")).toBe(true);
    expect(published.has("/random-letter-generator")).toBe(true);
  });

  it("keeps one H1 source, real examples, and no unsupported review schema", () => {
    const page = fs.readFileSync("src/app/pictionary-word-generator/page.tsx", "utf8");
    const guide = fs.readFileSync("src/components/tools/pictionary/PictionaryGuide.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("PICTIONARY_H1");
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("reviewCount");
    expect(page).not.toContain("FAQPage");
    expect(guide.match(/<h2>/g)?.length).toBeGreaterThanOrEqual(7);

    const texts = new Set(PICTIONARY_PROMPTS.map((prompt) => prompt.text));
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const sample = diverseSample(difficulty, difficulty === "easy" ? 24 : 12);
      expect(sample.length).toBeGreaterThanOrEqual(12);
      expect(sample.every((prompt) => prompt.difficulty === difficulty)).toBe(true);
      expect(sample.every((prompt) => texts.has(prompt.text))).toBe(true);
    }
    expect(PICTIONARY_FAQS).toHaveLength(7);
    expect(PICTIONARY_FAQS.map((item) => item.question)).toContain(
      "Does WordMelo require registration?",
    );
  });
});
