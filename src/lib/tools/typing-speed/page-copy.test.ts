import fs from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedTools } from "@/lib/tools/registry";
import {
  TYPING_DESCRIPTION,
  TYPING_FAQS,
  TYPING_H1,
  TYPING_KEYWORDS,
  TYPING_PATH,
  TYPING_TITLE,
} from "./page-copy";

describe("typing speed test page metadata", () => {
  it("uses the requested title, description, canonical, and index rules", () => {
    expect(TYPING_TITLE).toBe("Free Typing Speed Test – Check WPM & Accuracy | WordMelo");
    expect(TYPING_DESCRIPTION).toBe(
      "Test your typing speed online for free. Check your WPM, accuracy, and mistakes with 15, 30, 60, or 120-second typing tests. No signup needed.",
    );
    expect(TYPING_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(TYPING_H1).toBe("Free Typing Speed Test");
    expect(TYPING_KEYWORDS).toContain("typing speed test");

    const metadata = createPageMetadata({
      title: TYPING_TITLE,
      description: TYPING_DESCRIPTION,
      path: TYPING_PATH,
      keywords: [...TYPING_KEYWORDS],
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/typing-speed-test",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      title: TYPING_TITLE,
      url: "https://wordmelo.com/typing-speed-test",
    });
  });

  it("is published once and listed in the sitemap", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.includes("typing-speed-test"));
    expect(urls).toEqual(["https://wordmelo.com/typing-speed-test"]);
    const tools = getPublishedTools();
    expect(tools).toHaveLength(14);
    expect(tools.filter((tool) => tool.href === TYPING_PATH)).toHaveLength(1);
  });

  it("keeps one H1 source and does not invent review schema", () => {
    const page = fs.readFileSync("src/app/typing-speed-test/page.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("TYPING_H1");
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("FAQPage");
    expect(TYPING_FAQS).toHaveLength(12);
    expect(page).toContain('href="/word-counter"');
    expect(page).toContain('href="/character-counter"');
    expect(page).toContain('href="/random-word-generator"');
  });
});
