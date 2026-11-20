import fs from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedTools } from "@/lib/tools/registry";
import {
  ALPHABETIZER_DESCRIPTION,
  ALPHABETIZER_FAQS,
  ALPHABETIZER_H1,
  ALPHABETIZER_KEYWORDS,
  ALPHABETIZER_PATH,
  ALPHABETIZER_TITLE,
} from "./page-copy";

describe("alphabetizer page metadata", () => {
  it("uses the requested title, description, canonical, and index rules", () => {
    expect(ALPHABETIZER_TITLE).toBe(
      "Alphabetizer – Sort Lists in Alphabetical Order Online | WordMelo",
    );
    expect(ALPHABETIZER_DESCRIPTION).toBe(
      "Alphabetize words, names, and lists online for free. Sort A–Z or Z–A, remove duplicates, sort numbers, and copy or download your results instantly.",
    );
    expect(ALPHABETIZER_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(ALPHABETIZER_H1).toBe("Free Online Alphabetizer");
    expect(ALPHABETIZER_KEYWORDS).toContain("alphabetizer");

    const metadata = createPageMetadata({
      title: ALPHABETIZER_TITLE,
      description: ALPHABETIZER_DESCRIPTION,
      path: ALPHABETIZER_PATH,
      keywords: [...ALPHABETIZER_KEYWORDS],
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/alphabetizer",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: ALPHABETIZER_TITLE,
      url: "https://wordmelo.com/alphabetizer",
    });
  });

  it("is published once and listed in the sitemap", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("alphabetizer"));
    expect(urls).toEqual(["https://wordmelo.com/alphabetizer"]);
    const tools = getPublishedTools();
    expect(tools).toHaveLength(14);
    expect(tools.filter((tool) => tool.href === ALPHABETIZER_PATH)).toHaveLength(1);
  });

  it("keeps one H1 source and does not invent review schema", () => {
    const page = fs.readFileSync("src/app/alphabetizer/page.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("ALPHABETIZER_H1");
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("FAQPage");
    expect(ALPHABETIZER_FAQS).toHaveLength(10);
    expect(page).toContain('href="/word-counter"');
    expect(page).toContain('href="/text-compare"');
    expect(page).toContain('href="/case-converter"');
    expect(page).toContain('href="/random-word-generator"');
  });
});
