import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync("tmp-pictionary-prompts.json", "utf8"),
);

const rows = data
  .map(
    (p) =>
      `  { id: ${JSON.stringify(p.id)}, text: ${JSON.stringify(p.text)}, category: ${JSON.stringify(p.category)}, difficulty: ${JSON.stringify(p.difficulty)} },`,
  )
  .join("\n");

const file = `import type { PictionaryPrompt } from "./types";

/**
 * Curated Pictionary drawing prompts.
 * Policy: non-living subjects only — see CONTENT_POLICY.md
 */
export const PICTIONARY_PROMPTS: readonly PictionaryPrompt[] = [
${rows}
];

export const PROMPT_STATS = {
  total: ${data.length},
  easy: ${data.filter((p) => p.difficulty === "easy").length},
  medium: ${data.filter((p) => p.difficulty === "medium").length},
  hard: ${data.filter((p) => p.difficulty === "hard").length},
} as const;
`;

fs.writeFileSync("src/lib/tools/pictionary/prompts.ts", file);
console.log("wrote", data.length, "prompts");
