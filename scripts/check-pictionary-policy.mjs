import fs from "node:fs";

// Keep in sync with src/lib/tools/pictionary/policy.ts for quick CLI audits.
const t = fs.readFileSync("src/lib/tools/pictionary/prompts.ts", "utf8");
const texts = [...t.matchAll(/text: "([^"]+)"/g)].map((m) => m[1]);
const patterns = [
  /\b(person|people|human|man|woman|boy|girl|child|baby|face|portrait|selfie of|family)\b/i,
  /\b(animal|dog|cat|bird|fish|horse|cow|pig|sheep|goat|lion|tiger|bear|wolf|fox|rabbit|rat|snake|spider|insect|bee|butterfly|dinosaur|unicorn|mermaid|monster)\b/i,
  /(?<!computer )\bmouse\b/i,
  /\bdragon\b(?!\s+fruit)/i,
  /\b(alcohol|beer|wine|whiskey|vodka|cocktail|bar drink|drunk|intoxicant)\b/i,
  /\b(casino|gambling|bet|poker|slot machine|roulette|wager)\b/i,
  /(?<!glue |caulking |caulk |staple |nail |heat )\bgun\b/i,
  /\b(rifle|pistol|sword|bomb|grenade|weapon|blood|kill|murder|war)\b/i,
  /\b(sex|nude|kiss|lingerie|porn)\b/i,
  /\b(guitar|piano|violin|drum|flute|trumpet|saxophone|karaoke|concert|song|music note|microphone singer)\b/i,
  /\b(zombie|vampire|ghost|devil|demon|witch|wizard character)\b/i,
];

let hits = 0;
for (const text of texts) {
  for (const p of patterns) {
    if (p.test(text)) {
      console.log(JSON.stringify(text), "<=", p.source);
      hits += 1;
      break;
    }
  }
}
console.log(hits === 0 ? "OK: no violations" : `FAIL: ${hits} hits`);
process.exit(hits === 0 ? 0 : 1);
