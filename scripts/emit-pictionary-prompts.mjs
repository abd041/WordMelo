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
 * Policy: objects, plants, places, and nature — no people or animals.
 * See CONTENT_POLICY.md. Difficulty counts live in stats.ts.
 */
export const PICTIONARY_PROMPTS: readonly PictionaryPrompt[] = [
${rows}
];
`;

fs.writeFileSync("src/lib/tools/pictionary/prompts.ts", file);
console.log("wrote", data.length, "prompts");
