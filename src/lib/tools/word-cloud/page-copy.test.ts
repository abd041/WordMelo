import fs from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedTools } from "@/lib/tools/registry";
import {
  WORD_CLOUD_DESCRIPTION,
  WORD_CLOUD_FAQS,
  WORD_CLOUD_H1,
  WORD_CLOUD_KEYWORDS,
  WORD_CLOUD_PATH,
  WORD_CLOUD_TITLE,
} from "./page-copy";

describe("word cloud page metadata", () => {
  it("uses the requested title, description, canonical, and index rules", () => {
    expect(WORD_CLOUD_TITLE).toBe(
      "Free Word Cloud Generator – Create Word Clouds Online | WordMelo",
    );
    expect(WORD_CLOUD_DESCRIPTION).toBe(
      "Create beautiful word clouds from text for free. Customize fonts, colors, shapes and layouts, then download your word cloud as PNG or SVG.",
    );
    expect(WORD_CLOUD_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(WORD_CLOUD_H1).toBe("Free Word Cloud Generator");
    expect(WORD_CLOUD_KEYWORDS).toContain("word cloud generator");

    const metadata = createPageMetadata({
      title: WORD_CLOUD_TITLE,
      description: WORD_CLOUD_DESCRIPTION,
      path: WORD_CLOUD_PATH,
      keywords: [...WORD_CLOUD_KEYWORDS],
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/word-cloud-generator",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: WORD_CLOUD_TITLE,
      url: "https://wordmelo.com/word-cloud-generator",
    });
  });

  it("is published once and listed in the sitemap", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("word-cloud-generator"));
    expect(urls).toEqual(["https://wordmelo.com/word-cloud-generator"]);
    const tools = getPublishedTools();
    expect(tools).toHaveLength(11);
    expect(tools.filter((tool) => tool.href === WORD_CLOUD_PATH)).toHaveLength(1);
  });

  it("keeps one H1 source and does not invent review schema", () => {
    const page = fs.readFileSync("src/app/word-cloud-generator/page.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("WORD_CLOUD_H1");
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("FAQPage");
    expect(WORD_CLOUD_FAQS).toHaveLength(10);
    expect(page).toContain('href="/word-counter"');
    expect(page).toContain('href="/character-counter"');
    expect(page).toContain('href="/random-word-generator"');
    expect(page).toContain('href="/fancy-text-generator"');
    expect(page).toContain('href="/pictionary-word-generator"');
  });
});
