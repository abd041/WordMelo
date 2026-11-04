import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: product UI/SEO must not promote songwriting or music use cases.
 * Legitimate dictionary words like "song" or "music" may still exist in vocabulary.json.
 */
describe("random word generator content policy", () => {
  const pagePath = path.join(
    process.cwd(),
    "src/app/random-word-generator/page.tsx",
  );
  const presetsPath = path.join(
    process.cwd(),
    "src/lib/tools/random-word/presets.ts",
  );

  it("page metadata and SEO copy omit songwriting / music marketing", () => {
    const page = fs.readFileSync(pagePath, "utf8").toLowerCase();
    expect(page).not.toMatch(/songwriting/);
    expect(page).not.toMatch(/random words for songs/);
    expect(page).not.toMatch(/lyric/);
    expect(page).not.toMatch(/rhyme generation/);
    expect(page).toMatch(/vocabulary practice/);
    expect(page).toMatch(/free words by length & type/);
  });

  it("presets file has Vocabulary Practice and no Songwriting preset", () => {
    const presets = fs.readFileSync(presetsPath, "utf8");
    expect(presets).toMatch(/vocabulary-practice/);
    expect(presets).toMatch(/Vocabulary Practice/);
    expect(presets).not.toMatch(/songwriting/);
    expect(presets).not.toMatch(/Songwriting/);
  });
});
