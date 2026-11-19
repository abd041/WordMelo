import fs from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedTools } from "@/lib/tools/registry";
import {
  TEXT_COMPARE_DESCRIPTION,
  TEXT_COMPARE_FAQS,
  TEXT_COMPARE_H1,
  TEXT_COMPARE_KEYWORDS,
  TEXT_COMPARE_PATH,
  TEXT_COMPARE_TITLE,
} from "./page-copy";

describe("text compare page metadata", () => {
  it("uses the requested title, description, canonical, and index rules", () => {
    expect(TEXT_COMPARE_TITLE).toBe(
      "Text Compare Tool – Compare Two Texts Online Free | WordMelo",
    );
    expect(TEXT_COMPARE_DESCRIPTION).toBe(
      "Compare two texts online for free. Find added, removed, and changed words or lines with side-by-side highlighting and instant results.",
    );
    expect(TEXT_COMPARE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(TEXT_COMPARE_H1).toBe("Free Text Compare Tool");
    expect(TEXT_COMPARE_KEYWORDS).toContain("text compare");

    const metadata = createPageMetadata({
      title: TEXT_COMPARE_TITLE,
      description: TEXT_COMPARE_DESCRIPTION,
      path: TEXT_COMPARE_PATH,
      keywords: [...TEXT_COMPARE_KEYWORDS],
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/text-compare",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: TEXT_COMPARE_TITLE,
      url: "https://wordmelo.com/text-compare",
    });
  });

  it("is published once and listed in the sitemap", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("text-compare"));
    expect(urls).toEqual(["https://wordmelo.com/text-compare"]);
    const tools = getPublishedTools();
    expect(tools).toHaveLength(13);
    expect(tools.filter((tool) => tool.href === TEXT_COMPARE_PATH)).toHaveLength(1);
  });

  it("keeps one H1 source and does not invent review schema", () => {
    const page = fs.readFileSync("src/app/text-compare/page.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("TEXT_COMPARE_H1");
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("FAQPage");
    expect(TEXT_COMPARE_FAQS).toHaveLength(10);
    expect(page).toContain('href="/word-counter"');
    expect(page).toContain('href="/character-counter"');
    expect(page).toContain('href="/case-converter"');
    expect(page).toContain('href="/title-case-converter"');
  });
});
