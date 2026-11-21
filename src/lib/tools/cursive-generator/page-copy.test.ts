import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { createPageMetadata } from "@/lib/seo";
import {
  CURSIVE_DESCRIPTION,
  CURSIVE_FAQS,
  CURSIVE_H1,
  CURSIVE_KEYWORDS,
  CURSIVE_PATH,
  CURSIVE_TITLE,
} from "./page-copy";

describe("cursive generator page copy", () => {
  it("uses a unique title, description, and canonical", () => {
    expect(CURSIVE_TITLE).toBe(
      "Cursive Generator – Copy & Paste Names, Words & Fonts | WordMelo",
    );
    expect(CURSIVE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(CURSIVE_DESCRIPTION.toLowerCase()).toContain("copy and paste");
    expect(CURSIVE_H1).toBe("Cursive Generator");
    expect(CURSIVE_KEYWORDS).toEqual(
      expect.arrayContaining([
        "cursive generator",
        "cursive name generator",
        "cursive word generator",
        "cursive alphabet generator",
      ]),
    );
    const metadata = createPageMetadata({
      title: CURSIVE_TITLE,
      description: CURSIVE_DESCRIPTION,
      path: CURSIVE_PATH,
      keywords: [...CURSIVE_KEYWORDS],
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://wordmelo.com/cursive-generator",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("keeps one H1 source, related links, and no review schema", () => {
    const page = fs.readFileSync("src/app/cursive-generator/page.tsx", "utf8");
    expect(page.match(/<h1/g)).toBeNull();
    expect(page).toContain("CURSIVE_H1");
    expect(page).toContain('href="/fancy-text-generator"');
    expect(page).not.toContain("aggregateRating");
    expect(page).not.toContain("FAQPage");
    expect(CURSIVE_FAQS.length).toBeGreaterThanOrEqual(8);
  });
});